/* Still diagram (NESA flowchart): the delivery charge for perishable and non-perishable items.
   NESA Enterprise Computing Course Specifications, p.6 (redrawn with the diagram kit).
   Enterprise Computing › Communicating system logic (flowcharts). */
(() => {
  const X = 200, XR = 590;
  HSCAnim.define('spec-flowchart-delivery', {
    still: true,
    title: 'Flowchart: delivery charge for perishable and non-perishable items',
    alt: 'Flowchart. START, then input: enter if item perishable. Decision: contains perishable items? Yes: the process delivery charge applies. No: input: enter the delivery distance. Decision: delivery distance greater than 10 kilometres? No: the process no delivery charge. Yes: decision: value of order is $100 or less? Yes: delivery charge applies. No: no delivery charge. Both processes lead to END.',
    layout: { size: [700, 690], minWidth: 700 },
    setup(s) {
      const L = s.g(s.back);
      const start = s.node(s.root, { x: X, y: 32, w: 150, h: 42, shape: 'terminator', text: 'START' });
      const in1 = s.node(s.root, { x: X, y: 104, w: 190, h: 50, shape: 'io', text: 'Enter if item\nperishable' });
      const d1 = s.node(s.root, { x: X, y: 206, w: 200, h: 96, shape: 'decision', text: 'Contains\nperishable\nitems?' });
      const in2 = s.node(s.root, { x: X, y: 322, w: 200, h: 50, shape: 'io', text: 'Enter the\ndelivery distance' });
      const d2 = s.node(s.root, { x: X, y: 428, w: 200, h: 90, shape: 'decision', text: 'Delivery\ndistance >10km?' });
      const d3 = s.node(s.root, { x: 440, y: 428, w: 180, h: 90, shape: 'decision', text: 'Value of\norder ≤$100?' });
      const yes = s.node(s.root, { x: XR, y: 500, w: 130, h: 64, shape: 'process', text: 'Delivery\ncharge\napplies' });
      const no = s.node(s.root, { x: X, y: 552, w: 130, h: 64, shape: 'process', text: 'No\ndelivery\ncharge' });
      const end = s.node(s.root, { x: X, y: 648, w: 150, h: 42, shape: 'terminator', text: 'END' });
      s.link(L, start, in1);
      s.link(L, in1, d1);
      s.link(L, d1, yes, { from: 'right', to: 'top', labelSize: 13, label: 'Yes', labelAt: [XR - 110, 190] });
      s.link(L, d1, in2, { labelSize: 13, label: 'No', labelAt: [X + 22, 268] });
      s.link(L, in2, d2);
      s.link(L, d2, d3, { from: 'right', to: 'left', labelSize: 13, label: 'Yes', labelAt: [335, 414] });
      s.link(L, d3, [XR, 428], { from: 'right', labelSize: 13, label: 'Yes', labelAt: [XR - 26, 414] });
      s.link(L, d3, [X, 486], { from: 'bottom', via: [[440, 486]], labelSize: 13, label: 'No', labelAt: [390, 502] });
      s.link(L, d2, no, { labelSize: 13, label: 'No', labelAt: [X - 24, 492] });
      s.link(L, yes, [X, 612], { from: 'bottom', via: [[XR, 612]] });
      s.link(L, no, end);
    }
  });
})();
