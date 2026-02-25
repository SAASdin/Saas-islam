'use client'
// ============================================================
// SurahCard.tsx — Carte d'une sourate — Design premium dark
// ⚠️  nameArabic est SACRÉ — affiché tel quel, aucune transformation
// ============================================================

import Link from 'next/link'
import type { Surah } from '@/types/quran'

interface SurahCardProps {
  surah: Surah
}

export default function SurahCard({ surah }: SurahCardProps) {
  const isMeccan = surah.revelationType === 'mecquoise'

  return (
    <Link
      href={`/surah/${surah.id}`}
      className="
        group flex items-center gap-4 p-4
        rounded-xl
        transition-all duration-300
        animate-fade-in
      "
      style={{
        background: 'linear-gradient(135deg, rgba(26,34,53,0.7) 0%, rgba(17,24,39,0.8) 100%)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'rgba(212,175,55,0.25)'
        el.style.transform = 'translateY(-1px)'
        el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(212,175,55,0.08)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'rgba(255,255,255,0.06)'
        el.style.transform = ''
        el.style.boxShadow = ''
      }}
    >
      {/* Numéro de sourate — badge circulaire */}
      <div
        className="flex items-center justify-center w-11 h-11 rounded-full flex-shrink-0 text-sm font-bold transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(21,128,61,0.15) 100%)',
          border: '1px solid rgba(212,175,55,0.2)',
          color: '#d4af37',
        }}
      >
        {surah.id}
      </div>

      {/* Infos gauche — translittération + métadonnées */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-100 group-hover:text-amber-400 transition-colors truncate">
          {surah.nameTransliteration}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {/* Badge Mecquoise/Médinoise */}
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              background: isMeccan
                ? 'rgba(21,128,61,0.15)'
                : 'rgba(59,130,246,0.15)',
              color: isMeccan ? '#22c55e' : '#60a5fa',
              border: `1px solid ${isMeccan ? 'rgba(21,128,61,0.3)' : 'rgba(59,130,246,0.3)'}`,
            }}
          >
            {isMeccan ? 'Mecquoise' : 'Médinoise'}
          </span>
          <span className="text-xs text-slate-500">
            {surah.ayahCount} versets
          </span>
        </div>
      </div>

      {/* Nom arabe — ⚠️ SACRÉ, RTL obligatoire */}
      <div
        dir="rtl"
        lang="ar"
        className="flex-shrink-0 text-xl group-hover:text-amber-300 transition-colors"
        style={{
          fontFamily: 'var(--font-amiri)',
          color: '#f1f5f9',
          lineHeight: '1.5',
        }}
        aria-label={`Nom arabe : ${surah.nameArabic}`}
      >
        {/* ⚠️ Affiché tel quel — JAMAIS transformer ce texte */}
        {surah.nameArabic}
      </div>
    </Link>
  )
}
