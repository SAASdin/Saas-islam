// ============================================================
// AyahDisplay.tsx — Affichage d'un verset coranique — Design premium
// ⚠️  RÈGLES ABSOLUES :
//   - textUthmani affiché SANS AUCUNE transformation
//   - dir="rtl" et lang="ar" OBLIGATOIRES sur le texte arabe
//   - Ne jamais couper un verset en milieu d'affichage
//   - Référence toujours visible (Sourate:Verset)
//   - Traduction auto → badge obligatoire
// ============================================================

import type { AyahWithTranslation } from '@/types/quran'
import { formatAyahRef } from '@/types/quran'
import { AyahPlayButton } from './AudioPlayer'

interface AyahDisplayProps {
  ayah: AyahWithTranslation
  translationFr?: string
  isAutoTranslation?: boolean
  showTransliteration?: boolean
  fontSize?: number
}

export default function AyahDisplay({
  ayah,
  translationFr,
  isAutoTranslation = false,
  fontSize = 1.8,
}: AyahDisplayProps) {
  const safeFontSize = Math.max(1.2, fontSize)
  const surahName = ayah.surah?.nameTransliteration ?? `Sourate ${ayah.surahId}`
  const ref = formatAyahRef(surahName, ayah.surahId, ayah.ayahNumber)

  return (
    <article
      className="py-7 animate-fade-in"
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
      aria-label={`Verset ${ref}`}
    >
      {/* ── Texte arabe coranique ─────────────────────────── */}
      {/*
        ⚠️  ZONE SACRÉE
        - dir="rtl" lang="ar" OBLIGATOIRES
        - textUthmani copié sans aucune transformation
        - Un verset = une unité indivisible
      */}
      <div className="flex items-start gap-3 flex-row-reverse mb-5">

        {/* Badge numéro de verset — doré */}
        <span
          className="ayah-number mt-1 flex-shrink-0"
          aria-hidden="true"
        >
          {ayah.ayahNumber}
        </span>

        {/* Texte coranique — SACRÉ */}
        <p
          dir="rtl"
          lang="ar"
          className="quran-text flex-1 leading-loose text-slate-100"
          style={{
            fontSize: `${safeFontSize}rem`,
            lineHeight: `${safeFontSize * 1.8}rem`,
            fontFamily: 'var(--font-kfgqpc, var(--font-amiri))',
          }}
        >
          {/* ⚠️ Rendu tel quel depuis la BDD — JAMAIS transformer */}
          {ayah.textUthmani}
        </p>
      </div>

      {/* ── Traduction française ──────────────────────────── */}
      {translationFr && (
        <div
          className="mt-3 ml-4 pl-4"
          style={{ borderLeft: '2px solid rgba(212,175,55,0.3)' }}
        >
          {/* Badge traduction automatique — OBLIGATOIRE si isAutoTranslation */}
          {isAutoTranslation && (
            <span className="auto-translation-badge mb-2 inline-flex">
              ⚠️ Traduction automatique non vérifiée
            </span>
          )}

          <p className="text-slate-400 text-base leading-relaxed">
            {translationFr}
          </p>

          {/* Référence — toujours visible */}
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-slate-500 font-medium">
              — {ref}
              {!isAutoTranslation && ' · Hamidullah'}
            </p>
            {/* Bouton play */}
            <AyahPlayButton ayahNumberQuran={ayah.ayahNumberQuran} />
          </div>
        </div>
      )}

      {/* Si pas de traduction — afficher juste le bouton play */}
      {!translationFr && (
        <div className="flex justify-end mt-2 pr-2">
          <AyahPlayButton ayahNumberQuran={ayah.ayahNumberQuran} />
        </div>
      )}

      {/* Indicateur de sajda (prosternation) */}
      {ayah.sajda && (
        <div
          className="mt-3 flex items-center gap-2 text-xs px-3 py-2 rounded-lg"
          style={{
            background: 'rgba(21,128,61,0.1)',
            color: '#22c55e',
            border: '1px solid rgba(21,128,61,0.2)',
          }}
        >
          <span aria-hidden="true">🌙</span>
          <span>Verset de prosternation (Sajda)</span>
        </div>
      )}
    </article>
  )
}
