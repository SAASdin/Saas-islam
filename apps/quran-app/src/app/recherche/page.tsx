'use client'
// ============================================================
// app/recherche/page.tsx — Page de recherche dans le Coran
//
// ⚠️  RÈGLES ABSOLUES — NE JAMAIS DÉROGER :
//   1. Highlight UNIQUEMENT dans la traduction (jamais dans le texte arabe)
//   2. Texte arabe affiché TEL QUEL — READ ONLY — zero transformation
//   3. dir="rtl" + lang="ar" OBLIGATOIRES sur tout texte arabe
//   4. Aucun toLowerCase() / trim() / replace() sur le texte arabe
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// ── Constantes ────────────────────────────────────────────────

const API_BASE         = 'https://api.alquran.cloud/v1'
const HISTORY_KEY      = 'noorapp-search-history'
const MAX_HISTORY      = 10
const MAX_RESULTS      = 20        // Limite pour ne pas saturer l'API
const ARABIC_REGEX     = /[\u0600-\u06FF]/
const REF_REGEX        = /^(\d{1,3}):(\d{1,3})$/
const BORDER_GREEN     = '#1a5c38'
const BORDER_GOLD      = '#c9a84c'

// ── Types ─────────────────────────────────────────────────────

interface SearchResultData {
  surahNumber:      number
  surahName:        string   // Nom translittéré (ex: Al-Baqarah)
  surahNameAr:      string   // ⚠️ SACRÉ — READ ONLY
  ayahNumber:       number   // Numéro dans la sourate
  ayahNumberQuran:  number   // Numéro global 1–6236
  textArabic:       string   // ⚠️ SACRÉ — READ ONLY — JAMAIS highlight
  translationFr:    string   // Seul champ où le highlight est autorisé
  juz:              number
}

interface AlQuranSearchMatch {
  number:         number
  text:           string
  surah:          { number: number; name: string; englishName: string }
  numberInSurah:  number
  juz:            number
}

interface AlQuranEditionAyah {
  number:       number
  text:         string
  edition:      { identifier: string }
  surah:        { number: number; name: string; englishName: string }
  numberInSurah: number
  juz:          number
}

type SearchType = 'ref' | 'ar' | 'fr'

// ── Utilitaires ───────────────────────────────────────────────

/** Détecte le type de requête saisie */
function detectQueryType(q: string): SearchType {
  if (REF_REGEX.test(q.trim())) return 'ref'
  if (ARABIC_REGEX.test(q))     return 'ar'
  return 'fr'
}

/**
 * Highlight sécurisé — TRADUCTION UNIQUEMENT
 * ⚠️  Ne jamais appeler cette fonction sur le texte arabe
 */
