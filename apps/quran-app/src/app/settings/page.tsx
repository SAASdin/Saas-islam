'use client'
// ============================================================
// Settings page — Paramètres complets NoorApp
// ============================================================
import { useSettings } from '@/store/settings'
import { ALL_TRANSLATIONS } from '@/lib/translations-catalog'
import { RECITERS } from '@/lib/quran-cdn-api'
import { useState } from 'react'
import Link from 'next/link'

export default function SettingsPage() {
  const {
    fontSize, setFontSize,
    theme, setTheme,
    readingMode, setReadingMode,
    primaryTranslation, setPrimaryTranslation,
    showTranslation, toggleTranslation,
    selectedTranslations, toggleTranslationId,
    playbackSpeed, setPlaybackSpeed,
    reciterSlug, setReciter,
    autoScroll, setAutoScroll,
  } = useSettings()

  const [saved, setSaved] = useState(false)

  function save() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function resetAll() {
    if (window.confirm('Réinitialiser tous les paramètres ?')) {
      localStorage.removeItem('noorapp-settings-v1')
      window.location.reload()
    }
  }

  const primaryMeta = ALL_TRANSLATIONS.find(t => t.id === primaryTranslation)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Paramètres</h1>
          <p className="text-slate-500 text-sm mt-0.5">NoorApp · Personnalisation</p>
        </div>
        <button onClick={save}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            saved ? 'bg-emerald-500 text-white' : 'bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300'
          }`}>
          {saved ? '✓ Sauvegardé' : 'Sauvegarder'}
        </button>
      </div>

      <div className="space-y-6">

        {/* ── Apparence ── */}
        <Section title="Apparence" icon="🎨">
          {/* Thème */}
          <SettingRow label="Thème" description="Couleur d'arrière-plan">
            <div className="flex gap-2">
              {([['dark','Sombre','🌙'],['light','Clair','☀️'],['sepia','Sépia','📜']] as const).map(([t,l,i]) => (
                <button key={t} onClick={() => setTheme(t)}
                  className={`flex flex-col items-center px-3 py-2 rounded-lg border text-xs transition-all ${
                    theme === t ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'border-white/10 bg-white/4 text-slate-400 hover:bg-white/8'
                  }`}>
                  <span className="text-lg">{i}</span>
                  <span>{l}</span>
                </button>
              ))}
            </div>
          </SettingRow>

          {/* Taille police */}
          <SettingRow label="Taille du texte arabe" description={`Actuel : ${fontSize}px`}>
            <div className="flex items-center gap-3">
              <button onClick={() => setFontSize(Math.max(16, fontSize - 2))}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors">−</button>
              <span className="arabic-text text-white text-lg w-16 text-center" dir="rtl" lang="ar"
                style={{ fontSize: `${fontSize}px` }}>بسم الله</span>
              <button onClick={() => setFontSize(Math.min(40, fontSize + 2))}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors">+</button>
            </div>
          </SettingRow>
        </Section>

        {/* ── Lecture ── */}
        <Section title="Mode de lecture" icon="📖">
          <SettingRow label="Affichage" description="Comment les versets sont présentés">
            <div className="flex gap-2">
              {([['ayah','Verset','📄'],['translation','Traduction','🌍'],['word-by-word','Mot/mot','🔤']] as const).map(([m,l,i]) => (
                <button key={m} onClick={() => setReadingMode(m)}
                  className={`flex flex-col items-center px-3 py-2 rounded-lg border text-xs transition-all ${
                    readingMode === m ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'border-white/10 bg-white/4 text-slate-400 hover:bg-white/8'
                  }`}>
                  <span className="text-lg">{i}</span>
                  <span>{l}</span>
                </button>
              ))}
            </div>
          </SettingRow>

          <SettingRow label="Défilement automatique" description="Suivre le verset en cours de lecture">
            <Toggle value={autoScroll} onChange={setAutoScroll} />
          </SettingRow>

          <SettingRow label="Afficher la traduction" description="Afficher/masquer par défaut">
            <Toggle value={showTranslation} onChange={() => toggleTranslation()} />
          </SettingRow>
        </Section>

        {/* ── Traductions ── */}
        <Section title="Traductions" icon="🌍">
          <SettingRow label="Traduction principale" description="Affichée en priorité dans les versets">
            <div className="flex items-center gap-2">
              <span className="text-white text-sm">{primaryMeta?.flag} {primaryMeta?.name}</span>
              <Link href="/surah/1" className="text-xs text-emerald-400 hover:text-emerald-300">
                Changer via toolbar →
              </Link>
            </div>
          </SettingRow>
          <SettingRow label="Traductions actives" description={`${selectedTranslations.length} traduction(s) affichée(s)`}>
            <div className="flex flex-wrap gap-1.5 max-w-sm">
              {selectedTranslations.map(id => {
                const t = ALL_TRANSLATIONS.find(tr => tr.id === id)
                return t ? (
                  <button key={id} onClick={() => toggleTranslationId(id)}
                    className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-full text-xs hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-colors">
                    {t.flag} {t.author} ✕
                  </button>
                ) : null
              })}
            </div>
          </SettingRow>
        </Section>

        {/* ── Audio ── */}
        <Section title="Audio" icon="🎵">
          <SettingRow label="Récitateur par défaut" description="Pour la lecture verset par verset">
            <select value={reciterSlug} onChange={e => setReciter(0, e.target.value)}
              className="bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500">
              {RECITERS.map(r => (
                <option key={r.id} value={r.slug} className="bg-gray-900">{r.name}</option>
              ))}
            </select>
          </SettingRow>

          <SettingRow label="Vitesse de lecture" description={`Actuel : ${playbackSpeed}×`}>
            <div className="flex gap-1.5">
              {[0.5, 0.75, 1, 1.25, 1.5].map(s => (
                <button key={s} onClick={() => setPlaybackSpeed(s as 0.5 | 0.75 | 1 | 1.25 | 1.5)}
                  className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                    playbackSpeed === s ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'border-white/10 bg-white/4 text-slate-400 hover:bg-white/8'
                  }`}>
                  {s}×
                </button>
              ))}
            </div>
          </SettingRow>
        </Section>

        {/* ── Données ── */}
        <Section title="Données & Confidentialité" icon="🔐">
          <SettingRow label="Favoris" description="Versets sauvegardés localement">
            <button onClick={() => { localStorage.removeItem('noorapp-favorites'); save() }}
              className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/20 transition-colors">
              Effacer les favoris
            </button>
          </SettingRow>
          <SettingRow label="Progression" description="Historique de lecture et streaks">
            <button onClick={() => { localStorage.removeItem('noorapp-streak-v1'); localStorage.removeItem('noorapp-last-read'); save() }}
              className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/20 transition-colors">
              Effacer la progression
            </button>
          </SettingRow>
          <SettingRow label="Tous les paramètres" description="Réinitialiser à l'état initial">
            <button onClick={resetAll}
              className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/20 transition-colors">
              Réinitialiser tout
            </button>
          </SettingRow>
        </Section>

      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-white/10 text-center">
        <p className="text-slate-600 text-xs">NoorApp · Plateforme islamique SaaS</p>
        <p className="text-slate-700 text-xs mt-1">وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ</p>
      </div>
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/3 border border-white/10 rounded-2xl p-5">
      <h2 className="text-white font-semibold flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
        <span>{icon}</span> {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function SettingRow({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="shrink-0">
        <p className="text-white text-sm font-medium">{label}</p>
        <p className="text-slate-500 text-xs mt-0.5">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)}
      className={`relative w-12 h-6 rounded-full transition-all ${value ? 'bg-emerald-500' : 'bg-white/20'}`}>
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${value ? 'left-7' : 'left-1'}`} />
    </button>
  )
}
