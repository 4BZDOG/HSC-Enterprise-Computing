/* Still diagram (wireframe): the parts of a well-designed dashboard, numbered against the UX ideas they serve.
   Data Visualisation › User experience and visualisation (relevance, interpretation, customisation, live analysis). */
(() => {
  const wrap = (t, n) => t.split(' ').reduce((acc, w) => { const l = acc[acc.length - 1]; if ((l + ' ' + w).trim().length > n) acc.push(w); else acc[acc.length - 1] = (l + ' ' + w).trim(); return acc; }, ['']).join('\n');
  const NOTES = [
    ['Title and last updated', 'Says what this is and how fresh it is (live analysis).'],
    ['Filters', 'Let each user narrow the view (customisation).'],
    ['Key figures', 'Highlight the few numbers that matter most (relevance).'],
    ['Main trend chart', 'A line chart for change over time, with labelled axes.'],
    ['Comparison chart', 'A bar chart, sorted, for comparing categories.'],
    ['Detail on demand', 'A table to check exact values (audience interpretation).']
  ];
  HSCAnim.define('dv-dashboard-wireframe', {
    still: true,
    title: 'Wireframe: the parts of an effective dashboard',
    alt: 'Wireframe of a sales dashboard with six numbered parts. 1: a title bar with a last-updated time. 2: three filter buttons for region, months and category. 3: three key-figure tiles for revenue, orders and average order. 4: a line chart showing change over time. 5: a bar chart comparing categories. 6: a detail table for checking exact values. A key explains each part: title and last updated shows freshness for live analysis; filters allow customisation; key figures show relevance; the line chart shows trend; the bar chart compares categories; the table supports audience interpretation.',
    layouts: {
      wide: { size: [820, 430], minWidth: 820 },
      tall: { size: [300, 940] }
    },
    setup(s) {
      const c = s.compact;
      const fx = c ? 8 : 16, fy = 12, fw = c ? 284 : 520, fh = c ? 560 : 402;
      const frame = s.g(s.root);
      frame.setAttribute('filter', 'url(#pa-cut)');
      s.el('rect', { x: fx, y: fy, width: fw, height: fh, rx: 8, class: 'f-paper pa-card-edge' }, frame);
      const box = (x, y, w, h, tone) => s.el('rect', { x, y, width: w, height: h, rx: 5, class: (tone || 'f-cream') + ' pa-outline-line' });
      const mark = (x, y, n) => {
        const g = s.g(s.front);
        s.el('circle', { cx: x, cy: y, r: 13, class: 'f-plum' }, g);
        s.text(g, String(n), { x, y, valign: 'middle', cls: 'pa-sign', size: 14 });
      };
      const ix = fx + 12, iw = fw - 24;
      // 1 title bar
      s.text(s.root, 'Sales dashboard', { x: ix + 18, y: fy + 26, anchor: 'start', cls: 'pa-title', size: 15 });
      s.text(s.root, 'Updated 9:05 am', { x: ix + iw - 6, y: fy + 26, anchor: 'end', cls: 'pa-t pa-soft', size: 13 });
      mark(ix - 2, fy + 8, 1);
      // 2 filters
      const filt = ['Region', 'Months', 'Category'];
      const fwd = (iw - 16) / 3, fy2 = fy + 46;
      filt.forEach((t, i) => {
        box(ix + i * (fwd + 8), fy2, fwd, 30, 'f-sheet');
        s.text(s.root, t + '  ▾', { x: ix + i * (fwd + 8) + fwd / 2, y: fy2 + 15, valign: 'middle', cls: 'pa-t', size: 13 });
      });
      mark(ix - 2, fy2, 2);
      // 3 key figures
      const ky = fy2 + 44, kw = (iw - 16) / 3;
      ['Revenue', 'Orders', c ? 'Avg order' : 'Average order'].forEach((t, i) => {
        const x = ix + i * (kw + 8);
        box(x, ky, kw, 62, 'f-teal-t');
        s.text(s.root, t, { x: x + kw / 2, y: ky + 18, cls: 'pa-t', size: 13 });
        s.text(s.root, i === 1 ? '0,000' : '$00,000', { x: x + kw / 2, y: ky + 44, cls: 'pa-t pa-strong', size: 17 });
      });
      mark(ix - 2, ky, 3);
      // 4 line chart
      const cy = ky + 76;
      const lw = c ? iw : 320, lh = c ? 140 : 150;
      box(ix, cy, lw, lh, 'f-paper');
      s.text(s.root, 'Revenue by month', { x: ix + 10, y: cy + 16, anchor: 'start', cls: 'pa-t pa-strong', size: 13 });
      const ax = ix + 34, ay = cy + lh - 22, aw = lw - 50, ah = lh - 54;
      s.el('path', { d: `M${ax} ${ay - ah} V${ay} H${ax + aw}`, class: 'pa-axis' });
      const ys = [.25, .35, .3, .5, .62, .55, .78, .9];
      s.el('path', { d: 'M' + ys.map((v, i) => `${ax + 6 + i * (aw - 12) / 7} ${ay - v * ah}`).join(' L'), style: 'stroke:var(--pa-teal);stroke-width:3;fill:none;stroke-linejoin:round' });
      s.text(s.root, 'Month', { x: ax + aw / 2, y: ay + 15, cls: 'pa-t pa-soft', size: 13 });
      mark(ix - 2, cy, 4);
      // 5 bar chart
      const bx = c ? ix : ix + lw + 8, by = c ? cy + lh + 10 : cy;
      const bw = c ? iw : iw - lw - 8, bh = c ? 116 : lh;
      box(bx, by, bw, bh, 'f-paper');
      s.text(s.root, 'By category', { x: bx + 10, y: by + 16, anchor: 'start', cls: 'pa-t pa-strong', size: 13 });
      [0.9, 0.6, 0.35].forEach((v, i) => {
        const yy = by + 30 + i * ((bh - 40) / 3);
        s.el('rect', { x: bx + 12, y: yy, width: (bw - 24) * v, height: (bh - 40) / 3 - 8, rx: 2, class: 'f-teal' });
      });
      mark(bx - 2, by, 5);
      // 6 table
      const ty = (c ? by + bh : cy + lh) + 10, th = fy + fh - ty - 12;
      box(ix, ty, iw, th, 'f-paper');
      s.text(s.root, 'Details (sortable table)', { x: ix + 10, y: ty + 16, anchor: 'start', cls: 'pa-t pa-strong', size: 13 });
      [0, 1].forEach(i => s.el('path', { d: `M${ix + 10} ${ty + 32 + i * 12} H${ix + iw - 10}`, class: 'pa-outline-line', opacity: .5 }));
      mark(ix - 2, ty, 6);
      // key
      if (!c) {
        NOTES.forEach(([h, d], i) => {
          const y = 34 + i * 66, x = 572;
          s.el('circle', { cx: x, cy: y, r: 13, class: 'f-plum' });
          s.text(s.root, String(i + 1), { x, y, valign: 'middle', cls: 'pa-sign', size: 14 });
          s.text(s.root, h, { x: x + 24, y: y - 2, anchor: 'start', cls: 'pa-name', size: 14 });
          s.text(s.root, wrap(d, 30), { x: x + 24, y: y + 16, anchor: 'start', cls: 'pa-t', size: 13, lh: 1.2 });
        });
      } else {
        NOTES.forEach(([h, d], i) => {
          const y = fy + fh + 36 + i * 62, x = 24;
          s.el('circle', { cx: x, cy: y, r: 13, class: 'f-plum' });
          s.text(s.root, String(i + 1), { x, y, valign: 'middle', cls: 'pa-sign', size: 14 });
          s.text(s.root, h, { x: x + 24, y: y - 8, anchor: 'start', cls: 'pa-name', size: 14 });
          s.text(s.root, wrap(d, 31), { x: x + 24, y: y + 9, anchor: 'start', cls: 'pa-t', size: 13, lh: 1.2 });
        });
      }
    }
  });
})();