function highlightTranslation(text: string, query: string): React.ReactNode {
  if (!query || !text || detectQueryType(query) === 'ref') return text

  // On ne highlight pas si la requête est en arabe — trop risqué de casser le texte
  if (detectQueryType(query) === 'ar') return text

  const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${safeQuery})`, 'gi'))

  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark
        key={i}
        style={{
          background: '#fef3c7',
          color:      '#92400e',
          borderRadius: '2px',
          padding:    '0 2px',
          fontWeight: '600',
        }}
      >
        {part}
      </mark>
    ) : (
      part
    )
  )
}

// ── Fonctions d'appel API (client-side) ───────────────────────

/**
 * Recherche par référence — ex: "2:255"
 * Récupère les deux éditions en une seule requête
 */
async function fetchByReference(
  surahNumber: number,
  ayahNumber:  number
): Promise<SearchResultData> {
  const res = await fetch(
    `${API_BASE}/ayah/${surahNumber}:${ayahNumber}/editions/quran-uthmani,fr.hamidullah`
  )
  if (!res.ok) throw new Error(`Verset ${surahNumber}:${ayahNumber} introuvable`)

  const json = await res.json()
  if (json.code !== 200) throw new Error(json.status ?? 'Erreur API')

  const editions: AlQuranEditionAyah[] = json.data
  const arabic  = editions.find(e => e.edition.identifier === 'quran-uthmani')
  const french  = editions.find(e => e.edition.identifier === 'fr.hamidullah')

  if (!arabic) throw new Error('Texte arabe indisponible')

  return {
    surahNumber:     arabic.surah.number,
    surahName:       arabic.surah.englishName,
    surahNameAr:     arabic.surah.name,            // ⚠️ SACRÉ
    ayahNumber:      arabic.numberInSurah,
    ayahNumberQuran: arabic.number,
    textArabic:      arabic.text,                  // ⚠️ SACRÉ — READ ONLY
    translationFr:   french?.text ?? '',
    juz:             arabic.juz,
  }
}

/**
 * Récupère les données complètes (arabe + FR) d'un verset identifié
 * par surah:ayah depuis une liste de matches de l'API search
 */
async function fetchFullAyah(
  surahNumber: number,
  ayahNumber:  number
): Promise<SearchResultData | null> {
  try {
    return await fetchByReference(surahNumber, ayahNumber)
  } catch {
    return null
  }
}

/**
 * Recherche par mot-clé dans la traduction française
 * Retourne les résultats avec texte arabe complet
 */
async function searchFrench(
  query:        string,
  surahFilter:  number | 'all'
): Promise<SearchResultData[]> {
  const surahParam = surahFilter === 'all' ? 'all' : String(surahFilter)
  const res = await fetch(
    `${API_BASE}/search/${encodeURIComponent(query)}/${surahParam}/fr.hamidullah`
  )
  if (!res.ok) throw new Error('Recherche française indisponible')

  const json = await res.json()
  if (json.code !== 200) return []

  const matches: AlQuranSearchMatch[] = (json.data?.matches ?? []).slice(0, MAX_RESULTS)

  // Récupérer le texte arabe pour chaque résultat (en parallèle)
  const results = await Promise.allSettled(
    matches.map(m => fetchFullAyah(m.surah.number, m.numberInSurah))
  )

  return results
    .filter((r): r is PromiseFulfilledResult<SearchResultData> =>
      r.status === 'fulfilled' && r.value !== null
    )
    .map(r => r.value)
}

/**
 * Recherche par mot-clé en arabe
 * ⚠️  La requête arabe est transmise TELLE QUELLE à l'API — aucune transformation
 */
async function searchArabic(
  query:       string,
  surahFilter: number | 'all'
): Promise<SearchResultData[]> {
  const surahParam = surahFilter === 'all' ? 'all' : String(surahFilter)
  const res = await fetch(
    `${API_BASE}/search/${encodeURIComponent(query)}/${surahParam}/ar`
  )
  if (!res.ok) throw new Error('Recherche arabe indisponible')

  const json = await res.json()
  if (json.code !== 200) return []

  const matches: AlQuranSearchMatch[] = (json.data?.matches ?? []).slice(0, MAX_RESULTS)

  // Pour la recherche arabe : l'API retourne le texte arabe,
  // on récupère aussi la traduction FR en parallèle
  const results = await Promise.allSettled(
    matches.map(m => fetchFullAyah(m.surah.number, m.numberInSurah))
  )

  return results
    .filter((r): r is PromiseFulfilledResult<SearchResultData> =>
      r.status === 'fulfilled' && r.value !== null
    )
    .map(r => r.value)
}

// ── Composant carte de résultat ───────────────────────────────
// Visuellement cohérent avec AyahCard, mais accepte ReactNode pour la traduction
// (pour le highlight — interdit sur le texte arabe)

interface SearchResultCardProps {
  result:              SearchResultData
  highlightedTranslation: React.ReactNode  // Highlight OK ici
  isFirst:             boolean
}

function SearchResultCard({ result, highlightedTranslation, isFirst }: SearchResultCardProps) {
  const ref = `${result.surahName} ${result.surahNumber}:${result.ayahNumber}`

  return (
    <article
      id={`result-${result.surahNumber}-${result.ayahNumber}`}
      className="rounded-2xl overflow-hidden transition-shadow hover:shadow-md"
      style={{
        background:  '#ffffff',
        border:      '1px solid #e5e7eb',
        borderLeft:  `4px solid ${isFirst ? BORDER_GOLD : BORDER_GREEN}`,
        marginBottom: '1rem',
      }}
      aria-label={`Résultat : ${ref}`}
    >
      {/* En-tête : référence + lien */}
      <div
        className="flex items-center justify-between px-5 pt-4 pb-3"
        style={{ borderBottom: '1px solid #f3f4f6' }}
      >
        <div className="flex items-center gap-3">
          {/* Cercle numéro de verset */}
          <div
            className="flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold flex-shrink-0"
            style={{
              background: `${BORDER_GREEN}15`,
              border:     `2px solid ${BORDER_GREEN}`,
              color:      BORDER_GREEN,
            }}
            aria-hidden="true"
          >
            {result.ayahNumber}
          </div>

          <div>
            <p className="text-sm font-semibold" style={{ color: BORDER_GREEN }}>
              {ref}
            </p>
            {/* Nom de la sourate en arabe — READ ONLY */}
            <p
              dir="rtl"
              lang="ar"
              className="text-xs"
              style={{
                fontFamily: 'var(--font-amiri, Amiri, serif)',
                color:       BORDER_GOLD,
                lineHeight:  '1.4',
              }}
            >
              {/* ⚠️ surahNameAr affiché TEL QUEL — READ ONLY */}
              {result.surahNameAr}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Badge Juz */}
          <span
            className="text-xs px-2 py-1 rounded-full"
            style={{
              background: `${BORDER_GREEN}10`,
              color:       BORDER_GREEN,
              border:      `1px solid ${BORDER_GREEN}30`,
            }}
          >
            Juz {result.juz}
          </span>

          {/* Lien vers la page sourate */}
          <Link
            href={`/surah/${result.surahNumber}#ayah-${result.surahNumber}-${result.ayahNumber}`}
            className="text-xs px-3 py-1 rounded-full transition-colors"
            style={{
              background: BORDER_GREEN,
              color:       '#ffffff',
              textDecoration: 'none',
            }}
            aria-label={`Voir ${ref} dans la sourate complète`}
          >
            Voir →
          </Link>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          Texte arabe — PREMIER dans le DOM — READ ONLY
          ⚠️  dir="rtl" + lang="ar" OBLIGATOIRES
          ⚠️  JAMAIS de highlight ici — texte sacré intouchable
          ══════════════════════════════════════════════════════ */}
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
        <p
          dir="rtl"
          lang="ar"
          data-testid="arabic-text"
          className="text-right leading-loose select-text"
          style={{
            // ⚠️ Police islamique — JAMAIS Arial / Helvetica
            fontFamily: 'var(--font-kfgqpc, var(--font-amiri), Scheherazade New, serif)',
            fontSize:    '1.8rem',
            lineHeight:  '3rem',
            color:       '#111827',
            letterSpacing: 0,
            wordSpacing: '0.15em',
          }}
        >
          {/* ⚠️ textArabic affiché TEL QUEL — jamais modifié, jamais highlight */}
          {result.textArabic}
        </p>
        <div
          className="mt-3 h-px w-16 ml-auto"
          style={{ background: `linear-gradient(to left, ${BORDER_GOLD}, transparent)` }}
          aria-hidden="true"
        />
      </div>

      {/* Traduction française — highlight autorisé ici uniquement */}
      <div className="px-5 py-4">
        <p
          data-testid="translation-fr"
          className="text-sm leading-relaxed"
          style={{ color: '#374151' }}
          lang="fr"
        >
          {/* ✅ Seul endroit où le highlight est appliqué */}
          {highlightedTranslation}
        </p>
        <p className="mt-1 text-xs" style={{ color: `${BORDER_GREEN}99` }}>
          — Muhammad Hamidullah
        </p>
      </div>
    </article>
  )
}

