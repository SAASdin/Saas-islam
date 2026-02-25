'use client'
// ============================================================
// HomeClient.tsx — Page d'accueil
// ============================================================
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { sanitizeTranslation } from '@/lib/sanitize'
import type { QdcChapter, QdcVerse } from '@/lib/quran-cdn-api'

interface Props {
  chapters: QdcChapter[]
  verseOfDay: QdcVerse | null
  lastRead: { surahId: number; ayah: number; surahName: string } | null
}

const QUICK_LINKS = [
  { href: '/mushaf/1',  icon: '🕌', label: 'Mushaf',     sub: '604 pages' },
  { href: '/ulum',      icon: '📚', label: "'Ulum",      sub: '7 sciences' },
  { href: '/ma3ajim',   icon: '🔍', label: 'Ma\'ājim',   sub: 'Dictionnaire' },
  { href: '/plan',      icon: '📅', label: 'Plan',       sub: '30/90/365j' },
  { href: '/memorize',  icon: '🧠', label: 'Mémoriser',  sub: 'SRS Anki' },
  { href: '/radio',     icon: '🎵', label: 'Radio',      sub: 'Coran live' },
  { href: '/progress',  icon: '📊', label: 'Progrès',    sub: 'Statistiques' },
  { href: '/search',    icon: '🔎', label: 'Recherche',  sub: '6236 versets' },
]

const JUZ_LIST = Array.from({ length: 30 }, (_, i) => i + 1)


