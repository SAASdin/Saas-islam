'use client'
// ============================================================
// SurahListWithSearch.tsx — Liste des sourates + SearchBar
// Client Component pour permettre la recherche en temps réel
// ⚠️  nameArabic est SACRÉ — affiché tel quel dans SurahCard
// ============================================================

import { useState } from 'react'
import type { Surah } from '@/types/quran'
import SurahCard from './SurahCard'
import SearchBar from './SearchBar'

interface Props {
  surahs: Surah[]
}

export default function SurahListWithSearch({ surahs }: Props) {
  const [filtered, setFiltered] = useState<Surah[]>(surahs)

  return (
    <section
      className="max-w-3xl mx-auto px-4 pb-12"
      aria-label="Liste des 114 sourates du Coran"
    >
      {/* Barre de recherche */}
      <SearchBar surahs={surahs} onFilter={setFiltered} />

      {/* Compteur de résultats */}
      {filtered.length < surahs.length && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 text-center">
          {filtered.length} sourate{filtered.length > 1 ? 's' : ''} trouvée{filtered.length > 1 ? 's' : ''}
        </p>
      )}

      {/* Liste */}
      {filtered.length > 0 ? (
        <div className="grid gap-2">
          {filtered.map((surah) => (
            <SurahCard key={surah.id} surah={surah} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p>Aucune sourate trouvée</p>
          <p className="text-xs mt-1">Essayez le numéro, la translittération ou le nom arabe</p>
        </div>
      )}
    </section>
  )
}
