/* Still diagram (NESA data flow diagram, Level 0): a school canteen ordering system.
   Notation: NESA Enterprise Computing Course Specifications, pp.4-5 (circle process, closed external entities, labelled curved flows).
   Course Toolkit › Data flow diagrams. */
(() => {
  // Data flow helper: a labelled, curved arrow between the outlines of two symbols.
  // Reversed pairs bulge to opposite sides because the bend is measured from the direction of travel.
  const flow = (s, L, a, b, label, bend, sep = 14, lab = 18) => {
    const A = [a.box.x, a.box.y], B = [b.box.x, b.box.y];
    const dx = B[0] - A[0], dy = B[1] - A[1], len = Math.hypot(dx, dy) || 1;
    const px = -dy / len, py = dx / len, sg = bend > 0 ? 1 : -1;
    const p0 = s.rim(a, [B[0] + px * sep * sg, B[1] + py * sep * sg]);
    const p1 = s.rim(b, [A[0] + px * sep * sg, A[1] + py * sep * sg]);
    const m = [(p0[0] + p1[0]) / 2 + px * bend / 2, (p0[1] + p1[1]) / 2 + py * bend / 2];
    s.link(L, p0, p1, { curve: bend, label, labelSize: 13, labelAt: [m[0] + px * sg * lab, m[1] + py * sg * lab] });
  };

  HSCAnim.define('tk-dfd-canteen-l0', {
    still: true,
    title: 'Level 0 data flow diagram: a school canteen ordering system',
    alt: 'Level 0 data flow diagram of a school canteen ordering system: one process, Canteen ordering, and two external entities, Student and Canteen manager. The Student sends an Order request and receives an Order confirmation. The Canteen manager sends Menu and prices and receives a Daily order list. There are no data stores.',
    layout: { size: [800, 320], minWidth: 800 },
    setup(s) {
      const L = s.g(s.back);
      const student = s.node(s.root, { x: 100, y: 160, w: 92, h: 96, shape: 'entity', text: 'Student' });
      const sys = s.node(s.root, { x: 400, y: 160, w: 124, h: 124, shape: 'circle', text: 'Canteen\nordering' });
      const mgr = s.node(s.root, { x: 700, y: 160, w: 92, h: 96, shape: 'entity', text: 'Canteen\nmanager' });
      flow(s, L, student, sys, 'Order request', 34);
      flow(s, L, sys, student, 'Order confirmation', 34);
      flow(s, L, mgr, sys, 'Menu and prices', 34);
      flow(s, L, sys, mgr, 'Daily order list', 34);
    }
  });
})();
