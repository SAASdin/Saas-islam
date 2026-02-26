'use client'
// ============================================================
// lib/storage.ts — Persistance localStorage (progression SRS)
// Utilisé uniquement côté client (pas de SSR)
// ============================================================

import type { UserData, SRSCard, MatnProgress } from '@/types/memorization'
import { MUTUN } from '@/lib/mutun-data'

const STORAGE_KEY = 'noorapp-memorization-v1'

/** UserData par défaut (nouvel utilisateur) */
function defaultUserData(): UserData {
  return {
    cards:          {},
    progress:       {},
    streak:         0,
    lastStreakDate: null,
    badges:         [],
  }
}

/** Charge les données utilisateur depuis localStorage */
export function loadUserData(): UserData {
  if (typeof window === 'undefined') return defaultUserData()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultUserData()
    const parsed = JSON.parse(raw) as Partial<UserData>
    return {
      ...defaultUserData(),
      ...parsed,
    }
  } catch {
    return defaultUserData()
  }
}

/** Sauvegarde les données utilisateur dans localStorage */
export function saveUserData(data: UserData): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Silencieux si localStorage est plein ou bloqué
  }
}

/** Met à jour une carte SRS et recalcule la progression du matn */
export function updateCard(card: SRSCard): void {
  let data = loadUserData()
  data.cards[card.baytId] = card

  // Recalculer la progression du matn
  data.progress[card.matnId] = computeProgress(data, card.matnId)

  // Vérifier badge matn
  const matn = MUTUN.find(m => m.id === card.matnId)
  if (matn) {
    const prog = data.progress[card.matnId]
    if (prog.masteredBayt >= matn.totalBayt && !data.badges.includes(matn.badge)) {
      data.badges.push(matn.badge)
      data.progress[card.matnId].badge = matn.badge
    }
  }

  // Mettre à jour le streak
  data = updateStreak(data)

  saveUserData(data)
}

/** Calcule la progression d'un matn à partir des cartes */
export function computeProgress(data: UserData, matnId: string): MatnProgress {
  const matn = MUTUN.find(m => m.id === matnId)
  const totalBayt = matn?.totalBayt ?? 0

  const mathnCards = Object.values(data.cards).filter(c => c.matnId === matnId)
  const mastered   = mathnCards.filter(c => c.interval >= 4 && c.repetitions >= 2).length

  const lastStudied = mathnCards.length > 0
    ? new Date(Math.max(...mathnCards.map(c => c.lastStudied))).toISOString().slice(0, 10)
    : null

  const badge = data.badges.find(b => b === matn?.badge) ?? null

  return {
    matnId,
    seenBayt:     mathnCards.length,
    masteredBayt: mastered,
    totalBayt,
    lastStudied,
    badge,
  }
}

/** Met à jour le streak quotidien */
export function updateStreak(data: UserData): UserData {
  const today = new Date().toISOString().slice(0, 10)
  if (data.lastStreakDate === today) return data

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const newStreak = data.lastStreakDate === yesterday ? data.streak + 1 : 1

  return {
    ...data,
    streak:          newStreak,
    lastStreakDate:  today,
  }
}

/** Récupère une carte SRS (ou null si pas encore étudiée) */
export function getCard(baytId: string): SRSCard | null {
  const data = loadUserData()
  return data.cards[baytId] ?? null
}

/** Récupère la progression d'un matn */
export function getMatnProgress(matnId: string): MatnProgress {
  const data = loadUserData()
  return data.progress[matnId] ?? computeProgress(data, matnId)
}

/** Nombre total de cartes dues pour révision */
export function getTotalDueCount(): number {
  const data = loadUserData()
  const now  = Date.now()
  return Object.values(data.cards).filter(c => now >= c.nextReview).length
}

/** Réinitialise toutes les données (debug uniquement) */
export function resetAllData(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
}
