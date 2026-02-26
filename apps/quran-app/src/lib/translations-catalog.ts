// ============================================================
// translations-catalog.ts — Catalogue complet des traductions
// Source vérifiée : /api/qdc/resources/translations
// 126 traductions disponibles
// ============================================================

export interface TranslationMeta {
  id: number
  name: string
  author: string
  language: string
  languageCode: string
  flag: string
}

export interface TafsirMeta {
  id: number
  name: string
  author: string
  language: string
  languageCode: string
  flag: string
}

// ── Traductions groupées par langue ──────────────────────────

export const ALL_TRANSLATIONS: TranslationMeta[] = [
  // 🇫🇷 Français
  { id: 31,  name: 'Muhammad Hamidullah',             author: 'Hamidullah',          language: 'Français',   languageCode: 'fr', flag: '🇫🇷' },
  { id: 136, name: 'Montada Islamic Foundation',      author: 'Montada',             language: 'Français',   languageCode: 'fr', flag: '🇫🇷' },
  { id: 779, name: 'Rashid Maash',                    author: 'Rashid Maash',        language: 'Français',   languageCode: 'fr', flag: '🇫🇷' },
  // 🇬🇧 Anglais
  { id: 20,  name: 'Saheeh International',            author: 'Saheeh International',language: 'English',    languageCode: 'en', flag: '🇬🇧' },
  { id: 85,  name: 'M.A.S. Abdel Haleem',             author: 'Abdel Haleem',        language: 'English',    languageCode: 'en', flag: '🇬🇧' },
  { id: 84,  name: 'T. Usmani',                       author: 'Taqi Usmani',         language: 'English',    languageCode: 'en', flag: '🇬🇧' },
  { id: 22,  name: 'Abdullah Yusuf Ali',               author: 'Yusuf Ali',           language: 'English',    languageCode: 'en', flag: '🇬🇧' },
  { id: 19,  name: 'M. Pickthall',                    author: 'Pickthall',           language: 'English',    languageCode: 'en', flag: '🇬🇧' },
  { id: 95,  name: 'A. Maududi (Tafhim)',             author: 'Maududi',             language: 'English',    languageCode: 'en', flag: '🇬🇧' },
  { id: 203, name: 'Hilali & Khan',                   author: 'Hilali & Khan',       language: 'English',    languageCode: 'en', flag: '🇬🇧' },
  { id: 57,  name: 'Translitération',                 author: 'Transliteration',     language: 'English',    languageCode: 'en', flag: '🇬🇧' },
  // 🇸🇦 Arabe (traductions en arabe moderne)
  // 🇩🇪 Allemand
  { id: 27,  name: 'Bubenheim & Nadeem',              author: 'Bubenheim',           language: 'Deutsch',    languageCode: 'de', flag: '🇩🇪' },
  { id: 208, name: 'Abu Reda Muhammad',               author: 'Abu Reda',            language: 'Deutsch',    languageCode: 'de', flag: '🇩🇪' },
  // 🇪🇸 Espagnol
  { id: 83,  name: 'Sheikh Isa Garcia',               author: 'Isa Garcia',          language: 'Español',    languageCode: 'es', flag: '🇪🇸' },
  { id: 140, name: 'Montada (ES)',                    author: 'Montada',             language: 'Español',    languageCode: 'es', flag: '🇪🇸' },
  { id: 199, name: 'Noor International',              author: 'Noor International',  language: 'Español',    languageCode: 'es', flag: '🇪🇸' },
  // 🇵🇹 Portugais
  { id: 103, name: 'Helmi Nasr',                      author: 'Helmi Nasr',          language: 'Português',  languageCode: 'pt', flag: '🇧🇷' },
  { id: 43,  name: 'Samir El-Hayek',                  author: 'Samir El-Hayek',      language: 'Português',  languageCode: 'pt', flag: '🇧🇷' },
  // 🇷🇺 Russe
  { id: 45,  name: 'Elmir Kuliev',                    author: 'Elmir Kuliev',        language: 'Русский',    languageCode: 'ru', flag: '🇷🇺' },
  { id: 79,  name: 'Abu Adel',                        author: 'Abu Adel',            language: 'Русский',    languageCode: 'ru', flag: '🇷🇺' },
  { id: 78,  name: 'Ministry of Awqaf Egypt',         author: 'Awqaf Egypt',         language: 'Русский',    languageCode: 'ru', flag: '🇷🇺' },
  // 🇹🇷 Turc
  { id: 77,  name: 'Diyanet Isleri',                  author: 'Diyanet',             language: 'Türkçe',     languageCode: 'tr', flag: '🇹🇷' },
  { id: 52,  name: 'Elmalili Hamdi Yazir',            author: 'Hamdi Yazir',         language: 'Türkçe',     languageCode: 'tr', flag: '🇹🇷' },
  { id: 124, name: 'Muslim Shahin',                   author: 'Muslim Shahin',       language: 'Türkçe',     languageCode: 'tr', flag: '🇹🇷' },
  { id: 210, name: 'Dar Al-Salam',                    author: 'Dar Al-Salam',        language: 'Türkçe',     languageCode: 'tr', flag: '🇹🇷' },
  // 🇮🇩 Indonésien / Malais
  { id: 134, name: 'King Fahad Complex (ID)',         author: 'King Fahad',          language: 'Indonesia',  languageCode: 'id', flag: '🇮🇩' },
  { id: 141, name: 'The Sabiq Company',               author: 'Sabiq',               language: 'Indonesia',  languageCode: 'id', flag: '🇮🇩' },
  { id: 33,  name: 'Kemenag (ID)',                    author: 'Kemenag',             language: 'Indonesia',  languageCode: 'id', flag: '🇮🇩' },
  { id: 39,  name: 'Abdullah Basmeih (MY)',           author: 'Basmeih',             language: 'Melayu',     languageCode: 'ms', flag: '🇲🇾' },
  // 🇮🇷 Persan
  { id: 135, name: 'IslamHouse.com (FA)',             author: 'IslamHouse',          language: 'فارسی',      languageCode: 'fa', flag: '🇮🇷' },
  { id: 29,  name: 'Hussein Taji (FA)',               author: 'Hussein Taji',        language: 'فارسی',      languageCode: 'fa', flag: '🇮🇷' },
  // 🇵🇰 Ourdou
  { id: 54,  name: 'Maulana Junagarhi',               author: 'Junagarhi',           language: 'اردو',       languageCode: 'ur', flag: '🇵🇰' },
  { id: 234, name: 'Fatah Muhammad Jalandhari',       author: 'Jalandhari',          language: 'اردو',       languageCode: 'ur', flag: '🇵🇰' },
  { id: 97,  name: 'Syed Abu Ali Maududi',            author: 'Maududi (UR)',        language: 'اردو',       languageCode: 'ur', flag: '🇵🇰' },
  { id: 151, name: 'Shaykh al-Hind',                  author: 'Shaykh al-Hind',      language: 'اردو',       languageCode: 'ur', flag: '🇵🇰' },
  { id: 158, name: 'Dr. Israr Ahmad',                 author: 'Israr Ahmad',         language: 'اردو',       languageCode: 'ur', flag: '🇵🇰' },
  // 🇮🇳 Hindi
  { id: 122, name: 'Maulana Azizul Haque',            author: 'Azizul Haque',        language: 'हिन्दी',      languageCode: 'hi', flag: '🇮🇳' },
  // 🇨🇳 Chinois
  { id: 56,  name: 'Ma Jian',                         author: 'Ma Jian',             language: '中文',        languageCode: 'zh', flag: '🇨🇳' },
  { id: 109, name: 'Muhammad Makin',                  author: 'Muhammad Makin',      language: '中文',        languageCode: 'zh', flag: '🇨🇳' },
  // 🇯🇵 Japonais
  { id: 35,  name: 'Ryoichi Mita',                    author: 'Ryoichi Mita',        language: '日本語',       languageCode: 'ja', flag: '🇯🇵' },
  { id: 218, name: 'Saeed Sato',                      author: 'Saeed Sato',          language: '日本語',       languageCode: 'ja', flag: '🇯🇵' },
  // 🇰🇷 Coréen
  { id: 36,  name: 'Korean',                          author: 'Korean',              language: '한국어',       languageCode: 'ko', flag: '🇰🇷' },
  { id: 219, name: 'Hamed Choi',                      author: 'Hamed Choi',          language: '한국어',       languageCode: 'ko', flag: '🇰🇷' },
  // 🇧🇩 Bengali
  { id: 161, name: 'Tawheed Publication',             author: 'Tawheed',             language: 'বাংলা',       languageCode: 'bn', flag: '🇧🇩' },
  { id: 163, name: 'Darussalaam (BN)',                author: 'Darussalaam',         language: 'বাংলা',       languageCode: 'bn', flag: '🇧🇩' },
  { id: 162, name: 'Bayaan Foundation',               author: 'Bayaan',              language: 'বাংলা',       languageCode: 'bn', flag: '🇧🇩' },
  // 🇮🇹 Italien
  { id: 153, name: 'Hamza Roberto Piccardo',          author: 'Piccardo',            language: 'Italiano',   languageCode: 'it', flag: '🇮🇹' },
  { id: 209, name: 'Othman al-Sharif',                author: 'Othman al-Sharif',    language: 'Italiano',   languageCode: 'it', flag: '🇮🇹' },
  // 🇳🇱 Néerlandais
  { id: 144, name: 'Sofian S. Siregar',               author: 'Sofian Siregar',      language: 'Nederlands', languageCode: 'nl', flag: '🇳🇱' },
  { id: 235, name: 'Malak Faris',                     author: 'Malak Faris',         language: 'Nederlands', languageCode: 'nl', flag: '🇳🇱' },
  // 🇧🇦 Bosnien
  { id: 25,  name: 'Muhamed Mehanović',               author: 'Mehanović',           language: 'Bosanski',   languageCode: 'bs', flag: '🇧🇦' },
  { id: 126, name: 'Besim Korkut',                    author: 'Besim Korkut',        language: 'Bosanski',   languageCode: 'bs', flag: '🇧🇦' },
]

