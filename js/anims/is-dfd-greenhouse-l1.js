/* Still diagram (NESA data flow diagram, Level 1): a nursery's smart greenhouse controller.
   Notation: NESA Enterprise Computing Course Specifications, pp.4-5 (circle process, open-ended data store, closed external entities, labelled curved flows).
   Intelligent systems › Communicating logical processes. */
(() => {
  const flow = (s, L, a, b, label, bend, sep = 14, lab = 18) => {
    const A = [a.box.x, a.box.y], B = [b.box.x, b.box.y];
    const dx = B[0] - A[0], dy = B[1] - A[1], len = Math.hypot(dx, dy) || 1;
    const px = -dy / len, py = dx / len, sg = bend > 0 ? 1 : -1;
    const p0 = s.rim(a, [B[0] + px * sep * sg, B[1] + py * sep * sg]);
    const p1 = s.rim(b, [A[0] + px * sep * sg, A[1] + py * sep * sg]);
    const m = [(p0[0] + p1[0]) / 2 + px * bend / 2, (p0[1] + p1[1]) / 2 + py * bend / 2];
    s.link(L, p0, p1, { curve: bend, label, labelSize: 13, labelAt: [m[0] + px * sg * lab, m[1] + py * sg * lab] });
  };
  HSCAnim.define('is-dfd-greenhouse-l1', {
    still: true,
    title: 'Level 1 data flow diagram: a smart greenhouse controller',
    alt: 'Level 1 data flow diagram of the greenhouse controller. Soil sensors send Moisture readings to the process Check readings, which stores Valid readings in the Readings log. The Readings log gives Recent readings to the process Decide watering. The Grower sends Crop settings to the Watering rules data store, which gives Watering rules to Decide watering. The Weather service sends a Rain forecast to Decide watering. Decide watering sends a Watering decision to the process Send commands, which sends Pump commands to the Pump controller and Watering alerts to the Grower.',
    layout: { size: [800, 600], minWidth: 800 },
    setup(s) {
      const L = s.g(s.back);
      const P = (x, y, text) => s.node(s.root, { x, y, w: 104, h: 104, shape: 'circle', text });
      const E = (x, y, text) => s.node(s.root, { x, y, w: 96, h: 92, shape: 'entity', text });
      const D = (x, y, text) => s.node(s.root, { x, y, w: 128, h: 74, shape: 'store', text });
      const sensors = E(66, 90, 'Soil\nsensors');
      const check = P(282, 90, 'Check\nreadings');
      const log = D(520, 90, 'Readings log');
      const grower = E(66, 500, 'Grower');
      const rules = D(272, 300, 'Watering\nrules');
      const decide = P(520, 300, 'Decide\nwatering');
      const weather = E(734, 300, 'Weather\nservice');
      const send = P(520, 500, 'Send\ncommands');
      const pump = E(734, 500, 'Pump\ncontroller');
      flow(s, L, sensors, check, 'Moisture readings', 26);
      flow(s, L, check, log, 'Valid readings', 26);
      flow(s, L, log, decide, 'Recent readings', 26);
      flow(s, L, grower, rules, 'Crop settings', 26);
      flow(s, L, rules, decide, 'Watering rules', 26);
      flow(s, L, weather, decide, 'Rain forecast', 26);
      flow(s, L, decide, send, 'Watering decision', 26);
      flow(s, L, send, pump, 'Pump commands', 26);
      flow(s, L, send, grower, 'Watering alerts', 26);
    }
  });
})();
