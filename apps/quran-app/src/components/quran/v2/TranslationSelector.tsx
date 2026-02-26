'use client'
// ============================================================
// TranslationSelector.tsx — Sélecteur toutes traductions
// 126 traductions groupées par langue
// ============================================================
import { useState, useMemo } from 'react'
import { useSettings } from '@/store/settings'
import { ALL_TRANSLATIONS, groupByLanguage } from '@/lib/translations-catalog'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function TranslationSelector({ isOpen, onClose }: Props) {
  const { selectedTranslations, primaryTranslation, toggleTranslationId, setPrimaryTranslation } = useSettings()
  const [search, setSearch] = useState('')
  const [expandedLang, setExpandedLang] = useState<string | null>('Français')

  const filtered = useMemo(() => {
    if (!search.trim()) return ALL_TRANSLATIONS
    const q = search.toLowerCase()
    return ALL_TRANSLATIONS.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.author.toLowerCase().includes(q) ||
      t.language.toLowerCase().includes(q)
    )
  }, [search])

  const grouped = groupByLanguage(filtered)
  const languages = Object.keys(grouped).sort((a, b) => {
    // Priorité : Français > English > autres
    if (a === 'Français') return -1
    if (b === 'Français') return 1
    if (a === 'English') return -1
    if (b === 'English') return 1
    return a.localeCompare(b)
  })

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-[#0d1526] border-l border-white/10 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <div>
            <h2 className="text-white font-semibold">Traductions</h2>
            <p className="text-slate-500 text-xs mt-0.5">{selectedTranslations.length} sélectionnée{selectedTranslations.length > 1 ? 's' : ''} · 126 disponibles</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sélectionnées en haut */}
        {selectedTranslations.length > 0 && (
          <div className="px-4 py-3 border-b border-white/10 shrink-0">
            <p className="text-xs text-slate-500 mb-2">Actives</p>
            <div className="flex flex-wrap gap-1.5">
              {selectedTranslations.map(id => {
                const t = ALL_TRANSLATIONS.find(tr => tr.id === id)
                if (!t) return null
                return (
                  <div key={id} className="flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 rounded-full pl-2 pr-1 py-0.5">
                    <span className="text-xs text-emerald-300 truncate max-w-32">{t.flag} {t.author}</span>
                    <button
                      onClick={() => toggleTranslationId(id)}
                      className="w-4 h-4 rounded-full flex items-center justify-center text-emerald-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Recherche */}
        <div className="px-4 py-3 border-b border-white/10 shrink-0">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par langue, auteur…"
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Liste groupée */}
        <div className="flex-1 overflow-y-auto">
          {languages.map(lang => {
            const items = grouped[lang]
            const isExpanded = expandedLang === lang || search.trim() !== ''
            const selectedInGroup = items.filter(t => selectedTranslations.includes(t.id)).length

            return (
              <div key={lang} className="border-b border-white/5">
                {/* En-tête groupe */}
                <button
                  onClick={() => setExpandedLang(isExpanded && !search ? null : lang)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/3 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{items[0]?.flag}</span>
                    <span className="text-white text-sm font-medium">{lang}</span>
                    <span className="text-slate-500 text-xs">({items.length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedInGroup > 0 && (
                      <span className="text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">
                        {selectedInGroup} ✓
                      </span>
                    )}
                    {!search && (
                      <svg className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </button>

                {/* Items */}
                {isExpanded && items.map(t => {
                  const isSelected = selectedTranslations.includes(t.id)
                  const isPrimary = primaryTranslation === t.id
                  return (
                    <div
                      key={t.id}
                      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                        isSelected ? 'bg-emerald-500/8' : 'hover:bg-white/3'
                      }`}
                      onClick={() => toggleTranslationId(t.id)}
                    >
                      {/* Checkbox */}
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-white/20 hover:border-emerald-500/50'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>{t.name}</p>
                        <p className="text-xs text-slate-500 truncate">{t.author}</p>
                      </div>

                      {/* ID + bouton principal */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isPrimary && (
                          <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full">Principal</span>
                        )}
                        {isSelected && !isPrimary && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setPrimaryTranslation(t.id) }}
                            className="text-xs text-slate-500 hover:text-amber-400 transition-colors px-1"
                            title="Définir comme principale"
                          >
                            ★
                          </button>
                        )}
                        <span className="text-xs text-slate-600 font-mono">#{t.id}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/10 shrink-0">
          <button onClick={onClose} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-colors">
            Appliquer ({selectedTranslations.length} traduction{selectedTranslations.length > 1 ? 's' : ''})
          </button>
        </div>
      </div>
    </>
  )
}
