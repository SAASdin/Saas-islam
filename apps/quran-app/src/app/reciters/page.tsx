import { Metadata } from 'next'
import { getAudioReciters } from '@/lib/quran-cdn-api'
import RecitersClient from './RecitersClient'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'القراء — Récitateurs',
  description: '14 récitateurs Hafs — écouter les sourates complètes',
}

export default async function RecitersPage() {
  const { reciters } = await getAudioReciters()
  return <RecitersClient reciters={reciters} />
}
