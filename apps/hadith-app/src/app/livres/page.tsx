import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Livres à fournir',
  description: 'Liste des collections et textes islamiques manquants à intégrer dans la plateforme',
}

const MISSING_HADITHS = [
  {
    name: "Jami' at-Tirmidhi",
    arabic: 'جامع الترمذي',
    author: 'Imam at-Tirmidhi (m. 279 H)',
    status: 'Partiel',
    statusColor: 'yellow',
    present: 'AR + EN (3 998 hadiths)',
    missing: 'Traduction française complète',
    priority: 'HAUTE',
    notes: 'Traduction fawazahmed introuvable. Chercher sur hadith.io ou archive.org.',
    format: 'PDF / Fichier texte avec numérotation standard',
  },
  {
    name: 'Al-Adab al-Mufrad',
    arabic: 'الأدب المفرد',
    author: "Imam al-Bukhari (m. 256 H)",
    status: 'Absent',
    statusColor: 'red',
    present: '—',
    missing: 'Texte complet AR + traduction FR',
    priority: 'HAUTE',
    notes: '~1 322 hadiths. Recueil sur les bonnes mœurs islamiques.',
    format: 'PDF / JSON avec numérotation standard',
  },
  {
    name: 'Mishkat al-Masabih',
    arabic: 'مشكاة المصابيح',
    author: 'Al-Khatib al-Tabrizi (m. 741 H)',
    status: 'Absent',
    statusColor: 'red',
    present: '—',
    missing: 'Texte complet AR + traduction FR/EN',
    priority: 'MOYENNE',
    notes: '~6 294 hadiths. Compilation encyclopédique.',
    format: 'PDF / JSON',
  },
  {
    name: 'Bulugh al-Maram',
    arabic: 'بلوغ المرام',
    author: 'Ibn Hajar al-Asqalani (m. 852 H)',
    status: 'Absent',
    statusColor: 'red',
    present: '—',
    missing: 'Texte complet AR + traduction FR',
    priority: 'HAUTE',
    notes: '~1 596 hadiths. Référence fiqh (droit islamique).',
    format: 'PDF / Fichier texte',
  },
  {
    name: 'Hisn al-Muslim',
    arabic: 'حصن المسلم',
    author: "Sa\u2019id ibn \u2018Ali ibn Wahf al-Qahtani",
    status: 'Absent',
    statusColor: 'red',
    present: '—',
    missing: 'Texte complet AR + traduction FR',
    priority: 'HAUTE',
    notes: '~257 du\'as. Très demandé — application invocations.',
    format: 'PDF',
  },
  {
    name: 'Al-Shamail al-Muhammadiyya',
    arabic: 'الشمائل المحمدية',
    author: 'Imam at-Tirmidhi (m. 279 H)',
    status: 'Absent',
    statusColor: 'red',
    present: '—',
    missing: 'Texte complet AR + traduction FR',
    priority: 'MOYENNE',
    notes: '~417 hadiths. Description physique et morale du Prophète ﷺ.',
    format: 'PDF',
  },
  {
    name: 'Sunan ad-Darimi',
    arabic: 'سنن الدارمي',
    author: 'Imam ad-Darimi (m. 255 H)',
    status: 'Absent',
    statusColor: 'red',
    present: '—',
    missing: 'Texte complet AR + traduction FR/EN',
    priority: 'BASSE',
    notes: '~3 367 hadiths.',
    format: 'PDF / JSON',
  },
]

const MISSING_MUTUN = [
  {
    name: 'Al-Mandhouma al-Baiquniyya',
    arabic: 'المنظومة البيقونية',
    author: 'Omar al-Baiquni (m. ~1080 H)',
    present: 'Bayts 1–10 ✅',
    missing: 'Bayts 11–34 (24 bayts manquants)',
    total: '34 bayts',
    subject: 'Sciences du Hadith (Mustalah)',
    format: 'Texte arabe + harakat complets, bayt par bayt',
  },
  {
    name: 'Tuhfat al-Atfal',
    arabic: 'تحفة الأطفال',
    author: 'Suleyman al-Jamzuri (m. ~1198 H)',
    present: 'Bayts 1–8 ✅',
    missing: 'Bayts 9–61 (53 bayts manquants)',
    total: '61 bayts',
    subject: 'Tajweed',
    format: 'Texte arabe + harakat complets, bayt par bayt',
  },
  {
    name: 'Al-Ajrumiyya',
    arabic: 'الآجرومية',
    author: 'Ibn Ajrum (m. 723 H)',
    present: 'Structure uniquement',
    missing: 'Texte arabe intégral',
    total: '~60 sections',
    subject: 'Grammaire arabe (Nahw)',
    format: 'Texte arabe + harakat, section par section',
  },
  {
    name: 'Al-Waraqat',
    arabic: 'الورقات',
    author: 'Al-Juwayni (m. 478 H)',
    present: 'Structure uniquement',
    missing: 'Texte arabe intégral',
    total: '~20 sections',
    subject: 'Principes du droit islamique (Usul al-Fiqh)',
    format: 'Texte arabe + harakat, section par section',
  },
  {
    name: "Al-Arba'een an-Nawawiyya",
    arabic: 'الأربعون النووية',
    author: 'Imam an-Nawawi (m. 676 H)',
    present: 'Hadiths en DB (collection hadith)',
    missing: 'Format Matn — mémorisation avec sanad + sharh',
    total: '42 hadiths',
    subject: 'Fondements islamiques',
    format: 'PDF ou texte avec sanad + numérotation matn',
  },
]

