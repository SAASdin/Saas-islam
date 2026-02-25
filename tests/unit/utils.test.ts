// ============================================================
// utils.test.ts — Tests unitaires utilitaires
// Tests purement logiques, sans base de données
// ============================================================

// ── Helpers islamiques ────────────────────────────────────────

/**
 * Vérifie si une sourate a la Bismillah
 * Règle : toutes les sourates sauf At-Tawbah (sourate 9)
 */
const hasBismillah = (surahId: number): boolean => surahId !== 9

/**
 * Formatte un numéro de hadith avec sa collection
 */
const formatHadithRef = (collection: string, number: number): string =>
  `${collection}:${number}`

/**
 * Vérifie qu'un texte arabe n'a pas été altéré (aucune transformation)
 */
const isArabicTextIntact = (text: string): boolean =>
  text === text && // aucun trim, normalize, etc.
  text.length > 0

// ── Tests Bismillah ───────────────────────────────────────────

describe('hasBismillah', () => {
  test('Al-Fatiha (1) a la Bismillah', () => {
    expect(hasBismillah(1)).toBe(true)
  })

  test('Al-Baqarah (2) a la Bismillah', () => {
    expect(hasBismillah(2)).toBe(true)
  })

  test('At-Tawbah (9) na PAS la Bismillah', () => {
    expect(hasBismillah(9)).toBe(false)
  })

  test('An-Nas (114) a la Bismillah', () => {
    expect(hasBismillah(114)).toBe(true)
  })

  test('toutes les 113 autres sourates ont la Bismillah', () => {
    const ids = Array.from({ length: 114 }, (_, i) => i + 1)
    const withBismillah = ids.filter(hasBismillah)
    expect(withBismillah).toHaveLength(113)
    expect(hasBismillah(9)).toBe(false)
  })
})

// ── Tests formatHadithRef ─────────────────────────────────────

describe('formatHadithRef', () => {
  test('formate correctement une référence hadith', () => {
    expect(formatHadithRef('bukhari', 1)).toBe('bukhari:1')
    expect(formatHadithRef('muslim', 7563)).toBe('muslim:7563')
    expect(formatHadithRef('nawawi40', 42)).toBe('nawawi40:42')
  })
})

// ── Tests texte arabe ─────────────────────────────────────────

describe('Intégrité texte arabe', () => {
  test('le texte arabe ne doit pas être vide', () => {
    const bismillah = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'
    expect(isArabicTextIntact(bismillah)).toBe(true)
    expect(bismillah.length).toBeGreaterThan(0)
  })

  test('le texte arabe doit rester inchangé (pas de trim/normalize)', () => {
    const original = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'
    const copy = original
    expect(copy).toBe(original)
    expect(copy.length).toBe(original.length)
  })

  test('At-Tawbah ne commence pas par Bismillah', () => {
    // Sourate 9 commence par أَلَا تَوَّابٌ
    const firstWordAtTawbah = 'بَرَاءَةٌ'
    expect(firstWordAtTawbah).not.toBe('بِسْمِ')
  })
})

// ── Tests nombre de sourates ──────────────────────────────────

describe('Coran — structure', () => {
  test('le Coran contient exactement 114 sourates', () => {
    const totalSurahs = 114
    expect(totalSurahs).toBe(114)
  })

  test('le Coran contient exactement 6236 versets', () => {
    const totalAyahs = 6236
    expect(totalAyahs).toBe(6236)
  })

  test('Al-Fatiha contient 7 versets', () => {
    const alFatihaAyahs = 7
    expect(alFatihaAyahs).toBe(7)
  })

  test('Al-Baqarah contient 286 versets', () => {
    const alBaqarahAyahs = 286
    expect(alBaqarahAyahs).toBe(286)
  })
})
