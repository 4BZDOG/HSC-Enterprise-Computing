#!/usr/bin/env python3
"""Apply the shared site chrome (navigation, footer, topic icons) to every page.

    python3 scripts/site-chrome.py

One icon per page lives in ICONS below. The script rewrites, on index.html,
404.html and every page in topics/:

  * the desktop dropdown items (icon, title and a one-line summary),
  * the mobile menu (rebuilt from one template so every page matches),
  * the icon beside the page's <h1>,
  * the icon on the sidebar "Contents" title,
  * the logo glyph and name in the navigation bar,
  * the footer (rebuilt from one template), with icons on its links,
  * type="button" on any button that lacks a type,
  * the ?v= cache-busting query on every css/ and js/ link (a short hash of
    the file, so it changes exactly when the file does; this includes
    css/anim.css and js/anim.js; js/anim.js passes its ?v= on to the scene
    files it loads, so its hash also covers every file in js/anims/),
  * the previous / next topic cards at the end of each topic page,
  * the topic tags on glossary terms (icon, and a button that filters the
    glossary to that topic). New terms from add-glossary-terms.py come in
    as plain tags; re-run this script afterwards.

It is safe to run again: blocks it has already rewritten are rebuilt, not
duplicated. Add a new page to PAGES (and ICONS) and re-run it.
"""
import glob
import hashlib
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Inner SVG markup for a 24x24 stroked icon (stroke only, simple paths).
# The topic icons match the cards on the home page.
ICONS = {
    'home': '<path d="M3.5 11 12 4l8.5 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5.5h4V20"/>',
    # cursor over a window
    'interactive-media': '<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 8.5h18"/><path d="M10.5 11.5l6 2.4-2.6 1.2-1.2 2.7z"/>',
    # three connected nodes
    'networking-systems': '<circle cx="12" cy="6" r="2.5"/><circle cx="5.5" cy="18" r="2.5"/><circle cx="18.5" cy="18" r="2.5"/><path d="M10.9 8.2 6.6 15.8M13.1 8.2l4.3 7.6M8 18h8"/>',
    # shield with a keyhole
    'cybersecurity': '<path d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z"/><circle cx="12" cy="10.5" r="2"/><path d="M12 12.5V16"/>',
    # database cylinder
    'data-science': '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>',
    # bar chart with a trend line
    'data-visualisation': '<path d="M4 3.5V20.5h16.5"/><path d="M7 18v-4.5M11.5 18v-7M16 18v-9.5"/><path d="M5.5 10.5 9.5 7l3.5 1.5 6-5"/>',
    # chip with a small neural net
    'intelligent-systems': '<rect x="6" y="6" width="12" height="12" rx="2.5"/><circle cx="9.5" cy="9.5" r="1.1"/><circle cx="14.5" cy="9.5" r="1.1"/><circle cx="12" cy="14.5" r="1.1"/><path d="M10.4 10.3l1.1 3.1M13.6 10.3l-1.1 3.1M10.6 9.5h2.8"/><path d="M9.5 6V3.5M14.5 6V3.5M9.5 18v2.5M14.5 18v2.5M6 9.5H3.5M6 14.5H3.5M18 9.5h2.5M18 14.5h2.5"/>',
    # clipboard with Gantt bars and a tick
    'enterprise-project': '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5V3h6v1.5"/><path d="M8.5 9H12M10.5 12.5H15.5"/><path d="M8.5 16l1.4 1.4 2.4-2.8"/>',
    # ruler with tick marks
    'toolkit': '<path d="M3 17.5 17.5 3 21 6.5 6.5 21z"/><path d="M6.6 13.9l1.7 1.7M9.4 11.1l1.2 1.2M12.1 8.4l1.7 1.7M14.9 5.6l1.2 1.2"/>',
    # flag on a pole
    'project-guide': '<path d="M6 21V3.5"/><path d="M6 5h11.5L15 8.5 17.5 12H6"/>',
    # gauge with a needle
    'example-project': '<path d="M4 17a8 8 0 1 1 16 0"/><path d="M12 17l4-5"/><circle cx="12" cy="17" r="1.2"/><path d="M4 20.5h16"/>',
    # open book
    'glossary': '<path d="M3 5.5c3-1.3 6-1.3 9 .5 3-1.8 6-1.8 9-.5V19c-3-1.3-6-1.3-9 .5-3-1.8-6-1.8-9-.5z"/><path d="M12 6v13.5"/>',
    # bookmark with a tick
    'resources': '<path d="M6.5 3h11v18l-5.5-3.8L6.5 21z"/><path d="M9.5 9.5l2 2 3.5-3.5"/>',
}

