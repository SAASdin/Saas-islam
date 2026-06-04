'use client'
// ============================================================
// page.tsx — Accueil : liste des 5 Mutun + progression
// ============================================================

import { useState, useEffect } from 'react'
import MatnCard from '@/components/memorization/MatnCard'
import StreakBadge from '@/components/memorization/StreakBadge'
import { MUTUN } from '@/lib/mutun-data'
import { loadUserData, computeProgress } from '@/lib/storage'
import { getDueCards } from '@/lib/srs'
import type { MatnProgress, UserData } from '@/types/memorization'

export default function HomePage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [progresses, setProgresses] = useState<Record<string, MatnProgress>>({})

  useEffect(() => {
    const data = loadUserData()
    setUserData(data)

    // Calculer la progression pour chaque matn
    const prog: Record<string, MatnProgress> = {}
    for (const matn of MUTUN) {
      prog[matn.id] = computeProgress(data, matn.id)
    }
    setProgresses(prog)
  }, [])

  const dueCards     = userData ? getDueCards(userData.cards) : []
  const totalDue     = dueCards.length
  const streak       = userData?.streak ?? 0
  const badges       = userData?.badges ?? []

  // Nombre de cartes dues par matn
  function dueCountForMatn(matnId: string): number {
    return dueCards.filter(c => c.matnId === matnId).length
  }

  return (
    <div className="min-h-screen pb-20" style={{ background: '#0a0f1e' }}>


      {/* ── Hero ──────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden py-12 px-4"
        style={{
          background: 'linear-gradient(135deg, #0d1a2e 0%, #0a1a0e 50%, #0d1a2e 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="absolute inset-0 islamic-pattern opacity-60 pointer-events-none" aria-hidden />
        <div className="relative max-w-3xl mx-auto text-center">
          <p
            className="text-4xl mb-3"
            dir="rtl"
            lang="ar"
            aria-hidden
            style={{ fontFamily: 'var(--font-amiri)', color: '#d4af37', textShadow: '0 0 30px rgba(212,175,55,0.3)' }}
          >
            وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا
          </p>
          <h1 className="text-2xl font-bold text-slate-100 mb-2">
            Mémorisation des Mutun
          </h1>
          <p className="text-slate-400 text-sm mb-6 max-w-lg mx-auto">
            Mémorisez les textes islamiques classiques avec la méthode de répétition espacée (SRS),
            inspirée d&apos;Anki.
          </p>

          {/* Stats streak + dues */}
          <div className="flex justify-center">
            <StreakBadge streak={streak} badges={badges} dueTotal={totalDue} />
          </div>
        </div>
      </div>

      {/* ── Liste des Mutun ───────────────────────────────── */}
      <main className="max-w-3xl mx-auto px-4 py-8">

        {/* Bouton réviser si des cartes sont dues */}
        {totalDue > 0 && (
          <a
            href="/review"
            className="flex items-center justify-between p-4 rounded-2xl mb-6 animate-glow transition-all duration-300 hover:brightness-110"
            style={{
              background: 'linear-gradient(135deg, rgba(26,127,75,0.25) 0%, rgba(21,128,61,0.15) 100%)',
              border:     '1px solid rgba(26,127,75,0.4)',
            }}
          >
            <div>
              <p className="font-bold text-base" style={{ color: '#22c55e' }}>
                🔄 {totalDue} révision{totalDue > 1 ? 's' : ''} en attente
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Maintenez votre streak en révisant maintenant
              </p>
            </div>
            <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#22c55e' }}>
              <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
            </svg>
          </a>
        )}

        {/* Section titre */}
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-bold text-slate-100">Les 5 Mutun</h2>
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
        </div>

        {/* Grille des Mutun */}
        <div className="grid gap-4">
          {MUTUN.map(matn => (
            <MatnCard
              key={matn.id}
              matn={matn}
              progress={progresses[matn.id] ?? {
                matnId:       matn.id,
                seenBayt:     0,
                masteredBayt: 0,
                totalBayt:    matn.totalBayt,
                lastStudied:  null,
                badge:        null,
              }}
              dueCount={dueCountForMatn(matn.id)}
            />
          ))}
        </div>

        {/* Note pédagogique */}
        <div
          className="mt-8 p-4 rounded-xl text-sm"
          style={{
            background: 'rgba(212,175,55,0.06)',
            border:     '1px solid rgba(212,175,55,0.15)',
            color:      '#94a3b8',
          }}
        >
          <p className="font-semibold mb-1" style={{ color: '#d4af37' }}>📚 Comment mémoriser ?</p>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>Choisissez un matn et étudiez les premiers vers</li>
            <li>Après chaque vers, notez votre maîtrise (Oublié → Facile)</li>
            <li>Revenez réviser selon le planning SRS (rappels espacés)</li>
            <li>La progression est sauvegardée automatiquement sur cet appareil</li>
          </ol>
        </div>
      </main>
    </div>
  )
}
