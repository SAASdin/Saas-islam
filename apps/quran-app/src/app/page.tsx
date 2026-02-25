// ============================================================
// page.tsx — Page d'accueil : liste des 114 sourates
// Données depuis AlQuran.cloud API (source approuvée)
// ⚠️  Les données sont lues en lecture seule, affichées sans transformation
// ============================================================

import { getAllSurahs } from '@/lib/quran-api'
import SurahCard from '@/components/quran/SurahCard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'القرآن الكريم — Lire le Saint Coran',
  description: '114 sourates du Saint Coran — لطيف بما يشاء',
}

// Revalidation toutes les 24h (données immuables)
export const revalidate = 86400

export default async function HomePage() {
  let surahs = await getAllSurahs()

  return (
    <main className="min-h-screen bg-cream-50 dark:bg-gray-900">

      {/* ── En-tête ────────────────────────────────────────── */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-islam-700 dark:text-islam-400">
              🕌 Saas-islam
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              القرآن الكريم
            </p>
          </div>
          <nav className="flex gap-3 text-sm text-gray-600 dark:text-gray-300">
            <a href="/" className="hover:text-islam-600 font-medium text-islam-600">Coran</a>
            <a href="/hadiths" className="hover:text-islam-600">Hadiths</a>
            <a href="/priere" className="hover:text-islam-600">Prière</a>
          </nav>
        </div>
      </header>

      {/* ── Bismillah + titre ───────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 pt-8 pb-4 text-center">

        {/* Bismillah — affiché sur la page d'accueil (hors sourate) */}
        <p
          dir="rtl"
          lang="ar"
          className="bismillah text-2xl mb-2"
          aria-label="Bismillahi Ar-Rahmani Ar-Raheem"
        >
          {/* ⚠️ Texte sacré — copié tel quel */}
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-4">
          Le Saint Coran
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          114 sourates · 6 236 versets
        </p>
      </section>

      {/* ── Liste des sourates ──────────────────────────────── */}
      <section
        className="max-w-3xl mx-auto px-4 pb-12"
        aria-label="Liste des 114 sourates du Coran"
      >
        <div className="grid gap-2">
          {surahs.map((surah) => (
            <SurahCard key={surah.id} surah={surah} />
          ))}
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="text-center py-6 text-xs text-gray-400 dark:text-gray-600">
        <p>
          Données coraniques : Mushaf Uthmani — Hafs ʿan ʿĀṣim
          {' · '}
          Source : <a href="https://api.alquran.cloud" className="underline hover:text-islam-500">api.alquran.cloud</a>
        </p>
        <p className="mt-1">
          بارك الله فيكم — Que ce projet soit une sadaqa jariya
        </p>
      </footer>
    </main>
  )
}
