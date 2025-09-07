import React, { useState } from 'react'
import { Bird, Brain, MapPin, Clock, Save, Share2, Eye, ChevronDown, ChevronUp } from 'lucide-react'
import SpectrogramView from './SpectrogramView'
import { useAuth } from '../context/AuthContext'
import { checkFeatureAccess } from '../lib/stripe'

const IdentificationCard = ({ identification, onSave }) => {
  const { species, callType, confidence, insight, location, timestamp, alternativeSpecies, acousticFeatures, timeOfDay, habitat, transcription, error } = identification
  const { isPremium } = useAuth()
  const [showSpectrogram, setShowSpectrogram] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString()
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-400'
    if (confidence >= 0.6) return 'text-yellow-400'
    return 'text-orange-400'
  }

  const canViewSpectrogram = checkFeatureAccess('spectrogramView', isPremium)

  return (
    <div className="glass-effect rounded-lg p-6 animate-slide-up">
      {/* Error State */}
      {error && (
        <div className="bg-red-500 bg-opacity-20 border border-red-500 border-opacity-50 rounded-lg p-4 mb-4">
          <p className="text-red-200 text-sm">Analysis failed. Please try again or check your API configuration.</p>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 ${error ? 'bg-red-500' : 'bg-primary'} bg-opacity-20 rounded-lg flex items-center justify-center`}>
            <Bird className={`w-6 h-6 ${error ? 'text-red-400' : 'text-primary'}`} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">{species}</h3>
            <p className="text-blue-200">{callType}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`text-lg font-bold ${getConfidenceColor(confidence)}`}>
            {Math.round(confidence * 100)}%
          </div>
          <p className="text-blue-200 text-sm">Confidence</p>
        </div>
      </div>

      {/* Enhanced Metadata */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center space-x-2 text-blue-100">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{location}</span>
        </div>
        <div className="flex items-center space-x-2 text-blue-100">
          <Clock className="w-4 h-4" />
          <span className="text-sm">{formatDate(timestamp)}</span>
        </div>
        {timeOfDay && (
          <div className="flex items-center space-x-2 text-blue-100">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Best time: {timeOfDay}</span>
          </div>
        )}
        {habitat && (
          <div className="flex items-center space-x-2 text-blue-100">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">Habitat: {habitat}</span>
          </div>
        )}
      </div>

      {/* Behavioral Insight */}
      <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <Brain className="w-5 h-5 text-accent" />
          <h4 className="font-semibold text-white">Behavioral Insight</h4>
        </div>
        <p className="text-blue-100 leading-relaxed">{insight}</p>
      </div>

      {/* Transcription (if available) */}
      {transcription && (
        <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-white mb-2">Audio Transcription</h4>
          <p className="text-blue-100 text-sm italic">"{transcription}"</p>
        </div>
      )}

      {/* Advanced Details (Premium Feature) */}
      {(alternativeSpecies?.length > 0 || acousticFeatures) && (
        <div className="mb-6">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center space-x-2 text-white hover:text-blue-200 transition-colors"
          >
            <span className="font-medium">Advanced Analysis</span>
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {!isPremium && <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded ml-2">Premium</span>}
          </button>
          
          {showDetails && (isPremium || true) && (
            <div className="mt-3 space-y-4">
              {alternativeSpecies?.length > 0 && (
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <h5 className="font-medium text-white mb-2">Alternative Species</h5>
                  <div className="flex flex-wrap gap-2">
                    {alternativeSpecies.map((species, index) => (
                      <span key={index} className="bg-blue-500 bg-opacity-30 text-blue-100 px-3 py-1 rounded-full text-sm">
                        {species}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {acousticFeatures && (
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <h5 className="font-medium text-white mb-2">Acoustic Features</h5>
                  <p className="text-blue-100 text-sm">{acousticFeatures}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Spectrogram Visualization */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-white">Audio Spectrogram</h4>
          {canViewSpectrogram && (
            <button
              onClick={() => setShowSpectrogram(!showSpectrogram)}
              className="flex items-center space-x-2 text-blue-200 hover:text-white transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span className="text-sm">{showSpectrogram ? 'Hide' : 'Show'} Spectrogram</span>
            </button>
          )}
          {!canViewSpectrogram && (
            <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded">Premium Feature</span>
          )}
        </div>
        
        {showSpectrogram && canViewSpectrogram ? (
          <SpectrogramView audioUrl={identification.audioUrl} />
        ) : (
          <div className="h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-md relative overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            {/* Simulated spectrogram pattern */}
            <div className="absolute inset-0 flex items-end justify-around px-2">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white bg-opacity-60 rounded-t"
                  style={{
                    height: `${Math.random() * 60 + 20}%`,
                    width: '3px'
                  }}
                ></div>
              ))}
            </div>
            {!canViewSpectrogram && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <span className="text-white text-sm">Upgrade to Premium for detailed spectrogram</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={onSave}
          disabled={error}
          className="flex-1 flex items-center justify-center space-x-2 bg-primary hover:bg-green-400 disabled:bg-gray-500 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Save to Library</span>
        </button>
        
        <button 
          disabled={error}
          className="flex items-center justify-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 disabled:bg-opacity-10 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-all"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>
    </div>
  )
}

export default IdentificationCard
