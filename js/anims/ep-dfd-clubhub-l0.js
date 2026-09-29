/* Still diagram (NESA data flow diagram, Level 0): ClubHub, a fictional booking and inventory system for a community sports club.
   Notation: NESA Enterprise Computing Course Specifications, pp.4-5 (circle process, closed external entities, labelled curved flows).
   Enterprise project › Researching and planning (data flow diagrams). */
(() => {
  // A labelled, curved data flow between the outlines of two symbols. The bend bows the arrow to one side of its direction of travel,
  // so a reversed pair bows to opposite sides; the label sits `lab` px beyond the peak of the curve.
  const flow = (s, L, a, b, label, bend, lab = 18, sep = 16) => {
    const A = [a.box.x, a.box.y], B = [b.box.x, b.box.y];
    const dx = B[0] - A[0], dy = B[1] - A[1], len = Math.hypot(dx, dy) || 1;
    const px = -dy / len, py = dx / len, sg = bend > 0 ? 1 : -1;
    const p0 = s.rim(a, [B[0] + px * sep * sg, B[1] + py * sep * sg]);
    const p1 = s.rim(b, [A[0] + px * sep * sg, A[1] + py * sep * sg]);
    const m = [(p0[0] + p1[0]) / 2 + px * bend / 2, (p0[1] + p1[1]) / 2 + py * bend / 2];
    s.link(L, p0, p1, { curve: bend, label, labelSize: 13, labelAt: [m[0] + px * sg * lab, m[1] + py * sg * lab] });
  };

  HSCAnim.define('ep-dfd-clubhub-l0', {
    still: true,
    title: 'Level 0 data flow diagram: the ClubHub system',
    alt: 'Level 0 data flow diagram of ClubHub, a fictional booking and inventory system for a sports club. One process in the centre, ClubHub, and four external entities: Member, Club secretary, Canteen coordinator and Supplier. The Member sends a Booking request and receives a Booking confirmation. The Club secretary sends Fees and court settings and receives a Booking and payment report. The Canteen coordinator sends Stock counts and receives a Reorder list. The Supplier receives a Purchase order and sends Delivery details. There are no data stores.',
    layout: { size: [880, 520], minWidth: 880 },
    setup(s) {
      const L = s.g(s.back);
      const mem = s.node(s.root, { x: 90, y: 260, w: 96, h: 90, shape: 'entity', text: 'Member' });
      const sec = s.node(s.root, { x: 440, y: 56, w: 120, h: 80, shape: 'entity', text: 'Club\nsecretary' });
      const can = s.node(s.root, { x: 790, y: 260, w: 120, h: 90, shape: 'entity', text: 'Canteen\ncoordinator' });
      const sup = s.node(s.root, { x: 440, y: 464, w: 110, h: 76, shape: 'entity', text: 'Supplier' });
      const sys = s.node(s.root, { x: 440, y: 260, w: 140, h: 140, shape: 'circle', text: 'ClubHub\nbookings and\nstock' });
      flow(s, L, mem, sys, 'Booking request', 26, 20);
      flow(s, L, sys, mem, 'Booking confirmation', 26, 20);
      flow(s, L, sec, sys, 'Fees and\ncourt settings', 26, 66);
      flow(s, L, sys, sec, 'Booking and\npayment report', 26, 72);
      flow(s, L, can, sys, 'Stock counts', 26, 20);
      flow(s, L, sys, can, 'Reorder list', 26, 20);
      flow(s, L, sys, sup, 'Purchase order', 26, 68);
      flow(s, L, sup, sys, 'Delivery details', 26, 68);
    }
  });
})();
