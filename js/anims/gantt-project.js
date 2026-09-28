/* Still diagram (Gantt chart): a school project, with dependencies and milestones.
   Enterprise Project › Researching and planning (time and resource management, Gantt charts). */
HSCAnim.define('gantt-project', {
  still: true,
  title: 'Gantt chart: a library booking app',
  alt: 'Gantt chart over seven weeks. Requirements (1 week), then feasibility (4 days), ending in a specifications-signed-off milestone. Design and modelling (10 days) follows. Sprint 1, bookings (10 days), then sprint 2, accounts (10 days). Testing (1 week) follows, ending in a client evaluation milestone. Each task starts when the one before it finishes.',
  layout: { size: [780, 390], minWidth: 640 },
  setup(s) {
    s.gantt(s.root, {
      x: 0, y: 4, w: 780, days: 49, labelW: 210, tick: 7, tickLabel: d => `wk ${d / 7}`,
      sections: [
        { name: 'Identify and define', rows: [
          { id: 'req', label: 'Requirements', start: 0, dur: 7, tone: 'teal' },
          { id: 'fea', label: 'Feasibility', start: 7, dur: 4, tone: 'teal', after: 'req' },
          { id: 'm1', label: 'Specifications signed off', start: 11, milestone: true, tone: 'terra', after: 'fea', strong: true }] },
        { name: 'Research and plan', rows: [
          { id: 'des', label: 'Design and modelling', start: 11, dur: 10, tone: 'plum', after: 'fea' }] },
        { name: 'Produce', rows: [
          { id: 's1', label: 'Sprint 1: bookings', start: 21, dur: 10, tone: 'sage', after: 'des' },
          { id: 's2', label: 'Sprint 2: accounts', start: 31, dur: 10, tone: 'sage', after: 's1' }] },
        { name: 'Test and evaluate', rows: [
          { id: 'tst', label: 'Testing', start: 41, dur: 7, tone: 'mustard', after: 's2' },
          { id: 'm2', label: 'Client evaluation', start: 48, milestone: true, tone: 'terra', after: 'tst', strong: true }] }
      ]
    });
  }
});
