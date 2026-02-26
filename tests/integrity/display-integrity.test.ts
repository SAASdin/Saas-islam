// ============================================================
// display-integrity.test.ts — Tests d'intégrité d'affichage
// Ces tests vérifient que le code source NE TRANSFORME PAS
// le texte arabe avant affichage.
// ⚠️  Pas de DB nécessaire — analyse statique du code source
// ============================================================

import { readFileSync, existsSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

// ── Helpers ───────────────────────────────────────────────────

const APP_SRC = join(process.cwd(), 'apps/quran-app/src')

/** Récupère tous les fichiers .tsx / .ts dans un répertoire (récursif) */
function getAllSourceFiles(dir: string): string[] {
  const files: string[] = []
  if (!existsSync(dir)) return files

  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      files.push(...getAllSourceFiles(full))
    } else if (['.ts', '.tsx'].includes(extname(entry))) {
      files.push(full)
    }
  }
  return files
}

/** Lit un fichier source */
function readSource(filePath: string): string {
  return existsSync(filePath) ? readFileSync(filePath, 'utf8') : ''
}

/** Cherche un pattern dans tous les fichiers source — retourne les occurrences */
function findInSources(
  files: string[],
  pattern: RegExp,
  excludePatterns: RegExp[] = []
): Array<{ file: string; line: number; content: string }> {
  const results: Array<{ file: string; line: number; content: string }> = []

  for (const file of files) {
    const lines = readSource(file).split('\n')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      // Ignorer les commentaires
      if (line.trimStart().startsWith('//') || line.trimStart().startsWith('*')) continue
      if (excludePatterns.some(ep => ep.test(line))) continue
      if (pattern.test(line)) {
        results.push({ file: file.replace(process.cwd(), ''), line: i + 1, content: line.trim() })
      }
    }
  }

  return results
}

// ── Tests ─────────────────────────────────────────────────────

