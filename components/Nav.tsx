'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from './Logo'
import { color, font, fontSize, radius, transition, space } from '@/lib/theme'

const NAV_ITEMS = [
  { href: '/thread', label: 'Thread' },
  { href: '/archive', label: 'Archive' },
  { href: '/lens', label: 'Lens' },
  { href: '/map', label: 'Map' },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop nav */}
      <nav
        style={{ maxWidth: '860px', margin: '0 auto', padding: `${space[3]} ${space[6]}` }}
        className="sg-nav-desktop"
        aria-label="Main navigation"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: space[1] }}>
          <Link href="/thread" style={{ marginRight: space[4] }} aria-label="Home">
            <Logo size={28} />
          </Link>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                style={{
                  padding: '6px 12px',
                  borderRadius: radius.lg,
                  fontFamily: font.body,
                  fontSize: fontSize.base,
                  letterSpacing: '0.02em',
                  background: active ? color.gold12 : 'transparent',
                  color: active ? color.gold85 : color.text38,
                  textDecoration: 'none',
                  transition: `all ${transition.normal}`,
                }}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Mobile bottom bar */}
      <nav
        className="sg-nav-mobile"
        aria-label="Main navigation"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: `${space[2]} ${space[4]}`,
          background: 'var(--sg-bg)',
          borderTop: `1px solid ${color.border06}`,
        }}
      >
        <Link href="/thread" aria-label="Home" style={{ display: 'flex', alignItems: 'center' }}>
          <Logo size={20} />
        </Link>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                padding: '4px 8px',
                borderRadius: radius.md,
                background: active ? color.gold08 : 'transparent',
                textDecoration: 'none',
                transition: `all ${transition.normal}`,
              }}
            >
              <span style={{
                fontFamily: font.mono,
                fontSize: fontSize.xs,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: active ? color.gold85 : color.text34,
              }}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
