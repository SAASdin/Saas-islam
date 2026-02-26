'use client'
// ============================================================
// SRSReview.tsx — Carte de révision SRS (Anki-style)
// Flux : afficher début → utilisateur répond → afficher réponse → noter
// ⚠️  textAr affiché SANS modification (READ ONLY)
// ============================================================

import { useState, useCallback } from 'react'
import type { Bayt, SRSCard, SRSRating } from '@/types/memorization'
import type { Matn } from '@/types/memorization'
import { RATING_LABELS, RATING_COLORS, RATING_NEXT, applyRating } from '@/lib/srs'

type ReviewPhase = 'prompt' | 'input' | 'reveal'

interface SRSReviewProps {
  bayt:    Bayt
  matn:    Matn
  card:    SRSCard
  total:   number   // Total de cartes dans la session
  current: number   // Numéro de la carte actuelle (1-indexed)
  onRated: (card: SRSCard) => void
}

export default function SRSReview({ bayt, matn, card, total, current, onRated }: SRSReviewProps) {
  const [phase, setPhase]   = useState<ReviewPhase>('prompt')
  const [answer, setAnswer] = useState('')

  // Phase 1 : Afficher le début du vers (premier hémistiche) → demander la complétion
  // Phase 2 : Révéler la réponse complète → noter

  const handleReveal = useCallback(() => {
    setPhase('reveal')
  }, [])

  const handleRate = useCallback((rating: SRSRating) => {
    const updated = applyRating(card, rating)
    onRated(updated)
    // Réinitialiser pour la prochaine carte
    setPhase('prompt')
    setAnswer('')
  }, [card, onRated])

  const ratings: SRSRating[] = ['forgot', 'hard', 'good', 'easy']

  // Le "prompt" dépend du type de matn :
  // - verse : montrer le premier hémistiche
  // - prose/hadith : montrer le sujet / début tronqué
  const isVerse = matn.type === 'verse'
  const promptText = isVerse && bayt.firstHalf
    ? bayt.firstHalf
    : bayt.topic ?? bayt.textAr.slice(0, 40) + '…'

  const hasInput = isVerse  // Pour les vers, on peut saisir la complétion

  return (
    <div className="animate-slide-up">
      {/* En-tête session */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-lg">{matn.emoji}</span>
          <div>
            <p className="text-xs text-slate-500">{matn.title}</p>
            <p
              className="text-xs"
              dir="rtl"
              lang="ar"
              style={{ color: '#d4af37', fontFamily: 'var(--font-amiri)' }}
            >
              {matn.titleAr}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold" style={{ color: '#d4af37' }}>
            {current} / {total}
          </p>
          <p className="text-xs text-slate-500">Révision</p>
        </div>
      </div>

      {/* Barre de progression session */}
      <div className="progress-bar-track mb-6">
        <div
          className="progress-bar-fill"
          style={{ width: `${((current - 1) / total) * 100}%` }}
        />
      </div>

      {/* Carte principale */}
      <div
        className="rounded-2xl p-6 mb-5"
        style={{
          background: 'rgba(17,24,39,0.8)',
          border:     '1px solid rgba(255,255,255,0.09)',
          minHeight:  '220px',
          display:    'flex',
          flexDirection: 'column',
          gap:        '1.25rem',
        }}
      >
        {/* Numéro du vers */}
        <p className="text-xs text-slate-500 text-center">
          {matn.type === 'hadith' ? `Hadith n°${bayt.number}` : `Vers n°${bayt.number}`}
          {bayt.topic && ` — ${bayt.topic}`}
        </p>

        {/* Phase PROMPT — afficher le début */}
        {(phase === 'prompt' || phase === 'input') && (
          <div className="text-center animate-fade-in">
            <p className="text-xs text-slate-500 mb-3">
              {isVerse ? 'Complétez le second hémistiche :' : 'De quoi s\'agit-il ?'}
            </p>
            {/* ⚠️ Texte arabe READ ONLY — jamais modifié */}
            <p
              dir="rtl"
              lang="ar"
              className="bayt-text mb-4"
              style={{ color: '#d4af37' }}
            >
              {promptText}
            </p>

            {/* Input de réponse (optionnel, mode vers) */}
            {hasInput && (
              <div className="mt-3">
                <label className="block text-xs text-slate-500 mb-2 text-right" dir="rtl">
                  أكمل البيت…
                </label>
                <textarea
                  className="arabic-input"
                  rows={2}
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  placeholder="اكتب هنا…"
                  dir="rtl"
                  lang="ar"
                  aria-label="Votre réponse en arabe"
                />
              </div>
            )}
          </div>
        )}

        {/* Phase REVEAL — afficher la réponse complète */}
        {phase === 'reveal' && (
          <div className="animate-flip-in text-center">
            {/* Vers complet — READ ONLY */}
            <p
              dir="rtl"
              lang="ar"
              className="bayt-text mb-3"
              style={{ color: '#f1f5f9' }}
            >
              {/* ⚠️ textAr SACRÉ — afficher SANS modification */}
              {bayt.textAr}
            </p>

            {/* Séparateur */}
            <div className="gold-line my-3" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)', height: '1px' }} />

            {/* Traduction française (si disponible) */}
            {bayt.textFr && (
              <p className="text-sm text-slate-400 leading-relaxed italic">
                « {bayt.textFr} »
              </p>
            )}

            {/* Votre réponse vs la bonne réponse (si input) */}
            {hasInput && answer.trim() && (
              <div
                className="mt-3 p-3 rounded-lg text-left"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <p className="text-xs text-slate-500 mb-1">Votre réponse :</p>
                <p
                  dir="rtl"
                  lang="ar"
                  className="text-sm"
                  style={{ fontFamily: 'var(--font-amiri)', color: '#94a3b8' }}
                >
                  {answer}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Boutons d'action */}
      {phase !== 'reveal' ? (
        <button
          onClick={handleReveal}
          className="w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:brightness-110"
          style={{
            background: 'linear-gradient(135deg, #1a7f4b 0%, #15803d 100%)',
            color:      '#fff',
            boxShadow:  '0 4px 16px rgba(26,127,75,0.3)',
          }}
        >
          Afficher la réponse
        </button>
      ) : (
        <div>
          <p className="text-xs text-slate-500 text-center mb-3">Comment était-ce ?</p>
          <div className="flex gap-2">
            {ratings.map(rating => {
              const colors = RATING_COLORS[rating]
              return (
                <button
                  key={rating}
                  onClick={() => handleRate(rating)}
                  className="rating-btn"
                  style={{
                    background:  colors.bg,
                    borderColor: colors.border,
                    color:       colors.text,
                  }}
                  title={`Prochain rappel : ${RATING_NEXT[rating]}`}
                >
                  <div>{RATING_LABELS[rating]}</div>
                  <div className="text-xs opacity-70 mt-0.5">{RATING_NEXT[rating]}</div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
