#!/usr/bin/env python3
"""Site checks run on every pull request (see .github/workflows/checks.yml).

    python3 scripts/check-site.py            # fail on real problems; list unfinished placeholders
    python3 scripts/check-site.py --strict   # also fail while any <!-- CONTENT: ... --> placeholder remains

Fails (exit 1) when:
  * a focus-area page's dot points differ from NESA's text or order, its "Including"
    lists differ from NESA's, its part names differ from NESA's subheadings, or a
    section carries an outcome code outside the focus area's outcome list,
  * a quiz placeholder has no questions in that page's js/quizzes/<slug>.js,
  * a sidebar contents link has no section, or a section has no contents link,
  * an internal link points at a page or #id that doesn't exist,
  * a page repeats an id, or <div>/<section>/<main>/<ul>/<ol>/<table> are unbalanced,
  * a Mermaid diagram has not been drawn (npm run diagrams) or was edited since,
  * a flowchart lacks its START/BEGIN and END terminators, uses a symbol that is not a NESA
    flowchart symbol, or leaves a decision arrow unlabelled,
  * an animated or still diagram (data-anim) has no scene in js/anims/, its scene does not
    define itself, its page does not load css/anim.css and js/anim.js, or its figure lacks the
    right canvas class,
  * a NESA diagram key (data-diagram) has no data, or a localStorage key lacks the ec- prefix,
  * the navigation, footer or ?v= cache-busting are stale (run scripts/site-chrome.py),
  * js/glossary-data.js or topics/resources.html is out of date,
  * the outcome text in js/main.js differs from resources/nesa-syllabus-content.md.

Unfinished <!-- CONTENT: ... --> placeholders (written by scripts/scaffold-page.py) are
listed as warnings, and fail only with --strict, which is for the final pre-release check.
"""
import hashlib
import glob
import html
import html.parser
import os
import re
import shutil
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'scripts'))
from page_specs import SPECS  # noqa: E402
from restructure import load_area_outcomes, load_outcomes, load_syllabus  # noqa: E402

STRICT = '--strict' in sys.argv
# Focus-area page -> NESA focus area title, exactly as in resources/nesa-syllabus-content.md
FOCUS_AREAS = {f'{slug}.html': spec['focus_area'] for slug, spec in SPECS.items()}
GALLERY = os.path.join(ROOT, 'reference', 'diagram-gallery.html')   # hidden review page: every diagram scene
PAGES = [os.path.join(ROOT, 'index.html'), os.path.join(ROOT, '404.html')] + sorted(glob.glob(os.path.join(ROOT, 'topics', '*.html'))) + [GALLERY]
FIGURE_PAGES = sorted(glob.glob(os.path.join(ROOT, 'topics', '*.html'))) + [GALLERY]
errors = []
notes = []


def fail(msg):
    errors.append(msg)


def read(*parts):
    return open(os.path.join(ROOT, *parts), encoding='utf-8').read()


def text(fragment):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', fragment))).strip()


