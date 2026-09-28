/* Still diagram (NESA decision tree): is this email spam?
   Intelligent Systems › Creating intelligent systems (decision trees); Data Science (classification). */
HSCAnim.define('dt-spam', {
  still: true,
  title: 'Decision tree: is this email spam?',
  alt: 'Decision tree. Sender known? Yes: inbox. No: contains a link? No: inbox. Yes: is the link domain trusted? Yes: inbox. No: spam.',
  layout: { size: [600, 440], minWidth: 560 },
  setup(s) {
    const L = s.g(s.back);
    const inbox = (x, y) => s.node(s.root, { x, y, w: 110, h: 42, shape: 'card', tone: 'sage-t', text: 'Inbox', cls: 'pa-strong' });
    const q1 = s.node(s.root, { x: 200, y: 36, w: 190, h: 46, text: 'Sender known?', tone: 'mustard-t' });
    const q2 = s.node(s.root, { x: 320, y: 170, w: 190, h: 46, text: 'Contains a link?', tone: 'mustard-t' });
    const q3 = s.node(s.root, { x: 440, y: 300, w: 200, h: 46, text: 'Link domain trusted?', tone: 'mustard-t' });
    s.link(L, q1, inbox(80, 170), { label: 'Yes', mid: 104 });
    s.link(L, q1, q2, { label: 'No', mid: 104 });
    s.link(L, q2, inbox(200, 300), { label: 'No', mid: 236 });
    s.link(L, q2, q3, { label: 'Yes', mid: 236 });
    s.link(L, q3, inbox(330, 408), { label: 'Yes', mid: 364 });
    s.link(L, q3, s.node(s.root, { x: 540, y: 408, w: 110, h: 42, shape: 'card', tone: 'terra', text: 'Spam', cls: 'pa-strong' }), { label: 'No', mid: 364 });
  }
});
