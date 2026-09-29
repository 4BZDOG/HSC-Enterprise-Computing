/* Still diagram (concept): a 5 x 5 likelihood x consequence risk matrix with five plotted risks.
   NESA's Course Specifications do not define a risk matrix; this is the standard industry form.
   Cybersecurity › Assessing risk with a risk matrix (worked example for Riverina Fresh Logistics). */
(() => {
  const LIK = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost\ncertain'];
  const CON = ['Insignificant', 'Minor', 'Moderate', 'Major', 'Severe'];
  const RISKS = [
    { id: 'R1', l: 5, c: 3, t: 'Phishing leads to email account\ntakeover (BEC)' },
    { id: 'R2', l: 4, c: 5, t: 'Ransomware through an unpatched\ninternet-facing server' },
    { id: 'R3', l: 3, c: 4, t: 'Insider copies the customer\ndatabase before leaving' },
    { id: 'R4', l: 4, c: 3, t: 'Unencrypted laptop lost\nor stolen' },
    { id: 'R5', l: 2, c: 4, t: 'Supplier software is\ncompromised' }
  ];
  const rating = n => n >= 20 ? ['terra', 'Extreme'] : n >= 10 ? ['blush', 'High'] : n >= 5 ? ['mustard-t', 'Medium'] : ['sage-t', 'Low'];
  HSCAnim.define('cyber-risk-matrix', {
    still: true,
    title: 'A 5 by 5 risk matrix with five plotted risks',
    alt: 'Risk matrix. Likelihood from Rare (1) at the bottom to Almost certain (5) at the top. Consequence from Insignificant (1) on the left to Severe (5) on the right. Each cell shows likelihood multiplied by consequence: 1 to 4 is Low, 5 to 9 Medium, 10 to 16 High and 20 to 25 Extreme. Plotted risks: R1 phishing leading to email account takeover, likelihood 5 and consequence 3, score 15, High. R2 ransomware through an unpatched internet-facing server, likelihood 4 and consequence 5, score 20, Extreme. R3 insider copies the customer database, likelihood 3, consequence 4, score 12, High. R4 unencrypted laptop lost or stolen, likelihood 4, consequence 3, score 12, High. R5 supplier software compromised, likelihood 2, consequence 4, score 8, Medium.',
    layouts: { wide: { size: [780, 640], minWidth: 780 }, tall: { size: [340, 770] } },
    setup(s) {
      const compact = s.compact;
      const cw = compact ? 52 : 88, ch = compact ? 50 : 56;
      const x0 = compact ? 60 : 170, y0 = compact ? 24 : 24;
      const cell = (l, c) => ({ x: x0 + (c - 1) * cw + cw / 2, y: y0 + (5 - l) * ch + ch / 2 });
      for (let l = 1; l <= 5; l++) for (let c = 1; c <= 5; c++) {
        const p = cell(l, c), sc = l * c, [tone] = rating(sc);
        s.node(s.root, { x: p.x, y: p.y, w: cw - 4, h: ch - 4, shape: 'process', tone, text: String(sc), size: 13, cls: 'pa-muted' });
      }
      // axis labels
      LIK.forEach((t, i) => {
        const p = cell(i + 1, 1);
        s.text(s.root, compact ? String(i + 1) : t, { x: x0 - 10, y: p.y, anchor: 'end', valign: 'middle', cls: 'pa-name', size: 13, lh: 1.05 });
      });
      CON.forEach((t, i) => {
        const p = cell(1, i + 1);
        s.text(s.root, compact ? String(i + 1) : t, { x: p.x, y: y0 + 5 * ch + 20, cls: 'pa-name', size: 13 });
      });
      s.text(s.root, 'Consequence  →', { x: x0 + 2.5 * cw, y: y0 + 5 * ch + (compact ? 46 : 46), cls: 'pa-name', size: 14 });
      const rot = s.g(s.root, null, { x: compact ? 14 : 26, y: y0 + 2.5 * ch, r: -90 });
      s.text(rot, 'Likelihood  →', { x: 0, y: 0, cls: 'pa-name', size: 14 });
      // plotted risks
      RISKS.forEach(r => {
        const p = cell(r.l, r.c);
        s.node(s.root, { x: p.x, y: p.y, w: 38, h: 38, shape: 'circle', tone: 'plum', text: r.id, size: 13 });
      });
      // key
      const ky = y0 + 5 * ch + 78;
      const chips = [['sage-t', 'Low 1–4'], ['mustard-t', 'Medium 5–9'], ['blush', 'High 10–16'], ['terra', 'Extreme 20–25']];
      if (!compact) {
        chips.forEach(([tone, t], i) => s.node(s.root, { x: 100 + i * 158, y: ky, w: 148, h: 34, shape: 'process', tone, size: 13.5, cls: 'pa-strong', text: t }));
        RISKS.forEach((r, i) => {
          const x = 60, y = ky + 62 + i * 40;
          s.node(s.root, { x: x + 14, y, w: 30, h: 30, shape: 'circle', tone: 'plum', text: r.id, size: 12 });
          s.text(s.root, r.t.replace('\n', ' ') + `  (${r.l}×${r.c}=${r.l * r.c})`, { x: x + 40, y, anchor: 'start', valign: 'middle', cls: 'pa-t', size: 13 });
        });
      } else {
        chips.forEach(([tone, t], i) => s.node(s.root, { x: 90 + (i % 2) * 160, y: ky + Math.floor(i / 2) * 42, w: 152, h: 34, shape: 'process', tone, size: 13.5, cls: 'pa-strong', text: t }));
        RISKS.forEach((r, i) => {
          const y = ky + 110 + i * 62;
          s.node(s.root, { x: 24, y, w: 30, h: 30, shape: 'circle', tone: 'plum', text: r.id, size: 12 });
          s.text(s.root, r.t + `\n(${r.l}×${r.c}=${r.l * r.c}, ${rating(r.l * r.c)[1]})`, { x: 48, y: y - 12, anchor: 'start', cls: 'pa-t', size: 13, lh: 1.2 });
        });
      }
    }
  });
})();
