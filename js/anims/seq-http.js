/* Still diagram (sequence): an HTTP request and response.
   Networking Systems › Network architecture and infrastructure (requests and responses). */
HSCAnim.define('seq-http', {
  still: true,
  title: 'Sequence diagram: an HTTP request and response',
  alt: 'Sequence diagram. The browser sends GET /student/profile?id=42; the web server runs a SELECT on the database and returns 200 OK with HTML, CSS and JavaScript, which the browser renders. The user then submits an assignment with POST; the server validates it, INSERTs it, and replies 302 redirect to /success, which the browser then GETs.',
  layout: { size: [660, 720], minWidth: 520 },
  setup(s) {
    s.sequence(s.root, {
      x: 0, y: 10, w: 660, cardW: 150,
      actors: [
        { id: 'b', label: 'Browser', tone: 'teal', on: true },
        { id: 's', label: 'Web server', tone: 'sage-t' },
        { id: 'd', label: 'Database', tone: 'mustard-t' }
      ],
      steps: [
        { from: 'b', to: 's', text: 'GET /student/profile?id=42' },
        { from: 's', to: 'd', text: 'SELECT * FROM students\nWHERE id = 42' },
        { from: 'd', to: 's', text: 'student record', reply: true },
        { from: 's', to: 'b', text: '200 OK: HTML, CSS, JS', reply: true },
        { from: 'b', to: 'b', text: 'render the page' },
        { note: 'The user submits an assignment', over: ['b', 's'] },
        { from: 'b', to: 's', text: 'POST /submit/assignment\n(form data + file)' },
        { from: 's', to: 's', text: 'validate input,\nprocess the file' },
        { from: 's', to: 'd', text: 'INSERT submission' },
        { from: 's', to: 'b', text: '302 redirect to /success', reply: true },
        { from: 'b', to: 's', text: 'GET /success' },
        { from: 's', to: 'b', text: '200 OK: success page', reply: true }
      ]
    });
  }
});
