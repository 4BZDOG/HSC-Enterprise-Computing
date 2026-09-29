/* Still diagram (concept): decomposing a smart greenhouse controller into smaller problems.
   Intelligent systems › Computational thinking in design (decomposition). */
HSCAnim.define('is-decomposition', {
  still: true,
  title: 'Concept diagram: decomposing a smart greenhouse controller',
  alt: 'A tree. The problem, a smart greenhouse controller, is broken into four smaller problems. Sense: read soil moisture, read temperature and humidity, detect a faulty sensor. Decide: apply the watering rules, adjust for the crop, use the rain forecast. Act: start or stop the pump, open or close the vents, run the fans. Report: show a dashboard, send alerts, log the data.',
  layout: { size: [800, 400], minWidth: 800 },
  setup(s) {
    const L = s.g(s.back);
    const root = s.node(s.root, { x: 394, y: 36, w: 240, h: 48, shape: 'card', tone: 'teal-t', text: 'Smart greenhouse controller', size: 14.5, cls: 'pa-strong' });
    const groups = [
      ['Sense', 'sky-t', ['Read soil moisture', 'Read temperature\nand humidity', 'Detect a faulty sensor']],
      ['Decide', 'sage-t', ['Apply the watering\nrules', 'Adjust for the crop', 'Use the rain forecast']],
      ['Act', 'mustard-t', ['Start or stop the pump', 'Open or close vents', 'Run the fans']],
      ['Report', 'plum-t', ['Show a dashboard', 'Send alerts', 'Log the data']]
    ];
    groups.forEach(([title, tone, leaves], i) => {
      const x = 100 + i * 196;
      const head = s.node(s.root, { x, y: 136, w: 150, h: 44, shape: 'card', tone, text: title, size: 15, cls: 'pa-strong' });
      s.link(L, root, head, { from: 'bottom', to: 'top' });
      const spine = x - 84;
      s.el('path', { d: `M${x - 60} 158 H${spine} V${358}`, class: 'pa-outline-line' }, L);
      leaves.forEach((t, j) => {
        const y = 226 + j * 66;
        s.el('path', { d: `M${spine} ${y} H${x - 68}`, class: 'pa-outline-line' }, L);
        s.node(s.root, { x: x + 14, y, w: 148, h: 52, shape: 'card', tone: 'paper', text: t, size: 13.5 });
      });
    });
  }
});
