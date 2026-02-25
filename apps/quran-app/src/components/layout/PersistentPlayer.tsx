'use client'
// ============================================================
// PersistentPlayer.tsx — Lecteur audio fixe en bas
// Identique au player persistant de Quran.com
// ============================================================
import { useRef, useEffect, useCallback } from 'react'
import { usePlayer } from '@/store/player'
import { getVerseAudioUrl } from '@/lib/quran-cdn-api'

function formatTime(s: number): string {
  if (!isFinite(s) || isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function PersistentPlayer() {
  const {
    isPlaying, currentVerse, currentSurahName,
    reciterName, reciterSlug,
    duration, currentTime, playbackSpeed, volume, repeatMode, showPlayer,
    setPlaying, setProgress, setVolume,
    nextVerse, prevVerse, closePlayer,
  } = usePlayer()

  const audioRef = useRef<HTMLAudioElement>(null)

  // Change src quand le verset change
  useEffect(() => {
    if (!currentVerse || !audioRef.current) return
    const [s, a] = currentVerse.split(':').map(Number)
    const url = getVerseAudioUrl(reciterSlug, s, a)
    audioRef.current.src = url
    audioRef.current.playbackRate = playbackSpeed
    audioRef.current.volume = volume
    if (isPlaying) {
      audioRef.current.play().catch(() => setPlaying(false))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentVerse, reciterSlug])

  // Play/pause
  useEffect(() => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.play().catch(() => setPlaying(false))
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying, setPlaying])

  // Vitesse
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackSpeed
  }, [playbackSpeed])

  const handleEnded = useCallback(() => {
    if (repeatMode === 'verse') {
      audioRef.current?.play().catch(() => {})
    } else {
      setPlaying(false)
      nextVerse()
    }
  }, [repeatMode, nextVerse, setPlaying])

  if (!showPlayer || !currentVerse) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const [surahNum, ayahNum] = currentVerse.split(':')

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-[#070d1a]/98 border-t border-white/10 backdrop-blur-md flex items-center px-4 gap-3">
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime, e.currentTarget.duration || 0)}
        onEnded={handleEnded}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* Info verset */}
      <div className="flex items-center gap-3 w-44 shrink-0 min-w-0">
        <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-bold shrink-0">
          {reciterName.split(' ').map(w => w[0]).slice(0,2).join('')}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-white font-medium truncate">{currentSurahName}</p>
          <p className="text-xs text-slate-500 truncate">
            {surahNum}:{ayahNum} · {reciterName.split(' ')[0]}
          </p>
        </div>
      </div>

      {/* Contrôles centraux */}
      <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
        {/* Boutons */}
        <div className="flex items-center gap-3">
          <button
            onClick={prevVerse}
            className="text-slate-400 hover:text-white transition-colors"
            title="Verset précédent"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
            </svg>
          </button>

          <button
            onClick={() => setPlaying(!isPlaying)}
            className="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center text-white transition-colors shadow-lg"
            title={isPlaying ? 'Pause' : 'Lecture'}
          >
            {isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          <button
            onClick={nextVerse}
            className="text-slate-400 hover:text-white transition-colors"
            title="Verset suivant"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798L4.555 5.168z" />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-sm flex items-center gap-2">
          <span className="text-xs text-slate-500 w-8 text-right tabular-nums">{formatTime(currentTime)}</span>
          <div
            className="flex-1 h-1 bg-white/10 rounded-full cursor-pointer relative group"
            onClick={(e) => {
              if (!audioRef.current) return
              const rect = e.currentTarget.getBoundingClientRect()
              const pct = (e.clientX - rect.left) / rect.width
              audioRef.current.currentTime = pct * duration
            }}
          >
            <div
              className="h-full bg-emerald-400 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2"
              style={{ left: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-slate-500 w-8 tabular-nums">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume + Close */}
      <div className="hidden sm:flex items-center gap-3 w-36 shrink-0 justify-end">
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          <input
            type="range" min="0" max="1" step="0.05" value={volume}
            onChange={(e) => {
              const v = parseFloat(e.target.value)
              setVolume(v)
              if (audioRef.current) audioRef.current.volume = v
            }}
            className="w-16 accent-emerald-400 cursor-pointer"
          />
        </div>
        <button
          onClick={closePlayer}
          className="text-slate-500 hover:text-white transition-colors p-1"
          title="Fermer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
