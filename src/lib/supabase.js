import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase configuration missing. Some features may not work properly.')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

// Database schema helper functions
export const createTables = async () => {
  // Users table (handled by Supabase Auth)
  // Recordings table
  const { error: recordingsError } = await supabase.rpc('create_recordings_table')
  if (recordingsError) console.error('Error creating recordings table:', recordingsError)
}

// User management functions
export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Recording management functions
export const saveRecording = async (recording) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User must be authenticated to save recordings')
  }

  const { data, error } = await supabase
    .from('recordings')
    .insert([
      {
        user_id: user.id,
        audio_url: recording.audioUrl,
        identified_species: recording.species,
        call_type: recording.callType,
        confidence_score: recording.confidence,
        behavioral_insight: recording.insight,
        location: recording.location,
        timestamp: recording.timestamp,
        is_public_contribution: recording.isPublicContribution || false
      }
    ])
    .select()

  return { data, error }
}

export const getUserRecordings = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { data: [], error: null }
  }

  const { data, error } = await supabase
    .from('recordings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return { data, error }
}

export const updateRecording = async (id, updates) => {
  const { data, error } = await supabase
    .from('recordings')
    .update(updates)
    .eq('id', id)
    .select()

  return { data, error }
}

export const deleteRecording = async (id) => {
  const { error } = await supabase
    .from('recordings')
    .delete()
    .eq('id', id)

  return { error }
}

// Research contribution functions
export const getPublicRecordings = async (limit = 100) => {
  const { data, error } = await supabase
    .from('recordings')
    .select('*')
    .eq('is_public_contribution', true)
    .limit(limit)

  return { data, error }
}

export const contributeToResearch = async (recordingId) => {
  return await updateRecording(recordingId, { is_public_contribution: true })
}

// User profile functions
export const updateUserProfile = async (updates) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User must be authenticated')
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert([
      {
        id: user.id,
        ...updates,
        updated_at: new Date().toISOString()
      }
    ])
    .select()

  return { data, error }
}

export const getUserProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { data: null, error: null }
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { data, error }
}
