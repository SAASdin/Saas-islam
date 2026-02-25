// ============================================================
// lib/quran-cdn-api.ts — Client API Quran.com v4 (QuranCDN)
// Source : https://api.qurancdn.com/api/qdc
// ⚠️  Les données retournées sont SACRÉES — afficher SANS modification
// ⚠️  JAMAIS appliquer trim(), replace(), toLowerCase() sur le texte arabe
// ============================================================

const QDC_BASE = 'https://api.qurancdn.com/api/qdc'

// ── Types ────────────────────────────────────────────────────

export interface QdcChapter {
  id: number
  revelation_place: 'makkah' | 'madinah'
  revelation_order: number
  bismillah_pre: boolean
  name_simple: string
  name_complex: string
  name_arabic: string
  verses_count: number
  pages: [number, number]
  translated_name: { language_name: string; name: string }
}

export interface QdcWord {
  id: number
  position: number
  audio_url: string | null
  char_type_name: string
  text_uthmani: string
  text_imlaei: string
  translation: { text: string; language_name: string }
  transliteration: { text: string; language_name: string }
}

export interface QdcTranslation {
  id: number
  resource_id: number
  text: string
}

export interface QdcVerse {
  id: number
  verse_number: number
  verse_key: string // "1:1"
  hizb_number: number
  rub_el_hizb_number: number
  ruku_number: number
  manzil_number: number
  sajdah_number: number | null
  page_number: number
  juz_number: number
  text_uthmani?: string      // texte direct (champ `fields=text_uthmani`)
  text_imlaei?: string
  words?: QdcWord[]
  translations?: QdcTranslation[]
  audio?: { url: string }
}

export interface QdcReciter {
  id: number
  reciter_id: number
  name: string
  translated_name: { name: string; language_name: string }
  style: { name: string; language_name: string; description: string }
  qirat: { name: string; language_name: string }
}

export interface QdcJuz {
  id: number
  juz_number: number
  verse_mapping: Record<string, string>
  first_verse_id: number
  last_verse_id: number
  verses_count: number
}

export interface QdcSearchResult {
  verse_key: string
  text: string
  verse_id: number
}

// ── Constantes ───────────────────────────────────────────────

/** IDs traductions validés — source : /api/qdc/resources/translations */
export const TRANSLATIONS = {
  hamidullah_fr: 31,   // Muhammad Hamidullah (FR) — slug: quran.fr.hamidullah
  montada_fr: 136,     // Montada Islamic Foundation (FR)
  rashid_fr: 779,      // Rashid Maash (FR)
  saheeh_en: 20,       // Saheeh International (EN)
  haleem_en: 85,       // M.A.S. Abdel Haleem (EN)
  usmani_en: 84,       // T. Usmani (EN)
} as const

/** Récitateurs principaux (id = audio_recitation id sur qurancdn) */
export const RECITERS = [
  { id: 7,  name: 'Mishary Rashid Al-Afasy',    slug: 'ar.alafasy',             style: 'Murattal' },
  { id: 3,  name: 'Abdur-Rahman as-Sudais',      slug: 'ar.abdurrahmaansudais',  style: 'Murattal' },
  { id: 2,  name: 'AbdulBaset AbdulSamad',       slug: 'ar.abdulbasitmurattal',  style: 'Murattal' },
  { id: 6,  name: 'Mahmoud Khalil Al-Husary',    slug: 'ar.husary',              style: 'Murattal' },
  { id: 10, name: "Sa'ud ash-Shuraim",           slug: 'ar.shaatree',            style: 'Murattal' },
  { id: 1,  name: 'AbdulBaset AbdulSamad',       slug: 'ar.abdulbasitmujawwad',  style: 'Mujawwad' },
] as const

export type ReciterEntry = typeof RECITERS[number]