export default function HomeClient({ chapters, verseOfDay, lastRead: lastReadProp }: Props) {
  const [activeTab, setActiveTab] = useState<'surahs' | 'juz' | 'page'>('surahs')
  const [search, setSearch] = useState('')
  const [lastRead, setLastRead] = useState<Props['lastRead']>(lastReadProp)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('noorapp-last-read')
      if (raw) {
        const data = JSON.parse(raw)
        if (data.surahId && data.ayah) {
          const ch = chapters.find(c => c.id === data.surahId)
          setLastRead({ surahId: data.surahId, ayah: data.ayah, surahName: ch?.name_simple ?? `Sourate ${data.surahId}` })
        }
      }
    } catch {}
  }, [chapters])

  const filteredChapters = chapters.filter(c =>
    !search || c.name_simple.toLowerCase().includes(search.toLowerCase()) ||
    c.name_arabic.includes(search) || String(c.id) === search.trim()
  )

  const translation = verseOfDay?.translations?.[0]

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">

      {/* ── Verset du jour ─────────────────────────────────────────────── */}
      {verseOfDay && (
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900/30 to-transparent border border-emerald-500/20 rounded-2xl p-6 mb-6">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, #10b981 0%, transparent 50%), radial-gradient(circle at 80% 20%, #059669 0%, transparent 50%)'
            }} />
          </div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <p className="text-emerald-400 text-xs font-medium uppercase tracking-wide">Verset du jour</p>
              </div>
              <Link href={`/surah/${verseOfDay.verse_key.split(':')[0]}/${verseOfDay.verse_key.split(':')[1]}`}
                className="text-xs text-slate-500 hover:text-emerald-400 transition-colors font-mono">
                {verseOfDay.verse_key}
              </Link>
            </div>

            {/* Texte arabe sacré */}
            <p className="arabic-text text-2xl md:text-3xl text-white/95 text-right leading-[2.2] mb-4"
              dir="rtl" lang="ar">
              {verseOfDay.text_uthmani}
            </p>

            {/* Traduction */}
            {translation && (
              <p className="text-slate-300 text-sm leading-relaxed border-l-2 border-emerald-500/40 pl-3">
                {sanitizeTranslation(translation.text)}
              </p>
            )}

            <div className="flex items-center gap-3 mt-4">
              <Link href={`/surah/${verseOfDay.verse_key.split(':')[0]}`}
                className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs transition-colors">
                Lire la sourate →
              </Link>
              <Link href={`/surah/${verseOfDay.verse_key.split(':')[0]}/${verseOfDay.verse_key.split(':')[1]}`}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 rounded-lg text-xs transition-colors">
                Voir le tafsir 📖
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Continuer la lecture ────────────────────────────────────────── */}
      {lastRead && (
        <Link href={`/surah/${lastRead.surahId}/${lastRead.ayah}`}
          className="flex items-center gap-4 bg-white/4 hover:bg-white/7 border border-white/10 hover:border-emerald-500/30 rounded-2xl p-4 mb-6 transition-all group">
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-2xl shrink-0">
            📖
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-500 text-xs mb-0.5">Continuer la lecture</p>
            <p className="text-white font-medium truncate">{lastRead.surahName}</p>
            <p className="text-slate-500 text-xs">Verset {lastRead.ayah}</p>
          </div>
          <svg className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}

      {/* ── Accès rapide ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {QUICK_LINKS.map(l => (
          <Link key={l.href} href={l.href}
            className="flex flex-col items-center gap-1 p-3 bg-white/4 hover:bg-white/8 border border-white/8 hover:border-white/20 rounded-xl transition-all group text-center">
            <span className="text-2xl">{l.icon}</span>
            <span className="text-white text-xs font-medium">{l.label}</span>
            <span className="text-slate-600 text-[10px] hidden sm:block">{l.sub}</span>
          </Link>
        ))}
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div className="flex border-b border-white/10 mb-4">
        {[
          { id: 'surahs', label: 'الـسُّوَر', sub: '114' },
          { id: 'juz',    label: 'الأَجْزَاء', sub: '30' },
          { id: 'page',   label: 'الصَّفَحَات', sub: '604' },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as 'surahs' | 'juz' | 'page')}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm transition-colors border-b-2 ${
              activeTab === t.id ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="arabic-text" dir="rtl" lang="ar">{t.label}</span>
            <span className="text-xs text-slate-700">({t.sub})</span>
          </button>
        ))}
      </div>

      {/* ── Onglet Sourates ─────────────────────────────────────────────── */}
      {activeTab === 'surahs' && (
        <>
          <div className="relative mb-4">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une sourate…"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500" />
          </div>
          <div className="space-y-1">
            {filteredChapters.map(ch => (
              <Link key={ch.id} href={`/surah/${ch.id}`}
                className="flex items-center gap-3 p-3 hover:bg-white/5 border border-transparent hover:border-white/10 rounded-xl transition-all group">
                <div className="w-9 h-9 rounded-lg bg-white/5 group-hover:bg-emerald-500/10 flex items-center justify-center shrink-0 transition-colors">
                  <span className="text-slate-500 text-xs font-mono">{ch.id}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-medium">{ch.name_simple}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      ch.revelation_place === 'makkah' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-400'
                    }`}>{ch.revelation_place === 'makkah' ? 'م' : 'مد'}</span>
                  </div>
                  <p className="text-slate-500 text-xs">{ch.translated_name.name} · {ch.verses_count} versets</p>
                </div>
                <p className="arabic-text text-lg text-white/60 shrink-0" dir="rtl" lang="ar">{ch.name_arabic}</p>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* ── Onglet Juz ──────────────────────────────────────────────────── */}
      {activeTab === 'juz' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {JUZ_LIST.map(j => (
            <Link key={j} href={`/juz/${j}`}
              className="flex items-center gap-3 p-4 bg-white/3 hover:bg-white/8 border border-white/8 hover:border-emerald-500/30 rounded-xl transition-all group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 flex items-center justify-center transition-colors">
                <span className="text-emerald-400 font-bold text-sm">{j}</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Juz {j}</p>
                <p className="text-slate-600 text-xs arabic-text" dir="rtl" lang="ar">الجزء {j}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ── Onglet Pages ─────────────────────────────────────────────────── */}
      {activeTab === 'page' && (
        <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
          {Array.from({ length: 604 }, (_, i) => i + 1).map(p => (
            <Link key={p} href={`/mushaf/${p}`}
              className="flex items-center justify-center h-10 bg-white/3 hover:bg-emerald-500/15 border border-white/8 hover:border-emerald-500/30 rounded-lg text-xs text-slate-400 hover:text-emerald-400 transition-all font-mono">
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
