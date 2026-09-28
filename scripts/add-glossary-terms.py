#!/usr/bin/env python3
"""Insert any terms from scripts/glossary_new_terms.py that aren't in topics/glossary.html yet.

    python3 scripts/add-glossary-terms.py && python3 scripts/build-glossary.py && python3 scripts/site-chrome.py

The last step adds the topic icons to the new terms' topic tags.

Terms are placed alphabetically in their letter group; a missing letter group is created.
Each term is (id, name, [topic keys], definition, example); the topic keys are the ones in
TOPIC_CHIPS in scripts/glossary_new_terms.py (im, net, cyber, ds, dv, is, ep, toolkit, project).
"""
import os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'scripts'))
from glossary_new_terms import TERMS, TOPIC_CHIPS

PATH = os.path.join(ROOT, 'topics', 'glossary.html')
s = open(PATH, encoding='utf-8').read()
existing = set(re.findall(r'id="(term-[^"]+)"', s))


def card(t):
    tid, name, topics, definition, example = t
    chips = ''.join(f'\n                <span class="chip {TOPIC_CHIPS[k][0]}">{TOPIC_CHIPS[k][1]}</span>' for k in topics)
    return f'''            <div class="glossary-term" id="{tid}">
              <h3>{name}</h3>
              <div class="term-chips">{chips}
              </div>
              <p>{definition}</p>
              <p class="term-example"><strong>Example:</strong> {example}</p>
            </div>

'''


added = 0
for t in sorted(TERMS, key=lambda x: x[1].lower()):
    if t[0] in existing:
        continue
    letter = t[1][0].upper()
    if f'id="alpha-{letter}"' not in s:
        later = [g for g in re.findall(r'id="alpha-([A-Z])"', s) if g > letter]
        group = f'''        <!-- ════════════ {letter} ════════════ -->
        <div class="glossary-group" id="alpha-{letter}">
          <div class="glossary-divider">
            <div class="glossary-letter-header">{letter}</div>
            <div class="glossary-divider-line"></div>
          </div>
          <div class="glossary-terms-grid">

          </div>
          <a href="#alpha-jump" class="back-to-top-link">↑ Back to Top</a>
        </div>

'''
        if later:
            i = s.index(f'        <!-- ════════════ {min(later)} ════════════ -->')
        else:  # after the last letter group
            end = '<a href="#alpha-jump" class="back-to-top-link">↑ Back to Top</a>\n        </div>\n'
            i = s.rindex(end) + len(end) + 1
        s = s[:i] + group + s[i:]
        s = s.replace(f'<span class="alpha-btn disabled">{letter}</span>', f'<a href="#alpha-{letter}" class="alpha-btn">{letter}</a>')
    g0 = s.index(f'id="alpha-{letter}"')
    gi = s.index('<div class="glossary-terms-grid">', g0) + len('<div class="glossary-terms-grid">')
    grid = s[gi:s.index('<a href="#alpha-jump" class="back-to-top-link">', g0)]
    pos = None
    for m in re.finditer(r'\n\s*<div class="glossary-term" id="[^"]+">\s*<h3>(.*?)</h3>', grid):
        if re.sub('<.*?>', '', m.group(1)).lower() > t[1].lower():
            pos = gi + m.start() + 1
            break
    if pos is None:
        pos = gi + grid.rstrip().rfind('</div>')
    s = s[:pos] + card(t) + s[pos:]
    added += 1

open(PATH, 'w', encoding='utf-8').write(s)
print(f'{added} term(s) added')
