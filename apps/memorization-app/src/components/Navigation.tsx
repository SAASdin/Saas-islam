'use client'
// Navigation principale de l'app mémorisation

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const path = usePathname()

  const links = [
    { href: '/',        label: 'Mutun',     icon: '📚' },
    { href: '/review',  label: 'Réviser',   icon: '🔄' },
  ]

  return (
    <nav
      className="sticky top-0 z-40 px-4 py-3"
      style={{
        background:    'rgba(10,15,30,0.92)',
        backdropFilter:'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom:  '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl">📿</span>
          <span
            className="font-bold text-base"
            style={{ color: '#d4af37' }}
          >
            NoorApp
          </span>
          <span className="text-xs text-slate-500 hidden sm:block">Mémorisation</span>
        </Link>

        {/* Liens */}
        <div className="flex items-center gap-1">
          {links.map(l => {
            const active = path === l.href || (l.href !== '/' && path.startsWith(l.href))
            return (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200"
                style={{
                  background: active ? 'rgba(212,175,55,0.12)' : 'transparent',
                  color:      active ? '#d4af37' : '#94a3b8',
                  border:     active ? '1px solid rgba(212,175,55,0.25)' : '1px solid transparent',
                }}
              >
                <span>{l.icon}</span>
                <span className="hidden sm:block">{l.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
