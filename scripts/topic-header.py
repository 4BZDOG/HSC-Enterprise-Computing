#!/usr/bin/env python3
"""Rebuild the hero-style header on each focus-area page and tag the page with its colour.

    python3 scripts/topic-header.py

Each of the seven focus areas has its own colour (FOCUS below; the matching CSS
tokens are in the "Focus-area colours" section of css/theme.css) and its own
decorative illustration. For every focus-area page this script:

  * sets data-focus="<key>" on <html>, which switches the page's accent colour,
  * loads js/topic-header.js (header motion and the slim bar),
  * rewrites <header class="topic-header"> to add the illustration, a row of
    figures (dot points, parts, hours, outcomes) and a strip of part cards
    that jump to each part. The counts are read from the page itself, so they
    cannot drift from the syllabus content.

The breadcrumb, title row (icon and h1), introduction and meta pills already
on the page are kept as they are. Safe to run again. Run site-chrome.py after.
"""
import html
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAPPING_URL = 'https://github.com/4BZDOG/HSC-Enterprise-Computing/blob/main/resources/Syllabus-Mapping.md'

FOCUS = {
    'interactive-media': 'im', 'networking-systems': 'net', 'cybersecurity': 'cyber',
    'data-science': 'ds', 'data-visualisation': 'dv', 'intelligent-systems': 'is', 'enterprise-project': 'ep',
}


# ── Illustrations ────────────────────────────────────────────────────────────
def chrome(label, body):
    return (
        '<svg viewBox="0 0 560 340" role="presentation" focusable="false">'
        '<rect class="tv-panel" x=".5" y=".5" width="559" height="339" rx="10"/>'
        '<circle class="tv-dim" cx="22" cy="20" r="4"/><circle class="tv-dim" cx="36" cy="20" r="4"/><circle class="tv-dim" cx="50" cy="20" r="4"/>'
        f'<text class="tv-text" x="68" y="24">{label}</text>'
        '<circle class="tv-fill" cx="538" cy="20" r="3.5"/>'
        '<line class="tv-grid" x1="0" y1="40" x2="560" y2="40"/>'
        f'{body}</svg>')


def inset(x, y, w, h):
    return f'<rect class="tv-inset" x="{x}" y="{y}" width="{w}" height="{h}" rx="6"/>'


def art_im():
    b = inset(24, 56, 330, 272)
    b += '<rect class="tv-dim" x="40" y="72" width="300" height="14" rx="3"/><circle class="tv-fill" cx="50" cy="79" r="3"/>'
    b += '<rect class="tv-soft" x="40" y="96" width="300" height="96" rx="4"/><circle class="tv-fill" cx="190" cy="144" r="22"/>'
    b += '<polygon class="tv-ink" points="183,133 183,155 201,144"/>'
    for i in range(3):
        x = 40 + i * 104
        b += f'<rect class="tv-card" x="{x}" y="204" width="92" height="56" rx="4"/><rect class="tv-fill" x="{x}" y="204" width="92" height="3" rx="1.5"/>'
        b += f'<rect class="tv-dim" x="{x+8}" y="218" width="60" height="5" rx="2"/><rect class="tv-dim" x="{x+8}" y="230" width="44" height="5" rx="2"/>'
    b += '<rect class="tv-fill" x="40" y="274" width="84" height="26" rx="13"/><rect class="tv-dim" x="136" y="280" width="130" height="6" rx="3"/><rect class="tv-dim" x="136" y="292" width="86" height="6" rx="3"/>'
    b += '<polygon class="tv-amber a-float" points="290,238 290,270 298,263 304,276 311,273 305,260 315,260"/>'
    b += inset(370, 56, 166, 272) + '<text class="tv-text" x="386" y="77">COMPRESSION</text>'
    for i, (w, cls, lab) in enumerate([(132, 'tv-dim', 'RAW'), (92, 'tv-soft2', 'PNG'), (34, 'tv-fill', 'JPEG')]):
        y = 92 + i * 34
        b += f'<text class="tv-text" x="386" y="{y+8}">{lab}</text><rect class="{cls}" x="386" y="{y+14}" width="{w}" height="10" rx="3"/>'
    b += '<line class="tv-line" x1="386" y1="210" x2="520" y2="210"/><circle class="tv-amber" cx="466" cy="210" r="7"/><text class="tv-text" x="386" y="232">QUALITY 72%</text>'
    hs = [10, 22, 34, 18, 40, 28, 14, 36, 24, 44, 20, 30, 12, 26]
    for i, h in enumerate(hs):
        x = 388 + i * 9.6
        b += f'<line class="tv-line a-wave" style="--i:{i}" x1="{x:.1f}" y1="{290-h/2:.1f}" x2="{x:.1f}" y2="{290+h/2:.1f}" stroke-width="3"/>'
    b += '<text class="tv-text" x="386" y="320">AUDIO · 44.1 KHZ</text>'
    return chrome('interactive-media / preview', b)


