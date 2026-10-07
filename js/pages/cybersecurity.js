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

  /* ---------- Phishing spotter: email, text message and social message ---------- */
  // Each message is a list of lines; a line is a list of pieces. A piece is a string, or an object
  // { t: text, flag: true|false, why: reason } that the student can click. `flag: false` pieces look
  // official or ordinary: clicking one is a false alarm, because it is not a warning sign on its own.
  const PHISH = [
    {
      id: 'email', label: 'Email', kind: 'email',
      intro: 'Priya works in accounts at Riverina Fresh Logistics. This email arrives at 8:40 am.',
      lines: [
        { head: 'From', pieces: [{ t: 'Marcus Webb', flag: false, why: 'The display name is the real manager\'s name, but anyone can type any display name. It is not a warning sign by itself, and it does not prove the message is genuine.' }, ' <', { t: 'm.webb@riverinafresh-logistics.co', flag: true, why: 'Lookalike domain. The company\'s real address ends in riverinafresh.com.au; this one adds a hyphen and ends in .co. Always read the part after the @ sign.' }, '>'] },
        { head: 'To', pieces: ['Priya Nair'] },
        { head: 'Subject', pieces: [{ t: 'URGENT: change of bank details, pay today', flag: true, why: 'Urgency and a payment request are the classic business email compromise (BEC) combination. Pressure is meant to stop you checking.' }] },
        { pieces: ['Hi Priya,'] },
        { pieces: ['I\'m in meetings all day, ', { t: 'so I can\'t take calls', flag: true, why: 'The sender has removed your easiest way to verify the request by phone. A genuine manager can be called back on a known number.' }, '. Our supplier Delta Cold Storage has changed banks. ', { t: 'Please update their details and pay invoice 4471 ($18,450) before 3 pm today', flag: true, why: 'A request to change bank details and pay straight away is high-risk. Process: confirm the change by calling the supplier on a number you already hold, with a second person approving.' }, '.'] },
        { pieces: [{ t: 'Keep this between us for now, it is linked to a confidential acquisition.', flag: true, why: 'Secrecy isolates the victim so nobody else can spot the scam. Real finance processes do not depend on secrecy.' }] },
        { pieces: ['New details: ', { t: 'riverinafresh-docs.example-login.co/bank-form', flag: true, why: 'The link goes to a different website from the company\'s own. Hover over (or long-press) a link to see where it really goes before you open it.' }] },
        { pieces: ['Thanks,'] },
        { pieces: [{ t: 'Marcus Webb, Operations Manager, Riverina Fresh Logistics, 14 Depot Road, Wagga Wagga', flag: false, why: 'A correct name, position and address are easy to copy from the website or LinkedIn. A polished signature does not make a message safe, but it is not a red flag on its own.' }] }
      ],
      action: 'Do not pay or click. Phone Marcus on his known number, report the email to IT using the report button, and tell the finance team so nobody else acts on it.'
    },
    {
      id: 'sms', label: 'Text message (smishing)', kind: 'sms',
      intro: 'A text arrives on a phone, in a new thread. The toll operator named is fictional.',
      lines: [
        { head: 'From', pieces: [{ t: '+61 4## ### 221', flag: true, why: 'A random mobile number, not a named sender or an official short code. Messages that claim to be from an organisation but come from an ordinary mobile number deserve suspicion.' }] },
        { pieces: ['Eastern Link Tolls: ', { t: 'Your account has an unpaid balance of $8.40', flag: false, why: 'A small, believable amount is a common lure, but the amount by itself proves nothing. The warning signs are the pressure and the link, not the number.' }, '. ', { t: 'Pay within 24 hours to avoid a $150 late fee and licence suspension.', flag: true, why: 'A threat plus a deadline is pressure designed to make you act before you think. Real operators send formal notices and let you log in through their own app or website.' }] },
        { pieces: [{ t: 'easternlink-tolls.help/pay', flag: true, why: 'The domain ends in .help and is not the operator\'s official website. Scam links often copy a brand name inside an unrelated domain. Go to the operator\'s website by typing the address yourself.' }] },
        { pieces: ['Reply STOP to opt out.'] }
      ],
      action: 'Do not tap the link or reply. Check your toll account by typing the operator\'s real address or opening its own app, report the text to Scamwatch and your phone provider, then delete it.'
    },
    {
      id: 'dm', label: 'Social message', kind: 'dm',
      intro: 'A friend, Jess, messages you on a social app late at night. She has never sent you a link like this before.',
      lines: [
        { head: 'Jess K.', pieces: [{ t: '(profile photo and name match your friend)', flag: false, why: 'A hijacked account looks exactly like the real person, because it is the real account under someone else\'s control. The name and photo are not evidence of who is typing.' }] },
        { pieces: [{ t: 'OMG is this you in this video?? 😂', flag: true, why: 'A vague, emotional hook with no detail. Account-takeover scammers send the same bait to every contact to make you curious or embarrassed enough to click.' }] },
        { pieces: [{ t: 'bit.ly/3xYz-vid', flag: true, why: 'A shortened link hides its destination, so you cannot judge it before opening. Ask the friend what it is, using another channel, or do not open it.' }] },
        { pieces: ['It asks you to log in again to watch ', { t: '(the page asks for your social media password)', flag: true, why: 'A page asking you to log in again from a link is a fake login page. Genuine apps do not ask you to sign in to view a friend\'s video. Entering your password hands the account to the scammer.' }] },
        { pieces: [{ t: 'Sent 11:52 pm', flag: false, why: 'The time of day is not a warning sign on its own. People message at night.' }] }
      ],
      action: 'Do not open the link or enter a password. Message Jess another way (a phone call is best) to say her account may be hijacked, and report the message to the app.'
    }
  ];

  function buildPhish(host) {
    host.replaceChildren();
    host.classList.add('lab', 'cy-phish');
    host.append(el('p', 'lab-kicker', 'Try it'));
    host.append(el('h4', 'lab-title', 'Phishing spotter'));
    host.append(el('p', 'lab-lead', 'Choose a message and click every part that is a warning sign. Then check your answers. Some parts only look suspicious, or only look official, so clicking everything will cost you points.'));

    const tabs = el('div', 'lab-seg');
    tabs.setAttribute('role', 'group');
    tabs.setAttribute('aria-label', 'Message to inspect');
    const stage = el('div', 'lab-stack');
    const score = el('div', 'lab-feedback is-info');
    score.hidden = true;
    score.setAttribute('role', 'status');
    const actions = el('div', 'lab-actions');
    const bCheck = el('button', 'lab-btn lab-btn--primary', 'Check my answers');
    const bReset = el('button', 'lab-btn', 'Clear my clicks');
    bCheck.type = bReset.type = 'button';
    actions.append(bCheck, bReset);
    const why = el('div', 'cy-why');
    host.append(tabs, stage, actions, score, why);

    let current = 0, checked = false, spots = [];
    const tabBtns = PHISH.map((m, i) => {
      const b = el('button', null, m.label);
      b.type = 'button';
      b.addEventListener('click', () => show(i));
      tabs.append(b);
      return b;
    });

    function show(i) {
      current = i; checked = false;
      tabBtns.forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)));
      const m = PHISH[i];
      stage.replaceChildren();
      score.hidden = true;
      bCheck.disabled = false;
      stage.append(el('p', 'lab-note', m.intro));
      const box = el('div', 'cy-msg cy-msg--' + m.kind);
      box.setAttribute('role', 'group');
      box.setAttribute('aria-label', m.label + ' to inspect');
      spots = [];
      m.lines.forEach(line => {
        const row = el('p', 'cy-msg-line' + (line.head ? ' has-head' : ''));
        if (line.head) row.append(el('span', 'cy-msg-head', line.head + ':'), document.createTextNode(' '));
        line.pieces.forEach(pc => {
          if (typeof pc === 'string') { row.append(document.createTextNode(pc)); return; }
          const b = el('button', 'cy-spot', pc.t);
          b.type = 'button';
          b.setAttribute('aria-pressed', 'false');
          b.addEventListener('click', () => {
            if (checked) return;
            b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
          });
          spots.push({ b, pc });
          row.append(b);
        });
        box.append(row);
      });
      stage.append(box);
      why.replaceChildren();
    }

    function check() {
      checked = true;
      let found = 0, missed = 0, wrong = 0, total = 0;
      const good = [], bad = [];
      spots.forEach(({ b, pc }) => {
        const on = b.getAttribute('aria-pressed') === 'true';
        b.classList.remove('is-hit', 'is-miss', 'is-wrong');
        if (pc.flag) {
          total++;
          if (on) { found++; b.classList.add('is-hit'); } else { missed++; b.classList.add('is-miss'); }
        } else if (on) { wrong++; b.classList.add('is-wrong'); }
        const verdict = pc.flag ? (on ? 'Red flag, found' : 'Red flag, missed') : (on ? 'False alarm' : 'Not a warning sign');
        b.setAttribute('aria-label', pc.t + '. ' + verdict);
        (pc.flag ? good : bad).push({ pc, on });
      });
      why.replaceChildren(el('h5', null, 'What each part tells you'));
      const ul = el('ul', 'lab-list');
      spots.forEach(({ pc, b }) => {
        const on = b.getAttribute('aria-pressed') === 'true';
        const li = el('li');
        const tag = pc.flag ? (on ? 'Found' : 'Missed') : (on ? 'False alarm' : 'Fine on its own');
        li.append(el('span', 'lab-badge ' + (pc.flag ? (on ? 'is-good' : 'is-bad') : (on ? 'is-warn' : 'is-info')), tag), document.createTextNode(' '));
        li.append(el('strong', null, '“' + pc.t + '”: '), document.createTextNode(pc.why));
        ul.append(li);
      });
      why.append(ul);
      why.append(el('p', 'lab-readout', 'What to do: ' + PHISH[current].action));
      score.hidden = false;
      score.className = 'lab-feedback ' + (missed === 0 && wrong === 0 ? 'is-good' : 'is-warn');
      score.textContent = 'You found ' + found + ' of ' + total + ' red flags' + (wrong ? ' and raised ' + wrong + ' false alarm' + (wrong > 1 ? 's' : '') : '') + '.' + (missed === 0 && wrong === 0 ? ' Spot on.' : ' Read the reasons below, then try another message.');
      bCheck.disabled = true;
    }

    bCheck.addEventListener('click', check);
    bReset.addEventListener('click', () => show(current));
    show(0);
  }

  /* ---------- Contain the breach: flat against segmented network ---------- */
  const NET_ZONES = [
    { id: 'dmz', name: 'DMZ', note: 'Public-facing servers' },
    { id: 'lan', name: 'Corporate LAN', note: 'Staff devices and files' },
    { id: 'guest', name: 'Guest Wi-Fi', note: 'Visitors\' devices' },
    { id: 'air', name: 'Air gap', note: 'No network link at all' }
  ];
  const NET_DEVICES = [
    { id: 'web', name: 'Public web server', zone: 'dmz' },
    { id: 'switch', name: 'Switch', zone: 'lan' },
    { id: 'pc1', name: 'Staff computer 1', zone: 'lan' },
    { id: 'pc2', name: 'Staff computer 2', zone: 'lan' },
    { id: 'files', name: 'File server', zone: 'lan' },
    { id: 'ap', name: 'Access point', zone: 'guest' },
    { id: 'phone', name: 'Guest smartphone', zone: 'guest' },
    { id: 'backup', name: 'Offline backup', zone: 'air' }
  ];
  // Segmented firewall rules: which zones may open connections to which others
  const NET_RULES = { lan: { dmz: 'the firewall allows staff to manage the web server' } };

  function buildSegment(host) {
    host.replaceChildren();
    host.classList.add('lab', 'cy-seg');
    host.append(el('p', 'lab-kicker', 'Try it'));
    host.append(el('h4', 'lab-title', 'Contain the breach'));
    host.append(el('p', 'lab-lead', 'Click a device to take it over as an attacker, then see which other devices it can reach. Switch between a flat network and a segmented one that uses firewall rules.'));

    const design = el('div', 'lab-seg');
    design.setAttribute('role', 'group');
    design.setAttribute('aria-label', 'Network design');
    const bFlat = el('button', null, 'Flat network (no zones)');
    const bSeg = el('button', null, 'Segmented network (firewall rules)');
    bFlat.type = bSeg.type = 'button';
    design.append(bFlat, bSeg);
    const designRow = el('div', 'lab-row');
    designRow.append(design);
    host.append(designRow);

    const map = el('div', 'cy-seg-map');
    const net = el('div', 'cy-seg-net');
    net.append(el('div', 'cy-seg-net-top', 'Internet'), el('div', 'cy-seg-fw', 'Firewall'));
    const zoneBox = {};
    NET_ZONES.forEach(z => {
      const box = el('div', 'cy-zone cy-zone--' + z.id);
      box.append(el('h5', null, z.name), el('p', 'cy-zone-note', z.note));
      zoneBox[z.id] = box;
      map.append(box);
    });
    const btn = {};
    NET_DEVICES.forEach(d => {
      const b = el('button', 'cy-dev', d.name);
      b.type = 'button';
      b.addEventListener('click', () => { attacker = d.id; update(); });
      btn[d.id] = b;
      zoneBox[d.zone].append(b);
    });
    host.append(net, map);

    const out = el('div', 'lab-readout');
    out.setAttribute('role', 'status');
    const meter = el('div', 'lab-meter'); const bar = el('span'); meter.append(bar);
    const list = el('ul', 'lab-list');
    host.append(out, meter, list);
    host.append(el('p', 'lab-note', 'Simplified: real networks have more zones and rules, and an attacker can also steal a password or exploit a flaw to get through a rule that is meant to be closed. Segmentation limits the blast radius, it does not make a breach impossible.'));

    let segmented = false, attacker = 'phone';
    const zoneName = id => NET_ZONES.find(z => z.id === id).name;

    function reach(from, to) {
      if (from.id === to.id) return null;
      if (to.zone === 'air' || from.zone === 'air') return { ok: false, why: 'no network link (air gap)' };
      if (!segmented) return { ok: true, why: 'same flat network' };
      if (from.zone === to.zone) return { ok: true, why: 'same zone' };
      const rule = NET_RULES[from.zone] && NET_RULES[from.zone][to.zone];
      if (rule) return { ok: true, why: rule };
      return { ok: false, why: 'blocked by the firewall between ' + zoneName(from.zone) + ' and ' + zoneName(to.zone) };
    }

    function update() {
      bFlat.setAttribute('aria-pressed', String(!segmented));
      bSeg.setAttribute('aria-pressed', String(segmented));
      host.classList.toggle('is-segmented', segmented);
      const from = NET_DEVICES.find(d => d.id === attacker);
      list.replaceChildren();
      let exposed = 0;
      NET_DEVICES.forEach(d => {
        const b = btn[d.id];
        b.classList.remove('is-attacker', 'is-reached', 'is-safe', 'is-gap');
        b.setAttribute('aria-pressed', String(d.id === attacker));
        const r = reach(from, d);
        if (!r) { b.classList.add('is-attacker'); return; }
        if (r.ok) { exposed++; b.classList.add('is-reached'); } else b.classList.add(d.zone === 'air' ? 'is-gap' : 'is-safe');
        const li = el('li');
        li.append(el('span', 'lab-badge ' + (r.ok ? 'is-bad' : 'is-good'), r.ok ? 'Reachable' : 'Safe'), document.createTextNode(' '), el('strong', null, d.name + ': '), document.createTextNode(r.why));
        list.append(li);
      });
      const others = NET_DEVICES.length - 1;
      out.replaceChildren();
      out.append(el('p', null, 'The attacker has taken over the ' + from.name.toLowerCase() + '.'));
      out.append(el('p', null, exposed + ' of the other ' + others + ' devices can be reached from it' + (exposed <= 2 ? '. The firewall has contained the breach.' : segmented ? '.' : '. Nothing stands between the zones, so one weak device exposes almost everything.')));
      bar.style.width = Math.round(exposed / others * 100) + '%';
      bar.className = exposed <= 2 ? 'is-good' : exposed <= 4 ? 'is-warn' : 'is-bad';
    }
    bFlat.addEventListener('click', () => { segmented = false; update(); });
    bSeg.addEventListener('click', () => { segmented = true; update(); });
    update();
  }

  /* ---------- CIA triad sorter ---------- */
  const CIA = [
    { text: 'An attacker changes the marks stored in a school\'s results database.', ans: 'I', why: 'Data was altered without authorisation, so it is no longer accurate. Nothing was disclosed and the system still works, which is why integrity breaches can go unnoticed.', privacy: 'Personal information is involved, so students could be harmed by wrong results.' },
    { text: 'Ransomware locks the files on a bakery\'s till system, so it cannot take orders.', ans: 'A', why: 'The data still exists but nobody authorised can use it. Many ransomware groups also steal a copy first, which would add a confidentiality breach.', privacy: 'If customer details were copied before encryption, privacy is affected too.' },
    { text: 'A staff member emails a spreadsheet of customer addresses to the wrong person.', ans: 'C', why: 'Information reached someone who was not authorised to see it. That is disclosure, the failure confidentiality protects against.', privacy: 'Privacy is affected: customer addresses are personal information, and this may be an eligible data breach to assess under the Notifiable Data Breaches scheme.' },
    { text: 'A flood of traffic makes a ticketing website unusable on the day tickets go on sale.', ans: 'A', why: 'A denial-of-service attack does not steal or change anything. It stops authorised users from reaching the service.', privacy: 'No personal information is exposed, so privacy is not directly affected.' },
    { text: 'A criminal edits the bank account number on a supplier\'s invoice before it is paid.', ans: 'I', why: 'The invoice looks normal but its content has been changed, so the payment goes to the wrong account.', privacy: 'The harm is financial. Privacy is affected only if personal details were also exposed.' },
    { text: 'A laptop holding unencrypted patient records is left on a train.', ans: 'C', why: 'Anyone who finds the laptop could read the records. Encryption would have kept the data confidential even though the device was lost.', privacy: 'Health information is sensitive personal information, so there is a serious privacy implication.' },
    { text: 'A power failure takes a hospital\'s booking server offline for a day.', ans: 'A', why: 'No attacker is needed to breach availability. Systems and data must be usable when needed, which is why backup power and failover matter.', privacy: 'Privacy is not directly affected, though delays can still harm patients.' }
  ];

  function buildCia(host) {
    Labs.sorter(host, {
      cls: 'cy-cia',
      title: 'Which attribute failed?',
      lead: 'Read each incident and choose the attribute of information security that failed first. Then read why, and what it means for privacy.',
      noun: 'incident',
      groupLabel: 'Attribute that failed',
      extraLabel: 'Privacy',
      choices: [{ key: 'C', label: 'Confidentiality' }, { key: 'I', label: 'Integrity' }, { key: 'A', label: 'Availability' }],
      items: CIA.map(q => ({ text: q.text, ans: q.ans, why: q.why, extra: q.privacy })),
      closing: 'Remember that one incident can break more than one attribute. When a breach is mixed, name the one that failed first and mention the others.'
    });
  }

  /* ---------- Caesar cipher workshop ---------- */
  const COMMON = 'THE AND FOR ARE BUT NOT YOU ALL CAN HAD HER WAS ONE OUR OUT DAY GET HAS HIM HIS HOW MAN NEW NOW OLD SEE TWO WAY WHO BOY DID ITS LET PUT SAY SHE TOO USE MEET AT IN ON IS IT TO OF A I WE MY BE BY DO GO HE ME NO OR SO UP US AN AS AM IF HERE LUNCH CANTEEN TODAY AFTER SCHOOL PASSWORD SECRET MESSAGE'.split(' ');
  function caesar(text, shift) {
    return text.replace(/[a-z]/gi, c => {
      const base = c <= 'Z' ? 65 : 97;
      return String.fromCharCode((c.charCodeAt(0) - base + shift + 26 * 10) % 26 + base);
    });
  }
  function englishScore(text) {
    return text.toUpperCase().split(/[^A-Z]+/).filter(w => COMMON.includes(w)).length;
  }

  function buildCipher(host) {
    host.replaceChildren();
    host.classList.add('lab', 'cy-cipher');
    host.append(el('p', 'lab-kicker', 'Try it'));
    host.append(el('h4', 'lab-title', 'Caesar cipher: algorithm, key and cipher text'));
    host.append(el('p', 'lab-lead', 'A Caesar cipher shifts every letter along the alphabet. The shifting rule is the algorithm and the number of places is the key. Use it to see plain text become cipher text, then see why a tiny key space is weak.'));

    const row = el('div', 'lab-row');
    const fText = el('div', 'lab-field'); const lText = el('label', null, 'Message'); lText.htmlFor = 'cy-cc-text';
    const iText = el('input'); iText.type = 'text'; iText.id = 'cy-cc-text'; iText.value = 'Meet at the canteen after school'; iText.maxLength = 60;
    fText.append(lText, iText);
    const fKey = el('div', 'lab-field'); const lKey = el('label'); lKey.htmlFor = 'cy-cc-key';
    const oKey = el('output'); lKey.append(document.createTextNode('Key (shift): '), oKey);
    const iKey = el('input'); iKey.type = 'range'; iKey.id = 'cy-cc-key'; iKey.min = 1; iKey.max = 25; iKey.value = 3;
    fKey.append(lKey, iKey);
    row.append(fText, fKey);
    host.append(row);

    const out = el('div', 'lab-panel');
    const plainLine = el('p'); const cipherLine = el('p', 'cy-cc-cipher');
    out.append(plainLine, cipherLine);
    const strip = el('div', 'cy-cc-strip');
    strip.setAttribute('role', 'img');
    host.append(out, strip);

    const crack = el('details', 'cy-cc-crack');
    const sum = el('summary', null, 'Now be the eavesdropper: try every key');
    const wrap = el('div', 'lab-table-wrap');
    const tbl = el('table', 'lab-table');
    const hr = el('tr'); hr.append(el('th', 'num', 'Key'), el('th', null, 'Cipher text decrypted with this key'));
    const th = el('thead'); th.append(hr); tbl.append(th);
    const tb = el('tbody'); tbl.append(tb); wrap.append(tbl);
    const verdict = el('p', 'lab-readout');
    crack.append(sum, el('p', 'lab-note', 'The eavesdropper only sees the cipher text. With just 25 possible keys they try each one and look for the line that reads as English.'), wrap, verdict);
    host.append(crack);
    host.append(el('p', 'lab-note', 'Real encryption such as AES-128 has about 3.4 × 10^38 possible keys, which is why it cannot be cracked by trying them all. Strong algorithms are public: the security rests on keeping the key secret and long enough.'));

    function update() {
      const k = +iKey.value;
      oKey.textContent = k;
      const plain = iText.value;
      const cipher = caesar(plain, k);
      plainLine.replaceChildren(el('strong', null, 'Plain text: '), document.createTextNode(plain || '(type a message)'));
      cipherLine.replaceChildren(el('strong', null, 'Cipher text: '), document.createTextNode(cipher || ''));
      strip.replaceChildren();
      const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      for (let j = 0; j < 26; j++) {
        const cell = el('div', 'cy-cc-cell');
        cell.append(el('span', null, A[j]), el('b', null, A[(j + k) % 26]));
        strip.append(cell);
      }
      strip.setAttribute('aria-label', 'Letter mapping: each plain letter on top becomes the letter beneath it. For example A becomes ' + A[k % 26] + '.');
      tb.replaceChildren();
      let best = 0, bestScore = -1;
      const rows = [];
      for (let g = 1; g <= 25; g++) {
        const guess = caesar(cipher, -g);
        const sc = englishScore(guess);
        if (sc > bestScore) { bestScore = sc; best = g; }
        rows.push([g, guess]);
      }
      rows.forEach(([g, guess]) => {
        const tr = el('tr', bestScore > 0 && g === best ? 'is-hit' : '');
        tr.append(el('td', 'num', String(g)), el('td', 'lab-mono', guess));
        tb.append(tr);
      });
      verdict.textContent = bestScore > 0 ? 'Key ' + best + ' gives the only line that reads as English, so the message is read in seconds. The attacker never needed to know the key in advance.' : 'Type a longer message of ordinary English words to see the attack highlight the right key.';
    }
    iText.addEventListener('input', update);
    iKey.addEventListener('input', update);
    update();
  }

  function init() {
    document.querySelectorAll('[data-cy="risk"]').forEach(buildRisk);
    document.querySelectorAll('[data-cy="pass"]').forEach(buildPass);
    document.querySelectorAll('[data-cy="phish"]').forEach(buildPhish);
    document.querySelectorAll('[data-cy="segment"]').forEach(buildSegment);
    document.querySelectorAll('[data-cy="cia"]').forEach(buildCia);
    document.querySelectorAll('[data-cy="cipher"]').forEach(buildCipher);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
