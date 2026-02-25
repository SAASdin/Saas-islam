// ============================================================
// priere/page.tsx — Horaires de prière
// Source : api.aladhan.com (gratuit, pas de clé)
// Méthode : UOIF (recommandée pour France/Europe)
// ============================================================

import { getPrayerTimesByCity, formatPrayers, formatHijriDate } from '@/lib/prayer-api'
import PrayerCountdown from '@/components/prayer/PrayerCountdown'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Horaires de Prière — مواقيت الصلاة',
  description: 'Horaires de prière pour Paris et la France — méthode UOIF',
}

export const revalidate = 3600 // Re-calculer toutes les heures

// Villes françaises pré-configurées
const CITIES = [
  { city: 'Paris', country: 'France', flag: '🗼' },
  { city: 'Lyon', country: 'France', flag: '🦁' },
  { city: 'Marseille', country: 'France', flag: '⚓' },
  { city: 'Bordeaux', country: 'France', flag: '🍷' },
  { city: 'Lille', country: 'France', flag: '🏭' },
  { city: 'Strasbourg', country: 'France', flag: '🎄' },
]

export default async function PriereHomePage() {
  // Par défaut Paris — l'utilisateur peut changer via l'UI
  let prayerData = null
  let error = null

  try {
    prayerData = await getPrayerTimesByCity('Paris', 'France', 12)
  } catch (e) {
    error = 'Impossible de charger les horaires pour le moment.'
  }

  const prayers = prayerData ? formatPrayers(prayerData.timings) : []
  const hijriDate = prayerData ? formatHijriDate(prayerData.date.hijri) : ''

  return (
    <main className="min-h-screen bg-cream-50 dark:bg-gray-900">

      {/* ── Navigation ────────────────────────────────────── */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-islam-700 dark:text-islam-400">
            🕌 Saas-islam
          </Link>
          <nav className="flex gap-4 text-sm text-gray-600 dark:text-gray-300">
            <Link href="/" className="hover:text-islam-600">Coran</Link>
            <Link href="/hadiths" className="hover:text-islam-600">Hadiths</Link>
            <Link href="/priere" className="text-islam-600 font-semibold">Prière</Link>
            <Link href="/bibliotheque" className="hover:text-islam-600">Bibliothèque</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* ── En-tête ───────────────────────────────────────── */}
        <div className="text-center mb-8">
          <p
            dir="rtl"
            lang="ar"
            className="text-2xl text-islam-700 dark:text-islam-400 mb-2"
          >
            مواقيت الصلاة
          </p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Horaires de Prière
          </h1>
          {prayerData && (
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 space-y-1">
              <p>{prayerData.date.gregorian.weekday.en}, {prayerData.date.readable}</p>
              <p
                dir="rtl"
                lang="ar"
                className="text-islam-600 dark:text-islam-400"
              >
                {hijriDate}
              </p>
            </div>
          )}
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400 text-sm text-center mb-6">
            {error}
          </div>
        )}

        {/* ── Prochaine prière (countdown) ─────────────────── */}
        {prayers.length > 0 && (
          <PrayerCountdown prayers={prayers} />
        )}

        {/* ── Liste des prières ─────────────────────────────── */}
        {prayers.length > 0 && (
          <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden mb-8">
            {prayers.map((prayer, index) => (
              <div
                key={prayer.key}
                className={`flex items-center justify-between px-6 py-4 ${
                  index < prayers.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl" role="img" aria-hidden>
                    {prayer.icon}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {prayer.nameFr}
                    </p>
                    <p
                      dir="rtl"
                      lang="ar"
                      className="text-sm text-islam-600 dark:text-islam-400"
                    >
                      {prayer.nameAr}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {prayer.time}
                  </p>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* ── Info méthode de calcul ────────────────────────── */}
        {prayerData && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-300 mb-8">
            <p className="font-medium">📍 Paris, France</p>
            <p className="mt-1 text-xs">
              Méthode de calcul : {prayerData.meta.method.name}
              {' · '}
              Latitude : {prayerData.meta.latitude.toFixed(4)}
              {' · '}
              Timezone : {prayerData.meta.timezone}
            </p>
          </div>
        )}

        {/* ── Autres villes ─────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            Autres villes françaises
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CITIES.map((c) => (
              <button
                key={c.city}
                className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-islam-50 dark:hover:bg-islam-900/20 hover:text-islam-600 transition-colors text-left border border-transparent hover:border-islam-200"
                type="button"
              >
                <span className="text-lg mr-2" role="img" aria-hidden>{c.flag}</span>
                {c.city}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">
            Sélection d&apos;autres villes à venir — entrez vos coordonnées GPS pour plus de précision
          </p>
        </section>

        {/* ── Dhikr du moment ───────────────────────────────── */}
        <section className="mt-10 bg-islam-50 dark:bg-islam-900/20 rounded-2xl p-6 text-center">
          <p className="text-xs text-gray-400 mb-3 uppercase tracking-wide">
            Dhikr recommandé
          </p>
          <p
            dir="rtl"
            lang="ar"
            className="quran-text text-xl text-gray-900 dark:text-gray-100 leading-loose"
            aria-label="Subhanallah walhamdulillah wa la ilaha illallah wallahu akbar"
          >
            {/* ⚠️ Texte dhikr — copié sans modification */}
            سُبْحَانَ اللَّهِ وَبِحَمْدِهِ
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            «Gloire à Allah et à Sa louange» — 100× par jour
          </p>
        </section>

        <footer className="mt-8 text-center text-xs text-gray-400">
          <p>Source : api.aladhan.com · Méthode UOIF (n°12)</p>
        </footer>
      </div>
    </main>
  )
}
