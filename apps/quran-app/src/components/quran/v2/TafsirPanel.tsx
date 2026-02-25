'use client'
// ============================================================
// TafsirPanel.tsx — Panneau Tafsir complet (29 livres)
// Sources: spa5k/tafsir_api (GitHub JSON) — données sacrées READ ONLY
// ============================================================
import { useState, useEffect, useCallback } from 'react'
import {
  TAFSIR_BOOKS,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  groupBooksByCategory,
  fetchTafsirVerse,
  type TafsirBook,
  type TafsirCategory,
} from '@/lib/tafsir-books-api'

interface TafsirPanelProps {
  isOpen: boolean
  onClose: () => void
  verseKey: string   // ex: "2:255"
}

// Livres affichés par défaut dans le panel rapide
const QUICK_BOOKS = [
  'ar-tafsir-muyassar',
  'ar-tafsir-ibn-kathir',
  'ar-tafseer-al-qurtubi',
  'ar-tafseer-al-saddi',
  'ar-tafsir-al-tabari',
  'en-tafisr-ibn-kathir',
  'en-tafsir-maarif-ul-quran',
  'en-asbab-al-nuzul-by-al-wahidi',
]

const grouped = groupBooksByCategory(TAFSIR_BOOKS)

export default function TafsirPanel({ isOpen, onClose, verseKey }: TafsirPanelProps) {
  const [selectedSlug, setSelectedSlug] = useState('ar-tafsir-muyassar')
  const [tafsirText, setTafsirText] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAllBooks, setShowAllBooks] = useState(false)
  const [cache] = useState<Record<string, string | null>>({})

  const currentBook = TAFSIR_BOOKS.find(b => b.slug === selectedSlug)
  const isArabic = currentBook?.langCode === 'ar'
  const isRTL = ['ar', 'ur', 'fa', 'ku'].includes(currentBook?.langCode ?? '')

  const loadTafsir = useCallback(async (slug: string, key: string) => {
    if (!key) return
    const cacheKey = `${slug}:${key}`
    if (cacheKey in cache) {
      setTafsirText(cache[cacheKey])
      setError(cache[cacheKey] === null ? 'Non disponible pour ce verset.' : null)
      return
    }
    setLoading(true)
    setError(null)
    setTafsirText(null)

    const [surah, ayah] = key.split(':').map(Number)
    const text = await fetchTafsirVerse(slug, surah, ayah)
    cache[cacheKey] = text

    if (text) {
      setTafsirText(text)
    } else {
      setError('Ce tafsir n\'est pas disponible pour ce verset.')
    }
    setLoading(false)
  }, [cache])

  useEffect(() => {
    if (!isOpen || !verseKey) return
    loadTafsir(selectedSlug, verseKey)
  }, [isOpen, verseKey, selectedSlug, loadTafsir])

  function selectBook(slug: string) {
    setSelectedSlug(slug)
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-[2px]" onClick={onClose} />
      )}

      <div className={`fixed top-14 right-0 bottom-16 z-40 w-full sm:w-[560px] bg-[#0c1322] border-l border-white/10 flex flex-col transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 shrink-0">
          <div>
            <h2 className="text-white font-semibold flex items-center gap-2">
              📖 Tafsir
              <span className="text-emerald-400 arabic-text text-sm" dir="rtl">{verseKey}</span>
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">{TAFSIR_BOOKS.length} livres · spa5k/tafsir_api</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Sélecteur rapide ── */}
        <div className="px-3 py-2 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {QUICK_BOOKS.map(slug => {
              const book = TAFSIR_BOOKS.find(b => b.slug === slug)
              if (!book) return null
              return (
                <button
                  key={slug}
                  onClick={() => selectBook(slug)}
                  className={`shrink-0 px-2.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedSlug === slug
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {book.flag} {book.authorAr.split(' ')[0]}
                </button>
              )
            })}
            <button
              onClick={() => setShowAllBooks(!showAllBooks)}
              className="shrink-0 px-2.5 py-1.5 rounded-full text-xs bg-white/5 text-slate-500 hover:text-white border border-white/10 hover:border-white/20 transition-all"
            >
              {showAllBooks ? '▲ Moins' : '▼ Tous'}
            </button>
          </div>
        </div>

        {/* ── Tous les livres (expandable) ── */}
        {showAllBooks && (
          <div className="border-b border-white/10 max-h-52 overflow-y-auto shrink-0 bg-black/20">
            {CATEGORY_ORDER.map(cat => {
              const books = grouped[cat]
              if (!books?.length) return null
              return (
                <div key={cat} className="px-3 py-2">
                  <p className="text-[10px] text-slate-600 mb-1.5 font-medium uppercase tracking-wide">
                    {CATEGORY_LABELS[cat]}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {books.map(book => (
                      <button
                        key={book.slug}
                        onClick={() => { selectBook(book.slug); setShowAllBooks(false) }}
                        className={`px-2 py-1 rounded-md text-xs transition-all ${
                          selectedSlug === book.slug
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white/4 text-slate-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {book.flag} {book.nameAr.split(' ').slice(0, 3).join(' ')}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Corps ── */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {/* En-tête du livre actif */}
          {currentBook && (
            <div className="flex items-start gap-3 mb-4 pb-3 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl shrink-0">
                {currentBook.flag}
              </div>
              <div>
                <p className="text-white font-medium arabic-text text-sm" dir={isRTL ? 'rtl' : 'ltr'}>
                  {currentBook.nameAr}
                </p>
                <p className="text-slate-500 text-xs mt-0.5">{currentBook.authorAr} · {currentBook.died}</p>
                <p className="text-slate-600 text-xs">{currentBook.volumes} · {currentBook.lang}</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && !loading && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <p className="text-amber-400 text-sm">{error}</p>
              <p className="text-slate-600 text-xs mt-1">
                Essayez un autre tafsir ou vérifiez le numéro du verset.
              </p>
            </div>
          )}

          {tafsirText && !loading && (
            <p
              className={`leading-loose text-sm whitespace-pre-line ${
                isArabic
                  ? 'arabic-text text-right text-white/90 text-[1rem] leading-[2.2]'
                  : 'text-slate-300 leading-relaxed'
              }`}
              dir={isRTL ? 'rtl' : 'ltr'}
              lang={currentBook?.langCode}
            >
              {tafsirText}
            </p>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="border-t border-white/10 px-4 py-3 shrink-0 flex items-center justify-between">
          <p className="text-slate-600 text-xs truncate max-w-52">
            {currentBook?.author} ({currentBook?.died})
          </p>
          <a
            href={`https://github.com/spa5k/tafsir_api/tree/main/tafsir/${selectedSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-600 hover:text-emerald-400 transition-colors"
          >
            Source →
          </a>
        </div>
      </div>
    </>
  )
}
