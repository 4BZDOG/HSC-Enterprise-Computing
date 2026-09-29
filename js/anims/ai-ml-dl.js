/* Still diagram (concept): AI contains ML, which contains deep learning.
   Intelligent Systems › Investigate current and emerging technologies, including AI. */
HSCAnim.define('ai-ml-dl', {
  still: true,
  title: 'Concept diagram: AI, machine learning and deep learning',
  alt: 'Three nested layers of paper. Artificial intelligence, machines simulating human-like intelligence, such as rule-based expert systems, search and robotics, contains machine learning, systems that learn patterns from data such as spam filters, regression and clustering, which contains deep learning, multi-layer neural networks such as image recognition, speech and large language models.',
  layouts: { wide: { size: [760, 440] }, tall: { size: [400, 620] } },
  setup(s) {
    const W = s.W, H = s.H, c = s.compact;
    const layers = [
      { tone: 'teal-t', title: 'Artificial intelligence', sub: 'Machines simulating human-like intelligence', eg: 'expert systems · search · robotics\ncan follow fixed IF–THEN rules, with no learning' },
      { tone: 'sage-t', title: 'Machine learning', sub: 'Systems that learn patterns from data', eg: 'spam filters · regression · clustering\nimproves with more data, not hard-coded' },
      { tone: 'plum-t', title: 'Deep learning', sub: 'Neural networks with many layers', eg: 'image recognition · speech · large language models\nlearns its own features from huge datasets' }
    ];
    const inset = c ? [0, 110, 220] : [0, 96, 192], side = c ? [0, 14, 28] : [0, 40, 80];
    layers.forEach((l, i) => {
      const x = 10 + side[i], y = 10 + inset[i], w = W - 20 - side[i] * 2, h = H - 20 - inset[i] - side[i] * .5;
      s.el('rect', { x, y, width: w, height: h, rx: 18, class: 'f-' + l.tone + ' pa-card-edge' }, s.root).setAttribute('filter', 'url(#pa-cut)');
      s.text(s.root, l.title, { x: x + 20, y: y + 28, anchor: 'start', cls: 'pa-title', size: 17 });
      s.text(s.root, l.sub, { x: x + 20, y: y + 48, anchor: 'start', cls: 'pa-t-sm pa-soft' });
      const egY = i < 2 ? y + (c ? 76 : 72) : y + 90;
      s.text(s.root, c ? l.eg.replace(' · large language', '\n· large language') : l.eg, { x: i < 2 ? x + 20 : x + w / 2, y: egY, anchor: i < 2 ? 'start' : 'middle', cls: 'pa-t-sm', lh: 1.35 });
    });
  }
});
