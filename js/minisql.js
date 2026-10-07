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

     MiniSQL.run(sql, db, opts)  ->  { columns: [name], rows: [[text]], raw: [[value]], tables: [name] }  or throws Error(message)
                                         opts = { extended: true } turns on the extended mode described further down
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


  /* ---------- Extended mode (opt in): the SQL of the web-development course ----------
     MiniSQL.run(sql, db, { extended: true }) also understands INNER JOIN and LEFT JOIN ... ON, GROUP BY and HAVING with COUNT, SUM, AVG,
     MAX and MIN, AS, LIKE, IS NULL, + - * / and LIMIT. As in SQLite, = compares text with capital letters mattering and LIKE does not.
     Store dates as text in year-month-day form so they sort and compare correctly. NULL is shown as NULL. */
  const XKW = ['SELECT', 'FROM', 'WHERE', 'GROUP', 'HAVING', 'ORDER', 'BY', 'LIMIT', 'AND', 'OR', 'NOT', 'ASC', 'DESC', 'AS', 'JOIN', 'INNER', 'LEFT', 'OUTER', 'ON', 'LIKE', 'IS', 'NULL', 'BETWEEN', 'IN', 'RIGHT', 'FULL'];
  const AGGS = ['COUNT', 'SUM', 'AVG', 'MAX', 'MIN'];
  const NUMERIC = ['int', 'real', 'money', 'dec2'];

  function xtokens(src) {
    src = src.replace(/[\u2018\u2019]/g, "'");
    const out = [];
    let i = 0;
    while (i < src.length) {
      const c = src[i];
      if (/\s/.test(c) || c === ';') { i++; continue; }
      if (c === "'") {
        let j = i + 1, s = '';
        for (;;) {
          if (j >= src.length) fail("A text value starts with a quote mark but never ends. Close it with another single quote ('), for example 'Games Inc'.");
          if (src[j] === "'") { if (src[j + 1] === "'") { s += "'"; j += 2; continue; } break; }
          s += src[j++];
        }
        out.push({ t: 'str', v: s }); i = j + 1; continue;
      }
      if (c === '"') fail("Use single quotes ('like this') around text and dates, not double quotes.");
      if (/[0-9]/.test(c)) { let j = i + 1; while (j < src.length && /[0-9.]/.test(src[j])) j++; out.push({ t: 'num', v: parseFloat(src.slice(i, j)) }); i = j; continue; }
      if (/[A-Za-z_]/.test(c)) { let j = i + 1; while (j < src.length && /[A-Za-z0-9_]/.test(src[j])) j++; const w = src.slice(i, j); out.push({ t: 'word', v: w, u: w.toUpperCase() }); i = j; continue; }
      const two = src.slice(i, i + 2);
      if (['<=', '>=', '<>', '!='].includes(two)) { out.push({ t: 'op', v: two === '!=' ? '<>' : two }); i += 2; continue; }
      if ('=<>'.includes(c)) { out.push({ t: 'op', v: c }); i++; continue; }
      if ('+-/'.includes(c)) { out.push({ t: 'ar', v: c }); i++; continue; }
      if (',.()*'.includes(c)) { out.push({ t: 'p', v: c }); i++; continue; }
      fail('The character "' + c + '" is not part of the SQL used in this tool.');
    }
    return out;
  }

  function xparse(tokens) {
    let p = 0;
    const peek = () => tokens[p];
    const isKw = u => peek() && peek().t === 'word' && peek().u === u;
    const eatKw = u => { if (isKw(u)) { p++; return true; } return false; };
    const isP = v => peek() && peek().t === 'p' && peek().v === v;
    const eatP = v => { if (isP(v)) { p++; return true; } return false; };
    const plain = () => { const t = peek(); return !!t && t.t === 'word' && !XKW.includes(t.u); };
    const at = (k, kind, v) => tokens[p + k] && tokens[p + k].t === kind && tokens[p + k].v === v;
    const BOOL = ['and', 'or', 'not', 'cmp', 'like', 'isnull'];

    if (!eatKw('SELECT')) fail('A query starts with SELECT, followed by the fields you want to display.');
    const select = [];
    for (;;) {
      if (isP('*')) { p++; select.push({ star: true }); }
      else if (plain() && at(1, 'p', '.') && at(2, 'p', '*')) { select.push({ star: true, table: peek().v }); p += 3; }
      else {
        const e = add();
        let alias = null;
        if (eatKw('AS')) { if (!plain()) fail('Write a name for the new column after AS, for example AS Total.'); alias = tokens[p++].v; }
        select.push({ e, alias });
      }
      if (!eatP(',')) break;
    }
    if (!eatKw('FROM')) fail('After the fields to display, write FROM and the table the fields come from.');
    const tname = () => { if (!plain()) fail('Write the name of a table here.'); return tokens[p++].v; };
    const tables = [{ name: tname(), kind: 'first' }];
    for (;;) {
      if (eatP(',')) { tables.push({ name: tname(), kind: 'cross' }); continue; }
      if (isKw('RIGHT') || isKw('FULL')) fail('RIGHT and FULL joins are not used in this course. Swap the two tables and use LEFT JOIN.');
      let kind;
      if (eatKw('INNER')) { if (!eatKw('JOIN')) fail('INNER must be followed by JOIN.'); kind = 'inner'; }
      else if (eatKw('LEFT')) { eatKw('OUTER'); if (!eatKw('JOIN')) fail('LEFT must be followed by JOIN.'); kind = 'left'; }
      else if (eatKw('JOIN')) kind = 'inner';
      else break;
      const name = tname();
      if (!eatKw('ON')) fail('A join needs ON and the condition that matches the key fields, for example ON Games.Developer_ID = Developers.Developer_ID.');
      tables.push({ name, kind, on: orExpr() });
    }
    const where = eatKw('WHERE') ? orExpr() : null;
    const group = [], order = [];
    let having = null, limit = null;
    if (eatKw('GROUP')) { if (!eatKw('BY')) fail('GROUP must be followed by BY: GROUP BY Field.'); for (;;) { group.push(add()); if (!eatP(',')) break; } }
    if (eatKw('HAVING')) having = orExpr();
    if (eatKw('ORDER')) {
      if (!eatKw('BY')) fail('ORDER must be followed by BY: ORDER BY Field ASC (or DESC).');
      for (;;) { const e = add(); let dir = 1; if (eatKw('DESC')) dir = -1; else eatKw('ASC'); order.push({ e, dir }); if (!eatP(',')) break; }
    }
    if (eatKw('LIMIT')) { const t = peek(); if (!t || t.t !== 'num') fail('LIMIT must be followed by a number of rows.'); p++; limit = t.v; }
    if (p < tokens.length) {
      const t = tokens[p];
      fail('Unexpected "' + (t.v !== undefined ? t.v : t.t) + '". ' + (t.u === 'AND' || t.u === 'OR' ? 'Put AND and OR inside the WHERE clause.' : t.t === 'word' && !XKW.includes(t.u) ? 'Table aliases are not used here; write the table name before a field, for example Games.Name.' : 'Check the order of the clauses: SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT.'));
    }
    return { select, tables, where, group, having, order, limit };

    function orExpr() { let l = andExpr(); while (eatKw('OR')) l = { k: 'or', l, r: andExpr() }; return l; }
    function andExpr() { let l = notExpr(); while (eatKw('AND')) l = { k: 'and', l, r: notExpr() }; return l; }
    function notExpr() { if (eatKw('NOT')) return { k: 'not', e: notExpr() }; return cmp(); }
    function cmp() {
      const a = add(), t = peek();
      if (t && t.t === 'op') {
        p++;
        if (isKw('NULL')) fail('To test for a missing value write IS NULL (or IS NOT NULL). A comparison with = NULL never matches.');
        return { k: 'cmp', c: t.v, l: a, r: add() };
      }
      if (isKw('LIKE') || (isKw('NOT') && tokens[p + 1] && tokens[p + 1].u === 'LIKE')) { const not = eatKw('NOT'); p++; return { k: 'like', not, l: a, r: add() }; }
      if (eatKw('IS')) { const not = eatKw('NOT'); if (!eatKw('NULL')) fail('IS must be followed by NULL or NOT NULL.'); return { k: 'isnull', not, e: a }; }
      if (isKw('BETWEEN')) fail('BETWEEN is not used in this tool. Write two conditions joined by AND, for example Cost >= 20 AND Cost <= 30.');
      if (isKw('IN')) fail('IN is not used in this tool. Write the conditions joined by OR.');
      if (BOOL.includes(a.k)) return a;
      fail('A condition needs a comparison such as =, <>, <, >, <=, >=, LIKE or IS NULL between two values.');
    }
    function add() {
      let l = mul();
      while (peek() && peek().t === 'ar' && (peek().v === '+' || peek().v === '-')) { const op = tokens[p++].v; l = { k: 'bin', op, l, r: mul() }; }
      return l;
    }
    function mul() {
      let l = unary();
      while ((peek() && peek().t === 'ar' && peek().v === '/') || isP('*')) { const op = tokens[p++].v; l = { k: 'bin', op, l, r: unary() }; }
      return l;
    }
    function unary() { if (peek() && peek().t === 'ar' && peek().v === '-') { p++; return { k: 'neg', e: unary() }; } return atom(); }
    function atom() {
      const t = peek();
      if (!t) fail('The query is unfinished: write a field or a value here.');
      if (t.t === 'num') { p++; return { k: 'num', v: t.v }; }
      if (t.t === 'str') { p++; return { k: 'str', v: t.v }; }
      if (isP('(')) { p++; const e = orExpr(); if (!eatP(')')) fail('A bracket is not closed.'); return e; }
      if (t.t === 'word' && AGGS.includes(t.u) && at(1, 'p', '(')) {
        p += 2;
        let arg = null;
        if (isP('*')) { if (t.u !== 'COUNT') fail(t.u + '(*) is not allowed. Only COUNT can use *; give ' + t.u + ' a field.'); p++; }
        else arg = add();
        if (!eatP(')')) fail('The bracket after ' + t.u + ' is not closed.');
        return { k: 'agg', fn: t.u, arg };
      }
      if (t.t === 'word' && !XKW.includes(t.u)) {
        p++;
        if (isP('.')) { p++; const u = peek(); if (!u || u.t !== 'word') fail('Write the field name after the dot, for example ' + t.v + '.Name.'); p++; return { k: 'field', table: t.v, name: u.v }; }
        return { k: 'field', name: t.v };
      }
      fail('Expected a field name or a value here, but found "' + (t.v !== undefined ? t.v : t.t) + '".');
    }
  }

  function runExt(sql, db, opts) {
    const pks = (opts && opts.keys) || {};
    const q = xparse(xtokens(sql));
    const names = Object.keys(db);
    const tabs = q.tables.map(tb => {
      const key = names.find(k => k.toLowerCase() === tb.name.toLowerCase());
      if (!key) fail('There is no table called "' + tb.name + '". The tables are: ' + names.join(', ') + '.');
      return { key, t: db[key], kind: tb.kind, on: tb.on };
    });
    tabs.forEach((a, i) => tabs.forEach((b, j) => { if (j > i && a.key === b.key) fail('The table ' + a.key + ' is used twice. Each table can appear once in a query here.'); }));
    const colName = r => tabs[r.ti].key + '.' + tabs[r.ti].t.cols[r.ci].n;

    function resolve(f, upto) {
      const hits = [];
      tabs.forEach((tb, ti) => {
        if (ti > upto) return;
        if (f.table && tb.key.toLowerCase() !== f.table.toLowerCase()) return;
        tb.t.cols.forEach((c, ci) => { if (c.n.toLowerCase() === f.name.toLowerCase()) hits.push([ti, ci]); });
      });
      if (f.table) {
        const ti = tabs.findIndex(tb => tb.key.toLowerCase() === f.table.toLowerCase());
        if (ti < 0) fail('The table ' + f.table + ' is used in the query but is not in FROM or a JOIN.');
        if (ti > upto) fail('This ON condition uses ' + tabs[ti].key + ' before it has been joined. Match the new table with one that is already listed.');
      }
      if (!hits.length) fail('There is no field called "' + (f.table ? f.table + '.' : '') + f.name + '" in the tables of this query. The fields are: ' + tabs.map(tb => tb.key + ' (' + tb.t.cols.map(c => c.n).join(', ') + ')').join('; ') + '.');
      if (hits.length > 1) fail('The field "' + f.name + '" is in more than one table. Write the table name first, for example ' + tabs[hits[0][0]].key + '.' + f.name + '.');
      return { ti: hits[0][0], ci: hits[0][1], type: tabs[hits[0][0]].t.cols[hits[0][1]].type };
    }
    const hasAgg = n => !!n && (n.k === 'agg' || [n.l, n.r, n.e, n.arg].some(hasAgg));
    function prep(n, upto, allowAgg, aliases) {
      if (!n) return n;
      switch (n.k) {
        case 'field': {
          if (aliases && !n.table) { const i = aliases.findIndex(a => a && a.toLowerCase() === n.name.toLowerCase()); if (i >= 0) return { k: 'alias', i }; }
          n.r = resolve(n, upto); return n;
        }
        case 'agg':
          if (!allowAgg) fail('Functions such as ' + n.fn + ' work on groups of rows, so they cannot be used in WHERE or ON. WHERE keeps single rows; use HAVING to keep or drop groups.');
          if (n.arg) { if (hasAgg(n.arg)) fail('A function such as SUM cannot be placed inside another one.'); n.arg = prep(n.arg, upto, false, null); }
          return n;
        case 'cmp': case 'like': {
          n.l = prep(n.l, upto, allowAgg, aliases); n.r = prep(n.r, upto, allowAgg, aliases);
          if (n.k === 'cmp') {
            const check = (f, o) => {
              if (f.k !== 'field' || !f.r) return;
              if (NUMERIC.includes(f.r.type) && o.k === 'str') fail('"' + o.v + '" is text, but ' + colName(f.r) + ' holds numbers. Write the number without quotes.');
              if (f.r.type === 'text' && o.k === 'num') fail(colName(f.r) + ' holds text, so write the value in single quotes, for example \'' + o.v + '\'.');
            };
            check(n.l, n.r); check(n.r, n.l);
          }
          return n;
        }
        case 'bin': case 'and': case 'or': n.l = prep(n.l, upto, allowAgg, aliases); n.r = prep(n.r, upto, allowAgg, aliases); return n;
        case 'not': case 'neg': case 'isnull': n.e = prep(n.e, upto, allowAgg, aliases); return n;
        default: return n;
      }
    }

    // Evaluate an expression for one row (cx.row) or one group of rows (cx.group)
    let sel;
    const isNum = v => typeof v === 'number';
    const round = v => Math.round(v * 1e9) / 1e9;
    function likeRe(pat) { return new RegExp('^' + pat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*').replace(/_/g, '.') + '$', 'is'); }
    function compare(c, a, b) {
      if (typeof a !== typeof b) { a = String(a); b = String(b); }
      switch (c) { case '=': return a === b; case '<>': return a !== b; case '<': return a < b; case '<=': return a <= b; case '>': return a > b; default: return a >= b; }
    }
    function agg(n, rows) {
      const vals = n.arg ? rows.map(r => ev(n.arg, { row: r })).filter(v => v != null) : rows;
      if (n.fn === 'COUNT') return vals.length;
      if (!vals.length) return null;
      if (n.fn === 'MAX') return vals.reduce((a, b) => (b > a ? b : a));
      if (n.fn === 'MIN') return vals.reduce((a, b) => (b < a ? b : a));
      if (!vals.every(isNum)) fail(n.fn + ' needs a field that holds numbers.');
      const sum = vals.reduce((a, b) => a + b, 0);
      return round(n.fn === 'AVG' ? sum / vals.length : sum);
    }
    function ev(n, cx) {
      switch (n.k) {
        case 'num': case 'str': return n.v;
        case 'field': { const rec = cx.row[n.r.ti]; return rec ? rec[n.r.ci] : null; }
        case 'alias': return ev(sel[n.i].e, cx);
        case 'agg': return agg(n, cx.group || []);
        case 'neg': { const v = ev(n.e, cx); return v == null ? null : -v; }
        case 'bin': {
          const a = ev(n.l, cx), b = ev(n.r, cx);
          if (a == null || b == null) return null;
          if (!isNum(a) || !isNum(b)) fail('Arithmetic with "' + n.op + '" needs numbers, but one side is text.');
          if (n.op === '/' && b === 0) return null;
          return round(n.op === '+' ? a + b : n.op === '-' ? a - b : n.op === '*' ? a * b : a / b);
        }
        case 'cmp': { const a = ev(n.l, cx), b = ev(n.r, cx); return a == null || b == null ? null : compare(n.c, a, b); }
        case 'like': { const a = ev(n.l, cx), b = ev(n.r, cx); if (a == null || b == null) return null; const m = likeRe(String(b)).test(String(a)); return n.not ? !m : m; }
        case 'isnull': { const v = ev(n.e, cx); return n.not ? v != null : v == null; }
        case 'and': { const a = ev(n.l, cx), b = ev(n.r, cx); return a === false || b === false ? false : a == null || b == null ? null : true; }
        case 'or': { const a = ev(n.l, cx), b = ev(n.r, cx); return a === true || b === true ? true : a == null || b == null ? null : false; }
        case 'not': { const v = ev(n.e, cx); return v == null ? null : !v; }
      }
      return null;
    }

    // Join the tables
    let rows = tabs[0].t.rows.map(r => [r]);
    for (let ti = 1; ti < tabs.length; ti++) {
      const tb = tabs[ti], on = tb.on ? prep(tb.on, ti, false, null) : null, next = [];
      if (rows.length * Math.max(1, tb.t.rows.length) > 400000) fail('Those tables multiply to too many combinations. Join them on their key fields.');
      rows.forEach(left => {
        let hit = false;
        tb.t.rows.forEach(r => { const cand = left.concat([r]); if (!on || ev(on, { row: cand }) === true) { next.push(cand); hit = true; } });
        if (!hit && tb.kind === 'left') next.push(left.concat([null]));
      });
      rows = next;
    }

    // Prepare the rest of the query
    const last = tabs.length - 1;
    const where = prep(q.where, last, false, null);
    sel = [];
    q.select.forEach(s => {
      if (s.star) {
        let any = false;
        tabs.forEach((tb, ti) => {
          if (s.table && tb.key.toLowerCase() !== s.table.toLowerCase()) return;
          tb.t.cols.forEach((c, ci) => { any = true; sel.push({ e: { k: 'field', name: c.n, r: { ti, ci, type: c.type } }, label: c.n, type: c.type }); });
        });
        if (!any) fail('There is no table called "' + s.table + '" in this query.');
      } else sel.push({ e: s.e, alias: s.alias });
    });
    const show = n => n.k === 'field' ? (n.table ? n.table + '.' : '') + n.name : n.k === 'num' ? String(n.v) : n.k === 'str' ? "'" + n.v + "'" : n.k === 'agg' ? n.fn + '(' + (n.arg ? show(n.arg) : '*') + ')' : n.k === 'neg' ? '-' + show(n.e) : n.k === 'bin' ? show(n.l) + ' ' + n.op + ' ' + show(n.r) : '?';
    const typeOf = n => {
      switch (n.k) {
        case 'field': return n.r.type;
        case 'num': return Number.isInteger(n.v) ? 'int' : 'dec2';
        case 'str': return 'text';
        case 'neg': return typeOf(n.e);
        case 'agg': { if (n.fn === 'COUNT') return 'int'; const t = n.arg ? typeOf(n.arg) : 'int'; return n.fn === 'AVG' ? (t === 'money' ? 'money' : 'dec2') : t; }
        case 'bin': { const a = typeOf(n.l), b = typeOf(n.r); if (a === 'money' || b === 'money') return 'money'; return n.op === '/' || ['real', 'dec2'].includes(a) || ['real', 'dec2'].includes(b) ? 'dec2' : 'int'; }
        default: return 'int';
      }
    };
    sel.forEach(s => { if (!s.label) { s.e = prep(s.e, last, true, null); s.label = s.alias || (s.e.k === 'field' ? tabs[s.e.r.ti].t.cols[s.e.r.ci].n : show(s.e)); s.type = typeOf(s.e); } });
    const aliases = sel.map(s => s.alias || null);
    const group = q.group.map(g => prep(g, last, false, aliases));
    const having = prep(q.having, last, true, aliases);
    const order = q.order.map(o => ({ e: prep(o.e, last, true, aliases), dir: o.dir }));
    const grouped = group.length > 0 || sel.some(s => hasAgg(s.e)) || hasAgg(having) || order.some(o => hasAgg(o.e));

    if (grouped) {
      if (q.select.some(s => s.star)) fail('SELECT * cannot be used with GROUP BY or a function such as SUM. List the fields you want.');
      const strip = (k, v) => (k === 'r' ? undefined : v);
      const same = (a, b) => a.k === b.k && (a.k === 'field' ? a.r.ti === b.r.ti && a.r.ci === b.r.ci : JSON.stringify(a, strip) === JSON.stringify(b, strip));
      // A field is also allowed when GROUP BY holds its table's primary key, because the key decides every other field in that table
      const decided = f => group.some(g => g.k === 'field' && g.r.ti === f.r.ti && (pks[tabs[g.r.ti].key] || []).some(k => k.toLowerCase() === tabs[g.r.ti].t.cols[g.r.ci].n.toLowerCase()));
      const loose = n => {
        if (!n || n.k === 'agg' || n.k === 'num' || n.k === 'str' || group.some(g => same(g, n))) return null;
        if (n.k === 'field') return decided(n) ? null : n;
        if (n.k === 'alias') return loose(sel[n.i].e);
        for (const c of [n.l, n.r, n.e]) { const f = loose(c); if (f) return f; }
        return null;
      };
      [].concat(sel.map(s => s.e), having ? [having] : [], order.map(o => o.e)).forEach(n => {
        const f = loose(n);
        if (f) fail('The field ' + colName(f.r) + ' is used here but is not in GROUP BY and is not inside COUNT, SUM, AVG, MAX or MIN. Every field that is not calculated must be listed in GROUP BY (or be decided by a primary key that is).');
      });
    }

    rows = rows.filter(r => !where || ev(where, { row: r }) === true);
    let ctxs;
    if (grouped) {
      const map = new Map();
      rows.forEach(r => { const k = group.length ? JSON.stringify(group.map(g => ev(g, { row: r }))) : 'all'; if (!map.has(k)) map.set(k, []); map.get(k).push(r); });
      if (!group.length && !map.size) map.set('all', []);
      ctxs = [...map.values()].map(rs => ({ row: rs[0] || [], group: rs }));
    } else ctxs = rows.map(r => ({ row: r, group: null }));
    if (having) ctxs = ctxs.filter(cx => ev(having, cx) === true);

    let out = ctxs.map(cx => ({ vals: sel.map(s => ev(s.e, cx)), keys: order.map(o => ev(o.e, cx)) }));
    const rank = (a, b) => (a == null ? (b == null ? 0 : -1) : b == null ? 1 : a < b ? -1 : a > b ? 1 : 0);
    if (order.length) out.sort((a, b) => { for (let i = 0; i < order.length; i++) { const c = rank(a.keys[i], b.keys[i]) * order[i].dir; if (c) return c; } return 0; });
    if (q.limit != null) out = out.slice(0, q.limit);
    const shown = (v, type) => v == null ? 'NULL' : typeof v === 'boolean' ? (v ? '1' : '0') : fmt(v, type);
    return {
      columns: sel.map(s => s.label),
      types: sel.map(s => s.type),
      rows: out.map(o => o.vals.map((v, i) => shown(v, sel[i].type))),
      raw: out.map(o => o.vals),
      tables: tabs.map(t => t.key),
      ordered: order.length > 0,
      from: tabs.some(t => t.kind === 'cross') ? tabs.length : 1
    };
  }

  function run(sql, db, opts) {
    if (opts && opts.extended) return runExt(sql, db, opts);
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
     MiniSQL.lab(host, { cls, title, lead, db, keys: { Table: ['PK field'] }, tasks: [{ q, answer, hint }], free: true, extended: true, placeholder, freeText })
     Needs js/labs.js. The expected result of each task is produced by running its model answer, so the answer and the data
     can never disagree. */
  function lab(host, cfg) {
    const L = window.Labs, el = L.el;
    L.shell(host, cfg.cls, cfg.title, cfg.lead);
    const names = Object.keys(cfg.db), ext = cfg.extended ? { extended: true, keys: cfg.keys } : undefined;

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
      try { exp = run(t.answer, cfg.db, ext); } catch (e) { console.error('MiniSQL task answer failed:', t.answer, e); }
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
    ta.placeholder = cfg.placeholder || 'SELECT ...\nFROM ...\nWHERE ...\nORDER BY ...';
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
      task.textContent = i >= 0 ? 'Task ' + (i + 1) + ': ' + tasks[i].q : cfg.freeText || 'Free practice: write any query you like on these tables. Use only SELECT, FROM, WHERE and ORDER BY.';
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
      try { res = run(sql, cfg.db, ext); }
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
