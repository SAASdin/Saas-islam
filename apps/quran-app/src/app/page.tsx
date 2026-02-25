// ============================================================
// page.tsx — Page d'accueil premium dark
// Inspiré de ramadan-2026.com — design islamique premium
// ⚠️  Texte arabe : dir="rtl" lang="ar" OBLIGATOIRES
// ============================================================

import { getAllSurahs } from '@/lib/quran-api'
import SurahListWithSearch from '@/components/quran/SurahListWithSearch'
import Navigation from '@/components/Navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NoorApp — Plateforme Islamique Premium',
  description: 'Coran, Hadiths, Horaires de prière, Bibliothèque islamique — Une sadaqa jariya technologique',
}

export const revalidate = 86400

// ── Modules de la plateforme ─────────────────────────────────

const MODULES = [
  {
    href: '/',
    icon: '📖',
    nameAr: 'القرآن الكريم',
    nameFr: 'Le Saint Coran',
    desc: '114 sourates · 6236 versets · Traduction Hamidullah · Audio',
    gradientFrom: 'rgba(21,128,61,0.15)',
    gradientTo: 'rgba(21,128,61,0.05)',
    accentColor: '#22c55e',
    badge: '✓ Disponible',
    badgeColor: 'rgba(21,128,61,0.2)',
    badgeText: '#22c55e',
    available: true,
  },
  {
    href: '/hadiths',
    icon: '📜',
    nameAr: 'الحديث الشريف',
    nameFr: 'Hadiths',
    desc: 'Bukhari, Muslim, Abu Dawud, Tirmidhi et plus — 30,000+ hadiths',
    gradientFrom: 'rgba(212,175,55,0.15)',
    gradientTo: 'rgba(212,175,55,0.05)',
    accentColor: '#d4af37',
    badge: '✓ Disponible',
    badgeColor: 'rgba(212,175,55,0.2)',
    badgeText: '#d4af37',
    available: true,
  },
  {
    href: '/priere',
    icon: '🕌',
    nameAr: 'مواقيت الصلاة',
    nameFr: 'Horaires de Prière',
    desc: 'Paris et toutes les villes françaises · Méthode UOIF · Countdown',
    gradientFrom: 'rgba(56,189,248,0.15)',
    gradientTo: 'rgba(56,189,248,0.05)',
    accentColor: '#38bdf8',
    badge: '✓ Disponible',
    badgeColor: 'rgba(56,189,248,0.2)',
    badgeText: '#38bdf8',
    available: true,
  },
  {
    href: '/bibliotheque',
    icon: '📚',
    nameAr: 'المكتبة الإسلامية',
    nameFr: 'Bibliothèque',
    desc: '7000+ livres classiques — Tafsir, Fiqh, Aqida, Sira',
    gradientFrom: 'rgba(167,139,250,0.15)',
    gradientTo: 'rgba(167,139,250,0.05)',
    accentColor: '#a78bfa',
    badge: '✓ Disponible',
    badgeColor: 'rgba(167,139,250,0.2)',
    badgeText: '#a78bfa',
    available: true,
  },
  {
    href: '#',
    icon: '🎓',
    nameAr: 'حفظ المتون',
    nameFr: 'Mémorisation',
    desc: 'Mutun islamiques · SRS type Anki · Révision espacée',
    gradientFrom: 'rgba(248,113,113,0.1)',
    gradientTo: 'rgba(248,113,113,0.03)',
    accentColor: '#f87171',
    badge: 'Bientôt',
    badgeColor: 'rgba(255,255,255,0.06)',
    badgeText: '#64748b',
    available: false,
  },
  {
    href: '#',
    icon: '🌐',
    nameAr: 'الشبكة الحلال',
    nameFr: 'Réseau Halal',
    desc: 'Partage de contenus islamiques · Feed chronologique · Modéré',
    gradientFrom: 'rgba(20,184,166,0.1)',
    gradientTo: 'rgba(20,184,166,0.03)',
    accentColor: '#14b8a6',
    badge: 'Bientôt',
    badgeColor: 'rgba(255,255,255,0.06)',
    badgeText: '#64748b',
    available: false,
  },
]

// ── Stats ─────────────────────────────────────────────────────

const STATS = [
  { value: '114', label: 'Sourates' },
  { value: '6 236', label: 'Versets' },
  { value: '8', label: 'Collections Hadiths' },
  { value: '5', label: 'Prières quotidiennes' },
]

