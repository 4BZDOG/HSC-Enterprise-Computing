/* Still diagram (concept): the same canteen ordering screen as a wireframe, a mock-up and a prototype.
   Interactive media and the user experience › Design tools for an engaging UI. */
HSCAnim.define('im-fidelity', {
  still: true,
  title: 'Concept diagram: wireframe, mock-up and prototype of one screen',
  alt: 'The same school canteen ordering screen at three levels of fidelity. The wireframe is grey boxes labelled header, image, three menu rows and a button: it shows structure and layout only. The mock-up adds real text, colour, type and a photo: it shows the look. The prototype is the mock-up made clickable, with the Order now button linking to a confirmation screen: it shows how the screen behaves.',
  layouts: { wide: { size: [780, 420], minWidth: 780 }, tall: { size: [400, 1130] } },
  setup(s) {
    const c = s.compact;
    const frame = (x, y, kind) => {
      const w = 180, h = 250, L = x - w / 2, T = y;
      s.el('rect', { x: L, y: T, width: w, height: h, rx: 16, class: 'f-paper pa-outline-thin' }, s.root);
      const box = (dy, bh, text, tone, bw = 156) => s.node(s.root, { x, y: T + dy, w: bw, h: bh, shape: 'process', tone, text, size: 13 });
      if (kind === 0) {
        box(28, 34, 'Header', 'sheet');
        box(88, 60, 'Image', 'sheet');
        box(140, 26, 'Menu row', 'sheet');
        box(172, 26, 'Menu row', 'sheet');
        box(204, 26, 'Menu row', 'sheet');
        s.node(s.root, { x, y: T + 236, w: 90, h: 24, shape: 'process', tone: 'sheet', text: 'Button', size: 13 });
      } else {
        box(28, 34, 'School Canteen', 'teal', 156);
        box(88, 60, 'Photo of wraps', 'sky-t');
        box(140, 26, 'Chicken wrap  $6.50', 'paper');
        box(172, 26, 'Fruit cup  $3.00', 'paper');
        box(204, 26, 'Veggie roll  $5.00', 'paper');
        const b = s.node(s.root, { x, y: T + 236, w: 110, h: 26, shape: 'process', tone: 'mustard', text: 'Order now', size: 13, cls: 'pa-strong' });
        if (kind === 2) {
          s.el('rect', { x: x - 64, y: T + 220, width: 128, height: 38, rx: 12, class: 'pa-ring' }, s.front);
          s.chip(s.front, 'tap', x + 104, T + 268);
        }
      }
    };
    const cap = (x, y, head, lines, tone, dy = 62) => {
      s.node(s.root, { x, y, w: 200, h: 34, shape: 'card', tone, text: head, size: 14, cls: 'pa-strong' });
      s.text(s.root, lines, { x, y: y + dy, cls: 'pa-t', size: 13, lh: 1.3 });
    };
    if (!c) {
      const xs = [120, 370, 620];
      frame(xs[0], 30, 0); frame(xs[1], 30, 1); frame(xs[2], 30, 2);
      cap(xs[0], 340, '1  Wireframe', 'structure and layout;\nno colour, no real content', 'sheet');
      cap(xs[1], 340, '2  Mock-up', 'the look: colour, type,\nimages, real wording', 'sky-t');
      cap(xs[2], 340, '3  Prototype', 'the behaviour: tapping Order now\nopens a Confirmation screen', 'sage-t');
    } else {
      const ys = [20, 400, 780];
      [0, 1, 2].forEach(i => { frame(200, ys[i], i); });
      cap(200, ys[0] + 290, '1  Wireframe', 'structure and layout;\nno colour, no real content', 'sheet', 46);
      cap(200, ys[1] + 290, '2  Mock-up', 'the look: colour, type,\nimages, real wording', 'sky-t', 46);
      cap(200, ys[2] + 290, '3  Prototype', 'the behaviour: tapping Order now\nopens a Confirmation screen', 'sage-t', 46);
    }
  }
});
