// ============================================================
// hadiths/[collection]/page.tsx — Vue d'une collection de hadiths
// Affiche la liste des hadiths de la collection (paginée)
// ⚠️  Texte arabe des hadiths : dir="rtl" lang="ar" OBLIGATOIRES
//     JAMAIS transformer le texte arab (trim, replace, etc.)
// ============================================================

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBook, getCollectionMeta, HADITH_COLLECTIONS } from '@/lib/hadith-api'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ collection: string }>
  searchParams: Promise<{ page?: string }>
}

const HADITHS_PER_PAGE = 20

export async function generateStaticParams() {
  return HADITH_COLLECTIONS.map((c) => ({ collection: c.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection } = await params
  const meta = getCollectionMeta(collection)
  if (!meta) return {}
  return {
    title: `${meta.name} — Hadiths`,
    description: `${meta.totalHadiths.toLocaleString('fr-FR')} hadiths de ${meta.name} (${meta.nameFr})`,
  }
}

export const revalidate = 86400 // 24h

export default async function CollectionPage({ params, searchParams }: Props) {
  const { collection } = await params
  const { page: pageParam } = await searchParams

  // Vérifier que la collection existe
  const meta = getCollectionMeta(collection)
  if (!meta) notFound()

  // Pagination
  const currentPage = Math.max(1, parseInt(pageParam ?? '1') || 1)
  const startHadith = (currentPage - 1) * HADITHS_PER_PAGE + 1
  const endHadith = Math.min(startHadith + HADITHS_PER_PAGE - 1, meta.totalHadiths)
  const totalPages = Math.ceil(meta.totalHadiths / HADITHS_PER_PAGE)

  // Récupération des hadiths
  const bookData = await getBook(collection, `${startHadith}-${endHadith}`)

  return (
    <main className="min-h-screen bg-cream-50 dark:bg-gray-900">

      {/* ── Navigation ──────────────────────────────────────── */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link
            href="/hadiths"
            className="text-islam-600 dark:text-islam-400 hover:text-islam-700 text-sm flex items-center gap-1"
            aria-label="Retour aux collections"
          >
            ← Collections
          </Link>

          <div className="flex-1 text-center">
            <h1 className="font-bold text-gray-900 dark:text-gray-100 text-sm truncate">
              {meta.name}
            </h1>
            <p className="text-xs text-gray-500">
              {meta.totalHadiths.toLocaleString('fr-FR')} hadiths
            </p>
          </div>

          {/* Nom arabe — ⚠️ SACRÉ */}
          <div
            dir="rtl"
            lang="ar"
            className="arabic-text text-gray-800 dark:text-gray-200 flex-shrink-0"
            style={{ fontSize: '1rem', lineHeight: '1.6rem' }}
            aria-label={`Nom arabe : ${meta.nameArabic}`}
          >
            {/* ⚠️ Affiché tel quel — JAMAIS transformer */}
            {meta.nameArabic}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* ── Info collection ─────────────────────────────── */}
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">{meta.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{meta.nameFr}</p>
              <p className="text-xs text-islam-600 dark:text-islam-400 mt-1">
                {meta.totalHadiths.toLocaleString('fr-FR')} hadiths au total
              </p>
            </div>
            <div
              dir="rtl"
              lang="ar"
              className="arabic-text text-islam-700 dark:text-islam-400 flex-shrink-0"
              style={{ fontSize: '1.2rem', lineHeight: '2rem' }}
            >
              {meta.nameArabic}
            </div>
          </div>
        </div>

        {/* Badge traduction automatique */}
        <div className="mb-4 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
          <span>ℹ️</span>
          <span>
            Page {currentPage} / {totalPages} · Hadiths {startHadith} à {endHadith}
          </span>
        </div>

        {/* ── Liste des hadiths ───────────────────────────── */}
        {bookData && bookData.hadiths.length > 0 ? (
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm divide-y divide-gray-100 dark:divide-gray-700">
            {bookData.hadiths.map((hadith) => (
              <Link
                key={hadith.number}
                href={`/hadiths/${collection}/${hadith.number}`}
                className="
                  group block px-5 py-4
                  hover:bg-islam-50 dark:hover:bg-islam-900/20
                  transition-colors duration-150
                "
                aria-label={`Hadith n° ${hadith.number}`}
              >
                <div className="flex items-start gap-3">
                  {/* Numéro du hadith */}
                  <span className="
                    flex-shrink-0 w-10 h-10 rounded-full
                    bg-islam-100 dark:bg-islam-900/40
                    text-islam-700 dark:text-islam-400
                    text-sm font-medium
                    flex items-center justify-center
                    group-hover:bg-islam-200 dark:group-hover:bg-islam-900/60
                    transition-colors
                  ">
                    {hadith.number}
                  </span>

                  {/* Aperçu du texte arabe */}
                  <div className="flex-1 min-w-0">
                    <p
                      dir="rtl"
                      lang="ar"
                      className="arabic-text text-gray-800 dark:text-gray-200 line-clamp-2"
                      style={{ fontSize: '1rem', lineHeight: '1.8rem' }}
                    >
                      {/* ⚠️ Texte sacré — affiché tel quel */}
                      {hadith.arab}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-right">
                      {meta.name} · n° {hadith.number}
                      <span className="ml-2 text-islam-500">→</span>
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </section>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-2">📚</p>
            <p>Impossible de charger les hadiths.</p>
            <p className="text-xs mt-1">Vérifiez votre connexion ou réessayez plus tard.</p>
          </div>
        )}

        {/* ── Pagination ──────────────────────────────────── */}
        <nav
          className="mt-6 flex items-center justify-between gap-3"
          aria-label="Navigation entre les pages de hadiths"
        >
          {currentPage > 1 ? (
            <Link
              href={`/hadiths/${collection}?page=${currentPage - 1}`}
              className="px-4 py-2 bg-islam-50 dark:bg-islam-900/30 text-islam-700 dark:text-islam-400 rounded-lg hover:bg-islam-100 transition-colors text-sm"
            >
              ← Page {currentPage - 1}
            </Link>
          ) : (
            <span />
          )}

          <span className="text-xs text-gray-400 text-center">
            Page {currentPage} / {totalPages}
          </span>

          {currentPage < totalPages ? (
            <Link
              href={`/hadiths/${collection}?page=${currentPage + 1}`}
              className="px-4 py-2 bg-islam-50 dark:bg-islam-900/30 text-islam-700 dark:text-islam-400 rounded-lg hover:bg-islam-100 transition-colors text-sm"
            >
              Page {currentPage + 1} →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="text-center py-6 text-xs text-gray-400 dark:text-gray-600">
        <p>Source : api.hadith.gading.dev · Données en lecture seule</p>
      </footer>
    </main>
  )
}
