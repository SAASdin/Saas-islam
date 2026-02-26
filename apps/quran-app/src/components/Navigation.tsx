'use client'
// ============================================================
// Navigation.tsx — Barre de navigation globale premium
// Glass effect + sticky + active link highlighting
// ⚠️  Texte arabe du sous-titre : dir="rtl" lang="ar" OBLIGATOIRE
// ============================================================

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { href: '/', label: 'Coran' },
  { href: '/surah', label: 'Sourates' },
  { href: '/juz/1', label: "Juz'" },
  { href: '/mushaf/1', label: 'Mushaf' },
  { href: '/hadiths', label: 'Hadiths' },
  { href: '/ma3ajim', label: "Ma3ajim" },
  { href: '/ulum', label: "'Ulum" },
  { href: '/bibliotheque', label: 'Maktaba' },
  { href: '/priere', label: 'Sala' },
  { href: '/search', label: 'Bahth' },
]

export default function Navigation() {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(10, 15, 30, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex flex-col group">
          <span className="text-xl font-bold tracking-tight" style={{ color: '#d4af37' }}>
            🌙 NoorApp
          </span>
          <span
            dir="rtl"
            lang="ar"
            className="text-xs"
            style={{ color: '#94a3b8', fontFamily: 'var(--font-amiri)', lineHeight: '1.4' }}
            aria-label="Noor fi kull bayt — Lumière dans chaque foyer"
          >
            {/* ⚠️ Texte arabe — jamais modifier */}
            نور في كل بيت
          </span>
        </Link>

        {/* Navigation links — scrollable horizontalement sur mobile */}
        <nav
          className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide"
          aria-label="Navigation principale"
          style={{ WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' }}
        >
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  relative shrink-0 px-3 py-2 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${active
                    ? 'text-amber-400 bg-amber-400/10'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                  }
                `}
                aria-current={active ? 'page' : undefined}
              >
                {link.label}
                {active && (
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                    style={{ background: '#d4af37' }}
                  />
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
