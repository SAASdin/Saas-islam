'use client'
// ============================================================
// AyahCard.tsx — Composant central d'affichage d'un verset
//
// ⚠️  RÈGLES D'AFFICHAGE ABSOLUES — NE JAMAIS DÉROGER :
//   1. Texte arabe TOUJOURS EN PREMIER dans le DOM
//   2. dir="rtl" + lang="ar" OBLIGATOIRES sur le conteneur arabe
//   3. Police : Amiri / KFGQPC — JAMAIS Arial / Helvetica
//   4. Un verset est INDIVISIBLE — jamais couper
//   5. Référence obligatoire : NomSourate NuméroSourate:NuméroVerset
// ============================================================

import { useState, useRef, useCallback } from 'react'

// ── Interface des props ───────────────────────────────────────

export interface AyahCardProps {
  surahName: string         // Ex : "Al-Baqarah"
  surahNumber: number       // Ex : 2
  ayahNumber: number        // Ex : 255
  textArabic: string        // ⚠️ Affiché EN PREMIER — RTL — READ ONLY
  translationFr: string     // Affiché en second — LTR
  translationEn?: string    // Optionnel
  audioUrl?: string         // URL mp3 récitation
  onFavorite?: () => void   // Callback favoris
  onBookmark?: () => void   // Callback marque-page
  showTafsir?: boolean      // Panneau Tafsir visible par défaut
}

// ── Styles constants ──────────────────────────────────────────

const BORDER_GREEN = '#1a5c38'
const BORDER_GOLD  = '#c9a84c'

// ── Composant principal ───────────────────────────────────────

