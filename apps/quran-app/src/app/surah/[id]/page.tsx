// ============================================================
// /surah/[id] — Page sourate complète
// Source données : API QuranCDN (données immuables)
// ============================================================
// Rendu dynamique — évite le pré-rendu statique qui sature l'API externe en CI/build
export const dynamic = 'force-dynamic'

import { getChapter, getVersesByChapter, TRANSLATIONS } from '@/lib/quran-cdn-api'
import SurahPageClient from '@/components/quran/v2/SurahPageClient'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const num = parseInt(id)
  if (isNaN(num) || num < 1 || num > 114) return {}
  try {
    const { chapter } = await getChapter(num)
    return {
      title: `Sourate ${chapter.name_simple} — ${chapter.translated_name.name}`,
      description: `Lisez et écoutez la Sourate ${chapter.name_simple} (${chapter.name_arabic}) — ${chapter.verses_count} versets. Traduction Hamidullah.`,
    }
  } catch {
    return {}
  }
}

export default async function SurahPage({ params }: Props) {
  const { id } = await params
  const num = parseInt(id)

  if (isNaN(num) || num < 1 || num > 114) notFound()

  const [{ chapter }, { verses }] = await Promise.all([
    getChapter(num),
    getVersesByChapter(num, {
      // Charger toutes les traductions FR + EN par défaut
      translations: [
        TRANSLATIONS.hamidullah_fr,  // 31 - Hamidullah FR
        TRANSLATIONS.montada_fr,     // 136 - Montada FR
        TRANSLATIONS.rashid_fr,      // 779 - Rashid Maash FR
        TRANSLATIONS.saheeh_en,      // 20 - Saheeh International EN
        TRANSLATIONS.haleem_en,      // 85 - Abdel Haleem EN
        TRANSLATIONS.usmani_en,      // 84 - T. Usmani EN
      ],
      words: true,
      audioId: 7,
    }),
  ])

  return <SurahPageClient chapter={chapter} verses={verses} />
}
