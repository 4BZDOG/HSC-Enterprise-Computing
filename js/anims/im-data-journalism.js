/* Still diagram (process): the workflow of an interactive data journalism story, with ethics checked throughout.
   Interactive media and the user experience › Interactive data journalism. */
HSCAnim.define('im-data-journalism', {
  still: true,
  title: 'Process diagram: the data journalism workflow',
  alt: 'Five steps in order. Question: what does the audience need to know? Data: find a trustworthy source and record where it came from. Clean and analyse: fix errors, calculate and check the result. Visualise: choose a chart, label it and make it accessible. Publish: release the story with the data source, method and a way to give feedback. A dashed line returns from publish to question for corrections and updates. A band underneath says ethics are checked at every step: source, consent and privacy, bias, context, accuracy and accessibility.',
  layouts: { wide: { size: [800, 380], minWidth: 800 }, tall: { size: [400, 820] } },
  setup(s) {
    const c = s.compact, L = s.g(s.back);
    const stages = [
      ['Question', 'teal-t', 'What does the\naudience need\nto know?'],
      ['Data', 'mustard-t', 'Find a trusted\nsource; record\nwhere it came from'],
      ['Clean and\nanalyse', 'plum-t', 'Fix errors,\ncalculate, then\ncheck the result'],
      ['Visualise', 'sage-t', 'Choose a chart,\nlabel it, make it\naccessible'],
      ['Publish', 'sky-t', 'Release with source,\nmethod and a way\nto give feedback']
    ];
    const heads = [], descs = [];
    stages.forEach(([name, tone, desc], i) => {
      const two = name.includes('\n');
      if (!c) {
        const x = 80 + i * 160;
        heads.push(s.node(s.root, { x, y: 56, w: 134, h: 56, shape: 'card', tone, text: (i + 1) + '. ' + name, size: 14.5, cls: 'pa-strong' }));
        descs.push(s.node(s.root, { x, y: 160, w: 148, h: 78, shape: 'card', tone: 'paper', text: desc, size: 13 }));
      } else {
        const y = 48 + i * 122;
        heads.push(s.node(s.root, { x: 84, y, w: 138, h: 56, shape: 'card', tone, text: (i + 1) + '. ' + name, size: 14.5, cls: 'pa-strong' }));
        descs.push(s.node(s.root, { x: 274, y, w: 196, h: 78, shape: 'card', tone: 'paper', text: desc, size: 13 }));
      }
    });
    for (let i = 0; i < 4; i++) s.link(L, heads[i], heads[i + 1], c ? { from: 'bottom', to: 'top' } : { from: 'right', to: 'left' });
    heads.forEach((h, i) => s.link(L, h, descs[i], c ? { from: 'right', to: 'left' } : { from: 'bottom', to: 'top' }));
    if (!c) {
      s.link(L, descs[4], descs[0], { from: 'bottom', to: 'bottom', via: [[720, 268], [80, 268]], dashed: true, label: 'corrections, updates and audience feedback', labelSize: 13, labelAt: [400, 268] });
      s.el('rect', { x: 10, y: 296, width: 780, height: 72, rx: 14, class: 'pa-group' }, s.back);
      s.text(s.root, 'Ethics checked at every step', { x: 400, y: 318, cls: 'pa-group-t' });
      s.text(s.root, 'source  ·  consent and privacy  ·  bias  ·  context  ·  accuracy  ·  accessibility', { x: 400, y: 346, cls: 'pa-t', size: 14 });
    } else {
      s.link(L, descs[4], heads[0], { from: 'bottom', to: 'left', via: [[274, 668], [14, 668], [14, 48]], dashed: true, label: 'corrections and updates', labelSize: 13, labelAt: [130, 668] });
      s.el('rect', { x: 10, y: 700, width: 380, height: 112, rx: 14, class: 'pa-group' }, s.back);
      s.text(s.root, 'Ethics checked at every step', { x: 200, y: 726, cls: 'pa-group-t' });
      s.text(s.root, 'source, consent and privacy,\nbias, context, accuracy,\naccessibility', { x: 200, y: 764, cls: 'pa-t', size: 14, lh: 1.3 });
    }
  }
});
