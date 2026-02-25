'use client'
// ============================================================
// CategoryBooksClient.tsx — Filtres + pagination côté client
// ⚠️  Textes arabes sacrés — jamais modifier
// ============================================================

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { LibraryBook } from '@/lib/library-api'

interface Props {
  books: LibraryBook[]
  accentColor: string
  categoryIcon: string
}

const BOOKS_PER_PAGE = 12

type EraFilter = 'all' | 'early' | 'classical' | 'modern'
type VolumeFilter = 'all' | 'single' | 'multi'

function getEra(year?: string): EraFilter {
  if (!year) return 'classical'
  const n = parseInt(year)
  if (isNaN(n)) return 'classical'
  if (n <= 300) return 'early'
  if (n <= 900) return 'classical'
  return 'modern'
}

export default function CategoryBooksClient({ books, accentColor, categoryIcon }: Props) {
  const [eraFilter, setEraFilter] = useState<EraFilter>('all')
  const [volumeFilter, setVolumeFilter] = useState<VolumeFilter>('all')
  const [openAccessOnly, setOpenAccessOnly] = useState(false)
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    return books.filter((b) => {
      if (eraFilter !== 'all' && getEra(b.year) !== eraFilter) return false
      if (volumeFilter === 'single' && (b.volumes ?? 1) > 1) return false
      if (volumeFilter === 'multi' && (b.volumes ?? 1) <= 1) return false
      if (openAccessOnly && !b.isOpenAccess) return false
      return true
    })
  }, [books, eraFilter, volumeFilter, openAccessOnly])

  const totalPages = Math.ceil(filtered.length / BOOKS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * BOOKS_PER_PAGE, page * BOOKS_PER_PAGE)

  function resetPage() { setPage(1) }

  const filterBtnStyle = (active: boolean) => ({
    padding: '6px 14px',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: active ? 600 : 400,
    border: `1px solid ${active ? accentColor : 'rgba(255,255,255,0.1)'}`,
    background: active ? `${accentColor}20` : 'transparent',
    color: active ? accentColor : '#94a3b8',
    cursor: 'pointer',
    transition: 'all 0.15s',
  })

  return (
    <div>
      {/* ── Filtres ────────────────────────────── */}
      <div
        className="flex flex-wrap gap-3 mb-8 p-4 rounded-2xl"
        style={{
          background: 'rgba(17,24,39,0.5)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* Époque */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 mr-1">Époque :</span>
          {([
            ['all', 'Toutes'],
            ['early', 'Fondateurs (≤300 هـ)'],
            ['classical', 'Classique'],
            ['modern', 'Moderne'],
          ] as [EraFilter, string][]).map(([v, label]) => (
            <button
              key={v}
              style={filterBtnStyle(eraFilter === v)}
              onClick={() => { setEraFilter(v); resetPage() }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Volumes */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 mr-1">Format :</span>
          {([
            ['all', 'Tous'],
            ['single', '1 volume'],
            ['multi', 'Multi-volumes'],
          ] as [VolumeFilter, string][]).map(([v, label]) => (
            <button
              key={v}
              style={filterBtnStyle(volumeFilter === v)}
              onClick={() => { setVolumeFilter(v); resetPage() }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Open access */}
        <button
          style={filterBtnStyle(openAccessOnly)}
          onClick={() => { setOpenAccessOnly(!openAccessOnly); resetPage() }}
        >
          ✓ Accès libre uniquement
        </button>

        <span className="ml-auto text-xs text-slate-600 self-center">
          {filtered.length} livre{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Grille livres ──────────────────────── */}
      {paginated.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="text-4xl mb-3">{categoryIcon}</p>
          <p>Aucun livre ne correspond à ces filtres.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
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
                dir="rtl"
                lang="ar"
                className="text-lg font-semibold mb-1 leading-relaxed"
                style={{
                  fontFamily: 'var(--font-amiri)',
                  color: '#f1f5f9',
                  lineHeight: '1.9',
                }}
              >
                {book.titleAr}
              </p>

              {book.titleFr && (
                <p className="text-sm text-slate-400 mb-2 leading-snug">{book.titleFr}</p>
              )}

              {/* Auteur ⚠️ SACRÉ */}
              <p
                dir="rtl"
                lang="ar"
                className="text-sm mb-3"
                style={{
                  fontFamily: 'var(--font-amiri)',
                  color: accentColor,
                  lineHeight: '1.8',
                }}
              >
                {book.authorAr}
                {book.year && (
                  <span className="text-slate-600 mr-2"> — {book.year}</span>
                )}
              </p>

              {book.description && (
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                  {book.description}
                </p>
              )}

              <div className="flex items-center gap-3 text-xs text-slate-600">
                {book.volumes && <span>📚 {book.volumes} vol.</span>}
                {book.pages && !book.volumes && <span>📄 {book.pages} p.</span>}
                {book.isOpenAccess && (
                  <span style={{ color: '#22c55e' }}>✓ Accès libre</span>
                )}
                <span
                  className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                  style={{ color: accentColor }}
                >
                  Voir →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ── Pagination ─────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl text-sm transition-all"
            style={{
              background: 'rgba(17,24,39,0.7)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: page === 1 ? '#4b5563' : '#94a3b8',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            ← Précédent
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className="w-9 h-9 rounded-xl text-sm font-medium transition-all"
              style={{
                background: p === page ? `${accentColor}20` : 'rgba(17,24,39,0.7)',
                border: `1px solid ${p === page ? accentColor : 'rgba(255,255,255,0.08)'}`,
                color: p === page ? accentColor : '#94a3b8',
                cursor: 'pointer',
              }}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-xl text-sm transition-all"
            style={{
              background: 'rgba(17,24,39,0.7)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: page === totalPages ? '#4b5563' : '#94a3b8',
              cursor: page === totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  )
}
