'use client'
// ============================================================
// HomeClient.tsx — Page d'accueil interactive
// ============================================================
import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { QdcChapter } from '@/lib/quran-cdn-api'

interface Props {
  chapters: QdcChapter[]
}

type TabMode = 'surah' | 'juz' | 'revelation'

// Données juz : première sourate de chaque juz
const JUZ_INFO: Record<number, { surahName: string; startVerse: string }> = {
  1: { surahName: 'Al-Fatihah', startVerse: '1:1' },
  2: { surahName: 'Al-Baqarah', startVerse: '2:142' },
  3: { surahName: 'Al-Baqarah', startVerse: '2:253' },
  4: { surahName: 'Ali \'Imran', startVerse: '3:92' },
  5: { surahName: 'An-Nisa', startVerse: '4:24' },
  6: { surahName: 'An-Nisa', startVerse: '4:148' },
  7: { surahName: 'Al-Ma\'idah', startVerse: '5:82' },
  8: { surahName: 'Al-An\'am', startVerse: '6:111' },
  9: { surahName: 'Al-A\'raf', startVerse: '7:87' },
  10: { surahName: 'Al-Anfal', startVerse: '8:41' },
  11: { surahName: 'At-Tawbah', startVerse: '9:93' },
  12: { surahName: 'Hud', startVerse: '11:6' },
  13: { surahName: 'Yusuf', startVerse: '12:53' },
  14: { surahName: 'Al-Hijr', startVerse: '15:1' },
  15: { surahName: 'Al-Isra', startVerse: '17:1' },
  16: { surahName: 'Al-Kahf', startVerse: '18:75' },
  17: { surahName: 'Al-Anbya', startVerse: '21:1' },
  18: { surahName: 'Al-Mu\'minun', startVerse: '23:1' },
  19: { surahName: 'Al-Furqan', startVerse: '25:21' },
  20: { surahName: 'An-Naml', startVerse: '27:56' },
  21: { surahName: 'Al-\'Ankabut', startVerse: '29:46' },
  22: { surahName: 'Al-Ahzab', startVerse: '33:31' },
  23: { surahName: 'Ya-Sin', startVerse: '36:28' },
  24: { surahName: 'Az-Zumar', startVerse: '39:32' },
  25: { surahName: 'Fussilat', startVerse: '41:47' },
  26: { surahName: 'Al-Ahqaf', startVerse: '46:1' },
  27: { surahName: 'Adh-Dhariyat', startVerse: '51:31' },
  28: { surahName: 'Al-Mujadila', startVerse: '58:1' },
  29: { surahName: 'Al-Mulk', startVerse: '67:1' },
  30: { surahName: 'An-Naba', startVerse: '78:1' },
}

export default function HomeClient({ chapters }: Props) {
  const [tab, setTab] = useState<TabMode>('surah')
  const [query, setQuery] = useState('')
  const [ascending, setAscending] = useState(true)

  const filteredChapters = useMemo(() => {
    let list = [...chapters]

    if (query.trim()) {
      const q = query.toLowerCase().trim()
      list = list.filter(c =>
        c.name_simple.toLowerCase().includes(q) ||
        c.name_arabic.includes(query.trim()) ||
        c.translated_name.name.toLowerCase().includes(q) ||
        String(c.id).includes(q)
      )
    }

    if (tab === 'revelation') {
      list.sort((a, b) => ascending
        ? a.revelation_order - b.revelation_order
        : b.revelation_order - a.revelation_order
      )
    } else {
      list.sort((a, b) => ascending ? a.id - b.id : b.id - a.id)
    }

    return list
  }, [chapters, query, tab, ascending])

  return (
    <div className="max-w-5xl mx-auto px-4">
      {/* ── Hero ──────────────────────────────────── */}
      <div className="py-12 text-center">
        <p
          className="quran-text text-4xl md:text-5xl text-amber-100/90 mb-4 leading-relaxed"
          dir="rtl"
          lang="ar"
        >
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>
        <p className="text-slate-400 text-sm">Au nom d&apos;Allah, le Tout Miséricordieux, le Très Miséricordieux</p>
      </div>

      {/* ── Recherche ─────────────────────────────── */}
      <div className="relative max-w-2xl mx-auto mb-10">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Rechercher une sourate, un verset…"
          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:bg-white/8 transition-all text-base"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Tabs + tri ────────────────────────────── */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center bg-white/5 rounded-lg p-1 gap-0.5">
          {([
            { key: 'surah',      label: 'Sourates'  },
            { key: 'juz',        label: 'Juz'       },
            { key: 'revelation', label: 'Révélation'},
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === key
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab !== 'juz' && (
          <button
            onClick={() => setAscending(!ascending)}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <svg className={`w-4 h-4 transition-transform ${ascending ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            {ascending ? 'Croissant' : 'Décroissant'}
          </button>
        )}
      </div>

      {/* ── Contenu tabs ─────────────────────────── */}
      {tab === 'juz' ? (
        /* Grille 30 Juz */
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2 mb-12">
          {Array.from({ length: 30 }, (_, i) => i + 1).map(juz => (
            <Link
              key={juz}
              href={`/juz/${juz}`}
              className="aspect-square flex flex-col items-center justify-center bg-white/5 hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/30 rounded-xl transition-all group"
            >
              <span className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">{juz}</span>
              <span className="text-xs text-slate-500">Juz</span>
            </Link>
          ))}
        </div>
      ) : (
        /* Liste sourates */
        <div className="space-y-0.5 mb-12">
          {filteredChapters.map(chapter => (
            <Link
              key={chapter.id}
              href={`/surah/${chapter.id}`}
              className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/10"
            >
              {/* Numéro */}
              <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 40 40" className="absolute inset-0 w-9 h-9 text-emerald-500/25 group-hover:text-emerald-500/40 transition-colors" fill="currentColor">
                  <path d="M20 0 L24 16 L40 20 L24 24 L20 40 L16 24 L0 20 L16 16 Z"/>
                </svg>
                <span className="relative text-xs font-bold text-emerald-300">{chapter.id}</span>
              </div>

              {/* Noms */}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium group-hover:text-emerald-300 transition-colors">
                  {chapter.name_simple}
                </p>
                <p className="text-slate-500 text-xs truncate">{chapter.translated_name.name}</p>
              </div>

              {/* Badge révélation */}
              <span className={`hidden sm:inline-block text-xs px-2 py-0.5 rounded-full shrink-0 ${
                chapter.revelation_place === 'makkah'
                  ? 'bg-amber-500/10 text-amber-400'
                  : 'bg-blue-500/10 text-blue-400'
              }`}>
                {chapter.revelation_place === 'makkah' ? 'Mecque' : 'Médine'}
              </span>

              {/* Nom arabe */}
              <p
                className="arabic-text text-xl text-amber-100/70 group-hover:text-amber-100/90 transition-colors leading-none shrink-0"
                dir="rtl"
                lang="ar"
              >
                {chapter.name_arabic}
              </p>

              {/* Versets */}
              <p className="text-slate-500 text-xs shrink-0 w-16 text-right">{chapter.verses_count} v.</p>
            </Link>
          ))}

          {filteredChapters.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <p className="text-4xl mb-3">🔍</p>
              <p>Aucune sourate ne correspond à &quot;{query}&quot;</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
