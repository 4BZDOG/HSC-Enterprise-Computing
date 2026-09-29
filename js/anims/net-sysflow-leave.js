/* Still diagram (NESA system flowchart): a staff leave request in a digital workflow.
   NESA Enterprise Computing Course Specifications, p.7 symbols (online input, process, direct access storage,
   manual operation, online display, telecommunications link, cloud).
   Networking systems › Digital workflows. */
HSCAnim.define('net-sysflow-leave', {
  still: true,
  title: 'System flowchart: a digital workflow for staff leave requests',
  alt: 'System flowchart. Leave request (online input) goes to the process Check leave balance, which reads and writes the Leave records (direct access storage). Check leave balance sends data to the process Notify manager, then to a manual operation Manager approves or declines. The decision goes to the process Record decision, which updates the Leave records, shows the outcome on an online display called Staff dashboard, and sends data over a telecommunications link to Payroll in the cloud.',
  layout: { size: [720, 640], minWidth: 720 },
  setup(s) {
    const L = s.g(s.back), st = { straight: true };
    const req = s.node(s.root, { x: 110, y: 60, w: 130, h: 64, shape: 'sf-input', text: 'Leave\nrequest' });
    const chk = s.node(s.root, { x: 320, y: 60, w: 140, h: 56, text: 'Check leave\nbalance' });
    const rec = s.node(s.root, { x: 590, y: 255, w: 130, h: 86, shape: 'sf-storage', text: 'Leave\nrecords' });
    const ntf = s.node(s.root, { x: 320, y: 190, w: 140, h: 56, text: 'Notify\nmanager' });
    const man = s.node(s.root, { x: 320, y: 320, w: 160, h: 64, shape: 'sf-manual', text: 'Manager approves\nor declines' });
    const dec = s.node(s.root, { x: 320, y: 450, w: 140, h: 56, text: 'Record\ndecision' });
    const dsp = s.node(s.root, { x: 110, y: 450, w: 150, h: 70, shape: 'sf-display', text: 'Staff\ndashboard' });
    const pay = s.node(s.root, { x: 580, y: 560, w: 130, h: 84, shape: 'sf-cloud', text: 'Payroll\n(cloud)' });
    s.link(L, req, chk, st);
    s.link(L, chk, rec, Object.assign({ both: true }, st));
    s.link(L, chk, ntf, st);
    s.link(L, ntf, man, st);
    s.link(L, man, dec, st);
    s.link(L, dec, dsp, st);
    s.link(L, dec, rec, Object.assign({ both: true }, st));
    s.telecomLink(L, dec, pay, { amp: 18 });
  }
});
