// POST /api/fatwas/ask
// Agent IA de consultation des références islamiques classiques
// ⚠️ Retourne UNIQUEMENT du contenu issu de la base de données Shamela

import { NextRequest, NextResponse } from 'next/server';
import { askFatwaAgent } from '@/lib/fatwa-agent/agent';

export const dynamic = 'force-dynamic';

const VALID_MADHABS = ['hanafi', 'maliki', 'shafii', 'hanbali', 'salafi'];
const VALID_DOMAINS = [
  'purification-taharah', 'priere-salat', 'zakat', 'jeune-siyam', 'hajj-umrah',
  'mariage-nikah', 'divorce-talaq', 'heritage-mawaris', 'commerce-muamalat',
  'finance-islamique', 'alimentation-atimah', 'habillement-libs',
  'relations-sociales', 'aqida-croyance', 'coran-lecture', 'invocations-adkar',
  'medical-sante', 'travail-emploi', 'technologie-moderne', 'jihad-defensif', 'divers',
];

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as {
      question?: string;
      madhab?: string;
      domain?: string;
      lang?: string;
      maxSources?: number;
    };

    // Validation
    const question = body.question?.trim();
    if (!question || question.length < 5) {
      return NextResponse.json(
        { error: 'Question trop courte (minimum 5 caractères)' },
        { status: 400 }
      );
    }
    if (question.length > 500) {
      return NextResponse.json(
        { error: 'Question trop longue (maximum 500 caractères)' },
        { status: 400 }
      );
    }

    const madhab = body.madhab && VALID_MADHABS.includes(body.madhab)
      ? body.madhab : undefined;
    const domain = body.domain && VALID_DOMAINS.includes(body.domain)
      ? body.domain : undefined;
    const lang  = body.lang === 'ar' ? 'ar' : 'fr';
    const maxSources = Math.min(10, Math.max(3, body.maxSources ?? 6));

    // Appel agent
    const response = await askFatwaAgent(question, { madhab, domain, lang, maxSources });

    return NextResponse.json(response);
  } catch (err) {
    console.error('Fatwa agent error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
