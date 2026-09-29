/* Still diagram (NESA network diagram): a small veterinary clinic's network with wired, wireless and guest devices.
   NESA Enterprise Computing Course Specifications, p.10 (devices as nodes, dotted links, every device labelled).
   Networking systems › Designing and modelling a network. */
HSCAnim.define('net-office-network', {
  still: true,
  title: 'Network diagram: a small clinic',
  alt: 'Network diagram for a small clinic. The Internet connects to a Router and firewall. The router connects to a Switch and to a separate Guest Wi-Fi access point. The switch connects to two Reception computers, a Printer, a File server (NAS) and a Staff Wi-Fi access point. The staff access point connects to two Staff laptops and a Tablet. The guest access point connects to a Visitor phone.',
  layout: { size: [800, 600], minWidth: 800 },
  setup(s) {
    const L = s.g(s.back), D = (type, label, x, y) => s.device(s.root, { type, label, x, y });
    const net = D('internet', 'Internet (NBN)', 400, 40), rt = D('router', 'Router\nand firewall', 400, 150);
    const gw = D('router', 'Guest Wi-Fi\naccess point', 660, 150), gp = D('phone', 'Visitor\nphone', 660, 270);
    const sw = D('switch', 'Switch', 400, 280);
    const r1 = D('computer', 'Reception\ncomputer 1', 110, 200), r2 = D('computer', 'Reception\ncomputer 2', 110, 320);
    const pr = D('printer', 'Printer', 210, 440);
    const nas = D('server', 'File server\n(NAS)', 690, 380);
    const ap = D('router', 'Staff Wi-Fi\naccess point', 400, 400);
    const l1 = D('laptop', 'Staff laptop 1', 250, 535), l2 = D('laptop', 'Staff laptop 2', 400, 535), tb = D('tablet', 'Tablet', 550, 535);
    [[net, rt], [rt, sw], [rt, gw], [gw, gp], [sw, r1], [sw, r2], [sw, pr], [sw, nas], [sw, ap], [[400, 480], l1], [[400, 480], l2], [[400, 480], tb]]
      .forEach(([a, b]) => s.link(L, a, b, { straight: true, head: false, cls: 'is-net' }));
  }
});
