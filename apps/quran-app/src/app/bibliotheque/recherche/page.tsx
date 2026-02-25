// ============================================================
// bibliotheque/recherche/page.tsx — Recherche dans la bibliothèque
// ⚠️  Textes arabes sacrés — jamais modifier
// ============================================================

import {
  searchBooks,
  getAllCategories,
  getBooksByCategory,
  getFeaturedBooks,
} from '@/lib/library-api'
import Navigation from '@/components/Navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

interface Props {
  searchParams: Promise<{ q?: string; cat?: string }>
}

export const metadata: Metadata = {
  title: 'Recherche — Bibliothèque Islamique',
  description: 'Rechercher un livre, un auteur dans la bibliothèque islamique numérique.',
}

const CATEGORY_COLORS: Record<string, string> = {
  quran:    '#d4af37',
  hadith:   '#22c55e',
  fiqh:     '#60a5fa',
  aqida:    '#a78bfa',
  sira:     '#fb923c',
  tasawwuf: '#34d399',
  lughah:   '#f472b6',
  general:  '#94a3b8',
}

const POPULAR_QUERIES = [
  'Bukhari', 'Tafsir', 'Nawawi', 'Ibn Taymiyya', 'Ghazali',
  'Sira', 'Fiqh', 'Ibn Kathir', 'Aqida', 'Grammaire',
]

