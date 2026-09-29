/* Still diagram (NESA flowchart): finding a printer fault, used to build IF-THEN rules for an expert system.
   Notation: NESA Enterprise Computing Course Specifications, p.6 (START and END terminators, input/output, process, decision).
   Intelligent systems › Building a knowledge base. */
(() => {
  const X = 190, XR = 470, XT = 630;
  HSCAnim.define('is-flowchart-printer', {
    still: true,
    title: 'Flowchart: finding a printer fault',
    alt: 'Flowchart. START, then input: enter the printer light status. Decision: power light on? No: the process plug in and switch on. Yes: decision: paper jam light on? Yes: the process clear the paper jam. No: decision: printer shown as online? No: the process reconnect the printer to Wi-Fi. Yes: the process clear the print queue. All four processes lead to END.',
    layout: { size: [700, 720], minWidth: 700 },
    setup(s) {
      const L = s.g(s.back);
      const start = s.node(s.root, { x: X, y: 32, w: 150, h: 42, shape: 'terminator', text: 'START' });
      const inp = s.node(s.root, { x: X, y: 108, w: 210, h: 50, shape: 'io', text: 'Enter the printer\nlight status' });
      const d1 = s.node(s.root, { x: X, y: 218, w: 200, h: 94, shape: 'decision', text: 'Power light\non?' });
      const d2 = s.node(s.root, { x: X, y: 348, w: 200, h: 94, shape: 'decision', text: 'Paper jam\nlight on?' });
      const d3 = s.node(s.root, { x: X, y: 478, w: 200, h: 94, shape: 'decision', text: 'Printer shown\nas online?' });
      const a1 = s.node(s.root, { x: XR, y: 218, w: 170, h: 56, shape: 'process', text: 'Plug in and\nswitch on' });
      const a2 = s.node(s.root, { x: XR, y: 348, w: 170, h: 56, shape: 'process', text: 'Clear the\npaper jam' });
      const a3 = s.node(s.root, { x: XR, y: 478, w: 170, h: 56, shape: 'process', text: 'Reconnect the\nprinter to Wi-Fi' });
      const a4 = s.node(s.root, { x: X, y: 600, w: 170, h: 56, shape: 'process', text: 'Clear the\nprint queue' });
      const end = s.node(s.root, { x: X, y: 690, w: 150, h: 42, shape: 'terminator', text: 'END' });
      s.link(L, start, inp);
      s.link(L, inp, d1);
      s.link(L, d1, a1, { from: 'right', to: 'left', label: 'No', labelSize: 13, labelAt: [XR - 130, 202] });
      s.link(L, d1, d2, { label: 'Yes', labelSize: 13, labelAt: [X + 26, 290] });
      s.link(L, d2, a2, { from: 'right', to: 'left', label: 'Yes', labelSize: 13, labelAt: [XR - 130, 332] });
      s.link(L, d2, d3, { label: 'No', labelSize: 13, labelAt: [X + 24, 420] });
      s.link(L, d3, a3, { from: 'right', to: 'left', label: 'No', labelSize: 13, labelAt: [XR - 130, 462] });
      s.link(L, d3, a4, { label: 'Yes', labelSize: 13, labelAt: [X + 26, 550] });
      s.link(L, a4, end);
      s.link(L, a1, end, { from: 'right', to: 'right', via: [[XT, 218], [XT, 690]] });
      s.link(L, a2, [XT, 348], { from: 'right', head: false });
      s.link(L, a3, [XT, 478], { from: 'right', head: false });
    }
  });
})();
