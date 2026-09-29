/* Intelligent Systems: interactive widgets.
   1. Expert-system demo: a small plant-care rule base with forward chaining, backward chaining, a firing trace and an explanation.
   2. Certainty-factor calculator: two rules supporting one conclusion.
   Vanilla JS; each widget host holds a static fallback message if this file does not run. */
(() => {
  'use strict';

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  let uid = 0;
  const nextId = p => `${p}-${++uid}`;

  /* ---------- Knowledge for the plant-care advisor ---------- */
  const FACTS = [
    ['leaves_yellow', 'Leaves are yellow'],
    ['soil_wet', 'Soil is wet'],
    ['soil_dry', 'Soil is dry'],
    ['leaves_drooping', 'Leaves are drooping'],
    ['brown_edges', 'Leaf edges are brown'],
    ['full_sun', 'Plant is in full sun'],
    ['no_drainage', 'Pot has no drainage holes']
  ];
  const CONCLUSIONS = [
    ['overwatered', 'Plant is overwatered'],
    ['underwatered', 'Plant is underwatered'],
    ['sun_stress', 'Plant is stressed by the sun'],
    ['root_rot_risk', 'Roots are at risk of rot'],
    ['reduce_watering', 'ADVICE: reduce watering'],
    ['water_now', 'ADVICE: water now'],
    ['move_to_shade', 'ADVICE: move to shade'],
    ['repot_with_drainage', 'ADVICE: repot into a pot with drainage']
  ];
  const BASE_RULES = [
    { conds: ['leaves_yellow', 'soil_wet'], then: 'overwatered' },
    { conds: ['leaves_drooping', 'soil_dry'], then: 'underwatered' },
    { conds: ['brown_edges', 'full_sun'], then: 'sun_stress' },
    { conds: ['overwatered', 'no_drainage'], then: 'root_rot_risk' },
    { conds: ['overwatered'], then: 'reduce_watering' },
    { conds: ['underwatered'], then: 'water_now' },
    { conds: ['root_rot_risk'], then: 'repot_with_drainage' },
    { conds: ['sun_stress'], then: 'move_to_shade' }
  ];
  const PRESETS = [
    { name: 'Waterlogged pot', facts: ['leaves_yellow', 'soil_wet', 'no_drainage'], goal: 'repot_with_drainage' },
    { name: 'Thirsty plant', facts: ['leaves_drooping', 'soil_dry'], goal: 'water_now' },
    { name: 'Sunburnt fern', facts: ['brown_edges', 'full_sun'], goal: 'move_to_shade' }
  ];

  function buildExpert(host) {
    const labels = new Map([...FACTS, ...CONCLUSIONS]);
    const isFact = new Set(FACTS.map(f => f[0]));
    const isAdvice = t => (labels.get(t) || '').startsWith('ADVICE') || t.startsWith('advice_');
    const state = {
      facts: new Set(['leaves_yellow', 'soil_wet', 'no_drainage']),
      mode: 'forward',
      goal: 'repot_with_drainage',
      rules: BASE_RULES.map((r, i) => ({ id: 'R' + (i + 1), conds: r.conds.slice(), then: r.then, on: true, custom: false })),
      ruleState: {},
      hasRun: false
    };
    const say = t => labels.get(t) || t.replace(/_/g, ' ');

    host.replaceChildren();
    host.append(el('h4', null, 'Expert system demo: a plant-care advisor'));
    host.append(el('p', 'isx-lead', 'Tick the observations you have made, choose forward or backward chaining, then run the inference engine. The trace shows every rule that is tried or fired, and the explanation shows how each conclusion was reached. Switch a rule off, or add your own, and run it again.'));

    const grid = el('div', 'isx-grid');
    const left = el('div'), right = el('div');
    grid.append(left, right);
    host.append(grid);

    /* facts */
    const factSet = el('fieldset', 'isx-box isx-facts');
    factSet.append(el('legend', null, 'Facts: what you have observed'));
    const factBoxes = {};
    FACTS.forEach(([id, label]) => {
      const lab = el('label');
      const cb = el('input');
      cb.type = 'checkbox'; cb.checked = state.facts.has(id);
      cb.addEventListener('change', () => { cb.checked ? state.facts.add(id) : state.facts.delete(id); invalidate(); });
      factBoxes[id] = cb;
      lab.append(cb, el('span', null, label + ' (' + id + ')'));
      factSet.append(lab);
    });
    left.append(factSet);

    /* examples */
    const presets = el('div', 'isx-presets');
    presets.append(el('span', 'isx-legend', 'Examples:'));
    PRESETS.forEach(p => {
      const b = el('button', 'isx-btn', p.name); b.type = 'button';
      b.addEventListener('click', () => {
        state.facts = new Set(p.facts); state.goal = p.goal;
        FACTS.forEach(([id]) => { factBoxes[id].checked = state.facts.has(id); });
        goalSel.value = p.goal; invalidate(); run();
      });
      presets.append(b);
    });
    left.append(presets);

    /* mode */
    const modeBox = el('fieldset', 'isx-box');
    modeBox.append(el('legend', null, 'Inference method'));
    const tg = el('div', 'isx-toggle'); tg.setAttribute('role', 'group'); tg.setAttribute('aria-label', 'Inference method');
    const bF = el('button', null, 'Forward chaining'), bB = el('button', null, 'Backward chaining');
    [bF, bB].forEach(b => { b.type = 'button'; });
    tg.append(bF, bB);
    modeBox.append(tg);
    const goalWrap = el('label', 'isx-field');
    goalWrap.append(el('span', null, 'Goal to prove (backward chaining)'));
    const goalSel = el('select');
    goalWrap.append(goalSel);
    modeBox.append(goalWrap);
    const goalHelp = el('p', 'isx-note', 'Forward chaining starts from the facts and fires rules until nothing new can be added. Backward chaining starts from a goal and works out which facts it needs.');
    modeBox.append(goalHelp);
    const runRow = el('div', 'isx-row');
    const bRun = el('button', 'isx-btn isx-primary', 'Run the inference engine'); bRun.type = 'button';
    const bReset = el('button', 'isx-btn', 'Reset rules'); bReset.type = 'button';
    runRow.append(bRun, bReset);
    modeBox.append(runRow);
    left.append(modeBox);

    /* rule base */
    const ruleBox = el('div', 'isx-box');
    ruleBox.append(el('h5', null, 'Knowledge base: IF–THEN rules'));
    const ruleList = el('ul', 'isx-rules');
    ruleBox.append(ruleList);
    const add = el('details', 'isx-add');
    add.append(el('summary', null, 'Add a rule of your own'));
    const addRow = el('div', 'isx-row');
    const mkSel = (labelText) => { const w = el('label', 'isx-field'); w.append(el('span', null, labelText)); const s = el('select'); w.append(s); return [w, s]; };
    const [w1, sel1] = mkSel('IF this is true'); const [w2, sel2] = mkSel('AND this is true (optional)');
    const w3 = el('label', 'isx-field'); w3.append(el('span', null, 'THEN conclude (a new word or phrase)'));
    const inThen = el('input'); inThen.type = 'text'; inThen.maxLength = 30; inThen.placeholder = 'for example: add_fertiliser';
    w3.append(inThen);
    const bAdd = el('button', 'isx-btn', 'Add rule'); bAdd.type = 'button';
    add.append(w1, w2, w3, bAdd);
    const addMsg = el('p', 'isx-msg'); addMsg.setAttribute('role', 'status');
    add.append(addMsg);
    ruleBox.append(add);
    right.append(ruleBox);

    /* output */
    const out = el('div', 'isx-out');
    out.setAttribute('aria-live', 'polite');
    host.append(out);

    /* helpers */
    function terms() {
      const set = new Set(FACTS.map(f => f[0]));
      CONCLUSIONS.forEach(c => set.add(c[0]));
      state.rules.forEach(r => set.add(r.then));
      return [...set];
    }
    function refreshSelects() {
      const list = terms();
      [[sel1, false], [sel2, true]].forEach(([s, optional]) => {
        const cur = s.value;
        s.replaceChildren();
        if (optional) { const o = el('option', null, '(none)'); o.value = ''; s.append(o); }
        list.forEach(t => { const o = el('option', null, say(t) + ' (' + t + ')'); o.value = t; s.append(o); });
        if ([...s.options].some(o => o.value === cur)) s.value = cur;
      });
      const g = goalSel.value || state.goal;
      goalSel.replaceChildren();
      const concl = [...new Set(state.rules.map(r => r.then))];
      concl.forEach(t => { const o = el('option', null, say(t) + ' (' + t + ')'); o.value = t; goalSel.append(o); });
      goalSel.value = concl.includes(g) ? g : concl[0];
      state.goal = goalSel.value;
    }
    function ruleText(r) {
      const f = el('span');
      f.append(el('span', 'isx-kw', 'IF '));
      r.conds.forEach((c, i) => { if (i) f.append(el('span', 'isx-kw', ' AND ')); f.append(el('code', null, c)); });
      f.append(el('span', 'isx-kw', ' THEN '));
      f.append(el('code', null, r.then));
      return f;
    }
    function renderRules() {
      ruleList.replaceChildren();
      state.rules.forEach(r => {
        const li = el('li', 'isx-rule' + (r.on ? '' : ' isx-off') + (state.ruleState[r.id] === 'fired' ? ' isx-fired' : state.ruleState[r.id] === 'tried' ? ' isx-tried' : ''));
        const cb = el('input'); cb.type = 'checkbox'; cb.checked = r.on;
        const id = nextId('isx-r'); cb.id = id;
        cb.setAttribute('aria-label', 'Rule ' + r.id + ' switched on');
        cb.addEventListener('change', () => { r.on = cb.checked; invalidate(); });
        const txt = el('label', 'isx-rtext'); txt.htmlFor = id;
        txt.append(el('span', 'isx-rid', r.id), ruleText(r));
        li.append(cb, txt);
        const st = state.ruleState[r.id];
        if (st === 'fired') li.append(el('span', 'isx-badge isx-b-fired', 'used'));
        else if (st === 'tried') li.append(el('span', 'isx-badge isx-b-tried', 'tried, failed'));
        if (r.custom) {
          const x = el('button', 'isx-x', 'Remove'); x.type = 'button';
          x.setAttribute('aria-label', 'Remove rule ' + r.id);
          x.addEventListener('click', () => { state.rules = state.rules.filter(q => q !== r); invalidate(); refreshSelects(); });
          li.append(x);
        }
        ruleList.append(li);
      });
    }
    function invalidate() {
      state.ruleState = {};
      state.hasRun = false;
      renderRules();
      out.replaceChildren();
      const p = el('p', 'isx-note', 'Something changed. Press "Run the inference engine" to see the new trace.');
      out.append(p);
    }
    function setMode(m) {
      state.mode = m;
      bF.setAttribute('aria-pressed', String(m === 'forward'));
      bB.setAttribute('aria-pressed', String(m === 'backward'));
      goalWrap.style.display = m === 'backward' ? '' : 'none';
      if (state.hasRun) invalidate();
    }

    /* ---------- forward chaining ---------- */
    function forward() {
      const memory = new Set(state.facts);
      const fired = new Set();
      const steps = [];
      const derived = new Map();
      for (let cycle = 1; cycle <= 50; cycle++) {
        const eligible = state.rules.filter(r => r.on && !fired.has(r.id) && !memory.has(r.then) && r.conds.every(c => memory.has(c)));
        if (!eligible.length) { steps.push({ cycle, stop: true, memory: [...memory] }); break; }
        const pick = eligible[0];
        fired.add(pick.id); memory.add(pick.then); derived.set(pick.then, pick);
        state.ruleState[pick.id] = 'fired';
        steps.push({ cycle, eligible: eligible.map(r => r.id), rule: pick, added: pick.then, memory: [...memory] });
      }
      return { steps, memory, derived };
    }
    function renderForward(res) {
      out.replaceChildren();
      const newFacts = [...res.memory].filter(t => !state.facts.has(t));
      const box = el('div', 'isx-summary' + (newFacts.length ? ' isx-ok' : ' isx-fail'));
      if (!state.facts.size) box.append(el('p', null, 'No facts are ticked, so no rule can fire. Tick at least one observation.'));
      else if (!newFacts.length) box.append(el('p', null, 'No rule could fire with these facts, so the system reaches no conclusion. It has no advice for this case.'));
      else {
        box.append(el('p', null, `Forward chaining fired ${res.steps.length - 1} rule${res.steps.length - 1 === 1 ? '' : 's'} and added ${newFacts.length} new fact${newFacts.length === 1 ? '' : 's'}.`));
        const chips = el('div', 'isx-chips');
        newFacts.forEach(t => chips.append(el('span', 'isx-chip' + (isAdvice(t) ? ' isx-advice' : ''), t)));
        box.append(chips);
        const adv = newFacts.filter(isAdvice);
        box.append(el('p', null, adv.length ? 'Advice: ' + adv.map(say).map(s => s.replace('ADVICE: ', '')).join('; ') + '.' : 'No advice has been reached yet; the conclusions above are intermediate facts.'));
      }
      out.append(box);
      out.append(traceForward(res));
      if (newFacts.length) out.append(explain(res.derived, newFacts));
      out.append(el('p', 'isx-note', 'Conflict resolution used here: when several rules could fire, the lowest-numbered rule fires first. A rule fires only once, and only if its conclusion is not already known.'));
    }
    function traceForward(res) {
      const wrap = el('div', 'isx-tablewrap');
      const t = el('table', 'isx-trace');
      t.append(el('caption', null, 'Forward chaining trace'));
      const head = el('thead'); const hr = el('tr');
      ['Cycle', 'Rules that could fire', 'Rule fired', 'New fact', 'Working memory afterwards'].forEach(h => hr.append(el('th', null, h)));
      head.append(hr); t.append(head);
      const body = el('tbody');
      res.steps.forEach(s => {
        const tr = el('tr');
        if (s.stop) {
          tr.append(el('td', null, String(s.cycle)));
          const td = el('td', null, 'None. No enabled rule has all its conditions in working memory and a new conclusion, so the engine stops.'); td.colSpan = 3; tr.append(td);
          tr.append(el('td', null, s.memory.join(', ') || '(empty)'));
        } else {
          tr.append(el('td', null, String(s.cycle)));
          tr.append(el('td', null, s.eligible.join(', ')));
          tr.append(el('td', null, `${s.rule.id}: IF ${s.rule.conds.join(' AND ')}`));
          tr.append(el('td', null, s.added));
          tr.append(el('td', null, s.memory.join(', ')));
        }
        body.append(tr);
      });
      t.append(body); wrap.append(t);
      return wrap;
    }

    /* ---------- backward chaining ---------- */
    function backward(goal) {
      const steps = [];
      const derived = new Map();
      const failed = new Set();
      const path = [];
      const add = (depth, text, result) => steps.push({ depth, text, result });
      function prove(g, depth) {
        if (state.facts.has(g)) { add(depth, `Is ${g} known? It is one of the facts you ticked.`, 'Yes'); return true; }
        if (derived.has(g)) { add(depth, `Is ${g} known? Already established by ${derived.get(g).id}.`, 'Yes'); return true; }
        if (failed.has(g)) { add(depth, `Is ${g} known? Already tried and failed.`, 'No'); return false; }
        if (path.includes(g)) { add(depth, `${g} is already being proved higher up, so this path loops.`, 'No'); return false; }
        const cand = state.rules.filter(r => r.on && r.then === g);
        if (!cand.length) {
          if (isFact.has(g)) { add(depth, `Ask the user: "${say(g)}"? It is not ticked.`, 'No'); }
          else add(depth, `Sub-goal ${g}: no enabled rule concludes it and it is not an observation.`, 'No');
          failed.add(g); return false;
        }
        path.push(g);
        add(depth, `Goal ${g}: not a known fact. Rules that conclude it: ${cand.map(r => r.id).join(', ')}.`, '');
        for (const r of cand) {
          add(depth + 1, `Try ${r.id}: IF ${r.conds.join(' AND ')} THEN ${r.then}. Need every condition.`, '');
          let ok = true;
          for (const c of r.conds) { if (!prove(c, depth + 2)) { ok = false; break; } }
          if (ok) {
            derived.set(g, r); state.ruleState[r.id] = 'fired';
            add(depth + 1, `${r.id} succeeds, so ${g} is established.`, 'Yes');
            path.pop(); return true;
          }
          if (state.ruleState[r.id] !== 'fired') state.ruleState[r.id] = 'tried';
          add(depth + 1, `${r.id} fails: a condition is not met.`, 'No');
        }
        path.pop(); failed.add(g);
        add(depth, `Every rule for ${g} failed, so ${g} cannot be proved.`, 'No');
        return false;
      }
      const ok = prove(goal, 0);
      return { ok, steps, derived };
    }
    function renderBackward(res, goal) {
      out.replaceChildren();
      const box = el('div', 'isx-summary ' + (res.ok ? 'isx-ok' : 'isx-fail'));
      box.append(el('p', null, res.ok
        ? `The goal ${goal} is proved: the facts you ticked are enough.`
        : `The goal ${goal} cannot be proved from the facts you ticked.`));
      if (!res.ok) box.append(el('p', null, 'Look for the first step marked "No" in the trace: it names the observation that is missing.'));
      out.append(box);
      const wrap = el('div', 'isx-tablewrap');
      const t = el('table', 'isx-trace');
      t.append(el('caption', null, 'Backward chaining trace (indented steps are sub-goals)'));
      const head = el('thead'); const hr = el('tr');
      ['Step', 'What the engine does', 'Result'].forEach(h => hr.append(el('th', null, h)));
      head.append(hr); t.append(head);
      const body = el('tbody');
      res.steps.forEach((s, i) => {
        const tr = el('tr', s.result === 'Yes' ? 'isx-yes' : s.result === 'No' ? 'isx-no' : '');
        tr.append(el('td', null, String(i + 1)));
        const td = el('td'); const sp = el('span', 'isx-ind', s.text); sp.style.setProperty('--d', String(s.depth)); td.append(sp);
        tr.append(td);
        tr.append(el('td', null, s.result));
        body.append(tr);
      });
      t.append(body); wrap.append(t);
      out.append(wrap);
      if (res.ok) out.append(explain(res.derived, [goal]));
    }

    /* ---------- explanation facility ---------- */
    function explain(derived, targets) {
      const wrap = el('div');
      wrap.append(el('h5', null, 'Explanation facility: how was it concluded? (the rules used, drawn as a tree)'));
      const build = (term, seen) => {
        const li = el('li');
        const r = derived.get(term);
        const node = el('span', 'isx-node' + (r ? ' isx-derived' : ''), term);
        li.append(node);
        if (r && !seen.includes(term)) {
          li.append(el('span', 'isx-via', 'from ' + r.id));
          const ul = el('ul');
          r.conds.forEach(c => ul.append(build(c, seen.concat(term))));
          li.append(ul);
        } else if (!r) li.append(el('span', 'isx-via', 'given fact'));
        return li;
      };
      const roots = targets.filter(t => derived.has(t) && (targets.length === 1 || !isUsedAsCondition(t, derived)));
      const ul = el('ul', 'isx-tree');
      (roots.length ? roots : targets).forEach(t => ul.append(build(t, [])));
      wrap.append(ul);
      const txt = el('p', 'isx-note', 'In text: ' + [...new Set([...derived.values()])].map(r => `${r.id} (IF ${r.conds.join(' AND ')} THEN ${r.then})`).join('; ') + '.');
      wrap.append(txt);
      return wrap;
    }
    function isUsedAsCondition(t, derived) {
      for (const r of derived.values()) if (r.conds.includes(t)) return true;
      return false;
    }

    /* ---------- run ---------- */
    function run() {
      state.ruleState = {};
      state.hasRun = true;
      if (state.mode === 'forward') renderForward(forward());
      else { state.goal = goalSel.value; renderBackward(backward(state.goal), state.goal); }
      renderRules();
    }

    bF.addEventListener('click', () => setMode('forward'));
    bB.addEventListener('click', () => setMode('backward'));
    bRun.addEventListener('click', run);
    goalSel.addEventListener('change', () => { state.goal = goalSel.value; if (state.hasRun) invalidate(); });
    bReset.addEventListener('click', () => {
      state.rules = BASE_RULES.map((r, i) => ({ id: 'R' + (i + 1), conds: r.conds.slice(), then: r.then, on: true, custom: false }));
      refreshSelects(); invalidate(); addMsg.textContent = '';
    });
    bAdd.addEventListener('click', () => {
      const c1 = sel1.value, c2 = sel2.value;
      const raw = inThen.value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
      if (!raw) { addMsg.textContent = 'Type what the rule concludes, for example add_fertiliser.'; inThen.focus(); return; }
      if (isFact.has(raw)) { addMsg.textContent = 'That name is already an observation. Choose a new conclusion.'; return; }
      if (raw === c1 || raw === c2) { addMsg.textContent = 'A rule cannot conclude one of its own conditions.'; return; }
      const conds = c2 && c2 !== c1 ? [c1, c2] : [c1];
      const n = state.rules.length + 1;
      state.rules.push({ id: 'R' + n, conds, then: raw, on: true, custom: true });
      labels.set(raw, 'New conclusion: ' + raw.replace(/_/g, ' '));
      inThen.value = '';
      addMsg.textContent = `Rule R${n} added. Run the engine again.`;
      refreshSelects(); invalidate();
    });

    refreshSelects();
    setMode('forward');
    renderRules();
    run();
  }

  /* ---------- Certainty-factor calculator ---------- */
  function buildCF(host) {
    host.replaceChildren();
    host.append(el('h4', null, 'Certainty factor calculator'));
    host.append(el('p', 'isx-lead', 'Two rules both support the conclusion "the plant is overwatered". Set the certainty factors (CF) from 0 to 1 and follow the arithmetic: multiply for each rule, take the smaller evidence value for AND, then combine the two rules.'));
    const grid = el('div', 'isx-grid');
    const left = el('div'), right = el('div');
    grid.append(left, right); host.append(grid);
    const vals = { ra: .8, e1: .9, e2: .7, rb: .5, e3: 1 };
    const outs = {};
    const slider = (parent, key, text) => {
      const w = el('label', 'isx-field');
      const s = el('span'); s.append(document.createTextNode(text + ': '));
      const o = el('output', null, vals[key].toFixed(2)); outs[key] = o; s.append(o);
      const r = el('input'); r.type = 'range'; r.min = '0'; r.max = '1'; r.step = '0.05'; r.value = String(vals[key]);
      r.style.width = '100%';
      r.addEventListener('input', () => { vals[key] = parseFloat(r.value); o.textContent = vals[key].toFixed(2); calc(); });
      w.append(s, r); parent.append(w);
    };
    const boxA = el('fieldset', 'isx-box'); boxA.append(el('legend', null, 'Rule A: IF leaves_yellow AND soil_wet THEN overwatered'));
    slider(boxA, 'ra', 'CF of rule A'); slider(boxA, 'e1', 'CF of evidence: leaves_yellow'); slider(boxA, 'e2', 'CF of evidence: soil_wet');
    const boxB = el('fieldset', 'isx-box'); boxB.append(el('legend', null, 'Rule B: IF no_drainage THEN overwatered'));
    slider(boxB, 'rb', 'CF of rule B'); slider(boxB, 'e3', 'CF of evidence: no_drainage');
    left.append(boxA, boxB);
    const res = el('div', 'isx-summary'); res.setAttribute('aria-live', 'polite');
    right.append(res);
    const f = n => n.toFixed(2);
    function calc() {
      const ev = Math.min(vals.e1, vals.e2);
      const a = vals.ra * ev, b = vals.rb * vals.e3;
      const both = a + b * (1 - a);
      res.replaceChildren();
      const line = (t) => res.append(el('p', null, t));
      const h = el('h5', null, 'Working'); res.append(h);
      line(`1. Evidence for rule A (AND takes the smaller): min(${f(vals.e1)}, ${f(vals.e2)}) = ${f(ev)}`);
      line(`2. CF from rule A = ${f(vals.ra)} × ${f(ev)} = ${f(a)}`);
      line(`3. CF from rule B = ${f(vals.rb)} × ${f(vals.e3)} = ${f(b)}`);
      line(`4. Combine two positive CFs: ${f(a)} + ${f(b)} × (1 − ${f(a)}) = ${f(both)}`);
      const p = el('p'); p.append(el('strong', null, `Overall certainty that the plant is overwatered: ${f(both)}`)); res.append(p);
      res.append(el('p', 'isx-note', 'The combined value is never lower than either single-rule value, and it can never pass 1. This calculator only handles positive certainty factors.'));
    }
    calc();
  }

  function init() {
    document.querySelectorAll('.isx-widget[data-isx]').forEach(host => {
      try {
        if (host.dataset.isx === 'expert') buildExpert(host);
        else if (host.dataset.isx === 'cf') buildCF(host);
      } catch (e) { /* leave the static fallback text in place */ }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
