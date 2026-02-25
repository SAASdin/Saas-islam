// fatwa-agent/agent.ts
// Agent IA de consultation des références islamiques classiques
//
// ⚠️ RÈGLES ABSOLUES (SOUL.md) :
// 1. L'agent ne génère JAMAIS de fatwa — il cite uniquement les sources
// 2. Il ne modifie JAMAIS le texte arabe original
// 3. Il affiche TOUJOURS : savant + livre + volume/page
// 4. Il affiche TOUJOURS le disclaimer en fin de réponse
// 5. Les traductions non vérifiées sont TOUJOURS marquées "auto"

import Anthropic from '@anthropic-ai/sdk';
import { retrievePassages, deduplicatePassages, type RetrievedPassage, type RetrievalQuery } from './retriever';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? '',
});

// ── Types ─────────────────────────────────────────────────────

export interface Citation {
  passageId: number;
  textArabic: string;       // Texte arabe original — IMMUABLE
  chapterHint: string | null;
  scholar: string;          // Nom du savant
  book: string;             // Titre du livre
  volume: number | null;
  page: number | null;
  madhab: string;
  era: string;
}

export interface AgentResponse {
  question: string;
  madhab: string | null;
  synthesis: string;        // Réponse synthétisée (en français)
  synthesisAr: string | null; // Synthèse en arabe si demandée
  citations: Citation[];    // Sources utilisées
  citationsCount: number;
  disclaimer: string;
  noResultsFound: boolean;
  processingTimeMs: number;
}

// ── Madhabs et leur label ──────────────────────────────────────

const MADHAB_LABELS: Record<string, string> = {
  hanafi:  'Hanafi (إمام أبو حنيفة)',
  maliki:  'Maliki (إمام مالك بن أنس)',
  shafii:  'Shafi\'i (إمام الشافعي)',
  hanbali: 'Hanbali classique (إمام أحمد بن حنبل)',
  salafi:  'Courant Salafi contemporain',
  general: 'Toutes écoles',
};

// ── Prompt système de l'agent ──────────────────────────────────
// Critique : définit le comportement de l'IA de façon stricte

function buildSystemPrompt(madhab: string | null): string {
  const madhabLabel = madhab ? MADHAB_LABELS[madhab] ?? madhab : 'selon l\'école spécifiée';

  return `Tu es un assistant de recherche en droit islamique classique (fiqh).
Tu aides à retrouver et expliquer ce que les savants islamiques ont dit dans leurs livres.

## RÈGLES ABSOLUES — NE JAMAIS VIOLER

1. **Tu ne donnes JAMAIS de fatwa.** Tu n'as aucune autorité religieuse.
2. **Tu cites UNIQUEMENT les passages fournis.** Tu n'inventes aucun avis religieux.
3. **Si les sources ne répondent pas à la question**, dis-le clairement : "Les sources disponibles ne traitent pas directement de cette question."
4. **Tu termines TOUJOURS** par le disclaimer complet.
5. **Tu ne présentes JAMAIS** ta synthèse comme une fatwa ou un avis islamique officiel.
6. **Tu ne modifies JAMAIS** le texte arabe cité — reproduction exacte obligatoire.

## RÔLE

Tu es un outil de recherche bibliographique islamique ${madhab ? `spécialisé dans le madhab ${madhabLabel}` : ''}.
Tu lis les passages extraits de livres de fiqh classiques et tu en fais une synthèse honnête en précisant toujours l'auteur et la source.

## FORMAT DE RÉPONSE OBLIGATOIRE

Réponds en français (ou dans la langue de la question).
Structure ta réponse ainsi :

**📚 Ce que disent les sources**
[Synthèse fidèle des passages — cite les savants nommément]

**🔖 Passages clés (texte original arabe)**
[Pour chaque passage pertinent : titre du chapitre si disponible, puis le texte arabe entre guillemets arabes « »]

**⚠️ Avertissement important**
Les éléments ci-dessus sont extraits de livres de référence islamique classiques à titre informatif. Cette réponse n'est PAS une fatwa. Pour votre situation personnelle, consultez un savant qualifié (عالم مؤهل).`;
}

// ── Formater les passages pour le contexte Claude ─────────────

