#!/usr/bin/env python3
"""Build js/glossary-data.js from topics/glossary.html.

Run after editing the glossary:  python3 scripts/build-glossary.py
Also fills any term that has no example from scripts/glossary_examples.py.
"""
import html, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'scripts'))
from glossary_examples import EXAMPLES

GLOSSARY = os.path.join(ROOT, 'topics', 'glossary.html')
OUT = os.path.join(ROOT, 'js', 'glossary-data.js')

# Extra spellings students will meet in the notes, keyed by term id, e.g.
#   'term-ux': ['UX', 'User Experience'],
# The auto-linker already matches each term's name, its bracketed abbreviation,
# plurals, hyphenated and joined forms and UK/US spellings ("Gantt chart", "Gantt charts",
# "DFD"/"data flow diagrams", "IaaS", "user interfaces"), so add only genuine alternative names.
EXTRA_ALIASES = {
    'term-agile-approach': ['agile', 'agile development', 'agile methodology'],
    'term-backup-rule': ['3-2-1 backup rule', '3-2-1 backup'],
    'term-bitmap-graphic': ['bitmap', 'bitmap image', 'raster image'],
    'term-boundary-data': ['boundary data', 'boundary test'],
    'term-business-email-compromise': ['BEC'],
    'term-erroneous-data': ['erroneous data', 'erroneous test'],
    'term-feasibility-study': ['feasibility check', 'feasibility'],
    'term-graph-network-theory': ['graph theory', 'network theory'],
    'term-hash-function': ['hashing'],
    'term-level-0-dfd': ['Level 0 DFD', 'context diagram'],
    'term-mfa': ['MFA', '2FA', 'two-factor authentication'],
    'term-minimum-viable-product': ['MVP'],
    'term-notifiable-data-breach': ['NDB', 'NDB scheme', 'eligible data breach'],
    'term-nudging': ['nudge', 'nudges', 'nudge theory'],
    'term-privacy-act': ['Privacy Act', 'Australian Privacy Principles', 'APP'],
    'term-rbac': ['RBAC'],
    'term-task-float': ['float time'],
    'term-vector-graphic': ['vector image'],
    'term-waterfall-approach': ['waterfall', 'waterfall model', 'waterfall (structured)'],
}

# Everyday words that should stay in the glossary but not be auto-linked in prose. Each of these is
# ordinary vocabulary in the notes (data, model, product, project, app, measure ...), a command word
# (evaluate, calculate, classify ...), the name of the course, or a word whose glossary meaning is
# narrower than the way it is often used (slice and dice in pie charts and dice rolls, node and edge in
# networks generally, dimension, database, and protocols, which the notes also use for Aboriginal and
# Torres Strait Islander community protocols). Linking them once per section would put a popover on
# almost every paragraph, or a wrong meaning on an ordinary sentence. A page can still link one by hand
# with <button type="button" class="gloss" data-term="term-node">node</button>.
# "Enterprise" is left out because nearly every mention in the notes is part of the
# course name "Enterprise Computing" (or "enterprise computing system").
NO_AUTOLINK = {
    'term-enterprise', 'term-enterprise-computing',
    'term-app', 'term-assets', 'term-automate', 'term-calculate', 'term-clarify', 'term-classify',
    'term-collaborate', 'term-critically-analyse-evaluate', 'term-cybersecurity', 'term-data',
    'term-database', 'term-dice', 'term-digital-technologies', 'term-dimension', 'term-edge',
    'term-evaluate', 'term-function', 'term-hardware', 'term-information', 'term-measure',
    'term-model', 'term-node', 'term-producing', 'term-product', 'term-project', 'term-protocols', 'term-slice',
    'term-visualisation',
}

text = lambda frag: html.unescape(re.sub(r'<.*?>', '', frag)).strip()
src = open(GLOSSARY, encoding='utf-8').read()

# 1. Add missing examples to the glossary page itself.
def add_example(m):
    block = m.group(0)
    tid = m.group(1)
    if 'term-example' in block or tid not in EXAMPLES:
        return block
    return re.sub(r'(</p>)', r'\1\n              <p class="term-example"><strong>Example:</strong> ' +
                  EXAMPLES[tid].replace('\\', '\\\\') + '</p>', block, count=1)

# Only terms whose card has no example yet (keeps the script idempotent).
has_example = set(re.findall(r'<div class="glossary-term" id="(term-[^"]+)">(?:(?!<div class="glossary-term").)*?class="term-example"', src, re.S))
src = re.sub(r'<div class="glossary-term" id="(term-[^"]+)">.*?</p>',
             lambda m: m.group(0) if m.group(1) in has_example else add_example(m), src, flags=re.S)
open(GLOSSARY, 'w', encoding='utf-8').write(src)

# 2. Emit the data file used by the inline popover.
terms = []
for part in re.split(r'(?=<div class="glossary-term" id=")', src)[1:]:
    tid = re.match(r'<div class="glossary-term" id="([^"]+)"', part).group(1)
    name = text(re.search(r'<h3[^>]*>(.*?)</h3>', part, re.S).group(1))
    paras = re.findall(r'<p( class="[^"]*")?>(.*?)</p>', part, re.S)
    definition = next((text(p) for c, p in paras if 'term-example' not in (c or '')), '')
    example = next((text(p).replace('Example:', '', 1).strip() for c, p in paras if 'term-example' in (c or '')), '')
    aliases = {name}
    paren = re.match(r'(.+?)\s*\((.+)\)$', name)
    if paren:
        aliases.add(paren.group(1).strip())
        # "(HTTPS)" is another name; "(Direct, Phased, Parallel, Pilot)" is a list, not a name.
        if ',' not in paren.group(2):
            aliases.add(paren.group(2).strip())
        aliases.discard(name)
    aliases = {a for a in aliases if ',' not in a}
    aliases |= set(EXTRA_ALIASES.get(tid, []))
    terms.append({'id': tid, 'name': name, 'aliases': sorted(aliases), 'def': definition, 'example': example,
                  'link': tid not in NO_AUTOLINK})

with open(OUT, 'w', encoding='utf-8') as f:
    f.write('/* Generated by scripts/build-glossary.py from topics/glossary.html. Do not edit. */\n')
    f.write('window.HSC_GLOSSARY = ' + json.dumps(terms, ensure_ascii=False, indent=0) + ';\n')
print(f'{len(terms)} terms, {sum(1 for t in terms if t["example"])} with examples')
