/* Still diagram (NESA graph and network theory): VB's social network.
   Circles are nodes (vertices), lines are links (edges), circle size shows importance; labels give the relationship.
   NESA Enterprise Computing Course Specifications, p.11 (redrawn with the diagram kit).
   Enterprise Computing › Networking systems (graph theory and network theory). */
HSCAnim.define('spec-graph-weighted', {
  still: true,
  title: 'Graph: VB’s social network',
  alt: 'Graph of a social network. VB is the largest node at the centre. Individuals DS, SK, JM and FG each connect to VB by a link labelled Friend. The categories Online music, Online videos and Tech teach connect to VB by links labelled Listen, Watch and Group. About a dozen small unlabelled nodes connect the members to each other in a mesh around VB.',
  layout: { size: [800, 540], minWidth: 800 },
  setup(s) {
    const T = (px, py) => [Math.round((px - 85) * 1.13 + 32), Math.round((py - 410) * 1.13 + 30)];
    const N = (id, px, py, r, label) => { const [x, y] = T(px, py); return { id, x, y, r, label }; };
    const nodes = [
      N('vb', 442, 650, 70, 'VB'), N('ds', 408, 464, 32, 'DS'), N('sk', 651, 606, 32, 'SK'), N('jm', 273, 769, 32, 'JM'), N('fg', 511, 815, 32, 'FG'),
      N('music', 200, 594, 33, 'Online\nmusic'), N('video', 568, 530, 33, 'Online\nvideos'), N('tech', 662, 787, 33, 'Tech\nteach'),
      N('a', 132, 487, 13), N('b', 302, 509, 13), N('c', 510, 494, 13), N('d', 600, 422, 13), N('e', 680, 509, 13), N('f', 98, 579, 13),
      N('g', 737, 680, 13), N('h', 109, 707, 13), N('i', 301, 664, 13), N('j', 388, 775, 13)];
    const E = (a, b, label) => ({ a, b, label });
    s.graph(s.root, {
      nodes,
      edges: [E('vb', 'ds', 'Friend'), E('vb', 'sk', 'Friend'), E('vb', 'jm', 'Friend'), E('vb', 'fg', 'Friend'),
        E('vb', 'music', 'Listen'), E('vb', 'video', 'Watch'), E('vb', 'tech', 'Group'),
        E('a', 'b'), E('a', 'f'), E('b', 'ds'), E('b', 'music'), E('b', 'vb'), E('ds', 'c'), E('c', 'd'), E('d', 'video'), E('d', 'e'),
        E('e', 'vb'), E('e', 'sk'), E('e', 'g'), E('sk', 'g'), E('g', 'tech'), E('tech', 'fg'), E('fg', 'j'), E('j', 'jm'),
        E('jm', 'i'), E('i', 'vb'), E('i', 'h'), E('h', 'jm'), E('f', 'h'), E('f', 'music')]
    });
  }
});
