'use client'
// ============================================================
// PlanClient.tsx — Plan de lecture Coranique
// 30 jours (1 juz/jour) · 90 jours · 365 jours
// ============================================================
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import type { QdcChapter } from '@/lib/quran-cdn-api'

type PlanType = '30' | '90' | '365'

// Distribution juz (pages) pour 30 jours
const JUZ_PAGES: [number, number][] = [
  [1,21],[22,41],[42,61],[62,81],[82,101],[102,121],[122,141],[142,161],[162,181],[182,201],
  [202,221],[222,241],[242,261],[262,281],[282,301],[302,321],[322,341],[342,361],[362,381],[382,401],
  [402,421],[422,441],[442,461],[462,481],[482,501],[502,521],[522,541],[542,561],[562,581],[582,604],
]

// Distribuer les sourates sur N jours
function buildPlan(chapters: QdcChapter[], days: number) {
  const total = chapters.reduce((a, c) => a + c.verses_count, 0) // 6236
  const perDay = Math.ceil(total / days)
  const plan: Array<{ day: number; surahs: QdcChapter[]; verses: number; startVerse?: string }> = []

  let dayIndex = 0
  let dayVerses = 0
  let daySurahs: QdcChapter[] = []

  for (const ch of chapters) {
    if (dayVerses + ch.verses_count > perDay && daySurahs.length > 0) {
      plan.push({ day: dayIndex + 1, surahs: daySurahs, verses: dayVerses })
      dayIndex++
      dayVerses = 0
      daySurahs = []
    }
    daySurahs.push(ch)
    dayVerses += ch.verses_count
  }
  if (daySurahs.length > 0) {
    plan.push({ day: dayIndex + 1, surahs: daySurahs, verses: dayVerses })
  }
  return plan
}

function getProgress(day: number): boolean {
  if (typeof window === 'undefined') return false
  const done = JSON.parse(localStorage.getItem('noorapp-plan-done') ?? '[]') as number[]
  return done.includes(day)
}

function toggleDay(day: number) {
  const done = JSON.parse(localStorage.getItem('noorapp-plan-done') ?? '[]') as number[]
  const updated = done.includes(day) ? done.filter(d => d !== day) : [...done, day]
  localStorage.setItem('noorapp-plan-done', JSON.stringify(updated))
}

