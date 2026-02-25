// ============================================================
// MatnCard.tsx — Carte d'un matn sur la page d'accueil
// ============================================================

import Link from 'next/link'
import type { Matn } from '@/types/memorization'
import type { MatnProgress } from '@/types/memorization'

interface MatnCardProps {
  matn: Matn
  progress: MatnProgress
  dueCount: number
}

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner:     'Débutant',
  intermediate: 'Intermédiaire',
  advanced:     'Avancé',
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner:     '#22c55e',
  intermediate: '#fbbf24',
  advanced:     '#ef4444',
}

const SUBJECT_LABELS: Record<string, string> = {
  mustalah:  'Mustalah Hadith',
  tajweed:   'Tajweed',
  nahw:      'Grammaire (Nahw)',
  'usul-fiqh': 'Usul al-Fiqh',
  hadith:    'Hadith',
  aqida:     'Aqida',
}

export default function MatnCard({ matn, progress, dueCount }: MatnCardProps) {
  const mastery = progress.totalBayt > 0
    ? Math.round((progress.masteredBayt / progress.totalBayt) * 100)
    : 0

  const seen = progress.seenBayt
  const isCompleted = mastery === 100

  return (
    <Link href={`/matn/${matn.id}`} className="block group">
      <article
        className="p-5 rounded-2xl transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, rgba(26,34,53,0.8) 0%, rgba(17,24,39,0.9) 100%)',
          border: `1px solid ${isCompleted ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.07)'}`,
          boxShadow: isCompleted ? '0 0 20px rgba(212,175,55,0.1)' : 'none',
        }}
      >
        {/* En-tête */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3">
            {/* Emoji */}
            <span className="text-3xl flex-shrink-0 mt-0.5">{matn.emoji}</span>
            <div>
              {/* Titre translittéré */}
              <h3 className="font-bold text-slate-100 text-base leading-tight mb-0.5">
                {matn.title}
              </h3>
              {/* Titre arabe — SACRÉ */}
              <p
                dir="rtl"
                lang="ar"
                className="text-sm"
                style={{ color: '#d4af37', fontFamily: 'var(--font-amiri)' }}
              >
                {/* ⚠️ titleAr READ ONLY */}
                {matn.titleAr}
              </p>
            </div>
          </div>

          {/* Badge "dû" ou "complété" */}
          {isCompleted ? (
            <span
              className="flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-bold"
              style={{ background: 'rgba(212,175,55,0.15)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.3)' }}
            >
              ✓ Maîtrisé
            </span>
          ) : dueCount > 0 ? (
            <span
              className="flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-bold animate-pulse"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              {dueCount} à réviser
            </span>
          ) : null}
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color:      '#94a3b8',
              border:     '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {SUBJECT_LABELS[matn.subject] ?? matn.subject}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              color:   DIFFICULTY_COLORS[matn.difficulty] ?? '#94a3b8',
              border:  `1px solid ${DIFFICULTY_COLORS[matn.difficulty] ?? '#94a3b8'}40`,
              background: `${DIFFICULTY_COLORS[matn.difficulty] ?? '#94a3b8'}15`,
            }}
          >
            {DIFFICULTY_LABELS[matn.difficulty]}
          </span>
          <span className="text-xs text-slate-500">
            {matn.totalBayt} {matn.type === 'verse' ? 'vers' : 'sections'}
          </span>
        </div>

        {/* Auteur — arabe + latin */}
        <p className="text-xs text-slate-500 mb-3">
          {matn.author}
          {' · '}
          <span dir="rtl" lang="ar" style={{ fontFamily: 'var(--font-amiri)' }}>
            {matn.authorAr}
          </span>
        </p>

        {/* Barre de progression */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span style={{ color: '#64748b' }}>
              {seen} / {matn.totalBayt} étudiés
            </span>
            <span style={{ color: mastery > 0 ? '#d4af37' : '#475569', fontWeight: 700 }}>
              {mastery}% maîtrisé
            </span>
          </div>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${mastery}%` }}
            />
          </div>
        </div>

        {/* Flèche hover */}
        <div
          className="text-xs mt-2 flex items-center gap-1 transition-all duration-200 group-hover:gap-2"
          style={{ color: '#475569' }}
        >
          <span>Commencer la mémorisation</span>
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
          </svg>
        </div>
      </article>
    </Link>
  )
}
