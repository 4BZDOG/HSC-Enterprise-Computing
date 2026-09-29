/* Still diagram (NESA system flowchart): the main processes and devices of Canteen Insights (a fictional project).
   NESA Enterprise Computing Course Specifications, p.7 (online input, process, direct access storage, online display, paper document, manual operation, telecommunications link, cloud).
   Example Enterprise Project › Researching and planning (system flowcharts). */
HSCAnim.define('ex-sysflow', {
  still: true,
  title: 'System flowchart: Canteen Insights',
  alt: 'System flowchart. Till sales and Stocktake and corrections (both online input) go to the process Import and check data. Import and check data reads and writes the Canteen database (direct access storage) and sends a Saved or error message to an online display. The Canteen database sends data over a telecommunications link to Cloud backup (cloud). The Canteen database also feeds two processes: Analyse sales, which sends its results to the Dashboard (online display), and Decide reorders, which produces a Reorder list (paper document). A manual operation, Order from supplier, follows the Reorder list.',
  layout: { size: [720, 720], minWidth: 720 },
  setup(s) {
    const L = s.g(s.back);
    const till = s.node(s.root, { x: 150, y: 54, w: 132, h: 62, shape: 'sf-input', text: 'Till sales' });
    const staff = s.node(s.root, { x: 420, y: 54, w: 190, h: 62, shape: 'sf-input', text: 'Stocktake and\ncorrections' });
    const imp = s.node(s.root, { x: 285, y: 176, w: 170, h: 58, text: 'Import and\ncheck data' });
    const msg = s.node(s.root, { x: 590, y: 190, w: 150, h: 66, shape: 'sf-display', text: 'Saved or\nerror message' });
    const db = s.node(s.root, { x: 285, y: 320, w: 150, h: 88, shape: 'sf-storage', text: 'Canteen\ndatabase' });
    const cloud = s.node(s.root, { x: 596, y: 330, w: 130, h: 84, shape: 'sf-cloud', text: 'Cloud\nbackup' });
    const ana = s.node(s.root, { x: 150, y: 470, w: 150, h: 58, text: 'Analyse sales' });
    const dec = s.node(s.root, { x: 420, y: 470, w: 150, h: 58, text: 'Decide reorders' });
    const dash = s.node(s.root, { x: 150, y: 590, w: 140, h: 64, shape: 'sf-display', text: 'Dashboard' });
    const ro = s.node(s.root, { x: 420, y: 590, w: 140, h: 76, shape: 'sf-document', text: 'Reorder\nlist' });
    const ord = s.node(s.root, { x: 420, y: 690, w: 190, h: 52, shape: 'sf-manual', text: 'Order from supplier' });
    const st = { straight: true };
    s.link(L, till, imp, st);
    s.link(L, staff, imp, st);
    s.link(L, imp, db, Object.assign({ both: true }, st));
    s.link(L, imp, msg, st);
    s.telecomLink(L, db, cloud, { amp: 16 });
    s.link(L, db, ana, st);
    s.link(L, db, dec, st);
    s.link(L, ana, dash, st);
    s.link(L, dec, ro, st);
    s.link(L, ro, ord, st);
  }
});
