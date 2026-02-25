// ============================================================
// run_all.ts — Orchestrateur de tous les seeds
// Exécuter dans cet ordre :
//   1. npm run db:migrate   (migrations SQL)
//   2. npm run seed:all     (ce fichier)
//   3. npm run seed:verify  (vérification intégrité)
// ⚠️  NE PAS EXÉCUTER EN PRODUCTION SANS VALIDATION MOHA + BILAL
// ============================================================

import 'dotenv/config'
import { execSync } from 'child_process'
import { section, success, error, log, warn } from './lib/logger'

function run(script: string, label: string): boolean {
  section(label)
  try {
    execSync(`npx tsx ${script}`, { stdio: 'inherit', cwd: process.cwd() })
    success(`${label} terminé`)
    return true
  } catch (e) {
    error(`${label} échoué : ${e}`)
    return false
  }
}

async function main(): Promise<void> {
  section('🌙 SAAS-ISLAM — IMPORT COMPLET ZONE SACRÉE')
  warn('Ce script importe TOUTES les données islamiques (Coran + Hadiths)')
  warn('Validé par Moha ✅ et Bilal ✅ avant exécution')
  warn('Durée estimée : 15-30 minutes (API rate limiting)')
  console.log()

  // Vérifier que DATABASE_URL est défini
  if (!process.env.DATABASE_URL) {
    error('DATABASE_URL non défini — copier .env.example en .env et remplir')
    process.exit(1)
  }

  log(`Base de données : ${process.env.DATABASE_URL.replace(/:\/\/.*@/, '://***@')}`)
  console.log()

  const steps = [
    { script: 'database/seeds/01_seed_quran.ts',  label: 'Import Coran (114 sourates + 6236 versets + traductions)' },
    { script: 'database/seeds/02_seed_hadiths.ts', label: 'Import Hadiths (8 collections)' },
    { script: 'database/seeds/verify_integrity.ts', label: 'Vérification intégrité finale' },
  ]

  let allOk = true
  for (const step of steps) {
    const ok = run(step.script, step.label)
    if (!ok) {
      allOk = false
      error(`ARRÊT : l'étape "${step.label}" a échoué`)
      break
    }
  }

  if (allOk) {
    section('✅ IMPORT COMPLET RÉUSSI')
    success('Zone sacrée peuplée et vérifiée')
    success('La plateforme est prête')
    log('Lancer l\'app : cd apps/quran-app && npm run dev')
  } else {
    section('❌ IMPORT INCOMPLET')
    error('Vérifier les erreurs ci-dessus et relancer le script')
    process.exit(1)
  }
}

main()