function StatusBadge({ status, color }: { status: string; color: string }) {
  const colors: Record<string, string> = {
    red: 'bg-red-100 text-red-700 border border-red-200',
    yellow: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    green: 'bg-green-100 text-green-700 border border-green-200',
  }
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${colors[color] || colors.red}`}>
      {status}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    HAUTE: 'bg-red-500 text-white',
    MOYENNE: 'bg-orange-400 text-white',
    BASSE: 'bg-slate-400 text-white',
  }
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${colors[priority] || 'bg-slate-300'}`}>
      {priority}
    </span>
  )
}

export default function LivresPage() {
  const totalMissing = MISSING_HADITHS.length + MISSING_MUTUN.length
  const highPriority = MISSING_HADITHS.filter(h => h.priority === 'HAUTE').length

  return (
    <div className="space-y-10">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-emerald-700 to-emerald-800 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">📚 Livres à fournir</h1>
            <p className="text-emerald-100 text-sm max-w-xl">
              Liste des collections, traductions et textes islamiques manquants pour compléter la plateforme.
              Fournir un PDF ou fichier texte pour chaque entrée ci-dessous.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white/15 rounded-xl px-4 py-3 text-center">
              <div className="text-2xl font-bold">{totalMissing}</div>
              <div className="text-xs text-emerald-100">livres manquants</div>
            </div>
            <div className="bg-red-400/30 border border-red-300/30 rounded-xl px-4 py-3 text-center">
              <div className="text-2xl font-bold">{highPriority}</div>
              <div className="text-xs text-emerald-100">priorité haute</div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <p className="font-semibold mb-1">📌 Comment contribuer</p>
        <ul className="list-disc list-inside space-y-1 text-amber-700">
          <li>Fournir le PDF ou fichier texte de chaque livre manquant (édition avec <strong>harakat</strong> pour les mutun)</li>
          <li>Pour les hadiths : format JSON ou CSV avec numérotation standard est idéal</li>
          <li>Pour les mutun : numéroter chaque bayt, inclure les harakat complets</li>
          <li>Toute modification du texte arabe est strictement interdite après import</li>
        </ul>
      </div>

      {/* Section Hadiths */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">📖</span>
          Collections de Hadiths
          <span className="text-sm font-normal text-gray-500">({MISSING_HADITHS.length} livres)</span>
        </h2>

        <div className="space-y-3">
          {MISSING_HADITHS.map((book, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h3 className="font-bold text-gray-900">{book.name}</h3>
                    <span className="font-arabic text-lg text-gray-600 leading-none" dir="rtl">{book.arabic}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{book.author}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <span className="text-gray-400">Présent : </span>
                      <span className="text-gray-700">{book.present}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Manque : </span>
                      <span className="text-red-600 font-medium">{book.missing}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Format attendu : </span>
                      <span className="text-gray-700">{book.format}</span>
                    </div>
                  </div>

                  {book.notes && (
                    <p className="text-xs text-gray-400 italic">{book.notes}</p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <StatusBadge status={book.status} color={book.statusColor} />
                  <PriorityBadge priority={book.priority} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section Mutun */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">📜</span>
          Mutun islamiques (mémorisation)
          <span className="text-sm font-normal text-gray-500">({MISSING_MUTUN.length} textes)</span>
        </h2>

        <div className="space-y-3">
          {MISSING_MUTUN.map((matn, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h3 className="font-bold text-gray-900">{matn.name}</h3>
                    <span className="font-arabic text-lg text-gray-600 leading-none" dir="rtl">{matn.arabic}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">{matn.author}</p>
                  <p className="text-xs text-emerald-700 font-medium mb-3">
                    {matn.subject} — {matn.total}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <span className="text-gray-400">Présent : </span>
                      <span className="text-green-700">{matn.present}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Manque : </span>
                      <span className="text-red-600 font-medium">{matn.missing}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-gray-400">Format attendu : </span>
                      <span className="text-gray-700">{matn.format}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  <StatusBadge status="Incomplet" color="yellow" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-center">
        <p className="text-gray-600 text-sm mb-3">
          Une fois les fichiers fournis, l&apos;import en base de données sera effectué automatiquement.
        </p>
        <Link href="/" className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-medium text-sm">
          ← Retour aux collections
        </Link>
      </div>
    </div>
  )
}
