/* Animated diagram: K-nearest neighbour classification, and why K matters.
   Data Science and Intelligent Systems › machine learning and statistical modelling (classification). */
(() => {
  // Known plants: [petal length, petal width, species]
  const DATA = [
    [5.6, 5.65, 'B'], [4.0, 5.6, 'A'], [4.4, 3.8, 'A'], [6.2, 3.6, 'B'], [6.8, 5.6, 'B'],
    [2.5, 3.0, 'A'], [3.0, 1.8, 'A'], [1.8, 4.6, 'A'], [2.2, 6.4, 'A'], [3.4, 7.6, 'A'],
    [7.5, 7.2, 'B'], [8.4, 6.0, 'B'], [7.8, 8.6, 'B'], [8.8, 4.2, 'B']
  ];
  const NEW = [5, 5];
  const dist = p => Math.hypot(p[0] - NEW[0], p[1] - NEW[1]);
  const ORDER = DATA.map((p, i) => i).sort((a, b) => dist(DATA[a]) - dist(DATA[b]));
  const VARIANTS = { 1: 'K = 1', 3: 'K = 3', 5: 'K = 5' };
  const NAME = { A: 'Species A', B: 'Species B' };

  function setup(s) {
    const L = s.L, k = s.k = +s.variant;
    const [px, py, pw, ph] = L.plot;
    const plot = s.plot(s.root, { x: px, y: py, w: pw, h: ph, xr: [0, 10], yr: [0, 9], xTicks: [0, 2, 4, 6, 8, 10], yTicks: [0, 3, 6, 9], xLabel: 'petal length', yLabel: 'petal width' });
    const X = s.X = plot.X, Y = s.Y = plot.Y;
    const unit = X(1) - X(0);
    const cx = X(NEW[0]), cy = Y(NEW[1]);

    // The K circle reaches halfway between the Kth and the next neighbour
    s.radius = unit * (dist(DATA[ORDER[k - 1]]) + dist(DATA[ORDER[k]])) / 2;
    s.kCircle = s.el('circle', { cx, cy, r: 0, class: 'pa-knn-ring' });
    s.lines = DATA.map(p => s.el('line', { x1: cx, y1: cy, x2: cx, y2: cy, class: 'pa-resid' }));
    s.lines.forEach(l => s.set(l, { o: 0 }));
    const dots = s.g(s.root);
    dots.setAttribute('filter', 'url(#pa-cut)');
    s.dots = DATA.map(([x, y, c]) => (c === 'A'
      ? s.el('circle', { cx: X(x), cy: Y(y), r: 7.5, class: 'f-sage' }, dots)
      : s.el('rect', { x: X(x) - 7, y: Y(y) - 7, width: 14, height: 14, rx: 2, class: 'f-terra' }, dots)));

    s.newbie = s.g(s.front, null, { x: cx, y: cy, o: 0 });
    const art = s.g(s.newbie);
    art.setAttribute('filter', 'url(#pa-cut)');
    s.newShape = s.el('circle', { r: 11, class: 'f-plum' }, art);
    s.newMark = s.text(s.newbie, '?', { y: 0, valign: 'middle', cls: 'pa-t-lg pa-on' });

    // Legend and the vote
    const [lx, ly, lw] = L.panel;
    const legend = s.g(s.root, null, { x: lx, y: ly });
    s.el('circle', { cx: 10, cy: 0, r: 7, class: 'f-sage' }, legend);
    s.text(legend, NAME.A, { x: 24, y: 0, anchor: 'start', valign: 'middle', cls: 'pa-t-sm' });
    s.el('rect', { x: lw / 2 + 3, y: -7, width: 14, height: 14, rx: 2, class: 'f-terra' }, legend);
    s.text(legend, NAME.B, { x: lw / 2 + 24, y: 0, anchor: 'start', valign: 'middle', cls: 'pa-t-sm' });

    const card = s.card = s.g(s.root, null, { x: lx, y: ly + 26, o: 0 });
    const c = s.g(card);
    c.setAttribute('filter', 'url(#pa-cut)');
    s.el('rect', { width: lw, height: 124, rx: 6, class: 'f-paper' }, c);
    s.text(card, k === 1 ? 'The nearest neighbour votes' : `The ${k} nearest vote`, { x: 14, y: 22, anchor: 'start', cls: 'pa-cert-title' });
    s.votes = ['A', 'B'].map((cls, i) => {
      s.text(card, NAME[cls], { x: 14, y: 50 + i * 26, anchor: 'start', valign: 'middle', cls: 'pa-t-sm' });
      return s.text(card, '0', { x: lw - 16, y: 50 + i * 26, anchor: 'end', valign: 'middle', cls: 'pa-mono pa-strong', size: 14 });
    });
    s.verdict = s.text(card, '', { x: lw / 2, y: 108, cls: 'pa-t pa-strong' });

    const wins = { A: 0, B: 0 };
    ORDER.slice(0, k).forEach(i => wins[DATA[i][2]]++);
    s.wins = wins;
    s.winner = wins.A > wins.B ? 'A' : 'B';
  }

  const beats = k => [
    { say: 'Each mark is a plant we already know: *Species A* (green circles) or *Species B* (red squares), plotted by petal length and width.' },
    {
      say: "A new plant arrives. KNN doesn't train a model first: it keeps every known plant and compares the new one with all of them.",
      async run(s) { await s.pop(s.newbie); s.ring(s.X(NEW[0]), s.Y(NEW[1]), { r: 16 }); }
    },
    {
      say: 'It measures the *distance* from the new plant to every known plant: the straight-line (Euclidean) distance.',
      async run(s) {
        const jobs = s.lines.map((l, i) => {
          const [x, y] = DATA[i];
          s.set(l, { o: 1 });
          return s.tween({ dur: 700, delay: i * 40, ease: 'out' }, t => {
            l.setAttribute('x2', s.X(NEW[0]) + (s.X(x) - s.X(NEW[0])) * t);
            l.setAttribute('y2', s.Y(NEW[1]) + (s.Y(y) - s.Y(NEW[1])) * t);
          });
        });
        await s.all(jobs);
      }
    },
    {
      say: `It keeps only the *K nearest*. With K = ${k}, a circle grows until it holds ${k} neighbour${k > 1 ? 's' : ''}.`,
      async run(s) {
        await s.tween({ dur: 1100, ease: 'inOut' }, t => s.kCircle.setAttribute('r', s.radius * t));
        const near = new Set(ORDER.slice(0, k));
        await s.all(s.lines.map((l, i) => (near.has(i) ? null : s.hide(l, { dur: 300 }))));
        ORDER.slice(0, k).forEach((i, n) => {
          const [x, y] = DATA[i];
          s.ring(s.X(x), s.Y(y), { r: 12, delay: n * 120, cls: DATA[i][2] === 'A' ? 'is-good' : 'is-bad' });
        });
        await s.wait(200 + k * 120);
      }
    },
    {
      say: {
        1: 'With K = 1, the single nearest plant decides: Species B. One unusual neighbour can swing the answer, which is *overfitting* to noise.',
        3: 'The 3 neighbours vote: 2 for A, 1 for B. Species A wins, so the closest plant is outvoted. An odd K means a two-way vote can never tie.',
        5: 'The 5 neighbours vote: 3 for B, 2 for A. Species B wins again. As K grows the answer steadies, but too large a K drowns out local detail (*underfitting*).'
      }[k],
      async run(s) {
        await s.pop(s.card, { from: .8 });
        await s.all(['A', 'B'].map((c, i) => s.count(s.votes[i], 0, s.wins[c], { dur: 500 })));
        s.verdict.textContent = '→ ' + NAME[s.winner];
        s.verdict.classList.add(s.winner === 'A' ? 'is-good' : 'is-bad');
        s.newShape.setAttribute('class', s.winner === 'A' ? 'f-sage' : 'f-terra');
        s.newMark.textContent = s.winner;
        s.newMark.setAttribute('class', 'pa-t-lg pa-on pa-strong');
        await s.hop(s.newbie, { h: 8 });
        s.burst(s.X(NEW[0]), s.Y(NEW[1]), { n: 8, spread: 28, tones: [s.winner === 'A' ? 'sage' : 'terra', 'mustard'] });
      }
    }
  ];

  HSCAnim.define('knn', {
    title: 'K-nearest neighbour: classifying a new plant, and why K matters',
    variantsLabel: 'Neighbours',
    layouts: {
      wide: { size: [760, 410], plot: [70, 20, 380, 342], panel: [510, 70, 220] },
      tall: { size: [400, 560], plot: [56, 14, 330, 297], panel: [60, 390, 300] }
    },
    setup,
    variants: Object.keys(VARIANTS).map(id => ({ id, label: VARIANTS[id], beats: beats(+id) }))
  });
})();
