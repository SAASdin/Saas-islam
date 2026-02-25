'use client'
// ============================================================
// /memorize — File de mémorisation SRS
// Lit la queue localStorage noorapp-memorize-queue
// ============================================================
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { getVerse, TRANSLATIONS, getVerseText } from '@/lib/quran-cdn-api'
import { sanitizeTranslation } from '@/lib/sanitize'
import type { QdcVerse } from '@/lib/quran-cdn-api'

const QUEUE_KEY = 'noorapp-memorize-queue'
const MASTERED_KEY = 'noorapp-memorize-mastered'

type SRSLevel = 0 | 1 | 2 | 3 | 4  // 0=nouveau → 4=maîtrisé

interface SRSCard {
  verseKey: string
  level: SRSLevel
  nextReview: number  // timestamp
  reviews: number
}

function getSRSCards(): SRSCard[] {
  if (typeof window === 'undefined') return []
  try {
    const q: string[] = JSON.parse(localStorage.getItem(QUEUE_KEY) ?? '[]')
    const mastered: Record<string, SRSCard> = JSON.parse(localStorage.getItem(MASTERED_KEY) ?? '{}')
    return q.map(key => mastered[key] ?? { verseKey: key, level: 0, nextReview: Date.now(), reviews: 0 })
  } catch { return [] }
}

function saveSRSCard(card: SRSCard): void {
  if (typeof window === 'undefined') return
  const mastered: Record<string, SRSCard> = JSON.parse(localStorage.getItem(MASTERED_KEY) ?? '{}')
  mastered[card.verseKey] = card
  localStorage.setItem(MASTERED_KEY, JSON.stringify(mastered))
}

// Intervalles SRS en ms : 0→1j, 1→3j, 2→7j, 3→14j, 4→maîtrisé
const SRS_INTERVALS = [0, 86400000, 259200000, 604800000, 1209600000]

function getNextInterval(level: SRSLevel, correct: boolean): { newLevel: SRSLevel; delay: number } {
  if (correct) {
    const newLevel = Math.min(4, level + 1) as SRSLevel
    return { newLevel, delay: SRS_INTERVALS[newLevel] }
  } else {
    const newLevel = Math.max(0, level - 1) as SRSLevel
    return { newLevel, delay: SRS_INTERVALS[0] }
  }
}

