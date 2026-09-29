/* Still diagram (NESA system flowchart): from station kiosks to a data warehouse and dashboard.
   Uses only the NESA system flowchart symbols: online input, process, direct access storage, cloud,
   telecommunications link, online display and paper document. Arrows show the direction of data.
   Notation follows NESA Enterprise Computing Course Specifications, p.7.
   Data Science › Big data and data warehousing. */
HSCAnim.define('ds-sysflow-warehouse', {
  still: true,
  title: 'System flowchart: from trip records to a data warehouse and dashboard',
  alt: 'System flowchart. Trip and payment details (online input) go to the process Record trip, which reads and writes the Operational database (direct access storage). Weather data in the cloud is sent over a telecommunications link to the process Extract, clean and load. The Operational database also feeds Extract, clean and load, which writes to the Data warehouse (direct access storage). The Data warehouse feeds the process Analyse and summarise, which sends results to the Dashboard (online display) and produces a Monthly report (paper document).',
  layout: { size: [720, 560], minWidth: 720 },
  setup(s) {
    const L = s.g(s.back);
    const inp = s.node(s.root, { x: 96, y: 70, w: 130, h: 64, shape: 'sf-input', text: 'Trip and\npayment details' });
    const rec = s.node(s.root, { x: 300, y: 70, w: 130, h: 56, text: 'Record trip' });
    const ops = s.node(s.root, { x: 540, y: 70, w: 150, h: 86, shape: 'sf-storage', text: 'Operational\ndatabase' });
    const wx = s.node(s.root, { x: 96, y: 250, w: 130, h: 84, shape: 'sf-cloud', text: 'Weather\ndata' });
    const etl = s.node(s.root, { x: 540, y: 250, w: 170, h: 66, text: 'Extract, clean\nand load' });
    const dw = s.node(s.root, { x: 540, y: 410, w: 150, h: 86, shape: 'sf-storage', text: 'Data\nwarehouse' });
    const an = s.node(s.root, { x: 300, y: 410, w: 140, h: 62, text: 'Analyse and\nsummarise' });
    const dash = s.node(s.root, { x: 96, y: 400, w: 150, h: 76, shape: 'sf-display', text: 'Dashboard' });
    const rep = s.node(s.root, { x: 300, y: 520, w: 150, h: 76, shape: 'sf-document', text: 'Monthly\nreport' });
    const st = { straight: true };
    s.link(L, inp, rec, st);
    s.link(L, rec, ops, Object.assign({ both: true }, st));
    s.link(L, ops, etl, st);
    s.telecomLink(L, wx, etl, { amp: 16 });
    s.link(L, etl, dw, st);
    s.link(L, dw, an, st);
    s.link(L, an, dash, st);
    s.link(L, an, rep, st);
  }
});
