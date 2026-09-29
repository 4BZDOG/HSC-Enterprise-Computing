/* Still diagram (NESA decision tree, vertical form): the rules an expert system uses to diagnose a laptop fault.
   Notation: NESA Enterprise Computing Course Specifications, p.8 (decision trees) and p.20 (expert system: display the rules used as a decision tree).
   Course Toolkit › Expert system software. */
HSCAnim.define('tk-dt-helpdesk', {
  still: true,
  title: 'Decision tree: diagnosing a laptop fault',
  alt: 'Decision tree for a laptop help desk expert system. Power light on? Yes: does the screen show a picture? Yes: is Wi-Fi connected? Yes: no fault found. No: restart the Wi-Fi adapter. Screen shows a picture, No: connect to an external screen. Power light on, No: is the charger plugged in? Yes: try a different charger. No: plug in the charger.',
  layout: { size: [730, 370], minWidth: 730 },
  setup(s) {
    const L = s.g(s.back);
    const Q = (x, y, text, w = 170) => s.node(s.root, { x, y, w, h: 48, shape: 'process', text, tone: 'mustard-t' });
    const A = (x, y, text, w = 130, good = true) => s.node(s.root, { x, y, w, h: 48, shape: 'process', text, tone: good ? 'sage-t' : 'terra-t', cls: 'pa-strong' });
    const br = (a, b, label, side) => s.link(L, a, b, { straight: true, head: false, label, labelSize: 13, dx: side * 18, dy: -4 });
    const root = Q(365, 32, 'Power light on?', 190);
    const screen = Q(190, 138, 'Screen shows\na picture?', 160);
    const charger = Q(560, 138, 'Charger\nplugged in?', 160);
    const wifi = Q(105, 246, 'Wi-Fi\nconnected?', 140);
    const ext = A(300, 246, 'Connect to an\nexternal screen', 140);
    const diff = A(470, 246, 'Try a different\ncharger', 140);
    const plug = A(650, 246, 'Plug in the\ncharger', 140);
    const ok = A(52, 346, 'No fault\nfound', 96);
    const wa = A(190, 346, 'Restart the\nWi-Fi adapter', 140);
    br(root, screen, 'Yes', -1); br(root, charger, 'No', 1);
    br(screen, wifi, 'Yes', -1); br(screen, ext, 'No', 1);
    br(charger, diff, 'Yes', -1); br(charger, plug, 'No', 1);
    br(wifi, ok, 'Yes', -1); br(wifi, wa, 'No', 1);
  }
});
