'use client'
// ============================================================
// SurahHeader.tsx — En-tête d'une sourate
// Affiche : nom arabe, translittération, traduction, métadonnées
// ============================================================

import type { Surah } from '@/types/quran'

interface SurahHeaderProps {
  surah: Surah
  className?: string
}

const REVELATION_BADGE: Record<string, { label: string; color: string }> = {
  mecquoise:   { label: 'Mecquoise', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  médinoise:   { label: 'Médinoise', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
}

export default function SurahHeader({ surah, className = '' }: SurahHeaderProps) {
  const badge = REVELATION_BADGE[surah.revelationType] ?? REVELATION_BADGE['mecquoise']

  return (
    <header
      className={`rounded-2xl p-8 mb-8 text-center ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(21,128,61,0.1) 0%, rgba(10,15,30,0.95) 60%, rgba(212,175,55,0.08) 100%)',
        border: '1px solid rgba(212,175,55,0.2)',
        boxShadow: '0 0 60px rgba(21,128,61,0.06)',
      }}
    >
      {/* Numéro de sourate */}
      <div
        className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-5 text-lg font-bold"
        style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', color: '#d4af37' }}
      >
        {surah.id}
      </div>

      {/* Nom arabe ⚠️ SACRÉ */}
      <h1
        dir="rtl"
        lang="ar"
        className="quran-text text-5xl leading-loose mb-3"
        style={{ fontFamily: 'var(--font-kfgqpc, var(--font-amiri))', color: '#f1f5f9' }}
      >
        {/* ⚠️ Texte arabe — READ ONLY */}
        سورة {surah.nameArabic}
      </h1>

      {/* Translittération */}
      <p className="text-2xl font-semibold text-slate-200 mb-1">
        {surah.nameTransliteration}
      </p>

      {/* Traduction française */}
      <p className="text-base text-slate-400 mb-5">
        {surah.nameFrench}
      </p>

      {/* Métadonnées */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {/* Badge révélation */}
        <span className={`px-3 py-1 rounded-full text-xs border ${badge.color}`}>
          {badge.label}
        </span>

        {/* Nombre de versets */}
        <span
          className="px-3 py-1 rounded-full text-xs"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}
        >
          {surah.ayahCount} versets
        </span>

        {/* Juz */}
        <span
          className="px-3 py-1 rounded-full text-xs"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}
        >
          Juz {surah.juzStart}
        </span>

        {/* Page Mushaf */}
        <span
          className="px-3 py-1 rounded-full text-xs"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}
        >
          Page {surah.pageMushaf}
        </span>
      </div>
    </header>
  )
}
