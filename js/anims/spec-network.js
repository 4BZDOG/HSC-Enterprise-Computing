/* Still diagram (NESA network diagram): a network of varied devices around a router and two hubs.
   NESA Enterprise Computing Course Specifications, p.10 (redrawn with the diagram kit).
   Enterprise Computing › Networking systems (documenting a network). */
HSCAnim.define('spec-network', {
  still: true,
  title: 'Network diagram: devices joined to a router and two hubs',
  alt: 'Network diagram. The Internet connects to a Router. The Router connects to a left Hub and a right Hub, and down to a Wireless device. The left Hub connects to a Tablet and three Computers. The right Hub connects to four Computers. The Wireless device connects to a Smart phone and a Laptop. Every device is labelled.',
  layout: { size: [780, 560], minWidth: 780 },
  setup(s) {
    const L = s.g(s.back), D = (type, label, x, y) => s.device(s.root, { type, label, x, y });
    const net = D('internet', 'Internet', 390, 40), router = D('router', 'Router', 390, 250);
    const hubL = D('hub', 'Hub', 250, 250), hubR = D('hub', 'Hub', 530, 250);
    const left = [['tablet', 'Tablet'], ['computer', 'Computer'], ['computer', 'Computer'], ['computer', 'Computer']].map(([t, l], i) => D(t, l, 74, 76 + i * 118));
    const right = [0, 1, 2, 3].map(i => D('computer', 'Computer', 706, 76 + i * 118));
    const wl = D('wireless', 'Wireless\ndevice', 390, 420), ph = D('phone', 'Smart\nphone', 250, 430), lap = D('laptop', 'Laptop', 530, 430);
    const net_ = (a, b, via) => s.link(L, a, b, { via, head: false, cls: 'is-net' });
    net_([390, 92], [390, 232], []);
    net_([364, 250], [277, 250], []);
    net_([416, 250], [503, 250], []);
    net_([390, 300], [390, 392], []);
    net_([364, 430], [280, 430], []);   // wireless device to smart phone
    net_([416, 430], [498, 430], []);
    // left hub: trunk at x=160 to the four left devices
    net_([223, 250], [160, 250], []);
    net_([160, 76], [160, 430], []);
    left.forEach((n, i) => net_([160, 76 + i * 118], [108, 76 + i * 118], []));
    // right hub: trunk at x=620 to the four right devices
    net_([557, 250], [620, 250], []);
    net_([620, 76], [620, 430], []);
    right.forEach((n, i) => net_([620, 76 + i * 118], [672, 76 + i * 118], []));
  }
});
