/* Still diagram (concept): the parts of a SCADA system, from field devices to the operator's screen.
   Networking systems › IoT interoperability and SCADA. */
HSCAnim.define('net-scada', {
  still: true,
  title: 'Concept diagram: the parts of a SCADA system',
  alt: 'Field devices (sensors, pumps and valves) exchange data with a PLC or RTU that controls them locally. The PLC or RTU exchanges data over a communications link (radio, cellular or fibre) with the SCADA server at the control centre. The SCADA server shows live data to an operator on the HMI screen and stores history in a data historian.',
  layout: { size: [860, 340], minWidth: 860 },
  setup(s) {
    const L = s.g(s.back), st = { straight: true, both: true };
    const card = (x, y, t, tone, w = 160, h = 92) => s.node(s.root, { x, y, w, h, shape: 'card', tone, text: t, size: 14 });
    const fd = card(105, 100, 'Field devices\nsensors, pumps,\nvalves', 'sky-t'), plc = card(300, 100, 'PLC or RTU\nlocal control\nat the site', 'teal-t');
    const net = card(495, 100, 'Communications\nradio, cellular,\nfibre', 'sheet'), srv = card(700, 100, 'SCADA server\nat the control\ncentre', 'plum-t');
    const hmi = card(610, 260, 'HMI\noperator screen\nand alarms', 'mustard-t', 170), his = card(790, 260, 'Historian\nstores readings\nand events', 'mustard-t', 150);
    [[fd, plc], [plc, net], [net, srv], [srv, hmi], [srv, his]].forEach(([a, b]) => s.link(L, a, b, st));
    s.text(s.root, 'Readings go up; commands and set-points come down', { x: 300, y: 200, cls: 'pa-t pa-soft', size: 13 });
  }
});