export const ALL_TAFSIRS: TafsirMeta[] = [
  // Arabe
  { id: 16,  name: 'التفسير الميسر',           author: 'Muyassar',        language: 'عربي',    languageCode: 'ar', flag: '🇸🇦' },
  { id: 14,  name: 'تفسير ابن كثير',           author: 'Ibn Kathir',      language: 'عربي',    languageCode: 'ar', flag: '🇸🇦' },
  { id: 91,  name: 'تفسير السعدي',             author: 'Al-Sa\'di',       language: 'عربي',    languageCode: 'ar', flag: '🇸🇦' },
  { id: 15,  name: 'تفسير الطبري',             author: 'Al-Tabari',       language: 'عربي',    languageCode: 'ar', flag: '🇸🇦' },
  { id: 90,  name: 'تفسير القرطبي',            author: 'Al-Qurtubi',      language: 'عربي',    languageCode: 'ar', flag: '🇸🇦' },
  { id: 93,  name: 'التفسير الوسيط',           author: 'Tantawi',         language: 'عربي',    languageCode: 'ar', flag: '🇸🇦' },
  { id: 94,  name: 'تفسير البغوي',             author: 'Al-Baghawi',      language: 'عربي',    languageCode: 'ar', flag: '🇸🇦' },
  // Anglais
  { id: 169, name: 'Ibn Kathir (Abridged)',    author: 'Ibn Kathir EN',   language: 'English', languageCode: 'en', flag: '🇬🇧' },
  { id: 168, name: "Ma'arif al-Qur'an",        author: "Ma'arif",         language: 'English', languageCode: 'en', flag: '🇬🇧' },
  { id: 817, name: 'Tazkirul Quran (EN)',      author: 'Wahiduddin Khan', language: 'English', languageCode: 'en', flag: '🇬🇧' },
  // Ourdou
  { id: 160, name: 'تفسیر ابن کثیر (UR)',     author: 'Ibn Kathir UR',   language: 'اردو',    languageCode: 'ur', flag: '🇵🇰' },
  { id: 157, name: 'Fi Zilal al-Quran (UR)',   author: 'Sayyid Qutb',    language: 'اردو',    languageCode: 'ur', flag: '🇵🇰' },
  { id: 159, name: 'Bayan ul Quran (UR)',      author: 'Bayan ul Quran',  language: 'اردو',    languageCode: 'ur', flag: '🇵🇰' },
  { id: 818, name: 'Tazkirul Quran (UR)',      author: 'Wahiduddin Khan', language: 'اردو',    languageCode: 'ur', flag: '🇵🇰' },
  // Russe
  { id: 170, name: 'Al-Sa\'di (RU)',           author: 'Al-Saadi RU',     language: 'Русский', languageCode: 'ru', flag: '🇷🇺' },
  // Bengali
  { id: 381, name: 'Fathul Majid (BN)',        author: 'Fathul Majid',    language: 'বাংলা',   languageCode: 'bn', flag: '🇧🇩' },
  { id: 165, name: 'Ahsanul Bayaan (BN)',      author: 'Ahsanul Bayaan',  language: 'বাংলা',   languageCode: 'bn', flag: '🇧🇩' },
  { id: 166, name: 'Abu Bakr Zakaria (BN)',    author: 'Abu Bakr Zakaria',language: 'বাংলা',   languageCode: 'bn', flag: '🇧🇩' },
  { id: 164, name: 'Ibn Kathir (BN)',          author: 'Ibn Kathir BN',   language: 'বাংলা',   languageCode: 'bn', flag: '🇧🇩' },
  // Kurde
  { id: 804, name: 'Rebar Kurdish Tafsir',     author: 'Rebar Kurdish',   language: 'Kurdish', languageCode: 'ku', flag: '🏔️' },
]

// Grouper par langue
export function groupByLanguage<T extends { language: string; languageCode: string }>(items: T[]): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    if (!acc[item.language]) acc[item.language] = []
    acc[item.language].push(item)
    return acc
  }, {})
}

// Traductions populaires (sélectionnées par défaut)
export const DEFAULT_TRANSLATIONS = [31, 20] // Hamidullah FR + Saheeh EN

// Traductions FR par défaut
export const FR_TRANSLATIONS = [31, 136, 779]
// Traductions EN par défaut
export const EN_TRANSLATIONS = [20, 85, 84, 22, 19]
