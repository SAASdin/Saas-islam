// @ts-nocheck
import { notFound } from 'next/navigation'
import { getCollection, getHadiths } from '@/lib/db'
import HadithCard from '@/components/hadiths/HadithCard'
import Pagination from '@/components/ui/Pagination'
import Breadcrumb from '@/components/ui/Breadcrumb'
import type { Hadith } from '@/types/hadith'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ collection: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection } = await params
  const col = await getCollection(collection).catch(() => null)
  if (!col) return {}
  return { title: `Hadiths — ${(col as Record<string,unknown>).name_english as string}` }
}

export default async function HadithsPage({ params, searchParams }: Props) {
  const { collection: collectionKey } = await params
  const { page: pageStr } = await searchParams
  const page = Math.max(1, parseInt(pageStr || '1'))

  let col: Record<string, unknown> | null = null
  let result: { rows: Record<string,unknown>[]; total: number; totalPages: number } | null = null

  try {
    col = await getCollection(collectionKey) as Record<string, unknown>
    if (!col) notFound()
    result = await getHadiths(collectionKey, { page, limit: 50 }) as typeof result
  } catch {
    notFound()
  }

  const hadiths = (result?.rows || []) as unknown as Hadith[]

  return (
    <div>
      <Breadcrumb items={[
        { label: 'Accueil', href: '/' },
        { label: col!.name_english as string, href: `/${collectionKey}` },
        { label: 'Tous les hadiths' },
      ]} />

      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          <span className="font-arabic mr-2">{col!.name_arabic as string}</span>
          {col!.name_english as string}
        </h1>
        <p className="text-sm text-gray-500">
          {result!.total.toLocaleString()} hadiths
          {result!.totalPages > 1 && ` — page ${page}/${result!.totalPages}`}
        </p>
      </div>

      {hadiths.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-4">📿</p>
          <p className="text-lg">Import en cours...</p>
        </div>
      ) : (
        <>
          {hadiths.map(h => <HadithCard key={h.id} hadith={h} />)}
          <Pagination
            currentPage={page}
            totalPages={result!.totalPages}
            buildHref={p => `/${collectionKey}/hadiths?page=${p}`}
          />
        </>
      )}
    </div>
  )
}
