// ============================================================
// SurahHeader.tsx — En-tête sourate (identique Quran.com)
// ============================================================
import type { QdcChapter } from '@/lib/quran-cdn-api'
import Link from 'next/link'

interface SurahHeaderProps {
  chapter: QdcChapter
  showNav?: boolean
}

export default function SurahHeader({ chapter, showNav = true }: SurahHeaderProps) {
  const revType = chapter.revelation_place === 'makkah' ? 'Mecquoise' : 'Médinoise'
  const juzStart = 1 // sera complété depuis DB

  return (
    <div className="text-center py-8 px-4 border-b border-white/10">
      {/* Numéro sourate */}
      <p className="text-slate-500 text-sm font-mono mb-3">
        {String(chapter.id).padStart(3, '0')}
      </p>

      {/* Nom arabe — calligraphie */}
      <h1
        className="quran-text text-5xl md:text-6xl text-amber-100 mb-3 leading-none"
        dir="rtl"
        lang="ar"
      >
        {chapter.name_arabic}
      </h1>

      {/* Nom translitération + traduction */}
      <p className="text-xl font-semibold text-white mb-1">{chapter.name_simple}</p>
      <p className="text-slate-400 text-sm mb-4">{chapter.translated_name.name}</p>

      {/* Badges infos */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
          chapter.revelation_place === 'makkah'
            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
        }`}>
          {revType}
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-slate-300 border border-white/10">
          {chapter.verses_count} versets
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-slate-300 border border-white/10">
          Pages {chapter.pages[0]}–{chapter.pages[1]}
        </span>
      </div>

      {/* Liens rapides sciences + mushaf */}
      <div className="flex items-center justify-center gap-2 flex-wrap mt-4">
        <Link href={`/ulum/${chapter.id}`}
          className="px-3 py-1.5 bg-white/4 hover:bg-white/10 border border-white/10 rounded-full text-xs text-slate-400 hover:text-white transition-colors">
          📚 &lsquo;Ulum
        </Link>
        <Link href={`/mushaf/${chapter.pages[0]}`}
          className="px-3 py-1.5 bg-white/4 hover:bg-white/10 border border-white/10 rounded-full text-xs text-slate-400 hover:text-white transition-colors">
          🕌 Mushaf p.{chapter.pages[0]}
        </Link>
        <Link href={`/ma3ajim`}
          className="px-3 py-1.5 bg-white/4 hover:bg-white/10 border border-white/10 rounded-full text-xs text-slate-400 hover:text-white transition-colors">
          🔍 Maʿājim
        </Link>
      </div>

      {/* Navigation prev/next */}
      {showNav && (
        <div className="flex items-center justify-center gap-6 mt-6">
          {chapter.id > 1 && (
            <Link
              href={`/surah/${chapter.id - 1}`}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-emerald-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Sourate {chapter.id - 1}
            </Link>
          )}
          {chapter.id < 114 && (
            <Link
              href={`/surah/${chapter.id + 1}`}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-emerald-400 transition-colors"
            >
              Sourate {chapter.id + 1}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
