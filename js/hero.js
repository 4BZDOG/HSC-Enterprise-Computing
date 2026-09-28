/* ============================================================
   Home hero: the decorative "live dashboard" illustration.

   The SVG in index.html (.hero-viz) is fully drawn without this script.
   With it (and unless the visitor prefers reduced motion) the chart line
   draws in, the bars grow and the network nodes pulse, then the chart,
   bars and headline figure drift gently every few seconds like a live
   feed. Purely decorative: the illustration is aria-hidden and nothing
   depends on it.
   ============================================================ */
(() => {
  const viz = document.querySelector('.hero-viz');
  if (!viz) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const line = viz.querySelector('.hv-line');
  const area = viz.querySelector('.hv-area');
  const dot = viz.querySelector('.hv-dot');
  const halo = viz.querySelector('.hv-halo');
  const delta = viz.querySelector('.hv-delta-val');
  const value = viz.querySelector('.hv-value');
  const bars = Array.from(viz.querySelectorAll('.hv-bar'));

  // Chart geometry and starting data (matches the markup in index.html)
  const X0 = 40, X1 = 356, BASE = 216, TOP = 104, LOW = 196;
  let ys = [176, 158, 168, 142, 152, 128, 138, 116, 126, 108, 120, 112];
  const xs = ys.map((_, i) => X0 + ((X1 - X0) * i) / (ys.length - 1));

  const fmt = n => n.toFixed(1);
  function draw(points) {
    const d = points.map((y, i) => `${i ? 'L' : 'M'}${fmt(xs[i])} ${fmt(y)}`).join('');
    if (line) line.setAttribute('d', d);
    if (area) area.setAttribute('d', `${d}L${X1} ${BASE}L${X0} ${BASE}Z`);
    const last = points[points.length - 1];
    if (dot) dot.setAttribute('cy', fmt(last));
    if (halo) halo.setAttribute('cy', fmt(last));
  }
  draw(ys);

  // Start the draw-in
  requestAnimationFrame(() => viz.classList.add('is-live'));
  // Once a bar has grown, hand it back to the CSS transition so later changes ease
  bars.forEach(b => b.addEventListener('animationend', () => { b.style.animation = 'none'; }));

  const ease = t => 1 - Math.pow(1 - t, 3);
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  let tween = 0;

  function tick() {
    // Nudge the last few points, keeping a gentle upward trend
    const from = ys.slice();
    const to = ys.map((y, i) => (i < ys.length - 5 ? y : clamp(y + (Math.random() - 0.55) * 18, TOP, LOW)));
    const t0 = performance.now();
    cancelAnimationFrame(tween);
    const step = now => {
      const k = ease(clamp((now - t0) / 900, 0, 1));
      draw(from.map((y, i) => y + (to[i] - y) * k));
      if (k < 1) tween = requestAnimationFrame(step); else ys = to;
    };
    tween = requestAnimationFrame(step);

    bars.forEach(b => b.style.setProperty('--s', (0.32 + Math.random() * 0.68).toFixed(2)));
    if (delta) delta.textContent = (9 + Math.random() * 7).toFixed(1) + '%';
    if (value) value.textContent = (140 + Math.random() * 18).toFixed(1);
  }

  // Run only while the hero is on screen and the tab is visible
  let timer = 0, onScreen = true;
  const sync = () => {
    clearInterval(timer);
    if (onScreen && !document.hidden) timer = setInterval(tick, 2800);
  };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { onScreen = entries[0].isIntersecting; sync(); }).observe(viz);
  }
  document.addEventListener('visibilitychange', sync);
  sync();
})();
