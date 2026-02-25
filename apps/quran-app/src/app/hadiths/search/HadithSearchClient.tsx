'use client'
// ============================================================
// HadithSearchClient.tsx — Barre de recherche et filtres hadiths
// Client Component — interactivité URL-driven
// ============================================================

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { SUNNAH_COLLECTIONS } from '@/lib/sunnah-api'

interface Props {
  initialQ: string
  initialCollection: string
}

export default function HadithSearchClient({ initialQ, initialCollection }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [q, setQ] = useState(initialQ)
  const [col, setCol] = useState(initialCollection)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (col) params.set('collection', col)
    startTransition(() => {
      router.push(`/hadiths/search?${params.toString()}`)
    })
  }

  return (
    <form onSubmit={handleSearch} className="space-y-3">
      {/* Champ de recherche */}
      <div className="relative">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher dans les hadiths..."
          className="w-full px-5 py-3.5 pr-12 rounded-xl text-sm text-slate-200 outline-none transition-all"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
          autoFocus
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-400 transition-colors"
          aria-label="Rechercher"
        >
          🔍
        </button>
      </div>

      {/* Filtre collection */}
      <div className="flex items-center gap-3 flex-wrap">
        <label className="text-xs text-slate-500">Filtrer :</label>
        <select
          value={col}
          onChange={(e) => setCol(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-xs text-slate-300 outline-none"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <option value="">Toutes les collections</option>
          {SUNNAH_COLLECTIONS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nameEn}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{
            background: 'rgba(212,175,55,0.12)',
            border: '1px solid rgba(212,175,55,0.2)',
            color: '#d4af37',
            cursor: 'pointer',
          }}
        >
          Rechercher
        </button>
      </div>
    </form>
  )
}