export default function MemorizePage() {
  const [cards, setCards] = useState<SRSCard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [verse, setVerse] = useState<QdcVerse | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [loading, setLoading] = useState(false)
  const [session, setSession] = useState({ correct: 0, incorrect: 0, total: 0 })

  const dueCards = cards.filter(c => c.nextReview <= Date.now())
  const current = dueCards[currentIndex]

  useEffect(() => {
    setCards(getSRSCards())
  }, [])

  useEffect(() => {
    if (!current) return
    setLoading(true)
    setShowAnswer(false)
    setVerse(null)
    getVerse(current.verseKey, { translations: [TRANSLATIONS.hamidullah_fr] })
      .then(({ verse }) => setVerse(verse))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [current?.verseKey])

  const handleAnswer = useCallback((correct: boolean) => {
    if (!current) return
    const { newLevel, delay } = getNextInterval(current.level, correct)
    const updated: SRSCard = {
      ...current,
      level: newLevel,
      nextReview: Date.now() + delay,
      reviews: current.reviews + 1,
    }
    saveSRSCard(updated)
    setSession(s => ({
      ...s,
      correct: s.correct + (correct ? 1 : 0),
      incorrect: s.incorrect + (correct ? 0 : 1),
      total: s.total + 1,
    }))
    setCurrentIndex(i => i + 1)
  }, [current])

  const removeFromQueue = useCallback((verseKey: string) => {
    const q: string[] = JSON.parse(localStorage.getItem(QUEUE_KEY) ?? '[]')
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q.filter(k => k !== verseKey)))
    setCards(getSRSCards())
  }, [])

  const SRS_LABELS = ['Nouveau', 'Débutant', 'Intermédiaire', 'Avancé', 'Maîtrisé']
  const SRS_COLORS = ['bg-slate-500', 'bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500']

  // Aucun verset en file
  if (cards.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-4">📚</div>
        <h1 className="text-2xl font-bold text-white mb-3">File de mémorisation</h1>
        <p className="text-slate-400 mb-6">
          Votre file est vide. Ajoutez des versets à mémoriser depuis la page de lecture en cliquant sur &quot;Mémoriser&quot;.
        </p>
        <Link href="/surah/1" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors">
          Lire le Coran →
        </Link>
      </div>
    )
  }

  // Session terminée
  if (dueCards.length === 0 || currentIndex >= dueCards.length) {
    const nextReview = Math.min(...cards.map(c => c.nextReview))
    const nextDate = new Date(nextReview)
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-white mb-3">Session terminée !</h1>
        {session.total > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-6 max-w-xs mx-auto">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
              <p className="text-2xl font-bold text-emerald-400">{session.correct}</p>
              <p className="text-slate-400 text-xs">Correct</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
              <p className="text-2xl font-bold text-red-400">{session.incorrect}</p>
              <p className="text-slate-400 text-xs">À revoir</p>
            </div>
          </div>
        )}
        <p className="text-slate-400 text-sm mb-6">
          Prochain rappel : {nextDate.toLocaleDateString('fr-FR', { weekday: 'long', hour: '2-digit', minute: '2-digit' })}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => { setCurrentIndex(0); setSession({ correct:0, incorrect:0, total:0 }) }}
            className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl transition-colors text-sm">
            Recommencer
          </button>
          <Link href="/surah/1" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors text-sm">
            Continuer la lecture
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Mémorisation</h1>
          <p className="text-slate-500 text-xs">{currentIndex + 1} / {dueCards.length} cartes du jour</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-emerald-400">✓ {session.correct}</span>
          <span className="text-red-400">✗ {session.incorrect}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-white/10 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-emerald-400 rounded-full transition-all"
          style={{ width: `${(currentIndex / dueCards.length) * 100}%` }}
        />
      </div>

      {/* Carte SRS */}
      <div className="bg-white/3 border border-white/10 rounded-2xl overflow-hidden">
        {/* Niveau SRS */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <span className="text-slate-500 text-xs">{current.verseKey}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full text-white ${SRS_COLORS[current.level]}`}>
            {SRS_LABELS[current.level]}
          </span>
        </div>

        {/* Question — texte arabe */}
        <div className="p-6 min-h-48 flex items-center justify-center">
          {loading ? (
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          ) : verse ? (
            <p
              className="quran-text text-3xl text-amber-100/90 text-right leading-relaxed w-full"
              dir="rtl" lang="ar"
            >
              {getVerseText(verse)}
            </p>
          ) : null}
        </div>

        {/* Réponse — traduction */}
        {showAnswer && verse && (
          <div className="px-6 pb-4 border-t border-white/10 pt-4">
            <p className="text-slate-300 text-sm leading-relaxed italic">
              {sanitizeTranslation(verse.translations?.[0]?.text ?? '')}
            </p>
            <p className="text-slate-600 text-xs mt-1">Hamidullah</p>
          </div>
        )}

        {/* Boutons */}
        <div className="p-4 bg-black/10">
          {!showAnswer ? (
            <button
              onClick={() => setShowAnswer(true)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-colors"
            >
              Voir la traduction
            </button>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => handleAnswer(false)}
                className="py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium rounded-xl transition-colors text-sm">
                ✗ Difficile
              </button>
              <button onClick={() => handleAnswer(true)}
                className="py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-medium rounded-xl transition-colors text-sm">
                ~ Hésitation
              </button>
              <button onClick={() => handleAnswer(true)}
                className="py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-medium rounded-xl transition-colors text-sm">
                ✓ Facile
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Supprimer de la file */}
      <button
        onClick={() => { removeFromQueue(current.verseKey); setCurrentIndex(i => Math.max(0, i)) }}
        className="mt-3 w-full text-xs text-slate-600 hover:text-slate-400 transition-colors py-2"
      >
        Retirer ce verset de la file
      </button>

      {/* Liste versets en attente */}
      <div className="mt-6">
        <p className="text-slate-500 text-xs mb-2">{cards.length} versets dans la file totale</p>
        <div className="flex flex-wrap gap-1.5">
          {cards.slice(0, 20).map(c => (
            <Link key={c.verseKey} href={`/surah/${c.verseKey.split(':')[0]}/${c.verseKey.split(':')[1]}`}
              className={`text-xs px-2 py-0.5 rounded-full border ${SRS_COLORS[c.level]}/20 text-white/60 border-white/10 hover:border-white/20`}>
              {c.verseKey}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
