# Content brief for page writers (shared by every content agent)

You are writing one page of **EntComp Notes**, a free study-notes site for NSW HSC **Enterprise Computing** (NESA Enterprise Computing 11–12 Syllabus, 2022). Readers are Year 11–12 students (16–18) and their teachers. Project root: `/home/user/HSC_EnterpriseComputing`. Read `CLAUDE.md` and `CONTRIBUTING.md` there first.

## Sources of truth (read before writing)
- `resources/nesa-syllabus-content.md` — verbatim NESA focus areas, subheadings, dot points, "Including" lists, outcomes.
- `resources/ec-course-specifications.md` — NESA Course Specifications (integral to the course; examinable). Diagram notations, SQL keywords, spreadsheet functions, implementation and testing methods, application software features. Page renders are in `resources/spec-pages/*.png` (view with the Read tool). Use NESA's symbols and terminology exactly.
- `resources/nesa-teaching-advice.md` — NESA teaching advice per focus area (use it to judge depth and emphasis).
- `resources/ec-syllabus-glossary.md` — NESA's course glossary (81 terms). Use NESA's meanings.
- `resources/ec-assessment.md` — exam format: 80 marks, 2 h 30 min, online, objective + short-answer items; 2025 HSC questions that used DFDs, SQL, spreadsheet formulas, screen designs, Gantt charts.
- The Software Engineering sister site (`/home/user/HSC_SoftwareEngineering/topics/*.html`) shows the expected depth, tone and component use. Read one of its topic pages before you start. Never modify it.

