export const dynamic = 'force-dynamic'
import { getChapters } from '@/lib/quran-cdn-api'
import HomeClient from '@/components/home/HomeClient'

export default async function HomePage() {
  const { chapters } = await getChapters()
  return <HomeClient chapters={chapters} />
}
