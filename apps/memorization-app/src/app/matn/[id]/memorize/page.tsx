'use client'
// ============================================================
// matn/[id]/memorize/page.tsx — Mode mémorisation progressive
// Méthode cumulative : écoute → lis 3× → cache → récite → suivant
// ⚠️  textAr affiché READ ONLY — JAMAIS modifié
// ============================================================

import { useState, useEffect, use, useCallback } from 'react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { getMatnById, getBaytForMatn } from '@/lib/mutun-data'
import { loadUserData, updateCard } from '@/lib/storage'
import { createCard, applyRating } from '@/lib/srs'
import type { Bayt, SRSRating } from '@/types/memorization'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

// Étapes de mémorisation pour chaque nouveau vers
type MemStep = 'listen' | 'read' | 'hide' | 'reveal-check' | 'rate'

export default function MemorizePage({ params }: Props) {
  const { id } = use(params)

  const matn  = getMatnById(id)
  const bayts = getBaytForMatn(id)

  if (!matn || bayts.length === 0) notFound()

  // Index du vers en cours d'apprentissage
  const [currentIdx, setCurrentIdx]   = useState(0)
  // Étape dans le flux de mémorisation
  const [step, setStep]               = useState<MemStep>('listen')
  // Compteur de lectures (phase "read")
  const [readCount, setReadCount]     = useState(0)
  // Tentative de récitation (phase "hide")
  const [recitation, setRecitation]   = useState('')
  // Afficher le score de session
  const [sessionDone, setSessionDone] = useState(false)
  const [sessionScore, setSessionScore] = useState({ easy: 0, good: 0, hard: 0, forgot: 0 })

  const currentBayt: Bayt = bayts[currentIdx]

  // Avancer à l'étape suivante
  const nextStep = useCallback(() => {
    switch (step) {
      case 'listen': setStep('read'); break
      case 'read':
        if (readCount < 2) {
          setReadCount(r => r + 1)
        } else {
          setStep('hide')
        }
        break
      case 'hide':    setStep('reveal-check'); break
      case 'reveal-check': setStep('rate'); break
      default: break
    }
  }, [step, readCount])

  const handleRate = useCallback((rating: SRSRating) => {
    // Sauvegarder la carte SRS
    const data    = loadUserData()
    const existing = data.cards[currentBayt.id]
    const card    = existing ?? createCard(currentBayt)
    const updated = applyRating(card, rating)
    updateCard(updated)

    // Mettre à jour le score de session
    setSessionScore(s => ({ ...s, [rating]: s[rating] + 1 }))

    // Passer au vers suivant ou terminer
    const nextIdx = currentIdx + 1
    if (nextIdx >= bayts.length) {
      setSessionDone(true)
    } else {
      setCurrentIdx(nextIdx)
      setStep('listen')
      setReadCount(0)
      setRecitation('')
    }
  }, [currentBayt, currentIdx, bayts.length])

  // Réinitialiser si la session est terminée
  function restartSession() {
    setCurrentIdx(0)
    setStep('listen')
    setReadCount(0)
    setRecitation('')
    setSessionDone(false)
    setSessionScore({ easy: 0, good: 0, hard: 0, forgot: 0 })
  }

  // ─────────────────────────────────────────────────────────
  // Session terminée
  if (sessionDone) {
    const total   = Object.values(sessionScore).reduce((a, b) => a + b, 0)
    const success = sessionScore.easy + sessionScore.good

    return (
      <div className="min-h-screen pb-20" style={{ background: '#0a0f1e' }}>
        <Navigation />
        <div className="max-w-lg mx-auto px-4 py-12 text-center">
          <div className="text-6xl mb-4">
            {success === total ? '🏆' : success > total / 2 ? '⭐' : '💪'}
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Session terminée !</h1>
          <p className="text-slate-400 mb-6">
            Vous avez étudié {total} vers de{' '}
            <span style={{ color: '#d4af37' }}>{matn.titleAr}</span>
          </p>

          {/* Score */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { key: 'easy',   label: 'Facile',    color: '#22c55e', icon: '✓' },
              { key: 'good',   label: 'Bien',       color: '#60a5fa', icon: '👍' },
              { key: 'hard',   label: 'Difficile',  color: '#fbbf24', icon: '⚡' },
              { key: 'forgot', label: 'Oublié',     color: '#ef4444', icon: '✗' },
            ].map(({ key, label, color, icon }) => (
              <div
                key={key}
                className="p-3 rounded-xl text-center"
                style={{
                  background: `${color}15`,
                  border:     `1px solid ${color}30`,
                }}
              >
                <p className="text-2xl font-bold" style={{ color }}>
                  {icon} {sessionScore[key as keyof typeof sessionScore]}
                </p>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={restartSession}
              className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'rgba(255,255,255,0.07)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              Recommencer
            </button>
            <Link
              href="/review"
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-center transition-all hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, #1a7f4b, #15803d)', color: '#fff' }}
            >
              Réviser maintenant
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────
  // Session en cours
  const progress = ((currentIdx) / bayts.length) * 100

  return (
    <div className="min-h-screen pb-20" style={{ background: '#0a0f1e' }}>
      <Navigation />

      <div className="max-w-lg mx-auto px-4 py-6">

        {/* En-tête */}
        <div className="flex items-center justify-between mb-4">
          <Link href={`/matn/${id}`} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
            ← {matn.title}
          </Link>
          <span className="text-sm font-bold" style={{ color: '#d4af37' }}>
            {currentIdx + 1} / {bayts.length}
          </span>
        </div>

        {/* Barre de progression session */}
        <div className="progress-bar-track mb-6">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Étiquette de l'étape */}
        <StepIndicator step={step} readCount={readCount} />

        {/* Contenu selon l'étape */}
        <div
          className="rounded-2xl p-6 my-5 animate-fade-in"
          style={{
            background: 'rgba(17,24,39,0.85)',
            border:     '1px solid rgba(255,255,255,0.09)',
            minHeight:  '200px',
          }}
        >
          {/* Numéro du vers */}
          <p className="text-xs text-slate-500 text-center mb-4">
            {matn.type === 'hadith' ? `Hadith n°${currentBayt.number}` : `Vers n°${currentBayt.number}`}
            {currentBayt.topic && ` — ${currentBayt.topic}`}
          </p>

          {/* LISTEN / READ — afficher le vers complet */}
          {(step === 'listen' || step === 'read') && (
            <div className="text-center animate-fade-in">
              {step === 'listen' && (
                <p className="text-xs text-slate-500 mb-3">
                  🎧 Lisez attentivement ce vers (répétez {3 - readCount} fois)
                </p>
              )}
              {step === 'read' && (
                <p className="text-xs mb-3" style={{ color: '#22c55e' }}>
                  Lecture {readCount + 1} / 3 — Lisez à voix haute
                </p>
              )}

              {/* ⚠️ textAr READ ONLY */}
              <p
                dir="rtl"
                lang="ar"
                className="bayt-text mb-4"
                style={{ color: step === 'listen' ? '#d4af37' : '#f1f5f9' }}
              >
                {currentBayt.textAr}
              </p>

              {currentBayt.textFr && (
                <p className="text-sm text-slate-400 italic mt-2">
                  « {currentBayt.textFr} »
                </p>
              )}
            </div>
          )}

          {/* HIDE — vers caché, essayer de réciter */}
          {step === 'hide' && (
            <div className="animate-fade-in">
              <p className="text-xs text-center mb-4" style={{ color: '#fbbf24' }}>
                🔒 Le vers est masqué. Récitez-le de mémoire.
              </p>
              {/* Zone de saisie optionnelle */}
              <textarea
                className="arabic-input"
                rows={3}
                value={recitation}
                onChange={e => setRecitation(e.target.value)}
                placeholder="اكتب أو تلُ من ذاكرتك…"
                dir="rtl"
                lang="ar"
                aria-label="Votre récitation"
              />
            </div>
          )}

          {/* REVEAL-CHECK — révéler et comparer */}
          {step === 'reveal-check' && (
            <div className="animate-flip-in">
              <p className="text-xs text-center text-slate-500 mb-3">Réponse correcte :</p>
              {/* ⚠️ textAr READ ONLY */}
              <p
                dir="rtl"
                lang="ar"
                className="bayt-text mb-3"
                style={{ color: '#f1f5f9' }}
              >
                {currentBayt.textAr}
              </p>
              {recitation.trim() && (
                <div
                  className="p-3 rounded-lg mt-2"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <p className="text-xs text-slate-500 mb-1">Votre version :</p>
                  <p
                    dir="rtl"
                    lang="ar"
                    style={{ fontFamily: 'var(--font-amiri)', fontSize: '1rem', color: '#94a3b8' }}
                  >
                    {recitation}
                  </p>
                </div>
              )}
              {currentBayt.textFr && (
                <p className="text-xs text-slate-400 italic mt-3">« {currentBayt.textFr} »</p>
              )}
            </div>
          )}

          {/* RATE — noter sa maîtrise */}
          {step === 'rate' && (
            <div className="animate-fade-in text-center">
              <p className="text-sm text-slate-400 mb-4">Comment était ce vers ?</p>
              <div className="flex flex-col gap-2">
                {([
                  { r: 'easy'   as SRSRating, label: '✓ Facile',    sub: '+ 4 jours', color: '#22c55e', bg: 'rgba(26,127,75,0.2)',  border: 'rgba(26,127,75,0.4)'  },
                  { r: 'good'   as SRSRating, label: '👍 Bien',      sub: '+ 2 jours', color: '#60a5fa', bg: 'rgba(59,130,246,0.2)', border: 'rgba(59,130,246,0.4)' },
                  { r: 'hard'   as SRSRating, label: '⚡ Difficile', sub: 'Demain',    color: '#fbbf24', bg: 'rgba(251,191,36,0.2)', border: 'rgba(251,191,36,0.4)' },
                  { r: 'forgot' as SRSRating, label: '✗ Oublié',    sub: 'Maintenant', color: '#ef4444', bg: 'rgba(239,68,68,0.2)',  border: 'rgba(239,68,68,0.4)'  },
                ] as const).map(({ r, label, sub, color, bg, border }) => (
                  <button
                    key={r}
                    onClick={() => handleRate(r)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:brightness-110"
                    style={{ background: bg, border: `1px solid ${border}`, color }}
                  >
                    <span>{label}</span>
                    <span className="text-xs opacity-70">{sub}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bouton avancer (sauf sur "rate") */}
        {step !== 'rate' && (
          <button
            onClick={nextStep}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:brightness-110"
            style={{
              background: 'linear-gradient(135deg, #1a7f4b 0%, #15803d 100%)',
              color:      '#fff',
              boxShadow:  '0 4px 16px rgba(26,127,75,0.3)',
            }}
          >
            {step === 'listen'         ? 'J\'ai lu → Recommencer 3×'  :
             step === 'read'           ? readCount < 2 ? `Relire (${readCount + 1}/3)` : 'Cacher le vers' :
             step === 'hide'           ? 'Voir la réponse' :
             step === 'reveal-check'   ? 'Évaluer ma maîtrise' :
             'Continuer'}
          </button>
        )}
      </div>
    </div>
  )
}

// ── Indicateur d'étape ─────────────────────────────────────

function StepIndicator({ step, readCount }: { step: MemStep; readCount: number }) {
  const steps: Array<{ key: MemStep; label: string; icon: string }> = [
    { key: 'listen',       label: 'Lire',     icon: '👁' },
    { key: 'read',         label: '× 3',      icon: '🔁' },
    { key: 'hide',         label: 'Cacher',   icon: '🔒' },
    { key: 'reveal-check', label: 'Vérifier', icon: '✓' },
    { key: 'rate',         label: 'Évaluer',  icon: '⭐' },
  ]
  const currentStepIdx = steps.findIndex(s => s.key === step)

  return (
    <div className="flex items-center justify-center gap-1 mb-2">
      {steps.map((s, i) => {
        const done    = i < currentStepIdx
        const active  = i === currentStepIdx
        return (
          <div key={s.key} className="flex items-center gap-1">
            <div
              className="flex items-center justify-center w-7 h-7 rounded-full text-xs transition-all duration-300"
              style={{
                background: active ? 'rgba(212,175,55,0.2)'  : done ? 'rgba(26,127,75,0.2)' : 'rgba(255,255,255,0.05)',
                border:     active ? '1px solid rgba(212,175,55,0.5)' : done ? '1px solid rgba(26,127,75,0.4)' : '1px solid rgba(255,255,255,0.08)',
                color:      active ? '#d4af37' : done ? '#22c55e' : '#475569',
              }}
            >
              {done ? '✓' : s.icon}
            </div>
            {i < steps.length - 1 && (
              <div className="w-4 h-px" style={{ background: i < currentStepIdx ? 'rgba(26,127,75,0.4)' : 'rgba(255,255,255,0.08)' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}
