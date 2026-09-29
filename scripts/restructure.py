#!/usr/bin/env python3
"""Shared syllabus library, and a check that scripts/page_specs.py agrees with the syllabus.

    python3 scripts/restructure.py            # check every page spec
    python3 scripts/restructure.py <slug>     # check one page spec and list its sections

resources/nesa-syllabus-content.md is the source of truth. This module:

  * parses it (load_syllabus, load_outcomes),
  * splits a dot point into its bold leading verb(s) and the rest (dot_point_html),
  * pairs every syllabus dot point with its entry in scripts/page_specs.py
    (paired_spec) and stops with a clear message when the two disagree: a
    missing, extra or reordered dot point, a duplicate section id, or an
    outcome code that is not in the focus area's outcome list.

scripts/scaffold-page.py, scripts/check-site.py and scripts/build-mapping.py all
build on it, so a change to the syllabus file or the specs cannot slip through.
"""
import html
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'scripts'))
from page_specs import SPECS  # noqa: E402

SYLLABUS = os.path.join(ROOT, 'resources', 'nesa-syllabus-content.md')

# One <section id="…"> and its inner HTML (used by scripts/copy_audit.py).
SECTION_RE = re.compile(r'<section id="([^"]+)"[^>]*>(.*?)</section>', re.S)

# Leading command words that are more than one word. Every other dot point opens
# with a single verb ("Investigate", "Describe", "Use", ...). Derived from the
# 2022 syllabus; add to it if NESA's wording changes. dot_point_html() treats
# the first word as the verb when none of these match.
VERBS = (
    'Research, source, organise and store',
    'Filter, group and sort',
    'Design and develop',
    'Design and model',
    'Develop and implement',
    'Develop and publish',
    'Investigate and implement',
    'Explore and apply',
    'Interpret and present',
    'Select and use',
    'Verify and validate',
)


# ── Syllabus ────────────────────────────────────────────────────────────────

def load_syllabus():
    """{focus area title: [(subheading, [ {text, including[]} ])]}"""
    src = open(SYLLABUS, encoding='utf-8').read()
    areas = {}
    for block in re.split(r'^## Year 1[12] — ', src, flags=re.M)[1:]:
        title, body = block.split('\n', 1)
        subs = []
        for sub in re.split(r'^### ', body, flags=re.M)[1:]:
            name, rest = sub.split('\n', 1)
            points = []
            for line in rest.split('\n'):
                if line.startswith('- '):
                    points.append({'text': line[2:].strip(), 'including': []})
                elif line.startswith('    - '):
                    points[-1]['including'].append(line[6:].strip())
            subs.append((name.strip(), points))
        areas[title.strip()] = subs
    return areas


def load_area_outcomes():
    """{focus area title: [outcome codes]} from each area's *Outcomes:* line."""
    src = open(SYLLABUS, encoding='utf-8').read()
    out = {}
    for block in re.split(r'^## Year 1[12] — ', src, flags=re.M)[1:]:
        title, body = block.split('\n', 1)
        m = re.search(r'^\*Outcomes:\s*(.*?)\*\s*$', body, re.M)
        out[title.strip()] = re.findall(r'EC-1[12]-\d\d', m.group(1)) if m else []
    return out


def load_outcomes():
    """{'EC-11-01': 'describes how systems ...'} from the outcomes table."""
    src = open(SYLLABUS, encoding='utf-8').read()
    table = src.split('## Year 11', 1)[0]
    out = {}
    for m in re.finditer(r'\|\s*(EC-1[12]-\d\d)\s*\|\s*([^|]+?)\s*\|', table):
        out[m.group(1)] = m.group(2)
    # The table has two outcome columns per row; the second pair is matched by
    # scanning again from just after each first match.
    for m in re.finditer(r'\|\s*EC-11-\d\d\s*\|[^|]*\|\s*(EC-12-\d\d)\s*\|\s*([^|]+?)\s*\|', table):
        out[m.group(1)] = m.group(2)
    return out


def leading_verb(text):
    """The dot point's opening command word(s), exactly as written."""
    for v in sorted(VERBS, key=len, reverse=True):
        if text.startswith(v + ' '):
            return v
    return text.split(' ', 1)[0]


def dot_point_html(text):
    """The dot point with its leading verb(s) in <strong>, HTML-escaped."""
    verb = leading_verb(text)
    return f'<strong>{html.escape(verb)}</strong>{html.escape(text[len(verb):])}'


# ── Spec ↔ syllabus ─────────────────────────────────────────────────────────

def paired_spec(slug):
    """[(part name, [(dot point dict, section id, heading, outcomes)])] for one page.

    Raises SystemExit with a specific message if the spec and syllabus differ.
    """
    spec = SPECS[slug]
    area = spec['focus_area']
    syllabus = load_syllabus()
    if area not in syllabus:
        raise SystemExit(f'{slug}: focus area "{area}" is not in {os.path.relpath(SYLLABUS, ROOT)}')
    parts = syllabus[area]
    if len(parts) != len(spec['parts']):
        raise SystemExit(f'{slug}: the spec has {len(spec["parts"])} parts, NESA has {len(parts)}')
    allowed = set(load_area_outcomes().get(area, []))
    seen = set()
    result = []
    for n, ((name, points), entries) in enumerate(zip(parts, spec['parts']), 1):
        if len(points) != len(entries):
            raise SystemExit(f'{slug}, part {n} "{name}": the spec has {len(entries)} entries, NESA has {len(points)} dot points')
        rows = []
        for k, (point, (sid, heading, outcomes, starts)) in enumerate(zip(points, entries), 1):
            if not point['text'].startswith(starts):
                raise SystemExit(f'{slug}, part {n} entry {k} ("{sid}"): NESA\'s dot point is\n'
                                 f'    "{point["text"][:90]}"\n  but the spec expects it to start "{starts}"')
            if sid in seen:
                raise SystemExit(f'{slug}: section id "{sid}" is used twice')
            seen.add(sid)
            if not re.fullmatch(r'[a-z0-9]+(-[a-z0-9]+)*', sid):
                raise SystemExit(f'{slug}: section id "{sid}" must be lower-case kebab-case')
            codes = re.findall(r'EC-1[12]-\d\d', outcomes)
            if not 1 <= len(codes) <= 3 or ', '.join(codes) != outcomes:
                raise SystemExit(f'{slug}, "{sid}": outcomes must be 1-3 codes separated by ", " (got "{outcomes}")')
            bad = [c for c in codes if c not in allowed]
            if bad:
                raise SystemExit(f'{slug}, "{sid}": {", ".join(bad)} is not in the outcome list for "{area}"')
            rows.append((point, sid, heading, outcomes))
        result.append((name, rows))
    return result


if __name__ == '__main__':
    slugs = sys.argv[1:] or list(SPECS)
    for slug in slugs:
        pairs = paired_spec(slug)
        total = sum(len(rows) for _, rows in pairs)
        print(f'{slug}: {len(pairs)} parts, {total} dot points: spec and syllabus agree')
        if len(slugs) == 1:
            for name, rows in pairs:
                print(f'  {name}')
                for point, sid, heading, outcomes in rows:
                    print(f'    #{sid:<28} {heading}  ({outcomes})')