def art_net():
    b = inset(24, 56, 512, 272)
    cloud = (280, 96)
    hub = (280, 192)
    sw = [(120, 250), (280, 276), (440, 250)]
    leaves = [[(60, 296), (120, 304), (176, 290)], [(236, 312), (324, 312)], [(384, 290), (440, 304), (500, 296)]]
    b += f'<line class="tv-edge hot" x1="{cloud[0]}" y1="{cloud[1]+14}" x2="{hub[0]}" y2="{hub[1]}"/>'
    for (x, y), ls in zip(sw, leaves):
        b += f'<line class="tv-edge" x1="{hub[0]}" y1="{hub[1]}" x2="{x}" y2="{y}"/>'
        for lx, ly in ls:
            b += f'<line class="tv-edge" x1="{x}" y1="{y}" x2="{lx}" y2="{ly}"/><circle class="tv-node" cx="{lx}" cy="{ly}" r="6"/>'
        b += f'<circle class="tv-node b" cx="{x}" cy="{y}" r="9"/>'
    # IoT sensors
    for sx, sy in [(70, 120), (160, 140), (400, 130), (490, 110)]:
        b += f'<line class="tv-edge dash" x1="{sx}" y1="{sy}" x2="{hub[0]}" y2="{hub[1]}"/><rect class="tv-amber" x="{sx-5}" y="{sy-5}" width="10" height="10" rx="2"/>'
    b += '<circle class="tv-fill" cx="272" cy="96" r="14"/><circle class="tv-fill" cx="290" cy="90" r="17"/><circle class="tv-fill" cx="306" cy="98" r="12"/><rect class="tv-fill" x="262" y="98" width="52" height="12" rx="6"/>'
    b += f'<circle class="tv-node hubn" cx="{hub[0]}" cy="{hub[1]}" r="13"/><circle class="tv-ink" cx="{hub[0]}" cy="{hub[1]}" r="5"/>'
    b += '<text class="tv-text" x="40" y="76">NETWORK · 15 NODES</text><text class="tv-text" x="326" y="110">CLOUD</text><text class="tv-text" x="298" y="178">ROUTER</text><text class="tv-text" x="40" y="146">IOT</text><text class="tv-text" x="500" y="76" text-anchor="end">LAN · WAN</text>'
    return chrome('networking-systems / topology', b)


def art_cyber():
    b = inset(24, 56, 240, 272)
    b += '<path class="tv-soft" stroke="var(--band-tone)" stroke-width="2.5" stroke-linejoin="round" d="M144 84 L220 110 V188 C220 238 186 274 144 296 C102 274 68 238 68 188 V110 Z"/>'
    b += '<path class="tv-line" d="M144 100 L206 122 V188 C206 228 178 258 144 278 C110 258 82 228 82 188 V122 Z" stroke-opacity=".45" stroke-width="1.5"/>'
    b += '<circle class="tv-fill" cx="144" cy="170" r="17"/><rect class="tv-fill" x="139.5" y="180" width="9" height="30" rx="2"/><circle class="tv-ink" cx="144" cy="170" r="6"/>'
    b += '<text class="tv-text" x="40" y="77">PROTECTED</text>'
    b += inset(280, 56, 256, 272) + '<text class="tv-text" x="296" y="77">RISK MATRIX</text>'
    cols = ['rk0', 'rk1', 'rk2', 'rk3']
    for r in range(5):
        for c in range(5):
            rank = r + c
            k = 0 if rank < 3 else 1 if rank < 5 else 2 if rank < 7 else 3
            b += f'<rect class="{cols[k]} a-pop" style="--i:{r+c}" x="{318+c*42}" y="{88+(4-r)*38}" width="38" height="34" rx="3"/>'
    b += '<circle class="tv-amber" cx="381" cy="167" r="6"/><circle class="tv-halo" cx="381" cy="167" r="9"/>'
    b += '<text class="tv-text" x="318" y="294">LIKELIHOOD →</text>'
    b += '<text class="tv-text" x="296" y="196" transform="rotate(-90 296 196)">IMPACT →</text><text class="tv-text" x="296" y="316">BLOCKED · PHISHING · 03:14</text>'
    return chrome('cybersecurity / risk-view', b)


