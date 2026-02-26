'use client'
// ============================================================
// TafsirReaderClient.tsx — Lecteur interactif tafsir audio
// ZONE SACRÉE : le texte `data` et `ayahs` ne doit JAMAIS être
// modifié, trimmé, lowercasé ou altéré — formatage visuel UNIQUEMENT
// ============================================================
import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  TAFSIR_ONE_BOOKS,
  SUWAR,
  getSurahAudioUrl,
  type TafsirPage,
} from '@/lib/tafsir-one-api'

interface TafsirReaderClientProps {
  tafsir: string
  surah: number
  initialData: TafsirPage | null
}

// ── Formatage du texte tafsir ──────────────────────────────
// ZONE SACRÉE : on ne modifie JAMAIS le contenu, uniquement la présentation visuelle
// Regex pour détecter les numéros d'ayah arabes au début d'une ligne : ١- ou ١٢-
const AYAH_NUM_REGEX = /^([٠١٢٣٤٥٦٧٨٩]+)-\s/

function formatTafsirData(data: string): React.ReactNode[] {
  // On split par \n pour séparer les ayahs — le texte lui-même n'est pas modifié
  const lines = data.split('\n')
  return lines.map((line, i) => {
    if (!line) return <div key={i} className="h-2" />

    const match = line.match(AYAH_NUM_REGEX)
    // Le texte après le numéro — on ne touche PAS à ce contenu
    const restOfLine = match ? line.slice(match[0].length) : line
    const ayahNum = match ? match[1] : null

    // Parser les citations coraniques ﴿...﴾ — contenu SACRÉ, affichage uniquement
    const parts = restOfLine.split(/(﴿[^﴾]*﴾)/g)
    const formattedParts = parts.map((part, j) => {
      if (part.startsWith('﴿') && part.endsWith('﴾')) {
        return (
          <span
            key={j}
            style={{ color: '#d4af37', fontFamily: 'var(--font-amiri)', fontSize: '1.1em' }}
            dir="rtl"
            lang="ar"
          >
            {part}
          </span>
        )
      }
      return <span key={j}>{part}</span>
    })

    return (
      <div
        key={i}
        className="flex gap-3 items-start mb-4 pb-4 border-b border-white/5 last:border-0"
        dir="rtl"
        lang="ar"
      >
        {ayahNum && (
          <span
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border border-[#d4af37]/40 text-[#d4af37] bg-[#d4af37]/10 mt-0.5"
            style={{ fontFamily: 'var(--font-amiri)' }}
            dir="rtl"
            lang="ar"
          >
            {ayahNum}
          </span>
        )}
        <p
          className="flex-1 text-white/90 leading-[2.1] text-[1rem]"
          style={{ fontFamily: 'var(--font-amiri)' }}
          dir="rtl"
          lang="ar"
        >
          {formattedParts}
        </p>
      </div>
    )
  })
}

// ── Formatage temps audio ─────────────────────────────────
function formatTime(s: number): string {
  if (!isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

const SPEEDS = [0.75, 1, 1.25, 1.5, 2]

// ── Composant principal ───────────────────────────────────
export default function TafsirReaderClient({
  tafsir,
  surah,
  initialData,
}: TafsirReaderClientProps) {
  const router = useRouter()
  const book = TAFSIR_ONE_BOOKS[tafsir]

  // ── State ─────────────────────────────────────────────
  const [currentSurah, setCurrentSurah] = useState(surah)
  const [tafsirData, setTafsirData] = useState<TafsirPage | null>(initialData)
  const [loadingContent, setLoadingContent] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Audio state
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const [audioCurrentTime, setAudioCurrentTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [speedIndex, setSpeedIndex] = useState(1) // 1x par défaut

  const surahInfo = SUWAR[currentSurah - 1]
  const surahName = surahInfo?.[1] ?? ''
  const audioUrl = book?.hasAudio ? getSurahAudioUrl(tafsir, currentSurah) : null

  // ── Naviguer vers une sourate ─────────────────────────
  const navigateToSurah = useCallback(
    (num: number) => {
      if (num < 1 || num > 114) return
      router.push(`/tafsir-audio/${tafsir}?s=${num}&a=1`)
      setCurrentSurah(num)
      setSidebarOpen(false)
      setIsPlaying(false)
      setAudioProgress(0)
      setAudioCurrentTime(0)
    },
    [router, tafsir],
  )

  // Charger dynamiquement si la sourate change côté client
  useEffect(() => {
    if (surah === currentSurah && initialData) {
      setTafsirData(initialData)
      return
    }
    setLoadingContent(true)
    fetch(`https://read.tafsir.one/get.php?uth&src=${tafsir}&s=${currentSurah}&a=1`)
      .then((r) => r.json())
      .then((json) => {
        setTafsirData({
          ayah: json.ayah ?? '',
          data: json.data ?? '',
          ayahs: json.ayahs ?? [],
          ayahs_start: json.ayahs_start ?? 1,
        })
      })
      .catch(() => setTafsirData(null))
      .finally(() => setLoadingContent(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSurah, tafsir])

  // ── Audio events ──────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => {
      setAudioCurrentTime(audio.currentTime)
      if (audio.duration && isFinite(audio.duration)) {
        setAudioProgress((audio.currentTime / audio.duration) * 100)
      }
    }
    const onLoadedMetadata = () => {
      setAudioDuration(audio.duration)
    }
    const onEnded = () => {
      setIsPlaying(false)
      setAudioProgress(100)
    }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  // Mettre à jour la source audio quand la sourate change
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !audioUrl) return
    audio.src = audioUrl
    audio.load()
    audio.playbackRate = SPEEDS[speedIndex]
    setAudioProgress(0)
    setAudioCurrentTime(0)
    setAudioDuration(0)
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSurah, audioUrl])

  // Mettre à jour la vitesse
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = SPEEDS[speedIndex]
    }
  }, [speedIndex])

  function togglePlay() {
    const audio = audioRef.current
    if (!audio || !audioUrl) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
    }
  }

  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    audio.currentTime = ratio * audio.duration
  }

  function cycleSpeed() {
    setSpeedIndex((prev) => (prev + 1) % SPEEDS.length)
  }

  // ── Rendu ─────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden bg-[#0a0f1e]">
      {/* ── Overlay sidebar mobile ── */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-20 bg-black/60"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar sourates ── */}
      <aside
        className={`
          fixed lg:relative z-30 lg:z-auto
          top-14 lg:top-0
          h-[calc(100vh-3.5rem)] lg:h-full
          w-64 shrink-0
          bg-[#0c1322] border-r border-white/10
          flex flex-col
          transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Titre sidebar */}
        <div className="px-4 py-3 border-b border-white/10 shrink-0 flex items-center justify-between">
          <h2
            className="text-sm font-semibold text-[#d4af37]"
            dir="rtl"
            lang="ar"
            style={{ fontFamily: 'var(--font-amiri)' }}
          >
            قائمة السور
          </h2>
          <button
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* Liste sourates */}
        <div className="flex-1 overflow-y-auto">
          {SUWAR.map(([, name], idx) => {
            const num = idx + 1
            const isActive = num === currentSurah
            return (
              <button
                key={num}
                onClick={() => navigateToSurah(num)}
                className={`w-full flex items-center gap-2 px-4 py-2.5 text-left transition-colors border-b border-white/5 ${
                  isActive
                    ? 'bg-[#d4af37]/15 border-l-2 border-l-[#d4af37]'
                    : 'hover:bg-white/5'
                }`}
              >
                <span
                  className={`text-xs font-mono w-6 text-right shrink-0 ${isActive ? 'text-[#d4af37]' : 'text-slate-600'}`}
                >
                  {num}
                </span>
                <span
                  className={`text-sm ${isActive ? 'text-[#d4af37] font-semibold' : 'text-slate-300 hover:text-white'}`}
                  style={{ fontFamily: 'var(--font-amiri)' }}
                  dir="rtl"
                  lang="ar"
                >
                  {name}
                </span>
              </button>
            )
          })}
        </div>
      </aside>

      {/* ── Zone principale ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header contenu */}
        <div className="shrink-0 px-5 py-3 border-b border-white/10 bg-[#0c1322] flex items-center gap-3">
          {/* Bouton sidebar mobile */}
          <button
            className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h1
                className="text-base font-semibold text-white"
                dir="rtl"
                lang="ar"
                style={{ fontFamily: 'var(--font-amiri)' }}
              >
                {book?.title ?? tafsir}
              </h1>
              <span className="text-slate-500 text-sm">·</span>
              <span
                className="text-[#d4af37] text-sm font-medium"
                dir="rtl"
                lang="ar"
                style={{ fontFamily: 'var(--font-amiri)' }}
              >
                سورة {surahName}
              </span>
              <span className="text-slate-600 text-xs">({currentSurah}/114)</span>
            </div>
          </div>

          {/* Navigation prev/next */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigateToSurah(currentSurah - 1)}
              disabled={currentSurah <= 1}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Sourate précédente"
            >
              ← السابقة
            </button>
            <button
              onClick={() => navigateToSurah(currentSurah + 1)}
              disabled={currentSurah >= 114}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Sourate suivante"
            >
              التالية →
            </button>
          </div>
        </div>

        {/* Contenu tafsir */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          {/* Bismillah (sauf sourate 1 et 9) */}
          {currentSurah !== 1 && currentSurah !== 9 && (
            <p
              className="text-center text-2xl mb-6 text-[#d4af37]"
              style={{ fontFamily: 'var(--font-amiri)' }}
              dir="rtl"
              lang="ar"
            >
              بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
            </p>
          )}

          {/* Texte de l'ayah courante (arabe) */}
          {tafsirData?.ayah && (
            <div
              className="bg-white/5 border border-[#d4af37]/20 rounded-xl p-5 mb-6"
              dir="rtl"
              lang="ar"
            >
              <p
                className="text-xl leading-loose text-center text-white"
                style={{ fontFamily: 'var(--font-amiri)' }}
                dir="rtl"
                lang="ar"
              >
                {tafsirData.ayah}
              </p>
            </div>
          )}

          {/* Loading */}
          {loadingContent && (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Texte tafsir formaté */}
          {!loadingContent && tafsirData?.data && (
            <div dir="rtl" lang="ar">
              {formatTafsirData(tafsirData.data)}
            </div>
          )}

          {/* Message si pas de données */}
          {!loadingContent && !tafsirData && (
            <div className="text-center py-16 text-slate-500">
              <p>لا تتوفر بيانات لهذه السورة</p>
              <p className="text-sm mt-2">Données non disponibles pour cette sourate</p>
            </div>
          )}

          {/* Bouton sourate suivante */}
          {!loadingContent && tafsirData && currentSurah < 114 && (
            <div className="mt-8 pt-6 border-t border-white/10 flex justify-center">
              <button
                onClick={() => navigateToSurah(currentSurah + 1)}
                className="flex items-center gap-2 px-6 py-3 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/30 hover:border-[#d4af37]/60 text-[#d4af37] rounded-xl transition-all"
                dir="rtl"
                lang="ar"
              >
                <span style={{ fontFamily: 'var(--font-amiri)' }}>
                  السورة التالية: {SUWAR[currentSurah]?.[1]}
                </span>
                <span>←</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ── Player audio sticky bottom ── */}
      {audioUrl && (
        <>
          {/* Element audio caché */}
          <audio ref={audioRef} preload="metadata" />

          <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0c1322]/98 border-t border-[#d4af37]/20 backdrop-blur-sm px-4 py-2.5">
            <div className="max-w-4xl mx-auto">
              {/* Titre + vitesse */}
              <div className="flex items-center justify-between mb-2">
                <p
                  className="text-xs text-slate-400 truncate"
                  dir="rtl"
                  lang="ar"
                  style={{ fontFamily: 'var(--font-amiri)' }}
                >
                  تفسير سورة {surahName} — {book?.title}
                </p>
                <button
                  onClick={cycleSpeed}
                  className="text-xs text-slate-400 hover:text-[#d4af37] bg-white/5 hover:bg-[#d4af37]/10 border border-white/10 hover:border-[#d4af37]/30 rounded-full px-2.5 py-0.5 transition-all ml-3 shrink-0"
                >
                  {SPEEDS[speedIndex]}x
                </button>
              </div>

              {/* Contrôles + barre */}
              <div className="flex items-center gap-3">
                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className="shrink-0 w-9 h-9 rounded-full bg-[#d4af37] hover:bg-[#c9a02e] text-black flex items-center justify-center transition-colors"
                >
                  {isPlaying ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>

                {/* Temps */}
                <span className="text-xs text-slate-500 w-10 text-right shrink-0">
                  {formatTime(audioCurrentTime)}
                </span>

                {/* Barre de progression */}
                <div
                  className="flex-1 h-1.5 bg-white/10 rounded-full cursor-pointer group"
                  onClick={handleProgressClick}
                >
                  <div
                    className="h-full bg-[#d4af37] rounded-full relative transition-all"
                    style={{ width: `${audioProgress}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#d4af37] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                {/* Durée totale */}
                <span className="text-xs text-slate-500 w-10 shrink-0">
                  {formatTime(audioDuration)}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
