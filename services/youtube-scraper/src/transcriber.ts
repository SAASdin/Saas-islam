// ============================================================
// transcriber.ts — Transcription audio via OpenAI Whisper
//
// Pipeline :
//   1. Télécharge l'audio (yt-dlp, mp3 uniquement)
//   2. Envoie à OpenAI Whisper (model: whisper-1, language: ar)
//   3. Récupère transcription + timestamps
//   4. Génère fichier SRT arabe
//   5. Sauvegarde en base
//
// ⚠️  Texte arabe transcrit : JAMAIS transformé (READ ONLY)
// ⚠️  CGU : ne traiter que des vidéos avec licence Creative Commons
// ============================================================

import fs from 'fs'
import path from 'path'
import fse from 'fs-extra'
import YTDlpWrap from 'yt-dlp-wrap'
import OpenAI from 'openai'
import { config } from './config.js'
import { saveTranscription } from './db.js'
import type { TranscriptionResult, WhisperSegment } from './types.js'

const openai  = new OpenAI({ apiKey: config.openai.apiKey })
const ytDlp   = new YTDlpWrap()

// ── Téléchargement audio ──────────────────────────────────────

async function downloadAudio(youtubeVideoId: string): Promise<string> {
  await fse.ensureDir(config.processing.tempDir)
  const outputPath = path.join(config.processing.tempDir, `${youtubeVideoId}.mp3`)

  // Vérifier si déjà téléchargé
  if (fs.existsSync(outputPath)) {
    console.log(`  ♻️  Audio déjà en cache : ${outputPath}`)
    return outputPath
  }

  console.log(`  ⬇️  Téléchargement audio : ${youtubeVideoId}`)

  const videoUrl = `https://www.youtube.com/watch?v=${youtubeVideoId}`

  await ytDlp.execPromise([
    videoUrl,
    '--extract-audio',
    '--audio-format', 'mp3',
    '--audio-quality', '5',          // Qualité 5 = 128kbps (suffisant pour Whisper)
    '--output', outputPath,
    '--no-playlist',                  // Ne jamais télécharger une playlist entière accidentellement
    '--max-filesize', '100m',         // Limite à 100 MB
    '--no-overwrites',
    '--quiet',
    '--progress',
  ])

  if (!fs.existsSync(outputPath)) {
    throw new Error(`Téléchargement échoué pour ${youtubeVideoId}`)
  }

  const sizeMB = fs.statSync(outputPath).size / (1024 * 1024)
  console.log(`  ✅ Audio téléchargé : ${sizeMB.toFixed(1)} MB`)
  return outputPath
}

// ── Génération SRT depuis les segments Whisper ────────────────

function secondsToSrtTime(seconds: number): string {
  const h   = Math.floor(seconds / 3600)
  const m   = Math.floor((seconds % 3600) / 60)
  const s   = Math.floor(seconds % 60)
  const ms  = Math.round((seconds % 1) * 1000)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`
}

function generateSrt(segments: WhisperSegment[]): string {
  return segments
    .map((seg, i) => [
      String(i + 1),
      `${secondsToSrtTime(seg.start)} --> ${secondsToSrtTime(seg.end)}`,
      // ⚠️  Texte arabe READ ONLY — jamais modifié
      seg.text.trim(),
      '',
    ].join('\n'))
    .join('\n')
}

// ── Transcription Whisper ─────────────────────────────────────

async function transcribeWithWhisper(audioPath: string): Promise<{
  fullText:  string
  segments:  WhisperSegment[]
  duration:  number
}> {
  console.log(`  🎙️  Transcription Whisper : ${path.basename(audioPath)}`)

  const audioStream = fs.createReadStream(audioPath)

  const response = await openai.audio.transcriptions.create({
    file:             audioStream,
    model:            'whisper-1',
    language:         'ar',              // Arabe explicitement
    response_format:  'verbose_json',    // Pour obtenir les segments avec timestamps
    temperature:      0,                 // Déterministe
  })

  // Extraire les segments typés
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = response as any
  const segments: WhisperSegment[] = (raw.segments ?? []).map((seg: any, i: number) => ({
    id:    i,
    start: seg.start as number,
    end:   seg.end   as number,
    // ⚠️  Texte arabe READ ONLY
    text:  (seg.text as string).trim(),
  }))

  const duration = raw.duration as number ?? 0

  console.log(`  ✅ Transcription terminée : ${segments.length} segments, ${Math.round(duration)}s`)

  return {
    // ⚠️  fullText READ ONLY — jamais transformé
    fullText: raw.text as string,
    segments,
    duration,
  }
}

// ── Sauvegarde du fichier SRT ─────────────────────────────────

async function saveSrtFile(videoId: string, srtContent: string, lang: 'ar'): Promise<string> {
  const dir     = path.join(config.processing.outputDir, videoId)
  await fse.ensureDir(dir)
  const srtPath = path.join(dir, `${videoId}_${lang}.srt`)
  await fse.writeFile(srtPath, srtContent, 'utf-8')
  return srtPath
}

// ── Nettoyage audio temporaire ────────────────────────────────

async function cleanupAudio(audioPath: string): Promise<void> {
  try {
    await fse.remove(audioPath)
  } catch {
    // Silencieux — nettoyage best-effort
  }
}

// ── Pipeline principal ────────────────────────────────────────

export async function transcribeVideo(params: {
  youtubeVideoId: string
  dbVideoId:      string
}): Promise<TranscriptionResult> {
  const { youtubeVideoId, dbVideoId } = params
  let audioPath: string | null = null

  try {
    // 1. Télécharger l'audio
    audioPath = await downloadAudio(youtubeVideoId)

    // 2. Transcrire avec Whisper
    const { fullText, segments, duration } = await transcribeWithWhisper(audioPath)

    // 3. Générer fichier SRT arabe
    const srtContent = generateSrt(segments)
    const srtPath    = await saveSrtFile(youtubeVideoId, srtContent, 'ar')

    // 4. Sauvegarder en base
    await saveTranscription({
      videoId:         dbVideoId,
      // ⚠️  texte arabe READ ONLY
      transcriptAr:    fullText,
      whisperModel:    'whisper-1',
      subtitlesSrtUrl: srtPath,
    })

    const result: TranscriptionResult = {
      videoId:      youtubeVideoId,
      language:     'ar',
      // ⚠️  fullText READ ONLY
      fullText,
      segments,
      durationSec:  duration,
      whisperModel: 'whisper-1',
      processedAt:  new Date(),
    }

    console.log(`  ✅ Transcription sauvegardée : ${youtubeVideoId}`)
    console.log(`     Texte : ${fullText.length} caractères | Segments : ${segments.length}`)

    return result
  } finally {
    // Toujours nettoyer l'audio temporaire
    if (audioPath) await cleanupAudio(audioPath)
  }
}

// ── Traitement en lot ─────────────────────────────────────────

export async function transcribePendingVideos(limit = 5): Promise<void> {
  const { getVideosWithoutTranscription } = await import('./db.js')
  const videos = await getVideosWithoutTranscription(limit)

  if (videos.length === 0) {
    console.log('Aucune vidéo en attente de transcription.')
    return
  }

  console.log(`\n🎙️  ${videos.length} vidéo(s) à transcrire`)

  for (const video of videos) {
    try {
      await transcribeVideo({
        youtubeVideoId: video.youtubeVideoId,
        dbVideoId:      video.id,
      })
    } catch (err) {
      console.error(`  ❌ Erreur transcription ${video.youtubeVideoId} :`, err)
    }
  }
}
