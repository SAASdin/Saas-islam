// ============================================================
// lib/sanitize.ts — Nettoyage du HTML dans les traductions
// Les APIs (QuranCDN, Sunnah.com) retournent du HTML brut
// ⚠️  NE JAMAIS appliquer sur le texte arabe coranique
// ============================================================

/**
 * Supprime les balises HTML d'une traduction
 * Conserve le texte visible, supprime footnotes, superscripts, etc.
 */
export function sanitizeTranslation(html: string): string {
  if (!html) return ''

  return html
    // Supprimer les footnotes qurancdn : <sup foot_note=123456>1</sup>
    .replace(/<sup[^>]*>.*?<\/sup>/gi, '')
    // Supprimer toutes les balises HTML restantes
    .replace(/<[^>]+>/g, '')
    // Décoder les entités HTML basiques
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    // Nettoyer les espaces multiples
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Nettoyage léger — conserve les sauts de ligne
 */
export function sanitizeLight(html: string): string {
  if (!html) return ''
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/p>/gi, '\n')
    .replace(/<sup[^>]*>.*?<\/sup>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim()
}
