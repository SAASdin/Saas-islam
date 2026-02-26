// ============================================================
// tafsir-books-api.ts — Client pour spa5k/tafsir_api (GitHub)
// URL: raw.githubusercontent.com/spa5k/tafsir_api/main/tafsir/{slug}/{surah}/{ayah}.json
// 29 livres disponibles, données SACRÉES — lecture seule
// ============================================================

const BASE = 'https://raw.githubusercontent.com/spa5k/tafsir_api/main/tafsir'

// ── Catalogue complet des 29 livres ──────────────────────────────────────────

export interface TafsirBook {
  slug: string
  name: string
  nameAr: string
  author: string
  authorAr: string
  died: string      // année hijri
  lang: string
  langCode: string
  flag: string
  category: TafsirCategory
  volumes: string   // ex: "٢٨ مجلدًا"
}

export type TafsirCategory =
  | 'ummahat'       // أمّهات
  | 'jam3-aqwal'    // جمع الأقوال
  | 'muntaqat'      // منتقاة
  | 'amma'          // عامّة
  | 'lugha'         // لغة وبلاغة
  | 'mu3asira'      // معاصرة
  | 'mukhtasara'    // مركّزة العبارة
  | 'athar'         // آثار
  | 'ulum'          // علوم القرآن
  | 'en'            // Anglais
  | 'ur'            // Ourdou
  | 'bn'            // Bengali
  | 'ru'            // Russe
  | 'kurd'          // Kurde

