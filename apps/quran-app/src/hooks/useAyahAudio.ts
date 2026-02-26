'use client'
// ============================================================
// hooks/useAyahAudio.ts — Gestion audio versets coraniques
// Source : everyayah.com
// ⚠️  Audio SACRÉ — les URLs sont construites à partir d'identifiants
//     numériques uniquement. Jamais de transformation sur le texte arabe.
// ============================================================

import { useState, useRef, useCallback, useEffect } from 'react'
import { buildAudioUrl, DEFAULT_RECITER_ID } from '@/lib/reciters'

/** Identifiant d'un verset en cours de lecture */
export interface CurrentAyah {
  surah: number
  ayah: number
}

export interface UseAyahAudioOptions {
  /**
   * Appelé quand un verset se termine.
   * Utile pour déclencher le passage au verset suivant (mode lecture continue).
   */
  onEnded?: (current: CurrentAyah) => void
  /**
   * Appelé dès qu'un nouveau verset commence (play ou avance auto).
   * Permet au parent de gérer le scroll/highlight.
   */
  onAyahChange?: (current: CurrentAyah) => void
}

export interface UseAyahAudioReturn {
  isPlaying: boolean
  isLoading: boolean
  /** Verset actuellement chargé (null avant le premier play) */
  currentAyah: CurrentAyah | null
  /** ID du récitateur actif */
  currentReciterId: string
  /** Temps écoulé en secondes */
  progress: number
  /** Durée totale en secondes (0 si non chargé) */
  duration: number
  /**
   * Lance la lecture d'un verset précis.
   * Si reciterId est omis, utilise le récitateur actif.
   */
  play: (surahNumber: number, ayahNumber: number, reciterId?: string) => void
  pause: () => void
  /** Reprend la lecture du verset mis en pause */
  resume: () => void
  /** Change de récitateur et stoppe la lecture en cours */
  setReciter: (id: string) => void
  /** Déplace la tête de lecture (en secondes) */
  seek: (seconds: number) => void
}

export function useAyahAudio(options: UseAyahAudioOptions = {}): UseAyahAudioReturn {
  const { onEnded, onAyahChange } = options

  const [isPlaying, setIsPlaying]           = useState(false)
  const [isLoading, setIsLoading]           = useState(false)
  const [currentAyah, setCurrentAyah]       = useState<CurrentAyah | null>(null)
  const [currentReciterId, setCurrentReciterId] = useState<string>(DEFAULT_RECITER_ID)
  const [progress, setProgress]             = useState(0)
  const [duration, setDuration]             = useState(0)

  // Élément <audio> principal
  const audioRef   = useRef<HTMLAudioElement | null>(null)
  // Élément <audio> de préchargement (verset suivant)
  const preloadRef = useRef<HTMLAudioElement | null>(null)

  // Références stables vers les callbacks (évite les closures périmées)
  const onEndedRef      = useRef(onEnded)
  const onAyahChangeRef = useRef(onAyahChange)
  useEffect(() => { onEndedRef.current = onEnded }, [onEnded])
  useEffect(() => { onAyahChangeRef.current = onAyahChange }, [onAyahChange])

  // Nettoyage lors du démontage du composant
  useEffect(() => {
    return () => {
      audioRef.current?.pause()
      preloadRef.current?.pause()
    }
  }, [])

  /** Mise à jour de la progression (ontimeupdate) */
  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    setProgress(audio.currentTime)
    if (audio.duration && isFinite(audio.duration)) {
      setDuration(audio.duration)
    }
  }, [])

  const play = useCallback(
    (surahNumber: number, ayahNumber: number, reciterId?: string) => {
      const rid = reciterId ?? currentReciterId
      const url = buildAudioUrl(rid, surahNumber, ayahNumber)
      const newAyah: CurrentAyah = { surah: surahNumber, ayah: ayahNumber }

      // Détacher les listeners de l'audio précédent
      if (audioRef.current) {
        audioRef.current.ontimeupdate = null
        audioRef.current.onended      = null
        audioRef.current.onerror      = null
        audioRef.current.oncanplay    = null
        audioRef.current.onloadstart  = null
        audioRef.current.pause()
      }

      // Réutiliser le fichier préchargé si c'est le bon
      const preloaded = preloadRef.current
      if (preloaded && preloaded.src === url && preloaded.readyState >= 2) {
        audioRef.current  = preloaded
        preloadRef.current = null
      } else {
        audioRef.current = new Audio(url)
      }

      const audio = audioRef.current

      audio.onloadstart = () => setIsLoading(true)
      audio.oncanplay   = () => setIsLoading(false)
      audio.ontimeupdate = handleTimeUpdate
      audio.onloadedmetadata = () => {
        if (isFinite(audio.duration)) setDuration(audio.duration)
      }
      audio.onended = () => {
        setIsPlaying(false)
        setProgress(0)
        onEndedRef.current?.(newAyah)
      }
      audio.onerror = () => {
        setIsLoading(false)
        setIsPlaying(false)
      }

      setCurrentAyah(newAyah)
      setCurrentReciterId(rid)
      setProgress(0)
      setIsLoading(true)

      audio.play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsLoading(false)
          setIsPlaying(false)
        })

      onAyahChangeRef.current?.(newAyah)

      // Préchargement du verset suivant (optimisation réseau)
      const nextUrl = buildAudioUrl(rid, surahNumber, ayahNumber + 1)
      const preload = new Audio(nextUrl)
      preload.preload = 'auto'
      preloadRef.current = preload
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentReciterId, handleTimeUpdate]
  )

  const pause = useCallback(() => {
    audioRef.current?.pause()
    setIsPlaying(false)
  }, [])

  const resume = useCallback(() => {
    if (!audioRef.current || !currentAyah) return
    audioRef.current.play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false))
  }, [currentAyah])

  const setReciter = useCallback((id: string) => {
    if (audioRef.current) {
      audioRef.current.ontimeupdate = null
      audioRef.current.onended      = null
      audioRef.current.pause()
      audioRef.current = null
    }
    preloadRef.current?.pause()
    preloadRef.current = null
    setCurrentReciterId(id)
    setIsPlaying(false)
    setProgress(0)
    setDuration(0)
    setCurrentAyah(null)
  }, [])

  const seek = useCallback((seconds: number) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = seconds
    setProgress(seconds)
  }, [])

  return {
    isPlaying,
    isLoading,
    currentAyah,
    currentReciterId,
    progress,
    duration,
    play,
    pause,
    resume,
    setReciter,
    seek,
  }
}
