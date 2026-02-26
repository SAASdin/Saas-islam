// ============================================================
// lib/api/quran.ts — Point d'entrée principal API Coran
// Réexporte et organise les fonctions de quran-api.ts
// ⚠️  Les données retournées sont SACRÉES — afficher SANS modification
// ⚠️  JAMAIS : trim(), replace(), toLowerCase() sur le texte arabe
// ============================================================

// Réexport complet depuis la source
export {
  getAllSurahs,
  getSurahWithAyahs,
  getSurahTranslationFr,
  getAyah,
} from '@/lib/quran-api'

export type { Surah, Ayah, AyahTranslation, AyahWithTranslation } from '@/types/quran'

// ── Constantes utiles ─────────────────────────────────────────

/** CDN audio — 4 récitateurs disponibles */
export const RECITERS = {
  alafasy:   { key: 'ar.alafasy',    nameFr: 'Mishary Alafasy',   nameAr: 'مشاري العفاسي' },
  husary:    { key: 'ar.husary',     nameFr: 'Mahmoud Khalil Husary', nameAr: 'محمود خليل الحصري' },
  minshawi:  { key: 'ar.minshawi',   nameFr: 'Mohamed Siddiq Minshawi', nameAr: 'محمد صديق المنشاوي' },
  sudais:    { key: 'ar.abdurrahmaansudais', nameFr: 'Abdurrahman as-Sudais', nameAr: 'عبد الرحمن السديس' },
} as const

export type ReciterKey = keyof typeof RECITERS

/** Construit l'URL audio d'un verset */
export function getAyahAudioUrl(
  ayahNumberQuran: number,
  reciter: ReciterKey = 'alafasy'
): string {
  return `https://cdn.islamic.network/quran/audio/128/${RECITERS[reciter].key}/${ayahNumberQuran}.mp3`
}

/** Construit l'URL audio d'une sourate complète */
export function getSurahAudioUrl(
  surahId: number,
  reciter: ReciterKey = 'alafasy'
): string {
  return `https://cdn.islamic.network/quran/audio-surah/128/${RECITERS[reciter].key}/${surahId}.mp3`
}

/** Formate une référence coranique */
export function formatAyahRef(surahId: number, ayahNumber: number): string {
  return `${surahId}:${ayahNumber}`
}

/** Vérifie si une sourate a la Bismillah
 *  Règle : toutes les sourates sauf At-Tawbah (9)
 */
export function hasBismillah(surahId: number): boolean {
  return surahId !== 9
}
