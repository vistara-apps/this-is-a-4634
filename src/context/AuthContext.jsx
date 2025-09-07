import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase, getCurrentUser, signIn, signUp, signOut } from '../lib/supabase'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    // Get initial user
    getCurrentUser().then(({ user }) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
        
        // Check premium status when user signs in
        if (session?.user) {
          checkPremiumStatus(session.user.id)
        } else {
          setIsPremium(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const checkPremiumStatus = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_status')
        .eq('id', userId)
        .single()

      if (!error && data) {
        setIsPremium(data.subscription_status === 'premium')
      }
    } catch (error) {
      console.error('Error checking premium status:', error)
    }
  }

  const login = async (email, password) => {
    setLoading(true)
    try {
      const { data, error } = await signIn(email, password)
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const register = async (email, password) => {
    setLoading(true)
    try {
      const { data, error } = await signUp(email, password)
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      const { error } = await signOut()
      if (error) throw error
      setUser(null)
      setIsPremium(false)
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setLoading(false)
    }
  }

  const upgradeToPremium = async () => {
    if (!user) return { error: 'User not authenticated' }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert([
          {
            id: user.id,
            subscription_status: 'premium',
            updated_at: new Date().toISOString()
          }
        ])

      if (!error) {
        setIsPremium(true)
      }

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  const value = {
    user,
    loading,
    isPremium,
    login,
    register,
    logout,
    upgradeToPremium
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
