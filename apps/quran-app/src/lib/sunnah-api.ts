// ============================================================
// lib/sunnah-api.ts — Client API sunnah.com v1
// ⚠️  RÈGLES ABSOLUES :
//   - Texte arabe des hadiths : JAMAIS modifier, trim, replace, toLowerCase
//   - dir="rtl" lang="ar" OBLIGATOIRES sur tout container arabe
//   - Font arabe : var(--font-amiri)
//   - Données en lecture seule
// ============================================================

const SUNNAH_BASE = 'https://api.sunnah.com/v1'
const API_KEY = 'SqD712P3E82xnwOAEOkGd5JZH8s9wRR24TqNFzjk'

// ── Types ────────────────────────────────────────────────────

export interface SunnahCollectionLang {
  lang: string
  title: string
  shortIntro: string
}

export interface SunnahCollection {
  name: string
  hasBooks: boolean
  hasChapters: boolean
  collection: SunnahCollectionLang[]
  totalHadith: number
  totalAvailableHadith?: number
}

export interface SunnahBookLang {
  lang: string
  name: string
}

export interface SunnahBook {
  bookNumber: string
  book: SunnahBookLang[]
  hadithStartNumber: number
  hadithEndNumber: number
  numberOfHadith: number
}

export interface SunnahGrade {
  grade: string
  graded_by?: string
}

export interface SunnahHadithLang {
  lang: string
  chapterNumber?: string
  chapterTitle: string
  urn: number
  body: string
  grades: SunnahGrade[]
}

export interface SunnahHadithDetail {
  collection: string
  bookNumber: string
  chapterId: string
  hadithNumber: string
  hadith: SunnahHadithLang[]
}

export interface SunnahHadithsResponse {
  total: number
  limit: number
  page: number
  data: SunnahHadithDetail[]
}

// ── Métadonnées statiques des 18 collections ────────────────
// Évite des appels réseau inutiles pour les infos de base

export interface SunnahCollectionMeta {
  id: string               // Identifiant API (ex: 'bukhari')
  nameEn: string           // Nom anglais
  nameFr: string           // Nom français
  nameAr: string           // Nom arabe — ⚠️ SACRÉ
  totalHadith: number      // Total hadiths
  isPrimary: boolean       // Kutub as-Sittah + essentiels
  authorAr: string         // Auteur en arabe — ⚠️ SACRÉ
  authorEn: string         // Auteur en anglais
}

