// ============================================================
// /tafsir-audio/[tafsir] — Server component
// Charge les données et passe au lecteur client
// Next.js 15 : await params obligatoire
// ============================================================
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Navigation from '@/components/Navigation'
import {
  TAFSIR_ONE_BOOKS,
  getTafsirPage,
} from '@/lib/tafsir-one-api'
import TafsirReaderClient from './TafsirReaderClient'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ tafsir: string }>
  searchParams: Promise<{ s?: string; a?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tafsir } = await params
  const book = TAFSIR_ONE_BOOKS[tafsir]
  if (!book) return { title: 'Tafsir Audio' }
  return {
    title: `${book.title} — Tafsir Audio`,
    description: book.author,
  }
}

export default async function TafsirPage({ params, searchParams }: PageProps) {
  // Next.js 15 : await params
  const { tafsir } = await params
  const sp = await searchParams

  // Vérifier que le tafsir est valide
  if (!TAFSIR_ONE_BOOKS[tafsir]) {
    notFound()
  }

  const surahNum = Math.max(1, Math.min(114, Number(sp.s ?? 1) || 1))
  const ayahNum = Math.max(1, Number(sp.a ?? 1) || 1)

  // Charge les données côté serveur
  const initialData = await getTafsirPage(tafsir, surahNum, ayahNum)

  return (
    <>
      {/* Navigation en dehors du layout du lecteur */}
      <Navigation />

      {/* Breadcrumb rapide */}
      <div className="fixed top-14 left-0 right-0 z-20 bg-[#0a0f1e]/95 border-b border-white/5 px-4 py-1.5 hidden">
        {/* optionnel */}
      </div>

      {/* Lecteur — occupe tout l'écran sous la navbar */}
      <div className="pt-14">
        <TafsirReaderClient
          tafsir={tafsir}
          surah={surahNum}
          initialData={initialData}
        />
      </div>

    </>
  )
}