export default async function HomePage() {
  const surahs = await getAllSurahs()

  return (
    <div className="min-h-screen" style={{ background: '#0a0f1e' }}>
      {/* Navigation */}
      <Navigation />

      {/* ── Hero Section ──────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-20 px-4"
        style={{
          background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1a2e 35%, #0a1a0e 70%, #0a0f1e 100%)',
        }}
      >
        {/* Motif géométrique islamique en arrière-plan */}
        <div
          className="absolute inset-0 islamic-pattern opacity-60 pointer-events-none"
          aria-hidden="true"
        />

        {/* Dégradé radial central */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(21,128,61,0.08) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Bismillah */}
          <div className="mb-6 animate-fade-in-scale">
            <p
              dir="rtl"
              lang="ar"
              className="bismillah text-4xl md:text-5xl"
              aria-label="Bismillahi Ar-Rahmani Ar-Raheem"
            >
              {/* ⚠️ Texte sacré — copié tel quel */}
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
          </div>

          {/* Titre */}
          <h1
            className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in"
            style={{
              background: 'linear-gradient(135deg, #f1f5f9 0%, #d4af37 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Plateforme Islamique
          </h1>

          <p className="text-slate-400 text-lg mb-2 animate-fade-in">
            Coran · Hadiths · Prière · Bibliothèque · Mémorisation
          </p>
          <p className="text-slate-500 text-sm mb-10 animate-fade-in">
            Une sadaqa jariya — libre, accessible, sur tous les appareils
          </p>

          {/* CTA Recherche */}
          <Link
            href="/search"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl text-base font-medium transition-all duration-300 animate-fade-in hover:shadow-[0_0_30px_rgba(212,175,55,0.15)]"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(212,175,55,0.3)',
              color: '#f1f5f9',
              backdropFilter: 'blur(8px)',
            }}
          >
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Rechercher dans le Coran
          </Link>
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────── */}
      <div
        className="border-y"
        style={{
          background: 'rgba(17,24,39,0.8)',
          borderColor: 'rgba(255,255,255,0.06)',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p
                className="text-2xl md:text-3xl font-bold"
                style={{ color: '#d4af37' }}
              >
                {stat.value}
              </p>
              <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modules Cards ─────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <div className="flex items-center gap-4 mb-10">
          <h2 className="text-xl font-bold text-slate-100 whitespace-nowrap">Nos modules</h2>
          <div className="flex-1 gold-line" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MODULES.map((mod) => (
            <Link
              key={mod.href + mod.nameFr}
              href={mod.href}
              className={`
                group block rounded-2xl overflow-hidden
                transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl
                ${!mod.available ? 'opacity-60 pointer-events-none' : ''}
              `}
              style={{
                background: `linear-gradient(135deg, ${mod.gradientFrom} 0%, ${mod.gradientTo} 100%)`,
                border: '1px solid rgba(255,255,255,0.07)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div className="p-6">
                {/* Icon + badge */}
                <div className="flex items-start justify-between mb-5">
                  <span className="text-4xl">{mod.icon}</span>
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{
                      background: mod.badgeColor,
                      color: mod.badgeText,
                      border: `1px solid ${mod.accentColor}30`,
                    }}
                  >
                    {mod.badge}
                  </span>
                </div>

                {/* Module name */}
                <h3
                  className="font-bold text-slate-100 text-lg mb-1 group-hover:text-white transition-colors"
                >
                  {mod.nameFr}
                </h3>

                {/* Arabic name */}
                <p
                  dir="rtl"
                  lang="ar"
                  className="text-sm mb-3"
                  style={{
                    fontFamily: 'var(--font-amiri)',
                    color: mod.accentColor,
                    lineHeight: '1.8',
                  }}
                >
                  {/* ⚠️ Texte arabe — jamais modifier */}
                  {mod.nameAr}
                </p>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {mod.desc}
                </p>
              </div>

              {/* Bottom accent line */}
              <div
                className="h-0.5"
                style={{
                  background: `linear-gradient(90deg, transparent, ${mod.accentColor}60, transparent)`,
                  opacity: mod.available ? 1 : 0.3,
                }}
              />
            </Link>
          ))}
        </div>
      </section>

      {/* ── Séparateur Coran ──────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <div className="flex items-center gap-6">
          <div className="flex-1 gold-line" />
          <div className="text-center px-4">
            <p
              dir="rtl"
              lang="ar"
              className="text-2xl text-amber-400"
              style={{ fontFamily: 'var(--font-amiri)', lineHeight: '2' }}
              aria-label="Al-Quran al-Karim"
            >
              {/* ⚠️ Texte sacré */}
              القرآن الكريم
            </p>
            <p className="text-xs text-slate-500 mt-1">114 sourates · 6 236 versets</p>
          </div>
          <div className="flex-1 gold-line" />
        </div>
      </div>

      {/* ── Liste des sourates avec recherche ─────────────── */}
      <SurahListWithSearch surahs={surahs} />

      {/* ── Footer ────────────────────────────────────────── */}
      <footer
        className="mt-12 py-10 text-center text-xs space-y-2"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          color: '#475569',
        }}
      >
        <p>Données coraniques : Mushaf Uthmani — Hafs ʿan ʿĀṣim · api.alquran.cloud</p>
        <p>Hadiths : api.hadith.gading.dev · Prières : api.aladhan.com</p>
        <p
          className="mt-4"
          style={{ color: '#22c55e' }}
        >
          بارك الله فيكم — Que ce projet soit une sadaqa jariya لأصحابه وزوّاره
        </p>
      </footer>
    </div>
  )
}
