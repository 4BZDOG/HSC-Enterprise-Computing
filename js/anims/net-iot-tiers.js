/* Still diagram (concept): IoT devices, an edge gateway and the cloud, showing where processing happens.
   Networking systems › IoT and the Internet of Me (edge computing) and IoT interoperability. */
HSCAnim.define('net-iot-tiers', {
  still: true,
  title: 'Concept diagram: IoT devices, an edge gateway and the cloud',
  alt: 'Three tiers from left to right. Tier 1, IoT devices at the farm: a soil moisture sensor, a weather sensor and a pump controller. They send readings to Tier 2, an edge gateway on the farm that filters readings, makes fast local decisions such as switching the pump on, and keeps working if the internet drops. The gateway sends summaries to Tier 3, the cloud, which stores long-term data and trains machine learning models. Updated models and commands flow back from the cloud to the gateway.',
  layout: { size: [800, 380], minWidth: 800 },
  setup(s) {
    const L = s.g(s.back), st = { straight: true };
    const tier = (x, t) => s.text(s.root, t, { x, y: 24, cls: 'pa-title', size: 15 });
    tier(120, '1. IoT devices'); tier(400, '2. Edge gateway'); tier(680, '3. Cloud');
    const dev = ['Soil moisture\nsensor', 'Weather\nsensor', 'Pump\ncontroller'].map((t, i) => s.node(s.root, { x: 120, y: 90 + i * 100, w: 170, h: 62, shape: 'card', tone: 'sky-t', text: t }));
    const edge = s.node(s.root, { x: 400, y: 190, w: 200, h: 170, shape: 'card', tone: 'teal-t', text: 'Filters readings\nDecides locally\nBuffers data if the\ninternet drops', size: 14 });
    const cloud = s.node(s.root, { x: 680, y: 190, w: 200, h: 170, shape: 'card', tone: 'plum-t', text: 'Stores history\nTrains ML models\nDashboards and\nreports', size: 14 });
    dev.forEach(d => s.link(L, d, edge, st));
    s.link(L, edge, cloud, { straight: true, label: 'Summaries', labelSize: 13, dy: -14, from: 'right', to: 'left' });
    s.link(L, cloud, edge, { from: 'bottom', to: 'bottom', via: [[680, 300], [400, 300]], dashed: true });
    s.text(s.root, 'Updated models and commands come back down', { x: 540, y: 328, cls: 'pa-t', size: 13 });
    s.text(s.root, 'Only summaries travel over the internet', { x: 540, y: 356, cls: 'pa-t pa-soft', size: 13 });
  }
});