export const TAFSIR_BOOKS: TafsirBook[] = [
  // ── أمّهات (Grands classiques) ─────────────────────────────────────────────
  {
    slug: 'ar-tafsir-al-tabari',
    name: 'جامع البيان', nameAr: 'جامع البيان في تأويل القرآن',
    author: 'Ibn Jarir al-Tabari', authorAr: 'ابن جرير الطبري',
    died: '٣١٠ هـ', lang: 'عربي', langCode: 'ar', flag: '🇸🇦',
    category: 'ummahat', volumes: '٢٨ مجلدًا',
  },
  {
    slug: 'ar-tafsir-ibn-kathir',
    name: 'تفسير القرآن العظيم', nameAr: 'تفسير القرآن العظيم',
    author: 'Ibn Kathir', authorAr: 'ابن كثير',
    died: '٧٧٤ هـ', lang: 'عربي', langCode: 'ar', flag: '🇸🇦',
    category: 'ummahat', volumes: '١٩ مجلدًا',
  },
  {
    slug: 'ar-tafseer-al-qurtubi',
    name: 'الجامع لأحكام القرآن', nameAr: 'الجامع لأحكام القرآن',
    author: 'Al-Qurtubi', authorAr: 'القرطبي',
    died: '٦٧١ هـ', lang: 'عربي', langCode: 'ar', flag: '🇸🇦',
    category: 'ummahat', volumes: '٢٤ مجلدًا',
  },
  {
    slug: 'ar-tafsir-al-baghawi',
    name: 'معالم التنزيل', nameAr: 'معالم التنزيل',
    author: 'Al-Baghawi', authorAr: 'البغوي',
    died: '٥١٦ هـ', lang: 'عربي', langCode: 'ar', flag: '🇸🇦',
    category: 'ummahat', volumes: '١١ مجلدًا',
  },
  // ── جمع الأقوال ────────────────────────────────────────────────────────────
  {
    slug: 'ar-tafseer-al-saddi',
    name: 'تيسير الكريم الرحمن', nameAr: 'تيسير الكريم الرحمن',
    author: "Al-Sa'di", authorAr: 'السعدي',
    died: '١٣٧٦ هـ', lang: 'عربي', langCode: 'ar', flag: '🇸🇦',
    category: 'mu3asira', volumes: '٤ مجلدات',
  },
  {
    slug: 'ar-tafsir-muyassar',
    name: 'التفسير الميسر', nameAr: 'التفسير الميسر',
    author: 'Majma Malik Fahd', authorAr: 'مجمع الملك فهد',
    died: 'معاصر', lang: 'عربي', langCode: 'ar', flag: '🇸🇦',
    category: 'mu3asira', volumes: 'مجلد',
  },
  {
    slug: 'ar-tafsir-al-wasit',
    name: 'التفسير الوسيط', nameAr: 'التفسير الوسيط',
    author: 'Tantawi', authorAr: 'الطنطاوي',
    died: 'معاصر', lang: 'عربي', langCode: 'ar', flag: '🇸🇦',
    category: 'amma', volumes: '١٥ مجلدًا',
  },
  {
    slug: 'ar-tafseer-tanwir-al-miqbas',
    name: 'تنوير المقباس', nameAr: 'تنوير المقباس من تفسير ابن عباس',
    author: 'Ibn Abbas / Al-Fayruzabadi', authorAr: 'ابن عباس',
    died: '٨١٧ هـ', lang: 'عربي', langCode: 'ar', flag: '🇸🇦',
    category: 'amma', volumes: 'مجلد',
  },
  // ── Anglais ────────────────────────────────────────────────────────────────
  {
    slug: 'en-tafisr-ibn-kathir',
    name: 'Ibn Kathir (Abridged)', nameAr: 'ابن كثير (مختصر)',
    author: 'Ibn Kathir (EN)', authorAr: 'ابن كثير',
    died: '٧٧٤ هـ', lang: 'English', langCode: 'en', flag: '🇬🇧',
    category: 'en', volumes: '~10 vols',
  },
  {
    slug: 'en-tafsir-maarif-ul-quran',
    name: "Ma'arif al-Qur'an", nameAr: 'معارف القرآن',
    author: 'Mufti Muhammad Shafi', authorAr: 'مفتي محمد شفيع',
    died: '١٣٩٦ هـ', lang: 'English', langCode: 'en', flag: '🇬🇧',
    category: 'en', volumes: '~8 vols',
  },
  {
    slug: 'en-tafsir-ibn-abbas',
    name: 'Tafsir Ibn Abbas (EN)', nameAr: 'تفسير ابن عباس',
    author: 'Ibn Abbas', authorAr: 'ابن عباس',
    died: '٦٨ هـ', lang: 'English', langCode: 'en', flag: '🇬🇧',
    category: 'en', volumes: '1 vol',
  },
  {
    slug: 'en-tazkirul-quran',
    name: 'Tazkirul Quran', nameAr: 'تذكير القرآن',
    author: 'Wahiduddin Khan', authorAr: 'وحيد الدين خان',
    died: '١٤٤٢ هـ', lang: 'English', langCode: 'en', flag: '🇬🇧',
    category: 'en', volumes: '1 vol',
  },
  {
    slug: 'en-al-jalalayn',
    name: 'Tafsir al-Jalalayn (EN)', nameAr: 'تفسير الجلالين',
    author: 'Al-Jalalayn', authorAr: 'الجلالين',
    died: '٩١١ هـ', lang: 'English', langCode: 'en', flag: '🇬🇧',
    category: 'en', volumes: '1 vol',
  },
  {
    slug: 'en-asbab-al-nuzul-by-al-wahidi',
    name: 'Asbab al-Nuzul', nameAr: 'أسباب النزول',
    author: 'Al-Wahidi', authorAr: 'الواحدي',
    died: '٤٦٨ هـ', lang: 'English', langCode: 'en', flag: '🇬🇧',
    category: 'ulum', volumes: '1 vol',
  },
  {
    slug: 'en-al-qushairi-tafsir',
    name: "Lata'if al-Isharat (Al-Qushayri)", nameAr: 'لطائف الإشارات',
    author: 'Al-Qushayri', authorAr: 'القشيري',
    died: '٤٦٥ هـ', lang: 'English', langCode: 'en', flag: '🇬🇧',
    category: 'en', volumes: '3 vols',
  },
  {
    slug: 'en-kashani-tafsir',
    name: "Tafsir al-Kashani", nameAr: 'تفسير الكاشاني',
    author: 'Kashani', authorAr: 'الكاشاني',
    died: '٧٣٠ هـ', lang: 'English', langCode: 'en', flag: '🇬🇧',
    category: 'en', volumes: '2 vols',
  },
  {
    slug: 'en-kashf-al-asrar-tafsir',
    name: 'Kashf al-Asrar', nameAr: 'كشف الأسرار',
    author: 'Rashid al-Din Maybudi', authorAr: 'ميبدي',
    died: '٥٣٠ هـ', lang: 'English', langCode: 'en', flag: '🇬🇧',
    category: 'en', volumes: '~3 vols',
  },
  {
    slug: 'en-tafsir-al-tustari',
    name: 'Tafsir al-Tustari', nameAr: 'تفسير التستري',
    author: 'Sahl al-Tustari', authorAr: 'سهل التستري',
    died: '٢٨٣ هـ', lang: 'English', langCode: 'en', flag: '🇬🇧',
    category: 'en', volumes: '1 vol',
  },
  {
    slug: 'kashf-al-asrar-tafsir',
    name: 'Kashf al-Asrar (AR/FA)', nameAr: 'كشف الأسرار',
    author: 'Maybudi', authorAr: 'ميبدي',
    died: '٥٣٠ هـ', lang: 'فارسی/عربي', langCode: 'fa', flag: '🇮🇷',
    category: 'amma', volumes: '٣ مجلدات',
  },
  // ── Ourdou ────────────────────────────────────────────────────────────────
  {
    slug: 'ur-tafseer-ibn-e-kaseer',
    name: 'تفسیر ابن کثیر (اردو)', nameAr: 'تفسير ابن كثير',
    author: 'Ibn Kathir (UR)', authorAr: 'ابن كثير',
    died: '٧٧٤ هـ', lang: 'اردو', langCode: 'ur', flag: '🇵🇰',
    category: 'ur', volumes: '~10 vols',
  },
  {
    slug: 'ur-tafsir-bayan-ul-quran',
    name: 'بیان القرآن (اردو)', nameAr: 'بيان القرآن',
    author: 'Ashraf Ali Thanwi', authorAr: 'أشرف علي ثانوي',
    died: '١٣٦٢ هـ', lang: 'اردو', langCode: 'ur', flag: '🇵🇰',
    category: 'ur', volumes: '~12 vols',
  },
  {
    slug: 'ur-tazkirul-quran',
    name: 'تذکیر القرآن (اردو)', nameAr: 'تذكير القرآن',
    author: 'Wahiduddin Khan (UR)', authorAr: 'وحيد الدين خان',
    died: '١٤٤٢ هـ', lang: 'اردو', langCode: 'ur', flag: '🇵🇰',
    category: 'ur', volumes: '1 vol',
  },
  // ── Bengali ────────────────────────────────────────────────────────────────
  {
    slug: 'bn-tafisr-fathul-majid',
    name: 'তাফসীর ফাতহুল মাজীদ', nameAr: 'تفسير فتح المجيد',
    author: 'AbdulRahman Al-Alshaikh', authorAr: 'عبدالرحمن بن حسن آل الشيخ',
    died: '٢٠١٨', lang: 'বাংলা', langCode: 'bn', flag: '🇧🇩',
    category: 'bn', volumes: '~5 vols',
  },
  {
    slug: 'bn-tafseer-ibn-e-kaseer',
    name: 'তাফসীর ইবনে কাসীর', nameAr: 'تفسير ابن كثير',
    author: 'Ibn Kathir (BN)', authorAr: 'ابن كثير',
    died: '٧٧٤ هـ', lang: 'বাংলা', langCode: 'bn', flag: '🇧🇩',
    category: 'bn', volumes: '~10 vols',
  },
  {
    slug: 'bn-tafsir-abu-bakr-zakaria',
    name: 'তাফসীর আবু বকর যাকারিয়া', nameAr: 'تفسير أبو بكر زكريا',
    author: 'Abu Bakr Zakaria', authorAr: 'أبو بكر زكريا',
    died: 'معاصر', lang: 'বাংলা', langCode: 'bn', flag: '🇧🇩',
    category: 'bn', volumes: '~5 vols',
  },
  {
    slug: 'bn-tafsir-ahsanul-bayaan',
    name: 'তাফসীর আহসানুল বায়ান', nameAr: 'تفسير أحسن البيان',
    author: 'Salahuddin Yusuf', authorAr: 'صلاح الدين يوسف',
    died: 'معاصر', lang: 'বাংলা', langCode: 'bn', flag: '🇧🇩',
    category: 'bn', volumes: '~3 vols',
  },
  // ── Russe ────────────────────────────────────────────────────────────────
  {
    slug: 'ru-tafseer-al-saddi',
    name: "Tafseer Al-Sa'di (RU)", nameAr: 'تفسير السعدي',
    author: "Al-Sa'di (RU)", authorAr: 'السعدي',
    died: '١٣٧٦ هـ', lang: 'Русский', langCode: 'ru', flag: '🇷🇺',
    category: 'ru', volumes: '~3 vols',
  },
  // ── Kurde ────────────────────────────────────────────────────────────────
  {
    slug: 'kurd-tafsir-rebar',
    name: 'Rebar Kurdish Tafsir', nameAr: 'تفسير ريبر الكردي',
    author: 'Rebar Kurdish', authorAr: 'ريبر كردي',
    died: 'معاصر', lang: 'Kurdish', langCode: 'ku', flag: '🏔️',
    category: 'kurd', volumes: '1 vol',
  },
]

