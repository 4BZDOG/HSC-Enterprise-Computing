/* ============================================================
   Data flow diagrams (DFDs) and structure charts drawn by js/nesa-diagrams.js.
   Use <div class="nesa-diagram" data-diagram="key"></div> inside a .figure-canvas.

   DFD: { type: 'dfd', size: [w, h], alt: 'text description',
     nodes: { id: { type: 'process'|'entity'|'store', x, y, label, r? } },
     flows: [ { from, to, label, bend, dx?, dy? } ] }
   Structure chart: { type: 'structure', alt, root, modules: { id: { label, children[], decision, repeat } },
     couples: [ { from, to, kind: 'data'|'flag', label, dir: 'down'|'up', side, at } ] }
   Labels use \n for line breaks. Always give a helpful alt description.
   ============================================================ */
window.HSC_NESA_DIAGRAMS = Object.assign(window.HSC_NESA_DIAGRAMS || {}, {
  // NESA Course Specifications p.5: the voting system, in full and as a Level 0 context diagram
  'spec-dfd-voting': {
    type: 'dfd',
    size: [800, 570],
    alt: 'Data flow diagram of a voting system. Candidates send Candidates\' details to the Nomination process, which stores Successful candidates\' details in the Endorsed candidates data store. Voters send Voters\' details and vote to the Voting process, which returns Confirmation. Voting reads a List of candidates from Endorsed candidates and stores the Vote there. Voting checks the Electoral roll, which returns Already voted or Vote accepted, and stores Voters\' details. The Results process reads Candidates\' details and accumulated votes from Endorsed candidates and sends Election results to the Public.',
    nodes: {
      candidates: { type: 'entity', x: 700, y: 62, label: 'Candidates' },
      nomination: { type: 'process', x: 500, y: 130, label: 'Nomination\nprocess' },
      voters: { type: 'entity', x: 100, y: 150, label: 'Voters' },
      voting: { type: 'process', x: 340, y: 300, label: 'Voting' },
      endorsed: { type: 'store', x: 690, y: 262, label: 'Endorsed\ncandidates' },
      roll: { type: 'store', x: 110, y: 440, label: 'Electoral\nroll' },
      results: { type: 'process', x: 380, y: 490, label: 'Results' },
      public: { type: 'entity', x: 710, y: 496, label: 'Public' },
    },
    flows: [
      { from: 'candidates', to: 'nomination', label: 'Candidates\u2019\ndetails', bend: -34, at: [652, 142], anchor: 'start' },
      { from: 'nomination', to: 'endorsed', label: 'Successful candidates\u2019\ndetails', bend: 40, at: [598, 196], anchor: 'start' },
      { from: 'voters', to: 'voting', label: 'Voters\u2019 details\nand vote', bend: 40, at: [196, 262], anchor: 'end' },
      { from: 'voting', to: 'voters', label: 'Confirmation', bend: 40, at: [262, 196], anchor: 'start' },
      { from: 'endorsed', to: 'voting', label: 'List of\ncandidates', bend: 26, at: [498, 238] },
      { from: 'voting', to: 'endorsed', label: 'Vote', bend: 26, at: [515, 322] },
      { from: 'roll', to: 'voting', label: 'Already voted or\nVote accepted', bend: 30, at: [252, 418], anchor: 'start' },
      { from: 'voting', to: 'roll', label: 'Voters\u2019 details', bend: 30, at: [186, 322], anchor: 'end' },
      { from: 'endorsed', to: 'results', label: 'Candidates\u2019 details\nand accumulated\nvotes', bend: -40, at: [590, 396], anchor: 'start' },
      { from: 'results', to: 'public', label: 'Election results', bend: 34, at: [546, 528] },
    ],
  },
  'spec-dfd-voting-l0': {
    type: 'dfd',
    size: [800, 360],
    alt: 'Level 0 data flow diagram of the voting system: one process, Voting, and three external entities. Candidates send Candidates\' details to Voting. Voters send Voters\' details and vote to Voting and receive Confirmation. Voting sends Election results to the Public. There are no data stores.',
    nodes: {
      candidates: { type: 'entity', x: 100, y: 70, label: 'Candidates' },
      voting: { type: 'process', x: 400, y: 150, r: 52, label: 'Voting' },
      voters: { type: 'entity', x: 210, y: 290, label: 'Voters' },
      public: { type: 'entity', x: 700, y: 250, label: 'Public' },
    },
    flows: [
      { from: 'candidates', to: 'voting', label: 'Candidates\u2019 details', bend: -34, at: [250, 64] },
      { from: 'voters', to: 'voting', label: 'Voters\u2019 details and vote', bend: -40, at: [264, 198], anchor: 'end' },
      { from: 'voting', to: 'voters', label: 'Confirmation', bend: -40, at: [334, 284], anchor: 'start' },
      { from: 'voting', to: 'public', label: 'Election results', bend: -34, at: [562, 146] },
    ],
  },
  'orders-dfd': {
    type: 'dfd',
    size: [780, 400],
    alt: 'Level 1 data flow diagram of an online ordering system. The Customer sends order details to process 1 Take order, which returns a receipt and stores the order in the Orders data store. Process 2 Pack and dispatch reads orders from the store and sends a dispatch note to the Warehouse, which returns a shipped notice.',
    nodes: {
      customer: { type: 'entity', x: 90, y: 100, label: 'Customer' },
      take: { type: 'process', x: 320, y: 100, label: '1\nTake order' },
      orders: { type: 'store', x: 320, y: 320, label: 'D1  Orders' },
      pack: { type: 'process', x: 560, y: 260, label: '2\nPack and\ndispatch' },
      warehouse: { type: 'entity', x: 690, y: 90, label: 'Warehouse' },
    },
    flows: [
      { from: 'customer', to: 'take', label: 'Order details', bend: 34 },
      { from: 'take', to: 'customer', label: 'Receipt', bend: 34 },
      { from: 'take', to: 'orders', label: 'New order', bend: 30 },
      { from: 'orders', to: 'pack', label: 'Order to pack', bend: 30 },
      { from: 'pack', to: 'warehouse', label: 'Dispatch note', bend: 30 },
      { from: 'warehouse', to: 'pack', label: 'Shipped notice', bend: 30 },
    ],
  },
});
