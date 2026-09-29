/* Still diagram (NESA network diagram): the network of an intelligent fruit-packing shed with an IoT gateway, servers, local and cloud storage, and end-point devices.
   Notation: NESA Enterprise Computing Course Specifications, p.10 (labelled device symbols joined by dotted links).
   Intelligent systems › Infrastructure for an intelligent network. */
HSCAnim.define('is-network-iot', {
  still: true,
  title: 'Network diagram: an IoT network for a fruit-packing shed',
  alt: 'Network diagram. The Internet, labelled cloud storage and AI service, connects to a Router and firewall by fibre broadband. The router connects by Wi-Fi to a Manager tablet and by Ethernet to a Switch. The switch connects to an Application server (expert system) with Local storage (NAS), to an Office computer and to an IoT gateway. The IoT gateway connects by low-power radio to four end-point devices: a Temperature sensor, a Camera, a Conveyor controller and a Handheld scanner.',
  layout: { size: [800, 640], minWidth: 800 },
  setup(s) {
    const L = s.g(s.back), D = (type, label, x, y) => s.device(s.root, { type, label, x, y });
    const ln = (a, b, opts) => s.link(L, a, b, Object.assign({ straight: true, head: false, cls: 'is-net' }, opts || {}));
    const net = D('internet', 'Cloud storage and\nAI service (Internet)', 410, 44);
    const rt = D('router', 'Router and\nfirewall', 410, 176);
    const tab = D('tablet', 'Manager tablet', 680, 176);
    const sw = D('switch', 'Switch', 410, 298);
    const app = D('server', 'Application server\n(expert system)', 130, 270);
    const nas = D('server', 'Local storage\n(NAS)', 130, 420);
    const pc = D('computer', 'Office\ncomputer', 680, 290);
    const gw = D('wireless', '', 410, 430);
    s.text(s.root, 'IoT gateway', { x: 440, y: 432, anchor: 'start', valign: 'middle', cls: 'pa-t', size: 13 });
    const ends = [['sensor', 'Temperature\nsensor', 100], ['sensor', 'Camera', 290], ['sensor', 'Conveyor\ncontroller', 530], ['phone', 'Handheld\nscanner', 720]].map(([t, l, x]) => D(t, l, x, 560));
    ln(net, rt, { from: 'bottom', to: 'top', label: 'Fibre broadband', labelSize: 13, labelAt: [500, 112] });
    ln(rt, tab, { from: 'right', to: 'left', label: 'Wi-Fi', labelSize: 13, labelAt: [545, 160] });
    ln(rt, sw, { from: 'bottom', to: 'top' });
    ln(sw, app, { from: 'left', to: 'right', label: 'Ethernet', labelSize: 13, labelAt: [270, 272] });
    ln(app, nas, { from: 'bottom', to: 'top' });
    ln(sw, pc, { from: 'right', to: 'left' });
    ln(sw, gw, { from: 'bottom', to: 'top' });
    ends.forEach((e, i) => ln([410, 452], e, { from: undefined, label: i === 1 ? 'Low-power radio' : undefined, labelSize: 13, labelAt: i === 1 ? [285, 486] : undefined }));
  }
});