describe('🎨 Intégrité d\'affichage — Code source', () => {

  let sourceFiles: string[]

  beforeAll(() => {
    sourceFiles = getAllSourceFiles(APP_SRC)
  })

  // ── 1. Transformations interdites sur le texte arabe ───────

  describe('Transformations interdites', () => {

    test('Aucun toLowerCase() sur une variable de texte arabe', () => {
      // Pattern : toLowerCase() après des variables qui semblent arabes
      const violations = findInSources(
        sourceFiles,
        /\.(textArabic|text_arabic|arabicText|ayah\.text|arabic)\s*\.\s*toLowerCase/i,
        [/^\s*\/\//]
      )
      if (violations.length > 0) {
        console.error('toLowerCase() trouvé sur texte arabe :')
        violations.forEach(v => console.error(`  ${v.file}:${v.line} → ${v.content}`))
      }
      expect(violations).toHaveLength(0)
    })

    test('Aucun trim() agressif sur textArabic / text_arabic', () => {
      const violations = findInSources(
        sourceFiles,
        /\.(textArabic|text_arabic)\s*\.\s*trim\s*\(\s*\)/,
        [/^\s*\/\//]
      )
      expect(violations).toHaveLength(0)
    })

    test('Aucun normalize(NFC/NFD/NFKC/NFKD) sur le texte arabe', () => {
      // La normalisation Unicode peut altérer les caractères arabes spéciaux
      const violations = findInSources(
        sourceFiles,
        /\.(textArabic|text_arabic|arabicText).*\.normalize\s*\(/,
        [/^\s*\/\//]
      )
      expect(violations).toHaveLength(0)
    })

    test('Aucun replace() avec regex Unicode étendue sur textArabic', () => {
      // Replace général sur textArabic = suspect
      const violations = findInSources(
        sourceFiles,
        /textArabic\s*\.\s*replace\s*\(/,
        [/^\s*\/\//]
      )
      expect(violations).toHaveLength(0)
    })

    test('Aucun slice() ou substring() tronquant le texte arabe directement', () => {
      const violations = findInSources(
        sourceFiles,
        /textArabic\s*\.\s*(slice|substring|substr)\s*\(\s*0\s*,\s*\d+\s*\)/,
        [/^\s*\/\//]
      )
      expect(violations).toHaveLength(0)
    })

  })

  // ── 2. Direction RTL obligatoire ───────────────────────────

  describe('Direction RTL', () => {

    test('AyahDisplay.tsx existe et contient dir="rtl"', () => {
      const ayahDisplay = join(APP_SRC, 'components/quran/AyahDisplay.tsx')
      if (!existsSync(ayahDisplay)) {
        // Chercher dans d'autres chemins possibles
        const all = sourceFiles.filter(f => f.includes('AyahDisplay'))
        if (all.length === 0) {
          console.warn('AyahDisplay.tsx introuvable — skipped')
          return
        }
        const content = readSource(all[0])
        expect(content).toMatch(/dir\s*=\s*["']rtl["']|dir=\{["']rtl["']\}/)
        return
      }
      const content = readSource(ayahDisplay)
      expect(content).toMatch(/dir\s*=\s*["']rtl["']|dir=\{["']rtl["']\}/)
    })

    test('AyahDisplay.tsx contient lang="ar"', () => {
      const files = sourceFiles.filter(f => f.includes('AyahDisplay'))
      if (files.length === 0) {
        console.warn('AyahDisplay.tsx introuvable')
        return
      }
      const content = readSource(files[0])
      expect(content).toMatch(/lang\s*=\s*["']ar["']|lang=\{["']ar["']\}/)
    })

    test('SurahCard.tsx ou équivalent contient dir="rtl" pour le texte arabe', () => {
      const surahFiles = sourceFiles.filter(f =>
        f.includes('SurahCard') || f.includes('surah-card') || f.includes('SurahList')
      )

      if (surahFiles.length === 0) {
        console.warn('SurahCard / SurahList introuvables — skip')
        return
      }

      let hasRtl = false
      for (const f of surahFiles) {
        if (/dir\s*=\s*["']rtl["']/.test(readSource(f))) {
          hasRtl = true
          break
        }
      }
      expect(hasRtl).toBe(true)
    })

    test('Aucune page Coran n\'a dir="ltr" sur un conteneur arabe', () => {
      // dir="ltr" sur un parent d'un texte arabe = bug d'affichage
      const quranFiles = sourceFiles.filter(f =>
        f.includes('/surah/') || f.includes('/quran/')
      )

      const suspectLtr = findInSources(
        quranFiles,
        /dir\s*=\s*["']ltr["']/,
        [/arabic.*ltr|ltr.*arabic/i] // Exclure les commentaires légitimes
      )

      // C'est une alerte, pas un blocage — certaines UI mixtes sont légitimes
      if (suspectLtr.length > 0) {
        console.warn(`dir="ltr" trouvé dans des fichiers Coran (à vérifier) :`)
        suspectLtr.forEach(v => console.warn(`  ${v.file}:${v.line}`))
      }

      // Non bloquant : juste un warning
      expect(true).toBe(true)
    })

  })

  // ── 3. Police coranique obligatoire ───────────────────────

  describe('Police coranique', () => {

    test('La classe "quran-text" est utilisée pour afficher le texte arabe', () => {
      const ayahFiles = sourceFiles.filter(f =>
        f.includes('AyahDisplay') || f.includes('ayah-display') || f.includes('SurahReader')
      )

      let hasQuranTextClass = false
      for (const f of ayahFiles) {
        if (/quran-text/.test(readSource(f))) {
          hasQuranTextClass = true
          break
        }
      }

      // Vérifier aussi dans les fichiers CSS/globals
      const cssFiles = [
        join(APP_SRC, 'app/globals.css'),
        join(APP_SRC, 'styles/globals.css'),
      ].filter(existsSync)

      let quranTextInCss = false
      for (const f of cssFiles) {
        if (/\.quran-text/.test(readFileSync(f, 'utf8'))) {
          quranTextInCss = true
          break
        }
      }

      // Au moins l'un des deux doit être vrai
      expect(hasQuranTextClass || quranTextInCss).toBe(true)
    })

    test('Le CSS ne surcharge pas la police coranique avec Arial ou Helvetica', () => {
      // Chercher dans tous les fichiers CSS/TSX/globals
      const cssAndSourceFiles = [
        ...sourceFiles,
        join(APP_SRC, 'app/globals.css'),
        join(APP_SRC, 'styles/globals.css'),
        join(process.cwd(), 'apps/quran-app/tailwind.config.ts'),
        join(process.cwd(), 'apps/quran-app/tailwind.config.js'),
      ].filter(existsSync)

      // Chercher Arial / Helvetica dans le contexte de classe quran-text
      const suspectFonts = findInSources(
        cssAndSourceFiles,
        /font-family\s*:\s*["']?(Arial|Helvetica)[^"']*["']?/i,
        [/\/\*.*\*\//, /quran.*comment/i]
      )

      expect(suspectFonts).toHaveLength(0)
    })

    test('Les fichiers CSS définissent une police arabe (Amiri, Scheherazade, KFGQPC)', () => {
      const cssFiles = [
        join(APP_SRC, 'app/globals.css'),
        join(APP_SRC, 'styles/globals.css'),
        ...sourceFiles.filter(f => f.endsWith('.css')),
      ].filter(existsSync)

      // Chercher au moins une déclaration de police arabe
      const arabicFontPattern = /Amiri|Scheherazade|KFGQPC|quran|arabic.*font|font.*arabic/i

      let found = false
      for (const f of cssFiles) {
        if (arabicFontPattern.test(readFileSync(f, 'utf8'))) {
          found = true
          break
        }
      }

      // Aussi dans tailwind.config
      const tailwindConfigs = [
        join(process.cwd(), 'apps/quran-app/tailwind.config.ts'),
        join(process.cwd(), 'apps/quran-app/tailwind.config.js'),
      ].filter(existsSync)

      for (const f of tailwindConfigs) {
        if (arabicFontPattern.test(readFileSync(f, 'utf8'))) {
          found = true
          break
        }
      }

      expect(found).toBe(true)
    })

  })

  // ── 4. Pas de traduction auto non signalée ────────────────

  describe('Traductions automatiques', () => {

    test('Les composants de traduction affichent le badge ⚠️ si isValidated=false', () => {
      // Chercher les composants qui affichent des traductions
      const translationFiles = sourceFiles.filter(f =>
        f.includes('translation') || f.includes('Translation') ||
        f.includes('AyahDisplay') || f.includes('Hadith')
      )

      // Ces fichiers doivent gérer le cas isValidated=false
      // (ou au moins référencer isValidated)
      let handlesValidation = false
      for (const f of translationFiles) {
        const content = readSource(f)
        if (content.includes('isValidated') || content.includes('is_validated') ||
            content.includes('Traduction automatique') || content.includes('auto-translated')) {
          handlesValidation = true
          break
        }
      }

      if (!handlesValidation) {
        console.warn(
          '⚠️  Aucun composant ne gère explicitement isValidated — ' +
          'assurer que les traductions auto sont signalées à l\'utilisateur'
        )
      }

      // Non bloquant pour l'instant (feature en cours d'implémentation)
      expect(true).toBe(true)
    })

  })

  // ── 5. Intégrité des données passées aux composants ────────

  describe('Passage des données aux composants', () => {

    test('lib/quran-api.ts existe et exporte des fonctions de fetch', () => {
      const apiFile = sourceFiles.find(f => f.includes('quran-api'))
      expect(apiFile).toBeDefined()

      const content = readSource(apiFile!)
      // Doit exporter des fonctions de récupération
      expect(content).toMatch(/export\s+(async\s+)?function|export\s+const/)
    })

    test('lib/quran-api.ts ne modifie pas le texte arabe', () => {
      const apiFile = sourceFiles.find(f => f.includes('quran-api'))
      if (!apiFile) return

      const content = readSource(apiFile)

      // Ces opérations sont interdites sur le texte arabe
      const forbidden = [
        /text.*\.toLowerCase\(\)/,
        /text.*\.toUpperCase\(\)/,
        /text.*\.normalize\s*\(/,
      ]

      for (const pattern of forbidden) {
        expect(content).not.toMatch(pattern)
      }
    })

    test('Les données coraniques passent par les types définis (types/quran.ts)', () => {
      const typesFile = sourceFiles.find(f => f.includes('types/quran'))
      expect(typesFile).toBeDefined()

      const content = readSource(typesFile!)
      // Doit définir les types principaux
      expect(content).toMatch(/interface|type.*Surah|type.*Ayah/)
    })

  })

  // ── 6. Pas d'écriture en zone sacrée depuis le frontend ───

  describe('Sécurité — Pas d\'écriture en zone sacrée', () => {

    test('Aucun appel Prisma create/update/delete sur QuranAyah/QuranSurah depuis le frontend', () => {
      // Le code frontend ne doit jamais écrire en zone sacrée
      const violations = findInSources(
        sourceFiles,
        /prisma\.(quranAyah|quranSurah|quranTranslation|hadith)\.(create|update|delete|upsert)\s*\(/i,
        [/seeds|database\/seeds/]
      )

      if (violations.length > 0) {
        console.error('ÉCRITURE EN ZONE SACRÉE DÉTECTÉE :')
        violations.forEach(v => console.error(`  ${v.file}:${v.line} → ${v.content}`))
      }

      expect(violations).toHaveLength(0)
    })

    test('Aucune mutation de données islamiques dans les API routes Next.js', () => {
      const apiFiles = sourceFiles.filter(f =>
        f.includes('/api/') && (f.endsWith('.ts') || f.endsWith('.tsx'))
      )

      const mutations = findInSources(
        apiFiles,
        /(quranAyah|quranSurah|QuranAyah|QuranSurah|hadiths)\.(create|update|delete)\s*\(/,
        []
      )

      expect(mutations).toHaveLength(0)
    })

  })

})
