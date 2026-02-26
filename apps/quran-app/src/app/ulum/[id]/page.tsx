import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getChapters, getChapterInfo } from '@/lib/quran-cdn-api'
import { sanitizeLight } from '@/lib/sanitize'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const num = parseInt(id)
  if (isNaN(num) || num < 1 || num > 114) return { title: 'Sourate inconnue' }
  const { chapters } = await getChapters()
  const ch = chapters.find(c => c.id === num)
  return {
    title: `علوم | ${ch?.name_simple ?? `Sourate ${num}`} — Sciences du Coran`,
    description: `Contexte de révélation, thèmes et sciences de la Sourate ${ch?.name_simple}`,
  }
}

export default async function UlumSurahPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const num = parseInt(id)
  if (isNaN(num) || num < 1 || num > 114) notFound()

  const [{ chapters }, infoData] = await Promise.all([
    getChapters(),
    getChapterInfo(num),
  ])

  const chapter = chapters.find(c => c.id === num)
  if (!chapter) notFound()

  const info = infoData?.chapter_info
  const prev = num > 1 ? chapters.find(c => c.id === num - 1) : null
  const next = num < 114 ? chapters.find(c => c.id === num + 1) : null

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
        <Link href="/ulum" className="hover:text-slate-300 transition-colors">علوم القرآن</Link>
        <span>›</span>
        <span className="text-slate-300">{chapter.name_simple}</span>
      </nav>

      {/* Header sourate */}
      <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <span className="text-slate-400 font-mono text-sm">{num}</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{chapter.name_simple}</h1>
                <p className="text-slate-500 text-sm">{chapter.name_complex}</p>
              </div>
            </div>
            <p className="arabic-text text-2xl text-white/80 mt-2" dir="rtl" lang="ar">{chapter.name_arabic}</p>
          </div>
          <Link href={`/surah/${num}`} className="shrink-0 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm transition-colors">
            Lire la sourate →
          </Link>
        </div>

        {/* Métadonnées */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {[
            { label: 'Révélation', value: chapter.revelation_place === 'makkah' ? '🕌 Mecquoise' : '🌙 Médinoise' },
            { label: 'Ordre de descente', value: `#${chapter.revelation_order}` },
            { label: 'Versets', value: String(chapter.verses_count) },
            { label: 'Pages', value: `${chapter.pages[0]}–${chapter.pages[1]}` },
          ].map(m => (
            <div key={m.label} className="bg-white/3 rounded-lg p-3 text-center">
              <p className="text-white font-semibold">{m.value}</p>
              <p className="text-slate-600 text-xs mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contenu sciences */}
      {info ? (
        <div className="space-y-4">
          {/* Source */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
            <span>📖</span>
            <span>Source : <span className="text-slate-400">{info.source}</span></span>
          </div>

          {/* Résumé court */}
          {info.short_text && (
            <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-xl p-4">
              <p className="text-emerald-300 text-sm leading-relaxed">{info.short_text}</p>
            </div>
          )}

          {/* Texte complet — rendu HTML sécurisé */}
          <div
            className="prose prose-invert prose-sm max-w-none
              prose-headings:text-emerald-400 prose-headings:font-semibold prose-headings:mt-6 prose-headings:mb-3
              prose-p:text-slate-300 prose-p:leading-relaxed
              prose-strong:text-white
              prose-li:text-slate-300
              [&>h2]:text-base [&>h2]:border-b [&>h2]:border-white/10 [&>h2]:pb-2"
            dangerouslySetInnerHTML={{ __html: info.text ?? '' }}
          />
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500">
          <span className="text-3xl block mb-2">📚</span>
          <p>Informations non disponibles pour cette sourate.</p>
        </div>
      )}

      {/* Navigation prev/next */}
      <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/10">
        {prev ? (
          <Link href={`/ulum/${prev.id}`} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>{prev.name_simple}</span>
          </Link>
        ) : <div />}
        {next ? (
          <Link href={`/ulum/${next.id}`} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
            <span>{next.name_simple}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ) : <div />}
      </div>
    </div>
  )
}
