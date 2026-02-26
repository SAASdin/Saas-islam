'use client'
// ============================================================
// AyahAudio.tsx — Lecteur audio pour un verset
// CDN : cdn.islamic.network/quran/audio/128/{reciter}/{ayahNumberQuran}.mp3
// ============================================================

import { useState, useRef, useCallback } from 'react'
import { getAyahAudioUrl, RECITERS, type ReciterKey } from '@/lib/api/quran'

interface AyahAudioProps {
  ayahNumberQuran: number  // Numéro global 1–6236
  surahId: number
  ayahNumber: number       // Numéro dans la sourate (pour l'affichage)
  defaultReciter?: ReciterKey
  className?: string
}

export default function AyahAudio({
  ayahNumberQuran,
  surahId: _surahId, // eslint-disable-line @typescript-eslint/no-unused-vars
  ayahNumber,
  defaultReciter = 'alafasy',
  className = '',
}: AyahAudioProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [reciter, setReciter] = useState<ReciterKey>(defaultReciter)
  const [showReciterMenu, setShowReciterMenu] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const togglePlay = useCallback(async () => {
    if (isLoading) return

    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.onended = () => setIsPlaying(false)
      audioRef.current.onerror = () => { setIsLoading(false); setIsPlaying(false) }
    }

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
      return
    }

    setIsLoading(true)
    const url = getAyahAudioUrl(ayahNumberQuran, reciter)
    audioRef.current.src = url
    audioRef.current.load()

    try {
      await audioRef.current.play()
      setIsPlaying(true)
    } catch {
      setIsPlaying(false)
    } finally {
      setIsLoading(false)
    }
  }, [isPlaying, isLoading, ayahNumberQuran, reciter])

  const changeReciter = useCallback((key: ReciterKey) => {
    // Arrêter la lecture en cours
    if (audioRef.current && isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
    setReciter(key)
    setShowReciterMenu(false)
  }, [isPlaying])

  return (
    <div className={`relative flex items-center gap-1 ${className}`}>
      {/* Bouton play/pause */}
      <button
        onClick={togglePlay}
        disabled={isLoading}
        className="p-2 rounded-lg transition-colors"
        style={{
          color: isPlaying ? '#22c55e' : '#64748b',
          background: isPlaying ? 'rgba(34,197,94,0.1)' : 'transparent',
        }}
        aria-label={isPlaying
          ? `Pause verset ${ayahNumber}`
          : `Écouter verset ${ayahNumber} — ${RECITERS[reciter].nameFr}`
        }
        title={`Verset ${ayahNumber} — ${RECITERS[reciter].nameFr}`}
      >
        {isLoading ? (
          <span className="animate-spin text-xs">⟳</span>
        ) : isPlaying ? (
          <span>⏸</span>
        ) : (
          <span>▶</span>
        )}
      </button>

      {/* Sélecteur de récitateur */}
      <div className="relative">
        <button
          onClick={() => setShowReciterMenu(m => !m)}
          className="p-1.5 rounded text-slate-500 hover:text-slate-300 text-xs transition-colors"
          aria-label="Changer de récitateur"
          title={RECITERS[reciter].nameFr}
        >
          🎙
        </button>

        {showReciterMenu && (
          <div
            className="absolute bottom-full right-0 mb-1 rounded-lg overflow-hidden z-10 min-w-[180px]"
            style={{
              background: 'rgba(15,23,42,0.98)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            }}
          >
            {(Object.entries(RECITERS) as [ReciterKey, typeof RECITERS[ReciterKey]][]).map(([key, r]) => (
              <button
                key={key}
                onClick={() => changeReciter(key)}
                className="w-full px-3 py-2 text-left text-xs transition-colors hover:bg-white/5"
                style={{ color: key === reciter ? '#22c55e' : '#94a3b8' }}
              >
                {key === reciter && '✓ '}
                {r.nameFr}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