// ── Types de catégories en Français ──────────────────────────────────────────
export const CATEGORY_LABELS: Record<TafsirCategory, string> = {
  ummahat: 'أمّهات — Grands Classiques',
  'jam3-aqwal': 'جمع الأقوال',
  muntaqat: 'منتقاة',
  amma: 'عامّة',
  lugha: 'لغة وبلاغة',
  mu3asira: 'معاصرة',
  mukhtasara: 'مركَّزة العبارة',
  athar: 'آثار',
  ulum: 'علوم القرآن',
  en: '🇬🇧 English',
  ur: '🇵🇰 اردو',
  bn: '🇧🇩 বাংলা',
  ru: '🇷🇺 Русский',
  kurd: '🏔️ Kurdish',
}

// ── Fetch d'un verset dans un tafsir ─────────────────────────────────────────

const _cache: Record<string, string> = {}

export async function fetchTafsirVerse(
  slug: string,
  surah: number,
  ayah: number
): Promise<string | null> {
  const key = `${slug}/${surah}/${ayah}`
  if (_cache[key]) return _cache[key]

  try {
    const url = `${BASE}/${slug}/${surah}/${ayah}.json`
    const res = await fetch(url, { next: { revalidate: 86400 * 30 } })
    if (!res.ok) return null
    const data = await res.json()
    const text: string = data.text ?? data.content ?? ''
    if (!text) return null
    _cache[key] = text
    return text
  } catch {
    return null
  }
}

// Grouper les livres par catégorie
export function groupBooksByCategory(books: TafsirBook[]): Record<TafsirCategory, TafsirBook[]> {
  return books.reduce<Record<string, TafsirBook[]>>((acc, book) => {
    if (!acc[book.category]) acc[book.category] = []
    acc[book.category].push(book)
    return acc
  }, {} as Record<TafsirCategory, TafsirBook[]>)
}

// Ordre des catégories pour l'affichage
export const CATEGORY_ORDER: TafsirCategory[] = [
  'ummahat', 'jam3-aqwal', 'amma', 'mu3asira', 'muntaqat',
  'lugha', 'mukhtasara', 'athar', 'ulum',
  'en', 'ur', 'bn', 'ru', 'kurd',
]
