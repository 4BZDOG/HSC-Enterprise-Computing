/* Still diagram (NESA Gantt chart): requirements gathering, showing the main elements of a Gantt chart.
   NESA Enterprise Computing Course Specifications, p.12, example 1 (redrawn with the diagram kit).
   Enterprise Computing › Project management (Gantt charts). */
HSCAnim.define('spec-gantt-requirements', {
  still: true,
  title: 'Gantt chart: requirements gathering',
  alt: 'Gantt chart from 30 August to 16 September. Task 1, interview participants, runs 30 to 31 August. Task 2, collate interview results, follows it on 3 September. Tasks 3, 4 and 5, document participant needs, identify system processes and identify data and information needs, run in parallel on 4 and 5 September, with task 3 after task 2. Task 6, produce a data flow diagram, follows task 5 and runs to 10 September. Task 7, produce a requirements report, follows task 6 and runs to 15 September. Task 8, the requirements milestone, is a diamond on 16 September after task 7. Weekends are shaded.',
  layout: { size: [900, 400], minWidth: 900 },
  setup(s) {
    const days = ['30', '31'].concat(Array.from({ length: 16 }, (_, i) => String(i + 1)));
    s.ganttTable(s.root, {
      x: 0, y: 4, dayW: 30, days: days.length, rowH: 40, headRowH: 28,
      cols: [{ key: 'id', label: 'ID', w: 44 }, { key: 'label', label: 'Task name', w: 296, size: 15 }],
      head: [[{ label: 'Aug', span: 2 }, { label: 'Sept', span: 16 }], days.map(d => ({ label: d }))],
      shade: [2, 3, 9, 10, 16, 17],
      rows: [
        { id: 1, label: 'Interview participants', start: 0, dur: 2 },
        { id: 2, label: 'Collate interview results', start: 4, dur: 1, after: 1 },
        { id: 3, label: 'Document participant needs', start: 5, dur: 2, after: 2 },
        { id: 4, label: 'Identify system processes', start: 5, dur: 2 },
        { id: 5, label: 'Identify data/information needs', start: 5, dur: 2 },
        { id: 6, label: 'Produce a data flow diagram', start: 7, dur: 5, after: 5 },
        { id: 7, label: 'Produce a requirements report', start: 12, dur: 4, after: 6 },
        { id: 8, label: 'Requirements milestone', start: 17, milestone: true, tone: 'teal', after: 7 }
      ]
    });
  }
});
