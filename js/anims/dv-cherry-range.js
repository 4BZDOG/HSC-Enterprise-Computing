/* Still diagram (chart, before and after): a hand-picked date range hides the seasonal pattern.
   Fictional monthly sales. Data Visualisation › Bias in visualisations (cherry-picked ranges). */
(() => {
  const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const V = [52, 49, 47, 44, 41, 38, 36, 39, 43, 47, 50, 53];
  function panel(s, ox, oy, pw, ph, o) {
    const sheet = s.g(s.root);
    sheet.setAttribute('filter', 'url(#pa-cut)');
    s.el('rect', { x: ox, y: oy, width: pw, height: ph, rx: 6, class: 'f-paper' }, sheet);
    s.text(s.root, o.title, { x: ox + pw / 2, y: oy + 28, cls: 'pa-title', size: 15 });
    s.text(s.root, 'Monthly sales ($000), fictional shop', { x: ox + pw / 2, y: oy + 48, cls: 'pa-t pa-soft', size: 13 });
    const px = ox + 50, py = oy + 76, w = pw - 70, h = ph - 156;
    const n = o.from === o.to ? 1 : o.to - o.from;
    const X = i => px + 14 + (i - o.from) / n * (w - 28);
    const Y = v => py + h - (v - o.min) / (o.max - o.min) * h;
    if (o.shade) s.el('rect', { x: X(o.shade[0]) - 6, y: py, width: X(o.shade[1]) - X(o.shade[0]) + 12, height: h, class: 'f-mustard', opacity: .3 });
    const grid = s.g(s.root, 'pa-grid');
    o.ticks.forEach(t => {
      s.el('line', { x1: px, y1: Y(t), x2: px + w, y2: Y(t) }, grid);
      s.text(s.root, String(t), { x: px - 8, y: Y(t), anchor: 'end', valign: 'middle', cls: 'pa-t', size: 13 });
    });
    s.el('path', { d: `M${px} ${py} V${py + h} H${px + w}`, class: 'pa-axis' });
    for (let i = o.from; i <= o.to; i += o.step || 1) s.text(s.root, o.short ? M[i][0] : M[i], { x: X(i), y: py + h + 20, cls: 'pa-t', size: 13 });
    const pts = [];
    for (let i = o.from; i <= o.to; i++) pts.push([X(i), Y(V[i])]);
    s.el('path', { d: 'M' + pts.map(p => p.join(' ')).join(' L'), class: 'pa-line-ink', style: 'stroke:var(--pa-teal);stroke-width:3;fill:none' });
    pts.forEach(p => s.el('circle', { cx: p[0], cy: p[1], r: 4.5, class: 'f-teal' }));
    if (o.labels) o.labels.forEach(([i, t, dy]) => s.text(s.root, t, { x: X(i), y: Y(V[i]) + dy, cls: 'pa-t pa-strong', size: 13.5 }));
    s.text(s.root, o.note, { x: ox + pw / 2, y: py + h + 58, cls: 'pa-t pa-strong ' + (o.bad ? 'is-bad' : 'is-good'), size: 13.5, lh: 1.3 });
  }
  HSCAnim.define('dv-cherry-range', {
    still: true,
    title: 'Line charts: a cherry-picked date range against the full year',
    alt: 'Two line charts of the same fictional monthly sales, in thousands of dollars. On the left only July to December is shown: sales rise from 36 to 53, a rise of about 47 per cent, and the chart looks like strong growth. On the right the full year is shown: sales fall from 52 in January to 36 in July, then recover to 53 in December, so the year ends about level with where it started. The July to December window is shaded.',
    layouts: {
      wide: { size: [780, 400], minWidth: 780 },
      tall: { size: [300, 780] }
    },
    setup(s) {
      const A = { title: 'Before: only Jul to Dec shown', from: 6, to: 11, min: 30, max: 60, ticks: [30, 40, 50, 60], note: 'Looks like sales are up 47%', bad: true, labels: [[6, '36', 24], [11, '53', -12]] };
      const B = { title: 'After: the full year', from: 0, to: 11, min: 0, max: 60, ticks: [0, 20, 40, 60], short: true, note: 'Seasonal dip and recovery:\nJan 52, Dec 53', bad: false, shade: [6, 11], labels: [[0, '52', -12], [6, '36', 24], [11, '53', -12]] };
      if (s.compact) { panel(s, 10, 10, 280, 370, A); panel(s, 10, 395, 280, 370, B); }
      else { panel(s, 15, 10, 360, 380, A); panel(s, 405, 10, 360, 380, B); }
    }
  });
})();
