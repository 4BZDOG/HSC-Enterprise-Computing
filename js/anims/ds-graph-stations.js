/* Still diagram (NESA graph and network theory): a network diagram of docking stations.
   Circles are nodes (vertices); node size shows how many trips start there; each line is a link (edge)
   and its number is the trips between the two stations in a typical week (illustrative figures).
   Notation follows NESA Enterprise Computing Course Specifications, p.11.
   Data Science › Interpreting and presenting data (network diagrams). */
HSCAnim.define('ds-graph-stations', {
  still: true,
  title: 'Network diagram: trips between Bellbird Bikes stations',
  alt: 'Network diagram of five docking stations, with illustrative weekly trip counts. Riverside Park is the largest node and Market Square the second largest. Links show trips between stations: Market Square to Riverside Park 46, Market Square to Railway 38, Riverside Park to Hospital 21, Market Square to Library 17, Market Square to Hospital 12. Library to Hospital has 6 trips. Node size shows trips started at that station.',
  layout: { size: [640, 360], minWidth: 640 },
  setup(s) {
    const nodes = [
      { id: 'ms', x: 250, y: 160, r: 46, label: 'Market\nSquare', tone: 'teal-t', size: 14 },
      { id: 'rp', x: 500, y: 100, r: 52, label: 'Riverside\nPark', tone: 'teal-t', size: 14 },
      { id: 'h', x: 500, y: 280, r: 36, label: 'Hospital', size: 14 },
      { id: 'rs', x: 90, y: 90, r: 40, label: 'Railway', size: 14 },
      { id: 'lib', x: 120, y: 290, r: 32, label: 'Library', size: 14 }
    ];
    const e = (a, b, weight, o) => Object.assign({ a, b, weight }, o);
    s.graph(s.root, { nodes, edges: [e('ms', 'rp', 46), e('ms', 'rs', 38), e('rp', 'h', 21), e('ms', 'lib', 17), e('ms', 'h', 12), e('lib', 'h', 6)] });
  }
});
