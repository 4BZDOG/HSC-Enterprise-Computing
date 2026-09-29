/* Still diagram (NESA Gantt chart): installing a small-office network over two weeks.
   NESA Enterprise Computing Course Specifications, p.12 style (table on the left, dated timeline, dependencies, milestone).
   Networking systems › Project management tools. */
HSCAnim.define('net-gantt-install', {
  still: true,
  title: 'Gantt chart: installing a small-office network',
  alt: 'Gantt chart from Monday 12 to Friday 23 October. Task 1, survey the site and needs, runs 12 to 13 October. Task 2, design and approve the network diagram, follows on 14 to 15 October. Task 3, order equipment, is on 16 October. Task 4, run cabling, runs 19 to 20 October, and task 5, configure router and switch, also starts 19 October and runs to 20 October. Task 6, set up Wi-Fi and security, runs 21 October after task 5. Task 7, connect and test devices, runs 22 October. Task 8, staff briefing, is on 23 October. Task 9, network live, is a milestone at the end of 23 October. Weekends are shaded.',
  layout: { size: [830, 420], minWidth: 830 },
  setup(s) {
    const days = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map(String);
    s.ganttTable(s.root, {
      x: 0, y: 4, dayW: 30, days: days.length, rowH: 38, headRowH: 28,
      cols: [{ key: 'id', label: 'ID', w: 40 }, { key: 'label', label: 'Task name', w: 300, size: 14 }],
      head: [[{ label: 'October', span: 12 }], days.map(d => ({ label: d }))],
      shade: [5, 6],
      rows: [
        { id: 1, label: 'Survey site and needs', start: 0, dur: 2 },
        { id: 2, label: 'Design and approve diagram', start: 2, dur: 2, after: 1 },
        { id: 3, label: 'Order equipment', start: 4, dur: 1, after: 2 },
        { id: 4, label: 'Run cabling', start: 7, dur: 2, after: 3 },
        { id: 5, label: 'Configure router and switch', start: 7, dur: 2, after: 3 },
        { id: 6, label: 'Set up Wi-Fi and security', start: 9, dur: 1, after: 5 },
        { id: 7, label: 'Connect and test devices', start: 10, dur: 1, after: 6 },
        { id: 8, label: 'Staff briefing', start: 11, dur: 1, after: 7 },
        { id: 9, label: 'Network live', start: 12, milestone: true, tone: 'teal', after: 8 }
      ]
    });
  }
});
