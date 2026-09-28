/* Still diagram (NESA data flow diagram symbols): process, data store, external entity, data flow.
   NESA Enterprise Computing Course Specifications, p.4 (wording paraphrased from NESA's definitions).
   Enterprise Computing › Communicating system logic (data flow diagrams). */
HSCAnim.define('spec-dfd-symbols', {
  still: true,
  title: 'Data flow diagram symbols',
  alt: 'The four data flow diagram symbols. A circle is a process, which uses inputs to generate outputs. A rectangle open on its right side is a data store, an electronic file or non-computer storage. A closed square is an external entity, a person, organisation or element that provides data to or receives data from the system. A labelled curved arrow is a data flow between processes, data stores and external entities.',
  layout: { size: [760, 410], minWidth: 760 },
  setup(s) {
    const row = (y, draw, text) => { draw(y); s.text(s.root, text, { x: 190, y, anchor: 'start', valign: 'middle', cls: 'pa-t', size: 14.5, lh: 1.3 }); };
    row(50, y => s.node(s.root, { x: 90, y, w: 84, h: 84, shape: 'circle', text: 'Process', tone: 'teal-t' }),
      'A circle is a process.\nA process uses input(s) to generate output(s).');
    row(150, y => s.node(s.root, { x: 90, y, w: 104, h: 62, shape: 'store', text: 'Data store', tone: 'mustard-t' }),
      'A data store is open on one side.\nIt can be an electronic file or non-computer storage.');
    row(255, y => s.node(s.root, { x: 90, y, w: 84, h: 84, shape: 'entity', text: 'External\nentity', tone: 'sheet' }),
      'An external entity is any person, organisation or\nelement that provides data to the system or\nreceives data from it.');
    row(355, y => {
      s.arrow(s.root, `M38 ${y + 2} C38 ${y + 34} 142 ${y + 34} 142 ${y - 14}`);
      s.text(s.root, 'Data flow', { x: 90, y: y + 16, cls: 'pa-t', size: 13.5 });
    }, 'A labelled, curved arrow is a data flow between\nprocesses, data stores and external entities.');
  }
});