# The logo tile: three bars, teal tile (styled by css/theme.css)
BRAND_GLYPH = ('<svg class="brand-glyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'
               '<rect x="3.5" y="12" width="4.5" height="8" rx="1"/><rect x="9.75" y="7" width="4.5" height="13" rx="1"/>'
               '<rect x="16" y="3.5" width="4.5" height="16.5" rx="1"/></svg>')
SITE_NAME = 'EntComp Notes'
NESA_URL = 'https://curriculum.nsw.edu.au/learning-areas/tas/enterprise-computing-11-12-2022'
BASE_PATH = '/HSC-Enterprise-Computing/'

# slug: (group, title, summary)
PAGES = {
    'interactive-media': ('y11', 'Interactive Media and the User Experience', 'UX, UI and digital media'),
    'networking-systems': ('y11', 'Networking Systems and Social Computing', 'Networks, cloud and IoT'),
    'cybersecurity': ('y11', 'Principles of Cybersecurity', 'Privacy, threats and risk'),
    'data-science': ('y12', 'Data Science', 'Collect, analyse and store data'),
    'data-visualisation': ('y12', 'Data Visualisation', 'Telling stories with data'),
    'intelligent-systems': ('y12', 'Intelligent Systems', 'Expert systems, AI and IoT'),
    'enterprise-project': ('y12', 'Enterprise Project', 'Define, plan, build and evaluate'),
    'toolkit': ('core', 'Course Toolkit', 'Diagrams, spreadsheets, SQL and design tools'),
    'project-guide': ('core', 'Project Management Guide', 'Approaches, planning and implementation'),
    'example-project': ('core', 'Example Enterprise Project', 'A worked project with a live dashboard'),
    'glossary': ('core', 'Glossary', 'Every syllabus keyword'),
    'resources': ('core', 'Certified Resources', 'Official NESA documents'),
}
# Course order for the previous / next cards
SEQUENCE = ['interactive-media', 'networking-systems', 'cybersecurity',
            'data-science', 'data-visualisation', 'intelligent-systems', 'enterprise-project']
# Glossary tag text -> page (the tag names are the page titles)
CHIP_SLUGS = {PAGES[k][1]: k for k in PAGES if k not in ('glossary', 'resources', 'example-project')}

GROUPS = [
    ('y11', 'Year 11', '<span class="badge badge-11">Prelim</span>'),
    ('y12', 'Year 12', '<span class="badge badge-12">HSC</span>'),
    ('core', 'Resources', '<span class="badge badge-all">Guides</span>'),
]


def svg(name, cls):
    return (f'<span class="{cls}" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false">'
            f'{ICONS[name]}</svg></span>')


def item(slug, prefix, extra=''):
    group, title, summary = PAGES[slug]
    return (f'<a href="{prefix}{slug}.html"{extra} class="nav-item nav-item-{group}">'
            f'{svg(slug, "nav-ico")}<span class="nav-item-text"><span class="nav-item-title">{title}</span>'
            f'<span class="nav-item-desc">{summary}</span></span></a>')


def block_end(text, start):
    """Index just past the </div> that closes the <div> opening at start."""
    depth, i = 0, start
    for m in re.compile(r'<div\b|</div>').finditer(text, start):
        depth += 1 if m.group(0) == '<div' else -1
        if depth == 0:
            return m.end()
    raise ValueError('unbalanced div')


