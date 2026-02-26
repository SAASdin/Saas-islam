// @ts-nocheck
import { searchHadiths, getCollections } from '@/lib/db'
import HadithCard from '@/components/hadiths/HadithCard'
import Breadcrumb from '@/components/ui/Breadcrumb'
import SearchBar from '@/components/search/SearchBar'
import type { Hadith } from '@/types/hadith'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ q?: string; collection?: string; page?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams
  return { title: q ? `"${q}" — Recherche Hadith` : 'Recherche — Hadith' }
}

export default async function SearchPage({ searchParams }: Props) {
  const { q, collection, page: pageStr } = await searchParams
  const page = Math.max(1, parseInt(pageStr || '1'))

  let results: Record<string, unknown>[] = []
  let collections: Record<string, unknown>[] = []
  let searched = false

  try {
    collections = await getCollections() as Record<string,unknown>[]
    if (q && q.trim().length >= 2) {
      searched = true
      results = await searchHadiths(q.trim(), { collection, page, limit: 20 }) as Record<string,unknown>[]
    }
  } catch {
    // DB not ready
  }

  return (
    <div>
      <Breadcrumb items={[
        { label: 'Accueil', href: '/' },
        { label: 'Recherche' },
      ]} />

      {/* Search form */}
      <div className="bg-gradient-to-br from-[#067b55] to-[#045a3e] rounded-xl p-6 mb-6 text-white">
        <h1 className="text-xl font-bold mb-4">Recherche dans les hadiths</h1>
        <SearchBar defaultValue={q || ''} collection={collection} />

        {/* Filtre collection */}
        {collections.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            <a href="/search" className={`text-xs px-3 py-1 rounded-full border transition-colors ${!collection ? 'bg-white text-green-800 border-white' : 'border-white/40 hover:bg-white/10'}`}>
              Toutes
            </a>
            {collections.map(c => (
              <a
                key={c.collection_key as string}
                href={`/search?q=${encodeURIComponent(q||'')}&collection=${c.collection_key}`}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  collection === c.collection_key
                    ? 'bg-white text-green-800 border-white'
                    : 'border-white/40 hover:bg-white/10'
                }`}
              >
                {c.name_english as string}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Résultats */}
      {!searched ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-lg">Entrez un terme de recherche</p>
          <p className="text-sm mt-1">Recherche en arabe ou en anglais</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-4">😔</p>
          <p className="text-lg">Aucun résultat pour &ldquo;{q}&rdquo;</p>
          <p className="text-sm mt-1">Essayez un autre terme ou une autre translittération</p>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            {results.length} résultats pour <strong>&ldquo;{q}&rdquo;</strong>
          </p>
          {(results as unknown as Hadith[]).map(h => (
            <HadithCard key={h.id} hadith={h} showCollection highlight={q} />
          ))}
        </div>
      )}
    </div>
  )
}
