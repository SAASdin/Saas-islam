'use client'
// ============================================================
// SearchBar.tsx — Barre de recherche sourates (côté client)
// Filtre la liste des 114 sourates en temps réel
// Inspiré de quran.com + nuqayah.com
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
        // Recherche par numéro
        if (!isNaN(Number(normalized))) {
          return s.id === Number(normalized)
        }
        // Recherche par nom arabe (texte arabe dans la requête)
        if (/[\u0600-\u06FF]/.test(normalized)) {
          return s.nameArabic.includes(q.trim())
        }
        // Recherche par translittération ou nom français
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
        className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden
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
        placeholder="Al-Fatihah · الفاتحة · 1 · The Opener..."
        className="w-full px-5 py-3 pl-12 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-islam-500 text-base placeholder:text-gray-400 dark:placeholder:text-gray-500"
        aria-label="Rechercher une sourate"
        spellCheck={false}
        dir="auto"
      />

      {/* Bouton effacer */}
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Effacer la recherche"
          type="button"
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
