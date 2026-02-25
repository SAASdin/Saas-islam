// ============================================================
// bibliotheque/categorie/[id]/page.tsx — Server Component pur
// Filtres via URL searchParams — pas de Client Component
// ⚠️  Textes arabes sacrés — jamais modifier
// ============================================================

import {
  getCategoryById,
  getBooksByCategory,
  LIBRARY_CATEGORIES,
  getAllCategories,
} from '@/lib/library-api'
import Navigation from '@/components/Navigation'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ era?: string; volumes?: string; open?: string; page?: string }>
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

const BOOKS_PER_PAGE = 12

function getEraLabel(year?: string): string {
  if (!year) return 'classical'
  const n = parseInt(year)
  if (isNaN(n)) return 'classical'
  if (n <= 300) return 'early'
  if (n <= 900) return 'classical'
  return 'modern'
}

export function generateStaticParams() {
  return LIBRARY_CATEGORIES.map((c) => ({ id: c.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const cat = getCategoryById(id)
  if (!cat) return {}
  return {
    title: `${cat.nameFr} — Bibliothèque Islamique`,
    description: `${cat.description} — ${cat.bookCount} livres.`,
  }
}

export const revalidate = 86400

export default async function CategoryPage({ params, searchParams }: Props) {
  const { id } = await params
  const sp = await searchParams

  const category = getCategoryById(id)
  if (!category) notFound()

  const accentColor = CATEGORY_COLORS[id] ?? '#94a3b8'
  const otherCategories = getAllCategories().filter(c => c.id !== id)
  const allBooks = getBooksByCategory(id)

  // Filtres côté serveur via searchParams
  const eraFilter = sp.era ?? 'all'
  const volumeFilter = sp.volumes ?? 'all'
  const openOnly = sp.open === '1'
  const currentPage = Math.max(1, parseInt(sp.page ?? '1') || 1)

  const filtered = allBooks.filter((b) => {
    if (eraFilter !== 'all' && getEraLabel(b.year) !== eraFilter) return false
    if (volumeFilter === 'single' && (b.volumes ?? 1) > 1) return false
    if (volumeFilter === 'multi' && (b.volumes ?? 1) <= 1) return false
    if (openOnly && !b.isOpenAccess) return false
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / BOOKS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const paginated = filtered.slice((safePage - 1) * BOOKS_PER_PAGE, safePage * BOOKS_PER_PAGE)

  // Helper pour construire les URLs de filtre
  function filterUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams()
    if (eraFilter !== 'all') p.set('era', eraFilter)
    if (volumeFilter !== 'all') p.set('volumes', volumeFilter)
    if (openOnly) p.set('open', '1')
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === 'all' || v === '') p.delete(k)
      else p.set(k, v)
    })
    p.delete('page') // reset page on filter change
    const s = p.toString()
    return `/bibliotheque/categorie/${id}${s ? '?' + s : ''}`
  }

  function pageUrl(p: number) {
    const params = new URLSearchParams()
    if (eraFilter !== 'all') params.set('era', eraFilter)
    if (volumeFilter !== 'all') params.set('volumes', volumeFilter)
    if (openOnly) params.set('open', '1')
    if (p > 1) params.set('page', String(p))
    const s = params.toString()
    return `/bibliotheque/categorie/${id}${s ? '?' + s : ''}`
  }

  const filterBtnClass = (active: boolean) => `
    px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150
    ${active ? 'ring-1' : 'hover:opacity-80'}
  `

  return (
    <div className="min-h-screen" style={{ background: '#0a0f1e' }}>
      <Navigation />

      {/* ── Hero catégorie ──────────────────────────────── */}
      <div
        className="relative overflow-hidden py-16 px-4"
        style={{
          background: `linear-gradient(160deg, #0a0f1e 0%, ${accentColor}08 60%, #0a0f1e 100%)`,
          borderBottom: `1px solid ${accentColor}18`,
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 60% 70% at 30% 50%, ${accentColor}05 0%, transparent 60%)` }}
          aria-hidden="true"
        />
        <div className="relative max-w-5xl mx-auto">
          <Link
            href="/bibliotheque"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-amber-400 transition-colors mb-6"
          >
            ← Bibliothèque
          </Link>

          <div className="flex items-center gap-6">
            <span className="text-6xl">{category.icon}</span>
            <div>
              <h1 className="text-3xl font-bold text-slate-100 mb-1">{category.nameFr}</h1>
              <p
                dir="rtl" lang="ar"
                className="text-xl mb-2"
                style={{ fontFamily: 'var(--font-amiri)', color: accentColor, lineHeight: '2' }}
              >
                {/* ⚠️ Texte arabe sacré */}
                {category.nameAr}
              </p>
              <p className="text-sm text-slate-500 mb-3">{category.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <span style={{ color: accentColor }}>
                  {allBooks.length} livres indexés
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-600">
                  {category.bookCount.toLocaleString('fr-FR')} dans la collection complète
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* ── Filtres (liens statiques) ──────────────────── */}
        <div
          className="flex flex-wrap gap-y-3 gap-x-4 mb-8 p-4 rounded-2xl"
          style={{ background: 'rgba(17,24,39,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          {/* Époque */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-600">Époque :</span>
            {[
              ['all', 'Toutes'],
              ['early', 'Fondateurs ≤300هـ'],
              ['classical', 'Classique'],
              ['modern', 'Moderne'],
            ].map(([v, label]) => (
              <Link
                key={v}
                href={filterUrl({ era: v })}
                className={filterBtnClass(eraFilter === v)}
                style={{
                  border: `1px solid ${eraFilter === v ? accentColor : 'rgba(255,255,255,0.1)'}`,
                  background: eraFilter === v ? `${accentColor}20` : 'transparent',
                  color: eraFilter === v ? accentColor : '#94a3b8',
                }}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Format */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-600">Format :</span>
            {[
              ['all', 'Tous'],
              ['single', '1 volume'],
              ['multi', 'Multi-volumes'],
            ].map(([v, label]) => (
              <Link
                key={v}
                href={filterUrl({ volumes: v })}
                className={filterBtnClass(volumeFilter === v)}
                style={{
                  border: `1px solid ${volumeFilter === v ? accentColor : 'rgba(255,255,255,0.1)'}`,
                  background: volumeFilter === v ? `${accentColor}20` : 'transparent',
                  color: volumeFilter === v ? accentColor : '#94a3b8',
                }}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Open access */}
          <Link
            href={filterUrl({ open: openOnly ? '' : '1' })}
            className={filterBtnClass(openOnly)}
            style={{
              border: `1px solid ${openOnly ? '#22c55e' : 'rgba(255,255,255,0.1)'}`,
              background: openOnly ? 'rgba(34,197,94,0.15)' : 'transparent',
              color: openOnly ? '#22c55e' : '#94a3b8',
            }}
          >
            ✓ Accès libre
          </Link>

          <span className="ml-auto text-xs text-slate-600 self-center">
            {filtered.length} livre{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* ── Grille livres ──────────────────────────────── */}
        {paginated.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <p className="text-5xl mb-4">{category.icon}</p>
            <p>Aucun livre ne correspond à ces filtres.</p>
            <Link href={`/bibliotheque/categorie/${id}`} className="mt-4 inline-block text-sm text-amber-400 hover:underline">
              Réinitialiser les filtres
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {paginated.map((book) => (
              <Link
                key={book.id}
                href={`/bibliotheque/livre/${book.id}`}
                className="group p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                style={{
                  background: 'rgba(17,24,39,0.8)',
                  border: `1px solid ${accentColor}18`,
                }}
              >
                {/* Titre arabe ⚠️ SACRÉ */}
                <p
                  dir="rtl" lang="ar"
                  className="text-lg font-semibold mb-1"
                  style={{ fontFamily: 'var(--font-amiri)', color: '#f1f5f9', lineHeight: '2' }}
                >
                  {book.titleAr}
                </p>

                {book.titleFr && (
                  <p className="text-sm text-slate-400 mb-2 leading-snug">{book.titleFr}</p>
                )}

                {/* Auteur ⚠️ SACRÉ */}
                <p
                  dir="rtl" lang="ar"
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
                  <span
                    className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: accentColor }}
                  >
                    Voir →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ── Pagination ──────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mb-10">
            {safePage > 1 && (
              <Link
                href={pageUrl(safePage - 1)}
                className="px-4 py-2 rounded-xl text-sm"
                style={{ background: 'rgba(17,24,39,0.7)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}
              >
                ← Précédent
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <Link
                key={p}
                href={pageUrl(p)}
                className="w-9 h-9 rounded-xl text-sm font-medium flex items-center justify-center"
                style={{
                  background: p === safePage ? `${accentColor}25` : 'rgba(17,24,39,0.7)',
                  border: `1px solid ${p === safePage ? accentColor : 'rgba(255,255,255,0.08)'}`,
                  color: p === safePage ? accentColor : '#94a3b8',
                }}
              >
                {p}
              </Link>
            ))}
            {safePage < totalPages && (
              <Link
                href={pageUrl(safePage + 1)}
                className="px-4 py-2 rounded-xl text-sm"
                style={{ background: 'rgba(17,24,39,0.7)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}
              >
                Suivant →
              </Link>
            )}
          </div>
        )}

        {/* ── Autres catégories ──────────────────────────── */}
        <div className="mt-4">
          <div className="flex items-center gap-4 mb-5">
            <span className="text-xs text-slate-600 uppercase tracking-wider">Autres disciplines</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
          </div>
          <div className="flex flex-wrap gap-3">
            {otherCategories.map((cat) => {
              const c = CATEGORY_COLORS[cat.id] ?? '#94a3b8'
              return (
                <Link
                  key={cat.id}
                  href={`/bibliotheque/categorie/${cat.id}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all hover:opacity-80"
                  style={{ background: `${c}10`, border: `1px solid ${c}20`, color: c }}
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