def mobile_menu(prefix, home):
    parts = ['<div class="mobile-menu" id="mobile-menu" role="dialog" aria-label="Navigation menu">',
             f'    <a href="{home}" class="nav-item mobile-home">{svg("home", "nav-ico")}'
             '<span class="nav-item-text"><span class="nav-item-title">Home</span>'
             '<span class="nav-item-desc">All topics and study tips</span></span></a>']
    for group, label, badge in GROUPS:
        parts.append(f'    <div class="mobile-menu-section mobile-menu-{group}">')
        parts.append(f'      <div class="mobile-menu-label">{label} {badge}</div>')
        for slug, (g, _, _) in PAGES.items():
            if g == group:
                parts.append('      ' + item(slug, prefix))
        parts.append('    </div>')
    parts.append('    <div class="mobile-menu-section mobile-menu-theme">')
    parts.append('      <button id="theme-toggle-mobile" class="btn btn-mobile-theme" type="button">Toggle theme</button>')
    parts.append('    </div>')
    parts.append('  </div>')
    return '\n'.join(parts)


def dropdown_items(text, prefix):
    """Rewrite each dropdown menu's links: each menu lists every page in its group.

    The group comes from the menu's own <li class="nav-dropdown nav-dropdown-y11"> (no
    year class means Resources), so a new page added to PAGES appears everywhere.
    """
    out, pos = [], 0
    for m in re.finditer(r'<div class="nav-dropdown-menu" role="menu">', text):
        li = list(re.finditer(r'<li class="nav-dropdown(?: nav-dropdown-(y11|y12))?"', text[:m.start()]))[-1]
        group = li.group(1) or 'core'
        end = block_end(text, m.start())
        role = ' role="menuitem"'
        links = '\n'.join('            ' + item(x, prefix, role) for x, (g, _, _) in PAGES.items() if g == group)
        out.append(text[pos:m.end()] + '\n' + links + '\n          </div>')
        pos = end
    out.append(text[pos:])
    return ''.join(out)


def asset_version(path):
    """Short content hash of a css/ or js/ file, used as its ?v= cache-busting query."""
    h = hashlib.md5()
    with open(path, 'rb') as f:
        h.update(f.read())
    if os.path.basename(path) == 'anim.js':
        # The engine loads js/anims/<scene>.js with its own ?v=, so a changed scene must change this hash too
        for scene in sorted(glob.glob(os.path.join(os.path.dirname(path), 'anims', '*.js'))):
            with open(scene, 'rb') as f:
                h.update(f.read())
    return h.hexdigest()[:8]


def versioned(text, base_dir):
    """Set ?v=<hash> on every local css/ and js/ link in a page (the 404 page links site-absolutely)."""
    def one(m):
        rel = m.group(2)
        if rel.startswith(BASE_PATH):
            target = os.path.join(ROOT, rel[len(BASE_PATH):])
        else:
            target = os.path.normpath(os.path.join(base_dir, rel))
        if not os.path.exists(target):
            return m.group(0)
        return f'{m.group(1)}="{rel}?v={asset_version(target)}"'
    return re.sub(r'\b(href|src)="((?:\.\./|/HSC-Enterprise-Computing/)?(?:css|js)/[^"?#]+\.(?:css|js))(?:\?v=[^"]*)?"', one, text)


