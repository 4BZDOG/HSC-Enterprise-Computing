/* Still diagram (NESA flowchart): deciding whether a data breach must be notified under the Notifiable Data Breaches scheme.
   A simplified reading of Part IIIC of the Privacy Act 1988 (Cth). Notation: NESA Course Specifications, p.6.
   Cybersecurity › Cyber risk management (controlling damage and loss); Cybersecurity law and legislation. */
(() => {
  const X = 230, XR = 540, TR = 660;
  HSCAnim.define('cyber-ndb-flowchart', {
    still: true,
    title: 'Flowchart: is a data breach notifiable?',
    alt: 'Flowchart. START, then the process: suspect or discover a data breach. Process: contain the breach and assess it within 30 days. Decision: is personal information involved? No: the process handle as a security incident, then END. Yes: decision: is it likely to cause serious harm? No: the process record the decision and keep monitoring, then END. Yes: decision: does remedial action stop the serious harm? Yes: the process not an eligible data breach, then END. No: output notify the OAIC and affected individuals, then the process review what failed and strengthen controls, then END.',
    layout: { size: [720, 860], minWidth: 720 },
    setup(s) {
      const L = s.g(s.back);
      const start = s.node(s.root, { x: X, y: 34, w: 150, h: 42, shape: 'terminator', text: 'START' });
      const p1 = s.node(s.root, { x: X, y: 110, w: 230, h: 52, shape: 'process', text: 'Suspect or discover\na data breach' });
      const p2 = s.node(s.root, { x: X, y: 196, w: 250, h: 52, shape: 'process', text: 'Contain the breach and\nassess it (within 30 days)' });
      const d1 = s.node(s.root, { x: X, y: 300, w: 250, h: 100, shape: 'decision', text: 'Personal\ninformation\ninvolved?' });
      const d2 = s.node(s.root, { x: X, y: 440, w: 250, h: 100, shape: 'decision', text: 'Likely to cause\nserious harm to\nan individual?' });
      const d3 = s.node(s.root, { x: X, y: 580, w: 250, h: 100, shape: 'decision', text: 'Does remedial\naction stop the\nserious harm?' });
      const out1 = s.node(s.root, { x: XR, y: 300, w: 210, h: 56, shape: 'process', text: 'Handle as a security\nincident' });
      const out2 = s.node(s.root, { x: XR, y: 440, w: 210, h: 56, shape: 'process', text: 'Record the decision\nand keep monitoring' });
      const out3 = s.node(s.root, { x: XR, y: 580, w: 210, h: 56, shape: 'process', text: 'Not an eligible\ndata breach' });
      const notify = s.node(s.root, { x: X, y: 690, w: 250, h: 52, shape: 'io', text: 'Notify the OAIC and\naffected individuals' });
      const review = s.node(s.root, { x: X, y: 762, w: 250, h: 52, shape: 'process', text: 'Review what failed and\nstrengthen controls' });
      const end = s.node(s.root, { x: X, y: 832, w: 150, h: 40, shape: 'terminator', text: 'END' });
      s.link(L, start, p1);
      s.link(L, p1, p2);
      s.link(L, p2, d1);
      s.link(L, d1, d2, { label: 'Yes', labelSize: 13, labelAt: [X + 24, 376] });
      s.link(L, d1, out1, { from: 'right', to: 'left', label: 'No', labelSize: 13, labelNear: 'start', dy: -12 });
      s.link(L, d2, d3, { label: 'Yes', labelSize: 13, labelAt: [X + 24, 516] });
      s.link(L, d2, out2, { from: 'right', to: 'left', label: 'No', labelSize: 13, labelNear: 'start', dy: -12 });
      s.link(L, d3, notify, { label: 'No', labelSize: 13, labelAt: [X + 22, 656] });
      s.link(L, d3, out3, { from: 'right', to: 'left', label: 'Yes', labelSize: 13, labelNear: 'start', dy: -12 });
      s.link(L, notify, review);
      s.link(L, review, end);
      [out1, out2, out3].forEach(n => {
        s.link(L, n, s.port(end, 'right'), { from: 'right', to: 'right', via: [[TR, n.box.y], [TR, 832]] });
      });
    }
  });
})();
