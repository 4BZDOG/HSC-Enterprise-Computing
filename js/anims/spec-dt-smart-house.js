/* Still diagram (NESA decision tree, horizontal): comfort control in a 'smart' house.
   NESA Enterprise Computing Course Specifications, p.8 (redrawn with the diagram kit).
   Enterprise Computing › Communicating system logic (decision trees). */
HSCAnim.define('spec-dt-smart-house', {
  still: true,
  title: 'Decision tree (horizontal): comfort control in a smart house',
  alt: 'Horizontal decision tree with the columns inside temperature, humidity, fan, cooling, heating and window. Above 30 degrees Celsius: humidity over 50 per cent gives fan high, cooling on, heating off, window closed; 50 per cent or less gives fan medium, cooling on, heating off, window closed. 15 to 30 degrees: over 50 per cent gives fan medium, cooling on, heating off, window closed; 50 per cent or less gives fan medium, cooling off, heating off, window open. Below 15 degrees: over 50 per cent gives fan low, cooling off, heating off, window open; 50 per cent or less gives fan medium, cooling off, heating on, window closed.',
  layout: { size: [800, 330], minWidth: 800 },
  setup(s) {
    const cx = { hum: 262, fan: 372, cool: 484, heat: 570, win: 664 };
    const head = [['Inside\ntemperature', 152], ['Humidity', cx.hum], ['Fan', cx.fan], ['Cooling', cx.cool], ['Heating', cx.heat], ['Window', cx.win]];
    head.forEach(([t, x]) => s.text(s.root, t, { x: t.includes('\n') ? x + 6 : x + 10, y: t.includes('\n') ? 18 : 30, cls: 'pa-t pa-soft pa-strong', size: 13.5, anchor: t.includes('\n') ? 'middle' : 'start', lh: 1.15 }));
    const rows = [
      ['> 50%', 'High', 'On', 'Off', 'Closed'], ['≤ 50%', 'Medium', 'On', 'Off', 'Closed'],
      ['> 50%', 'Medium', 'On', 'Off', 'Closed'], ['≤ 50%', 'Medium', 'Off', 'Off', 'Open'],
      ['> 50%', 'Low', 'Off', 'Off', 'Open'], ['≤ 50%', 'Medium', 'Off', 'On', 'Closed']];
    const ys = [62, 96, 158, 192, 254, 288];
    const temps = [['> 30°C', 79, 130], ['15–30°C', 175, 175], ['< 15°C', 271, 220]];
    const xs = [cx.hum, cx.fan, cx.cool, cx.heat, cx.win];
    const dash = (x0, x1, y) => s.el('path', { d: `M${x0} ${y} H${x1}`, class: 'pa-outline-line' }, s.back);
    rows.forEach((r, i) => {
      const y = ys[i];
      let prevEnd = 0;
      r.forEach((t, j) => {
        const el = s.text(s.root, t, { x: xs[j] + 10, y, anchor: 'start', valign: 'middle', cls: 'pa-t', size: 14.5 });
        // A short dash joins each setting to the next (measured, so it never touches the words)
        if (j > 0) dash(prevEnd + 8, xs[j] + 2, y);
        prevEnd = xs[j] + 10 + (el.getComputedTextLength ? el.getComputedTextLength() : s.measure(t, 14.5));
      });
    });
    // Branches: Actions -> temperature -> humidity
    s.text(s.root, 'Actions', { x: 18, y: 175, anchor: 'start', valign: 'middle', cls: 'pa-t', size: 14.5 });
    temps.forEach(([t, ty, _], i) => {
      s.text(s.root, t, { x: 150, y: ty, valign: 'middle', cls: 'pa-t', size: 14.5 });
      s.el('path', { d: `M84 175 L${i === 1 ? 118 : 128} ${i === 1 ? 175 : ty + (i === 0 ? 10 : -10)}`, class: 'pa-outline-line' }, s.back);
      const y0 = ys[i * 2], y1 = ys[i * 2 + 1];
      s.el('path', { d: `M${190} ${ty + (i === 0 ? -8 : i === 2 ? 8 : 0)} L${xs[0] + 4} ${y0} M${190} ${ty + (i === 0 ? -8 : i === 2 ? 8 : 0)} L${xs[0] + 4} ${y1}`, class: 'pa-outline-line' }, s.back);
    });
  }
});
