'use client';

// Page : Agent IA de consultation des références islamiques
// Recherche dans 101,993 passages de fiqh classique (Shamela)
// ⚠️ Affiche UNIQUEMENT du contenu issu des sources — jamais généré par IA

import { useState } from 'react';
import type { AgentResponse, Citation } from '@/lib/fatwa-agent/agent';

// ── Couleurs par madhab ──────────────────────────────────────
const MADHAB_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  hanafi:  { bg: '#3B82F6', text: '#fff', label: 'حنفي' },
  maliki:  { bg: '#10B981', text: '#fff', label: 'مالكي' },
  shafii:  { bg: '#F59E0B', text: '#000', label: 'شافعي' },
  hanbali: { bg: '#8B5CF6', text: '#fff', label: 'حنبلي' },
  salafi:  { bg: '#6B7280', text: '#fff', label: 'سلفي' },
};

const MADHAB_OPTIONS = [
  { value: '', label: 'Tous les madhabs' },
  { value: 'hanafi',  label: '🟦 Hanafi (حنفي)' },
  { value: 'maliki',  label: '🟩 Maliki (مالكي)' },
  { value: 'shafii',  label: '🟨 Shafi\'i (شافعي)' },
  { value: 'hanbali', label: '🟪 Hanbali classique (حنبلي)' },
  { value: 'salafi',  label: '⬛ Salafi contemporain' },
];

const EXAMPLE_QUESTIONS = [
  { q: 'ما حكم صلاة الجماعة؟', madhab: 'maliki', label: 'Maliki' },
  { q: 'ما حكم زكاة الأسهم والصناديق الاستثمارية؟', madhab: 'hanbali', label: 'Hanbali' },
  { q: 'حكم الصلاة على من مات ولم يصلِّ', madhab: 'hanafi', label: 'Hanafi' },
  { q: 'ما حكم الخلع وشروطه؟', madhab: 'shafii', label: 'Shafi\'i' },
  { q: 'حكم التأمين الصحي', madhab: 'salafi', label: 'Ibn Uthaymin' },
];

