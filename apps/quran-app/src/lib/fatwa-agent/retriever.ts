// fatwa-agent/retriever.ts
// Récupère les passages pertinents depuis la DB pour une question donnée
// Utilise PostgreSQL full-text search (arabe + français)
// ⚠️ Ne retourne QUE du texte issu de la DB — jamais généré par IA

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ── Types ─────────────────────────────────────────────────────

export interface RetrievedPassage {
  id: number;
  answerArabic: string;       // ⚠️ Texte immuable — source directe
  chapterHint: string | null;
  volume: number | null;
  pageNumber: number | null;
  madhab: string;
  domain: string;
  scholar: {
    nameArabic: string;
    nameFr: string | null;
    era: string;
  };
  book: {
    titleArabic: string;
    titleFr: string | null;
    shamelaLocalId: number | null;
  };
  rank: number; // Score de pertinence (0–1)
}

export interface RetrievalQuery {
  question: string;       // Question en arabe ou français
  madhab?: string;        // "hanafi"|"maliki"|"shafii"|"hanbali"|"salafi"|null
  domain?: string;        // Domaine optionnel pour filtrer
  limit?: number;         // Nombre de passages (défaut: 8)
  lang?: 'ar' | 'fr';    // Langue de la question
}

// ── Normalisation de la requête ────────────────────────────────

function isArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

