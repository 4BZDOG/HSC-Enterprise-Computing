/* Still diagram (NESA system flowchart): the main processes and devices of ClubHub, a fictional booking and inventory system for a sports club.
   Notation: NESA Enterprise Computing Course Specifications, p.7 (online input, process, direct access storage, online display, paper document, cloud, telecommunications link).
   Enterprise project › Researching and planning (system flowcharts). */
HSCAnim.define('ep-sysflow-clubhub', {
  still: true,
  title: 'System flowchart: ClubHub bookings and stock',
  alt: 'System flowchart of ClubHub. The Booking form (online input) goes to the process Check court and record booking, which reads and writes the Bookings file (direct access storage) and sends a message to the Booking screen (online display). The Stock count entry (online input) goes to the process Update stock and check reorder level, which reads and writes the Stock file (direct access storage) and produces a Reorder list (paper document). The Bookings file and the Stock file are copied over a telecommunications link to Cloud backup (cloud).',
  layout: { size: [800, 520], minWidth: 800 },
  setup(s) {
    const L = s.g(s.back), st = { straight: true };
    const form = s.node(s.root, { x: 100, y: 70, w: 140, h: 66, shape: 'sf-input', text: 'Booking\nform' });
    const chk = s.node(s.root, { x: 340, y: 70, w: 160, h: 64, shape: 'process', text: 'Check court and\nrecord booking' });
    const bk = s.node(s.root, { x: 590, y: 70, w: 120, h: 86, shape: 'sf-storage', text: 'Bookings\nfile' });
    const scr = s.node(s.root, { x: 340, y: 190, w: 150, h: 68, shape: 'sf-display', text: 'Booking\nscreen' });
    const cnt = s.node(s.root, { x: 100, y: 340, w: 150, h: 70, shape: 'sf-input', text: 'Stock count\nentry' });
    const upd = s.node(s.root, { x: 340, y: 340, w: 170, h: 64, shape: 'process', text: 'Update stock and\ncheck reorder level' });
    const stk = s.node(s.root, { x: 590, y: 340, w: 120, h: 86, shape: 'sf-storage', text: 'Stock\nfile' });
    const doc = s.node(s.root, { x: 340, y: 458, w: 140, h: 62, shape: 'sf-document', text: 'Reorder\nlist' });
    const cloud = s.node(s.root, { x: 720, y: 205, w: 116, h: 80, shape: 'sf-cloud', text: 'Cloud\nbackup' });
    s.link(L, form, chk, st);
    s.link(L, chk, bk, { straight: true, both: true });
    s.link(L, chk, scr, st);
    s.link(L, cnt, upd, st);
    s.link(L, upd, stk, { straight: true, both: true });
    s.link(L, upd, doc, st);
    s.telecomLink(L, bk, cloud, { amp: 14 });
    s.telecomLink(L, stk, cloud, { amp: 14 });
  }
});
