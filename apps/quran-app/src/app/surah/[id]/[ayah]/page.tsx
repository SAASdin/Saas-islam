export const dynamic = 'force-dynamic'
// ============================================================
// /surah/[id]/[ayah] — Page verset individuel
// ============================================================
import { getVerse, getChapter, TRANSLATIONS } from '@/lib/quran-cdn-api'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import AyahCardV2 from '@/components/quran/v2/AyahCardV2'
import type { Metadata } from 'next'

interface Props { params: Promise<{ id: string; ayah: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, ayah } = await params
  const s = parseInt(id); const a = parseInt(ayah)
  if (isNaN(s) || isNaN(a)) return {}
  try {
    const { chapter } = await getChapter(s)
    return {
      title: `${chapter.name_simple} ${s}:${a}`,
      description: `Verset ${s}:${a} — ${chapter.name_simple} (${chapter.name_arabic})`,
    }
  } catch { return {} }
}

export default async function VersePage({ params }: Props) {
  const { id, ayah } = await params
  const surahNum = parseInt(id)
  const ayahNum = parseInt(ayah)

  if (isNaN(surahNum) || isNaN(ayahNum) || surahNum < 1 || surahNum > 114) notFound()

  const verseKey = `${surahNum}:${ayahNum}`

  const [{ verse }, { chapter }] = await Promise.all([
    getVerse(verseKey, { translations: [TRANSLATIONS.hamidullah_fr, TRANSLATIONS.saheeh_en] }),
    getChapter(surahNum),
  ])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
        <span>›</span>
        <Link href={`/surah/${surahNum}`} className="hover:text-white transition-colors"
          dir="rtl" lang="ar">
          {chapter.name_arabic}
        </Link>
        <span>›</span>
        <span className="text-slate-300">Verset {ayahNum}</span>
      </nav>

      {/* Infos sourate */}
      <div className="bg-white/3 border border-white/10 rounded-xl p-4 mb-6 flex items-center gap-4">
        <div>
          <p className="text-white font-semibold">{chapter.name_simple}</p>
          <p className="text-slate-400 text-sm">{chapter.translated_name.name} · Verset {ayahNum}/{chapter.verses_count}</p>
        </div>
        <Link href={`/surah/${surahNum}`}
          className="ml-auto text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
          Voir la sourate →
        </Link>
      </div>

      {/* Carte verset */}
      <div className="bg-white/3 border border-white/10 rounded-2xl overflow-hidden">
        <AyahCardV2
          verseKey={verseKey}
          textUthmani={verse.words ? verse.words.map(w => w.text_uthmani).join(' ') : ''}
          translations={verse.translations}
          words={verse.words}
          surahName={chapter.name_simple}
          surahId={surahNum}
          ayahCount={chapter.verses_count}
          fontSize={32}
        />
      </div>

      {/* Navigation versets */}
      <div className="flex items-center justify-between mt-6">
        {ayahNum > 1 ? (
          <Link href={`/surah/${surahNum}/${ayahNum - 1}`}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-slate-300 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Verset {ayahNum - 1}
          </Link>
        ) : <div />}

        {ayahNum < chapter.verses_count ? (
          <Link href={`/surah/${surahNum}/${ayahNum + 1}`}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm text-white transition-colors">
            Verset {ayahNum + 1}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ) : <div />}
      </div>
    </div>
  )
}
