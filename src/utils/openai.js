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
    // Convert audio blob to appropriate format for Whisper
    const formData = new FormData()
    formData.append('file', audioBlob, 'audio.wav')
    formData.append('model', 'whisper-1')
    formData.append('response_format', 'json')

    // First, transcribe the audio using Whisper
    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData
    })

    if (!transcriptionResponse.ok) {
      throw new Error(`Transcription failed: ${transcriptionResponse.statusText}`)
    }

    const transcription = await transcriptionResponse.json()

    // Enhanced prompt for better species identification
    const analysisPrompt = `You are an expert ornithologist and bioacoustics specialist. Analyze this audio transcription and any acoustic patterns to identify the animal species and call characteristics.

Audio transcription: "${transcription.text}"

Please provide a detailed analysis in the following JSON format:
{
  "species": "Scientific or common name of the most likely species",
  "callType": "Type of vocalization (e.g., Territory Call, Alarm Call, Contact Call, Mating Call, Song)",
  "confidence": 0.85,
  "insight": "Detailed behavioral explanation of what this vocalization likely means and the context in which it's used",
  "alternativeSpecies": ["List of 2-3 other possible species if confidence is low"],
  "acousticFeatures": "Description of key acoustic characteristics that led to this identification",
  "timeOfDay": "Most likely time this call would occur",
  "habitat": "Typical habitat where this species and call type would be found"
}

Base your analysis on:
1. Acoustic patterns and frequency characteristics
2. Call structure and rhythm
3. Known behavioral contexts for different species
4. Geographic and habitat considerations
5. Seasonal patterns if relevant

Provide specific, scientifically accurate information.`

    // Analyze using GPT-4 for species identification
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
            content: 'You are an expert ornithologist and bioacoustics specialist. Provide accurate, scientific analysis of animal vocalizations.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1000
      })
    })

    if (!analysisResponse.ok) {
      throw new Error(`Analysis failed: ${analysisResponse.statusText}`)
    }

    const analysis = await analysisResponse.json()
    
    try {
      const result = JSON.parse(analysis.choices[0].message.content)
      
      // Ensure required fields are present
      return {
        species: result.species || 'Unknown Species',
        callType: result.callType || 'Unknown Call',
        confidence: Math.min(1, Math.max(0, result.confidence || 0.5)),
        insight: result.insight || 'Analysis unavailable',
        alternativeSpecies: result.alternativeSpecies || [],
        acousticFeatures: result.acousticFeatures || '',
        timeOfDay: result.timeOfDay || '',
        habitat: result.habitat || '',
        transcription: transcription.text
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      // Fallback to extracting information from raw text
      return parseAnalysisFromText(analysis.choices[0].message.content, transcription.text)
    }

  } catch (error) {
    console.error('Error calling OpenAI API:', error)
    return mockAnalyzeAudio()
  }
}

// Fallback parser for when JSON parsing fails
const parseAnalysisFromText = (text, transcription) => {
  // Extract species name (look for common patterns)
  const speciesMatch = text.match(/species[:\s]+([A-Za-z\s]+)/i)
  const species = speciesMatch ? speciesMatch[1].trim() : 'Unknown Species'
  
  // Extract call type
  const callTypeMatch = text.match(/call[:\s]+([A-Za-z\s]+)/i)
  const callType = callTypeMatch ? callTypeMatch[1].trim() : 'Unknown Call'
  
  // Extract confidence (look for numbers between 0 and 1)
  const confidenceMatch = text.match(/confidence[:\s]+([0-9.]+)/i)
  const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.5
  
  return {
    species,
    callType,
    confidence: Math.min(1, Math.max(0, confidence)),
    insight: text.substring(0, 200) + '...',
    transcription
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
