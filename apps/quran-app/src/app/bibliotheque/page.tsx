// ============================================================
// bibliotheque/page.tsx — Bibliothèque islamique — Premium dark
// ⚠️  Les textes classiques sont sacrés — jamais modifier
// ============================================================

import {
  getAllCategories,
  getFeaturedBooks,
  getBooksByCategory,
  getTotalBooksCount,
} from '@/lib/library-api'
import Navigation from '@/components/Navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bibliothèque Islamique — المكتبة الإسلامية',
  description: 'Des centaines de livres islamiques classiques — tafsir, hadith, fiqh, aqida, sira.',
}

export const revalidate = 86400

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

const CATEGORY_GRADIENTS: Record<string, string> = {
  quran:    'linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.03) 100%)',
  hadith:   'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.03) 100%)',
  fiqh:     'linear-gradient(135deg, rgba(96,165,250,0.15) 0%, rgba(96,165,250,0.03) 100%)',
  aqida:    'linear-gradient(135deg, rgba(167,139,250,0.15) 0%, rgba(167,139,250,0.03) 100%)',
  sira:     'linear-gradient(135deg, rgba(251,146,60,0.15) 0%, rgba(251,146,60,0.03) 100%)',
  tasawwuf: 'linear-gradient(135deg, rgba(52,211,153,0.15) 0%, rgba(52,211,153,0.03) 100%)',
  lughah:   'linear-gradient(135deg, rgba(244,114,182,0.15) 0%, rgba(244,114,182,0.03) 100%)',
  general:  'linear-gradient(135deg, rgba(148,163,184,0.15) 0%, rgba(148,163,184,0.03) 100%)',
}

