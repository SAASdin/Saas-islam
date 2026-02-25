// ============================================================
// config.ts — Configuration centralisée (variables d'environnement)
// ============================================================

import 'dotenv/config'
import type { KnownChannel } from './types.js'

function requireEnv(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Variable d'environnement manquante : ${key}`)
  return val
}

function optionalEnv(key: string, fallback = ''): string {
  return process.env[key] ?? fallback
}

export const config = {
  db: {
    url: requireEnv('DATABASE_URL'),
  },
  youtube: {
    apiKey: requireEnv('YOUTUBE_API_KEY'),
  },
  openai: {
    apiKey: requireEnv('OPENAI_API_KEY'),
  },
  deepl: {
    apiKey:  optionalEnv('DEEPL_API_KEY'),
    baseUrl: 'https://api-free.deepl.com/v2',
  },
  anthropic: {
    apiKey: optionalEnv('ANTHROPIC_API_KEY'),
  },
  redis: {
    host:     optionalEnv('REDIS_HOST', 'localhost'),
    port:     parseInt(optionalEnv('REDIS_PORT', '6379')),
    password: optionalEnv('REDIS_PASSWORD') || undefined,
  },
  processing: {
    maxConcurrentJobs:    parseInt(optionalEnv('MAX_CONCURRENT_JOBS', '5')),
    maxVideoDurationMin:  parseInt(optionalEnv('MAX_VIDEO_DURATION_MIN', '180')),
    tempDir:              optionalEnv('TEMP_DIR', '/tmp/youtube-scraper'),
    outputDir:            optionalEnv('OUTPUT_DIR', './output'),
  },
} as const

// ── Chaînes de savants reconnus ───────────────────────────────
// ⚠️  Liste curatée manuellement — vérifier la crédibilité avant d'ajouter
// CGU : ne scraper que les vidéos Creative Commons ou avec permission

export const KNOWN_CHANNELS: KnownChannel[] = [
  {
    name:      'Bilal Philips — Abu Ameenah Bilal Philips',
    channelId: 'UCRMkO5CGZZ5mPBD-28bBeSQ',
    playlistIds: [
      'PLJ2KOh4N6PmRY26IWnKTqcBJKJkO6hb-j',  // Islamic Studies course
    ],
    language:  'en',
    verified:  true,
  },
  {
    name:      'Institut Ibn Badis',
    channelId: 'UCYq9dFAq8uLV3eFiNRHiL9w',
    playlistIds: [],
    language:  'ar',
    verified:  true,
  },
  // TODO : Ajouter d'autres chaînes vérifiées manuellement
  // IMPORTANT : Obtenir permission explicite avant de scraper des vidéos non-CC
]

// Détection de la langue arabe depuis les métadonnées YouTube
export const ARABIC_LANGUAGE_CODES = new Set([
  'ar', 'ar-SA', 'ar-EG', 'ar-MA', 'ar-DZ',
  'ar-TN', 'ar-LY', 'ar-SD', 'ar-SY', 'ar-IQ',
])

// Mots-clés arabes dans le titre → vidéo probablement en arabe
export const ARABIC_TITLE_INDICATORS = [
  'شرح', 'دروس', 'محاضرة', 'خطبة', 'تفسير', 'حديث',
  'فقه', 'عقيدة', 'سيرة', 'قرآن', 'دورة', 'لقاء',
]
