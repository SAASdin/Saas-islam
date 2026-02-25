// ============================================================
// index.ts — Point d'entrée du service YouTube Scraper
//
// Modes :
//   npm run worker    → Lance les workers BullMQ en continu
//   npm run scrape    → Scrape les playlists configurées
//   npm run transcribe → Transcrit les vidéos en attente
//   npm run translate  → Traduit les vidéos transcrites
// ============================================================

import 'dotenv/config'
import { checkDbConnection } from './db.js'
import { startAllWorkers, getQueueStats, enqueuePlaylistScrape } from './queue.js'
import { KNOWN_CHANNELS } from './config.js'

async function main() {
  console.log('🌙 NoorApp — YouTube Scraper Service')
  console.log('=====================================')

  // Vérifier la connexion DB
  await checkDbConnection()

  const mode = process.argv[2] ?? 'worker'

  switch (mode) {
    case 'worker': {
      console.log('\n🚀 Mode : Workers BullMQ')
      startAllWorkers()

      // Afficher les stats toutes les 30s
      setInterval(async () => {
        const stats = await getQueueStats()
        console.log('\n📊 Stats queues :', JSON.stringify(stats, null, 2))
      }, 30_000)
      break
    }

    case 'scrape-all': {
      console.log('\n🎬 Mode : Scrape toutes les playlists connues')

      for (const channel of KNOWN_CHANNELS.filter(c => c.verified)) {
        for (const playlistId of channel.playlistIds) {
          const url = `https://www.youtube.com/playlist?list=${playlistId}`
          await enqueuePlaylistScrape(url)
          console.log(`  ✅ Enqueued : ${channel.name} — ${playlistId}`)
        }
      }

      console.log('\nJobs ajoutés. Lancez "npm run worker" pour traiter.')
      process.exit(0)
      break
    }

    case 'stats': {
      const stats = await getQueueStats()
      console.log('\n📊 Stats queues :')
      console.log(JSON.stringify(stats, null, 2))
      process.exit(0)
      break
    }

    default: {
      console.log(`Mode inconnu : ${mode}`)
      console.log('Modes disponibles : worker, scrape-all, stats')
      process.exit(1)
    }
  }
}

main().catch(err => {
  console.error('❌ Erreur fatale :', err)
  process.exit(1)
})
