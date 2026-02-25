// ============================================================
// bibliotheque/page.tsx — Bibliothèque islamique numérique
// Inspiré de shamela.ws + nuqayah.com/turath
// Équivalent de المكتبة الشاملة version web moderne
// ⚠️  Les textes classiques sont sacrés — lire sans modifier
// ============================================================

import { getAllCategories, getFeaturedBooks } from '@/lib/library-api'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bibliothèque Islamique — المكتبة الإسلامية',
  description: 'Milliers de livres islamiques classiques — tafsir, hadith, fiqh, aqida, sira. Alternative web à la Bibliothèque Shamilah.',
}

export const revalidate = 86400

export default function BibliothequeHomePage() {
  const categories = getAllCategories()
  const featuredBooks = getFeaturedBooks()

  return (
    <main className="min-h-screen bg-cream-50 dark:bg-gray-900">

      {/* ── Navigation ────────────────────────────────────── */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-islam-700 dark:text-islam-400">
            🕌 Saas-islam
          </Link>
          <nav className="flex gap-4 text-sm text-gray-600 dark:text-gray-300">
            <Link href="/" className="hover:text-islam-600">Coran</Link>
            <Link href="/hadiths" className="hover:text-islam-600">Hadiths</Link>
            <Link href="/priere" className="hover:text-islam-600">Prière</Link>
            <Link href="/bibliotheque" className="text-islam-600 font-semibold">Bibliothèque</Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-islam-700 to-islam-900 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p
            dir="rtl"
            lang="ar"
            className="text-3xl mb-4 opacity-90"
            aria-label="Al-Maktaba al-Islamiyya"
          >
            المكتبة الإسلامية
          </p>
          <h1 className="text-4xl font-bold mb-4">
            Bibliothèque Islamique Numérique
          </h1>
          <p className="text-islam-100 text-lg mb-8 max-w-xl mx-auto">
            Des milliers de livres islamiques classiques — tafsir, hadith, fiqh, aqida, sira.
            Accès libre. Sur tous les appareils.
          </p>

          {/* Barre de recherche */}
          <div className="relative max-w-xl mx-auto">
            <input
              type="search"
              placeholder="Chercher un livre, un auteur..."
              className="w-full px-5 py-4 pl-12 rounded-2xl text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Rechercher dans la bibliothèque"
            />
            <svg
              className="absolute left-4 top-4 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-8 text-islam-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">+7,000</p>
              <p className="text-sm">Livres</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">+2,000</p>
              <p className="text-sm">Auteurs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">8</p>
              <p className="text-sm">Catégories</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">Gratuit</p>
              <p className="text-sm">Accès libre</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* ── Catégories ───────────────────────────────────── */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Parcourir par catégorie
            </h2>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/bibliotheque/categorie/${cat.id}`}
                className="group bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover:border-islam-300 border border-transparent text-center"
              >
                <span className="text-4xl mb-3 block" role="img" aria-hidden>
                  {cat.icon}
                </span>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-islam-600 text-sm mb-1">
                  {cat.nameFr}
                </h3>
                <p
                  dir="rtl"
                  lang="ar"
                  className="text-xs text-islam-600 dark:text-islam-400 mb-2"
                >
                  {cat.nameAr}
                </p>
                <p className="text-xs text-gray-400">
                  {cat.bookCount.toLocaleString('fr-FR')} livres
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Livres en vedette ─────────────────────────────── */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Livres de référence
            </h2>
            <span className="text-sm text-gray-400">أمهات الكتب</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredBooks.map((book) => {
              const category = categories.find(c => c.id === book.categoryId)
              return (
                <Link
                  key={book.id}
                  href={`/bibliotheque/livre/${book.id}`}
                  className="group bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all border border-transparent hover:border-islam-200"
                >
                  {/* Catégorie badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm" role="img" aria-hidden>{category?.icon}</span>
                    <span className="text-xs text-gray-400">{category?.nameFr}</span>
                  </div>

                  {/* Titre arabe */}
                  <p
                    dir="rtl"
                    lang="ar"
                    className="text-base font-semibold text-gray-900 dark:text-gray-100 group-hover:text-islam-600 transition-colors mb-1 leading-relaxed"
                  >
                    {book.titleAr}
                  </p>

                  {/* Titre français si disponible */}
                  {book.titleFr && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {book.titleFr}
                    </p>
                  )}

                  {/* Auteur */}
                  <p
                    dir="rtl"
                    lang="ar"
                    className="text-xs text-islam-600 dark:text-islam-400 mb-3"
                  >
                    {book.authorAr}
                    {book.year && <span className="text-gray-400 mr-2"> — {book.year}</span>}
                  </p>

                  {/* Description */}
                  {book.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {book.description}
                    </p>
                  )}

                  {/* Métadonnées */}
                  <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                    {book.volumes && <span>{book.volumes} vol.</span>}
                    {book.pages && !book.volumes && <span>{book.pages} p.</span>}
                    {book.isOpenAccess && (
                      <span className="text-green-600 dark:text-green-400">✓ Accès libre</span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* ── Ressources externes ───────────────────────────── */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm mb-10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
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
                desc: 'Alternative web moderne à Shamela — PWA offline',
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
                className="block p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-islam-200 transition-colors"
              >
                <span className="text-2xl mb-2 block" role="img" aria-hidden>{res.icon}</span>
                <p dir="rtl" lang="ar" className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  {res.name}
                </p>
                <p className="text-xs text-gray-400 mt-1">{res.desc}</p>
              </a>
            ))}
          </div>
        </section>

        <footer className="text-center text-xs text-gray-400 dark:text-gray-600">
          <p>Données : Open Islamic Data · Shamela · Archive.org</p>
          <p className="mt-1">⚠️ Les textes classiques sont reproduits fidèlement sans modification</p>
        </footer>
      </div>
    </main>
  )
}
