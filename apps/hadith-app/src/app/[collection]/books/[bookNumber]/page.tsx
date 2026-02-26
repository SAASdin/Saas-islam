// @ts-nocheck
import { notFound } from 'next/navigation'
import { getCollection, getBook, getChapters, getHadiths } from '@/lib/db'
import HadithCard from '@/components/hadiths/HadithCard'
import Pagination from '@/components/ui/Pagination'
import Breadcrumb from '@/components/ui/Breadcrumb'
import type { Hadith } from '@/types/hadith'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ collection: string; bookNumber: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection, bookNumber } = await params
  const [col, book] = await Promise.all([
    getCollection(collection).catch(() => null),
    getBook(collection, bookNumber).catch(() => null),
  ])
  if (!col) return {}
  const colName = (col as Record<string,unknown>).name_english as string
  const bookName = (book as Record<string,unknown>)?.name_english as string || `Livre ${bookNumber}`
  return { title: `${bookName} — ${colName}` }
}

export default async function BookPage({ params, searchParams }: Props) {
  const { collection: collectionKey, bookNumber } = await params
  const { page: pageStr } = await searchParams
  const page = Math.max(1, parseInt(pageStr || '1'))

  let col: Record<string, unknown> | null = null
  let book: Record<string, unknown> | null = null
  let chapters: Record<string, unknown>[] = []
  let result: { rows: Record<string,unknown>[]; total: number; page: number; limit: number; totalPages: number } | null = null

  try {
    const [colRes, bookRes, chapRes, hadithRes] = await Promise.all([
      getCollection(collectionKey),
      getBook(collectionKey, bookNumber),
      getChapters(collectionKey, bookNumber),
      getHadiths(collectionKey, { page, limit: 50, bookNumber }),
    ])
    col = colRes as Record<string,unknown>
    book = bookRes as Record<string,unknown>
    chapters = chapRes as Record<string,unknown>[]
    result = hadithRes as unknown as { rows: Record<string,unknown>[]; total: number; page: number; limit: number; totalPages: number }
    if (!col || !book) notFound()
  } catch {
    notFound()
  }

  const hadiths = (result?.rows || []) as unknown as Hadith[]

  return (
    <div className="flex gap-6">
      {/* Sidebar chapitres (desktop) */}
      {chapters.length > 0 && (
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-20 bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-[#067b55] text-white px-4 py-2.5 text-sm font-semibold">
              Chapitres ({chapters.length})
            </div>
            <nav className="overflow-y-auto max-h-[70vh]">
              {chapters.map(ch => (
                <div key={ch.chapter_number as string}
                  className="px-3 py-2 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                  {ch.name_arabic && (
                    <p className="font-arabic text-xs text-right text-gray-700 leading-relaxed">
                      {ch.name_arabic as string}
                    </p>
                  )}
                  {ch.name_english && (
                    <p className="text-xs text-gray-500 truncate">{ch.name_english as string}</p>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </aside>
      )}

      {/* Contenu principal */}
      <div className="flex-1 min-w-0">
        <Breadcrumb items={[
          { label: 'Accueil', href: '/' },
          { label: col!.name_english as string, href: `/${collectionKey}` },
          { label: book!.name_english as string || `Livre ${bookNumber}` },
        ]} />

        {/* Header livre */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          {book!.name_arabic && (
            <p className="font-arabic text-2xl text-right text-gray-800 mb-1">{book!.name_arabic as string}</p>
          )}
          <h1 className="text-xl font-bold text-gray-900">
            {book!.name_english as string || `Livre ${bookNumber}`}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {col!.name_english as string} — Livre {bookNumber} — {result!.total} hadiths
          </p>
        </div>

        {/* Hadiths */}
        {hadiths.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>Aucun hadith pour ce livre</p>
          </div>
        ) : (
          <>
            {hadiths.map(h => <HadithCard key={h.id} hadith={h} />)}
            <Pagination
              currentPage={page}
              totalPages={result!.totalPages}
              buildHref={p => `/${collectionKey}/books/${bookNumber}?page=${p}`}
            />
          </>
        )}
      </div>
    </div>
  )
}
