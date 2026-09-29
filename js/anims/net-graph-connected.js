/* Still diagram (graph theory): a connected graph beside a disconnected graph, with one path highlighted.
   NESA graph notation (p.11): circles are nodes (vertices), lines are links (edges).
   Networking systems › Graph theory in network design (connectedness, paths). */
HSCAnim.define('net-graph-connected', {
  still: true,
  title: 'Graphs: connected and disconnected',
  alt: 'Two graphs side by side. On the left, a connected graph of five nodes P, Q, R, S and T: every node can be reached from every other, and a highlighted path runs P to Q to S to T. On the right, a disconnected graph with two components: U, V and W joined in a line, and X and Y joined to each other, with no link between the two groups.',
  layout: { size: [720, 300], minWidth: 720 },
  setup(s) {
    const g = s.g(s.back);
    [[10, 'Connected: one component'], [370, 'Disconnected: two components']].forEach(([x, t]) => {
      s.el('rect', { x, y: 8, width: 340, height: 284, rx: 14, class: 'pa-group' }, g);
      s.text(s.root, t, { x: x + 170, y: 32, cls: 'pa-title', size: 15 });
    });
    const n = (id, x, y, tone) => ({ id, x, y, r: 26, label: id, tone });
    const e = (a, b, cls) => ({ a, b, cls });
    s.graph(s.root, {
      nodes: [n('P', 60, 110), n('Q', 160, 200), n('R', 160, 80), n('S', 260, 150), n('T', 300, 250)],
      edges: [e('P', 'Q', 'is-good'), e('P', 'R'), e('R', 'S'), e('Q', 'S', 'is-good'), e('S', 'T', 'is-good')]
    });
    s.graph(s.root, {
      nodes: [n('U', 410, 90), n('V', 510, 170), n('W', 610, 90), n('X', 460, 250), n('Y', 620, 250)],
      edges: [e('U', 'V'), e('V', 'W'), e('X', 'Y')]
    });
  }
});