# 1. Dot points, "Including" lists, parts and outcomes match NESA
syllabus = load_syllabus()
area_outcomes = load_area_outcomes()
for page, area in FOCUS_AREAS.items():
    if area not in syllabus:
        fail(f'scripts/page_specs.py: focus area "{area}" is not in resources/nesa-syllabus-content.md')
        continue
    path = os.path.join(ROOT, 'topics', page)
    if not os.path.exists(path):
        fail(f'{page}: missing (run python3 scripts/scaffold-page.py {page[:-5]})')
        continue
    src = open(path, encoding='utf-8').read()
    on_page = [text(m) for m in re.findall(r'<p class="syllabus-concept">📌 <em>(.*?)</em></p>', src, re.S)]
    expected = [p['text'] for _, pts in syllabus[area] for p in pts]
    if on_page != expected:
        for i, (a, b) in enumerate(zip(on_page, expected)):
            if a != b:
                fail(f'{page}: dot point {i + 1} is "{a[:70]}", NESA says "{b[:70]}"')
                break
        else:
            fail(f'{page}: {len(on_page)} dot points on the page, NESA has {len(expected)}')
    parts = [text(p) for p in re.findall(r'<span class="part-name">(.*?)</span>', src)]
    if parts != [s for s, _ in syllabus[area]]:
        fail(f'{page}: parts {parts} do not match NESA subheadings')
    # Including lists, section by section
    sections = re.findall(r'<section id="([^"]+)"[^>]*>(.*?)</section>', src, re.S)
    sections = [(i, b) for i, b in sections if 'class="syllabus-concept"' in b]
    points = [p for _, pts in syllabus[area] for p in pts]
    if len(sections) == len(points):
        for (sid, body), point in zip(sections, points):
            m = re.search(r'<ul class="syllabus-including"[^>]*>(.*?)</ul>', body, re.S)
            got = [text(x) for x in re.findall(r'<li>(.*?)</li>', m.group(1), re.S)] if m else []
            if got != point['including']:
                fail(f'{page}#{sid}: "Including" list {got} differs from NESA {point["including"]}')
    else:
        fail(f'{page}: {len(sections)} sections but NESA has {len(points)} dot points')
    # Outcome codes belong to this focus area
    allowed = set(area_outcomes.get(area, []))
    for sid, body in sections:
        m = re.search(r'<p class="outcome-subtitle">🎯 <em>\((.*?)\)</em>', body, re.S)
        codes = re.findall(r'EC-1[12]-\d\d', m.group(1)) if m else []
        if not codes:
            fail(f'{page}#{sid}: no outcome codes')
        for c in codes:
            if c not in allowed:
                fail(f'{page}#{sid}: {c} is not an outcome of "{area}"')
    # Sidebar contents <-> sections
    toc = re.findall(r'<ul class="toc-list">(.*?)</ul>', src, re.S)
    toc_ids = re.findall(r'href="#([^"]+)"', toc[0]) if toc else []
    sec_ids = [i for i, _ in sections]
    if toc_ids != sec_ids:
        missing = [i for i in sec_ids if i not in toc_ids]
        extra = [i for i in toc_ids if i not in sec_ids]
        fail(f'{page}: sidebar contents differ from the sections (no link: {missing[:4]}, no section: {extra[:4]}) or are out of order')
    if len(re.findall(r'<li class="sidebar-label">', src)) != len(syllabus[area]):
        fail(f'{page}: the sidebar needs one part label per NESA subheading')

# 1b. Every quiz placeholder has questions in that page's own bank
for page in FOCUS_AREAS:
    path = os.path.join(ROOT, 'topics', page)
    if not os.path.exists(path):
        continue
    src = open(path, encoding='utf-8').read()
    slug = page[:-5]
    bank_path = os.path.join(ROOT, 'js', 'quizzes', f'{slug}.js')
    keys = re.findall(r'<div class="quiz" data-quiz="([^"]+)">', src)
    if not os.path.exists(bank_path):
        fail(f'{page}: js/quizzes/{slug}.js is missing')
        continue
    bank = open(bank_path, encoding='utf-8').read()
    if f'js/quizzes/{slug}.js' not in src or 'js/quiz.js' not in src:
        fail(f'{page}: must load js/quizzes/{slug}.js and js/quiz.js')
    bank_keys = re.findall(r"^\s*'([a-z]+-\d+)':\s*\[", bank, re.M)
    for key in keys:
        if key not in bank_keys:
            fail(f'{page}: quiz "{key}" has no questions in js/quizzes/{slug}.js')
    for key in bank_keys:
        if key not in keys:
            fail(f'js/quizzes/{slug}.js: questions for "{key}", but {page} has no such quiz')
    if len(set(keys)) != len(keys):
        fail(f'{page}: repeated quiz keys')
    prefix = SPECS[slug]['quiz']
    for key in keys:
        if not key.startswith(prefix + '-'):
            fail(f'{page}: quiz key "{key}" should start "{prefix}-"')
    for opts, answer in re.findall(r'options:\s*\[(.*?)\],\s*answer:\s*(\d+)', bank, re.S):
        n_opts = len(re.findall(r"'(?:[^'\\]|\\.)*'|\"(?:[^\"\\]|\\.)*\"", opts))
        if int(answer) >= n_opts:
            fail(f'js/quizzes/{slug}.js: an answer index ({answer}) is outside its {n_opts} options')

