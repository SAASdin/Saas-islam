'use client'
// ============================================================
// ShareVerse.tsx — Génération image partage Instagram/WhatsApp
// Canvas 1080×1080 — 3 templates islamiques
// ⚠️  textArabe SACRÉ — copié tel quel sur canvas
// ============================================================
import { useState, useRef, useCallback } from 'react'
import { sanitizeTranslation } from '@/lib/sanitize'

interface ShareVerseProps {
  verseKey: string
  textUthmani: string        // ⚠️ SACRÉ
  translationText?: string
  surahName: string
  isOpen: boolean
  onClose: () => void
}

type Template = 'classic' | 'minimal' | 'night'

const TEMPLATES: { id: Template; label: string; bg: string; text: string; accent: string }[] = [
  {
    id: 'classic',
    label: 'Classique',
    bg: 'linear-gradient(135deg, #0a2e1a 0%, #0d1f2d 50%, #1a0a2e 100%)',
    text: '#f4e9d0',
    accent: '#d4af37',
  },
  {
    id: 'minimal',
    label: 'Minimaliste',
    bg: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
    text: '#1e293b',
    accent: '#15803d',
  },
  {
    id: 'night',
    label: 'Nuit',
    bg: 'linear-gradient(135deg, #0a0f1e 0%, #111827 100%)',
    text: '#e2e8f0',
    accent: '#34d399',
  },
]

