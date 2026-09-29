/* Still diagram (chart): a decision support system's proposed orders against actual sales over eight weeks (sample data).
   Intelligent systems › Assessing decision support output. */
(() => {
  const P = [120, 135, 150, 140, 160, 155, 170, 165];   // proposed by the DSS
  const A = [115, 142, 148, 120, 171, 150, 190, 160];   // actual sales
  HSCAnim.define('is-output-vs-actual', {
    still: true,
    title: 'Line chart: proposed orders against actual sales',
    alt: 'Line chart of sample data for eight weeks. The decision support system proposed orders of 120, 135, 150, 140, 160, 155, 170 and 165 units. Actual sales were 115, 142, 148, 120, 171, 150, 190 and 160 units. The lines stay close except in week 4, when the system proposed 140 and 120 sold, and week 7, when it proposed 170 and 190 sold. Those two weeks fall outside the plus or minus 10 per cent tolerance and are ringed.',
    layouts: { wide: { size: [780, 430], minWidth: 780 }, tall: { size: [400, 520] } },
    setup(s) {
      const c = s.compact, W = s.W, H = s.H;
      const sheet = s.g(s.root); sheet.setAttribute('filter', 'url(#pa-cut)');
      s.el('rect', { x: 8, y: 8, width: W - 16, height: H - 16, rx: 6, class: 'f-paper' }, sheet);
      const px = c ? 56 : 76, py = 64, w = W - px - (c ? 24 : 48), h = c ? 300 : 250;
      const X = i => px + 24 + i / 7 * (w - 48), V = v => py + h - (v - 100) / 100 * h;
      s.text(s.root, 'Units per week (sample data)', { x: W / 2, y: 34, cls: 'pa-title', size: 15 });
      const grid = s.g(s.root, 'pa-grid');
      [100, 125, 150, 175, 200].forEach(t => {
        s.el('line', { x1: px, y1: V(t), x2: px + w, y2: V(t) }, grid);
        s.text(s.root, String(t), { x: px - 8, y: V(t), anchor: 'end', valign: 'middle', cls: 'pa-t', size: 13 });
      });
      s.el('path', { d: `M${px} ${py} V${py + h} H${px + w}`, class: 'pa-axis' });
      for (let i = 0; i < 8; i++) s.text(s.root, String(i + 1), { x: X(i), y: py + h + 20, cls: 'pa-t', size: 13 });
      s.text(s.root, 'Week', { x: px + w / 2, y: py + h + 42, cls: 'pa-t pa-soft', size: 13.5 });
      const path = arr => 'M' + arr.map((v, i) => `${X(i)} ${V(v)}`).join(' L');
      s.el('path', { d: path(A), style: 'stroke:var(--pa-teal);stroke-width:3;fill:none;stroke-linejoin:round' });
      s.el('path', { d: path(P), style: 'stroke:var(--pa-plum);stroke-width:3;fill:none;stroke-dasharray:8 6;stroke-linejoin:round' });
      // weeks outside the +/-10% tolerance
      [3, 6].forEach(i => s.el('circle', { cx: X(i), cy: (V(A[i]) + V(P[i])) / 2, r: 30, style: 'fill:none;stroke:var(--pa-terra);stroke-width:2.5' }));
      A.forEach((v, i) => s.el('circle', { cx: X(i), cy: V(v), r: 5, class: 'f-teal' }));
      P.forEach((v, i) => s.el('circle', { cx: X(i), cy: V(v), r: 5.5, class: 'f-paper', style: 'stroke:var(--pa-plum);stroke-width:3' }));
      const ly = py + h + (c ? 72 : 68);
      const items = [['teal', 'Actual sales', false], ['plum', 'Proposed by the DSS', true], ['terra', 'Outside ±10%', 'ring']];
      let lx = c ? 40 : W / 2 - 250;
      items.forEach(([col, label, kind], k) => {
        const y = c ? ly + k * 26 : ly;
        const x = c ? lx : lx + [0, 130, 340][k];
        if (kind === 'ring') s.el('circle', { cx: x, cy: y, r: 9, style: 'fill:none;stroke:var(--pa-terra);stroke-width:2.5' });
        else if (kind) { s.el('path', { d: `M${x - 14} ${y} h28`, style: 'stroke:var(--pa-plum);stroke-width:3;stroke-dasharray:6 4' }); s.el('circle', { cx: x, cy: y, r: 5, class: 'f-paper', style: 'stroke:var(--pa-plum);stroke-width:3' }); }
        else { s.el('path', { d: `M${x - 14} ${y} h28`, style: 'stroke:var(--pa-teal);stroke-width:3' }); s.el('circle', { cx: x, cy: y, r: 5, class: 'f-teal' }); }
        s.text(s.root, label, { x: x + 22, y, anchor: 'start', valign: 'middle', cls: 'pa-t', size: 13.5 });
      });
    }
  });
})();
