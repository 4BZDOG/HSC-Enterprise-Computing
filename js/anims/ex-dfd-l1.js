/* Still diagram (NESA data flow diagram, Level 1): the Canteen Insights dashboard (a fictional project).
   Four processes, two data stores and the same three external entities as the Level 0 diagram; every Level 0 flow appears again with the same label.
   Notation: NESA Enterprise Computing Course Specifications, pp.4-5 (circle process, open-ended data store, closed external entities, labelled curved flows).
   Example Enterprise Project › Researching and planning (data flow diagrams). */
(() => {
  const flow = (s, L, a, b, label, bend, opt = {}) => {
    const sep = opt.sep == null ? 14 : opt.sep, lab = opt.lab == null ? 18 : opt.lab;
    const A = [a.box.x, a.box.y], B = [b.box.x, b.box.y];
    const dx = B[0] - A[0], dy = B[1] - A[1], len = Math.hypot(dx, dy) || 1;
    const px = -dy / len, py = dx / len, sg = bend > 0 ? 1 : -1;
    const p0 = s.rim(a, [B[0] + px * sep * sg, B[1] + py * sep * sg]);
    const p1 = s.rim(b, [A[0] + px * sep * sg, A[1] + py * sep * sg]);
    const m = [(p0[0] + p1[0]) / 2 + px * bend / 2, (p0[1] + p1[1]) / 2 + py * bend / 2];
    s.link(L, p0, p1, { curve: bend, label, labelSize: 13, labelAt: opt.at || [m[0] + px * sg * lab, m[1] + py * sg * lab] });
  };

  HSCAnim.define('ex-dfd-l1', {
    still: true,
    title: 'Level 1 data flow diagram: Canteen Insights',
    alt: 'Level 1 data flow diagram of the Canteen Insights dashboard. The Till system sends a Sales export to the process Import sales, which writes New sales records to the Sales data store. Canteen staff send Stocktake and corrections to the process Check and correct data and receive a Saved or error message. Check and correct data writes Corrected records to the Sales store and Stock counts to the Items data store. The process Analyse sales reads Sales records from the Sales store and Prices and categories from the Items store, receives Filters and what-if settings from the Canteen manager and sends a Dashboard and charts back. The process Decide reorders reads Recent sales from the Sales store and Stock on hand from the Items store and sends a Reorder list to the Canteen manager.',
    layout: { size: [1040, 640], minWidth: 1040 },
    setup(s) {
      const L = s.g(s.back);
      const P = (x, y, text) => s.node(s.root, { x, y, w: 104, h: 104, shape: 'circle', text });
      const E = (x, y, text) => s.node(s.root, { x, y, w: 96, h: 92, shape: 'entity', text });
      const D = (x, y, text) => s.node(s.root, { x, y, w: 124, h: 74, shape: 'store', text });
      const till = E(64, 96, 'Till\nsystem');
      const imp = P(310, 96, 'Import\nsales');
      const staff = E(64, 540, 'Canteen\nstaff');
      const chk = P(310, 540, 'Check and\ncorrect data');
      const sales = D(560, 200, 'Sales');
      const items = D(560, 430, 'Items');
      const ana = P(800, 200, 'Analyse\nsales');
      const dec = P(800, 480, 'Decide\nreorders');
      const mgr = E(980, 340, 'Canteen\nmanager');
      flow(s, L, till, imp, 'Sales export', 30);
      flow(s, L, imp, sales, 'New sales\nrecords', 30);
      flow(s, L, staff, chk, 'Stocktake and\ncorrections', 30);
      flow(s, L, chk, staff, 'Saved or\nerror message', 30);
      flow(s, L, chk, sales, 'Corrected\nrecords', 30);
      flow(s, L, chk, items, 'Stock\ncounts', 30);
      flow(s, L, sales, ana, 'Sales\nrecords', 30);
      flow(s, L, items, ana, 'Prices and\ncategories', 24, { at: [700, 350] });
      flow(s, L, sales, dec, 'Recent\nsales', 24, { at: [648, 310] });
      flow(s, L, items, dec, 'Stock on\nhand', 30);
      flow(s, L, mgr, ana, 'Filters and what-if\nsettings', 30, { at: [958, 240] });
      flow(s, L, ana, mgr, 'Dashboard and\ncharts', 30, { at: [880, 326] });
      flow(s, L, dec, mgr, 'Reorder\nlist', 30);
    }
  });
})();
