// ============================================================
// types/memorization.ts — Types mémorisation Mutun islamiques
// ⚠️  textAr des Bayt est du texte islamique classique — READ ONLY
// ============================================================

/** Catégorie d'un matn */
export type MatnSubject =
  | 'nahw'          // Grammaire arabe
  | 'usul-fiqh'     // Principes du fiqh
  | 'mustalah'      // Terminologie hadith
  | 'tajweed'       // Règles de récitation
  | 'hadith'        // Hadiths
  | 'aqida'         // Théologie islamique

/** Format du matn */
export type MatnType = 'verse' | 'prose' | 'hadith'

/** Niveau de difficulté */
export type MatnDifficulty = 'beginner' | 'intermediate' | 'advanced'

/** Un matn (texte islamique à mémoriser) */
export interface Matn {
  id: string
  /** Titre translittéré */
  title: string
  /** ⚠️ Titre arabe — NE JAMAIS modifier */
  titleAr: string
  /** Auteur (nom translittéré) */
  author: string
  /** ⚠️ Auteur arabe — NE JAMAIS modifier */
  authorAr: string
  subject: MatnSubject
  type: MatnType
  /** Nombre total de bayt/sections dans le matn */
  totalBayt: number
  /** Description courte du matn */
  description: string
  difficulty: MatnDifficulty
  /** Nom du badge obtenu à la complétion */
  badge: string
  /** Emoji représentatif */
  emoji: string
}

/** Un bayt (vers ou section d'un matn) */
export interface Bayt {
  id: string
  matnId: string
  /** Numéro dans le matn (1-indexed) */
  number: number
  /** ⚠️ Texte arabe — NE JAMAIS modifier, trim, replace, toLowerCase */
  textAr: string
  /** Traduction française (si disponible) */
  textFr?: string
  /** Sujet / titre de la section (pour prose) */
  topic?: string
  /** Premier hémistiche (pour les vers — tout avant ***) */
  firstHalf?: string
  /** Second hémistiche (pour les vers — tout après ***) */
  secondHalf?: string
}

// ── SRS (Spaced Repetition System) ──────────────────────────

export type SRSRating = 'easy' | 'good' | 'hard' | 'forgot'

/** Carte SRS associée à un bayt */
export interface SRSCard {
  baytId: string
  matnId: string
  /** Timestamp (ms) de la prochaine révision */
  nextReview: number
  /** Intervalle courant en jours */
  interval: number
  /** Nombre de répétitions réussies consécutives */
  repetitions: number
  /** Dernière notation */
  lastRating?: SRSRating
  /** Timestamp de la première étude */
  firstStudied: number
  /** Timestamp de la dernière étude */
  lastStudied: number
}

/** Progression d'un utilisateur sur un matn */
export interface MatnProgress {
  matnId: string
  /** Bayt vus au moins une fois */
  seenBayt: number
  /** Bayt avec intervalle >= 4 (maîtrisés) */
  masteredBayt: number
  totalBayt: number
  /** Date de la dernière étude (YYYY-MM-DD) */
  lastStudied: string | null
  /** Badge obtenu si matn complété */
  badge: string | null
}

/** Données utilisateur stockées en localStorage */
export interface UserData {
  /** Cartes SRS indexées par baytId */
  cards: Record<string, SRSCard>
  /** Progression par matn */
  progress: Record<string, MatnProgress>
  /** Streak de jours consécutifs */
  streak: number
  /** Date du dernier streak (YYYY-MM-DD) */
  lastStreakDate: string | null
  /** Badges obtenus */
  badges: string[]
}
