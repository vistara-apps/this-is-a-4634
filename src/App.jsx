import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import AudioRecorder from './components/AudioRecorder'
import SoundLibrary from './components/SoundLibrary'
import UserProfile from './components/UserProfile'
import { RecordingProvider } from './context/RecordingContext'
import { AuthProvider } from './context/AuthContext'

function App() {
  const [currentView, setCurrentView] = useState('record')

  return (
    <AuthProvider>
      <RecordingProvider>
        <div className="min-h-screen gradient-bg">
          <div className="max-w-4xl mx-auto px-4 py-8 md:px-6 md:py-12">
            <Header currentView={currentView} onViewChange={setCurrentView} />
            
            <main className="mt-8">
              {currentView === 'record' && <AudioRecorder />}
              {currentView === 'library' && <SoundLibrary />}
              {currentView === 'profile' && <UserProfile />}
            </main>
          </div>
        </div>
      </RecordingProvider>
    </AuthProvider>
  )
}

export default App