/** IDs tafsir validés — source : /api/qdc/resources/tafsirs */
export const TAFSIRS = [
  { id: 16,  name: 'Tafsir Muyassar',     lang: 'ar' as const },  // التفسير الميسر
  { id: 14,  name: 'Ibn Kathir (AR)',      lang: 'ar' as const },  // تفسیر ابنِ کثیر
  { id: 169, name: 'Ibn Kathir (EN)',      lang: 'en' as const },  // Ibn Kathir Abridged
  { id: 90,  name: 'Al-Qurtubi (AR)',      lang: 'ar' as const },  // تفسير القرطبي
  { id: 15,  name: 'Al-Tabari (AR)',       lang: 'ar' as const },  // تفسير الطبري
] as const

// ── Utilitaires audio ────────────────────────────────────────

/**
 * URL MP3 d'un verset via everyayah.com
 * Format : SSSAAA.mp3
 */
export function getVerseAudioUrl(reciterSlug: string, surah: number, ayah: number): string {
  const s = String(surah).padStart(3, '0')
  const a = String(ayah).padStart(3, '0')
  // everyayah.com utilise le format /reciter_slug/SSSAAA.mp3
  return `https://everyayah.com/data/${reciterSlug}/${s}${a}.mp3`
}

/**
 * URL MP3 sourate complète via quranicaudio.com
 */
export function getSurahAudioUrl(reciterQuranicId: number, surah: number): string {
  return `https://download.quranicaudio.com/quran/${reciterQuranicId}/${String(surah).padStart(3, '0')}.mp3`
}

/**
 * Mapping slug everyayah.com par ID récitateur QuranCDN
 */
export const RECITER_SLUGS: Record<number, string> = {
  7:   'Alafasy_128kbps',
  3:   'Abdurrahmaan_As-Sudais_192kbps',
  2:   'Abdul_Basit_Murattal_192kbps',
  6:   'Husary_128kbps',
  10:  'Saood_ash-Shuraym_128kbps',
  1:   'Abdul_Basit_Mujaawad_128kbps',
  9:   'Mishary_Rashid_Alafasy',
  8:   'Muhammad_Ayyoob_128kbps',
  11:  'Maher_AlMuaiqly_128kbps',
  12:  'Bandar_Baleelah_192kbps',
}

export function getReciterSlugById(reciterId: number): string {
  return RECITER_SLUGS[reciterId] ?? RECITER_SLUGS[7]
}

// ── Fetch interne ────────────────────────────────────────────

