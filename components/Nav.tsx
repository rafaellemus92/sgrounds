'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from './Logo'

const NAV_ITEMS = [
  { href: '/thread', label: 'Thread' },
  { href: '/archive', label: 'Archive' },
  { href: '/dream', label: 'Dream' },
  { href: '/lens', label: 'Lens' },
  { href: '/map', label: 'Map' },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-1 px-6 py-3 max-w-[820px] mx-auto">
        <Link href="/thread" className="mr-4">
          <Logo size={28} />
        </Link>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 rounded-[12px] font-body text-[12px] tracking-wide transition-all"
              style={{
                background: active ? 'rgba(201, 169, 110, 0.12)' : 'transparent',
                color: active ? 'rgba(201, 169, 110, 0.9)' : 'rgba(var(--sg-text-rgb), 0.5)',
              }}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 pt-2 border-t"
        style={{
          background: 'var(--sg-bg)',
          borderColor: 'rgba(var(--sg-text-rgb), 0.08)',
          paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
        }}
      >
        <Link href="/thread" className="flex flex-col items-center gap-0.5 px-3 py-1.5">
          <Logo size={20} />
        </Link>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-[10px] transition-all min-w-[44px]"
              style={{
                background: active ? 'rgba(201, 169, 110, 0.1)' : 'transparent',
              }}
            >
              <span
                className="font-mono text-[10px] uppercase tracking-widest"
                style={{
                  color: active ? 'rgba(201, 169, 110, 0.9)' : 'rgba(var(--sg-text-rgb), 0.45)',
                }}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
