'use client'
// ============================================================
// SearchBar.tsx — Barre de recherche sourates — Design premium dark
// Filtre la liste des 114 sourates en temps réel
// ============================================================

import { useState, useTransition } from 'react'
import type { Surah } from '@/types/quran'

interface Props {
  surahs: Surah[]
  onFilter: (filtered: Surah[]) => void
}

export default function SearchBar({ surahs, onFilter }: Props) {
  const [query, setQuery] = useState('')
  const [, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setQuery(q)

    startTransition(() => {
      if (!q.trim()) {
        onFilter(surahs)
        return
      }

      const normalized = q.toLowerCase().trim()
      const filtered = surahs.filter(s => {
        if (!isNaN(Number(normalized))) {
          return s.id === Number(normalized)
        }
        if (/[\u0600-\u06FF]/.test(normalized)) {
          return s.nameArabic.includes(q.trim())
        }
        return (
          s.nameTransliteration.toLowerCase().includes(normalized) ||
          s.nameFrench.toLowerCase().includes(normalized) ||
          s.nameEnglish.toLowerCase().includes(normalized)
        )
      })

      onFilter(filtered)
    })
  }

  function handleClear() {
    setQuery('')
    onFilter(surahs)
  }

  return (
    <div className="relative max-w-2xl mx-auto mb-8">
      {/* Icône recherche */}
      <svg
        className="absolute left-4 top-3.5 w-5 h-5 pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden
        style={{ color: '#d4af37', opacity: 0.7 }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      <input
        type="search"
        value={query}
        onChange={handleChange}
        placeholder="Rechercher : Al-Fatihah · الفاتحة · 1..."
        className="w-full px-5 py-3 pl-12 pr-10 rounded-xl text-base"
        style={{
          background: 'rgba(17,24,39,0.8)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#f1f5f9',
          outline: 'none',
          caretColor: '#d4af37',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)'
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.06)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
          e.currentTarget.style.boxShadow = ''
        }}
        aria-label="Rechercher une sourate"
        spellCheck={false}
        dir="auto"
      />

      {/* Bouton effacer */}
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-3 transition-colors"
          style={{ color: '#64748b' }}
          aria-label="Effacer la recherche"
          type="button"
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#f1f5f9' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#64748b' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