function formatPassagesForContext(passages: RetrievedPassage[]): string {
  if (passages.length === 0) return 'Aucun passage trouvé dans la base de données.';

  return passages.map((p, i) => {
    const ref = [
      `Savant: ${p.scholar.nameArabic}${p.scholar.nameFr ? ` (${p.scholar.nameFr})` : ''}`,
      `Livre: ${p.book.titleArabic}${p.book.titleFr ? ` — ${p.book.titleFr}` : ''}`,
      p.volume ? `Volume: ${p.volume}` : null,
      p.pageNumber ? `Page: ${p.pageNumber}` : null,
      `Madhab: ${MADHAB_LABELS[p.madhab] ?? p.madhab}`,
      p.chapterHint ? `Chapitre: ${p.chapterHint}` : null,
    ].filter(Boolean).join(' | ');

    // Tronquer les passages très longs (garder les 500 premiers caractères)
    const text = p.answerArabic.length > 600
      ? p.answerArabic.substring(0, 600) + '...'
      : p.answerArabic;

    return `[SOURCE ${i + 1}] ${ref}\n« ${text} »`;
  }).join('\n\n---\n\n');
}

// ── Agent principal ────────────────────────────────────────────

export async function askFatwaAgent(
  question: string,
  options: {
    madhab?: string;
    domain?: string;
    lang?: 'ar' | 'fr';
    maxSources?: number;
  } = {}
): Promise<AgentResponse> {
  const startTime = Date.now();
  const { madhab, domain, lang = 'fr', maxSources = 8 } = options;

  // ── 1. Retrieval ─────────────────────────────────────────────
  const query: RetrievalQuery = {
    question,
    madhab: madhab || undefined,
    domain: domain || undefined,
    limit: maxSources + 4, // Surcharger pour déduplication
    lang,
  };

  let passages = await retrievePassages(query);
  passages = deduplicatePassages(passages).slice(0, maxSources);

  // ── 2. Si aucun résultat ─────────────────────────────────────
  if (passages.length === 0) {
    return {
      question,
      madhab: madhab ?? null,
      synthesis: `Aucun passage pertinent trouvé dans la base de données pour cette question${madhab ? ` en madhab ${MADHAB_LABELS[madhab] ?? madhab}` : ''}. Essayez avec des mots-clés différents ou sans filtre de madhab.`,
      synthesisAr: null,
      citations: [],
      citationsCount: 0,
      disclaimer: 'Cette réponse n\'est pas une fatwa. Consultez un savant qualifié pour votre situation personnelle.',
      noResultsFound: true,
      processingTimeMs: Date.now() - startTime,
    };
  }

  // ── 3. Synthèse par Claude ────────────────────────────────────
  const systemPrompt = buildSystemPrompt(madhab ?? null);
  const contextText = formatPassagesForContext(passages);

  const userMessage = `Question : ${question}

Voici les passages extraits de la base de données de référence islamique :

${contextText}

En te basant UNIQUEMENT sur ces passages (ne rien inventer), réponds à la question en respectant le format demandé.`;

  let synthesis = '';

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    synthesis = message.content[0]?.type === 'text'
      ? message.content[0].text
      : 'Erreur lors de la génération de la réponse.';
  } catch (err) {
    console.error('Claude API error:', err);
    synthesis = 'Service temporairement indisponible. Voici les sources brutes ci-dessous.';
  }

  // ── 4. Construire les citations ───────────────────────────────
  const citations: Citation[] = passages.map(p => ({
    passageId: p.id,
    textArabic: p.answerArabic,   // ⚠️ IMMUABLE
    chapterHint: p.chapterHint,
    scholar: `${p.scholar.nameArabic}${p.scholar.nameFr ? ` — ${p.scholar.nameFr}` : ''}`,
    book: `${p.book.titleArabic}${p.book.titleFr ? ` (${p.book.titleFr})` : ''}`,
    volume: p.volume,
    page: p.pageNumber,
    madhab: MADHAB_LABELS[p.madhab] ?? p.madhab,
    era: p.scholar.era,
  }));

  return {
    question,
    madhab: madhab ?? null,
    synthesis,
    synthesisAr: null,
    citations,
    citationsCount: citations.length,
    disclaimer: 'Cette réponse est extraite de livres de référence islamique à titre informatif uniquement. Elle n\'est PAS une fatwa. Pour votre situation personnelle, consultez un savant qualifié (عالم مؤهل).',
    noResultsFound: false,
    processingTimeMs: Date.now() - startTime,
  };
}
