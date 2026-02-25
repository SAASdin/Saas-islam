import type { Metadata } from 'next'
import './globals.css'
import TopNavbar from '@/components/layout/TopNavbar'
import PersistentPlayer from '@/components/layout/PersistentPlayer'

// ============================================================
// Layout racine — NoorApp
// lang="fr" — interface française par défaut
// Éléments arabes : dir="rtl" lang="ar" appliqués localement
// ============================================================

export const metadata: Metadata = {
  title: {
    default: 'NoorApp — القرآن الكريم',
    template: '%s | NoorApp',
  },
  description:
    'Lisez, écoutez et mémorisez le Saint Coran — القرآن الكريم · Hadiths · Prières · Bibliothèque islamique',
  keywords: ['Coran', 'Quran', 'Islam', 'Mémorisation', 'Tafsir', 'Hadiths', 'Prière', 'القرآن'],
  authors: [{ name: 'NoorApp — Saas-islam' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    title: 'NoorApp — القرآن الكريم',
    description: 'Lisez, écoutez et mémorisez le Saint Coran',
    locale: 'fr_FR',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Fallback coranique si KFGQPC indisponible */}
        <link
          href="https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen bg-[#0a0f1e] text-slate-100">
        <TopNavbar />
        <main className="pt-14 pb-16 min-h-screen">
          {children}
        </main>
        <PersistentPlayer />
      </body>
    </html>
  )
}
