/* Still diagram (NESA data flow diagram, Level 0): a nursery's smart greenhouse controller.
   Notation: NESA Enterprise Computing Course Specifications, pp.4-5 (circle process, closed external entities, labelled curved flows, no data stores at Level 0).
   Intelligent systems › Communicating logical processes. */
(() => {
  // A labelled, curved arrow between the outlines of two symbols; reversed pairs bulge to opposite sides.
  const flow = (s, L, a, b, label, bend, sep = 14, lab = 18) => {
    const A = [a.box.x, a.box.y], B = [b.box.x, b.box.y];
    const dx = B[0] - A[0], dy = B[1] - A[1], len = Math.hypot(dx, dy) || 1;
    const px = -dy / len, py = dx / len, sg = bend > 0 ? 1 : -1;
    const p0 = s.rim(a, [B[0] + px * sep * sg, B[1] + py * sep * sg]);
    const p1 = s.rim(b, [A[0] + px * sep * sg, A[1] + py * sep * sg]);
    const m = [(p0[0] + p1[0]) / 2 + px * bend / 2, (p0[1] + p1[1]) / 2 + py * bend / 2];
    s.link(L, p0, p1, { curve: bend, label, labelSize: 13, labelAt: [m[0] + px * sg * lab, m[1] + py * sg * lab] });
  };
  HSCAnim.define('is-dfd-greenhouse-l0', {
    still: true,
    title: 'Level 0 data flow diagram: a smart greenhouse controller',
    alt: 'Level 0 data flow diagram of a smart greenhouse controller: one process, Greenhouse controller, and four external entities, Soil sensors, Weather service, Grower and Pump controller. Soil sensors send Moisture readings. The Weather service sends Rain forecast. The Grower sends Crop settings and receives Watering alerts. The process sends Pump commands to the Pump controller, which returns Pump status. There are no data stores.',
    layout: { size: [800, 480], minWidth: 800 },
    setup(s) {
      const L = s.g(s.back);
      const E = (x, y, text) => s.node(s.root, { x, y, w: 104, h: 96, shape: 'entity', text });
      const sensors = E(84, 80, 'Soil\nsensors');
      const weather = E(84, 400, 'Weather\nservice');
      const grower = E(716, 80, 'Grower');
      const pump = E(716, 400, 'Pump\ncontroller');
      const sys = s.node(s.root, { x: 400, y: 240, w: 150, h: 150, shape: 'circle', text: 'Greenhouse\ncontroller' });
      flow(s, L, sensors, sys, 'Moisture readings', 30);
      flow(s, L, weather, sys, 'Rain forecast', 30);
      flow(s, L, grower, sys, 'Crop settings', 34, 14, 20);
      flow(s, L, sys, grower, 'Watering alerts', 34, 14, 20);
      flow(s, L, sys, pump, 'Pump commands', 34, 14, 20);
      flow(s, L, pump, sys, 'Pump status', 34, 14, 20);
    }
  });
})();
