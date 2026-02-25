'use client'
// ============================================================
// SurahListWithSearch.tsx — Liste des sourates + SearchBar — Dark premium
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
      className="max-w-4xl mx-auto px-4 pb-16"
      aria-label="Liste des 114 sourates du Coran"
    >
      {/* Barre de recherche */}
      <SearchBar surahs={surahs} onFilter={setFiltered} />

      {/* Compteur de résultats */}
      {filtered.length < surahs.length && (
        <p className="text-sm text-slate-500 mb-4 text-center">
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
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-slate-400">Aucune sourate trouvée</p>
          <p className="text-xs text-slate-600 mt-2">Essayez le numéro, la translittération ou le nom arabe</p>
        </div>
      )}
    </section>
  )
}
