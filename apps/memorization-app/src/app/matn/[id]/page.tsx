'use client'
// ============================================================
// matn/[id]/page.tsx — Détail d'un matn : liste des bayt + stats
// ============================================================

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import StreakBadge from '@/components/memorization/StreakBadge'
import { getMatnById, getBaytForMatn } from '@/lib/mutun-data'
import { loadUserData, computeProgress, getTotalDueCount } from '@/lib/storage'
import { getDueCardsForMatn, isMastered, formatNextReview } from '@/lib/srs'
import type { SRSCard } from '@/types/memorization'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default function MatnPage({ params }: Props) {
  const { id } = use(params)

  const matn  = getMatnById(id)
  const bayts = getBaytForMatn(id)

  if (!matn) notFound()

  const [cards, setCards]         = useState<Record<string, SRSCard>>({})
  const [streak, setStreak]       = useState(0)
  const [badges, setBadges]       = useState<string[]>([])
  const [totalDue, setTotalDue]   = useState(0)

  useEffect(() => {
    const data = loadUserData()
    setCards(data.cards)
    setStreak(data.streak)
    setBadges(data.badges)
    setTotalDue(getTotalDueCount())
  }, [])

  const progress  = computeProgress({ cards, progress: {}, streak: 0, lastStreakDate: null, badges: [] }, id)
  const dueCards  = getDueCardsForMatn(cards, id)
  const mastery   = progress.totalBayt > 0
    ? Math.round((progress.masteredBayt / progress.totalBayt) * 100)
    : 0

  return (
    <div className="min-h-screen pb-20" style={{ background: '#0a0f1e' }}>
      <Navigation />

      {/* ── En-tête matn ─────────────────────────────────── */}
      <div
        className="py-10 px-4 relative overflow-hidden"
        style={{
          background:   'linear-gradient(135deg, #0d1a2e 0%, #0a1a0e 50%, #0d1a2e 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="absolute inset-0 islamic-pattern opacity-40 pointer-events-none" aria-hidden />
        <div className="relative max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 mb-4 inline-flex items-center gap-1 transition-colors">
            ← Retour aux Mutun
          </Link>

          <div className="flex items-start gap-4 mt-2">
            <span className="text-5xl flex-shrink-0">{matn.emoji}</span>
            <div>
              <h1 className="text-2xl font-bold text-slate-100 mb-1">{matn.title}</h1>
              {/* ⚠️ titleAr READ ONLY */}
              <p dir="rtl" lang="ar" className="text-xl mb-2"
                style={{ color: '#d4af37', fontFamily: 'var(--font-amiri)' }}>
                {matn.titleAr}
              </p>
              <p className="text-slate-400 text-sm">{matn.description}</p>
            </div>
          </div>

          {/* Stats en ligne */}
          <div className="flex flex-wrap gap-4 mt-5">
            <div className="glass-card px-4 py-2.5 flex items-center gap-2">
              <span className="text-lg">📊</span>
              <div>
                <p className="text-xs text-slate-500">Maîtrise</p>
                <p className="font-bold text-sm" style={{ color: '#d4af37' }}>{mastery}%</p>
              </div>
            </div>
            <div className="glass-card px-4 py-2.5 flex items-center gap-2">
              <span className="text-lg">📝</span>
              <div>
                <p className="text-xs text-slate-500">Étudiés</p>
                <p className="font-bold text-sm text-slate-100">{progress.seenBayt} / {matn.totalBayt}</p>
              </div>
            </div>
            <div className="glass-card px-4 py-2.5 flex items-center gap-2">
              <span className="text-lg">⏰</span>
              <div>
                <p className="text-xs text-slate-500">À réviser</p>
                <p className="font-bold text-sm" style={{ color: dueCards.length > 0 ? '#ef4444' : '#22c55e' }}>
                  {dueCards.length}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <StreakBadge streak={streak} badges={badges} dueTotal={totalDue} />
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Boutons d'action */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <Link
            href={`/matn/${id}/memorize`}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 hover:brightness-110"
            style={{
              background: 'linear-gradient(135deg, #1a7f4b 0%, #15803d 100%)',
              color:      '#fff',
              boxShadow:  '0 4px 16px rgba(26,127,75,0.3)',
              minWidth:   '140px',
            }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            Mémoriser
          </Link>

          {dueCards.length > 0 && (
            <Link
              href="/review"
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 hover:brightness-110"
              style={{
                background: 'rgba(239,68,68,0.15)',
                color:      '#ef4444',
                border:     '1px solid rgba(239,68,68,0.3)',
                minWidth:   '140px',
              }}
            >
              🔄 Réviser ({dueCards.length})
            </Link>
          )}
        </div>

        {/* Barre de progression globale */}
        <div className="mb-6">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-500">Progression globale</span>
            <span style={{ color: '#d4af37' }}>{mastery}% maîtrisé</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${mastery}%` }} />
          </div>
        </div>

        {/* ── Liste des bayt ──────────────────────────────── */}
        <h2 className="text-base font-bold text-slate-200 mb-3">
          {matn.type === 'verse' ? 'Les vers' : matn.type === 'hadith' ? 'Les hadiths' : 'Les sections'}
          <span className="text-slate-500 font-normal ml-2">({bayts.length} / {matn.totalBayt} disponibles)</span>
        </h2>

        <div className="space-y-3">
          {bayts.map(bayt => {
            const card    = cards[bayt.id]
            const mastered = card ? isMastered(card) : false
            const due      = card ? card.nextReview <= Date.now() : false

            return (
              <article
                key={bayt.id}
                className="p-4 rounded-xl transition-all duration-200"
                style={{
                  background: mastered
                    ? 'rgba(26,127,75,0.1)'
                    : due
                    ? 'rgba(239,68,68,0.06)'
                    : 'rgba(17,24,39,0.7)',
                  border: mastered
                    ? '1px solid rgba(26,127,75,0.3)'
                    : due
                    ? '1px solid rgba(239,68,68,0.2)'
                    : '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Numéro */}
                  <span
                    className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: mastered ? 'rgba(26,127,75,0.3)' : 'rgba(255,255,255,0.07)',
                      color:      mastered ? '#22c55e' : '#64748b',
                    }}
                  >
                    {bayt.number}
                  </span>

                  {/* Texte arabe ⚠️ READ ONLY */}
                  <div className="flex-1 text-right">
                    {bayt.topic && (
                      <p className="text-xs text-slate-500 mb-1 text-left">{bayt.topic}</p>
                    )}
                    <p
                      dir="rtl"
                      lang="ar"
                      style={{ fontFamily: 'var(--font-amiri)', fontSize: '1.1rem', lineHeight: '2rem', color: '#e2e8f0' }}
                    >
                      {bayt.textAr}
                    </p>
                    {bayt.textFr && (
                      <p className="text-xs text-slate-500 mt-1 text-left italic">
                        {bayt.textFr}
                      </p>
                    )}
                  </div>

                  {/* Statut SRS */}
                  <div className="flex-shrink-0 text-right">
                    {mastered ? (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(26,127,75,0.2)', color: '#22c55e' }}>✓</span>
                    ) : due && card ? (
                      <span className="text-xs" style={{ color: '#ef4444' }}>à réviser</span>
                    ) : card ? (
                      <span className="text-xs text-slate-600">{formatNextReview(card)}</span>
                    ) : (
                      <span className="text-xs text-slate-600">Nouveau</span>
                    )}
                  </div>
                </div>
              </article>
            )
          })}

          {/* Note si données incomplètes */}
          {bayts.length < matn.totalBayt && (
            <div
              className="p-4 rounded-xl text-center text-sm"
              style={{
                background: 'rgba(251,191,36,0.05)',
                border:     '1px solid rgba(251,191,36,0.15)',
                color:      '#fbbf24',
              }}
            >
              ⚠️ {matn.totalBayt - bayts.length} vers/sections restants à compléter
              depuis une édition imprimée vérifiée.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
