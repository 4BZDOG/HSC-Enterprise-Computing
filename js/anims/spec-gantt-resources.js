/* Still diagram (NESA Gantt chart): resources and percentage completion.
   The solid part of each bar is the work done; the pale part is the work remaining.
   NESA Enterprise Computing Course Specifications, p.12, example 2 (redrawn with the diagram kit).
   Enterprise Computing › Project management (Gantt charts). */
HSCAnim.define('spec-gantt-resources', {
  still: true,
  title: 'Gantt chart: resources and percentage completion',
  alt: 'Gantt chart from 31 October to 7 December 2022 with three phases. Phase 1, Analysis, is 69 per cent complete and includes on-site meetings, discussions with stakeholders (90 per cent), stakeholder requirements 1 and 2 (100 per cent, Sara McLoy and Maria Hughs), customer requirement 1 (50 per cent), document current systems (0 per cent, James Larry and Maria Hughs) and an analysis complete milestone on 10 November. Phase 2, Design, is 0 per cent complete: design database (Maria Hughs), software design (Rebecca McCabe), interface design and create design specification (Danny Lee), with a design complete milestone on 24 November. Phase 3, Development: deploy development, develop system modules (Steven) and integrate system modules.',
  layout: { size: [1110, 640], minWidth: 1110 },
  setup(s) {
    const week = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const letters = Array.from({ length: 38 }, (_, i) => ({ label: week[i % 7] }));
    const R = (label, date, start, dur, tone, pct, extra) => Object.assign({ label, date, start, dur, tone, pct }, extra);
    const t = (name, pct) => `${name} ${pct}%`;
    s.ganttTable(s.root, {
      x: 0, y: 4, dayW: 18, days: 38, rowH: 30, headRowH: 26,
      cols: [{ key: 'label', label: 'Task name', w: 236, size: 13.5 }, { key: 'date', label: 'Planned\nstart date', w: 104 }],
      head: [
        [{ label: '31 Oct 2022', span: 7 }, { label: '7 Nov 2022', span: 7 }, { label: '14 Nov 2022', span: 7 }, { label: '21 Nov 2022', span: 7 }, { label: '28 Nov 2022', span: 7 }, { label: '5 Dec', span: 3 }],
        letters],
      shade: [5, 6, 12, 13, 19, 20, 26, 27, 33, 34],
      rows: [
        R('1. Analysis', '31-10-2022', 0, 11, 'teal', 69, { id: 'a', summary: true, text: t('1. Analysis', 69) }),
        { id: 'a1', label: 'On-site meetings', date: '31-10-2022', start: 0, milestone: true, tone: 'teal', mdate: '31-10-2022', indent: 1 },
        R('Discussions with…', '1-11-2022', 1, 9, 'teal', 90, { id: 'a2', summary: true, indent: 1, text: t('Discussion with Stakeholders', 90) }),
        R('Stakeholder req…', '1-11-2022', 1, 1, 'teal', 100, { id: 'a3', indent: 2, text: t('Stakeholder Requirement 1', 100), who: 'Sara McLoy and Maria Hughs' }),
        R('Stakeholder req…', '1-11-2022', 1, 2, 'teal', 100, { id: 'a4', indent: 2, text: t('Stakeholder Requirement 2', 100) }),
        R('Customer requir…', '3-11-2022', 3, 6, 'teal', 50, { id: 'a5', indent: 2, text: t('Customer Requirement 1', 50) }),
        R('Document Current…', '7-11-2022', 7, 3, 'teal', 0, { id: 'a6', indent: 1, text: t('Document Current Systems', 0), who: 'James Larry and Maria Hughs' }),
        { id: 'a7', label: 'Analysis complete', date: '10-11-2022', start: 10, milestone: true, tone: 'teal', mdate: '10-11-2022', indent: 1 },
        R('2. Design', '11-11-2022', 11, 13, 'plum', 0, { id: 'd', summary: true, text: t('2. Design', 0) }),
        R('Design database', '11-11-2022', 11, 4, 'plum', 0, { id: 'd1', indent: 1, text: t('Design Database', 0), who: 'Maria Hughs' }),
        R('Software design', '14-11-2022', 14, 3, 'plum', 0, { id: 'd2', indent: 1, text: t('Software Design', 0), who: 'Rebecca McCabe' }),
        R('Interface design', '17-11-2022', 17, 3, 'plum', 0, { id: 'd3', indent: 1, text: t('Interface Design', 0) }),
        R('Create design spec…', '19-11-2022', 19, 4, 'plum', 0, { id: 'd4', indent: 1, text: t('Create Design Specification', 0), who: 'Danny Lee' }),
        { id: 'd5', label: 'Design complete', date: '17-11-2022', start: 24, milestone: true, tone: 'plum', mdate: '24-11-2022', indent: 1 },
        R('3. Development', '17-11-2022', 17, 20, 'sage', 0, { id: 'v', summary: true, text: t('3. Development', 0) }),
        R('Deploy Developmen…', '29-11-2022', 29, 2, 'sage', 0, { id: 'v1', indent: 1, text: 'Deploy Development' }),
        R('Develop System Mo…', '17-11-2022', 17, 5, 'sage', 0, { id: 'v2', indent: 1, text: t('Development System Modules', 0), who: 'Steven' }),
        R('Integrate System M…', '22-11-2022', 22, 5, 'sage', 0, { id: 'v3', indent: 1, text: t('Integrate System Modules', 0) })
      ]
    });
  }
});
