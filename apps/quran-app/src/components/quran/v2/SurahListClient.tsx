'use client'
// ============================================================
// SurahListClient.tsx — Liste 114 sourates avec filtres
// ============================================================
import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { QdcChapter } from '@/lib/quran-cdn-api'

interface Props {
  chapters: QdcChapter[]
}

type SortMode = 'order' | 'revelation' | 'length-asc' | 'length-desc'

export default function SurahListClient({ chapters }: Props) {
  const [query, setQuery] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('order')
  const [filterRev, setFilterRev] = useState<'all' | 'makkah' | 'madinah'>('all')

  const filtered = useMemo(() => {
    let list = [...chapters]

    // Filtre recherche
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter(c =>
        c.name_simple.toLowerCase().includes(q) ||
        c.name_complex.toLowerCase().includes(q) ||
        c.name_arabic.includes(query.trim()) ||
        c.translated_name.name.toLowerCase().includes(q) ||
        String(c.id).includes(q)
      )
    }

    // Filtre révélation
    if (filterRev !== 'all') {
      list = list.filter(c => c.revelation_place === filterRev)
    }

    // Tri
    switch (sortMode) {
      case 'order':
        list.sort((a, b) => a.id - b.id)
        break
      case 'revelation':
        list.sort((a, b) => a.revelation_order - b.revelation_order)
        break
      case 'length-asc':
        list.sort((a, b) => a.verses_count - b.verses_count)
        break
      case 'length-desc':
        list.sort((a, b) => b.verses_count - a.verses_count)
        break
    }

    return list
  }, [chapters, query, sortMode, filterRev])

  return (
    <div>
      {/* Filtres */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-56">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher une sourate…"
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Tri */}
        <select
          value={sortMode}
          onChange={e => setSortMode(e.target.value as SortMode)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
        >
          <option value="order">Ordre Coran</option>
          <option value="revelation">Ordre révélation</option>
          <option value="length-asc">Plus courtes d'abord</option>
          <option value="length-desc">Plus longues d'abord</option>
        </select>

        {/* Révélation */}
        <div className="flex items-center bg-white/5 border border-white/10 rounded-lg overflow-hidden">
          {(['all', 'makkah', 'madinah'] as const).map(r => (
            <button
              key={r}
              onClick={() => setFilterRev(r)}
              className={`px-3 py-2 text-xs font-medium transition-colors ${
                filterRev === r
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {r === 'all' ? 'Toutes' : r === 'makkah' ? 'Mecquoises' : 'Médinoises'}
            </button>
          ))}
        </div>
      </div>

      {/* Compteur */}
      <p className="text-slate-500 text-xs mb-4">{filtered.length} sourate{filtered.length !== 1 ? 's' : ''}</p>

      {/* Liste */}
      <div className="space-y-1">
        {filtered.map(chapter => (
          <Link
            key={chapter.id}
            href={`/surah/${chapter.id}`}
            className="flex items-center gap-4 px-4 py-3.5 rounded-xl border border-transparent hover:bg-white/5 hover:border-white/10 transition-all group"
          >
            {/* Numéro */}
            <div className="relative w-9 h-9 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 40 40" className="absolute inset-0 w-9 h-9 text-emerald-500/30 group-hover:text-emerald-500/50 transition-colors" fill="currentColor">
                <path d="M20 0 L24 16 L40 20 L24 24 L20 40 L16 24 L0 20 L16 16 Z"/>
              </svg>
              <span className="relative text-xs font-bold text-emerald-300">{chapter.id}</span>
            </div>

            {/* Infos */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium text-sm">{chapter.name_simple}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  chapter.revelation_place === 'makkah'
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'bg-blue-500/10 text-blue-400'
                }`}>
                  {chapter.revelation_place === 'makkah' ? 'Mekke' : 'Médine'}
                </span>
              </div>
              <p className="text-slate-500 text-xs truncate">{chapter.translated_name.name}</p>
            </div>

            {/* Nom arabe + nb versets */}
            <div className="text-right shrink-0">
              <p
                className="arabic-text text-lg text-amber-100/80 group-hover:text-amber-100 transition-colors leading-none mb-1"
                dir="rtl"
                lang="ar"
              >
                {chapter.name_arabic}
              </p>
              <p className="text-slate-500 text-xs">{chapter.verses_count} versets</p>
            </div>

            {/* Flèche */}
            <svg className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  )
}
