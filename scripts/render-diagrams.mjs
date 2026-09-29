#!/usr/bin/env node
/* ============================================================
   Pre-renders every Mermaid diagram in topics/*.html to inline SVG.

     npm install          (once: Mermaid, Playwright and the Inter font)
     npm run diagrams     (after adding or editing a diagram)

   A diagram is written in a page as
       <div class="mermaid">flowchart LR ...</div>
   and this script replaces it with
       <div class="mermaid" data-diagram="HASH">
         <svg class="dg dg-light">…</svg><svg class="dg dg-dark">…</svg>
         <template class="mermaid-source">flowchart LR ...</template>
       </div>
   Edit the text inside <template> and run it again to redraw. HASH is the
   first 10 hex digits of the SHA-1 of the source; scripts/check-site.py
   fails when a source no longer matches its hash, so stale SVGs are caught.
   Pass --force to redraw every diagram.
   ============================================================ */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FORCE = process.argv.includes('--force');
const MIN_SCALE = 0.62; // wide charts scroll rather than shrink below this

const BLOCK = /<div class="mermaid"(?: data-diagram="([0-9a-f]+)")?>([\s\S]*?)(?:<template class="mermaid-source">([\s\S]*?)<\/template>\s*)?<\/div>/g;

const unescape = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const escape = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// Mermaid writes coordinates to 15 decimal places; one is plenty on screen
// and cuts the markup several times over. Also drop empty style attributes.
const compact = svg => svg
  // Always keep one decimal: an integer followed by '.5' would merge into one number.
  .replace(/-?\d+\.\d{2,}/g, n => (Math.round(parseFloat(n) * 10) / 10).toFixed(1))
  .replace(/ style=""/g, '');
export const hashOf = src => createHash('sha1').update(src, 'utf8').digest('hex').slice(0, 10);

function fontFace() {
  const dir = dirname(require.resolve('@fontsource/inter/package.json'));
  return [400, 500, 600, 700].map(w => {
    const data = readFileSync(join(dir, 'files', `inter-latin-${w}-normal.woff2`)).toString('base64');
    return `@font-face{font-family:Inter;font-weight:${w};src:url(data:font/woff2;base64,${data}) format('woff2')}`;
  }).join('\n');
}

async function main() {
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } });
  await page.setContent(`<!doctype html><style>${fontFace()} body{font-family:Inter}</style><div id="stage"></div>`);
  await page.addScriptTag({ path: require.resolve('mermaid/dist/mermaid.min.js') });
  await page.addScriptTag({ path: join(ROOT, 'scripts', 'diagram-theme.js') });
  await page.evaluate(() => document.fonts.ready);

  const render = (id, source, dark) => page.evaluate(async ({ id, source, dark, MIN_SCALE }) => {
    const { PALETTE, getThemeConfig, normaliseSource } = window.HSC_DIAGRAM;
    mermaid.initialize(getThemeConfig(dark));
    const { svg } = await mermaid.render(id, normaliseSource(source, dark ? PALETTE.dark : PALETTE.light));
    const stage = document.getElementById('stage');
    stage.innerHTML = svg;
    const el = stage.querySelector('svg');
    // Some node shapes (the rounded terminator) are drawn as hundreds of tiny
    // double-stroked segments. Resample each outline to a clean path.
    el.querySelectorAll('.label-container path').forEach(p => {
      if (p.getAttribute('d').length < 1200) return;
      const len = p.getTotalLength(), n = 96, pts = [];
      for (let i = 0; i <= n; i++) {
        const pt = p.getPointAtLength((len * i) / n);
        pts.push(`${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`);
      }
      p.setAttribute('d', `M${pts.join('L')}Z`);
    });
    // Refit the viewBox to what was drawn: Mermaid's own can clip edge nodes.
    // Sequence diagrams are the exception: their lifelines are drawn 2000px
    // long and cropped by Mermaid's viewBox, which is already correct.
    let w, h;
    if (/^\s*sequenceDiagram/.test(source)) {
      [, , w, h] = el.getAttribute('viewBox').split(/\s+/).map(Number);
    } else {
      const bb = el.getBBox(), pad = 12;
      w = bb.width + pad * 2;
      h = bb.height + pad * 2;
      el.setAttribute('viewBox', `${(bb.x - pad).toFixed(1)} ${(bb.y - pad).toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`);
    }
    el.removeAttribute('height');
    el.setAttribute('width', '100%');
    el.setAttribute('style', `max-width:${Math.ceil(w)}px;min-width:${Math.ceil(w * MIN_SCALE)}px`);
    el.setAttribute('class', `dg ${dark ? 'dg-dark' : 'dg-light'}`);
    el.setAttribute('role', 'img');
    el.removeAttribute('aria-roledescription');
    return el.outerHTML;
  }, { id, source, dark, MIN_SCALE }).then(compact);

  let drawn = 0, kept = 0;
  const files = readdirSync(join(ROOT, 'topics')).filter(f => f.endsWith('.html'));
  for (const file of files) {
    const path = join(ROOT, 'topics', file);
    const html = readFileSync(path, 'utf8');
    const slug = file.replace(/\.html$/, '');
    const jobs = [];
    let n = 0;
    html.replace(BLOCK, (whole, hash, body, tmpl) => {
      const source = unescape(tmpl != null ? tmpl : body).trim();
      jobs.push({ whole, hash, source, n: n++ });
      return whole;
    });
    if (!jobs.length) continue;

    let out = html;
    for (const job of jobs) {
      const h = hashOf(job.source);
      if (!FORCE && job.hash === h) { kept++; continue; }
      const id = `dg-${slug}-${job.n + 1}`;
      const light = await render(`${id}-l`, job.source, false);
      const dark = await render(`${id}-d`, job.source, true);
      const block = `<div class="mermaid" data-diagram="${h}">\n${light}\n${dark}\n<template class="mermaid-source">\n${escape(job.source)}\n</template>\n</div>`;
      out = out.replace(job.whole, () => block);
      drawn++;
    }
    if (out !== html) writeFileSync(path, out);
  }
  await browser.close();
  console.log(`Diagrams: ${drawn} drawn, ${kept} unchanged.`);
}

main().catch(e => { console.error(e); process.exit(1); });
