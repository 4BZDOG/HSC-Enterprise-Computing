/* Still diagram (NESA decision tree, vertical form): choosing a system implementation method for the ClubHub changeover.
   Notation: NESA Enterprise Computing Course Specifications, p.8 (rectangles joined by labelled branches; each path ends in a final action).
   The four methods are named on p.14 (direct, parallel, pilot, phased).
   Enterprise project › Producing and implementing (preferred system implementation method). */
HSCAnim.define('ep-dt-implementation', {
  still: true,
  title: 'Decision tree: choosing an implementation method',
  alt: 'Decision tree for choosing an implementation method. Would a failure of the new system be costly or unsafe? Yes: can the old system keep running alongside it? Yes: choose parallel. No: choose pilot. Would a failure of the new system be costly or unsafe? No: does the system split into independent modules? Yes: choose phased. No: choose direct.',
  layout: { size: [740, 350], minWidth: 740 },
  setup(s) {
    const L = s.g(s.back);
    const Q = (x, y, text, w = 190) => s.node(s.root, { x, y, w, h: 50, shape: 'process', text, tone: 'mustard-t' });
    const A = (x, y, text, w = 130) => s.node(s.root, { x, y, w, h: 50, shape: 'process', text, tone: 'sage-t', cls: 'pa-strong' });
    const br = (a, b, label, side) => s.link(L, a, b, { straight: true, head: false, label, labelSize: 13, dx: side * 20, dy: -4 });
    const root = Q(370, 34, 'Would a failure be\ncostly or unsafe?', 200);
    const alt = Q(180, 140, 'Can the old system\nrun alongside it?', 200);
    const mod = Q(560, 140, 'Does the system split\ninto separate modules?', 220);
    const par = A(90, 250, 'Choose\nparallel', 130);
    const pil = A(270, 250, 'Choose pilot\n(one group first)', 150);
    const pha = A(470, 250, 'Choose phased\n(module by module)', 160);
    const dir = A(650, 250, 'Choose\ndirect', 130);
    br(root, alt, 'Yes', -1); br(root, mod, 'No', 1);
    br(alt, par, 'Yes', -1); br(alt, pil, 'No', 1);
    br(mod, pha, 'Yes', -1); br(mod, dir, 'No', 1);
  }
});
