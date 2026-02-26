'use client'
// ============================================================
// HadithActions.tsx — Favoris, Copier, Partager
// Client Component — localStorage : noorapp-hadith-favorites
// ============================================================

import { useState, useEffect } from 'react'

interface Props {
  collection: string
  hadithNumber: string
  collectionName: string
  ref: string
  arText: string
}

const FAVORITES_KEY = 'noorapp-hadith-favorites'

interface FavoriteEntry {
  collection: string
  hadithNumber: string
  collectionName: string
  savedAt: number
}

export default function HadithActions({
  collection,
  hadithNumber,
  collectionName,
  ref: hadithRef,
  arText,
}: Props) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [copied, setCopied] = useState(false)

  // Lire les favoris au mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY)
      if (!raw) return
      const favs: FavoriteEntry[] = JSON.parse(raw)
      const found = favs.some(
        (f) => f.collection === collection && f.hadithNumber === hadithNumber
      )
      setIsFavorite(found)
    } catch {
      // localStorage non disponible — silencieux
    }
  }, [collection, hadithNumber])

  function toggleFavorite() {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY)
      const favs: FavoriteEntry[] = raw ? JSON.parse(raw) : []

      if (isFavorite) {
        const updated = favs.filter(
          (f) => !(f.collection === collection && f.hadithNumber === hadithNumber)
        )
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated))
        setIsFavorite(false)
      } else {
        const entry: FavoriteEntry = {
          collection,
          hadithNumber,
          collectionName,
          savedAt: Date.now(),
        }
        localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favs, entry]))
        setIsFavorite(true)
      }
    } catch {
      // localStorage non disponible
    }
  }

  async function handleCopy() {
    try {
      const text = `${hadithRef}\n\n${arText}`
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard non disponible
    }
  }

  async function handleShare() {
    try {
      const url = `${window.location.origin}/hadiths/${collection}/${hadithNumber}`
      const text = `${hadithRef}\n\n${arText}`
      if (navigator.share) {
        await navigator.share({ title: hadithRef, text, url }).catch(() => {})
      } else {
        await navigator.clipboard.writeText(`${text}\n\n${url}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      // Non supporté
    }
  }

  const btnBase = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#64748b',
    cursor: 'pointer',
  } as const

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Favoris */}
      <button
        onClick={toggleFavorite}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs transition-all duration-200 hover:opacity-80"
        style={
          isFavorite
            ? { background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.25)', color: '#d4af37', cursor: 'pointer' }
            : btnBase
        }
        type="button"
        aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      >
        <span>{isFavorite ? '⭐' : '☆'}</span>
        <span>{isFavorite ? 'En favoris' : 'Favoris'}</span>
      </button>

      {/* Copier */}
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs transition-all duration-200 hover:opacity-80"
        style={
          copied
            ? { background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e', cursor: 'pointer' }
            : btnBase
        }
        type="button"
        aria-label="Copier la référence"
      >
        <span>{copied ? '✓' : '📋'}</span>
        <span>{copied ? 'Copié !' : 'Copier'}</span>
      </button>

      {/* Partager */}
      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs transition-all duration-200 hover:opacity-80"
        style={btnBase}
        type="button"
        aria-label="Partager ce hadith"
      >
        <span>🔗</span>
        <span>Partager</span>
      </button>
    </div>
  )
}