def art_ds():
    b = inset(24, 56, 270, 272)
    b += '<rect class="tv-soft" x="36" y="68" width="246" height="24" rx="3"/>'
    for c, lab in enumerate(['ID', 'STATION', 'MINS', 'FARE']):
        b += f'<text class="tv-text" x="{44+c*62}" y="84">{lab}</text>'
    for r in range(8):
        y = 98 + r * 28
        b += f'<line class="tv-grid" x1="36" y1="{y+24}" x2="282" y2="{y+24}"/>'
        for c, w in enumerate([22, 38, 26, 30]):
            ww = w - (r * 3 % 9)
            b += f'<rect class="tv-dim" x="{44+c*62}" y="{y+8}" width="{ww}" height="7" rx="2"/>'
    b += '<rect class="tv-flag" x="168" y="182" width="56" height="24" rx="3"/><text class="tv-text ink" x="176" y="198">NULL</text>'
    b += inset(310, 56, 226, 140) + '<text class="tv-text" x="326" y="77">TRIPS VS MINS</text>'
    pts = [(334, 168), (350, 156), (364, 160), (378, 142), (392, 148), (408, 130), (420, 136), (436, 118), (452, 124), (466, 104), (482, 112), (498, 96)]
    b += '<line class="tv-axis" x1="326" y1="180" x2="522" y2="180"/><line class="tv-line" x1="326" y1="176" x2="522" y2="94" stroke-dasharray="5 4" stroke-opacity=".7"/>'
    b += ''.join(f'<circle class="tv-fill a-pop" style="--i:{i}" cx="{x}" cy="{y}" r="3.5"/>' for i, (x, y) in enumerate(pts))
    b += inset(310, 208, 226, 120)
    for i, (txt, kw) in enumerate([('SELECT', ' station, COUNT(*)'), ('FROM', ' trips'), ('GROUP BY', ' station;')]):
        b += f'<text class="tv-code" x="326" y="{238+i*26}"><tspan class="kw">{txt}</tspan>{html.escape(kw)}</text>'
    return chrome('data-science / workbench', b)


def art_dv():
    b = inset(24, 56, 280, 272) + '<text class="tv-text" x="40" y="77">SALES BY QUARTER</text>'
    hs = [70, 96, 82, 120, 104, 148, 132, 176]
    for y in (110, 150, 190):
        b += f'<line class="tv-grid" x1="40" y1="{y}" x2="288" y2="{y}"/>'
    b += '<line class="tv-axis" x1="40" y1="296" x2="288" y2="296"/>'
    for i, h in enumerate(hs):
        cls = 'tv-amber' if i == 7 else 'tv-soft2' if i % 2 else 'tv-fill'
        b += f'<rect class="{cls} a-grow" style="--i:{i}" x="{48+i*30}" y="{296-h}" width="20" height="{h}" rx="2"/>'
    b += '<path class="tv-line thin" d="M58 220 L88 204 L118 212 L148 180 L178 190 L208 160 L238 168 L268 126"/>'
    b += inset(320, 56, 216, 130) + '<text class="tv-text" x="336" y="77">SHARE</text>'
    segs = [(0, 92, 'tv-ring a'), (92, 58, 'tv-ring b'), (150, 46, 'tv-ring c'), (196, 30, 'tv-ring d')]
    for off, ln, cls in segs:
        b += f'<circle class="{cls}" cx="428" cy="132" r="36" stroke-dasharray="{ln} 226.2" stroke-dashoffset="{-off}" transform="rotate(-90 428 132)"/>'
    b += '<text class="tv-num" x="428" y="138" text-anchor="middle">41%</text>'
    b += inset(320, 198, 216, 130) + '<text class="tv-text" x="336" y="219">HEATMAP</text>'
    vals = [3, 5, 2, 7, 4, 6, 8, 3, 6, 4, 8, 5, 2, 7, 5, 3, 7, 9, 4, 6, 8, 5, 3, 6]
    for i, v in enumerate(vals):
        c, r = i % 8, i // 8
        b += f'<rect class="tv-fill" x="{336+c*23}" y="{232+r*30}" width="20" height="26" rx="3" fill-opacity="{0.12+v*0.09:.2f}"/>'
    return chrome('data-visualisation / dashboard', b)


