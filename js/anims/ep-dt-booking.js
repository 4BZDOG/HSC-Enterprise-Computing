/* Still diagram (NESA decision tree, vertical form): the rules ClubHub uses to answer a court booking request.
   Notation: NESA Enterprise Computing Course Specifications, p.8 (rectangles joined by labelled branches; each path ends in a final action).
   Enterprise project › Researching and planning (decision trees). */
HSCAnim.define('ep-dt-booking', {
  still: true,
  title: 'Decision tree: can this member book the court?',
  alt: 'Decision tree for a ClubHub court booking. Is the member financial? Yes: is the court free at that time? Yes: confirm the booking. No: offer the next free time. Is the member financial? No: is it a casual guest booking? Yes: take the casual fee, then confirm. No: decline and show how to pay fees.',
  layout: { size: [740, 350], minWidth: 740 },
  setup(s) {
    const L = s.g(s.back);
    const Q = (x, y, text, w = 170) => s.node(s.root, { x, y, w, h: 50, shape: 'process', text, tone: 'mustard-t' });
    const A = (x, y, text, w = 140, good = true) => s.node(s.root, { x, y, w, h: 50, shape: 'process', text, tone: good ? 'sage-t' : 'terra-t', cls: 'pa-strong' });
    const br = (a, b, label, side) => s.link(L, a, b, { straight: true, head: false, label, labelSize: 13, dx: side * 20, dy: -4 });
    const root = Q(370, 34, 'Is the member\nfinancial?', 180);
    const free = Q(180, 140, 'Is the court free\nat that time?', 180);
    const guest = Q(560, 140, 'Is it a casual\nguest booking?', 180);
    const ok = A(90, 250, 'Confirm the\nbooking', 140);
    const next = A(270, 250, 'Offer the next\nfree time', 140, false);
    const fee = A(470, 250, 'Take the casual\nfee, then confirm', 160);
    const no = A(650, 250, 'Decline and show\nhow to pay fees', 160, false);
    br(root, free, 'Yes', -1); br(root, guest, 'No', 1);
    br(free, ok, 'Yes', -1); br(free, next, 'No', 1);
    br(guest, fee, 'Yes', -1); br(guest, no, 'No', 1);
  }
});
