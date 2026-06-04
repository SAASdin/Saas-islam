// ============================================================
// hadiths/[collection]/books/[bookNumber]/page.tsx — Hadiths dans un livre
// ⚠️  Texte arabe : dir="rtl" lang="ar" OBLIGATOIRES
//     Font arabe : var(--font-amiri)
// ============================================================

import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getCollectionMeta,
  getBooks,
  getHadithsInBook,
  getHadithByLang,
  stripHadithTags,
  getGradeBadgeStyle,
} from '@/lib/sunnah-api'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

const HADITHS_PER_PAGE = 20

interface Props {
  params: Promise<{ collection: string; bookNumber: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection, bookNumber } = await params
  const meta = getCollectionMeta(collection)
  if (!meta) return {}

  const books = await getBooks(collection)
  const book = books.find((b) => b.bookNumber === bookNumber)
  const bookName = book?.book.find((b) => b.lang === 'en')?.name ?? `Livre ${bookNumber}`

  return {
    title: `${bookName} — ${meta.nameEn} — NoorApp`,
    description: `Hadiths du livre ${bookName} de ${meta.nameEn}.`,
  }
}

export default async function BookPage({ params, searchParams }: Props) {
  const { collection, bookNumber } = await params
  const { page: pageParam } = await searchParams

  const meta = getCollectionMeta(collection)
  if (!meta) notFound()

  const currentPage = Math.max(1, parseInt(pageParam ?? '1') || 1)

  // Charger le livre pour son nom
  const books = await getBooks(collection)
  const book = books.find((b) => b.bookNumber === bookNumber)

  // Charger les hadiths de ce livre
  const { data: hadiths, total } = await getHadithsInBook(
    collection,
    bookNumber,
    currentPage,
    HADITHS_PER_PAGE
  )

  const totalPages = Math.ceil(total / HADITHS_PER_PAGE)

  // Noms du livre
  const bookNameEn = book?.book.find((b) => b.lang === 'en')?.name ?? `Livre ${bookNumber}`
  const bookNameAr = book?.book.find((b) => b.lang === 'ar')?.name

  return (
    <div className="min-h-screen" style={{ background: '#0a0f1e' }}>


      {/* ── En-tête ───────────────────────────────────────────── */}
      <div
        className="relative py-10 px-4"
        style={{
          background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1a2e 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="max-w-3xl mx-auto">
          {/* Fil d'Ariane */}
          <nav className="flex items-center gap-2 text-xs text-slate-600 mb-6 flex-wrap">
            <Link href="/hadiths" className="hover:text-amber-400 transition-colors">
              Hadiths
            </Link>
            <span>›</span>
            <Link href={`/hadiths/${collection}`} className="hover:text-amber-400 transition-colors">
              {meta.nameEn}
            </Link>
            <span>›</span>
            <span className="text-slate-400">{bookNameEn}</span>
          </nav>

          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              {/* Nom arabe du livre — ⚠️ SACRÉ */}
              {bookNameAr && (
                <p
                  dir="rtl"
                  lang="ar"
                  className="text-2xl mb-2"
                  style={{
                    fontFamily: 'var(--font-amiri)',
                    color: '#d4af37',
                    lineHeight: '2',
                  }}
                >
                  {/* ⚠️ Affiché tel quel */}
                  {bookNameAr}
                </p>
              )}
              <h1 className="text-xl font-bold text-slate-100 mb-1">{bookNameEn}</h1>
              <p className="text-sm text-slate-500">{meta.nameEn}</p>
              {book && (
                <p className="text-xs text-slate-600 mt-1">
                  Hadiths {book.hadithStartNumber}–{book.hadithEndNumber} · {book.numberOfHadith} hadiths
                </p>
              )}
            </div>

            {/* Numéro du livre */}
            <div
              className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold"
              style={{
                background: 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(212,175,55,0.06) 100%)',
                border: '1px solid rgba(212,175,55,0.2)',
                color: '#d4af37',
              }}
            >
              {bookNumber}
            </div>
          </div>

          {/* Pagination info */}
          {totalPages > 1 && (
            <div
              className="mt-4 inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#94a3b8',
              }}
            >
              Page {currentPage} / {totalPages} · {total} hadiths au total
            </div>
          )}
        </div>
      </div>

      {/* ── Liste des hadiths ─────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 py-8">
        {hadiths.length > 0 ? (
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {hadiths.map((hadithDetail, index) => {
              const arHadith = getHadithByLang(hadithDetail, 'ar')
              const enHadith = getHadithByLang(hadithDetail, 'en')

              const arText = arHadith ? stripHadithTags(arHadith.body) : ''
              const chapterTitle = enHadith?.chapterTitle ?? arHadith?.chapterTitle ?? ''
              const grade = enHadith?.grades?.[0]?.grade ?? arHadith?.grades?.[0]?.grade ?? ''
              const gradeStyle = getGradeBadgeStyle(grade)

              return (
                <Link
                  key={hadithDetail.hadithNumber}
                  href={`/hadiths/${collection}/${hadithDetail.hadithNumber}`}
                  className="group block px-5 py-5 transition-all duration-200"
                  style={{
                    background: index % 2 === 0 ? 'rgba(17,24,39,0.7)' : 'rgba(13,26,46,0.5)',
                    borderBottom:
                      index < hadiths.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  }}
                  aria-label={`Hadith n° ${hadithDetail.hadithNumber}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Numéro */}
                    <span
                      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        background: 'rgba(212,175,55,0.08)',
                        border: '1px solid rgba(212,175,55,0.15)',
                        color: '#d4af37',
                      }}
                    >
                      {hadithDetail.hadithNumber}
                    </span>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      {/* Titre du chapitre */}
                      {chapterTitle && (
                        <p className="text-xs text-slate-500 mb-2 truncate">{chapterTitle}</p>
                      )}

                      {/* Aperçu texte arabe — ⚠️ ZONE SACRÉE */}
                      {arText && (
                        <p
                          dir="rtl"
                          lang="ar"
                          className="line-clamp-2"
                          style={{
                            fontFamily: 'var(--font-amiri)',
                            fontSize: '1.1rem',
                            lineHeight: '2',
                            color: '#e2e8f0',
                            direction: 'rtl',
                            textAlign: 'right',
                          }}
                        >
                          {/* ⚠️ Texte sacré — affiché tel quel */}
                          {arText}
                        </p>
                      )}

                      {/* Footer de l'item */}
                      <div className="flex items-center justify-between mt-2">
                        {grade ? (
                          <span
                            className="text-xs px-2 py-0.5 rounded-md font-medium"
                            style={gradeStyle}
                          >
                            {grade}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-700">
                            {meta.nameEn} · {hadithDetail.hadithNumber}
                          </span>
                        )}
                        <span className="text-xs text-slate-600 group-hover:text-amber-400 transition-colors">
                          Lire →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">📚</p>
            <p className="text-slate-400">Aucun hadith trouvé pour ce livre.</p>
            <Link
              href={`/hadiths/${collection}`}
              className="mt-4 inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors"
            >
              ← Retour à la collection
            </Link>
          </div>
        )}

        {/* ── Pagination ────────────────────────────────────────── */}
        {totalPages > 1 && (
          <nav
            className="mt-8 flex items-center justify-between gap-3"
            aria-label="Pagination"
          >
            {currentPage > 1 ? (
              <Link
                href={`/hadiths/${collection}/books/${bookNumber}?page=${currentPage - 1}`}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#94a3b8',
                }}
              >
                ← Page {currentPage - 1}
              </Link>
            ) : (
              <span />
            )}

            <span className="text-xs text-slate-600">
              {currentPage} / {totalPages}
            </span>

            {currentPage < totalPages ? (
              <Link
                href={`/hadiths/${collection}/books/${bookNumber}?page=${currentPage + 1}`}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#94a3b8',
                }}
              >
                Page {currentPage + 1} →
              </Link>
            ) : (
              <span />
            )}
          </nav>
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
