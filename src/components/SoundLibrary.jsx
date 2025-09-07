import React, { useState } from 'react'
import { Search, Play, Pause, Calendar, MapPin, Star } from 'lucide-react'
import { useRecording } from '../context/RecordingContext'

const SoundLibrary = () => {
  const { recordings } = useRecording()
  const [searchTerm, setSearchTerm] = useState('')
  const [playingId, setPlayingId] = useState(null)
  const [filterType, setFilterType] = useState('all')

  const filteredRecordings = recordings.filter(recording => {
    const matchesSearch = recording.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recording.callType.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterType === 'all') return matchesSearch
    if (filterType === 'high-confidence') return matchesSearch && recording.confidence >= 0.8
    if (filterType === 'recent') {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      return matchesSearch && new Date(recording.timestamp) > oneDayAgo
    }
    
    return matchesSearch
  })

  const togglePlay = (id) => {
    setPlayingId(playingId === id ? null : id)
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-400'
    if (confidence >= 0.6) return 'text-yellow-400'
    return 'text-orange-400'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-effect rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-2">Sound Library</h2>
        <p className="text-blue-100">Your personal collection of wildlife recordings</p>
      </div>

      {/* Search and Filters */}
      <div className="glass-effect rounded-lg p-4">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-200" />
            <input
              type="text"
              placeholder="Search species or call type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All recordings</option>
            <option value="high-confidence">High confidence</option>
            <option value="recent">Recent (24h)</option>
          </select>
        </div>
      </div>

      {/* Library Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-effect rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">{recordings.length}</div>
          <div className="text-blue-200 text-sm">Total Recordings</div>
        </div>
        <div className="glass-effect rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">
            {new Set(recordings.map(r => r.species)).size}
          </div>
          <div className="text-blue-200 text-sm">Species Identified</div>
        </div>
        <div className="glass-effect rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">
            {recordings.filter(r => r.confidence >= 0.8).length}
          </div>
          <div className="text-blue-200 text-sm">High Confidence</div>
        </div>
      </div>

      {/* Recordings List */}
      <div className="space-y-4">
        {filteredRecordings.length === 0 ? (
          <div className="glass-effect rounded-lg p-8 text-center">
            <div className="text-blue-200 mb-2">No recordings found</div>
            <p className="text-blue-100 text-sm">
              {recordings.length === 0 
                ? "Start recording animal sounds to build your library" 
                : "Try adjusting your search or filter criteria"
              }
            </p>
          </div>
        ) : (
          filteredRecordings.map((recording, index) => (
            <SoundLibraryItem
              key={index}
              recording={recording}
              isPlaying={playingId === index}
              onTogglePlay={() => togglePlay(index)}
            />
          ))
        )}
      </div>
    </div>
  )
}

const SoundLibraryItem = ({ recording, isPlaying, onTogglePlay }) => {
  const { species, callType, confidence, location, timestamp, insight } = recording

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString()
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-400'
    if (confidence >= 0.6) return 'text-yellow-400'
    return 'text-orange-400'
  }

  return (
    <div className="glass-effect rounded-lg p-4 hover:bg-white hover:bg-opacity-20 transition-all">
      <div className="flex items-start space-x-4">
        {/* Play Button */}
        <button
          onClick={onTogglePlay}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            isPlaying 
              ? 'bg-primary animate-pulse' 
              : 'bg-white bg-opacity-20 hover:bg-opacity-30'
          }`}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-white" />
          ) : (
            <Play className="w-5 h-5 text-white" />
          )}
        </button>

        {/* Recording Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold text-white truncate">{species}</h3>
              <p className="text-blue-200">{callType}</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className={`font-bold ${getConfidenceColor(confidence)}`}>
                {Math.round(confidence * 100)}%
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm text-blue-100 mb-3">
            <div className="flex items-center space-x-1">
              <MapPin className="w-3 h-3" />
              <span>{location}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(timestamp)}</span>
            </div>
          </div>

          <p className="text-blue-100 text-sm leading-relaxed line-clamp-2">
            {insight}
          </p>
        </div>
      </div>
    </div>
  )
}

export default SoundLibrary