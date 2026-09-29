/* Principles of Cybersecurity: interactive widgets.
   1. Risk matrix explorer (5 x 5 likelihood x consequence) with a worked risk register.
   2. Passphrase strength estimator (entropy of randomly chosen secrets).
   Vanilla JS; every widget renders a usable static fallback if this file does not run. */
(() => {
  'use strict';

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };

  /* ---------- Risk matrix explorer ---------- */
  const LIK = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost certain'];
  const CON = ['Insignificant', 'Minor', 'Moderate', 'Major', 'Severe'];
  const RATING = [
    { key: 'low', name: 'Low', max: 4, cls: 'is-low', response: 'Accept and monitor. Routine controls are enough; review the risk when circumstances change.' },
    { key: 'med', name: 'Medium', max: 9, cls: 'is-med', response: 'Manage. Give the risk an owner, add specific controls and review it regularly (for example each quarter).' },
    { key: 'high', name: 'High', max: 16, cls: 'is-high', response: 'Treat now. A funded treatment plan approved by senior management, with interim controls straight away.' },
    { key: 'ext', name: 'Extreme', max: 25, cls: 'is-ext', response: 'Act immediately. Escalate to the executive or board and consider pausing the activity until the risk is reduced.' }
  ];
  const rate = score => RATING.find(r => score <= r.max);

  const REGISTER = [
    { id: 'R1', name: 'Phishing leads to email account takeover (BEC)', before: [5, 3], after: [3, 3],
      fix: 'MFA on every email account, phishing-awareness training, and a call-back check before any change of bank details.' },
    { id: 'R2', name: 'Ransomware through an unpatched internet-facing server', before: [4, 5], after: [2, 4],
      fix: 'Patch or retire the old server, MFA on remote access, network segmentation and offline backups that are tested.' },
    { id: 'R3', name: 'Insider copies the customer database before leaving', before: [3, 4], after: [2, 3],
      fix: 'Least privilege, alerts on bulk exports, and an offboarding checklist that removes access on the last day.' },
    { id: 'R4', name: 'Unencrypted laptop lost or stolen', before: [4, 3], after: [4, 1],
      fix: 'Full-disk encryption and remote wipe. The laptop is still lost as often, but the data is no longer readable.' },
    { id: 'R5', name: 'Supplier software is compromised', before: [2, 4], after: [2, 2],
      fix: 'Security and breach-notification clauses in contracts, and sharing only the data the supplier needs.' }
  ];

  function buildRisk(host) {
    const state = { l: 3, c: 3, mode: 'before' };
    host.replaceChildren();
    host.append(el('h4', null, 'Risk matrix explorer'));
    host.append(el('p', 'cy-lead', 'Select a cell, or choose a likelihood and a consequence. Then switch between the risks of Riverina Fresh Logistics before and after its treatments and watch each one move.'));

    const wrap = el('div', 'cy-risk');
    const left = el('div');
    const right = el('div');

    const tg = el('div', 'cy-toggle');
    tg.setAttribute('role', 'group');
    tg.setAttribute('aria-label', 'Show risks');
    const bBefore = el('button', null, 'Before treatment (inherent)');
    const bAfter = el('button', null, 'After treatment (residual)');
    [bBefore, bAfter].forEach(b => { b.type = 'button'; });
    tg.append(bBefore, bAfter);
    left.append(tg);

    const gw = el('div', 'cy-grid-wrap');
    gw.append(el('div', 'cy-axis-y', 'Likelihood'));
    const grid = el('div', 'cy-grid');
    const cells = {};
    for (let l = 5; l >= 1; l--) {
      for (let c = 1; c <= 5; c++) {
        const b = el('button', 'cy-cell ' + rate(l * c).cls);
        b.type = 'button';
        b.append(el('span', 'cy-num', String(l * c)), el('span', 'cy-marks'));
        b.addEventListener('click', () => { state.l = l; state.c = c; render(); });
        cells[l + ',' + c] = b;
        grid.append(b);
      }
    }
    gw.append(grid);
    gw.append(el('div'));
    gw.append(el('div', 'cy-axis-x', 'Consequence'));
    left.append(gw);
    const sc = el('div', 'cy-scale');
    sc.append(el('span', null, '1 Insignificant'), el('span', null, '5 Severe'));
    left.append(sc);

    const out = el('div', 'cy-out');
    out.setAttribute('aria-live', 'polite');
    const fields = el('div', 'cy-fields');
    const mk = (label, names) => {
      const wrapF = el('div');
      const id = 'cy-' + label.toLowerCase() + '-' + Math.random().toString(36).slice(2, 7);
      const lab = el('label', null, label); lab.htmlFor = id;
      const sel = el('select'); sel.id = id;
      names.forEach((n, i) => { const o = el('option', null, (i + 1) + ' ' + n); o.value = i + 1; sel.append(o); });
      wrapF.append(lab, sel);
      return { wrapF, sel };
    };
    const fl = mk('Likelihood', LIK), fc = mk('Consequence', CON);
    fl.sel.addEventListener('change', () => { state.l = +fl.sel.value; render(); });
    fc.sel.addEventListener('change', () => { state.c = +fc.sel.value; render(); });
    fields.append(fl.wrapF, fc.wrapF);
    const score = el('div', 'cy-score');
    const big = el('b'); const badge = el('span', 'cy-badge');
    score.append(big, badge);
    const eq = el('p'); const resp = el('p'); const here = el('p');
    out.append(fields, score, eq, resp, here);
    right.append(out);

    wrap.append(left, right);
    host.append(wrap);

    const reg = el('div', 'cy-register');
    const tw = el('div', 'table-wrap');
    const t = el('table');
    const head = el('thead'); const hr = el('tr');
    ['Risk', 'Before', 'After', 'Main treatments'].forEach(h => hr.append(el('th', null, h)));
    head.append(hr); t.append(head);
    const body = el('tbody');
    const rows = {};
    const chip = pair => {
      const s = pair[0] * pair[1], r = rate(s);
      return el('span', 'cy-badge ' + r.cls, pair[0] + '×' + pair[1] + '=' + s + ' ' + r.name);
    };
    REGISTER.forEach(r => {
      const tr = el('tr');
      const c1 = el('td'); c1.append(el('b', null, r.id + ' '), document.createTextNode(r.name));
      const c2 = el('td'); c2.append(chip(r.before));
      const c3 = el('td'); c3.append(chip(r.after));
      tr.append(c1, c2, c3, el('td', null, r.fix));
      body.append(tr); rows[r.id] = tr;
    });
    t.append(body); tw.append(t); reg.append(tw);
    host.append(reg);

    function render() {
      const s = state.l * state.c, r = rate(s);
      bBefore.setAttribute('aria-pressed', String(state.mode === 'before'));
      bAfter.setAttribute('aria-pressed', String(state.mode === 'after'));
      fl.sel.value = state.l; fc.sel.value = state.c;
      const inCell = {};
      REGISTER.forEach(x => { const p = x[state.mode]; const k = p[0] + ',' + p[1]; (inCell[k] = inCell[k] || []).push(x); });
      Object.keys(cells).forEach(k => {
        const b = cells[k], lc = k.split(',').map(Number), l = lc[0], c = lc[1];
        const marks = b.querySelector('.cy-marks');
        marks.replaceChildren();
        (inCell[k] || []).forEach(x => marks.append(el('span', 'cy-mark', x.id)));
        b.setAttribute('aria-pressed', String(l === state.l && c === state.c));
        const names = (inCell[k] || []).map(x => x.id).join(', ');
        b.setAttribute('aria-label', 'Likelihood ' + l + ' ' + LIK[l - 1] + ', consequence ' + c + ' ' + CON[c - 1] + ': score ' + (l * c) + ', ' + rate(l * c).name + (names ? '. Contains ' + names : ''));
      });
      big.textContent = String(s);
      badge.className = 'cy-badge ' + r.cls; badge.textContent = r.name;
      eq.textContent = 'Likelihood ' + state.l + ' (' + LIK[state.l - 1] + ') × consequence ' + state.c + ' (' + CON[state.c - 1] + ') = ' + s + '.';
      resp.textContent = r.response;
      const list = inCell[state.l + ',' + state.c] || [];
      here.textContent = list.length ? 'In this cell (' + (state.mode === 'before' ? 'before' : 'after') + ' treatment): ' + list.map(x => x.id).join(', ') + '.' : 'No risk in the register sits in this cell.';
      REGISTER.forEach(x => { const p = x[state.mode]; rows[x.id].classList.toggle('is-active', p[0] === state.l && p[1] === state.c); });
    }
    bBefore.addEventListener('click', () => { state.mode = 'before'; render(); });
    bAfter.addEventListener('click', () => { state.mode = 'after'; render(); });
    render();
  }

  /* ---------- Passphrase strength estimator ---------- */
  const METHODS = [
    { id: 'words', label: 'Random words from a 7,776-word list', pool: 7776, unit: 'words', min: 2, max: 10, val: 4 },
    { id: 'lower', label: 'Random lowercase letters (26)', pool: 26, unit: 'characters', min: 4, max: 24, val: 10 },
    { id: 'alnum', label: 'Random letters and digits (62)', pool: 62, unit: 'characters', min: 4, max: 24, val: 10 },
    { id: 'all', label: 'Random keyboard characters (about 94)', pool: 94, unit: 'characters', min: 4, max: 24, val: 10 }
  ];
  const ATTACKS = [
    { id: 'online', label: 'Online guessing, throttled by the site (100 guesses a second)', rate: 1e2 },
    { id: 'slow', label: 'Stolen database, slow password hash (10 thousand a second)', rate: 1e4 },
    { id: 'fast', label: 'Stolen database, fast or unsalted hash (10 billion a second)', rate: 1e10 }
  ];

  function human(log10s) {
    if (log10s < 0) return 'less than a second';
    const s = Math.pow(10, log10s);
    if (s < 60) return Math.max(1, Math.round(s)) + ' seconds';
    if (s < 3600) return Math.round(s / 60) + ' minutes';
    if (s < 86400) return Math.round(s / 3600) + ' hours';
    if (s < 86400 * 365) return Math.round(s / 86400) + ' days';
    const ly = log10s - Math.log10(31557600);
    if (ly < 3) return Math.round(Math.pow(10, ly)).toLocaleString('en-AU') + ' years';
    if (ly < 6) return 'about ' + Math.round(Math.pow(10, ly) / 1e3).toLocaleString('en-AU') + ' thousand years';
    if (ly > 10.2) return 'far longer than the age of the universe';
    return 'about ' + Math.round(Math.pow(10, ly) / 1e6).toLocaleString('en-AU') + ' million years';
  }
  function sci(log10) {
    const e = Math.floor(log10), m = Math.pow(10, log10 - e);
    return m.toFixed(1) + ' × 10^' + e;
  }

  function buildPass(host) {
    host.replaceChildren();
    host.append(el('h4', null, 'Passphrase strength estimator'));
    host.append(el('p', 'cy-lead', 'Strength is about how many guesses an attacker needs. This model is only valid for secrets chosen truly at random, such as by dice or a password manager. Names, dates and clever substitutions are far weaker than the numbers here.'));
    const row = el('div', 'cy-pass');

    const rid = () => Math.random().toString(36).slice(2, 6);
    const idM = 'cy-m' + rid(), idL = 'cy-l' + rid(), idA = 'cy-a' + rid();
    const dM = el('div'); const lM = el('label', null, 'How is it made?'); lM.htmlFor = idM;
    const sM = el('select'); sM.id = idM;
    METHODS.forEach(m => { const o = el('option', null, m.label); o.value = m.id; sM.append(o); });
    dM.append(lM, sM);

    const dL = el('div'); const lL = el('label'); lL.htmlFor = idL;
    const out = el('output'); lL.append(document.createTextNode('Length: '), out);
    const rL = el('input'); rL.type = 'range'; rL.id = idL;
    dL.append(lL, rL);

    const dA = el('div'); const lA = el('label', null, 'What is the attacker doing?'); lA.htmlFor = idA;
    const sA = el('select'); sA.id = idA;
    ATTACKS.forEach(a => { const o = el('option', null, a.label); o.value = a.id; sA.append(o); });
    sA.value = 'slow';
    dA.append(lA, sA);
    row.append(dM, dL, dA);
    host.append(row);

    const label = el('div', 'cy-label');
    label.setAttribute('aria-live', 'polite');
    const meter = el('div', 'cy-meter'); const bar = el('span'); meter.append(bar);
    const facts = el('div', 'cy-facts');
    const mkF = t => { const f = el('div', 'cy-fact'); const b = el('b'); f.append(el('span', null, t), b); facts.append(f); return b; };
    const fBits = mkF('Entropy (bits)'), fGuess = mkF('Average guesses needed'), fTime = mkF('Average time to guess');
    host.append(label, meter, facts);
    host.append(el('p', 'cy-note', 'Average guesses = half of all possible combinations. Speeds are illustrative assumptions, not measurements of any real system. Try four words against the fast attack, then add words: each extra word multiplies the guesses by 7,776.'));

    function apply(resetLen) {
      const m = METHODS.find(x => x.id === sM.value), a = ATTACKS.find(x => x.id === sA.value);
      if (resetLen) { rL.min = m.min; rL.max = m.max; rL.value = m.val; }
      const n = +rL.value;
      out.textContent = n + ' ' + m.unit;
      const bits = n * Math.log2(m.pool);
      const logG = (bits - 1) * Math.log10(2);
      const logT = logG - Math.log10(a.rate);
      fBits.textContent = bits.toFixed(0);
      fGuess.textContent = sci(logG);
      fTime.textContent = human(logT);
      // Rated against the chosen attacker: seconds on a log10 scale (1 day = 4.9, 1 year = 7.5, 100 years = 9.5)
      const tier = logT < 4.94 ? ['Very weak', ''] : logT < 7.5 ? ['Weak', 'is-med'] : logT < 9.5 ? ['Reasonable', 'is-high'] : ['Strong', 'is-ext'];
      label.textContent = tier[0] + ' against this attacker';
      bar.className = tier[1];
      bar.style.width = Math.max(4, Math.min(100, logT / 14 * 100)) + '%';
    }
    sM.addEventListener('change', () => apply(true));
    rL.addEventListener('input', () => apply(false));
    sA.addEventListener('change', () => apply(false));
    apply(true);
  }

  function init() {
    document.querySelectorAll('[data-cy="risk"]').forEach(buildRisk);
    document.querySelectorAll('[data-cy="pass"]').forEach(buildPass);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
