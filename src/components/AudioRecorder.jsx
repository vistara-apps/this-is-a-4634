import React, { useState, useRef, useEffect } from 'react'
import { Mic, Square, Play, Pause, Upload } from 'lucide-react'
import IdentificationCard from './IdentificationCard'
import { useRecording } from '../context/RecordingContext'

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioURL, setAudioURL] = useState(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [analyzing, setAnalyzing] = useState(false)
  const [identification, setIdentification] = useState(null)
  
  const mediaRecorder = useRef(null)
  const audioRef = useRef(null)
  const timerRef = useRef(null)
  const chunksRef = useRef([])
  
  const { addRecording } = useRecording()

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.current = new MediaRecorder(stream)
      chunksRef.current = []
      
      mediaRecorder.current.ondataavailable = (event) => {
        chunksRef.current.push(event.data)
      }
      
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' })
        const url = URL.createObjectURL(blob)
        setAudioURL(url)
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.current.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop()
      setIsRecording(false)
      clearInterval(timerRef.current)
    }
  }

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
      
      audioRef.current.onended = () => {
        setIsPlaying(false)
      }
    }
  }

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const analyzeAudio = async () => {
    if (!audioURL) return
    
    setAnalyzing(true)
    
    // Simulate AI analysis (in real app, this would call OpenAI API)
    setTimeout(() => {
      const mockResult = {
        species: 'American Robin',
        callType: 'Territory Call',
        confidence: 0.87,
        insight: 'This bird is marking its territory with a clear, melodious song. Robins typically use this call pattern to establish breeding territory and attract mates during spring.',
        location: 'Urban Park',
        timestamp: new Date().toISOString(),
        audioUrl: audioURL
      }
      
      setIdentification(mockResult)
      setAnalyzing(false)
    }, 3000)
  }

  const saveRecording = () => {
    if (identification) {
      addRecording(identification)
      setIdentification(null)
      setAudioURL(null)
      setRecordingTime(0)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Recording Interface */}
      <div className="glass-effect rounded-lg p-8 text-center">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Record Animal Sound</h2>
          <p className="text-blue-100">Tap to start recording wildlife sounds around you</p>
        </div>

        {/* Recording Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
              isRecording 
                ? 'bg-red-500 recording-animation shadow-lg shadow-red-500/30' 
                : 'bg-white bg-opacity-20 hover:bg-opacity-30 shadow-lg'
            }`}
          >
            {isRecording ? (
              <Square className="w-8 h-8 text-white" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </button>
        </div>

        {/* Recording Status */}
        {isRecording && (
          <div className="mb-6">
            <div className="text-white text-lg font-mono mb-2">{formatTime(recordingTime)}</div>
            <div className="waveform">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="waveform-bar"></div>
              ))}
            </div>
          </div>
        )}

        {/* Audio Playback */}
        {audioURL && (
          <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-6">
            <audio ref={audioRef} src={audioURL} className="hidden" />
            
            <div className="flex items-center justify-center space-x-4 mb-4">
              <button
                onClick={isPlaying ? pauseAudio : playAudio}
                className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white" />
                )}
              </button>
              
              <span className="text-white text-sm">Recording ready • {formatTime(recordingTime)}</span>
              
              <button
                onClick={analyzeAudio}
                disabled={analyzing}
                className="flex items-center space-x-2 bg-primary hover:bg-green-400 text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                <span>{analyzing ? 'Analyzing...' : 'Identify'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Identification Results */}
      {identification && (
        <IdentificationCard 
          identification={identification}
          onSave={saveRecording}
        />
      )}

      {/* Analysis Progress */}
      {analyzing && (
        <div className="glass-effect rounded-lg p-6">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-white font-semibold mb-2">Analyzing Audio</h3>
            <p className="text-blue-100 text-sm">Our AI is identifying the species and call type...</p>
            
            <div className="mt-4 bg-white bg-opacity-10 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AudioRecorder