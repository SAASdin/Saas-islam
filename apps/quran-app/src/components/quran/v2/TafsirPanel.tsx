'use client'
// ============================================================
// TafsirPanel.tsx — Panneau Tafsir complet (20 tafsirs)
// Slide-over depuis la droite
// ============================================================
import { useState, useEffect, useCallback } from 'react'
import { getTafsirByVerse } from '@/lib/quran-cdn-api'
import { sanitizeLight } from '@/lib/sanitize'
import { ALL_TAFSIRS, groupByLanguage } from '@/lib/translations-catalog'

interface TafsirPanelProps {
  isOpen: boolean
  onClose: () => void
  verseKey: string
}

const LANG_PRIORITY = ['عربي', 'English', 'اردو', 'বাংলা', 'Русский', 'Kurdish']

export default function TafsirPanel({ isOpen, onClose, verseKey }: TafsirPanelProps) {
  const [selectedTafsirId, setSelectedTafsirId] = useState(16)
  const [tafsirText, setTafsirText] = useState<string | null>(null)
  const [tafsirName, setTafsirName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cache, setCache] = useState<Record<string, string>>({})

  const grouped = groupByLanguage(ALL_TAFSIRS)
  const languages = Object.keys(grouped).sort((a, b) => {
    const ai = LANG_PRIORITY.indexOf(a)
    const bi = LANG_PRIORITY.indexOf(b)
    if (ai !== -1 && bi !== -1) return ai - bi
    if (ai !== -1) return -1
    if (bi !== -1) return 1
    return a.localeCompare(b)
  })

  const loadTafsir = useCallback((tafsirId: number, key: string) => {
    if (!key) return
    const cacheKey = `${tafsirId}:${key}`
    if (cache[cacheKey]) {
      setTafsirText(cache[cacheKey])
      setError(null)
      return
    }

    setLoading(true)
    setError(null)
    setTafsirText(null)

    getTafsirByVerse(tafsirId, key)
      .then(({ tafsir }) => {
        const clean = sanitizeLight(tafsir.text)
        setTafsirText(clean)
        setCache(prev => ({ ...prev, [cacheKey]: clean }))
      })
      .catch(() => setError('Tafsir non disponible pour ce verset.'))
      .finally(() => setLoading(false))
  }, [cache])

  useEffect(() => {
    if (!isOpen || !verseKey) return
    const meta = ALL_TAFSIRS.find(t => t.id === selectedTafsirId)
    setTafsirName(meta?.name ?? '')
    loadTafsir(selectedTafsirId, verseKey)
  }, [isOpen, verseKey, selectedTafsirId, loadTafsir])

  function selectTafsir(id: number) {
    setSelectedTafsirId(id)
    const meta = ALL_TAFSIRS.find(t => t.id === id)
    setTafsirName(meta?.name ?? '')
  }

  const currentMeta = ALL_TAFSIRS.find(t => t.id === selectedTafsirId)
  const isArabic = currentMeta?.languageCode === 'ar'

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />
      )}

      <div className={`fixed top-14 right-0 bottom-16 z-40 w-full sm:w-[520px] bg-[#0d1526] border-l border-white/10 flex flex-col transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <div>
            <h2 className="text-white font-semibold flex items-center gap-2">
              <span>📖</span> Tafsir — <span className="text-emerald-400">{verseKey}</span>
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">{ALL_TAFSIRS.length} tafsirs disponibles</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sélecteur tafsir — toutes les langues */}
        <div className="border-b border-white/10 shrink-0">
          <div className="overflow-x-auto">
            {languages.map(lang => {
              const items = grouped[lang]
              return (
                <div key={lang} className="flex items-center gap-1 px-3 py-2 min-w-max">
                  <span className="text-slate-600 text-xs shrink-0 w-16">{items[0]?.flag} {lang}</span>
                  {items.map(t => (
                    <button
                      key={t.id}
                      onClick={() => selectTafsir(t.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                        selectedTafsirId === t.id
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {t.name.length > 20 ? t.name.slice(0, 18) + '…' : t.name}
                    </button>
                  ))}
                </div>
              )
            })}
          </div>
        </div>

        {/* Corps */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-red-400 text-sm">{error}</p>
              <p className="text-slate-600 text-xs mt-1">
                Ce tafsir n&apos;est peut-être pas disponible pour ce verset spécifique.
              </p>
            </div>
          )}

          {tafsirText && !loading && (
            <>
              {/* En-tête tafsir actif */}
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                <span className="text-lg">{currentMeta?.flag}</span>
                <div>
                  <p className="text-white font-medium text-sm">{currentMeta?.name}</p>
                  <p className="text-slate-500 text-xs">{currentMeta?.author} · {currentMeta?.language}</p>
                </div>
              </div>

              <p
                className={`leading-loose text-sm whitespace-pre-line ${
                  isArabic
                    ? 'arabic-text text-right text-white/90 text-base'
                    : 'text-slate-300'
                }`}
                dir={isArabic ? 'rtl' : 'ltr'}
                lang={currentMeta?.languageCode}
              >
                {tafsirText}
              </p>
            </>
          )}
        </div>

        {/* Footer — naviguer entre versets */}
        <div className="border-t border-white/10 px-4 py-3 shrink-0 flex items-center justify-between">
          <p className="text-slate-600 text-xs">{tafsirName}</p>
          <a
            href={`https://quran.com/${verseKey.replace(':', '/')}?startingVerse=${verseKey.split(':')[1]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-500 hover:text-emerald-400 transition-colors"
          >
            Quran.com →
          </a>
        </div>
      </div>
    </>
  )
}