# 1c. Figures follow the NESA conventions
EMOJI = re.compile('[\U0001F000-\U0001FAFF☀-➿⬀-⯿]')
for path in FIGURE_PAGES:
    rel = os.path.relpath(path, ROOT)
    src = open(path, encoding='utf-8').read()
    for fig in re.findall(r'<figure class="figure">.*?</figure>', src, re.S):
        title = re.search(r'<h4 class="figure-title">(.*?)</h4>', fig)
        name = text(title.group(1)) if title else '(untitled figure)'
        if not title or '<p class="figure-lead">' not in fig:
            fail(f'{rel}: figure "{name}" needs a title and a lead sentence')
        if '<div class="mermaid">' in fig:
            fail(f'{rel}: figure "{name}" has a diagram that has not been drawn; run npm run diagrams')
            continue
        block = re.search(r'<div class="mermaid" data-diagram="([0-9a-f]+)">(.*?)<template class="mermaid-source">(.*?)</template>', fig, re.S)
        if not block:
            continue
        code = html.unescape(block.group(3)).strip()
        if hashlib.sha1(code.encode('utf-8')).hexdigest()[:10] != block.group(1):
            fail(f'{rel}: figure "{name}" was edited since it was drawn; run npm run diagrams')
        if 'dg-light' not in block.group(2) or 'dg-dark' not in block.group(2):
            fail(f'{rel}: figure "{name}" needs both its light and dark SVG; run npm run diagrams')
        if EMOJI.search(code):
            fail(f'{rel}: figure "{name}" has emoji inside the diagram')
        kind = re.search(r'<span class="figure-kind">(.*?)</span>', fig)
        if kind and kind.group(1) == 'Flowchart':
            # NESA flowchart symbols only: terminator ([ ]), process [ ], decision { }, I/O [/ /], subprogram [[ ]]
            for bad, label in (('((', 'circle'), ('[(', 'cylinder'), ('{{', 'hexagon'), ('>"', 'flag shape')):
                if bad in code:
                    fail(f'{rel}: flowchart "{name}" uses a {label}, which is not a NESA flowchart symbol')
            # NESA's own flowchart starts with START; either START or BEGIN is fine, then END
            if not re.search(r'\(\["(BEGIN|START)', code) or not re.search(r'\(\["END', code):
                fail(f'{rel}: flowchart "{name}" must start with a START (or BEGIN) terminator and finish with END')
            for d in re.findall(r'(\w+)\{"', code):
                exits = re.findall(rf'^\s*{d}\s*(--[^>]*?-->|-->)', code, re.M)
                if any(e == '-->' for e in exits):
                    fail(f'{rel}: flowchart "{name}" has an unlabelled arrow leaving decision {d}')

# 1d. NESA structure charts and DFDs used on pages have data
diagram_data = read('js', 'nesa-diagram-data.js')
data_keys = set(re.findall(r"^\s{2}'([\w-]+)':\s*\{", diagram_data, re.M))
for path in FIGURE_PAGES:
    src = open(path, encoding='utf-8').read()
    for key in re.findall(r'class="nesa-diagram" data-diagram="([^"]+)"', src):
        if key not in data_keys:
            fail(f'{os.path.relpath(path, ROOT)}: NESA diagram "{key}" has no data in js/nesa-diagram-data.js')
    if 'class="nesa-diagram"' in src and '../js/nesa-diagrams.js' not in src:
        fail(f'{os.path.relpath(path, ROOT)}: has NESA diagrams but does not load js/nesa-diagrams.js')

