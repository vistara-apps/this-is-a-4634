import React, { useState } from 'react'
import { User, Crown, Settings, Database, Download, Share2, Award } from 'lucide-react'
import { useRecording } from '../context/RecordingContext'

const UserProfile = () => {
  const { recordings } = useRecording()
  const [isPremium, setIsPremium] = useState(false)

  const stats = {
    totalRecordings: recordings.length,
    speciesFound: new Set(recordings.map(r => r.species)).size,
    averageConfidence: recordings.length > 0 
      ? (recordings.reduce((sum, r) => sum + r.confidence, 0) / recordings.length * 100).toFixed(1)
      : 0,
    contributedToResearch: recordings.filter(r => r.isPublicContribution).length
  }

  const achievements = [
    { title: 'First Recording', description: 'Recorded your first animal sound', earned: recordings.length > 0 },
    { title: 'Species Explorer', description: 'Identified 5 different species', earned: stats.speciesFound >= 5 },
    { title: 'Expert Listener', description: 'Achieved 90% average confidence', earned: stats.averageConfidence >= 90 },
    { title: 'Research Contributor', description: 'Contributed 10 recordings to research', earned: stats.contributedToResearch >= 10 }
  ]

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="glass-effect rounded-lg p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Wildlife Explorer</h2>
            <div className="flex items-center space-x-2">
              {isPremium ? (
                <>
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 font-medium">Premium Member</span>
                </>
              ) : (
                <span className="text-blue-200">Free Account</span>
              )}
            </div>
          </div>
        </div>

        {!isPremium && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Upgrade to Premium</h3>
                <p className="text-sm opacity-90">Unlimited recordings, advanced insights, offline mode</p>
              </div>
              <button className="bg-white text-orange-500 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-all">
                $5/mo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-effect rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">{stats.totalRecordings}</div>
          <div className="text-blue-200 text-sm">Recordings</div>
        </div>
        <div className="glass-effect rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">{stats.speciesFound}</div>
          <div className="text-blue-200 text-sm">Species</div>
        </div>
        <div className="glass-effect rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">{stats.averageConfidence}%</div>
          <div className="text-blue-200 text-sm">Avg Confidence</div>
        </div>
        <div className="glass-effect rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">{stats.contributedToResearch}</div>
          <div className="text-blue-200 text-sm">Contributed</div>
        </div>
      </div>

      {/* Achievements */}
      <div className="glass-effect rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
          <Award className="w-5 h-5" />
          <span>Achievements</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border transition-all ${
                achievement.earned
                  ? 'bg-primary bg-opacity-20 border-primary border-opacity-50'
                  : 'bg-white bg-opacity-10 border-white border-opacity-20'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  achievement.earned ? 'bg-primary' : 'bg-gray-400'
                }`}>
                  <Award className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className={`font-medium ${achievement.earned ? 'text-white' : 'text-gray-400'}`}>
                    {achievement.title}
                  </h4>
                  <p className={`text-sm ${achievement.earned ? 'text-blue-100' : 'text-gray-500'}`}>
                    {achievement.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Management */}
      <div className="glass-effect rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
          <Database className="w-5 h-5" />
          <span>Data Management</span>
        </h3>
        
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-3 bg-white bg-opacity-10 rounded-lg hover:bg-opacity-20 transition-all">
            <div className="flex items-center space-x-3">
              <Download className="w-5 h-5 text-blue-200" />
              <span className="text-white">Export All Data</span>
            </div>
            <span className="text-blue-200 text-sm">JSON, CSV</span>
          </button>
          
          <button className="w-full flex items-center justify-between p-3 bg-white bg-opacity-10 rounded-lg hover:bg-opacity-20 transition-all">
            <div className="flex items-center space-x-3">
              <Share2 className="w-5 h-5 text-blue-200" />
              <span className="text-white">Research Contribution</span>
            </div>
            <span className="text-blue-200 text-sm">
              {stats.contributedToResearch > 0 ? 'Enabled' : 'Disabled'}
            </span>
          </button>
          
          <button className="w-full flex items-center justify-between p-3 bg-white bg-opacity-10 rounded-lg hover:bg-opacity-20 transition-all">
            <div className="flex items-center space-x-3">
              <Settings className="w-5 h-5 text-blue-200" />
              <span className="text-white">Privacy Settings</span>
            </div>
          </button>
        </div>
      </div>

      {/* Research Impact */}
      <div className="glass-effect rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Research Impact</h3>
        <div className="bg-white bg-opacity-10 rounded-lg p-4">
          <p className="text-blue-100 leading-relaxed">
            Your contributions help scientists understand animal behavior patterns and biodiversity changes. 
            Every recording you share advances wildlife conservation research.
          </p>
          
          {stats.contributedToResearch > 0 && (
            <div className="mt-4 p-3 bg-primary bg-opacity-20 rounded-lg">
              <p className="text-white font-medium">
                Thank you! Your {stats.contributedToResearch} contributions have been added to the conservation database.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserProfile