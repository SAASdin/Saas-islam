// @ts-nocheck
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getHadith, getAdjacentHadiths } from '@/lib/db'
import Breadcrumb from '@/components/ui/Breadcrumb'
import { getGradeColor, GRADE_LABELS } from '@/types/hadith'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ collection: string; hadithNumber: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection, hadithNumber } = await params
  const h = await getHadith(collection, hadithNumber).catch(() => null)
  if (!h) return { title: 'Hadith introuvable' }
  const col = (h as Record<string,unknown>)
  return {
    title: `${col.collection_name_english as string} ${hadithNumber}`,
    description: ((col.text_english as string) || '').slice(0, 160),
  }
}

export default async function HadithPage({ params }: Props) {
  const { collection: collectionKey, hadithNumber } = await params

  let hadith: Record<string, unknown> | null = null
  let adjacent: { prev: string | null; next: string | null } = { prev: null, next: null }

  try {
    hadith = await getHadith(collectionKey, hadithNumber) as Record<string, unknown>
    if (!hadith) notFound()
    adjacent = await getAdjacentHadiths(collectionKey, hadithNumber)
  } catch {
    notFound()
  }

  const gradeColor = getGradeColor(hadith.grade as string | null)
  const gradeLabel = GRADE_LABELS[gradeColor]

  return (
    <div className="max-w-3xl mx-auto">
      <Breadcrumb items={[
        { label: 'Accueil', href: '/' },
        { label: hadith.collection_name_english as string, href: `/${collectionKey}` },
        { label: `Hadith ${hadithNumber}` },
      ]} />

      {/* Navigation précédent/suivant */}
      <div className="flex items-center justify-between mb-4 text-sm">
        {adjacent.prev ? (
          <Link href={`/hadith/${collectionKey}/${adjacent.prev}`}
            className="flex items-center gap-1 text-green-700 hover:text-green-900 transition-colors">
            ← Hadith {adjacent.prev}
          </Link>
        ) : <span />}
        <Link href={`/${collectionKey}/hadiths`}
          className="text-gray-400 hover:text-green-700 transition-colors text-xs">
          ↑ Tous les hadiths
        </Link>
        {adjacent.next ? (
          <Link href={`/hadith/${collectionKey}/${adjacent.next}`}
            className="flex items-center gap-1 text-green-700 hover:text-green-900 transition-colors">
            Hadith {adjacent.next} →
          </Link>
        ) : <span />}
      </div>

      {/* Card principale */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#067b55] to-[#045a3e] text-white px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-arabic text-lg">{hadith.collection_name_arabic as string}</p>
              <h1 className="font-bold text-xl">
                {hadith.collection_name_english as string} — {hadithNumber}
              </h1>
            </div>
            {hadith.grade && gradeColor !== 'unknown' && (
              <div className={`text-sm font-semibold px-3 py-1 rounded-full border ${gradeLabel.bg} ${gradeLabel.color}`}>
                {gradeLabel.en}
                {gradeLabel.ar && <span className="font-arabic ml-1">({gradeLabel.ar})</span>}
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* Livre / Chapitre */}
          {(hadith.book_name_english || hadith.chapter_name_arabic_full) && (
            <div className="mb-5 pb-5 border-b border-gray-100">
              {hadith.book_name_arabic && (
                <p className="font-arabic text-base text-right text-gray-700 mb-1">
                  {hadith.book_name_arabic as string}
                </p>
              )}
              {hadith.book_name_english && (
                <p className="text-sm font-medium text-gray-700 mb-2">{hadith.book_name_english as string}</p>
              )}
              {(hadith as Record<string,unknown>).chapter_name_arabic_full && (
                <p className="font-arabic text-sm text-right text-gray-500 mb-1">
                  {(hadith as Record<string,unknown>).chapter_name_arabic_full as string}
                </p>
              )}
              {(hadith as Record<string,unknown>).chapter_name_english_full && (
                <p className="text-xs text-gray-500 italic">
                  {(hadith as Record<string,unknown>).chapter_name_english_full as string}
                </p>
              )}
            </div>
          )}

          {/* Texte arabe */}
          <div className="mb-6">
            <div className="hadith-arabic text-lg leading-loose">
              {hadith.text_arabic as string}
            </div>
          </div>

          {/* Traduction anglaise */}
          {hadith.text_english && (
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Traduction (anglaise)</h2>
              <p className="text-gray-700 leading-relaxed">{hadith.text_english as string}</p>
            </div>
          )}

          {/* Traduction française (si disponible) */}
          {hadith.text_french && (
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Traduction (française)</h2>
              <p className="text-gray-700 leading-relaxed">{hadith.text_french as string}</p>
            </div>
          )}

          {/* Isnad */}
          {hadith.isnad_arabic && (
            <div className="mb-5 bg-[#fdf8f0] rounded-lg p-4">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Chaîne de narration</h2>
              <p className="font-arabic text-sm text-right text-gray-700 leading-loose">
                {hadith.isnad_arabic as string}
              </p>
            </div>
          )}

          {/* Grade */}
          {hadith.grade && (
            <div className={`flex items-center gap-3 p-3 rounded-lg border ${gradeLabel.bg}`}>
              <div className={`w-2 h-2 rounded-full ${
                gradeColor === 'sahih' ? 'bg-emerald-500' :
                gradeColor === 'hasan' ? 'bg-blue-500' :
                gradeColor === 'daif' ? 'bg-orange-500' :
                'bg-red-500'
              }`} />
              <div>
                <p className={`font-semibold text-sm ${gradeLabel.color}`}>{hadith.grade as string}</p>
                {hadith.grade_source && (
                  <p className="text-xs text-gray-500">— {hadith.grade_source as string}</p>
                )}
              </div>
            </div>
          )}

          {/* Référence */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              <span className="font-medium">Référence :</span> {hadith.reference as string}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-4 text-sm">
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
          📋 Copier
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
          🔗 Partager
        </button>
      </div>

      {/* Navigation bas de page */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
        {adjacent.prev ? (
          <Link href={`/hadith/${collectionKey}/${adjacent.prev}`}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-green-300 transition-colors text-sm text-gray-600">
            ← Hadith {adjacent.prev}
          </Link>
        ) : <span />}
        {adjacent.next ? (
          <Link href={`/hadith/${collectionKey}/${adjacent.next}`}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-green-300 transition-colors text-sm text-gray-600">
            Hadith {adjacent.next} →
          </Link>
        ) : <span />}
      </div>
    </div>
  )
}
