// @ts-nocheck
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCollection, getBooks } from '@/lib/db'
import Breadcrumb from '@/components/ui/Breadcrumb'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface Props { params: Promise<{ collection: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection } = await params
  const col = await getCollection(collection).catch(() => null)
  if (!col) return { title: 'Collection introuvable' }
  return { title: `${(col as Record<string, unknown>).name_english as string} — Hadith` }
}

export default async function CollectionPage({ params }: Props) {
  const { collection: collectionKey } = await params

  let col: Record<string, unknown> | null = null
  let books: Record<string, unknown>[] = []

  try {
    col = await getCollection(collectionKey) as Record<string, unknown>
    if (!col) notFound()
    books = await getBooks(collectionKey) as Record<string, unknown>[]
  } catch {
    notFound()
  }

  return (
    <div>
      <Breadcrumb items={[
        { label: 'Accueil', href: '/' },
        { label: col.name_english as string },
      ]} />

      {/* Header collection */}
      <div className="bg-gradient-to-br from-[#067b55] to-[#045a3e] text-white rounded-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="font-arabic text-3xl text-right md:text-left mb-1">{col.name_arabic as string}</p>
            <h1 className="text-2xl font-bold">{col.name_english as string}</h1>
            {(col.name_french as string) !== (col.name_english as string) && (
              <p className="text-green-200 text-sm">{col.name_french as string}</p>
            )}
            <p className="text-green-300 text-sm mt-1">
              {col.author as string}
              {col.death_year_hijri ? ` — mort en ${col.death_year_hijri}H` : ''}
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold">{(col.total_hadiths as number).toLocaleString()}</p>
            <p className="text-green-200 text-sm">hadiths</p>
          </div>
        </div>
      </div>

      {/* Lien vers tous les hadiths */}
      <div className="flex gap-3 mb-6">
        <Link
          href={`/${collectionKey}/hadiths`}
          className="px-4 py-2 bg-[#067b55] text-white rounded-lg text-sm font-medium hover:bg-[#055c40] transition-colors"
        >
          Tous les hadiths
        </Link>
      </div>

      {/* Liste des livres */}
      {books.length > 0 ? (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Livres ({books.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {books.map(book => (
              <Link
                key={book.book_number as string}
                href={`/${collectionKey}/books/${book.book_number}`}
                className="hadith-card p-4 hover:border-green-300 transition-all group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {book.name_arabic && (
                      <p className="font-arabic text-base text-right text-gray-800 leading-relaxed mb-1 truncate">
                        {book.name_arabic as string}
                      </p>
                    )}
                    <p className="text-sm text-gray-700 font-medium truncate">
                      {book.name_english as string || `Livre ${book.book_number as string}`}
                    </p>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 shrink-0">
                    {(book.hadith_count as number)?.toLocaleString() || 0}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-2">Livre {book.book_number as string}</p>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">📚</p>
          <p>Les hadiths sont en cours d&apos;import...</p>
          <p className="text-sm mt-1">Revenez dans quelques minutes</p>
        </div>
      )}
    </div>
  )
}
