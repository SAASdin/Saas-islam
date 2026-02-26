export const dynamic = 'force-dynamic'
import { getChapters } from '@/lib/quran-cdn-api'
import SurahListClient from '@/components/quran/v2/SurahListClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Les 114 Sourates',
  description: 'Liste complète des 114 sourates du Saint Coran avec traductions françaises',
}

export default async function SurahListPage() {
  const { chapters } = await getChapters()
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-2">Les 114 Sourates</h1>
      <p className="text-slate-400 text-sm mb-6">Saint Coran — القرآن الكريم</p>
      <SurahListClient chapters={chapters} />
    </div>
  )
}
