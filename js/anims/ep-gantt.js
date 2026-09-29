/* Still diagram (NESA Gantt chart): the ClubHub project (a fictional booking and inventory system for a community sports club),
   with team members allocated to tasks and the percentage complete at a status date.
   The solid part of each bar is the work done; the pale part is the work remaining.
   NESA Enterprise Computing Course Specifications, p.12, example 2 (resources and percentage completion), redrawn with the diagram kit.
   Enterprise project › Identifying and defining (time and resource management, Gantt charts). */
HSCAnim.define('ep-gantt', {
  still: true,
  title: 'Gantt chart: the ClubHub project, with team members and progress',
  alt: 'Gantt chart for the fictional ClubHub project from Monday 19 October to Sunday 29 November 2026, showing progress at the end of Thursday 5 November. Phase 1, Identify and define, is 100 per cent complete: interview the club committee (Ana, 100 per cent), write the problem definition (Ana, 100 per cent, after the interview) and a milestone, requirements approved, on 23 October. Phase 2, Research and plan, is 100 per cent complete: draw the data flow diagram and system flowchart (Ana), design the database (Ben) and design the screens as a storyboard (Chloe), all 100 per cent, and a milestone, design approved, on 30 October. Phase 3, Produce and implement, is 47 per cent complete: build the database and import stock (Ben, 60 per cent, behind the 80 per cent planned), build the booking screens (Chloe, 80 per cent), then build the stock screens (Chloe, 0 per cent, which cannot start until the database is built), then integrate the modules (Ben, 0 per cent). Phase 4, Test and evaluate, is 0 per cent: test with normal, boundary and erroneous data (Dev), trial with the committee (Ana and Dev), and a milestone, handover, on 23 November. Dependencies are shown with arrows and weekends are shaded.',
  layout: { size: [1080, 640], minWidth: 1080 },
  setup(s) {
    const week = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const DAYS = 42, DW = 17, RH = 30;
    const letters = Array.from({ length: DAYS }, (_, i) => ({ label: week[i % 7] }));
    const shade = []; for (let d = 5; d < DAYS; d += 7) shade.push(d, d + 1);
    const R = (id, label, date, start, dur, tone, pct, extra) => Object.assign({ id, label, date, start, dur, tone, pct }, extra);
    const done = (n, p) => `${p}%`;
    const g = s.ganttTable(s.root, {
      x: 0, y: 4, dayW: DW, days: DAYS, rowH: RH, headRowH: 26,
      cols: [{ key: 'id', label: 'ID', w: 32 }, { key: 'label', label: 'Task name', w: 256, size: 13.5 }, { key: 'date', label: 'Planned\nstart', w: 72 }],
      head: [
        [{ label: '19 Oct 2026', span: 7 }, { label: '26 Oct', span: 7 }, { label: '2 Nov', span: 7 }, { label: '9 Nov', span: 7 }, { label: '16 Nov', span: 7 }, { label: '23 Nov', span: 7 }],
        letters],
      shade,
      rows: [
        R(1, '1. Identify and define', '19-10', 0, 4, 'teal', 100, { summary: true, text: '100%' }),
        R(2, 'Interview club committee', '19-10', 0, 2, 'teal', 100, { indent: 1, text: '100%', who: 'Ana' }),
        R(3, 'Write problem definition', '21-10', 2, 2, 'teal', 100, { indent: 1, text: '100%', who: 'Ana', after: 2 }),
        { id: 4, label: 'Requirements approved', date: '23-10', start: 4, milestone: true, tone: 'teal', mdate: '23-10', indent: 1, after: 3 },
        R(5, '2. Research and plan', '26-10', 7, 5, 'plum', 100, { summary: true, text: '100%' }),
        R(6, 'Draw DFD and system flowchart', '26-10', 7, 2, 'plum', 100, { indent: 1, text: '100%', who: 'Ana', after: 4 }),
        R(7, 'Design database', '26-10', 7, 3, 'plum', 100, { indent: 1, text: '100%', who: 'Ben', after: 4 }),
        R(8, 'Design screens (storyboard)', '26-10', 7, 4, 'plum', 100, { indent: 1, text: '100%', who: 'Chloe', after: 4 }),
        { id: 9, label: 'Design approved', date: '30-10', start: 11, milestone: true, tone: 'plum', mdate: '30-10', indent: 1, after: 8 },
        R(10, '3. Produce and implement', '2-11', 14, 12, 'sage', 47, { summary: true, text: '47%' }),
        R(11, 'Build database, import stock', '2-11', 14, 5, 'sage', 60, { indent: 1, text: '60%', who: 'Ben', after: 9 }),
        R(12, 'Build booking screens', '2-11', 14, 5, 'sage', 80, { indent: 1, text: '80%', who: 'Chloe', after: 9 }),
        R(13, 'Build stock screens', '9-11', 21, 3, 'sage', 0, { indent: 1, text: '0%', who: 'Chloe', after: 11 }),
        R(14, 'Integrate modules', '12-11', 24, 2, 'sage', 0, { indent: 1, text: '0%', who: 'Ben', after: 13 }),
        R(15, '4. Test and evaluate', '16-11', 28, 5, 'mustard', 0, { summary: true, text: '0%' }),
        R(16, 'Test: normal, boundary, error data', '16-11', 28, 3, 'mustard', 0, { indent: 1, text: '0%', who: 'Dev', after: 14 }),
        R(17, 'Trial with the committee', '19-11', 31, 2, 'mustard', 0, { indent: 1, text: '0%', who: 'Ana and Dev', after: 16 }),
        { id: 18, label: 'Handover', date: '23-11', start: 35, milestone: true, tone: 'terra', mdate: '23-11', indent: 1, after: 17 }
      ]
    });
    // Status line: the end of Thursday 5 November (day 17), so 4 of the 5 days of the build tasks have been worked.
    const top = g.bottom - 18 * RH, x = g.X(18);
    s.el('path', { d: `M${x} ${top - 8} V${g.bottom}`, class: 'pa-dep is-dashed' }, s.root);
    s.chip(s.root, 'Status: end of Thu 5 Nov', x, g.bottom + 22);
  }
});
