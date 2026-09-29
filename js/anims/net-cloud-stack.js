/* Still diagram (concept): who manages each layer under on-premises, IaaS, PaaS and SaaS.
   Networking systems › Cloud computing services. */
HSCAnim.define('net-cloud-stack', {
  still: true,
  title: 'Concept diagram: who manages what under on-premises, IaaS, PaaS and SaaS',
  alt: 'A table of four columns and six layers. The layers from top to bottom are application, data, runtime and middleware, operating system, virtualisation and servers, and storage and networking. On-premises: the enterprise manages all six layers. IaaS: the enterprise manages the top four layers and the provider manages virtualisation, servers, storage and networking. PaaS: the enterprise manages only the application and its data and the provider manages the other four layers. SaaS: the provider manages all six layers.',
  layout: { size: [830, 420], minWidth: 830 },
  setup(s) {
    const layers = ['Application', 'Data', 'Runtime and\nmiddleware', 'Operating\nsystem', 'Virtualisation\nand servers', 'Storage and\nnetworking'];
    const cols = [['On-premises', 6], ['IaaS', 4], ['PaaS', 2], ['SaaS', 0]];
    const x0 = 122, cw = 165, rh = 54, y0 = 64;
    cols.forEach(([name, mine], c) => {
      const cx = x0 + c * (cw + 8) + cw / 2;
      s.text(s.root, name, { x: cx, y: 30, cls: 'pa-title', size: 16 });
      layers.forEach((l, i) => {
        const yours = i < mine;
        s.node(s.root, { x: cx, y: y0 + i * (rh + 4) + rh / 2, w: cw, h: rh, shape: 'process', text: yours ? 'You manage' : 'Provider\nmanages', tone: yours ? 'teal-t' : 'sheet', size: 13 });
      });
    });
    layers.forEach((l, i) => s.text(s.root, l, { x: 4, y: y0 + i * (rh + 4) + rh / 2, anchor: 'start', valign: 'middle', cls: 'pa-t pa-strong', size: 13, lh: 1.15 }));
  }
});
