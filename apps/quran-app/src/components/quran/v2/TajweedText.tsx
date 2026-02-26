'use client'
// ============================================================
// TajweedText.tsx — Texte coranique coloré par règle tajweed
// Source : QuranCDN text_uthmani_tajweed field
// ⚠️  Le texte arabe est SACRÉ — seule la couleur change
// ⚠️  Pas de modification du texte lui-même
// ============================================================
import { useState, useEffect } from 'react'

// Règles tajweed et leurs couleurs (codes QuranCDN)
const TAJWEED_COLORS: Record<string, { color: string; label: string }> = {
  ham_wasl:   { color: '#9ca3af',  label: 'Hamza Wasl'       },
  lam_shams:  { color: '#38bdf8',  label: 'Lam Shamsiyya'    },
  madda_normal:{ color: '#f87171', label: 'Madda Normal'      },
  madda_permissible: { color: '#fb923c', label: 'Madda Permissible' },
  madda_necessary: { color: '#ef4444', label: 'Madda Wajib'  },
  madda_obligatory: { color: '#dc2626', label: 'Madda Lazim' },
  qalqalah:   { color: '#fbbf24',  label: 'Qalqalah'         },
  ikhfa_shafawi: { color: '#a3e635', label: 'Ikhfa Shafawi'  },
  ikhfa:      { color: '#34d399',  label: 'Ikhfa'             },
  idgham_shafawi: { color: '#60a5fa', label: 'Idgham Shafawi'},
  idgham_ghunnah: { color: '#818cf8', label: 'Idgham Ghunnah'},
  idgham_wo_ghunnah: { color: '#c084fc', label: 'Idgham sans Ghunnah' },
  idgham_mutajanisain: { color: '#f0abfc', label: 'Idgham Mutajanisain' },
  idgham_mutaqaribain: { color: '#e879f9', label: 'Idgham Mutaqaribain' },
  iqlab:      { color: '#fb7185',  label: 'Iqlab'             },
  ghunnah:    { color: '#a78bfa',  label: 'Ghunnah'           },
}

interface TajweedSegment {
  text: string       // ⚠️ SACRÉ — texte arabe
  rule?: string      // code tajweed
}

interface TajweedTextProps {
  verseKey: string
  fallbackText: string  // ⚠️ SACRÉ — affiché si tajweed non dispo
  fontSize?: number
}

export default function TajweedText({ verseKey, fallbackText, fontSize }: TajweedTextProps) {
  const [segments, setSegments] = useState<TajweedSegment[] | null>(null)
  const [loading, setLoading] = useState(false)

  const textSize = fontSize ? `${fontSize}px` : '1.75rem'

  useEffect(() => {
    setLoading(true)
    const [surah, ayah] = verseKey.split(':')

    // API QuranCDN pour le texte tajweed
    fetch(`https://api.qurancdn.com/api/qdc/verses/by_key/${verseKey}?fields=text_uthmani_tajweed`)
      .then(r => r.json())
      .then(data => {
        const tajweedHtml: string = data?.verse?.text_uthmani_tajweed ?? ''
        if (tajweedHtml) {
          const parsed = parseTajweedHtml(tajweedHtml)
          setSegments(parsed)
        }
      })
      .catch(() => setSegments(null))
      .finally(() => setLoading(false))
  }, [verseKey])

  if (loading || !segments) {
    return (
      <p
        className="quran-text leading-loose text-right text-white/90"
        dir="rtl" lang="ar"
        style={{ fontSize: textSize }}
      >
        {fallbackText}
      </p>
    )
  }

  return (
    <p
      className="quran-text leading-loose text-right"
      dir="rtl" lang="ar"
      style={{ fontSize: textSize }}
    >
      {segments.map((seg, i) => {
        const rule = seg.rule ? TAJWEED_COLORS[seg.rule] : null
        return (
          <span
            key={i}
            style={rule ? { color: rule.color } : { color: 'rgba(255,255,255,0.9)' }}
            title={rule?.label}
          >
            {seg.text}
          </span>
        )
      })}
    </p>
  )
}

/**
 * Parse le HTML tajweed de QuranCDN
 * Format : <tajweed class="rule-name">text</tajweed> ou texte brut
 * ⚠️  Extrait uniquement le texte — JAMAIS modifié
 */
function parseTajweedHtml(html: string): TajweedSegment[] {
  const segments: TajweedSegment[] = []
  const re = /<tajweed class="([^"]+)">([^<]*)<\/tajweed>|([^<]+)/g
  let match

  while ((match = re.exec(html)) !== null) {
    if (match[1] && match[2]) {
      // Segment coloré
      segments.push({ text: match[2], rule: match[1] })
    } else if (match[3]) {
      // Texte brut
      segments.push({ text: match[3] })
    }
  }

  return segments
}

// Légende tajweed (optionnelle)
export function TajweedLegend() {
  const rules = Object.entries(TAJWEED_COLORS).slice(0, 8)
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {rules.map(([key, { color, label }]) => (
        <span key={key} className="flex items-center gap-1 text-xs">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color }} />
          <span className="text-slate-500">{label}</span>
        </span>
      ))}
    </div>
  )
}
