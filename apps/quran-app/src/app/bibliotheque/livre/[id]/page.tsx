// ============================================================
// bibliotheque/livre/[id]/page.tsx — Détail d'un livre
// ⚠️  Textes arabes sacrés — jamais modifier
// ============================================================

import { getBookById, getCategoryById, getShamela_url, FEATURED_BOOKS } from '@/lib/library-api'
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
    title: `${book.titleFr ?? book.titleAr} — Bibliothèque`,
    description: book.description,
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

  return (
    <div className="min-h-screen" style={{ background: '#0a0f1e' }}>
      <Navigation />

      {/* ── En-tête ──────────────────────────────────────── */}
      <div
        className="relative py-12 px-4"
        style={{
          background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1a2e 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="max-w-3xl mx-auto">
          <Link
            href="/bibliotheque"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-amber-400 transition-colors mb-6"
          >
            ← Bibliothèque
          </Link>

          {/* Catégorie badge */}
          {category && (
            <div className="mb-4">
              <span
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  background: `${accentColor}15`,
                  border: `1px solid ${accentColor}30`,
                  color: accentColor,
                }}
              >
                {category.icon} {category.nameFr}
              </span>
            </div>
          )}

          {/* Titre arabe — ⚠️ SACRÉ */}
          <p
            dir="rtl"
            lang="ar"
            className="text-4xl md:text-5xl mb-3 leading-loose"
            style={{
              fontFamily: 'var(--font-amiri)',
              color: '#f1f5f9',
              textShadow: `0 0 30px ${accentColor}30`,
            }}
            aria-label={book.titleAr}
          >
            {/* ⚠️ Affiché tel quel — jamais modifier */}
            {book.titleAr}
          </p>

          {book.titleFr && (
            <h1 className="text-xl font-semibold text-slate-300 mb-4">{book.titleFr}</h1>
          )}

          {/* Auteur — ⚠️ SACRÉ */}
          <div className="flex items-center gap-3 flex-wrap">
            <p
              dir="rtl"
              lang="ar"
              className="text-lg"
              style={{ fontFamily: 'var(--font-amiri)', color: accentColor, lineHeight: '2' }}
              aria-label={book.authorAr}
            >
              {/* ⚠️ Nom de l'auteur en arabe — affiché tel quel */}
              {book.authorAr}
            </p>
            {book.authorFr && (
              <span className="text-sm text-slate-500">({book.authorFr})</span>
            )}
            {book.year && (
              <span
                className="px-2 py-0.5 rounded-full text-xs"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#94a3b8',
                }}
              >
                {book.year}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* ── Infos principales ──────────────────────────── */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-5 rounded-2xl"
          style={{
            background: 'rgba(17,24,39,0.7)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {book.volumes && (
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: accentColor }}>{book.volumes}</p>
              <p className="text-xs text-slate-500 mt-1">Volumes</p>
            </div>
          )}
          {book.pages && (
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: accentColor }}>{book.pages}</p>
              <p className="text-xs text-slate-500 mt-1">Pages</p>
            </div>
          )}
          <div className="text-center">
            <p className="text-lg font-bold" style={{ color: book.isOpenAccess ? '#22c55e' : '#94a3b8' }}>
              {book.isOpenAccess ? '✓' : '○'}
            </p>
            <p className="text-xs text-slate-500 mt-1">Accès libre</p>
          </div>
          {book.year && (
            <div className="text-center">
              <p className="text-sm font-bold text-slate-300"
                dir="rtl" lang="ar"
                style={{ fontFamily: 'var(--font-amiri)' }}
              >
                {/* ⚠️ Date hijri — affiché tel quel */}
                {book.year}
              </p>
              <p className="text-xs text-slate-500 mt-1">Décès auteur</p>
            </div>
          )}
        </div>

        {/* ── Description ────────────────────────────────── */}
        {book.description && (
          <div
            className="mb-8 p-6 rounded-2xl"
            style={{
              background: 'rgba(17,24,39,0.7)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <h2 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
              À propos de ce livre
            </h2>
            <p className="text-slate-300 leading-relaxed">{book.description}</p>
          </div>
        )}

        {/* ── Liens d'accès ──────────────────────────────── */}
        <div
          className="p-6 rounded-2xl mb-8"
          style={{
            background: 'rgba(17,24,39,0.7)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <h2 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">
            Accéder au livre
          </h2>
          <div className="flex flex-col gap-3">
            {shamelaUrl ? (
              <a
                href={shamelaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:opacity-80"
                style={{
                  background: `${accentColor}10`,
                  border: `1px solid ${accentColor}25`,
                }}
              >
                <div>
                  <p className="text-sm font-medium text-slate-200">📚 المكتبة الشاملة (Shamela)</p>
                  <p className="text-xs text-slate-500 mt-0.5">Lecture en ligne gratuite</p>
                </div>
                <span className="text-xs" style={{ color: accentColor }}>Ouvrir →</span>
              </a>
            ) : (
              <a
                href={`https://shamela.ws`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:opacity-80"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div>
                  <p className="text-sm font-medium text-slate-300">📚 Shamela.ws</p>
                  <p className="text-xs text-slate-600 mt-0.5">Chercher ce livre sur Shamela</p>
                </div>
                <span className="text-xs text-slate-500">Ouvrir →</span>
              </a>
            )}

            <a
              href={`https://islamhouse.com`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:opacity-80"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div>
                <p className="text-sm font-medium text-slate-300">🌍 Islam House</p>
                <p className="text-xs text-slate-600 mt-0.5">Versions traduites disponibles</p>
              </div>
              <span className="text-xs text-slate-500">Ouvrir →</span>
            </a>
          </div>

          <p className="text-xs text-slate-600 mt-4 text-center">
            ⚠️ Base de données complète en cours d&apos;intégration — liens directs disponibles prochainement
          </p>
        </div>

        {/* ── Catégorie liée ─────────────────────────────── */}
        {category && (
          <Link
            href={`/bibliotheque/categorie/${category.id}`}
            className="flex items-center gap-4 p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1"
            style={{
              background: 'rgba(17,24,39,0.7)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <span className="text-3xl">{category.icon}</span>
            <div className="flex-1">
              <p className="font-semibold text-slate-200">{category.nameFr}</p>
              <p className="text-xs text-slate-600 mt-0.5">
                {category.bookCount.toLocaleString('fr-FR')} livres dans cette catégorie
              </p>
            </div>
            <span className="text-sm" style={{ color: accentColor }}>→</span>
          </Link>
        )}
      </div>

      <footer className="text-center py-6 text-xs text-slate-700">
        <p>⚠️ Les textes islamiques classiques sont reproduits sans modification</p>
      </footer>
    </div>
  )
}
