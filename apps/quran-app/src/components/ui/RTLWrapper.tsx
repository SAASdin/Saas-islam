// ============================================================
// RTLWrapper.tsx — Wrapper RTL réutilisable pour texte arabe
// ⚠️  OBLIGATOIRE sur tout élément contenant du texte arabe :
//     - dir="rtl"
//     - lang="ar"
//     - police islamique (font-quran ou var(--font-amiri))
//     - JAMAIS appliquer de transformation au texte enfant
// ============================================================

interface RTLWrapperProps {
  children: React.ReactNode
  /** Tag HTML à utiliser (défaut : div) */
  as?: 'div' | 'p' | 'span' | 'section' | 'article'
  /** Taille de police (défaut : md = 1.8rem) */
  fontSize?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | string
  /** Alignement du texte (défaut : right pour RTL) */
  textAlign?: 'right' | 'center' | 'justify'
  className?: string
  style?: React.CSSProperties
  id?: string
}

const FONT_SIZES: Record<string, string> = {
  sm:  '1rem',
  md:  '1.8rem',
  lg:  '2.2rem',
  xl:  '2.8rem',
  xxl: '3.5rem',
}

export default function RTLWrapper({
  children,
  as: Tag = 'div',
  fontSize = 'md',
  textAlign = 'right',
  className = '',
  style = {},
  id,
}: RTLWrapperProps) {
  const resolvedSize = FONT_SIZES[fontSize] ?? fontSize

  return (
    <Tag
      dir="rtl"
      lang="ar"
      id={id}
      className={`quran-text leading-loose ${className}`}
      style={{
        fontFamily: 'var(--font-kfgqpc, var(--font-amiri))',
        fontSize: resolvedSize,
        textAlign,
        letterSpacing: 0,
        // Optimisation rendu texte arabe
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        // ⚠️ Ne jamais ajouter textTransform, letterSpacing personnalisé sur texte arabe
        ...style,
      }}
    >
      {children}
    </Tag>
  )
}

// ── Export d'un composant span inline ────────────────────────
export function ArabicSpan({
  children,
  fontSize = 'sm',
  className = '',
}: {
  children: React.ReactNode
  fontSize?: string
  className?: string
}) {
  return (
    <RTLWrapper as="span" fontSize={fontSize} className={className}>
      {children}
    </RTLWrapper>
  )
}
