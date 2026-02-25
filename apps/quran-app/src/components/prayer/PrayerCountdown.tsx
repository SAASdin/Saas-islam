'use client'
// ============================================================
// PrayerCountdown.tsx — Countdown vers la prochaine prière — Premium dark
// Client Component (nécessite l'heure côté client)
// ============================================================

import { useState, useEffect } from 'react'
import type { NamedPrayer } from '@/lib/prayer-api'

interface Props {
  prayers: NamedPrayer[]
}

function getNextPrayer(prayers: NamedPrayer[], now: Date): {
  prayer: NamedPrayer
  minutesUntil: number
} {
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  for (let i = 0; i < prayers.length; i++) {
    const [h, m] = prayers[i].time.split(':').map(Number)
    const prayerMinutes = h * 60 + m
    if (prayerMinutes > currentMinutes) {
      return { prayer: prayers[i], minutesUntil: prayerMinutes - currentMinutes }
    }
  }

  // Après Isha → prochaine = Fajr demain
  const [h, m] = prayers[0].time.split(':').map(Number)
  const fajrMinutes = h * 60 + m
  const minutesUntilMidnight = 24 * 60 - currentMinutes
  return { prayer: prayers[0], minutesUntil: minutesUntilMidnight + fajrMinutes }
}

function formatCountdown(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}min`
  return `${m} min`
}

function getCurrentPrayer(prayers: NamedPrayer[], now: Date): NamedPrayer | null {
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  let lastPassed: NamedPrayer | null = null
  for (const prayer of prayers) {
    const [h, m] = prayer.time.split(':').map(Number)
    if (h * 60 + m <= currentMinutes) lastPassed = prayer
  }
  return lastPassed
}

export default function PrayerCountdown({ prayers }: Props) {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const interval = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(interval)
  }, [])

  if (!now) {
    return (
      <div
        className="rounded-2xl p-8 mb-8 text-center animate-pulse"
        style={{
          background: 'rgba(17,24,39,0.7)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="h-3 bg-white/10 rounded w-32 mx-auto mb-3" />
        <div className="h-10 bg-white/10 rounded w-40 mx-auto" />
      </div>
    )
  }

  const { prayer: nextPrayer, minutesUntil } = getNextPrayer(prayers, now)
  const currentPrayer = getCurrentPrayer(prayers, now)

  return (
    <div
      className="rounded-2xl p-8 mb-8 text-center animate-fade-in-scale"
      style={{
        background: 'linear-gradient(135deg, rgba(21,128,61,0.12) 0%, rgba(10,15,30,0.9) 60%, rgba(212,175,55,0.06) 100%)',
        border: '1px solid rgba(212,175,55,0.2)',
        boxShadow: '0 0 60px rgba(21,128,61,0.08), 0 0 40px rgba(212,175,55,0.05)',
      }}
    >
      {/* Prière en cours */}
      {currentPrayer && (
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs mb-5"
          style={{
            background: 'rgba(21,128,61,0.12)',
            border: '1px solid rgba(21,128,61,0.2)',
            color: '#22c55e',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Prière en cours : {currentPrayer.nameFr}
          <span
            dir="rtl"
            lang="ar"
            style={{ fontFamily: 'var(--font-amiri)', lineHeight: '1' }}
          >
            {/* ⚠️ Nom de la prière en arabe */}
            {currentPrayer.nameAr}
          </span>
        </div>
      )}

      {/* Label */}
      <p className="text-xs uppercase tracking-widest text-slate-500 mb-4">
        Prochaine prière
      </p>

      {/* Prochaine prière */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <span className="text-5xl" role="img" aria-hidden>{nextPrayer.icon}</span>
        <div className="text-left">
          <p
            className="text-3xl font-bold"
            style={{ color: '#f1f5f9' }}
          >
            {nextPrayer.nameFr}
          </p>
          <p
            dir="rtl"
            lang="ar"
            className="text-lg"
            style={{ fontFamily: 'var(--font-amiri)', color: '#d4af37', lineHeight: '1.6' }}
          >
            {/* ⚠️ Nom de la prière en arabe */}
            {nextPrayer.nameAr}
          </p>
        </div>
      </div>

      {/* Heure */}
      <p
        className="text-5xl font-bold mb-5"
        style={{ color: '#d4af37', textShadow: '0 0 30px rgba(212,175,55,0.4)' }}
      >
        {nextPrayer.time}
      </p>

      {/* Countdown */}
      <div
        className="inline-block px-8 py-3 rounded-xl"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <p className="text-xs text-slate-500 mb-1">Dans</p>
        <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>
          {formatCountdown(minutesUntil)}
        </p>
      </div>

      <p className="mt-4 text-xs text-slate-600">
        {now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} — Heure locale
      </p>
    </div>
  )
}
