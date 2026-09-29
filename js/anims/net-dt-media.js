/* Still diagram (NESA decision tree, vertical): choosing a transmission medium for a link.
   NESA Enterprise Computing Course Specifications, p.8 style (rectangles, labelled branches, final actions).
   Networking systems › Transmission media. */
HSCAnim.define('net-dt-media', {
  still: true,
  title: 'Decision tree (vertical): choosing a transmission medium',
  alt: 'Decision tree. Do devices need to move around? Yes: within one building or campus? Yes: use Wi-Fi. No: use cellular 4G or 5G. No, devices are fixed: is the link longer than 100 metres? No: use twisted pair Ethernet. Yes: can a cable be laid? Yes: use fibre optic. No: use a microwave or satellite link.',
  layout: { size: [790, 380], minWidth: 790 },
  setup(s) {
    const L = s.g(s.back);
    const Q = (x, y, text, w = 180) => s.node(s.root, { x, y, w, h: 52, shape: 'process', text, tone: 'mustard-t' });
    const A = (x, y, text, w = 130) => s.node(s.root, { x, y, w, h: 48, shape: 'process', text, tone: 'sage-t', cls: 'pa-strong' });
    const br = (a, b, label, side) => s.link(L, a, b, { straight: true, head: false, label, labelSize: 13, dx: side * 18, dy: -4 });
    const root = Q(395, 30, 'Devices need\nto move around?', 210);
    const t1 = Q(185, 135, 'Within one building\nor campus?', 190), t2 = Q(605, 135, 'Link longer\nthan 100 m?', 170);
    const wifi = A(85, 245, 'Wi-Fi', 110), cell = A(285, 245, 'Cellular\n4G or 5G', 130);
    const eth = A(710, 245, 'Twisted pair\nEthernet', 130), cab = Q(500, 245, 'Can a cable\nbe laid?', 150);
    const fib = A(420, 345, 'Fibre optic', 120), mic = A(600, 345, 'Microwave or\nsatellite link', 150);
    br(root, t1, 'Yes', -1); br(root, t2, 'No', 1);
    br(t1, wifi, 'Yes', -1); br(t1, cell, 'No', 1);
    br(t2, cab, 'Yes', -1); br(t2, eth, 'No', 1);
    br(cab, fib, 'Yes', -1); br(cab, mic, 'No', 1);
  }
});
