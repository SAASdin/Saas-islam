// ============================================================
// priere/page.tsx — Horaires de prière — Premium dark
// Source : api.aladhan.com (gratuit, pas de clé)
// Méthode : UOIF (recommandée pour France/Europe)
// ============================================================

import { getPrayerTimesByCity, formatPrayers, formatHijriDate } from '@/lib/prayer-api'
import PrayerCountdown from '@/components/prayer/PrayerCountdown'
import Navigation from '@/components/Navigation'
import type { Metadata } from 'next'

// Rendu dynamique — évite le pré-rendu statique qui sature l'API externe en CI/build
export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Horaires de Prière — مواقيت الصلاة',
  description: 'Horaires de prière pour Paris et la France — méthode UOIF',
}

export const revalidate = 3600

const CITIES = [
  { city: 'Paris', country: 'France', flag: '🗼' },
  { city: 'Lyon', country: 'France', flag: '🦁' },
  { city: 'Marseille', country: 'France', flag: '⚓' },
  { city: 'Bordeaux', country: 'France', flag: '🍷' },
  { city: 'Lille', country: 'France', flag: '🏭' },
  { city: 'Strasbourg', country: 'France', flag: '🎄' },
]

export default async function PriereHomePage() {
  let prayerData = null
  let error = null

  try {
    prayerData = await getPrayerTimesByCity('Paris', 'France', 12)
  } catch {
    error = 'Impossible de charger les horaires pour le moment.'
  }

  const prayers = prayerData ? formatPrayers(prayerData.timings) : []
  const hijriDate = prayerData ? formatHijriDate(prayerData.date.hijri) : ''

  return (
    <div className="min-h-screen" style={{ background: '#0a0f1e' }}>
      <Navigation />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-14 px-4"
        style={{
          background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1a2e 50%, #0a0f1e 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="absolute inset-0 islamic-star-pattern opacity-50 pointer-events-none" aria-hidden="true" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(56,189,248,0.06) 0%, transparent 70%)' }}
        />

        <div className="relative max-w-3xl mx-auto text-center">
          <p
            dir="rtl"
            lang="ar"
            className="text-4xl mb-4"
            style={{
              fontFamily: 'var(--font-amiri)',
              color: '#d4af37',
              lineHeight: '1.8',
              textShadow: '0 0 30px rgba(212,175,55,0.3)',
            }}
          >
            {/* ⚠️ Texte arabe sacré */}
            مواقيت الصلاة
          </p>

          <h1
            className="text-3xl font-bold mb-3"
            style={{
              background: 'linear-gradient(135deg, #f1f5f9 0%, #d4af37 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Horaires de Prière
          </h1>

          {prayerData && (
            <div className="mt-3 space-y-1">
              <p className="text-slate-400 text-sm">
                {prayerData.date.gregorian.weekday.en}, {prayerData.date.readable}
              </p>
              <p
                dir="rtl"
                lang="ar"
                className="text-sm"
                style={{ fontFamily: 'var(--font-amiri)', color: '#22c55e', lineHeight: '1.6' }}
              >
                {/* ⚠️ Date hijri — texte arabe sacré */}
                {hijriDate}
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Erreur */}
        {error && (
          <div
            className="p-4 rounded-xl text-sm text-center mb-6"
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#f87171',
            }}
          >
            {error}
          </div>
        )}

        {/* ── Countdown ────────────────────────────────── */}
        {prayers.length > 0 && <PrayerCountdown prayers={prayers} />}

        {/* ── Liste des prières ──────────────────────── */}
        {prayers.length > 0 && (
          <section
            className="rounded-2xl overflow-hidden mb-8"
            style={{
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(17,24,39,0.7)',
            }}
          >
            {prayers.map((prayer, index) => (
              <div
                key={prayer.key}
                className="flex items-center justify-between px-6 py-5"
                style={{
                  borderBottom: index < prayers.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl" role="img" aria-hidden>{prayer.icon}</span>
                  <div>
                    <p className="font-semibold text-slate-100 text-base">{prayer.nameFr}</p>
                    <p
                      dir="rtl"
                      lang="ar"
                      className="text-sm"
                      style={{ fontFamily: 'var(--font-amiri)', color: '#22c55e', lineHeight: '1.6' }}
                    >
                      {/* ⚠️ Nom de la prière en arabe */}
                      {prayer.nameAr}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className="text-2xl font-bold"
                    style={{ color: '#d4af37' }}
                  >
                    {prayer.time}
                  </p>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* ── Info méthode de calcul ──────────────────── */}
        {prayerData && (
          <div
            className="p-5 rounded-xl text-sm mb-8"
            style={{
              background: 'rgba(212,175,55,0.04)',
              border: '1px solid rgba(212,175,55,0.12)',
            }}
          >
            <p className="font-medium text-slate-300 mb-1">📍 Paris, France</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Méthode de calcul :{' '}
              <span style={{ color: '#d4af37' }}>{prayerData.meta.method.name}</span>
              {' · '}Latitude : {prayerData.meta.latitude.toFixed(4)}
              {' · '}Timezone : {prayerData.meta.timezone}
            </p>
          </div>
        )}

        {/* ── Autres villes ──────────────────────────── */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-slate-100 mb-5">
            Autres villes françaises
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CITIES.map((c) => (
              <button
                key={c.city}
                className="rounded-xl px-4 py-4 text-sm text-left transition-all duration-200"
                style={{
                  background: 'rgba(17,24,39,0.7)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: '#94a3b8',
                }}
                type="button"
              >
                <span className="text-xl block mb-1">{c.flag}</span>
                <span>{c.city}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-600 mt-3 text-center">
            Sélection d&apos;autres villes à venir
          </p>
        </section>

        {/* ── Dhikr ────────────────────────────────────── */}
        <section
          className="rounded-2xl p-8 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(21,128,61,0.08) 0%, rgba(10,15,30,0.8) 100%)',
            border: '1px solid rgba(21,128,61,0.15)',
          }}
        >
          <p className="text-xs text-slate-600 mb-4 uppercase tracking-widest">
            Dhikr recommandé
          </p>
          <p
            dir="rtl"
            lang="ar"
            className="text-2xl leading-loose"
            style={{
              fontFamily: 'var(--font-amiri)',
              color: '#f1f5f9',
              lineHeight: '3rem',
            }}
            aria-label="Subhanallah wa bihamdihi"
          >
            {/* ⚠️ Texte dhikr — copié sans modification */}
            سُبْحَانَ اللَّهِ وَبِحَمْدِهِ
          </p>
          <p className="text-sm text-slate-500 mt-3">
            «Gloire à Allah et à Sa louange» — 100× par jour
          </p>
        </section>

        <footer className="mt-10 text-center text-xs text-slate-700">
          <p>Source : api.aladhan.com · Méthode UOIF (n°12)</p>
        </footer>
      </div>
    </div>
  )
}
