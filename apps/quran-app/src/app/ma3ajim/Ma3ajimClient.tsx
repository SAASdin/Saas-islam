'use client'
// ============================================================
// Ma3ajimClient.tsx — Dictionnaire Coranique Complet
// Inspiré tafsir.app معاجم — recherche par racine/mot
// ============================================================
import { useState, useCallback, useRef } from 'react'
import Link from 'next/link'

interface SearchResult {
  verse_key: string
  words: Array<{ char_type: string; text: string; highlight?: boolean }>
}

interface SearchResponse {
  result: { verses: SearchResult[] }
  pagination: { total_records: number; total_pages: number; current_page: number }
}

// ── Catalogue des dictionnaires (tafsir.app معاجم) ──────────────────────────
const DICTIONARIES = [
  {
    category: 'quranic',
    categoryLabel: 'معاجم قرآنية',
    books: [
      { name: 'مفردات ألفاظ القرآن', author: 'الراغب الأصفهاني', died: '٥٠٢ هـ', vols: 'مجلدان', desc: 'المرجع الأساسي لمعاني ألفاظ القرآن الكريم', icon: '⭐' },
      { name: 'عمدة الحفاظ', author: 'السمين الحلبي', died: '٧٥٦ هـ', vols: '٣ مجلدات', desc: 'تفسير مفردات القرآن وأصولها اللغوية', icon: '📗' },
      { name: 'بصائر ذوي التمييز', author: 'الفيروزآبادي', died: '٨١٧ هـ', vols: '٣ مجلدات', desc: 'تفسير لطائف القرآن ومفرداته', icon: '📙' },
      { name: 'فهرس جذور كلمات القرآن', author: '', died: '', vols: '٨ مجلدات', desc: 'فهرس شامل لجذور كلمات القرآن الكريم', icon: '🗂️' },
      { name: 'المعجم الاشتقاقي المؤصل', author: 'محمد حسن جبل', died: '١٤٣٦ هـ', vols: '٤ مجلدات', desc: 'معجم في أصول الألفاظ العربية', icon: '🔬' },
    ]
  },
  {
    category: 'arabic',
    categoryLabel: 'معاجم اللغة العربية',
    books: [
      { name: 'الصحاح', author: 'الجوهري', died: '٣٩٣ هـ', vols: '٥ مجلدات', desc: 'تاج اللغة وصحاح العربية', icon: '📖' },
      { name: 'لسان العرب', author: 'ابن منظور', died: '٧١١ هـ', vols: '٣٦ مجلدًا', desc: 'أكبر معاجم اللغة العربية على الإطلاق', icon: '📚' },
      { name: 'القاموس المحيط', author: 'الفيروزآبادي', died: '٨١٧ هـ', vols: '٥ مجلدات', desc: 'قاموس شامل للغة العربية', icon: '🌊' },
      { name: 'مقاييس اللغة', author: 'ابن فارس', died: '٣٩٥ هـ', vols: '٥ مجلدات', desc: 'في أصول الكلمات العربية وجذورها', icon: '📐' },
    ]
  },
]

// Racines communes dans le Coran
const COMMON_ROOTS = [
  { root: 'حمد', meaning: 'Louange' },
  { root: 'رحم', meaning: 'Miséricorde' },
  { root: 'ملك', meaning: 'Royauté' },
  { root: 'عبد', meaning: 'Adoration' },
  { root: 'هدي', meaning: 'Guidance' },
  { root: 'كتب', meaning: 'Écriture' },
  { root: 'علم', meaning: 'Science' },
  { root: 'أمن', meaning: 'Foi' },
  { root: 'صلح', meaning: 'Rectitude' },
  { root: 'فتح', meaning: 'Ouverture' },
  { root: 'قرأ', meaning: 'Lecture' },
  { root: 'نور', meaning: 'Lumière' },
  { root: 'حكم', meaning: 'Sagesse' },
  { root: 'رزق', meaning: 'Subsistance' },
  { root: 'صبر', meaning: 'Patience' },
  { root: 'شكر', meaning: 'Gratitude' },
  { root: 'تقو', meaning: 'Piété' },
  { root: 'رسل', meaning: 'Message' },
  { root: 'قوم', meaning: 'Peuple' },
  { root: 'سمع', meaning: 'Audition' },
]

