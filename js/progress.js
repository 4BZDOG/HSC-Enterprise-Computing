/* ============================================================
   Reading progress: remembers which syllabus sections a student
   has opened. A section counts as opened once its content has been
   on screen, expanded, for a moment. Stored only in this browser.
   ============================================================ */
(() => {
  const KEY = 'ec-progress-v1';   // ec- prefix: the site shares an origin with sister sites
  const DWELL_MS = 1200;

  const load = () => {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; }
    catch { return {}; }
  };
  const save = data => {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
  };
  const pathOf = href => new URL(href, location.href).pathname;

  function meter(seen, total, label) {
    const el = document.createElement('div');
    el.className = 'pg-meter';
    el.innerHTML =
      `<span class="pg-bar" aria-hidden="true"><span class="pg-fill"></span></span>` +
      `<span class="pg-text"></span>`;
    update(el, seen, total, label);
    return el;
  }
  function update(el, seen, total, label) {
    el.style.setProperty('--pg', total ? seen / total : 0);
    el.classList.toggle('pg-done', total > 0 && seen >= total);
    if (label) el.dataset.label = label;
    el.querySelector('.pg-text').textContent = `${seen} of ${total} ${el.dataset.label}`;
  }

  /* ── Topic pages ── */
  function initTopic() {
    const sections = Array.from(document.querySelectorAll('.content-body section[id]'))
      .filter(s => s.querySelector(':scope > h2.syllabus-phase'));
    if (!sections.length) return;

    const page = pathOf(location.href);
    const data = load();
    const rec = data[page] || { s: [] };
    const seen = new Set(rec.s.filter(id => sections.some(s => s.id === id)));
    const total = sections.length;

    const persist = () => {
      const d = load();
      d[page] = { t: total, s: Array.from(seen) };
      save(d);
    };
    persist(); // records the section count so the home page can show progress

    const meters = [];
    const refresh = () => meters.forEach(m => update(m, seen.size, total));

    // Header meter
    const meta = document.querySelector('.topic-header-meta');
    if (meta) {
      const m = meter(seen.size, total, 'sections opened');
      m.classList.add('pg-header');
      meta.appendChild(m);
      meters.push(m);
    }

    // Sidebar meter with a reset control
    const toc = document.querySelector('.sidebar .toc-list');
    if (toc) {
      const box = document.createElement('div');
      box.className = 'pg-sidebar';
      const m = meter(seen.size, total, 'opened');
      const reset = document.createElement('button');
      reset.type = 'button';
      reset.className = 'pg-reset';
      reset.textContent = 'Reset';
      reset.setAttribute('aria-label', 'Reset reading progress for this page');
      reset.addEventListener('click', () => {
        if (!confirm('Clear which sections you have opened on this page?')) return;
        seen.clear();
        persist();
        sections.forEach(mark);
        refresh();
      });
      box.append(m, reset);
      toc.parentNode.insertBefore(box, toc);
      meters.push(m);
    }

    // Per-section markers: a stamp on the heading, a tick in the contents
    function mark(section) {
      const on = seen.has(section.id);
      const h2 = section.querySelector(':scope > h2.syllabus-phase');
      let stamp = h2.querySelector('.pg-stamp');
      if (!stamp) {
        stamp = document.createElement('span');
        stamp.className = 'pg-stamp';
        stamp.textContent = 'Opened';
        const chev = h2.querySelector('.section-chevron');
        h2.insertBefore(stamp, chev);
      }
      h2.classList.toggle('pg-seen', on);
      document.querySelectorAll(`.toc-list a[href="#${CSS.escape(section.id)}"]`).forEach(a => {
        a.classList.add('pg-tracked');
        a.classList.toggle('pg-seen', on);
        let sr = a.querySelector('.pg-sr');
        if (!sr) { sr = document.createElement('span'); sr.className = 'sr-only pg-sr'; a.appendChild(sr); }
        sr.textContent = on ? ' (opened)' : ' (not opened yet)';
      });
    }
    sections.forEach(mark);

    if (!('IntersectionObserver' in window)) return;
    const timers = new Map();
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        const section = e.target.closest('section');
        if (!section || seen.has(section.id)) return;
        const collapsed = section.querySelector(':scope > h2.section-collapsed');
        if (e.isIntersecting && !collapsed) {
          if (!timers.has(section)) {
            timers.set(section, setTimeout(() => {
              timers.delete(section);
              seen.add(section.id);
              persist();
              mark(section);
              refresh();
              io.unobserve(e.target);
            }, DWELL_MS));
          }
        } else {
          clearTimeout(timers.get(section));
          timers.delete(section);
        }
      });
    }, { threshold: 0, rootMargin: '-25% 0px -25% 0px' });

    sections.forEach(s => {
      const body = s.querySelector(':scope > .section-body') || s;
      if (!seen.has(s.id)) io.observe(body);
    });
    // Re-check a section as soon as it is expanded.
    document.addEventListener('click', e => {
      const h2 = e.target.closest?.('h2.syllabus-phase');
      if (!h2) return;
      const body = h2.parentElement.querySelector(':scope > .section-body');
      if (body && !seen.has(h2.parentElement.id)) { io.unobserve(body); io.observe(body); }
    });
  }

  /* ── Home page: progress on each topic card ── */
  function initHome() {
    const cards = document.querySelectorAll('a.topic-card[href], .topic-card a[href]');
    if (!cards.length) return;
    const data = load();
    cards.forEach(el => {
      const card = el.closest('.topic-card') || el;
      if (card.querySelector('.pg-meter')) return;
      const rec = data[pathOf(el.getAttribute('href'))];
      if (!rec || !rec.t) return;
      const m = meter(Math.min(rec.s.length, rec.t), rec.t, 'opened');
      m.classList.add('pg-card');
      (card.querySelector('.card-desc') || card).insertAdjacentElement('afterend', m);
    });
  }

  function init() { initTopic(); initHome(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
