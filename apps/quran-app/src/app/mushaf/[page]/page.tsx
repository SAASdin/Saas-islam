import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getVersesByPage } from '@/lib/quran-cdn-api'
import MushafPageClient from './MushafPageClient'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ page: string }> }): Promise<Metadata> {
  const { page } = await params
  const n = parseInt(page)
  return {
    title: `مصحف — Page ${n} du Coran`,
    description: `Page ${n} du Coran (Mushaf Uthmani KFGQPC)`,
  }
}

const TOTAL_PAGES = 604

export default async function MushafPage({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params
  const pageNum = parseInt(page)
  if (isNaN(pageNum) || pageNum < 1 || pageNum > TOTAL_PAGES) notFound()

  const { verses } = await getVersesByPage(pageNum)

  return (
    <MushafPageClient
      pageNum={pageNum}
      verses={verses}
      totalPages={TOTAL_PAGES}
    />
  )
}
