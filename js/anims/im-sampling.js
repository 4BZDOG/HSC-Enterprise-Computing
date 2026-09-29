/* Still diagram (concept): how sampling rate and bit depth decide how closely a digital sound copies the original wave.
   Interactive media and the user experience › Digitising assets and compression. */
(() => {
  // one smooth "analogue" wave, two cycles wide, from 0 to 1 across the plot
  const wave = t => Math.sin(t * 4 * Math.PI);
  HSCAnim.define('im-sampling', {
    still: true,
    title: 'Concept diagram: sampling rate and bit depth',
    alt: 'Four small graphs of the same smooth sound wave. Top left, a low sampling rate of 8 samples: the joined-up copy is jagged and misses the shape. Top right, a high sampling rate of 32 samples: the copy follows the wave closely. Bottom left, a low bit depth of 2 bits, which allows only 4 heights: the copy is a coarse staircase. Bottom right, a higher bit depth of 4 bits, which allows 16 heights: the staircase is fine. Sampling rate is how often the wave is measured; bit depth is how finely each measurement is recorded.',
    layouts: { wide: { size: [760, 440], minWidth: 760 }, tall: { size: [400, 850] } },
    setup(s) {
      const c = s.compact;
      const W = 320, H = 130;
      function panel(x, y, title, sub, opts) {
        const px = (t) => x + t * W, py = (v) => y + H / 2 - v * (H / 2 - 10);
        s.text(s.root, title, { x: x + W / 2, y: y - 30, cls: 'pa-name' });
        s.text(s.root, sub, { x: x + W / 2, y: y - 12, cls: 'pa-t', size: 13 });
        s.el('rect', { x, y, width: W, height: H, rx: 8, class: 'f-paper pa-card-edge' }, s.back);
        s.el('line', { x1: x, x2: x + W, y1: y + H / 2, y2: y + H / 2, class: 'pa-axis' }, s.back);
        // original wave
        let d = '';
        for (let i = 0; i <= 160; i++) { const t = i / 160; d += (i ? 'L' : 'M') + px(t).toFixed(1) + ' ' + py(wave(t)).toFixed(1); }
        s.el('path', { d, class: 'pa-loss' }, s.root);
        const n = opts.n, levels = opts.levels;
        const q = v => levels ? Math.round((v + 1) / 2 * (levels - 1)) / (levels - 1) * 2 - 1 : v;
        // samples (n points, the last one on the right edge)
        const pts = [];
        for (let i = 0; i < n; i++) { const t = n === 1 ? 0 : i / (n - 1); pts.push([t, q(wave(t))]); }
        if (opts.staircase) {
          let p = '';
          pts.forEach(([t, v], i) => {
            const x0 = px(Math.max(0, t - 0.5 / (n - 1))), x1 = px(Math.min(1, t + 0.5 / (n - 1)));
            p += (i ? 'L' : 'M') + x0.toFixed(1) + ' ' + py(v).toFixed(1) + 'L' + x1.toFixed(1) + ' ' + py(v).toFixed(1);
          });
          s.el('path', { d: p, class: 'pa-link', style: 'stroke-width:2.6' }, s.root);
        } else {
          s.el('path', { d: pts.map(([t, v], i) => (i ? 'L' : 'M') + px(t).toFixed(1) + ' ' + py(v).toFixed(1)).join(''), class: 'pa-link', style: 'stroke-width:2.6' }, s.root);
        }
        pts.forEach(([t, v]) => s.el('circle', { cx: px(t), cy: py(v), r: opts.n > 20 ? 2.6 : 4.2, class: 'f-terra' }, s.root));
        if (levels) for (let i = 0; i < levels; i++) {
          const yy = py(i / (levels - 1) * 2 - 1);
          s.el('line', { x1: x, x2: x + W, y1: yy, y2: yy, class: 'pa-week' }, s.back);
        }
      }
      const pos = c
        ? [[40, 60], [40, 260], [40, 460], [40, 660]]
        : [[30, 60], [410, 60], [30, 270], [410, 270]];
      panel(pos[0][0], pos[0][1], 'Low sampling rate', '8 samples across the wave', { n: 8 });
      panel(pos[1][0], pos[1][1], 'High sampling rate', '32 samples across the wave', { n: 32 });
      panel(pos[2][0], pos[2][1], 'Low bit depth', '2 bits = 4 possible heights', { n: 40, levels: 4, staircase: true });
      panel(pos[3][0], pos[3][1], 'Higher bit depth', '4 bits = 16 possible heights', { n: 40, levels: 16, staircase: true });
      s.text(s.root, c ? 'purple line: the original wave\ndots: measurements  |  dark line: the digital copy' : 'purple line: the original wave  |  dots: measurements  |  dark line: the digital copy', { x: c ? 200 : 380, y: c ? 818 : 424, cls: 'pa-t', size: 13, lh: 1.3 });
    }
  });
})();
