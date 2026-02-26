'use client'
// ============================================================
// AyahCardV2.tsx — Carte verset (identique Quran.com)
// ⚠️  textUthmani SACRÉ — jamais modifié, jamais tronqué
// ⚠️  dir="rtl" lang="ar" obligatoires sur le texte arabe
// ============================================================
import { useState, useCallback } from 'react'
import { usePlayer } from '@/store/player'
import { useSettings } from '@/store/settings'
import type { QdcWord, QdcTranslation } from '@/lib/quran-cdn-api'
import { sanitizeTranslation } from '@/lib/sanitize'
import { ALL_TRANSLATIONS } from '@/lib/translations-catalog'

function getTranslationMeta(id: number) {
  return ALL_TRANSLATIONS.find(t => t.id === id) ?? { flag: '📖', author: `ID ${id}`, language: '' }
}
import WordByWord from './WordByWord'
import ShareVerse from './ShareVerse'
import TajweedText from './TajweedText'

interface AyahCardV2Props {
  verseKey: string            // "1:1"
  textUthmani: string         // ⚠️ SACRÉ
  translations?: QdcTranslation[]
  words?: QdcWord[]
  surahName: string
  surahId: number
  ayahCount: number
  showWordByWord?: boolean
  showTransliteration?: boolean
  showTajweed?: boolean
  fontSize?: number
  isActive?: boolean
  onOpenTafsir?: (verseKey: string) => void
  meta?: {
    juz_number?: number
    hizb_number?: number
    rub_el_hizb_number?: number
    page_number?: number
    sajdah_number?: number | null
    manzil_number?: number
  }
}

