// ============================================================
// db.ts — Connexion PostgreSQL + requêtes du service
// Utilise le schéma media.* existant
// ============================================================

import pg from 'pg'
import { config } from './config.js'
import type { YouTubeVideoMeta } from './types.js'

const { Pool } = pg

// Pool de connexions partagé
export const pool = new Pool({ connectionString: config.db.url })

// Vérification de la connexion au démarrage
export async function checkDbConnection(): Promise<void> {
  const client = await pool.connect()
  await client.query('SELECT 1')
  client.release()
  console.log('✅ DB connectée')
}

// ── Playlists ─────────────────────────────────────────────────

export async function upsertPlaylist(params: {
  youtubePlaylistId: string
  title:             string
  channelId:         string
  channelTitle:      string
  speakerId?:        number
}): Promise<number> {
  const { rows } = await pool.query<{ id: number }>(
    `INSERT INTO media.youtube_playlists
       (youtube_playlist_id, title, channel_id, channel_title, speaker_id)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (youtube_playlist_id) DO UPDATE
       SET title         = EXCLUDED.title,
           last_scraped_at = NOW()
     RETURNING id`,
    [params.youtubePlaylistId, params.title, params.channelId, params.channelTitle, params.speakerId ?? null]
  )
  return rows[0].id
}

export async function markPlaylistScraped(playlistId: string, totalVideos: number): Promise<void> {
  await pool.query(
    `UPDATE media.youtube_playlists
     SET last_scraped_at = NOW(), total_videos = $1
     WHERE youtube_playlist_id = $2`,
    [totalVideos, playlistId]
  )
}

// ── Vidéos ────────────────────────────────────────────────────

/** Vérifie si une vidéo existe déjà en base (évite re-traitement) */
export async function videoExists(youtubeVideoId: string): Promise<boolean> {
  const { rows } = await pool.query(
    `SELECT 1 FROM media.videos WHERE youtube_video_id = $1 LIMIT 1`,
    [youtubeVideoId]
  )
  return rows.length > 0
}

/** Insère ou met à jour une vidéo YouTube */
export async function upsertVideo(meta: YouTubeVideoMeta, speakerId?: number): Promise<string> {
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO media.videos
       (title_ar, youtube_video_id, youtube_channel_id,
        thumbnail_url, duration_sec, source_type,
        speaker_id, status, is_auto_translated, published_at)
     VALUES ($1, $2, $3, $4, $5, 'youtube', $6, 'pending', false, $7)
     ON CONFLICT (youtube_video_id) DO UPDATE
       SET title_ar      = COALESCE(EXCLUDED.title_ar, media.videos.title_ar),
           thumbnail_url = EXCLUDED.thumbnail_url,
           duration_sec  = EXCLUDED.duration_sec
     RETURNING id`,
    [
      meta.title,
      meta.videoId,
      meta.channelId,
      meta.thumbnailUrl,
      meta.durationSec,
      speakerId ?? null,
      meta.publishedAt,
    ]
  )
  return rows[0].id
}

/** Récupère les vidéos sans transcription (à traiter) */
export async function getVideosWithoutTranscription(limit = 10): Promise<Array<{ id: string; youtubeVideoId: string }>> {
  const { rows } = await pool.query(
    `SELECT v.id, v.youtube_video_id
     FROM media.videos v
     WHERE v.source_type = 'youtube'
       AND v.status = 'pending'
       AND NOT EXISTS (
         SELECT 1 FROM media.translated_videos t
         WHERE t.video_id = v.id
       )
     LIMIT $1`,
    [limit]
  )
  return rows.map(r => ({ id: r.id as string, youtubeVideoId: r.youtube_video_id as string }))
}

/** Récupère les vidéos avec transcription mais sans traduction FR */
export async function getVideosWithoutTranslation(lang: 'fr' | 'en', limit = 10): Promise<Array<{ id: string; transcriptAr: string }>> {
  const { rows } = await pool.query(
    `SELECT v.id, t.transcript_ar
     FROM media.videos v
     JOIN media.translated_videos t ON t.video_id = v.id
     WHERE t.transcript_ar IS NOT NULL
       AND NOT EXISTS (
         SELECT 1 FROM media.translated_videos t2
         WHERE t2.video_id = v.id AND t2.target_language = $1
       )
     LIMIT $2`,
    [lang, limit]
  )
  return rows.map(r => ({ id: r.id as string, transcriptAr: r.transcript_ar as string }))
}

// ── Transcriptions ────────────────────────────────────────────

export async function saveTranscription(params: {
  videoId:      string
  transcriptAr: string
  whisperModel: string
  subtitlesSrtUrl?: string
}): Promise<void> {
  await pool.query(
    `INSERT INTO media.translated_videos
       (video_id, target_language, transcript_ar, whisper_model,
        is_verified, translation_service)
     VALUES ($1, 'ar', $2, $3, false, 'whisper')
     ON CONFLICT (video_id, target_language) DO UPDATE
       SET transcript_ar = EXCLUDED.transcript_ar,
           whisper_model = EXCLUDED.whisper_model`,
    [params.videoId, params.transcriptAr, params.whisperModel]
  )

  // Mettre à jour le flag has_arabic_subs sur la vidéo
  await pool.query(
    `UPDATE media.videos
     SET has_arabic_subs = true, is_auto_translated = true
     WHERE id = $1`,
    [params.videoId]
  )
}

// ── Traductions ───────────────────────────────────────────────

export async function saveTranslation(params: {
  videoId:         string
  targetLang:      'fr' | 'en'
  translatedText:  string
  service:         'deepl' | 'gpt4' | 'claude'
  subtitlesSrtUrl?: string
}): Promise<void> {
  const colText    = params.targetLang === 'fr' ? 'transcript_fr' : 'transcript_en'
  const colSubsUrl = params.targetLang === 'fr' ? 'subtitles_url_fr' : 'subtitles_url_en'
  const colHasSubs = params.targetLang === 'fr' ? 'has_french_subs' : 'has_english_subs'

  // ⚠️  RÈGLE CRITIQUE : is_verified TOUJOURS false pour les trad auto
  await pool.query(
    `INSERT INTO media.translated_videos
       (video_id, target_language, ${colText}, translation_service,
        is_verified, subtitles_srt_url)
     VALUES ($1, $2, $3, $4, false, $5)
     ON CONFLICT (video_id, target_language) DO UPDATE
       SET ${colText}           = EXCLUDED.${colText},
           translation_service  = EXCLUDED.translation_service,
           is_verified          = false,
           subtitles_srt_url    = COALESCE(EXCLUDED.subtitles_srt_url, media.translated_videos.subtitles_srt_url)`,
    [params.videoId, params.targetLang, params.translatedText, params.service, params.subtitlesSrtUrl ?? null]
  )

  // Mettre à jour les flags sur la vidéo
  await pool.query(
    `UPDATE media.videos
     SET ${colHasSubs} = true,
         ${colSubsUrl} = $2,
         is_auto_translated = true
     WHERE id = $1`,
    [params.videoId, params.subtitlesSrtUrl ?? null]
  )
}
