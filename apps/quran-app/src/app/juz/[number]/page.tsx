export const dynamic = 'force-dynamic'
import { getVersesByJuz, TRANSLATIONS } from '@/lib/quran-cdn-api'
import { notFound } from 'next/navigation'
import AyahCardV2 from '@/components/quran/v2/AyahCardV2'
import type { Metadata } from 'next'

interface Props { params: Promise<{ number: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { number } = await params
  const n = parseInt(number)
  if (isNaN(n) || n < 1 || n > 30) return {}
  return {
    title: `Juz ${n} — Coran`,
    description: `Lisez le Juz ${n} du Saint Coran avec traduction française de Hamidullah.`,
  }
}

export default async function JuzPage({ params }: Props) {
  const { number } = await params
  const juzNum = parseInt(number)
  if (isNaN(juzNum) || juzNum < 1 || juzNum > 30) notFound()

  const { verses, pagination } = await getVersesByJuz(juzNum, {
    translations: [TRANSLATIONS.hamidullah_fr],
  })

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center py-10 px-4 border-b border-white/10">
        <p className="text-slate-500 text-sm mb-2">Juz</p>
        <h1 className="text-5xl font-bold text-white mb-2">{juzNum}</h1>
        <p className="text-slate-400 text-sm">{pagination.total_records} versets</p>

        {/* Prev/next juz */}
        <div className="flex items-center justify-center gap-6 mt-6">
          {juzNum > 1 && (
            <a href={`/juz/${juzNum - 1}`}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-emerald-400 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Juz {juzNum - 1}
            </a>
          )}
          {juzNum < 30 && (
            <a href={`/juz/${juzNum + 1}`}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-emerald-400 transition-colors">
              Juz {juzNum + 1}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          )}
        </div>
      </div>

      {/* Versets */}
      <div>
        {verses.map(verse => (
          <AyahCardV2
            key={verse.verse_key}
            verseKey={verse.verse_key}
            textUthmani={verse.words ? verse.words.map(w => w.text_uthmani).join(' ') : ''}
            translations={verse.translations}
            words={verse.words}
            surahName={`Juz ${juzNum}`}
            surahId={parseInt(verse.verse_key.split(':')[0])}
            ayahCount={999}
          />
        ))}
      </div>
    </div>
  )
}
