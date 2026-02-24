// ============================================================
// lib/quran-api.ts — Client API AlQuran.cloud
// Source officielle approuvée (docs/DATA_SOURCES.md)
// ⚠️  Les données retournées sont SACRÉES — afficher SANS modification
// ⚠️  JAMAIS appliquer trim(), replace(), toLowerCase() sur le texte arabe
// ============================================================

import type { Surah, Ayah, AlQuranApiSurah, AlQuranApiAyah } from '@/types/quran'

const API_BASE = 'https://api.alquran.cloud/v1'

// ── Utilitaire fetch avec cache Next.js ─────────────────────

async function apiFetch<T>(endpoint: string, revalidate = 86400): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    next: { revalidate }, // Cache 24h — données immuables
    headers: { 'Accept': 'application/json' },
  })

  if (!res.ok) {
    throw new Error(`AlQuran API error ${res.status}: ${endpoint}`)
  }

  const json = await res.json()

  if (json.code !== 200) {
    throw new Error(`AlQuran API returned code ${json.code}: ${json.status}`)
  }

  return json.data as T
}

// ── Mapper API → types internes ─────────────────────────────
// ⚠️  Les champs de texte arabe sont copiés SANS transformation

function mapSurah(s: AlQuranApiSurah): Surah {
  return {
    id: s.number,
    nameArabic: s.name,                           // ⚠️ SACRÉ — pas de transformation
    nameTransliteration: s.englishName,
    nameFrench: s.englishNameTranslation,         // À remplacer par trad FR quand disponible
    nameEnglish: s.englishNameTranslation,
    revelationType: s.revelationType === 'Meccan' ? 'mecquoise' : 'médinoise',
    ayahCount: s.numberOfAyahs,
    juzStart: 1,                                  // À compléter avec BDD
    pageMushaf: 1,
    hasBismillah: s.number !== 9,                 // RÈGLE : pas de bismillah pour At-Tawbah
  }
}

function mapAyah(a: AlQuranApiAyah, surahId: number): Ayah {
  return {
    id: a.number,
    surahId,
    ayahNumber: a.numberInSurah,
    ayahNumberQuran: a.number,
    textUthmani: a.text,                          // ⚠️ SACRÉ — pas de transformation
    textSimple: a.text,
    juz: a.juz,
    hizb: a.hizbQuarter,
    rub: a.hizbQuarter,
    pageMushaf: a.page,
    sajda: Boolean(a.sajda),
    sajdaType: typeof a.sajda === 'object' && a.sajda
      ? (a.sajda.obligatory ? 'obligatory' : 'recommended')
      : undefined,
  }
}

// ── Fonctions publiques ──────────────────────────────────────

/**
 * Récupère la liste des 114 sourates
 * Mise en cache 24h (données immuables)
 */
export async function getAllSurahs(): Promise<Surah[]> {
  const data = await apiFetch<AlQuranApiSurah[]>('/surah')
  return data.map(mapSurah)
}

/**
 * Récupère une sourate avec tous ses versets (Uthmani)
 * ⚠️  Édition Hafs — texte sacré, afficher tel quel
 */
export async function getSurahWithAyahs(
  surahNumber: number
): Promise<{ surah: Surah; ayahs: Ayah[] }> {
  if (surahNumber < 1 || surahNumber > 114) {
    throw new Error(`Numéro de sourate invalide : ${surahNumber}`)
  }

  // Edition quran-uthmani = texte du Mushaf Uthmani (Hafs 'an 'Asim)
  const data = await apiFetch<{
    number: number
    name: string
    englishName: string
    englishNameTranslation: string
    revelationType: string
    numberOfAyahs: number
    ayahs: AlQuranApiAyah[]
  }>(`/surah/${surahNumber}/quran-uthmani`)

  const surah = mapSurah({
    number: data.number,
    name: data.name,
    englishName: data.englishName,
    englishNameTranslation: data.englishNameTranslation,
    revelationType: data.revelationType,
    numberOfAyahs: data.numberOfAyahs,
  })

  const ayahs = data.ayahs.map(a => mapAyah(a, surahNumber))

  return { surah, ayahs }
}

/**
 * Récupère la traduction française d'une sourate
 * Traducteur : Hamidullah (fr.hamidullah) — traduction validée
 * ⚠️  Toujours utiliser la traduction de la BDD — jamais générer soi-même
 */
export async function getSurahTranslationFr(surahNumber: number): Promise<string[]> {
  const data = await apiFetch<{
    ayahs: { text: string }[]
  }>(`/surah/${surahNumber}/fr.hamidullah`)

  return data.ayahs.map(a => a.text) // ⚠️ Copié sans transformation
}

/**
 * Récupère un verset spécifique
 * Format : surahNumber:ayahNumber (ex: 1:1)
 */
export async function getAyah(
  surahNumber: number,
  ayahNumber: number
): Promise<{ ayah: Ayah; translationFr?: string }> {
  const [ayahData, translationData] = await Promise.allSettled([
    apiFetch<AlQuranApiAyah>(`/ayah/${surahNumber}:${ayahNumber}/quran-uthmani`),
    apiFetch<{ text: string }>(`/ayah/${surahNumber}:${ayahNumber}/fr.hamidullah`),
  ])

  if (ayahData.status === 'rejected') {
    throw new Error(`Impossible de récupérer le verset ${surahNumber}:${ayahNumber}`)
  }

  return {
    ayah: mapAyah(ayahData.value, surahNumber),
    translationFr: translationData.status === 'fulfilled' ? translationData.value.text : undefined,
  }
}
