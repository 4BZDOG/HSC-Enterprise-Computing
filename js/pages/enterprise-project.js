/* Enterprise project: interactive widget.
   Development-approach chooser: six questions about a project score the five NESA approaches
   (waterfall, agile, prototyping, end-user, outsourcing) with simple, visible rules.
   Vanilla JS; the host holds a static fallback message if this file does not run. */
(() => {
  'use strict';

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };

  const APPROACHES = ['Waterfall (structured)', 'Agile', 'Prototyping', 'End-user', 'Outsourcing'];
  // Points for each answer, in the order of APPROACHES.
  const QUESTIONS = [
    { short: 'Requirements', text: 'How clear are the requirements?', options: [
      ['Clear and unlikely to change', [3, 0, 0, 1, 2]],
      ['Partly clear', [1, 2, 2, 1, 1]],
      ['Unclear, or likely to change', [0, 3, 3, 1, 0]]] },
    { short: 'Feedback', text: 'How available are the client and users for feedback?', options: [
      ['Rarely available', [2, 0, 0, 0, 2]],
      ['Sometimes available', [1, 1, 1, 1, 1]],
      ['Regularly available', [0, 3, 3, 2, 0]]] },
    { short: 'Size and risk', text: 'How big and how risky is the system?', options: [
      ['Small and low risk', [0, 1, 1, 3, 0]],
      ['Medium size or moderate risk', [2, 2, 2, 0, 1]],
      ['Large, or a failure would be costly or unsafe', [3, 2, 1, 0, 2]]] },
    { short: 'Skills', text: 'Does the team have the skills it needs?', options: [
      ['Has all the skills', [1, 1, 1, 1, 0]],
      ['Some skills are missing', [1, 1, 1, 0, 2]],
      ['Most skills are missing', [0, 0, 0, 0, 3]]] },
    { short: 'Users', text: 'Who will use the system?', options: [
      ['Only the builder or a few colleagues', [0, 1, 1, 3, 0]],
      ['One organisation', [1, 2, 2, 1, 1]],
      ['The public or many organisations', [2, 2, 1, 0, 2]]] },
    { short: 'Timing', text: 'When is a working version useful?', options: [
      ['A usable version is needed early', [0, 3, 2, 2, 1]],
      ['Only the finished system is useful', [2, 1, 1, 0, 1]]] }
  ];
  const PRESETS = [
    { name: 'ClubHub', answers: [1, 2, 1, 0, 1, 0] },
    { name: 'Hospital patient records', answers: [0, 1, 2, 1, 1, 1] },
    { name: 'Secretary’s own spreadsheet', answers: [0, 2, 0, 0, 0, 0] },
    { name: 'Start-up prototype', answers: [2, 2, 1, 1, 2, 0] }
  ];
  const RISKS = [
    'Building the wrong thing, and finding problems late.',
    'Scope creep and lighter documentation; needs committed users.',
    'Endless refinement, or a prototype mistaken for the finished product.',
    'No testing or documentation, and it depends on one person.',
    'Less control, communication gaps and dependence on the supplier.'
  ];

  function build(host) {
    host.replaceChildren();
    host.append(el('h4', null, 'Development approach chooser'));
    host.append(el('p', 'ep-lead', 'Answer six questions about a project. Each answer adds points to each approach, and the highest score is a starting point for your reasoning, not the answer.'));

    const presets = el('div', 'ep-presets');
    presets.append(el('span', 'ep-presets-label', 'Try an example:'));
    const btns = PRESETS.map((p, i) => {
      const b = el('button', 'ep-btn', p.name);
      b.type = 'button';
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => { apply(i); });
      presets.append(b);
      return b;
    });
    host.append(presets);

    const cols = el('div', 'ep-cols');
    const form = el('div', 'ep-form');
    const groups = QUESTIONS.map((q, qi) => {
      const fs = el('fieldset', 'ep-q');
      fs.append(el('legend', null, `${qi + 1}. ${q.text}`));
      const inputs = q.options.map(([label], oi) => {
        const lab = el('label', 'ep-opt');
        const inp = document.createElement('input');
        inp.type = 'radio';
        inp.name = `ep-q${qi}`;
        inp.value = String(oi);
        inp.addEventListener('change', () => { btns.forEach(b => b.setAttribute('aria-pressed', 'false')); update(); });
        lab.append(inp, el('span', null, label));
        fs.append(lab);
        return inp;
      });
      form.append(fs);
      return inputs;
    });
    const out = el('div', 'ep-out');
    out.setAttribute('aria-live', 'polite');
    cols.append(form, out);
    host.append(cols);
    host.append(el('p', 'ep-note', 'Real projects often blend approaches, for example structured requirements with agile delivery. The scores use simple rules chosen for teaching.'));

    function answers() {
      return groups.map(g => g.findIndex(i => i.checked));
    }
    function apply(pi) {
      PRESETS[pi].answers.forEach((a, qi) => { groups[qi][a].checked = true; });
      btns.forEach((b, i) => b.setAttribute('aria-pressed', String(i === pi)));
      update();
    }
    function update() {
      const a = answers();
      out.replaceChildren();
      if (a.some(x => x < 0)) {
        out.append(el('h5', null, 'Scores'));
        out.append(el('p', 'ep-note', 'Answer all six questions, or choose an example, to see the scores.'));
        return;
      }
      const scores = APPROACHES.map((_, k) => a.reduce((sum, oi, qi) => sum + QUESTIONS[qi].options[oi][1][k], 0));
      const max = Math.max(...scores);
      const top = scores.map((s, k) => (s === max ? k : -1)).filter(k => k >= 0);
      out.append(el('h5', null, 'Scores (out of 18)'));
      APPROACHES.forEach((name, k) => {
        const row = el('div', 'ep-row' + (top.includes(k) ? ' is-top' : ''));
        row.append(el('span', 'ep-name', name));
        const track = el('span', 'ep-track');
        const fill = el('span', 'ep-fill');
        fill.style.width = `${Math.round(scores[k] / 18 * 100)}%`;
        track.append(fill);
        row.append(track, el('span', 'ep-score', String(scores[k])));
        out.append(row);
      });
      const why = el('div', 'ep-why');
      const lead = top.length > 1 ? 'Joint highest: ' + top.map(k => APPROACHES[k]).join(' and ') : 'Highest: ' + APPROACHES[top[0]];
      why.append(el('strong', null, lead));
      const k = top[0];
      const reasons = a.map((oi, qi) => ({ qi, oi, pts: QUESTIONS[qi].options[oi][1][k] })).filter(r => r.pts >= 2);
      const ul = el('ul');
      if (reasons.length) {
        reasons.forEach(r => ul.append(el('li', null, `${QUESTIONS[r.qi].short}: ${QUESTIONS[r.qi].options[r.oi][0].toLowerCase()} (+${r.pts})`)));
        why.append(el('p', null, 'Main reasons:'));
        why.append(ul);
      }
      why.append(el('p', null, 'Watch for: ' + RISKS[k]));
      out.append(why);
    }
    update();
  }

  function start() {
    const host = document.querySelector('[data-ep-chooser]');
    if (host) build(host);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();

/* Enterprise project: labs built on the shared kit (css/labs.css, js/labs.js).
   1. Needs and wants: sort the features of a project into Must, Should, Could and Won't against a limited number of hours.
   2. Test data practice: is this value normal, boundary or invalid? */
(function () {
  'use strict';
  var el = Labs.el;

  /* ---------- 1. MoSCoW: negotiating needs and wants ---------- */
  var FEATURES = [
    { id: 'book', n: 'Book a place in a session', h: 30, core: true, why: 'Booking is the reason ClubHub exists.' },
    { id: 'cancel', n: 'Cancel a booking and free the place', h: 12, core: true, why: 'Without cancelling, places stay blocked and staff fix mistakes by hand.' },
    { id: 'email', n: 'Email confirmation of a booking', h: 10 },
    { id: 'wait', n: 'Waiting list for full sessions', h: 16 },
    { id: 'report', n: 'Attendance report for staff', h: 14 },
    { id: 'access', n: 'Accessibility checks (labels, contrast, keyboard use)', h: 10 },
    { id: 'pay', n: 'Online payment for paid events', h: 36 },
    { id: 'dark', n: 'Dark mode', h: 8 },
    { id: 'share', n: 'Share a session on social media', h: 6 },
    { id: 'app', n: 'Separate mobile app', h: 60 }
  ];
  var BUCKETS = [['must', 'Must have'], ['should', 'Should have'], ['could', 'Could have'], ['wont', 'Won\'t have this time']];
  var CAP = 100;

  function buildMoscow(host) {
    Labs.shell(host, 'ep-moscow', 'Negotiate the ClubHub features', 'The team has 100 hours to build the first release of ClubHub, and the client has asked for ten features. Sort each feature into Must have, Should have, Could have or Won\'t have this time (MoSCoW). The tool checks your plan against the hours and against the purpose of the system.');
    var st = {};
    FEATURES.forEach(function (f) { st[f.id] = 'could'; });
    var list = el('div', 'ep-ms-list');
    var sel = {};
    FEATURES.forEach(function (f) {
      var row = el('div', 'ep-ms-row'), name = el('label', 'ep-ms-name'), s = el('select');
      s.id = 'ep-ms-' + f.id; name.htmlFor = s.id; name.append(el('span', null, f.n), el('small', null, f.h + ' hours'));
      BUCKETS.forEach(function (b) { var o = el('option', null, b[1]); o.value = b[0]; s.append(o); });
      s.value = st[f.id]; s.addEventListener('change', function () { st[f.id] = s.value; update(); });
      row.append(name, s); list.append(row); sel[f.id] = s;
    });
    host.append(list);
    var bars = el('div', 'ep-ms-bars'); host.append(bars);
    var out = el('div', 'lab-feedback is-info'); out.setAttribute('role', 'status'); host.append(out);
    var actions = el('div', 'lab-actions'); var sug = el('button', 'lab-btn', 'Show one sensible plan'); sug.type = 'button'; var rs = el('button', 'lab-btn lab-btn--quiet', 'Clear my plan'); rs.type = 'button'; actions.append(sug, rs); host.append(actions);
    var why = el('div', 'lab-readout'); why.hidden = true; host.append(why);
    host.append(el('p', 'lab-note', 'A common rule of thumb, from the agile method DSDM, is that Must haves should take no more than about 60% of the effort, so the team has room for surprises. The hours here are made up for the activity. In a real project the client and the team negotiate the list together, and it can change at each review.'));

    function hours(b) { return FEATURES.filter(function (f) { return st[f.id] === b; }).reduce(function (a, f) { return a + f.h; }, 0); }
    function update() {
      bars.replaceChildren();
      var must = hours('must'), should = hours('should'), could = hours('could'), wont = hours('wont');
      [['Must', must, 'is-must'], ['Should', should, 'is-should'], ['Could', could, 'is-could']].forEach(function (b) {
        var r = el('div', 'ep-ms-bar'); var fill = el('span', 'ep-ms-fill ' + b[2]); fill.style.width = Math.min(100, b[1] / CAP * 100) + '%';
        var track = el('div', 'ep-ms-track'); track.append(fill);
        r.append(el('span', 'ep-ms-label', b[0] + ' have'), track, el('span', 'ep-ms-hours', b[1] + ' h')); bars.append(r);
      });
      var committed = must + should;
      bars.append(el('p', 'lab-note', 'Committed (Must + Should): ' + committed + ' of ' + CAP + ' hours. Could have: ' + could + ' hours of extras if time allows. Won\'t have this time: ' + wont + ' hours.'));
      var notes = [], level = 'is-good';
      FEATURES.filter(function (f) { return f.core && st[f.id] !== 'must'; }).forEach(function (f) { notes.push('"' + f.n + '" is core to the system. ' + f.why + ' Make it a Must have.'); level = 'is-bad'; });
      if (must > CAP) { notes.push('The Must haves alone need ' + must + ' hours, more than the ' + CAP + ' available. Something has to move down.'); level = 'is-bad'; }
      else if (committed > CAP) { notes.push('You have promised ' + committed + ' hours of work in ' + CAP + ' hours. Move some Should haves to Could have or Won\'t have.'); if (level !== 'is-bad') level = 'is-warn'; }
      else if (must > CAP * 0.6) { notes.push('The Must haves take ' + Math.round(must / CAP * 100) + '% of the time. If anything goes wrong there is no room to recover, so check that each one is truly essential.'); if (level !== 'is-bad') level = 'is-warn'; }
      if (!notes.length) { notes.push(committed < CAP * 0.6 ? 'This is a safe plan, with time left over. You could move a Could have up to Should have.' : 'This plan fits the hours, includes the core features and leaves some room for surprises.'); }
      out.className = 'lab-feedback ' + level; out.replaceChildren(el('p', null, notes.join(' ')));
    }
    sug.addEventListener('click', function () {
      var plan = { book: 'must', cancel: 'must', email: 'must', wait: 'should', report: 'should', access: 'should', dark: 'could', share: 'could', pay: 'wont', app: 'wont' };
      FEATURES.forEach(function (f) { st[f.id] = plan[f.id]; sel[f.id].value = plan[f.id]; });
      update(); why.hidden = false; why.replaceChildren(el('p', null, 'One sensible plan: booking, cancelling and a confirmation email are Must haves (52 hours). A waiting list, an attendance report and accessibility checks are Should haves (40 hours), so the first release is 92 hours. Dark mode and sharing are Could haves. Online payment and a separate app are left for a later release, because together they would take 96 hours and are not needed for the first version to work. Another team could reasonably make a different choice if it can justify it.'));
    });
    rs.addEventListener('click', function () { FEATURES.forEach(function (f) { st[f.id] = 'could'; sel[f.id].value = 'could'; }); why.hidden = true; update(); });
    update();
  }

  /* ---------- 2. Test data practice ---------- */
  function buildTests(host) {
    Labs.sorter(host, {
      cls: 'ep-testsort', keepCase: true,
      title: 'Normal, boundary or invalid test data?',
      lead: 'A test plan needs three kinds of data. Normal data is a typical valid value. Boundary data sits at or just beside a limit. Invalid data is clearly wrong, such as the wrong type or an impossible value. Read each rule and test value, then choose the kind.',
      noun: 'test value', groupLabel: 'Kind of test data',
      choices: [{ key: 'Normal', label: 'Normal' }, { key: 'Boundary', label: 'Boundary' }, { key: 'Invalid', label: 'Invalid' }],
      items: [
        { text: 'Rule: a booking is for 1 to 8 people. Test value: 4.', ans: 'Normal', why: 'A typical value well inside the limits. The system should accept it.' },
        { text: 'Rule: a booking is for 1 to 8 people. Test value: 8.', ans: 'Boundary', why: 'It sits exactly on the upper limit. The system should accept it, and this is where off-by-one mistakes (using < where <= was meant) show up.' },
        { text: 'Rule: a booking is for 1 to 8 people. Test value: 9.', ans: 'Boundary', why: 'It is just beyond the upper limit. The system should reject it, which checks that the limit stops at exactly 8.' },
        { text: 'Rule: a booking is for 1 to 8 people. Test value: "twelve".', ans: 'Invalid', why: 'The wrong data type. The system should reject it with a helpful message rather than crash.' },
        { text: 'Rule: a discount code is exactly 6 characters. Test value: SAVE20.', ans: 'Normal', why: 'A valid code of the right length. The system should accept it.' },
        { text: 'Rule: a discount code is exactly 6 characters. Test value: SAVE2 (5 characters).', ans: 'Boundary', why: 'One character below the required length. The system should reject it, which checks the lower edge of the rule.' },
        { text: 'Rule: a discount code is exactly 6 characters. Test value: (nothing entered).', ans: 'Invalid', why: 'A missing value is clearly wrong data, and tests that a required field cannot be left empty.' },
        { text: 'Rule: a quiz mark is a whole number from 0 to 100. Test value: 100.', ans: 'Boundary', why: 'It sits exactly on the upper limit and should be accepted.' },
        { text: 'Rule: a quiz mark is a whole number from 0 to 100. Test value: 12.5.', ans: 'Invalid', why: 'Within the range, but not a whole number, so it breaks the rule about type. The system should reject it.' }
      ],
      closing: 'A good test plan lists normal, boundary and invalid values for each rule, and states the expected result for each before the test is run.'
    });
  }

  function init2() {
    document.querySelectorAll('[data-epl="moscow"]').forEach(buildMoscow);
    document.querySelectorAll('[data-epl="tests"]').forEach(buildTests);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init2); else init2();
})();
