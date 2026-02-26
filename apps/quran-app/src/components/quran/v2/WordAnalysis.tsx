'use client'
// ============================================================
// WordAnalysis.tsx — Analyse morphologique d'un mot coranique
// Données depuis corpus.quran.com API
// ============================================================
import { useState, useEffect } from 'react'

interface WordData {
  text_uthmani: string
  transliteration: string
  translation: string
  morphology?: {
    root?: string
    pos?: string  // noun, verb, particle, etc.
    lemma?: string
    features?: Record<string, string>
  }
}

interface WordAnalysisProps {
  word: WordData
  verseKey: string
  wordPosition: number
  isOpen: boolean
  onClose: () => void
}

const POS_LABELS: Record<string, string> = {
  NOUN: 'Nom',
  VERB: 'Verbe',
  PRON: 'Pronom',
  ADJ: 'Adjectif',
  P: 'Particule',
  CONJ: 'Conjonction',
  DET: 'Déterminant',
  PREP: 'Préposition',
  REL: 'Relatif',
  T: 'Lettre',
  INL: 'Initiales coraniques',
}

export default function WordAnalysis({ word, verseKey, wordPosition, isOpen, onClose }: WordAnalysisProps) {
  const [morphData, setMorphData] = useState<{
    root: string
    lemma: string
    pos: string
    features: string[]
  } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)

    // API corpus.quran.com pour l'analyse morphologique
    const [surah, ayah] = verseKey.split(':')
    fetch(`https://api.qurancdn.com/api/qdc/morphology/${surah}:${ayah}:${wordPosition}`)
      .then(r => r.json())
      .then(data => {
        if (data?.morphology) {
          setMorphData({
            root: data.morphology.root_arabic ?? '',
            lemma: data.morphology.lemma_arabic ?? '',
            pos: data.morphology.pos_tag ?? '',
            features: data.morphology.features ?? [],
          })
        }
      })
      .catch(() => {
        // Fallback silencieux — affiche les données du mot qu'on a déjà
        setMorphData(null)
      })
      .finally(() => setLoading(false))
  }, [isOpen, verseKey, wordPosition])

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm bg-[#0d1526] border border-white/15 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <span>🔬</span> Analyse — {verseKey}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mot */}
        <div className="px-4 py-4 text-center border-b border-white/10">
          <p
            className="quran-text text-4xl text-amber-100 mb-2 leading-relaxed"
            dir="rtl" lang="ar"
          >
            {word.text_uthmani}
          </p>
          <p className="text-slate-400 text-sm italic">{word.transliteration}</p>
          <p className="text-white text-base font-medium mt-1">{word.translation}</p>
        </div>

        {/* Analyse */}
        <div className="px-4 py-3">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : morphData ? (
            <div className="space-y-2">
              {morphData.root && (
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400 text-xs">Racine</span>
                  <span className="quran-text text-emerald-300 text-lg" dir="rtl" lang="ar">{morphData.root}</span>
                </div>
              )}
              {morphData.lemma && (
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400 text-xs">Lemme</span>
                  <span className="quran-text text-amber-300 text-lg" dir="rtl" lang="ar">{morphData.lemma}</span>
                </div>
              )}
              {morphData.pos && (
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400 text-xs">Nature</span>
                  <span className="text-white text-xs font-medium px-2 py-0.5 bg-blue-500/20 rounded-full">
                    {POS_LABELS[morphData.pos] ?? morphData.pos}
                  </span>
                </div>
              )}
              {morphData.features.length > 0 && (
                <div className="py-2">
                  <p className="text-slate-400 text-xs mb-1.5">Caractéristiques</p>
                  <div className="flex flex-wrap gap-1">
                    {morphData.features.map((f, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-slate-300">{f}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-3">
              <p className="text-slate-500 text-xs text-center">Données morphologiques non disponibles</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="bg-white/3 rounded-lg p-3">
                  <p className="text-slate-400 text-xs mb-1">Translitération</p>
                  <p className="text-white text-sm">{word.transliteration}</p>
                </div>
                <div className="bg-white/3 rounded-lg p-3">
                  <p className="text-slate-400 text-xs mb-1">Traduction</p>
                  <p className="text-white text-sm">{word.translation}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lien Corpus */}
        <div className="px-4 pb-4">
          <a
            href={`https://corpus.quran.com/wordmorphology.jsp?location=(${verseKey.replace(':', ':')}:${wordPosition})`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-2 text-xs text-slate-500 hover:text-emerald-400 transition-colors"
          >
            Voir l&apos;analyse complète sur Corpus Quran →
          </a>
        </div>
      </div>
    </>
  )
}
