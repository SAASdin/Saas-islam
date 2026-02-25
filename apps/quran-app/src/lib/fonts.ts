// ============================================================
// lib/fonts.ts — Configuration des polices islamiques
// ⚠️  JAMAIS Arial ou Helvetica pour le texte arabe
// Priorité : KFGQPC → Amiri → Scheherazade New → fallback
// ============================================================

import { Amiri, Noto_Naskh_Arabic } from 'next/font/google'

// ── Police principale : Amiri ─────────────────────────────────
// Utilisée pour le texte coranique et l'interface arabe
export const amiri = Amiri({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
  variable: '--font-amiri',
  display: 'swap',
  preload: true,
})

// ── Police secondaire : Noto Naskh Arabic ────────────────────
// Excellente lisibilité, bonne couverture Unicode arabe
export const notoNaskhArabic = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-arabic',
  display: 'swap',
  preload: false, // Chargée à la demande
})

// ── Police locale : KFGQPC (si disponible) ───────────────────
// La police officielle du Mushaf de Médine (non disponible sur Google Fonts)
// Fichier à placer dans : public/fonts/KFGQPC-Uthmanic-Script-HAFS.ttf
// Téléchargement : https://fonts.qurancomplex.gov.sa/
//
// Configuration next/font/local (décommentez quand le fichier est présent) :
//
// import localFont from 'next/font/local'
// export const kfgqpc = localFont({
//   src: [
//     { path: '../../public/fonts/KFGQPC-Uthmanic-Script-HAFS.ttf', weight: '400' },
//     { path: '../../public/fonts/KFGQPC-Uthmanic-Script-HAFS-Bold.ttf', weight: '700' },
//   ],
//   variable: '--font-kfgqpc',
//   display: 'swap',
// })

// ── Stack de polices pour le texte coranique ─────────────────
// Ordre de priorité : KFGQPC > Amiri > Scheherazade New > serif
export const QURAN_FONT_STACK = [
  'KFGQPC Uthmanic Script HAFS',   // Police officielle Mushaf Médine
  'var(--font-amiri)',               // Amiri (Google Fonts)
  'var(--font-noto-arabic)',         // Noto Naskh Arabic
  'Scheherazade New',                // Fallback web
  'serif',                           // Fallback système
].join(', ')

// ── Tailles de police réglementaires ─────────────────────────
// Minimum 16px (1rem) pour le texte arabe — accessibilité
export const ARABIC_FONT_SIZES = {
  sm:  '1rem',    // 16px — minimum absolu
  md:  '1.5rem',  // 24px — taille lecture confortable
  lg:  '2rem',    // 32px — mise en avant
  xl:  '2.5rem',  // 40px — affichage pleine page
  xxl: '3rem',    // 48px — hero/titre
} as const

// ── Classes CSS utilitaires ───────────────────────────────────
// Applique les bonnes propriétés RTL + police sur tout élément arabe
export const arabicTextClass = [
  'font-quran',    // font-family: var(--font-amiri) — défini dans tailwind.config
  'leading-loose', // line-height généreux pour les diacritiques
].join(' ')
