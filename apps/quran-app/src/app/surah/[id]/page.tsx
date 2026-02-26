// ============================================================
// surah/[id]/page.tsx — Lecteur sourate premium dark
// ⚠️  RÈGLES ABSOLUES :
//   - Bismillah affiché SAUF pour At-Tawbah (sourate 9)
//   - Texte arabe : dir="rtl" lang="ar" OBLIGATOIRES
//   - Référence toujours visible (NomSourate NumSourate:NumVerset)
//   - Traduction Hamidullah (validée) — jamais de trad auto ici
// ============================================================

import { getSurahWithAyahs, getSurahTranslationFr } from '@/lib/quran-api'
import AyahDisplay from '@/components/quran/AyahDisplay'
import Navigation from '@/components/Navigation'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { AyahWithTranslation } from '@/types/quran'

// Rendu dynamique — évite le pré-rendu statique qui sature l'API externe en CI/build
export const dynamic = 'force-dynamic'
interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const surahId = parseInt(id)
  if (isNaN(surahId) || surahId < 1 || surahId > 114) return {}

  const { surah } = await getSurahWithAyahs(surahId)
  return {
    title: `${surah.nameTransliteration} — Sourate ${surahId}`,
    description: `${surah.nameTransliteration} (${surah.nameArabic}) — ${surah.ayahCount} versets · ${surah.revelationType}`,
  }
}

export async function generateStaticParams() {
  return Array.from({ length: 114 }, (_, i) => ({ id: String(i + 1) }))
}

export const revalidate = 86400

