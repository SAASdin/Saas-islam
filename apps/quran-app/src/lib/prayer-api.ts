// ============================================================
// lib/prayer-api.ts — Horaires de prière via Aladhan API
// Source : https://aladhan.com/prayer-times-api
// Gratuit, pas de clé API requise
// ============================================================

const API_BASE = 'https://api.aladhan.com/v1'

// ── Types ────────────────────────────────────────────────────

export interface PrayerTimings {
  Fajr: string
  Sunrise: string
  Dhuhr: string
  Asr: string
  Sunset: string
  Maghrib: string
  Isha: string
  Imsak: string
  Midnight: string
  Firstthird: string
  Lastthird: string
}

export interface PrayerDate {
  readable: string      // ex: '25 Feb 2026'
  timestamp: string
  gregorian: {
    date: string
    format: string
    day: string
    weekday: { en: string }
    month: { number: number; en: string }
    year: string
  }
  hijri: {
    date: string        // ex: '25-08-1447'
    format: string
    day: string
    weekday: { en: string; ar: string }
    month: { number: number; en: string; ar: string }
    year: string
    designation: { abbreviated: string; expanded: string }
    holidays: string[]
  }
}

export interface PrayerData {
  timings: PrayerTimings
  date: PrayerDate
  meta: {
    latitude: number
    longitude: number
    timezone: string
    method: {
      id: number
      name: string
    }
    latitudeAdjustmentMethod: string
    school: string
  }
}

export interface NamedPrayer {
  key: keyof PrayerTimings
  nameAr: string
  nameFr: string
  nameEn: string
  time: string
  icon: string
}

// ── Mapping des noms de prières ──────────────────────────────

const PRAYER_NAMES: Partial<Record<keyof PrayerTimings, {
  nameAr: string; nameFr: string; nameEn: string; icon: string
}>> = {
  Fajr: {
    nameAr: 'الفجر',
    nameFr: 'Fajr (Aube)',
    nameEn: 'Fajr',
    icon: '🌙',
  },
  Sunrise: {
    nameAr: 'الشروق',
    nameFr: 'Lever du soleil',
    nameEn: 'Sunrise',
    icon: '🌅',
  },
  Dhuhr: {
    nameAr: 'الظهر',
    nameFr: 'Dhuhr (Midi)',
    nameEn: 'Dhuhr',
    icon: '☀️',
  },
  Asr: {
    nameAr: 'العصر',
    nameFr: 'Asr (Après-midi)',
    nameEn: 'Asr',
    icon: '🌤️',
  },
  Maghrib: {
    nameAr: 'المغرب',
    nameFr: 'Maghrib (Coucher)',
    nameEn: 'Maghrib',
    icon: '🌆',
  },
  Isha: {
    nameAr: 'العشاء',
    nameFr: 'Isha (Nuit)',
    nameEn: 'Isha',
    icon: '🌌',
  },
}

// Prières à afficher (dans l'ordre)
const DISPLAYED_PRAYERS: (keyof PrayerTimings)[] = [
  'Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'
]

// ── Méthodes de calcul ───────────────────────────────────────

export const CALCULATION_METHODS = {
  1: 'Muslim World League (MWL)',
  2: 'Islamic Society of North America (ISNA)',
  3: 'Egyptian General Authority of Survey',
  4: 'Umm Al-Qura University, Makkah',
  5: 'University of Islamic Sciences, Karachi',
  12: 'Union des Organisations Islamiques de France (UOIF)',
} as const

// ── Fonctions ────────────────────────────────────────────────

/**
 * Récupère les horaires de prière pour une ville
 * Méthode 12 = UOIF (Union des Organisations Islamiques de France) par défaut
 */
export async function getPrayerTimesByCity(
  city: string = 'Paris',
  country: string = 'France',
  method: number = 12
): Promise<PrayerData> {
  const today = new Date()
  const date = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`

  const url = `${API_BASE}/timingsByCity/${date}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`

  const res = await fetch(url, {
    next: { revalidate: 3600 }, // 1h (les horaires changent chaque jour)
  })

  if (!res.ok) {
    throw new Error(`Aladhan API error ${res.status}`)
  }

  const json = await res.json()

  if (json.code !== 200) {
    throw new Error(`Aladhan API error: ${json.status}`)
  }

  return json.data as PrayerData
}

/**
 * Récupère les horaires par coordonnées GPS
 */
export async function getPrayerTimesByCoords(
  latitude: number,
  longitude: number,
  method: number = 12
): Promise<PrayerData> {
  const today = new Date()
  const date = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`

  const url = `${API_BASE}/timings/${date}?latitude=${latitude}&longitude=${longitude}&method=${method}`

  const res = await fetch(url, {
    next: { revalidate: 3600 },
  })

  if (!res.ok) {
    throw new Error(`Aladhan API error ${res.status}`)
  }

  const json = await res.json()
  return json.data as PrayerData
}

/**
 * Transforme les timings bruts en liste de prières nommées
 */
export function formatPrayers(timings: PrayerTimings): NamedPrayer[] {
  return DISPLAYED_PRAYERS.map(key => {
    const meta = PRAYER_NAMES[key]!
    // L'API retourne des heures en format "HH:MM (timezone)" — on garde juste HH:MM
    const time = timings[key].split(' ')[0]
    return {
      key,
      nameAr: meta.nameAr,
      nameFr: meta.nameFr,
      nameEn: meta.nameEn,
      time,
      icon: meta.icon,
    }
  })
}

/**
 * Calcule la prochaine prière à partir de maintenant
 * Retourne l'index dans le tableau DISPLAYED_PRAYERS
 */
export function getNextPrayerIndex(prayers: NamedPrayer[], now: Date): number {
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  for (let i = 0; i < prayers.length; i++) {
    const [h, m] = prayers[i].time.split(':').map(Number)
    const prayerMinutes = h * 60 + m
    if (prayerMinutes > currentMinutes) {
      return i
    }
  }

  // Si on est après Isha → prochaine = Fajr demain
  return 0
}

/**
 * Formater la date hijri en arabe
 */
export function formatHijriDate(hijri: PrayerDate['hijri']): string {
  return `${hijri.day} ${hijri.month.ar} ${hijri.year} هـ`
}
