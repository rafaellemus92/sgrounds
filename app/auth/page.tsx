'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGoogleSignIn() {
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://sgrounds.vercel.app/auth/callback',
      },
    })
    if (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--sg-bg)' }}>
      <div className="w-full max-w-[360px] px-6">
        <div className="text-center mb-10">
          <span className="font-display text-[46px] text-sg-gold animate-breathe inline-block">s;</span>
          <p className="font-body text-[13px] mt-2" style={{ color: 'rgba(var(--sg-text-rgb), 0.45)' }}>
            each day is a semicolon
          </p>
        </div>
        <div className="space-y-4 animate-slideUp">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-[10px] rounded-[18px] font-body text-[13px] tracking-wide transition-all flex items-center justify-center gap-2"
            style={{
              background: loading ? 'rgba(201, 169, 110, 0.15)' : 'rgba(201, 169, 110, 0.18)',
              border: '1.5px solid rgba(201, 169, 110, 0.35)',
              color: 'rgba(201, 169, 110, 0.9)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {loading ? 'Connecting...' : 'Continue with Google'}
          </button>
          {error && (
            <p className="text-[12px] font-body text-center" style={{ color: 'rgba(180, 80, 80, 0.8)' }}>
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
