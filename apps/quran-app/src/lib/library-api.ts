// ============================================================
// lib/library-api.ts — Données bibliothèque islamique
// Équivalent web de المكتبة الشاملة (Shamela) + تراث (Turath)
// Sources : Open Islamic Data + données statiques curatées
// ⚠️  Les textes classiques sont sacrés — lire sans modifier
// ============================================================

// ── Types ────────────────────────────────────────────────────

export interface LibraryCategory {
  id: string
  nameAr: string
  nameFr: string
  icon: string
  bookCount: number
  description: string
}

export interface LibraryBook {
  id: string
  titleAr: string
  titleFr?: string
  authorAr: string
  authorFr?: string
  categoryId: string
  pages?: number
  volumes?: number
  year?: string           // ex: '1402 هـ'
  publisher?: string
  description?: string
  shamela_id?: number     // ID dans Shamela pour lien externe
  openlib_id?: string     // Open Library ID si disponible
  isOpenAccess: boolean
}

// ── Catégories de la bibliothèque islamique ──────────────────

export const LIBRARY_CATEGORIES: LibraryCategory[] = [
  {
    id: 'quran',
    nameAr: 'القرآن وعلومه',
    nameFr: 'Coran et ses sciences',
    icon: '📖',
    bookCount: 1240,
    description: 'Tafsir, sciences du Coran, qira\'at, i\'jaz, etc.',
  },
  {
    id: 'hadith',
    nameAr: 'الحديث وعلومه',
    nameFr: 'Hadith et ses sciences',
    icon: '📜',
    bookCount: 890,
    description: 'Kutub al-sitta, musanafat, sharh, rijal, etc.',
  },
  {
    id: 'fiqh',
    nameAr: 'الفقه وأصوله',
    nameFr: 'Fiqh et Usul al-Fiqh',
    icon: '⚖️',
    bookCount: 2100,
    description: 'Les 4 madhahib : Hanafi, Maliki, Shafi\'i, Hanbali',
  },
  {
    id: 'aqida',
    nameAr: 'العقيدة',
    nameFr: 'Aqida (Théologie)',
    icon: '🌙',
    bookCount: 560,
    description: 'Tawhid, Ash\'ari, Maturidi, Athari',
  },
  {
    id: 'sira',
    nameAr: 'السيرة والتاريخ',
    nameFr: 'Sira et Histoire',
    icon: '🏛️',
    bookCount: 430,
    description: 'Sira du Prophète ﷺ, histoire islamique, biographies',
  },
  {
    id: 'tasawwuf',
    nameAr: 'التزكية والأخلاق',
    nameFr: 'Purification & Éthique',
    icon: '🌿',
    bookCount: 320,
    description: 'Ihya\' Ulum al-Din, Rissala Qushayriyya, etc.',
  },
  {
    id: 'lughah',
    nameAr: 'اللغة العربية',
    nameFr: 'Langue arabe',
    icon: '✍️',
    bookCount: 780,
    description: 'Grammaire, morphologie, rhétorique, lexique',
  },
  {
    id: 'general',
    nameAr: 'متنوع',
    nameFr: 'Divers',
    icon: '📚',
    bookCount: 2500,
    description: 'Encyclopédies, anthologies, ouvrages généraux',
  },
]

// ── Livres classiques de référence (données statiques) ───────
// Sélection des œuvres les plus importantes — curatée manuellement

