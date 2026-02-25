/* eslint-disable @next/next/no-page-custom-font */
// Polices islamiques chargées via <link> — App Router (pas Pages Router)
// La règle no-page-custom-font est désactivée : elle vise _document.js (Pages Router)
import type { Metadata } from 'next'
import { amiri, notoNaskhArabic } from '@/lib/fonts'
import './globals.css'

// ============================================================
// Layout racine — Saas-islam : Quran App — Premium Dark
// ⚠️  lang="ar" et dir="rtl" s'appliquent UNIQUEMENT
//     sur les éléments contenant du texte arabe (via className)
//     Le <html> est en "fr" (langue principale de l'interface)
// ============================================================

export const metadata: Metadata = {
  title: {
    default: 'NoorApp — Plateforme Islamique Premium',
    template: '%s | NoorApp',
  },
  description: 'Lisez, écoutez et mémorisez le Saint Coran — القرآن الكريم · Hadiths · Prières · Bibliothèque',
  keywords: ['Coran', 'Quran', 'Islam', 'Mémorisation', 'Tafsir', 'Hadiths', 'Prière'],
  authors: [{ name: 'Saas-islam' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    title: 'NoorApp — Plateforme Islamique Premium',
    description: 'Lisez, écoutez et mémorisez le Saint Coran',
    locale: 'fr_FR',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // lang="fr" — langue principale de l'interface
    // className="dark" — dark mode par défaut
    // Les éléments arabes auront dir="rtl" lang="ar" via className/RTLWrapper
    // data-arabic-ready : permet au JS d'activer le mode RTL global si besoin
    <html
      lang="fr"
      className={`dark ${amiri.variable} ${notoNaskhArabic.variable}`}
      suppressHydrationWarning
      data-arabic-ready="true"
    >
      <head>
        {/* Preconnect Google Fonts (pour le fallback Scheherazade New) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Scheherazade New — fallback si KFGQPC absent */}
        <link
          href="https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&display=swap"
          rel="stylesheet"
        />
        {/*
          KFGQPC Uthmanic Script HAFS — police officielle Mushaf de Médine
          À installer dans public/fonts/ (voir src/lib/fonts.ts)
          Téléchargement : https://fonts.qurancomplex.gov.sa/
        */}
      </head>
      <body className="antialiased min-h-screen bg-[#0a0f1e] text-slate-100">
        {children}
      </body>
    </html>
  )
}