# 1d2. Diagram scenes (js/anims/*.js): each file defines the scene it is named after, with a title
for scene in sorted(glob.glob(os.path.join(ROOT, 'js', 'anims', '*.js'))):
    name = os.path.basename(scene)[:-3]
    code = open(scene, encoding='utf-8').read()
    if f"HSCAnim.define('{name}'" not in code:
        fail(f'js/anims/{name}.js does not call HSCAnim.define(\'{name}\', …)')
    if not re.search(r"\btitle:", code):
        fail(f'js/anims/{name}.js needs a title (the screen-reader name)')
    if 'still: true' in code and not re.search(r"\balt:", code):
        fail(f'js/anims/{name}.js: a still diagram needs alt text describing the whole diagram in words')
    if EMOJI.search(code):
        fail(f'js/anims/{name}.js has emoji inside the diagram')

# 1d3. Animated and still diagrams (data-anim): a scene file exists, the page loads the engine,
#      and the figure uses the right canvas; flowcharts and system flowcharts use only their own symbols
FLOWCHART_SHAPES = {'terminator', 'process', 'decision', 'io', 'subprogram'}
SYSFLOW_SHAPES = {'process', 'sf-document', 'sf-storage', 'sf-display', 'sf-manual', 'sf-input', 'sf-tape', 'sf-cloud', 'sf-telecom'}
for path in FIGURE_PAGES:
    rel = os.path.relpath(path, ROOT)
    src = open(path, encoding='utf-8').read()
    names = re.findall(r'data-anim="([^"]+)"', src)
    if not names:
        continue
    if '../css/anim.css' not in src or '../js/anim.js' not in src:
        fail(f'{rel}: has diagrams (data-anim) but does not load ../css/anim.css and ../js/anim.js')
    for name in names:
        scene = os.path.join(ROOT, 'js', 'anims', name + '.js')
        if not os.path.exists(scene):
            fail(f'{rel}: diagram "{name}" has no scene file js/anims/{name}.js')
    for fig in re.findall(r'<figure class="figure"[^>]*>.*?</figure>', src, re.S):
        if 'data-anim=' not in fig:
            continue
        name = re.search(r'data-anim="([^"]+)"', fig).group(1)
        animated = '<span class="figure-kind">Animated diagram</span>' in fig
        if animated and 'figure-canvas--anim' not in fig:
            fail(f'{rel}: an animated figure ("{name}") needs a .figure-canvas--anim canvas')
        if not animated and 'figure-canvas--still' not in fig:
            fail(f'{rel}: a still diagram ("{name}") needs a .figure-canvas--still canvas (or the "Animated diagram" kind)')
        kind = re.search(r'<span class="figure-kind">(.*?)</span>', fig)
        kind = kind.group(1) if kind else ''
        scene = os.path.join(ROOT, 'js', 'anims', name + '.js')
        code = open(scene, encoding='utf-8').read() if os.path.exists(scene) else ''
        used = set(re.findall(r"shape: '([\w-]+)'", code))
        if kind == 'Flowchart':
            # NESA flowcharts: START or BEGIN at the top, END at the bottom, and only the four (five with subprogram) symbols
            if not re.search(r"shape: 'terminator'", code) or not re.search(r"text: '(BEGIN|START)|T\(s, [^)]*'(BEGIN|START)", code) or not re.search(r"text: 'END|T\(s, [^)]*'END", code):
                fail(f'js/anims/{name}.js: a flowchart must start with a START (or BEGIN) terminator and finish with END')
            if used - FLOWCHART_SHAPES:
                fail(f'js/anims/{name}.js: a flowchart may only use NESA flowchart symbols (terminator, process, decision, io, subprogram), not {sorted(used - FLOWCHART_SHAPES)}')
        if kind == 'System flowchart' and (used - SYSFLOW_SHAPES or 'terminator' in used):
            fail(f'js/anims/{name}.js: a system flowchart may only use the nine NESA system flowchart symbols, not {sorted(used - SYSFLOW_SHAPES)}')
        if kind == 'Decision tree' and used & {'decision', 'io', 'terminator', 'circle'}:
            fail(f'js/anims/{name}.js: decision trees use rectangles (process / card) with labelled branches, not {sorted(used & {"decision", "io", "terminator", "circle"})}')


