// ============================================================
// hadiths/page.tsx — Collections Hadiths — Design premium dark
// ⚠️  nameArabic : SACRÉ — dir="rtl" lang="ar" OBLIGATOIRES
// ============================================================

import Link from 'next/link'
import { HADITH_COLLECTIONS } from '@/lib/hadith-api'
import Navigation from '@/components/Navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hadiths — Collections',
  description: 'Consultez les grandes collections de hadiths : Bukhari, Muslim, Abu Dawud et plus',
}

export const revalidate = 86400

const COLLECTION_ACCENTS: Record<string, { color: string; icon: string }> = {
  bukhari:          { color: '#22c55e', icon: '📗' },
  muslim:           { color: '#60a5fa', icon: '📘' },
  'abu-dawud':      { color: '#fb923c', icon: '📙' },
  tirmidzi:         { color: '#f87171', icon: '📕' },
  nasai:            { color: '#fbbf24', icon: '📒' },
  'ibnu-majah':     { color: '#a78bfa', icon: '📓' },
  malik:            { color: '#34d399', icon: '📔' },
  riyadhussalihin:  { color: '#86efac', icon: '🌿' },
}

export default function HadithsPage() {
  const totalHadiths = HADITH_COLLECTIONS.reduce((s, c) => s + c.totalHadiths, 0)

  return (
    <div className="min-h-screen" style={{ background: '#0a0f1e' }}>
      <Navigation />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-14 px-4"
        style={{
          background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1a2e 50%, #0a0f1e 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="absolute inset-0 islamic-star-pattern opacity-60 pointer-events-none" aria-hidden="true" />

        <div className="relative max-w-3xl mx-auto text-center">
          <p
            dir="rtl"
            lang="ar"
            className="text-3xl md:text-4xl mb-4"
            style={{
              fontFamily: 'var(--font-amiri)',
              color: '#d4af37',
              lineHeight: '1.8',
              textShadow: '0 0 30px rgba(212,175,55,0.3)',
            }}
            aria-label="Al-Ahadith An-Nabawiyya"
          >
            {/* ⚠️ Texte sacré — affiché tel quel */}
            الأحاديث النبوية الشريفة
          </p>

          <h1
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{
              background: 'linear-gradient(135deg, #f1f5f9 0%, #d4af37 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Hadiths du Prophète ﷺ
          </h1>

          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: '#d4af37' }}>
                {HADITH_COLLECTIONS.length}
              </p>
              <p className="text-slate-500 text-xs">Collections</p>
            </div>
            <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>
                {totalHadiths.toLocaleString('fr-FR')}
              </p>
              <p className="text-slate-500 text-xs">Hadiths</p>
            </div>
          </div>

          {/* Note sur la fiabilité */}
          <div
            className="mt-6 inline-flex items-center gap-2 text-xs px-4 py-2 rounded-xl"
            style={{
              background: 'rgba(251,191,36,0.05)',
              border: '1px solid rgba(251,191,36,0.15)',
              color: '#fbbf24',
            }}
          >
            <span>ℹ️</span>
            <span>
              Textes reproduits sans modification. Pour le fiqh, consultez un savant qualifié.
            </span>
          </div>
        </div>
      </section>

      {/* ── Grille des collections ─────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 py-12" aria-label="Collections de hadiths">
        <div className="grid gap-4">
          {HADITH_COLLECTIONS.map((collection, index) => {
            const accent = COLLECTION_ACCENTS[collection.id] ?? { color: '#94a3b8', icon: '📚' }

            return (
              <Link
                key={collection.id}
                href={`/hadiths/${collection.id}`}
                className="group flex items-center gap-5 p-5 rounded-2xl transition-all duration-300 animate-fade-in"
                style={{
                  background: 'rgba(17,24,39,0.7)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  animationDelay: `${index * 50}ms`,
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = `${accent.color}30`
                  el.style.background = `rgba(17,24,39,0.9)`
                  el.style.transform = 'translateX(4px)'
                  el.style.boxShadow = `0 4px 20px rgba(0,0,0,0.3), -3px 0 0 ${accent.color}`
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = 'rgba(255,255,255,0.06)'
                  el.style.background = 'rgba(17,24,39,0.7)'
                  el.style.transform = ''
                  el.style.boxShadow = ''
                }}
                aria-label={`Ouvrir la collection ${collection.name}`}
              >
                {/* Icône */}
                <span className="text-3xl flex-shrink-0">{accent.icon}</span>

                {/* Infos principales */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-100 group-hover:text-white transition-colors">
                    {collection.name}
                  </p>
                  <p className="text-sm text-slate-500 mt-0.5">{collection.nameFr}</p>
                  <p
                    className="text-xs mt-1.5 font-medium"
                    style={{ color: accent.color }}
                  >
                    {collection.totalHadiths.toLocaleString('fr-FR')} hadiths
                  </p>
                </div>

                {/* Nom arabe — ⚠️ SACRÉ */}
                <div
                  dir="rtl"
                  lang="ar"
                  className="flex-shrink-0 text-right hidden sm:block"
                  style={{
                    fontFamily: 'var(--font-amiri)',
                    fontSize: '1.2rem',
                    lineHeight: '2',
                    color: accent.color,
                    opacity: 0.8,
                  }}
                  aria-label={`Nom arabe : ${collection.nameArabic}`}
                >
                  {/* ⚠️ Affiché tel quel — JAMAIS transformer */}
                  {collection.nameArabic}
                </div>

                {/* Flèche */}
                <svg
                  className="w-5 h-5 flex-shrink-0 text-slate-600 group-hover:text-slate-300 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="text-center py-8 text-xs text-slate-600">
        <p>Source hadiths : api.hadith.gading.dev · Données en lecture seule</p>
        <p className="mt-1 text-green-700">بارك الله فيكم</p>
      </footer>
    </div>
  )
}
