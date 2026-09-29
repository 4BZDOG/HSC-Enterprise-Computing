"""Shared page skeleton pieces: head, navigation shell, lightbox and script tags.

Used by scripts/scaffold-page.py (focus-area pages and Resources stubs) and
scripts/build-resources.py. The navigation, mobile menu and footer come out as
empty shells here; scripts/site-chrome.py fills them (and keeps them in step on
every page), so nothing here lists pages, icons or links.
"""
import html
import importlib.util
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

_spec = importlib.util.spec_from_file_location('site_chrome', os.path.join(ROOT, 'scripts', 'site-chrome.py'))
chrome = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(chrome)

SITE_URL = 'https://4bzdog.github.io/HSC-Enterprise-Computing/'
REPO_URL = 'https://github.com/4BZDOG/HSC-Enterprise-Computing'
MAPPING_URL = REPO_URL + '/blob/main/resources/Syllabus-Mapping.md'
FULL_NAME = 'HSC Enterprise Computing Notes'
TITLE_SUFFIX = 'HSC Enterprise Computing'
THEME_COLOUR = '#0B1B2E'

FAVICON = ("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>"
           "<rect width='100' height='100' rx='22' fill='%230A7C86'/>"
           "<rect x='20' y='52' width='16' height='30' rx='3' fill='%23fff'/>"
           "<rect x='42' y='32' width='16' height='50' rx='3' fill='%23E8A317'/>"
           "<rect x='64' y='18' width='16' height='64' rx='3' fill='%23fff'/></svg>")


def esc(s):
    return html.escape(s, quote=True)


def head(*, title, description, path, og_type='article', crumbs=None, description_note='', full_title=None, ld_extra=None):
    """<!DOCTYPE> through </head>. `path` is the page's path under the site root ('' for home).

    Local css/js links get ?v= cache-busting from site-chrome.py's versioned(); pages in
    topics/ reach css/ with ../ , the home page and 404 without.
    """
    up = '../' if path.startswith('topics/') else ''
    canonical = SITE_URL + path
    full_title = full_title or f'{title} | {TITLE_SUFFIX}'
    note = f'  {description_note}\n' if description_note else ''
    ld = ''
    if ld_extra:
        ld = ('  <script type="application/ld+json">\n  '
              + json.dumps(ld_extra, indent=2, ensure_ascii=False).replace('\n', '\n  ') + '\n  </script>\n')
    if crumbs:
        items = [{'@type': 'ListItem', 'position': i, 'name': n, 'item': u} for i, (n, u) in enumerate(crumbs, 1)]
        ld = ('  <script type="application/ld+json">\n  '
              + json.dumps({'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': items}, indent=2, ensure_ascii=False).replace('\n', '\n  ')
              + '\n  </script>\n')
    return f'''<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{esc(full_title)}</title>
  <!-- ── SEO ── -->
  <link rel="canonical" href="{canonical}" />
  <meta name="robots" content="index, follow" />
  <meta property="og:type" content="{og_type}" />
  <meta property="og:title" content="{esc(full_title)}" />
  <meta property="og:description" content="{esc(description)}" />
  <meta property="og:url" content="{canonical}" />
  <meta property="og:image" content="{SITE_URL}og-image.png" />
  <meta property="og:image:alt" content="{FULL_NAME}: NESA NSW" />
  <meta property="og:site_name" content="{FULL_NAME}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{esc(full_title)}" />
  <meta name="twitter:description" content="{esc(description)}" />
  <meta name="twitter:image" content="{SITE_URL}og-image.png" />
{ld}  <link rel="icon" href="{FAVICON}" />
  <meta name="theme-color" content="{THEME_COLOUR}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
{note}  <meta name="description" content="{esc(description)}" />
  <!-- Theme init: prevents flash of wrong theme. The ec- prefix keeps this site's storage apart from sister sites on the same origin. -->
  <script>(function(){{try{{var t=localStorage.getItem('ec-theme')||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);}}catch(e){{}}}})()</script>
  <link rel="stylesheet" href="{up}css/styles.css?v=0" />
  <link rel="stylesheet" href="{up}css/theme.css?v=0" />
</head>
'''


