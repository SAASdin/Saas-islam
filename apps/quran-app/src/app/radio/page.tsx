'use client'
// ============================================================
// Radio Coran — Lecture continue par récitateur
// Source audio: download.quranicaudio.com/qdc/{slug}/murattal/{chapter}.mp3
// ============================================================
import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Station {
  id: number
  name: string
  nameAr: string
  slug: string
  style: string
  icon: string
  color: string
}

const STATIONS: Station[] = [
  { id: 7,  name: 'Mishari Al-Afasy',          nameAr: 'مشاري راشد العفاسي',    slug: 'mishari_al_afasy',         style: 'Murattal', icon: '🌟', color: 'emerald' },
  { id: 3,  name: 'Abdur-Rahman As-Sudais',    nameAr: 'عبدالرحمن السديس',      slug: 'sudais',                   style: 'Murattal', icon: '🕌', color: 'blue' },
  { id: 2,  name: 'AbdulBaset Murattal',       nameAr: 'عبدالباسط عبدالصمد',   slug: 'abdulbasit_murattal',      style: 'Murattal', icon: '📖', color: 'amber' },
  { id: 1,  name: 'AbdulBaset Mujawwad',       nameAr: 'عبدالباسط مجوّد',      slug: 'abdulbasit_mujawwad',      style: 'Mujawwad', icon: '🎵', color: 'purple' },
  { id: 6,  name: 'Mahmoud Al-Husary',         nameAr: 'محمود خليل الحصري',     slug: 'husary',                   style: 'Murattal', icon: '⭐', color: 'yellow' },
  { id: 10, name: "Sa'ud Ash-Shuraim",         nameAr: 'سعود الشريم',           slug: 'shuraim',                  style: 'Murattal', icon: '✨', color: 'teal' },
  { id: 4,  name: 'Abu Bakr Al-Shatri',        nameAr: 'أبو بكر الشاطري',      slug: 'abu_bakr_al_shatri',       style: 'Murattal', icon: '🎙️', color: 'rose' },
  { id: 97, name: 'Yasser Ad-Dussary',         nameAr: 'ياسر الدوسري',          slug: 'yasser_ad-dussary',        style: 'Murattal', icon: '🎤', color: 'indigo' },
]

const COLOR_MAP: Record<string, string> = {
  emerald: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
  blue: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
  amber: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
  purple: 'border-purple-500/40 bg-purple-500/10 text-purple-400',
  yellow: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400',
  teal: 'border-teal-500/40 bg-teal-500/10 text-teal-400',
  rose: 'border-rose-500/40 bg-rose-500/10 text-rose-400',
  indigo: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400',
}

const SURAH_NAMES = [
  'Al-Fatiha','Al-Baqarah','Āl ʿImrān','An-Nisāʾ','Al-Māʾida','Al-Anʿām','Al-Aʿrāf','Al-Anfāl','At-Tawba','Yūnus',
  'Hūd','Yūsuf','Ar-Raʿd','Ibrāhīm','Al-Ḥijr','An-Naḥl','Al-Isrāʾ','Al-Kahf','Maryam','Ṭāhā',
  'Al-Anbiyāʾ','Al-Ḥajj','Al-Muʾminūn','An-Nūr','Al-Furqān','Ash-Shuʿarāʾ','An-Naml','Al-Qaṣaṣ','Al-ʿAnkabūt','Ar-Rūm',
  'Luqmān','As-Sajda','Al-Aḥzāb','Sabaʾ','Fāṭir','Yā-Sīn','Aṣ-Ṣāffāt','Ṣād','Az-Zumar','Ghāfir',
  'Fuṣṣilat','Ash-Shūrā','Az-Zukhruf','Ad-Dukhān','Al-Jāthiya','Al-Aḥqāf','Muḥammad','Al-Fatḥ','Al-Ḥujurāt','Qāf',
  'Adh-Dhāriyāt','Aṭ-Ṭūr','An-Najm','Al-Qamar','Ar-Raḥmān','Al-Wāqiʿa','Al-Ḥadīd','Al-Mujādala','Al-Ḥashr','Al-Mumtaḥana',
  'Aṣ-Ṣaff','Al-Jumuʿa','Al-Munāfiqūn','At-Taghābun','Aṭ-Ṭalāq','At-Taḥrīm','Al-Mulk','Al-Qalam','Al-Ḥāqqa','Al-Maʿārij',
  'Nūḥ','Al-Jinn','Al-Muzzammil','Al-Muddaththir','Al-Qiyāma','Al-Insān','Al-Mursalāt','An-Nabaʾ','An-Nāziʿāt','ʿAbasa',
  'At-Takwīr','Al-Infiṭār','Al-Muṭaffifīn','Al-Inshiqāq','Al-Burūj','Aṭ-Ṭāriq','Al-Aʿlā','Al-Ghāshiya','Al-Fajr','Al-Balad',
  'Ash-Shams','Al-Layl','Aḍ-Ḍuḥā','Ash-Sharḥ','At-Tīn','Al-ʿAlaq','Al-Qadr','Al-Bayyina','Az-Zalzala','Al-ʿĀdiyāt',
  'Al-Qāriʿa','At-Takāthur','Al-ʿAṣr','Al-Humaza','Al-Fīl','Quraysh','Al-Māʿūn','Al-Kawthar','Al-Kāfirūn','An-Naṣr',
  'Al-Masad','Al-Ikhlāṣ','Al-Falaq','An-Nās',
]

