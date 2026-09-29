#!/usr/bin/env python3
"""Generate a page skeleton from the NESA syllabus, deterministically.

    python3 scripts/scaffold-page.py <slug> [--force]
    python3 scripts/scaffold-page.py --all [--force]

Focus-area pages (interactive-media, networking-systems, cybersecurity, data-science,
data-visualisation, intelligent-systems, enterprise-project) are built from
resources/nesa-syllabus-content.md plus scripts/page_specs.py:

  * head (title, description, canonical, Open Graph / Twitter, JSON-LD breadcrumbs,
    favicon, ec-theme init, css links) and the navigation, mobile menu and footer
    shells (site-chrome.py fills those),
  * topic header: breadcrumb, icon and h1, description, year / hours / outcome pills,
    and the Curriculum aligned KPI card,
  * a sidebar contents list, one entry per section,
  * a topic introduction, then for every NESA subheading a part banner and part
    introduction, and for every dot point a <section> holding the heading, outcome
    codes, the dot point verbatim (leading verb in bold), its "Including" list and a
    <!-- CONTENT: ... --> placeholder,
  * a quiz placeholder at the end of each part, and the script tags.

The Resources pages toolkit, project-guide and example-project are generated as short
"Coming soon" pages until their content is written. glossary.html and resources.html
are not generated here (see scripts/build-glossary.py and scripts/build-resources.py).

It also creates js/quizzes/<slug>.js with one sample question per quiz key if that file
does not exist yet. It never overwrites a quiz bank.

Without --force it refuses to overwrite an existing page: content writers edit these
pages by hand afterwards, and regenerating would discard their work.
"""
import html
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'scripts'))
import page_shell as shell  # noqa: E402
from page_specs import SPECS  # noqa: E402
from restructure import dot_point_html, load_area_outcomes, paired_spec  # noqa: E402

chrome = shell.chrome
HOURS = {11: 40, 12: 30}
YEAR_LABEL = {11: 'Preliminary', 12: 'HSC'}
CONTENT_TODO = 'CONTENT'

STUBS = {
    'toolkit': ('The diagrams, spreadsheet features, SQL and design tools the syllabus asks you to use, explained step by step: '
                'data flow diagrams, flowcharts, decision trees, dashboards and relational database design.'),
    'project-guide': ('How to choose and run a project management approach: waterfall, agile, prototyping, end-user development '
                      'and outsourcing, plus Gantt charts, process diaries and implementation planning.'),
    'example-project': ('A worked enterprise project from problem definition to evaluation, with a live dashboard you can '
                        'explore in the browser.'),
}


def e(s):
    return html.escape(s, quote=False)


def outcome_range(codes):
    """['EC-12-01', ...] -> 'EC-12-01 to 08, 10, 11': runs collapsed, prefix shown once."""
    nums = sorted(int(c[-2:]) for c in codes)
    prefix = codes[0][:-2]
    runs, start, prev = [], nums[0], nums[0]
    for n in nums[1:]:
        if n == prev + 1:
            prev = n
            continue
        runs.append((start, prev))
        start = prev = n
    runs.append((start, prev))
    parts = []
    for a, b in runs:
        if a == b:
            parts.append(f'{a:02d}')
        elif b == a + 1:
            parts.append(f'{a:02d}, {b:02d}')
        else:
            parts.append(f'{a:02d} to {b:02d}')
    return prefix + ', '.join(parts)


def quiz_bank(slug, spec, pairs):
    prefix = spec['quiz']
    names = [name for name, _ in pairs]
    lines = [f'/* Quiz bank for {spec["title"]} (topics/{slug}.html).',
             f'   One entry per data-quiz key on the page: {", ".join(f"{prefix}-{i}" for i in range(1, len(names) + 1))}.',
             '   Each question: { q: "…", options: ["…", "…", "…"], answer: <index of the right option>, why: "…" }.',
             '   The samples below only prove the machinery works: replace each with 4 to 6 real questions. */',
             "window.HSC_QUIZZES = Object.assign(window.HSC_QUIZZES || {}, {"]
    for i, name in enumerate(names, 1):
        opts = [n for n in names]
        if len(opts) < 3:
            opts = opts + ['Neither of these']
        opts = opts[:4] if len(opts) > 4 else opts
        if name not in opts:
            opts[-1] = name
        ans = opts.index(name)
        js = lambda t: "'" + t.replace("\\", "\\\\").replace("'", "\\'") + "'"
        lines += [f'  // {CONTENT_TODO}: replace this sample with 4 to 6 questions on part {i} ({name}).',
                  f"  '{prefix}-{i}': [",
                  f"    {{ q: {js('Sample question: which NESA part of this topic does this quiz belong to?')},",
                  f"      options: [{', '.join(js(o) for o in opts)}],",
                  f"      answer: {ans},",
                  f"      why: {js('This placeholder shows the quiz machinery working. It belongs to Part ' + str(i) + ', ' + name + '.')} }},",
                  '  ],']
    lines.append('});')
    return '\n'.join(lines) + '\n'


