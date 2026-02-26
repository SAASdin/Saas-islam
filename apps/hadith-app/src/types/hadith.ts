// ─── Types Hadith ──────────────────────────────────────────
// Miroir exact de la structure sunnah.com + BDD sacrée

export interface HadithCollection {
  id: number;
  collection_key: string;
  name_arabic: string;
  name_french: string;
  name_english: string;
  author: string;
  death_year_hijri: number | null;
  total_hadiths: number;
}

export interface HadithBook {
  id: number;
  collection_id: number;
  book_number: string;
  name_arabic: string | null;
  name_english: string | null;
  total_hadiths: number;
}

export interface HadithChapter {
  id: number;
  collection_id: number;
  book_id: number | null;
  chapter_number: string;
  name_arabic: string | null;
  name_english: string | null;
  intro: string | null;
  ending: string | null;
}

export interface Hadith {
  id: number;
  collection_id: number;
  collection_key: string;
  collection_name_arabic: string;
  collection_name_english: string;
  hadith_number: string;
  book_number: string | null;
  book_name_arabic: string | null;
  book_name_english: string | null;
  chapter_number: string | null;
  chapter_name_arabic: string | null;
  chapter_name_english: string | null;
  text_arabic: string;
  text_english: string | null;
  text_french: string | null;
  isnad_arabic: string | null;
  grade: string | null;
  grade_source: string | null;
  reference: string;
}

export interface HadithGrade {
  grade: string;
  gradedBy: string;
}

export type GradeColor = 'sahih' | 'hasan' | 'daif' | 'mawdu' | 'unknown';

export function getGradeColor(grade: string | null): GradeColor {
  if (!grade) return 'unknown';
  const g = grade.toLowerCase();
  if (g.includes('sahih') || g.includes('صحيح')) return 'sahih';
  if (g.includes('hasan') || g.includes('حسن')) return 'hasan';
  if (g.includes("da'if") || g.includes('daif') || g.includes('weak') || g.includes('ضعيف')) return 'daif';
  if (g.includes('fabricated') || g.includes('mawdu') || g.includes('موضوع')) return 'mawdu';
  return 'unknown';
}

export const GRADE_LABELS: Record<GradeColor, { fr: string; en: string; ar: string; color: string; bg: string }> = {
  sahih: { fr: 'Sahih', en: 'Sahih', ar: 'صحيح', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  hasan: { fr: 'Hassan', en: 'Hasan', ar: 'حسن', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  daif:  { fr: 'Da\'if', en: "Da'if", ar: 'ضعيف', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  mawdu: { fr: 'Mawdu\'', en: "Mawdu'", ar: 'موضوع', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  unknown: { fr: '', en: '', ar: '', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200' },
};

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
