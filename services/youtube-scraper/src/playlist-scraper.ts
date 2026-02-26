// ============================================================
// playlist-scraper.ts — Scraping de playlists YouTube
//
// ⚠️  CGU YouTube : ne traiter QUE les vidéos sous licence
//     Creative Commons (license = 'creativeCommon')
//     OU avec permission explicite du propriétaire de la chaîne.
//
// Ce service utilise l'API officielle YouTube Data API v3.
// Pas de scraping HTML, pas de contournement des restrictions.
// ============================================================

import { google } from 'googleapis'
import { config, ARABIC_LANGUAGE_CODES, ARABIC_TITLE_INDICATORS } from './config.js'
import { upsertPlaylist, upsertVideo, videoExists, markPlaylistScraped } from './db.js'
import type { YouTubeVideoMeta, YouTubePlaylist } from './types.js'

const youtube = google.youtube({ version: 'v3', auth: config.youtube.apiKey })

// ── Détection de la langue arabe ─────────────────────────────

function isArabicVideo(meta: {
  defaultAudioLanguage?: string | null
  defaultLanguage?:      string | null
  title:                 string
  description?:          string | null
}): boolean {
  // 1. Langue déclarée dans les métadonnées
  if (meta.defaultAudioLanguage && ARABIC_LANGUAGE_CODES.has(meta.defaultAudioLanguage)) return true
  if (meta.defaultLanguage      && ARABIC_LANGUAGE_CODES.has(meta.defaultLanguage))      return true

  // 2. Détection par caractères arabes dans le titre (U+0600–U+06FF)
  const arabicRegex = /[\u0600-\u06FF]/
  if (arabicRegex.test(meta.title)) return true

  // 3. Mots-clés arabes courants dans le titre
  const titleLower = meta.title
  if (ARABIC_TITLE_INDICATORS.some(kw => titleLower.includes(kw))) return true

  return false
}

// ── Conversion durée ISO 8601 → secondes ─────────────────────

function parseDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  const h = parseInt(match[1] ?? '0')
  const m = parseInt(match[2] ?? '0')
  const s = parseInt(match[3] ?? '0')
  return h * 3600 + m * 60 + s
}

// ── Récupération des métadonnées d'une vidéo ─────────────────

async function fetchVideoDetails(videoId: string): Promise<YouTubeVideoMeta | null> {
  const res = await youtube.videos.list({
    part:     ['snippet', 'contentDetails', 'status'],
    id:       [videoId],
    maxResults: 1,
  })

  const item = res.data.items?.[0]
  if (!item) return null

  const snippet        = item.snippet!
  const contentDetails = item.contentDetails!
  const status         = item.status!

  // ⚠️  FILTRE CGU : Licence Creative Commons uniquement
  const license = (status.license ?? 'youtube') as 'youtube' | 'creativeCommon'
  if (license !== 'creativeCommon') {
    console.log(`  ⏭️  Ignoré (licence YouTube standard) : ${videoId} — ${snippet.title}`)
    return null
  }

  const durationSec = parseDuration(contentDetails.duration ?? '')

  // Ignorer les vidéos trop longues (live streams, etc.)
  const maxSec = config.processing.maxVideoDurationMin * 60
  if (durationSec > maxSec) {
    console.log(`  ⏭️  Ignoré (durée > ${config.processing.maxVideoDurationMin}min) : ${videoId}`)
    return null
  }

  const meta: YouTubeVideoMeta = {
    videoId:      videoId,
    title:        snippet.title         ?? '',
    description:  snippet.description   ?? '',
    channelId:    snippet.channelId      ?? '',
    channelTitle: snippet.channelTitle   ?? '',
    publishedAt:  snippet.publishedAt    ?? new Date().toISOString(),
    duration:     contentDetails.duration ?? '',
    durationSec,
    thumbnailUrl: snippet.thumbnails?.high?.url ?? snippet.thumbnails?.default?.url ?? '',
    language:     snippet.defaultAudioLanguage ?? snippet.defaultLanguage ?? null,
    license,
    isArabic:     isArabicVideo({
      defaultAudioLanguage: snippet.defaultAudioLanguage,
      defaultLanguage:      snippet.defaultLanguage,
      title:                snippet.title ?? '',
      description:          snippet.description,
    }),
  }

  return meta
}

