// ============================================================
// lib/logger.ts — Utilitaire de logging pour les seeds
// ============================================================

export const colors = {
  reset:  '\x1b[0m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
  cyan:   '\x1b[36m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
}

export function log(msg: string)         { console.log(`${colors.cyan}ℹ${colors.reset}  ${msg}`) }
export function success(msg: string)     { console.log(`${colors.green}✅${colors.reset} ${msg}`) }
export function warn(msg: string)        { console.log(`${colors.yellow}⚠️${colors.reset}  ${msg}`) }
export function error(msg: string)       { console.error(`${colors.red}❌${colors.reset} ${msg}`) }
export function section(title: string)  {
  console.log(`\n${colors.bold}${colors.cyan}${'─'.repeat(50)}${colors.reset}`)
  console.log(`${colors.bold} 🌙 ${title}${colors.reset}`)
  console.log(`${colors.bold}${colors.cyan}${'─'.repeat(50)}${colors.reset}\n`)
}

export function progress(current: number, total: number, label: string) {
  const pct = Math.round((current / total) * 100)
  const bar = '█'.repeat(Math.floor(pct / 5)) + '░'.repeat(20 - Math.floor(pct / 5))
  process.stdout.write(`\r  [${bar}] ${pct}% — ${label}`)
  if (current === total) process.stdout.write('\n')
}

// Délai entre les requêtes API pour ne pas surcharger les serveurs
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Retry avec backoff exponentiel
export async function fetchWithRetry(
  url: string,
  maxRetries = 3,
  delayMs = 1000
): Promise<Response> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'saas-islam-seeds/1.0' }
      })
      if (res.ok) return res
      if (res.status === 429) {
        warn(`Rate limit (429) — attente ${delayMs * attempt}ms...`)
        await sleep(delayMs * attempt)
        continue
      }
      throw new Error(`HTTP ${res.status}: ${url}`)
    } catch (e) {
      if (attempt === maxRetries) throw e
      warn(`Tentative ${attempt}/${maxRetries} échouée — retry dans ${delayMs * attempt}ms`)
      await sleep(delayMs * attempt)
    }
  }
  throw new Error(`Impossible de fetcher après ${maxRetries} tentatives: ${url}`)
}
