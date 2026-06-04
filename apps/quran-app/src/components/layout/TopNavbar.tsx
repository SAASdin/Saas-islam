'use client'
// ============================================================
// TopNavbar.tsx — Navigation condensée avec dropdowns
// ============================================================
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'

type NavItem = { href: string; label: string }
type NavGroup = { label: string; icon: string; items: NavItem[] }

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Coran',
    icon: '📖',
    items: [
      { href: '/surah',     label: 'Sourates'  },
      { href: '/masahif',   label: 'Masahif'   },
      { href: '/juz/1',     label: 'Juz'       },
      { href: '/ulum',      label: "ʿUlūm"     },
      { href: '/ma3ajim',   label: 'Maʿājim'   },
    ],
  },
  {
    label: 'Écoute',
    icon: '🎧',
    items: [
      { href: '/radio',        label: 'Radio'         },
      { href: '/reciters',     label: 'Récitateurs'   },
      { href: '/tafsir-audio', label: 'Tafsir audio'  },
    ],
  },
  {
    label: 'Références',
    icon: '📚',
    items: [
      { href: '/hadiths',      label: 'Hadiths'       },
      { href: '/bibliotheque', label: 'Bibliothèque'  },
      { href: '/fatwas/ask',   label: 'Fatwas AI'     },
    ],
  },
  {
    label: 'Perso',
    icon: '🌱',
    items: [
      { href: '/priere',    label: 'Prière'      },
      { href: '/plan',      label: 'Plan'        },
      { href: '/progress',  label: 'Progression' },
      { href: '/memorize',  label: 'Mémoriser'   },
    ],
  },
]

export default function TopNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  // Ferme le dropdown si clic en dehors
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenGroup(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchVal.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchVal.trim())}`)
      setSearchOpen(false)
      setSearchVal('')
    }
  }

  function isGroupActive(group: NavGroup) {
    return group.items.some(({ href }) =>
      href === '/' ? pathname === '/' : pathname.startsWith(href)
    )
  }

  function toggleGroup(label: string) {
    setOpenGroup(prev => (prev === label ? null : label))
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#0a0f1e]/98 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto h-full flex items-center px-4 gap-3">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group" onClick={() => setOpenGroup(null)}>
            <span className="text-2xl text-emerald-400 font-bold leading-none arabic-text" dir="rtl" lang="ar">نور</span>
            <span className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors hidden sm:block">NoorApp</span>
          </Link>

          {/* Nav desktop avec dropdowns */}
          <nav ref={navRef} className="hidden lg:flex items-center gap-1 flex-1">
            {NAV_GROUPS.map((group) => {
              const active = isGroupActive(group)
              const isOpen = openGroup === group.label
              return (
                <div key={group.label} className="relative">
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors ${
                      active || isOpen
                        ? 'bg-emerald-500/15 text-emerald-400 font-medium'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{group.icon}</span>
                    <span>{group.label}</span>
                    <svg
                      className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown */}
                  {isOpen && (
                    <div className="absolute top-full left-0 mt-1 w-44 bg-[#0d1426] border border-white/10 rounded-lg shadow-xl py-1 z-50">
                      {group.items.map(({ href, label }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setOpenGroup(null)}
                          className={`block px-4 py-2 text-sm transition-colors ${
                            pathname.startsWith(href) && href !== '/'
                              ? 'text-emerald-400 bg-emerald-500/10'
                              : 'text-slate-300 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          <div className="flex-1 lg:flex-none" />

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Search */}
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center">
                <input
                  ref={searchRef}
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  onBlur={() => { if (!searchVal) setSearchOpen(false) }}
                  placeholder="Rechercher dans le Coran…"
                  className="bg-white/10 border border-white/20 rounded-l-md px-3 py-1.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 w-56"
                />
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-r-md text-sm transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Rechercher"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            )}

            {/* Settings */}
            <Link
              href="/settings"
              className={`p-2 rounded-md transition-colors ${
                pathname === '/settings' ? 'text-emerald-400 bg-emerald-500/15' : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              title="Paramètres"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>

            {/* Hamburger mobile */}
            <button
              className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Menu mobile — groupes dépliables */}
        {menuOpen && (
          <div className="lg:hidden absolute top-14 left-0 right-0 bg-[#0a0f1e] border-b border-white/10 py-2 shadow-xl max-h-[80vh] overflow-y-auto">
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                {/* Séparateur de groupe */}
                <div className="px-5 pt-3 pb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {group.icon} {group.label}
                </div>
                {group.items.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={`block px-8 py-2 text-sm transition-colors ${
                      pathname.startsWith(href) && href !== '/'
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            ))}
            {/* Settings dans mobile */}
            <div className="px-5 pt-3 pb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">⚙️ Compte</div>
            <Link
              href="/settings"
              onClick={() => setMenuOpen(false)}
              className={`block px-8 py-2 text-sm transition-colors ${
                pathname === '/settings' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Paramètres
            </Link>
          </div>
        )}
      </header>

      {/* Overlay mobile */}
      {menuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  )
}
