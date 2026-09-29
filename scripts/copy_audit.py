#!/usr/bin/env python3
"""Report each dot-point section's length against the scope its NESA verb implies."""
import glob, html, re, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from restructure import SECTION_RE

BRIEF = ('Identify', 'Outline', 'Describe', 'Define', 'Distinguish', 'Represent', 'Present', 'Demonstrate', 'Use', 'Allocate')
BROAD = ('Investigate', 'Analyse', 'Assess', 'Evaluate', 'Research', 'Compare', 'Explore', 'Justify', 'Test and evaluate')
FEATURES = {'list': r'<(ul|ol)[\s>](?!.*syllabus-including)', 'table': r'<table', 'callout': r'class="callout',
            'example': r'(?i)example|e\.g\.|for instance', 'code': r'class="code-block', 'diagram': r'class="(mermaid|algo-trace)',
            'hsc': r'(?i)HSC writing sample|exam tip|sample answer|band 6'}

def words(h): return len(re.sub(r'<[^>]+>', ' ', h).split())

rows = []
for f in sorted(glob.glob('topics/*.html')):
    s = open(f, encoding='utf-8').read()
    for sid, inner in SECTION_RE.findall(s):
        m = re.search(r'<p class="syllabus-concept">📌 <em><strong>(.*?)</strong>', inner)
        if not m: continue
        verb = html.unescape(m.group(1))
        body = re.sub(r'<div class="(mermaid|code-block)".*?</div>', ' ', inner, flags=re.S)
        body = re.sub(r'<p class="(syllabus-concept|outcome-subtitle)">.*?</p>|<ul class="syllabus-including".*?</ul>|<h2.*?</h2>', '', body, flags=re.S)
        w = words(body)
        scope = 'brief' if verb.startswith(BRIEF) else 'broad' if verb.startswith(BROAD) else 'mid'
        flag = ''
        if scope == 'brief' and w > 700: flag = 'LONG'
        if w < {'brief': 120, 'mid': 180, 'broad': 250}[scope]: flag = 'THIN'
        feats = ','.join(k for k, p in FEATURES.items() if re.search(p, inner, re.S))
        missing = [k for k in ('example',) if k not in feats]
        rows.append((os.path.basename(f)[:22], sid[:24], verb[:26], scope, w, flag, feats))
for r in rows: print('%-22s %-24s %-26s %-5s %5d %-4s %s' % r)
