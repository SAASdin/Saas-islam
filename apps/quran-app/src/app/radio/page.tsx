'use client'
// ============================================================
// /radio — Radio Coran en continu
// ============================================================
import { useState, useRef, useEffect } from 'react'
import type { Metadata } from 'next'

// Stations prédéfinies
const STATIONS = [
  {
    id: 'popular',
    name: 'Récitations Populaires',
    description: 'Mix de récitateurs célèbres',
    streamUrl: 'https://stream.radioislam.org.za:8000/quran',
    icon: '🎙️',
    color: 'emerald',
  },
  {
    id: 'alafasy',
    name: 'Mishary Rashid Al-Afasy',
    description: 'Récitation Murattal complète',
    streamUrl: 'https://Quranicaudio.com/quran/109',
    icon: '🌟',
    color: 'amber',
  },
  {
    id: 'sudais',
    name: 'Abdur-Rahman as-Sudais',
    description: 'Imam de la Mosquée Al-Haram',
    streamUrl: 'https://Quranicaudio.com/quran/4',
    icon: '🕌',
    color: 'blue',
  },
  {
    id: 'husary',
    name: 'Mahmoud Khalil Al-Husary',
    description: 'Murattal — référence mondiale',
    streamUrl: 'https://Quranicaudio.com/quran/5',
    icon: '📿',
    color: 'purple',
  },
  {
    id: 'yaseen',
    name: 'Yaseen · Al-Mulk · Al-Waqiah',
    description: 'Sourates de la nuit',
    streamUrl: 'https://Quranicaudio.com/quran/109',
    icon: '🌙',
    color: 'indigo',
  },
  {
    id: 'kahf',
    name: 'Sourate Al-Kahf',
    description: 'Récitation du vendredi',
    streamUrl: 'https://Quranicaudio.com/quran/97',
    icon: '🏔️',
    color: 'cyan',
  },
]

const RECITER_STATIONS = [
  { name: 'Ahmed ibn Ali al-Ajamy',      style: 'Murattal', id: 'ajamy' },
  { name: 'Abdulbaset Abd us-Samad',     style: 'Mujawwad', id: 'abdulbaset' },
  { name: 'Bandar Baleela',              style: 'Murattal', id: 'baleela' },
  { name: 'Maher Al-Muaiqly',           style: 'Murattal', id: 'muaiqly' },
  { name: 'Abu Bakr al-Shatri',         style: 'Murattal', id: 'shatri' },
  { name: 'Sa\'ud ash-Shuraim',         style: 'Murattal', id: 'shuraim' },
  { name: 'Mishari Rashid Al-Afasy',    style: 'Murattal', id: 'alafasy' },
  { name: 'Hani ar-Rifai',              style: 'Murattal', id: 'rifai' },
  { name: 'Mohamed Siddiq',             style: 'Murattal', id: 'siddiq' },
  { name: 'Saad al-Ghamdi',             style: 'Murattal', id: 'ghamdi' },
  { name: 'Mahmoud Khalil Al-Husary',   style: 'Murattal', id: 'husary' },
  { name: 'Khalifah Al Tunaiji',        style: 'Murattal', id: 'tunaiji' },
]

export default function RadioPage() {
  const [activeStation, setActiveStation] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const currentStation = STATIONS.find(s => s.id === activeStation)

  function playStation(id: string, url: string) {
    if (activeStation === id && isPlaying) {
      audioRef.current?.pause()
      setIsPlaying(false)
      return
    }
    setActiveStation(id)
    if (audioRef.current) {
      audioRef.current.src = url
      audioRef.current.play().catch(() => setIsPlaying(false))
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <audio ref={audioRef} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />

      <h1 className="text-2xl font-bold text-white mb-2">Radio Coran</h1>
      <p className="text-slate-400 text-sm mb-8">Écoute continue du Saint Coran</p>

      {/* Lecteur actif */}
      {currentStation && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 mb-8 flex items-center gap-4">
          <div className="text-4xl">{currentStation.icon}</div>
          <div className="flex-1">
            <p className="text-white font-semibold">{currentStation.name}</p>
            <p className="text-emerald-400/70 text-sm">{currentStation.description}</p>
            <div className={`flex items-center gap-2 mt-1 ${isPlaying ? '' : 'hidden'}`}>
              <span className="flex gap-0.5">
                {[...Array(4)].map((_, i) => (
                  <span key={i} className={`w-0.5 bg-emerald-400 rounded-full animate-bounce`}
                    style={{ height: `${12 + Math.random() * 12}px`, animationDelay: `${i * 0.1}s` }} />
                ))}
              </span>
              <span className="text-xs text-emerald-400">En direct</span>
            </div>
          </div>
          <button
            onClick={() => { audioRef.current?.pause(); setIsPlaying(false); setActiveStation(null) }}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Stations curatées */}
      <h2 className="text-lg font-semibold text-white mb-4">Stations curatées</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
        {STATIONS.map(station => (
          <button
            key={station.id}
            onClick={() => playStation(station.id, station.streamUrl)}
            className={`relative text-left p-4 rounded-xl border transition-all ${
              activeStation === station.id && isPlaying
                ? 'bg-emerald-500/15 border-emerald-500/50'
                : 'bg-white/3 border-white/10 hover:bg-white/6 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{station.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{station.name}</p>
                <p className="text-slate-500 text-xs truncate">{station.description}</p>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activeStation === station.id && isPlaying
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/10 text-slate-400'
              }`}>
                {activeStation === station.id && isPlaying ? (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Stations récitateurs */}
      <h2 className="text-lg font-semibold text-white mb-4">Stations Récitateurs</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {RECITER_STATIONS.map(r => (
          <button
            key={r.id}
            className="bg-white/3 hover:bg-white/6 border border-white/10 hover:border-white/20 rounded-xl p-3 text-left transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-700 to-emerald-900 flex items-center justify-center text-white font-bold text-sm mb-2">
              {r.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <p className="text-white text-xs font-medium leading-tight truncate">{r.name}</p>
            <p className="text-slate-500 text-xs mt-0.5">{r.style}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
