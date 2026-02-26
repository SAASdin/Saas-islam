// ============================================================
// types.ts — Types du service YouTube Scraper
// ============================================================

/** Métadonnées d'une vidéo YouTube (depuis l'API) */
export interface YouTubeVideoMeta {
  videoId:       string
  title:         string
  description:   string
  channelId:     string
  channelTitle:  string
  publishedAt:   string
  duration:      string      // ISO 8601 (PT4M13S)
  durationSec:   number
  thumbnailUrl:  string
  language:      string | null
  license:       'youtube' | 'creativeCommon'
  isArabic:      boolean
  playlistId?:   string
}

/** Playlist YouTube */
export interface YouTubePlaylist {
  playlistId:   string
  title:        string
  channelId:    string
  channelTitle: string
  videoCount:   number
}

/** Transcription Whisper (un segment avec timestamps) */
export interface WhisperSegment {
  id:    number
  start: number   // secondes
  end:   number   // secondes
  text:  string   // ⚠️ Texte arabe — jamais modifié
}

/** Résultat complet de la transcription */
export interface TranscriptionResult {
  videoId:       string
  language:      string
  fullText:      string        // ⚠️ Texte arabe READ ONLY
  segments:      WhisperSegment[]
  durationSec:   number
  whisperModel:  string
  processedAt:   Date
}

/** Résultat de traduction */
export interface TranslationResult {
  videoId:        string
  sourceLang:     'ar'
  targetLang:     'fr' | 'en'
  translatedText: string
  /** ⚠️ TOUJOURS true — traduction automatique jamais présentée comme officielle */
  autoTranslated: true
  /** ⚠️ TOUJOURS false — requiert relecture humaine */
  verified:       false
  service:        'deepl' | 'gpt4' | 'claude'
  srtContent:     string       // Contenu du fichier SRT généré
  processedAt:    Date
}

/** Job de la queue */
export type JobType = 'scrape-playlist' | 'transcribe-video' | 'translate-video'

export interface ScrapePlaylistJob {
  type:        'scrape-playlist'
  playlistUrl: string
  speakerId?:  number
}

export interface TranscribeVideoJob {
  type:        'transcribe-video'
  videoId:     string         // ID YouTube
  dbVideoId:   string         // UUID en base
  language:    'ar'
}

export interface TranslateVideoJob {
  type:           'translate-video'
  videoId:        string
  dbVideoId:      string
  targetLanguages: Array<'fr' | 'en'>
}

export type QueueJob = ScrapePlaylistJob | TranscribeVideoJob | TranslateVideoJob

/** Channels de savants reconnus (playlists de départ) */
export interface KnownChannel {
  name:        string
  channelId:   string
  playlistIds: string[]
  language:    'ar' | 'en' | 'mixed'
  verified:    boolean   // Vérifié manuellement comme source fiable
}
