'use client'

import Link from 'next/link'

interface PaginationProps {
  currentPage: number
  totalPages: number
  buildHref: (page: number) => string
}

export default function Pagination({ currentPage, totalPages, buildHref }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages: (number | '...')[] = []
  
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 4) pages.push('...')
    for (let i = Math.max(2, currentPage - 2); i <= Math.min(totalPages - 1, currentPage + 2); i++) {
      pages.push(i)
    }
    if (currentPage < totalPages - 3) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Pagination">
      {/* Précédent */}
      {currentPage > 1 ? (
        <Link href={buildHref(currentPage - 1)}
          className="px-3 py-1.5 text-sm rounded border border-gray-200 hover:bg-gray-50 hover:border-green-300 transition-colors text-gray-600">
          ← Prec.
        </Link>
      ) : (
        <span className="px-3 py-1.5 text-sm rounded border border-gray-100 text-gray-300 cursor-not-allowed">
          ← Prec.
        </span>
      )}

      {/* Pages */}
      {pages.map((page, i) =>
        page === '...' ? (
          <span key={`dots-${i}`} className="px-2 py-1.5 text-gray-400 text-sm">…</span>
        ) : (
          <Link
            key={page}
            href={buildHref(page)}
            className={`px-3 py-1.5 text-sm rounded border transition-colors ${
              page === currentPage
                ? 'bg-[#067b55] text-white border-[#067b55] font-semibold'
                : 'border-gray-200 hover:bg-gray-50 hover:border-green-300 text-gray-600'
            }`}
          >
            {page}
          </Link>
        )
      )}

      {/* Suivant */}
      {currentPage < totalPages ? (
        <Link href={buildHref(currentPage + 1)}
          className="px-3 py-1.5 text-sm rounded border border-gray-200 hover:bg-gray-50 hover:border-green-300 transition-colors text-gray-600">
          Suiv. →
        </Link>
      ) : (
        <span className="px-3 py-1.5 text-sm rounded border border-gray-100 text-gray-300 cursor-not-allowed">
          Suiv. →
        </span>
      )}
    </nav>
  )
}