# 1e. A term is bolded once per paragraph or list item: repeats, or a second
#     spelling of it ("algorithm" then "algorithms"), add noise, not emphasis.
def bold_key(fragment):
    w = text(fragment).lower().replace('’', "'")
    w = re.sub(r"'s$", '', w)
    w = re.sub(r'[\s-]+', '', w).replace('isation', 'ization')
    return re.sub(r'(ies|es|s)$', '', w)


for page in sorted(glob.glob(os.path.join(ROOT, 'topics', '*.html'))):
    name = os.path.basename(page)
    if name in ('glossary.html', 'resources.html'):
        continue
    src = open(page, encoding='utf-8').read()
    for block in re.findall(r'<(?:p|li)(?: [^>]*)?>.*?</(?:p|li)>', src, re.S):
        seen = set()
        for frag in re.findall(r'<strong>((?:(?!</?strong>).)*?)</strong>', block, re.S):
            key = bold_key(frag)
            if len(key) > 2 and not text(frag).endswith(':') and key in seen:
                fail(f'{name}: "{text(frag)}" is bolded more than once in one paragraph')
                break
            seen.add(key)

# 2-4. Links, ids, balance
ids = {}
for path in PAGES:
    src = open(path, encoding='utf-8').read()
    found = re.findall(r'\sid="([^"]+)"', src)
    dupes = {i for i in found if found.count(i) > 1}
    if dupes:
        fail(f'{os.path.relpath(path, ROOT)}: repeated ids {sorted(dupes)[:5]}')
    ids[os.path.normpath(path)] = set(found)


class Balance(html.parser.HTMLParser):
    TAGS = {'div', 'section', 'main', 'ul', 'ol', 'table'}

    def __init__(self):
        super().__init__()
        self.stack, self.bad = [], []

    def handle_starttag(self, tag, attrs):
        if tag in self.TAGS:
            self.stack.append((tag, self.getpos()[0]))

    def handle_endtag(self, tag):
        if tag in self.TAGS:
            if self.stack and self.stack[-1][0] == tag:
                self.stack.pop()
            else:
                self.bad.append((tag, self.getpos()[0]))


for path in PAGES:
    rel = os.path.relpath(path, ROOT)
    src = open(path, encoding='utf-8').read()
    b = Balance()
    b.feed(src)
    if b.bad or b.stack:
        where = b.bad[0] if b.bad else b.stack[-1]
        fail(f'{rel}: unbalanced <{where[0]}> near line {where[1]}')
    if path.endswith('404.html'):
        continue  # served from the site root with absolute paths
    markup = re.sub(r'<(code|pre)[^>]*>.*?</\1>', '', src, flags=re.S)  # ignore example code shown as text
    markup = re.sub(r'<!--.*?-->', '', markup, flags=re.S)
    for href in re.findall(r'(?:href|src)="([^"]+)"', markup):
        if re.match(r'^(https?:|mailto:|tel:|javascript:|data:|//)', href) or href == '#':
            continue
        target, _, anchor = href.partition('#')
        target_path = os.path.normpath(os.path.join(os.path.dirname(path), target)) if target else os.path.normpath(path)
        target_path = target_path.split('?')[0]
        if target and not os.path.exists(target_path):
            fail(f'{rel}: link to missing file {href}')
        elif anchor and target_path.endswith('.html') and anchor not in ids.get(target_path, set()):
            fail(f'{rel}: link to missing #{anchor} in {os.path.basename(target_path)}')

