/* Still diagram (concept): the user interface sits inside the wider user experience.
   Interactive media and the user experience › How the UI shapes the UX. */
HSCAnim.define('im-ux-ui', {
  still: true,
  title: 'Concept diagram: the UI is one part of the UX',
  alt: 'A large box labelled user experience (UX), the whole experience of reaching a goal. Inside it, a user goal (order lunch before recess) leads through the user interface (what the user sees and touches: layout, buttons, text, colour, sound) to an outcome (lunch is ready and the user feels confident). Below, three other things that also shape the UX but are not the interface: speed and reliability, clear content and language, and help when things go wrong.',
  layouts: { wide: { size: [740, 340], minWidth: 740 }, tall: { size: [400, 700] } },
  setup(s) {
    const c = s.compact, L = s.g(s.back);
    const card = (x, y, text, tone, w, h) => s.node(s.root, { x, y, w, h, shape: 'card', tone, text, size: 13.5 });
    if (!c) {
      s.el('rect', { x: 10, y: 8, width: 720, height: 324, rx: 16, class: 'pa-group' }, s.back);
      s.text(s.root, 'User experience (UX): everything the user goes through to reach a goal', { x: 370, y: 34, cls: 'pa-group-t' });
      const goal = card(105, 122, 'User goal\norder lunch\nbefore recess', 'teal-t', 150, 84);
      const ui = card(370, 122, 'User interface (UI)\nwhat the user sees and\ntouches: layout, buttons,\ntext, colour, sound', 'mustard-t', 232, 96);
      const out = card(635, 122, 'Outcome\nlunch is ready and\nthe user feels\nconfident', 'sage-t', 158, 96);
      s.link(L, goal, ui, { from: 'right', to: 'left' });
      s.link(L, ui, out, { from: 'right', to: 'left' });
      s.text(s.root, 'Also shape the UX, but are not the interface', { x: 370, y: 208, cls: 'pa-name' });
      card(140, 268, 'Speed and\nreliability', 'sky-t', 190, 60);
      card(370, 268, 'Clear content\nand language', 'sky-t', 190, 60);
      card(600, 268, 'Help when things\ngo wrong', 'sky-t', 190, 60);
    } else {
      s.el('rect', { x: 8, y: 8, width: 384, height: 684, rx: 16, class: 'pa-group' }, s.back);
      s.text(s.root, 'User experience (UX):\neverything the user goes\nthrough to reach a goal', { x: 200, y: 44, cls: 'pa-group-t', lh: 1.25 });
      const goal = card(200, 130, 'User goal\norder lunch before recess', 'teal-t', 260, 60);
      const ui = card(200, 250, 'User interface (UI)\nwhat the user sees and touches:\nlayout, buttons, text,\ncolour, sound', 'mustard-t', 290, 96);
      const out = card(200, 380, 'Outcome\nlunch is ready and the\nuser feels confident', 'sage-t', 260, 76);
      s.link(L, goal, ui); s.link(L, ui, out);
      s.text(s.root, 'Also shape the UX, but\nare not the interface', { x: 200, y: 484, cls: 'pa-name', lh: 1.25 });
      card(200, 552, 'Speed and reliability', 'sky-t', 260, 44);
      card(200, 606, 'Clear content and language', 'sky-t', 260, 44);
      card(200, 660, 'Help when things go wrong', 'sky-t', 260, 44);
    }
  }
});
