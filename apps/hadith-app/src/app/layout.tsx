import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: { default: 'Hadith', template: '%s | Hadith' },
  description: 'Toutes les collections de hadiths authentiques — Sahih Bukhari, Sahih Muslim, et plus',
  keywords: ['hadith', 'sunnah', 'islam', 'bukhari', 'muslim', 'quran'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <meta name="theme-color" content="#067b55" />
      </head>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
