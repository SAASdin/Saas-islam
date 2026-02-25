import { Metadata } from 'next'
import { getChapters } from '@/lib/quran-cdn-api'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'علوم القرآن — Sciences du Coran',
  description: 'Tafsir, Ghareeb, I\'rab, Qira\'at, Ahkam, Asbab al-Nuzul — 29 livres',
}

// ── Catalogue علوم القرآن complet (inspiré tafsir.app) ─────────────────────

const GHAREEB_BOOKS = [
  { name: 'مفردات ألفاظ القرآن', author: 'الراغب الأصفهاني', died: '٥٠٢ هـ', vols: 'مجلدان', slug: 'mufradat' },
  { name: 'عمدة الحفاظ',         author: 'السمين الحلبي',     died: '٧٥٦ هـ', vols: '٣ مجلدات', slug: 'umdah' },
  { name: 'بصائر ذوي التمييز',   author: 'الفيروزآبادي',     died: '٨١٧ هـ', vols: '٣ مجلدات', slug: 'basair' },
  { name: 'غريب القرآن',         author: 'ابن قتيبة',         died: '٢٧٦ هـ', vols: 'مجلد',    slug: 'ghareeb-ibn-qutayba' },
  { name: 'السراج في بيان غريب القرآن', author: 'محمد الخضيري', died: 'معاصر', vols: 'مجلد',  slug: 'siraj' },
  { name: 'تفسير غريب القرآن',   author: 'الميسر (مجمع الملك فهد)', died: 'معاصر', vols: 'مجلد', slug: 'muyassar-ghareeb' },
]

const IRAAB_BOOKS = [
  { name: 'الإعراب الميسر',      author: 'شركة الدار العربية', died: 'معاصر',  vols: '٣ مجلدات', slug: 'i3rab-muyassar' },
  { name: 'إعراب القرآن',        author: 'قاسم حميدان',        died: '١٤٠٣ هـ', vols: '٤ مجلدات', slug: 'i3rab-hamidan' },
  { name: 'الجدول في إعراب القرآن', author: 'محمود الصافي',    died: '١٣٧٦ هـ', vols: '٨ مجلدات', slug: 'jadwal' },
  { name: 'الدر المصون',         author: 'السمين الحلبي',      died: '٧٥٦ هـ', vols: '١٠ مجلدات', slug: 'dur-masun' },
  { name: 'اللباب',              author: 'ابن عادل',            died: '٨٨٠ هـ', vols: '٢٤ مجلدًا', slug: 'lubab' },
  { name: 'معاني القرآن وإعرابه', author: 'الزجاج',            died: '٣١١ هـ', vols: '٤ مجلدات', slug: 'ma3ani-zajjaj' },
  { name: 'مجاز القرآن',         author: 'أبو عبيدة',          died: '٢٠٩ هـ', vols: 'مجلد',     slug: 'majaz-quran' },
]

const QIRAAT_BOOKS = [
  { name: 'القراءات — الموسوعة القرآنية', author: 'إبراهيم الأبياري', died: '١٤١٤ هـ', vols: 'نحو مجلد', slug: 'qiraat-mawsu3a' },
  { name: 'تحبير التيسير في القراءات العشر', author: 'ابن الجزري', died: '٨٣٣ هـ', vols: 'نحو مجلد', slug: 'tahbeer' },
  { name: 'النشر في القراءات العشر', author: 'ابن الجزري', died: '٨٣٣ هـ', vols: 'نحو مجلد', slug: 'nashr' },
  { name: 'مفاتيح الأغاني في القراءات', author: 'أبو العلاء الكرماني', died: 'بعد ٥٦٣ هـ', vols: 'نحو مجلد', slug: 'mafatih-aghani' },
]

