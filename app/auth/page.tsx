'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (err) {
      setError(err.message)
    } else {
      setSent(true)
    }
    setLoading(false)
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
        {sent ? (
          <div className="text-center animate-slideUp">
            <p className="font-display text-[18px] italic" style={{ color: 'rgba(var(--sg-text-rgb), 0.7)' }}>
              Check your email — click the link within 60 seconds.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your email"
              required
              className="w-full px-[13px] py-[10px] rounded-[9px] font-body text-[15px] outline-none transition-all focus:ring-2 focus:ring-sg-gold/50 focus:ring-offset-2"
              style={{
                background: 'rgba(var(--sg-text-rgb), 0.032)',
                border: '1px solid rgba(var(--sg-text-rgb), 0.11)',
                color: 'rgba(var(--sg-text-rgb), 0.85)',
              }}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-[10px] rounded-[18px] font-body text-[13px] tracking-wide transition-all"
              style={{
                background: loading ? 'rgba(201, 169, 110, 0.15)' : 'rgba(201, 169, 110, 0.18)',
                border: '1.5px solid rgba(201, 169, 110, 0.35)',
                color: 'rgba(201, 169, 110, 0.9)',
              }}
            >
              {loading ? 'Sending…' : 'Send magic link'}
            </button>
            {error && (
              <p className="text-[12px] font-body text-center" style={{ color: 'rgba(180, 80, 80, 0.8)' }}>
                {error}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