function extractKeywords(question: string): string[] {
  // Supprimer les mots vides courants (arabe et français)
  const stopwordsAr = new Set(['هل', 'ما', 'من', 'في', 'على', 'إلى', 'عن', 'مع',
    'هذا', 'هذه', 'ذلك', 'تلك', 'أن', 'إن', 'كان', 'كانت', 'يكون', 'التي', 'الذي',
    'وما', 'فما', 'وهل', 'أم', 'أو', 'لا', 'ليس', 'كيف', 'متى', 'أين', 'لماذا']);
  const stopwordsFr = new Set(['le', 'la', 'les', 'de', 'du', 'des', 'un', 'une',
    'est', 'sont', 'avec', 'dans', 'sur', 'pour', 'par', 'en', 'et', 'ou', 'ni',
    'que', 'qui', 'quoi', 'comment', 'quand', 'où', 'pourquoi', 'si', 'ce', 'cet']);

  const words = question
    .replace(/[^\u0600-\u06FF\u0621-\u064Aa-zA-ZÀ-ÿ\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 3)
    .filter(w => !stopwordsAr.has(w) && !stopwordsFr.has(w.toLowerCase()));

  return [...new Set(words)].slice(0, 6); // Max 6 mots-clés
}

// ── Retriever principal ────────────────────────────────────────

export async function retrievePassages(query: RetrievalQuery): Promise<RetrievedPassage[]> {
  const {
    question,
    madhab,
    domain,
    limit = 8,
    lang = isArabic(question) ? 'ar' : 'fr',
  } = query;

  const keywords = extractKeywords(question);
  if (keywords.length === 0) return [];

  // ── Requête PostgreSQL ────────────────────────────────────────
  // On cherche dans answer_arabic ET chapter_hint
  // On rank par ts_rank (pertinence) + filtre madhab si fourni
  const madhabFilter = madhab ? `AND f.madhab = '${madhab.replace(/'/g, "''")}'` : '';
  const domainFilter = domain ? `AND f.domain = '${domain.replace(/'/g, "''")}'` : '';

  // Scholars canoniques par madhab (priorités de rang)
  // Ibn Taymiyyah pratique l'ijtihad → non prioritaire pour hanbali établi
  const canonicalScholars: Record<string, string[]> = {
    hanbali: ['البهوتي', 'ابن قدامة'],
    maliki:  ['الخرشي', 'الدردير', 'الدسوقي', 'الحطاب'],
    hanafi:  ['ابن عابدين'],
    shafii:  ['الرملي', 'ابن حجر الهيثمي'],
    salafi:  ['ابن باز', 'ابن عثيمين', 'اللجنة الدائمة'],
  };

  // Boost pour les scholars canoniques du madhab sélectionné
  const canonicals = madhab ? canonicalScholars[madhab] ?? [] : [];
  const canonicalBoost = canonicals.length > 0
    ? `+ CASE WHEN ${canonicals.map(s => `fs.name_arabic LIKE '%${s}%'`).join(' OR ')} THEN 0.3 ELSE 0 END`
    : '';

  // PostgreSQL tsvector ne tokenise pas l'arabe Unicode → ILIKE pour l'arabe
  // Pour chaque mot-clé, on construit une condition ILIKE OR
  const isArabicQuery = isArabic(keywords.join(''));

  let whereKeywords: string;
  let sqlParams: (string | number)[];

  if (isArabicQuery) {
    // Recherche arabe : ILIKE sur chaque mot-clé
    const ilikeConditions = keywords
      .map((_, i) => `(f.answer_arabic ILIKE $${i + 1} OR COALESCE(f.chapter_hint,'') ILIKE $${i + 1})`)
      .join(' OR ');
    whereKeywords = `(${ilikeConditions})`;
    sqlParams = [...keywords.map(k => `%${k}%`), limit];
  } else {
    // Recherche française : full-text
    const tsQuery = keywords.map(k => `${k}:*`).join(' | ');
    whereKeywords = `to_tsvector('french', COALESCE(f.answer_fr,'') || ' ' || COALESCE(f.chapter_hint,''))
        @@ to_tsquery('french', $1)`;
    sqlParams = [tsQuery, limit];
  }

  const limitParam = `$${sqlParams.length}`;

  const sql = `
    SELECT
      f.id,
      f.answer_arabic,
      f.chapter_hint,
      f.volume,
      f.page_number,
      f.madhab,
      f.domain,
      fs.name_arabic  AS scholar_name_ar,
      fs.name_fr      AS scholar_name_fr,
      fs.era          AS scholar_era,
      fb.title_arabic AS book_title_ar,
      fb.title_fr     AS book_title_fr,
      fb.shamela_local_id,
      (
        1.0
        ${canonicalBoost}
      ) AS rank
    FROM app.fatwas f
    JOIN app.fatwa_scholars fs ON f.scholar_id = fs.id
    JOIN app.fatwa_books    fb ON f.book_id    = fb.id
    WHERE
      ${whereKeywords}
      ${madhabFilter}
      ${domainFilter}
      AND length(f.answer_arabic) > 100
    ORDER BY
      CASE WHEN ${canonicals.length > 0
        ? canonicals.map(s => `fs.name_arabic LIKE '%${s}%'`).join(' OR ')
        : 'false'} THEN 0 ELSE 1 END,
      f.id ASC
    LIMIT ${limitParam}
  `;

  try {
    const rows = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(sql, ...sqlParams);

    return rows.map((r: Record<string, unknown>, i: number) => ({
      id: r.id as number,
      answerArabic: r.answer_arabic as string,
      chapterHint: r.chapter_hint as string | null,
      volume: r.volume as number | null,
      pageNumber: r.page_number as number | null,
      madhab: r.madhab as string,
      domain: r.domain as string,
      scholar: {
        nameArabic: r.scholar_name_ar as string,
        nameFr: r.scholar_name_fr as string | null,
        era: r.scholar_era as string,
      },
      book: {
        titleArabic: r.book_title_ar as string,
        titleFr: r.book_title_fr as string | null,
        shamelaLocalId: r.shamela_local_id as number | null,
      },
      rank: parseFloat(String(r.rank ?? 0)),
    }));
  } catch (err) {
    console.error('Retriever error:', err);
    return [];
  }
}

// ── Déduplication des passages (même chapitre/page) ───────────

export function deduplicatePassages(passages: RetrievedPassage[]): RetrievedPassage[] {
  const seen = new Set<string>();
  return passages.filter(p => {
    const key = `${p.book.titleArabic}-${p.volume}-${p.pageNumber}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
