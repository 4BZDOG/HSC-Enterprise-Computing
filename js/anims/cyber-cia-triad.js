/* Still diagram (concept): the CIA triad, with what a breach of each attribute looks like.
   Cybersecurity › Attributes of a cybersecurity breach (confidentiality, integrity, availability, privacy implications). */
(() => {
  function panel(s, x, y, w, tone, title, lines) {
    const h = 40 + lines.length * 19;
    s.node(s.root, { x, y, w, h, shape: 'card', tone, text: ' ' });
    s.text(s.root, title, { x, y: y - h / 2 + 24, cls: 'pa-name', size: 16 });
    s.text(s.root, lines.join('\n'), { x, y: y - h / 2 + 46, cls: 'pa-t', size: 13, lh: 1.32 });
    return { x, y, w, h, box: { x, y, w, h, shape: 'card' } };
  }
  const C = ['Only authorised people can see it.', 'Breached: data leaked or stolen.', 'Example: customer list posted online.'];
  const I = ['Data is accurate and unaltered.', 'Breached: records changed or forged.', 'Example: bank details in an invoice edited.'];
  const A = ['Data and systems work when needed.', 'Breached: outage or locked files.', 'Example: ransomware stops the shop.'];
  HSCAnim.define('cyber-cia-triad', {
    still: true,
    title: 'The CIA triad and the privacy of personal information',
    alt: 'Concept diagram. A central card reads: personal information and business data, with privacy implications when any attribute fails. Three cards surround it. Confidentiality: only authorised people can see the data; breached when data is leaked or stolen, for example a customer list posted online. Integrity: data is accurate and unaltered; breached when records are changed or forged, for example bank details in an invoice edited. Availability: data and systems work when needed; breached by an outage or locked files, for example ransomware stopping a shop.',
    layouts: { wide: { size: [780, 470], minWidth: 780 }, tall: { size: [340, 700] } },
    setup(s) {
      const L = s.g(s.back);
      if (!s.compact) {
        const mid = s.node(s.root, { x: 390, y: 250, w: 230, h: 76, shape: 'card', tone: 'plum-t', text: 'Personal information\nand business data', cls: 'pa-strong', size: 15 });
        const c = panel(s, 390, 78, 300, 'teal-t', 'Confidentiality', C);
        const i = panel(s, 138, 372, 268, 'mustard-t', 'Integrity', I);
        const a = panel(s, 642, 372, 268, 'sky-t', 'Availability', A);
        s.link(L, mid, c, { from: 'top', to: 'bottom', both: true, dashed: true });
        s.link(L, mid, i, { from: 'left', to: 'top', both: true, dashed: true });
        s.link(L, mid, a, { from: 'right', to: 'top', both: true, dashed: true });
        s.text(s.root, 'If any attribute fails,\nprivacy can be harmed.', { x: 390, y: 320, cls: 'pa-chip-t', size: 13 });
      } else {
        const c = panel(s, 170, 76, 310, 'teal-t', 'Confidentiality', C);
        const i = panel(s, 170, 210, 310, 'mustard-t', 'Integrity', I);
        const a = panel(s, 170, 344, 310, 'sky-t', 'Availability', A);
        const mid = s.node(s.root, { x: 170, y: 480, w: 280, h: 70, shape: 'card', tone: 'plum-t', text: 'Personal information\nand business data', cls: 'pa-strong', size: 15 });
        [c, i, a].forEach(n => s.link(L, mid, n, { from: 'top', to: 'bottom', both: true, dashed: true, straight: true }));
        s.text(s.root, 'If any attribute fails,\nprivacy can be harmed.', { x: 170, y: 555, cls: 'pa-chip-t', size: 13 });
      }
    }
  });
})();