export default function AyahCardV2({
  verseKey,
  textUthmani,
  translations,
  words,
  surahName,
  surahId,
  ayahCount,
  showWordByWord,
  showTransliteration,
  showTajweed,
  fontSize,
  isActive,
  onOpenTafsir,
  meta,
}: AyahCardV2Props) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [copied, setCopied] = useState(false)
  const [actionsVisible, setActionsVisible] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  const { isPlaying, currentVerse, setVerse, setPlaying } = usePlayer()
  const { reciterSlug, primaryTranslation, selectedTranslations, showTranslation } = useSettings()

  const [surahNum, ayahNum] = verseKey.split(':').map(Number)

  // Toutes les traductions actives disponibles pour ce verset
  const activeTranslations = translations?.filter(t => selectedTranslations.includes(t.resource_id)) ?? []
  // Fallback si aucune traduction active n'est disponible dans la réponse
  const displayTranslations = activeTranslations.length > 0
    ? activeTranslations
    : (translations?.slice(0, 2) ?? [])

  const isThisPlaying = currentVerse === verseKey && isPlaying

  // Play/pause ce verset
  const handlePlay = useCallback(() => {
    if (currentVerse === verseKey) {
      setPlaying(!isPlaying)
    } else {
      setVerse(verseKey, surahName, surahId, ayahCount)
      setPlaying(true)
    }
  }, [currentVerse, verseKey, isPlaying, setVerse, setPlaying, surahName, surahId, ayahCount])

  // Copie
  const handleCopy = useCallback(async () => {
    const primary = displayTranslations[0]; const text = `${textUthmani}\n${primary?.text ? sanitizeTranslation(primary.text) : ""}\n(${verseKey})`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [textUthmani, displayTranslations, verseKey])

  // Favori
  const handleFavorite = useCallback(() => {
    const key = 'noorapp-favorites'
    const stored: string[] = JSON.parse(localStorage.getItem(key) ?? '[]')
    if (isFavorite) {
      localStorage.setItem(key, JSON.stringify(stored.filter(k => k !== verseKey)))
    } else {
      localStorage.setItem(key, JSON.stringify([...stored, verseKey]))
    }
    setIsFavorite(!isFavorite)
  }, [isFavorite, verseKey])

  // Marque-page
  const handleBookmark = useCallback(() => {
    const key = 'noorapp-bookmarks'
    const stored: string[] = JSON.parse(localStorage.getItem(key) ?? '[]')
    if (isBookmarked) {
      localStorage.setItem(key, JSON.stringify(stored.filter(k => k !== verseKey)))
    } else {
      localStorage.setItem(key, JSON.stringify([...stored, verseKey]))
    }
    setIsBookmarked(!isBookmarked)
  }, [isBookmarked, verseKey])

  const textSize = fontSize ? `${fontSize}px` : '1.75rem'

  return (
    <div
      id={`ayah-${verseKey}`}
      className={`group relative px-4 md:px-8 py-5 border-b border-white/5 transition-all hover:bg-white/[0.02] ${
        isActive || currentVerse === verseKey ? 'bg-emerald-500/5 border-l-2 border-l-emerald-500' : ''
      }`}
      onMouseEnter={() => setActionsVisible(true)}
      onMouseLeave={() => setActionsVisible(false)}
    >
      {/* ── Barre supérieure : n° verset + actions ─── */}
      <div className="flex items-center justify-between mb-4">
        {/* Numéro verset dans cercle décoratif */}
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 shrink-0">
            {/* Étoile décorative SVG */}
            <svg viewBox="0 0 40 40" className="w-8 h-8 text-emerald-500/40" fill="currentColor">
              <path d="M20 0 L24 16 L40 20 L24 24 L20 40 L16 24 L0 20 L16 16 Z"/>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-emerald-300">
              {ayahNum}
            </span>
          </div>

          {/* Métadonnées */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-600 font-mono">{verseKey}</span>
            {meta?.sajdah_number != null && (
              <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full">
                ۩ سجدة {meta.sajdah_number}
              </span>
            )}
            {meta?.juz_number && (
              <span className="text-[10px] text-slate-600 bg-white/4 px-1.5 py-0.5 rounded-full hidden sm:inline">
                ج{meta.juz_number}
              </span>
            )}
            {meta?.hizb_number && meta.hizb_number % 1 === 0 && (
              <span className="text-[10px] text-slate-600 bg-white/4 px-1.5 py-0.5 rounded-full hidden sm:inline">
                ح{meta.hizb_number}
              </span>
            )}
            {meta?.page_number && (
              <span className="text-[10px] text-slate-600 hidden md:inline">
                p.{meta.page_number}
              </span>
            )}
          </div>
        </div>

        {/* Actions (visible au hover ou sur mobile) */}
        <div className={`flex items-center gap-1 transition-opacity ${
          actionsVisible ? 'opacity-100' : 'opacity-0 md:opacity-0'
        } sm:opacity-100`}>
          {/* Play */}
          <button
            onClick={handlePlay}
            className={`p-1.5 rounded-md transition-colors ${
              isThisPlaying
                ? 'text-emerald-400 bg-emerald-500/15'
                : 'text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10'
            }`}
            title={isThisPlaying ? 'Pause' : 'Écouter ce verset'}
          >
            {isThisPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          {/* Copier */}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
            title={copied ? 'Copié !' : 'Copier le verset'}
          >
            {copied ? (
              <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>

          {/* Favori */}
          <button
            onClick={handleFavorite}
            className={`p-1.5 rounded-md transition-colors ${
              isFavorite ? 'text-amber-400' : 'text-slate-500 hover:text-amber-400 hover:bg-amber-500/10'
            }`}
            title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <svg className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          {/* Marque-page */}
          <button
            onClick={handleBookmark}
            className={`p-1.5 rounded-md transition-colors ${
              isBookmarked ? 'text-blue-400' : 'text-slate-500 hover:text-blue-400 hover:bg-blue-500/10'
            }`}
            title={isBookmarked ? 'Retirer le marque-page' : 'Marquer ce verset'}
          >
            <svg className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>

          {/* Tafsir */}
          {onOpenTafsir && (
            <button
              onClick={() => onOpenTafsir(verseKey)}
              className="p-1.5 rounded-md text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
              title="Ouvrir le Tafsir"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </button>
          )}

          {/* Partage Premium */}
          <button
            onClick={() => setShareOpen(true)}
            className="p-1.5 rounded-md text-slate-500 hover:text-purple-400 hover:bg-purple-500/10 transition-colors"
            title="Partager ce verset"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Texte arabe ─────────────────────────────── */}
      {showWordByWord && words && words.length > 0 ? (
        <WordByWord
          words={words}
          verseKey={verseKey}
          showTransliteration={showTransliteration}
          fontSize={fontSize}
        />
      ) : showTajweed ? (
        <TajweedText
          verseKey={verseKey}
          fallbackText={textUthmani}
          fontSize={fontSize}
        />
      ) : (
        <p
          className="quran-text leading-loose text-right mb-4 text-white/90 transition-all"
          dir="rtl"
          lang="ar"
          style={{ fontSize: textSize }}
        >
          {/* ⚠️ textUthmani SACRÉ — affiché tel quel, SANS modification */}
          {textUthmani}
        </p>
      )}

      {/* ── Traduction ──────────────────────────────── */}
      {showTranslation && displayTranslations.length > 0 && (
        <div className="mt-3 space-y-2">
          {displayTranslations.map((trad, i) => {
            const meta = getTranslationMeta(trad.resource_id)
            const isPrimary = trad.resource_id === primaryTranslation
            return (
              <div key={trad.resource_id} className={`pl-4 border-l-2 ${isPrimary ? 'border-emerald-500/40' : 'border-white/10'}`}>
                <p className={`text-sm leading-relaxed ${isPrimary ? 'text-slate-200' : 'text-slate-400'}`}>
                  {sanitizeTranslation(trad.text)}
                </p>
                <p className="text-slate-600 text-xs mt-0.5">
                  {meta.flag} {meta.author} · {meta.language}
                  {/* Label traduction automatique — requis par SOUL.md */}
                  {' '}· <span className="text-slate-700">Traduction</span>
                </p>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Partage premium ─────────────────────────── */}
      <ShareVerse
        verseKey={verseKey}
        textUthmani={textUthmani}
        translationText={displayTranslations[0]?.text}
        surahName={surahName}
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
      />

      {/* ── Mémoriser ───────────────────────────────── */}
      <div className={`mt-3 flex items-center gap-2 transition-opacity ${
        actionsVisible ? 'opacity-100' : 'opacity-0'
      }`}>
        <button
          onClick={() => {
            const stored: string[] = JSON.parse(localStorage.getItem('noorapp-memorize-queue') ?? '[]')
            if (!stored.includes(verseKey)) {
              localStorage.setItem('noorapp-memorize-queue', JSON.stringify([...stored, verseKey]))
            }
            window.location.href = '/memorize'
          }}
          className="text-xs text-slate-500 hover:text-emerald-400 flex items-center gap-1 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          Mémoriser
        </button>
        <a href="/memorize" className="text-xs text-slate-600 hover:text-slate-400 flex items-center gap-1 transition-colors">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          File SRS
        </a>
      </div>
    </div>
  )
}
