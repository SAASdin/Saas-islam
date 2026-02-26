// tests/setup.ts — Initialisation globale des tests
import 'dotenv/config'

// Vérifier que DATABASE_URL est défini avant de lancer les tests DB
if (!process.env.DATABASE_URL) {
  console.warn(
    '⚠️  DATABASE_URL non défini — les tests nécessitant la DB seront skippés.\n' +
    '   Créez un fichier .env avec DATABASE_URL pour activer tous les tests.'
  )
}
