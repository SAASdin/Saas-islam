'use client'
// ============================================================
// AyahAudio.tsx — Lecteur audio récitations coraniques multi-récitateurs
// Source : everyayah.com (gratuit, haute qualité, 5 récitateurs)
// ⚠️  SACRÉ — nameAr des récitateurs JAMAIS modifié
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAyahAudio, type CurrentAyah } from '@/hooks/useAyahAudio'
import { RECITERS, DEFAULT_RECITER_ID } from '@/lib/reciters'

interface AyahAudioProps {
  surahNumber: number
  /** Numéro du verset ciblé par ce bouton (dans la sourate) */
  ayahNumber: number
  /** Nombre total de versets dans la sourate (pour le mode lecture continue) */
  totalAyahs: number
  defaultReciterId?: string
  /**
   * Callback appelé quand le verset actif change (mode lecture continue).
   * Permet au parent de gérer le scroll automatique et le highlight.
   */
  onCurrentAyahChange?: (ayahNumber: number) => void
  className?: string
}

export default function AyahAudio({
  surahNumber,
  ayahNumber,
  totalAyahs,
  defaultReciterId = DEFAULT_RECITER_ID,
  onCurrentAyahChange,
  className = '',
}: AyahAudioProps) {
  const [continuousMode, setContinuousMode] = useState(false)
  const [showReciterMenu, setShowReciterMenu] = useState(false)
  const [activeAyah, setActiveAyah] = useState<number>(ayahNumber)
  const menuRef = useRef<HTMLDivElement>(null)

  // Refs stables pour les valeurs mutables utilisées dans les callbacks
  const continuousModeRef = useRef(continuousMode)
  const playFnRef         = useRef<((s: number, a: number, r?: string) => void) | null>(null)
  const reciterIdRef      = useRef(defaultReciterId)

  useEffect(() => { continuousModeRef.current = continuousMode }, [continuousMode])

  // Callback : passage au verset suivant en fin de lecture
  const handleEnded = useCallback(
    (current: CurrentAyah) => {
      if (continuousModeRef.current && current.ayah < totalAyahs) {
        playFnRef.current?.(current.surah, current.ayah + 1, reciterIdRef.current)
      }
    },
    [totalAyahs]
  )

  // Callback : nouveau verset actif → notify parent
  const handleAyahChange = useCallback(
    (current: CurrentAyah) => {
      setActiveAyah(current.ayah)
      onCurrentAyahChange?.(current.ayah)
    },
    [onCurrentAyahChange]
  )

  const audio = useAyahAudio({ onEnded: handleEnded, onAyahChange: handleAyahChange })

  // Synchroniser les refs après l'init du hook
  useEffect(() => { playFnRef.current = audio.play },             [audio.play])
  useEffect(() => { reciterIdRef.current = audio.currentReciterId }, [audio.currentReciterId])

  // Fermer le menu si clic en dehors
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowReciterMenu(false)
      }
    }
    if (showReciterMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showReciterMenu])

  // Ce composant gère-t-il le verset actuellement chargé ?
  const isThisAyahActive =
    audio.currentAyah?.surah === surahNumber &&
    audio.currentAyah?.ayah  === ayahNumber

  const isThisAyahPlaying = audio.isPlaying  && isThisAyahActive
  const isThisAyahLoading = audio.isLoading  && isThisAyahActive
  const isThisAyahPaused  = !audio.isPlaying && isThisAyahActive && audio.duration > 0

  function handlePlayPause() {
    if (isThisAyahPlaying) {
      audio.pause()
    } else if (isThisAyahPaused) {
      // Reprendre le verset mis en pause
      audio.resume()
    } else {
      // Démarrer ce verset (arrête tout autre verset en cours)
      audio.play(surahNumber, ayahNumber, audio.currentReciterId)
    }
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    audio.seek(Number(e.target.value))
  }

  function formatTime(s: number): string {
    if (!isFinite(s) || isNaN(s) || s < 0) return '0:00'
    const m   = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const reciter = RECITERS[audio.currentReciterId] ?? RECITERS[DEFAULT_RECITER_ID]

  return (
    <div className={`flex flex-col gap-2 ${className}`}>

      {/* ── Rangée principale : play + barre + mode + récitateur ──── */}
      <div className="flex items-center gap-2 flex-wrap">

        {/* ── Bouton Play / Pause ───────────────────────────────── */}
        <button
          onClick={handlePlayPause}
          disabled={isThisAyahLoading}
          type="button"
          className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 flex-shrink-0 disabled:opacity-50"
          style={{
            background: isThisAyahPlaying
              ? 'linear-gradient(135deg, #d4af37 0%, #b8962a 100%)'
              : 'rgba(255,255,255,0.06)',
            border: `1px solid ${isThisAyahPlaying
              ? 'rgba(212,175,55,0.6)'
              : 'rgba(255,255,255,0.12)'}`,
            color:     isThisAyahPlaying ? '#0a0f1e' : '#94a3b8',
            boxShadow: isThisAyahPlaying ? '0 0 16px rgba(212,175,55,0.35)' : 'none',
          }}
          aria-label={
            isThisAyahPlaying
              ? 'Pause'
              : `Écouter verset ${ayahNumber} — ${reciter.nameFr}`
          }
          title={
            isThisAyahPlaying
              ? 'Pause'
              : `Écouter — ${reciter.nameFr}`
          }
        >
          {isThisAyahLoading ? (
            /* Spinner chargement */
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : isThisAyahPlaying ? (
            /* Icône pause — animation pulse subtile */
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          ) : (
            /* Icône play */
            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>

        {/* ── Barre de progression (visible si verset actif chargé) ── */}
        {isThisAyahActive && audio.duration > 0 && (
          <div className="flex items-center gap-2 flex-1 min-w-[140px]">
            <span className="text-xs tabular-nums w-8 text-right" style={{ color: '#64748b' }}>
              {formatTime(audio.progress)}
            </span>
            <input
              type="range"
              min={0}
              max={audio.duration}
              step={0.1}
              value={audio.progress}
              onChange={handleSeek}
              className="flex-1 h-1 rounded-full cursor-pointer"
              style={{ accentColor: '#d4af37' }}
              aria-label="Position dans le verset"
            />
            <span className="text-xs tabular-nums w-8" style={{ color: '#475569' }}>
              {formatTime(audio.duration)}
            </span>
          </div>
        )}

        {/* ── Bouton mode lecture continue ─────────────────────── */}
        <button
          onClick={() => setContinuousMode(m => !m)}
          type="button"
          className="px-2.5 py-1 rounded-md text-xs transition-all duration-200 flex items-center gap-1.5 flex-shrink-0"
          style={{
            background: continuousMode
              ? 'rgba(26,127,75,0.18)'
              : 'rgba(255,255,255,0.05)',
            border: `1px solid ${continuousMode
              ? 'rgba(26,127,75,0.45)'
              : 'rgba(255,255,255,0.10)'}`,
            color: continuousMode ? '#22c55e' : '#64748b',
          }}
          title={
            continuousMode
              ? 'Désactiver lecture continue'
              : 'Activer lecture continue (toute la sourate)'
          }
          aria-pressed={continuousMode}
        >
          {/* Icône "lecture en boucle" */}
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
          </svg>
          <span>{continuousMode ? 'Continue' : 'Auto'}</span>
        </button>

        {/* ── Sélecteur de récitateur ───────────────────────────── */}
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={() => setShowReciterMenu(m => !m)}
            type="button"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: '#94a3b8',
            }}
            aria-label={`Récitateur : ${reciter.nameFr}`}
            aria-expanded={showReciterMenu}
            title="Changer de récitateur"
          >
            {/* Icône microphone */}
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor"
              viewBox="0 0 24 24" aria-hidden="true"
              style={{ color: '#f59e0b' }}
            >
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
            <span className="max-w-[80px] truncate">
              {reciter.nameFr.split(' ').slice(-1)[0]}
            </span>
            <svg className="w-3 h-3 flex-shrink-0 transition-transform duration-200"
              fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"
              style={{ transform: showReciterMenu ? 'rotate(180deg)' : undefined }}
            >
              <path d="M7 10l5 5 5-5z"/>
            </svg>
          </button>

          {/* Dropdown récitateurs */}
          {showReciterMenu && (
            <div
              className="absolute bottom-full right-0 mb-1.5 rounded-xl overflow-hidden z-50 py-1"
              style={{
                background: 'rgba(10,15,30,0.97)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.10)',
                boxShadow: '0 -8px 32px rgba(0,0,0,0.6)',
                minWidth: '230px',
              }}
              role="listbox"
              aria-label="Choisir un récitateur"
            >
              {Object.values(RECITERS).map(r => {
                const isSelected = r.id === audio.currentReciterId
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      audio.setReciter(r.id)
                      setShowReciterMenu(false)
                    }}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className="w-full text-left px-4 py-2.5 transition-colors hover:bg-white/5"
                  >
                    {/* Nom français */}
                    <div
                      className="text-sm flex items-center gap-1.5"
                      style={{ color: isSelected ? '#d4af37' : '#e2e8f0' }}
                    >
                      {isSelected && (
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor"
                          viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                        </svg>
                      )}
                      {r.nameFr}
                    </div>
                    {/* ⚠️ Nom arabe — ZONE SACRÉE — ne jamais modifier nameAr */}
                    <div
                      dir="rtl"
                      lang="ar"
                      className="text-xs mt-0.5"
                      style={{
                        color: '#64748b',
                        fontFamily: 'var(--font-amiri, "Amiri", serif)',
                      }}
                    >
                      {r.nameAr}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Indicateur verset actif (mode lecture continue) ────── */}
      {continuousMode && audio.isPlaying && audio.currentAyah?.surah === surahNumber && (
        <p
          className="text-xs flex items-center gap-1.5"
          style={{ color: '#22c55e' }}
          aria-live="polite"
          aria-atomic="true"
        >
          {/* Indicateur animation */}
          <span className="inline-flex items-center gap-0.5" aria-hidden="true">
            <span className="w-1 h-3 rounded-full animate-pulse" style={{ background: '#22c55e', animationDelay: '0ms' }}/>
            <span className="w-1 h-4 rounded-full animate-pulse" style={{ background: '#22c55e', animationDelay: '150ms' }}/>
            <span className="w-1 h-2 rounded-full animate-pulse" style={{ background: '#22c55e', animationDelay: '300ms' }}/>
          </span>
          Verset {activeAyah} / {totalAyahs}
        </p>
      )}
    </div>
  )
}
