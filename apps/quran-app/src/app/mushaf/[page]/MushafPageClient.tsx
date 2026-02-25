'use client'
// ============================================================
// MushafPageClient.tsx — Vue Mushaf (مصحف) complète
// Script Uthmani KFGQPC, navigation par page, double-page desktop
// ============================================================
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getVersesByPage, getVerseText } from '@/lib/quran-cdn-api'
import type { QdcVerse } from '@/lib/quran-cdn-api'

// Données Juz/Hizb (approximatif — basé sur pages standards)
const JUZ_PAGES: Record<number, number> = {
  1:1,2:22,3:42,4:62,5:82,6:102,7:122,8:142,9:162,10:182,
  11:202,12:222,13:242,14:262,15:282,16:302,17:322,18:342,19:362,20:382,
  21:402,22:422,23:442,24:462,25:482,26:502,27:522,28:542,29:562,30:582,
}

function getJuzForPage(page: number): number {
  let juz = 1
  for (const [j, p] of Object.entries(JUZ_PAGES)) {
    if (page >= p) juz = parseInt(j)
  }
  return juz
}

interface Props {
  pageNum: number
  verses: QdcVerse[]
  totalPages: number
}

export default function MushafPageClient({ pageNum, verses, totalPages }: Props) {
  const router = useRouter()
  const [showTranslation, setShowTranslation] = useState(false)
  const [jumpInput, setJumpInput] = useState(String(pageNum))
  const [loading, setLoading] = useState(false)

  const juz = getJuzForPage(pageNum)
  const firstVerse = verses[0]

  // Navigation clavier
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const next = e.key === 'ArrowLeft' ? pageNum - 1 : pageNum + 1
        if (next >= 1 && next <= totalPages) router.push(`/mushaf/${next}`)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pageNum, totalPages, router])

  function handleJump(e: React.FormEvent) {
    e.preventDefault()
    const n = parseInt(jumpInput)
    if (!isNaN(n) && n >= 1 && n <= totalPages) router.push(`/mushaf/${n}`)
  }

  // Grouper les versets par sourate
  const surahGroups: Record<number, QdcVerse[]> = {}
  for (const v of verses) {
    const [s] = v.verse_key.split(':').map(Number)
    if (!surahGroups[s]) surahGroups[s] = []
    surahGroups[s].push(v)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Barre Mushaf */}
      <div className="sticky top-14 z-20 bg-[#0a0f1e]/95 backdrop-blur-sm border-b border-white/10 px-4 py-2.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          {/* Info page */}
          <div className="flex items-center gap-3">
            <Link href="/mushaf/1" className="text-slate-500 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </Link>
            <div>
              <span className="text-white text-sm font-medium">Page {pageNum}</span>
              <span className="text-slate-500 text-xs ml-2">Juz {juz}</span>
            </div>
          </div>

          {/* Jump to page */}
          <form onSubmit={handleJump} className="flex items-center gap-2">
            <input
              value={jumpInput}
              onChange={e => setJumpInput(e.target.value)}
              className="w-16 text-center bg-white/5 border border-white/15 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
            <button type="submit" className="text-xs text-slate-500 hover:text-emerald-400 transition-colors">Aller →</button>
          </form>

          {/* Toggle traduction */}
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showTranslation
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'
            }`}
          >
            🌍 Traduction
          </button>
        </div>
      </div>

      {/* Page Mushaf */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">

        {/* Cadre Mushaf */}
        <div className="relative bg-[#faf7f0] dark:bg-[#1a1208] rounded-2xl shadow-2xl shadow-black/50 border border-amber-900/20 overflow-hidden">
          {/* Ornement haut */}
          <div className="h-2 bg-gradient-to-r from-amber-800/20 via-amber-600/40 to-amber-800/20" />

          {/* Numéro de page haut */}
          <div className="text-center pt-3 pb-1">
            <span className="text-amber-800/50 dark:text-amber-600/30 text-xs font-arabic">{pageNum}</span>
          </div>

          {/* Contenu versets */}
          <div className="px-6 sm:px-10 py-4">
            {Object.entries(surahGroups).map(([surahId, surahVerses]) => (
              <div key={surahId} className="mb-4">
                {/* Header si début de sourate (verset 1) */}
                {surahVerses[0]?.verse_number === 1 && (
                  <div className="text-center my-6">
                    <div className="inline-block bg-amber-900/10 dark:bg-amber-700/10 border border-amber-700/20 rounded-xl px-8 py-3">
                      <p
                        className="arabic-text text-2xl text-amber-900 dark:text-amber-200 leading-loose"
                        dir="rtl"
                        lang="ar"
                      >
                        {/* Nom de la sourate — reconstruit depuis verse_key */}
                        سورة
                      </p>
                    </div>
                  </div>
                )}

                {/* Versets en flux continu (style Mushaf) */}
                <div className="text-right leading-[2.8] text-[1.35rem]" dir="rtl" lang="ar">
                  {surahVerses.map(verse => (
                    <span key={verse.verse_key} className="inline">
                      <Link
                        href={`/surah/${verse.verse_key.split(':')[0]}/${verse.verse_key.split(':')[1]}`}
                        className="group relative"
                      >
                        <span className="arabic-text text-amber-950 dark:text-white/90 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors cursor-pointer">
                          {getVerseText(verse)}
                        </span>
                        {/* Numéro verset */}
                        {' '}
                        <span className="inline-flex items-center justify-center w-6 h-6 text-[0.6rem] bg-amber-800/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-full mx-0.5 align-middle">
                          {verse.verse_number}
                        </span>
                        {' '}
                      </Link>

                      {/* Traduction sous chaque verset */}
                      {showTranslation && verse.translations?.[0] && (
                        <div className="text-left text-xs text-slate-500 dark:text-slate-400 my-1 leading-relaxed border-r-2 border-emerald-500/30 pr-3 mr-1" dir="ltr">
                          <span className="text-emerald-600/70 text-[10px] font-mono mr-1">{verse.verse_key}</span>
                          {verse.translations[0].text.replace(/<[^>]+>/g, '').trim()}
                        </div>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Numéro de page bas */}
          <div className="text-center pb-3 pt-1">
            <span className="text-amber-800/50 dark:text-amber-600/30 text-xs">{pageNum}</span>
          </div>

          {/* Ornement bas */}
          <div className="h-2 bg-gradient-to-r from-amber-800/20 via-amber-600/40 to-amber-800/20" />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 px-2">
          {/* Page précédente */}
          {pageNum > 1 ? (
            <Link
              href={`/mushaf/${pageNum - 1}`}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Page {pageNum - 1}
            </Link>
          ) : <div />}

          {/* Barre de progression */}
          <div className="flex-1 mx-6">
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${(pageNum / totalPages) * 100}%` }}
              />
            </div>
            <p className="text-center text-xs text-slate-600 mt-1.5">{pageNum} / {totalPages}</p>
          </div>

          {/* Page suivante */}
          {pageNum < totalPages ? (
            <Link
              href={`/mushaf/${pageNum + 1}`}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-colors text-sm"
            >
              Page {pageNum + 1}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : <div />}
        </div>

        {/* Navigation Juz rapide */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-xs text-slate-500 mb-3 text-center">Navigation par Juz</p>
          <div className="grid grid-cols-10 sm:grid-cols-15 gap-1">
            {Array.from({ length: 30 }, (_, i) => i + 1).map(j => {
              const p = JUZ_PAGES[j]
              const isActive = j === juz
              return (
                <Link
                  key={j}
                  href={`/mushaf/${p}`}
                  className={`flex items-center justify-center h-8 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                      : 'bg-white/4 text-slate-500 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {j}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