export default function PlanClient({ chapters }: { chapters: QdcChapter[] }) {
  const [planType, setPlanType] = useState<PlanType>('30')
  const [doneDays, setDoneDays] = useState<number[]>([])
  const [expandedDay, setExpandedDay] = useState<number | null>(null)

  useEffect(() => {
    const done = JSON.parse(localStorage.getItem('noorapp-plan-done') ?? '[]') as number[]
    setDoneDays(done)
  }, [])

  function handleToggle(day: number) {
    toggleDay(day)
    const done = JSON.parse(localStorage.getItem('noorapp-plan-done') ?? '[]') as number[]
    setDoneDays(done)
  }

  const plan = useMemo(() => {
    if (planType === '30') {
      // Juz-based plan — 1 juz par jour
      return JUZ_PAGES.map((pages, i) => {
        const juzSurahs = chapters.filter(c => c.pages[0] >= pages[0] && c.pages[0] <= pages[1])
        return { day: i + 1, surahs: juzSurahs, verses: juzSurahs.reduce((a, s) => a + s.verses_count, 0), pages }
      })
    }
    return buildPlan(chapters, parseInt(planType))
  }, [planType, chapters])

  const progress = (doneDays.length / plan.length) * 100
  const totalDays = plan.length

  // Trouver le jour suivant non terminé
  const nextDay = plan.find(p => !doneDays.includes(p.day))

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl arabic-text text-white mb-1" dir="rtl" lang="ar">خطة القراءة</h1>
        <p className="text-slate-400 text-sm">Plan de lecture du Coran</p>
      </div>

      {/* Sélecteur plan */}
      <div className="flex gap-2 mb-6 justify-center">
        {[
          { value: '30', label: '30 jours', sub: '1 Juz/jour', icon: '🌙' },
          { value: '90', label: '90 jours', sub: '~3 mois', icon: '📅' },
          { value: '365', label: '365 jours', sub: '1 an', icon: '🌟' },
        ].map(p => (
          <button key={p.value} onClick={() => { setPlanType(p.value as PlanType); setDoneDays([]) }}
            className={`flex flex-col items-center px-5 py-3 rounded-xl border transition-all ${
              planType === p.value
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-white/4 border-white/10 text-slate-400 hover:bg-white/8'
            }`}
          >
            <span className="text-xl mb-0.5">{p.icon}</span>
            <span className="text-sm font-semibold">{p.label}</span>
            <span className="text-xs opacity-60">{p.sub}</span>
          </button>
        ))}
      </div>

      {/* Progression globale */}
      <div className="bg-white/4 border border-white/10 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white font-medium">{doneDays.length} / {totalDays} jours terminés</p>
          <p className="text-emerald-400 font-bold">{Math.round(progress)}%</p>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }} />
        </div>
        {nextDay && (
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
            <p className="text-slate-400 text-sm">Prochain : <span className="text-white">Jour {nextDay.day}</span></p>
            <Link href={`/surah/${nextDay.surahs[0]?.id ?? 1}`}
              className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
              Commencer →
            </Link>
          </div>
        )}
      </div>

      {/* Liste des jours */}
      <div className="space-y-2">
        {plan.map(dayPlan => {
          const isDone = doneDays.includes(dayPlan.day)
          const isExpanded = expandedDay === dayPlan.day

          return (
            <div key={dayPlan.day} className={`border rounded-xl transition-all ${
              isDone ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 bg-white/3'
            }`}>
              <div className="flex items-center gap-3 p-3.5 cursor-pointer"
                onClick={() => setExpandedDay(isExpanded ? null : dayPlan.day)}>
                {/* Checkbox */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleToggle(dayPlan.day) }}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    isDone ? 'bg-emerald-500 border-emerald-500' : 'border-white/20 hover:border-emerald-500/50'
                  }`}
                >
                  {isDone && <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>}
                </button>

                {/* Jour */}
                <div className="w-16 shrink-0">
                  <p className={`text-sm font-bold ${isDone ? 'text-emerald-400' : 'text-white'}`}>Jour {dayPlan.day}</p>
                  {planType === '30' && <p className="text-xs text-slate-600">Juz {dayPlan.day}</p>}
                </div>

                {/* Aperçu sourates */}
                <div className="flex-1 min-w-0">
                  <p className="text-slate-300 text-sm truncate arabic-text" dir="rtl" lang="ar">
                    {dayPlan.surahs.slice(0, 3).map(s => s.name_arabic).join(' · ')}
                    {dayPlan.surahs.length > 3 ? ` · +${dayPlan.surahs.length - 3}` : ''}
                  </p>
                  <p className="text-slate-600 text-xs mt-0.5">{dayPlan.verses} versets · {dayPlan.surahs.length} sourate{dayPlan.surahs.length > 1 ? 's' : ''}</p>
                </div>

                <svg className={`w-4 h-4 text-slate-600 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Sourates détaillées */}
              {isExpanded && (
                <div className="px-4 pb-3 border-t border-white/5">
                  <div className="grid grid-cols-2 gap-1.5 mt-2">
                    {dayPlan.surahs.map(s => (
                      <Link key={s.id} href={`/surah/${s.id}`}
                        className="flex items-center gap-2 px-3 py-2 bg-white/4 hover:bg-white/8 border border-white/8 rounded-lg transition-all">
                        <span className="text-slate-500 text-xs font-mono w-5 text-right">{s.id}</span>
                        <div>
                          <p className="text-white text-xs">{s.name_simple}</p>
                          <p className="text-slate-600 text-[10px]">{s.verses_count}v</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  {'pages' in dayPlan && planType === '30' && (
                    <Link href={`/mushaf/${(dayPlan as { pages: [number, number] }).pages[0]}`}
                      className="mt-2 flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-emerald-400 transition-colors">
                      <span>🕌</span> Voir pages {(dayPlan as { pages: [number, number] }).pages[0]}–{(dayPlan as { pages: [number, number] }).pages[1]} dans le Mushaf
                    </Link>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
