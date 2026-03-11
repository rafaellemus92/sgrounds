'use client'

export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <img
      src="/logo.png"
      alt="sgrounds"
      className="inline-block"
      style={{ height: size, width: size, objectFit: 'contain' }}
    />
  )
}
