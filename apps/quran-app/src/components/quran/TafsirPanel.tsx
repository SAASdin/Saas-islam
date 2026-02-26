'use client'
// ============================================================
// TafsirPanel.tsx — Panneau Tafsir (explication coranique)
// ⚠️  Le contenu du Tafsir est SACRÉ — afficher tel quel
//     JAMAIS modifier ou résumer automatiquement le Tafsir
// ============================================================

import { useState } from 'react'
import type { Tafsir } from '@/types/quran'

interface TafsirPanelProps {
  tafsirs: Tafsir[]
  isOpen: boolean
  onClose: () => void
  surahId: number
  ayahNumber: number
  className?: string
}

const TAFSIR_AUTHORS: Record<string, string> = {
  'ibn-kathir':    'Ibn Kathir (ابن كثير)',
  'as-saadi':      'As-Saadi (السعدي)',
  'tabari':        'At-Tabari (الطبري)',
  'ibn-ashur':     'Ibn Ashur (ابن عاشور)',
  'maariful-quran': "Ma'ariful Quran",
}

export default function TafsirPanel({
  tafsirs,
  isOpen,
  onClose,
  surahId,
  ayahNumber,
  className = '',
}: TafsirPanelProps) {
  const [selectedTafsir, setSelectedTafsir] = useState(0)

  if (!isOpen || tafsirs.length === 0) return null

  const current = tafsirs[selectedTafsir]

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panneau latéral */}
      <aside
        className={`fixed right-0 top-0 h-full z-50 w-full max-w-lg overflow-y-auto ${className}`}
        style={{
          background: 'linear-gradient(180deg, rgba(10,15,30,0.98) 0%, rgba(5,10,20,0.99) 100%)',
          borderLeft: '1px solid rgba(212,175,55,0.15)',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
        }}
        role="complementary"
        aria-label={`Tafsir — Sourate ${surahId}, Verset ${ayahNumber}`}
      >
        {/* En-tête */}
        <div
          className="sticky top-0 flex items-center justify-between p-4 z-10"
          style={{ background: 'rgba(10,15,30,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div>
            <h2 className="text-sm font-semibold text-slate-200">Tafsir</h2>
            <p className="text-xs text-slate-500">Sourate {surahId} : {ayahNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Fermer le Tafsir"
          >
            ✕
          </button>
        </div>

        {/* Sélecteur de Tafsir */}
        {tafsirs.length > 1 && (
          <div className="px-4 py-3 flex gap-2 flex-wrap">
            {tafsirs.map((t, i) => (
              <button
                key={t.id}
                onClick={() => setSelectedTafsir(i)}
                className="px-3 py-1 rounded-full text-xs transition-colors"
                style={{
                  background: i === selectedTafsir ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${i === selectedTafsir ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  color: i === selectedTafsir ? '#d4af37' : '#94a3b8',
                }}
              >
                {TAFSIR_AUTHORS[t.tafsirKey] ?? t.tafsirName}
              </button>
            ))}
          </div>
        )}

        {/* Contenu ⚠️ SACRÉ */}
        <div className="p-4">
          <div
            className="text-xs font-medium mb-3 pb-2"
            style={{ color: '#d4af37', borderBottom: '1px solid rgba(212,175,55,0.1)' }}
          >
            {TAFSIR_AUTHORS[current.tafsirKey] ?? current.tafsirName}
          </div>

          {/* ⚠️ Contenu Tafsir — READ ONLY — afficher tel quel */}
          <p
            className="text-sm leading-relaxed text-slate-300"
            lang={current.languageCode}
          >
            {current.content}
          </p>
        </div>
      </aside>
    </>
  )
}
