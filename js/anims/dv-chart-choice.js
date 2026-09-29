/* Still diagram (decision tree, vertical form, NESA Course Specifications p.8): which chart answers which question?
   Rectangles with labelled Yes / No branches; each path ends in a chart type. Data Visualisation › Purposes of data visualisation. */
HSCAnim.define('dv-chart-choice', {
  still: true,
  title: 'Decision tree: choosing a chart for the question you are asking',
  alt: 'Decision tree. Is it about change over time? Yes: line chart, or columns for a few periods. No: is it about where things are? Yes: map. No: is it about how two numbers relate? Yes: scatter graph with a trend line. No: is it about how values are spread? Yes: histogram or box plot. No: is it about parts of a whole? Yes: pie chart for a few parts, or a stacked bar. No: is it about comparing categories? Yes: column or bar chart. No: rethink the question, because you need a clear question before you choose a chart.',
  layouts: {
    wide: { size: [580, 600], minWidth: 580 },
    tall: { size: [300, 960] }
  },
  setup(s) {
    const c = s.compact;
    const L = s.g(s.back);
    const qx = c ? 100 : 160, qw = c ? 176 : 270, lx = c ? 290 : 450, lw = c ? 150 : 250;
    const step = c ? 98 : 86, y0 = 40;
    const Q = [
      ['Is it about change\nover time?', 'Line chart\n(columns for a\nfew periods)'],
      ['Is it about where\nthings are?', 'Map: shaded\nregions or points'],
      ['Is it about how two\nnumbers relate?', 'Scatter graph with\na trend line'],
      ['Is it about how\nvalues are spread?', 'Histogram or\nbox plot'],
      ['Is it about parts\nof a whole?', 'Pie chart (few parts)\nor stacked bar'],
      ['Is it about comparing\ncategories?', 'Column or bar\nchart']
    ];
    const Q1 = ['Is it about change over time?', 'Is it about where things are?', 'Is it about how two numbers relate?', 'Is it about how values are spread?', 'Is it about parts of a whole?', 'Is it about comparing categories?'];
    if (c) {
      // Phone layout: each question is a full-width box; its Yes answer hangs below it on the right
      const pitch = 138;
      let prevQ = null;
      Q.forEach(([q, a], i) => {
        const y = 34 + i * pitch;
        const qn = s.node(s.root, { x: 150, y, w: 284, h: 40, shape: 'process', tone: 'mustard-t', text: Q1[i], size: 13.5 });
        const an = s.node(s.root, { x: 208, y: y + 82, w: 168, h: 50, shape: 'process', tone: 'sage-t', cls: 'pa-strong', text: a.replace(/\n/g, ' ').replace(/(.{20}\S*)\s/, '$1\n'), size: 13 });
        s.link(L, s.port(qn, 'bottom', 58), s.port(an, 'top', 0), { straight: true, head: false, label: 'Yes', labelSize: 13, labelAt: [s.port(qn, 'bottom', 58)[0] + 22, y + 40] });
        if (prevQ) s.link(L, s.port(prevQ, 'bottom', -100), s.port(qn, 'top', -100), { straight: true, head: false, label: 'No', labelSize: 13, labelAt: [70, y - 44] });
        prevQ = qn;
      });
      const yEnd = 34 + Q.length * pitch;
      const end = s.node(s.root, { x: 150, y: yEnd, w: 220, h: 44, shape: 'process', tone: 'terra-t', cls: 'pa-strong', text: 'Rethink: what is the question?', size: 13 });
      s.link(L, s.port(prevQ, 'bottom', -100), s.port(end, 'top', -100), { straight: true, head: false, label: 'No', labelSize: 13, labelAt: [70, yEnd - 44] });
      return;
    }
    let prev = null;
    Q.forEach(([q, a], i) => {
      const y = y0 + i * step;
      const qn = s.node(s.root, { x: qx, y, w: qw, h: 56, shape: 'process', tone: 'mustard-t', text: q, size: 14 });
      const an = s.node(s.root, { x: lx, y, w: lw, h: c ? 66 : 56, shape: 'process', tone: 'sage-t', cls: 'pa-strong', text: a, size: c ? 13 : 14 });
      s.link(L, qn, an, { from: 'right', to: 'left', straight: true, head: false, label: 'Yes', labelSize: 13, labelAt: [(qx + qw / 2 + lx - lw / 2) / 2, y - 14] });
      if (prev) s.link(L, prev, qn, { from: 'bottom', to: 'top', straight: true, head: false, label: 'No', labelSize: 13, labelAt: [qx + 18, y - step / 2 + 6] });
      prev = qn;
    });
    const yEnd = y0 + Q.length * step;
    const end = s.node(s.root, { x: lx, y: yEnd, w: lw, h: c ? 66 : 56, shape: 'process', tone: 'terra-t', cls: 'pa-strong', text: c ? 'Rethink: what is\nthe question?' : 'Rethink: what is the\nquestion being asked?', size: c ? 13 : 14 });
    s.link(L, prev, end, { from: 'bottom', to: 'left', straight: true, head: false, label: 'No', labelSize: 13, labelAt: [qx + 18, y0 + (Q.length - 1) * step + 44] });
  }
});
