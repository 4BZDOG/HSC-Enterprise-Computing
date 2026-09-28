/* Still diagram (process): an Agile (Scrum) sprint cycle.
   Enterprise Project › Producing and implementing (agile development approach). */
HSCAnim.define('agile-sprint', {
  still: true,
  title: 'Process diagram: an Agile sprint cycle',
  alt: 'A cycle. The product backlog, prioritised by the product owner, goes to sprint planning, which produces the sprint backlog. During the sprint of one to four weeks, a daily scrum and developing and testing the increment repeat. The sprint produces a potentially shippable increment, shown at the sprint review, followed by a retrospective, and the next sprint starts from the backlog.',
  layouts: { wide: { size: [760, 470] }, tall: { size: [400, 800] } },
  setup(s) {
    const c = s.compact, L = s.g(s.back);
    const P = c
      ? { pb: [200, 40], sp: [200, 130], sb: [200, 220], sprint: [200, 380], inc: [200, 540], rev: [200, 630], retro: [200, 720] }
      : { pb: [110, 70], sp: [380, 70], sb: [650, 70], sprint: [380, 235], inc: [650, 400], rev: [380, 400], retro: [110, 400] };
    const card = (k, text, tone, w = 200) => s.node(s.root, { x: P[k][0], y: P[k][1], w, h: 56, shape: 'card', tone, text, size: 13.5 });
    const pb = card('pb', 'Product backlog\nprioritised by the owner', 'teal-t');
    const sp = card('sp', 'Sprint planning', 'teal-t');
    const sb = card('sb', 'Sprint backlog', 'teal-t');
    const inc = card('inc', 'Potentially shippable\nincrement', 'sage-t');
    const rev = card('rev', 'Sprint review\n(demo to the client)', 'mustard-t');
    const retro = card('retro', 'Retrospective\n(improve the process)', 'mustard-t');
    // The sprint itself: a box holding a small daily loop
    const [sx, sy] = P.sprint, bw = c ? 340 : 360, bh = 150;
    s.el('rect', { x: sx - bw / 2, y: sy - bh / 2, width: bw, height: bh, rx: 14, class: 'pa-group' }, s.back);
    s.text(s.root, 'Sprint: 1 to 4 weeks', { x: sx, y: sy - bh / 2 + 22, cls: 'pa-group-t' });
    const ds = s.node(s.root, { x: sx - (c ? 86 : 90), y: sy + 18, w: c ? 128 : 150, h: 50, shape: 'card', tone: 'sage-t', text: 'Daily scrum\n(stand-up)', size: 13 });
    const dv = s.node(s.root, { x: sx + (c ? 86 : 90), y: sy + 18, w: c ? 128 : 150, h: 50, shape: 'card', tone: 'sage-t', text: 'Develop and\ntest', size: 13 });
    s.link(s.root, ds, dv, { from: 'right', to: 'left', fromOff: -10, toOff: -10 });
    s.link(s.root, dv, ds, { from: 'left', to: 'right', fromOff: 10, toOff: 10 });
    if (c) {
      s.link(L, pb, sp); s.link(L, sp, sb); s.link(L, sb, [sx, sy - bh / 2]);
      s.link(L, [sx, sy + bh / 2], inc); s.link(L, inc, rev); s.link(L, rev, retro);
      s.link(L, retro, pb, { from: 'left', to: 'left', via: [[14, 720], [14, 40]], label: 'repeat', labelAt: [48, 290] });
    } else {
      s.link(L, pb, sp, { from: 'right', to: 'left' }); s.link(L, sp, sb, { from: 'right', to: 'left' });
      s.link(L, sb, [sx + 120, sy - bh / 2], { from: 'bottom', to: 'top', mid: 128 });
      s.link(L, [sx + bw / 2, sy], inc, { from: 'right', to: 'top' });
      s.link(L, inc, rev, { from: 'left', to: 'right' }); s.link(L, rev, retro, { from: 'left', to: 'right' });
      s.link(L, retro, pb, { label: 'next sprint', from: 'top', to: 'bottom' });
    }
  }
});
