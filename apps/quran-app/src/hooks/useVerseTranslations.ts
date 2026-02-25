'use client'
// ============================================================
// useVerseTranslations — Hook pour charger les traductions
// Recharge automatiquement si les traductions sélectionnées changent
// ============================================================
import { useState, useEffect, useRef } from 'react'
import { useSettings } from '@/store/settings'
import type { QdcVerse } from '@/lib/quran-cdn-api'

const BASE = 'https://api.qurancdn.com/api/qdc'

export function useChapterTranslations(chapterId: number, initialVerses: QdcVerse[]) {
  const { selectedTranslations } = useSettings()
  const [verses, setVerses] = useState<QdcVerse[]>(initialVerses)
  const [loading, setLoading] = useState(false)
  const prevTranslationsRef = useRef<number[]>([])

  useEffect(() => {
    // Vérifier si les traductions ont changé
    const prev = prevTranslationsRef.current
    const same = prev.length === selectedTranslations.length &&
      selectedTranslations.every(id => prev.includes(id))
    if (same) return

    prevTranslationsRef.current = [...selectedTranslations]

    // Vérifier si les versets initiaux contiennent déjà toutes les traductions demandées
    const firstVerse = initialVerses[0]
    const availableIds = firstVerse?.translations?.map(t => t.resource_id) ?? []
    const missingIds = selectedTranslations.filter(id => !availableIds.includes(id))

    if (missingIds.length === 0) {
      // Filtrer les traductions disponibles selon la sélection
      setVerses(initialVerses.map(v => ({
        ...v,
        translations: v.translations?.filter(t => selectedTranslations.includes(t.resource_id)),
      })))
      return
    }

    // Charger les traductions manquantes
    setLoading(true)
    const params = new URLSearchParams({
      translations: selectedTranslations.join(','),
      fields: 'verse_key',
      per_page: '300',
      page: '1',
    })

    fetch(`${BASE}/verses/by_chapter/${chapterId}?${params}`)
      .then(r => r.json())
      .then(data => {
        if (!data.verses) return
        // Merger les nouvelles traductions avec les versets existants
        const translationsByKey: Record<string, QdcVerse['translations']> = {}
        data.verses.forEach((v: QdcVerse) => {
          translationsByKey[v.verse_key] = v.translations
        })
        setVerses(initialVerses.map(v => ({
          ...v,
          translations: translationsByKey[v.verse_key] ?? v.translations,
        })))
      })
      .catch(() => {}) // Garder les traductions existantes en cas d'erreur
      .finally(() => setLoading(false))
  }, [selectedTranslations, chapterId, initialVerses])

  return { verses, loading }
}
