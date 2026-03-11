'use client'

import { useState } from 'react'

export default function Logo({ size = 32 }: { size?: number }) {
  const [err, setErr] = useState(false)

  if (err) {
    return (
      <span
        className="font-display animate-breathe inline-block"
        style={{ fontSize: size, color: '#c9a96e', lineHeight: 1 }}
      >
        s;
      </span>
    )
  }

  return (
    <img
      src="/logo.png"
      alt="sgrounds"
      className="inline-block"
      style={{ height: size, width: size, objectFit: 'contain' }}
      onError={() => setErr(true)}
    />
  )
}
