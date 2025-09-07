import React, { useRef, useEffect, useState } from 'react'
import { ZoomIn, ZoomOut, Download, Info } from 'lucide-react'

const SpectrogramView = ({ audioUrl, isVisible = true, variant = 'default' }) => {
  const canvasRef = useRef(null)
  const [zoom, setZoom] = useState(1)
  const [spectrogramData, setSpectrogramData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (audioUrl && isVisible) {
      generateSpectrogram()
    }
  }, [audioUrl, isVisible])

  const generateSpectrogram = async () => {
    setLoading(true)
    setError(null)

    try {
      // Create audio context
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      
      // Fetch and decode audio
      const response = await fetch(audioUrl)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      
      // Generate spectrogram data
      const spectrogramData = await createSpectrogramData(audioBuffer, audioContext)
      setSpectrogramData(spectrogramData)
      
      // Draw spectrogram
      drawSpectrogram(spectrogramData)
      
    } catch (err) {
      console.error('Error generating spectrogram:', err)
      setError('Failed to generate spectrogram')
    } finally {
      setLoading(false)
    }
  }

  const createSpectrogramData = async (audioBuffer, audioContext) => {
    const channelData = audioBuffer.getChannelData(0)
    const sampleRate = audioBuffer.sampleRate
    const fftSize = 2048
    const hopSize = fftSize / 4
    
    const spectrogram = []
    const analyser = audioContext.createAnalyser()
    analyser.fftSize = fftSize
    
    // Process audio in chunks
    for (let i = 0; i < channelData.length - fftSize; i += hopSize) {
      const chunk = channelData.slice(i, i + fftSize)
      const fftData = performFFT(chunk)
      spectrogram.push(fftData)
    }
    
    return {
      data: spectrogram,
      sampleRate,
      fftSize,
      hopSize,
      timeResolution: hopSize / sampleRate,
      frequencyResolution: sampleRate / fftSize
    }
  }

  const performFFT = (timeData) => {
    // Simple FFT implementation for demonstration
    // In production, use a proper FFT library like fft.js
    const N = timeData.length
    const magnitudes = new Array(N / 2)
    
    for (let k = 0; k < N / 2; k++) {
      let real = 0
      let imag = 0
      
      for (let n = 0; n < N; n++) {
        const angle = -2 * Math.PI * k * n / N
        real += timeData[n] * Math.cos(angle)
        imag += timeData[n] * Math.sin(angle)
      }
      
      magnitudes[k] = Math.sqrt(real * real + imag * imag)
    }
    
    return magnitudes
  }

  const drawSpectrogram = (data) => {
    const canvas = canvasRef.current
    if (!canvas || !data) return

    const ctx = canvas.getContext('2d')
    const { data: spectrogramData } = data
    
    const width = canvas.width
    const height = canvas.height
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height)
    
    // Draw spectrogram
    const timeSteps = spectrogramData.length
    const freqBins = spectrogramData[0]?.length || 0
    
    const timeStep = width / timeSteps
    const freqStep = height / freqBins
    
    for (let t = 0; t < timeSteps; t++) {
      for (let f = 0; f < freqBins; f++) {
        const magnitude = spectrogramData[t][f]
        const intensity = Math.min(255, Math.max(0, magnitude * 255))
        
        // Create color based on intensity (blue to red scale)
        const hue = (1 - intensity / 255) * 240 // Blue to red
        const saturation = 100
        const lightness = intensity / 255 * 50 + 10
        
        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`
        ctx.fillRect(
          t * timeStep * zoom,
          height - (f + 1) * freqStep,
          timeStep * zoom,
          freqStep
        )
      }
    }
    
    // Draw frequency labels
    drawFrequencyLabels(ctx, data, height)
    
    // Draw time labels
    drawTimeLabels(ctx, data, width)
  }

  const drawFrequencyLabels = (ctx, data, height) => {
    ctx.fillStyle = 'white'
    ctx.font = '12px Inter'
    ctx.textAlign = 'right'
    
    const maxFreq = data.sampleRate / 2
    const steps = 5
    
    for (let i = 0; i <= steps; i++) {
      const freq = (maxFreq * i) / steps
      const y = height - (height * i) / steps
      
      ctx.fillText(`${Math.round(freq)}Hz`, 50, y + 4)
    }
  }

  const drawTimeLabels = (ctx, data, width) => {
    ctx.fillStyle = 'white'
    ctx.font = '12px Inter'
    ctx.textAlign = 'center'
    
    const duration = data.data.length * data.timeResolution
    const steps = 5
    
    for (let i = 0; i <= steps; i++) {
      const time = (duration * i) / steps
      const x = (width * i) / steps
      
      ctx.fillText(`${time.toFixed(1)}s`, x, height - 10)
    }
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.5, 5))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.5, 0.5))
  }

  const downloadSpectrogram = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = 'spectrogram.png'
    link.href = canvas.toDataURL()
    link.click()
  }

  useEffect(() => {
    if (spectrogramData) {
      drawSpectrogram(spectrogramData)
    }
  }, [zoom, spectrogramData])

  const containerClasses = variant === 'zoomed' 
    ? 'glass-effect rounded-lg p-6 max-w-full overflow-x-auto'
    : 'glass-effect rounded-lg p-4'

  return (
    <div className={containerClasses}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-white">Spectrogram Analysis</h3>
          <div className="group relative">
            <Info className="w-4 h-4 text-blue-200 cursor-help" />
            <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-black bg-opacity-80 text-white text-xs rounded p-2 whitespace-nowrap z-10">
              Visual representation of audio frequencies over time
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleZoomOut}
            className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all"
            disabled={zoom <= 0.5}
          >
            <ZoomOut className="w-4 h-4 text-white" />
          </button>
          
          <span className="text-white text-sm min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          
          <button
            onClick={handleZoomIn}
            className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all"
            disabled={zoom >= 5}
          >
            <ZoomIn className="w-4 h-4 text-white" />
          </button>
          
          <button
            onClick={downloadSpectrogram}
            className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all"
            disabled={!spectrogramData}
          >
            <Download className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      <div className="relative bg-black bg-opacity-50 rounded-lg overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
            <div className="text-white text-center">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p>Generating spectrogram...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
            <div className="text-red-400 text-center">
              <p>{error}</p>
            </div>
          </div>
        )}

        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full h-auto max-w-full"
          style={{ minHeight: '200px' }}
        />
      </div>

      {spectrogramData && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-white font-medium">Duration</div>
            <div className="text-blue-200">
              {(spectrogramData.data.length * spectrogramData.timeResolution).toFixed(1)}s
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-white font-medium">Sample Rate</div>
            <div className="text-blue-200">{spectrogramData.sampleRate}Hz</div>
          </div>
          
          <div className="text-center">
            <div className="text-white font-medium">Frequency Range</div>
            <div className="text-blue-200">0-{Math.round(spectrogramData.sampleRate / 2)}Hz</div>
          </div>
          
          <div className="text-center">
            <div className="text-white font-medium">Resolution</div>
            <div className="text-blue-200">
              {spectrogramData.frequencyResolution.toFixed(1)}Hz
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SpectrogramView
