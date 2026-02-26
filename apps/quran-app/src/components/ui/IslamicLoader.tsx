'use client'
// ============================================================
// IslamicLoader.tsx — Spinner de chargement islamique
// Utilise l'étoile à 8 branches (symbole géométrique islamique)
// ============================================================

interface IslamicLoaderProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
  className?: string
}

const SIZES = {
  sm:  { container: 'w-8 h-8',   text: 'text-xs' },
  md:  { container: 'w-12 h-12', text: 'text-sm' },
  lg:  { container: 'w-16 h-16', text: 'text-base' },
}

export default function IslamicLoader({
  size = 'md',
  message,
  className = '',
}: IslamicLoaderProps) {
  const s = SIZES[size]

  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${className}`}
      role="status"
      aria-label={message ?? 'Chargement...'}
    >
      {/* Étoile islamique animée */}
      <div className={`relative ${s.container}`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full animate-spin"
          style={{ animationDuration: '3s' }}
          aria-hidden="true"
        >
          {/* Étoile à 8 branches */}
          <g transform="translate(50,50)">
            {Array.from({ length: 8 }).map((_, i) => (
              <rect
                key={i}
                x="-5"
                y="-40"
                width="10"
                height="24"
                rx="3"
                transform={`rotate(${i * 45})`}
                fill={i % 2 === 0 ? '#d4af37' : '#1a7f4b'}
                opacity={0.7 + (i % 2) * 0.3}
              />
            ))}
            {/* Cercle central */}
            <circle r="8" fill="#d4af37" opacity="0.9" />
          </g>
        </svg>
      </div>

      {/* Message de chargement */}
      {message && (
        <p className={`text-slate-400 ${s.text}`}>{message}</p>
      )}

      {/* Texte SR uniquement */}
      <span className="sr-only">{message ?? 'Chargement en cours...'}</span>
    </div>
  )
}

// ── Variante page complète ────────────────────────────────────
export function IslamicPageLoader({ message }: { message?: string }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#0a0f1e' }}
    >
      <IslamicLoader size="lg" message={message ?? 'Chargement...'} />
    </div>
  )
}
