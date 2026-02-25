'use client'
// ============================================================
// store/settings.ts — Paramètres utilisateur persistants
// Zustand + persist middleware → localStorage noorapp-settings-v1
// ============================================================
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type QuranFont = 'kfgqpc' | 'uthmani' | 'indopak' | 'simple'
export type ReadingMode = 'ayah' | 'page' | 'translation' | 'word-by-word'
export type RepeatMode = 'none' | 'verse' | 'range' | 'surah'
export type Theme = 'dark' | 'light' | 'sepia'
export type TafsirPosition = 'inline' | 'sidebar'
export type AppLanguage = 'fr' | 'en' | 'ar'
export type PlaybackSpeed = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2

interface SettingsState {
  // ─── Texte ────────────────────────────────────────
  quranFont: QuranFont
  fontSize: number          // 12–48px
  showTajweed: boolean
  showWordByWord: boolean
  showTransliteration: boolean

  // ─── Traductions ──────────────────────────────────
  primaryTranslation: number    // ID qurancdn
  secondaryTranslation: number | null
  showTranslation: boolean

  // ─── Tafsir ───────────────────────────────────────
  selectedTafsirId: number
  showTafsir: boolean
  tafsirPosition: TafsirPosition

  // ─── Audio ────────────────────────────────────────
  reciterId: number
  reciterSlug: string
  autoPlay: boolean
  repeatMode: RepeatMode
  repeatCount: number
  playbackSpeed: PlaybackSpeed
  autoScroll: boolean

  // ─── Apparence ────────────────────────────────────
  theme: Theme
  readingMode: ReadingMode
  language: AppLanguage

  // ─── Actions ──────────────────────────────────────
  setFont: (f: QuranFont) => void
  setFontSize: (n: number) => void
  toggleWordByWord: () => void
  toggleTransliteration: () => void
  toggleTranslation: () => void
  setPrimaryTranslation: (id: number) => void
  setSecondaryTranslation: (id: number | null) => void
  setReciter: (id: number, slug: string) => void
  setRepeatMode: (m: RepeatMode) => void
  setPlaybackSpeed: (s: PlaybackSpeed) => void
  setTheme: (t: Theme) => void
  setReadingMode: (m: ReadingMode) => void
  toggleTafsir: () => void
  setTafsirPosition: (p: TafsirPosition) => void
  setTafsirId: (id: number) => void
  setLanguage: (l: AppLanguage) => void
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      // Défauts
      quranFont: 'kfgqpc',
      fontSize: 28,
      showTajweed: false,
      showWordByWord: false,
      showTransliteration: false,
      primaryTranslation: 131,  // Hamidullah FR
      secondaryTranslation: null,
      showTranslation: true,
      selectedTafsirId: 169,    // Muyassar AR
      showTafsir: false,
      tafsirPosition: 'sidebar',
      reciterId: 7,
      reciterSlug: 'ar.alafasy',
      autoPlay: false,
      repeatMode: 'none',
      repeatCount: 1,
      playbackSpeed: 1,
      autoScroll: true,
      theme: 'dark',
      readingMode: 'ayah',
      language: 'fr',

      // Actions
      setFont: (f) => set({ quranFont: f }),
      setFontSize: (n) => set({ fontSize: Math.min(48, Math.max(12, n)) }),
      toggleWordByWord: () => set((s) => ({ showWordByWord: !s.showWordByWord })),
      toggleTransliteration: () => set((s) => ({ showTransliteration: !s.showTransliteration })),
      toggleTranslation: () => set((s) => ({ showTranslation: !s.showTranslation })),
      setPrimaryTranslation: (id) => set({ primaryTranslation: id }),
      setSecondaryTranslation: (id) => set({ secondaryTranslation: id }),
      setReciter: (id, slug) => set({ reciterId: id, reciterSlug: slug }),
      setRepeatMode: (m) => set({ repeatMode: m }),
      setPlaybackSpeed: (s) => set({ playbackSpeed: s }),
      setTheme: (t) => set({ theme: t }),
      setReadingMode: (m) => set({ readingMode: m }),
      toggleTafsir: () => set((s) => ({ showTafsir: !s.showTafsir })),
      setTafsirPosition: (p) => set({ tafsirPosition: p }),
      setTafsirId: (id) => set({ selectedTafsirId: id }),
      setLanguage: (l) => set({ language: l }),
    }),
    { name: 'noorapp-settings-v1' }
  )
)
