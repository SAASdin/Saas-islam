'use client'
// ============================================================
// store/player.ts — État du lecteur audio persistant
// Zustand (sans persist — état volatil)
// ============================================================
import { create } from 'zustand'

interface PlayerState {
  isPlaying: boolean
  currentVerse: string | null   // "surah:ayah" ex: "1:1"
  currentSurahId: number
  currentSurahName: string
  currentAyahCount: number      // pour savoir quand on est à la fin
  reciterName: string
  reciterSlug: string
  duration: number
  currentTime: number
  playbackSpeed: number
  repeatMode: 'none' | 'verse' | 'surah'
  volume: number
  showPlayer: boolean

  // Actions
  setPlaying: (b: boolean) => void
  setVerse: (key: string, surahName: string, surahId: number, ayahCount: number) => void
  setProgress: (time: number, duration: number) => void
  setSpeed: (s: number) => void
  setVolume: (v: number) => void
  setReciter: (name: string, slug: string) => void
  setRepeatMode: (m: 'none' | 'verse' | 'surah') => void
  nextVerse: () => void
  prevVerse: () => void
  seekTo: (time: number) => void
  closePlayer: () => void
}

export const usePlayer = create<PlayerState>((set, get) => ({
  isPlaying: false,
  currentVerse: null,
  currentSurahId: 1,
  currentSurahName: '',
  currentAyahCount: 7,
  reciterName: 'Mishary Rashid Al-Afasy',
  reciterSlug: 'ar.alafasy',
  duration: 0,
  currentTime: 0,
  playbackSpeed: 1,
  repeatMode: 'none',
  volume: 1,
  showPlayer: false,

  setPlaying: (b) => set({ isPlaying: b }),

  setVerse: (key, surahName, surahId, ayahCount) =>
    set({ currentVerse: key, currentSurahName: surahName, currentSurahId: surahId, currentAyahCount: ayahCount, showPlayer: true }),

  setProgress: (time, duration) => set({ currentTime: time, duration }),
  setSpeed: (s) => set({ playbackSpeed: s }),
  setVolume: (v) => set({ volume: v }),
  setReciter: (name, slug) => set({ reciterName: name, reciterSlug: slug }),
  setRepeatMode: (m) => set({ repeatMode: m }),
  seekTo: (time) => set({ currentTime: time }),
  closePlayer: () => set({ isPlaying: false, showPlayer: false, currentVerse: null }),

  nextVerse: () => {
    const { currentVerse, currentSurahId, currentAyahCount } = get()
    if (!currentVerse) return
    const [s, a] = currentVerse.split(':').map(Number)
    if (a < currentAyahCount) {
      set({ currentVerse: `${s}:${a + 1}` })
    } else {
      // Passe à la sourate suivante si possible
      if (s < 114) {
        set({ currentVerse: `${s + 1}:1`, currentSurahId: s + 1 })
      }
    }
  },

  prevVerse: () => {
    const { currentVerse } = get()
    if (!currentVerse) return
    const [s, a] = currentVerse.split(':').map(Number)
    if (a > 1) {
      set({ currentVerse: `${s}:${a - 1}` })
    } else if (s > 1) {
      set({ currentVerse: `${s - 1}:1`, currentSurahId: s - 1 })
    }
  },
}))
