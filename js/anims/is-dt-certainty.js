/* Still diagram (NESA decision tree, vertical form): a plant-care expert system with a certainty factor on each final action.
   Notation: NESA Enterprise Computing Course Specifications, p.8 (rectangles, labelled branches, each path ends in a final action).
   Intelligent systems › Certainty factors and decision trees. */
HSCAnim.define('is-dt-certainty', {
  still: true,
  title: 'Decision tree: diagnosing a plant with yellow leaves, with certainty factors',
  alt: 'Decision tree for a plant-care expert system. Leaves yellow? No: no action needed, certainty factor 0.9. Yes: soil wet? Yes: drainage blocked? Yes: repot and reduce watering, certainty factor 0.9. No: reduce watering, certainty factor 0.8. Soil wet, No: soil dry? Yes: water thoroughly, certainty factor 0.7. No: add fertiliser, certainty factor 0.5.',
  layout: { size: [800, 420], minWidth: 800 },
  setup(s) {
    const L = s.g(s.back);
    const Q = (x, y, text, w = 150) => s.node(s.root, { x, y, w, h: 54, shape: 'process', text, tone: 'mustard-t' });
    const A = (x, y, text, w = 150) => s.node(s.root, { x, y, w, h: 66, shape: 'process', text, tone: 'sage-t', cls: 'pa-strong' });
    const br = (a, b, label, side) => s.link(L, a, b, { straight: true, head: false, label, labelSize: 13, dx: side * 20, dy: -4 });
    const q1 = Q(540, 34, 'Leaves\nyellow?');
    const q2 = Q(330, 140, 'Soil\nwet?');
    const l5 = A(726, 140, 'No action\nneeded\nCF 0.9', 130);
    const q3 = Q(170, 254, 'Drainage\nblocked?');
    const q4 = Q(490, 254, 'Soil\ndry?');
    const l1 = A(90, 364, 'Repot and reduce\nwatering\nCF 0.9', 156);
    const l2 = A(256, 364, 'Reduce\nwatering\nCF 0.8', 150);
    const l3 = A(414, 364, 'Water\nthoroughly\nCF 0.7', 140);
    const l4 = A(566, 364, 'Add\nfertiliser\nCF 0.5', 140);
    br(q1, q2, 'Yes', -1); br(q1, l5, 'No', 1);
    br(q2, q3, 'Yes', -1); br(q2, q4, 'No', 1);
    br(q3, l1, 'Yes', -1); br(q3, l2, 'No', 1);
    br(q4, l3, 'Yes', -1); br(q4, l4, 'No', 1);
  }
});
