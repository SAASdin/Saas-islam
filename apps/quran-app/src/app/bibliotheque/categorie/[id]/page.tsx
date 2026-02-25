// ============================================================
// bibliotheque/categorie/[id]/page.tsx — Catégorie de livres
// ⚠️  Textes arabes sacrés — jamais modifier
// ============================================================

import { getCategoryById, getFeaturedBooks, LIBRARY_CATEGORIES } from '@/lib/library-api'
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
  return LIBRARY_CATEGORIES.map((c) => ({ id: c.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const cat = getCategoryById(id)
  if (!cat) return {}
  return {
    title: `${cat.nameFr} — Bibliothèque`,
    description: cat.description,
  }
}

export const revalidate = 86400

export default async function CategoryPage({ params }: Props) {
  const { id } = await params
  const category = getCategoryById(id)
  if (!category) notFound()

  const books = getFeaturedBooks(id)
  const accentColor = CATEGORY_COLORS[id] ?? '#94a3b8'

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
        <div className="max-w-4xl mx-auto">
          <Link
            href="/bibliotheque"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-amber-400 transition-colors mb-6"
          >
            ← Bibliothèque
          </Link>

          <div className="flex items-center gap-5">
            <span className="text-5xl">{category.icon}</span>
            <div>
              <h1 className="text-3xl font-bold text-slate-100 mb-1">
                {category.nameFr}
              </h1>
              <p
                dir="rtl"
                lang="ar"
                className="text-lg mb-2"
                style={{ fontFamily: 'var(--font-amiri)', color: accentColor, lineHeight: '1.8' }}
                aria-label={category.nameAr}
              >
                {/* ⚠️ Texte arabe sacré */}
                {category.nameAr}
              </p>
              <p className="text-sm text-slate-500">{category.description}</p>
              <p className="text-xs mt-2" style={{ color: accentColor }}>
                {category.bookCount.toLocaleString('fr-FR')} livres dans cette catégorie
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">

        {books.length > 0 ? (
          <>
            <h2 className="text-lg font-bold text-slate-100 mb-6">
              Livres de référence — <span style={{ color: accentColor }}>{category.nameFr}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {books.map((book) => (
                <Link
                  key={book.id}
                  href={`/bibliotheque/livre/${book.id}`}
                  className="group p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                  style={{
                    background: 'rgba(17,24,39,0.7)',
                    border: `1px solid rgba(255,255,255,0.06)`,
                  }}
                >
                  {/* Titre arabe — ⚠️ SACRÉ */}
                  <p
                    dir="rtl"
                    lang="ar"
                    className="text-lg font-semibold mb-1 leading-relaxed"
                    style={{ fontFamily: 'var(--font-amiri)', color: '#f1f5f9', lineHeight: '2' }}
                  >
                    {/* ⚠️ Affiché tel quel */}
                    {book.titleAr}
                  </p>

                  {book.titleFr && (
                    <p className="text-sm text-slate-400 mb-3">{book.titleFr}</p>
                  )}

                  {/* Auteur — ⚠️ SACRÉ */}
                  <p
                    dir="rtl"
                    lang="ar"
                    className="text-sm mb-3"
                    style={{ fontFamily: 'var(--font-amiri)', color: accentColor, lineHeight: '1.8' }}
                  >
                    {book.authorAr}
                    {book.year && <span className="text-slate-600 mr-2"> — {book.year}</span>}
                  </p>

                  {book.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                      {book.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-slate-600">
                    {book.volumes && <span>📚 {book.volumes} vol.</span>}
                    {book.pages && !book.volumes && <span>📄 {book.pages} p.</span>}
                    {book.isOpenAccess && <span style={{ color: '#22c55e' }}>✓ Accès libre</span>}
                    <span className="ml-auto text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Voir →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">{category.icon}</p>
            <p className="text-slate-400 text-lg">
              {category.bookCount.toLocaleString('fr-FR')} livres dans cette catégorie
            </p>
            <p className="text-sm text-slate-600 mt-2">
              Base de données complète disponible prochainement
            </p>
            <Link
              href="/bibliotheque"
              className="mt-6 inline-block px-6 py-3 rounded-xl text-sm transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#94a3b8',
              }}
            >
              ← Retour à la bibliothèque
            </Link>
          </div>
        )}

        {/* Ressource externe Shamela */}
        <div
          className="mt-10 p-5 rounded-2xl flex items-center justify-between gap-4"
          style={{
            background: 'rgba(17,24,39,0.5)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div>
            <p className="text-sm font-medium text-slate-300">
              Accéder à la collection complète
            </p>
            <p className="text-xs text-slate-600 mt-1">
              +{category.bookCount.toLocaleString('fr-FR')} livres disponibles sur المكتبة الشاملة
            </p>
          </div>
          <a
            href="https://shamela.ws"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl text-sm flex-shrink-0 transition-all duration-200 hover:opacity-80"
            style={{
              background: `linear-gradient(135deg, ${accentColor}20 0%, transparent 100%)`,
              border: `1px solid ${accentColor}30`,
              color: accentColor,
            }}
          >
            Shamela →
          </a>
        </div>
      </div>

      <footer className="text-center py-6 text-xs text-slate-700">
        <p>Données statiques — base de données complète en cours d'intégration</p>
      </footer>
    </div>
  )
}
