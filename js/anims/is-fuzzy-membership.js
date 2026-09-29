/* Still diagram (chart): fuzzy membership functions for Cold, Warm and Hot, with a worked reading at 24 degrees Celsius.
   Intelligent systems › Inference engine techniques (heuristic knowledge and fuzzy logic). */
(() => {
  HSCAnim.define('is-fuzzy-membership', {
    still: true,
    title: 'Chart: fuzzy membership of Cold, Warm and Hot',
    alt: 'Chart with temperature in degrees Celsius from 0 to 40 on the horizontal axis and degree of membership from 0 to 1 on the vertical axis. Cold is 1 up to 10 degrees and falls to 0 at 20. Warm rises from 0 at 10 to 1 at 20 and falls to 0 at 30. Hot rises from 0 at 20 to 1 at 30 and stays at 1 to 40. At 24 degrees, membership of Warm is 0.6, membership of Hot is 0.4 and membership of Cold is 0.',
    layouts: { wide: { size: [780, 400], minWidth: 780 }, tall: { size: [400, 470] } },
    setup(s) {
      const c = s.compact, W = s.W;
      const px = c ? 56 : 84, py = 70, w = W - px - (c ? 24 : 40), h = c ? 250 : 240;
      const X = t => px + t / 40 * w, Y = m => py + h - m * h;
      const sheet = s.g(s.root); sheet.setAttribute('filter', 'url(#pa-cut)');
      s.el('rect', { x: 8, y: 8, width: W - 16, height: s.H - 16, rx: 6, class: 'f-paper' }, sheet);
      s.text(s.root, 'Greenhouse temperature: degree of membership in each fuzzy set', { x: W / 2, y: 34, cls: 'pa-title', size: c ? 14 : 15 });
      const grid = s.g(s.root, 'pa-grid');
      [0, .5, 1].forEach(m => { s.el('line', { x1: px, y1: Y(m), x2: px + w, y2: Y(m) }, grid); s.text(s.root, String(m), { x: px - 8, y: Y(m), anchor: 'end', valign: 'middle', cls: 'pa-t', size: 13 }); });
      [0, 10, 20, 30, 40].forEach(t => s.text(s.root, String(t), { x: X(t), y: py + h + 20, cls: 'pa-t', size: 13 }));
      s.el('path', { d: `M${px} ${py} V${py + h} H${px + w}`, class: 'pa-axis' });
      s.text(s.root, 'Temperature (°C)', { x: px + w / 2, y: py + h + 44, cls: 'pa-t pa-soft', size: 13.5 });
      const yl = s.text(s.root, 'Membership', { x: 0, y: 0, cls: 'pa-t pa-soft', size: 13.5 });
      yl.setAttribute('transform', `translate(${px - 40} ${py + h / 2}) rotate(-90)`);
      const line = (pts, color) => s.el('path', { d: 'M' + pts.map(p => `${X(p[0])} ${Y(p[1])}`).join(' L'), style: `stroke:var(--pa-${color});stroke-width:3.5;fill:none;stroke-linejoin:round;stroke-linecap:round` });
      line([[0, 1], [10, 1], [20, 0]], 'sky');
      line([[10, 0], [20, 1], [30, 0]], 'sage');
      line([[20, 0], [30, 1], [40, 1]], 'terra');
      s.text(s.root, 'Cold', { x: X(4), y: Y(1) - 14, cls: 'pa-t pa-strong', size: 14 });
      s.text(s.root, 'Warm', { x: X(20), y: Y(1) - 14, cls: 'pa-t pa-strong', size: 14 });
      s.text(s.root, 'Hot', { x: X(36), y: Y(1) - 14, cls: 'pa-t pa-strong', size: 14 });
      // worked reading at 24 degrees
      s.el('path', { d: `M${X(24)} ${py} V${py + h}`, style: 'stroke:var(--pa-ink);stroke-width:1.6;stroke-dasharray:5 5;fill:none' });
      [[.6, 'sage'], [.4, 'terra']].forEach(([m, col]) => {
        s.el('circle', { cx: X(24), cy: Y(m), r: 6.5, class: 'f-paper', style: `stroke:var(--pa-${col});stroke-width:3.5` });
      });
      s.text(s.root, 'Warm 0.6', { x: X(24) - 12, y: Y(.6) - 4, anchor: 'end', cls: 'pa-t pa-strong', size: 13.5 });
      s.el('path', { d: `M${X(24) + 8} ${Y(.4)} H${X(26.4)}`, style: 'stroke:var(--pa-terra);stroke-width:1.6;fill:none' });
      s.chip(s.root, 'Hot 0.4', X(28.9), Y(.4), { size: 13.5, cls: 'pa-strong' });
      s.text(s.root, '24 °C: Cold 0, Warm 0.6, Hot 0.4', { x: W / 2, y: py + h + (c ? 74 : 72), cls: 'pa-t pa-strong', size: 14 });
    }
  });
})();
