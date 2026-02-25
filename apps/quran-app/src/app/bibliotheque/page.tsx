// ============================================================
// bibliotheque/page.tsx — Bibliothèque islamique — Premium dark
// ⚠️  Les textes classiques sont sacrés — lire sans modifier
// ============================================================

import { getAllCategories, getFeaturedBooks } from '@/lib/library-api'
import Navigation from '@/components/Navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bibliothèque Islamique — المكتبة الإسلامية',
  description: 'Milliers de livres islamiques classiques — tafsir, hadith, fiqh, aqida, sira.',
}

export const revalidate = 86400

const CATEGORY_COLORS: Record<string, string> = {
  tafsir: '#d4af37',
  hadith: '#22c55e',
  fiqh: '#60a5fa',
  aqida: '#a78bfa',
  sira: '#fb923c',
  tasawwuf: '#34d399',
  lughah: '#f472b6',
  other: '#94a3b8',
}

export default function BibliothequeHomePage() {
  const categories = getAllCategories()
  const featuredBooks = getFeaturedBooks()

  return (
    <div className="min-h-screen" style={{ background: '#0a0f1e' }}>
      <Navigation />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-16 px-4"
        style={{
          background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1a2e 40%, #120a2e 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="absolute inset-0 islamic-star-pattern opacity-50 pointer-events-none" aria-hidden="true" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(167,139,250,0.06) 0%, transparent 70%)' }}
        />

        <div className="relative max-w-4xl mx-auto text-center">
          <p
            dir="rtl"
            lang="ar"
            className="text-4xl mb-5"
            style={{
              fontFamily: 'var(--font-amiri)',
              color: '#d4af37',
              lineHeight: '1.8',
              textShadow: '0 0 30px rgba(212,175,55,0.3)',
            }}
            aria-label="Al-Maktaba al-Islamiyya"
          >
            {/* ⚠️ Texte sacré */}
            المكتبة الإسلامية
          </p>

          <h1
            className="text-4xl font-bold mb-4"
            style={{
              background: 'linear-gradient(135deg, #f1f5f9 0%, #d4af37 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Bibliothèque Islamique Numérique
          </h1>

          <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
            Des milliers de livres islamiques classiques — tafsir, hadith, fiqh, aqida, sira.
          </p>

          {/* Barre de recherche */}
          <div className="relative max-w-xl mx-auto">
            <svg
              className="absolute left-4 top-4 w-5 h-5 pointer-events-none"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
              style={{ color: '#d4af37', opacity: 0.6 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              placeholder="Chercher un livre, un auteur..."
              className="w-full px-5 py-4 pl-12 rounded-2xl text-base"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#f1f5f9',
                outline: 'none',
              }}
              aria-label="Rechercher dans la bibliothèque"
            />
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-8">
            {[
              { value: '+7 000', label: 'Livres' },
              { value: '+2 000', label: 'Auteurs' },
              { value: '8', label: 'Catégories' },
              { value: 'Gratuit', label: 'Accès libre' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12">

        {/* ── Catégories ─────────────────────────────────── */}
        <section className="mb-14">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-xl font-bold text-slate-100 whitespace-nowrap">
              Parcourir par catégorie
            </h2>
            <div className="flex-1 gold-line" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const accentColor = CATEGORY_COLORS[cat.id] ?? '#94a3b8'
              return (
                <Link
                  key={cat.id}
                  href={`/bibliotheque/categorie/${cat.id}`}
                  className="group p-5 rounded-2xl text-center transition-all duration-300"
                  style={{
                    background: 'rgba(17,24,39,0.7)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <span className="text-4xl mb-3 block">{cat.icon}</span>
                  <h3
                    className="font-semibold text-sm mb-1 transition-colors"
                    style={{ color: '#f1f5f9' }}
                  >
                    {cat.nameFr}
                  </h3>
                  <p
                    dir="rtl"
                    lang="ar"
                    className="text-xs mb-2"
                    style={{
                      fontFamily: 'var(--font-amiri)',
                      color: accentColor,
                      lineHeight: '1.6',
                    }}
                  >
                    {/* ⚠️ Texte arabe sacré */}
                    {cat.nameAr}
                  </p>
                  <p className="text-xs text-slate-600">
                    {cat.bookCount.toLocaleString('fr-FR')} livres
                  </p>
                  <div
                    className="mt-3 h-0.5 rounded-full"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${accentColor}60, transparent)`,
                    }}
                  />
                </Link>
              )
            })}
          </div>
        </section>

        {/* ── Livres en vedette ──────────────────────────── */}
        <section className="mb-14">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-xl font-bold text-slate-100 whitespace-nowrap">
              Livres de référence
            </h2>
            <span
              dir="rtl"
              lang="ar"
              className="text-sm text-slate-500"
              style={{ fontFamily: 'var(--font-amiri)' }}
            >
              أمهات الكتب
            </span>
            <div className="flex-1 gold-line" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredBooks.map((book) => {
              const category = categories.find(c => c.id === book.categoryId)
              const accentColor = CATEGORY_COLORS[book.categoryId] ?? '#94a3b8'
              return (
                <Link
                  key={book.id}
                  href={`/bibliotheque/livre/${book.id}`}
                  className="group p-5 rounded-2xl transition-all duration-300"
                  style={{
                    background: 'rgba(17,24,39,0.7)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm">{category?.icon}</span>
                    <span className="text-xs text-slate-600">{category?.nameFr}</span>
                  </div>

                  <p
                    dir="rtl"
                    lang="ar"
                    className="text-base font-semibold mb-1 leading-relaxed transition-colors"
                    style={{
                      fontFamily: 'var(--font-amiri)',
                      color: '#f1f5f9',
                    }}
                  >
                    {/* ⚠️ Titre arabe sacré */}
                    {book.titleAr}
                  </p>

                  {book.titleFr && (
                    <p className="text-sm text-slate-400 mb-2">{book.titleFr}</p>
                  )}

                  <p
                    dir="rtl"
                    lang="ar"
                    className="text-xs mb-3"
                    style={{
                      fontFamily: 'var(--font-amiri)',
                      color: accentColor,
                      lineHeight: '1.6',
                    }}
                  >
                    {/* ⚠️ Nom auteur en arabe sacré */}
                    {book.authorAr}
                    {book.year && <span className="text-slate-600 mr-2"> — {book.year}</span>}
                  </p>

                  {book.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {book.description}
                    </p>
                  )}

                  <div className="mt-4 flex items-center gap-3 text-xs text-slate-600">
                    {book.volumes && <span>{book.volumes} vol.</span>}
                    {book.pages && !book.volumes && <span>{book.pages} p.</span>}
                    {book.isOpenAccess && (
                      <span style={{ color: '#22c55e' }}>✓ Accès libre</span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* ── Ressources externes ──────────────────────── */}
        <section
          className="rounded-2xl p-6 mb-10"
          style={{
            background: 'rgba(17,24,39,0.7)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <h2 className="text-lg font-bold text-slate-100 mb-6">
            Ressources externes recommandées
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                name: 'المكتبة الشاملة',
                nameEn: 'Shamela Web',
                url: 'https://shamela.ws',
                desc: '+15,000 livres islamiques numérisés',
                icon: '📚',
              },
              {
                name: 'تراث (نقاية)',
                nameEn: 'Turath by Nuqayah',
                url: 'https://nuqayah.com/projects',
                desc: 'Alternative web moderne à Shamela',
                icon: '🏛️',
              },
              {
                name: 'Islamhouse',
                nameEn: 'Islam House',
                url: 'https://islamhouse.com',
                desc: 'Livres islamiques en 100+ langues',
                icon: '🌍',
              },
            ].map((res) => (
              <a
                key={res.name}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 rounded-xl transition-all duration-200"
                style={{
                  border: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(26,34,53,0.5)',
                }}
              >
                <span className="text-2xl mb-2 block">{res.icon}</span>
                <p
                  dir="rtl"
                  lang="ar"
                  className="font-semibold text-sm text-slate-200 mb-1"
                  style={{ fontFamily: 'var(--font-amiri)' }}
                >
                  {/* ⚠️ Texte arabe sacré */}
                  {res.name}
                </p>
                <p className="text-xs text-slate-600">{res.desc}</p>
              </a>
            ))}
          </div>
        </section>

        <footer className="text-center text-xs text-slate-700">
          <p>Données : Open Islamic Data · Shamela · Archive.org</p>
          <p className="mt-1">⚠️ Les textes classiques sont reproduits fidèlement sans modification</p>
        </footer>
      </div>
    </div>
  )
}
