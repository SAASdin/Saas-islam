import { getChapters, getRandomVerse } from '@/lib/quran-cdn-api'
import HomeClient from '@/components/home/HomeClient'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [{ chapters }, verseData] = await Promise.all([
    getChapters(),
    getRandomVerse([31]).catch(() => null),
  ])

  return (
    <HomeClient
      chapters={chapters}
      verseOfDay={verseData?.verse ?? null}
      lastRead={null}  // chargé côté client depuis localStorage
    />
  )
}
