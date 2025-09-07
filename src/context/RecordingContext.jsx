import React, { createContext, useContext, useState, useEffect } from 'react'

const RecordingContext = createContext()

export const useRecording = () => {
  const context = useContext(RecordingContext)
  if (!context) {
    throw new Error('useRecording must be used within a RecordingProvider')
  }
  return context
}

export const RecordingProvider = ({ children }) => {
  const [recordings, setRecordings] = useState([])

  // Load recordings from localStorage on mount
  useEffect(() => {
    const savedRecordings = localStorage.getItem('echosense-recordings')
    if (savedRecordings) {
      try {
        setRecordings(JSON.parse(savedRecordings))
      } catch (error) {
        console.error('Error loading recordings:', error)
      }
    }
  }, [])

  // Save recordings to localStorage whenever recordings change
  useEffect(() => {
    localStorage.setItem('echosense-recordings', JSON.stringify(recordings))
  }, [recordings])

  const addRecording = (recording) => {
    const newRecording = {
      ...recording,
      id: Date.now().toString(),
      isPublicContribution: false
    }
    setRecordings(prev => [newRecording, ...prev])
  }

  const removeRecording = (id) => {
    setRecordings(prev => prev.filter(recording => recording.id !== id))
  }

  const updateRecording = (id, updates) => {
    setRecordings(prev => 
      prev.map(recording => 
        recording.id === id 
          ? { ...recording, ...updates }
          : recording
      )
    )
  }

  const togglePublicContribution = (id) => {
    updateRecording(id, { 
      isPublicContribution: !recordings.find(r => r.id === id)?.isPublicContribution 
    })
  }

  const value = {
    recordings,
    addRecording,
    removeRecording,
    updateRecording,
    togglePublicContribution
  }

  return (
    <RecordingContext.Provider value={value}>
      {children}
    </RecordingContext.Provider>
  )
}