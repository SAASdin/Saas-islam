import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default:  'Mémorisation des Mutun — NoorApp',
    template: '%s | NoorApp Mémorisation',
  },
  description: 'Application de mémorisation des textes islamiques classiques (Mutun) avec répétition espacée (SRS). Al-Baiquniyya, Tuhfat al-Atfal, Al-Ajrumiyya, Al-Waraqat, Al-Arba\'in.',
  keywords:    ['mutun', 'mémorisation', 'islamique', 'SRS', 'tajweed', 'nahw', 'hadith'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="dark">
      <body
        className="antialiased"
        style={{
          background:  '#0a0f1e',
          color:       '#f1f5f9',
          fontFamily:  'var(--font-amiri)',
          minHeight:   '100vh',
        }}
      >
        {children}
      </body>
    </html>
  )
}
