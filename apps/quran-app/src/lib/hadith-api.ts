// ============================================================
// lib/hadith-api.ts — Client API Hadiths
// Source : api.hadith.gading.dev
// ⚠️  RÈGLES ABSOLUES :
//   - Texte arabe des hadiths : JAMAIS modifier, trim, replace
//   - dir="rtl" lang="ar" OBLIGATOIRES sur tout texte arabe
//   - Traduction non validée → badge obligatoire
//   - Données en lecture seule
// ============================================================

// ── Base URL ─────────────────────────────────────────────────
const HADITH_API_BASE = 'https://api.hadith.gading.dev'

// ── Types internes ───────────────────────────────────────────

export interface HadithBook {
  id: string              // Identifiant API (ex: 'bukhari')
  name: string            // Nom affiché (ex: 'Sahih al-Bukhari')
  nameFr: string          // Nom français
  nameArabic: string      // Nom arabe — ⚠️ SACRÉ
  totalHadiths: number    // Nombre total de hadiths
  available: boolean      // Si l'API renvoie des données
}

export interface HadithChapter {
  id: number
  nameArabic: string      // ⚠️ SACRÉ — jamais transformer
  nameTranslation?: string
}

export interface HadithItem {
  number: number
  arab: string            // ⚠️ TEXTE SACRÉ — jamais transformer
  id: string              // Identifiant de la collection
}

export interface HadithBookDetail {
  name: string
  id: string
  available: number
  requested: number
  hadiths: HadithItem[]
}

// ── Métadonnées statiques des collections ───────────────────
// Les données dynamiques viennent de l'API, les métadonnées connues sont préchargées

export const HADITH_COLLECTIONS: HadithBook[] = [
  {
    id: 'bukhari',
    name: 'Sahih al-Bukhari',
    nameFr: 'Sahih Boukhari',
    nameArabic: 'صحيح البخاري',
    totalHadiths: 7563,
    available: true,
  },
  {
    id: 'muslim',
    name: 'Sahih Muslim',
    nameFr: 'Sahih Muslim',
    nameArabic: 'صحيح مسلم',
    totalHadiths: 3033,
    available: true,
  },
  {
    id: 'abu-dawud',
    name: 'Sunan Abu Dawud',
    nameFr: 'Sunan Abou Dawoud',
    nameArabic: 'سنن أبي داود',
    totalHadiths: 5274,
    available: true,
  },
  {
    id: 'tirmidzi',
    name: 'Jami at-Tirmidhi',
    nameFr: 'Sunan Tirmidhi',
    nameArabic: 'جامع الترمذي',
    totalHadiths: 3956,
    available: true,
  },
  {
    id: 'nasai',
    name: "Sunan an-Nasa'i",
    nameFr: "Sunan an-Nasa'i",
    nameArabic: 'سنن النسائي',
    totalHadiths: 5761,
    available: true,
  },
  {
    id: 'ibnu-majah',
    name: 'Sunan Ibn Majah',
    nameFr: 'Sunan Ibn Majah',
    nameArabic: 'سنن ابن ماجه',
    totalHadiths: 4341,
    available: true,
  },
  {
    id: 'malik',
    name: 'Muwatta Malik',
    nameFr: 'Muwatta Malik',
    nameArabic: 'موطأ مالك',
    totalHadiths: 1857,
    available: true,
  },
  {
    id: 'riyadhussalihin',
    name: "Riyadh as-Salihin",
    nameFr: 'Riyadh as-Salihin',
    nameArabic: 'رياض الصالحين',
    totalHadiths: 1900,
    available: true,
  },
]

// ── Utilitaire fetch avec cache Next.js ─────────────────────

async function hadithFetch<T>(endpoint: string, revalidate = 86400): Promise<T> {
  const url = `${HADITH_API_BASE}${endpoint}`

  const res = await fetch(url, {
    next: { revalidate },
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) {
    throw new Error(`Hadith API error ${res.status}: ${endpoint}`)
  }

  return res.json() as Promise<T>
}

// ── Réponse API gading.dev ───────────────────────────────────

interface GadingBooksResponse {
  code: number
  message: string
  data: Array<{
    id: string
    name: string
    available: number
  }>
}

interface GadingBookResponse {
  code: number
  message: string
  data: {
    name: string
    id: string
    available: number
    requested: number
    hadiths: HadithItem[]
  }
}

// ── Fonctions publiques ──────────────────────────────────────

/**
 * Récupère la liste de toutes les collections disponibles
 * Fusionne avec nos métadonnées (nom arabe, nom français, total)
 */
export async function getBooks(): Promise<HadithBook[]> {
  try {
    const data = await hadithFetch<GadingBooksResponse>('/books')
    if (data.code !== 200) return HADITH_COLLECTIONS

    // Enrichir avec les données de l'API
    return HADITH_COLLECTIONS.map((col) => {
      const fromApi = data.data.find((b) => b.id === col.id)
      return fromApi ? { ...col, available: fromApi.available > 0 } : col
    })
  } catch {
    // En cas d'erreur API, retourner les métadonnées statiques
    return HADITH_COLLECTIONS
  }
}

/**
 * Récupère les détails d'une collection (liste de hadiths par page)
 * @param bookId Identifiant de la collection (ex: 'bukhari')
 * @param range  Plage de hadiths à récupérer (ex: '1-50')
 */
export async function getBook(
  bookId: string,
  range: string = '1-20'
): Promise<HadithBookDetail | null> {
  try {
    const data = await hadithFetch<GadingBookResponse>(`/books/${bookId}?range=${range}`)
    if (data.code !== 200) return null
    return data.data
  } catch {
    return null
  }
}

/**
 * Récupère un hadith spécifique
 * ⚠️  Le texte arab est SACRÉ — retourné tel quel, sans transformation
 * @param bookId       Identifiant de la collection
 * @param hadithNumber Numéro du hadith dans la collection
 */
export async function getHadith(
  bookId: string,
  hadithNumber: number
): Promise<HadithItem | null> {
  try {
    const data = await hadithFetch<GadingBookResponse>(
      `/books/${bookId}?range=${hadithNumber}-${hadithNumber}`
    )
    if (data.code !== 200 || !data.data.hadiths.length) return null
    return data.data.hadiths[0] // ⚠️ Texte sacré — retourné sans transformation
  } catch {
    return null
  }
}

/**
 * Trouve les métadonnées d'une collection par son ID
 */
export function getCollectionMeta(bookId: string): HadithBook | undefined {
  return HADITH_COLLECTIONS.find((c) => c.id === bookId)
}

/**
 * Formatte la référence complète d'un hadith
 * Ex: "Sahih al-Bukhari, n° 1"
 */
export function formatHadithRef(bookName: string, hadithNumber: number): string {
  return `${bookName}, n° ${hadithNumber}`
}
