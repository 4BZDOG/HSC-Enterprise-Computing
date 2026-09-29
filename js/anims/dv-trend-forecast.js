/* Still diagram (chart): twelve months of fictional online orders, a least-squares trend line and a three-month forecast.
   Data Visualisation › Identifying patterns and trends (predictive analytics). */
(() => {
  const Y = [310, 325, 342, 351, 372, 380, 401, 415, 418, 440, 455, 471];
  const M = 14.378, C = 296.545;                       // least-squares line through the 12 points
  const fit = x => M * x + C;
  HSCAnim.define('dv-trend-forecast', {
    still: true,
    title: 'Line chart: actual orders, trend line and three-month forecast',
    alt: 'Chart of fictional monthly online orders. Months 1 to 12 are plotted as points rising from 310 to 471. A straight trend line, y equals 14.4 times the month number plus 296.5, runs through them with R squared of 0.996. Beyond month 12 the line continues as a dashed forecast: about 483 orders in month 13, 498 in month 14 and 512 in month 15.',
    layouts: {
      wide: { size: [780, 430], minWidth: 780 },
      tall: { size: [300, 610] }
    },
    setup(s) {
      const c = s.compact;
      const W = s.W, H = s.H;
      const sheet = s.g(s.root);
      sheet.setAttribute('filter', 'url(#pa-cut)');
      s.el('rect', { x: 8, y: 8, width: W - 16, height: H - 16, rx: 6, class: 'f-paper' }, sheet);
      const px = c ? 56 : 76, py = 64, w = W - px - (c ? 30 : 64), h = c ? 300 : 260;
      const X = m => px + 12 + (m - 1) / 14 * (w - 24);
      const V = v => py + h - (v - 250) / 300 * h;
      s.text(s.root, 'Monthly online orders (fictional shop)', { x: W / 2, y: 34, cls: 'pa-title', size: 15 });
      const grid = s.g(s.root, 'pa-grid');
      [300, 400, 500].forEach(t => {
        s.el('line', { x1: px, y1: V(t), x2: px + w, y2: V(t) }, grid);
        s.text(s.root, String(t), { x: px - 8, y: V(t), anchor: 'end', valign: 'middle', cls: 'pa-t', size: 13 });
      });
      s.el('path', { d: `M${px} ${py} V${py + h} H${px + w}`, class: 'pa-axis' });
      for (let m = 1; m <= 15; m += c ? 2 : 1) s.text(s.root, String(m), { x: X(m), y: py + h + 20, cls: 'pa-t', size: 13 });
      s.text(s.root, 'Month number', { x: px + w / 2, y: py + h + 42, cls: 'pa-t pa-soft', size: 13.5 });
      // forecast zone
      s.el('rect', { x: X(12.5), y: py, width: X(15) - X(12.5) + 12, height: h, class: 'f-mustard', opacity: .3 });
      s.text(s.root, 'Forecast', { x: (X(12.5) + X(15) + 12) / 2, y: py + 18, cls: 'pa-t pa-strong', size: 13.5 });
      s.text(s.root, 'Actual', { x: X(6.5), y: py + 18, cls: 'pa-t pa-strong', size: 13.5 });
      // trend line (fitted) and dashed extension
      s.el('path', { d: `M${X(1)} ${V(fit(1))} L${X(12)} ${V(fit(12))}`, style: 'stroke:var(--pa-plum);stroke-width:3;fill:none;stroke-linecap:round' });
      s.el('path', { d: `M${X(12)} ${V(fit(12))} L${X(15)} ${V(fit(15))}`, style: 'stroke:var(--pa-plum);stroke-width:3;fill:none;stroke-dasharray:7 6;stroke-linecap:round' });
      Y.forEach((v, i) => s.el('circle', { cx: X(i + 1), cy: V(v), r: 5, class: 'f-teal' }));
      [13, 14, 15].forEach(m => {
        s.el('circle', { cx: X(m), cy: V(fit(m)), r: 6, class: 'f-paper', style: 'stroke:var(--pa-plum);stroke-width:3' });
        if (!c) s.text(s.root, String(Math.round(fit(m))), { x: X(m), y: V(fit(m)) + 26, cls: 'pa-t pa-strong', size: 13.5 });
      });
      // equation and legend
      const ly = c ? py + h + 78 : py + h + 66;
      s.text(s.root, c ? 'Trend line: y = 14.4x + 296.5\nR² = 0.996' : 'Trend line: y = 14.4x + 296.5  ·  R² = 0.996', { x: W / 2, y: ly, cls: 'pa-t pa-strong', size: 14 });
      if (c) s.text(s.root, 'Forecast, months 13 to 15:\n483, 498, 512', { x: W / 2, y: ly + 46, cls: 'pa-t', size: 13.5 });
      const lx = c ? 30 : W / 2 - 200, gy = ly + (c ? 100 : 34);
      s.el('circle', { cx: lx, cy: gy, r: 5, class: 'f-teal' });
      s.text(s.root, 'Actual orders', { x: lx + 14, y: gy, anchor: 'start', valign: 'middle', cls: 'pa-t', size: 13.5 });
      const l2 = c ? 160 : W / 2 - 60;
      s.el('path', { d: `M${l2 - 12} ${gy} h24`, style: 'stroke:var(--pa-plum);stroke-width:3' });
      s.text(s.root, 'Trend line', { x: l2 + 20, y: gy, anchor: 'start', valign: 'middle', cls: 'pa-t', size: 13.5 });
      const l3 = c ? 30 : W / 2 + 80;
      const gy3 = c ? gy + 30 : gy;
      s.el('circle', { cx: l3, cy: gy3, r: 6, class: 'f-paper', style: 'stroke:var(--pa-plum);stroke-width:3' });
      s.text(s.root, 'Forecast', { x: l3 + 14, y: gy3, anchor: 'start', valign: 'middle', cls: 'pa-t', size: 13.5 });
    }
  });
})();