// ── Composant principal ───────────────────────────────────────

export default function RecherchePage() {
  const [query,        setQuery]        = useState('')
  const [inputValue,   setInputValue]   = useState('')
  const [results,      setResults]      = useState<SearchResultData[]>([])
  const [isLoading,    setIsLoading]    = useState(false)
  const [error,        setError]        = useState<string | null>(null)
  const [history,      setHistory]      = useState<string[]>([])
  const [filterSurah,  setFilterSurah]  = useState<number | 'all'>('all')
  const [filterJuz,    setFilterJuz]    = useState<number | 'all'>('all')
  const [totalCount,   setTotalCount]   = useState<number>(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // ── Chargement de l'historique ───────────────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY)
      if (stored) setHistory(JSON.parse(stored))
    } catch {
      // localStorage non disponible — pas bloquant
    }
  }, [])

  // ── Gestion de l'historique ──────────────────────────────────
  const addToHistory = useCallback((q: string) => {
    if (!q.trim()) return
    setHistory(prev => {
      const filtered = prev.filter(item => item !== q)
      const next = [q, ...filtered].slice(0, MAX_HISTORY)
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
      } catch { /* ignore */ }
      return next
    })
  }, [])

  const removeFromHistory = useCallback((q: string) => {
    setHistory(prev => {
      const next = prev.filter(item => item !== q)
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
      } catch { /* ignore */ }
      return next
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    try { localStorage.removeItem(HISTORY_KEY) } catch { /* ignore */ }
  }, [])

  // ── Logique de recherche ─────────────────────────────────────
  const performSearch = useCallback(async (
    q:         string,
    surahFilt: number | 'all',
    juzFilt:   number | 'all'
  ) => {
    const trimmed = q.trim()
    if (!trimmed) return

    setIsLoading(true)
    setError(null)
    setResults([])

    try {
      const type = detectQueryType(trimmed)
      let data: SearchResultData[] = []

      if (type === 'ref') {
        // Recherche par référence — ex: "2:255"
        const match = trimmed.match(REF_REGEX)!
        const result = await fetchByReference(Number(match[1]), Number(match[2]))
        data = [result]

      } else if (type === 'fr') {
        // Recherche en français
        data = await searchFrench(trimmed, surahFilt)

      } else {
        // Recherche en arabe — requête transmise TELLE QUELLE
        data = await searchArabic(trimmed, surahFilt)
      }

      // Filtre Juz côté client (si filtre actif)
      if (juzFilt !== 'all') {
        data = data.filter(r => r.juz === juzFilt)
      }

      setTotalCount(data.length)
      setResults(data)
      addToHistory(trimmed)

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur de recherche'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [addToHistory])

  // ── Soumission du formulaire ─────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = inputValue.trim()
    if (!q) return
    setQuery(q)
    performSearch(q, filterSurah, filterJuz)
  }

  // ── Clic sur historique ──────────────────────────────────────
  const handleHistoryClick = (q: string) => {
    setInputValue(q)
    setQuery(q)
    performSearch(q, filterSurah, filterJuz)
    inputRef.current?.focus()
  }

  // ── Changement de filtre → relance la recherche ──────────────
  const handleFilterChange = (
    newSurah: number | 'all',
    newJuz:   number | 'all'
  ) => {
    setFilterSurah(newSurah)
    setFilterJuz(newJuz)
    if (query) performSearch(query, newSurah, newJuz)
  }

  // ── Type de la requête courante ──────────────────────────────
  const queryType = query ? detectQueryType(query) : null

  // ── Options sourate (1–114) ──────────────────────────────────
  const surahOptions = Array.from({ length: 114 }, (_, i) => i + 1)

  // ── Options juz (1–30) ───────────────────────────────────────
  const juzOptions = Array.from({ length: 30 }, (_, i) => i + 1)

  // ── Rendu ────────────────────────────────────────────────────
  return (
    <main className="min-h-screen" style={{ background: '#f9fafb' }}>
      {/* ══════════════════════════════════════════════════════
          En-tête — Barre de recherche proéminente
          ════════════════════════════════════════════════════ */}
      <section
        className="py-16 px-4"
        style={{
          background:  `linear-gradient(135deg, ${BORDER_GREEN} 0%, #0d3a24 100%)`,
          position:    'relative',
          overflow:    'hidden',
        }}
      >
        {/* Motif géométrique décoratif */}
        <div
          aria-hidden="true"
          style={{
            position:     'absolute',
            inset:        0,
            background:   'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(201,168,76,0.03) 40px, rgba(201,168,76,0.03) 80px)',
            pointerEvents: 'none',
          }}
        />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          {/* Titre */}
          <p
            dir="rtl"
            lang="ar"
            className="text-2xl mb-2"
            style={{
              fontFamily: 'var(--font-amiri, Amiri, serif)',
              color:       BORDER_GOLD,
            }}
          >
            {/* ⚠️ Texte arabe affiché TEL QUEL — READ ONLY */}
            ٱبۡحَثۡ فِي ٱلۡقُرۡءَانِ ٱلۡكَرِيمِ
          </p>
          <h1 className="text-3xl font-bold text-white mb-2">
            Recherche dans le Coran
          </h1>
          <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Recherche par mot-clé (FR / AR) ou par référence (ex : 2:255)
          </p>

          {/* Formulaire de recherche */}
          <form onSubmit={handleSubmit} role="search" aria-label="Recherche dans le Coran">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="search"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder='Ex : "lumière", "نور", ou "2:255"'
                  className="w-full px-5 py-4 rounded-2xl text-base outline-none transition-shadow"
                  style={{
                    background:   '#ffffff',
                    border:       `2px solid transparent`,
                    color:        '#111827',
                    boxShadow:    '0 4px 24px rgba(0,0,0,0.15)',
                    // Direction adaptative selon le contenu
                    direction:    ARABIC_REGEX.test(inputValue) ? 'rtl' : 'ltr',
                    fontFamily:   ARABIC_REGEX.test(inputValue)
                      ? 'var(--font-amiri, Amiri, serif)'
                      : 'inherit',
                    fontSize:     ARABIC_REGEX.test(inputValue) ? '1.2rem' : '1rem',
                  }}
                  aria-label="Terme de recherche"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="px-6 py-4 rounded-2xl font-semibold transition-all active:scale-95 disabled:opacity-50"
                style={{
                  background: BORDER_GOLD,
                  color:      '#1a1a1a',
                  border:     'none',
                  cursor:     isLoading ? 'not-allowed' : 'pointer',
                  minWidth:   '100px',
                  boxShadow:  '0 4px 24px rgba(0,0,0,0.15)',
                }}
                aria-label="Lancer la recherche"
              >
                {isLoading ? '⟳' : '🔍 Chercher'}
              </button>
            </div>
          </form>

          {/* Exemples de recherche */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {['2:255', 'lumière', 'نور', 'patience', 'Al-Fatiha → 1:1'].map(ex => (
              <button
                key={ex}
                onClick={() => {
                  const val = ex.includes('→') ? ex.split('→')[1].trim() : ex
                  setInputValue(val)
                  setQuery(val)
                  performSearch(val, filterSurah, filterJuz)
                }}
                className="text-xs px-3 py-1 rounded-full transition-opacity hover:opacity-80"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  color:      'rgba(255,255,255,0.9)',
                  border:     '1px solid rgba(255,255,255,0.25)',
                  cursor:     'pointer',
                }}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          Corps de la page
          ════════════════════════════════════════════════════ */}
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* ── Historique des recherches ──────────────────────── */}
        {history.length > 0 && !query && (
          <section aria-labelledby="history-title" className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2
                id="history-title"
                className="text-sm font-semibold uppercase tracking-wide"
                style={{ color: '#6b7280' }}
              >
                🕐 Recherches récentes
              </h2>
              <button
                onClick={clearHistory}
                className="text-xs transition-colors"
                style={{ color: '#9ca3af' }}
                aria-label="Effacer tout l'historique"
              >
                Tout effacer
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {history.map((item, i) => (
                <div key={i} className="flex items-center gap-1">
                  <button
                    onClick={() => handleHistoryClick(item)}
                    className="text-sm px-3 py-1.5 rounded-xl transition-all hover:shadow-sm"
                    style={{
                      background: '#ffffff',
                      border:     `1px solid ${BORDER_GREEN}30`,
                      color:      BORDER_GREEN,
                      cursor:     'pointer',
                      // Direction selon le contenu
                      direction:  ARABIC_REGEX.test(item) ? 'rtl' : 'ltr',
                      fontFamily: ARABIC_REGEX.test(item)
                        ? 'var(--font-amiri, Amiri), serif'
                        : 'inherit',
                    }}
                    aria-label={`Relancer la recherche : ${item}`}
                  >
                    {item}
                  </button>
                  <button
                    onClick={() => removeFromHistory(item)}
                    className="text-xs w-5 h-5 flex items-center justify-center rounded-full transition-colors"
                    style={{ color: '#d1d5db', background: 'transparent' }}
                    aria-label={`Supprimer "${item}" de l'historique`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Filtres ────────────────────────────────────────── */}
        {(query || results.length > 0) && (
          <section
            aria-labelledby="filters-title"
            className="mb-6 p-4 rounded-2xl"
            style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}
          >
            <h2
              id="filters-title"
              className="text-sm font-semibold mb-3"
              style={{ color: '#374151' }}
            >
              🎛️ Filtres
            </h2>
            <div className="flex flex-wrap gap-3">
              {/* Filtre par sourate */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="filter-surah"
                  className="text-xs font-medium"
                  style={{ color: '#6b7280' }}
                >
                  Sourate
                </label>
                <select
                  id="filter-surah"
                  value={filterSurah}
                  onChange={e => {
                    const val = e.target.value === 'all' ? 'all' : Number(e.target.value)
                    handleFilterChange(val, filterJuz)
                  }}
                  className="text-sm px-3 py-2 rounded-xl outline-none"
                  style={{
                    background: '#f9fafb',
                    border:     `1px solid ${BORDER_GREEN}40`,
                    color:      '#111827',
                    cursor:     'pointer',
                  }}
                  aria-label="Filtrer par sourate"
                >
                  <option value="all">Toutes les sourates</option>
                  {surahOptions.map(n => (
                    <option key={n} value={n}>
                      Sourate {n}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtre par Juz */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="filter-juz"
                  className="text-xs font-medium"
                  style={{ color: '#6b7280' }}
                >
                  Juz
                </label>
                <select
                  id="filter-juz"
                  value={filterJuz}
                  onChange={e => {
                    const val = e.target.value === 'all' ? 'all' : Number(e.target.value)
                    handleFilterChange(filterSurah, val)
                  }}
                  className="text-sm px-3 py-2 rounded-xl outline-none"
                  style={{
                    background: '#f9fafb',
                    border:     `1px solid ${BORDER_GREEN}40`,
                    color:      '#111827',
                    cursor:     'pointer',
                  }}
                  aria-label="Filtrer par Juz"
                >
                  <option value="all">Tous les Juz</option>
                  {juzOptions.map(n => (
                    <option key={n} value={n}>
                      Juz {n}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset filtres */}
              {(filterSurah !== 'all' || filterJuz !== 'all') && (
                <div className="flex flex-col justify-end">
                  <button
                    onClick={() => handleFilterChange('all', 'all')}
                    className="text-xs px-3 py-2 rounded-xl transition-colors"
                    style={{
                      background: '#fee2e2',
                      color:      '#dc2626',
                      border:     '1px solid #fecaca',
                      cursor:     'pointer',
                    }}
                    aria-label="Réinitialiser les filtres"
                  >
                    ✕ Réinitialiser
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── État : chargement ─────────────────────────────── */}
        {isLoading && (
          <div className="text-center py-16" role="status" aria-live="polite">
            <div
              className="inline-block w-10 h-10 rounded-full border-4 mb-4"
              style={{
                borderColor:     `${BORDER_GREEN}30`,
                borderTopColor:  BORDER_GREEN,
                animation:       'spin 0.8s linear infinite',
              }}
              aria-hidden="true"
            />
            <p className="text-sm" style={{ color: '#6b7280' }}>
              Recherche en cours…
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* ── État : erreur ─────────────────────────────────── */}
        {error && !isLoading && (
          <div
            className="p-4 rounded-2xl text-center"
            style={{ background: '#fee2e2', border: '1px solid #fecaca' }}
            role="alert"
          >
            <p className="text-sm font-medium" style={{ color: '#dc2626' }}>
              ⚠️ {error}
            </p>
            <p className="text-xs mt-1" style={{ color: '#ef4444' }}>
              Vérifiez la référence ou réessayez avec un autre terme.
            </p>
          </div>
        )}

        {/* ── Résultats ─────────────────────────────────────── */}
        {!isLoading && !error && results.length > 0 && (
          <section aria-labelledby="results-title">
            {/* Bande info résultats */}
            <div className="flex items-center justify-between mb-4">
              <h2
                id="results-title"
                className="text-sm font-semibold"
                style={{ color: '#374151' }}
              >
                {totalCount} résultat{totalCount > 1 ? 's' : ''} pour
                {' '}
                <span
                  style={{
                    color:      BORDER_GREEN,
                    fontFamily: queryType === 'ar'
                      ? 'var(--font-amiri, Amiri), serif'
                      : 'inherit',
                    direction:  queryType === 'ar' ? 'rtl' : 'ltr',
                    display:    'inline-block',
                  }}
                  {...(queryType === 'ar' ? { dir: 'rtl', lang: 'ar' } : {})}
                >
                  &laquo;{query}&raquo;
                </span>
              </h2>

              {/* Badge type de recherche */}
              <span
                className="text-xs px-2 py-1 rounded-full"
                style={{
                  background: queryType === 'ref'
                    ? '#eff6ff'
                    : queryType === 'ar'
                    ? `${BORDER_GOLD}20`
                    : `${BORDER_GREEN}10`,
                  color: queryType === 'ref'
                    ? '#1d4ed8'
                    : queryType === 'ar'
                    ? '#92400e'
                    : BORDER_GREEN,
                  border: `1px solid ${queryType === 'ref'
                    ? '#bfdbfe'
                    : queryType === 'ar'
                    ? BORDER_GOLD + '40'
                    : BORDER_GREEN + '30'}`,
                }}
              >
                {queryType === 'ref'
                  ? '📍 Référence'
                  : queryType === 'ar'
                  ? '🕌 Arabe'
                  : '🇫🇷 Français'}
              </span>
            </div>

            {/* Liste des résultats */}
            <div role="list" aria-label="Résultats de recherche">
              {results.map((result, i) => (
                <div key={`${result.surahNumber}-${result.ayahNumber}`} role="listitem">
                  <SearchResultCard
                    result={result}
                    isFirst={i === 0}
                    highlightedTranslation={
                      /* ✅ Highlight UNIQUEMENT sur la traduction française */
                      highlightTranslation(result.translationFr, query)
                    }
                  />
                </div>
              ))}
            </div>

            {/* Note limite résultats */}
            {totalCount >= MAX_RESULTS && (
              <p
                className="text-center text-xs mt-4 pb-8"
                style={{ color: '#9ca3af' }}
              >
                Affichage limité à {MAX_RESULTS} résultats. Affinez votre recherche ou utilisez les filtres.
              </p>
            )}
          </section>
        )}

        {/* ── État : aucun résultat ─────────────────────────── */}
        {!isLoading && !error && query && results.length === 0 && (
          <div className="text-center py-16" role="status">
            <p className="text-4xl mb-4" aria-hidden="true">🔎</p>
            <p className="font-semibold text-lg mb-2" style={{ color: '#374151' }}>
              Aucun résultat pour &laquo;{query}&raquo;
            </p>
            <p className="text-sm" style={{ color: '#9ca3af' }}>
              Essayez avec un terme différent, vérifiez l'orthographe,
              ou entrez une référence directe (ex : 2:255).
            </p>
          </div>
        )}

        {/* ── État initial : page vide (pas encore de recherche) ── */}
        {!query && !isLoading && (
          <div className="text-center py-16">
            <p
              dir="rtl"
              lang="ar"
              className="text-4xl mb-4"
              style={{ fontFamily: 'var(--font-amiri, Amiri), serif', color: BORDER_GOLD }}
            >
              {/* ⚠️ Texte arabe affiché TEL QUEL — READ ONLY */}
              ﴿وَنُنَزِّلُ مِنَ ٱلۡقُرۡءَانِ مَا هُوَ شِفَآءٌ وَرَحۡمَةٌ لِّلۡمُؤۡمِنِينَ﴾
            </p>
            <p className="text-xs mt-2 mb-8" style={{ color: '#9ca3af' }}>
              Al-Isrâ 17:82
            </p>

            {/* Aide à la recherche */}
            <div
              className="max-w-md mx-auto text-left rounded-2xl p-6"
              style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}
            >
              <h2 className="font-semibold mb-4" style={{ color: '#374151' }}>
                Comment chercher ?
              </h2>
              <ul className="space-y-3 text-sm" style={{ color: '#6b7280' }}>
                <li className="flex items-start gap-3">
                  <span style={{ color: BORDER_GREEN, fontWeight: '700' }}>FR</span>
                  <span>
                    Tapez un mot français — ex : <strong>lumière</strong>, <strong>patience</strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span style={{ color: BORDER_GOLD, fontWeight: '700', fontFamily: 'var(--font-amiri, Amiri)' }} lang="ar" dir="rtl">ع</span>
                  <span>
                    Tapez un mot arabe — ex :
                    {' '}
                    <span
                      dir="rtl"
                      lang="ar"
                      style={{ fontFamily: 'var(--font-amiri, Amiri)', color: '#374151' }}
                    >
                      {/* ⚠️ READ ONLY */}
                      نور
                    </span>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span style={{ color: '#1d4ed8', fontWeight: '700' }}>2:255</span>
                  <span>
                    Entrez une référence directe <strong>sourate:verset</strong>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
