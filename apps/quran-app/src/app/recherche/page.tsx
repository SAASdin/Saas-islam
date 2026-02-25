'use client'
// ============================================================
// recherche/page.tsx — Recherche dans le Coran
// Client Component — recherche en temps réel
// ⚠️  Résultats affichés tels quels — JAMAIS modifier le texte arabe
// ============================================================

import { useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Navigation from '@/components/Navigation'
import RTLWrapper from '@/components/ui/RTLWrapper'
import IslamicLoader from '@/components/ui/IslamicLoader'
import type { AlQuranApiAyah } from '@/types/quran'

const API_BASE = 'https://api.alquran.cloud/v1'

interface SearchResult {
  ayahNumberQuran: number
  surahId: number
  surahName: string
  surahNameFr: string
  ayahNumber: number
  textArabic: string    // ⚠️ SACRÉ
  translation: string
}

export default function RecherchePage() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) return

    setIsLoading(true)
    setError(null)
    setSearched(true)

    try {
      // Recherche dans la traduction française
      const res = await fetch(
        `${API_BASE}/search/${encodeURIComponent(searchQuery)}/all/fr.hamidullah`,
        { next: { revalidate: 3600 } }
      )
      const json = await res.json()

      if (json.code !== 200 || !json.data?.matches) {
        setResults([])
        return
      }

      const hits: SearchResult[] = (json.data.matches as AlQuranApiAyah[])
        .slice(0, 50) // Limiter à 50 résultats
        .map((ayah) => ({
          ayahNumberQuran: ayah.number,
          surahId: ayah.surah?.number ?? 0,
          surahName: ayah.surah?.englishName ?? '',
          surahNameFr: ayah.surah?.englishNameTranslation ?? '',
          ayahNumber: ayah.numberInSurah,
          textArabic: ayah.text,   // ⚠️ SACRÉ — affiché tel quel
          translation: '',          // Récupéré séparément si besoin
        }))

      setResults(hits)
    } catch (err) {
      setError('Erreur lors de la recherche. Réessayez.')
      console.error('[Recherche] Erreur:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    search(query)
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen" style={{ background: '#0a0f1e' }}>
        <div className="max-w-3xl mx-auto px-4 py-8">

          {/* Titre */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-100 mb-2">
              Recherche dans le Coran
            </h1>
            <p className="text-slate-400 text-sm">
              Recherche dans la traduction française (Muhammad Hamidullah)
            </p>
          </div>

          {/* Formulaire de recherche */}
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex gap-3">
              <input
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Ex : miséricorde, paradis, patience..."
                className="flex-1 px-4 py-3 rounded-xl text-slate-100 outline-none text-sm"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
                aria-label="Termes de recherche"
                autoFocus
              />
              <button
                type="submit"
                disabled={isLoading || query.length < 2}
                className="px-5 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-40"
                style={{
                  background: 'linear-gradient(135deg, #1a7f4b, #15803d)',
                  color: '#fff',
                }}
              >
                {isLoading ? '...' : 'Chercher'}
              </button>
            </div>
          </form>

          {/* Chargement */}
          {isLoading && (
            <div className="flex justify-center py-12">
              <IslamicLoader size="md" message="Recherche en cours..." />
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div
              className="rounded-xl p-4 mb-6 text-sm"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
            >
              {error}
            </div>
          )}

          {/* Résultats */}
          {!isLoading && searched && (
            <>
              <p className="text-slate-500 text-xs mb-4">
                {results.length === 0
                  ? 'Aucun résultat trouvé.'
                  : `${results.length} résultat${results.length > 1 ? 's' : ''} pour « ${query} »`
                }
              </p>

              <div className="space-y-4">
                {results.map((result) => (
                  <a
                    key={result.ayahNumberQuran}
                    href={`/sourate/${result.surahId}#ayah-${result.ayahNumber}`}
                    className="block rounded-xl p-5 transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    {/* Référence */}
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(212,175,55,0.15)', color: '#d4af37' }}
                      >
                        {result.surahId}:{result.ayahNumber}
                      </span>
                      <span className="text-xs text-slate-500">
                        {result.surahName} — {result.surahNameFr}
                      </span>
                    </div>

                    {/* Texte arabe ⚠️ SACRÉ */}
                    <RTLWrapper
                      as="p"
                      fontSize="md"
                      className="text-slate-100 mb-3"
                    >
                      {/* ⚠️ Texte arabe READ ONLY */}
                      {result.textArabic}
                    </RTLWrapper>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  )
}
