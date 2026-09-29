/* Still diagram (NESA Gantt chart): the Canteen Insights project (a fictional sales and stock dashboard for a school canteen),
   with resources and the percentage complete at a status date. The solid part of each bar is the work done; the pale part is the work remaining.
   NESA Enterprise Computing Course Specifications, p.12, example 2 (resources and percentage completion), redrawn with the diagram kit.
   Example Enterprise Project › Identifying and defining (time and resource management). */
HSCAnim.define('ex-gantt', {
  still: true,
  title: 'Gantt chart: the Canteen Insights project, with resources and progress',
  alt: 'Gantt chart for the fictional Canteen Insights project from Monday 6 July to Friday 14 August 2026, showing progress at the end of Wednesday 29 July. Phase 1, Identify and define, is 100 per cent complete: interview the canteen manager (Jordan, Monday 6 July), survey students and staff (Jordan, Tuesday and Wednesday), write the problem definition and requirements (Jordan, Thursday), and a milestone, requirements approved, on Friday 10 July. Phase 2, Research and plan, is 100 per cent complete: draw the data flow diagrams and system flowchart (Jordan), design the data dictionary and schema (Jordan), and storyboard the screens and get client feedback (Jordan and Sandra), and a milestone, design approved, on Friday 17 July. Phase 3, Produce and implement, is 54 per cent complete: build the tables and import sales (Jordan, 100 per cent), build the charts and KPI tiles (Jordan, 100 per cent), add filters, pivot table and what-if (Jordan, 50 per cent, behind the 75 per cent planned by that date), then add the reorder list and data checks (Jordan, 0 per cent, which cannot start until the filters are finished). Phase 4, Test and evaluate, is 0 per cent: test with normal, boundary and erroneous data (Jordan and Priya), trial with the canteen manager (Jordan and Sandra), and a milestone, handover, on Friday 14 August. Dependencies are shown with arrows and weekends are shaded.',
  layout: { size: [1080, 690], minWidth: 1080 },
  setup(s) {
    const week = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const DAYS = 42, DW = 17, RH = 30;
    const letters = Array.from({ length: DAYS }, (_, i) => ({ label: week[i % 7] }));
    const shade = []; for (let d = 5; d < DAYS; d += 7) shade.push(d, d + 1);
    const R = (id, label, date, start, dur, tone, pct, extra) => Object.assign({ id, label, date, start, dur, tone, pct }, extra);
    const g = s.ganttTable(s.root, {
      x: 0, y: 4, dayW: DW, days: DAYS, rowH: RH, headRowH: 26,
      cols: [{ key: 'id', label: 'ID', w: 32 }, { key: 'label', label: 'Task name', w: 256, size: 13.5 }, { key: 'date', label: 'Planned\nstart', w: 72 }],
      head: [
        [{ label: '6 Jul 2026', span: 7 }, { label: '13 Jul', span: 7 }, { label: '20 Jul', span: 7 }, { label: '27 Jul', span: 7 }, { label: '3 Aug', span: 7 }, { label: '10 Aug', span: 7 }],
        letters],
      shade,
      rows: [
        R(1, '1. Identify and define', '06-07', 0, 4, 'teal', 100, { summary: true, text: '100%' }),
        R(2, 'Interview canteen manager', '06-07', 0, 1, 'teal', 100, { indent: 1, text: '100%', who: 'Jordan' }),
        R(3, 'Survey students and staff', '07-07', 1, 2, 'teal', 100, { indent: 1, text: '100%', who: 'Jordan', after: 2 }),
        R(4, 'Write problem and requirements', '09-07', 3, 1, 'teal', 100, { indent: 1, text: '100%', who: 'Jordan', after: 3 }),
        { id: 5, label: 'Requirements approved', date: '10-07', start: 4, milestone: true, tone: 'teal', mdate: '10-07', indent: 1, after: 4 },
        R(6, '2. Research and plan', '13-07', 7, 5, 'plum', 100, { summary: true, text: '100%' }),
        R(7, 'Draw DFDs and system flowchart', '13-07', 7, 2, 'plum', 100, { indent: 1, text: '100%', who: 'Jordan', after: 5 }),
        R(8, 'Design dictionary and schema', '15-07', 9, 1, 'plum', 100, { indent: 1, text: '100%', who: 'Jordan', after: 7 }),
        R(9, 'Storyboard and client feedback', '16-07', 10, 1, 'plum', 100, { indent: 1, text: '100%', who: 'Jordan, Sandra', after: 8 }),
        { id: 10, label: 'Design approved', date: '17-07', start: 11, milestone: true, tone: 'plum', mdate: '17-07', indent: 1, after: 9 },
        R(11, '3. Produce and implement', '20-07', 14, 18, 'sage', 54, { summary: true, text: '54%' }),
        R(12, 'Build tables, import sales', '20-07', 14, 2, 'sage', 100, { indent: 1, text: '100%', who: 'Jordan', after: 10 }),
        R(13, 'Build charts and KPI tiles', '22-07', 16, 3, 'sage', 100, { indent: 1, text: '100%', who: 'Jordan', after: 12 }),
        R(14, 'Add filters, pivot, what-if', '27-07', 21, 4, 'sage', 50, { indent: 1, text: '50%', who: 'Jordan', after: 13 }),
        R(15, 'Add reorder list, data checks', '03-08', 28, 4, 'sage', 0, { indent: 1, text: '0%', who: 'Jordan', after: 14 }),
        R(16, '4. Test and evaluate', '10-08', 35, 5, 'mustard', 0, { summary: true, text: '0%' }),
        R(17, 'Test: normal, boundary, error', '10-08', 35, 2, 'mustard', 0, { indent: 1, text: '0%', who: 'Jordan, Priya', after: 15 }),
        R(18, 'Trial with the manager', '12-08', 37, 2, 'mustard', 0, { indent: 1, text: '0%', who: 'Jordan, Sandra', after: 17 }),
        { id: 19, label: 'Handover', date: '14-08', start: 39, milestone: true, tone: 'terra', mdate: '14-08', indent: 1, after: 18 }
      ]
    });
    // Status line: the end of Wednesday 29 July (day 23), so 3 of the 4 days of the filters task have passed (75 per cent planned, 50 per cent done).
    const top = g.bottom - 19 * RH, x = g.X(24);
    s.el('path', { d: `M${x} ${top - 8} V${g.bottom}`, class: 'pa-dep is-dashed' }, s.root);
    s.chip(s.root, 'Status: end of Wed 29 Jul', x, g.bottom + 22);
  }
});