# 5. Storage keys are namespaced (this site shares an origin with sister sites), and no stale names remain
for path in glob.glob(os.path.join(ROOT, 'js', '*.js')) + glob.glob(os.path.join(ROOT, 'js', 'quizzes', '*.js')) + PAGES:
    src = open(path, encoding='utf-8').read()
    rel = os.path.relpath(path, ROOT)
    for key in re.findall(r"(?:localStorage|sessionStorage)\.(?:getItem|setItem|removeItem)\(\s*'([^']+)'", src):
        if not key.startswith('ec-'):
            fail(f'{rel}: storage key "{key}" must start with ec-')
    for const, key in re.findall(r"const (\w*KEY\w*)\s*=\s*'([^']+)'", src):
        if not key.startswith('ec-'):
            fail(f'{rel}: {const} = "{key}" must start with ec-')
    for stale in ('hsc-theme', 'SoftEng', 'HSC_SoftwareEngineering', 'Software Engineering', 'SE-1'):
        if stale in src:
            fail(f'{rel}: leftover reference to the sister site ("{stale}")')

# 6. Outcome text in js/main.js is NESA's
main_js = read('js', 'main.js')
for code, desc in load_outcomes().items():
    want = desc[0].upper() + desc[1:]
    if f"'{code}': '{want}'" not in main_js:
        fail(f'js/main.js: OUTCOME_TEXT for {code} differs from resources/nesa-syllabus-content.md')

# 7. Generated things are current: glossary data, resources page, shared chrome and asset versions
with tempfile.TemporaryDirectory() as tmp:
    for d in ('scripts', 'topics', 'js', 'css'):
        shutil.copytree(os.path.join(ROOT, d), os.path.join(tmp, d), ignore=shutil.ignore_patterns('__pycache__'))
    for f in ('index.html', '404.html'):
        shutil.copy(os.path.join(ROOT, f), os.path.join(tmp, f))
    os.makedirs(os.path.join(tmp, 'reference'), exist_ok=True)
    shutil.copy(GALLERY, os.path.join(tmp, 'reference'))
    os.makedirs(os.path.join(tmp, 'resources'), exist_ok=True)
    shutil.copy(os.path.join(ROOT, 'resources', 'nesa-syllabus-content.md'), os.path.join(tmp, 'resources'))
    run = lambda script: subprocess.run([sys.executable, os.path.join(tmp, 'scripts', script)], check=True, capture_output=True, cwd=tmp)
    run('build-glossary.py')
    for rel in ('topics/glossary.html', 'js/glossary-data.js'):
        if open(os.path.join(tmp, rel), encoding='utf-8').read() != read(rel):
            fail(f'{rel} changes when scripts/build-glossary.py runs; run it and commit the result')
    run('build-resources.py')
    if open(os.path.join(tmp, 'topics', 'resources.html'), encoding='utf-8').read() != read('topics', 'resources.html'):
        fail('topics/resources.html changes when scripts/build-resources.py runs; run it and commit the result')
    run('site-chrome.py')
    for path in PAGES:
        rel = os.path.relpath(path, ROOT)
        if open(os.path.join(tmp, rel), encoding='utf-8').read() != open(path, encoding='utf-8').read():
            fail(f'{rel}: navigation, footer, icons or ?v= versions are stale; run python3 scripts/site-chrome.py')

# 8. Unfinished placeholders
counts = {}
for path in PAGES + glob.glob(os.path.join(ROOT, 'js', 'quizzes', '*.js')):
    n = len(re.findall(r'CONTENT:', open(path, encoding='utf-8').read()))
    if n:
        counts[os.path.relpath(path, ROOT)] = n
if counts:
    summary = f'{sum(counts.values())} unfinished CONTENT placeholder(s) in {len(counts)} file(s)'
    if STRICT:
        fail(summary)
    else:
        notes.append(summary + ' (not an error; --strict makes it one)')
    notes.extend(f'    {f}: {n}' for f, n in sorted(counts.items()))

for n in notes:
    print('  !', n) if not n.startswith('    ') else print(n)
if errors:
    print(f'{len(errors)} problem(s):')
    for e in errors:
        print('  ✗', e)
    sys.exit(1)
print(f'✓ All checks passed ({len(PAGES)} pages, {len(FOCUS_AREAS)} focus areas)')
