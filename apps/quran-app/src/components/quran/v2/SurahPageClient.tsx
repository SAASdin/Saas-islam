'use client'
// ============================================================
// SurahPageClient.tsx — Page sourate interactive
// ============================================================
import { useState, useMemo } from 'react'
import type { QdcChapter, QdcVerse } from '@/lib/quran-cdn-api'
import SurahHeader from './SurahHeader'
import Basmala from './Basmala'
import AyahCardV2 from './AyahCardV2'
import TafsirPanel from './TafsirPanel'
import { useSettings } from '@/store/settings'

interface SurahPageClientProps {
  chapter: QdcChapter
  verses: QdcVerse[]
}

type ReadingMode = 'ayah' | 'translation' | 'word-by-word'

export default function SurahPageClient({ chapter, verses }: SurahPageClientProps) {
  const [mode, setMode] = useState<ReadingMode>('ayah')
  const [tafsirOpen, setTafsirOpen] = useState(false)
  const [tafsirVerse, setTafsirVerse] = useState('')

  const { fontSize, showTranslation, toggleTranslation, reciterSlug, setReciter } = useSettings()

  function openTafsir(verseKey: string) {
    setTafsirVerse(verseKey)
    setTafsirOpen(true)
  }

  const MODES: { key: ReadingMode; label: string; icon: string }[] = [
    { key: 'ayah',       label: 'Verset',    icon: '📄' },
    { key: 'translation',label: 'Traduction', icon: '🌍' },
    { key: 'word-by-word',label: 'Mot/mot',   icon: '🔤' },
  ]

  return (
    <div className="max-w-3xl mx-auto">
      {/* En-tête sourate */}
      <SurahHeader chapter={chapter} showNav />

      {/* Barre d'outils lecture */}
      <div className="sticky top-14 z-20 bg-[#0a0f1e]/95 backdrop-blur-sm border-b border-white/10 px-4 py-2 flex items-center gap-3 overflow-x-auto">
        {/* Mode lecture */}
        <div className="flex items-center bg-white/5 rounded-lg p-0.5 shrink-0">
          {MODES.map(m => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                mode === m.key
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {m.icon} {m.label}
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-white/10 shrink-0" />

        {/* Toggle traduction */}
        <button
          onClick={toggleTranslation}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors shrink-0 ${
            showTranslation
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-500 hover:text-white border border-white/10'
          }`}
        >
          🌍 Traduction
        </button>

        {/* Tafsir button */}
        <button
          onClick={() => {
            if (verses[0]) openTafsir(verses[0].verse_key)
          }}
          className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-500 hover:text-white border border-white/10 transition-colors shrink-0"
        >
          📖 Tafsir
        </button>

        <div className="ml-auto text-xs text-slate-500 shrink-0">
          {chapter.verses_count} versets
        </div>
      </div>

      {/* Basmala */}
      <Basmala show={chapter.bismillah_pre} />

      {/* Liste des versets */}
      <div>
        {verses.map((verse) => (
          <AyahCardV2
            key={verse.verse_key}
            verseKey={verse.verse_key}
            textUthmani={verse.words
              ? verse.words.map(w => w.text_uthmani).join(' ')
              : ''}
            translations={verse.translations}
            words={verse.words}
            surahName={chapter.name_simple}
            surahId={chapter.id}
            ayahCount={chapter.verses_count}
            showWordByWord={mode === 'word-by-word'}
            showTransliteration={mode === 'word-by-word'}
            fontSize={fontSize}
          />
        ))}
      </div>

      {/* Navigation bas de page */}
      <div className="flex items-center justify-between px-6 py-8 border-t border-white/10">
        {chapter.id > 1 ? (
          <a href={`/surah/${chapter.id - 1}`}
            className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Sourate {chapter.id - 1}
          </a>
        ) : <div />}
        {chapter.id < 114 ? (
          <a href={`/surah/${chapter.id + 1}`}
            className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors">
            Sourate {chapter.id + 1}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        ) : <div />}
      </div>

      {/* Tafsir panel */}
      <TafsirPanel
        isOpen={tafsirOpen}
        onClose={() => setTafsirOpen(false)}
        verseKey={tafsirVerse}
      />
    </div>
  )
}
