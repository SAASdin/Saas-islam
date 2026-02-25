// ============================================================
// hadiths/page.tsx — Page d'accueil du module Hadiths
// Liste les 8 grandes collections (style sunnah.com)
// ⚠️  nameArabic : SACRÉ — dir="rtl" lang="ar" OBLIGATOIRES
//     Jamais transformer le texte arabe des collections
// ============================================================

import Link from 'next/link'
import { HADITH_COLLECTIONS } from '@/lib/hadith-api'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hadiths — Collections',
  description: 'Consultez les grandes collections de hadiths : Bukhari, Muslim, Abu Dawud et plus',
}

export const revalidate = 86400 // 24h — collections fixes

// ── Icônes par collection (émoji thématique) ─────────────────
const COLLECTION_ICONS: Record<string, string> = {
  bukhari: '📗',
  muslim: '📘',
  'abu-dawud': '📙',
  tirmidzi: '📕',
  nasai: '📒',
  'ibnu-majah': '📓',
  malik: '📔',
  riyadhussalihin: '🌿',
}

// ── Couleurs par collection ───────────────────────────────────
const COLLECTION_COLORS: Record<string, string> = {
  bukhari:        'border-l-green-500 dark:border-l-green-400',
  muslim:         'border-l-blue-500 dark:border-l-blue-400',
  'abu-dawud':    'border-l-orange-500 dark:border-l-orange-400',
  tirmidzi:       'border-l-red-500 dark:border-l-red-400',
  nasai:          'border-l-yellow-500 dark:border-l-yellow-400',
  'ibnu-majah':   'border-l-purple-500 dark:border-l-purple-400',
  malik:          'border-l-teal-500 dark:border-l-teal-400',
  riyadhussalihin:'border-l-emerald-500 dark:border-l-emerald-400',
}

export default function HadithsPage() {
  return (
    <main className="min-h-screen bg-cream-50 dark:bg-gray-900">

      {/* ── Navigation ──────────────────────────────────────── */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-islam-700 dark:text-islam-400">
              🕌 Saas-islam
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">الأحاديث النبوية</p>
          </div>
          <nav className="flex gap-3 text-sm text-gray-600 dark:text-gray-300">
            <a href="/" className="hover:text-islam-600">Coran</a>
            <a href="/hadiths" className="hover:text-islam-600 font-medium text-islam-600">Hadiths</a>
            <a href="/priere" className="hover:text-islam-600">Prière</a>
          </nav>
        </div>
      </header>

      {/* ── En-tête ──────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 pt-8 pb-4 text-center">
        <p
          dir="rtl"
          lang="ar"
          className="arabic-text text-2xl mb-2 text-islam-700 dark:text-islam-400"
          aria-label="Al-Ahadith An-Nabawiyya"
        >
          {/* ⚠️ Texte sacré — affiché tel quel */}
          الأحاديث النبوية الشريفة
        </p>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-4">
          Hadiths du Prophète ﷺ
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          {HADITH_COLLECTIONS.length} collections · {' '}
          {HADITH_COLLECTIONS.reduce((s, c) => s + c.totalHadiths, 0).toLocaleString('fr-FR')} hadiths
        </p>

        {/* Note sur la fiabilité */}
        <div className="mt-4 inline-flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
          <span>ℹ️</span>
          <span>
            Les textes arabes sont reproduits sans modification depuis des sources numériques.
            Pour toute question de fikih, consultez un savant qualifié.
          </span>
        </div>
      </section>

      {/* ── Grille des collections ───────────────────────────── */}
      <section
        className="max-w-3xl mx-auto px-4 pb-20"
        aria-label="Collections de hadiths"
      >
        <div className="grid gap-3">
          {HADITH_COLLECTIONS.map((collection) => {
            const icon = COLLECTION_ICONS[collection.id] ?? '📚'
            const colorClass = COLLECTION_COLORS[collection.id] ?? 'border-l-gray-400'

            return (
              <Link
                key={collection.id}
                href={`/hadiths/${collection.id}`}
                className={`
                  group flex items-center gap-4 p-4
                  bg-white dark:bg-gray-800
                  border border-gray-100 dark:border-gray-700
                  border-l-4 ${colorClass}
                  rounded-xl shadow-sm
                  hover:shadow-md hover:border-islam-500/30
                  transition-all duration-200
                  animate-fade-in
                `}
                aria-label={`Ouvrir la collection ${collection.name}`}
              >
                {/* Icône */}
                <span className="text-3xl flex-shrink-0" aria-hidden="true">
                  {icon}
                </span>

                {/* Infos principales */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {collection.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {collection.nameFr}
                  </p>
                  <p className="text-xs text-islam-600 dark:text-islam-400 mt-1 font-medium">
                    {collection.totalHadiths.toLocaleString('fr-FR')} hadiths
                  </p>
                </div>

                {/* Nom arabe — ⚠️ SACRÉ */}
                <div
                  dir="rtl"
                  lang="ar"
                  className="arabic-text text-lg text-gray-800 dark:text-gray-200 flex-shrink-0 text-right"
                  style={{ fontSize: '1.1rem', lineHeight: '1.8rem' }}
                  aria-label={`Nom arabe : ${collection.nameArabic}`}
                >
                  {/* ⚠️ Affiché tel quel — JAMAIS transformer */}
                  {collection.nameArabic}
                </div>

                {/* Flèche */}
                <span
                  className="text-gray-400 dark:text-gray-500 group-hover:text-islam-500 transition-colors text-sm flex-shrink-0"
                  aria-hidden="true"
                >
                  →
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="text-center py-6 text-xs text-gray-400 dark:text-gray-600">
        <p>
          Source hadiths : api.hadith.gading.dev
          {' · '}
          Données en lecture seule
        </p>
        <p className="mt-1">بارك الله فيكم — Que ce projet soit une sadaqa jariya</p>
      </footer>
    </main>
  )
}