// ── Scraping d'une playlist complète ─────────────────────────

export async function scrapePlaylist(params: {
  playlistId: string
  speakerId?: number
}): Promise<{ processed: number; skipped: number; total: number }> {
  const { playlistId, speakerId } = params

  console.log(`\n🎬 Scraping playlist : ${playlistId}`)

  // 1. Récupérer les métadonnées de la playlist
  const playlistRes = await youtube.playlists.list({
    part:       ['snippet'],
    id:         [playlistId],
    maxResults: 1,
  })

  const playlist = playlistRes.data.items?.[0]
  if (!playlist) throw new Error(`Playlist introuvable : ${playlistId}`)

  const playlistData: YouTubePlaylist = {
    playlistId,
    title:        playlist.snippet?.title        ?? '',
    channelId:    playlist.snippet?.channelId    ?? '',
    channelTitle: playlist.snippet?.channelTitle ?? '',
    videoCount:   0,
  }

  await upsertPlaylist({
    youtubePlaylistId: playlistId,
    title:             playlistData.title,
    channelId:         playlistData.channelId,
    channelTitle:      playlistData.channelTitle,
    speakerId,
  })

  console.log(`  📋 Playlist : ${playlistData.title} (${playlistData.channelTitle})`)

  // 2. Paginer à travers tous les items de la playlist
  let nextPageToken: string | undefined
  let processed = 0
  let skipped   = 0
  let total     = 0

  do {
    const itemsRes = await youtube.playlistItems.list({
      part:       ['snippet', 'contentDetails'],
      playlistId,
      maxResults: 50,
      pageToken:  nextPageToken,
    })

    const items       = itemsRes.data.items ?? []
    nextPageToken     = itemsRes.data.nextPageToken ?? undefined
    total            += items.length

    for (const item of items) {
      const videoId = item.contentDetails?.videoId
      if (!videoId) { skipped++; continue }

      // ⚠️  Ne jamais retraiter une vidéo déjà en base
      if (await videoExists(videoId)) {
        console.log(`  ✅ Déjà en base : ${videoId}`)
        skipped++
        continue
      }

      // Récupérer les détails complets + filtre licence CC
      const meta = await fetchVideoDetails(videoId)
      if (!meta) { skipped++; continue }

      // Filtre : uniquement les vidéos en arabe
      if (!meta.isArabic) {
        console.log(`  🌐 Ignoré (non arabe) : ${videoId} — ${meta.title}`)
        skipped++
        continue
      }

      // Sauvegarder en base
      meta.playlistId = playlistId
      const dbId = await upsertVideo(meta, speakerId)

      console.log(`  ✨ Ajouté [${dbId.slice(0, 8)}] : ${meta.title} (${Math.round(meta.durationSec / 60)}min)`)
      processed++

      // Pause pour respecter les quotas YouTube API (10 000 units/day)
      await new Promise(r => setTimeout(r, 100))
    }
  } while (nextPageToken)

  // Mettre à jour le compteur de la playlist
  await markPlaylistScraped(playlistId, processed)

  console.log(`\n📊 Résumé playlist ${playlistId}:`)
  console.log(`   Total       : ${total}`)
  console.log(`   Ajoutées    : ${processed}`)
  console.log(`   Ignorées    : ${skipped}`)

  return { processed, skipped, total }
}

// ── Scraping d'une URL quelconque (playlist ou vidéo seule) ──

export async function scrapeUrl(url: string, speakerId?: number): Promise<void> {
  // Extraire l'ID de playlist de l'URL
  const playlistMatch = url.match(/[?&]list=([a-zA-Z0-9_-]+)/)
  if (playlistMatch) {
    await scrapePlaylist({ playlistId: playlistMatch[1], speakerId })
    return
  }

  // URL de vidéo seule
  const videoMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (videoMatch) {
    const videoId = videoMatch[1]
    if (await videoExists(videoId)) {
      console.log(`Vidéo déjà en base : ${videoId}`)
      return
    }
    const meta = await fetchVideoDetails(videoId)
    if (meta) {
      await upsertVideo(meta, speakerId)
      console.log(`✅ Vidéo ajoutée : ${meta.title}`)
    }
    return
  }

  throw new Error(`URL non reconnue : ${url}`)
}
