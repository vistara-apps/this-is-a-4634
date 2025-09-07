import React from 'react'
import { Mic, Library, User, Waves } from 'lucide-react'

const Header = ({ currentView, onViewChange }) => {
  const navItems = [
    { id: 'record', label: 'Record', icon: Mic },
    { id: 'library', label: 'Library', icon: Library },
    { id: 'profile', label: 'Profile', icon: User }
  ]

  return (
    <header className="glass-effect rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
            <Waves className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">EchoSense</h1>
            <p className="text-blue-100 text-sm">Understand the wild with sound</p>
          </div>
        </div>
        
        <div className="hidden md:block">
          <div className="glass-effect rounded-lg px-4 py-2">
            <span className="text-white text-sm font-medium">Premium</span>
            <span className="text-blue-200 text-xs ml-2">$5/mo</span>
          </div>
        </div>
      </div>

      <nav className="flex space-x-1 bg-white bg-opacity-10 rounded-lg p-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onViewChange(id)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
              currentView === id
                ? 'bg-white bg-opacity-20 text-white shadow-md'
                : 'text-blue-100 hover:bg-white hover:bg-opacity-10'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </nav>
    </header>
  )
}

export default Header