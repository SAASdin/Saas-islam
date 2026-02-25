'use client'
// ============================================================
// RecitersClient.tsx — Récitateurs avec lecteur audio sourate
// ============================================================
import { useState, useRef, useEffect } from 'react'
import { getChapters } from '@/lib/quran-cdn-api'
import type { QdcChapter } from '@/lib/quran-cdn-api'

interface Reciter {
  id: number
  reciter_id: number
  name: string
  style: { name: string }
  qirat: { name: string }
  translated_name: { name: string }
}

interface Props {
  reciters: Reciter[]
}

const RECITER_AVATARS: Record<number, string> = {
  7: '🌟', 3: '🎵', 2: '📖', 6: '🎙️', 10: '✨', 1: '🕌',
  97: '🎤', 4: '🌙', 5: '⭐', 161: '🔊', 9: '🎶', 11: '🎼',
}

export default function RecitersClient({ reciters }: Props) {
  const [selectedReciter, setSelectedReciter] = useState<Reciter>(reciters[0])
  const [chapters, setChapters] = useState<QdcChapter[]>([])
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [loadingAudio, setLoadingAudio] = useState(false)
  const [currentChapter, setCurrentChapter] = useState<QdcChapter | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getChapters().then(({ chapters: chs }) => setChapters(chs))
  }, [])

  async function playChapter(reciterId: number, chapter: QdcChapter) {
    setLoadingAudio(true)
    setCurrentChapter(chapter)
    setAudioUrl(null)
    setIsPlaying(false)

    try {
      const r = await fetch(`https://api.qurancdn.com/api/qdc/audio/reciters/${reciterId}/audio_files?chapter=${chapter.id}`)
      const data = await r.json()
      const url = data.audio_files?.[0]?.audio_url
      if (url) {
        setAudioUrl(url)
        setIsPlaying(true)
      }
    } catch {
      setAudioUrl(null)
    } finally {
      setLoadingAudio(false)
    }
  }

  useEffect(() => {
    if (!audioRef.current) return
    if (audioUrl) {
      audioRef.current.src = audioUrl
      if (isPlaying) audioRef.current.play().catch(() => setIsPlaying(false))
    }
  }, [audioUrl])

  useEffect(() => {
    if (!audioRef.current) return
    if (isPlaying) audioRef.current.play().catch(() => setIsPlaying(false))
    else audioRef.current.pause()
  }, [isPlaying])

  const filteredChapters = chapters.filter(c =>
    !search || c.name_simple.toLowerCase().includes(search.toLowerCase()) ||
    c.name_arabic.includes(search) || String(c.id) === search
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl arabic-text text-white mb-1" dir="rtl" lang="ar">القراء</h1>
        <p className="text-slate-400 text-sm">{reciters.length} récitateurs · Riwayah Hafs 'an 'Asim</p>
      </div>

      {/* Sélecteur récitateur */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
        {reciters.map(r => (
          <button key={r.id} onClick={() => setSelectedReciter(r)}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
              selectedReciter.id === r.id
                ? 'bg-emerald-500/15 border-emerald-500/40'
                : 'bg-white/3 border-white/10 hover:bg-white/8'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
              selectedReciter.id === r.id ? 'bg-emerald-500/20' : 'bg-white/5'
            }`}>
              {RECITER_AVATARS[r.id] ?? '🎵'}
            </div>
            <div className="min-w-0">
              <p className={`text-sm font-medium truncate ${selectedReciter.id === r.id ? 'text-emerald-300' : 'text-white'}`}>
                {r.name}
              </p>
              <p className="text-slate-600 text-xs">{r.style?.name}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Player fixe si audio en cours */}
      {currentChapter && (
        <div className="sticky top-14 z-20 mb-6 bg-[#0d1526]/95 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-4">
            <div className="text-3xl">{RECITER_AVATARS[selectedReciter.id] ?? '🎵'}</div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">{selectedReciter.name}</p>
              <p className="arabic-text text-slate-400 text-xs" dir="rtl" lang="ar">
                {currentChapter.name_arabic} — {currentChapter.name_simple}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {loadingAudio ? (
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <button onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 bg-emerald-500 hover:bg-emerald-400 rounded-full flex items-center justify-center transition-colors">
                  {isPlaying ? (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>
          <audio ref={audioRef}
            onTimeUpdate={e => { const a = e.currentTarget; setProgress(a.currentTime / (a.duration || 1) * 100) }}
            onDurationChange={e => setDuration(e.currentTarget.duration)}
            onEnded={() => setIsPlaying(false)}
          />
          {duration > 0 && (
            <div className="mt-2">
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recherche sourate */}
      <div className="relative mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher une sourate…"
          className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500" />
      </div>

      {/* Liste sourates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {filteredChapters.map(ch => (
          <div key={ch.id}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              currentChapter?.id === ch.id
                ? 'border-emerald-500/40 bg-emerald-500/8'
                : 'border-white/8 bg-white/3 hover:bg-white/7'
            }`}
          >
            <span className="text-slate-500 text-xs font-mono w-6 text-right shrink-0">{ch.id}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate">{ch.name_simple}</p>
              <p className="arabic-text text-slate-500 text-xs" dir="rtl" lang="ar">{ch.name_arabic}</p>
            </div>
            <span className="text-slate-600 text-xs shrink-0">{ch.verses_count}v</span>
            <button
              onClick={() => playChapter(selectedReciter.id, ch)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                currentChapter?.id === ch.id && isPlaying
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-emerald-500/20 hover:text-emerald-400'
              }`}
            >
              {currentChapter?.id === ch.id && loadingAudio ? (
                <div className="w-3 h-3 border border-emerald-500 border-t-transparent rounded-full animate-spin" />
              ) : currentChapter?.id === ch.id && isPlaying ? (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