function getAudioUrl(slug: string, chapter: number): string {
  const padded = String(chapter).padStart(3, '0')
  return `https://download.quranicaudio.com/qdc/${slug}/murattal/${padded}.mp3`
}

export default function RadioPage() {
  const [station, setStation] = useState<Station>(STATIONS[0])
  const [chapter, setChapter] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'continuous' | 'single' | 'shuffle'>('continuous')
  const audioRef = useRef<HTMLAudioElement>(null)

  const audioUrl = getAudioUrl(station.slug, chapter)

  const playChapter = useCallback((ch: number, autoplay = true) => {
    setChapter(ch)
    setProgress(0)
    setElapsed(0)
    setLoading(true)
    if (autoplay) setIsPlaying(true)
  }, [])

  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.src = audioUrl
    audioRef.current.load()
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false))
    }
  }, [audioUrl])

  useEffect(() => {
    if (!audioRef.current) return
    if (isPlaying) audioRef.current.play().catch(() => setIsPlaying(false))
    else audioRef.current.pause()
  }, [isPlaying])

  function handleEnded() {
    if (mode === 'single') {
      setIsPlaying(false)
      return
    }
    if (mode === 'shuffle') {
      const next = Math.floor(Math.random() * 114) + 1
      playChapter(next)
      return
    }
    // continuous
    const next = chapter < 114 ? chapter + 1 : 1
    playChapter(next)
  }

  function fmt(s: number) {
    const m = Math.floor(s / 60), sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2,'0')}`
  }

  const activeColor = COLOR_MAP[station.color] ?? COLOR_MAP.emerald

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl arabic-text text-white mb-1" dir="rtl" lang="ar">إذاعة القرآن الكريم</h1>
        <p className="text-slate-400 text-sm">Radio Coran · Lecture continue</p>
      </div>

      {/* Player principal */}
      <div className={`border rounded-2xl p-6 mb-6 ${activeColor.replace('text-', 'border-').split(' ')[0]} bg-white/5`}>
        <audio ref={audioRef}
          onCanPlay={() => setLoading(false)}
          onTimeUpdate={e => {
            const a = e.currentTarget
            setElapsed(a.currentTime)
            setTotal(a.duration)
            setProgress(a.currentTime / (a.duration || 1) * 100)
          }}
          onEnded={handleEnded}
          onPlay={() => setLoading(false)}
        />

        {/* Récitateur + sourate */}
        <div className="flex items-center gap-4 mb-5">
          <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center text-3xl ${activeColor}`}>
            {station.icon}
          </div>
          <div>
            <p className="text-white font-semibold">{station.name}</p>
            <p className="arabic-text text-slate-400 text-sm" dir="rtl" lang="ar">{station.nameAr}</p>
            <p className="text-emerald-400 text-sm mt-0.5">
              {String(chapter).padStart(3, '0')} — {SURAH_NAMES[chapter - 1]}
            </p>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mb-4">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer"
            onClick={e => {
              if (!audioRef.current) return
              const rect = e.currentTarget.getBoundingClientRect()
              const pct = (e.clientX - rect.left) / rect.width
              audioRef.current.currentTime = pct * audioRef.current.duration
            }}>
            <div className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between text-xs text-slate-600 mt-1">
            <span>{fmt(elapsed)}</span>
            <span>{fmt(total)}</span>
          </div>
        </div>

        {/* Contrôles */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => playChapter(chapter > 1 ? chapter - 1 : 114)}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
          </button>

          <button onClick={() => setIsPlaying(!isPlaying)}
            className={`w-14 h-14 rounded-full border flex items-center justify-center transition-all ${
              isPlaying ? 'bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-500/30' : 'bg-white/10 border-white/20 hover:bg-white/20'
            }`}>
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            ) : (
              <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>

          <button onClick={() => playChapter(chapter < 114 ? chapter + 1 : 1)}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zm2.5-6 6-4.3v8.5L8.5 12zM16 6h2v12h-2z"/></svg>
          </button>

          {/* Mode */}
          <button onClick={() => setMode(m => m === 'continuous' ? 'single' : m === 'single' ? 'shuffle' : 'continuous')}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors text-sm"
            title={mode}>
            {mode === 'continuous' ? '🔁' : mode === 'single' ? '🔂' : '🔀'}
          </button>
        </div>
      </div>

      {/* Sélecteur stations */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {STATIONS.map(s => (
          <button key={s.id}
            onClick={() => { setStation(s); setIsPlaying(true) }}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
              station.id === s.id ? COLOR_MAP[s.color] : 'border-white/10 bg-white/4 text-slate-400 hover:bg-white/8'
            }`}>
            <span className="text-xl">{s.icon}</span>
            <span className="text-xs font-medium text-center leading-tight line-clamp-2">{s.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Liste sourates */}
      <div>
        <p className="text-slate-500 text-xs mb-3">Sélectionner une sourate :</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-96 overflow-y-auto pr-1">
          {SURAH_NAMES.map((name, i) => (
            <button key={i+1}
              onClick={() => { playChapter(i + 1) }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all ${
                chapter === i+1
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                  : 'bg-white/3 border border-white/8 text-slate-400 hover:bg-white/7 hover:text-white'
              }`}>
              <span className="text-xs font-mono text-slate-600 w-5 text-right shrink-0">{i+1}</span>
              <span className="text-xs truncate">{name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
