/* Still diagram (graph theory): a six-person friendship network with node size showing degree.
   Uses NESA's graph notation (p.11): circles are nodes (vertices), lines are links (edges).
   Networking systems › Graph theory in social networks (adjacency, degree centrality). */
HSCAnim.define('net-graph-degree', {
  still: true,
  title: 'Graph: a six-person friendship network sized by degree',
  alt: 'Graph of six people A to F. Links: A to B, A to C, A to D, B to C, D to E and E to F. Node A has three links and is drawn the largest. B, C, D and E each have two links. F has one link and is drawn the smallest. Each node shows its degree in brackets.',
  layout: { size: [640, 300], minWidth: 640 },
  setup(s) {
    const deg = { A: 3, B: 2, C: 2, D: 2, E: 2, F: 1 };
    const pos = { A: [190, 150], B: [80, 60], C: [80, 240], D: [340, 150], E: [485, 150], F: [590, 150] };
    const r = d => 22 + d * 8;
    const nodes = Object.keys(pos).map(k => ({ id: k, x: pos[k][0], y: pos[k][1], r: r(deg[k]), label: `${k}\n(${deg[k]})`, tone: k === 'A' ? 'teal-t' : undefined, size: 14 }));
    const e = (a, b) => ({ a, b });
    s.graph(s.root, { nodes, edges: [e('A', 'B'), e('A', 'C'), e('A', 'D'), e('B', 'C'), e('D', 'E'), e('E', 'F')] });
  }
});
