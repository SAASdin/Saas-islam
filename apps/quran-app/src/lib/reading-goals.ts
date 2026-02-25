// ============================================================
// lib/reading-goals.ts — Suivi de lecture & streaks
// Stocké en localStorage — privacy-first
// ============================================================

const STORAGE_KEY = 'noorapp-reading-goals-v1'
const STREAK_KEY  = 'noorapp-streak-v1'

export interface ReadingSession {
  date: string          // YYYY-MM-DD
  versesRead: string[]  // verse keys lus
  durationMin: number
}

export interface ReadingGoals {
  dailyTarget: number       // versets par jour (défaut: 10)
  weeklyTarget: number      // versets par semaine
  sessions: ReadingSession[]
}

export interface StreakData {
  currentStreak: number
  longestStreak: number
  lastReadDate: string | null
  totalVersesRead: number
  readDates: string[]
}

function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

// ── Goals ────────────────────────────────────────────────────

export function getGoals(): ReadingGoals {
  if (typeof window === 'undefined') return { dailyTarget: 10, weeklyTarget: 70, sessions: [] }
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : { dailyTarget: 10, weeklyTarget: 70, sessions: [] }
  } catch { return { dailyTarget: 10, weeklyTarget: 70, sessions: [] } }
}

export function saveGoals(goals: ReadingGoals): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
}

export function markVerseRead(verseKey: string): void {
  const goals = getGoals()
  const today = getToday()
  let session = goals.sessions.find(s => s.date === today)

  if (!session) {
    session = { date: today, versesRead: [], durationMin: 0 }
    goals.sessions.push(session)
  }

  if (!session.versesRead.includes(verseKey)) {
    session.versesRead.push(verseKey)
    saveGoals(goals)
    updateStreak()
  }
}

export function getTodayProgress(): { read: number; target: number; pct: number } {
  const goals = getGoals()
  const today = getToday()
  const session = goals.sessions.find(s => s.date === today)
  const read = session?.versesRead.length ?? 0
  const target = goals.dailyTarget
  return { read, target, pct: Math.min(100, Math.round((read / target) * 100)) }
}

// ── Streaks ──────────────────────────────────────────────────

export function getStreak(): StreakData {
  if (typeof window === 'undefined') return { currentStreak: 0, longestStreak: 0, lastReadDate: null, totalVersesRead: 0, readDates: [] }
  try {
    const stored = localStorage.getItem(STREAK_KEY)
    return stored ? JSON.parse(stored) : { currentStreak: 0, longestStreak: 0, lastReadDate: null, totalVersesRead: 0, readDates: [] }
  } catch { return { currentStreak: 0, longestStreak: 0, lastReadDate: null, totalVersesRead: 0, readDates: [] } }
}

export function updateStreak(): void {
  if (typeof window === 'undefined') return
  const streak = getStreak()
  const today = getToday()

  if (streak.lastReadDate === today) return // Déjà compté aujourd'hui

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  if (streak.lastReadDate === yesterdayStr) {
    streak.currentStreak += 1
  } else if (streak.lastReadDate !== today) {
    streak.currentStreak = 1 // Réinitialiser
  }

  streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak)
  streak.lastReadDate = today
  streak.totalVersesRead += 1
  if (!streak.readDates.includes(today)) streak.readDates.push(today)

  localStorage.setItem(STREAK_KEY, JSON.stringify(streak))
}

export function getWeeklyProgress(): { day: string; count: number }[] {
  const goals = getGoals()
  const result = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const session = goals.sessions.find(s => s.date === dateStr)
    result.push({ day: d.toLocaleDateString('fr-FR', { weekday: 'short' }), count: session?.versesRead.length ?? 0 })
  }
  return result
}
