// ============================================================
// SurahCard.tsx — Carte d'une sourate
// Affiche le nom arabe, translittération, nombre de versets
// ⚠️  nameArabic est SACRÉ — affiché tel quel, aucune transformation
// ============================================================

import Link from 'next/link'
import type { Surah } from '@/types/quran'

interface SurahCardProps {
  surah: Surah
}

export default function SurahCard({ surah }: SurahCardProps) {
  return (
    <Link
      href={`/surah/${surah.id}`}
      className="
        group flex items-center gap-4 p-4
        bg-white dark:bg-gray-800
        border border-gray-100 dark:border-gray-700
        rounded-xl shadow-sm
        hover:shadow-md hover:border-islam-500/30
        transition-all duration-200
        animate-fade-in
      "
    >
      {/* Numéro de sourate */}
      <div className="
        flex items-center justify-center
        w-10 h-10 rounded-full flex-shrink-0
        bg-islam-500 text-white
        text-sm font-medium
        group-hover:bg-islam-600 transition-colors
      ">
        {surah.id}
      </div>

      {/* Infos gauche — translittération + métadonnées */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
          {surah.nameTransliteration}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {surah.revelationType === 'mecquoise' ? 'Mecquoise' : 'Médinoise'}
          {' · '}
          {surah.ayahCount} versets
        </p>
      </div>

      {/* Nom arabe — SACRÉ, RTL obligatoire */}
      <div
        dir="rtl"
        lang="ar"
        className="
          quran-text text-xl text-gray-900 dark:text-gray-100
          flex-shrink-0
          group-hover:text-islam-600 dark:group-hover:text-islam-400
          transition-colors
        "
        aria-label={`Nom arabe : ${surah.nameArabic}`}
      >
        {/* ⚠️ Affiché tel quel — JAMAIS transformer ce texte */}
        {surah.nameArabic}
      </div>
    </Link>
  )
}
