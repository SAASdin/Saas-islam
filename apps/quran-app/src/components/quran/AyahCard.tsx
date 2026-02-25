'use client'
// ============================================================
// AyahCard.tsx — Carte d'un verset coranique
// ⚠️  RÈGLES ABSOLUES :
//   - dir="rtl" lang="ar" OBLIGATOIRES sur le texte arabe
//   - Texte arabe : JAMAIS trim(), replace(), toLowerCase()
//   - Police : font-quran (Amiri/KFGQPC) — JAMAIS Arial
// ============================================================

import { useState } from 'react'
import type { Ayah, AyahTranslation } from '@/types/quran'
import AyahAudio from './AyahAudio'

interface AyahCardProps {
  ayah: Ayah
  translation?: AyahTranslation
  surahId: number
  /** Callback pour ouvrir le tafsir */
  onTafsir?: (ayahId: number) => void
  /** Callback pour partager */
  onShare?: (ayahId: number) => void
  className?: string
}

export default function AyahCard({
  ayah,
  translation,
  surahId,
  onTafsir,
  onShare,
  className = '',
}: AyahCardProps) {
  const [highlighted, setHighlighted] = useState(false)

  return (
    <article
      id={`ayah-${ayah.ayahNumber}`}
      className={`group rounded-xl p-6 mb-4 transition-all duration-200 ${highlighted ? 'ring-1 ring-gold-500/40' : ''} ${className}`}
      style={{
        background: highlighted
          ? 'rgba(212,175,55,0.05)'
          : 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* En-tête : numéro de verset + actions */}
      <div className="flex items-center justify-between mb-5">
        {/* Numéro du verset */}
        <div
          className="flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold flex-shrink-0"
          style={{
            background: 'rgba(212,175,55,0.15)',
            border: '1px solid rgba(212,175,55,0.3)',
            color: '#d4af37',
          }}
          aria-label={`Verset ${ayah.ayahNumber}`}
        >
          {ayah.ayahNumber}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Audio */}
          <AyahAudio
            ayahNumberQuran={ayah.ayahNumberQuran}
            surahId={surahId}
            ayahNumber={ayah.ayahNumber}
          />

          {/* Tafsir */}
          {onTafsir && (
            <button
              onClick={() => onTafsir(ayah.id)}
              className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 transition-colors"
              title="Voir le Tafsir"
              aria-label="Voir le Tafsir de ce verset"
            >
              <span className="text-xs">📖</span>
            </button>
          )}

          {/* Surligner */}
          <button
            onClick={() => setHighlighted(h => !h)}
            className="p-2 rounded-lg text-slate-400 hover:text-gold-400 transition-colors"
            title={highlighted ? 'Retirer le surlignage' : 'Surligner ce verset'}
            aria-label={highlighted ? 'Retirer le surlignage' : 'Surligner ce verset'}
          >
            <span className="text-xs">{highlighted ? '★' : '☆'}</span>
          </button>

          {/* Partager */}
          {onShare && (
            <button
              onClick={() => onShare(ayah.id)}
              className="p-2 rounded-lg text-slate-400 hover:text-blue-400 transition-colors"
              title="Partager ce verset"
              aria-label="Partager ce verset"
            >
              <span className="text-xs">🔗</span>
            </button>
          )}
        </div>
      </div>

      {/* Texte arabe ⚠️ SACRÉ */}
      <p
        dir="rtl"
        lang="ar"
        className="quran-text text-right mb-5 leading-loose"
        style={{
          fontFamily: 'var(--font-amiri)',
          fontSize: '1.8rem',
          color: '#f1f5f9',
          letterSpacing: 0,
          // ⚠️ Ne jamais modifier ce texte — affiché tel quel depuis la BDD
        }}
      >
        {ayah.textUthmani}
      </p>

      {/* Séparateur */}
      <div
        className="border-t mb-4"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      />

      {/* Traduction française */}
      {translation ? (
        <div className="space-y-1">
          <p className="text-slate-200 leading-relaxed text-sm">
            {translation.translation}
          </p>
          <p className="text-slate-600 text-xs">
            — {translation.translatorName}
          </p>
        </div>
      ) : (
        <p className="text-slate-600 text-sm italic">
          Traduction non disponible
        </p>
      )}

      {/* Sajda (prosternation) */}
      {ayah.sajda && (
        <div
          className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
          style={{
            background: 'rgba(21,128,61,0.1)',
            border: '1px solid rgba(21,128,61,0.2)',
            color: '#22c55e',
          }}
        >
          🕌 Prosternation {ayah.sajdaType === 'obligatory' ? '(obligatoire)' : '(recommandée)'}
        </div>
      )}
    </article>
  )
}
