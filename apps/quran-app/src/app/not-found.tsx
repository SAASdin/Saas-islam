import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="arabic-text text-6xl text-white/10 mb-4" dir="rtl" lang="ar">٤٠٤</p>
      <h1 className="text-2xl font-bold text-white mb-2">Page introuvable</h1>
      <p className="text-slate-500 text-sm mb-6 max-w-sm">
        Cette page n&apos;existe pas ou a été déplacée.
      </p>
      <div className="flex gap-3">
        <Link href="/" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-xl transition-colors">
          Accueil
        </Link>
        <Link href="/surah/1" className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm rounded-xl transition-colors">
          Al-Fatiha
        </Link>
      </div>
      <p className="arabic-text text-slate-700 text-sm mt-8" dir="rtl" lang="ar">
        وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ
      </p>
    </div>
  )
}