def footer(prefix, home, page_title):
    cols = []
    for group, label, _ in GROUPS:
        links = [f'        <a href="{prefix}{s}.html">{t}</a>' for s, (g, t, _) in PAGES.items() if g == group]
        if group == 'core':
            links.append(f'        <a href="{NESA_URL}" target="_blank" rel="noopener">NESA Syllabus ↗</a>')
        cols.append(f'      <div class="footer-col footer-col-{group}">\n        <h4>{label}</h4>\n' + '\n'.join(links) + '\n      </div>')
    where = f' · {page_title}' if page_title else ''
    return f'''<footer>
    <div class="footer-inner">
      <div>
        <a href="{home}" class="footer-brand">
          <div class="footer-logo" aria-hidden="true">{BRAND_GLYPH}</div>
          <span class="footer-name">{SITE_NAME}</span>
        </a>
        <p class="footer-desc">Notes for every dot point of the NSW HSC Enterprise Computing syllabus, from Year 11 foundations to the Year 12 exam.</p>
      </div>
{chr(10).join(cols)}
    </div>
    <div class="footer-bottom">
      <span>© 2026 HSC {SITE_NAME}{where}</span>
      <span>Aligned to the NESA syllabus · For educational purposes only</span>
    </div>
  </footer>'''


def footer_icons(text, prefix, home):
    m = re.search(r'<footer\b.*?</footer>', text, re.S)
    if not m:
        return text
    foot = re.sub(r'<span class="f-ico" aria-hidden="true"><svg.*?</svg></span>', '', m.group(0))

    def link(a):
        href, label = a.group(1), a.group(2)
        slug = 'home' if href.endswith('index.html') else href.rsplit('/', 1)[-1][:-5]
        if slug not in ICONS:
            return a.group(0)
        # Drop a leading emoji or arrow; the icon replaces it.
        label = re.sub(r'^(?:[^\w&<]|&[a-z]+;)+\s*', '', label.strip())
        return f'<a href="{href}">{svg(slug, "f-ico")}{label}</a>'
    foot = re.sub(r'<a href="((?:/[\w-]+/)?(?:\.\./)?(?:topics/)?[a-z-]+\.html)">([^<]*)</a>', link, foot)
    return text[:m.start()] + foot + text[m.end():]


def pager(slug):
    i = SEQUENCE.index(slug)
    cells = []
    for j, rel in ((i - 1, 'prev'), (i + 1, 'next')):
        if 0 <= j < len(SEQUENCE):
            t = SEQUENCE[j]
            group, title, summary = PAGES[t]
            label = 'Previous topic' if rel == 'prev' else 'Next topic'
            cells.append(f'<a class="pager-card pager-{rel} nav-item-{group}" href="{t}.html" rel="{rel}">'
                         f'{svg(t, "pager-ico")}<span class="pager-text"><span class="pager-dir">{label}</span>'
                         f'<span class="pager-title">{title}</span><span class="pager-desc">{summary}</span></span></a>')
        else:
            cells.append(f'<span class="pager-card pager-{rel} pager-empty" aria-hidden="true"></span>')
    return ('<nav class="topic-pager" aria-label="Previous and next topic">\n          '
            + '\n          '.join(cells) + '\n        </nav>')


def glossary_chips(text):
    def chip(m):
        cls, label = m.group(1), m.group(2).strip()
        slug = CHIP_SLUGS.get(label)
        if not slug:
            return m.group(0)
        return (f'<button type="button" class="{cls} chip-topic" data-topic="{label}" '
                f'title="Show every {label} keyword">{svg(slug, "c-ico")}{label}</button>')
    return re.sub(r'<(?:span|button type="button") class="(chip chip-[a-z0-9]+)(?: chip-topic)?"[^>]*>'
                  r'(?:<span class="c-ico" aria-hidden="true"><svg.*?</svg></span>)?([^<]+)</(?:span|button)>',
                  chip, text)


def page_slug(path):
    return os.path.basename(path)[:-5]


