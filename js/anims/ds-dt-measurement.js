/* Still diagram (NESA decision tree, vertical form): which level of measurement is this variable?
   Rectangles joined by labelled straight branches; each path ends in a final answer.
   Notation follows NESA Enterprise Computing Course Specifications, p.8.
   Data Science › Levels of measurement. */
HSCAnim.define('ds-dt-measurement', {
  still: true,
  title: 'Decision tree: which level of measurement?',
  alt: 'Decision tree. Question 1: can the values be put in order? No: nominal, for example station name. Yes: question 2, are the gaps between values equal? No: ordinal, for example a rating of poor, fair or good. Yes: question 3, is there a true zero, where zero means none? No: interval, for example temperature in degrees Celsius. Yes: ratio, for example trip length in minutes.',
  layout: { size: [720, 360], minWidth: 720 },
  setup(s) {
    const L = s.g(s.back);
    const Q = (x, y, text, w = 210) => s.node(s.root, { x, y, w, h: 52, shape: 'process', text, tone: 'mustard-t' });
    const A = (x, y, text, w = 150) => s.node(s.root, { x, y, w, h: 56, shape: 'process', text, tone: 'sage-t', cls: 'pa-strong' });
    const br = (a, b, label, side) => s.link(L, a, b, { straight: true, head: false, label, labelSize: 13, dx: side * 20, dy: -4 });
    const q1 = Q(250, 34, 'Can the values be\nput in order?');
    const nom = A(80, 130, 'Nominal\nstation name');
    const q2 = Q(400, 130, 'Are the gaps between\nvalues equal?', 220);
    const ord = A(250, 230, 'Ordinal\nrating: poor, fair, good', 210);
    const q3 = Q(560, 230, 'Is there a true zero\n(0 means none)?', 220);
    const itv = A(430, 326, 'Interval\ntemperature in °C', 190);
    const rat = A(640, 326, 'Ratio\ntrip length in minutes', 170);
    br(q1, nom, 'No', -1); br(q1, q2, 'Yes', 1);
    br(q2, ord, 'No', -1); br(q2, q3, 'Yes', 1);
    br(q3, itv, 'No', -1); br(q3, rat, 'Yes', 1);
  }
});
