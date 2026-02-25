// ============================================================
// bibliotheque/livre/[id]/page.tsx — Fiche livre premium
// ⚠️  Textes arabes sacrés — jamais modifier
// ============================================================

import {
  getBookById,
  getCategoryById,
  getShamela_url,
  getArchiveUrl,
  getIslamhouseUrl,
  getRelatedBooks,
  getBooksByAuthor,
  FEATURED_BOOKS,
} from '@/lib/library-api'
import Navigation from '@/components/Navigation'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
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

export async function generateStaticParams() {
  return FEATURED_BOOKS.map((b) => ({ id: b.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const book = getBookById(id)
  if (!book) return {}
  return {
    title: `${book.titleFr ?? book.titleAr} — Bibliothèque Islamique`,
    description: book.description ?? `Fiche du livre ${book.titleAr} de ${book.authorAr}`,
  }
}

export const revalidate = 86400

export default async function BookPage({ params }: Props) {
  const { id } = await params
  const book = getBookById(id)
  if (!book) notFound()

  const category = getCategoryById(book.categoryId)
  const accentColor = CATEGORY_COLORS[book.categoryId] ?? '#94a3b8'
  const shamelaUrl = book.shamela_id ? getShamela_url(book.shamela_id) : null
  const archiveUrl = getArchiveUrl(book.titleAr)
  const islamhouseUrl = getIslamhouseUrl(book.titleFr, book.titleAr)
  const relatedBooks = getRelatedBooks(book, 3)
  const authorBooks = getBooksByAuthor(book.authorAr, book.id).slice(0, 3)

  return (
    <div className="min-h-screen" style={{ background: '#0a0f1e' }}>
      <Navigation />

      {/* ══════════════════════════════════════════════
          HERO LIVRE
      ══════════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden py-16 px-4"
        style={{
          background: `linear-gradient(160deg, #0a0f1e 0%, ${accentColor}07 50%, #0c0a1e 100%)`,
          borderBottom: `1px solid ${accentColor}12`,
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 50% 80% at 80% 40%, ${accentColor}04 0%, transparent 60%)`,
          }}
          aria-hidden="true"
        />

        <div className="relative max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-600 mb-8 flex-wrap">
            <Link href="/bibliotheque" className="hover:text-amber-400 transition-colors">
              Bibliothèque
            </Link>
            <span>›</span>
            {category && (
              <>
                <Link
                  href={`/bibliotheque/categorie/${category.id}`}
                  className="hover:text-amber-400 transition-colors"
                >
                  {category.nameFr}
                </Link>
                <span>›</span>
              </>
            )}
            <span className="text-slate-400">{book.titleFr ?? book.titleAr}</span>
          </nav>

          {/* Badge catégorie */}
          {category && (
            <Link
              href={`/bibliotheque/categorie/${category.id}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6 transition-opacity hover:opacity-80"
              style={{
                background: `${accentColor}15`,
                border: `1px solid ${accentColor}30`,
                color: accentColor,
              }}
            >
              <span>{category.icon}</span>
              <span>{category.nameFr}</span>
              <span
                dir="rtl"
                lang="ar"
                style={{ fontFamily: 'var(--font-amiri)' }}
              >
                — {category.nameAr}
              </span>
            </Link>
          )}

          {/* Titre arabe en grand ⚠️ SACRÉ */}
          <h1
            dir="rtl"
            lang="ar"
            className="mb-4"
            style={{
              fontFamily: 'var(--font-amiri)',
              fontSize: 'clamp(1.8rem, 5vw, 3rem)',
              lineHeight: '1.7',
              color: '#f8fafc',
              textShadow: `0 0 40px ${accentColor}20`,
            }}
          >
            {/* ⚠️ Titre arabe sacré — affiché tel quel, jamais modifier */}
            {book.titleAr}
          </h1>

          {/* Titre français */}
          {book.titleFr && (
            <p className="text-xl font-semibold text-slate-300 mb-6">{book.titleFr}</p>
          )}

          {/* Auteur */}
          <div className="flex items-center gap-4 flex-wrap">
            <div
              dir="rtl"
              lang="ar"
              className="flex items-center gap-2"
            >
              <span className="text-slate-600 text-sm">بقلم :</span>
              <span
                className="text-xl"
                style={{
                  fontFamily: 'var(--font-amiri)',
                  color: accentColor,
                  lineHeight: '2',
                }}
              >
                {/* ⚠️ Auteur arabe sacré */}
                {book.authorAr}
              </span>
            </div>
            {book.authorFr && (
              <span className="text-sm text-slate-500">({book.authorFr})</span>
            )}
            {book.year && (
              <span
                className="px-3 py-1 rounded-full text-xs"
                dir="rtl"
                lang="ar"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#94a3b8',
                  fontFamily: 'var(--font-amiri)',
                }}
              >
                {/* ⚠️ Date hijri — affichée telle quelle */}
                ت. {book.year}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ══════════════════════════════════════════════
              COLONNE PRINCIPALE
          ══════════════════════════════════════════════ */}
          <div className="lg:col-span-2 space-y-6">

            {/* Stats */}
            <div
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl"
              style={{
                background: 'rgba(17,24,39,0.8)',
                border: `1px solid ${accentColor}12`,
              }}
            >
              {book.volumes && (
                <div className="text-center">
                  <p className="text-3xl font-bold" style={{ color: accentColor }}>{book.volumes}</p>
                  <p className="text-xs text-slate-500 mt-1">Volumes</p>
                </div>
              )}
              {book.pages && (
                <div className="text-center">
                  <p className="text-3xl font-bold" style={{ color: accentColor }}>{book.pages}</p>
                  <p className="text-xs text-slate-500 mt-1">Pages</p>
                </div>
              )}
              <div className="text-center">
                <p
                  className="text-2xl font-bold"
                  style={{ color: book.isOpenAccess ? '#22c55e' : '#94a3b8' }}
                >
                  {book.isOpenAccess ? '✓' : '○'}
                </p>
                <p className="text-xs text-slate-500 mt-1">Accès libre</p>
              </div>
              {book.year && (
                <div className="text-center">
                  <p
                    className="text-sm font-bold"
                    dir="rtl"
                    lang="ar"
                    style={{ fontFamily: 'var(--font-amiri)', color: '#f1f5f9' }}
                  >
                    {/* ⚠️ Date hijri — affichée telle quelle */}
                    {book.year}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Décès auteur</p>
                </div>
              )}
            </div>

            {/* Description */}
            {book.description && (
              <div
                className="p-6 rounded-2xl"
                style={{
                  background: 'rgba(17,24,39,0.7)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                  À propos de ce livre
                </h2>
                <p className="text-slate-300 leading-relaxed">{book.description}</p>
              </div>
            )}

            {/* Incipit — Extrait d'ouverture ⚠️ SACRÉ */}
            {book.incipit && (
              <div
                className="p-6 rounded-2xl"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}06 0%, rgba(17,24,39,0.8) 100%)`,
                  border: `1px solid ${accentColor}15`,
                }}
              >
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                  Incipit — Ouverture du livre
                </h2>
                <div
                  className="p-4 rounded-xl"
                  style={{
                    background: 'rgba(0,0,0,0.2)',
                    borderLeft: `3px solid ${accentColor}`,
                  }}
                >
                  <p
                    dir="rtl"
                    lang="ar"
                    className="leading-loose text-lg"
                    style={{
                      fontFamily: 'var(--font-amiri)',
                      color: '#f1f5f9',
                      lineHeight: '2.2',
                    }}
                  >
                    {/* ⚠️ Texte classique sacré — reproduit sans modification */}
                    {book.incipit}
                  </p>
                </div>
                <p className="text-xs text-slate-700 mt-3 text-center">
                  ⚠️ Texte reproduit fidèlement sans modification
                </p>
              </div>
            )}

            {/* Livres du même auteur */}
            {authorBooks.length > 0 && (
              <div
                className="p-6 rounded-2xl"
                style={{
                  background: 'rgba(17,24,39,0.7)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-5">
                  Autres œuvres de{' '}
                  <span
                    dir="rtl"
                    lang="ar"
                    style={{ fontFamily: 'var(--font-amiri)', color: accentColor }}
                  >
                    {/* ⚠️ Auteur arabe sacré */}
                    {book.authorAr}
                  </span>
                </h2>
                <div className="space-y-3">
                  {authorBooks.map((ab) => (
                    <Link
                      key={ab.id}
                      href={`/bibliotheque/livre/${ab.id}`}
                      className="flex items-center justify-between p-3 rounded-xl transition-all hover:opacity-80"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <p
                        dir="rtl"
                        lang="ar"
                        className="text-sm"
                        style={{ fontFamily: 'var(--font-amiri)', color: '#f1f5f9', lineHeight: '1.9' }}
                      >
                        {ab.titleAr}
                      </p>
                      <span className="text-xs text-slate-600 flex-shrink-0 ml-3">→</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════
              SIDEBAR DROITE
          ══════════════════════════════════════════════ */}
          <div className="space-y-5">

            {/* Liens d'accès */}
            <div
              className="p-5 rounded-2xl"
              style={{
                background: 'rgba(17,24,39,0.8)',
                border: `1px solid ${accentColor}15`,
              }}
            >
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                Accéder au livre
              </h2>
              <div className="space-y-3">

                {shamelaUrl ? (
                  <a
                    href={shamelaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl transition-all hover:opacity-80"
                    style={{
                      background: `${accentColor}10`,
                      border: `1px solid ${accentColor}20`,
                    }}
                  >
                    <span className="text-xl">📚</span>
                    <div className="flex-1">
                      <p
                        dir="rtl"
                        lang="ar"
                        className="text-sm font-medium text-slate-200"
                        style={{ fontFamily: 'var(--font-amiri)' }}
                      >
                        المكتبة الشاملة
                      </p>
                      <p className="text-xs text-slate-600">Lecture en ligne gratuite</p>
                    </div>
                    <span className="text-xs" style={{ color: accentColor }}>→</span>
                  </a>
                ) : (
                  <a
                    href="https://shamela.ws"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl transition-all hover:opacity-80"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <span className="text-xl">📚</span>
                    <div className="flex-1">
                      <p className="text-sm text-slate-300">Shamela</p>
                      <p className="text-xs text-slate-600">Chercher sur Shamela.ws</p>
                    </div>
                    <span className="text-xs text-slate-500">→</span>
                  </a>
                )}

                <a
                  href={archiveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl transition-all hover:opacity-80"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <span className="text-xl">🌐</span>
                  <div className="flex-1">
                    <p className="text-sm text-slate-300">Archive.org</p>
                    <p className="text-xs text-slate-600">Téléchargement PDF gratuit</p>
                  </div>
                  <span className="text-xs text-slate-500">→</span>
                </a>

                <a
                  href={islamhouseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl transition-all hover:opacity-80"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <span className="text-xl">🌍</span>
                  <div className="flex-1">
                    <p className="text-sm text-slate-300">Islam House</p>
                    <p className="text-xs text-slate-600">Versions multilingues</p>
                  </div>
                  <span className="text-xs text-slate-500">→</span>
                </a>
              </div>

              <p className="text-xs text-slate-700 mt-4 text-center leading-relaxed">
                ⚠️ Les textes sont reproduits sans modification
              </p>
            </div>

            {/* Livres de la même catégorie */}
            {relatedBooks.length > 0 && (
              <div
                className="p-5 rounded-2xl"
                style={{
                  background: 'rgba(17,24,39,0.7)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                  Dans la même discipline
                </h2>
                <div className="space-y-3">
                  {relatedBooks.map((rb) => (
                    <Link
                      key={rb.id}
                      href={`/bibliotheque/livre/${rb.id}`}
                      className="block p-3 rounded-xl transition-all hover:opacity-80"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <p
                        dir="rtl"
                        lang="ar"
                        className="text-sm mb-1"
                        style={{ fontFamily: 'var(--font-amiri)', color: '#f1f5f9', lineHeight: '1.9' }}
                      >
                        {/* ⚠️ Titre arabe sacré */}
                        {rb.titleAr}
                      </p>
                      <p
                        dir="rtl"
                        lang="ar"
                        className="text-xs"
                        style={{ fontFamily: 'var(--font-amiri)', color: accentColor, opacity: 0.7 }}
                      >
                        {rb.authorAr}
                      </p>
                    </Link>
                  ))}
                </div>

                {category && (
                  <Link
                    href={`/bibliotheque/categorie/${category.id}`}
                    className="mt-4 block text-center text-xs transition-colors hover:opacity-80"
                    style={{ color: accentColor }}
                  >
                    Voir tous les livres de {category.nameFr} →
                  </Link>
                )}
              </div>
            )}

            {/* Catégorie */}
            {category && (
              <Link
                href={`/bibliotheque/categorie/${category.id}`}
                className="flex items-center gap-4 p-5 rounded-2xl transition-all hover:opacity-80"
                style={{
                  background: `${accentColor}08`,
                  border: `1px solid ${accentColor}15`,
                }}
              >
                <span className="text-3xl">{category.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-slate-200 text-sm">{category.nameFr}</p>
                  <p
                    dir="rtl"
                    lang="ar"
                    className="text-xs mt-0.5"
                    style={{ fontFamily: 'var(--font-amiri)', color: accentColor }}
                  >
                    {/* ⚠️ Texte arabe sacré */}
                    {category.nameAr}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {category.bookCount.toLocaleString('fr-FR')} livres
                  </p>
                </div>
                <span className="text-sm" style={{ color: accentColor }}>→</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <footer className="text-center py-8 text-xs text-slate-700 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
        <p>⚠️ Les textes islamiques classiques sont reproduits fidèlement, sans aucune modification.</p>
        <p className="mt-1">Sources : المكتبة الشاملة · Archive.org · Islamhouse</p>
      </footer>
    </div>
  )
}
