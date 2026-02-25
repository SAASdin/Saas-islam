'use client'
// ============================================================
// /settings — Paramètres utilisateur persistants
// ============================================================
import { useSettings } from '@/store/settings'
import type { QuranFont, Theme, ReadingMode, PlaybackSpeed } from '@/store/settings'
import Link from 'next/link'

const FONT_OPTIONS: { value: QuranFont; label: string; preview: string }[] = [
  { value: 'kfgqpc', label: 'KFGQPC Uthmani', preview: 'بِسْمِ اللَّهِ' },
  { value: 'uthmani', label: 'Uthmani Standard', preview: 'بسم الله' },
  { value: 'simple',  label: 'Simplifié', preview: 'بسم الله' },
]

const THEME_OPTIONS: { value: Theme; label: string; bg: string; text: string }[] = [
  { value: 'dark',  label: 'Sombre',   bg: '#0a0f1e',  text: 'text-white'        },
  { value: 'light', label: 'Clair',    bg: '#f8fafc',  text: 'text-slate-900'    },
  { value: 'sepia', label: 'Sépia',    bg: '#f4e9d0',  text: 'text-[#3d2b1f]'   },
]

const SPEED_OPTIONS: PlaybackSpeed[] = [0.5, 0.75, 1, 1.25, 1.5, 2]

const TRANSLATION_OPTIONS = [
  { id: 131, label: 'Hamidullah (FR)' },
  { id: 85,  label: 'ClearQuran (FR)' },
  { id: 20,  label: 'Saheeh International (EN)' },
]

export default function SettingsPage() {
  const {
    quranFont, setFont,
    fontSize, setFontSize,
    showWordByWord, toggleWordByWord,
    showTransliteration, toggleTransliteration,
    showTranslation, toggleTranslation,
    primaryTranslation, setPrimaryTranslation,
    selectedTafsirId, setTafsirId,
    showTafsir, toggleTafsir,
    tafsirPosition, setTafsirPosition,
    playbackSpeed, setPlaybackSpeed,
    repeatMode, setRepeatMode,
    autoScroll,
    theme, setTheme,
    readingMode, setReadingMode,
    language, setLanguage,
  } = useSettings()

  function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
    return (
      <div className="bg-white/3 border border-white/10 rounded-2xl p-6 mb-4">
        <h2 className="text-white font-semibold text-base mb-5 flex items-center gap-2">
          <span>{icon}</span> {title}
        </h2>
        {children}
      </div>
    )
  }

  function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
        <p className="text-slate-300 text-sm">{label}</p>
        <div className="shrink-0">{children}</div>
      </div>
    )
  }

  function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
    return (
      <button
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-white/10'}`}
      >
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/" className="p-2 text-slate-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-white">Paramètres</h1>
      </div>

      {/* ── Apparence ──────────────────────────── */}
      <Section title="Apparence" icon="🎨">
        <Row label="Thème">
          <div className="flex items-center gap-2">
            {THEME_OPTIONS.map(t => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  theme === t.value ? 'border-emerald-400 scale-110' : 'border-white/20'
                }`}
                style={{ backgroundColor: t.bg }}
                title={t.label}
              />
            ))}
          </div>
        </Row>

        <Row label="Mode lecture">
          <div className="flex bg-white/5 rounded-lg p-0.5">
            {([
              { value: 'ayah',         label: 'Verset'    },
              { value: 'translation',  label: 'Traduction'},
              { value: 'word-by-word', label: 'Mot/mot'   },
            ] as const).map(m => (
              <button
                key={m.value}
                onClick={() => setReadingMode(m.value)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  readingMode === m.value ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </Row>
      </Section>

      {/* ── Texte coranique ───────────────────── */}
      <Section title="Texte coranique" icon="📖">
        <Row label="Police">
          <select
            value={quranFont}
            onChange={e => setFont(e.target.value as QuranFont)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
          >
            {FONT_OPTIONS.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </Row>

        <Row label="Taille de police">
          <div className="flex items-center gap-3">
            <button onClick={() => setFontSize(fontSize - 2)} className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-md text-white text-sm">−</button>
            <span className="text-white text-sm w-8 text-center">{fontSize}</span>
            <button onClick={() => setFontSize(fontSize + 2)} className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-md text-white text-sm">+</button>
          </div>
        </Row>

        {/* Prévisualisation */}
        <div className="mt-4 p-4 bg-white/3 rounded-xl text-center">
          <p
            className="quran-text text-amber-100/80"
            style={{ fontSize: `${fontSize}px` }}
            dir="rtl"
            lang="ar"
          >
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <p className="text-slate-500 text-xs mt-2">Aperçu — {fontSize}px</p>
        </div>

        <Row label="Traduction"><Toggle checked={showTranslation} onChange={toggleTranslation} /></Row>
        <Row label="Mot-à-mot"><Toggle checked={showWordByWord} onChange={toggleWordByWord} /></Row>
        <Row label="Translitération"><Toggle checked={showTransliteration} onChange={toggleTransliteration} /></Row>
      </Section>

      {/* ── Traductions ───────────────────────── */}
      <Section title="Traductions" icon="🌍">
        <Row label="Traduction principale">
          <select
            value={primaryTranslation}
            onChange={e => setPrimaryTranslation(Number(e.target.value))}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
          >
            {TRANSLATION_OPTIONS.map(t => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </Row>
      </Section>

      {/* ── Tafsir ────────────────────────────── */}
      <Section title="Tafsir" icon="📚">
        <Row label="Afficher le Tafsir"><Toggle checked={showTafsir} onChange={toggleTafsir} /></Row>
        <Row label="Position">
          <div className="flex bg-white/5 rounded-lg p-0.5">
            {(['inline', 'sidebar'] as const).map(p => (
              <button key={p} onClick={() => setTafsirPosition(p)}
                className={`px-3 py-1 rounded-md text-xs transition-colors ${
                  tafsirPosition === p ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}>
                {p === 'inline' ? 'Inline' : 'Panneau'}
              </button>
            ))}
          </div>
        </Row>
      </Section>

      {/* ── Audio ─────────────────────────────── */}
      <Section title="Audio" icon="🎵">
        <Row label="Vitesse de lecture">
          <div className="flex items-center gap-1">
            {SPEED_OPTIONS.map(s => (
              <button
                key={s}
                onClick={() => setPlaybackSpeed(s)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  playbackSpeed === s ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {s}×
              </button>
            ))}
          </div>
        </Row>

        <Row label="Mode répétition">
          <div className="flex items-center gap-1">
            {(['none', 'verse', 'surah'] as const).map(m => (
              <button
                key={m}
                onClick={() => setRepeatMode(m)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  repeatMode === m ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {m === 'none' ? 'Aucun' : m === 'verse' ? 'Verset' : 'Sourate'}
              </button>
            ))}
          </div>
        </Row>
      </Section>

      {/* Reset */}
      <div className="text-center mt-6">
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('noorapp-settings-v1')
              window.location.reload()
            }
          }}
          className="text-sm text-slate-600 hover:text-red-400 transition-colors"
        >
          Réinitialiser tous les paramètres
        </button>
      </div>
    </div>
  )
}