def art_is():
    b = inset(24, 56, 300, 272) + '<text class="tv-text" x="40" y="77">NEURAL NETWORK</text>'
    layers = [(70, 4), (140, 6), (210, 6), (280, 2)]
    pos = []
    for x, n in layers:
        gap = 190 / n
        pos.append([(x, 98 + gap * (i + .5)) for i in range(n)])
    for a, c in zip(pos, pos[1:]):
        for i, (x1, y1) in enumerate(a):
            for j, (x2, y2) in enumerate(c):
                hot = ' hot' if (i + j) % 4 == 0 else ''
                b += f'<line class="tv-edge{hot}" x1="{x1}" y1="{y1:.0f}" x2="{x2}" y2="{y2:.0f}"/>'
    for li, layer in enumerate(pos):
        for i, (x, y) in enumerate(layer):
            cls = 'tv-node hubn' if li == 3 and i == 0 else 'tv-node'
            b += f'<circle class="{cls}" cx="{x}" cy="{y:.0f}" r="7"/>'
    b += '<text class="tv-text" x="40" y="316">INPUT</text><text class="tv-text" x="266" y="316">OUTPUT</text>'
    b += inset(340, 56, 196, 272) + '<text class="tv-text" x="356" y="77">DECISION TREE</text>'
    b += '<rect class="tv-fill" x="402" y="92" width="72" height="26" rx="4"/><text class="tv-text ink" x="414" y="109">TEMP&gt;30</text>'
    for cx, cy, lab in [(386, 176, 'FAN ON'), (490, 176, 'ALERT?')]:
        b += f'<line class="tv-edge hot" x1="438" y1="118" x2="{cx}" y2="{cy-13}"/><rect class="tv-card" x="{cx-34}" y="{cy-13}" width="68" height="26" rx="4"/><text class="tv-text" x="{cx-27}" y="{cy+4}">{lab}</text>'
    for cx, cy in [(458, 252), (522, 252)]:
        b += f'<line class="tv-edge" x1="490" y1="189" x2="{cx}" y2="{cy-12}"/><circle class="tv-node" cx="{cx}" cy="{cy}" r="9"/>'
    b += '<text class="tv-text" x="356" y="300">CONFIDENCE</text><rect class="tv-dim" x="356" y="308" width="164" height="6" rx="3"/><rect class="tv-amber" x="356" y="308" width="154" height="6" rx="3"/>'
    return chrome('intelligent-systems / reasoning', b)


def art_ep():
    b = inset(24, 56, 512, 272)
    for i in range(8):
        x = 172 + i * 45
        b += f'<line class="tv-grid" x1="{x}" y1="70" x2="{x}" y2="316"/><text class="tv-text" x="{x+4}" y="82">W{i+1}</text>'
    tasks = [('DEFINE', 0, 1.6, 'tv-fill'), ('RESEARCH', 1, 2, 'tv-fill'), ('PLAN', 2.4, 1.6, 'tv-soft2'), ('BUILD', 3.4, 2.8, 'tv-soft2'), ('TEST', 5.4, 1.6, 'tv-soft2'), ('EVALUATE', 6.5, 1.5, 'tv-fill')]
    for i, (lab, s, d, cls) in enumerate(tasks):
        y = 98 + i * 36
        b += f'<text class="tv-text" x="40" y="{y+14}">{lab}</text>'
        b += f'<rect class="{cls} a-growx" style="--i:{i}" x="{172+s*45:.0f}" y="{y}" width="{d*45:.0f}" height="20" rx="4"/>'
        if i < len(tasks) - 1:
            b += f'<path class="tv-edge" d="M{172+(s+d)*45:.0f} {y+10} h6 v26 h-4" />'
    b += '<polygon class="tv-amber" points="316,296 324,304 316,312 308,304"/><polygon class="tv-amber" points="496,296 504,304 496,312 488,304"/>'
    b += '<line class="tv-today" x1="352" y1="70" x2="352" y2="316"/><text class="tv-text" x="358" y="326">TODAY</text>'
    return chrome('enterprise-project / gantt', b)


