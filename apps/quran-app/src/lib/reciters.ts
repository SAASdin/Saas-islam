// ============================================================
// lib/reciters.ts — Configuration des récitateurs Coran
// Source audio : everyayah.com (gratuit, haute qualité)
// Format URL : https://everyayah.com/data/{key}/{surah3}{ayah3}.mp3
// Exemple : https://everyayah.com/data/Alafasy_128kbps/001001.mp3
// ⚠️  SACRÉ — nameAr ne doit JAMAIS être modifié
// ============================================================

export interface Reciter {
  id: string
  /** Clé CDN everyayah.com — correspond au répertoire sur le serveur */
  key: string
  nameFr: string
  /** ⚠️  Nom arabe — NE JAMAIS modifier, transformer ou reformater */
  nameAr: string
  bitrate: number
}

/** Cinq récitateurs disponibles sur everyayah.com */
export const RECITERS: Record<string, Reciter> = {
  alafasy: {
    id: 'alafasy',
    key: 'Alafasy_128kbps',
    nameFr: 'Mishary Rashid Alafasy',
    nameAr: 'مشاري راشد العفاسي',
    bitrate: 128,
  },
  sudais: {
    id: 'sudais',
    key: 'Sudais_192kbps',
    nameFr: 'Abdul Rahman Al-Sudais',
    nameAr: 'عبد الرحمن السديس',
    bitrate: 192,
  },
  husary: {
    id: 'husary',
    key: 'Husary_128kbps',
    nameFr: 'Mahmoud Khalil Al-Husary',
    nameAr: 'محمود خليل الحصري',
    bitrate: 128,
  },
  shuraim: {
    id: 'shuraim',
    key: 'Shuraim_128kbps',
    nameFr: 'Saud Al-Shuraim',
    nameAr: 'سعود الشريم',
    bitrate: 128,
  },
  minshawi: {
    id: 'minshawi',
    key: 'Minshawi_128kbps',
    nameFr: 'Mohamed Siddiq Al-Minshawi',
    nameAr: 'محمد صديق المنشاوي',
    bitrate: 128,
  },
}

export type ReciterId = keyof typeof RECITERS

export const DEFAULT_RECITER_ID = 'alafasy'

/**
 * Construit l'URL audio everyayah.com pour un verset précis.
 *
 * Format : {surah padded 3 digits}{ayah padded 3 digits}.mp3
 * Exemple : surah=1, ayah=1 → "001001.mp3"
 *
 * ⚠️  Les numéros de sourate/verset sont des identifiants numériques (métadonnées),
 *     pas du texte sacré — padding autorisé.
 */
export function buildAudioUrl(
  reciterId: string,
  surahNumber: number,
  ayahNumber: number
): string {
  const reciter = RECITERS[reciterId] ?? RECITERS[DEFAULT_RECITER_ID]
  const surah = String(surahNumber).padStart(3, '0')
  const ayah = String(ayahNumber).padStart(3, '0')
  return `https://everyayah.com/data/${reciter.key}/${surah}${ayah}.mp3`
}
