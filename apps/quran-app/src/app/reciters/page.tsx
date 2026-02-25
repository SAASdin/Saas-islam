export const dynamic = 'force-dynamic'
// ============================================================
// /reciters — Liste des récitateurs
// ============================================================
import { getReciters } from '@/lib/quran-cdn-api'
import RecitersClient from '@/components/quran/v2/RecitersClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Récitateurs',
  description: 'Découvrez les récitateurs du Saint Coran et écoutez leurs récitations.',
}

export default async function RecitersPage() {
  const { reciters } = await getReciters()
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-2">Récitateurs</h1>
      <p className="text-slate-400 text-sm mb-8">
        {reciters.length} récitateurs disponibles
      </p>
      <RecitersClient reciters={reciters} />
    </div>
  )
}
