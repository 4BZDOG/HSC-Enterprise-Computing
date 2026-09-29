/* Still diagram (NESA decision tree, vertical): should I buy this car?
   NESA Enterprise Computing Course Specifications, p.8 (redrawn with the diagram kit).
   Enterprise Computing › Communicating system logic (decision trees). */
HSCAnim.define('spec-dt-buy-car', {
  still: true,
  title: 'Decision tree (vertical): buying a car',
  alt: 'Decision tree. Mileage under 10 000 km? Yes: is the type an SUV? Yes: buy. No: is the colour silver? Yes: buy. No: do not buy. Mileage No: is the type an SUV? Yes: buy. No: optional accessories? Yes: buy. No: do not buy.',
  layout: { size: [790, 410], minWidth: 790 },
  setup(s) {
    const L = s.g(s.back);
    const Q = (x, y, text, w = 170) => s.node(s.root, { x, y, w, h: 44, shape: 'process', text, tone: 'mustard-t' });
    const A = (x, y, text, good, w = 96) => s.node(s.root, { x, y, w, h: 40, shape: 'process', text, tone: good ? 'sage-t' : 'terra-t', cls: 'pa-strong' });
    const br = (a, b, label, side) => s.link(L, a, b, { straight: true, head: false, label, labelSize: 13, dx: side * 18, dy: -4 });
    const root = Q(385, 30, 'Mileage < 10 000 km', 200);
    const t1 = Q(185, 130, 'Type = SUV'), t2 = Q(585, 130, 'Type = SUV');
    const b1 = A(80, 235, 'Buy', true), c1 = Q(270, 235, 'Colour = Silver', 150);
    const b2 = A(480, 235, 'Buy', true), o2 = Q(680, 235, 'Optional\nAccessories', 120);
    o2.box.h = 44;
    const b3 = A(200, 350, 'Buy', true), n3 = A(340, 350, 'Do not buy', false, 116);
    const b4 = A(600, 350, 'Buy', true), n4 = A(730, 350, 'Do not buy', false, 116);
    br(root, t1, 'Yes', -1); br(root, t2, 'No', 1);
    br(t1, b1, 'Yes', -1); br(t1, c1, 'No', 1);
    br(t2, b2, 'Yes', -1); br(t2, o2, 'No', 1);
    br(c1, b3, 'Yes', -1); br(c1, n3, 'No', 1);
    br(o2, b4, 'Yes', -1); br(o2, n4, 'No', 1);
  }
});
