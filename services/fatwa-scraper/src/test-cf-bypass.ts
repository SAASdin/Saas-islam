// Test CF bypass v4 — attente cookie cf_clearance + long timeout
import { chromium } from 'patchright';
import * as fs from 'fs';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function waitForClearanceCookie(page: import('patchright').Page, maxMs = 45000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const cookies = await page.context().cookies();
    const cfClearance = cookies.find(c => c.name === 'cf_clearance');
    if (cfClearance) {
      console.log(`   ✅ cf_clearance obtenu: ${cfClearance.value.substring(0, 40)}...`);
      return true;
    }
    // Vérifier aussi si la page a changé (plus de titre CF)
    const title = await page.title();
    const notCF = !title.includes('moment') && title !== 'لحظة…' && title !== '' && !title.includes('Just a moment');
    if (notCF) {
      console.log(`   ✅ Page changée: ${title}`);
      return true;
    }
    await page.waitForTimeout(2000);
  }
  return false;
}

async function main() {
  console.log('🌙 Test CF bypass v4 — attente cookie cf_clearance\n');

  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: false, // headful pour passer le managed challenge
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
    ],
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
    locale: 'ar-SA',
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  // Étape 1 : page principale → obtenir cf_clearance
  console.log('1. Page principale shamela.ws...');
  await page.goto('https://shamela.ws', { waitUntil: 'networkidle', timeout: 30000 });
  console.log(`   Titre: ${await page.title()}`);
  
  const cookies1 = await context.cookies();
  console.log('   Cookies CF:', cookies1.filter(c => c.name.startsWith('cf')).map(c => `${c.name}=${c.value.substring(0, 20)}...`));
  await page.waitForTimeout(3000);

  // Étape 2 : page /book/12416 — attendre cf_clearance (45s max)
  console.log('\n2. /book/12416 (Ibn Baz) — attente 45s...');
  await page.goto('https://shamela.ws/book/12416', { waitUntil: 'domcontentloaded', timeout: 30000 });
  const resolved2 = await waitForClearanceCookie(page, 45000);
  console.log(`   Titre: ${await page.title()} | Résolu: ${resolved2}`);
  
  const cookies2 = await context.cookies();
  const cfClearance = cookies2.find(c => c.name === 'cf_clearance');
  console.log('   cf_clearance:', cfClearance ? 'PRÉSENT' : 'ABSENT');

  if (resolved2) {
    const html2 = await page.content();
    fs.writeFileSync('/tmp/shamela_book.html', html2);
    console.log(`   HTML: ${html2.length} chars`);
    
    // Structure de la page
    const links = await page.$$eval('a', els => 
      els.filter(el => el.getAttribute('href')?.includes('/book/')).slice(0, 10).map(el => ({
        href: el.getAttribute('href'),
        text: el.textContent?.trim().substring(0, 80)
      }))
    ).catch(() => []);
    console.log('   Liens /book/:', links.slice(0, 5));
  }

  // Étape 3 : /book/12416/1 avec cookies existants
  console.log('\n3. /book/12416/1 — attente 45s...');
  await page.waitForTimeout(2000);
  await page.goto('https://shamela.ws/book/12416/1', { waitUntil: 'domcontentloaded', timeout: 30000 });
  const resolved3 = await waitForClearanceCookie(page, 45000);
  const title3 = await page.title();
  console.log(`   Titre: ${title3} | Résolu: ${resolved3}`);

  if (resolved3 && !title3.includes('لحظة')) {
    const html3 = await page.content();
    fs.writeFileSync('/tmp/shamela_reader.html', html3);
    console.log(`   ✅ HTML lecteur: ${html3.length} chars`);
    
    const textNodes = await page.$$eval('*', els => {
      const arabic = /[\u0600-\u06FF]/;
      return els
        .filter(el => arabic.test(el.textContent ?? '') && el.children.length === 0 && (el.textContent?.trim().length ?? 0) > 50)
        .slice(0, 5)
        .map(el => ({ tag: el.tagName, class: el.className, text: el.textContent?.trim().substring(0, 150) }));
    }).catch(() => []);
    console.log('   Texte arabe trouvé:');
    textNodes.forEach(n => console.log(`   - ${n.tag}.${n.class}: ${n.text}`));
  } else {
    const html3 = await page.content();
    fs.writeFileSync('/tmp/shamela_debug3.html', html3);
    console.log('   ❌ Toujours bloqué — HTML sauvegardé /tmp/shamela_debug3.html');
    
    // Afficher les cookies finaux
    const finalCookies = await context.cookies();
    console.log('   Cookies finaux:', finalCookies.map(c => c.name));
  }

  await browser.close();
  console.log('\n✅ Test terminé');
}

main().catch(console.error);
