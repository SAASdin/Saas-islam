// ============================================================
// surah/[id]/page.tsx — Page lecteur d'une sourate
// ⚠️  RÈGLES ABSOLUES :
//   - Bismillah affiché SAUF pour At-Tawbah (sourate 9)
//   - Texte arabe : dir="rtl" lang="ar" OBLIGATOIRES
//   - Référence toujours visible (NomSourate NumSourate:NumVerset)
//   - Traduction Hamidullah (validée) — jamais de trad auto ici
// ============================================================

import { getSurahWithAyahs, getSurahTranslationFr } from '@/lib/quran-api'
import AyahDisplay from '@/components/quran/AyahDisplay'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { AyahWithTranslation } from '@/types/quran'

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

// Pré-générer les 114 sourates au build
export async function generateStaticParams() {
  return Array.from({ length: 114 }, (_, i) => ({ id: String(i + 1) }))
}

export const revalidate = 86400 // 24h

export default async function SurahPage({ params }: Props) {
  const { id } = await params
  const surahId = parseInt(id)

  if (isNaN(surahId) || surahId < 1 || surahId > 114) {
    notFound()
  }

  // Récupération parallèle : texte + traduction
  const [{ surah, ayahs }, translationsFr] = await Promise.all([
    getSurahWithAyahs(surahId),
    getSurahTranslationFr(surahId),
  ])

  // Construire les versets avec traduction
  const ayahsWithTranslation: AyahWithTranslation[] = ayahs.map((ayah, index) => ({
    ...ayah,
    surah: {
      nameArabic: surah.nameArabic,
      nameTransliteration: surah.nameTransliteration,
      nameFrench: surah.nameFrench,
    },
  }))

  return (
    <main className="min-h-screen bg-cream-50 dark:bg-gray-900">

      {/* ── Navigation ──────────────────────────────────────── */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link
            href="/"
            className="text-islam-600 dark:text-islam-400 hover:text-islam-700 text-sm flex items-center gap-1"
            aria-label="Retour à la liste des sourates"
          >
            ← Retour
          </Link>

          <div className="flex-1 text-center">
            <h1 className="font-bold text-gray-900 dark:text-gray-100">
              {surah.nameTransliteration}
            </h1>
            <p className="text-xs text-gray-500">
              Sourate {surahId} · {surah.ayahCount} versets · {surah.revelationType}
            </p>
          </div>

          {/* Nom arabe dans la nav — SACRÉ */}
          <div
            dir="rtl"
            lang="ar"
            className="quran-text text-lg text-islam-700 dark:text-islam-400 flex-shrink-0"
            aria-label={surah.nameArabic}
          >
            {surah.nameArabic}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* ── Bismillah ────────────────────────────────────── */}
        {/*
          ⚠️  RÈGLE ABSOLUE :
          Bismillah affiché UNIQUEMENT si hasBismillah = true
          La sourate 9 (At-Tawbah) N'a PAS de Bismillah
        */}
        {surah.hasBismillah && (
          <div className="text-center mb-8 py-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
            <p
              dir="rtl"
              lang="ar"
              className="bismillah"
              aria-label="Bismillahi Ar-Rahmani Ar-Raheem"
            >
              {/* ⚠️ Texte sacré — copié tel quel, jamais modifié */}
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Au nom d&apos;Allah, le Tout Miséricordieux, le Très Miséricordieux
            </p>
          </div>
        )}

        {/* Mention spéciale At-Tawbah */}
        {!surah.hasBismillah && (
          <div className="mb-6 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-800 dark:text-amber-300 text-center">
            ℹ️ La sourate At-Tawbah (9) ne commence pas par la Bismillah
          </div>
        )}

        {/* ── Versets ─────────────────────────────────────── */}
        <section
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm px-6"
          aria-label={`Versets de la sourate ${surah.nameTransliteration}`}
        >
          {ayahsWithTranslation.map((ayah, index) => (
            <AyahDisplay
              key={ayah.id}
              ayah={ayah}
              translationFr={translationsFr[index]}
              isAutoTranslation={false} // Hamidullah = traduction validée
              fontSize={1.5}
            />
          ))}
        </section>

        {/* ── Source ──────────────────────────────────────── */}
        <footer className="mt-8 text-center text-xs text-gray-400 dark:text-gray-600 space-y-1">
          <p>Texte coranique : Mushaf Uthmani · Hafs ʿan ʿĀṣim · Source : api.alquran.cloud</p>
          <p>Traduction : Muhammad Hamidullah (fr.hamidullah)</p>
        </footer>

        {/* ── Navigation entre sourates ────────────────────── */}
        <nav className="mt-6 flex justify-between" aria-label="Navigation entre sourates">
          {surahId > 1 && (
            <Link
              href={`/surah/${surahId - 1}`}
              className="px-4 py-2 bg-islam-50 dark:bg-islam-900/30 text-islam-700 dark:text-islam-400 rounded-lg hover:bg-islam-100 transition-colors text-sm"
            >
              ← Sourate {surahId - 1}
            </Link>
          )}
          {surahId < 114 && (
            <Link
              href={`/surah/${surahId + 1}`}
              className="px-4 py-2 bg-islam-50 dark:bg-islam-900/30 text-islam-700 dark:text-islam-400 rounded-lg hover:bg-islam-100 transition-colors text-sm ml-auto"
            >
              Sourate {surahId + 1} →
            </Link>
          )}
        </nav>
      </div>
    </main>
  )
}
