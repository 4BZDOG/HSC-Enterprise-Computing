"""Builds topics/resources.html, the Certified Resources page.

Every link is listed once in SECTIONS below. Only two kinds of source
belong here:
  * official NESA / NSW Curriculum documents for Enterprise Computing 11-12
  * the standards bodies or official documentation behind a syllabus concept
Check each URL still resolves before adding it, and update CHECKED.

    python3 scripts/build-resources.py

The page shell (head, navigation, footer) comes from scripts/page_shell.py and
scripts/site-chrome.py, so it always matches the rest of the site.
"""
import html
import os
import re
import sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
sys.path.insert(0, os.path.join(ROOT, 'scripts'))
import page_shell as shell  # noqa: E402

CHECKED = '28 September 2026'
CURR = 'https://curriculum.nsw.edu.au/learning-areas/tas/enterprise-computing-11-12-2022'

# Topic keys → (label, page, year) for the "Links to" chips.
TOPICS = {
    'all':     ('Whole course', None, 'core'),
    'im':      ('Interactive Media and the User Experience', 'interactive-media.html', 'y11'),
    'net':     ('Networking Systems and Social Computing', 'networking-systems.html', 'y11'),
    'cyber':   ('Principles of Cybersecurity', 'cybersecurity.html', 'y11'),
    'ds':      ('Data Science', 'data-science.html', 'y12'),
    'dv':      ('Data Visualisation', 'data-visualisation.html', 'y12'),
    'is':      ('Intelligent Systems', 'intelligent-systems.html', 'y12'),
    'ep':      ('Enterprise Project', 'enterprise-project.html', 'y12'),
    'toolkit': ('Course Toolkit', 'toolkit.html', 'core'),
    'project': ('Project Management Guide', 'project-guide.html', 'core'),
}

# TODO: fill in the remaining official NESA documents (course specifications, sample
# exam, marking guidelines, sample units, scope and sequence, parent guide) and the
# standards bodies behind syllabus concepts (for example OAIC for privacy law, W3C
# for accessibility). Each entry is
#   (title, publisher, format 'Web'|'PDF'|'DOCX', url, why it helps, [topic keys])
# and every URL must be checked before it is added.
SECTIONS = [
    ('nesa-syllabus', 'Official NESA', 'The syllabus and course specifications',
     'The documents the course and the HSC exam are written from. Start here.', [
        ('Enterprise Computing 11–12 Syllabus (2022)', 'NSW Curriculum · NESA', 'Web', CURR,
         'Rationale, aim, outcomes, content and course structure for Years 11 and 12.', ['all']),
    ]),
]

ICONS = {
    'PDF':  '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M9.5 14h5M9.5 17h3"/>',
    'DOCX': '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M9.5 12.5l1.2 5 1.3-3.5 1.3 3.5 1.2-5"/>',
    'Web':  '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 2.6 15.4 0 18M12 3c-2.6 2.6-2.6 15.4 0 18"/>',
}


def e(s):
    return html.escape(s, quote=True)


def card(title, pub, fmt, url, why, topics):
    chips = []
    for t in topics:
        label, page, year = TOPICS[t]
        chip = f'<span class="chip chip-{year}">{e(label)}</span>'
        if page:
            chip = f'<a class="chip chip-{year}" href="{page}">{e(label)}</a>'
        chips.append(chip)
    return f'''          <article class="res-card">
            <div class="res-top">
              <span class="res-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false">{ICONS[fmt]}</svg></span>
              <span class="res-fmt">{fmt}</span>
            </div>
            <h3 class="res-title"><a href="{e(url)}" target="_blank" rel="noopener">{e(title)}<span class="sr-only"> (opens in a new tab)</span></a></h3>
            <p class="res-pub">{e(pub)}</p>
            <p class="res-why">{e(why)}</p>
            <div class="res-links"><span class="res-links-label">Links to</span>{"".join(chips)}</div>
          </article>
'''


def build():
    title = 'Certified Resources'
    desc = ('Official NESA syllabus documents and the standards bodies behind every Enterprise Computing 11–12 concept, '
            'in one place.')
    head = shell.head(title=title, description=desc, path='topics/resources.html',
                      crumbs=[('Home', shell.SITE_URL), ('Resources', f'{shell.SITE_URL}#resources'),
                              (title, f'{shell.SITE_URL}topics/resources.html')])
    nav = shell.nav_shell('../index.html')

    toc = ''.join(f'        <li><a href="#{sid}"><span class="toc-num">{i}</span>{e(h)}</a></li>\n'
                  for i, (sid, _, h, _, _) in enumerate(SECTIONS, 1))
    total = sum(len(items) for *_, items in SECTIONS)
    nesa = sum(len(items) for sid, kind, *_, items in SECTIONS if kind == 'Official NESA')

    body = []
    for sid, kind, heading, lead, items in SECTIONS:
        stamp = 'res-stamp-nesa' if kind == 'Official NESA' else 'res-stamp-std'
        body.append(f'''        <section id="{sid}" class="res-section">
          <div class="res-head">
            <span class="res-stamp {stamp}">{e(kind)}</span>
            <h2>{e(heading)}</h2>
            <p>{e(lead)}</p>
          </div>
          <div class="res-grid">
{"".join(card(*it) for it in items)}          </div>
        </section>
''')

    page = f'''{head}{nav}  <!-- ── Page Header ── -->
  <header class="topic-header">
    <div class="topic-header-inner">
      <nav class="topic-breadcrumb" aria-label="Breadcrumb">
        <a href="../index.html">Home</a> <span>›</span>
        <a href="../index.html#resources">Resources</a> <span>›</span>
        <span>Certified Resources</span>
      </nav>
      <h1>Certified Resources</h1>
      <p class="text-muted-dark max-w-600 mt-2 fs-sm lh-base">
        The <strong>official NESA documents</strong> for Enterprise Computing 11–12, and the <strong>standards bodies</strong> behind the concepts the syllabus names. Each one says which part of the course it supports.
      </p>
      <div class="topic-header-meta">
        <span class="meta-pill">Year 11 &amp; 12</span>
        <span class="meta-pill">{nesa} NESA document{"s" if nesa != 1 else ""}</span>
        <span class="meta-pill">{total - nesa} standard{"s" if total - nesa != 1 else ""}</span>
        <span class="meta-pill">Links checked {CHECKED}</span>
      </div>
    </div>
  </header>

  <!-- ── Page Layout ── -->
  <div class="page-layout">
    <aside class="sidebar">
      <div class="toc-title">Contents</div>
      <ul class="toc-list">
{toc}      </ul>
    </aside>

    <main class="page-content">
      <div class="content-body res-page">
        <!-- Generated by scripts/build-resources.py: edit the data there, not this file. -->
        <div class="callout info res-note"><strong>What "certified" means here</strong>
          Sections labelled <strong>Official NESA</strong> are published by NESA or the NSW Curriculum website and define the course. Sections labelled <strong>Standards body</strong> link to the organisations that set each standard; they are the authority on their own topic, not on the syllabus.
        </div>
{"".join(body)}      </div>
    </main>
  </div>

{shell.FOOTER_SHELL}
{shell.scripts(diagrams=False, progress=False, lightbox=False)}'''
    shell.write_page('topics/resources.html', page)
    print(f'topics/resources.html: {total} resource(s) in {len(SECTIONS)} section(s)')


if __name__ == '__main__':
    build()