export const SUNNAH_COLLECTIONS: SunnahCollectionMeta[] = [
  // ── Primary (Kutub as-Sittah) ─────────────────────────────
  {
    id: 'bukhari',
    nameEn: 'Sahih al-Bukhari',
    nameFr: 'Sahih al-Boukhâri',
    nameAr: 'صحيح البخاري',
    totalHadith: 7563,
    isPrimary: true,
    authorAr: 'الإمام البخاري',
    authorEn: 'Imam al-Bukhari',
  },
  {
    id: 'muslim',
    nameEn: 'Sahih Muslim',
    nameFr: 'Sahih Muslim',
    nameAr: 'صحيح مسلم',
    totalHadith: 7470,
    isPrimary: true,
    authorAr: 'الإمام مسلم',
    authorEn: 'Imam Muslim',
  },
  {
    id: 'nasai',
    nameEn: "Sunan an-Nasa'i",
    nameFr: "Sunan an-Nasa'i",
    nameAr: 'سنن النسائي',
    totalHadith: 5766,
    isPrimary: true,
    authorAr: 'الإمام النسائي',
    authorEn: "Imam an-Nasa'i",
  },
  {
    id: 'abudawud',
    nameEn: 'Sunan Abi Dawud',
    nameFr: 'Sunan Abou Dawoud',
    nameAr: 'سنن أبي داود',
    totalHadith: 5276,
    isPrimary: true,
    authorAr: 'الإمام أبو داود',
    authorEn: 'Imam Abu Dawud',
  },
  {
    id: 'tirmidhi',
    nameEn: 'Jami at-Tirmidhi',
    nameFr: 'Jami at-Tirmidhi',
    nameAr: 'جامع الترمذي',
    totalHadith: 3956,
    isPrimary: true,
    authorAr: 'الإمام الترمذي',
    authorEn: 'Imam at-Tirmidhi',
  },
  {
    id: 'ibnmajah',
    nameEn: 'Sunan Ibn Majah',
    nameFr: 'Sunan Ibn Majah',
    nameAr: 'سنن ابن ماجه',
    totalHadith: 4341,
    isPrimary: true,
    authorAr: 'الإمام ابن ماجه',
    authorEn: 'Imam Ibn Majah',
  },
  // ── Secondary ─────────────────────────────────────────────
  {
    id: 'malik',
    nameEn: 'Muwatta Malik',
    nameFr: 'Muwatta Malik',
    nameAr: 'موطأ مالك',
    totalHadith: 1973,
    isPrimary: false,
    authorAr: 'الإمام مالك',
    authorEn: 'Imam Malik',
  },
  {
    id: 'ahmad',
    nameEn: 'Musnad Ahmad',
    nameFr: 'Musnad Ahmad',
    nameAr: 'مسند أحمد',
    totalHadith: 28199,
    isPrimary: false,
    authorAr: 'الإمام أحمد بن حنبل',
    authorEn: 'Imam Ahmad ibn Hanbal',
  },
  {
    id: 'nawawi40',
    nameEn: '40 Hadith Nawawi',
    nameFr: '40 Hadiths Nawawi',
    nameAr: 'الأربعون النووية',
    totalHadith: 42,
    isPrimary: false,
    authorAr: 'الإمام النووي',
    authorEn: 'Imam an-Nawawi',
  },
  {
    id: 'riyadussalihin',
    nameEn: 'Riyad as-Salihin',
    nameFr: 'Riyad as-Salihin',
    nameAr: 'رياض الصالحين',
    totalHadith: 1895,
    isPrimary: false,
    authorAr: 'الإمام النووي',
    authorEn: 'Imam an-Nawawi',
  },
  {
    id: 'adab',
    nameEn: 'Al-Adab Al-Mufrad',
    nameFr: 'Al-Adab Al-Mufrad',
    nameAr: 'الأدب المفرد',
    totalHadith: 1322,
    isPrimary: false,
    authorAr: 'الإمام البخاري',
    authorEn: 'Imam al-Bukhari',
  },
  {
    id: 'shamail',
    nameEn: 'Ash-Shamail Al-Muhammadiyah',
    nameFr: 'Ash-Shamail Al-Muhammadiyah',
    nameAr: 'الشمائل المحمدية',
    totalHadith: 398,
    isPrimary: false,
    authorAr: 'الإمام الترمذي',
    authorEn: 'Imam at-Tirmidhi',
  },
  {
    id: 'mishkat',
    nameEn: 'Mishkat al-Masabih',
    nameFr: 'Mishkat al-Masabih',
    nameAr: 'مشكاة المصابيح',
    totalHadith: 6285,
    isPrimary: false,
    authorAr: 'العلامة التبريزي',
    authorEn: 'Al-Tabrizi',
  },
  {
    id: 'bulugh',
    nameEn: 'Bulugh al-Maram',
    nameFr: 'Bulugh al-Maram',
    nameAr: 'بلوغ المرام',
    totalHadith: 1582,
    isPrimary: false,
    authorAr: 'الحافظ ابن حجر',
    authorEn: 'Ibn Hajar al-Asqalani',
  },
  {
    id: 'forty',
    nameEn: 'Collections of Forty',
    nameFr: 'Collections des Quarante',
    nameAr: 'مجموع الأربعينيات',
    totalHadith: 122,
    isPrimary: false,
    authorAr: 'متعدد',
    authorEn: 'Various',
  },
  {
    id: 'hisn',
    nameEn: 'Hisn al-Muslim',
    nameFr: 'Hisn al-Muslim',
    nameAr: 'حصن المسلم',
    totalHadith: 268,
    isPrimary: false,
    authorAr: 'الشيخ القحطاني',
    authorEn: 'Al-Qahtani',
  },
  {
    id: 'darimi',
    nameEn: 'Sunan ad-Darimi',
    nameFr: 'Sunan ad-Darimi',
    nameAr: 'سنن الدارمي',
    totalHadith: 3406,
    isPrimary: false,
    authorAr: 'الإمام الدارمي',
    authorEn: 'Imam ad-Darimi',
  },
  {
    id: 'virtues',
    nameEn: 'Virtues of the Quran',
    nameFr: 'Vertus du Coran',
    nameAr: 'فضائل القرآن',
    totalHadith: 93,
    isPrimary: false,
    authorAr: 'الإمام البخاري',
    authorEn: 'Imam al-Bukhari',
  },
]

