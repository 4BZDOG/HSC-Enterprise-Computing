/* Still diagram (Gantt chart): a small project with its critical path highlighted and one task that has float.
   The critical path is a common project-management idea; it is not named in NESA's Course Specifications.
   Project Management Guide › Planning tools in practice (Gantt chart walkthrough). */
HSCAnim.define('pg-critical-path', {
  still: true,
  title: 'Gantt chart: the critical path of a canteen ordering app',
  alt: 'Gantt chart over 16 working days. Task A, interview the canteen manager, takes days 1 and 2. Then two design tasks start together: task B, design the database, takes 3 days and finishes on day 5; task C, design the screens, takes 5 days and finishes on day 7. Task D, build the app, needs both designs, so it starts on day 8 and takes 6 days. Task E, test with the manager, takes 3 days, then the handover milestone is on day 16. The critical path is A, C, D, E, drawn in red: any delay to these delays the handover. Task B has 2 days of float, shown as a dashed outline, because the build cannot start until C finishes anyway.',
  layout: { size: [800, 400], minWidth: 760 },
  setup(s) {
    const x = 0, y = 4, w = 800, days = 16, lw = 200, rh = 30;
    const g = s.gantt(s.root, {
      x, y, w, days, labelW: lw, rowH: rh, tick: 1, tickLabel: d => (d === 0 ? '' : String(d)),
      sections: [
        { name: 'Define', rows: [
          { id: 'a', label: 'A  Interview the manager', start: 0, dur: 2, tone: 'terra', tag: '2 d' }] },
        { name: 'Design (in parallel)', rows: [
          { id: 'b', label: 'B  Design the database', start: 2, dur: 3, tone: 'teal', after: 'a', tag: '3 d' },
          { id: 'c', label: 'C  Design the screens', start: 2, dur: 5, tone: 'terra', after: 'a', tag: '5 days' }] },
        { name: 'Build and test', rows: [
          { id: 'd', label: 'D  Build the app', start: 7, dur: 6, tone: 'terra', after: 'c', tag: '6 days' },
          { id: 'e', label: 'E  Test with the manager', start: 13, dur: 3, tone: 'terra', after: 'd', tag: '3 days' },
          { id: 'm', label: 'Handover', start: 16, milestone: true, tone: 'terra', after: 'e', strong: true }] }
      ]
    });
    // Row centres, following the kit's layout: 30px to the first band, 26px band title, then one row per task.
    const rowY = { a: y + 30 + 26 + rh / 2 };
    rowY.b = y + 30 + 26 + rh + 26 + rh / 2; rowY.c = rowY.b + rh;
        // Float on B: the build cannot start until day 7, so B can slip 2 days without changing the finish date.
    s.el('rect', { x: g.X(5), y: rowY.b - rh * .32, width: g.X(7) - g.X(5), height: rh * .64, rx: 4, class: 'pa-dep is-dashed', fill: 'none' }, s.root);
    s.text(s.root, '2 d float', { x: g.X(6), y: rowY.b, valign: 'middle', cls: 'pa-t pa-soft', size: 13 });
    const cy = g.bottom + 34;
    s.node(s.root, { x: 150, y: cy, w: 250, h: 34, shape: 'process', tone: 'terra', size: 13.5, cls: 'pa-strong', text: 'Critical path: A, C, D, E' });
    s.node(s.root, { x: 430, y: cy, w: 250, h: 34, shape: 'process', tone: 'teal', size: 13.5, cls: 'pa-strong', text: 'Has float: B can slip' });
    s.text(s.root, 'Total: 2 + 5 + 6 + 3 = 16 days', { x: 700, y: cy, cls: 'pa-t', size: 13.5 });
  }
});
