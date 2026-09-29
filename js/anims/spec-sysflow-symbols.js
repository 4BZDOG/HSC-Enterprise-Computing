/* Still diagram (NESA system flowchart symbols): the nine symbols in the Course Specifications.
   NESA Enterprise Computing Course Specifications, p.7. NESA prints "Online dispay" (sic); the key says "Online display".
   Enterprise Computing › Communicating system logic (system flowcharts). */
HSCAnim.define('spec-sysflow-symbols', {
  still: true,
  title: 'System flowchart symbols',
  alt: 'The nine system flowchart symbols. Paper document: a rectangle with a wavy bottom edge. Process: a rectangle. Direct access storage: a cylinder. Online display: a shape pointed on the left with a curved right side. Manual operation: an upside-down trapezium. Telecommunications link: a zig-zag line. Online input: a rectangle with a sloping top edge. Magnetic tape: a circle with a small square tail. Cloud: a cloud outline.',
  layout: { size: [760, 300], minWidth: 760 },
  setup(s) {
    const item = (x, y, o, label) => {
      s.node(s.root, Object.assign({ x, y }, o));
      s.text(s.root, label, { x: x + o.w / 2 + 16, y, anchor: 'start', valign: 'middle', cls: 'pa-t', size: 14, lh: 1.2 });
    };
    const C = [70, 330, 570], R = [48, 150, 252];
    item(C[0], R[0], { shape: 'sf-document', w: 66, h: 60 }, 'Paper\ndocument');
    item(C[1], R[0], { shape: 'process', w: 84, h: 56 }, 'Process');
    item(C[2], R[0], { shape: 'sf-storage', w: 76, h: 66 }, 'Direct access\nstorage');
    item(C[0], R[1], { shape: 'sf-display', w: 78, h: 62 }, 'Online\ndisplay');
    item(C[1], R[1], { shape: 'sf-manual', w: 84, h: 56 }, 'Manual\noperation');
    item(C[2], R[1], { shape: 'sf-telecom', w: 84, h: 26 }, 'Telecommunications\nlink');
    item(C[0], R[2], { shape: 'sf-input', w: 66, h: 60 }, 'Online\ninput');
    item(C[1], R[2], { shape: 'sf-tape', w: 62, h: 62 }, 'Magnetic\ntape');
    item(C[2], R[2], { shape: 'sf-cloud', w: 84, h: 60 }, 'Cloud');
  }
});
