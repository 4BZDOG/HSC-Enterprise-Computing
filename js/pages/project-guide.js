/* Project Management Guide (topics/project-guide.html).
   1. Approach chooser  2. Copy-as-text buttons for templates  3. Stage checklists saved in the browser.
   Vanilla JS. Storage keys start with ec- and every access is wrapped in try/catch. */
(function () {
  'use strict';

  /* ---------- 1. Approach chooser ---------- */
  var APPROACHES = [
    { id: 'waterfall', name: 'Waterfall (structured)', watch: 'Get the requirements written down and signed off before design begins, and agree how a change request will be handled.' },
    { id: 'agile', name: 'Agile', watch: 'Book regular client reviews at the start, keep a prioritised backlog and still keep your diary and plan up to date.' },
    { id: 'prototyping', name: 'Prototyping', watch: 'Say up front that the prototype is for learning, and agree when prototyping stops and the real build starts.' },
    { id: 'enduser', name: 'End-user development', watch: 'Keep the solution small, back it up, document how it works and check that the tool is safe for the data it holds.' },
    { id: 'outsourcing', name: 'Outsourcing', watch: 'Write a clear specification, agree deliverables and dates, and plan how you will check quality and protect data.' }
  ];
  // Points per answer, in the order of APPROACHES: waterfall, agile, prototyping, end-user, outsourcing.
  var QUESTIONS = {
    client: {
      high: { label: 'A client who is available every week', pts: [0, 3, 3, 1, 1] },
      some: { label: 'A client who is available occasionally', pts: [2, 2, 2, 1, 1] },
      low: { label: 'A client who is rarely available', pts: [3, 0, 0, 2, 2] }
    },
    reqs: {
      stable: { label: 'Stable, clear requirements', pts: [3, 0, 0, 2, 2] },
      evolving: { label: 'Requirements that will probably change', pts: [1, 3, 2, 1, 1] },
      unclear: { label: 'Unclear requirements the client cannot describe yet', pts: [0, 2, 3, 1, 0] }
    },
    build: {
      team: { label: 'A team with the skills to build it', pts: [2, 2, 2, 0, 0] },
      users: { label: 'Users who will build it with familiar tools', pts: [0, 0, 1, 3, 0] },
      external: { label: 'A missing skill that a specialist would supply', pts: [1, 0, 0, 0, 3] }
    },
    time: {
      fixed: { label: 'A fixed date with a fixed scope', pts: [3, 1, 1, 2, 2] },
      scope: { label: 'A fixed date with a flexible scope', pts: [1, 3, 1, 2, 1] },
      flexible: { label: 'A flexible deadline', pts: [1, 2, 3, 1, 1] }
    },
    budget: {
      tight: { label: 'A very small budget', pts: [1, 1, 2, 3, 0] },
      moderate: { label: 'A moderate budget', pts: [2, 2, 2, 2, 1] },
      generous: { label: 'A budget for specialist work', pts: [2, 2, 2, 0, 3] }
    }
  };
  var ORDER = ['client', 'reqs', 'build', 'time', 'budget'];

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function initChooser(root) {
    var form = root.querySelector('form');
    var out = root.querySelector('[data-pg-result]');
    var reset = root.querySelector('[data-pg-chooser-reset]');
    function answers() {
      var a = {};
      ORDER.forEach(function (q) {
        var el = form.querySelector('input[name="' + q + '"]:checked');
        if (el) a[q] = el.value;
      });
      return a;
    }
    function render() {
      var a = answers();
      if (Object.keys(a).length < ORDER.length) {
        var left = ORDER.length - Object.keys(a).length;
        out.innerHTML = '<p class="pg-result-empty">Answer all five questions to see a recommendation. ' + left + (left === 1 ? ' question' : ' questions') + ' left.</p>';
        return;
      }
      var scores = APPROACHES.map(function (ap, i) {
        var total = 0;
        ORDER.forEach(function (q) { total += QUESTIONS[q][a[q]].pts[i]; });
        return { i: i, ap: ap, total: total };
      });
      var max = 15;
      var ranked = scores.slice().sort(function (x, y) { return y.total - x.total || x.i - y.i; });
      var top = ranked[0], second = ranked[1];
      var pros = [], cons = [];
      ORDER.forEach(function (q) {
        var ans = QUESTIONS[q][a[q]], p = ans.pts[top.i];
        if (p >= 2) pros.push(ans.label);
        else cons.push(ans.label);
      });
      var tie = second.total === top.total;
      var html = '<p class="pg-kicker">Best fit for your answers</p>' +
        '<h4>' + esc(top.ap.name) + ' <span class="pg-score">(' + top.total + ' of ' + max + ')</span></h4>';
      if (tie) html += '<p>' + esc(second.ap.name) + ' scores the same, so either could work. Use the points below to decide, and consider combining them.</p>';
      html += '<h5>What points towards it</h5>';
      html += pros.length ? '<ul>' + pros.map(function (t) { return '<li><span class="pg-tag pro">Fits</span>' + esc(t) + '</li>'; }).join('') + '</ul>' : '<p>None of your answers strongly favour it, so treat the result with care.</p>';
      if (cons.length) {
        html += '<h5>Risks to manage</h5><ul>' + cons.map(function (t) { return '<li><span class="pg-tag con">Watch</span>' + esc(t) + ' is not an ideal match for ' + esc(top.ap.name.toLowerCase()) + '.</li>'; }).join('') + '</ul>';
      }
      html += '<p><strong>What to do about it:</strong> ' + esc(top.ap.watch) + '</p>';
      if (!tie) html += '<p>Runner-up: <strong>' + esc(second.ap.name) + '</strong> (' + second.total + ' of ' + max + '). Many real projects borrow from it.</p>';
      html += '<h5>All five approaches</h5><ul class="pg-bars">' + ranked.map(function (r, idx) {
        return '<li class="' + (r.total === top.total ? 'is-top' : '') + '"><span>' + esc(r.ap.name) + '</span><span class="pg-track" aria-hidden="true"><span style="width:' + Math.round(r.total / max * 100) + '%"></span></span><span class="pg-score">' + r.total + '/' + max + '</span></li>';
      }).join('') + '</ul>';
      html += '<p><small>A guide built on common rules of thumb, not a NESA rule. In your project, justify your choice in your own words using facts about your project.</small></p>';
      out.innerHTML = html;
    }
    form.addEventListener('change', render);
    if (reset) reset.addEventListener('click', function () { form.reset(); render(); });
    render();
  }

  /* ---------- 2. Copy templates as text ---------- */
  function tableToText(table) {
    var rows = [];
    table.querySelectorAll('tr').forEach(function (tr) {
      var cells = [];
      tr.querySelectorAll('th,td').forEach(function (c) { cells.push(c.textContent.replace(/\s+/g, ' ').trim().replace(/\t/g, ' ')); });
      rows.push(cells.join('\t'));
    });
    return rows.join('\n');
  }
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        var ok = document.execCommand('copy');
        document.body.removeChild(ta);
        ok ? resolve() : reject(new Error('copy failed'));
      } catch (e) { reject(e); }
    });
  }
  function initTemplate(box) {
    var btn = box.querySelector('.pg-copy'), table = box.querySelector('table');
    if (!btn || !table) return;
    btn.hidden = false;
    btn.setAttribute('aria-label', 'Copy this template as tab-separated text, ready to paste into a spreadsheet or document');
    btn.addEventListener('click', function () {
      copyText(tableToText(table)).then(function () { btn.textContent = 'Copied'; }, function () { btn.textContent = 'Copy failed'; });
      setTimeout(function () { btn.textContent = 'Copy as text'; }, 2000);
    });
  }

  /* ---------- 3. Checklists saved in this browser ---------- */
  var KEY = 'ec-pg-checks';
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } }
  function save(state) { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable: ticks last for this visit only */ } }
  function initChecklists() {
    var boxes = document.querySelectorAll('.pg-checklist input[type="checkbox"][data-k]');
    if (!boxes.length) return;
    var state = load();
    function mark(cb) { var tr = cb.closest('tr'); if (tr) tr.classList.toggle('is-done', cb.checked); }
    boxes.forEach(function (cb) {
      cb.checked = !!state[cb.getAttribute('data-k')];
      mark(cb);
      cb.addEventListener('change', function () {
        var s = load();
        if (cb.checked) s[cb.getAttribute('data-k')] = 1; else delete s[cb.getAttribute('data-k')];
        save(s); mark(cb);
      });
    });
    var reset = document.querySelector('[data-pg-reset]');
    if (reset) {
      reset.hidden = false;
      reset.addEventListener('click', function () {
        boxes.forEach(function (cb) { cb.checked = false; mark(cb); });
        save({});
      });
    }
  }

  function init() {
    var c = document.querySelector('[data-pg-chooser]');
    if (c) initChooser(c);
    document.querySelectorAll('[data-pg-template]').forEach(initTemplate);
    initChecklists();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

/* Project guide: critical path lab, built on the shared kit (css/labs.css, js/labs.js).
   Change the length of each task in the canteen ordering app plan and see which tasks are critical, which have float
   and when the project finishes. The critical path is a common project-management technique; NESA's Course
   Specifications do not name it. */
(function () {
  'use strict';
  var el = Labs.el;
  // id, name, days, tasks that must finish first
  var TASKS = [
    { id: 'A', n: 'Interview the canteen manager', d: 2, after: [] },
    { id: 'B', n: 'Design the database', d: 3, after: ['A'] },
    { id: 'C', n: 'Design the screens', d: 5, after: ['A'] },
    { id: 'D', n: 'Build the app', d: 6, after: ['B', 'C'] },
    { id: 'E', n: 'Test with the manager', d: 3, after: ['D'] }
  ];

  function buildCritical(host) {
    Labs.shell(host, 'pg-critical', 'Critical path explorer', 'Change the number of working days for each task. The tool works out the earliest each task can start and finish, which tasks are critical (no spare time) and how many days of float the others have.');
    var days = {}; TASKS.forEach(function (t) { days[t.id] = t.d; });
    var row = el('div', 'lab-row');
    var inputs = {};
    TASKS.forEach(function (t) {
      var f = el('div', 'lab-field'), l = el('label', null, t.id + '. ' + t.n), i = el('input');
      l.htmlFor = i.id = 'pg-cp-' + t.id; i.type = 'number'; i.min = 1; i.max = 20; i.step = 1; i.value = t.d;
      i.addEventListener('input', function () { var v = Math.round(parseFloat(i.value)); if (v >= 1 && v <= 20) { days[t.id] = v; update(); } });
      f.append(l, i); row.append(f); inputs[t.id] = i;
    });
    host.append(row);
    var chart = el('div', 'pg-cp-chart'); chart.setAttribute('role', 'img'); chart.setAttribute('aria-label', 'Gantt chart of the five tasks. The table below gives the same information.');
    var tab = Labs.table(['Task', 'Days', 'Must finish first', 'Earliest start', 'Earliest finish', 'Float (spare days)', 'Critical?'], { num: [1, 3, 4, 5], stack: true });
    var out = el('div', 'lab-readout'); out.setAttribute('role', 'status');
    var actions = el('div', 'lab-actions'); var rs = el('button', 'lab-btn lab-btn--quiet', 'Back to the original plan'); rs.type = 'button'; actions.append(rs);
    host.append(chart, tab.wrap, out, actions);
    host.append(el('p', 'lab-note', 'Days are working days, counted from day 1. A task that starts on day 8 can begin once everything it depends on has finished on or before day 7. Try the worked questions in the notes: cut E to 2 days, then grow C to 8 days, then grow B past C.'));

    function compute() {
      var es = {}, ef = {};
      TASKS.forEach(function (t) { es[t.id] = t.after.length ? Math.max.apply(null, t.after.map(function (a) { return ef[a]; })) + 1 : 1; ef[t.id] = es[t.id] + days[t.id] - 1; });
      var end = Math.max.apply(null, TASKS.map(function (t) { return ef[t.id]; }));
      var lf = {}, ls = {};
      TASKS.slice().reverse().forEach(function (t) {
        var succ = TASKS.filter(function (u) { return u.after.indexOf(t.id) >= 0; });
        lf[t.id] = succ.length ? Math.min.apply(null, succ.map(function (u) { return ls[u.id]; })) - 1 : end;
        ls[t.id] = lf[t.id] - days[t.id] + 1;
      });
      return { es: es, ef: ef, ls: ls, lf: lf, end: end };
    }
    function update() {
      var r = compute();
      chart.replaceChildren();
      var scale = el('div', 'pg-cp-scale');
      for (var d = 1; d <= r.end; d++) { var tick = el('span', 'pg-cp-tick', d % 2 === 1 || r.end < 14 ? String(d) : ''); scale.append(tick); }
      scale.style.gridTemplateColumns = 'repeat(' + r.end + ', minmax(0, 1fr))';
      var head = el('div', 'pg-cp-row'); head.append(el('span', 'pg-cp-name'), scale); chart.append(head);
      var critical = [];
      TASKS.forEach(function (t) {
        var fl = r.ls[t.id] - r.es[t.id], crit = fl === 0; if (crit) critical.push(t.id);
        var rowEl = el('div', 'pg-cp-row'); rowEl.append(el('span', 'pg-cp-name', t.id + '. ' + t.n));
        var track = el('div', 'pg-cp-track'); track.style.gridTemplateColumns = 'repeat(' + r.end + ', minmax(0, 1fr))'; track.style.setProperty('--pg-cp-n', r.end);
        var bar = el('span', 'pg-cp-bar ' + (crit ? 'is-crit' : 'is-flex'), days[t.id] + ' d'); bar.style.gridColumn = r.es[t.id] + ' / ' + (r.ef[t.id] + 2); track.append(bar);
        if (fl > 0) { var f = el('span', 'pg-cp-float', fl + ' d float'); f.style.gridColumn = (r.ef[t.id] + 1) + ' / ' + (r.ef[t.id] + 1 + fl + 1); track.append(f); }
        rowEl.append(track); chart.append(rowEl);
      });
      tab.clear();
      TASKS.forEach(function (t) {
        var fl = r.ls[t.id] - r.es[t.id];
        tab.add([t.id + '. ' + t.n, String(days[t.id]), t.after.length ? t.after.join(', ') : 'none', 'Day ' + r.es[t.id], 'Day ' + r.ef[t.id], String(fl), fl === 0 ? el('span', 'lab-badge is-bad', 'Critical') : el('span', 'lab-badge is-good', 'Has float')]);
      });
      out.className = 'lab-readout';
      out.replaceChildren(el('p', null, 'The project finishes on day ' + r.end + '. The critical path is ' + critical.join(' → ') + ': a delay to any of these delays the finish.'));
      var flexy = TASKS.filter(function (t) { return r.ls[t.id] - r.es[t.id] > 0; });
      if (flexy.length) out.append(el('p', null, flexy.map(function (t) { return 'Task ' + t.id + ' can slip by up to ' + (r.ls[t.id] - r.es[t.id]) + ' day' + (r.ls[t.id] - r.es[t.id] === 1 ? '' : 's') + ' without moving the end date.'; }).join(' ')));
    }
    rs.addEventListener('click', function () { TASKS.forEach(function (t) { days[t.id] = t.d; inputs[t.id].value = t.d; }); update(); });
    update();
  }
  function init3() { document.querySelectorAll('[data-pgl="critical"]').forEach(buildCritical); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init3); else init3();
})();