// ── Headers communs ──────────────────────────────────────────

const SUNNAH_HEADERS = {
  'X-API-Key': API_KEY,
  'Accept': 'application/json',
}

// ── Utilitaire fetch ─────────────────────────────────────────

async function sunnahFetch<T>(endpoint: string, cache: RequestCache = 'no-store'): Promise<T> {
  const url = `${SUNNAH_BASE}${endpoint}`
  const res = await fetch(url, {
    headers: SUNNAH_HEADERS,
    cache,
  })

  if (!res.ok) {
    throw new Error(`Sunnah API error ${res.status}: ${url}`)
  }

  return res.json() as Promise<T>
}

// ── Fonctions publiques ──────────────────────────────────────

/**
 * Récupère toutes les collections disponibles depuis l'API
 */
export async function getCollections(): Promise<SunnahCollection[]> {
  try {
    const data = await sunnahFetch<{ data: SunnahCollection[] }>('/collections?limit=50')
    return data.data ?? []
  } catch {
    return []
  }
}

/**
 * Récupère les livres d'une collection
 * @param collection Identifiant de la collection (ex: 'bukhari')
 */
export async function getBooks(collection: string): Promise<SunnahBook[]> {
  try {
    const data = await sunnahFetch<{ data: SunnahBook[] }>(
      `/collections/${collection}/books?limit=200`,
      'force-cache'
    )
    return data.data ?? []
  } catch {
    return []
  }
}

/**
 * Récupère les hadiths d'un livre paginé
 */
export async function getHadithsInBook(
  collection: string,
  bookNumber: string,
  page = 1,
  limit = 20
): Promise<{ data: SunnahHadithDetail[]; total: number }> {
  try {
    const data = await sunnahFetch<SunnahHadithsResponse>(
      `/collections/${collection}/books/${bookNumber}/hadiths?limit=${limit}&page=${page}`
    )
    return { data: data.data ?? [], total: data.total ?? 0 }
  } catch {
    return { data: [], total: 0 }
  }
}

/**
 * Récupère un hadith individuel par son numéro dans la collection
 * ⚠️  Le corps arabe est SACRÉ — retourné sans transformation
 */
export async function getHadith(
  collection: string,
  hadithNumber: string
): Promise<SunnahHadithDetail | null> {
  try {
    const data = await sunnahFetch<SunnahHadithDetail>(
      `/collections/${collection}/hadiths/${hadithNumber}`
    )
    return data
  } catch {
    return null
  }
}

/**
 * Récupère un hadith aléatoire
 * ⚠️  Le corps arabe est SACRÉ — retourné sans transformation
 */
export async function getRandomHadith(): Promise<SunnahHadithDetail | null> {
  try {
    const data = await sunnahFetch<SunnahHadithDetail>('/hadiths/random')
    return data
  } catch {
    return null
  }
}

/**
 * Recherche de hadiths par texte
 * @param q         Terme de recherche
 * @param collection  Filtrer par collection (optionnel)
 */
export async function searchHadiths(
  q: string,
  collection?: string
): Promise<SunnahHadithDetail[]> {
  try {
    const col = collection ? `&collection=${collection}` : ''
    const encoded = encodeURIComponent(q)
    const data = await sunnahFetch<{ data: SunnahHadithDetail[]; total: number }>(
      `/hadiths?q=${encoded}&limit=20${col}`
    )
    return data.data ?? []
  } catch {
    return []
  }
}

