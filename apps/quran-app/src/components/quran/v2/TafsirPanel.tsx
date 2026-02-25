'use client'
// ============================================================
// TafsirPanel.tsx — Panneau Tafsir slide-over
// Position : fixed right, z-40
// ============================================================
import { useState, useEffect } from 'react'
import { getTafsirByVerse } from '@/lib/quran-cdn-api'
import { sanitizeLight } from '@/lib/sanitize'

const TAFSIRS = [
  { id: 16,  name: 'Tafsir Muyassar',  lang: 'ar' as const,  flag: '🇸🇦' },
  { id: 14,  name: 'Ibn Kathir (AR)',   lang: 'ar' as const,  flag: '🇸🇦' },
  { id: 169, name: 'Ibn Kathir (EN)',   lang: 'en' as const,  flag: '🇬🇧' },
  { id: 90,  name: 'Al-Qurtubi (AR)',   lang: 'ar' as const,  flag: '🇸🇦' },
]

interface TafsirPanelProps {
  isOpen: boolean
  onClose: () => void
  verseKey: string // "1:1"
}

export default function TafsirPanel({ isOpen, onClose, verseKey }: TafsirPanelProps) {
  const [selectedTafsirId, setSelectedTafsirId] = useState(16)
  const [tafsirText, setTafsirText] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !verseKey) return
    setLoading(true)
    setError(null)
    setTafsirText(null)

    getTafsirByVerse(selectedTafsirId, verseKey)
      .then(({ tafsir }) => setTafsirText(tafsir.text))
      .catch(() => setError('Impossible de charger le tafsir. Réessayez.'))
      .finally(() => setLoading(false))
  }, [isOpen, verseKey, selectedTafsirId])

  const currentTafsir = TAFSIRS.find(t => t.id === selectedTafsirId)

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-[2px]"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed top-14 right-0 bottom-16 z-40 w-full sm:w-[480px] bg-[#0d1526] border-l border-white/10 flex flex-col transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <span className="text-emerald-400">📖</span> Tafsir — {verseKey}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sélecteur tafsir */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-white/10 shrink-0 overflow-x-auto">
          {TAFSIRS.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTafsirId(t.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedTafsirId === t.id
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {t.flag} {t.name}
            </button>
          ))}
        </div>

        {/* Corps */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          {tafsirText && !loading && (
            <div
              dir={currentTafsir?.lang === 'ar' ? 'rtl' : 'ltr'}
              lang={currentTafsir?.lang}
            >
              <p
                className={`text-slate-300 leading-relaxed text-sm whitespace-pre-line ${
                  currentTafsir?.lang === 'ar' ? 'text-right arabic-text' : ''
                }`}
              >
                {sanitizeLight(tafsirText)}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