def topic_page(slug, force):
    spec = SPECS[slug]
    pairs = paired_spec(slug)                  # fails loudly if the syllabus and spec disagree
    year = spec['year']
    title = spec['title']
    summary = chrome.PAGES[slug][2]
    dot_points = sum(len(rows) for _, rows in pairs)
    part_names = [name for name, _ in pairs]
    codes = load_area_outcomes()[spec['focus_area']]
    rng = outcome_range(codes)
    hours = HOURS[year]
    yr = f'yr{year}'

    plist = '; '.join(part_names[:-1]) + f'; and {part_names[-1]}' if len(part_names) > 1 else part_names[0]
    description = (f'HSC Enterprise Computing notes on {title} ({summary}). '
                   f'NESA NSW Year {year} {YEAR_LABEL[year]} syllabus, dot point by dot point.')
    desc_note = (f'<!-- {CONTENT_TODO}: rewrite the meta description (and the two social descriptions above) in 120 to 160 characters. -->')
    lead = (f'Notes for the NESA focus area <strong>{e(spec["focus_area"])}</strong>, following the syllabus in order: '
            f'{e(plist)}.')

    toc, body = [], []
    n = 0
    for pi, (name, rows) in enumerate(pairs, 1):
        toc.append(f'        <li class="sidebar-label">Part {pi} — {e(name)}</li>')
        body.append(f'''        <!-- ═══════════════════════════════════════════════════════ -->
        <!--  {name.upper():<54}-->
        <!-- ═══════════════════════════════════════════════════════ -->
        <div class="part-block">
          <span class="part-number">Syllabus Part {pi}</span>
          <span class="part-name">{e(name)}</span>
        </div>

        <aside class="{yr} topic-breakout subtopic-breakout" aria-label="Part introduction">
          <!-- {CONTENT_TODO}: part introduction. One short paragraph on what this part covers, then a closing question in .breakout-question. -->
          <p>This part covers {len(rows)} NESA dot point{'s' if len(rows) != 1 else ''}: {e(name.lower())}.</p>
        </aside>
''')
        for k, (point, sid, heading, outcomes) in enumerate(rows):
            n += 1
            toc.append(f'        <li><a href="#{sid}"><span class="toc-num">{n}</span>{e(heading)}</a></li>')
            including = ''
            if point['including']:
                items = ''.join(f'<li>{e(i)}</li>' for i in point['including'])
                including = f'\n          <ul class="syllabus-including" aria-label="Including">{items}</ul>'
            body.append(f'''        <section id="{sid}">
          <h2 class="syllabus-phase">{e(heading)}</h2>
          <p class="outcome-subtitle">🎯 <em>({outcomes})</em></p>
          <p class="syllabus-concept">📌 <em>{dot_point_html(point['text'])}</em></p>{including}

          <!-- {CONTENT_TODO}: explain this dot point at the depth its verb asks for ({e(point['text'].split(' ', 1)[0].lower())}). -->
          <p class="content-placeholder">Notes for this dot point are being written.</p>
        </section>
''')
            if k < len(rows) - 1:
                body.append('        <hr class="divider" />\n')
        body.append(f'        <div class="quiz" data-quiz="{spec["quiz"]}-{pi}"></div>\n')

    page = shell.head(
        title=title, description=description, path=f'topics/{slug}.html',
        crumbs=[('Home', shell.SITE_URL), (f'Year {year}', f'{shell.SITE_URL}#year{year}'), (title, f'{shell.SITE_URL}topics/{slug}.html')],
        description_note=desc_note)
    page += shell.nav_shell('../index.html')
    page += f'''  <header class="topic-header">
    <div class="topic-header-inner">
      <nav class="topic-breadcrumb" aria-label="Breadcrumb">
        <a href="../index.html">Home</a> <span>›</span>
        <a href="../index.html#year{year}">Year {year}</a> <span>›</span>
        <span>{e(title)}</span>
      </nav>
      <h1>{e(title)}</h1>
      <p class="text-muted-dark max-w-600 mt-2 fs-sm lh-base">
        <!-- {CONTENT_TODO}: one or two sentences introducing the topic, with the key ideas in <strong>. -->
        {lead}
      </p>
      <div class="topic-header-meta">
        <span class="meta-pill year{year}">Year {year} — {YEAR_LABEL[year]}</span>
        <span class="meta-pill">{hours} hours</span>
        <span class="meta-pill">Outcomes: {rng}</span>
      </div>
      <div class="callout exam-tip curriculum-banner {yr}">
        <strong>Curriculum aligned</strong>
        <span class="kpi-num">{dot_points}</span>
        <span class="kpi-unit">NESA dot points, in order</span>
        <span class="kpi-text">This page follows every dot point of the focus area against outcomes <strong>{rng}</strong>.</span>
        <a href="{shell.MAPPING_URL}" target="_blank" rel="noopener">View full mapping →</a>
      </div>
    </div>
  </header>

  <div class="page-layout">
    <aside class="sidebar">
      <div class="toc-title">Contents</div>
      <ul class="toc-list">
{chr(10).join(toc)}
      </ul>
    </aside>

    <main class="page-content">
      <div class="content-body">

        <aside class="{yr} topic-breakout" aria-label="Topic introduction">
          <span class="breakout-label">Why this matters now</span>
          <!-- {CONTENT_TODO}: topic introduction. Two short paragraphs linking the topic to students' lives, then a closing question in .breakout-question with a .bq-lead label. -->
          <p>This page covers the {e(spec['focus_area'])} focus area of the NESA Enterprise Computing syllabus.</p>
        </aside>

{chr(10).join(body)}      </div>
    </main>
  </div>

{shell.FOOTER_SHELL}
{shell.scripts(quiz_slug=slug)}'''
    return f'topics/{slug}.html', page, spec, pairs


