'use client'
// ============================================================
// Basmala.tsx — Bismillah ar-Rahman ar-Rahim
// ⚠️  RÈGLE ABSOLUE : afficher SAUF pour At-Tawbah (sourate 9)
//     hasBismillah = false → ne rien rendre (zéro exception)
// ============================================================

interface BasmalaProps {
  /** false pour At-Tawbah (sourate 9) — ne rien rendre */
  show?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const SIZES = {
  sm:  'text-2xl',
  md:  'text-4xl',
  lg:  'text-5xl',
  xl:  'text-6xl',
}

export default function Basmala({ show = true, size = 'lg', className = '' }: BasmalaProps) {
  // ⚠️  At-Tawbah (sourate 9) : pas de Bismillah
  if (!show) return null

  return (
    <div
      className={`text-center my-6 ${className}`}
      role="heading"
      aria-level={1}
      aria-label="Bismillah ar-Rahman ar-Rahim"
    >
      {/* ⚠️  Texte arabe SACRÉ — ne jamais modifier */}
      <p
        dir="rtl"
        lang="ar"
        className={`quran-text ${SIZES[size]} leading-loose text-gold-400`}
        style={{ fontFamily: 'var(--font-kfgqpc, var(--font-amiri))', letterSpacing: 0 }}
      >
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      </p>
    </div>
  )
}
