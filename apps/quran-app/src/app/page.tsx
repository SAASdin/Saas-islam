// ============================================================
// page.tsx — Page d'accueil : Landing platform + Coran
// Inspiré de ramadan-2026.com (showcase modules) + quran.com
// ⚠️  Texte arabe : dir="rtl" lang="ar" OBLIGATOIRES
// ============================================================

import { getAllSurahs } from '@/lib/quran-api'
import SurahListWithSearch from '@/components/quran/SurahListWithSearch'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Saas-islam — Plateforme islamique',
  description: 'Coran, Hadiths, Horaires de prière, Bibliothèque islamique — Une sadaqa jariya technologique',
}

export const revalidate = 86400

// ── Modules de la plateforme ─────────────────────────────────

const MODULES = [
  {
    href: '/',
    icon: '📖',
    nameAr: 'القرآن الكريم',
    nameFr: 'Le Saint Coran',
    desc: '114 sourates · 6236 versets · Traduction Hamidullah · Audio',
    color: 'from-emerald-500 to-emerald-700',
    badge: '✓ Disponible',
    badgeColor: 'bg-emerald-100 text-emerald-700',
  },
  {
    href: '/hadiths',
    icon: '📜',
    nameAr: 'الحديث الشريف',
    nameFr: 'Hadiths',
    desc: 'Bukhari, Muslim, Abu Dawud, Tirmidhi et plus — 30,000+ hadiths',
    color: 'from-amber-500 to-amber-700',
    badge: '✓ Disponible',
    badgeColor: 'bg-amber-100 text-amber-700',
  },
  {
    href: '/priere',
    icon: '🕌',
    nameAr: 'مواقيت الصلاة',
    nameFr: 'Horaires de Prière',
    desc: 'Paris et toutes les villes françaises · Méthode UOIF · Countdown',
    color: 'from-sky-500 to-sky-700',
    badge: '✓ Disponible',
    badgeColor: 'bg-sky-100 text-sky-700',
  },
  {
    href: '/bibliotheque',
    icon: '📚',
    nameAr: 'المكتبة الإسلامية',
    nameFr: 'Bibliothèque',
    desc: '7000+ livres classiques — Tafsir, Fiqh, Aqida, Sira',
    color: 'from-violet-500 to-violet-700',
    badge: '✓ Disponible',
    badgeColor: 'bg-violet-100 text-violet-700',
  },
  {
    href: '#',
    icon: '🎓',
    nameAr: 'حفظ المتون',
    nameFr: 'Mémorisation',
    desc: 'Mutun islamiques · SRS type Anki · Révision espacée',
    color: 'from-rose-500 to-rose-700',
    badge: 'Bientôt',
    badgeColor: 'bg-gray-100 text-gray-500',
  },
  {
    href: '#',
    icon: '🌐',
    nameAr: 'الشبكة الحلال',
    nameFr: 'Réseau Halal',
    desc: 'Partage de contenus islamiques · Feed chronologique · Modéré',
    color: 'from-teal-500 to-teal-700',
    badge: 'Bientôt',
    badgeColor: 'bg-gray-100 text-gray-500',
  },
]

export default async function HomePage() {
  const surahs = await getAllSurahs()

  return (
    <main className="min-h-screen bg-cream-50 dark:bg-gray-900">

      {/* ── Navigation ────────────────────────────────────── */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-islam-700 dark:text-islam-400">
              🕌 Saas-islam
            </h1>
            <p className="text-xs text-gray-400">نور في كل بيت</p>
          </div>
          <nav className="flex gap-4 text-sm text-gray-600 dark:text-gray-300">
            <Link href="/" className="hover:text-islam-600 font-semibold text-islam-600">Coran</Link>
            <Link href="/hadiths" className="hover:text-islam-600">Hadiths</Link>
            <Link href="/priere" className="hover:text-islam-600">Prière</Link>
            <Link href="/bibliotheque" className="hover:text-islam-600">Bibliothèque</Link>
            <Link href="/search" className="hover:text-islam-600">🔍</Link>
          </nav>
        </div>
      </header>

      {/* ── Hero — style ramadan-2026.com ─────────────────── */}
      <section className="bg-gradient-to-br from-islam-800 via-islam-700 to-emerald-800 text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* Bismillah */}
          <p
            dir="rtl"
            lang="ar"
            className="bismillah text-3xl mb-2 opacity-90"
            aria-label="Bismillahi Ar-Rahmani Ar-Raheem"
          >
            {/* ⚠️ Texte sacré — copié tel quel */}
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <h2 className="text-4xl font-bold mt-4 mb-3">
            Plateforme Islamique
          </h2>
          <p className="text-islam-200 text-lg mb-2">
            Coran · Hadiths · Prière · Bibliothèque · Mémorisation
          </p>
          <p className="text-islam-300 text-sm">
            Une sadaqa jariya — libre, accessible, sur tous les appareils
          </p>

          {/* CTA Recherche */}
          <Link
            href="/search"
            className="mt-8 inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-xl px-6 py-3 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Rechercher dans le Coran
          </Link>
        </div>
      </section>

      {/* ── Modules — style ramadan-2026.com cards ───────────── */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Nos modules
          </h2>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {MODULES.map((mod) => (
            <Link
              key={mod.href + mod.nameFr}
              href={mod.href}
              className={`group block rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all ${
                mod.badge === 'Bientôt' ? 'opacity-70 cursor-default pointer-events-none' : ''
              }`}
            >
              {/* Bande colorée */}
              <div className={`h-2 bg-gradient-to-r ${mod.color}`} />
              <div className="bg-white dark:bg-gray-800 p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl" role="img" aria-hidden>{mod.icon}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${mod.badgeColor}`}>
                    {mod.badge}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-islam-600 transition-colors mb-1">
                  {mod.nameFr}
                </h3>
                <p
                  dir="rtl"
                  lang="ar"
                  className="text-sm text-islam-600 dark:text-islam-400 mb-2"
                >
                  {mod.nameAr}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {mod.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Séparateur ────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          <div className="text-center">
            <p
              dir="rtl"
              lang="ar"
              className="bismillah text-2xl text-islam-700 dark:text-islam-400"
              aria-label="Al-Quran al-Karim"
            >
              القرآن الكريم
            </p>
            <p className="text-xs text-gray-400 mt-1">114 sourates · 6 236 versets</p>
          </div>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>

      {/* ── Liste des sourates avec recherche ─────────────── */}
      <SurahListWithSearch surahs={surahs} />

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-8 text-center text-xs text-gray-400 dark:text-gray-600 space-y-1">
        <p>Données coraniques : Mushaf Uthmani — Hafs ʿan ʿĀṣim · api.alquran.cloud</p>
        <p>Hadiths : api.hadith.gading.dev · Prières : api.aladhan.com</p>
        <p className="mt-2 text-islam-500">
          بارك الله فيكم — Que ce projet soit une sadaqa jariya لأصحابه وزوّاره
        </p>
      </footer>
    </main>
  )
}