export const FEATURED_BOOKS: LibraryBook[] = [
  // Tafsir
  {
    id: 'tafsir-ibn-kathir',
    titleAr: 'تفسير القرآن العظيم',
    titleFr: 'Tafsir Ibn Kathir',
    authorAr: 'ابن كثير الدمشقي',
    authorFr: 'Ibn Kathir al-Dimashqi',
    categoryId: 'quran',
    volumes: 8,
    year: '774 هـ',
    isOpenAccess: true,
    description: 'Le tafsir le plus utilisé dans le monde sunnite — méthode bi\'l-ma\'thur',
  },
  {
    id: 'tafsir-tabari',
    titleAr: 'جامع البيان في تأويل القرآن',
    titleFr: 'Jami\' al-Bayan de al-Tabari',
    authorAr: 'ابن جرير الطبري',
    authorFr: 'Muhammad ibn Jarir al-Tabari',
    categoryId: 'quran',
    volumes: 30,
    year: '310 هـ',
    isOpenAccess: true,
    description: 'Le plus grand tafsir du Coran — encyclopédique et fondateur',
  },
  {
    id: 'tafsir-muyassar',
    titleAr: 'التفسير الميسر',
    titleFr: 'Al-Tafsir al-Muyassar',
    authorAr: 'مجمع الملك فهد',
    categoryId: 'quran',
    pages: 604,
    isOpenAccess: true,
    description: 'Tafsir simplifié du Complexe du Roi Fahd — recommandé pour débutants',
  },

  // Hadith
  {
    id: 'sahih-bukhari',
    titleAr: 'الجامع المسند الصحيح',
    titleFr: 'Sahih al-Bukhari',
    authorAr: 'محمد بن إسماعيل البخاري',
    authorFr: 'Muhammad ibn Ismail al-Bukhari',
    categoryId: 'hadith',
    volumes: 9,
    year: '256 هـ',
    isOpenAccess: true,
    description: 'Le recueil le plus authentique de hadiths après le Coran',
  },
  {
    id: 'sahih-muslim',
    titleAr: 'المسند الصحيح',
    titleFr: 'Sahih Muslim',
    authorAr: 'مسلم بن الحجاج النيسابوري',
    categoryId: 'hadith',
    volumes: 8,
    year: '261 هـ',
    isOpenAccess: true,
    description: 'Deuxième recueil le plus authentique — organisation thématique exemplaire',
  },
  {
    id: 'riyadh-salihin',
    titleAr: 'رياض الصالحين',
    titleFr: 'Riyadh al-Salihin',
    authorAr: 'يحيى بن شرف النووي',
    authorFr: 'Yahya ibn Sharaf al-Nawawi',
    categoryId: 'hadith',
    pages: 600,
    year: '676 هـ',
    isOpenAccess: true,
    description: 'Anthologie thématique accessible — idéale pour lecture quotidienne',
  },

  // Fiqh
  {
    id: 'minhaj-talibin',
    titleAr: 'منهاج الطالبين',
    titleFr: 'Minhaj al-Talibin',
    authorAr: 'يحيى بن شرف النووي',
    categoryId: 'fiqh',
    pages: 450,
    year: '676 هـ',
    isOpenAccess: true,
    description: 'Manuel de référence du madhab Shafi\'i',
  },
  {
    id: 'bidayat-mujtahid',
    titleAr: 'بداية المجتهد ونهاية المقتصد',
    titleFr: 'Bidayat al-Mujtahid',
    authorAr: 'ابن رشد القرطبي',
    authorFr: 'Ibn Rushd al-Qurtubi (Averroès)',
    categoryId: 'fiqh',
    volumes: 2,
    year: '595 هـ',
    isOpenAccess: true,
    description: 'Droit comparé des 4 madhahib — référence absolue',
  },
  {
    id: 'fiqh-sunnah',
    titleAr: 'فقه السنة',
    titleFr: 'Fiqh al-Sunnah',
    authorAr: 'سيد سابق',
    authorFr: 'Sayyid Sabiq',
    categoryId: 'fiqh',
    volumes: 3,
    isOpenAccess: true,
    description: 'Référence fiqh moderne accessible — basée sur les preuves textuelles',
  },

  // Aqida
  {
    id: 'aqida-tahawiyya',
    titleAr: 'العقيدة الطحاوية',
    titleFr: 'Al-Aqida al-Tahawiyya',
    authorAr: 'أبو جعفر الطحاوي',
    categoryId: 'aqida',
    pages: 120,
    year: '321 هـ',
    isOpenAccess: true,
    description: 'Le texte de référence en aqida pour les trois grandes écoles',
  },
  {
    id: 'ihya-ulum',
    titleAr: 'إحياء علوم الدين',
    titleFr: 'Ihya\' Ulum al-Din',
    authorAr: 'أبو حامد الغزالي',
    authorFr: 'Abu Hamid al-Ghazali',
    categoryId: 'tasawwuf',
    volumes: 4,
    year: '505 هـ',
    isOpenAccess: true,
    description: 'Chef-d\'œuvre de la spiritualité islamique — encyclopédie du cœur',
  },

  // Sira
  {
    id: 'sira-ibn-hisham',
    titleAr: 'السيرة النبوية',
    titleFr: 'Sira de Ibn Hisham',
    authorAr: 'ابن هشام المعافري',
    categoryId: 'sira',
    volumes: 4,
    year: '218 هـ',
    isOpenAccess: true,
    description: 'La Sira du Prophète ﷺ — référence biographique fondamentale',
  },
]

// ── Fonctions ────────────────────────────────────────────────

export function getAllCategories(): LibraryCategory[] {
  return LIBRARY_CATEGORIES
}

export function getCategoryById(id: string): LibraryCategory | undefined {
  return LIBRARY_CATEGORIES.find(c => c.id === id)
}

export function getFeaturedBooks(categoryId?: string): LibraryBook[] {
  if (categoryId) {
    return FEATURED_BOOKS.filter(b => b.categoryId === categoryId)
  }
  return FEATURED_BOOKS
}

export function getBookById(id: string): LibraryBook | undefined {
  return FEATURED_BOOKS.find(b => b.id === id)
}

/**
 * Construire l'URL Shamela pour un livre si on a son ID
 */
export function getShamela_url(shamelaId: number): string {
  return `https://shamela.ws/book/${shamelaId}`
}

/**
 * Construire l'URL PDF Waqfeya/IA si disponible
 */
export function getOpenAccessUrl(bookId: string): string | null {
  // À enrichir avec de vraies URLs après validation
  return null
}
