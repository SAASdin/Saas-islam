'use client'
// ============================================================
// AudioPlayer.tsx — Lecteur audio versets coraniques
// Source CDN : cdn.islamic.network/quran/audio/128/ar.alafasy
// Inspiré de quran.com — multi-récitateurs
// ⚠️  Audio SACRÉ — ne jamais modifier les URLs des récitateurs validés
// ============================================================

import { useState, useRef, useEffect, useCallback } from 'react'

// ── Récitateurs disponibles (sources officielles validées) ───

export interface Reciter {
  id: string
  nameAr: string
  nameFr: string
  bitrate: number
  cdnSlug: string     // nom du dossier sur cdn.islamic.network
}

export const RECITERS: Reciter[] = [
  {
    id: 'alafasy',
    nameAr: 'مشاري راشد العفاسي',
    nameFr: 'Mishary Rashid Alafasy',
    bitrate: 128,
    cdnSlug: 'ar.alafasy',
  },
  {
    id: 'husary',
    nameAr: 'محمود خليل الحصري',
    nameFr: 'Mahmoud Khalil Al-Husary',
    bitrate: 128,
    cdnSlug: 'ar.husary',
  },
  {
    id: 'minshawi',
    nameAr: 'محمد صديق المنشاوي',
    nameFr: 'Muhammad Siddiq Al-Minshawi',
    bitrate: 128,
    cdnSlug: 'ar.minshawi',
  },
  {
    id: 'abdurrahman-sudais',
    nameAr: 'عبد الرحمن السديس',
    nameFr: 'Abdurrahman Al-Sudais',
    bitrate: 128,
    cdnSlug: 'ar.abdurrahmaansudais',
  },
]

const DEFAULT_RECITER = RECITERS[0]

// ── Construire l'URL audio ───────────────────────────────────

function buildAudioUrl(reciter: Reciter, ayahNumberQuran: number): string {
  return `https://cdn.islamic.network/quran/audio/${reciter.bitrate}/${reciter.cdnSlug}/${ayahNumberQuran}.mp3`
}

// ── Props ────────────────────────────────────────────────────

interface Props {
  // Numéro global du verset dans le Coran (1–6236)
  ayahNumberQuran: number
  // Pour la navigation
  totalAyahs?: number
  surahId?: number
  onNext?: () => void
  onPrev?: () => void
  // Compact : juste le bouton play/pause
  compact?: boolean
}

// ── Composant bouton simple (dans chaque verset) ─────────────

export function AyahPlayButton({
  ayahNumberQuran,
  reciterId = 'alafasy',
}: {
  ayahNumberQuran: number
  reciterId?: string
}) {
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const reciter = RECITERS.find(r => r.id === reciterId) ?? DEFAULT_RECITER

  function togglePlay() {
    if (!audioRef.current) {
      audioRef.current = new Audio(buildAudioUrl(reciter, ayahNumberQuran))
      audioRef.current.onended = () => setPlaying(false)
    }

    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play()
      setPlaying(true)
    }
  }

  // Nettoyage
  useEffect(() => {
    return () => {
      audioRef.current?.pause()
    }
  }, [])

  return (
    <button
      onClick={togglePlay}
      className="text-gray-400 hover:text-islam-600 dark:hover:text-islam-400 transition-colors"
      title={playing ? 'Pause' : 'Écouter ce verset'}
      type="button"
      aria-label={playing ? 'Pause' : `Écouter le verset ${ayahNumberQuran}`}
    >
      {playing ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
      )}
    </button>
  )
}

// ── Player complet (sticky bas de page) ──────────────────────

export default function AudioPlayer({
  ayahNumberQuran,
  onNext,
  onPrev,
  compact = false,
}: Props) {
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentReciter, setCurrentReciter] = useState<Reciter>(DEFAULT_RECITER)
  const [showReciterPicker, setShowReciterPicker] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Construire l'URL audio courante
  const audioUrl = buildAudioUrl(currentReciter, ayahNumberQuran)

  const initAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    const audio = new Audio(audioUrl)
    audio.onloadstart = () => setLoading(true)
    audio.oncanplay = () => setLoading(false)
    audio.onended = () => {
      setPlaying(false)
      setProgress(0)
      onNext?.()
    }
    audio.ontimeupdate = () => {
      setProgress(audio.currentTime)
    }
    audio.onloadedmetadata = () => {
      setDuration(audio.duration)
    }
    audioRef.current = audio
  }, [audioUrl, onNext])

  useEffect(() => {
    initAudio()
    return () => {
      audioRef.current?.pause()
    }
  }, [initAudio])

  function togglePlay() {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play()
      setPlaying(true)
    }
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const t = Number(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = t
      setProgress(t)
    }
  }

  function formatTime(s: number): string {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  if (compact) {
    return (
      <button
        onClick={togglePlay}
        disabled={loading}
        className="text-gray-400 hover:text-islam-600 dark:hover:text-islam-400 transition-colors disabled:opacity-50"
        title={playing ? 'Pause' : 'Écouter'}
        type="button"
      >
        {loading ? (
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        ) : playing ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        )}
      </button>
    )
  }

  // Player complet
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50 px-4 py-3">
      <div className="max-w-3xl mx-auto">

        {/* Barre de progression */}
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={progress}
          onChange={handleSeek}
          className="w-full h-1 mb-3 rounded-full accent-islam-600 cursor-pointer"
          aria-label="Progression audio"
        />

        <div className="flex items-center gap-4">
          {/* Précédent */}
          {onPrev && (
            <button
              onClick={onPrev}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              title="Verset précédent"
              type="button"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </button>
          )}

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            disabled={loading}
            className="w-10 h-10 rounded-full bg-islam-600 text-white flex items-center justify-center hover:bg-islam-700 transition-colors disabled:opacity-50"
            title={playing ? 'Pause' : 'Écouter'}
            type="button"
          >
            {loading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : playing ? (
              <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5 ml-0.5" fill="white" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          {/* Suivant */}
          {onNext && (
            <button
              onClick={onNext}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              title="Verset suivant"
              type="button"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zm2.5-6l5.5 4V8z" /><path d="M16 6h2v12h-2z"/>
              </svg>
            </button>
          )}

          {/* Temps */}
          <span className="text-xs text-gray-400 min-w-[60px]">
            {formatTime(progress)} / {formatTime(duration)}
          </span>

          {/* Récitateur */}
          <div className="ml-auto relative">
            <button
              onClick={() => setShowReciterPicker(p => !p)}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-islam-600 transition-colors flex items-center gap-1"
              type="button"
            >
              🎙️ {currentReciter.nameFr.split(' ').slice(-1)[0]}
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </button>

            {showReciterPicker && (
              <div className="absolute bottom-8 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 min-w-[200px] z-50">
                {RECITERS.map(r => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setCurrentReciter(r)
                      setShowReciterPicker(false)
                      setPlaying(false)
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      r.id === currentReciter.id ? 'text-islam-600 font-medium' : 'text-gray-700 dark:text-gray-300'
                    }`}
                    type="button"
                  >
                    <div>{r.nameFr}</div>
                    <div dir="rtl" lang="ar" className="text-xs text-gray-400">{r.nameAr}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
