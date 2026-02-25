// ============================================================
// search/page.tsx — Recherche globale dans le Coran — Premium dark
// ⚠️  RÈGLES ABSOLUES :
//   - Texte arabe des résultats : JAMAIS transformer
//   - dir="rtl" lang="ar" OBLIGATOIRES
//   - Résultats affichés avec référence Sourate:Verset
// ============================================================

import Navigation from '@/components/Navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Recherche — Coran',
  description: 'Rechercher dans le texte du Coran et sa traduction française',
}

interface SearchMatch {
  number: number
  text: string
  numberInSurah: number
  juz: number
  page: number
  surah: {
    number: number
    name: string
    englishName: string
    englishNameTranslation: string
    numberOfAyahs: number
    revelationType: string
  }
}

interface SearchApiResponse {
  code: number
  status: string
  data: {
    count: number
    matches: SearchMatch[]
  }
}

async function searchQuran(query: string): Promise<SearchMatch[]> {
  if (!query || query.trim().length < 2) return []

  const encodedQuery = encodeURIComponent(query.trim())
  const res = await fetch(
    `https://api.alquran.cloud/v1/search/${encodedQuery}/all/fr.hamidullah`,
    {
      next: { revalidate: 3600 },
      headers: { Accept: 'application/json' },
    }
  )

  if (!res.ok) return []

  const data: SearchApiResponse = await res.json()
  if (data.code !== 200) return []

  return data.data.matches.slice(0, 50)
}

interface Props {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: Props) {
  const { q: query } = await searchParams
  const results = query ? await searchQuran(query) : []
  const hasQuery = Boolean(query && query.trim().length >= 2)

  return (
    <div className="min-h-screen" style={{ background: '#0a0f1e' }}>
      <Navigation />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section
        className="relative py-12 px-4"
        style={{
          background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1a2e 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="absolute inset-0 islamic-pattern opacity-40 pointer-events-none" aria-hidden="true" />
        <div className="relative max-w-3xl mx-auto text-center">
          <h1
            className="text-3xl font-bold mb-2"
            style={{
              background: 'linear-gradient(135deg, #f1f5f9 0%, #d4af37 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            🔍 Recherche dans le Coran
          </h1>
          <p className="text-slate-500 text-sm">
            Recherchez par texte en français ou en arabe
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 pt-8 pb-12">

        {/* ── Formulaire de recherche ──────────────────── */}
        <form action="/search" method="GET" className="mb-10">
          <div className="relative">
            <span
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: '#d4af37', opacity: 0.8 }}
              aria-hidden="true"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="search"
              name="q"
              defaultValue={query ?? ''}
              placeholder="Ex: miséricorde, رحمة, patience..."
              className="w-full pl-12 pr-28 py-4 rounded-xl text-base"
              style={{
                background: 'rgba(17,24,39,0.8)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#f1f5f9',
                outline: 'none',
                caretColor: '#d4af37',
              }}
              autoComplete="off"
              spellCheck={false}
              minLength={2}
              required
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #15803d 0%, #0d7a4e 100%)',
                color: '#f1f5f9',
              }}
            >
              Chercher
            </button>
          </div>
          <p className="text-xs text-slate-600 mt-2 text-center">
            Recherche dans la traduction Hamidullah (fr.hamidullah)
          </p>
        </form>

        {/* ── Résultats ────────────────────────────────── */}
        {hasQuery && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-medium text-slate-400">
                {results.length > 0
                  ? `${results.length} résultat${results.length > 1 ? 's' : ''} pour « ${query} »`
                  : `Aucun résultat pour « ${query} »`}
              </h2>
              {results.length === 50 && (
                <span className="text-xs text-slate-600">(limité à 50)</span>
              )}
            </div>

            {results.length > 0 ? (
              <div className="grid gap-3">
                {results.map((match) => (
                  <Link
                    key={match.number}
                    href={`/surah/${match.surah.number}`}
                    className="group block p-5 rounded-xl transition-all duration-300 animate-fade-in"
                    style={{
                      background: 'rgba(17,24,39,0.7)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                    aria-label={`Aller à la sourate ${match.surah.englishName}, verset ${match.numberInSurah}`}
                  >
                    {/* En-tête résultat */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                          style={{
                            background: 'linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.08) 100%)',
                            border: '1px solid rgba(212,175,55,0.25)',
                            color: '#d4af37',
                          }}
                        >
                          {match.surah.number}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-slate-200">
                            {match.surah.englishName}
                          </p>
                          <p className="text-xs text-slate-600">
                            Verset {match.numberInSurah} · Juz {match.juz}
                          </p>
                        </div>
                      </div>

                      {/* Nom arabe sourate — ⚠️ SACRÉ */}
                      <div
                        dir="rtl"
                        lang="ar"
                        className="flex-shrink-0 text-sm"
                        style={{
                          fontFamily: 'var(--font-amiri)',
                          color: '#d4af37',
                          lineHeight: '1.6',
                        }}
                        aria-label={`Nom arabe : ${match.surah.name}`}
                      >
                        {/* ⚠️ Affiché tel quel */}
                        {match.surah.name}
                      </div>
                    </div>

                    {/* Traduction */}
                    <div
                      className="pl-4"
                      style={{ borderLeft: '2px solid rgba(212,175,55,0.2)' }}
                    >
                      <p className="text-slate-400 text-sm leading-relaxed">
                        {match.text}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-slate-600">
                          {match.surah.englishName} {match.surah.number}:{match.numberInSurah} · Hamidullah
                        </p>
                        <span
                          className="text-xs text-slate-600 opacity-0 group-hover:opacity-100 transition-all duration-200"
                          style={{ color: '#d4af37' }}
                        >
                          Lire →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-5xl mb-4">🔍</p>
                <p className="text-slate-500">
                  Aucun verset trouvé pour « {query} »
                </p>
                <p className="text-xs text-slate-600 mt-2">
                  Essayez un autre mot en français ou en arabe
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Page vide ───────────────────────────────── */}
        {!hasQuery && (
          <div className="text-center py-20 text-slate-500">
            <p className="text-6xl mb-6">📖</p>
            <p className="text-lg mb-2">
              Entrez un mot ou une phrase
            </p>
            <p className="text-sm text-slate-600">
              Exemples : « miséricorde », « paradis », « رحمة »
            </p>

            {/* Suggestions */}
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {['miséricorde', 'paradis', 'patience', 'lumière', 'رحمة', 'الله'].map((term) => (
                <a
                  key={term}
                  href={`/search?q=${encodeURIComponent(term)}`}
                  className="px-4 py-2 rounded-xl text-sm transition-all duration-200"
                  style={{
                    background: 'rgba(17,24,39,0.7)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#94a3b8',
                  }}
                >
                  {term}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
