/* Still diagram (NESA data flow diagram, Level 0): the Canteen Insights dashboard (a fictional project).
   Notation: NESA Enterprise Computing Course Specifications, pp.4-5 (circle process, closed external entities, labelled curved flows).
   Example Enterprise Project › Researching and planning (data flow diagrams). */
(() => {
  // A labelled, curved arrow between the outlines of two symbols. Reversed pairs bulge to opposite sides.
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

  HSCAnim.define('ex-dfd-l0', {
    still: true,
    title: 'Level 0 data flow diagram: Canteen Insights',
    alt: 'Level 0 data flow diagram of the Canteen Insights dashboard: one process, Canteen Insights, and three external entities, Till system, Canteen staff and Canteen manager. The Till system sends a Sales export. Canteen staff send Stocktake and corrections and receive a Saved or error message. The Canteen manager sends Filters and what-if settings and receives a Dashboard and charts and a Reorder list. There are no data stores.',
    layout: { size: [940, 480], minWidth: 940 },
    setup(s) {
      const L = s.g(s.back);
      const E = (x, y, text) => s.node(s.root, { x, y, w: 104, h: 100, shape: 'entity', text });
      const till = E(100, 90, 'Till\nsystem');
      const staff = E(100, 390, 'Canteen\nstaff');
      const mgr = E(840, 240, 'Canteen\nmanager');
      const sys = s.node(s.root, { x: 470, y: 240, w: 160, h: 160, shape: 'circle', text: 'Canteen\nInsights' });
      flow(s, L, till, sys, 'Sales export', 34);
      flow(s, L, staff, sys, 'Stocktake and corrections', 34);
      flow(s, L, sys, staff, 'Saved or error message', 34);
      flow(s, L, mgr, sys, 'Filters and what-if settings', 84, { sep: 40 });
      flow(s, L, sys, mgr, 'Dashboard and charts', 84, { sep: 40 });
      flow(s, L, sys, mgr, 'Reorder list', 10, { sep: 0, at: [655, 224] });
    }
  });
})();
