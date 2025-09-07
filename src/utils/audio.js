export const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export const analyzeAudioFile = async (audioBlob) => {
  // In a real implementation, this would:
  // 1. Convert audio blob to the required format
  // 2. Send to OpenAI Whisper API for transcription
  // 3. Use GPT-4 to analyze the audio characteristics
  // 4. Return species identification and behavioral insights
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockSpecies = [
        'American Robin', 'Northern Cardinal', 'Blue Jay', 'House Wren',
        'Red-winged Blackbird', 'Common Crow', 'Mourning Dove', 'White-throated Sparrow'
      ]
      
      const mockCallTypes = [
        'Territory Call', 'Alarm Call', 'Contact Call', 'Mating Call',
        'Begging Call', 'Flight Call', 'Song', 'Warning Call'
      ]
      
      const mockInsights = [
        'This bird is establishing territory with a clear, melodious song pattern.',
        'An alarm call indicating potential predator presence in the area.',
        'Contact calls used to maintain group cohesion during foraging.',
        'Mating calls with complex frequency modulation to attract partners.',
        'Juvenile begging calls directed at parent birds for feeding.',
        'Flight calls used for navigation and flock coordination.',
        'Dawn chorus territorial song marking breeding territory.',
        'Warning calls alerting other birds to human presence.'
      ]
      
      const randomIndex = Math.floor(Math.random() * mockSpecies.length)
      
      resolve({
        species: mockSpecies[randomIndex],
        callType: mockCallTypes[randomIndex],
        confidence: Math.random() * 0.4 + 0.6, // 60-100%
        insight: mockInsights[randomIndex],
        location: 'Current Location',
        timestamp: new Date().toISOString()
      })
    }, 2000 + Math.random() * 2000) // 2-4 second delay
  })
}

export const checkMicrophonePermission = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach(track => track.stop())
    return true
  } catch (error) {
    console.error('Microphone permission denied:', error)
    return false
  }
}