export default async function RecherchePage({ searchParams }: Props) {
  const { q = '', cat = '' } = await searchParams
  const categories = getAllCategories()
  const featured = getFeaturedBooks()

  let results = q ? searchBooks(q) : []
  if (cat && results.length > 0) {
    results = results.filter(b => b.categoryId === cat)
  } else if (cat && !q) {
    results = getBooksByCategory(cat)
  }

  const hasQuery = q.trim().length > 0

  return (
    <div className="min-h-screen" style={{ background: '#0a0f1e' }}>
      <Navigation />

      {/* ══════════════════════════════════════════════
          HERO RECHERCHE
      ══════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-16 px-4"
        style={{
          background: 'linear-gradient(160deg, #0a0f1e 0%, #0e1528 50%, #0a0f1e 100%)',
          borderBottom: '1px solid rgba(212,175,55,0.1)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(212,175,55,0.04) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        <div className="relative max-w-3xl mx-auto text-center">
          <nav className="flex items-center justify-center gap-2 text-sm text-slate-600 mb-6">
            <Link href="/bibliotheque" className="hover:text-amber-400 transition-colors">
              Bibliothèque
            </Link>
            <span>›</span>
            <span className="text-slate-400">Recherche</span>
          </nav>

          <p
            dir="rtl"
            lang="ar"
            className="text-2xl mb-4"
            style={{ fontFamily: 'var(--font-amiri)', color: '#d4af37', lineHeight: '1.8' }}
          >
            {/* ⚠️ Texte arabe sacré */}
            البحث في المكتبة
          </p>

          <h1 className="text-3xl font-bold text-slate-100 mb-8">
            Rechercher dans la bibliothèque
          </h1>

          {/* Barre de recherche */}
          <form
            action="/bibliotheque/recherche"
            method="GET"
            className="relative mb-4"
          >
            <div
              className="flex items-center gap-2 rounded-2xl p-1.5"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(212,175,55,0.2)',
              }}
            >
              <svg
                className="ml-3 w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: '#d4af37', opacity: 0.7 }}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Chercher un livre, un auteur, un titre arabe..."
                autoFocus
                className="flex-1 bg-transparent px-3 py-3 text-base outline-none"
                style={{ color: '#f1f5f9' }}
                aria-label="Rechercher dans la bibliothèque islamique"
              />
              {cat && <input type="hidden" name="cat" value={cat} />}
              <button
                type="submit"
                className="px-6 py-3 rounded-xl text-sm font-semibold"
                style={{
                  background: 'linear-gradient(135deg, #d4af37 0%, #b8930a 100%)',
                  color: '#0a0f1e',
                }}
              >
                Chercher
              </button>
            </div>
          </form>

          {/* Filtres catégories */}
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              href={`/bibliotheque/recherche?q=${encodeURIComponent(q)}`}
              className="px-3 py-1.5 rounded-full text-xs transition-all"
              style={{
                background: !cat ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${!cat ? '#d4af37' : 'rgba(255,255,255,0.1)'}`,
                color: !cat ? '#d4af37' : '#94a3b8',
              }}
            >
              Toutes
            </Link>
            {categories.map((c) => {
              const accent = CATEGORY_COLORS[c.id] ?? '#94a3b8'
              const isActive = cat === c.id
              return (
                <Link
                  key={c.id}
                  href={`/bibliotheque/recherche?q=${encodeURIComponent(q)}&cat=${c.id}`}
                  className="px-3 py-1.5 rounded-full text-xs transition-all"
                  style={{
                    background: isActive ? `${accent}20` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isActive ? accent : 'rgba(255,255,255,0.08)'}`,
                    color: isActive ? accent : '#94a3b8',
                  }}
                >
                  {c.icon} {c.nameFr}
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12">

        {/* ══════════════════════════════════════════════
            RÉSULTATS
        ══════════════════════════════════════════════ */}
        {hasQuery || cat ? (
          <div>
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-xl font-bold text-slate-100 whitespace-nowrap">
                {results.length > 0
                  ? `${results.length} résultat${results.length !== 1 ? 's' : ''}`
                  : 'Aucun résultat'}
              </h2>
              {q && (
                <span className="text-slate-500 text-sm">
                  pour &quot;<span className="text-slate-300">{q}</span>&quot;
                </span>
              )}
              <div
                className="flex-1 h-px"
                style={{ background: 'linear-gradient(90deg, rgba(212,175,55,0.3), transparent)' }}
              />
            </div>

            {results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {results.map((book) => {
                  const accent = CATEGORY_COLORS[book.categoryId] ?? '#94a3b8'
                  const bookCat = categories.find(c => c.id === book.categoryId)
                  return (
                    <Link
                      key={book.id}
                      href={`/bibliotheque/livre/${book.id}`}
                      className="group p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1"
                      style={{
                        background: 'rgba(17,24,39,0.8)',
                        border: `1px solid ${accent}18`,
                      }}
                    >
                      {/* Catégorie badge */}
                      {bookCat && (
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm">{bookCat.icon}</span>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: `${accent}15`, color: accent }}
                          >
                            {bookCat.nameFr}
                          </span>
                        </div>
                      )}

                      {/* Titre arabe ⚠️ SACRÉ */}
                      <p
                        dir="rtl"
                        lang="ar"
                        className="text-base font-semibold mb-1 leading-relaxed"
                        style={{
                          fontFamily: 'var(--font-amiri)',
                          color: '#f1f5f9',
                          lineHeight: '1.9',
                        }}
                      >
                        {/* ⚠️ Titre arabe — affiché tel quel */}
                        {book.titleAr}
                      </p>

                      {book.titleFr && (
                        <p className="text-sm text-slate-400 mb-2">{book.titleFr}</p>
                      )}

                      {/* Auteur ⚠️ SACRÉ */}
                      <p
                        dir="rtl"
                        lang="ar"
                        className="text-sm mb-3"
                        style={{
                          fontFamily: 'var(--font-amiri)',
                          color: accent,
                          lineHeight: '1.8',
                        }}
                      >
                        {/* ⚠️ Auteur arabe sacré */}
                        {book.authorAr}
                        {book.year && (
                          <span className="text-slate-600 mr-2"> — {book.year}</span>
                        )}
                      </p>

                      {book.description && (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                          {book.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        {book.volumes && <span>📚 {book.volumes} vol.</span>}
                        {book.pages && !book.volumes && <span>📄 {book.pages} p.</span>}
                        {book.isOpenAccess && (
                          <span style={{ color: '#22c55e' }}>✓ Accès libre</span>
                        )}
                        <span
                          className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: accent }}
                        >
                          Voir →
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-5xl mb-4">🔍</p>
                <p className="text-slate-400 text-lg mb-3">
                  Aucun résultat pour &quot;{q}&quot;
                </p>
                <p className="text-slate-600 text-sm mb-6">
                  Essayez en arabe, en français, ou consultez directement المكتبة الشاملة.
                </p>
                <a
                  href={`https://shamela.ws/search?q=${encodeURIComponent(q)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm transition-all hover:opacity-80"
                  style={{
                    background: 'rgba(212,175,55,0.1)',
                    border: '1px solid rgba(212,175,55,0.2)',
                    color: '#d4af37',
                  }}
                >
                  Chercher sur Shamela.ws →
                </a>
              </div>
            )}
          </div>
        ) : (
          /* ══════════════════════════════════════════════
             ÉTAT VIDE — Suggestions populaires
          ══════════════════════════════════════════════ */
          <div>
            {/* Suggestions de recherche */}
            <section className="mb-14">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-lg font-bold text-slate-100 whitespace-nowrap">
                  Recherches populaires
                </h2>
                <div
                  className="flex-1 h-px"
                  style={{ background: 'linear-gradient(90deg, rgba(212,175,55,0.3), transparent)' }}
                />
              </div>
              <div className="flex flex-wrap gap-3">
                {POPULAR_QUERIES.map((pq) => (
                  <Link
                    key={pq}
                    href={`/bibliotheque/recherche?q=${encodeURIComponent(pq)}`}
                    className="px-4 py-2 rounded-xl text-sm transition-all hover:opacity-80"
                    style={{
                      background: 'rgba(212,175,55,0.08)',
                      border: '1px solid rgba(212,175,55,0.15)',
                      color: '#d4af37',
                    }}
                  >
                    {pq}
                  </Link>
                ))}
              </div>
            </section>

            {/* Livres mis en avant */}
            <section className="mb-14">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-lg font-bold text-slate-100 whitespace-nowrap">
                  Œuvres de référence
                </h2>
                <span
                  dir="rtl"
                  lang="ar"
                  className="text-sm text-slate-500"
                  style={{ fontFamily: 'var(--font-amiri)' }}
                >
                  {/* ⚠️ Texte arabe sacré */}
                  أمهات الكتب
                </span>
                <div
                  className="flex-1 h-px"
                  style={{ background: 'linear-gradient(90deg, rgba(212,175,55,0.3), transparent)' }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {featured.slice(0, 9).map((book) => {
                  const accent = CATEGORY_COLORS[book.categoryId] ?? '#94a3b8'
                  const bookCat = categories.find(c => c.id === book.categoryId)
                  return (
                    <Link
                      key={book.id}
                      href={`/bibliotheque/livre/${book.id}`}
                      className="group p-5 rounded-2xl transition-all duration-300 hover:-translate-y-0.5"
                      style={{
                        background: 'rgba(17,24,39,0.8)',
                        border: `1px solid ${accent}15`,
                      }}
                    >
                      {bookCat && (
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm">{bookCat.icon}</span>
                          <span className="text-xs text-slate-600">{bookCat.nameFr}</span>
                        </div>
                      )}
                      <p
                        dir="rtl"
                        lang="ar"
                        className="text-base font-semibold mb-1"
                        style={{
                          fontFamily: 'var(--font-amiri)',
                          color: '#f1f5f9',
                          lineHeight: '1.9',
                        }}
                      >
                        {/* ⚠️ Titre arabe sacré */}
                        {book.titleAr}
                      </p>
                      <p
                        dir="rtl"
                        lang="ar"
                        className="text-xs mb-2"
                        style={{ fontFamily: 'var(--font-amiri)', color: accent, lineHeight: '1.7' }}
                      >
                        {/* ⚠️ Auteur arabe sacré */}
                        {book.authorAr}
                      </p>
                      {book.description && (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {book.description}
                        </p>
                      )}
                    </Link>
                  )
                })}
              </div>
            </section>

            {/* Explorer par catégorie */}
            <section>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-lg font-bold text-slate-100 whitespace-nowrap">
                  Explorer par discipline
                </h2>
                <div
                  className="flex-1 h-px"
                  style={{ background: 'linear-gradient(90deg, rgba(212,175,55,0.3), transparent)' }}
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {categories.map((c) => {
                  const accent = CATEGORY_COLORS[c.id] ?? '#94a3b8'
                  return (
                    <Link
                      key={c.id}
                      href={`/bibliotheque/categorie/${c.id}`}
                      className="flex items-center gap-3 p-4 rounded-xl transition-all hover:-translate-y-0.5"
                      style={{
                        background: `${accent}08`,
                        border: `1px solid ${accent}15`,
                      }}
                    >
                      <span className="text-2xl">{c.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-slate-200">{c.nameFr}</p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {c.bookCount.toLocaleString('fr-FR')} livres
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          </div>
        )}
      </div>

      <footer className="text-center py-6 text-xs text-slate-700">
        <p>⚠️ Les textes islamiques classiques sont reproduits sans modification</p>
      </footer>
    </div>
  )
}
