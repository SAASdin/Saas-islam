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
 * Supprime les footnotes et balises de style, garde le texte pur
 */
export function sanitizeLight(html: string): string {
  if (!html) return ''
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/p>/gi, '\n\n')
    // Supprimer footnotes (qurancdn)
    .replace(/<sup[^>]*>.*?<\/sup>/gi, '')
    // Convertir les span de mise en valeur en texte brut
    .replace(/<span[^>]*class="[^"]*green[^"]*"[^>]*>(.*?)<\/span>/gi, '$1')
    .replace(/<span[^>]*>(.*?)<\/span>/gi, '$1')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '$1')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '$1')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '$1')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '$1')
    // Supprimer toutes balises restantes
    .replace(/<[^>]+>/g, '')
    // Entités HTML
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    // Nettoyer espaces multiples mais garder les sauts de ligne
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
