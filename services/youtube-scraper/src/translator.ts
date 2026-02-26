// ============================================================
// translator.ts — Traduction automatique AR → FR/EN
//
// Pipeline :
//   1. Transcription arabe (depuis DB)
//   2. DeepL API (priorité) → GPT-4 (fallback) → Claude (fallback)
//   3. Génération SRT avec timestamps synchronisés
//   4. Sauvegarde avec is_verified = FALSE (TOUJOURS)
//
// ⚠️  RÈGLE CRITIQUE — JAMAIS violer :
//     - is_verified TOUJOURS false pour les traductions automatiques
//     - Le texte arabe source n'est JAMAIS modifié
//     - L'interface DOIT afficher "Traduction automatique non vérifiée"
//     - Ces traductions ne sont JAMAIS présentées comme des traductions officielles
// ============================================================

import path from 'path'
import fse from 'fs-extra'
import axios from 'axios'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { config } from './config.js'
import { saveTranslation } from './db.js'
import type { TranslationResult, WhisperSegment } from './types.js'

const openai    = new OpenAI({ apiKey: config.openai.apiKey })
const anthropic = new Anthropic({ apiKey: config.anthropic.apiKey })

// ── Métadonnées de traduction automatique ─────────────────────
// Ces métadonnées DOIVENT être attachées à toute traduction auto
export const AUTO_TRANSLATION_META = {
  auto_translated: true,
  verified:        false,
  disclaimer_fr:   '⚠️ Traduction automatique non vérifiée — Ne pas utiliser comme référence religieuse',
  disclaimer_en:   '⚠️ Automatic translation, unverified — Do not use as a religious reference',
} as const

// ── Découpage du texte pour les APIs (limites de tokens) ──────

function splitTextIntoChunks(text: string, maxChars = 4000): string[] {
  // Découper aux points (fin de phrase) pour préserver le sens
  const sentences = text.match(/[^.!?]*[.!?]+/g) ?? [text]
  const chunks: string[] = []
  let current = ''

  for (const sentence of sentences) {
    if ((current + sentence).length > maxChars) {
      if (current) chunks.push(current.trim())
      current = sentence
    } else {
      current += sentence
    }
  }
  if (current.trim()) chunks.push(current.trim())
  return chunks.length > 0 ? chunks : [text]
}

// ── Traduction DeepL (prioritaire) ───────────────────────────

async function translateWithDeepl(
  text: string,
  targetLang: 'FR' | 'EN-US'
): Promise<string> {
  if (!config.deepl.apiKey) throw new Error('DEEPL_API_KEY non configurée')

  const response = await axios.post(
    `${config.deepl.baseUrl}/translate`,
    new URLSearchParams({
      auth_key:    config.deepl.apiKey,
      text,
      source_lang: 'AR',
      target_lang: targetLang,
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  )

  const translations = response.data?.translations as Array<{ text: string }>
  if (!translations?.[0]?.text) throw new Error('Réponse DeepL invalide')

  return translations[0].text
}

// ── Traduction GPT-4 (fallback 1) ────────────────────────────

async function translateWithGpt4(text: string, targetLang: 'fr' | 'en'): Promise<string> {
  const langLabel = targetLang === 'fr' ? 'French' : 'English'

  const response = await openai.chat.completions.create({
    model:       'gpt-4o',
    temperature: 0.2,
    messages: [
      {
        role: 'system',
        content: `You are a professional Islamic content translator specializing in Arabic to ${langLabel}.
Translate accurately and preserve Islamic terminology (e.g., Alhamdulillah, Insha'Allah, Mashallah).
Do NOT add commentary or interpretation. Translate only.`,
      },
      {
        role: 'user',
        content: `Translate this Arabic text to ${langLabel}:\n\n${text}`,
      },
    ],
  })

  return response.choices[0]?.message?.content?.trim() ?? ''
}

// ── Traduction Claude (fallback 2) ────────────────────────────

async function translateWithClaude(text: string, targetLang: 'fr' | 'en'): Promise<string> {
  const langLabel = targetLang === 'fr' ? 'French' : 'English'

  const response = await anthropic.messages.create({
    model:      'claude-3-5-haiku-20241022',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `Translate this Arabic Islamic text to ${langLabel}. Preserve Islamic terminology.
Output ONLY the translation, nothing else.\n\n${text}`,
      },
    ],
  })

  const block = response.content[0]
  if (block.type !== 'text') throw new Error('Réponse Claude invalide')
  return block.text.trim()
}

// ── Traducteur principal avec fallback ───────────────────────

async function translateText(
  text:       string,
  targetLang: 'fr' | 'en'
): Promise<{ text: string; service: 'deepl' | 'gpt4' | 'claude' }> {

  const deeplTarget = targetLang === 'fr' ? 'FR' : 'EN-US'

  // Découper si le texte est long
  const chunks = splitTextIntoChunks(text, 4000)
  const translatedChunks: string[] = []
  let service: 'deepl' | 'gpt4' | 'claude' = 'deepl'

  for (const chunk of chunks) {
    // 1. Essayer DeepL (prioritaire)
    if (config.deepl.apiKey) {
      try {
        translatedChunks.push(await translateWithDeepl(chunk, deeplTarget))
        service = 'deepl'
        continue
      } catch (err) {
        console.warn('  ⚠️  DeepL échoué, fallback GPT-4 :', (err as Error).message)
      }
    }

    // 2. Fallback GPT-4
    try {
      translatedChunks.push(await translateWithGpt4(chunk, targetLang))
      service = 'gpt4'
      continue
    } catch (err) {
      console.warn('  ⚠️  GPT-4 échoué, fallback Claude :', (err as Error).message)
    }

    // 3. Fallback Claude
    translatedChunks.push(await translateWithClaude(chunk, targetLang))
    service = 'claude'
  }

  return { text: translatedChunks.join(' '), service }
}

