/* A tiny SQL engine for practice tools. It understands the Course Specifications' four keywords, with the join
   style the specifications use (tables listed in FROM, matched in WHERE):

     SELECT field, Table.field | *
     FROM Table, Table
     WHERE field = value AND/OR/NOT (...)    comparisons: =  <>  <  <=  >  >=  CONTAINS
     ORDER BY field ASC | DESC, ...

   It is not a database: tables live in memory and every query rebuilds the product of the FROM tables, which is fine
   for the dozens of rows used on these pages. Text comparisons ignore capital letters, and a date in a query is
   written day/month/year, as in the Course Specifications. Messages are written for students.
   Everything is returned as data (no markup). The same file is in the sister site's js/ folder; keep the two identical.

     MiniSQL.run(sql, db)  ->  { columns: [name], rows: [[text]], raw: [[value]], tables: [name] }  or throws Error(message)
     db = { Tables: { name: 'Riders', cols: [{ n: 'RiderID', type: 'text' }], rows: [[...]] } }
     column types: text, int, real (1 decimal place), dec2 (2 decimal places), money ($ and 2 decimal places), date (stored as 'YYYY-MM-DD'). */
(() => {
  'use strict';

  const KEYWORDS = ['SELECT', 'FROM', 'WHERE', 'ORDER', 'BY', 'AND', 'OR', 'NOT', 'ASC', 'DESC', 'CONTAINS'];
  const fail = msg => { throw new Error(msg); };

  function tokenise(src) {
    const out = [];
    let i = 0;
    while (i < src.length) {
      const c = src[i];
      if (/\s/.test(c)) { i++; continue; }
      if (c === ';') { i++; continue; }
      if (c === "'" || c === '‘' || c === '’') {
        let j = i + 1, s = '';
        while (j < src.length && src[j] !== "'" && src[j] !== '’' && src[j] !== '‘') s += src[j++];
        if (j >= src.length) fail("A text value starts with a quote mark but never ends. Close it with another single quote ('), for example 'Casual'.");
        out.push({ t: 'str', v: s }); i = j + 1; continue;
      }
      if (c === '"') fail("Use single quotes ('like this') around text and dates, not double quotes.");
      if (/[0-9]/.test(c) || (c === '-' && /[0-9]/.test(src[i + 1] || '') && !out.length)) {
        let j = i + 1;
        while (j < src.length && /[0-9.]/.test(src[j])) j++;
        out.push({ t: 'num', v: parseFloat(src.slice(i, j)) }); i = j; continue;
      }
      if (/[A-Za-z_]/.test(c)) {
        let j = i + 1;
        while (j < src.length && /[A-Za-z0-9_]/.test(src[j])) j++;
        const w = src.slice(i, j);
        out.push({ t: 'word', v: w, u: w.toUpperCase() }); i = j; continue;
      }
      const two = src.slice(i, i + 2);
      if (['<=', '>=', '<>', '!='].includes(two)) { out.push({ t: 'op', v: two === '!=' ? '<>' : two }); i += 2; continue; }
      if ('=<>'.includes(c)) { out.push({ t: 'op', v: c }); i++; continue; }
      if (c === ',') { out.push({ t: 'comma' }); i++; continue; }
      if (c === '.') { out.push({ t: 'dot' }); i++; continue; }
      if (c === '*') { out.push({ t: 'star' }); i++; continue; }
      if (c === '(') { out.push({ t: 'lp' }); i++; continue; }
      if (c === ')') { out.push({ t: 'rp' }); i++; continue; }
      fail('The character "' + c + '" is not part of the SQL used in this course.');
    }
    return out;
  }

  function parse(tokens) {
    let p = 0;
    const peek = () => tokens[p];
    const isKw = (u) => peek() && peek().t === 'word' && peek().u === u;
    const eatKw = (u) => { if (isKw(u)) { p++; return true; } return false; };

    if (!eatKw('SELECT')) fail('A query starts with SELECT, followed by the fields you want to display.');
    const select = [];
    if (peek() && peek().t === 'star') { p++; select.push({ star: true }); }
    else {
      for (;;) {
        select.push(field('Write the field to display after SELECT (for example Surname, or Riders.Surname).'));
        if (peek() && peek().t === 'comma') { p++; continue; }
        break;
      }
    }
    if (!eatKw('FROM')) fail('After the fields to display, write FROM and the table (or tables) the fields come from.');
    const from = [];
    for (;;) {
      const t = peek();
      if (!t || t.t !== 'word' || KEYWORDS.includes(t.u)) fail('Write the name of a table after FROM.');
      from.push(t.v); p++;
      if (peek() && peek().t === 'comma') { p++; continue; }
      break;
    }
    let where = null;
    if (eatKw('WHERE')) where = orExpr();
    const order = [];
    if (eatKw('ORDER')) {
      if (!eatKw('BY')) fail('ORDER must be followed by BY: ORDER BY Field ASC (or DESC).');
      for (;;) {
        const f = field('Write the field to sort by after ORDER BY.');
        let dir = 'ASC';
        if (eatKw('ASC')) dir = 'ASC'; else if (eatKw('DESC')) dir = 'DESC';
        order.push({ f, dir });
        if (peek() && peek().t === 'comma') { p++; continue; }
        break;
      }
    }
    if (p < tokens.length) {
      const t = tokens[p];
      fail('Unexpected "' + (t.v !== undefined ? t.v : t.t) + '". ' + (t.u === 'AND' || t.u === 'OR' ? 'Put AND and OR inside the WHERE clause.' : 'Check the order: SELECT, FROM, WHERE, ORDER BY.'));
    }
    return { select, from, where, order };

    function field(msg) {
      const t = peek();
      if (!t || t.t !== 'word' || KEYWORDS.includes(t.u)) fail(msg);
      p++;
      if (peek() && peek().t === 'dot') {
        p++;
        const u = peek();
        if (!u || u.t !== 'word') fail('Write the field name after the dot, for example ' + t.v + '.Name.');
        p++;
        return { table: t.v, name: u.v };
      }
      return { name: t.v };
    }
    function orExpr() { let l = andExpr(); while (eatKw('OR')) l = { op: 'or', l, r: andExpr() }; return l; }
    function andExpr() { let l = notExpr(); while (eatKw('AND')) l = { op: 'and', l, r: notExpr() }; return l; }
    function notExpr() { if (eatKw('NOT')) return { op: 'not', e: notExpr() }; return cmp(); }
    function cmp() {
      if (peek() && peek().t === 'lp') { p++; const e = orExpr(); if (!peek() || peek().t !== 'rp') fail('A bracket in the WHERE clause is not closed.'); p++; return e; }
      const a = operand();
      let op;
      const t = peek();
      if (t && t.t === 'op') { op = t.v; p++; }
      else if (isKw('CONTAINS')) { op = 'contains'; p++; }
      else fail('A condition needs a comparison such as =, <, >, <=, >= or CONTAINS between two values.');
      return { op: 'cmp', c: op, a, b: operand() };
    }
    function operand() {
      const t = peek();
      if (!t) fail('The condition is unfinished: write a field or a value to compare.');
      if (t.t === 'num') { p++; return { lit: t.v }; }
      if (t.t === 'str') { p++; return { lit: t.v, isStr: true }; }
      if (t.t === 'word' && !KEYWORDS.includes(t.u)) return { f: field('') };
      fail('Expected a field name or a value in the condition.');
    }
  }

  const iso = s => {
    const m = /^\s*(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})\s*$/.exec(s);
    if (!m) return null;
    return m[3] + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0');
  };
  function fmt(v, type) {
    if (v === null || v === undefined) return '';
    if (type === 'money') return '$' + Number(v).toFixed(2);
    if (type === 'real') return Number(v).toFixed(1);
    if (type === 'dec2') return Number(v).toFixed(2);
    if (type === 'date') return v.slice(8, 10) + '/' + v.slice(5, 7) + '/' + v.slice(0, 4);
    return String(v);
  }

  function run(sql, db) {
    const q = parse(tokenise(sql));
    const tabs = q.from.map(n => {
      const key = Object.keys(db).find(k => k.toLowerCase() === n.toLowerCase());
      if (!key) fail('There is no table called "' + n + '". The tables are: ' + Object.keys(db).join(', ') + '.');
      return { key, t: db[key] };
    });
    const seen = {};
    tabs.forEach(t => { if (seen[t.key]) fail('The table ' + t.key + ' is listed twice in FROM.'); seen[t.key] = 1; });

    // Resolve a field to (table index, column index)
    function resolve(f, inCondition) {
      const hits = [];
      tabs.forEach((tb, ti) => {
        if (f.table && tb.key.toLowerCase() !== f.table.toLowerCase()) return;
        tb.t.cols.forEach((c, ci) => { if (c.n.toLowerCase() === f.name.toLowerCase()) hits.push([ti, ci]); });
      });
      if (f.table && !tabs.some(tb => tb.key.toLowerCase() === f.table.toLowerCase())) fail('The table ' + f.table + ' is used in the query but is not listed in FROM.');
      if (!hits.length) {
        const all = tabs.map(tb => tb.key + ': ' + tb.t.cols.map(c => c.n).join(', ')).join('; ');
        fail('There is no field called "' + (f.table ? f.table + '.' : '') + f.name + '" in the tables listed in FROM.' + (inCondition && !f.table ? ' If ' + f.name + ' is a value to search for, put it in single quotes: \'' + f.name + '\'.' : '') + ' Fields available: ' + all + '.');
      }
      if (hits.length > 1) fail('The field "' + f.name + '" is in more than one table. Write the table name first, for example ' + tabs[hits[0][0]].key + '.' + f.name + '.');
      return { ti: hits[0][0], ci: hits[0][1], type: tabs[hits[0][0]].t.cols[hits[0][1]].type };
    }

    const cols = [];
    q.select.forEach(s => {
      if (s.star) tabs.forEach((tb, ti) => tb.t.cols.forEach((c, ci) => cols.push({ label: c.n, ti, ci, type: c.type })));
      else { const r = resolve(s); cols.push({ label: tabs[r.ti].t.cols[r.ci].n, ti: r.ti, ci: r.ci, type: r.type }); }
    });

    // Prepare the condition once, resolving fields
    function prep(e) {
      if (!e) return null;
      if (e.op === 'and' || e.op === 'or') return { op: e.op, l: prep(e.l), r: prep(e.r) };
      if (e.op === 'not') return { op: 'not', e: prep(e.e) };
      const side = o => o.f ? { f: resolve(o.f, true) } : { lit: o.lit, isStr: !!o.isStr };
      const a = side(e.a), b = side(e.b);
      // Literals take the type of the field they are compared with
      const coerce = (lit, other) => {
        if (!lit.f && other.f) {
          if (other.f.type === 'date' && lit.isStr) { const d = iso(lit.lit); if (!d) fail('A date should be written day/month/year, for example \'10/09/2026\'.'); return { lit: d, isStr: true }; }
          if ((other.f.type === 'int' || other.f.type === 'real' || other.f.type === 'money' || other.f.type === 'dec2') && lit.isStr) fail('"' + lit.lit + '" is text, but this field holds numbers. Write the number without quotes.');
          if (other.f.type === 'text' && !lit.isStr) fail('This field holds text, so write the value in single quotes, for example \'' + lit.lit + '\'.');
        }
        return lit;
      };
      return { op: 'cmp', c: e.c, a: a.f ? a : coerce(a, b), b: b.f ? b : coerce(b, a) };
    }
    const cond = prep(q.where);
    const val = (o, row) => o.f ? row[o.f.ti][o.f.ci] : o.lit;
    function test(e, row) {
      if (!e) return true;
      if (e.op === 'and') return test(e.l, row) && test(e.r, row);
      if (e.op === 'or') return test(e.l, row) || test(e.r, row);
      if (e.op === 'not') return !test(e.e, row);
      let x = val(e.a, row), y = val(e.b, row);
      if (typeof x === 'string' && typeof y === 'string') { x = x.toLowerCase(); y = y.toLowerCase(); }
      switch (e.c) {
        case '=': return x === y;
        case '<>': return x !== y;
        case '<': return x < y;
        case '<=': return x <= y;
        case '>': return x > y;
        case '>=': return x >= y;
        case 'contains': return String(x).includes(String(y));
      }
      return false;
    }

    // Product of the tables, then filter
    let total = 1;
    tabs.forEach(tb => { total *= Math.max(1, tb.t.rows.length); });
    if (total > 400000) fail('Those tables multiply to too many combinations. Add conditions that match the key fields.');
    let combos = [[]];
    tabs.forEach(tb => { const next = []; combos.forEach(c => tb.t.rows.forEach(r => next.push(c.concat([r])))); combos = next; });
    let rows = combos.filter(c => test(cond, c));

    if (q.order.length) {
      const keys = q.order.map(o => ({ r: resolve(o.f), dir: o.dir === 'DESC' ? -1 : 1 }));
      rows.sort((a, b) => {
        for (const k of keys) {
          let x = a[k.r.ti][k.r.ci], y = b[k.r.ti][k.r.ci];
          if (typeof x === 'string') { x = x.toLowerCase(); y = y.toLowerCase(); }
          if (x < y) return -k.dir; if (x > y) return k.dir;
        }
        return 0;
      });
    }
    const raw = rows.map(c => cols.map(col => c[col.ti][col.ci]));
    return {
      columns: cols.map(c => c.label),
      types: cols.map(c => c.type),
      rows: rows.map(c => cols.map(col => fmt(c[col.ti][col.ci], col.type))),
      raw,
      tables: tabs.map(t => t.key),
      ordered: q.order.length > 0,
      from: tabs.length
    };
  }

  /* ---------- A practice lab: tasks, an editor, results and checking ----------
     MiniSQL.lab(host, { cls, title, lead, db, keys: { Table: ['PK field'] }, tasks: [{ q, answer, hint }], free: true })
     Needs js/labs.js. The expected result of each task is produced by running its model answer, so the answer and the data
     can never disagree. */
  function lab(host, cfg) {
    const L = window.Labs, el = L.el;
    L.shell(host, cfg.cls, cfg.title, cfg.lead);
    const names = Object.keys(cfg.db);

    const schema = el('div', 'lab-panel sql-schema');
    schema.append(el('h5', null, 'Tables'));
    const ul = el('ul', 'sql-tables');
    names.forEach(n => {
      const li = el('li');
      li.append(el('strong', null, n), document.createTextNode(' ('));
      cfg.db[n].cols.forEach((c, i) => {
        if (i) li.append(document.createTextNode(', '));
        const isKey = (cfg.keys && cfg.keys[n] || []).includes(c.n);
        li.append(isKey ? el('u', null, c.n) : document.createTextNode(c.n));
      });
      li.append(document.createTextNode(')'));
      ul.append(li);
    });
    schema.append(ul, el('p', 'lab-note', 'Underlined fields are primary keys. Fields with the same name in two tables are the link between them.'));
    const data = el('details', 'sql-data');
    data.append(el('summary', null, 'Show the data in the tables'));
    names.forEach(n => {
      const t = cfg.db[n];
      const tab = L.table(t.cols.map(c => c.n), { raw: true, num: t.cols.map((c, i) => ['int', 'real', 'money', 'dec2'].includes(c.type) ? i : -1).filter(i => i >= 0) });
      t.rows.forEach(r => tab.add(r.map((v, i) => fmt(v, t.cols[i].type))));
      data.append(el('p', 'sql-data-name', n), tab.wrap);
    });
    schema.append(data);

    const tasks = cfg.tasks.map(t => {
      let exp = null;
      try { exp = run(t.answer, cfg.db); } catch (e) { console.error('MiniSQL task answer failed:', t.answer, e); }
      return Object.assign({ exp }, t);
    });
    const chips = el('div', 'lab-chips');
    chips.setAttribute('role', 'group'); chips.setAttribute('aria-label', 'Task');
    const chipBtns = [];
    const list = tasks.map((t, i) => ({ label: String(i + 1), i }));
    if (cfg.free) list.push({ label: 'Free practice', i: -1 });
    list.forEach(item => {
      const b = el('button', 'lab-chip', item.label === 'Free practice' ? item.label : 'Task ' + item.label);
      b.type = 'button'; b.addEventListener('click', () => pick(item.i)); chips.append(b); chipBtns.push([item.i, b]);
    });
    const task = el('p', 'sql-task');
    const ed = el('div', 'lab-field');
    const lbl = el('label', null, 'Your query'); const ta = el('textarea', 'sql-editor'); lbl.htmlFor = ta.id = 'sql-ed-' + Math.random().toString(36).slice(2, 7);
    ta.rows = 5; ta.spellcheck = false; ta.autocapitalize = 'off'; ta.setAttribute('autocomplete', 'off'); ta.setAttribute('autocorrect', 'off');
    ta.placeholder = 'SELECT ...\nFROM ...\nWHERE ...\nORDER BY ...';
    ed.append(lbl, ta);
    const actions = el('div', 'lab-actions');
    const bRun = el('button', 'lab-btn lab-btn--primary', 'Run query'), bHint = el('button', 'lab-btn', 'Hint'), bModel = el('button', 'lab-btn', 'Show a model answer'), bClear = el('button', 'lab-btn lab-btn--quiet', 'Clear');
    [bRun, bHint, bModel, bClear].forEach(b => { b.type = 'button'; actions.append(b); });
    const aux = el('div', 'sql-aux'); aux.hidden = true;
    const out = el('div', 'sql-out'); out.setAttribute('aria-live', 'polite');
    const split = el('div', 'lab-split lab-split--wide-left');
    const left = el('div', 'lab-stack'); left.append(chips, task, ed, actions, aux, out);
    split.append(left, schema);
    host.append(split);

    let cur = 0;
    function pick(i) {
      cur = i;
      chipBtns.forEach(([k, b]) => b.setAttribute('aria-pressed', String(k === i)));
      task.textContent = i >= 0 ? 'Task ' + (i + 1) + ': ' + tasks[i].q : 'Free practice: write any query you like on these tables. Use only SELECT, FROM, WHERE and ORDER BY.';
      bHint.hidden = bModel.hidden = i < 0;
      aux.hidden = true; aux.replaceChildren(); out.replaceChildren();
      ta.value = '';
    }
    function show(res) {
      const tab = L.table(res.columns, { raw: true, num: res.types.map((t, i) => ['int', 'real', 'money', 'dec2'].includes(t) ? i : -1).filter(i => i >= 0) });
      res.rows.slice(0, 40).forEach(r => tab.add(r));
      const wrap = el('div', 'sql-result');
      wrap.append(tab.wrap, el('p', 'lab-note', res.rows.length + (res.rows.length === 1 ? ' row' : ' rows') + (res.rows.length > 40 ? ' (the first 40 are shown)' : '') + ' returned.'));
      return wrap;
    }
    function norm(res) { return res.rows.map(r => r.join('\u0001')); }
    function judge(res) {
      const t = cur >= 0 ? tasks[cur] : null;
      if (!t || !t.exp) return null;
      const e = t.exp;
      if (res.columns.length !== e.columns.length) return ['is-warn', 'Your query displays ' + res.columns.length + (res.columns.length === 1 ? ' field' : ' fields') + ', but the task asks for ' + e.columns.length + '. Check the list after SELECT.'];
      const a = norm(res), b = norm(e);
      if (a.length !== b.length) {
        let msg = 'Your query returned ' + a.length + (a.length === 1 ? ' row' : ' rows') + ', but the expected result has ' + b.length + '. ';
        if (res.from > 1 && a.length > b.length) msg += 'When two tables are listed in FROM, WHERE must match their key fields (for example Table1.Field = Table2.Field), otherwise every row is paired with every row.';
        else msg += a.length > b.length ? 'Your search criteria are too loose: check the WHERE clause.' : 'Your search criteria are too strict: check the WHERE clause.';
        return ['is-warn', msg];
      }
      const same = a.every((v, i) => v === b[i]);
      if (same) return ['is-good', 'Correct. Your query returns exactly the expected result.'];
      const sa = a.slice().sort().join('|'), sb = b.slice().sort().join('|');
      if (sa === sb) return e.ordered ? ['is-warn', 'You have the right rows, but in the wrong order. Check ORDER BY: which field, and ASC (smallest first) or DESC (largest first)?'] : ['is-good', 'Correct. Your query returns the expected rows.'];
      return ['is-warn', 'You have the right number of rows, but some values differ from the expected result. Check which fields you display and the values in your WHERE clause.'];
    }
    function go() {
      out.replaceChildren();
      const sql = ta.value.trim();
      if (!sql) { out.append(el('div', 'lab-feedback is-info', 'Type a query first. It starts with SELECT.')); return; }
      let res;
      try { res = run(sql, cfg.db); }
      catch (e) { out.append(el('div', 'lab-feedback is-bad', e.message)); return; }
      const verdict = judge(res);
      if (verdict) out.append(el('div', 'lab-feedback ' + verdict[0], verdict[1]));
      out.append(show(res));
    }
    bRun.addEventListener('click', go);
    ta.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); go(); } });
    bClear.addEventListener('click', () => { ta.value = ''; out.replaceChildren(); ta.focus(); });
    bHint.addEventListener('click', () => { aux.hidden = false; aux.replaceChildren(el('div', 'lab-feedback is-info', 'Hint: ' + tasks[cur].hint)); });
    bModel.addEventListener('click', () => {
      aux.hidden = false; aux.replaceChildren();
      const box = el('div', 'lab-feedback is-info'); box.append(el('p', null, 'One correct answer:'));
      box.append(el('pre', 'lab-code sql-model', tasks[cur].answer));
      const use = el('button', 'lab-btn', 'Copy it into the editor'); use.type = 'button'; use.addEventListener('click', () => { ta.value = tasks[cur].answer; ta.focus(); });
      box.append(use); aux.append(box);
    });
    pick(0);
  }

  window.MiniSQL = { run, lab };
})();
