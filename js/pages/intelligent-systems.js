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

/* Intelligent systems: labs built on the shared kit (css/labs.css, js/labs.js).
   1. Fuzzy fan controller: slide the temperature and see degrees of membership, the rules that fire and a smooth fan speed.
   2. Predictive search: suggestions ranked by popularity, recent searches and location, with a privacy trade-off.
   3. Decision output check: move an approval threshold and compare proposed decisions with actual outcomes.
   4. Practice sets: decision categories, hardware, ethical issues, relevant and surplus data.
   All data is fictional. */
(function () {
  'use strict';
  var el = Labs.el;
  var NS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.append(e); return e; }

  /* ---------- 1. Fuzzy fan controller ---------- */
  function cold(t) { return t <= 10 ? 1 : t >= 20 ? 0 : (20 - t) / 10; }
  function warm(t) { return t <= 10 || t >= 30 ? 0 : t <= 20 ? (t - 10) / 10 : (30 - t) / 10; }
  function hot(t) { return t <= 20 ? 0 : t >= 30 ? 1 : (t - 20) / 10; }
  function fuzzyFan(t) { var c = cold(t), w = warm(t), h = hot(t); return (c * 0 + w * 50 + h * 100) / (c + w + h); }
  function crispFan(t) { return t >= 25 ? 100 : t >= 15 ? 50 : 0; }

  function buildFuzzy(host) {
    Labs.shell(host, 'is-fuzzy', 'Fuzzy fan controller', 'A greenhouse fan has three rules: IF the temperature is Cold THEN the fan is Off (0%); IF Warm THEN Medium (50%); IF Hot THEN High (100%). Slide the temperature to see how much each rule counts, and compare the smooth fuzzy fan speed with a crisp rule that jumps between steps.');
    var t = 24;
    var f = el('div', 'lab-field'), l = el('label'), o = el('output'), i = el('input'); l.htmlFor = i.id = 'is-fz-t'; l.append(document.createTextNode('Greenhouse temperature: '), o);
    i.type = 'range'; i.min = 0; i.max = 40; i.step = 0.5; i.value = t; f.append(l, i); host.append(f);
    var split = el('div', 'lab-split'); host.append(split);
    var box1 = el('div', 'lab-stage'), box2 = el('div', 'lab-stage');
    var s1 = svgEl('svg', { viewBox: '0 0 400 250', role: 'img', 'aria-label': 'Membership of Cold, Warm and Hot against temperature, with the current temperature marked.' }, box1);
    var s2 = svgEl('svg', { viewBox: '0 0 400 250', role: 'img', 'aria-label': 'Fan speed against temperature for the fuzzy controller (a smooth line) and a crisp rule (steps), with the current temperature marked.' }, box2);
    split.append(box1, box2);
    var tab = Labs.table(['Fuzzy set', 'Degree of membership', 'Rule', 'Fan speed if the rule were fully true'], { num: [1, 3] });
    host.append(tab.wrap);
    var out = el('div', 'lab-readout'); out.setAttribute('role', 'status'); host.append(out);
    host.append(el('p', 'lab-note', 'The fuzzy speed is a weighted average of the three fan speeds, using each rule\'s degree of membership as its weight. This is a simplified way of combining the rules; real controllers have several. The Cold rule is added here so the fan has a value below 10 °C. The chart shows the same sets as the figure above.'));

    var PX = 40, PY = 20, PW = 340, PH = 170;
    var X = function (v) { return PX + v / 40 * PW; };
    function frame(svg, yMax, yTicks, yLabel) {
      svg.replaceChildren();
      yTicks.forEach(function (v) { var y = PY + PH - v / yMax * PH; svgEl('line', { x1: PX, y1: y, x2: PX + PW, y2: y, class: 'is-fz-grid' }, svg); var tx = svgEl('text', { x: PX - 6, y: y + 4, 'text-anchor': 'end', class: 'is-fz-txt' }, svg); tx.textContent = v; });
      [0, 10, 20, 30, 40].forEach(function (v) { var tx = svgEl('text', { x: X(v), y: PY + PH + 18, 'text-anchor': 'middle', class: 'is-fz-txt' }, svg); tx.textContent = v; });
      var xl = svgEl('text', { x: PX + PW / 2, y: 242, 'text-anchor': 'middle', class: 'is-fz-txt' }, svg); xl.textContent = 'Temperature (°C)';
      var yl = svgEl('text', { x: 12, y: PY + PH / 2, 'text-anchor': 'middle', class: 'is-fz-txt', transform: 'rotate(-90 12 ' + (PY + PH / 2) + ')' }, svg); yl.textContent = yLabel;
    }
    function curve(svg, fn, yMax, cls) {
      var d = ''; for (var v = 0; v <= 40; v += 0.5) d += (v ? 'L' : 'M') + X(v) + ' ' + (PY + PH - fn(v) / yMax * PH);
      svgEl('path', { d: d, class: cls, fill: 'none' }, svg);
    }
    function marker(svg, v, yMax) {
      svgEl('line', { x1: X(v), y1: PY, x2: X(v), y2: PY + PH, class: 'is-fz-mark' }, svg);
    }
    function update() {
      var c = cold(t), w = warm(t), h = hot(t), fz = fuzzyFan(t), cr = crispFan(t);
      o.textContent = t.toFixed(1) + ' °C';
      frame(s1, 1, [0, 0.5, 1], 'Membership');
      curve(s1, cold, 1, 'is-fz-cold'); curve(s1, warm, 1, 'is-fz-warm'); curve(s1, hot, 1, 'is-fz-hot');
      [['Cold', 4, 'is-fz-cold'], ['Warm', 20, 'is-fz-warm'], ['Hot', 36, 'is-fz-hot']].forEach(function (n) { var tx = svgEl('text', { x: X(n[1]), y: PY - 6, 'text-anchor': 'middle', class: 'is-fz-name ' + n[2] + '-t' }, s1); tx.textContent = n[0]; });
      marker(s1, t, 1);
      [[c, 'is-fz-cold'], [w, 'is-fz-warm'], [h, 'is-fz-hot']].forEach(function (p) { if (p[0] > 0) svgEl('circle', { cx: X(t), cy: PY + PH - p[0] * PH, r: 5.5, class: p[1] + '-dot' }, s1); });
      frame(s2, 100, [0, 50, 100], 'Fan speed (%)');
      curve(s2, crispFan, 100, 'is-fz-crisp'); curve(s2, fuzzyFan, 100, 'is-fz-fuzzy');
      marker(s2, t, 100);
      svgEl('circle', { cx: X(t), cy: PY + PH - fz / 100 * PH, r: 6, class: 'is-fz-fuzzy-dot' }, s2);
      svgEl('circle', { cx: X(t), cy: PY + PH - cr / 100 * PH, r: 5, class: 'is-fz-crisp-dot' }, s2);
      var k1 = svgEl('text', { x: PX + 6, y: PY + 12, class: 'is-fz-name is-fz-fuzzy-t' }, s2); k1.textContent = 'Fuzzy (smooth)';
      var k2 = svgEl('text', { x: PX + 6, y: PY + 30, class: 'is-fz-name is-fz-crisp-t' }, s2); k2.textContent = 'Crisp (steps)';
      tab.clear();
      tab.add(['Cold', c.toFixed(2), 'IF Cold THEN Off', '0%']); tab.add(['Warm', w.toFixed(2), 'IF Warm THEN Medium', '50%']); tab.add(['Hot', h.toFixed(2), 'IF Hot THEN High', '100%']);
      out.replaceChildren();
      out.append(el('p', null, 'Fuzzy fan speed = (' + c.toFixed(2) + ' × 0 + ' + w.toFixed(2) + ' × 50 + ' + h.toFixed(2) + ' × 100) ÷ (' + (c + w + h).toFixed(2) + ') = ' + fz.toFixed(0) + '%.'));
      out.append(el('p', null, 'A crisp rule (Hot from 25 °C, Medium from 15 °C, otherwise Off) gives ' + cr + '%. Drag across 24.5 and 25 °C: the crisp fan jumps from 50% to 100%, but the fuzzy fan only changes by a few percent.'));
    }
    i.addEventListener('input', function () { t = +i.value; update(); });
    update();
  }

  /* ---------- 2. Predictive search ---------- */
  var LOG = [
    ['weather today', 920], ['weather radar', 640], ['weather wagga wagga', 210], ['weather sydney', 700], ['water restrictions', 90],
    ['wagga bus timetable', 160], ['wagga wagga rsl', 120], ['wagga airport flights', 85], ['tafe courses', 240], ['tax return', 880], ['tax file number', 430], ['tax rates 2026', 360],
    ['train times sydney', 510], ['train strike', 300], ['hsc exam timetable', 400], ['hsc enterprise computing', 150], ['hsc results', 520], ['hsc dates', 260], ['hsc study tips', 230],
    ['hospital opening hours', 140], ['how to cook rice', 350], ['how to write a resume', 410], ['how to study', 280], ['how to tie a tie', 330]
  ];
  var RECENT = ['hsc enterprise computing', 'hsc study tips', 'how to study'];
  function buildPredict(host) {
    Labs.shell(host, 'is-predict', 'Predictive search', 'Type the start of a search. The agent offers the most likely completions, scored from how often people searched for them. Then switch on personal signals and see how the order changes, and what data that needs.');
    var f = el('div', 'lab-field'), l = el('label', null, 'Search box'), inp = el('input'); l.htmlFor = inp.id = 'is-pr-q'; inp.type = 'text'; inp.placeholder = 'Try: h, hs, w or how'; inp.autocomplete = 'off'; inp.maxLength = 40; f.append(l, inp);
    var opts = el('div', 'lab-row');
    var cR = el('input'), cL = el('input'); cR.type = cL.type = 'checkbox';
    var lr = el('label', 'lab-check'); lr.append(cR, document.createTextNode('Use my recent searches (hsc enterprise computing, hsc study tips, how to study)'));
    var ll = el('label', 'lab-check'); ll.append(cL, document.createTextNode('Use my location (Wagga Wagga)'));
    opts.append(f, lr, ll); host.append(opts);
    var list = el('ul', 'is-pr-list'); list.setAttribute('role', 'listbox'); list.setAttribute('aria-label', 'Suggestions');
    var why = el('div', 'lab-readout'); why.setAttribute('role', 'status');
    host.append(list, why);
    host.append(el('p', 'lab-note', 'This is a toy model with a made-up search log. Real engines also use language, trending topics and the time of day, filter some suggestions, and estimate probabilities rather than counting. Personalised suggestions need your search history, which is personal information.'));
    var max = Math.max.apply(null, LOG.map(function (x) { return x[1]; }));
    function score(q, n) {
      var base = n / max * 100, bonus = 0, notes = ['popularity ' + Math.round(base)];
      if (cR.checked && RECENT.indexOf(q) >= 0) { bonus += 120; notes.push('+120 you searched this recently'); }
      if (cL.checked && /wagga/.test(q)) { bonus += 60; notes.push('+60 near you'); }
      return { s: base + bonus, notes: notes };
    }
    function update() {
      var p = inp.value.trim().toLowerCase();
      list.replaceChildren();
      if (!p) { why.textContent = 'Type at least one letter. With nothing typed, a real search box might show your recent or trending searches.'; why.className = 'lab-readout'; return; }
      var hits = LOG.filter(function (x) { return x[0].indexOf(p) === 0 && x[0] !== p; }).map(function (x) { var r = score(x[0], x[1]); return { q: x[0], s: r.s, notes: r.notes }; }).sort(function (a, b) { return b.s - a.s; }).slice(0, 5);
      if (!hits.length) { why.className = 'lab-readout'; why.textContent = 'No suggestions: nobody in this small log has searched for something starting with "' + p + '". The agent can only predict what it has seen.'; return; }
      hits.forEach(function (h) {
        var li = el('li', 'is-pr-item'); li.setAttribute('role', 'option');
        var q = el('span', 'is-pr-q'); q.append(el('b', null, h.q.slice(0, p.length)), document.createTextNode(h.q.slice(p.length))); li.append(q);
        li.append(el('span', 'is-pr-score', Math.round(h.s) + ' points: ' + h.notes.join(', ')));
        list.append(li);
      });
      why.className = 'lab-readout';
      why.textContent = cR.checked || cL.checked ? 'Personal signals are on, so your own history and place can move a less popular search to the top. That is more helpful, but the agent now has to collect and keep that data.' : 'With no personal signals, everyone who types "' + p + '" sees the same order: the most popular completions first.';
    }
    inp.addEventListener('input', update); cR.addEventListener('change', update); cL.addEventListener('change', update);
    update();
  }

  /* ---------- 3. Decision output check ---------- */
  // Fictional loan applications: model score (0 to 100) and what actually happened (1 = repaid, 0 = defaulted)
  var LOANS = [[22, 0], [28, 0], [31, 0], [35, 1], [38, 0], [41, 0], [44, 1], [47, 0], [50, 1], [52, 0], [55, 1], [58, 1], [60, 0], [62, 1], [65, 1], [68, 1], [70, 1], [72, 0], [75, 1], [78, 1], [82, 1], [86, 1], [90, 1], [94, 1]];
  function buildDss(host) {
    Labs.shell(host, 'is-dss', 'Check a decision support system', 'A bank\'s system scores 24 loan applications. It approves a loan when the score is at or above a threshold. Later, we know who repaid. Move the threshold and compare the system\'s proposed decisions with what actually happened.');
    var th = 60, costBad = 5000, costMissed = 500;
    var f = el('div', 'lab-field'), l = el('label'), o = el('output'), i = el('input'); l.htmlFor = i.id = 'is-dss-t'; l.append(document.createTextNode('Approval threshold: approve at a score of '), o); i.type = 'range'; i.min = 20; i.max = 100; i.step = 1; i.value = th; f.append(l, i); host.append(f);
    var split = el('div', 'lab-split lab-split--wide-left'); host.append(split);
    var box = el('div', 'lab-stage'); var svg = svgEl('svg', { viewBox: '0 0 420 200', role: 'img', 'aria-label': 'Each of the 24 applications is a dot placed by its score. Green dots repaid and red dots defaulted. A vertical line marks the approval threshold.' }, box);
    var tab = Labs.table(['', 'Actually repaid', 'Actually defaulted'], { num: [1, 2] });
    split.append(box, tab.wrap);
    var stats = el('div', 'lab-stats'); host.append(stats);
    var out = el('div', 'lab-readout'); out.setAttribute('role', 'status'); host.append(out);
    var actions = el('div', 'lab-actions'); var best = el('button', 'lab-btn', 'Find the threshold with the lowest cost'); best.type = 'button'; actions.append(best); host.append(actions);
    host.append(el('p', 'lab-note', 'Costs are assumptions for the activity: a loan that is approved and then defaulted costs $5,000, and a good customer who is declined costs $500 in lost profit. A real organisation would set its own figures and would also consider fairness: the same threshold can affect different groups differently.'));
    function counts(t) { var a = { ar: 0, ad: 0, dr: 0, dd: 0 }; LOANS.forEach(function (x) { var ap = x[0] >= t; if (ap) { if (x[1]) a.ar++; else a.ad++; } else if (x[1]) a.dr++; else a.dd++; }); return a; }
    function cost(t) { var c = counts(t); return c.ad * costBad + c.dr * costMissed; }
    function update() {
      o.textContent = th;
      var c = counts(th), n = LOANS.length, acc = (c.ar + c.dd) / n;
      svg.replaceChildren();
      var X = function (s) { return 20 + (s - 20) / 80 * 380; };
      svgEl('line', { x1: 20, y1: 150, x2: 400, y2: 150, class: 'is-dss-axis' }, svg);
      [20, 40, 60, 80, 100].forEach(function (v) { var tx = svgEl('text', { x: X(v), y: 170, 'text-anchor': 'middle', class: 'is-dss-txt' }, svg); tx.textContent = v; });
      var xl = svgEl('text', { x: 210, y: 192, 'text-anchor': 'middle', class: 'is-dss-txt' }, svg); xl.textContent = 'Model score';
      svgEl('rect', { x: 20, y: 22, width: Math.max(0, X(th) - 20), height: 128, class: 'is-dss-declined' }, svg);
      svgEl('rect', { x: X(th), y: 22, width: Math.max(0, 400 - X(th)), height: 128, class: 'is-dss-approved' }, svg);
      var d = svgEl('text', { x: 28, y: 38, class: 'is-dss-name' }, svg); d.textContent = 'Declined';
      var a = svgEl('text', { x: 392, y: 38, 'text-anchor': 'end', class: 'is-dss-name' }, svg); a.textContent = 'Approved';
      var stack = {};
      LOANS.forEach(function (x) { var k = x[0]; stack[k] = (stack[k] || 0); var cy = 140 - stack[k] * 14; stack[k]++; svgEl('circle', { cx: X(x[0]), cy: cy, r: 5.5, class: x[1] ? 'is-dss-ok' : 'is-dss-bad' }, svg); });
      svgEl('line', { x1: X(th), y1: 14, x2: X(th), y2: 150, class: 'is-dss-th' }, svg);
      var k1 = svgEl('circle', { cx: 28, cy: 62, r: 5.5, class: 'is-dss-ok' }, svg), kt1 = svgEl('text', { x: 38, y: 66, class: 'is-dss-txt' }, svg); kt1.textContent = 'repaid';
      var k2 = svgEl('circle', { cx: 92, cy: 62, r: 5.5, class: 'is-dss-bad' }, svg), kt2 = svgEl('text', { x: 102, y: 66, class: 'is-dss-txt' }, svg); kt2.textContent = 'defaulted';
      tab.clear();
      tab.add(['Approved by the system', String(c.ar), String(c.ad)], c.ad ? '' : '');
      tab.add(['Declined by the system', String(c.dr), String(c.dd)]);
      tab.tbody.rows[0].cells[1].classList.add('is-hit'); tab.tbody.rows[0].cells[2].classList.add('is-miss'); tab.tbody.rows[1].cells[1].classList.add('is-miss'); tab.tbody.rows[1].cells[2].classList.add('is-hit');
      stats.replaceChildren();
      function stat(lb, v) { var s = el('div', 'lab-stat'); s.append(el('span', null, lb), el('b', null, v)); stats.append(s); }
      stat('Decisions that were right', (c.ar + c.dd) + ' of ' + n + ' (' + Math.round(acc * 100) + '%)');
      stat('Bad approvals (approved, defaulted)', String(c.ad));
      stat('Missed customers (declined, repaid)', String(c.dr));
      stat('Cost of the mistakes', '$' + (c.ad * costBad + c.dr * costMissed).toLocaleString('en-AU'));
      out.className = 'lab-readout ' + (acc >= 0.75 ? 'is-good' : acc >= 0.6 ? 'is-warn' : 'is-bad');
      out.textContent = th <= 30 ? 'A very low threshold approves almost everyone, so it approves most of the people who default. It misses no good customers, but it is costly.' : th >= 90 ? 'A very high threshold declines almost everyone. It avoids nearly every default but turns away most good customers.' : 'Raising the threshold removes bad approvals but declines more good customers. Lowering it does the opposite. No threshold is perfect, because the score and the outcome overlap. The best choice depends on what each kind of mistake costs.';
    }
    i.addEventListener('input', function () { th = +i.value; update(); });
    best.addEventListener('click', function () { var bt = 20, bc = Infinity; for (var t = 20; t <= 100; t++) { var cc = cost(t); if (cc < bc) { bc = cc; bt = t; } } th = bt; i.value = th; update(); });
    update();
  }

  /* ---------- 4. Practice sets ---------- */
  function buildDecisions(host) {
    Labs.sorter(host, {
      cls: 'is-dsssort', title: 'How structured is the decision?',
      lead: 'Choose the category of decision-making: unstructured (judgement, no fixed procedure), semi-structured (a procedure helps but judgement is still needed) or structured (fully automated).',
      noun: 'decision', groupLabel: 'Category of decision',
      choices: [{ key: 'unstructured', label: 'Unstructured' }, { key: 'semi-structured', label: 'Semi-structured' }, { key: 'structured', label: 'Structured (automated)' }],
      items: [
        { text: 'A company chooses whether to launch a new product in a market where nobody has sold anything like it.', ans: 'unstructured', why: 'There is no set procedure and no certain data to follow. The decision depends on judgement, experience and weighing up uncertain information.' },
        { text: 'A card system approves or declines a payment in a fraction of a second, using fixed rules.', ans: 'structured', why: 'The decision follows a specified procedure that a computer can carry out on its own, without a person, so it is an automated (structured) decision.' },
        { text: 'A manager uses a forecasting model to suggest staff numbers, then adjusts the roster for a local event the model knows nothing about.', ans: 'semi-structured', why: 'A procedure and data support the decision, but human judgement is still needed to finish it. This is the typical use of a decision support system.' },
        { text: 'A principal decides which of two students should receive a scholarship after reading their applications.', ans: 'unstructured', why: 'The criteria need interpretation and weighing against one another, so the decision relies on personal judgement.' },
        { text: 'A thermostat turns the heating on whenever the temperature falls below 18 °C.', ans: 'structured', why: 'One fixed rule, no judgement. The decision is automatic every time.' },
        { text: 'A farmer studies a rainfall forecast and soil data on a screen, then decides when to plant.', ans: 'semi-structured', why: 'The system supplies the information, and the farmer applies their own knowledge of the paddock before deciding.' }
      ],
      closing: 'A decision support system is most useful for semi-structured decisions, where it supplies information and the person supplies judgement.'
    });
  }
  function buildHardware(host) {
    Labs.sorter(host, {
      cls: 'is-hwsort', keepCase: true, title: 'Which hardware is it?',
      lead: 'Read the description and choose the kind of hardware an intelligent system is using.',
      noun: 'description', groupLabel: 'Hardware',
      choices: [{ key: 'Biometrics', label: 'Biometrics' }, { key: 'Haptics', label: 'Haptics' }, { key: 'Touch and gesture', label: 'Touch and gesture' }, { key: 'VR or AR', label: 'VR / AR' }, { key: 'Voice and sound', label: 'Voice and sound' }, { key: 'Sensors and actuators', label: 'Sensors and actuators' }],
      items: [
        { text: 'A phone unlocks when it recognises the owner\'s fingerprint.', ans: 'Biometrics', why: 'Biometrics identify a person from a body characteristic such as a fingerprint, face, iris or voice.' },
        { text: 'A game controller vibrates to make a player feel the recoil of a virtual tool.', ans: 'Haptics', why: 'Haptics give the user a sense of touch through force, vibration or motion.' },
        { text: 'A user swipes and pinches a tablet to zoom a map.', ans: 'Touch and gesture', why: 'The system reads finger movements on a touch screen. The same idea covers gestures in the air that a camera or sensor can see.' },
        { text: 'A trainee wears a headset and appears to stand inside a virtual workshop.', ans: 'VR or AR', why: 'A headset that replaces the real view with a virtual one is virtual reality. Overlaying digital objects on the real view is augmented reality.' },
        { text: 'A smart speaker answers when someone asks it for the time.', ans: 'Voice and sound', why: 'A microphone and speaker let the user talk to the system and hear it reply.' },
        { text: 'A greenhouse controller opens a vent when a probe reads a high temperature.', ans: 'Sensors and actuators', why: 'A sensor measures the world (the probe) and an actuator or motor acts on it (the vent). A microcontroller joins the two with a program.' }
      ],
      closing: 'In an exam, name the hardware, say what it senses or does, and link it to the purpose of the system.'
    });
  }
  function buildEthics(host) {
    Labs.sorter(host, {
      cls: 'is-ethicsort', keepCase: true, title: 'Which issue is it?',
      lead: 'Each situation raises one main social or ethical issue. Choose the best match, then read how it could be addressed.',
      noun: 'situation', groupLabel: 'Issue',
      choices: [{ key: 'Privacy and consent', label: 'Privacy and consent' }, { key: 'Bias and fairness', label: 'Bias and fairness' }, { key: 'Transparency and accountability', label: 'Transparency and accountability' }, { key: 'Employment', label: 'Employment' }, { key: 'Security and safety', label: 'Security and safety' }],
      items: [
        { text: 'A shop\'s loyalty app records where customers walk inside the store, and nobody told them.', ans: 'Privacy and consent', why: 'Personal information was collected without people knowing or agreeing. Response: tell people clearly, ask for consent, collect only what is needed.' },
        { text: 'A recruitment tool trained on past hires ranks applications from women lower.', ans: 'Bias and fairness', why: 'The system learned a pattern of unfairness from biased training data. Response: audit the data and results across groups, and keep a person responsible for the decision.' },
        { text: 'A bank declines a loan and cannot explain which factors led to the decision.', ans: 'Transparency and accountability', why: 'People affected by a decision need an explanation and someone to answer for it. Response: explainable models, records of decisions, and a way to appeal.' },
        { text: 'A warehouse replaces most picking jobs with robots directed by an intelligent scheduling system.', ans: 'Employment', why: 'Automation changes which jobs exist and which skills are needed. Response: retraining, redeployment and planning for the transition.' },
        { text: 'Attackers feed false readings to an irrigation controller so it floods a farm.', ans: 'Security and safety', why: 'An intelligent system that controls physical things can cause real harm if it is manipulated. Response: secure the devices and network, validate sensor data, and allow human override.' },
        { text: 'A face-recognition door lock works well for some skin tones and poorly for others.', ans: 'Bias and fairness', why: 'The error rates differ between groups, usually because the training data did not represent everyone. Response: test with diverse data and set a fair threshold.' }
      ],
      closing: 'A strong answer names the issue, says who is affected and how, and suggests a practical response.'
    });
  }
  function buildSurplus(host) {
    Labs.sorter(host, {
      cls: 'is-datasort', keepCase: true, title: 'Relevant or surplus?',
      lead: 'Decide whether each piece of data helps the purpose of the system (relevant) or is extra (surplus). Surplus data costs storage, bandwidth and energy, and adds risk.',
      noun: 'data item', groupLabel: 'Data',
      choices: [{ key: 'Relevant', label: 'Relevant' }, { key: 'Surplus', label: 'Surplus' }],
      items: [
        { text: 'A smart watering system decides when to water. It uses the soil moisture reading.', ans: 'Relevant', why: 'The decision depends directly on this reading, so it supports the purpose of the system.' },
        { text: 'The same system also logs the Wi-Fi signal strength of the sensor every second.', ans: 'Surplus', why: 'It does not help the watering decision. A summary may be useful for finding faults, but a reading every second is surplus.' },
        { text: 'A fleet system works out arrival times. It uses each vehicle\'s GPS position.', ans: 'Relevant', why: 'Position is the data the calculation needs.' },
        { text: 'The fleet system also records the driver\'s music playlist.', ans: 'Surplus', why: 'It has nothing to do with arrival times, and keeping it adds privacy risk for no benefit.' },
        { text: 'A hospital monitor decides when to raise an alarm. It uses the patient\'s heart rate.', ans: 'Relevant', why: 'The alarm decision depends on it, so it must be collected, validated and protected.' },
        { text: 'The monitor streams continuous high-definition video of the empty bed to the cloud.', ans: 'Surplus', why: 'Video of an empty bed is repeated, unused data. Filtering at the edge would avoid the bandwidth and storage cost.' }
      ],
      closing: 'Good design collects what the system needs, filters the rest at the edge, and deletes or de-identifies data once it is no longer useful.'
    });
  }

  function init2() {
    document.querySelectorAll('[data-isl="fuzzy"]').forEach(buildFuzzy);
    document.querySelectorAll('[data-isl="predict"]').forEach(buildPredict);
    document.querySelectorAll('[data-isl="dss"]').forEach(buildDss);
    document.querySelectorAll('[data-isl="decisions"]').forEach(buildDecisions);
    document.querySelectorAll('[data-isl="hardware"]').forEach(buildHardware);
    document.querySelectorAll('[data-isl="ethics"]').forEach(buildEthics);
    document.querySelectorAll('[data-isl="surplus"]').forEach(buildSurplus);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init2); else init2();
})();
