// ============================================================
// hadiths/[collection]/page.tsx — Vue collection de hadiths — Premium dark
// Fetch réel depuis l'API hadith.gading.dev
// ⚠️  Texte arabe des hadiths : dir="rtl" lang="ar" OBLIGATOIRES
// ============================================================

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBook, getCollectionMeta, HADITH_COLLECTIONS } from '@/lib/hadith-api'
import Navigation from '@/components/Navigation'
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

export const revalidate = 86400

export default async function CollectionPage({ params, searchParams }: Props) {
  const { collection } = await params
  const { page: pageParam } = await searchParams

  const meta = getCollectionMeta(collection)
  if (!meta) notFound()

  const currentPage = Math.max(1, parseInt(pageParam ?? '1') || 1)
  const startHadith = (currentPage - 1) * HADITHS_PER_PAGE + 1
  const endHadith = Math.min(startHadith + HADITHS_PER_PAGE - 1, meta.totalHadiths)
  const totalPages = Math.ceil(meta.totalHadiths / HADITHS_PER_PAGE)

  const bookData = await getBook(collection, `${startHadith}-${endHadith}`)

  return (
    <div className="min-h-screen" style={{ background: '#0a0f1e' }}>
      <Navigation />

      {/* ── En-tête collection ─────────────────────────────── */}
      <div
        className="relative py-10 px-4"
        style={{
          background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1a2e 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="max-w-3xl mx-auto">
          <Link
            href="/hadiths"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-amber-400 transition-colors mb-6"
          >
            ← Collections
          </Link>

          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-1">
                {meta.name}
              </h1>
              <p className="text-slate-500 text-sm">{meta.nameFr}</p>
              <p className="text-sm mt-2" style={{ color: '#22c55e' }}>
                {meta.totalHadiths.toLocaleString('fr-FR')} hadiths au total
              </p>
            </div>

            {/* Nom arabe — ⚠️ SACRÉ */}
            <div
              dir="rtl"
              lang="ar"
              className="flex-shrink-0"
              style={{
                fontFamily: 'var(--font-amiri)',
                fontSize: '1.8rem',
                lineHeight: '2',
                color: '#d4af37',
                textShadow: '0 0 20px rgba(212,175,55,0.3)',
              }}
              aria-label={`Nom arabe : ${meta.nameArabic}`}
            >
              {/* ⚠️ Affiché tel quel */}
              {meta.nameArabic}
            </div>
          </div>

          {/* Info page */}
          <div
            className="mt-4 inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#94a3b8',
            }}
          >
            Page {currentPage} / {totalPages} · Hadiths {startHadith} à {endHadith}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* ── Liste des hadiths ──────────────────────────── */}
        {bookData && bookData.hadiths.length > 0 ? (
          <section
            className="rounded-2xl overflow-hidden"
            style={{
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {bookData.hadiths.map((hadith, index) => (
              <Link
                key={hadith.number}
                href={`/hadiths/${collection}/${hadith.number}`}
                className="group block px-5 py-5 transition-all duration-200"
                style={{
                  background: index % 2 === 0 ? 'rgba(17,24,39,0.7)' : 'rgba(26,34,53,0.5)',
                  borderBottom: index < (bookData.hadiths.length - 1) ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}
                aria-label={`Hadith n° ${hadith.number}`}
              >
                <div className="flex items-start gap-4">
                  {/* Numéro du hadith — badge doré */}
                  <span
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      background: 'linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.08) 100%)',
                      border: '1px solid rgba(212,175,55,0.2)',
                      color: '#d4af37',
                    }}
                  >
                    {hadith.number}
                  </span>

                  {/* Aperçu du texte arabe */}
                  <div className="flex-1 min-w-0">
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
                      {hadith.arab}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-slate-600">
                        {meta.name} · n° {hadith.number}
                      </p>
                      <span
                        className="text-xs text-slate-600 group-hover:text-amber-400 transition-colors"
                      >
                        Lire → 
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </section>
        ) : (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">📚</p>
            <p className="text-slate-400">Impossible de charger les hadiths.</p>
            <p className="text-xs text-slate-600 mt-1">Vérifiez votre connexion ou réessayez plus tard.</p>
          </div>
        )}

        {/* ── Pagination ──────────────────────────────────── */}
        <nav
          className="mt-8 flex items-center justify-between gap-3"
          aria-label="Navigation entre les pages de hadiths"
        >
          {currentPage > 1 ? (
            <Link
              href={`/hadiths/${collection}?page=${currentPage - 1}`}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#94a3b8',
              }}
            >
              ← Page {currentPage - 1}
            </Link>
          ) : <span />}

          <span className="text-xs text-slate-600">
            Page {currentPage} / {totalPages}
          </span>

          {currentPage < totalPages ? (
            <Link
              href={`/hadiths/${collection}?page=${currentPage + 1}`}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#94a3b8',
              }}
            >
              Page {currentPage + 1} →
            </Link>
          ) : <span />}
        </nav>
      </div>

      <footer className="text-center py-6 text-xs text-slate-700">
        <p>Source : api.hadith.gading.dev · Données en lecture seule</p>
      </footer>
    </div>
  )
}
