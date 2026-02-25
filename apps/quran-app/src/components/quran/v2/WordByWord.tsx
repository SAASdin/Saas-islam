// ============================================================
// WordByWord.tsx — Affichage mot-à-mot du Coran
// ⚠️  text_uthmani SACRÉ — afficher tel quel
// ⚠️  dir="rtl" lang="ar" obligatoire sur container
// ============================================================
import type { QdcWord } from '@/lib/quran-cdn-api'

interface WordByWordProps {
  words: QdcWord[]
  showTransliteration?: boolean
  fontSize?: number
}

export default function WordByWord({ words, showTransliteration, fontSize }: WordByWordProps) {
  // Filtrer les marqueurs de fin (char_type_name === 'end') — numéros de verset
  const contentWords = words.filter(w => w.char_type_name !== 'end')
  const endMarker = words.find(w => w.char_type_name === 'end')

  const arabicSize = fontSize ? `${fontSize * 0.85}px` : '1.5rem'

  return (
    <div className="py-2">
      <div
        className="flex flex-wrap gap-4 justify-end items-start"
        dir="rtl"
        lang="ar"
      >
        {contentWords.map((word, i) => (
          <div
            key={`${word.id}-${i}`}
            className="flex flex-col items-center gap-1 cursor-default hover:bg-emerald-500/10 rounded-lg px-2 py-1 transition-colors group"
          >
            {/* Mot arabe — ⚠️ SACRÉ */}
            <span
              className="quran-text text-white/90 group-hover:text-emerald-300 transition-colors"
              style={{ fontSize: arabicSize }}
            >
              {word.text_uthmani}
            </span>

            {/* Translitération (optionnelle) */}
            {showTransliteration && word.transliteration?.text && (
              <span className="text-xs text-slate-500 font-light" dir="ltr">
                {word.transliteration.text}
              </span>
            )}

            {/* Traduction du mot */}
            {word.translation?.text && (
              <span
                className="text-xs text-slate-400 text-center leading-tight max-w-20 group-hover:text-slate-300"
                dir="ltr"
              >
                {word.translation.text}
              </span>
            )}
          </div>
        ))}

        {/* Numéro de verset en cercle */}
        {endMarker && (
          <div className="flex flex-col items-center justify-start pt-1">
            <span
              className="quran-text text-emerald-400/60 text-xl"
            >
              {endMarker.text_uthmani}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