ART = {'im': art_im, 'net': art_net, 'cyber': art_cyber, 'ds': art_ds, 'dv': art_dv, 'is': art_is, 'ep': art_ep}
ALT = {
    'im': 'A web page wireframe with a video hero, content cards and a cursor, beside file-size bars and a quality slider.',
    'net': 'A network topology: a cloud, a central router, three switches with devices and Internet of Things sensors.',
    'cyber': 'A shield with a keyhole beside a five by five risk matrix with one marked cell.',
    'ds': 'A spreadsheet with one missing value, a scatter plot with a trend line and three lines of SQL.',
    'dv': 'A bar chart with one highlighted bar and a trend line, a donut chart and a heatmap.',
    'is': 'A neural network of four layers beside a small decision tree with a confidence bar.',
    'ep': 'A Gantt chart with six linked tasks, two milestones and a marker for today.',
}


# ── Page parsing ─────────────────────────────────────────────────────────────
def outcome_count(text):
    codes = set()
    body = text.split(':', 1)[1].strip()
    m = re.match(r'EC-(\d\d)-(.*)', body)
    year, rest = m.group(1), m.group(2)
    first = True
    for chunk in re.split(r',\s*', rest):
        chunk = chunk.strip()
        rng = re.match(r'(\d\d)\s+to\s+(\d\d)$', chunk)
        if rng:
            codes.update(range(int(rng.group(1)), int(rng.group(2)) + 1))
        else:
            codes.add(int(chunk.replace('EC-%s-' % year, '')))
    return len(codes)


def build_header(slug, page):
    key = FOCUS[slug]
    m = re.search(r'<header class="topic-header">(.*?)</header>', page, re.S)
    inner = m.group(1)
    crumb = re.search(r'<nav class="topic-breadcrumb".*?</nav>', inner, re.S).group(0)
    title = re.search(r'<div class="topic-title-row">.*?</h1></div>', inner, re.S).group(0)
    intro = re.search(r'<p class="text-muted-dark[^>]*>.*?</p>', inner, re.S).group(0)
    meta = re.search(r'<div class="topic-header-meta">.*?</div>', inner, re.S).group(0)
    hours = re.search(r'(\d+) hours', meta).group(1)
    outcomes = outcome_count(re.search(r'Outcomes:[^<]*', meta).group(0))

    # Parts: name, dot points and the id of the first section
    names = list(re.finditer(r'<span class="part-name">([^<]*)</span>', page))
    parts = []
    for i, n in enumerate(names):
        end = names[i + 1].start() if i + 1 < len(names) else len(page)
        chunk = page[n.end():end]
        ids = []
        for piece in chunk.split('<section')[1:]:
            m = re.match(r'[^>]*\bid="([^"]+)"', piece)
            if m and '<h2 class="syllabus-phase' in piece:
                ids.append(m.group(1))
        parts.append((n.group(1), len(ids), ids[0] if ids else '', ids))
    dots = sum(p[1] for p in parts)

    stats = (
        '<div class="topic-stats">'
        f'<div class="topic-stat"><span class="topic-stat-num">{dots}</span><span class="topic-stat-label">Dot points</span></div>'
        f'<div class="topic-stat"><span class="topic-stat-num">{len(parts)}</span><span class="topic-stat-label">Parts</span></div>'
        f'<div class="topic-stat"><span class="topic-stat-num">{hours}</span><span class="topic-stat-label">Course hours</span></div>'
        f'<div class="topic-stat"><span class="topic-stat-num">{outcomes}</span><span class="topic-stat-label">Outcomes</span></div>'
        '</div>')
    cards = ''
    for i, (name, n, sid, ids) in enumerate(parts, 1):
        href = f'#{sid}' if sid else '#'
        cards += (f'<a class="topic-part" href="{href}" data-sections="{",".join(ids)}"><span class="topic-part-num">Part {i}</span>'
                  f'<span class="topic-part-name">{name}</span><span class="topic-part-count">{n} dot point{"s" if n != 1 else ""} →</span></a>')
    first = parts[0][2] if parts else ''
    actions = ('<div class="topic-actions">'
               f'<a class="topic-start" data-start href="#{first}">Start learning <span aria-hidden="true">→</span></a>'
               f'<a class="topic-map-link" href="{MAPPING_URL}" target="_blank" rel="noopener">Syllabus mapping ↗</a>'
               '</div>')
    strip = f'<nav class="topic-parts" aria-label="Parts of this focus area">{cards}</nav>'
    viz = f'<div class="topic-viz" role="img" aria-label="{html.escape(ALT[key])}">{ART[key]()}</div>'
    return (f'<header class="topic-header">\n    <div class="topic-header-inner">\n      {crumb}\n      {title}\n      {intro}\n      {meta}\n'
            f'      {actions}\n      {viz}\n      {stats}\n      {strip}\n    </div>\n  </header>')


