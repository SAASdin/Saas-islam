import { Metadata } from 'next'
import { getChapters } from '@/lib/quran-cdn-api'
import PlanClient from './PlanClient'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'خطة القراءة — Plan de lecture',
  description: 'Plan de lecture du Coran en 30, 90 ou 365 jours',
}

export default async function PlanPage() {
  const { chapters } = await getChapters()
  return <PlanClient chapters={chapters} />
}
