/* Still diagram (concept): an OLAP data cube with three dimensions (Product, Quarter, Region), one measure (sales)
   and the five operations slice, dice, drill-down, roll-up and pivot. Fictional café-chain sales in $000.
   Data Visualisation › Online analytical processing (OLAP). */
(() => {
  const ROWS = ['Coffee', 'Cake', 'Tea'];
  const COLS = ['Q1', 'Q2', 'Q3', 'Q4'];
  const COAST = [[40, 44, 52, 48], [20, 22, 26, 30], [12, 14, 15, 13]];
  const OPS = [
    ['Slice', 'Fix one dimension: Region = Coast\ngives a Product by Quarter table.'],
    ['Dice', 'Choose values on two or more dimensions:\nCoffee and Cake, Q3 and Q4.'],
    ['Drill-down', 'Move down a hierarchy for more detail:\nQ3 becomes Jul, Aug and Sep.'],
    ['Roll-up', 'Aggregate up a hierarchy: months to\nquarters to year, or remove Region.'],
    ['Pivot', 'Rotate the axes: Quarter down the side,\nProduct across the top.']
  ];
  const DESC_C = [
    'Fix one dimension:\nRegion = Coast gives a\nProduct by Quarter table.',
    'Choose values on two or\nmore dimensions: Coffee\nand Cake, Q3 and Q4.',
    'Move down a hierarchy for\nmore detail: Q3 becomes\nJul, Aug and Sep.',
    'Aggregate up a hierarchy:\nmonths to quarters to year,\nor remove Region.',
    'Rotate the axes: Quarter\ndown the side, Product\nacross the top.'
  ];
  HSCAnim.define('dv-olap-cube', {
    still: true,
    title: 'OLAP cube: dimensions, a measure and the five operations',
    alt: 'A data cube of fictional café sales in thousands of dollars. The three dimensions are Product (Coffee, Cake, Tea) down the side, Quarter (Q1 to Q4) across the front, and Region (Coast at the front, Inland at the back) in depth. Every cell holds the measure, sales. The front layer, Region equals Coast, is highlighted as a slice, and the Coffee and Cake cells for Q3 and Q4 are outlined as a dice. Five cards describe the operations: slice fixes one dimension; dice chooses values on two or more dimensions; drill-down moves to more detail such as quarter to month; roll-up aggregates to less detail such as month to quarter to year; pivot rotates the axes.',
    layouts: {
      wide: { size: [800, 450], minWidth: 800 },
      tall: { size: [300, 900] }
    },
    setup(s) {
      const c = s.compact;
      const cw = c ? 46 : 62, ch = c ? 34 : 40, x0 = c ? 68 : 96, y0 = c ? 118 : 132;
      const dx = c ? 36 : 52, dy = c ? -28 : -40;
      const w = cw * 4, h = ch * 3;
      const back = s.g(s.root);
      back.setAttribute('filter', 'url(#pa-cut)');
      // depth: back rectangle, top face and right face
      s.el('rect', { x: x0 + dx, y: y0 + dy, width: w, height: h, class: 'f-sheet pa-outline' }, back);
      s.el('path', { d: `M${x0} ${y0} H${x0 + w} L${x0 + w + dx} ${y0 + dy} H${x0 + dx} Z`, class: 'f-cream pa-outline' }, back);
      s.el('path', { d: `M${x0 + w} ${y0} L${x0 + w + dx} ${y0 + dy} V${y0 + dy + h} L${x0 + w} ${y0 + h} Z`, class: 'f-kraft pa-outline' }, back);
      s.el('path', { d: `M${x0 + dx / 2} ${y0 + dy / 2} H${x0 + w + dx / 2} L${x0 + w + dx / 2} ${y0 + dy / 2 + h}`, class: 'pa-outline-line', opacity: .55 });
      // front face = the slice Region = Coast
      const front = s.g(s.root);
      front.setAttribute('filter', 'url(#pa-cut)');
      s.el('rect', { x: x0, y: y0, width: w, height: h, class: 'f-teal-t pa-outline' }, front);
      for (let i = 1; i < 4; i++) s.el('path', { d: `M${x0 + i * cw} ${y0} V${y0 + h}`, class: 'pa-outline-line', opacity: .45 });
      for (let j = 1; j < 3; j++) s.el('path', { d: `M${x0} ${y0 + j * ch} H${x0 + w}`, class: 'pa-outline-line', opacity: .45 });
      COAST.forEach((row, j) => row.forEach((v, i) => s.text(s.root, String(v), { x: x0 + i * cw + cw / 2, y: y0 + j * ch + ch / 2, valign: 'middle', cls: 'pa-t', size: 14 })));
      // dice: Coffee and Cake in Q3 and Q4
      s.el('rect', { x: x0 + 2 * cw + 2, y: y0 + 2, width: 2 * cw - 4, height: 2 * ch - 4, rx: 3, style: 'fill:none;stroke:var(--pa-mustard);stroke-width:4;stroke-dasharray:7 4' });
      // axis labels
      ROWS.forEach((r, j) => s.text(s.root, r, { x: x0 - 8, y: y0 + j * ch + ch / 2, anchor: 'end', valign: 'middle', cls: 'pa-t pa-strong', size: 13.5 }));
      COLS.forEach((q, i) => s.text(s.root, q, { x: x0 + i * cw + cw / 2, y: y0 + h + 18, cls: 'pa-t pa-strong', size: 13.5 }));
      s.text(s.root, 'Product', { x: x0 - 8, y: y0 - 14, anchor: 'end', cls: 'pa-name', size: 14 });
      s.text(s.root, 'Quarter (time)', { x: x0 + w / 2, y: y0 + h + 40, cls: 'pa-name', size: 14 });
      s.text(s.root, c ? 'Region: Coast (front),\nInland (back)' : 'Region: Coast (front), Inland (back)', { x: x0 + w / 2 + dx / 2, y: y0 + dy - (c ? 34 : 14), cls: 'pa-name', size: 14 });
      s.text(s.root, c ? 'Each cell holds the measure:\nsales ($000)' : 'Each cell holds the measure: sales ($000)', { x: c ? 150 : x0 + w / 2 + dx / 2, y: y0 + h + 62, cls: 'pa-t pa-soft', size: 13.5 });
      // key
      const ky = y0 + h + (c ? 114 : 96);
      s.el('rect', { x: x0 - 10, y: ky - 10, width: 20, height: 20, rx: 3, class: 'f-teal-t pa-outline' });
      s.text(s.root, 'Slice: Region = Coast', { x: x0 + 18, y: ky, anchor: 'start', valign: 'middle', cls: 'pa-t', size: 13.5 });
      s.el('rect', { x: x0 + (c ? 150 : 190), y: ky - 10, width: 20, height: 20, rx: 3, style: 'fill:none;stroke:var(--pa-mustard);stroke-width:4;stroke-dasharray:5 3' });
      s.text(s.root, 'Dice', { x: x0 + (c ? 178 : 218), y: ky, anchor: 'start', valign: 'middle', cls: 'pa-t', size: 13.5 });
      // operations
      const ox = c ? 8 : 452, oy = c ? 350 : 34, ow = c ? 284 : 328, oh = c ? 82 : 62, gap = c ? 96 : 84;
      OPS.forEach(([name, desc], i) => {
        const y = oy + i * gap;
        const g = s.g(s.root);
        g.setAttribute('filter', 'url(#pa-cut)');
        s.el('rect', { x: ox, y, width: ow, height: oh, rx: 8, class: 'f-paper pa-card-edge' }, g);
        s.el('rect', { x: ox, y, width: 8, height: oh, rx: 3, class: i === 1 ? 'f-mustard' : 'f-teal' }, g);
        s.text(s.root, name, { x: ox + 20, y: y + 20, anchor: 'start', cls: 'pa-name', size: 14.5 });
        s.text(s.root, c ? DESC_C[i] : desc, { x: ox + 20, y: y + 40, anchor: 'start', cls: 'pa-t', size: 13, lh: 1.2 });
      });
    }
  });
})();
