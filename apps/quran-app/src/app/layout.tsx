import type { Metadata } from 'next'
import './globals.css'

// ============================================================
// Layout racine — Saas-islam : Quran App
// ⚠️  lang="ar" et dir="rtl" s'appliquent UNIQUEMENT
//     sur les éléments contenant du texte arabe (via className)
//     Le <html> est en "fr" (langue principale de l'interface)
// ============================================================

export const metadata: Metadata = {
  title: {
    default: 'Quran App — Saas-islam',
    template: '%s | Quran App',
  },
  description: 'Lisez, écoutez et mémorisez le Saint Coran — القرآن الكريم',
  keywords: ['Coran', 'Quran', 'Islam', 'Mémorisation', 'Tafsir', 'Hadiths'],
  authors: [{ name: 'Saas-islam' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    title: 'Quran App — Saas-islam',
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
    // Les éléments arabes auront dir="rtl" lang="ar" via className
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Preconnect pour les ressources Google Fonts (fallback) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/*
          ⚠️  Scheherazade New en fallback pour le texte coranique
          KFGQPC sera ajouté en local dès que le fichier sera disponible
        */}
        <link
          href="https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen bg-white dark:bg-gray-900">
        {children}
      </body>
    </html>
  )
}