export default function Ma3ajimClient() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [activeTab, setActiveTab] = useState<'search' | 'books'>('search')
  const inputRef = useRef<HTMLInputElement>(null)

  const doSearch = useCallback(async (q: string, p: number = 1) => {
    if (!q.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const params = new URLSearchParams({ q, size: '20', page: String(p) })
      const r = await fetch(`https://api.qurancdn.com/api/qdc/search?${params}`)
      const data: SearchResponse = await r.json()
      setResults(data.result?.verses ?? [])
      setTotal(data.pagination?.total_records ?? 0)
      setPage(p)
    } catch {
      setResults([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    doSearch(query, 1)
  }

  function selectRoot(root: string) {
    setQuery(root)
    setActiveTab('search')
    doSearch(root, 1)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl arabic-text text-white mb-2" dir="rtl" lang="ar">المعاجم</h1>
        <p className="text-slate-400 text-sm">Dictionnaire Coranique · Recherche par racine</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 mb-6">
        {[
          { id: 'search', labelAr: 'بحث', labelFr: 'Recherche' },
          { id: 'books', labelAr: 'الكتب', labelFr: 'Catalogue' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'search' | 'books')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="arabic-text" dir="rtl">{tab.labelAr}</span>
            <span className="text-xs text-slate-600">({tab.labelFr})</span>
          </button>
        ))}
      </div>

      {/* ── Onglet Recherche ── */}
      {activeTab === 'search' && (
        <div>
          {/* Barre de recherche */}
          <form onSubmit={handleSubmit} className="relative mb-6">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="ابحث بالجذر أو الكلمة…"
              dir="rtl"
              lang="ar"
              className="w-full bg-white/5 border border-white/15 rounded-2xl px-5 py-4 arabic-text text-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 pr-5 pl-16 transition-colors"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-emerald-600 hover:bg-emerald-500 rounded-xl flex items-center justify-center transition-colors">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          {/* Racines communes */}
          {!searched && (
            <div className="mb-8">
              <p className="text-xs text-slate-500 mb-3 flex items-center gap-2">
                <span>الجذور الشائعة في القرآن</span>
                <span className="text-slate-700">· Racines fréquentes</span>
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-7 gap-2">
                {COMMON_ROOTS.map(r => (
                  <button key={r.root} onClick={() => selectRoot(r.root)}
                    className="group flex flex-col items-center p-2 bg-white/4 hover:bg-emerald-500/10 border border-white/8 hover:border-emerald-500/30 rounded-xl transition-all">
                    <span className="arabic-text text-lg text-white" dir="rtl" lang="ar">{r.root}</span>
                    <span className="text-slate-600 text-[10px] group-hover:text-slate-400 transition-colors mt-0.5">{r.meaning}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-16 gap-3">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-slate-400 arabic-text" dir="rtl">جاري البحث في القرآن الكريم…</span>
            </div>
          )}

          {/* Résultats */}
          {!loading && searched && (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-white">
                  <span className="text-emerald-400">{total}</span>
                  {' '}نتيجة لـ{' '}
                  <span className="arabic-text text-xl font-bold" dir="rtl" lang="ar">{query}</span>
                </p>
                <button onClick={() => { setSearched(false); setQuery(''); setResults([]) }}
                  className="text-xs text-slate-500 hover:text-white transition-colors">✕</button>
              </div>

              <div className="space-y-2">
                {results.map(verse => {
                  const [sura, ayah] = verse.verse_key.split(':')
                  return (
                    <Link key={verse.verse_key} href={`/surah/${sura}/${ayah}`}
                      className="block group bg-white/3 hover:bg-white/7 border border-white/8 hover:border-emerald-500/30 rounded-xl p-4 transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <span className="shrink-0 inline-flex items-center justify-center w-16 h-7 bg-emerald-500/15 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-mono">
                          {verse.verse_key}
                        </span>
                        <div className="flex-1 text-right" dir="rtl" lang="ar">
                          <p className="arabic-text text-base leading-loose text-white/90">
                            {verse.words.map((w, i) => (
                              w.char_type === 'end'
                                ? <span key={i} className="text-emerald-500 mx-1 text-sm">⬟</span>
                                : <span key={i} className={w.highlight ? 'text-amber-300 font-bold bg-amber-500/15 rounded px-0.5' : ''}>
                                    {w.text}{' '}
                                  </span>
                            ))}
                          </p>
                        </div>
                        <svg className="w-4 h-4 text-slate-600 group-hover:text-slate-400 mt-1.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  )
                })}
              </div>

              {total > 20 && (
                <div className="flex items-center justify-center gap-3 mt-8">
                  <button onClick={() => doSearch(query, page - 1)} disabled={page <= 1}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-400 text-sm disabled:opacity-40 hover:bg-white/10 transition-colors">← Précédent</button>
                  <span className="text-slate-500 text-sm">{page} / {Math.ceil(total / 20)}</span>
                  <button onClick={() => doSearch(query, page + 1)} disabled={page >= Math.ceil(total / 20)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-400 text-sm disabled:opacity-40 hover:bg-white/10 transition-colors">Suivant →</button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Onglet Catalogue ── */}
      {activeTab === 'books' && (
        <div className="space-y-8">
          {DICTIONARIES.map(cat => (
            <div key={cat.category}>
              <h2 className="text-base font-semibold text-white arabic-text mb-4 flex items-center gap-2" dir="rtl" lang="ar">
                {cat.categoryLabel}
                <span className="text-slate-600 text-xs font-normal">{cat.books.length} كتاب</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cat.books.map(book => (
                  <div key={book.name} className="bg-white/3 border border-white/10 hover:border-white/20 rounded-xl p-4 transition-colors">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl shrink-0">{book.icon}</span>
                      <div>
                        <p className="text-white text-sm font-medium arabic-text" dir="rtl" lang="ar">{book.name}</p>
                        {book.author && (
                          <p className="text-slate-400 text-xs mt-0.5 arabic-text" dir="rtl" lang="ar">
                            {book.author}{book.died ? ` (${book.died})` : ''}
                          </p>
                        )}
                        <p className="text-slate-500 text-xs mt-0.5 arabic-text" dir="rtl" lang="ar">{book.vols}</p>
                        {book.desc && <p className="text-slate-600 text-xs mt-1 text-left">{book.desc}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