def nav_shell(home):
    """Navigation bar and an empty mobile menu; site-chrome.py fills the menus, icons and links."""
    def dd(cls, label, badge):
        return f'''        <li class="nav-dropdown{cls}">
          <button type="button" class="nav-dropdown-btn" aria-haspopup="true" aria-expanded="false">
            {label}
            {badge}
            <svg class="nav-chevron" viewBox="0 0 24 24" aria-hidden="true"><polyline points="6 9 12 15 18 9" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none" stroke="currentColor"/></svg>
          </button>
          <div class="nav-dropdown-menu" role="menu">
          </div>
        </li>
'''
    groups = {g: (lbl, badge) for g, lbl, badge in chrome.GROUPS}
    return f'''<body>

  <!-- ── Navigation ── -->
  <nav class="navbar" role="navigation" aria-label="Main navigation">
    <div class="nav-inner">
      <a href="{home}" class="nav-brand">
        <div class="nav-logo" aria-hidden="true">{chrome.BRAND_GLYPH}</div>
        <div>
          <div class="nav-title">{chrome.SITE_NAME}</div>
          <div class="nav-subtitle">NESA NSW HSC</div>
        </div>
      </a>

      <ul class="nav-links">
        <li><a href="{home}" class="nav-home">Home</a></li>
{dd(' nav-dropdown-y11', *groups['y11'])}{dd(' nav-dropdown-y12', *groups['y12'])}{dd('', *groups['core'])}      </ul>

      <div class="nav-actions">
        <button type="button" class="btn-icon" id="theme-toggle" aria-label="Toggle theme"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        <button type="button" class="btn-icon hamburger" id="hamburger" aria-label="Open menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </nav>

  <!-- ── Mobile Menu ── -->
  <div class="mobile-menu" id="mobile-menu" role="dialog" aria-label="Navigation menu">
  </div>

'''


FOOTER_SHELL = '''  <!-- ── Footer ── -->
  <footer>
  </footer>
'''

LIGHTBOX = '''  <!-- ═══════════════════════════════════════════════════════ -->
  <!-- Diagram Lightbox Modal -->
  <!-- ═══════════════════════════════════════════════════════ -->
  <div class="lightbox-modal" id="diagram-lightbox" role="dialog" aria-labelledby="lightbox-title" aria-hidden="true">
    <div class="lightbox-overlay"></div>
    <div class="lightbox-container">
      <div class="lightbox-header">
        <h2 id="lightbox-title" class="lightbox-title">Diagram View</h2>
        <button type="button" class="lightbox-close" aria-label="Close diagram view">✕</button>
      </div>
      <div class="lightbox-canvas">
        <div class="lightbox-content" id="lightbox-content"></div>
      </div>
      <div class="lightbox-controls">
        <button type="button" class="lightbox-btn" id="zoom-out" aria-label="Zoom out">−</button>
        <span class="lightbox-zoom-level" id="zoom-level">100%</span>
        <button type="button" class="lightbox-btn" id="zoom-in" aria-label="Zoom in">+</button>
        <button type="button" class="lightbox-btn" id="reset-view" aria-label="Reset view">⟲</button>
      </div>
      <div class="lightbox-info">
        <p>Scroll to zoom • Drag to pan • <kbd>Esc</kbd> to close</p>
      </div>
    </div>
  </div>
'''


def scripts(*, up='../', quiz_slug=None, diagrams=True, progress=True, lightbox=True):
    """The script tags every content page ends with (order matters: data before main.js)."""
    lines = [f'  <script src="{up}js/glossary-data.js?v=0"></script>']
    if quiz_slug:
        lines += [f'  <script src="{up}js/quizzes/{quiz_slug}.js?v=0"></script>',
                  f'  <script src="{up}js/quiz.js?v=0" defer></script>']
    if diagrams:
        lines += [f'  <script src="{up}js/nesa-diagram-data.js?v=0"></script>',
                  f'  <script src="{up}js/nesa-diagrams.js?v=0" defer></script>']
    lines.append(f'  <script src="{up}js/main.js?v=0"></script>')
    out = '\n'.join(lines) + '\n'
    if lightbox:
        out += LIGHTBOX
    if progress:
        out += f'  <script src="{up}js/progress.js?v=0" defer></script>\n'
    return out + '</body>\n</html>\n'


def write_page(rel_path, text):
    """Write a page, then let site-chrome.py fill the shells and version the assets."""
    path = os.path.join(ROOT, rel_path)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    chrome.apply(path)
    return path
