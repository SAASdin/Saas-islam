'use client'
// ============================================================
// review/page.tsx — Session de révision SRS globale
// Révise toutes les cartes dues (tous les mutun)
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import SRSReview from '@/components/memorization/SRSReview'
import { loadUserData, updateCard } from '@/lib/storage'
import { getDueCards } from '@/lib/srs'
import { getBaytById, getMatnById } from '@/lib/mutun-data'
import type { SRSCard } from '@/types/memorization'

export default function ReviewPage() {
  const [queue, setQueue]           = useState<SRSCard[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [loading, setLoading]       = useState(true)
  const [done, setDone]             = useState(false)
  const [reviewed, setReviewed]     = useState(0)

  useEffect(() => {
    const data    = loadUserData()
    const due     = getDueCards(data.cards)
    // Mélanger les cartes pour éviter toujours le même ordre
    const shuffled = [...due].sort(() => Math.random() - 0.5)
    setQueue(shuffled)
    setLoading(false)
    if (shuffled.length === 0) setDone(true)
  }, [])

  const handleRated = useCallback((updatedCard: SRSCard) => {
    // Persister la carte
    updateCard(updatedCard)
    setReviewed(r => r + 1)

    const next = currentIdx + 1
    if (next >= queue.length) {
      setDone(true)
    } else {
      setCurrentIdx(next)
    }
  }, [currentIdx, queue.length])

  // ─────────────────────────────────────────────────────────
  // Chargement
  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: '#0a0f1e' }}>
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-4" style={{ borderColor: '#d4af37', borderTopColor: 'transparent' }} />
            <p className="text-slate-400">Chargement des révisions…</p>
          </div>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────
  // Aucune carte due
  if (done && queue.length === 0) {
    return (
      <div className="min-h-screen pb-20" style={{ background: '#0a0f1e' }}>
        <Navigation />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">🌟</div>
          <h1 className="text-2xl font-bold text-slate-100 mb-3">
            Aucune révision en attente
          </h1>
          <p className="text-slate-400 mb-8 text-sm leading-relaxed">
            Excellent ! Toutes vos cartes sont à jour.
            Revenez plus tard selon votre planning SRS,
            ou commencez à mémoriser de nouveaux vers.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #1a7f4b, #15803d)', color: '#fff' }}
          >
            📚 Voir les Mutun
          </Link>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────
  // Session terminée
  if (done) {
    return (
      <div className="min-h-screen pb-20" style={{ background: '#0a0f1e' }}>
        <Navigation />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-slate-100 mb-3">
            Session terminée !
          </h1>
          <p className="text-slate-400 mb-2">
            Vous avez révisé <span className="font-bold text-slate-100">{reviewed}</span> vers.
          </p>
          <p className="text-slate-500 text-sm mb-8">
            Alhamdulillah — votre mémoire se renforce avec chaque révision.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/"
              className="py-3 px-5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'rgba(255,255,255,0.07)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              ← Accueil
            </Link>
            <button
              onClick={() => { setCurrentIdx(0); setDone(false); setReviewed(0) }}
              className="py-3 px-5 rounded-xl text-sm font-semibold transition-all hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, #1a7f4b, #15803d)', color: '#fff' }}
            >
              Recommencer
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────
  // Révision en cours
  const currentCard = queue[currentIdx]
  const bayt = getBaytById(currentCard.baytId)
  const matn = getMatnById(currentCard.matnId)

  // Sécurité : données manquantes (ne devrait pas arriver en prod)
  if (!bayt || !matn) {
    handleRated({ ...currentCard, lastRating: 'good', nextReview: Date.now() + 2 * 86400000 })
    return null
  }

  return (
    <div className="min-h-screen pb-20" style={{ background: '#0a0f1e' }}>
      <Navigation />
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
            ← Quitter
          </Link>
          <h1 className="text-sm font-bold text-slate-300">Session de révision</h1>
          <div />
        </div>

        <SRSReview
          bayt={bayt}
          matn={matn}
          card={currentCard}
          total={queue.length}
          current={currentIdx + 1}
          onRated={handleRated}
        />
      </div>
    </div>
  )
}