// ── Parsing du corps arabe ───────────────────────────────────

/**
 * Parse le corps arabe d'un hadith pour extraire sanad et matn
 * ⚠️  Le texte extrait est SACRÉ — JAMAIS transformer les chaînes internes
 *
 * Exemple input:
 * <p>[prematn]سند...[/prematn][matn]متن...[/matn]</p>
 */
export function parseArabicBody(body: string): {
  prematn: string
  matn: string
  full: string
} {
  // Extraire prematn (sanad — chaîne des narrateurs)
  const prematNMatch = body.match(/\[prematn\]([\s\S]*?)\[\/prematn\]/i)
  const matnMatch = body.match(/\[matn\]([\s\S]*?)\[\/matn\]/i)

  const prematn = prematNMatch ? prematNMatch[1] : ''
  const matn = matnMatch ? matnMatch[1] : ''

  // Si pas de tags, le body entier est le matn
  const hasStructure = prematNMatch || matnMatch
  const full = hasStructure
    ? `${prematn} ${matn}`.trim()
    : body

  return { prematn, matn, full }
}

/**
 * Supprime les tags custom du corps hadith pour affichage simplifié
 * [prematn], [/prematn], [matn], [/matn], [narrator ...], [/narrator]
 * ⚠️  Le texte résiduel est SACRÉ — JAMAIS faire trim/replace sur le texte islamique
 */
export function stripHadithTags(body: string): string {
  return body
    .replace(/\[prematn\]/gi, '')
    .replace(/\[\/prematn\]/gi, '')
    .replace(/\[matn\]/gi, '')
    .replace(/\[\/matn\]/gi, '')
    .replace(/\[narrator[^\]]*\]/gi, '')
    .replace(/\[\/narrator\]/gi, '')
    .replace(/<\/?p>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
}

/**
 * Retourne la couleur Tailwind pour le grade d'un hadith
 * 'Sahih' / 'صحيح' → green
 * 'Hasan' / 'حسن'  → blue
 * "Da'if" / 'ضعيف' → red
 * autres           → slate
 */
export function getGradeColor(grade: string): string {
  const g = grade ?? ''
  if (/sahih|صحيح/i.test(g)) return '#22c55e'
  if (/hasan|حسن/i.test(g)) return '#60a5fa'
  if (/da.if|ضعيف/i.test(g)) return '#f87171'
  return '#94a3b8'
}

/**
 * Retourne le label couleur CSS pour un badge de grade
 */
export function getGradeBadgeStyle(grade: string): { color: string; background: string; border: string } {
  const g = grade ?? ''
  if (/sahih|صحيح/i.test(g)) {
    return { color: '#22c55e', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }
  }
  if (/hasan|حسن/i.test(g)) {
    return { color: '#60a5fa', background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)' }
  }
  if (/da.if|ضعيف/i.test(g)) {
    return { color: '#f87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }
  }
  return { color: '#94a3b8', background: 'rgba(148,163,184,0.06)', border: '1px solid rgba(148,163,184,0.15)' }
}

// ── Utilitaires ──────────────────────────────────────────────

/**
 * Trouve les métadonnées statiques d'une collection par son ID
 */
export function getCollectionMeta(id: string): SunnahCollectionMeta | undefined {
  return SUNNAH_COLLECTIONS.find((c) => c.id === id)
}

/**
 * Extrait le texte dans une langue depuis un hadith
 */
export function getHadithByLang(
  hadith: SunnahHadithDetail,
  lang: 'ar' | 'en'
): SunnahHadithLang | undefined {
  return hadith.hadith.find((h) => h.lang === lang)
}

/**
 * Formate la référence complète d'un hadith
 * Ex: "Sahih al-Bukhari, n° 1"
 */
export function formatSunnahRef(collectionId: string, hadithNumber: string): string {
  const meta = getCollectionMeta(collectionId)
  const name = meta?.nameEn ?? collectionId
  return `${name}, No. ${hadithNumber}`
}