export default async function SurahPage({ params }: Props) {
  const { id } = await params
  const surahId = parseInt(id)

  if (isNaN(surahId) || surahId < 1 || surahId > 114) {
    notFound()
  }

  const [{ surah, ayahs }, translationsFr] = await Promise.all([
    getSurahWithAyahs(surahId),
    getSurahTranslationFr(surahId),
  ])

  const ayahsWithTranslation: AyahWithTranslation[] = ayahs.map((ayah) => ({
    ...ayah,
    surah: {
      nameArabic: surah.nameArabic,
      nameTransliteration: surah.nameTransliteration,
      nameFrench: surah.nameFrench,
    },
  }))

  const isMeccan = surah.revelationType === 'mecquoise'

  return (
    <div className="min-h-screen pb-24" style={{ background: '#0a0f1e' }}>
      {/* Navigation */}
      <Navigation />

      {/* ── En-tête Sourate ────────────────────────────── */}
      <div
        className="relative overflow-hidden py-12 px-4"
        style={{
          background: 'linear-gradient(135deg, #0d1a2e 0%, #0a1a0e 50%, #0d1a2e 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Motif géométrique */}
        <div className="absolute inset-0 islamic-pattern opacity-50 pointer-events-none" aria-hidden="true" />

        <div className="relative max-w-3xl mx-auto text-center">
          {/* Nom arabe — SACRÉ */}
          <div
            dir="rtl"
            lang="ar"
            className="text-5xl md:text-6xl mb-4"
            style={{
              fontFamily: 'var(--font-amiri)',
              color: '#d4af37',
              lineHeight: '1.5',
              textShadow: '0 0 40px rgba(212,175,55,0.3)',
            }}
            aria-label={surah.nameArabic}
          >
            {/* ⚠️ Texte sacré */}
            {surah.nameArabic}
          </div>

          <h1 className="text-2xl font-bold text-slate-100 mb-2">
            {surah.nameTransliteration}
          </h1>

          <div className="flex items-center justify-center gap-3 text-sm">
            <span
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background: isMeccan ? 'rgba(21,128,61,0.15)' : 'rgba(59,130,246,0.15)',
                color: isMeccan ? '#22c55e' : '#60a5fa',
                border: `1px solid ${isMeccan ? 'rgba(21,128,61,0.3)' : 'rgba(59,130,246,0.3)'}`,
              }}
            >
              {surah.revelationType}
            </span>
            <span className="text-slate-500">Sourate {surahId}</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-500">{surah.ayahCount} versets</span>
          </div>

          {/* Navigation prev/next */}
          <div className="flex items-center justify-center gap-4 mt-6">
            {surahId > 1 && (
              <Link
                href={`/surah/${surahId - 1}`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#94a3b8',
                }}
              >
                ← Sourate {surahId - 1}
              </Link>
            )}
            <Link
              href="/"
              className="px-4 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              ☰ Liste
            </Link>
            {surahId < 114 && (
              <Link
                href={`/surah/${surahId + 1}`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#94a3b8',
                }}
              >
                Sourate {surahId + 1} →
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* ── Bismillah ────────────────────────────────────── */}
        {/*
          ⚠️  RÈGLE ABSOLUE :
          Bismillah affiché UNIQUEMENT si hasBismillah = true
          La sourate 9 (At-Tawbah) N'a PAS de Bismillah
        */}
        {surah.hasBismillah && (
          <div
            className="text-center mb-10 py-8 rounded-2xl animate-fade-in-scale"
            style={{
              background: 'linear-gradient(135deg, rgba(212,175,55,0.06) 0%, rgba(21,128,61,0.06) 100%)',
              border: '1px solid rgba(212,175,55,0.15)',
            }}
          >
            <p
              dir="rtl"
              lang="ar"
              className="bismillah text-4xl md:text-5xl"
              aria-label="Bismillahi Ar-Rahmani Ar-Raheem"
            >
              {/* ⚠️ Texte sacré — copié tel quel, jamais modifié */}
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            <p className="text-sm text-slate-500 mt-3">
              Au nom d&apos;Allah, le Tout Miséricordieux, le Très Miséricordieux
            </p>
          </div>
        )}

        {/* Mention spéciale At-Tawbah */}
        {!surah.hasBismillah && (
          <div
            className="mb-8 p-4 rounded-xl text-sm text-center animate-fade-in"
            style={{
              background: 'rgba(251,191,36,0.05)',
              border: '1px solid rgba(251,191,36,0.15)',
              color: '#fbbf24',
            }}
          >
            ℹ️ La sourate At-Tawbah (9) ne commence pas par la Bismillah
          </div>
        )}

        {/* ── Versets ─────────────────────────────────────── */}
        <section
          className="rounded-2xl px-4 md:px-8 py-2"
          style={{
            background: 'rgba(17,24,39,0.6)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
          aria-label={`Versets de la sourate ${surah.nameTransliteration}`}
        >
          {ayahsWithTranslation.map((ayah, index) => (
            <AyahDisplay
              key={ayah.id}
              ayah={ayah}
              translationFr={translationsFr[index]}
              isAutoTranslation={false}
              fontSize={1.8}
            />
          ))}
        </section>

        {/* ── Source ──────────────────────────────────────── */}
        <footer className="mt-10 text-center text-xs text-slate-600 space-y-1">
          <p>Texte coranique : Mushaf Uthmani · Hafs ʿan ʿĀṣim · Source : api.alquran.cloud</p>
          <p>Traduction : Muhammad Hamidullah (fr.hamidullah)</p>
        </footer>

        {/* ── Navigation bas de page ────────────────────── */}
        <nav className="mt-8 flex items-center justify-between gap-4" aria-label="Navigation entre sourates">
          {surahId > 1 ? (
            <Link
              href={`/surah/${surahId - 1}`}
              className="flex-1 text-center px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#94a3b8',
              }}
            >
              ← Sourate {surahId - 1}
            </Link>
          ) : <span />}

          {surahId < 114 ? (
            <Link
              href={`/surah/${surahId + 1}`}
              className="flex-1 text-center px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#94a3b8',
              }}
            >
              Sourate {surahId + 1} →
            </Link>
          ) : <span />}
        </nav>
      </div>
    </div>
  )
}
