// OpenAI integration utilities
// Note: In a production app, API calls should go through a backend server
// to keep API keys secure

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY

export const analyzeAudioWithAI = async (audioBlob) => {
  if (!OPENAI_API_KEY) {
    console.warn('OpenAI API key not found, using mock data')
    return mockAnalyzeAudio()
  }

  try {
    // Convert audio blob to base64 or appropriate format
    const formData = new FormData()
    formData.append('file', audioBlob, 'audio.wav')
    formData.append('model', 'whisper-1')

    // First, transcribe the audio
    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData
    })

    const transcription = await transcriptionResponse.json()

    // Then analyze the audio characteristics using GPT-4
    const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert ornithologist and animal sound analyst. Based on audio transcription and description, identify the most likely species, call type, and behavioral context. Return a JSON response with: species, callType, confidence (0-1), and insight (behavioral explanation).`
          },
          {
            role: 'user',
            content: `Analyze this audio transcription: "${transcription.text}". Provide species identification, call type classification, confidence score, and behavioral insight.`
          }
        ],
        temperature: 0.3
      })
    })

    const analysis = await analysisResponse.json()
    
    try {
      return JSON.parse(analysis.choices[0].message.content)
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      return mockAnalyzeAudio()
    }

  } catch (error) {
    console.error('Error calling OpenAI API:', error)
    return mockAnalyzeAudio()
  }
}

const mockAnalyzeAudio = () => {
  const species = [
    'American Robin', 'Northern Cardinal', 'Blue Jay', 'House Wren',
    'Red-winged Blackbird', 'Common Crow', 'Mourning Dove'
  ]
  
  const callTypes = [
    'Territory Call', 'Alarm Call', 'Contact Call', 'Mating Call', 'Song'
  ]
  
  const insights = [
    'This bird is marking its territory with a clear, melodious song.',
    'An alarm call indicating potential predator presence nearby.',
    'Contact calls used to maintain flock cohesion.',
    'Mating display with complex vocalizations to attract partners.',
    'Dawn chorus song establishing breeding territory.'
  ]
  
  const randomIndex = Math.floor(Math.random() * species.length)
  
  return {
    species: species[randomIndex],
    callType: callTypes[randomIndex % callTypes.length],
    confidence: Math.random() * 0.3 + 0.7,
    insight: insights[randomIndex % insights.length]
  }
}