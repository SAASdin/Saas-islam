// ============================================================
// AyahDisplay.tsx — Affichage d'un verset coranique
// ⚠️  RÈGLES ABSOLUES :
//   - textUthmani affiché SANS AUCUNE transformation
//   - dir="rtl" et lang="ar" OBLIGATOIRES sur le texte arabe
//   - Ne jamais couper un verset en milieu d'affichage
//   - Référence toujours visible (Sourate:Verset)
//   - Traduction auto → badge obligatoire
// ============================================================

import type { AyahWithTranslation } from '@/types/quran'
import { formatAyahRef } from '@/types/quran'

interface AyahDisplayProps {
  ayah: AyahWithTranslation
  translationFr?: string
  isAutoTranslation?: boolean   // Si true → afficher le badge obligatoire
  showTransliteration?: boolean
  fontSize?: number             // En rem (min 1.0)
}

export default function AyahDisplay({
  ayah,
  translationFr,
  isAutoTranslation = false,
  fontSize = 1.5,
}: AyahDisplayProps) {
  // Taille minimale imposée : 1rem (16px)
  const safeFontSize = Math.max(1.0, fontSize)

  // Référence du verset
  const surahName = ayah.surah?.nameTransliteration ?? `Sourate ${ayah.surahId}`
  const ref = formatAyahRef(surahName, ayah.surahId, ayah.ayahNumber)

  return (
    <article
      className="
        py-6 border-b border-gray-100 dark:border-gray-800
        last:border-0 animate-fade-in
      "
      aria-label={`Verset ${ref}`}
    >
      {/* ── Texte arabe coranique ─────────────────────────── */}
      {/*
        ⚠️  ZONE SACRÉE
        - dir="rtl" lang="ar" OBLIGATOIRES
        - textUthmani copié sans aucune transformation
        - Un verset = une unité indivisible
      */}
      <div className="flex items-start gap-3 flex-row-reverse">

        {/* Badge numéro de verset */}
        <span className="ayah-number mt-1 flex-shrink-0" aria-hidden="true">
          {ayah.ayahNumber}
        </span>

        {/* Texte coranique — SACRÉ */}
        <p
          dir="rtl"
          lang="ar"
          className="quran-text flex-1 leading-loose"
          style={{ fontSize: `${safeFontSize}rem`, lineHeight: `${safeFontSize * 1.8}rem` }}
        >
          {/* ⚠️ Rendu tel quel depuis la BDD — JAMAIS transformer */}
          {ayah.textUthmani}
        </p>
      </div>

      {/* ── Traduction française ──────────────────────────── */}
      {translationFr && (
        <div className="mt-4 pl-4 border-l-2 border-islam-200 dark:border-islam-800">

          {/* Badge traduction automatique — OBLIGATOIRE si isAutoTranslation */}
          {isAutoTranslation && (
            <span className="auto-translation-badge mb-2 inline-flex">
              ⚠️ Traduction automatique non vérifiée
            </span>
          )}

          <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
            {translationFr}
          </p>

          {/* Référence — toujours visible */}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-medium">
            — {ref}
            {!isAutoTranslation && ' · Hamidullah'}
          </p>
        </div>
      )}

      {/* Indicateur de sajda (prosternation) */}
      {ayah.sajda && (
        <div className="mt-2 flex items-center gap-2 text-xs text-islam-600 dark:text-islam-400">
          <span aria-hidden="true">🌙</span>
          <span>Verset de prosternation (Sajda)</span>
        </div>
      )}
    </article>
  )
}
