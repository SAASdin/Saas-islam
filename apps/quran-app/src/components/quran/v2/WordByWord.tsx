'use client'
// ============================================================
// WordByWord.tsx — Affichage mot-à-mot interactif
// ⚠️  text_uthmani SACRÉ — afficher tel quel
// ⚠️  dir="rtl" lang="ar" obligatoire
// Click sur un mot → WordAnalysis panel
// ============================================================
import { useState } from 'react'
import type { QdcWord } from '@/lib/quran-cdn-api'
import WordAnalysis from './WordAnalysis'

interface WordByWordProps {
  words: QdcWord[]
  verseKey: string
  showTransliteration?: boolean
  fontSize?: number
}

export default function WordByWord({ words, verseKey, showTransliteration, fontSize }: WordByWordProps) {
  const [analysisWord, setAnalysisWord] = useState<{ word: QdcWord; position: number } | null>(null)

  // Filtrer les marqueurs de fin
  const contentWords = words.filter(w => w.char_type_name !== 'end')
  const endMarker = words.find(w => w.char_type_name === 'end')

  const arabicSize = fontSize ? `${Math.floor(fontSize * 0.8)}px` : '1.4rem'

  return (
    <>
      <div className="py-3">
        <div
          className="flex flex-wrap gap-3 justify-end items-start"
          dir="rtl"
          lang="ar"
        >
          {contentWords.map((word, i) => (
            <button
              key={`${word.id}-${i}`}
              onClick={() => setAnalysisWord({ word, position: word.position || i + 1 })}
              className="flex flex-col items-center gap-0.5 hover:bg-emerald-500/10 rounded-xl px-2 py-1.5 transition-all group cursor-pointer border border-transparent hover:border-emerald-500/20"
            >
              {/* Mot arabe — ⚠️ SACRÉ */}
              <span
                className="quran-text text-white/90 group-hover:text-emerald-300 transition-colors leading-tight"
                style={{ fontSize: arabicSize }}
              >
                {word.text_uthmani}
              </span>

              {/* Translitération */}
              {showTransliteration && word.transliteration?.text && (
                <span className="text-xs text-slate-500 font-light group-hover:text-slate-400 transition-colors" dir="ltr">
                  {word.transliteration.text}
                </span>
              )}

              {/* Traduction */}
              {word.translation?.text && (
                <span
                  className="text-xs text-slate-400 text-center leading-tight group-hover:text-slate-300 transition-colors"
                  style={{ maxWidth: '5rem', direction: 'ltr' }}
                  dir="ltr"
                >
                  {word.translation.text}
                </span>
              )}
            </button>
          ))}

          {/* Numéro verset */}
          {endMarker && (
            <div className="flex flex-col items-center justify-start pt-2">
              <span className="quran-text text-emerald-400/50 text-xl leading-none">
                {endMarker.text_uthmani}
              </span>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-600 mt-2 text-center" dir="ltr">
          Cliquez sur un mot pour l&apos;analyse morphologique
        </p>
      </div>

      {/* Panel analyse */}
      {analysisWord && (
        <WordAnalysis
          word={{
            text_uthmani: analysisWord.word.text_uthmani,
            transliteration: analysisWord.word.transliteration?.text ?? '',
            translation: analysisWord.word.translation?.text ?? '',
          }}
          verseKey={verseKey}
          wordPosition={analysisWord.position}
          isOpen={true}
          onClose={() => setAnalysisWord(null)}
        />
      )}
    </>
  )
}
