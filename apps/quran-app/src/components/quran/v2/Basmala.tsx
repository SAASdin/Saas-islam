// ============================================================
// Basmala.tsx — بسم الله الرحمن الرحيم
// ⚠️  Afficher UNIQUEMENT si hasBismillah === true
// ⚠️  Sourate 9 (At-Tawbah) → bismillah_pre = false → NE PAS afficher
// ============================================================

interface BasmalaProps {
  show: boolean
  className?: string
}

// Texte coranique exact — ne jamais modifier
const BASMALA_TEXT = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'

export default function Basmala({ show, className = '' }: BasmalaProps) {
  if (!show) return null

  return (
    <div className={`text-center py-6 px-4 ${className}`}>
      <p
        className="quran-text text-3xl md:text-4xl text-amber-100/90 leading-relaxed"
        dir="rtl"
        lang="ar"
        aria-label="Bismillah ir-Rahman ir-Rahim"
      >
        {BASMALA_TEXT}
      </p>
    </div>
  )
}
