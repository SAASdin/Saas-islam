'use client'
// ============================================================
// ThemeProvider.tsx — Applique le thème depuis Zustand sur <html>
// ============================================================
import { useEffect } from 'react'
import { useSettings } from '@/store/settings'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, fontSize } = useSettings()

  useEffect(() => {
    const root = document.documentElement
    // Supprimer les classes de thème précédentes
    root.classList.remove('dark', 'light', 'sepia', 'theme-light', 'theme-sepia')

    if (theme === 'dark') {
      root.classList.add('dark')
      root.style.setProperty('--bg-primary', '#0a0f1e')
      root.style.setProperty('--text-primary', '#f1f5f9')
      root.style.setProperty('--text-secondary', '#94a3b8')
      root.style.setProperty('--border-color', 'rgba(255,255,255,0.1)')
      root.style.setProperty('--card-bg', 'rgba(255,255,255,0.03)')
      root.style.setProperty('--quran-text-color', 'rgba(255,255,255,0.9)')
      root.style.setProperty('--translation-color', '#cbd5e1')
    } else if (theme === 'light') {
      root.classList.add('theme-light')
      root.style.setProperty('--bg-primary', '#f8fafc')
      root.style.setProperty('--text-primary', '#0f172a')
      root.style.setProperty('--text-secondary', '#475569')
      root.style.setProperty('--border-color', 'rgba(0,0,0,0.1)')
      root.style.setProperty('--card-bg', 'rgba(0,0,0,0.02)')
      root.style.setProperty('--quran-text-color', '#1e293b')
      root.style.setProperty('--translation-color', '#334155')
    } else if (theme === 'sepia') {
      root.classList.add('theme-sepia')
      root.style.setProperty('--bg-primary', '#f4e9d0')
      root.style.setProperty('--text-primary', '#3d2b1f')
      root.style.setProperty('--text-secondary', '#6b4c36')
      root.style.setProperty('--border-color', 'rgba(61,43,31,0.15)')
      root.style.setProperty('--card-bg', 'rgba(61,43,31,0.03)')
      root.style.setProperty('--quran-text-color', '#2d1b0e')
      root.style.setProperty('--translation-color', '#4a3728')
    }
  }, [theme])

  return <>{children}</>
}
