#!/usr/bin/env node
/*
 * Layout check: no sideways scroll at phone, tablet and desktop widths, and the shared page frame holds
 * (the bar, hero, home sections, topic header, page and footer share one left and right edge on a wide screen).
 *
 *     node scripts/check-layout.mjs            every page, five widths, light and dark
 *     node scripts/check-layout.mjs --quick    the home page and three topic pages, three widths, light only
 *
 * It serves this folder on a free local port and drives Chromium with Playwright, so it needs Playwright
 * (a global install such as /opt/node22/lib/node_modules/playwright is found automatically; never run
 * `playwright install`). It is not part of CI: run it before a pull request that touches layout or styling.
 * The same file is in the sister site's scripts/ folder; keep the two identical.
 */
import { createServer } from 'node:http';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const QUICK = process.argv.includes('--quick');
const WIDTHS = QUICK ? [390, 820, 1440] : [375, 390, 820, 1024, 1440];
const THEMES = QUICK ? ['light'] : ['light', 'dark'];
const WIDE = 1440;                       // the frame's edges are compared at this width
const EDGE_TOLERANCE = 1;                // pixels
// Containers that take their width from --frame (see "Shared page frame" in the theme CSS)
const FRAME = ['.nav-inner', '.hero-inner', '.how-inner', '.main-content', '.topic-header-inner', '.page-layout',
               '.glossary-wrapper', '.footer-inner', '.footer-bottom', '.footer-more'];

function loadPlaywright() {
  const require = createRequire(import.meta.url);
  for (const id of ['playwright', '/opt/node22/lib/node_modules/playwright']) {
    try { return require(id); } catch { /* try the next */ }
  }
  console.error('Playwright was not found. Install it (npm i -D playwright) or point to a global copy; never run "playwright install".');
  process.exit(2);
}

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
               '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.txt': 'text/plain', '.xml': 'application/xml' };
function serve() {
  const server = createServer((req, res) => {
    let path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (path.endsWith('/')) path += 'index.html';
    const file = join(ROOT, path);
    if (!file.startsWith(ROOT) || !existsSync(file) || !statSync(file).isFile()) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' });
    res.end(readFileSync(file));
  });
  return new Promise(ok => server.listen(0, '127.0.0.1', () => ok(server)));
}

// This site's theme storage key (ec-theme or hsc-theme), read from js/main.js
const themeKey = /THEME_KEY\s*=\s*'([^']+)'/.exec(readFileSync(join(ROOT, 'js', 'main.js'), 'utf8'))?.[1];
if (!themeKey) { console.error('Could not find THEME_KEY in js/main.js'); process.exit(2); }

const topics = readdirSync(join(ROOT, 'topics')).filter(f => f.endsWith('.html')).sort();
const pages = QUICK ? ['index.html', ...topics.slice(0, 2).map(f => `topics/${f}`), 'topics/glossary.html']
                    : ['index.html', ...topics.map(f => `topics/${f}`)];

const { chromium } = loadPlaywright();
const server = await serve();
const base = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch();
const problems = [];
let loads = 0;

for (const theme of THEMES) {
  for (const width of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: theme, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.addInitScript(([k, t]) => { try { localStorage.setItem(k, t); } catch { /* storage may be blocked */ } }, [themeKey, theme]);
    for (const p of pages) {
      await page.goto(base + p, { waitUntil: 'load' });
      await page.waitForTimeout(350);
      loads++;
      const r = await page.evaluate(([frame, wide]) => {
        const de = document.documentElement;
        const out = { over: de.scrollWidth - de.clientWidth, culprit: '', edges: [] };
        if (out.over > 0) {
          for (const el of document.querySelectorAll('body *')) {
            const b = el.getBoundingClientRect();
            if (b.width > 0 && b.right > de.clientWidth + 1) { out.culprit = `${el.tagName.toLowerCase()}.${typeof el.className === 'string' ? el.className.split(' ')[0] : ''}`; break; }
          }
        }
        if (innerWidth === wide) {
          for (const sel of frame) {
            const el = document.querySelector(sel);
            if (!el) continue;
            const b = el.getBoundingClientRect();
            out.edges.push([sel, Math.round(b.left), Math.round(innerWidth - b.right)]);
          }
        }
        return out;
      }, [FRAME, WIDE]);
      const where = `${p} @${width}px ${theme}`;
      if (r.over > 0) problems.push(`${where}: scrolls sideways by ${r.over}px${r.culprit ? ` (first culprit: ${r.culprit})` : ''}`);
      if (r.edges.length) {
        const [, left0] = r.edges.find(e => e[0] === '.nav-inner') || r.edges[0];
        for (const [sel, left, right] of r.edges) {
          if (Math.abs(left - left0) > EDGE_TOLERANCE) problems.push(`${where}: ${sel} starts at ${left}px, the bar at ${left0}px`);
          if (Math.abs(left - right) > EDGE_TOLERANCE) problems.push(`${where}: ${sel} sits ${left}px from the left but ${right}px from the right`);
        }
      }
    }
    await ctx.close();
  }
}
await browser.close();
server.close();

if (problems.length) {
  console.log(`${problems.length} layout problem(s):`);
  for (const m of problems) console.log('  ✗', m);
  process.exit(1);
}
console.log(`✓ Layout holds (${loads} page loads: ${pages.length} pages, ${WIDTHS.join('/')} px, ${THEMES.join(' and ')})`);
