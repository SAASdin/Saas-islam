import { Metadata } from 'next'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'المصاحف — Mushafs',
  description: 'Éditions du Coran : Uthmani, Tajweed, Simple, Imlaei, Hafs, Warsh, Qalun',
}

// ── Catalogue des Mushafs (inspiré tafsir.app مصاحف) ────────────────────────

const MUSHAF_EDITIONS = [
  {
    category: 'المجمَّع',
    categoryFr: 'Éditions principales',
    items: [
      {
        id: 'hafs-uthmani',
        name: 'مصحف حفص عن عاصم',
        nameFr: 'Hafs ʿan ʿĀṣim (Uthmani)',
        script: 'الرسم العثماني',
        qiraa: 'حفص عن عاصم',
        description: 'L\'édition la plus répandue dans le monde musulman. Script Uthmani avec tashkeel complet.',
        color: 'emerald',
        href: '/mushaf/1',
        available: true,
        pages: 604,
        icon: '📖',
      },
      {
        id: 'hafs-imlaei',
        name: 'مصحف حفص (إملائي)',
        nameFr: 'Hafs ʿan ʿĀṣim (Imlaei)',
        script: 'الرسم الإملائي',
        qiraa: 'حفص عن عاصم',
        description: 'Script Imlaei moderne, plus facile à lire pour les non-arabophones.',
        color: 'blue',
        href: '/mushaf/1?script=imlaei',
        available: true,
        pages: 604,
        icon: '📝',
      },
    ],
  },
  {
    category: 'مصاحف حفص',
    categoryFr: 'Mushafs Hafs — Éditions régionales',
    items: [
      {
        id: 'mushaf-qatar',
        name: 'مصحف قطر',
        nameFr: 'Mushaf Qatar',
        script: 'الرسم العثماني',
        qiraa: 'حفص',
        description: 'Édition officielle du Qatar. Calligraphie soignée.',
        color: 'amber',
        href: '/mushaf/1',
        available: true,
        pages: 604,
        icon: '🇶🇦',
      },
      {
        id: 'mushaf-madina',
        name: 'مصحف المدينة النبوية',
        nameFr: 'Mushaf de Médine (Complexe Malik Fahd)',
        script: 'الرسم العثماني',
        qiraa: 'حفص',
        description: 'Édition de référence mondiale. Imprimé à Médine.',
        color: 'amber',
        href: '/mushaf/1',
        available: true,
        pages: 604,
        icon: '🕌',
      },
      {
        id: 'mushaf-tajweed',
        name: 'مصحف التجويد الملوّن',
        nameFr: 'Mushaf Tajweed (coloré)',
        script: 'الرسم العثماني + تجويد ملوّن',
        qiraa: 'حفص',
        description: 'Les règles de Tajweed indiquées par des couleurs pour faciliter la récitation.',
        color: 'purple',
        href: '/surah/1',
        available: true,
        pages: 604,
        icon: '🎨',
      },
    ],
  },
  {
    category: 'قراءات',
    categoryFr: 'Autres Qira\'at (العشر)',
    items: [
      {
        id: 'warsh-nafie',
        name: 'ورش عن نافع',
        nameFr: 'Warsh ʿan Nāfiʿ',
        script: 'الرسم العثماني',
        qiraa: 'ورش عن نافع',
        description: 'Utilisé en Afrique du Nord et en Afrique de l\'Ouest.',
        color: 'slate',
        href: '/mushaf/1',
        available: false,
        pages: 604,
        icon: '🌍',
      },
      {
        id: 'qalun-nafie',
        name: 'قالون عن نافع',
        nameFr: 'Qalun ʿan Nāfiʿ',
        script: 'الرسم العثماني',
        qiraa: 'قالون عن نافع',
        description: 'Utilisé en Libye, Tunisie et certaines régions.',
        color: 'slate',
        href: '/mushaf/1',
        available: false,
        pages: 604,
        icon: '🌐',
      },
      {
        id: 'shuba-asim',
        name: 'شعبة عن عاصم',
        nameFr: 'Shu\'ba ʿan ʿĀṣim',
        script: 'الرسم العثماني',
        qiraa: 'شعبة عن عاصم',
        description: 'Deuxième transmission d\'ʿĀṣim après Hafs.',
        color: 'slate',
        href: '/mushaf/1',
        available: false,
        pages: 604,
        icon: '📜',
      },
    ],
  },
]

