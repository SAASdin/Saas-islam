// ============================================================
// tafsir-one-api.ts — Client API pour read.tafsir.one
// ZONE SACRÉE : données tafsir — READ ONLY, jamais modifier
// ============================================================

const TAFSIR_ONE_BASE = 'https://read.tafsir.one'

// ── Types ────────────────────────────────────────────────────

export type TafsirPage = {
  ayah: string        // texte de l'ayah (arabe) — ZONE SACRÉE
  data: string        // texte du tafsir (arabe) — ZONE SACRÉE
  ayahs: string[]     // liste des ayahs dans cette page — ZONE SACRÉE
  ayahs_start: number // numéro du premier ayah
}

export type TafsirBookInfo = {
  title: string    // Titre en arabe
  author: string   // Auteur/lecteur en arabe
  hasAudio: boolean
}

// ── 8 livres de tafsir disponibles ───────────────────────────

export const TAFSIR_ONE_BOOKS: Record<string, TafsirBookInfo> = {
  almuyassar: {
    title: 'التفسير الميسر',
    author: 'بقراءة الشيخ أيمن أبي النصر وبتلاوة الشيخ عبد الرحمن الحذيفى',
    hasAudio: true,
  },
  almukhtasar: {
    title: 'المختصر في التفسير',
    author: 'إنتاج مركز تفسير للدراسات القرآنية',
    hasAudio: true,
  },
  alsidi: {
    title: 'تفسير السعدي',
    author: 'بقراءة الشيخ عبد الرحمن السبهان، وبتلاوة الشيخ عبد العزيز الأحمد',
    hasAudio: true,
  },
  'ibn-juzay': {
    title: 'تفسير ابن جُزي',
    author: 'بقراءة الشيخ فائز عبد القادر شيخ الزور',
    hasAudio: true,
  },
  aljalalayn: {
    title: 'تفسير الجلالين',
    author: 'بقراءة الشيخ عمرو البساطي',
    hasAudio: true,
  },
  alsiraaj: {
    title: 'السراج في غريب القرآن',
    author: 'بقراءة الشيخ عمرو البساطي',
    hasAudio: true,
  },
  'almuyassar-g': {
    title: 'الميسر في غريب القرآن',
    author: 'بقراءة الشيخ عمرو البساطي',
    hasAudio: true,
  },
  'ibn-aashoor': {
    title: 'تفسير ابن عاشور',
    author: 'مصدر رقمي',
    hasAudio: false,
  },
}

export const TAFSIR_ONE_BOOK_KEYS = Object.keys(TAFSIR_ONE_BOOKS) as Array<keyof typeof TAFSIR_ONE_BOOKS>

// ── Structure des 114 sourates : [nombre_ayahs, nom_arabe] ───

export const SUWAR: [number, string][] = [
  [7,'الفاتحة'],[286,'البقرة'],[200,'آل عمران'],[176,'النساء'],
  [120,'المائدة'],[165,'الأنعام'],[206,'الأعراف'],[75,'الأنفال'],
  [129,'التوبة'],[109,'يونس'],[123,'هود'],[111,'يوسف'],
  [43,'الرعد'],[52,'إبراهيم'],[99,'الحجر'],[128,'النحل'],
  [111,'الإسراء'],[110,'الكهف'],[98,'مريم'],[135,'طه'],
  [112,'الأنبياء'],[78,'الحج'],[118,'المؤمنون'],[64,'النور'],
  [77,'الفرقان'],[227,'الشعراء'],[93,'النمل'],[88,'القصص'],
  [69,'العنكبوت'],[60,'الروم'],[34,'لقمان'],[30,'السجدة'],
  [73,'الأحزاب'],[54,'سبإ'],[45,'فاطر'],[83,'يس'],
  [182,'الصافات'],[88,'ص'],[75,'الزمر'],[85,'غافر'],
  [54,'فصلت'],[53,'الشورى'],[89,'الزخرف'],[59,'الدخان'],
  [37,'الجاثية'],[35,'الأحقاف'],[38,'محمد'],[29,'الفتح'],
  [18,'الحجرات'],[45,'ق'],[60,'الذاريات'],[49,'الطور'],
  [62,'النجم'],[55,'القمر'],[78,'الرحمن'],[96,'الواقعة'],
  [29,'الحديد'],[22,'المجادلة'],[24,'الحشر'],[13,'الممتحنة'],
  [14,'الصف'],[11,'الجمعة'],[11,'المنافقون'],[18,'التغابن'],
  [12,'الطلاق'],[12,'التحريم'],[30,'الملك'],[52,'القلم'],
  [52,'الحاقة'],[44,'المعارج'],[28,'نوح'],[28,'الجن'],
  [20,'المزمل'],[56,'المدثر'],[40,'القيامة'],[31,'الإنسان'],
  [50,'المرسلات'],[40,'النبإ'],[46,'النازعات'],[42,'عبس'],
  [29,'التكوير'],[19,'الإنفطار'],[36,'المطففين'],[25,'الإنشقاق'],
  [22,'البروج'],[17,'الطارق'],[19,'الأعلى'],[26,'الغاشية'],
  [30,'الفجر'],[20,'البلد'],[15,'الشمس'],[21,'الليل'],
  [11,'الضحى'],[8,'الشرح'],[8,'التين'],[19,'العلق'],
  [5,'القدر'],[8,'البينة'],[8,'الزلزلة'],[11,'العاديات'],
  [11,'القارعة'],[8,'التكاثر'],[3,'العصر'],[9,'الهمزة'],
  [5,'الفيل'],[4,'قريش'],[7,'الماعون'],[3,'الكوثر'],
  [6,'الكافرون'],[3,'النصر'],[5,'المسد'],[4,'الإخلاص'],
  [5,'الفلق'],[6,'الناس'],
]

// ── Fonctions utilitaires ─────────────────────────────────────

/**
 * Retourne l'URL de l'image de couverture d'un tafsir
 */
export function getCoverUrl(tafsir: string): string {
  return `${TAFSIR_ONE_BASE}/images/${tafsir}.jpg`
}

/**
 * Retourne l'URL audio d'une sourate pour un tafsir donné
 * Le numéro de sourate est paddé à 3 chiffres (ex: 1 → "001")
 */
export function getSurahAudioUrl(tafsir: string, surah: number): string {
  const padded = String(surah).padStart(3, '0')
  return `${TAFSIR_ONE_BASE}/audio/${tafsir}/${padded}.mp3`
}

/**
 * Charge une page de tafsir depuis read.tafsir.one
 * ZONE SACRÉE : les données retournées ne doivent jamais être modifiées
 *
 * @param tafsir - clé du tafsir (ex: "almuyassar")
 * @param surah  - numéro de sourate (1-114)
 * @param ayah   - numéro d'ayah (1-n)
 */
export async function getTafsirPage(
  tafsir: string,
  surah: number,
  ayah: number,
): Promise<TafsirPage | null> {
  try {
    const url = `${TAFSIR_ONE_BASE}/get.php?uth&src=${tafsir}&s=${surah}&a=${ayah}`
    const res = await fetch(url, {
      next: { revalidate: 3600 }, // cache 1h côté serveur
    })
    if (!res.ok) return null
    const json = await res.json()
    // Retourner tel quel — ZONE SACRÉE, pas de transformation
    return {
      ayah: json.ayah ?? '',
      data: json.data ?? '',
      ayahs: json.ayahs ?? [],
      ayahs_start: json.ayahs_start ?? ayah,
    }
  } catch {
    return null
  }
}
