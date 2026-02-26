// ============================================================
// lib/srs.ts — Algorithme SRS (SM-2 simplifié) pour les Mutun
// Inspiré de l'algorithme Anki / SuperMemo 2
// ============================================================

import type { SRSCard, SRSRating, Bayt } from '@/types/memorization'

/** Intervalles en jours selon la notation */
const INTERVALS: Record<SRSRating, number> = {
  easy:   4,   // Revoir dans 4 jours
  good:   2,   // Revoir dans 2 jours
  hard:   1,   // Revoir demain
  forgot: 0,   // Revoir aujourd'hui
}

/** Labels français pour l'interface */
export const RATING_LABELS: Record<SRSRating, string> = {
  easy:   'Facile',
  good:   'Bien',
  hard:   'Difficile',
  forgot: 'Oublié',
}

/** Couleurs pour les boutons de notation */
export const RATING_COLORS: Record<SRSRating, { bg: string; border: string; text: string }> = {
  easy:   { bg: 'rgba(26,127,75,0.2)',   border: 'rgba(26,127,75,0.5)',   text: '#22c55e' },
  good:   { bg: 'rgba(59,130,246,0.2)',  border: 'rgba(59,130,246,0.5)',  text: '#60a5fa' },
  hard:   { bg: 'rgba(251,191,36,0.2)',  border: 'rgba(251,191,36,0.5)',  text: '#fbbf24' },
  forgot: { bg: 'rgba(239,68,68,0.2)',   border: 'rgba(239,68,68,0.5)',   text: '#ef4444' },
}

/** Prochain rappel formaté en français */
export const RATING_NEXT: Record<SRSRating, string> = {
  easy:   '+ 4 jours',
  good:   '+ 2 jours',
  hard:   'Demain',
  forgot: 'Maintenant',
}

/**
 * Met à jour une carte SRS après une révision.
 * Algorithme : SM-2 simplifié avec intervalles fixes.
 */
export function applyRating(card: SRSCard, rating: SRSRating): SRSCard {
  const now = Date.now()
  const days = INTERVALS[rating]
  const nextReview = now + days * 24 * 60 * 60 * 1000

  return {
    ...card,
    interval: days,
    nextReview,
    repetitions: rating === 'forgot' ? 0 : card.repetitions + 1,
    lastRating: rating,
    lastStudied: now,
  }
}

/**
 * Crée une nouvelle carte SRS pour un bayt (jamais vu).
 * nextReview = maintenant (disponible immédiatement).
 */
export function createCard(bayt: Bayt): SRSCard {
  const now = Date.now()
  return {
    baytId:       bayt.id,
    matnId:       bayt.matnId,
    nextReview:   now,
    interval:     0,
    repetitions:  0,
    lastRating:   undefined,
    firstStudied: now,
    lastStudied:  now,
  }
}

/** Vérifie si une carte est due pour révision */
export function isDue(card: SRSCard): boolean {
  return Date.now() >= card.nextReview
}

/** Filtre les cartes dues pour révision */
export function getDueCards(cards: Record<string, SRSCard>): SRSCard[] {
  return Object.values(cards).filter(isDue)
}

/** Filtre les cartes dues pour un matn spécifique */
export function getDueCardsForMatn(
  cards: Record<string, SRSCard>,
  matnId: string
): SRSCard[] {
  return Object.values(cards).filter(c => c.matnId === matnId && isDue(c))
}

/** Un bayt est considéré "maîtrisé" quand son intervalle >= 4 jours */
export function isMastered(card: SRSCard): boolean {
  return card.interval >= 4 && card.repetitions >= 2
}

/** Calcule le pourcentage de maîtrise d'un matn */
export function getMatnMastery(
  cards: Record<string, SRSCard>,
  matnId: string,
  totalBayt: number
): number {
  if (totalBayt === 0) return 0
  const matured = Object.values(cards).filter(
    c => c.matnId === matnId && isMastered(c)
  ).length
  return Math.round((matured / totalBayt) * 100)
}

/** Nombre de bayt vus (au moins une fois) dans un matn */
export function getSeenCount(
  cards: Record<string, SRSCard>,
  matnId: string
): number {
  return Object.values(cards).filter(c => c.matnId === matnId).length
}

/** Formater le délai d'une carte */
export function formatNextReview(card: SRSCard): string {
  const diffMs  = card.nextReview - Date.now()
  const diffMin = Math.round(diffMs / 60000)
  const diffH   = Math.round(diffMs / 3600000)
  const diffD   = Math.round(diffMs / 86400000)

  if (diffMs  < 0)     return 'En retard'
  if (diffMin < 60)    return `${diffMin}min`
  if (diffH   < 24)    return `${diffH}h`
  return `${diffD}j`
}
