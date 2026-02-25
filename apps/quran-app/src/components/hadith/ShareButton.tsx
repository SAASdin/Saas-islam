'use client'
// ============================================================
// ShareButton.tsx — Partage d'un hadith — Client Component
// ============================================================

interface Props {
  text: string
  url: string
}

export default function ShareButton({ text, url }: Props) {
  async function handleShare() {
    const fullUrl = `${window.location.origin}${url}`
    if (navigator.share) {
      await navigator.share({ text, url: fullUrl }).catch(() => {})
    } else {
      await navigator.clipboard.writeText(`${text}\n\n${fullUrl}`).catch(() => {})
      alert('Lien copié dans le presse-papiers !')
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs transition-all duration-200 hover:opacity-80"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: '#64748b',
        cursor: 'pointer',
      }}
      type="button"
    >
      <span>🔗</span>
      <span>Partager ce hadith</span>
    </button>
  )
}