## Hard rules
1. **Never change the syllabus scaffolding.** The `.part-block`/`part-name`, each section's `<p class="syllabus-concept">`, and `<ul class="syllabus-including">` are verbatim NESA text generated from the syllabus file; `scripts/check-site.py` fails if they change. You may improve the `<h2>` heading wording and the outcome codes in `.outcome-subtitle` (only codes from this focus area's outcome list), but keep section ids unless you also fix the sidebar TOC.
2. **Replace every `<!-- CONTENT: … -->` placeholder** (and its placeholder paragraph) with real content. `python3 scripts/check-site.py --strict` must pass for your page at the end.
3. **UK/Australian English** (organisation, visualisation, analyse, licence (noun), programme only for TV, program for software). Inclusive language; no gendered pronouns for hypothetical people.
4. **Accuracy over flourish.** No invented statistics, dates, quotes, company claims or legislation. If you are not certain of a figure, describe the idea without the number. Australian context first: Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs), Notifiable Data Breaches (NDB) scheme, OAIC, Cybercrime Act 2001, Spam Act 2003, Copyright Act 1968, Security of Critical Infrastructure Act 2018, Cyber Security Act 2024 (ransomware payment reporting), Privacy and Other Legislation Amendment Act 2024 (statutory tort for serious invasions of privacy), ASD's ACSC and the Essential Eight, eSafety Commissioner, Consumer Data Right, Australian Consumer Law. Describe well-documented real events carefully and factually (e.g. the 2022 Optus and Medibank breaches) without speculative detail.
5. **Indigenous content** (ICIP, Indigenous Data Sovereignty, CARE principles, Maiam nayri Wingara principles, cultural responsibility): be respectful, accurate and specific; refer to Aboriginal and Torres Strait Islander Peoples; do not invent protocols.
6. **Depth follows the NESA verb.** *Identify/outline/describe*: concise and precise. *Explain/examine/compare*: causes, effects, relationships, with examples. *Investigate/evaluate/assess/research*: several perspectives, criteria, pros and cons, a judgement. *Apply/use/develop/design/implement/configure*: a worked, step-by-step example students could reproduce (formulas, SQL, diagrams, configuration steps). Aim for roughly 250–700 words per section, more for the heavy practical dot points. Cover EVERY "Including" item under its own `<h3>`.
7. **No external JS/CSS libraries or CDNs.** Vanilla HTML/CSS/JS only. Reuse existing CSS classes (see below). If an interactive widget truly needs styles, put them in `css/pages/<slug>.css` and scripts in `js/pages/<slug>.js`, linked only from your page, and use the theme's CSS custom properties (`var(--primary)`, `var(--surface)`, `var(--border)`, `var(--text-primary)` …) so light and dark mode both work. Respect `prefers-reduced-motion`. Must work at 375px wide.
8. **Only touch your own files**: your page `topics/<slug>.html`, `js/quizzes/<slug>.js`, optional `css/pages/<slug>.css` and `js/pages/<slug>.js`, new prefixed scenes `js/anims/<prefix>-*.js`, and `reference/glossary-terms/<slug>.json`. Do NOT edit shared files (css/styles.css, css/theme.css, css/anim.css, js/anim.js, js/main.js, existing js/anims scenes, scripts/*, index.html, other pages). If you think a shared file needs a change, say so in your final report instead. Do not run `git commit`.
9. Links: external links only to reputable, stable sources (NESA, OAIC, ASD/ACSC cyber.gov.au, eSafety, legislation.gov.au, W3C/WCAG, ABS, AIATSIS, IP Australia, Australian Government sites, well-known standards bodies, vendor docs). Check each one returns HTTP 200 with `curl -sS -o /dev/null -w "%{http_code}" -L <url>` before using it. Video links: only YouTube videos whose oEmbed check succeeds (`curl -s "https://www.youtube.com/oembed?url=<video-url>&format=json"` returns JSON with a title you have checked is relevant), from reputable channels; at most one `video-box` per part; they are optional.

## Components (look at the SE page for exact markup)
- Callouts: `<div class="callout tip|info|warning|danger|success|assessor">` with a leading `<strong>Label</strong>`. Use `assessor` for HSC exam guidance (e.g. how a question on this dot point is likely to be phrased with NESA command verbs, common mistakes, what a full-mark answer includes). Aim for at least one exam-focused callout per part.
- Key terms: `<div class="key-terms"> with one <div class="key-term-item"> per term (copy the exact markup from topics/toolkit.html)`.
- Tables: `<div class="table-wrap"><table>…</table></div>` (use for comparisons such as IaaS/PaaS/SaaS, cloud types, levels of measurement, inference-engine techniques).
- Scenarios: `<div class="callout info"><strong>Scenario</strong> …</div>` using realistic Australian enterprises (a regional hospital, a Service NSW-style agency, a farm co-op, a local retailer, a school canteen, a logistics firm, a start-up).
- Code: `<div class="code-block"><pre><code class="language-sql">…</code></pre></div>` (SQL must use only the NESA course-spec SQL syntax/keywords unless flagged as extension).
- Figures: every diagram goes in the standard figure markup:
  ```html
  <figure class="figure">
    <figcaption class="figure-head">
      <p class="figure-kicker"><span class="figure-kind">System flowchart</span></p>
      <h4 class="figure-title">Title</h4>
      <p class="figure-lead">One sentence on what it shows.</p>
    </figcaption>
    <div class="figure-canvas"> <svg …>…</svg> </div>
    <div class="figure-notes">
      <div><h5>What to notice</h5><ul><li>…</li></ul></div>
      <p class="figure-try"><strong>Try this</strong>A short task using the diagram.</p>
    </div>
  </figure>
  ```
  **Draw every diagram with the site's diagram kit — the same tools as the Software Engineering site — never hand-written SVG.** Read `.claude/skills/paper-diagrams.md` (still diagrams) and `.claude/skills/add-animation.md` (animated diagrams) first, then look at `reference/diagram-gallery.html` (serve the site and open it) for every available scene and the NESA course-spec reference drawings.
  - A still diagram: `<div class="figure-canvas figure-canvas--still"><div class="anim" data-anim="<name>"></div></div>`, with the drawing in `js/anims/<name>.js` (`still: true`). An animated diagram (for processes that unfold over time, or "what if" comparisons): `<div class="figure-canvas figure-canvas--anim"><div class="anim" data-anim="<name>"></div></div>` with beats, captions and a transcript as the skill describes. The page must link `../css/anim.css` and `../js/anim.js` once (check-site enforces it).
  - DFDs and structure charts: `js/nesa-diagrams.js` with data in `js/nesa-diagram-data.js` (`<div class="nesa-diagram" data-diagram="key"></div>`), or the kit if the skill says so. Mermaid (`npm run diagrams`) only where the skill allows it.
  - **Reuse before you draw**: if a ported or spec scene already fits (e.g. `packets`, `https`, `gantt-project`, `implementation-methods`, `spec-sysflow-doctor`), use it. New scene files must be prefixed with your page's quiz prefix (`im-`, `net-`, `cyber-`, `ds-`, `dv-`, `is-`, `ep-`, `tk-`, `pg-`, `ex-`) so agents never collide; draw new DFDs as diagram-kit scenes `js/anims/<prefix>-dfd-*.js` using the kit's circle, entity and open-ended store shapes with curved labelled flows (see `js/anims/tk-dfd-canteen-l0.js` for a worked example); do NOT create DFD data files — check-site only reads js/nesa-diagram-data.js.
  - **Use the exact NESA Course Specification notation** the kit provides (system flowchart: paper document, process, direct access storage, online display, manual operation, telecommunications link, online input, magnetic tape, cloud; DFD: circle process, open-ended data store, external entity square, labelled curved flows; flowcharts use ONLY NESA's four EC flowchart symbols — input/output, terminator, process, decision (no subprogram) — with START/END terminators and labelled decision exits; decision trees, storyboards, network diagrams, weighted graphs, Gantt charts and schemas as the spec draws them). No emoji inside diagrams; text at least 13px; full `alt` text.
  - Screenshot every figure you add in light and dark mode and at 390px, and fix anything cramped or unreadable.
- Quizzes: at the end of each part there is `<div class="quiz" data-quiz="<prefix>-<N>">`. In `js/quizzes/<slug>.js`, replace the sample question with **5 good multiple-choice questions per part** in the existing format `{ q, options: [4 strings], answer: <index>, why }`. Mix recall and application (scenario) questions in the style of HSC objective items; plausible distractors; vary the correct index.
- Glossary: write `reference/glossary-terms/<slug>.json` — an array of 10–25 keywords from your page not already in `topics/glossary.html`: `{"id": "term-kebab-name", "name": "Display Name", "topics": ["<topic key>"], "definition": "One precise sentence.", "example": "One concrete example."}`. Prefer NESA's definition where `resources/ec-syllabus-glossary.md` has the term. Topic keys: im, net, cyber, ds, dv, is, ep, toolkit, project. The lead merges these.

## Intro and part breakouts
Fill the `topic-breakout` intro ("Why this matters now": 2 short paragraphs + one "Try this as you learn" question) and each part's short breakout (2 sentences + a question), in the same tone as the SE site: direct, concrete, relevant to a 17-year-old's life. Also write the header description paragraph and the `<meta name="description">`/OG/Twitter descriptions (120–160 characters).

## Testing (must do before reporting)
1. `cd /home/user/HSC_EnterpriseComputing && python3 scripts/check-site.py --strict 2>&1 | grep -i "<slug>"` → no errors for your page (other pages may still have placeholders; ignore those). Also `node -e "require('./js/quizzes/<slug>.js')"` style syntax check (e.g. `node --check js/quizzes/<slug>.js`) and `python3 -m json.tool reference/glossary-terms/<slug>.json`.
2. Serve on YOUR port (given in your task) with `python3 -m http.server <port>` (run in background) and screenshot your page with Playwright (`const { chromium } = require('/opt/node22/lib/node_modules/playwright')`; never run `playwright install`), full page, at 1400px light, 1400px dark (`document.documentElement.setAttribute('data-theme','dark')` after load) and 390px light. Look at the PNGs with the Read tool (full-page images may be very tall: also clip screenshots of each figure). Fix overflow, unreadable diagrams, broken layout. Check `document.documentElement.scrollWidth <= 390` at 390px and that there are no console errors other than Google Fonts certificate errors. Save screenshots under `reference/screens/<slug>/`.
3. Final report (under 300 words): sections written, figures drawn (with notation used), interactive elements, quiz count, glossary terms count, any facts you were unsure of and left out, any shared-file changes you recommend.


## Lessons from earlier pages
- Never run `rm -rf` on shared folders (js/pages, css/pages, js/anims): other agents' files live there. Delete only files you created.
- Several agents work at once: only edit your own files; re-run `python3 scripts/site-chrome.py` is fine (it rewrites ?v= hashes) but don't hand-edit other pages.
