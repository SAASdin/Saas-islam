// ============================================================
// types/quran.ts — Types pour les données coraniques
// ⚠️  Ces types reflètent EXACTEMENT la structure de la BDD
//     Ne jamais modifier les champs du texte coranique
// ============================================================

export type RevelationType = 'mecquoise' | 'médinoise'

// Sourate
export interface Surah {
  id: number              // 1 à 114
  nameArabic: string      // اسم السورة — READ ONLY
  nameTransliteration: string
  nameFrench: string
  nameEnglish: string
  revelationType: RevelationType
  ayahCount: number
  juzStart: number
  pageMushaf: number
  hasBismillah: boolean   // FALSE pour At-Tawbah (sourate 9)
}

// Verset
export interface Ayah {
  id: number
  surahId: number
  ayahNumber: number      // Numéro dans la sourate
  ayahNumberQuran: number // Numéro global (1-6236)
  textUthmani: string     // ⚠️ TEXTE SACRÉ — JAMAIS MODIFIER
  textSimple: string      // ⚠️ TEXTE SACRÉ — JAMAIS MODIFIER
  juz: number
  hizb: number
  rub: number
  pageMushaf: number
  sajda: boolean
  sajdaType?: 'recommended' | 'obligatory'
}

// Traduction d'un verset
export interface AyahTranslation {
  id: number
  ayahId: number
  languageCode: string    // 'fr', 'en'...
  translatorName: string
  translatorKey: string
  translation: string     // ⚠️ Traduction VALIDÉE — READ ONLY
  isValidated: boolean
}

// Traduction automatique (Video Translator service)
// ⚠️  TOUJOURS afficher le badge "traduction automatique non vérifiée"
export interface AutoTranslation {
  text: string
  languageCode: string
  isVerified: false       // Toujours false pour les trad auto
  service: 'deepl' | 'gpt4'
}

// Tafsir
export interface Tafsir {
  id: number
  ayahId: number
  tafsirName: string      // 'Ibn Kathir', 'As-Saadi'...
  tafsirKey: string
  languageCode: string
  content: string         // ⚠️ Contenu SACRÉ — READ ONLY
}

// Verset avec traduction (pour affichage)
export interface AyahWithTranslation extends Ayah {
  surah?: Pick<Surah, 'nameArabic' | 'nameTransliteration' | 'nameFrench'>
  translation?: AyahTranslation
  tafsir?: Tafsir
}

// Réponse API AlQuran.cloud (source externe)
export interface AlQuranApiSurah {
  number: number
  name: string            // Nom arabe
  englishName: string
  englishNameTranslation: string
  revelationType: string
  numberOfAyahs: number
}

export interface AlQuranApiAyah {
  number: number          // Numéro global
  text: string            // Texte arabe — READ ONLY
  numberInSurah: number
  juz: number
  manzil: number
  page: number
  ruku: number
  hizbQuarter: number
  sajda: boolean | { id: number; recommended: boolean; obligatory: boolean }
  surah?: AlQuranApiSurah
}

// Paramètres de lecture
export interface ReadingSettings {
  font: 'kfgqpc' | 'amiri' | 'scheherazade'
  fontSize: number        // En rem (min 1.0 = 16px)
  translationKey?: string
  tafsirKey?: string
  showTransliteration: boolean
  theme: 'light' | 'dark' | 'sepia'
}

// Référence coranique (affichage)
export function formatAyahRef(surahName: string, surahId: number, ayahNumber: number): string {
  return `${surahName} ${surahId}:${ayahNumber}`
}
