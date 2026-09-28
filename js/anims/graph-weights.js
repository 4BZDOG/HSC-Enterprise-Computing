/* Still diagram (graph theory): a weighted, directed graph, an Enterprise Computing extension.
   NESA shows undirected graphs with labelled links (p.11); the syllabus also names weighted graphs, adjacency,
   centrality and connectedness, so this shows numbers on the edges and arrows for direction.
   Enterprise Computing › Networking systems (graph theory and network theory). */
HSCAnim.define('graph-weights', {
  still: true,
  title: 'Weighted graph: network cable lengths between five sites',
  alt: 'Weighted graph of five sites A to E. Each line is a cable and its weight is its length in metres: A to B 40, A to C 25, B to C 15, B to D 30, C to D 20, C to E 45 and D to E 10. Site C has the most links, so it is the most central node.',
  layout: { size: [620, 320], minWidth: 620 },
  setup(s) {
    const nodes = [{ id: 'A', x: 70, y: 160, r: 30, label: 'A' }, { id: 'B', x: 230, y: 60, r: 30, label: 'B' }, { id: 'C', x: 250, y: 250, r: 34, label: 'C', tone: 'teal-t' },
      { id: 'D', x: 430, y: 130, r: 30, label: 'D' }, { id: 'E', x: 560, y: 250, r: 30, label: 'E' }];
    const e = (a, b, weight, o) => Object.assign({ a, b, weight }, o);
    s.graph(s.root, { nodes, edges: [e('A', 'B', 40), e('A', 'C', 25), e('B', 'C', 15), e('B', 'D', 30), e('C', 'D', 20, { dx: -10 }), e('C', 'E', 45), e('D', 'E', 10)] });
  }
});
