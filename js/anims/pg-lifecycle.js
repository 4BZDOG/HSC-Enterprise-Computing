/* Still diagram (concept): the four stages of the design and production process, with the tools and evidence for each,
   and the iteration loop back from testing.
   Stage names are NESA's Enterprise project subheadings. Project Management Guide › Project life cycle at a glance. */
HSCAnim.define('pg-lifecycle', {
  still: true,
  title: 'Concept diagram: the project life cycle and its evidence',
  alt: 'Four stages left to right, joined by arrows. Stage 1, Identifying and defining: tools are problem definition and success criteria; evidence is the client brief and the interview notes. Stage 2, Researching and planning: tools are the Gantt chart, budget, data flow diagrams and storyboards; evidence is the plan and the design documents. Stage 3, Producing and implementing: tools are the development approach, prototypes and the implementation plan; evidence is the working solution and the process diary. Stage 4, Testing and evaluating: tools are the test plan, test data and client feedback; evidence is the test results and the evaluation. A dashed arrow runs from stage 4 back to stage 1, labelled iterate: what you learn goes back into earlier stages.',
  layouts: { wide: { size: [940, 430], minWidth: 940 }, tall: { size: [400, 800] } },
  setup(s) {
    const L = s.g(s.back), tall = s.compact;
    const stages = [
      ['1  Identifying\nand defining', 'teal-t', 'Problem definition\nSuccess criteria\nInterview or survey', 'Client brief\nInterview notes\nSigned-off scope'],
      ['2  Researching\nand planning', 'plum-t', 'Gantt chart, budget\nDFD, system flowchart\nStoryboard', 'Project plan\nDesign documents\nRisk register'],
      ['3  Producing and\nimplementing', 'sage-t', 'Development approach\nPrototype\nImplementation plan', 'Working solution\nProcess diary\nTraining material'],
      ['4  Testing and\nevaluating', 'mustard-t', 'Test plan and data\nClient feedback\nEvaluation criteria', 'Test results\nEvaluation report\nMaintenance notes']
    ];
    const heads = [];
    stages.forEach(([name, tone, tools, evidence], i) => {
      const x = tall ? 200 : 115 + i * 236, y = tall ? 60 + i * 176 : 62;
      const w = tall ? 340 : 212;
      const h = s.node(s.root, { x, y, w, h: 62, shape: 'card', tone, text: name, size: 14.5 });
      heads.push(h);
      const ty = tall ? y + 68 : 168, ey = tall ? y + 68 : 290;
      if (tall) {
        // tools and evidence side by side under the stage
        s.node(s.root, { x: 116, y: y + 84, w: 164, h: 92, shape: 'card', tone: 'paper', text: '' });
        s.node(s.root, { x: 288, y: y + 84, w: 164, h: 92, shape: 'card', tone: 'paper', text: '' });
        s.text(s.root, 'Tools', { x: 116, y: y + 54, cls: 'pa-t pa-strong', size: 13 });
        s.text(s.root, tools, { x: 116, y: y + 96, cls: 'pa-t', size: 13, lh: 1.35 });
        s.text(s.root, 'Evidence', { x: 288, y: y + 54, cls: 'pa-t pa-strong', size: 13 });
        s.text(s.root, evidence, { x: 288, y: y + 96, cls: 'pa-t', size: 13, lh: 1.35 });
      } else {
        s.node(s.root, { x, y: ty, w, h: 92, shape: 'card', tone: 'paper', text: '' });
        s.text(s.root, 'Tools', { x, y: ty - 33, cls: 'pa-t pa-strong', size: 13 });
        s.text(s.root, tools, { x, y: ty + 10, cls: 'pa-t', size: 13, lh: 1.35 });
        s.node(s.root, { x, y: ey, w, h: 92, shape: 'card', tone: 'paper', text: '' });
        s.text(s.root, 'Evidence', { x, y: ey - 33, cls: 'pa-t pa-strong', size: 13 });
        s.text(s.root, evidence, { x, y: ey + 10, cls: 'pa-t', size: 13, lh: 1.35 });
      }
    });
    for (let i = 0; i < 3; i++) s.link(L, heads[i], heads[i + 1], { from: tall ? 'bottom' : 'right', to: tall ? 'top' : 'left' });
    if (tall) {
      s.link(L, heads[3], heads[0], { from: 'right', to: 'right', via: [[392, 580], [392, 60]], dashed: true });
      s.text(s.root, 'Iterate: what you learn goes back', { x: 200, y: 776, cls: 'pa-t pa-soft', size: 13.5 });
    } else {
      s.link(L, heads[3], heads[0], { from: 'top', to: 'top', via: [[823, 10], [115, 10]], dashed: true });
      s.text(s.root, 'Iterate: test results and client feedback go back into earlier stages', { x: 470, y: 408, cls: 'pa-t pa-soft', size: 13.5 });
    }
  }
});
