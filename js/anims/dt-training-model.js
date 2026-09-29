/* Still diagram (NESA decision tree): choosing a training model.
   Intelligent Systems › machine learning (choosing a training approach). */
HSCAnim.define('dt-training-model', {
  still: true,
  title: 'Decision tree: choosing a training model',
  alt: 'Decision tree. Is the model learning from rewards and penalties? Yes: reinforcement learning. No: is the data labelled? All of it: supervised learning. Some of it: semi-supervised learning. None of it: unsupervised learning.',
  layout: { size: [640, 400], minWidth: 520 },
  setup(s) {
    const L = s.g(s.back);
    const q1 = s.node(s.root, { x: 320, y: 40, w: 260, h: 56, text: 'Learning from rewards\nand penalties?', tone: 'mustard-t' });
    const rl = s.node(s.root, { x: 110, y: 160, w: 190, h: 50, shape: 'card', tone: 'sage-t', text: 'Reinforcement\nlearning', cls: 'pa-strong' });
    const q2 = s.node(s.root, { x: 420, y: 160, w: 220, h: 50, text: 'Is the data labelled?', tone: 'mustard-t' });
    const leaves = [['Supervised\nlearning', 'All'], ['Semi-supervised\nlearning', 'Some'], ['Unsupervised\nlearning', 'None']];
    s.link(L, q1, rl, { label: 'Yes', mid: 104 });
    s.link(L, q1, q2, { label: 'No', mid: 104 });
    leaves.forEach(([t, lab], i) => {
      const n = s.node(s.root, { x: 250 + i * 170, y: 320, w: 150, h: 50, shape: 'card', tone: 'sage-t', text: t, cls: 'pa-strong' });
      s.link(L, q2, n, { label: lab, mid: 250 });
    });
  }
});
