'use client'
// ============================================================
// /progress — Suivi de lecture, objectifs, streaks
// ============================================================
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getGoals, getStreak, getTodayProgress, getWeeklyProgress, saveGoals } from '@/lib/reading-goals'
import type { StreakData } from '@/lib/reading-goals'

export default function ProgressPage() {
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, longestStreak: 0, lastReadDate: null, totalVersesRead: 0, readDates: [] })
  const [todayProg, setTodayProg] = useState({ read: 0, target: 10, pct: 0 })
  const [weekly, setWeekly] = useState<{ day: string; count: number }[]>([])
  const [dailyTarget, setDailyTarget] = useState(10)

  useEffect(() => {
    setStreak(getStreak())
    setTodayProg(getTodayProgress())
    setWeekly(getWeeklyProgress())
    setDailyTarget(getGoals().dailyTarget)
  }, [])

  function updateTarget(n: number) {
    const goals = getGoals()
    goals.dailyTarget = n
    saveGoals(goals)
    setDailyTarget(n)
    setTodayProg(getTodayProgress())
  }

  const maxWeekly = Math.max(...weekly.map(w => w.count), 1)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/" className="p-2 text-slate-400 hover:text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <h1 className="text-2xl font-bold text-white">Ma progression</h1>
      </div>

      {/* Streak */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Série actuelle', value: streak.currentStreak, icon: '🔥', color: 'orange' },
          { label: 'Meilleure série', value: streak.longestStreak, icon: '🏆', color: 'amber' },
          { label: 'Versets total', value: streak.totalVersesRead, icon: '📖', color: 'emerald' },
        ].map(s => (
          <div key={s.label} className="bg-white/3 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Objectif du jour */}
      <div className="bg-white/3 border border-white/10 rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold">Objectif du jour</h2>
          <span className="text-emerald-400 font-bold">{todayProg.read} / {todayProg.target}</span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
            style={{ width: `${todayProg.pct}%` }}
          />
        </div>
        {todayProg.pct >= 100 ? (
          <p className="text-emerald-400 text-sm">✅ Objectif atteint aujourd&apos;hui ! Barak Allahu fik.</p>
        ) : (
          <p className="text-slate-500 text-sm">{todayProg.target - todayProg.read} versets restants</p>
        )}

        {/* Modifier l'objectif */}
        <div className="flex items-center gap-3 mt-4">
          <p className="text-slate-400 text-sm">Objectif quotidien :</p>
          <div className="flex items-center gap-2">
            {[5, 10, 20, 50].map(n => (
              <button key={n} onClick={() => updateTarget(n)}
                className={`w-10 h-8 rounded-lg text-xs font-medium transition-colors ${
                  dailyTarget === n ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}>
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Graphique semaine */}
      <div className="bg-white/3 border border-white/10 rounded-2xl p-5 mb-6">
        <h2 className="text-white font-semibold mb-4">Cette semaine</h2>
        <div className="flex items-end justify-between gap-2 h-24">
          {weekly.map((w, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-emerald-500/20 rounded-t-md transition-all hover:bg-emerald-500/40"
                style={{ height: `${Math.max(4, (w.count / maxWeekly) * 80)}px` }}
              />
              <p className="text-xs text-slate-500">{w.day}</p>
              <p className="text-xs text-slate-400">{w.count > 0 ? w.count : ''}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Link
        href="/surah/1"
        className="block w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-center font-medium rounded-xl transition-colors"
      >
        Continuer la lecture →
      </Link>
    </div>
  )
}
