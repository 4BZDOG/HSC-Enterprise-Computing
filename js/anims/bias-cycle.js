/* Still diagram (cycle): how bias reinforces itself, and where to break the loop.
   Data Science › Data quality (bias); Data Visualisation › Evaluate bias. */
HSCAnim.define('bias-cycle', {
  still: true,
  title: 'Cycle diagram: how bias reinforces itself',
  alt: 'A loop of four steps: biased or unrepresentative training data; the model learns the bias; unfair predictions at scale; outputs shape future data collection, which feeds back into biased data. Mitigations break the loop: diverse data, fairness audits, diverse teams and explainability.',
  layouts: { wide: { size: [760, 420] }, tall: { size: [400, 700] } },
  setup(s) {
    const c = s.compact;
    const [cx, cy, rx, ry] = c ? [200, 250, 118, 180] : [270, 210, 180, 150];
    s.el('ellipse', { cx, cy, rx, ry, class: 'pa-cycle' }, s.back);
    const steps = ['Biased or\nunrepresentative\ntraining data', 'The model\nlearns the bias', 'Unfair predictions\nmade at scale', 'Outputs shape\nfuture data\ncollection'];
    const at = [[cx, cy - ry], [cx + rx, cy], [cx, cy + ry], [cx - rx, cy]];
    steps.forEach((t, i) => {
      s.node(s.root, { x: at[i][0], y: at[i][1], w: c ? 150 : 170, h: t.split('\n').length * 17 + 18, shape: 'card', tone: 'terra-t', text: t, size: 13 });
    });
    // arrowheads around the loop, between the cards
    [45, 135, 225, 315].forEach(deg => {
      const a = deg * Math.PI / 180, x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry;
      const t = [-Math.sin(a) * rx, Math.cos(a) * ry], l = Math.hypot(...t);
      s.el('path', { d: `M${x - t[0] / l * 10} ${y - t[1] / l * 10} L${x} ${y}`, class: 'pa-link', 'marker-end': 'url(#pa-arrow)' }, s.root);
    });
    s.text(s.root, c ? 'self-\nreinforcing\nloop' : 'self-reinforcing\nloop', { x: cx, y: cy, valign: 'middle', cls: 'pa-name', size: c ? 12.5 : 14, lh: 1.2 });
    const m = c ? [200, 590] : [655, 210];
    const fix = s.node(s.root, { x: m[0], y: m[1], w: 190, h: 120, shape: 'card', tone: 'sage-t', size: 13.5, text: 'Break the loop:\ndiverse data\nfairness audits\ndiverse teams\nexplainability', cls: 'pa-strong' });
    s.link(s.root, fix, c ? [cx, cy + ry + 30] : [cx + rx + 86, cy], { from: c ? 'top' : 'left', to: c ? 'bottom' : 'right', dashed: true, cls: 'is-good' });
  }
});
