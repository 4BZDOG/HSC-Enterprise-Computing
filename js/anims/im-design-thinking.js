/* Still diagram (cycle): design thinking applied to a front-end web system for a school canteen.
   Interactive media and the user experience › Design thinking for a front-end system. */
HSCAnim.define('im-design-thinking', {
  still: true,
  title: 'Process diagram: five design thinking stages for a canteen ordering website',
  alt: 'Five stages in order with a return loop. Empathise: interview students, staff and canteen volunteers and watch the queue. Define: write a problem statement, for example students need to order lunch in under a minute. Ideate: sketch several layouts and features. Prototype: build a clickable wireframe or mock-up. Test: watch real users try tasks, then go back to an earlier stage. An arrow returns from test to any earlier stage to iterate.',
  layouts: { wide: { size: [800, 350], minWidth: 800 }, tall: { size: [400, 780] } },
  setup(s) {
    const c = s.compact, L = s.g(s.back);
    const stages = [
      ['Empathise', 'teal-t', 'Interview students,\nstaff and volunteers;\nwatch the queue'],
      ['Define', 'mustard-t', 'Problem statement:\n"order lunch in\nunder a minute"'],
      ['Ideate', 'plum-t', 'Sketch several\nlayouts and\nfeatures'],
      ['Prototype', 'sage-t', 'Clickable wireframe\nor mock-up of the\nordering screens'],
      ['Test', 'sky-t', 'Users attempt tasks;\nnote where they\nstruggle']
    ];
    const heads = [], descs = [];
    stages.forEach(([name, tone, desc], i) => {
      if (!c) {
        const x = 80 + i * 160;
        heads.push(s.node(s.root, { x, y: 60, w: 134, h: 52, shape: 'card', tone, text: (i + 1) + '. ' + name, size: 14.5, cls: 'pa-strong' }));
        descs.push(s.node(s.root, { x, y: 170, w: 148, h: 84, shape: 'card', tone: 'paper', text: desc, size: 13 }));
      } else {
        const y = 52 + i * 148;
        heads.push(s.node(s.root, { x: 84, y, w: 138, h: 52, shape: 'card', tone, text: (i + 1) + '. ' + name, size: 14.5, cls: 'pa-strong' }));
        descs.push(s.node(s.root, { x: 274, y, w: 196, h: 84, shape: 'card', tone: 'paper', text: desc, size: 13 }));
      }
    });
    for (let i = 0; i < 4; i++) {
      if (!c) s.link(L, heads[i], heads[i + 1], { from: 'right', to: 'left' });
      else s.link(L, heads[i], heads[i + 1], { from: 'bottom', to: 'top' });
    }
    heads.forEach((h, i) => s.link(L, h, descs[i], c ? { from: 'right', to: 'left' } : { from: 'bottom', to: 'top' }));
    if (!c) {
      s.link(L, descs[4], descs[0], { from: 'bottom', to: 'bottom', via: [[720, 316], [80, 316]], dashed: true, label: 'iterate: test results send you back to any earlier stage', labelSize: 13, labelAt: [400, 316] });
    } else {
      s.link(L, descs[4], heads[0], { from: 'bottom', to: 'left', via: [[274, 776], [14, 776], [14, 52]], dashed: true, label: 'iterate: back to any earlier stage', labelSize: 13, labelAt: [150, 776] });
    }
  }
});
