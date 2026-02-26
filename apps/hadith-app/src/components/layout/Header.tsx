'use client'

import Link from 'next/link'
import { useState } from 'react'
import SearchBar from '@/components/search/SearchBar'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-[#067b55] text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Barre principale */}
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <span className="text-2xl font-arabic">سنة</span>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-lg tracking-tight">Hadith</span>
              <span className="text-xs text-green-200">sunnah.com</span>
            </div>
          </Link>

          {/* Search — centre */}
          <div className="hidden md:flex flex-1 max-w-xl mx-6">
            <SearchBar compact />
          </div>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-1 text-sm">
            <Link href="/" className="px-3 py-1.5 rounded hover:bg-white/10 transition-colors">
              Collections
            </Link>
            <Link href="/search" className="px-3 py-1.5 rounded hover:bg-white/10 transition-colors">
              Recherche
            </Link>
          </nav>

          {/* Bouton menu mobile */}
          <button
            className="md:hidden p-2 rounded hover:bg-white/10"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Menu mobile */}
        {menuOpen && (
          <div className="md:hidden pb-3 border-t border-green-600/30">
            <div className="mt-3">
              <SearchBar compact />
            </div>
            <nav className="mt-3 flex flex-col gap-1 text-sm">
              <Link href="/" className="px-3 py-2 rounded hover:bg-white/10" onClick={() => setMenuOpen(false)}>
                Collections
              </Link>
              <Link href="/search" className="px-3 py-2 rounded hover:bg-white/10" onClick={() => setMenuOpen(false)}>
                Recherche
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