// ── Génération SRT bilingue depuis les segments ───────────────

function secondsToSrtTime(seconds: number): string {
  const h  = Math.floor(seconds / 3600)
  const m  = Math.floor((seconds % 3600) / 60)
  const s  = Math.floor(seconds % 60)
  const ms = Math.round((seconds % 1) * 1000)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`
}

async function generateTranslatedSrt(
  segments:    WhisperSegment[],
  targetLang:  'fr' | 'en',
  videoId:     string
): Promise<string> {
  const translatedSegments: string[] = []

  // Traduire par lots de 10 segments (optimisation coût API)
  const batchSize = 10
  for (let i = 0; i < segments.length; i += batchSize) {
    const batch = segments.slice(i, i + batchSize)
    // ⚠️  Texte arabe source READ ONLY — on traduit sans modifier l'original
    const batchText = batch.map(s => s.text).join('\n\n[SEP]\n\n')

    const { text: translated } = await translateText(batchText, targetLang)
    const translatedParts       = translated.split('[SEP]').map(t => t.trim())

    batch.forEach((seg, j) => {
      const tText = translatedParts[j] ?? ''
      translatedSegments.push([
        String(i + j + 1),
        `${secondsToSrtTime(seg.start)} --> ${secondsToSrtTime(seg.end)}`,
        tText,
        '',
      ].join('\n'))
    })
  }

  // Ajouter le disclaimer en entête du SRT
  const disclaimer = targetLang === 'fr'
    ? AUTO_TRANSLATION_META.disclaimer_fr
    : AUTO_TRANSLATION_META.disclaimer_en

  const header = [
    '0',
    '00:00:00,000 --> 00:00:03,000',
    disclaimer,
    '',
  ].join('\n')

  const srtContent = [header, ...translatedSegments].join('\n')

  // Sauvegarder le fichier SRT
  const dir     = path.join(config.processing.outputDir, videoId)
  await fse.ensureDir(dir)
  const srtPath = path.join(dir, `${videoId}_${targetLang}.srt`)
  await fse.writeFile(srtPath, srtContent, 'utf-8')

  console.log(`  📄 SRT généré : ${srtPath}`)
  return srtPath
}

// ── Pipeline de traduction d'une vidéo ───────────────────────

export async function translateVideo(params: {
  videoId:         string    // UUID en base
  youtubeVideoId:  string
  transcriptAr:    string    // ⚠️ READ ONLY
  segments?:       WhisperSegment[]
  targetLanguages: Array<'fr' | 'en'>
}): Promise<TranslationResult[]> {
  const { videoId, youtubeVideoId, transcriptAr, segments = [], targetLanguages } = params

  const results: TranslationResult[] = []

  for (const lang of targetLanguages) {
    console.log(`\n  🌐 Traduction AR → ${lang.toUpperCase()} : ${youtubeVideoId}`)

    try {
      // 1. Traduire le texte complet
      const { text: translatedText, service } = await translateText(transcriptAr, lang)

      // 2. Générer SRT si on a les segments
      let srtPath: string | undefined
      if (segments.length > 0) {
        srtPath = await generateTranslatedSrt(segments, lang, youtubeVideoId)
      }

      // 3. Sauvegarder en base
      // ⚠️  RÈGLE ABSOLUE : is_verified = FALSE — traduction auto non relue
      await saveTranslation({
        videoId,
        targetLang:      lang,
        translatedText,
        service,
        subtitlesSrtUrl: srtPath,
      })

      console.log(`  ✅ Traduction ${lang.toUpperCase()} sauvegardée (service: ${service})`)
      console.log(`     ⚠️  Marquée "non vérifiée" — relecture humaine requise`)

      results.push({
        videoId:         youtubeVideoId,
        sourceLang:      'ar',
        targetLang:      lang,
        translatedText,
        // ⚠️  Ces champs DOIVENT être true/false respectivement — JAMAIS inverser
        autoTranslated:  true,
        verified:        false,
        service,
        srtContent:      srtPath ? await fse.readFile(srtPath, 'utf-8') : '',
        processedAt:     new Date(),
      })
    } catch (err) {
      console.error(`  ❌ Erreur traduction ${lang} pour ${youtubeVideoId} :`, err)
    }
  }

  return results
}

// ── Traitement en lot ─────────────────────────────────────────

export async function translatePendingVideos(limit = 5): Promise<void> {
  const { getVideosWithoutTranslation } = await import('./db.js')

  for (const lang of ['fr', 'en'] as const) {
    const videos = await getVideosWithoutTranslation(lang, limit)

    if (videos.length === 0) {
      console.log(`Aucune vidéo en attente de traduction ${lang.toUpperCase()}.`)
      continue
    }

    console.log(`\n🌐 ${videos.length} vidéo(s) à traduire en ${lang.toUpperCase()}`)

    for (const video of videos) {
      try {
        await translateVideo({
          videoId:         video.id,
          youtubeVideoId:  video.id,    // fallback si pas d'ID YouTube distinct
          transcriptAr:    video.transcriptAr,
          targetLanguages: [lang],
        })
      } catch (err) {
        console.error(`  ❌ Erreur traduction ${video.id} :`, err)
      }
    }
  }
}