const AHKAM_BOOKS = [
  { name: 'أحكام القرآن',        author: 'ابن العربي',         died: '٥٤٣ هـ', vols: '٦ مجلدات', slug: 'ahkam-ibnul-arabi' },
  { name: 'أحكام القرآن',        author: 'الجصاص',             died: '٣٧٠ هـ', vols: '٦ مجلدات', slug: 'ahkam-jassas' },
  { name: 'أحكام القرآن',        author: 'إلكيا الهراسي',      died: '٥٠٤ هـ', vols: 'مجلد',     slug: 'ahkam-harasi' },
  { name: 'الإكليل في استنباط التنزيل', author: 'السيوطي',     died: '٩١١ هـ', vols: 'نحو مجلد', slug: 'iklil' },
  { name: 'الإيضاح لناسخ القرآن ومنسوخه', author: 'مكي بن أبي طالب', died: '٤٣٧ هـ', vols: 'مجلد', slug: 'idad' },
]

const ASBAB_BOOKS = [
  { name: 'أسباب نزول القرآن',   author: 'الواحدي',            died: '٤٦٨ هـ', vols: 'مجلد', slug: 'asbab-wahidi', apiSlug: 'en-asbab-al-nuzul-by-al-wahidi' },
]

export default async function UlumPage() {
  const { chapters } = await getChapters()

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl arabic-text text-white mb-2" dir="rtl" lang="ar">علوم القرآن</h1>
        <p className="text-slate-400 text-sm">Sciences coraniques · Références islamiques classiques</p>
        <p className="text-slate-600 text-xs mt-1 max-w-xl mx-auto">
          Inspiré de tafsir.app — تفسير، غريب ومعاني، إعراب ولغة، قراءات، أحكام، أسباب النزول
        </p>
      </div>

      {/* Navigation sciences */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {[
          { href: '#tafsir',    label: 'تفسير',             icon: '📖', count: 29 },
          { href: '#ghareeb',   label: 'غريب ومعاني',       icon: '📘', count: GHAREEB_BOOKS.length },
          { href: '#iraab',     label: 'إعراب ولغة',        icon: '✍️', count: IRAAB_BOOKS.length },
          { href: '#qiraat',    label: 'قراءات',             icon: '🎵', count: QIRAAT_BOOKS.length },
          { href: '#ahkam',     label: 'أحكام',              icon: '⚖️', count: AHKAM_BOOKS.length },
          { href: '#asbab',     label: 'أسباب النزول',       icon: '🌙', count: ASBAB_BOOKS.length },
          { href: '#surahs',    label: 'مقدمات السور',       icon: '📚', count: 114 },
        ].map(s => (
          <a key={s.href} href={s.href}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs text-slate-300 hover:text-white transition-all">
            <span>{s.icon}</span>
            <span className="arabic-text" dir="rtl" lang="ar">{s.label}</span>
            <span className="text-slate-600">({s.count})</span>
          </a>
        ))}
      </div>

      {/* ── TAFSIR ── */}
      <UlumSection id="tafsir" icon="📖" titleAr="التفسير" titleFr="Commentaires coraniques">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Accès aux 29 tafsirs via la page surah */}
          <div className="col-span-full bg-emerald-500/8 border border-emerald-500/20 rounded-xl p-4 text-center">
            <p className="text-emerald-300 text-sm mb-2">29 livres de tafsir disponibles — accessible depuis chaque verset</p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {['ar-tafsir-al-tabari', 'ar-tafsir-ibn-kathir', 'ar-tafseer-al-qurtubi',
                'ar-tafsir-al-baghawi', 'ar-tafseer-al-saddi', 'ar-tafsir-muyassar',
                'en-tafisr-ibn-kathir', 'en-tafsir-maarif-ul-quran'].map(slug => (
                <span key={slug} className="text-xs bg-white/5 text-slate-400 px-2 py-0.5 rounded-full">{slug}</span>
              ))}
              <span className="text-xs text-slate-600">+ 21 autres…</span>
            </div>
            <Link href="/surah/1" className="inline-block mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-lg transition-colors">
              Lire Al-Fatiha → Tafsir
            </Link>
          </div>
        </div>
      </UlumSection>

      {/* ── GHAREEB ── */}
      <UlumSection id="ghareeb" icon="📘" titleAr="غريب ومعاني" titleFr="Mots rares & Significations">
        <BookGrid books={GHAREEB_BOOKS} />
      </UlumSection>

      {/* ── I'RAB ── */}
      <UlumSection id="iraab" icon="✍️" titleAr="إعراب ولغة" titleFr="Analyse grammaticale & Langue">
        <BookGrid books={IRAAB_BOOKS} />
      </UlumSection>

      {/* ── QIRA'AT ── */}
      <UlumSection id="qiraat" icon="🎵" titleAr="القراءات" titleFr="Lectures coraniques">
        <BookGrid books={QIRAAT_BOOKS} />
      </UlumSection>

      {/* ── AHKAM ── */}
      <UlumSection id="ahkam" icon="⚖️" titleAr="أحكام القرآن" titleFr="Jurisprudence coranique">
        <BookGrid books={AHKAM_BOOKS} />
      </UlumSection>

      {/* ── ASBAB AL-NUZUL ── */}
      <UlumSection id="asbab" icon="🌙" titleAr="أسباب النزول" titleFr="Circonstances de révélation">
        <div className="bg-white/3 border border-white/10 rounded-xl p-4">
          <p className="text-white font-medium arabic-text" dir="rtl" lang="ar">أسباب نزول القرآن</p>
          <p className="text-slate-400 text-xs mt-1">الواحدي · ٤٦٨ هـ</p>
          <p className="text-slate-500 text-xs mt-0.5">Al-Wahidi — Disponible en anglais dans le panneau Tafsir (bouton 📖 sur chaque verset)</p>
          <p className="text-emerald-500/60 text-xs mt-2">Slug: en-asbab-al-nuzul-by-al-wahidi</p>
        </div>
      </UlumSection>

      {/* ── INTRODUCTIONS DES SOURATES ── */}
      <section id="surahs" className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">📚</span>
          <div>
            <h2 className="text-lg font-semibold text-white arabic-text" dir="rtl" lang="ar">مقدمات السور</h2>
            <p className="text-slate-500 text-sm">Introductions des 114 sourates</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {chapters.map(c => (
            <Link key={c.id} href={`/ulum/${c.id}`}
              className="group flex flex-col items-center p-2.5 bg-white/3 hover:bg-white/8 border border-white/8 hover:border-emerald-500/30 rounded-xl transition-all text-center">
              <span className="text-slate-500 text-xs font-mono">{c.id}</span>
              <span className="arabic-text text-sm text-white mt-0.5 leading-tight" dir="rtl" lang="ar">{c.name_arabic}</span>
              <span className="text-slate-600 text-[10px] mt-0.5">{c.verses_count}v</span>
              <span className={`text-[10px] mt-1 px-1.5 py-0.5 rounded-full ${
                c.revelation_place === 'makkah' ? 'bg-amber-500/15 text-amber-500' : 'bg-blue-500/15 text-blue-400'
              }`}>{c.revelation_place === 'makkah' ? 'م' : 'مد'}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

// Composants utilitaires
function UlumSection({ id, icon, titleAr, titleFr, children }: {
  id: string; icon: string; titleAr: string; titleFr: string; children: React.ReactNode
}) {
  return (
    <section id={id} className="mb-10">
      <div className="flex items-center gap-3 mb-4 pb-2 border-b border-white/10">
        <span className="text-2xl">{icon}</span>
        <div>
          <h2 className="text-lg font-semibold text-white arabic-text" dir="rtl" lang="ar">{titleAr}</h2>
          <p className="text-slate-500 text-xs">{titleFr}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

function BookGrid({ books }: { books: Array<{ name: string; author: string; died: string; vols: string; slug: string }> }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {books.map(book => (
        <div key={book.slug}
          className="bg-white/3 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors">
          <p className="text-white text-sm arabic-text leading-snug" dir="rtl" lang="ar">{book.name}</p>
          <p className="text-slate-400 text-xs mt-1 arabic-text" dir="rtl" lang="ar">{book.author} ({book.died})</p>
          <p className="text-slate-600 text-xs mt-0.5 arabic-text" dir="rtl" lang="ar">{book.vols}</p>
        </div>
      ))}
    </div>
  )
}
