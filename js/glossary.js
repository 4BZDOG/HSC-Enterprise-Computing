/* ============================================================
   Glossary page: search, year and topic filters, A–Z index, deep links.
   Loaded only by topics/glossary.html. The term cards are the data:
   scripts/build-glossary.py reads them to write js/glossary-data.js.
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('glossary-search');
  const wrap = document.getElementById('search-wrapper');
  const clear = document.getElementById('search-clear');
  const count = document.getElementById('gl-count');
  const noResults = document.getElementById('no-results-msg');
  const groups = [...document.querySelectorAll('.glossary-group')];
  const filters = [...document.querySelectorAll('.gl-filter')];
  const topicSel = document.getElementById('gl-topic');
  const letters = [...document.querySelectorAll('.alpha-btn')];
  const total = document.querySelectorAll('.glossary-term').length;
  const topicCount = topicSel.options.length - 1;
  const hint = document.getElementById('search-k-hint');
  if (/Mac|iPhone|iPad/.test(navigator.platform)) hint.textContent = '⌘ K';
  input.placeholder = `Search ${total} term${total === 1 ? '' : 's'}`;

  // Index each card once: its title, all its text, and which years it belongs to.
  const cards = [...document.querySelectorAll('.glossary-term')].map(el => {
    const h3 = el.querySelector('h3');
    return {
      el, h3, title: h3.textContent,
      text: el.textContent.toLowerCase(),
      years: new Set([...el.querySelectorAll('.term-chips .chip')].map(c =>
        c.classList.contains('chip-y11') ? 'y11' : c.classList.contains('chip-y12') ? 'y12' : 'core')),
      topics: new Set([...el.querySelectorAll('.term-chips .chip')].map(c => c.textContent.trim()))
    };
  });

  const html = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Title as HTML, with any match of the query wrapped in <mark>.
  const mark = (title, q) => q
    ? html(title).replace(new RegExp(escRe(html(q)), 'ig'), m => `<mark>${m}</mark>`)
    : html(title);

  function apply() {
    const q = input.value.trim();
    const ql = q.toLowerCase();
    const on = filters.filter(f => f.getAttribute('aria-pressed') === 'true').map(f => f.dataset.filter);
    const topic = topicSel.value;
    let shown = 0;
    cards.forEach(c => {
      const hit = (!ql || c.text.includes(ql)) && (!on.length || on.some(y => c.years.has(y))) && (!topic || c.topics.has(topic));
      c.el.classList.toggle('hidden', !hit);
      c.h3.innerHTML = mark(c.title, hit ? q : '');
      if (hit) shown++;
    });
    groups.forEach(g => {
      const any = !!g.querySelector('.glossary-term:not(.hidden)');
      g.classList.toggle('hidden', !any);
      const btn = letters.find(l => l.getAttribute('href') === '#' + g.id);
      if (btn) btn.classList.toggle('is-empty', !any);
    });
    wrap.classList.toggle('has-val', !!q);
    noResults.classList.toggle('hidden', shown > 0 || total === 0);
    const filtered = q || on.length || topic;
    count.innerHTML = filtered
      ? `<strong>${shown}</strong> of ${total} terms${topic ? ' · ' + html(topic) : ''}`
      : `<strong>${total}</strong> terms · ${topicCount} topics · A–Z`;
    const url = new URL(location.href);
    q ? url.searchParams.set('q', q) : url.searchParams.delete('q');
    topic ? url.searchParams.set('topic', topic) : url.searchParams.delete('topic');
    history.replaceState(null, '', url);
  }

  let t;
  input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(apply, 90); });
  topicSel.addEventListener('change', apply);

  // Term counts beside each topic, and topic tags on the cards filter to that topic.
  [...topicSel.options].forEach(o => {
    if (!o.value) return;
    const n = cards.filter(c => c.topics.has(o.value)).length;
    o.textContent = `${o.value} (${n})`;
  });
  document.addEventListener('click', e => {
    const tag = e.target.closest('.chip-topic');
    if (!tag) return;
    topicSel.value = tag.dataset.topic;
    input.value = '';
    apply();
    const bar = document.getElementById('gl-toolbar');
    scrollTo({ top: bar.getBoundingClientRect().top + scrollY - 90,
               behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });
  clear.addEventListener('click', () => { input.value = ''; apply(); input.focus(); });
  filters.forEach(f => f.addEventListener('click', () => {
    f.setAttribute('aria-pressed', f.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    apply();
  }));
  document.getElementById('gl-reset')?.addEventListener('click', () => {
    input.value = '';
    filters.forEach(f => f.setAttribute('aria-pressed', 'false'));
    topicSel.value = '';
    apply();
  });

  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); input.focus(); input.select(); }
    if (e.key === 'Escape' && document.activeElement === input) { input.value = ''; apply(); input.blur(); }
  });

  // Scroll to a card or letter below the sticky bars, and flash a card on arrival.
  function go(id, flash) {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.closest('.hidden')) {
      input.value = '';
      filters.forEach(f => f.setAttribute('aria-pressed', 'false'));
      topicSel.value = '';
      apply();
    }
    const top = el.getBoundingClientRect().top + scrollY - 150;
    scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    history.replaceState(null, '', '#' + id + location.search);
    if (flash && el.classList.contains('glossary-term')) {
      el.classList.remove('gl-flash'); void el.offsetWidth; el.classList.add('gl-flash');
    }
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || !a.closest('.glossary-wrapper')) return;
    const id = a.getAttribute('href').slice(1);
    if (!id) return;
    e.preventDefault();
    go(id, id.startsWith('term-'));
  });

  // Highlight the letter in view.
  const spy = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    letters.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id));
  }), { rootMargin: '-20% 0px -75% 0px' });
  groups.forEach(g => spy.observe(g));

  // Deep links: ?q=term searches; #term-x jumps to and flashes that card.
  const q0 = new URL(location.href).searchParams.get('q');
  const t0 = new URL(location.href).searchParams.get('topic');
  if (t0 && [...topicSel.options].some(o => o.value === t0)) topicSel.value = t0;
  if (q0) input.value = q0;
  if (q0 || topicSel.value) apply();
  if (location.hash.startsWith('#term-')) setTimeout(() => go(location.hash.slice(1), true), 120);
});
