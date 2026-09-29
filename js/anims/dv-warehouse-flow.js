/* Still diagram (NESA system flowchart): how enterprise data reaches a data warehouse and then a dashboard.
   Notation: NESA Enterprise Computing Course Specifications, p.7 (online input, direct access storage, process, cloud,
   telecommunications link, online display, paper document). Data Visualisation › Data warehousing and visualisation. */
HSCAnim.define('dv-warehouse-flow', {
  still: true,
  title: 'System flowchart: from operational systems to a data warehouse and dashboard',
  alt: 'System flowchart of a retail data warehouse. Three sources feed the process Extract, transform, load: the Sales database (direct access storage), Online orders (online input) and External data such as weather and census figures (cloud, joined by a telecommunications link). The process loads a Data warehouse (direct access storage). The process Analyse and visualise reads from the warehouse and sends results to a Dashboard (online display) and a Board report (paper document).',
  layouts: {
    wide: { size: [800, 400], minWidth: 800 },
    tall: { size: [300, 720] }
  },
  setup(s) {
    const c = s.compact;
    const L = s.g(s.back);
    const st = { straight: true };
    const cap = (x, y, t) => s.text(s.root, t, { x, y, cls: 'pa-t pa-soft', size: 13, lh: 1.25 });
    if (!c) {
      const db = s.node(s.root, { x: 90, y: 80, w: 120, h: 84, shape: 'sf-storage', text: 'Sales\ndatabase' });
      const on = s.node(s.root, { x: 90, y: 200, w: 120, h: 62, shape: 'sf-input', text: 'Online\norders' });
      const ex = s.node(s.root, { x: 90, y: 318, w: 120, h: 84, shape: 'sf-cloud', text: 'External\ndata' });
      const etl = s.node(s.root, { x: 262, y: 200, w: 132, h: 66, text: 'Extract,\ntransform, load' });
      const wh = s.node(s.root, { x: 430, y: 200, w: 120, h: 90, shape: 'sf-storage', text: 'Data\nwarehouse' });
      const an = s.node(s.root, { x: 596, y: 200, w: 132, h: 66, text: 'Analyse and\nvisualise' });
      const dash = s.node(s.root, { x: 730, y: 90, w: 116, h: 70, shape: 'sf-display', text: 'Dashboard' });
      const rep = s.node(s.root, { x: 730, y: 320, w: 116, h: 78, shape: 'sf-document', text: 'Board\nreport' });
      s.link(L, db, etl, st); s.link(L, on, etl, st); s.telecomLink(L, ex, etl, { amp: 12 });
      s.link(L, etl, wh, st); s.link(L, wh, an, Object.assign({ both: true }, st));
      s.link(L, an, dash, st); s.link(L, an, rep, st);
      cap(262, 258, 'clean, convert,\ncombine'); cap(430, 268, 'years of history\nkept together'); cap(596, 258, 'slice, dice, trends,\nforecasts');
    } else {
      const db = s.node(s.root, { x: 50, y: 62, w: 88, h: 78, shape: 'sf-storage', text: 'Sales\ndatabase', size: 13 });
      const on = s.node(s.root, { x: 150, y: 62, w: 88, h: 60, shape: 'sf-input', text: 'Online\norders', size: 13 });
      const ex = s.node(s.root, { x: 248, y: 62, w: 96, h: 82, shape: 'sf-cloud', text: 'External\ndata', size: 13 });
      const etl = s.node(s.root, { x: 150, y: 200, w: 150, h: 60, text: 'Extract,\ntransform, load' });
      const wh = s.node(s.root, { x: 150, y: 340, w: 120, h: 88, shape: 'sf-storage', text: 'Data\nwarehouse' });
      const an = s.node(s.root, { x: 150, y: 490, w: 150, h: 60, text: 'Analyse and\nvisualise' });
      const dash = s.node(s.root, { x: 80, y: 640, w: 116, h: 70, shape: 'sf-display', text: 'Dashboard' });
      const rep = s.node(s.root, { x: 226, y: 640, w: 116, h: 78, shape: 'sf-document', text: 'Board\nreport' });
      s.link(L, db, etl, st); s.link(L, on, etl, st); s.telecomLink(L, ex, etl, { amp: 10 });
      s.link(L, etl, wh, st); s.link(L, wh, an, Object.assign({ both: true }, st));
      s.link(L, an, dash, st); s.link(L, an, rep, st);
      const capL = (x, y, t) => s.text(s.root, t, { x, y, anchor: 'start', cls: 'pa-t pa-soft', size: 13, lh: 1.25 });
      capL(166, 244, 'clean, convert,\ncombine'); capL(166, 396, 'years of history\nkept together');
    }
  }
});
