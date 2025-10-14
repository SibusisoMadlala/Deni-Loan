import { createClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from '../utils/supabase/info'
import { useState, useEffect } from 'react'

const supabaseUrl = `https://${projectId}.supabase.co`

const supabase = createClient(supabaseUrl, publicAnonKey)

export interface User {
  id: string
  email: string
  fullName?: string
  phone?: string
  role?: 'borrower' | 'admin'
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          ...session.user.user_metadata
        })
        setAccessToken(session.access_token)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          ...session.user.user_metadata
        })
        setAccessToken(session.access_token)
      } else {
        setUser(null)
        setAccessToken(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, fullName: string, phone: string, role: 'borrower' | 'admin' = 'borrower') => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-1ed353c1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ email, password, fullName, phone, role })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed')
      }

      // Now sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      console.log("yes")

      if (signInError) throw signInError

      return { success: true, user: signInData.user }
    } catch (error: any) {
      console.error('Signup error:', error)
      return { success: false, error: error.message }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      
      
      return { success: true, user: data.user, session: data.session }
    } catch (error: any) {
      console.error('Sign in error:', error)
      return { success: false, error: error.message }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setAccessToken(null)
      return { success: true }
    } catch (error: any) {
      console.error('Sign out error:', error)
      return { success: false, error: error.message }
    }
  }
  
  return {
    user,
    loading,
    accessToken,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  }
}