def apply(path):
    text = open(path, encoding='utf-8').read()
    orig = text
    name = os.path.relpath(path, ROOT)
    if name == 'index.html':
        prefix, home = 'topics/', 'index.html'
    elif name == '404.html':  # served from any path, so links are site-absolute
        prefix, home = BASE_PATH + 'topics/', BASE_PATH + 'index.html'
    else:
        prefix, home = '', '../index.html'
    slug = page_slug(path)

    # The logo tile and name in the bar
    text = re.sub(r'(<a href="[^"]*" class="nav-brand">\s*)<div class="nav-logo" aria-hidden="true">.*?</div>(\s*<div>\s*)<div class="nav-title">[^<]*</div>',
                  lambda m: f'{m.group(1)}<div class="nav-logo" aria-hidden="true">{BRAND_GLYPH}</div>{m.group(2)}<div class="nav-title">{SITE_NAME}</div>',
                  text, count=1, flags=re.S)

    text = dropdown_items(text, prefix)

    # Home link in the desktop bar
    text = re.sub(r'<li><a href="([^"]*index\.html)"[^>]*>(?:<span class="nav-ico" aria-hidden="true"><svg.*?</svg></span>)?Home</a></li>',
                  lambda m: f'<li><a href="{m.group(1)}" class="nav-home">{svg("home", "nav-ico")}Home</a></li>', text)

    m = re.search(r'<div class="mobile-menu" id="mobile-menu"', text)
    if m:
        text = text[:m.start()] + mobile_menu(prefix, home) + text[block_end(text, m.start()):]

    if slug in PAGES:
        group = PAGES[slug][0]
        # Icon beside the page title
        text = re.sub(r'<div class="topic-title-row">\s*<span class="topic-hero-icon[^"]*".*?</svg></span>\s*(<h1>.*?</h1>)\s*</div>',
                      r'\1', text, flags=re.S)
        text = re.sub(r'(\n\s*)(<h1>.*?</h1>)',
                      lambda h: (f'{h.group(1)}<div class="topic-title-row">{svg(slug, "topic-hero-icon ti-" + group)}'
                                 f'{h.group(2)}</div>'), text, count=1, flags=re.S)
        # Icon on the sidebar contents title
        text = re.sub(r'<div class="toc-title">(?:<span class="toc-ico[^"]*" aria-hidden="true"><svg.*?</svg></span>)*',
                      f'<div class="toc-title">{svg(slug, "toc-ico ti-" + group)}', text)

    # One footer on every page
    title = PAGES[slug][1].replace('&amp;', '&') if slug in PAGES else ''
    text = re.sub(r'<footer>.*?</footer>', lambda m: footer(prefix, home, title.replace('&', '&amp;')), text, count=1, flags=re.S)
    text = footer_icons(text, prefix, home)

    # Every button gets an explicit type
    text = re.sub(r'<button(?![^>]*\btype=)', '<button type="button"', text)

    # Previous / next topic cards, just after the content column
    if slug in SEQUENCE:
        text = re.sub(r'\n\s*<nav class="topic-pager".*?</nav>', '', text, flags=re.S)
        m = re.search(r'<div class="content-body">', text)
        end = block_end(text, m.start())
        text = text[:end] + '\n\n        ' + pager(slug) + text[end:]

    if slug == 'glossary':
        text = glossary_chips(text)

    # Topic chips on the 404 page
    def chip(c):
        slug = c.group(2).rsplit('/', 1)[-1][:-5]
        return f'{c.group(1)}{svg(slug, "f-ico")}' if slug in ICONS else c.group(0)
    text = re.sub(r'(<a class="lost-link[^"]*" href="([^"]+\.html)">)(?:<span class="f-ico" aria-hidden="true"><svg.*?</svg></span>)?',
                  chip, text)
    text = versioned(text, os.path.dirname(path))
    if text != orig:
        open(path, 'w', encoding='utf-8').write(text)
        print('updated', os.path.relpath(path, ROOT))


if __name__ == '__main__':
    # reference/diagram-gallery.html is a hidden review page: it gets the ?v= cache-busting like any page
    # (which covers css/anim.css and js/anim.js) but none of the navigation.
    for p in [os.path.join(ROOT, 'index.html'), os.path.join(ROOT, '404.html')] + sorted(glob.glob(os.path.join(ROOT, 'topics', '*.html'))) + [os.path.join(ROOT, 'reference', 'diagram-gallery.html')]:
        apply(p)
