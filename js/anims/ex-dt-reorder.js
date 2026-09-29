/* Still diagram (NESA decision tree, vertical): the reorder rules used by the Canteen Insights dashboard (a fictional project).
   The dashboard's reorder list runs exactly these rules (see decide() in js/pages/example-project.js).
   NESA Enterprise Computing Course Specifications, p.8 (rectangles joined by labelled branches; each path ends in a final action).
   Example Enterprise Project › Researching and planning (decision trees). */
HSCAnim.define('ex-dt-reorder', {
  still: true,
  title: 'Decision tree: what to order for next week',
  alt: 'Decision tree. Is the item perishable? Yes: was waste last week over 10 per cent? Yes: order to forecast. No: order forecast plus 10 per cent. Perishable No: are there fewer than 3 days of stock left? Yes: reorder now. No: are there fewer than 5 days of stock left? Yes: reorder soon. No: hold, no order needed.',
  layout: { size: [880, 400], minWidth: 880 },
  setup(s) {
    const L = s.g(s.back);
    const Q = (x, y, text, w = 190, h = 46) => s.node(s.root, { x, y, w, h, shape: 'process', text, tone: 'mustard-t' });
    const A = (x, y, text, tone, w = 150, h = 50) => s.node(s.root, { x, y, w, h, shape: 'process', text, tone, cls: 'pa-strong' });
    const br = (a, b, label, side) => s.link(L, a, b, { straight: true, head: false, label, labelSize: 13, dx: side * 20, dy: -4 });
    const root = Q(400, 32, 'Perishable item?');
    const waste = Q(190, 140, 'Waste last week\nover 10%?', 190, 52);
    const days3 = Q(620, 140, 'Days of stock\nleft under 3?', 190, 52);
    const fc = A(90, 260, 'Order to\nforecast', 'sky-t', 140, 52);
    const buf = A(290, 260, 'Order forecast\n+ 10%', 'sky-t', 150, 52);
    const now = A(500, 260, 'Reorder now', 'terra-t', 140, 46);
    const days5 = Q(730, 260, 'Days of stock\nleft under 5?', 190, 52);
    const soon = A(640, 372, 'Reorder soon', 'blush-t', 150, 46);
    const hold = A(820, 372, 'Hold: no order', 'sage-t', 100, 46);
    hold.box.w = 130; hold.box.x = 805;
    br(root, waste, 'Yes', -1); br(root, days3, 'No', 1);
    br(waste, fc, 'Yes', -1); br(waste, buf, 'No', 1);
    br(days3, now, 'Yes', -1); br(days3, days5, 'No', 1);
    br(days5, soon, 'Yes', -1); br(days5, hold, 'No', 1);
  }
});
