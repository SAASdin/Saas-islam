import { Metadata } from 'next'
import Ma3ajimClient from './Ma3ajimClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'المعاجم — Dictionnaire Coranique',
  description: 'Recherche de mots arabes dans le Coran : occurrences, racines, analyse morphologique',
}

export default function Ma3ajimPage() {
  return <Ma3ajimClient />
}
