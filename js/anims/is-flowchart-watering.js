/* Still diagram (NESA flowchart): the logic of one greenhouse watering decision.
   Notation: NESA Enterprise Computing Course Specifications, p.6 (START and END terminators, input/output, process, decision).
   Intelligent systems › Communicating logical processes. */
(() => {
  const X = 190, XR = 470;
  HSCAnim.define('is-flowchart-watering', {
    still: true,
    title: 'Flowchart: should the greenhouse pump run?',
    alt: 'Flowchart. START, then input: read soil moisture and the rain forecast. Decision: soil moisture below 40 per cent? No: the process do nothing. Yes: decision: rain forecast today? Yes: the process do nothing. No: the process run the pump for 10 minutes, then output: send a watering alert. Both paths lead to END.',
    layout: { size: [660, 640], minWidth: 660 },
    setup(s) {
      const L = s.g(s.back);
      const start = s.node(s.root, { x: X, y: 32, w: 150, h: 42, shape: 'terminator', text: 'START' });
      const inp = s.node(s.root, { x: X, y: 108, w: 250, h: 52, shape: 'io', text: 'Read soil moisture and\nthe rain forecast' });
      const d1 = s.node(s.root, { x: X, y: 224, w: 230, h: 100, shape: 'decision', text: 'Soil moisture\nbelow 40%?' });
      const d2 = s.node(s.root, { x: X, y: 366, w: 230, h: 100, shape: 'decision', text: 'Rain forecast\ntoday?' });
      const run = s.node(s.root, { x: X, y: 490, w: 210, h: 52, shape: 'process', text: 'Run the pump\nfor 10 minutes' });
      const alert = s.node(s.root, { x: X, y: 566, w: 210, h: 40, shape: 'io', text: 'Send watering alert' });
      const none = s.node(s.root, { x: XR + 30, y: 366, w: 170, h: 52, shape: 'process', text: 'Do nothing' });
      const end = s.node(s.root, { x: X, y: 620, w: 150, h: 36, shape: 'terminator', text: 'END' });
      s.link(L, start, inp);
      s.link(L, inp, d1);
      s.link(L, d1, d2, { label: 'Yes', labelSize: 13, labelAt: [X + 26, 300] });
      s.link(L, d1, none, { from: 'right', to: 'top', label: 'No', labelSize: 13, labelAt: [X + 138, 208], via: [[XR + 30, 224]] });
      s.link(L, d2, run, { label: 'No', labelSize: 13, labelAt: [X + 24, 440] });
      s.link(L, d2, none, { from: 'right', to: 'left', label: 'Yes', labelSize: 13, labelAt: [XR - 100, 350] });
      s.link(L, run, alert);
      s.link(L, alert, end);
      s.link(L, none, end, { from: 'bottom', to: 'right', via: [[XR + 30, 620]] });
    }
  });
})();
