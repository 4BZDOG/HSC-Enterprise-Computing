/* Still diagram (chart, before and after): a truncated value axis makes a 3-point gap look enormous.
   Fictional satisfaction scores. Data Visualisation › Bias in visualisations (misleading-chart techniques). */
(() => {
  const DATA = [['Brand X', 94], ['Brand Y', 91]];
  function panel(s, ox, oy, pw, ph, o) {
    const sheet = s.g(s.root);
    sheet.setAttribute('filter', 'url(#pa-cut)');
    s.el('rect', { x: ox, y: oy, width: pw, height: ph, rx: 6, class: 'f-paper' }, sheet);
    s.text(s.root, o.title, { x: ox + pw / 2, y: oy + 28, cls: 'pa-title', size: 15 });
    const px = ox + 56, py = oy + 76, w = pw - 76, h = ph - 156;
    const Y = v => py + h - (v - o.min) / (o.max - o.min) * h;
    const grid = s.g(s.root, 'pa-grid');
    o.ticks.forEach(t => {
      s.el('line', { x1: px, y1: Y(t), x2: px + w, y2: Y(t) }, grid);
      s.text(s.root, String(t), { x: px - 8, y: Y(t), anchor: 'end', valign: 'middle', cls: 'pa-t', size: 13 });
    });
    s.el('path', { d: `M${px} ${py} V${py + h} H${px + w}`, class: 'pa-axis' });
    const bw = Math.min(90, w * .28);
    DATA.forEach(([name, v], i) => {
      const cx = px + w * (i ? .72 : .28);
      const bar = s.g(s.root);
      bar.setAttribute('filter', 'url(#pa-cut)');
      s.el('rect', { x: cx - bw / 2, y: Y(v), width: bw, height: py + h - Y(v), rx: 2, class: i ? 'f-plum' : 'f-teal' }, bar);
      s.text(s.root, v + '%', { x: cx, y: Y(v) - 10, cls: 'pa-t pa-strong', size: 14 });
      s.text(s.root, name, { x: cx, y: py + h + 20, cls: 'pa-t', size: 14 });
    });
    s.text(s.root, o.note, { x: ox + pw / 2, y: py + h + 52, cls: o.bad ? 'pa-t pa-strong is-bad' : 'pa-t pa-strong is-good', size: 13.5, lh: 1.3 });
    s.text(s.root, 'Satisfaction score (%)', { x: ox + pw / 2, y: oy + 46, cls: 'pa-t pa-soft', size: 13 });
  }
  HSCAnim.define('dv-truncated-axis', {
    still: true,
    title: 'Column charts: a truncated axis against an axis from zero',
    alt: 'Two column charts of the same fictional data: Brand X scores 94 per cent and Brand Y scores 91 per cent. On the left the value axis runs only from 90 to 95, so Brand X looks four times as tall as Brand Y, which exaggerates a difference of three percentage points. On the right the axis runs from 0 to 100 and the two columns are almost the same height, which shows the honest size of the gap.',
    layouts: {
      wide: { size: [780, 400], minWidth: 780 },
      tall: { size: [300, 780] }
    },
    setup(s) {
      const A = { title: 'Before: axis starts at 90', min: 90, max: 95, ticks: [90, 91, 92, 93, 94, 95], note: 'Brand X looks four times\nas tall as Brand Y', bad: true };
      const B = { title: 'After: axis starts at zero', min: 0, max: 100, ticks: [0, 25, 50, 75, 100], note: 'The columns are almost equal:\na 3-point gap', bad: false };
      if (s.compact) { panel(s, 10, 10, 280, 370, A); panel(s, 10, 395, 280, 370, B); }
      else { panel(s, 15, 10, 360, 380, A); panel(s, 405, 10, 360, 380, B); }
    }
  });
})();
