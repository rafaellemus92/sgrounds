'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

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
      <nav className="hidden md:flex items-center gap-1 px-6 py-3 max-w-[820px] mx-auto">
        <Link href="/thread" className="mr-4">
          <img src="/logo.png" alt="sgrounds" className="h-8 w-8 object-contain" />
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
                color: active ? 'rgba(201, 169, 110, 0.85)' : 'rgba(var(--sg-text-rgb), 0.4)',
              }}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around py-2 px-4 border-t"
        style={{
          background: 'var(--sg-bg)',
          borderColor: 'rgba(var(--sg-text-rgb), 0.06)',
        }}
      >
        <Link href="/thread" className="flex flex-col items-center gap-0.5">
          <img src="/logo.png" alt="sgrounds" className="h-8 w-8 object-contain" />
        </Link>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-[10px] transition-all"
              style={{
                background: active ? 'rgba(201, 169, 110, 0.1)' : 'transparent',
              }}
            >
              <span
                className="font-mono text-[9px] uppercase tracking-widest"
                style={{
                  color: active ? 'rgba(201, 169, 110, 0.85)' : 'rgba(var(--sg-text-rgb), 0.35)',
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
