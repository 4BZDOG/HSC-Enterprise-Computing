/* Still diagram (NESA system flowchart): the main processes and devices of a smart greenhouse.
   Notation: NESA Enterprise Computing Course Specifications, p.7 (online input, process, direct access storage, online display, manual operation, telecommunications link, cloud).
   Intelligent systems › Designing an automated smart system. */
HSCAnim.define('is-sysflow-greenhouse', {
  still: true,
  title: 'System flowchart: a smart greenhouse',
  alt: 'System flowchart. Sensor readings (online input) go to the process Check readings, which stores them in the Reading log (direct access storage) and passes them to the process Decide action. The Reading log sends data over a telecommunications link to Cloud analytics (cloud). The Rules and settings file (direct access storage) feeds Decide action. The Grower adjusts rules (manual operation) and the change is stored in the Rules and settings file. Decide action sends commands to the process Switch fans, vents and watering, which sends a status to the Grower dashboard (online display).',
  layout: { size: [800, 470], minWidth: 800 },
  setup(s) {
    const L = s.g(s.back), st = { straight: true };
    const sens = s.node(s.root, { x: 96, y: 64, w: 140, h: 66, shape: 'sf-input', text: 'Sensor\nreadings' });
    const chk = s.node(s.root, { x: 330, y: 64, w: 130, h: 56, shape: 'process', text: 'Check\nreadings' });
    const log = s.node(s.root, { x: 566, y: 64, w: 120, h: 86, shape: 'sf-storage', text: 'Reading\nlog' });
    const cloud = s.node(s.root, { x: 730, y: 190, w: 116, h: 80, shape: 'sf-cloud', text: 'Cloud\nanalytics' });
    const dec = s.node(s.root, { x: 330, y: 200, w: 130, h: 56, shape: 'process', text: 'Decide\naction' });
    const rules = s.node(s.root, { x: 566, y: 300, w: 130, h: 86, shape: 'sf-storage', text: 'Rules and\nsettings file' });
    const man = s.node(s.root, { x: 730, y: 400, w: 140, h: 66, shape: 'sf-manual', text: 'Grower\nadjusts rules' });
    const act = s.node(s.root, { x: 330, y: 336, w: 160, h: 66, shape: 'process', text: 'Switch fans, vents\nand watering' });
    const dash = s.node(s.root, { x: 96, y: 336, w: 150, h: 70, shape: 'sf-display', text: 'Grower\ndashboard' });
    s.link(L, sens, chk, st);
    s.link(L, chk, log, st);
    s.link(L, chk, dec, st);
    s.telecomLink(L, log, cloud, { amp: 16 });
    s.link(L, rules, dec, st);
    s.link(L, man, rules, st);
    s.link(L, dec, act, st);
    s.link(L, act, dash, st);
  }
});
