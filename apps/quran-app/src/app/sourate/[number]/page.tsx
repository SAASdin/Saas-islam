// ============================================================
// sourate/[number]/page.tsx — Page d'une sourate (route française)
// Rendu dynamique — évite le pré-rendu statique (rate limit API)
// ⚠️  RÈGLES ABSOLUES :
//   - Bismillah affiché SAUF sourate 9 (At-Tawbah)
//   - dir="rtl" lang="ar" sur TOUT texte arabe
//   - Texte arabe : JAMAIS modifier (READ ONLY)
// ============================================================

import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getSurahWithAyahs, getSurahTranslationFr, getAllSurahs } from '@/lib/api/quran'
import Basmala from '@/components/quran/Basmala'
import SurahHeader from '@/components/quran/SurahHeader'
import AyahCard from '@/components/quran/AyahCard'
import Navigation from '@/components/Navigation'

// Rendu dynamique — évite le pré-rendu statique (rate limit API en CI/build)
export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ number: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { number } = await params
  const surahId = parseInt(number, 10)
  if (isNaN(surahId) || surahId < 1 || surahId > 114) return {}

  try {
    const surahs = await getAllSurahs()
    const surah = surahs.find(s => s.id === surahId)
    if (!surah) return {}
    return {
      title: `Sourate ${surah.nameTransliteration} — ${surah.nameFrench}`,
      description: `Lisez la sourate ${surah.nameTransliteration} (${surah.nameFrench}) — ${surah.ayahCount} versets — ${surah.revelationType}`,
    }
  } catch {
    return {}
  }
}

export default async function SouratePage({ params }: Props) {
  const { number } = await params
  const surahId = parseInt(number, 10)

  if (isNaN(surahId) || surahId < 1 || surahId > 114) {
    notFound()
  }

  // Récupération des données
  const [surahData, translationsFr, allSurahs] = await Promise.allSettled([
    getSurahWithAyahs(surahId),
    getSurahTranslationFr(surahId),
    getAllSurahs(),
  ])

  if (surahData.status === 'rejected') {
    notFound()
  }

  const { surah, ayahs } = surahData.value
  const translations = translationsFr.status === 'fulfilled' ? translationsFr.value : []
  const surahs = allSurahs.status === 'fulfilled' ? allSurahs.value : []

  // Sourates précédente / suivante pour la navigation
  const prevSurah = surahId > 1 ? surahs.find(s => s.id === surahId - 1) : null
  const nextSurah = surahId < 114 ? surahs.find(s => s.id === surahId + 1) : null

  return (
    <>
      <Navigation />
      <main className="min-h-screen" style={{ background: '#0a0f1e' }}>
        <div className="max-w-3xl mx-auto px-4 py-8">

          {/* En-tête de la sourate */}
          <SurahHeader surah={surah} />

          {/* Bismillah ⚠️ Sauf At-Tawbah (sourate 9) */}
          <Basmala show={surah.hasBismillah} size="lg" />

          {/* Versets */}
          <section aria-label={`Versets de la sourate ${surah.nameTransliteration}`}>
            {ayahs.map((ayah, index) => {
              // ⚠️ textUthmani affiché tel quel — READ ONLY
              const translationFr = translations[index] ?? ''

              return (
                <AyahCard
                  key={ayah.id}
                  surahName={surah.nameTransliteration}
                  surahNumber={surahId}
                  ayahNumber={ayah.ayahNumber}
                  textArabic={ayah.textUthmani}       // ⚠️ SACRÉ — READ ONLY
                  translationFr={translationFr}
                />
              )
            })}
          </section>

          {/* Navigation précédente / suivante */}
          <nav
            className="flex items-center justify-between mt-10 pt-6"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
            aria-label="Navigation entre sourates"
          >
            {prevSurah ? (
              <Link
                href={`/sourate/${prevSurah.id}`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors"
                style={{ color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                ← {prevSurah.nameTransliteration}
              </Link>
            ) : <div />}

            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Toutes les sourates
            </Link>

            {nextSurah ? (
              <Link
                href={`/sourate/${nextSurah.id}`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors"
                style={{ color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {nextSurah.nameTransliteration} →
              </Link>
            ) : <div />}
          </nav>

        </div>
      </main>
    </>
  )
}
