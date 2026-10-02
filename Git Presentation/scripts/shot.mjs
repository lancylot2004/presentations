// Screenshot slides from the running dev server, for visual checks.
//   node scripts/shot.mjs <out-dir> <slide-spec>...
// where a slide spec is a route suffix, e.g. "12" or "12?clicks=3".
import { chromium } from 'playwright-chromium'

const out = process.argv[2]
const targets = process.argv.slice(3)

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 })
const errors = []
page.on('pageerror', e => errors.push(String(e)))
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })

for (const t of targets) {
  await page.goto(`http://localhost:3030/${t}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(900)
  const name = t.replace(/[^\w]+/g, '_')
  await page.screenshot({ path: `${out}/${name}.png` })
  console.log('shot', name)
}

if (errors.length) console.log('PAGE ERRORS:\n' + [...new Set(errors)].join('\n'))
await browser.close()