export default function ShareVerse({ verseKey, textUthmani, translationText, surahName, isOpen, onClose }: ShareVerseProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template>('classic')
  const [generating, setGenerating] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewRef = useRef<HTMLCanvasElement>(null)

  const cleanTranslation = translationText ? sanitizeTranslation(translationText) : ''

  const generateCanvas = useCallback(async (template: Template, size: number = 1080) => {
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const tmpl = TEMPLATES.find(t => t.id === template) ?? TEMPLATES[0]
    const scale = size / 1080

    // Fond dégradé
    const grad = ctx.createLinearGradient(0, 0, size, size)
    if (template === 'classic') {
      grad.addColorStop(0, '#0a2e1a')
      grad.addColorStop(0.5, '#0d1f2d')
      grad.addColorStop(1, '#1a0a2e')
    } else if (template === 'minimal') {
      grad.addColorStop(0, '#f8fafc')
      grad.addColorStop(1, '#e2e8f0')
    } else {
      grad.addColorStop(0, '#0a0f1e')
      grad.addColorStop(1, '#111827')
    }
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, size)

    // Bordure décorative
    ctx.strokeStyle = tmpl.accent + '40'
    ctx.lineWidth = 4 * scale
    const padding = 40 * scale
    ctx.strokeRect(padding, padding, size - padding * 2, size - padding * 2)
    ctx.strokeStyle = tmpl.accent + '20'
    ctx.lineWidth = 1 * scale
    ctx.strokeRect(padding + 8 * scale, padding + 8 * scale, size - (padding + 8 * scale) * 2, size - (padding + 8 * scale) * 2)

    // Logo NoorApp en haut
    ctx.fillStyle = tmpl.accent
    ctx.font = `bold ${22 * scale}px 'Amiri', serif`
    ctx.textAlign = 'right'
    ctx.direction = 'rtl'
    ctx.fillText('نور', size - 70 * scale, 85 * scale)
    ctx.font = `${14 * scale}px 'Arial', sans-serif`
    ctx.fillStyle = tmpl.text + '80'
    ctx.textAlign = 'left'
    ctx.direction = 'ltr'
    ctx.fillText('NoorApp', 70 * scale, 85 * scale)

    // Séparateur
    ctx.strokeStyle = tmpl.accent + '50'
    ctx.lineWidth = 1 * scale
    ctx.beginPath()
    ctx.moveTo(60 * scale, 100 * scale)
    ctx.lineTo(size - 60 * scale, 100 * scale)
    ctx.stroke()

    // Texte arabe — ⚠️ SACRÉ — copié tel quel
    ctx.fillStyle = tmpl.text
    ctx.textAlign = 'center'
    ctx.direction = 'rtl'

    // Calcul taille police adaptée à la longueur du texte
    const arabicFontSize = Math.max(28, Math.min(54, Math.floor(1400 / textUthmani.length))) * scale
    ctx.font = `${arabicFontSize}px 'Scheherazade New', 'Amiri', serif`

    // Wrap text arabe
    const arabicLines = wrapText(ctx, textUthmani, size - 120 * scale)
    const arabicStartY = 200 * scale
    const arabicLineH = (arabicFontSize + 20 * scale)
    arabicLines.forEach((line, i) => {
      ctx.fillStyle = tmpl.text
      ctx.fillText(line, size / 2, arabicStartY + i * arabicLineH)
    })

    // Séparateur central
    const afterArabicY = arabicStartY + arabicLines.length * arabicLineH + 30 * scale
    ctx.strokeStyle = tmpl.accent + '60'
    ctx.lineWidth = 1 * scale
    ctx.beginPath()
    ctx.moveTo(size / 2 - 80 * scale, afterArabicY)
    ctx.lineTo(size / 2 + 80 * scale, afterArabicY)
    ctx.stroke()

    // Traduction
    if (cleanTranslation) {
      ctx.direction = 'ltr'
      ctx.textAlign = 'center'
      const transFontSize = Math.max(16, Math.min(22, Math.floor(800 / cleanTranslation.length))) * scale
      ctx.font = `italic ${transFontSize}px 'Georgia', serif`
      ctx.fillStyle = tmpl.text + 'cc'
      const transLines = wrapText(ctx, `"${cleanTranslation}"`, size - 160 * scale)
      const transStartY = afterArabicY + 40 * scale
      transLines.forEach((line, i) => {
        ctx.fillText(line, size / 2, transStartY + i * (transFontSize + 12 * scale))
      })
    }

    // Référence en bas
    ctx.direction = 'ltr'
    ctx.textAlign = 'center'
    ctx.font = `bold ${18 * scale}px 'Arial', sans-serif`
    ctx.fillStyle = tmpl.accent
    ctx.fillText(`${surahName} · ${verseKey}`, size / 2, size - 80 * scale)

    // Séparateur bas
    ctx.strokeStyle = tmpl.accent + '50'
    ctx.lineWidth = 1 * scale
    ctx.beginPath()
    ctx.moveTo(60 * scale, size - 100 * scale)
    ctx.lineTo(size - 60 * scale, size - 100 * scale)
    ctx.stroke()

    return canvas
  }, [textUthmani, cleanTranslation, surahName, verseKey])

  // Prévisualisation
  const updatePreview = useCallback(async (tmpl: Template) => {
    const canvas = await generateCanvas(tmpl, 300)
    const preview = previewRef.current
    if (!canvas || !preview) return
    const ctx = preview.getContext('2d')
    if (!ctx) return
    preview.width = 300
    preview.height = 300
    ctx.drawImage(canvas, 0, 0)
  }, [generateCanvas])

  const handleTemplateChange = useCallback(async (tmpl: Template) => {
    setSelectedTemplate(tmpl)
    await updatePreview(tmpl)
  }, [updatePreview])

  const handleDownload = useCallback(async () => {
    setGenerating(true)
    const canvas = await generateCanvas(selectedTemplate, 1080)
    if (canvas) {
      const url = canvas.toDataURL('image/png', 1.0)
      const a = document.createElement('a')
      a.href = url
      a.download = `noorapp-${verseKey.replace(':', '-')}.png`
      a.click()
    }
    setGenerating(false)
  }, [generateCanvas, selectedTemplate, verseKey])

  const handleShare = useCallback(async () => {
    if (!navigator.share && !navigator.clipboard) return
    setGenerating(true)
    const canvas = await generateCanvas(selectedTemplate, 1080)
    if (!canvas) { setGenerating(false); return }
    canvas.toBlob(async (blob) => {
      if (!blob) { setGenerating(false); return }
      const file = new File([blob], `noorapp-${verseKey}.png`, { type: 'image/png' })
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: `${surahName} ${verseKey}` })
      } else {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        alert('Image copiée dans le presse-papier !')
      }
      setGenerating(false)
    }, 'image/png', 1.0)
  }, [generateCanvas, selectedTemplate, verseKey, surahName])

  // Générer la prévisualisation initiale
  const [initialized, setInitialized] = useState(false)
  if (isOpen && !initialized) {
    setInitialized(true)
    setTimeout(() => updatePreview(selectedTemplate), 100)
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-[#0d1526] border border-white/10 rounded-2xl shadow-2xl max-w-lg mx-auto overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <span>🎨</span> Partage premium — {verseKey}
          </h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Prévisualisation */}
        <div className="flex justify-center py-4 bg-black/20">
          <canvas ref={previewRef} width={300} height={300} className="rounded-lg border border-white/10" />
        </div>

        {/* Templates */}
        <div className="px-5 py-3">
          <p className="text-xs text-slate-400 mb-2">Template</p>
          <div className="flex gap-2">
            {TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => handleTemplateChange(t.id)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                  selectedTemplate === t.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex gap-2">
          <button
            onClick={handleDownload}
            disabled={generating}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {generating ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
            Télécharger
          </button>
          <button
            onClick={handleShare}
            disabled={generating}
            className="flex-1 py-2.5 bg-white/10 hover:bg-white/15 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Partager
          </button>
        </div>
      </div>
    </>
  )
}

// Utilitaire : wrap texte sur canvas
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}
