// ============================================================
// hadiths/[collection]/page.tsx — Livres d'une collection — Clone sunnah.com
// ⚠️  Texte arabe : dir="rtl" lang="ar" OBLIGATOIRES
//     Font arabe : var(--font-amiri)
// ============================================================

import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navigation from '@/components/Navigation'
import {
  getCollectionMeta,
  getBooks,
  SUNNAH_COLLECTIONS,
} from '@/lib/sunnah-api'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ collection: string }>
}

export async function generateStaticParams() {
  return SUNNAH_COLLECTIONS.map((c) => ({ collection: c.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection } = await params
  const meta = getCollectionMeta(collection)
  if (!meta) return {}
  return {
    title: `${meta.nameEn} — Livres — NoorApp`,
    description: `${meta.totalHadith.toLocaleString('fr-FR')} hadiths dans ${meta.nameEn} (${meta.nameFr}). Consultez les livres par chapitre.`,
  }
}

export default async function CollectionPage({ params }: Props) {
  const { collection } = await params

  const meta = getCollectionMeta(collection)
  if (!meta) notFound()

  const books = await getBooks(collection)

  return (
    <div className="min-h-screen" style={{ background: '#0a0f1e' }}>
      <Navigation />

      {/* ── En-tête collection ────────────────────────────────── */}
      <div
        className="relative py-10 px-4 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1a2e 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage: `radial-gradient(circle at 80% 50%, rgba(212,175,55,0.04) 0%, transparent 50%)`,
          }}
        />

        <div className="relative max-w-4xl mx-auto">
          <Link
            href="/hadiths"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-amber-400 transition-colors mb-6"
          >
            ← Collections
          </Link>

          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              {/* Nom arabe — ⚠️ SACRÉ */}
              <p
                dir="rtl"
                lang="ar"
                className="text-3xl mb-2"
                style={{
                  fontFamily: 'var(--font-amiri)',
                  color: '#d4af37',
                  lineHeight: '2',
                  textShadow: '0 0 20px rgba(212,175,55,0.2)',
                }}
              >
                {/* ⚠️ Affiché tel quel */}
                {meta.nameAr}
              </p>

              <h1 className="text-xl font-bold text-slate-100 mb-1">{meta.nameEn}</h1>
              <p className="text-sm text-slate-500">{meta.nameFr}</p>
              <p className="text-xs text-slate-600 mt-1">par {meta.authorEn}</p>

              {/* Stats */}
              <div className="flex items-center gap-5 mt-4">
                <div className="text-center">
                  <p className="text-lg font-bold" style={{ color: '#d4af37' }}>
                    {meta.totalHadith.toLocaleString('fr-FR')}
                  </p>
                  <p className="text-xs text-slate-600">Hadiths</p>
                </div>
                {books.length > 0 && (
                  <>
                    <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.08)' }} />
                    <div className="text-center">
                      <p className="text-lg font-bold text-slate-300">{books.length}</p>
                      <p className="text-xs text-slate-600">Livres</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Badge Primary */}
            {meta.isPrimary && (
              <div
                className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{
                  background: 'rgba(212,175,55,0.08)',
                  border: '1px solid rgba(212,175,55,0.2)',
                  color: '#d4af37',
                }}
              >
                ⭐ Kutub as-Sittah
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Grille des livres ─────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        {books.length > 0 ? (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-0.5 rounded" style={{ background: '#d4af37' }} />
              <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#d4af37' }}>
                Livres de la collection
              </h2>
            </div>

            <div className="grid gap-3">
              {books.map((book, index) => {
                // Trouver les noms AR et EN du livre
                const bookEn = book.book.find((b) => b.lang === 'en')
                const bookAr = book.book.find((b) => b.lang === 'ar')
                const bookName = bookEn?.name ?? bookAr?.name ?? `Livre ${book.bookNumber}`

                return (
                  <Link
                    key={book.bookNumber}
                    href={`/hadiths/${collection}/books/${book.bookNumber}`}
                    className="group flex items-center gap-4 p-4 rounded-xl transition-all duration-200"
                    style={{
                      background: index % 2 === 0 ? 'rgba(17,24,39,0.7)' : 'rgba(13,26,46,0.5)',
                      border: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    {/* Numéro du livre */}
                    <span
                      className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        background: 'rgba(212,175,55,0.08)',
                        border: '1px solid rgba(212,175,55,0.15)',
                        color: '#d4af37',
                      }}
                    >
                      {book.bookNumber}
                    </span>

                    {/* Info livre */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-200 text-sm group-hover:text-white transition-colors truncate">
                        {bookName}
                      </p>
                      {bookAr && (
                        <p
                          dir="rtl"
                          lang="ar"
                          className="text-xs mt-0.5 text-right"
                          style={{
                            fontFamily: 'var(--font-amiri)',
                            color: '#94a3b8',
                            lineHeight: '1.8',
                          }}
                        >
                          {/* ⚠️ Nom arabe — affiché tel quel */}
                          {bookAr.name}
                        </p>
                      )}
                    </div>

                    {/* Stats du livre */}
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs text-slate-500">
                        {book.numberOfHadith} hadiths
                      </p>
                      <p className="text-xs text-slate-700 mt-0.5">
                        {book.hadithStartNumber}–{book.hadithEndNumber}
                      </p>
                    </div>

                    <span className="flex-shrink-0 text-xs text-slate-600 group-hover:text-amber-400 transition-colors">
                      →
                    </span>
                  </Link>
                )
              })}
            </div>
          </>
        ) : (
          /* Fallback : pas de livres → afficher la liste des hadiths directs */
          <div className="text-center py-16">
            <p className="text-4xl mb-4">📚</p>
            <p className="text-slate-400 mb-2">Structure non disponible</p>
            <p className="text-xs text-slate-600 mb-6">
              Cette collection ne possède pas de découpage par livres.
            </p>
            <Link
              href={`/hadiths/${collection}/1`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm transition-all"
              style={{
                background: 'rgba(212,175,55,0.08)',
                border: '1px solid rgba(212,175,55,0.2)',
                color: '#d4af37',
              }}
            >
              Lire le hadith n° 1 →
            </Link>
          </div>
        )}
      </section>

      <footer
        className="text-center py-6 text-xs text-slate-700 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.04)' }}
      >
        <p>Source : sunnah.com API · Données en lecture seule</p>
      </footer>
    </div>
  )
}
