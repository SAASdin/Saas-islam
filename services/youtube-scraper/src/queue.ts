// ============================================================
// queue.ts — File d'attente BullMQ (Redis)
// Max 5 vidéos en parallèle pour respecter les limites d'API
// ============================================================

import { Queue, Worker, Job, QueueEvents } from 'bullmq'
import { config } from './config.js'
import { scrapeUrl } from './playlist-scraper.js'
import { transcribeVideo } from './transcriber.js'
import { translateVideo } from './translator.js'
import type { QueueJob, ScrapePlaylistJob, TranscribeVideoJob, TranslateVideoJob } from './types.js'

const redisConnection = {
  host:     config.redis.host,
  port:     config.redis.port,
  password: config.redis.password,
}

// ── Définition des queues ─────────────────────────────────────

export const scraperQueue     = new Queue<ScrapePlaylistJob>   ('scraper',     { connection: redisConnection })
export const transcriberQueue = new Queue<TranscribeVideoJob>  ('transcriber', { connection: redisConnection })
export const translatorQueue  = new Queue<TranslateVideoJob>   ('translator',  { connection: redisConnection })

// ── Workers ───────────────────────────────────────────────────

export function createScraperWorker() {
  return new Worker<ScrapePlaylistJob>(
    'scraper',
    async (job: Job<ScrapePlaylistJob>) => {
      console.log(`\n[Scraper] Job ${job.id} : ${job.data.playlistUrl}`)
      await scrapeUrl(job.data.playlistUrl, job.data.speakerId)
    },
    {
      connection:  redisConnection,
      concurrency: config.processing.maxConcurrentJobs,
    }
  )
}

export function createTranscriberWorker() {
  return new Worker<TranscribeVideoJob>(
    'transcriber',
    async (job: Job<TranscribeVideoJob>) => {
      console.log(`\n[Transcriber] Job ${job.id} : ${job.data.videoId}`)
      await transcribeVideo({
        youtubeVideoId: job.data.videoId,
        dbVideoId:      job.data.dbVideoId,
      })

      // Enchaîner automatiquement la traduction
      await translatorQueue.add(
        `translate-${job.data.videoId}`,
        {
          type:            'translate-video',
          videoId:         job.data.videoId,
          dbVideoId:       job.data.dbVideoId,
          targetLanguages: ['fr', 'en'],
        },
        {
          attempts:    3,
          backoff:     { type: 'exponential', delay: 10000 },
          removeOnComplete: 100,
        }
      )
    },
    {
      connection:  redisConnection,
      // Max 5 en parallèle pour respecter les limites OpenAI Whisper
      concurrency: Math.min(config.processing.maxConcurrentJobs, 5),
      limiter:     {
        max:      3,
        duration: 60000,    // Max 3 transcriptions par minute
      },
    }
  )
}

export function createTranslatorWorker() {
  return new Worker<TranslateVideoJob>(
    'translator',
    async (job: Job<TranslateVideoJob>) => {
      console.log(`\n[Translator] Job ${job.id} : ${job.data.videoId} → ${job.data.targetLanguages.join(', ')}`)

      // Récupérer la transcription depuis la DB
      const { pool } = await import('./db.js')
      const { rows } = await pool.query(
        `SELECT transcript_ar FROM media.translated_videos
         WHERE video_id = $1 AND transcript_ar IS NOT NULL
         LIMIT 1`,
        [job.data.dbVideoId]
      )

      if (rows.length === 0) {
        throw new Error(`Transcription introuvable pour la vidéo ${job.data.dbVideoId}`)
      }

      await translateVideo({
        videoId:         job.data.dbVideoId,
        youtubeVideoId:  job.data.videoId,
        // ⚠️  transcriptAr READ ONLY
        transcriptAr:    rows[0].transcript_ar as string,
        targetLanguages: job.data.targetLanguages,
      })
    },
    {
      connection:  redisConnection,
      concurrency: config.processing.maxConcurrentJobs,
      limiter:     {
        max:      10,
        duration: 60000,    // Max 10 traductions par minute (limites DeepL/GPT-4)
      },
    }
  )
}

// ── Ajout de jobs dans la queue ───────────────────────────────

export async function enqueuePlaylistScrape(
  playlistUrl: string,
  speakerId?: number
): Promise<string> {
  const job = await scraperQueue.add(
    `scrape-${Date.now()}`,
    { type: 'scrape-playlist', playlistUrl, speakerId },
    {
      attempts:         3,
      backoff:          { type: 'exponential', delay: 5000 },
      removeOnComplete: 50,
    }
  )
  console.log(`✅ Job scraper ajouté : ${job.id} — ${playlistUrl}`)
  return job.id ?? ''
}

export async function enqueueVideoTranscription(
  videoId:   string,
  dbVideoId: string
): Promise<string> {
  const job = await transcriberQueue.add(
    `transcribe-${videoId}`,
    { type: 'transcribe-video', videoId, dbVideoId, language: 'ar' },
    {
      attempts:         3,
      backoff:          { type: 'exponential', delay: 15000 },
      removeOnComplete: 100,
      // Éviter les doublons
      jobId:            `transcribe-${videoId}`,
    }
  )
  console.log(`✅ Job transcription ajouté : ${job.id}`)
  return job.id ?? ''
}

// ── Monitoring des queues ─────────────────────────────────────

export async function getQueueStats(): Promise<{
  scraper:     Record<string, number>
  transcriber: Record<string, number>
  translator:  Record<string, number>
}> {
  const [scraperCounts, transcriberCounts, translatorCounts] = await Promise.all([
    scraperQueue.getJobCounts(),
    transcriberQueue.getJobCounts(),
    translatorQueue.getJobCounts(),
  ])

  return {
    scraper:     scraperCounts,
    transcriber: transcriberCounts,
    translator:  translatorCounts,
  }
}

// ── Démarrage des workers ─────────────────────────────────────

export function startAllWorkers(): void {
  const scraperWorker     = createScraperWorker()
  const transcriberWorker = createTranscriberWorker()
  const translatorWorker  = createTranslatorWorker()

  // Gestion des événements
  for (const [name, worker] of [
    ['scraper', scraperWorker],
    ['transcriber', transcriberWorker],
    ['translator', translatorWorker],
  ] as const) {
    worker.on('completed', (job: Job) => {
      console.log(`✅ [${name}] Job ${job.id} terminé`)
    })
    worker.on('failed', (job: Job | undefined, err: Error) => {
      console.error(`❌ [${name}] Job ${job?.id} échoué :`, err.message)
    })
  }

  console.log('🚀 Workers démarrés (max 5 jobs parallèles)')
  console.log('   - Scraper     : actif')
  console.log('   - Transcriber : actif (Whisper)')
  console.log('   - Translator  : actif (DeepL → GPT-4 → Claude)')

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('\n🛑 Arrêt gracieux des workers...')
    await Promise.all([
      scraperWorker.close(),
      transcriberWorker.close(),
      translatorWorker.close(),
    ])
    process.exit(0)
  })
}

// Point d'entrée si lancé directement
if (process.argv[1]?.endsWith('queue.ts') || process.argv[1]?.endsWith('queue.js')) {
  import('./db.js').then(({ checkDbConnection }) => checkDbConnection())
  startAllWorkers()
}
