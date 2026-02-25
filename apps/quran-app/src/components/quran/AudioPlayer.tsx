'use client'
// ============================================================
// AudioPlayer.tsx — Lecteur audio versets coraniques — Design Premium
// Source CDN : cdn.islamic.network/quran/audio/128/ar.alafasy
// ⚠️  Audio SACRÉ — ne jamais modifier les URLs des récitateurs validés
// ============================================================

import { useState, useRef, useEffect, useCallback } from 'react'

export interface Reciter {
  id: string
  nameAr: string
  nameFr: string
  bitrate: number
  cdnSlug: string
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

function buildAudioUrl(reciter: Reciter, ayahNumberQuran: number): string {
  return `https://cdn.islamic.network/quran/audio/${reciter.bitrate}/${reciter.cdnSlug}/${ayahNumberQuran}.mp3`
}

interface Props {
  ayahNumberQuran: number
  totalAyahs?: number
  surahId?: number
  onNext?: () => void
  onPrev?: () => void
  compact?: boolean
}

// ── Bouton play simple (inline dans chaque verset) ──────────

export function AyahPlayButton({
  ayahNumberQuran,
  reciterId = 'alafasy',
}: {
  ayahNumberQuran: number
  reciterId?: string
}) {
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const reciter = RECITERS.find(r => r.id === reciterId) ?? DEFAULT_RECITER

  function togglePlay() {
    if (!audioRef.current) {
      setLoading(true)
      audioRef.current = new Audio(buildAudioUrl(reciter, ayahNumberQuran))
      audioRef.current.oncanplay = () => setLoading(false)
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

  useEffect(() => {
    return () => {
      audioRef.current?.pause()
    }
  }, [])

  return (
    <button
      onClick={togglePlay}
      className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200"
      style={{
        background: playing
          ? 'rgba(212,175,55,0.2)'
          : 'rgba(255,255,255,0.05)',
        border: `1px solid ${playing ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.1)'}`,
        color: playing ? '#d4af37' : '#64748b',
      }}
      title={playing ? 'Pause' : 'Écouter ce verset'}
      type="button"
      aria-label={playing ? 'Pause' : `Écouter le verset ${ayahNumberQuran}`}
      disabled={loading}
    >
      {loading ? (
        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      ) : playing ? (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
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
    audio.ontimeupdate = () => setProgress(audio.currentTime)
    audio.onloadedmetadata = () => setDuration(audio.duration)
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
        className="transition-colors disabled:opacity-50"
        style={{ color: playing ? '#d4af37' : '#64748b' }}
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

  // Player complet glassmorphism
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 px-4 py-3"
      style={{
        background: 'rgba(10,15,30,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(212,175,55,0.15)',
        boxShadow: '0 -4px 32px rgba(0,0,0,0.5)',
      }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Barre de progression */}
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={progress}
          onChange={handleSeek}
          className="w-full h-1 mb-3 rounded-full cursor-pointer"
          style={{ accentColor: '#d4af37' }}
          aria-label="Progression audio"
        />

        <div className="flex items-center gap-4">
          {/* Précédent */}
          {onPrev && (
            <button
              onClick={onPrev}
              className="text-slate-400 hover:text-slate-200 transition-colors"
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
            className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #d4af37 0%, #b8962a 100%)',
              boxShadow: '0 0 20px rgba(212,175,55,0.4)',
              color: '#0a0f1e',
            }}
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
              <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          {/* Suivant */}
          {onNext && (
            <button
              onClick={onNext}
              className="text-slate-400 hover:text-slate-200 transition-colors"
              title="Verset suivant"
              type="button"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zm2.5-6l5.5 4V8z" /><path d="M16 6h2v12h-2z"/>
              </svg>
            </button>
          )}

          {/* Temps */}
          <span className="text-xs text-slate-500 min-w-[60px]">
            {formatTime(progress)} / {formatTime(duration)}
          </span>

          {/* Récitateur picker */}
          <div className="ml-auto relative">
            <button
              onClick={() => setShowReciterPicker(p => !p)}
              className="text-xs text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1"
              type="button"
            >
              🎙️ {currentReciter.nameFr.split(' ').slice(-1)[0]}
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </button>

            {showReciterPicker && (
              <div
                className="absolute bottom-8 right-0 rounded-xl shadow-2xl py-2 min-w-[220px] z-50"
                style={{
                  background: 'rgba(17,24,39,0.95)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {RECITERS.map(r => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setCurrentReciter(r)
                      setShowReciterPicker(false)
                      setPlaying(false)
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      r.id === currentReciter.id
                        ? 'text-amber-400 font-medium'
                        : 'text-slate-300 hover:text-slate-100 hover:bg-white/5'
                    }`}
                    type="button"
                  >
                    <div>{r.nameFr}</div>
                    <div
                      dir="rtl"
                      lang="ar"
                      className="text-xs text-slate-500 mt-0.5"
                      style={{ fontFamily: 'var(--font-amiri)' }}
                    >
                      {/* ⚠️ Nom arabe du récitateur — SACRÉ */}
                      {r.nameAr}
                    </div>
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
