// ============================================================
// lib/fonts.ts — Configuration des polices islamiques
// ⚠️  JAMAIS Arial ou Helvetica pour le texte arabe
// Priorité : KFGQPC (installée) → Amiri → Noto Naskh → Scheherazade New → serif
// ============================================================

import { Amiri, Noto_Naskh_Arabic } from 'next/font/google'
import localFont from 'next/font/local'

// ── Police officielle : KFGQPC Uthmanic Script HAFS ──────────
// Source : مجمع الملك فهد لطباعة المصحف الشريف (King Fahd Quran Printing Complex)
// Site   : https://fonts.qurancomplex.gov.sa/
// Variante : UthmanTN (Uthman Taha Naskh) v2.0 — Hafs 'an 'Asim
// Licence : usage non-commercial autorisé pour affichage du Coran
// Fichiers : public/fonts/KFGQPC-Uthmanic-Script-HAFS.ttf (Regular 136 KB)
//            public/fonts/KFGQPC-Uthmanic-Script-HAFS-Bold.ttf (Bold 129 KB)
// ⚠️  Ces fichiers NE DOIVENT PAS être modifiés — police sacrée
export const kfgqpc = localFont({
  src: [
    {
      path: '../../public/fonts/KFGQPC-Uthmanic-Script-HAFS.ttf',
      weight: '400',
      style:  'normal',
    },
    {
      path: '../../public/fonts/KFGQPC-Uthmanic-Script-HAFS-Bold.ttf',
      weight: '700',
      style:  'normal',
    },
  ],
  variable:    '--font-kfgqpc',
  display:     'swap',        // FOUT acceptable — mieux que FOIT pour texte coranique
  preload:     true,          // Préchargée : c'est la police principale coranique
  fallback:    [
    'Amiri',                  // Fallback Google Fonts
    'Scheherazade New',       // Fallback web
    'serif',                  // Fallback système
  ],
})

// ── Police secondaire : Amiri (Google Fonts) ─────────────────
// Fallback si KFGQPC ne charge pas — bonne qualité typographique arabe
export const amiri = Amiri({
  subsets:  ['arabic', 'latin'],
  weight:   ['400', '700'],
  variable: '--font-amiri',
  display:  'swap',
  preload:  false, // Non préchargée : KFGQPC est prioritaire
})

// ── Police tertiaire : Noto Naskh Arabic ─────────────────────
// Excellente couverture Unicode, lisibilité sur écrans à faible résolution
export const notoNaskhArabic = Noto_Naskh_Arabic({
  subsets:  ['arabic'],
  weight:   ['400', '500', '600', '700'],
  variable: '--font-noto-arabic',
  display:  'swap',
  preload:  false, // Chargée à la demande uniquement
})

// ── Stack de polices pour le texte coranique ─────────────────
// ⚠️  KFGQPC DOIT être en premier — c'est la police officielle du Mushaf
// Ne jamais remettre Amiri en premier ou inverser l'ordre
export const QURAN_FONT_STACK = [
  'var(--font-kfgqpc)',              // KFGQPC Uthmanic Script HAFS (installée localement)
  'var(--font-amiri)',               // Amiri (Google Fonts — fallback)
  'var(--font-noto-arabic)',         // Noto Naskh Arabic (fallback 2)
  'Scheherazade New',                // Fallback web
  'serif',                           // Fallback système
].join(', ')

// ── Tailles de police réglementaires ─────────────────────────
// Minimum 16px (1rem) pour le texte arabe — accessibilité WCAG AA
export const ARABIC_FONT_SIZES = {
  sm:  '1rem',    // 16px — minimum absolu
  md:  '1.5rem',  // 24px — taille lecture confortable
  lg:  '2rem',    // 32px — mise en avant (pages sourate)
  xl:  '2.5rem',  // 40px — affichage pleine page
  xxl: '3rem',    // 48px — hero/titre
} as const

// ── Classes CSS utilitaires ───────────────────────────────────
// Utilise la variable --font-kfgqpc injectée par Next.js
export const arabicTextClass = [
  'font-quran',    // font-family: var(--font-kfgqpc, ...) — défini dans tailwind.config
  'leading-loose', // line-height généreux pour les signes diacritiques arabes
].join(' ')