// ── Composant Citation ────────────────────────────────────────
function CitationCard({ citation, index }: { citation: Citation; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const color = MADHAB_COLORS[citation.madhab.toLowerCase().split(' ')[0]] ?? MADHAB_COLORS.hanafi;
  const shortText = citation.textArabic.substring(0, 200);
  const isLong = citation.textArabic.length > 200;

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
      {/* En-tête source */}
      <div className="flex items-start gap-3 p-4 border-b border-white/10">
        <span
          className="px-2 py-0.5 rounded text-xs font-bold shrink-0 mt-0.5"
          style={{ backgroundColor: color.bg, color: color.text }}
        >
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-white/90 font-semibold text-sm">{citation.scholar.split(' — ')[0]}</p>
          <p className="text-white/50 text-xs mt-0.5 truncate">{citation.book.split(' (')[0]}</p>
          {(citation.volume || citation.page) && (
            <p className="text-white/40 text-xs mt-0.5">
              {citation.volume ? `Vol. ${citation.volume}` : ''}
              {citation.volume && citation.page ? ' · ' : ''}
              {citation.page ? `P. ${citation.page}` : ''}
            </p>
          )}
        </div>
        <span
          className="px-2 py-0.5 rounded-full text-xs shrink-0"
          style={{ backgroundColor: color.bg + '33', color: color.bg }}
        >
          {citation.madhab.split(' ')[0]}
        </span>
      </div>

      {/* Texte arabe — IMMUABLE */}
      <div className="p-4">
        {citation.chapterHint && (
          <p className="text-amber-400/70 text-xs mb-2 font-medium">
            📖 {citation.chapterHint.substring(0, 80)}
          </p>
        )}
        <p
          className="quran-text text-white/85 leading-relaxed text-base"
          dir="rtl"
          lang="ar"
          style={{ fontFamily: 'var(--font-kfgqpc, var(--font-amiri))' }}
        >
          {expanded ? citation.textArabic : shortText}
          {isLong && !expanded && '...'}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-amber-400/70 text-xs hover:text-amber-400 transition-colors"
          >
            {expanded ? '▲ Réduire' : '▼ Lire la suite'}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Page principale ────────────────────────────────────────────
export default function FatwaAskPage() {
  const [question, setQuestion] = useState('');
  const [madhab, setMadhab] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AgentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAsk(q?: string, m?: string) {
    const finalQuestion = q ?? question;
    const finalMadhab   = m ?? madhab;
    if (!finalQuestion.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('/api/fatwas/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: finalQuestion,
          madhab: finalMadhab || undefined,
          lang: /[\u0600-\u06FF]/.test(finalQuestion) ? 'ar' : 'fr',
          maxSources: 6,
        }),
      });

      if (!res.ok) {
        const err = await res.json() as { error: string };
        throw new Error(err.error ?? 'Erreur serveur');
      }

      const data = await res.json() as AgentResponse;
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }

  function useExample(ex: typeof EXAMPLE_QUESTIONS[0]) {
    setQuestion(ex.q);
    setMadhab(ex.madhab);
    handleAsk(ex.q, ex.madhab);
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* En-tête */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">🕌</div>
          <h1 className="text-3xl font-bold text-white mb-2">
            المساعد الفقهي
          </h1>
          <p className="text-white/60 text-lg">Agent de consultation des références islamiques classiques</p>
          <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
            <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-sm">
              📚 101,993 passages
            </span>
            <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm">
              5 madhabs
            </span>
            <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
              18 livres classiques
            </span>
          </div>
        </div>

        {/* Avertissement */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-8 text-sm text-red-300">
          <strong>⚠️ Important :</strong> Cet outil est un assistant de recherche bibliographique uniquement.
          Il ne délivre <strong>pas de fatwas</strong>. Pour toute question religieuse personnelle,
          consultez un savant qualifié (عالم مؤهل).
        </div>

        {/* Zone de saisie */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          {/* Sélecteur madhab */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {MADHAB_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setMadhab(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all border ${
                  madhab === opt.value
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-white/5 border-white/10 text-white/50 hover:text-white/80'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Zone de texte */}
          <div className="relative">
            <textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleAsk(); }}
              placeholder="اكتب سؤالك هنا... أو écrivez votre question en français..."
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/30 resize-none focus:outline-none focus:border-amber-500/50 min-h-[100px]"
              dir="auto"
            />
            <button
              onClick={() => handleAsk()}
              disabled={!question.trim() || loading}
              className="absolute bottom-3 right-3 bg-amber-500 hover:bg-amber-400 disabled:bg-white/10 disabled:text-white/30 text-black font-bold px-5 py-2 rounded-lg text-sm transition-all"
            >
              {loading ? '⏳ Recherche...' : 'Rechercher ➜'}
            </button>
          </div>
          <p className="text-white/30 text-xs mt-2">⌘+Entrée pour soumettre</p>
        </div>

        {/* Exemples */}
        {!response && !loading && (
          <div className="mb-8">
            <p className="text-white/40 text-sm mb-3">Exemples de questions :</p>
            <div className="flex flex-col gap-2">
              {EXAMPLE_QUESTIONS.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => useExample(ex)}
                  className="text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 transition-all group"
                >
                  <span className="quran-text text-white/80 group-hover:text-white text-sm block mb-1" dir="rtl" lang="ar"
                    style={{ fontFamily: 'var(--font-kfgqpc, var(--font-amiri))' }}>
                    {ex.q}
                  </span>
                  <span className="text-white/30 text-xs">Madhab {ex.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loader */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin text-4xl mb-4">🔍</div>
            <p className="text-white/60">Recherche dans 101,993 passages...</p>
            <p className="text-white/30 text-sm mt-1">Analyse des sources par l'agent IA</p>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300">
            ❌ {error}
          </div>
        )}

        {/* Résultat */}
        {response && !loading && (
          <div className="space-y-6">

            {/* En-tête résultat */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-white/80 font-semibold">
                  Résultats pour :
                  <span className="quran-text text-amber-400 mr-2 ml-2" dir="rtl" lang="ar"
                    style={{ fontFamily: 'var(--font-kfgqpc, var(--font-amiri))' }}>
                    {response.question}
                  </span>
                </h2>
                {response.madhab && (
                  <span className="text-white/40 text-sm">
                    Madhab : {MADHAB_COLORS[response.madhab]?.label ?? response.madhab}
                  </span>
                )}
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-white/30 text-xs">{response.processingTimeMs}ms</span>
                <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-xs">
                  {response.citationsCount} source{response.citationsCount > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Synthèse IA */}
            {!response.noResultsFound && (
              <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-amber-400 text-lg">🤖</span>
                  <span className="text-amber-400 font-semibold">Synthèse de l'agent</span>
                  <span className="bg-amber-500/20 text-amber-400/70 text-xs px-2 py-0.5 rounded-full ml-auto">
                    Basée sur sources — non vérifiée
                  </span>
                </div>
                <div
                  className="text-white/85 leading-relaxed whitespace-pre-wrap text-sm"
                >
                  {response.synthesis}
                </div>
              </div>
            )}

            {/* Pas de résultats */}
            {response.noResultsFound && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center text-white/60">
                🔍 {response.synthesis}
              </div>
            )}

            {/* Citations / Sources */}
            {response.citations.length > 0 && (
              <div>
                <h3 className="text-white/60 font-semibold mb-3 text-sm uppercase tracking-wider">
                  📖 Sources utilisées ({response.citations.length})
                </h3>
                <div className="space-y-3">
                  {response.citations.map((c, i) => (
                    <CitationCard key={c.passageId} citation={c} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer permanent */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs text-red-300/80">
              ⚠️ {response.disclaimer}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
