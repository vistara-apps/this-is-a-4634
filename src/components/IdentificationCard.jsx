import React from 'react'
import { Bird, Brain, MapPin, Clock, Save, Share2 } from 'lucide-react'

const IdentificationCard = ({ identification, onSave }) => {
  const { species, callType, confidence, insight, location, timestamp } = identification

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString()
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-400'
    if (confidence >= 0.6) return 'text-yellow-400'
    return 'text-orange-400'
  }

  return (
    <div className="glass-effect rounded-lg p-6 animate-slide-up">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary bg-opacity-20 rounded-lg flex items-center justify-center">
            <Bird className="w-6 h-6 text-primary" />
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

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center space-x-2 text-blue-100">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{location}</span>
        </div>
        <div className="flex items-center space-x-2 text-blue-100">
          <Clock className="w-4 h-4" />
          <span className="text-sm">{formatDate(timestamp)}</span>
        </div>
      </div>

      {/* Behavioral Insight */}
      <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <Brain className="w-5 h-5 text-accent" />
          <h4 className="font-semibold text-white">Behavioral Insight</h4>
        </div>
        <p className="text-blue-100 leading-relaxed">{insight}</p>
      </div>

      {/* Spectrogram Visualization */}
      <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-white mb-3">Audio Spectrogram</h4>
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
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={onSave}
          className="flex-1 flex items-center justify-center space-x-2 bg-primary hover:bg-green-400 text-white py-3 px-4 rounded-lg font-medium transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Save to Library</span>
        </button>
        
        <button className="flex items-center justify-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-3 px-4 rounded-lg font-medium transition-all">
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>
    </div>
  )
}

export default IdentificationCard