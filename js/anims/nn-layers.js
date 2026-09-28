/* Still diagram (system): a neural network's layers.
   Intelligent Systems › neural networks. */
HSCAnim.define('nn-layers', {
  still: true,
  title: "A neural network's layers",
  alt: 'A neural network for loan approval. Four inputs (age, income, credit score, debt ratio) connect by weights to every neuron in hidden layer 1 (8 neurons), which connect to every neuron in hidden layer 2 (4 neurons), which connect to one output neuron: the probability of approval.',
  layouts: { wide: { size: [760, 420] }, tall: { size: [400, 760] } },
  setup(s) {
    const c = s.compact;
    const layers = [
      { n: 4, tone: 'teal-t', name: 'Input layer', labels: ['age', 'income', 'credit score', 'debt ratio'] },
      { n: 8, tone: 'mustard-t', name: 'Hidden layer 1\n8 neurons' },
      { n: 4, tone: 'mustard-t', name: 'Hidden layer 2\n4 neurons' },
      { n: 1, tone: 'sage-t', name: 'Output layer', labels: ['probability\nof approval'] }
    ];
    const along = i => (c ? 70 : 150) + i * (c ? 190 : 170);
    const span = c ? 300 : 300, mid = c ? 210 : 190;
    const pos = layers.map((l, i) => Array.from({ length: l.n }, (_, j) => {
      const t = l.n === 1 ? 0 : (j / (l.n - 1) - .5) * span * Math.min(1, l.n / 8 + .35);
      return c ? [mid + t, along(i)] : [along(i), mid + t];
    }));
    const edges = s.g(s.back);
    for (let i = 0; i < layers.length - 1; i++)
      pos[i].forEach(a => pos[i + 1].forEach(b => s.el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: 'pa-weight' }, edges)));
    layers.forEach((l, i) => {
      pos[i].forEach(([x, y], j) => {
        s.el('circle', { cx: x, cy: y, r: l.n > 4 ? 11 : 15, class: 'f-' + l.tone + ' pa-outline' }, s.root).setAttribute('filter', 'url(#pa-cut)');
        if (l.labels) {
          const lab = l.labels[j];
          if (c) s.text(s.root, lab, { x, y: i === 0 ? y - 24 : y + 36, cls: 'pa-t-sm', size: 11.5, lh: 1.2 });
          else s.text(s.root, lab, { x: i === 0 ? x - 24 : x + 26, y, anchor: i === 0 ? 'end' : 'start', valign: 'middle', cls: 'pa-t-sm', lh: 1.2 });
        }
      });
      const [lx, ly] = c ? [370, along(i)] : [along(i), 395];
      s.text(s.root, l.name, c ? { x: 392, y: ly, anchor: 'end', valign: 'middle', cls: 'pa-name', size: 12.5, lh: 1.2 } : { x: lx, y: ly - (l.name.includes('\n') ? 8 : 0), cls: 'pa-name', size: 13, lh: 1.2 });
    });
    s.chip(s.root, 'weights', c ? 60 : (along(0) + along(1)) / 2, c ? (along(0) + along(1)) / 2 : 40);
  }
});
