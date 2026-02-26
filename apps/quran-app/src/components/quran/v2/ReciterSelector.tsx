'use client'
// ============================================================
// ReciterSelector.tsx — Sélecteur récitateur inline (dropdown)
// ============================================================
import { useState, useRef, useEffect } from 'react'
import { useSettings } from '@/store/settings'
import { RECITERS, RECITER_SLUGS } from '@/lib/quran-cdn-api'

export default function ReciterSelector() {
  const [open, setOpen] = useState(false)
  const { reciterId, setReciter } = useSettings()
  const ref = useRef<HTMLDivElement>(null)

  const current = RECITERS.find(r => r.id === reciterId) ?? RECITERS[0]

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 hover:border-white/20 rounded-lg text-xs text-slate-300 transition-colors"
      >
        <span className="text-emerald-400">🎙</span>
        <span className="max-w-24 truncate">{current.name.split(' ')[0]} {current.name.split(' ')[1]}</span>
        <svg className={`w-3 h-3 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-[#0d1526] border border-white/10 rounded-xl shadow-xl z-30 min-w-56 overflow-hidden">
          {RECITERS.map(r => (
            <button
              key={r.id}
              onClick={() => {
                setReciter(r.id, RECITER_SLUGS[r.id] ?? '')
                setOpen(false)
              }}
              className={`w-full text-left flex items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-white/5 ${
                r.id === reciterId ? 'bg-emerald-500/10 text-emerald-300' : 'text-slate-300'
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                r.id === reciterId ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-400'
              }`}>
                {r.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium">{r.name}</p>
                <p className="text-xs text-slate-500">{r.style}</p>
              </div>
              {r.id === reciterId && (
                <svg className="w-4 h-4 text-emerald-400 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
