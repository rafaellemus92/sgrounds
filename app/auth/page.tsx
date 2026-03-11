'use client'

import { supabase } from '@/lib/supabase'

export default function AuthPage() {
  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://sgrounds.vercel.app/auth/callback'
      }
    })
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
        <button
          onClick={handleGoogleSignIn}
          className="w-full py-[10px] rounded-[18px] font-body text-[13px] tracking-wide transition-all"
          style={{
            background: 'rgba(201, 169, 110, 0.18)',
            border: '1.5px solid rgba(201, 169, 110, 0.35)',
            color: 'rgba(201, 169, 110, 0.9)',
          }}
        >
          Continue with Google
        </button>
      </div>
    </div>
  )
}
