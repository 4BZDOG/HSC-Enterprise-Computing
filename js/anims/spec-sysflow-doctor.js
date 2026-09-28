/* Still diagram (NESA system flowchart): part of a system used by a doctor to manage patient information.
   NESA Enterprise Computing Course Specifications, p.7 (redrawn with the diagram kit).
   Enterprise Computing › Communicating system logic (system flowcharts). */
HSCAnim.define('spec-sysflow-doctor', {
  still: true,
  title: 'System flowchart: a doctor managing patient information',
  alt: 'System flowchart. Patient details (online input) go to the process Add a new patient. Add a new patient reads and writes the Patient file (direct access storage) and sends a Patient confirmation to an online display. The Patient file feeds the process Consultation, which also receives Visit details (online input). Consultation writes to the Consultation file (direct access storage), which sends data over a telecommunications link to Health data in the cloud. Consultation also sends data to the process Billing, which produces a Patient account (paper document).',
  layout: { size: [720, 640], minWidth: 720 },
  setup(s) {
    const L = s.g(s.back);
    const pd = s.node(s.root, { x: 90, y: 52, w: 110, h: 60, shape: 'sf-input', text: 'Patient\ndetails' });
    const add = s.node(s.root, { x: 280, y: 104, w: 130, h: 56, text: 'Add a new\npatient' });
    const pc = s.node(s.root, { x: 90, y: 180, w: 150, h: 70, shape: 'sf-display', text: 'Patient\nconfirmation' });
    const pf = s.node(s.root, { x: 480, y: 152, w: 120, h: 82, shape: 'sf-storage', text: 'Patient file' });
    const vd = s.node(s.root, { x: 90, y: 316, w: 110, h: 60, shape: 'sf-input', text: 'Visit\ndetails' });
    const con = s.node(s.root, { x: 280, y: 348, w: 130, h: 56, text: 'Consultation' });
    const cf = s.node(s.root, { x: 480, y: 388, w: 130, h: 86, shape: 'sf-storage', text: 'Consultation\nfile' });
    const hd = s.node(s.root, { x: 640, y: 528, w: 116, h: 80, shape: 'sf-cloud', text: 'Health\ndata' });
    const bill = s.node(s.root, { x: 280, y: 490, w: 130, h: 56, text: 'Billing' });
    const pa = s.node(s.root, { x: 100, y: 584, w: 130, h: 76, shape: 'sf-document', text: 'Patient\naccount' });
    const st = { straight: true };
    s.link(L, pd, add, st);
    s.link(L, add, pf, Object.assign({ both: true }, st));
    s.link(L, add, pc, st);
    s.link(L, pf, con, st);
    s.link(L, vd, con, st);
    s.link(L, con, cf, st);
    s.telecomLink(L, cf, hd, { amp: 18 });
    s.link(L, con, bill, st);
    s.link(L, bill, pa, st);
  }
});
