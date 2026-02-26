'use client'
// ============================================================
// SurahPageClient.tsx — Page sourate interactive
// ============================================================
import { useState, useEffect, useRef } from 'react'
import type { QdcChapter, QdcVerse } from '@/lib/quran-cdn-api'
import { getVerseText } from '@/lib/quran-cdn-api'
import SurahHeader from './SurahHeader'
import Basmala from './Basmala'
import AyahCardV2 from './AyahCardV2'
import TafsirPanel from './TafsirPanel'
import { useSettings } from '@/store/settings'
import { usePlayer } from '@/store/player'
import ReciterSelector from './ReciterSelector'
import TranslationSelector from './TranslationSelector'
import { useChapterTranslations } from '@/hooks/useVerseTranslations'

interface SurahPageClientProps {
  chapter: QdcChapter
  verses: QdcVerse[]
}

type ReadingMode = 'ayah' | 'translation' | 'word-by-word'

export default function SurahPageClient({ chapter, verses }: SurahPageClientProps) {
  const [mode, setMode] = useState<ReadingMode>('ayah')
  const [tafsirOpen, setTafsirOpen] = useState(false)
  const [tafsirVerse, setTafsirVerse] = useState('')
  const [showTajweed, setShowTajweed] = useState(false)
  const [translationSelectorOpen, setTranslationSelectorOpen] = useState(false)

  const { fontSize, showTranslation, toggleTranslation, autoScroll, selectedTranslations } = useSettings()
  const { currentVerse, isPlaying, setVerse, setPlaying } = usePlayer()

  // Jouer toute la sourate depuis le début
  function handlePlaySurah() {
    const firstVerse = liveVerses[0] ?? verses[0]
    if (!firstVerse) return
    if (currentVerse === firstVerse.verse_key && isPlaying) {
      setPlaying(false)
    } else {
      setVerse(firstVerse.verse_key, chapter.name_simple, chapter.id, chapter.verses_count)
      setPlaying(true)
    }
  }
  const isSurahPlaying = isPlaying && currentVerse?.startsWith(`${chapter.id}:`)

  // Rechargement dynamique des traductions selon la sélection
  const { verses: liveVerses, loading: translationsLoading } = useChapterTranslations(chapter.id, verses)

  // Sauvegarder la dernière sourate/verset lu
  useEffect(() => {
    localStorage.setItem('noorapp-last-read', `${chapter.id}:1`)
  }, [chapter.id])

  // Auto-scroll vers le verset en cours de lecture
  useEffect(() => {
    if (!currentVerse || !autoScroll) return
    const el = document.getElementById(`ayah-${currentVerse}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [currentVerse, autoScroll])

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

        {/* ▶ Bouton Play Sourate */}
        <button
          onClick={handlePlaySurah}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
            isSurahPlaying
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
              : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500 hover:text-white'
          }`}
          title={isSurahPlaying ? 'Pause' : `Jouer ${chapter.name_simple}`}
        >
          {isSurahPlaying ? (
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
          {isSurahPlaying ? 'Pause' : 'Jouer'}
        </button>

        <div className="h-5 w-px bg-white/10 shrink-0" />

        {/* Toggle traduction + sélecteur */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={toggleTranslation}
            className={`px-3 py-1.5 rounded-l-md text-xs font-medium transition-colors border ${
              showTranslation
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'text-slate-500 hover:text-white border-white/10'
            }`}
          >
            🌍 {selectedTranslations.length > 1 ? `${selectedTranslations.length} trad.` : 'Traduction'}
          </button>
          <button
            onClick={() => setTranslationSelectorOpen(true)}
            className={`px-2 py-1.5 rounded-r-md text-xs transition-colors border-t border-r border-b ${
              showTranslation
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'text-slate-500 hover:text-white border-white/10 hover:bg-white/5'
            }`}
            title="Choisir les traductions"
          >
            ⚙
          </button>
        </div>

        {/* Tajweed toggle */}
        <button
          onClick={() => setShowTajweed(!showTajweed)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors shrink-0 ${
            showTajweed
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
              : 'text-slate-500 hover:text-white border border-white/10'
          }`}
        >
          🎨 Tajweed
        </button>

        {/* Tafsir button — ouvre pour le premier verset par défaut */}
        <button
          onClick={() => openTafsir(liveVerses[0]?.verse_key ?? `${chapter.id}:1`)}
          className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-500 hover:text-white border border-white/10 transition-colors shrink-0"
        >
          📖 Tafsir
        </button>

        <div className="ml-auto flex items-center gap-2 shrink-0">
          <ReciterSelector />
          <span className="text-xs text-slate-600 hidden sm:block">{chapter.verses_count} v.</span>
        </div>
      </div>

      {/* Basmala */}
      <Basmala show={chapter.bismillah_pre} />

      {/* Indicateur chargement traductions */}
      {translationsLoading && (
        <div className="flex items-center justify-center gap-2 py-2 text-xs text-slate-500">
          <div className="w-3 h-3 border border-emerald-500 border-t-transparent rounded-full animate-spin" />
          Chargement des traductions…
        </div>
      )}

      {/* Liste des versets */}
      <div>
        {liveVerses.map((verse) => (
          <AyahCardV2
            key={verse.verse_key}
            verseKey={verse.verse_key}
            textUthmani={getVerseText(verse)}
            translations={verse.translations}
            words={verse.words}
            surahName={chapter.name_simple}
            surahId={chapter.id}
            ayahCount={chapter.verses_count}
            showWordByWord={mode === 'word-by-word'}
            showTransliteration={mode === 'word-by-word'}
            showTajweed={showTajweed && mode !== 'word-by-word'}
            fontSize={fontSize}
            isActive={currentVerse === verse.verse_key && isPlaying}
            onOpenTafsir={(key) => { setTafsirVerse(key); setTafsirOpen(true) }}
            meta={{
              juz_number: verse.juz_number,
              hizb_number: verse.hizb_number,
              rub_el_hizb_number: verse.rub_el_hizb_number,
              page_number: verse.page_number,
              sajdah_number: verse.sajdah_number,
            }}
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

      {/* TranslationSelector */}
      <TranslationSelector
        isOpen={translationSelectorOpen}
        onClose={() => setTranslationSelectorOpen(false)}
      />
    </div>
  )
}