export default function AyahCard({
  surahName,
  surahNumber,
  ayahNumber,
  textArabic,
  translationFr,
  translationEn,
  audioUrl,
  onFavorite,
  onBookmark,
  showTafsir: initialShowTafsir = false,
}: AyahCardProps) {
  // État local
  const [isPlaying, setIsPlaying]     = useState(false)
  const [isLoading, setIsLoading]     = useState(false)
  const [isFavorite, setIsFavorite]   = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [tafsirOpen, setTafsirOpen]   = useState(initialShowTafsir)
  const [showEn, setShowEn]           = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Référence coranique — ex : Al-Baqarah 2:255
  const ayahRef = `${surahName} ${surahNumber}:${ayahNumber}`

  // ── Gestion audio ───────────────────────────────────────────
  const toggleAudio = useCallback(async () => {
    if (!audioUrl || isLoading) return

    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl)
      audioRef.current.onended = () => setIsPlaying(false)
      audioRef.current.onerror = () => { setIsLoading(false); setIsPlaying(false) }
      audioRef.current.oncanplaythrough = () => setIsLoading(false)
    }

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
      return
    }

    setIsLoading(true)
    try {
      await audioRef.current.play()
      setIsPlaying(true)
    } catch {
      setIsPlaying(false)
      setIsLoading(false)
    }
  }, [audioUrl, isPlaying, isLoading])

  // ── Favoris ─────────────────────────────────────────────────
  const handleFavorite = () => {
    setIsFavorite(f => !f)
    onFavorite?.()
  }

  // ── Marque-page ─────────────────────────────────────────────
  const handleBookmark = () => {
    setIsBookmarked(b => !b)
    onBookmark?.()
  }

  return (
    <article
      id={`ayah-${surahNumber}-${ayahNumber}`}
      data-ayah-ref={ayahRef}
      className="rounded-2xl overflow-hidden mb-4 transition-shadow hover:shadow-md"
      style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        // Bordure gauche islamique — signature visuelle
        borderLeft: `4px solid ${BORDER_GREEN}`,
      }}
      aria-label={`Verset ${ayahRef}`}
    >

      {/* ═══════════════════════════════════════════════════════
          SECTION 1 : Référence + Actions
          ══════════════════════════════════════════════════════ */}
      <div
        className="flex items-center justify-between px-5 pt-4 pb-3"
        style={{ borderBottom: '1px solid #f3f4f6' }}
      >
        {/* Numéro de verset dans un cercle décoratif */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold flex-shrink-0 select-none"
            style={{
              background: `${BORDER_GREEN}15`,
              border: `2px solid ${BORDER_GREEN}`,
              color: BORDER_GREEN,
            }}
            aria-hidden="true"
          >
            {ayahNumber}
          </div>

          {/* Référence : Sourate + verset */}
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: BORDER_GREEN }}
              data-testid="ayah-reference"
            >
              {ayahRef}
            </p>
            {/* Nom de la sourate en arabe (décoratif) */}
            <p
              dir="rtl"
              lang="ar"
              className="text-xs"
              style={{
                fontFamily: 'var(--font-kfgqpc, var(--font-amiri), serif)',
                color: BORDER_GOLD,
                lineHeight: '1.4',
              }}
            >
              سورة {surahName === 'Al-Fatiha' ? 'الفاتحة' : surahNumber}
            </p>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex items-center gap-1" role="toolbar" aria-label="Actions sur ce verset">

          {/* Audio ▶ / ⏸ */}
          {audioUrl && (
            <button
              onClick={toggleAudio}
              disabled={isLoading}
              className="p-2 rounded-lg transition-all active:scale-95 disabled:opacity-50"
              style={{
                background: isPlaying ? `${BORDER_GREEN}15` : 'transparent',
                color: isPlaying ? BORDER_GREEN : '#6b7280',
              }}
              aria-label={isPlaying ? `Pause — ${ayahRef}` : `Écouter — ${ayahRef}`}
              aria-pressed={isPlaying}
            >
              {isLoading ? (
                <span className="text-sm animate-spin inline-block">⟳</span>
              ) : isPlaying ? (
                <span className="text-sm">⏸</span>
              ) : (
                <span className="text-sm">▶</span>
              )}
            </button>
          )}

          {/* Favoris ⭐ */}
          <button
            onClick={handleFavorite}
            className="p-2 rounded-lg transition-all active:scale-95"
            style={{ color: isFavorite ? '#f59e0b' : '#9ca3af' }}
            aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            aria-pressed={isFavorite}
          >
            <span className="text-sm">{isFavorite ? '⭐' : '☆'}</span>
          </button>

          {/* Marque-page 🔖 */}
          <button
            onClick={handleBookmark}
            className="p-2 rounded-lg transition-all active:scale-95"
            style={{ color: isBookmarked ? BORDER_GOLD : '#9ca3af' }}
            aria-label={isBookmarked ? 'Retirer le marque-page' : 'Ajouter un marque-page'}
            aria-pressed={isBookmarked}
          >
            <span className="text-sm">{isBookmarked ? '🔖' : '🏷️'}</span>
          </button>

          {/* Tafsir 📖 */}
          <button
            onClick={() => setTafsirOpen(t => !t)}
            className="p-2 rounded-lg transition-all active:scale-95"
            style={{ color: tafsirOpen ? BORDER_GREEN : '#9ca3af' }}
            aria-label={tafsirOpen ? 'Masquer le Tafsir' : 'Afficher le Tafsir'}
            aria-expanded={tafsirOpen}
          >
            <span className="text-sm">📖</span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          SECTION 2 : Texte arabe (PREMIER dans le DOM — règle absolue)
          ⚠️  dir="rtl" + lang="ar" OBLIGATOIRES
          ⚠️  Police Amiri/KFGQPC — JAMAIS Arial
          ⚠️  Texte READ ONLY — ne jamais modifier
          ══════════════════════════════════════════════════════ */}
      <div
        className="px-5 pt-5 pb-4"
        style={{ borderBottom: '1px solid #f3f4f6' }}
      >
        <p
          dir="rtl"
          lang="ar"
          data-testid="arabic-text"
          className="text-right leading-loose select-text"
          style={{
            // ⚠️ Police islamique — JAMAIS Arial / Helvetica / system-ui
            fontFamily: 'var(--font-kfgqpc, var(--font-amiri), Scheherazade New, serif)',
            fontSize: '1.8rem',       // 28.8px — lisibilité garantie
            lineHeight: '3rem',       // Espace pour les signes diacritiques
            color: '#111827',
            letterSpacing: 0,         // Jamais modifier l'espacement du texte arabe
            wordSpacing: '0.15em',    // Léger espacement entre les mots
          }}
        >
          {/* ⚠️ textArabic affiché TEL QUEL — READ ONLY */}
          {textArabic}
        </p>

        {/* Décoration : ligne or sous le texte arabe */}
        <div
          className="mt-3 h-px w-16 ml-auto"
          style={{ background: `linear-gradient(to left, ${BORDER_GOLD}, transparent)` }}
          aria-hidden="true"
        />
      </div>

      {/* ═══════════════════════════════════════════════════════
          SECTION 3 : Traduction française (après le texte arabe)
          ══════════════════════════════════════════════════════ */}
      <div className="px-5 py-4">
        <p
          data-testid="translation-fr"
          className="text-sm leading-relaxed"
          style={{ color: '#374151' }}
          lang="fr"
        >
          {translationFr}
        </p>
        <p
          className="mt-1 text-xs"
          style={{ color: BORDER_GREEN + '99' }}
        >
          — Muhammad Hamidullah
        </p>

        {/* Traduction anglaise (optionnelle, masquée par défaut) */}
        {translationEn && (
          <div className="mt-3">
            <button
              onClick={() => setShowEn(e => !e)}
              className="text-xs underline transition-colors"
              style={{ color: '#9ca3af' }}
              aria-expanded={showEn}
            >
              {showEn ? 'Masquer la traduction anglaise' : 'Voir la traduction anglaise (Saheeh Int.)'}
            </button>
            {showEn && (
              <p
                data-testid="translation-en"
                className="mt-2 text-sm leading-relaxed italic"
                style={{ color: '#6b7280' }}
                lang="en"
              >
                {translationEn}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════
          SECTION 4 : Panneau Tafsir (conditionnel)
          ⚠️  Contenu Tafsir READ ONLY — ne jamais résumer auto
          ══════════════════════════════════════════════════════ */}
      {tafsirOpen && (
        <div
          className="px-5 py-4"
          style={{
            background: '#f9fafb',
            borderTop: `3px solid ${BORDER_GOLD}`,
          }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-wide mb-2"
            style={{ color: BORDER_GOLD }}
          >
            Tafsir — {ayahRef}
          </p>
          {/* Zone de contenu Tafsir — à remplir via props futures */}
          <p className="text-sm text-gray-500 italic">
            Contenu Tafsir à charger…
            {/* Intégration future : TafsirPanel ou fetch Tafsir API */}
          </p>
        </div>
      )}
    </article>
  )
}
