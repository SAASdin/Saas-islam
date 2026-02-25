// ============================================================
// bibliotheque/categorie/[id]/page.tsx — Catégorie de livres
// ⚠️  Textes arabes sacrés — jamais modifier
// ============================================================

import {
  getCategoryById,
  getBooksByCategory,
  LIBRARY_CATEGORIES,
  getAllCategories,
} from '@/lib/library-api'
import Navigation from '@/components/Navigation'
import CategoryBooksClient from '@/components/library/CategoryBooksClient'
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
    title: `${cat.nameFr} — Bibliothèque Islamique`,
    description: `${cat.description} — ${cat.bookCount} livres disponibles.`,
  }
}

export const revalidate = 86400

export default async function CategoryPage({ params }: Props) {
  const { id } = await params
  const category = getCategoryById(id)
  if (!category) notFound()

  const books = getBooksByCategory(id)
  const accentColor = CATEGORY_COLORS[id] ?? '#94a3b8'
  const otherCategories = getAllCategories().filter(c => c.id !== id)

  return (
    <div className="min-h-screen" style={{ background: '#0a0f1e' }}>
      <Navigation />

      {/* ══════════════════════════════════════════════
          HERO CATÉGORIE
      ══════════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden py-16 px-4"
        style={{
          background: `linear-gradient(160deg, #0a0f1e 0%, ${accentColor}08 60%, #0a0f1e 100%)`,
          borderBottom: `1px solid ${accentColor}15`,
        }}
      >
        {/* Motif de fond */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 60% 70% at 30% 50%, ${accentColor}06 0%, transparent 60%)`,
          }}
          aria-hidden="true"
        />

        <div className="relative max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-600 mb-8">
            <Link href="/bibliotheque" className="hover:text-amber-400 transition-colors">
              Bibliothèque
            </Link>
            <span>›</span>
            <span style={{ color: accentColor }}>{category.nameFr}</span>
          </nav>

          <div className="flex items-start gap-6">
            {/* Icône */}
            <div
              className="flex-shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
              style={{
                background: `${accentColor}12`,
                border: `1px solid ${accentColor}30`,
              }}
            >
              {category.icon}
            </div>

            <div className="flex-1">
              {/* Titre français */}
              <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-2">
                {category.nameFr}
              </h1>

              {/* Titre arabe ⚠️ SACRÉ */}
              <p
                dir="rtl"
                lang="ar"
                className="text-2xl mb-4"
                style={{
                  fontFamily: 'var(--font-amiri)',
                  color: accentColor,
                  lineHeight: '1.8',
                  textShadow: `0 0 20px ${accentColor}20`,
                }}
              >
                {/* ⚠️ Texte arabe sacré */}
                {category.nameAr}
              </p>

              <p className="text-slate-400 text-sm leading-relaxed max-w-2xl mb-4">
                {category.description}
              </p>

              <div className="flex items-center gap-4 text-sm">
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: `${accentColor}15`, color: accentColor }}
                >
                  {category.bookCount.toLocaleString('fr-FR')} livres au total
                </span>
                {books.length > 0 && (
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: 'rgba(34,197,94,0.1)',
                      color: '#22c55e',
                    }}
                  >
                    {books.length} références curatées
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">

        {/* ══════════════════════════════════════════════
            LIVRES — Client component avec filtres
        ══════════════════════════════════════════════ */}
        {books.length > 0 ? (
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-xl font-bold text-slate-100 whitespace-nowrap">
                Livres de référence
              </h2>
              <div
                className="flex-1 h-px"
                style={{ background: `linear-gradient(90deg, ${accentColor}40, transparent)` }}
              />
            </div>
            <CategoryBooksClient
              books={books}
              accentColor={accentColor}
              categoryIcon={category.icon}
            />
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-5xl mb-5">{category.icon}</p>
            <p className="text-slate-400 text-lg">
              {category.bookCount.toLocaleString('fr-FR')} livres dans cette catégorie
            </p>
            <p className="text-sm text-slate-600 mt-3 max-w-sm mx-auto">
              Références curatées disponibles prochainement — consultez Shamela pour l&apos;intégralité.
            </p>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            ACCÈS SHAMELA COMPLET
        ══════════════════════════════════════════════ */}
        <div
          className="rounded-2xl p-6 mb-12 flex items-center justify-between gap-6"
          style={{
            background: `linear-gradient(135deg, ${accentColor}08 0%, rgba(17,24,39,0.8) 100%)`,
            border: `1px solid ${accentColor}20`,
          }}
        >
          <div>
            <p
              dir="rtl"
              lang="ar"
              className="text-lg font-semibold mb-1"
              style={{ fontFamily: 'var(--font-amiri)', color: accentColor }}
            >
              {/* ⚠️ Texte arabe sacré */}
              المكتبة الشاملة
            </p>
            <p className="text-sm text-slate-300 mb-1">
              Collection complète — المكتبة الشاملة
            </p>
            <p className="text-xs text-slate-600">
              +{category.bookCount.toLocaleString('fr-FR')} livres de {category.nameFr} disponibles en ligne
            </p>
          </div>
          <a
            href={`https://shamela.ws`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{
              background: `linear-gradient(135deg, ${accentColor}25 0%, ${accentColor}10 100%)`,
              border: `1px solid ${accentColor}30`,
              color: accentColor,
            }}
          >
            Ouvrir Shamela →
          </a>
        </div>

        {/* ══════════════════════════════════════════════
            AUTRES CATÉGORIES
        ══════════════════════════════════════════════ */}
        <div>
          <div className="flex items-center gap-4 mb-6">
            <h3 className="text-sm font-semibold text-slate-500 whitespace-nowrap uppercase tracking-wider">
              Autres disciplines
            </h3>
            <div
              className="flex-1 h-px"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            {otherCategories.map((cat) => {
              const catAccent = CATEGORY_COLORS[cat.id] ?? '#94a3b8'
              return (
                <Link
                  key={cat.id}
                  href={`/bibliotheque/categorie/${cat.id}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all hover:opacity-80"
                  style={{
                    background: `${catAccent}10`,
                    border: `1px solid ${catAccent}20`,
                    color: catAccent,
                  }}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.nameFr}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <footer className="text-center py-6 text-xs text-slate-700">
        <p>⚠️ Les textes islamiques classiques sont reproduits sans modification</p>
      </footer>
    </div>
  )
}
