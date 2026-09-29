/* Still diagram (concept): the 3-2-1 backup rule.
   Cybersecurity › Hardware and software protection (back up and disaster recovery). */
(() => {
  function box(s, x, y, w, h, tone, title, lines) {
    s.node(s.root, { x, y, w, h, shape: 'card', tone, text: ' ' });
    s.text(s.root, title, { x, y: y - h / 2 + 22, cls: 'pa-name', size: 15 });
    s.text(s.root, lines.join('\n'), { x, y: y - h / 2 + 44, cls: 'pa-t', size: 13, lh: 1.3 });
    return { x, y, w, h, box: { x, y, w, h, shape: 'card' } };
  }
  HSCAnim.define('cyber-backup-321', {
    still: true,
    title: 'The 3-2-1 backup rule',
    alt: 'Concept diagram. Copy 1 is the live data on the office file server, on disk. Copy 2 is a local backup on a network storage device, a second type of media, in the same building. Copy 3 is an offsite, offline or immutable backup in the cloud or on tape, in a different place. Rule: 3 copies of the data, on 2 different types of media, with 1 copy offsite. A fire, flood or ransomware in the office cannot reach copy 3.',
    layouts: { wide: { size: [780, 360], minWidth: 780 }, tall: { size: [340, 640] } },
    setup(s) {
      const L = s.g(s.back);
      if (!s.compact) {
        s.el('rect', { x: 16, y: 34, width: 500, height: 200, rx: 12, class: 'pa-group' }, s.back);
        s.text(s.back, 'Onsite: the office', { x: 266, y: 56, cls: 'pa-group-t' });
        s.el('rect', { x: 540, y: 34, width: 224, height: 200, rx: 12, class: 'pa-group' }, s.back);
        s.text(s.back, 'Offsite: another place', { x: 652, y: 56, cls: 'pa-group-t' });
        const a = box(s, 140, 145, 216, 130, 'teal-t', 'Copy 1: live data', ['File server', 'Media type A: disk']);
        const b = box(s, 392, 145, 216, 130, 'sky-t', 'Copy 2: local backup', ['Storage device', 'Media type B: tape', 'Backed up nightly']);
        const c = box(s, 652, 145, 200, 130, 'sage-t', 'Copy 3: offsite', ['Cloud or tape vault', 'Offline or immutable', 'Copied on a schedule']);
        s.link(L, a, b, { from: 'right', to: 'left' });
        s.link(L, b, c, { from: 'right', to: 'left' });
        s.node(s.root, { x: 390, y: 305, w: 740, h: 52, shape: 'card', tone: 'mustard-t', size: 14, cls: 'pa-strong', text: '3 copies of the data   on   2 types of media   with   1 copy offsite' });
      } else {
        s.el('rect', { x: 10, y: 20, width: 320, height: 330, rx: 12, class: 'pa-group' }, s.back);
        s.text(s.back, 'Onsite: the office', { x: 170, y: 42, cls: 'pa-group-t' });
        s.el('rect', { x: 10, y: 372, width: 320, height: 160, rx: 12, class: 'pa-group' }, s.back);
        s.text(s.back, 'Offsite: another place', { x: 170, y: 394, cls: 'pa-group-t' });
        const a = box(s, 170, 120, 280, 100, 'teal-t', 'Copy 1: live data', ['File server', 'Media type A: disk']);
        const b = box(s, 170, 268, 280, 110, 'sky-t', 'Copy 2: local backup', ['Storage device', 'Media type B: tape', 'Backed up nightly']);
        const c = box(s, 170, 466, 280, 114, 'sage-t', 'Copy 3: offsite', ['Cloud or tape vault', 'Offline or immutable', 'Copied on a schedule']);
        s.link(L, a, b);
        s.link(L, b, c);
        s.node(s.root, { x: 170, y: 590, w: 320, h: 70, shape: 'card', tone: 'mustard-t', size: 14, cls: 'pa-strong', text: '3 copies of the data\non 2 types of media\nwith 1 copy offsite' });
      }
    }
  });
})();