async function qdcFetch<T>(endpoint: string, revalidate = 86400): Promise<T> {
  const url = `${QDC_BASE}${endpoint}`
  const res = await fetch(url, {
    next: { revalidate },
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`QDC API ${res.status}: ${endpoint}`)
  return res.json() as Promise<T>
}

// ── Fonctions publiques ──────────────────────────────────────

/** Liste des 114 sourates avec traduction FR */
export async function getChapters(): Promise<{ chapters: QdcChapter[] }> {
  return qdcFetch('/chapters?language=fr')
}

/** Détail d'une sourate */
export async function getChapter(id: number): Promise<{ chapter: QdcChapter }> {
  return qdcFetch(`/chapters/${id}?language=fr`)
}

/** Versets d'une sourate avec mots + traductions + audio */
export async function getVersesByChapter(
  chapterNumber: number,
  options: {
    translations?: number[]
    words?: boolean
    audioId?: number
    perPage?: number
    page?: number
  } = {}
): Promise<{ verses: QdcVerse[]; pagination: { total_records: number; current_page: number; total_pages: number } }> {
  const params = new URLSearchParams({
    words: String(options.words ?? true),
    translations: (options.translations ?? [TRANSLATIONS.hamidullah_fr, TRANSLATIONS.saheeh_en]).join(','),
    audio: String(options.audioId ?? 7),
    word_fields: 'text_uthmani,text_imlaei',
    fields: 'text_uthmani,text_imlaei,verse_key,juz_number,page_number',
    per_page: String(options.perPage ?? 300),
    page: String(options.page ?? 1),
  })
  return qdcFetch(`/verses/by_chapter/${chapterNumber}?${params}`, 86400)
}

/** Versets d'un juz */
export async function getVersesByJuz(
  juzNumber: number,
  options: { translations?: number[] } = {}
): Promise<{ verses: QdcVerse[]; pagination: { total_records: number } }> {
  const params = new URLSearchParams({
    words: 'true',
    translations: (options.translations ?? [TRANSLATIONS.hamidullah_fr]).join(','),
    word_fields: 'text_uthmani,text_imlaei',
    fields: 'text_uthmani,text_imlaei,verse_key,juz_number,page_number',
    per_page: '300',
  })
  return qdcFetch(`/verses/by_juz/${juzNumber}?${params}`, 86400)
}

/** Versets d'une page mushaf (1-604) */
export async function getVersesByPage(
  pageNumber: number,
  options: { translations?: number[] } = {}
): Promise<{ verses: QdcVerse[] }> {
  const params = new URLSearchParams({
    words: 'true',
    translations: (options.translations ?? [TRANSLATIONS.hamidullah_fr]).join(','),
    word_fields: 'text_uthmani,text_imlaei',
    fields: 'text_uthmani,text_imlaei,verse_key,juz_number,page_number',
    per_page: '50',
  })
  return qdcFetch(`/verses/by_page/${pageNumber}?${params}`, 86400)
}

/** Un verset spécifique par clé (ex: "1:1") */
export async function getVerse(
  verseKey: string,
  options: { translations?: number[] } = {}
): Promise<{ verse: QdcVerse }> {
  const params = new URLSearchParams({
    words: 'true',
    translations: (options.translations ?? [TRANSLATIONS.hamidullah_fr, TRANSLATIONS.saheeh_en]).join(','),
    word_fields: 'text_uthmani,text_imlaei',
    fields: 'text_uthmani,text_imlaei,verse_key,juz_number,page_number',
  })
  return qdcFetch(`/verses/by_key/${verseKey}?${params}`, 86400)
}

/** Recherche fulltext */
export async function searchVerses(
  query: string,
  page = 1,
  size = 20
): Promise<{ search: { query: string; total_results: number; current_page: number; results: QdcSearchResult[] } }> {
  const params = new URLSearchParams({
    q: query,
    size: String(size),
    page: String(page),
    language: 'fr',
    translations: String(TRANSLATIONS.hamidullah_fr),
  })
  return qdcFetch(`/search?${params}`, 0) // pas de cache pour la recherche
}

/** Tafsir d'une sourate complète */
export async function getTafsirByChapter(
  tafsirId: number,
  chapterNumber: number
): Promise<{ tafsirs: Array<{ verse_key: string; text: string }> }> {
  return qdcFetch(`/tafsirs/${tafsirId}/by_chapter/${chapterNumber}`, 86400)
}

/** Tafsir d'un verset */
export async function getTafsirByVerse(
  tafsirId: number,
  verseKey: string
): Promise<{ tafsir: { verse_key: string; text: string; resource_name: string } }> {
  return qdcFetch(`/tafsirs/${tafsirId}/by_ayah/${verseKey}`, 86400)
}

/** Liste des 30 juz */
export async function getJuzs(): Promise<{ juzs: QdcJuz[] }> {
  return qdcFetch('/juzs', 86400 * 30) // immutable — cache 30 jours
}

/** Liste des récitateurs */
export async function getReciters(): Promise<{ reciters: QdcReciter[] }> {
  return qdcFetch('/audio/reciters?language=fr', 86400)
}

/** Récitateur par défaut (Alafasy) */
export const DEFAULT_RECITER = RECITERS[0]

/**
 * Extrait le texte Uthmani d'un verset
 * ⚠️ Priorité : text_uthmani du verset > reconstruction depuis words
 * Ne jamais modifier le résultat
 */
export function getVerseText(verse: QdcVerse): string {
  if (verse.text_uthmani) return verse.text_uthmani
  if (verse.words && verse.words.length > 0) {
    return verse.words
      .filter(w => w.char_type_name !== 'end')
      .map(w => w.text_uthmani)
      .join(' ')
  }
  return ''
}

/**
 * Extrait la traduction principale d'un verset
 */
export function getTranslation(verse: QdcVerse, resourceId: number): string {
  const t = verse.translations?.find(t => t.resource_id === resourceId)
  return t?.text ?? ''
}
