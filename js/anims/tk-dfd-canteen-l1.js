/* Still diagram (NESA data flow diagram, Level 1): a school canteen ordering system.
   Notation: NESA Enterprise Computing Course Specifications, pp.4-5 (circle process, open-ended data store, closed external entities, labelled curved flows).
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

  HSCAnim.define('tk-dfd-canteen-l1', {
    still: true,
    title: 'Level 1 data flow diagram: a school canteen ordering system',
    alt: 'Level 1 data flow diagram of the school canteen ordering system. The Canteen manager sends Menu and prices to the Manage menu process, which stores Menu items in the Menu data store. The Menu store gives Available items to the Take order process. The Student sends an Order request to Take order and receives an Order confirmation. Take order stores a New order in the Orders data store. The Orders store gives Orders for the day to the Prepare order list process, which sends a Daily order list to the Canteen manager.',
    layout: { size: [800, 540], minWidth: 800 },
    setup(s) {
      const L = s.g(s.back);
      const P = (x, y, text) => s.node(s.root, { x, y, w: 96, h: 96, shape: 'circle', text });
      const E = (x, y, text) => s.node(s.root, { x, y, w: 92, h: 96, shape: 'entity', text });
      const D = (x, y, text) => s.node(s.root, { x, y, w: 122, h: 76, shape: 'store', text });
      const mgr = E(735, 270, 'Canteen\nmanager');
      const manage = P(585, 80, 'Manage\nmenu');
      const menu = D(335, 80, 'Menu');
      const take = P(335, 270, 'Take order');
      const student = E(58, 270, 'Student');
      const orders = D(335, 460, 'Orders');
      const prepare = P(585, 460, 'Prepare\norder list');
      flow(s, L, mgr, manage, 'Menu and prices', 30);
      flow(s, L, manage, menu, 'Menu items', 26);
      flow(s, L, menu, take, 'Available items', 26);
      flow(s, L, student, take, 'Order request', 30);
      flow(s, L, take, student, 'Order confirmation', 30);
      flow(s, L, take, orders, 'New order', 26);
      flow(s, L, orders, prepare, 'Orders for the day', 26);
      flow(s, L, prepare, mgr, 'Daily order list', 30);
    }
  });
})();
