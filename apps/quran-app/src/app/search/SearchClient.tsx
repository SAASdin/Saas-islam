'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { searchVerses } from '@/lib/quran-cdn-api'
import type { QdcSearchResult } from '@/lib/quran-cdn-api'

const HISTORY_KEY = 'noorapp-search-history'
const MAX_HISTORY = 10
const MAX_RESULTS = 20
const ARABIC_RE = /[\u0600-\u06FF]/
const REF_RE = /^(\d{1,3}):(\d{1,3})$/

interface SearchResult extends QdcSearchResult { highlightedText?: string }

function escapeRegex(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }

function highlightText(text: string, query: string): string {
  if (!query.trim() || ARABIC_RE.test(query)) return text
  const re = new RegExp(`(${escapeRegex(query)})`, 'gi')
  return text.replace(re, '<mark class="bg-emerald-500/30 text-emerald-300 rounded px-0.5">$1</mark>')
}

export default function SearchClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQ = searchParams.get('q') ?? ''

  const [query, setQuery] = useState(initialQ)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [totalResults, setTotalResults] = useState(0)
  const [history, setHistory] = useState<string[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]')
    setHistory(stored)
  }, [])

  const performSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setHasSearched(false); return }
    const refMatch = q.match(REF_RE)
    if (refMatch) { router.push(`/surah/${refMatch[1]}/${refMatch[2]}`); return }
    setLoading(true); setHasSearched(true)
    const stored: string[] = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]')
    const updated = [q, ...stored.filter(h => h !== q)].slice(0, MAX_HISTORY)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
    setHistory(updated)
    try {
      const { search } = await searchVerses(q, 1, MAX_RESULTS)
      setResults(search.results.map(r => ({ ...r, highlightedText: highlightText(r.text, q) })))
      setTotalResults(search.total_results)
    } catch { setResults([]); setTotalResults(0) }
    finally { setLoading(false) }
  }, [router])

  useEffect(() => { if (initialQ) performSearch(initialQ) }, []) // eslint-disable-line

  function handleInput(val: string) {
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => performSearch(val), 350)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Recherche dans le Coran</h1>
      <form onSubmit={e => { e.preventDefault(); if (debounceRef.current) clearTimeout(debounceRef.current); performSearch(query) }} className="relative mb-8">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input value={query} onChange={e => handleInput(e.target.value)}
          placeholder="Mot, phrase, ou référence (1:1)…"
          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-28 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-all" autoFocus />
        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-colors">
          Chercher
        </button>
      </form>

      {!hasSearched && history.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-slate-400">Recherches récentes</h2>
            <button onClick={() => { localStorage.removeItem(HISTORY_KEY); setHistory([]) }} className="text-xs text-slate-600 hover:text-slate-400">Effacer</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {history.map((h, i) => (
              <button key={i} onClick={() => { setQuery(h); performSearch(h) }}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm text-slate-300 transition-colors">
                🕐 {h}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>}

      {!loading && hasSearched && (
        <>
          <p className="text-slate-400 text-sm mb-4">
            {results.length > 0 ? `${totalResults.toLocaleString()} résultats pour « ${query} »` : `Aucun résultat pour « ${query} »`}
          </p>
          {results.length === 0 && <div className="text-center py-12 text-slate-500"><p className="text-4xl mb-3">🔍</p><p>Essayez d&apos;autres mots-clés.</p></div>}
          <div className="space-y-3">
            {results.map(result => (
              <Link key={result.verse_key} href={`/surah/${result.verse_key.split(':')[0]}/${result.verse_key.split(':')[1]}`}
                className="block bg-white/3 hover:bg-white/6 border border-white/8 hover:border-emerald-500/30 rounded-xl p-4 transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-emerald-400 text-sm font-medium">{result.verse_key}</span>
                  <svg className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                {result.highlightedText && <p className="text-slate-300 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: result.highlightedText }} />}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
