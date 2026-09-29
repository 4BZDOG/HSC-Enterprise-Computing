/* Still diagram (concept): the same house with poor and good Wi-Fi router placement.
   Networking systems › Interference with data transmission; Securing a smart home network (Wi-Fi device positioning). */
HSCAnim.define('net-wifi-placement', {
  still: true,
  title: 'Floor plan: poor and good Wi-Fi router placement',
  alt: 'Two floor plans of the same house. In the poor placement, the router sits on the floor of a cupboard in one corner, behind solid walls; the bedroom and study have a weak signal and the living room has almost none. In the good placement, the router sits high and near the centre of the house with open doorways towards every room, so the bedroom, study, kitchen and living room all have a good signal.',
  layout: { size: [800, 340], minWidth: 800 },
  setup(s) {
    const back = s.g(s.back);
    const plan = (x0, id, title, walls, router, alphas, rlabel, items) => {
      s.text(s.root, title, { x: x0 + 180, y: 22, cls: 'pa-title', size: 15 });
      s.el('rect', { x: x0, y: 40, width: 360, height: 280, rx: 6, class: 'f-paper' }, back);
      const cp = s.el('clipPath', { id: 'net-wp-' + id }, back);
      s.el('rect', { x: x0, y: 40, width: 360, height: 280 }, cp);
      const [rx, ry] = router;
      [120, 80, 45].forEach((r, i) => s.el('circle', { cx: x0 + rx, cy: ry, r, class: 'f-teal-t', opacity: alphas[i], 'clip-path': `url(#net-wp-${id})` }, back));
      s.el('rect', { x: x0, y: 40, width: 360, height: 280, rx: 6, class: 'pa-outline', fill: 'none' }, back);
      s.el('path', { d: walls.map(([a, b, c, d]) => `M${x0 + a} ${b} L${x0 + c} ${d}`).join(' '), class: 'pa-outline' }, back);
      s.device(s.root, { type: 'router', label: rlabel, x: x0 + rx, y: ry });
      items.forEach(([t, x, y]) => s.text(s.root, t, { x: x0 + x, y, cls: 'pa-t', size: 13, lh: 1.15 }));
    };
    plan(10, 'a', 'Poor placement',
      [[180, 40, 180, 150], [180, 200, 180, 320], [0, 180, 90, 180], [140, 180, 360, 180]],
      [40, 90], [.12, .2, .34], 'Router\nin a cupboard',
      [['Bedroom:\nweak signal', 270, 100], ['Study:\nweak signal', 90, 260], ['Living room:\nalmost none', 270, 260]]);
    plan(410, 'b', 'Good placement',
      [[180, 40, 180, 120], [180, 240, 180, 320], [0, 180, 90, 180], [270, 180, 360, 180]],
      [180, 165], [.14, .22, .36], 'Router high\nand central',
      [['Bedroom:\ngood signal', 90, 100], ['Study:\ngood signal', 270, 100], ['Living room:\ngood signal', 270, 270], ['Kitchen:\ngood signal', 90, 270]]);
  }
});
