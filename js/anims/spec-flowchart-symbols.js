/* Still diagram (NESA flowchart symbols): input or output, terminator, process, decision.
   NESA Enterprise Computing Course Specifications, p.6.
   Enterprise Computing › Communicating system logic (flowcharts). */
HSCAnim.define('spec-flowchart-symbols', {
  still: true,
  title: 'Flowchart symbols',
  alt: 'The four flowchart symbols. Input or output: a parallelogram. Terminator: a rounded-end rectangle. Process: a rectangle. Decision: a diamond.',
  layout: { size: [760, 110], minWidth: 760 },
  setup(s) {
    s.node(s.root, { x: 100, y: 55, w: 150, h: 64, shape: 'io', text: 'input or\noutput' });
    s.node(s.root, { x: 290, y: 55, w: 130, h: 50, shape: 'terminator', text: 'terminator' });
    s.node(s.root, { x: 470, y: 55, w: 130, h: 60, shape: 'process', text: 'process' });
    s.node(s.root, { x: 650, y: 55, w: 140, h: 76, shape: 'decision', text: 'decision' });
  }
});
