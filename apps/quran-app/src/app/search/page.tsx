// ============================================================
// search/page.tsx — Recherche globale dans le Coran
// ⚠️  RÈGLES ABSOLUES :
//   - Texte arabe des résultats : JAMAIS transformer
//   - dir="rtl" lang="ar" OBLIGATOIRES
//   - Résultats affichés avec référence Sourate:Verset
//   - Traduction Hamidullah — non-auto → pas de badge (validée)
// ============================================================

import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Recherche — Coran',
  description: 'Rechercher dans le texte du Coran et sa traduction française',
}

// ── Types pour l'API alquran.cloud/search ────────────────────

interface SearchMatch {
  number: number         // Numéro global du verset
  text: string           // Texte de la traduction correspondant
  numberInSurah: number
  juz: number
  page: number
  surah: {
    number: number
    name: string         // ⚠️ SACRÉ
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

// ── Fonction de recherche ────────────────────────────────────

async function searchQuran(query: string): Promise<SearchMatch[]> {
  if (!query || query.trim().length < 2) return []

  const encodedQuery = encodeURIComponent(query.trim())
  // Recherche dans les deux éditions : texte FR (hamidullah) et texte arabe
  const res = await fetch(
    `https://api.alquran.cloud/v1/search/${encodedQuery}/all/fr.hamidullah`,
    {
      next: { revalidate: 3600 }, // Cache 1h pour les recherches
      headers: { Accept: 'application/json' },
    }
  )

  if (!res.ok) return []

  const data: SearchApiResponse = await res.json()
  if (data.code !== 200) return []

  return data.data.matches.slice(0, 50) // Limite à 50 résultats max
}

// ── Page ─────────────────────────────────────────────────────

interface Props {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: Props) {
  const { q: query } = await searchParams
  const results = query ? await searchQuran(query) : []
  const hasQuery = Boolean(query && query.trim().length >= 2)

  return (
    <main className="min-h-screen bg-cream-50 dark:bg-gray-900">

      {/* ── Navigation ──────────────────────────────────────── */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <Link
              href="/"
              className="text-xl font-bold text-islam-700 dark:text-islam-400 hover:text-islam-800"
            >
              🕌 Saas-islam
            </Link>
          </div>
          <nav className="flex gap-3 text-sm text-gray-600 dark:text-gray-300">
            <a href="/" className="hover:text-islam-600">Coran</a>
            <a href="/hadiths" className="hover:text-islam-600">Hadiths</a>
            <a href="/priere" className="hover:text-islam-600">Prière</a>
          </nav>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 pt-8 pb-12">

        {/* ── Titre ────────────────────────────────────────── */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            🔍 Recherche dans le Coran
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Recherchez par texte en français ou en arabe
          </p>
        </div>

        {/* ── Formulaire de recherche ──────────────────────── */}
        <form action="/search" method="GET" className="mb-8">
          <div className="relative">
            <span
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none"
              aria-hidden="true"
            >
              🔍
            </span>
            <input
              type="search"
              name="q"
              defaultValue={query ?? ''}
              placeholder="Ex: miséricorde, رحمة, patience..."
              className="
                w-full pl-12 pr-4 py-4
                bg-white dark:bg-gray-800
                border border-gray-200 dark:border-gray-700
                rounded-xl shadow-sm
                text-gray-900 dark:text-gray-100
                placeholder:text-gray-400
                focus:outline-none focus:ring-2 focus:ring-islam-500
                text-base
              "
              autoComplete="off"
              spellCheck={false}
              minLength={2}
              required
            />
            <button
              type="submit"
              className="
                absolute right-3 top-1/2 -translate-y-1/2
                px-4 py-2 bg-islam-600 hover:bg-islam-700 text-white
                rounded-lg text-sm font-medium
                transition-colors duration-150
              "
            >
              Chercher
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Recherche dans la traduction Hamidullah (fr.hamidullah)
          </p>
        </form>

        {/* ── Résultats ────────────────────────────────────── */}
        {hasQuery && (
          <div>
            {/* Compteur de résultats */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {results.length > 0
                  ? `${results.length} résultat${results.length > 1 ? 's' : ''} pour « ${query} »`
                  : `Aucun résultat pour « ${query} »`}
              </h2>
              {results.length === 50 && (
                <span className="text-xs text-gray-400">(limité à 50)</span>
              )}
            </div>

            {/* Liste des résultats */}
            {results.length > 0 ? (
              <div className="grid gap-3">
                {results.map((match) => (
                  <Link
                    key={match.number}
                    href={`/surah/${match.surah.number}`}
                    className="
                      group block p-4
                      bg-white dark:bg-gray-800
                      border border-gray-100 dark:border-gray-700
                      rounded-xl shadow-sm
                      hover:shadow-md hover:border-islam-500/30
                      transition-all duration-200
                    "
                    aria-label={`Aller à la sourate ${match.surah.englishName}, verset ${match.numberInSurah}`}
                  >
                    {/* En-tête du résultat */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="
                          inline-flex items-center justify-center
                          w-8 h-8 rounded-full
                          bg-islam-100 dark:bg-islam-900/40
                          text-islam-700 dark:text-islam-400
                          text-xs font-bold
                        ">
                          {match.surah.number}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {match.surah.englishName}
                          </p>
                          <p className="text-xs text-gray-500">
                            Verset {match.numberInSurah} · Juz {match.juz} · Page {match.page}
                          </p>
                        </div>
                      </div>

                      {/* Nom arabe de la sourate — ⚠️ SACRÉ */}
                      <div
                        dir="rtl"
                        lang="ar"
                        className="arabic-text text-gray-700 dark:text-gray-300 flex-shrink-0"
                        style={{ fontSize: '1rem', lineHeight: '1.6rem' }}
                        aria-label={`Nom arabe : ${match.surah.name}`}
                      >
                        {/* ⚠️ Affiché tel quel */}
                        {match.surah.name}
                      </div>
                    </div>

                    {/* Traduction correspondant à la recherche */}
                    <div className="pl-4 border-l-2 border-islam-200 dark:border-islam-800">
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        {match.text}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {match.surah.englishName} {match.surah.number}:{match.numberInSurah} · Hamidullah
                        <span className="ml-2 text-islam-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          Lire la sourate →
                        </span>
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              // Aucun résultat
              <div className="text-center py-12">
                <p className="text-5xl mb-4">🔍</p>
                <p className="text-gray-500 dark:text-gray-400">
                  Aucun verset trouvé pour « {query} »
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Essayez un autre mot ou une expression en français ou en arabe
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Page vide (pas encore de recherche) ─────────── */}
        {!hasQuery && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">📖</p>
            <p className="text-gray-500">
              Entrez un mot ou une phrase pour rechercher dans le Coran
            </p>
            <p className="text-xs mt-2">
              Exemples : « miséricorde », « paradis », « رحمة »
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