export default function BibliothequeHomePage() {
  const categories = getAllCategories()
  const featuredBooks = getFeaturedBooks()
  const totalCount = getTotalBooksCount()

  return (
    <div className="min-h-screen" style={{ background: '#0a0f1e' }}>
      <Navigation />

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-20 px-4"
        style={{
          background: 'linear-gradient(160deg, #0a0f1e 0%, #0e1528 40%, #0d0a2a 100%)',
          borderBottom: '1px solid rgba(212,175,55,0.12)',
        }}
      >
        {/* Motif géométrique islamique */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
          aria-hidden="true"
        />
        {/* Halo doré */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(212,175,55,0.05) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Titre arabe sacré */}
          <p
            dir="rtl"
            lang="ar"
            className="text-5xl mb-5"
            style={{
              fontFamily: 'var(--font-amiri)',
              color: '#d4af37',
              lineHeight: '1.8',
              textShadow: '0 0 40px rgba(212,175,55,0.25)',
            }}
          >
            {/* ⚠️ Texte sacré — ne pas modifier */}
            المكتبة الإسلامية
          </p>

          <h1
            className="text-4xl md:text-5xl font-bold mb-5"
            style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #d4af37 60%, #f8fafc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Maktaba — <span className="arabic-text" dir="rtl" lang="ar">المكتبة</span>
          </h1>

          <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Un trésor de la connaissance islamique — tafsir, hadith, fiqh, aqida, sira.
            Des œuvres classiques authentiques, accessibles librement.
          </p>

          {/* Barre de recherche → /bibliotheque/recherche */}
          <form
            action="/bibliotheque/recherche"
            method="GET"
            className="relative max-w-2xl mx-auto mb-12"
          >
            <div
              className="flex items-center gap-2 rounded-2xl p-1.5"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(212,175,55,0.2)',
                boxShadow: '0 0 30px rgba(212,175,55,0.05)',
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
                placeholder="Chercher un livre, un auteur, une discipline..."
                className="flex-1 bg-transparent px-3 py-3 text-base outline-none"
                style={{ color: '#f1f5f9' }}
                aria-label="Rechercher dans la bibliothèque islamique"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90"
                style={{
                  background: 'linear-gradient(135deg, #d4af37 0%, #b8930a 100%)',
                  color: '#0a0f1e',
                }}
              >
                Rechercher
              </button>
            </div>
          </form>

          {/* Stats dynamiques */}
          <div className="flex flex-wrap justify-center gap-8">
            {[
              { value: `+${totalCount.toLocaleString('fr-FR')}`, label: 'Livres dans le catalogue' },
              { value: '+100', label: 'Références curatées' },
              { value: '8', label: 'Disciplines' },
              { value: '100%', label: 'Accès libre' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p
                  className="text-3xl font-bold"
                  style={{ color: '#d4af37' }}
                >
                  {s.value}
                </p>
                <p className="text-xs text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-14">

        {/* ══════════════════════════════════════════════
            CATÉGORIES — Grille premium
        ══════════════════════════════════════════════ */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-bold text-slate-100 whitespace-nowrap">
              Disciplines
            </h2>
            <span
              dir="rtl"
              lang="ar"
              className="text-slate-500 text-sm"
              style={{ fontFamily: 'var(--font-amiri)' }}
            >
              أقسام المكتبة
            </span>
            <div
              className="flex-1 h-px"
              style={{ background: 'linear-gradient(90deg, rgba(212,175,55,0.4), transparent)' }}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const accent = CATEGORY_COLORS[cat.id] ?? '#94a3b8'
              const gradient = CATEGORY_GRADIENTS[cat.id] ?? 'linear-gradient(135deg, rgba(148,163,184,0.1), transparent)'
              const catBooks = getBooksByCategory(cat.id)
              return (
                <Link
                  key={cat.id}
                  href={`/bibliotheque/categorie/${cat.id}`}
                  className="group p-6 rounded-2xl text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                  style={{
                    background: gradient,
                    border: `1px solid ${accent}20`,
                  }}
                >
                  <span className="text-4xl mb-4 block">{cat.icon}</span>
                  <h3
                    className="font-bold text-sm mb-1 text-slate-100"
                  >
                    {cat.nameFr}
                  </h3>
                  <p
                    dir="rtl"
                    lang="ar"
                    className="text-xs mb-3"
                    style={{
                      fontFamily: 'var(--font-amiri)',
                      color: accent,
                      lineHeight: '1.8',
                    }}
                  >
                    {/* ⚠️ Texte arabe sacré */}
                    {cat.nameAr}
                  </p>
                  <p className="text-xs text-slate-600">
                    {cat.bookCount.toLocaleString('fr-FR')} livres
                  </p>
                  {catBooks.length > 0 && (
                    <p className="text-xs mt-1" style={{ color: accent, opacity: 0.7 }}>
                      {catBooks.length} références
                    </p>
                  )}
                  <div
                    className="mt-4 h-0.5 rounded-full transition-all duration-300 group-hover:opacity-100 opacity-50"
                    style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
                  />
                </Link>
              )
            })}
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            À LA UNE — Carousel horizontal
        ══════════════════════════════════════════════ */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-bold text-slate-100 whitespace-nowrap">
              Œuvres fondamentales
            </h2>
            <span
              dir="rtl"
              lang="ar"
              className="text-slate-500 text-sm"
              style={{ fontFamily: 'var(--font-amiri)' }}
            >
              أمهات الكتب
            </span>
            <div
              className="flex-1 h-px"
              style={{ background: 'linear-gradient(90deg, rgba(212,175,55,0.4), transparent)' }}
            />
          </div>

          <div
            className="flex gap-4 pb-4"
            style={{ overflowX: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#d4af37 transparent' }}
          >
            {featuredBooks.map((book) => {
              const accent = CATEGORY_COLORS[book.categoryId] ?? '#94a3b8'
              const cat = categories.find(c => c.id === book.categoryId)
              return (
                <Link
                  key={book.id}
                  href={`/bibliotheque/livre/${book.id}`}
                  className="group flex-shrink-0 p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1"
                  style={{
                    width: 240,
                    background: 'rgba(17,24,39,0.8)',
                    border: `1px solid ${accent}20`,
                    boxShadow: `0 4px 20px ${accent}08`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">{cat?.icon}</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: `${accent}15`, color: accent }}
                    >
                      {cat?.nameFr}
                    </span>
                  </div>
                  <p
                    dir="rtl"
                    lang="ar"
                    className="text-base font-semibold mb-2 leading-relaxed"
                    style={{ fontFamily: 'var(--font-amiri)', color: '#f1f5f9', lineHeight: '1.9' }}
                  >
                    {/* ⚠️ Titre arabe sacré */}
                    {book.titleAr}
                  </p>
                  <p
                    dir="rtl"
                    lang="ar"
                    className="text-xs mb-3"
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
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                    {book.volumes && <span>{book.volumes} vol.</span>}
                    {book.pages && !book.volumes && <span>{book.pages} p.</span>}
                    {book.year && (
                      <span
                        dir="rtl"
                        lang="ar"
                        style={{ fontFamily: 'var(--font-amiri)' }}
                      >
                        {book.year}
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            PAR CATÉGORIE — Aperçu 4 livres chacune
        ══════════════════════════════════════════════ */}
        {categories.map((cat) => {
          const catBooks = getBooksByCategory(cat.id).slice(0, 4)
          if (catBooks.length === 0) return null
          const accent = CATEGORY_COLORS[cat.id] ?? '#94a3b8'
          return (
            <section key={cat.id} className="mb-14">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cat.icon}</span>
                  <div>
                    <h2 className="text-xl font-bold text-slate-100">{cat.nameFr}</h2>
                    <p
                      dir="rtl"
                      lang="ar"
                      className="text-sm"
                      style={{ fontFamily: 'var(--font-amiri)', color: accent, lineHeight: '1.8' }}
                    >
                      {/* ⚠️ Texte arabe sacré */}
                      {cat.nameAr}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/bibliotheque/categorie/${cat.id}`}
                  className="text-sm transition-colors hover:opacity-80 whitespace-nowrap"
                  style={{ color: accent }}
                >
                  Tout voir →
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {catBooks.map((book) => (
                  <Link
                    key={book.id}
                    href={`/bibliotheque/livre/${book.id}`}
                    className="group p-4 rounded-xl transition-all duration-300 hover:-translate-y-0.5"
                    style={{
                      background: 'rgba(17,24,39,0.7)',
                      border: `1px solid ${accent}15`,
                    }}
                  >
                    <p
                      dir="rtl"
                      lang="ar"
                      className="text-sm font-semibold mb-1 leading-relaxed"
                      style={{ fontFamily: 'var(--font-amiri)', color: '#f1f5f9', lineHeight: '1.9' }}
                    >
                      {/* ⚠️ Titre arabe sacré */}
                      {book.titleAr}
                    </p>
                    <p
                      dir="rtl"
                      lang="ar"
                      className="text-xs mb-2"
                      style={{ fontFamily: 'var(--font-amiri)', color: accent, opacity: 0.8, lineHeight: '1.7' }}
                    >
                      {/* ⚠️ Auteur arabe sacré */}
                      {book.authorAr}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      {book.volumes && <span>{book.volumes} vol.</span>}
                      {book.pages && !book.volumes && <span>{book.pages} p.</span>}
                      {book.isOpenAccess && (
                        <span style={{ color: '#22c55e' }}>✓</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}

        {/* ══════════════════════════════════════════════
            RESSOURCES EXTERNES
        ══════════════════════════════════════════════ */}
        <section
          className="rounded-2xl p-8 mb-12"
          style={{
            background: 'rgba(17,24,39,0.7)',
            border: '1px solid rgba(212,175,55,0.1)',
          }}
        >
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-xl font-bold text-slate-100 whitespace-nowrap">
              Bibliothèques numériques partenaires
            </h2>
            <div
              className="flex-1 h-px"
              style={{ background: 'linear-gradient(90deg, rgba(212,175,55,0.3), transparent)' }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                nameAr: 'المكتبة الشاملة',
                nameFr: 'Shamela Web',
                url: 'https://shamela.ws',
                desc: '+15 000 livres islamiques numérisés en texte intégral',
                icon: '📚',
                color: '#d4af37',
              },
              {
                nameAr: 'تراث',
                nameFr: 'Turath by Nuqayah',
                url: 'https://nuqayah.com/projects',
                desc: 'Alternative web moderne — interface élégante et recherche avancée',
                icon: '🏛️',
                color: '#22c55e',
              },
              {
                nameAr: 'إسلام هاوس',
                nameFr: 'Islam House',
                url: 'https://islamhouse.com',
                desc: 'Livres islamiques traduits en +100 langues — téléchargement PDF',
                icon: '🌍',
                color: '#60a5fa',
              },
            ].map((res) => (
              <a
                key={res.url}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                style={{
                  border: `1px solid ${res.color}20`,
                  background: `linear-gradient(135deg, ${res.color}08 0%, transparent 100%)`,
                }}
              >
                <span className="text-3xl mb-3 block">{res.icon}</span>
                <p
                  dir="rtl"
                  lang="ar"
                  className="font-semibold text-sm text-slate-100 mb-1"
                  style={{ fontFamily: 'var(--font-amiri)', color: res.color }}
                >
                  {/* ⚠️ Texte arabe sacré */}
                  {res.nameAr}
                </p>
                <p className="text-xs text-slate-400 mb-1">{res.nameFr}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{res.desc}</p>
              </a>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            FOOTER
        ══════════════════════════════════════════════ */}
        <footer
          className="text-center py-8 border-t"
          style={{ borderColor: 'rgba(212,175,55,0.08)' }}
        >
          <p
            dir="rtl"
            lang="ar"
            className="text-sm mb-3"
            style={{ fontFamily: 'var(--font-amiri)', color: '#d4af37', lineHeight: '2' }}
          >
            {/* ⚠️ Texte coranique sacré */}
            وَقُل رَّبِّ زِدۡنِي عِلۡمٗا
          </p>
          <p className="text-xs text-slate-700 mb-1">
            Données : Open Islamic Data · المكتبة الشاملة · Archive.org · Islamhouse
          </p>
          <p className="text-xs text-slate-700">
            ⚠️ Les textes classiques islamiques sont reproduits fidèlement, sans aucune modification.
            Les résumés générés sont labellisés &quot;Résumé non officiel&quot;.
          </p>
        </footer>
      </div>
    </div>
  )
}