def stub_page(slug):
    _, title, summary = chrome.PAGES[slug]
    text = STUBS[slug]
    page = shell.head(
        title=title, description=text, path=f'topics/{slug}.html',
        crumbs=[('Home', shell.SITE_URL), ('Resources', f'{shell.SITE_URL}#resources'), (title, f'{shell.SITE_URL}topics/{slug}.html')])
    page += shell.nav_shell('../index.html')
    page += f'''  <header class="topic-header">
    <div class="topic-header-inner">
      <nav class="topic-breadcrumb" aria-label="Breadcrumb">
        <a href="../index.html">Home</a> <span>›</span>
        <a href="../index.html#resources">Resources</a> <span>›</span>
        <span>{e(title)}</span>
      </nav>
      <h1>{e(title)}</h1>
      <p class="text-muted-dark max-w-600 mt-2 fs-sm lh-base">
        {e(text)}
      </p>
      <div class="topic-header-meta">
        <span class="meta-pill">Resources</span>
        <span class="meta-pill">Coming soon</span>
      </div>
    </div>
  </header>

  <div class="page-layout">
    <aside class="sidebar">
      <div class="toc-title">Contents</div>
      <ul class="toc-list">
        <li><a href="#coming-soon"><span class="toc-num">1</span>Coming soon</a></li>
      </ul>
    </aside>

    <main class="page-content">
      <div class="content-body">
        <section id="coming-soon" class="coming-soon">
          <p class="cs-label">Coming soon</p>
          <h2>{e(title)} is being written</h2>
          <p>{e(text)}</p>
          <p>In the meantime, the focus-area pages already follow every NESA dot point in order, and the glossary defines the syllabus keywords.</p>
          <div class="cs-links">
            <a class="btn btn-primary" href="../index.html#year11">Browse Year 11</a>
            <a class="btn btn-outline" href="../index.html#year12">Browse Year 12</a>
            <a class="btn btn-outline" href="glossary.html">Open the glossary</a>
          </div>
        </section>
      </div>
    </main>
  </div>

{shell.FOOTER_SHELL}
{shell.scripts(diagrams=False, progress=False, lightbox=False)}'''
    return f'topics/{slug}.html', page


def build(slug, force):
    rel = f'topics/{slug}.html'
    path = os.path.join(ROOT, rel)
    if os.path.exists(path) and not force:
        print(f'{rel} already exists: not overwritten (use --force to regenerate it, discarding its content).')
        return False
    if slug in SPECS:
        rel, page, spec, pairs = topic_page(slug, force)
        bank = os.path.join(ROOT, 'js', 'quizzes', f'{slug}.js')
        if not os.path.exists(bank):
            os.makedirs(os.path.dirname(bank), exist_ok=True)
            with open(bank, 'w', encoding='utf-8') as f:
                f.write(quiz_bank(slug, spec, pairs))
            print(f'created js/quizzes/{slug}.js')
        shell.write_page(rel, page)
        print(f'wrote {rel}: {sum(len(r) for _, r in pairs)} dot points in {len(pairs)} parts')
    elif slug in STUBS:
        rel, page = stub_page(slug)
        shell.write_page(rel, page)
        print(f'wrote {rel} (coming-soon page)')
    else:
        raise SystemExit(f'unknown slug "{slug}". Focus areas: {", ".join(SPECS)}. Stubs: {", ".join(STUBS)}.')
    return True


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    force = '--force' in sys.argv
    if '--all' in sys.argv:
        args = list(SPECS) + list(STUBS)
    if not args:
        raise SystemExit(__doc__)
    ok = all([build(s, force) for s in args])
    sys.exit(0 if ok else 1)