HOME_NAMES = {
    'interactive-media': 'Interactive Media', 'networking-systems': 'Networking Systems', 'cybersecurity': 'Cybersecurity',
    'data-science': 'Data Science', 'data-visualisation': 'Data Visualisation', 'intelligent-systems': 'Intelligent Systems',
    'enterprise-project': 'Enterprise Project',
}


def update_home():
    """Hero strip of the seven focus areas, and an illustration at the top of each focus-area card."""
    path = os.path.join(ROOT, 'index.html')
    with open(path, encoding='utf-8') as f:
        page = f.read()
    # Card illustrations
    for slug, key in FOCUS.items():
        card = re.search(r'(<a href="topics/%s\.html" class="topic-card[^"]*">)(\s*<div class="card-art[^>]*>.*?</svg></div>)?' % slug, page, re.S)
        art = f'<div class="card-art topic-viz" aria-hidden="true">{ART[key]()}</div>'
        page = page[:card.start()] + card.group(1) + '\n          ' + art + page[card.end():]
    # Hero strip
    links = ''
    for i, (slug, key) in enumerate(FOCUS.items(), 1):
        icon = re.search(r'<a href="topics/%s\.html" class="topic-card.*?<div class="card-icon" aria-hidden="true">(<svg.*?</svg>)</div>' % slug, page, re.S).group(1)
        hrs = '40' if i <= 3 else '30'
        links += (f'<a class="hero-topic" href="topics/{slug}.html"><span class="ht-ico" aria-hidden="true">{icon}</span>'
                  f'<span class="ht-text"><span class="ht-year">Year {11 if i <= 3 else 12} · {hrs} hrs</span><span class="ht-name">{HOME_NAMES[slug]}</span></span></a>')
    strip = f'<!-- hero-topics -->\n      <nav class="hero-topics" aria-label="The seven focus areas">{links}</nav>\n      <!-- /hero-topics -->\n    '
    page = re.sub(r'<!-- hero-topics -->.*?<!-- /hero-topics -->\s*', '', page, flags=re.S)
    start = page.index('<section class="hero"')
    end = page.index('</section>', start)
    close = page.rindex('</div>', start, end)
    page = page[:close] + strip + page[close:]
    with open(path, 'w', encoding='utf-8') as f:
        f.write(page)
    print('updated index')


def main():
    for slug, key in FOCUS.items():
        path = os.path.join(ROOT, 'topics', slug + '.html')
        with open(path, encoding='utf-8') as f:
            page = f.read()
        new = build_header(slug, page)
        page = re.sub(r'<header class="topic-header">.*?</header>', lambda _: new, page, count=1, flags=re.S)
        page = re.sub(r'<html lang="en"[^>]*>', f'<html lang="en" data-theme="light" data-focus="{key}">', page, count=1)
        if 'js/topic-header.js' not in page:
            page = re.sub(r'(<script src="\.\./js/progress\.js[^"]*" defer></script>)', r'\1\n  <script src="../js/topic-header.js" defer></script>', page, count=1)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(page)
        print('updated', slug)
    update_home()


if __name__ == '__main__':
    main()
