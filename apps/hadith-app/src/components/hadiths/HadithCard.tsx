import Link from 'next/link'
import type { Hadith } from '@/types/hadith'
import { getGradeColor, GRADE_LABELS } from '@/types/hadith'

interface HadithCardProps {
  hadith: Hadith
  showCollection?: boolean
  highlight?: string
}

export default function HadithCard({ hadith, showCollection, highlight }: HadithCardProps) {
  const gradeColor = getGradeColor(hadith.grade)
  const gradeLabel = GRADE_LABELS[gradeColor]

  function highlightText(text: string) {
    if (!highlight) return text
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return text.split(regex).map((part, i) =>
      regex.test(part)
        ? <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5">{part}</mark>
        : part
    )
  }

  return (
    <div className="hadith-card p-5 mb-4">
      {/* En-tête */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Numéro */}
          <Link
            href={`/hadith/${hadith.collection_key}/${hadith.hadith_number}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-0.5 hover:bg-green-100 transition-colors"
          >
            <span className="font-arabic text-sm">{hadith.collection_name_arabic}</span>
            <span>•</span>
            <span>{hadith.hadith_number}</span>
          </Link>

          {/* Collection si demandé */}
          {showCollection && (
            <Link href={`/${hadith.collection_key}`} className="text-xs text-gray-500 hover:text-green-700">
              {hadith.collection_name_english}
            </Link>
          )}

          {/* Livre */}
          {hadith.book_name_english && (
            <span className="text-xs text-gray-400">
              {hadith.book_name_english}
            </span>
          )}
        </div>

        {/* Grade */}
        {hadith.grade && gradeColor !== 'unknown' && (
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border shrink-0 grade-${gradeColor}`}>
            {gradeLabel.en}
          </span>
        )}
      </div>

      {/* Chapitre */}
      {(hadith.chapter_name_english || hadith.chapter_name_arabic) && (
        <div className="mb-3 pb-3 border-b border-gray-100">
          {hadith.chapter_name_arabic && (
            <p className="font-arabic text-gray-600 text-sm text-right mb-0.5">
              {hadith.chapter_name_arabic}
            </p>
          )}
          {hadith.chapter_name_english && (
            <p className="text-xs text-gray-500 italic">{hadith.chapter_name_english}</p>
          )}
        </div>
      )}

      {/* Texte arabe */}
      <div className="hadith-arabic mb-4">
        {hadith.text_arabic}
      </div>

      {/* Texte anglais/français */}
      {(hadith.text_english || hadith.text_french) && (
        <div className="text-gray-700 leading-relaxed text-sm">
          {highlightText(hadith.text_english || hadith.text_french || '')}
        </div>
      )}

      {/* Référence */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <p className="text-xs text-gray-400">{hadith.reference}</p>
        <Link
          href={`/hadith/${hadith.collection_key}/${hadith.hadith_number}`}
          className="text-xs text-green-600 hover:text-green-800 font-medium hover:underline"
        >
          Voir le hadith →
        </Link>
      </div>
    </div>
  )
}