const COLOR_MAP: Record<string, string> = {
  emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  amber: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
  slate: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
}

export default function MasahifPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl arabic-text text-white mb-2" dir="rtl" lang="ar">المصاحف</h1>
        <p className="text-slate-400 text-sm">Éditions du Coran · Riwayat · Qira&apos;at</p>
        <p className="text-slate-600 text-xs mt-1 max-w-md mx-auto">
          Inspiré de tafsir.app — Toutes les éditions avec navigation par page, Juz et Hizb
        </p>
      </div>

      {/* Direct access */}
      <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-2xl p-5 mb-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-emerald-300 font-medium">Accès direct au Mushaf Uthmani</p>
            <p className="text-slate-500 text-sm mt-0.5">604 pages · Navigation Juz · ←/→ clavier · Toggle traduction</p>
          </div>
          <Link href="/mushaf/1" className="shrink-0 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-colors">
            Ouvrir →
          </Link>
        </div>
      </div>

      {/* Catalogue */}
      {MUSHAF_EDITIONS.map(group => (
        <div key={group.category} className="mb-8">
          <div className="flex items-center gap-3 mb-4 pb-2 border-b border-white/10">
            <h2 className="text-base font-semibold text-white arabic-text" dir="rtl" lang="ar">{group.category}</h2>
            <span className="text-slate-500 text-sm">— {group.categoryFr}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {group.items.map(item => (
              <div key={item.id} className={`relative border rounded-xl p-4 transition-all ${
                item.available
                  ? 'bg-white/3 hover:bg-white/7 border-white/10 hover:border-white/25'
                  : 'bg-white/2 border-white/5 opacity-60'
              }`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-white text-sm font-medium arabic-text" dir="rtl" lang="ar">{item.name}</p>
                        <p className="text-slate-400 text-xs">{item.nameFr}</p>
                      </div>
                      {!item.available && (
                        <span className="text-[10px] bg-slate-500/20 text-slate-500 border border-slate-500/30 px-1.5 py-0.5 rounded-full shrink-0">
                          Bientôt
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className={`text-[10px] border px-1.5 py-0.5 rounded-full ${COLOR_MAP[item.color]}`}>
                        {item.qiraa}
                      </span>
                      <span className="text-[10px] bg-white/5 text-slate-500 border border-white/10 px-1.5 py-0.5 rounded-full">
                        {item.script}
                      </span>
                      <span className="text-[10px] text-slate-600">
                        {item.pages} pages
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs mt-2 leading-relaxed">{item.description}</p>
                    {item.available && (
                      <Link href={item.href}
                        className="inline-block mt-3 text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                        Lire →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Navigation rapide */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <p className="text-slate-500 text-sm mb-4 text-center">Navigation rapide par Juz</p>
        <div className="grid grid-cols-10 gap-1">
          {Array.from({ length: 30 }, (_, i) => i + 1).map(j => {
            const PAGES = [1,22,42,62,82,102,122,142,162,182,202,222,242,262,282,302,322,342,362,382,402,422,442,462,482,502,522,542,562,582]
            return (
              <Link key={j} href={`/mushaf/${PAGES[j-1]}`}
                className="flex items-center justify-center h-9 bg-white/4 hover:bg-emerald-500/20 border border-white/8 hover:border-emerald-500/30 rounded-lg text-xs font-medium text-slate-400 hover:text-emerald-400 transition-all">
                {j}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
