'use client'
// ============================================================
// PrayerCountdown.tsx — Countdown vers la prochaine prière
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
  isNext: boolean
} {
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  for (let i = 0; i < prayers.length; i++) {
    const [h, m] = prayers[i].time.split(':').map(Number)
    const prayerMinutes = h * 60 + m
    if (prayerMinutes > currentMinutes) {
      return {
        prayer: prayers[i],
        minutesUntil: prayerMinutes - currentMinutes,
        isNext: true,
      }
    }
  }

  // Après Isha → prochaine = Fajr demain
  const [h, m] = prayers[0].time.split(':').map(Number)
  const fajrMinutes = h * 60 + m
  const minutesUntilMidnight = 24 * 60 - currentMinutes
  return {
    prayer: prayers[0],
    minutesUntil: minutesUntilMidnight + fajrMinutes,
    isNext: true,
  }
}

function formatCountdown(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0) return `${h}h ${m}min`
  return `${m} min`
}

function getCurrentPrayer(prayers: NamedPrayer[], now: Date): NamedPrayer | null {
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  let lastPassed: NamedPrayer | null = null
  for (const prayer of prayers) {
    const [h, m] = prayer.time.split(':').map(Number)
    const prayerMinutes = h * 60 + m
    if (prayerMinutes <= currentMinutes) {
      lastPassed = prayer
    }
  }
  return lastPassed
}

export default function PrayerCountdown({ prayers }: Props) {
  const [now, setNow] = useState<Date | null>(null)

  // Hydrater côté client pour éviter mismatch SSR
  useEffect(() => {
    setNow(new Date())
    const interval = setInterval(() => setNow(new Date()), 60_000) // Update toutes les minutes
    return () => clearInterval(interval)
  }, [])

  if (!now) {
    // Placeholder pendant hydration
    return (
      <div className="bg-islam-700 text-white rounded-2xl p-6 mb-6 text-center animate-pulse">
        <div className="h-4 bg-white/20 rounded w-32 mx-auto mb-2" />
        <div className="h-8 bg-white/20 rounded w-24 mx-auto" />
      </div>
    )
  }

  const { prayer: nextPrayer, minutesUntil } = getNextPrayer(prayers, now)
  const currentPrayer = getCurrentPrayer(prayers, now)

  return (
    <div className="bg-gradient-to-br from-islam-700 to-islam-800 text-white rounded-2xl p-6 mb-8 text-center">
      {/* Prière en cours */}
      {currentPrayer && (
        <p className="text-islam-200 text-sm mb-3">
          Prière en cours :{' '}
          <span className="font-medium text-white">{currentPrayer.nameFr}</span>
          {' '}
          <span dir="rtl" lang="ar" className="text-islam-100">{currentPrayer.nameAr}</span>
        </p>
      )}

      {/* Prochaine prière */}
      <p className="text-islam-100 text-sm uppercase tracking-widest mb-2">
        Prochaine prière
      </p>
      <div className="flex items-center justify-center gap-3 mb-3">
        <span className="text-4xl" role="img" aria-hidden>{nextPrayer.icon}</span>
        <div className="text-left">
          <p className="text-2xl font-bold">{nextPrayer.nameFr}</p>
          <p dir="rtl" lang="ar" className="text-islam-200 text-lg">{nextPrayer.nameAr}</p>
        </div>
      </div>

      <p className="text-4xl font-bold text-white my-2">{nextPrayer.time}</p>

      <div className="mt-4 inline-block bg-white/10 rounded-xl px-6 py-2">
        <p className="text-islam-100 text-sm">Dans</p>
        <p className="text-xl font-bold text-white">{formatCountdown(minutesUntil)}</p>
      </div>

      {/* Rappel */}
      <p className="mt-4 text-xs text-islam-300">
        {now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} — Heure actuelle
      </p>
    </div>
  )
}
