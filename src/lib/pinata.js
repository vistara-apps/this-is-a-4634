// Pinata IPFS integration for decentralized storage
// Used for storing research contributions and audio files

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY
const PINATA_BASE_URL = 'https://api.pinata.cloud'

// Check if Pinata is configured
export const isPinataConfigured = () => {
  return !!(PINATA_API_KEY && PINATA_SECRET_KEY)
}

// Upload audio file to IPFS via Pinata
export const uploadAudioToIPFS = async (audioBlob, metadata = {}) => {
  if (!isPinataConfigured()) {
    console.warn('Pinata not configured, using local storage fallback')
    return { hash: null, url: URL.createObjectURL(audioBlob) }
  }

  try {
    const formData = new FormData()
    formData.append('file', audioBlob, `recording-${Date.now()}.wav`)
    
    // Add metadata
    const pinataMetadata = {
      name: `EchoSense Recording - ${metadata.species || 'Unknown'}`,
      keyvalues: {
        species: metadata.species || 'unknown',
        callType: metadata.callType || 'unknown',
        confidence: metadata.confidence?.toString() || '0',
        timestamp: metadata.timestamp || new Date().toISOString(),
        location: metadata.location || 'unknown',
        appVersion: '1.0.0'
      }
    }
    
    formData.append('pinataMetadata', JSON.stringify(pinataMetadata))
    
    const response = await fetch(`${PINATA_BASE_URL}/pinning/pinFileToIPFS`, {
      method: 'POST',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY,
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Pinata upload failed: ${response.statusText}`)
    }

    const result = await response.json()
    
    return {
      hash: result.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
      size: result.PinSize,
      timestamp: result.Timestamp
    }
  } catch (error) {
    console.error('Error uploading to IPFS:', error)
    throw error
  }
}

// Upload JSON metadata to IPFS
export const uploadMetadataToIPFS = async (metadata) => {
  if (!isPinataConfigured()) {
    console.warn('Pinata not configured, skipping metadata upload')
    return { hash: null, url: null }
  }

  try {
    const pinataMetadata = {
      name: `EchoSense Metadata - ${metadata.species || 'Unknown'}`,
      keyvalues: {
        type: 'metadata',
        species: metadata.species || 'unknown',
        timestamp: metadata.timestamp || new Date().toISOString()
      }
    }

    const data = {
      pinataContent: metadata,
      pinataMetadata
    }

    const response = await fetch(`${PINATA_BASE_URL}/pinning/pinJSONToIPFS`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY,
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`Pinata metadata upload failed: ${response.statusText}`)
    }

    const result = await response.json()
    
    return {
      hash: result.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
      size: result.PinSize,
      timestamp: result.Timestamp
    }
  } catch (error) {
    console.error('Error uploading metadata to IPFS:', error)
    throw error
  }
}

// Get file from IPFS
export const getFromIPFS = async (hash) => {
  try {
    const response = await fetch(`https://gateway.pinata.cloud/ipfs/${hash}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from IPFS: ${response.statusText}`)
    }

    return response
  } catch (error) {
    console.error('Error fetching from IPFS:', error)
    throw error
  }
}

// List pinned files
export const listPinnedFiles = async (limit = 10) => {
  if (!isPinataConfigured()) {
    return { files: [] }
  }

  try {
    const response = await fetch(`${PINATA_BASE_URL}/data/pinList?status=pinned&pageLimit=${limit}`, {
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY,
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to list pinned files: ${response.statusText}`)
    }

    const result = await response.json()
    return { files: result.rows || [] }
  } catch (error) {
    console.error('Error listing pinned files:', error)
    throw error
  }
}

// Unpin file from IPFS
export const unpinFile = async (hash) => {
  if (!isPinataConfigured()) {
    return { success: false }
  }

  try {
    const response = await fetch(`${PINATA_BASE_URL}/pinning/unpin/${hash}`, {
      method: 'DELETE',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY,
      }
    })

    return { success: response.ok }
  } catch (error) {
    console.error('Error unpinning file:', error)
    return { success: false }
  }
}

// Contribute recording to research database
export const contributeToResearchDatabase = async (recording) => {
  try {
    // Upload audio file to IPFS
    const audioResponse = await fetch(recording.audioUrl)
    const audioBlob = await audioResponse.blob()
    
    const audioUpload = await uploadAudioToIPFS(audioBlob, {
      species: recording.species,
      callType: recording.callType,
      confidence: recording.confidence,
      timestamp: recording.timestamp,
      location: recording.location
    })

    // Create comprehensive metadata
    const researchMetadata = {
      id: recording.id,
      species: recording.species,
      callType: recording.callType,
      confidence: recording.confidence,
      behavioralInsight: recording.insight,
      location: recording.location,
      timestamp: recording.timestamp,
      audioHash: audioUpload.hash,
      audioUrl: audioUpload.url,
      contributedAt: new Date().toISOString(),
      version: '1.0.0',
      license: 'CC-BY-4.0', // Creative Commons Attribution
      contributor: 'anonymous', // For privacy
      platform: 'EchoSense'
    }

    // Upload metadata to IPFS
    const metadataUpload = await uploadMetadataToIPFS(researchMetadata)

    return {
      success: true,
      audioHash: audioUpload.hash,
      metadataHash: metadataUpload.hash,
      audioUrl: audioUpload.url,
      metadataUrl: metadataUpload.url
    }
  } catch (error) {
    console.error('Error contributing to research database:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Get research database statistics
export const getResearchStats = async () => {
  try {
    const { files } = await listPinnedFiles(1000) // Get more files for stats
    
    const audioFiles = files.filter(file => 
      file.metadata?.keyvalues?.type !== 'metadata'
    )
    
    const speciesSet = new Set()
    const callTypeSet = new Set()
    
    audioFiles.forEach(file => {
      if (file.metadata?.keyvalues?.species) {
        speciesSet.add(file.metadata.keyvalues.species)
      }
      if (file.metadata?.keyvalues?.callType) {
        callTypeSet.add(file.metadata.keyvalues.callType)
      }
    })

    return {
      totalRecordings: audioFiles.length,
      uniqueSpecies: speciesSet.size,
      uniqueCallTypes: callTypeSet.size,
      totalSize: audioFiles.reduce((sum, file) => sum + (file.size || 0), 0),
      lastUpdated: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error getting research stats:', error)
    return {
      totalRecordings: 0,
      uniqueSpecies: 0,
      uniqueCallTypes: 0,
      totalSize: 0,
      lastUpdated: new Date().toISOString()
    }
  }
}
