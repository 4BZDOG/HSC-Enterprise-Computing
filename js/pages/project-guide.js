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
