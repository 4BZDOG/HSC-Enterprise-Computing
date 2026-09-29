/* Still diagram (infographic): one message per panel, a big number, a rule and a small chart, using sample values.
   Intelligent systems › Communicating logical processes (infographics). */
(() => {
  HSCAnim.define('is-infographic-greenhouse', {
    still: true,
    title: 'Infographic: how the smart greenhouse decides to water (sample values)',
    alt: 'Infographic with three panels and sample values. Panel 1, Sense: soil moisture now is 38 per cent, shown on a bar with a marker at 40 per cent, the level below which watering starts. Panel 2, Decide: soil is below 40 per cent, ticked; no rain is forecast, ticked; so the answer is water now. Panel 3, Act: minutes of pump time for each day of the week, Monday 10, Tuesday 0, Wednesday 12, Thursday 0, Friday 0, Saturday 15, Sunday 0.',
    layout: { size: [800, 380], minWidth: 800 },
    setup(s) {
      const W = 820, R = s.g(s.root, '', { x: -10, y: 0 });
      s.text(R, 'How the greenhouse decides to water', { x: W / 2, y: 26, cls: 'pa-title', size: 17 });
      const panel = (x, n, title, tone) => {
        s.node(R, { x: x + 125, y: 200, w: 250, h: 296, shape: 'card', tone });
        s.node(R, { x: x + 30, y: 82, w: 40, h: 40, shape: 'card', tone: 'teal', text: n, size: 17, cls: 'pa-strong' });
        s.text(R, title, { x: x + 130, y: 82, cls: 'pa-t pa-strong', size: 17 });
      };
      panel(20, '1', 'SENSE', 'sky-t');
      panel(285, '2', 'DECIDE', 'sage-t');
      panel(550, '3', 'ACT', 'mustard-t');
      // Panel 1: big number and gauge
      s.text(R, '38%', { x: 145, y: 158, cls: 'pa-title', size: 52 });
      s.text(R, 'soil moisture now', { x: 145, y: 204, cls: 'pa-t', size: 14.5 });
      const gx = 44, gw = 202, gy = 250;
      s.el('rect', { x: gx, y: gy, width: gw, height: 22, rx: 6, class: 'f-paper pa-outline' });
      s.el('rect', { x: gx, y: gy, width: gw * .38, height: 22, rx: 6, class: 'f-teal' });
      s.el('path', { d: `M${gx + gw * .4} ${gy - 8} V${gy + 30}`, style: 'stroke:var(--pa-terra);stroke-width:3;fill:none' });
      s.text(R, 'Watering starts\nbelow 40%', { x: 145, y: 312, cls: 'pa-t', size: 13.5, lh: 1.25 });
      // Panel 2: the rule
      const rows = [['Soil below 40%', 'Yes'], ['No rain forecast', 'Yes']];
      rows.forEach(([t, v], i) => {
        const y = 150 + i * 66;
        s.text(R, t, { x: 320, y, anchor: 'start', valign: 'middle', cls: 'pa-t', size: 14.5 });
        s.mark(R, true, { r: 15 }).setAttribute('transform', `translate(500 ${y})`);
      });
      s.node(R, { x: 410, y: 282, w: 200, h: 56, shape: 'card', tone: 'teal', text: 'Water now', size: 18, cls: 'pa-strong' });
      s.text(R, 'IF both are true, THEN run the pump', { x: 410, y: 328, cls: 'pa-t', size: 13.5 });
      // Panel 3: minutes of pump time by day
      s.text(R, 'Pump minutes this week', { x: 675, y: 138, cls: 'pa-t pa-strong', size: 14 });
      const mins = [10, 0, 12, 0, 0, 15, 0], days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
      const bx = 575, bw = 27, base = 300;
      mins.forEach((m, i) => {
        const x = bx + i * 34;
        if (m) s.el('rect', { x, y: base - m * 8, width: bw, height: m * 8, rx: 3, class: 'f-teal' });
        s.text(R, String(m), { x: x + bw / 2, y: base - m * 8 - 12, cls: 'pa-t pa-strong', size: 13 });
        s.text(R, days[i], { x: x + bw / 2, y: base + 16, cls: 'pa-t', size: 13 });
      });
      s.el('path', { d: `M${bx - 6} ${base} H${bx + 7 * 34}`, class: 'pa-axis' });
      s.text(R, 'Sample values for illustration', { x: W / 2, y: 366, cls: 'pa-t pa-soft', size: 13 });
    }
  });
})();
