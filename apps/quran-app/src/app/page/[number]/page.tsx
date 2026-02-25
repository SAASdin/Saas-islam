export const dynamic = 'force-dynamic'
import { getVersesByPage, TRANSLATIONS } from '@/lib/quran-cdn-api'
import { notFound } from 'next/navigation'
import { getVerseText } from '@/lib/quran-cdn-api'
import AyahCardV2 from '@/components/quran/v2/AyahCardV2'
import type { Metadata } from 'next'
import Link from 'next/link'

interface Props { params: Promise<{ number: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { number } = await params
  const n = parseInt(number)
  if (isNaN(n)) return {}
  return {
    title: `Page ${n} — Mushaf`,
    description: `Page ${n} du Mushaf — Saint Coran`,
  }
}

export default async function MushafPageRoute({ params }: Props) {
  const { number } = await params
  const pageNum = parseInt(number)
  if (isNaN(pageNum) || pageNum < 1 || pageNum > 604) notFound()

  const { verses } = await getVersesByPage(pageNum, {
    translations: [TRANSLATIONS.hamidullah_fr],
  })

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center py-8 px-4 border-b border-white/10">
        <p className="text-slate-500 text-sm mb-1">Mushaf · Page</p>
        <h1 className="text-4xl font-bold text-white mb-4">{pageNum}</h1>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4">
          {pageNum > 1 && (
            <Link href={`/page/${pageNum - 1}`}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-emerald-400 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Page {pageNum - 1}
            </Link>
          )}

          <span className="text-slate-600 text-sm">/ 604</span>

          {pageNum < 604 && (
            <Link href={`/page/${pageNum + 1}`}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-emerald-400 transition-colors">
              Page {pageNum + 1}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      </div>

      {/* Versets de la page */}
      <div>
        {verses.map(verse => (
          <AyahCardV2
            key={verse.verse_key}
            verseKey={verse.verse_key}
            textUthmani={getVerseText(verse)}
            translations={verse.translations}
            words={verse.words}
            surahName={`Page ${pageNum}`}
            surahId={parseInt(verse.verse_key.split(':')[0])}
            ayahCount={999}
          />
        ))}
      </div>

      {/* Pagination bas */}
      <div className="flex items-center justify-between px-4 py-6 border-t border-white/10">
        {pageNum > 1 ? (
          <Link href={`/page/${pageNum - 1}`}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-slate-300 transition-colors">
            ← Page {pageNum - 1}
          </Link>
        ) : <div />}
        {pageNum < 604 ? (
          <Link href={`/page/${pageNum + 1}`}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm text-white transition-colors">
            Page {pageNum + 1} →
          </Link>
        ) : <div />}
      </div>
    </div>
  )
}
