/* ============================================================
   Topic page header: motion and the slim bar that follows you.

   - The four figures count up when the page opens.
   - The illustration tilts a little towards the pointer (mouse only).
   - Once the header has scrolled away, a slim bar under the navigation
     keeps the topic's name, your progress and the Start / Continue link in view.

   Everything here is decoration or convenience: with no script, or with
   reduced motion, the header still works. It reads the progress that
   progress.js has already painted into the header.
   ============================================================ */
(() => {
  const header = document.querySelector('.topic-header');
  if (!header) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');

  /* ── Count-up ── */
  if (!reduce.matches) {
    header.querySelectorAll('.topic-stat-num').forEach((el, i) => {
      const m = /^(~?)(\d+)$/.exec(el.textContent.trim());
      if (!m) return;
      const prefix = m[1], end = parseInt(m[2], 10), final = el.textContent;
      if (end < 2) return;
      el.textContent = prefix + '0';
      const start = performance.now() + 380 + i * 90, dur = 900;
      const tick = now => {
        const t = Math.min(1, Math.max(0, (now - start) / dur));
        const e = 1 - Math.pow(1 - t, 3);
        el.textContent = t >= 1 ? final : prefix + Math.round(end * e);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  /* ── Illustration tilt ── */
  const viz = header.querySelector('.topic-viz svg');
  if (viz && fine.matches && !reduce.matches) {
    let raf = 0, rx = 0, ry = 0;
    const apply = () => {
      raf = 0;
      viz.style.transform = rx || ry ? `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)` : '';
    };
    header.addEventListener('pointermove', e => {
      const r = viz.getBoundingClientRect();
      const dx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)));
      const dy = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)));
      ry = dx * 7; rx = -dy * 5;
      if (!raf) raf = requestAnimationFrame(apply);
    }, { passive: true });
    header.addEventListener('pointerleave', () => { rx = 0; ry = 0; if (!raf) raf = requestAnimationFrame(apply); });
  }

  /* ── Slim bar ── */
  const title = header.querySelector('h1');
  const start = header.querySelector('[data-start]');
  if (!title || !start || !('IntersectionObserver' in window)) return;

  const bar = document.createElement('div');
  bar.className = 'topic-bar';
  bar.setAttribute('aria-hidden', 'true');
  const icon = header.querySelector('.topic-hero-icon');
  bar.innerHTML =
    `<span class="topic-bar-icon"></span>` +
    `<span class="topic-bar-title"></span>` +
    `<span class="topic-bar-prog"><span class="topic-bar-fill"></span></span>` +
    `<span class="topic-bar-count"></span>` +
    `<a class="topic-bar-go" tabindex="-1"></a>`;
  if (icon) bar.querySelector('.topic-bar-icon').innerHTML = icon.innerHTML;
  bar.querySelector('.topic-bar-title').textContent = title.textContent;
  document.body.appendChild(bar);

  const go = bar.querySelector('.topic-bar-go');
  const sync = () => {
    go.setAttribute('href', start.getAttribute('href') || '#');
    go.textContent = start.textContent.trim();
    const meter = header.querySelector('.pg-meter');
    const txt = meter ? meter.querySelector('.pg-text').textContent : '';
    const m = /(\d+) of (\d+)/.exec(txt);
    bar.querySelector('.topic-bar-count').textContent = m ? `${m[1]}/${m[2]}` : '';
    bar.style.setProperty('--tb-pg', m && +m[2] ? (+m[1] / +m[2]).toFixed(3) : 0);
  };
  const place = () => {
    const nav = document.querySelector('.navbar');
    bar.style.setProperty('--tb-top', (nav ? Math.max(0, nav.getBoundingClientRect().bottom) : 0) + 'px');
  };
  sync();
  new MutationObserver(sync).observe(header, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['href', 'style'] });

  const set = on => {
    if (on) { sync(); place(); }
    bar.classList.toggle('is-on', on);
    bar.setAttribute('aria-hidden', on ? 'false' : 'true');
    go.tabIndex = on ? 0 : -1;
  };
  const io = new IntersectionObserver(([e]) => set(!e.isIntersecting && e.boundingClientRect.top < 0), { rootMargin: '-70px 0px 0px 0px' });
  io.observe(header);
  window.addEventListener('scroll', () => { if (bar.classList.contains('is-on')) place(); }, { passive: true });
  window.addEventListener('resize', place);
})();
