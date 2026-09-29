/* Canteen Insights: the example enterprise project (a fictional project written for these notes).
   One file, two halves. The first half is the "engine": a generated fictional dataset, the calculations behind every
   number on the dashboard, a tiny interpreter for NESA's four SQL keywords, spreadsheet-style functions, the reorder
   rules from the decision tree, the what-if model and the data-entry checks. It has no DOM code, so it can be tested
   on its own. The second half builds the dashboard, the query check and the live test table.
   Everything the page shows is written with textContent, never innerHTML, so typed text cannot inject markup.
   Example Enterprise Project. */
const EX = (function () {
  'use strict';

  /* ---------- Dates (whole days since 1 January 1970, so there are no time-zone surprises) ---------- */
  const DAY = 86400000;
  const pad = (n) => String(n).padStart(2, '0');
  const dayNum = (y, m, d) => Math.round(Date.UTC(y, m - 1, d) / DAY);
  const asDate = (n) => new Date(n * DAY);
  const fmtDate = (n) => { const d = asDate(n); return pad(d.getUTCDate()) + '/' + pad(d.getUTCMonth() + 1) + '/' + d.getUTCFullYear(); };
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fmtShort = (n) => { const d = asDate(n); return d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()]; };
  const weekdayIdx = (n) => (asDate(n).getUTCDay() + 6) % 7;            // 0 = Monday ... 6 = Sunday
  const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const DOW_LONG = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  function parseDMY(s) {
    const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(s).trim());
    if (!m) return { error: 'format' };
    const d = +m[1], mo = +m[2], y = +m[3];
    const n = dayNum(y, mo, d), back = asDate(n);
    if (back.getUTCFullYear() !== y || back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d) return { error: 'real' };
    return { n };
  }

  /* ---------- Money in whole cents, so totals are exact ---------- */
  const cents = (dollars) => Math.round(dollars * 100);
  function money(c, dp) {
    c = Math.round(c); const neg = c < 0; c = Math.abs(c);
    const dollars = Math.floor(c / 100), rest = pad(c % 100);
    const s = String(dollars).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (neg ? '-' : '') + '$' + s + (dp === 0 ? '' : '.' + rest);
  }
  const int = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  /* ---------- The fictional dataset ---------- */
  const START = dayNum(2026, 5, 4);                 // Monday 4 May 2026: week 1 of the eight fictional weeks
  const WEEKS = 8;
  const CARNIVAL = START + 4 * 7 + 2;               // Wednesday of week 5: a fictional sports carnival
  const CATS = [['C1', 'Hot food'], ['C2', 'Sandwiches'], ['C3', 'Drinks'], ['C4', 'Snacks'], ['C5', 'Fresh']];
  // ItemID, name, category, price, unit cost, perishable, typical daily demand, how much extra is prepared, on hand (stocktake)
  const ITEMS = [
    ['I01', 'Meat pie', 'C1', 4.50, 2.10, 'Y', 44, 1.05, 0],
    ['I02', 'Sausage roll', 'C1', 4.00, 1.70, 'Y', 28, 1.22, 0],
    ['I03', 'Toastie', 'C1', 4.50, 1.80, 'Y', 22, 1.28, 0],
    ['I04', 'Chicken wrap', 'C2', 6.00, 2.90, 'Y', 20, 1.16, 0],
    ['I05', 'Ham salad roll', 'C2', 5.50, 2.40, 'Y', 16, 1.30, 0],
    ['I06', 'Bottled water', 'C3', 2.50, 0.80, 'N', 34, 1.40, 58],
    ['I07', 'Fruit juice', 'C3', 3.50, 1.30, 'N', 26, 1.40, 150],
    ['I08', 'Flavoured milk', 'C3', 3.80, 1.60, 'N', 18, 1.40, 70],
    ['I09', 'Muesli bar', 'C4', 2.00, 0.70, 'N', 24, 1.40, 40],
    ['I10', 'Popcorn', 'C4', 2.50, 0.90, 'N', 16, 1.40, 95],
    ['I11', 'Fruit cup', 'C5', 3.50, 1.40, 'Y', 14, 1.36, 0],
    ['I12', 'Yoghurt', 'C5', 3.00, 1.20, 'Y', 10, 1.12, 0]
  ];
  // Monday to Friday multipliers for each category, a wet-day effect and the carnival effect
  const WEEKDAY = { C1: [0.90, 0.95, 1.00, 1.05, 1.30], C2: [1.00, 1.05, 1.00, 0.95, 0.85], C3: [0.90, 0.95, 1.00, 1.10, 1.15], C4: [1.00, 0.95, 1.00, 1.05, 1.10], C5: [1.15, 1.10, 1.00, 0.95, 0.80] };
  const ALLDAY = [0.86, 0.93, 0.98, 1.03, 1.20];          // every category is busiest on Friday and quietest on Monday
  const WEEKF = [0.96, 1.00, 0.95, 1.03, 1.07, 1.04, 1.10, 1.12];   // a gentle rise over the eight weeks
  Object.keys(WEEKDAY).forEach((c) => {                    // combine, then scale so the average weekday multiplier is 1
    const v = WEEKDAY[c].map((x, k) => x * ALLDAY[k]), mean = v.reduce((a, b) => a + b, 0) / 5;
    WEEKDAY[c] = v.map((x) => x / mean);
  });
  const WET = { C1: 1.20, C2: 1.00, C3: 0.85, C4: 1.00, C5: 1.00 };
  const CARN = { C1: 0.85, C2: 0.90, C3: 1.70, C4: 1.35, C5: 1.00 };
  const ELASTICITY = { C1: 0.8, C2: 1.0, C3: 1.4, C4: 1.3, C5: 1.1 };   // assumption used by the what-if model (see the notes)

  function mulberry32(seed) {                        // small seeded random number generator: the same seed gives the same data
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function buildDB() {
    const rnd = mulberry32(20260504);
    const db = {
      categories: CATS.map((c) => ({ CategoryID: c[0], CategoryName: c[1] })),
      items: ITEMS.map((i) => ({ ItemID: i[0], ItemName: i[1], CategoryID: i[2], UnitPrice: i[3], UnitCost: i[4], Perishable: i[5], OnHand: i[8] })),
      sales: []
    };
    let n = 0;
    for (let wk = 0; wk < WEEKS; wk++) {
      for (let dw = 0; dw < 5; dw++) {
        const date = START + wk * 7 + dw;
        const wet = rnd() < 0.2;
        ITEMS.forEach((it) => {
          const cat = it[2], base = it[6];
          let f = WEEKDAY[cat][dw];
          if (date === CARNIVAL) f *= CARN[cat];
          if (wet) f *= WET[cat];
          f *= WEEKF[wk];
          if (cat === 'C5') f *= 1 + 0.02 * wk;
          const noise = 1 + ((rnd() + rnd()) / 2 - 0.5) * 0.40;
          const demand = Math.max(0, Math.round(base * f * noise));
          const prepared = it[5] === 'Y' ? Math.round(base * it[7]) : Math.round(base * 1.4);
          const sold = Math.min(demand, prepared);
          let wasted = 0;
          if (it[5] === 'Y') wasted = prepared - sold;                        // fresh food that is not sold is thrown out
          else if (rnd() < 0.07) wasted = Math.min(prepared - sold, 1 + Math.floor(rnd() * 3));   // the odd dented or out-of-date drink or snack
          n++;
          db.sales.push({ SaleID: 'S' + String(n).padStart(4, '0'), SaleDate: date, ItemID: it[0], Prepared: prepared, Sold: sold, Wasted: wasted });
        });
      }
    }
    return db;
  }

  const itemMap = (db) => { const m = {}; db.items.forEach((i) => { m[i.ItemID] = i; }); return m; };
  const catMap = (db) => { const m = {}; db.categories.forEach((c) => { m[c.CategoryID] = c; }); return m; };
  const weekOf = (date) => Math.floor((date - START) / 7) + 1;
  const weekStart = (w) => START + (w - 1) * 7;
  const lastDate = (db) => db.sales.reduce((m, r) => Math.max(m, r.SaleDate), 0);

  /* ---------- The dashboard's calculations ---------- */
  // Filter: { from: week, to: week, cat: CategoryID or '', item: ItemID or '' }
  function normFilter(f) {
    let from = Math.min(Math.max(+f.from || 1, 1), WEEKS), to = Math.min(Math.max(+f.to || WEEKS, 1), WEEKS);
    let notice = '';
    if (from > to) { const t = from; from = to; to = t; notice = 'The From week was after the To week, so the two were swapped.'; }
    return { from: from, to: to, cat: f.cat || '', item: f.item || '', notice: notice };
  }
  // Changing the category clears an item that is not in it, so the filters can never contradict each other
  function reconcile(db, f, changed) {
    const n = normFilter(f), im = itemMap(db), cm = catMap(db);
    if (n.item && n.cat && im[n.item].CategoryID !== n.cat) {
      if (changed === 'item') { n.cat = im[n.item].CategoryID; n.notice = (n.notice + ' The category changed to ' + cm[n.cat].CategoryName + ' to match ' + im[n.item].ItemName + '.').trim(); }
      else { n.notice = (n.notice + ' The item filter was cleared because ' + im[n.item].ItemName + ' is not in ' + cm[n.cat].CategoryName + '.').trim(); n.item = ''; }
    }
    return n;
  }
  function rowsFor(db, f, ignoreCatItem) {
    f = normFilter(f);
    const items = itemMap(db);
    const out = [];
    db.sales.forEach((r) => {
      const w = weekOf(r.SaleDate);
      if (w < f.from || w > f.to) return;
      const it = items[r.ItemID];
      if (!ignoreCatItem) {
        if (f.cat && it.CategoryID !== f.cat) return;
        if (f.item && it.ItemID !== f.item) return;
      }
      out.push({ rec: r, item: it, week: w, dow: weekdayIdx(r.SaleDate), revC: r.Sold * cents(it.UnitPrice), costC: r.Wasted * cents(it.UnitCost) });
    });
    return out;
  }
  function totals(rows) {
    const t = { n: rows.length, revC: 0, sold: 0, prepared: 0, wasted: 0, wasteC: 0 };
    rows.forEach((r) => { t.revC += r.revC; t.sold += r.rec.Sold; t.prepared += r.rec.Prepared; t.wasted += r.rec.Wasted; t.wasteC += r.costC; });
    t.wastePct = t.prepared > 0 ? t.wasted * 100 / t.prepared : null;
    return t;
  }
  function kpis(db, f) {
    f = normFilter(f);
    const rows = rowsFor(db, f);
    const t = totals(rows);
    const per = {};
    rows.forEach((r) => { per[r.item.ItemID] = (per[r.item.ItemID] || 0) + r.rec.Sold; });
    let top = null;
    Object.keys(per).sort().forEach((id) => { if (!top || per[id] > top.units) top = { id: id, name: itemMap(db)[id].ItemName, units: per[id] }; });
    t.top = top;
    // Compare with the same number of weeks just before the chosen range, when there are that many
    const len = f.to - f.from + 1;
    if (f.from - len >= 1) {
      const prev = totals(rowsFor(db, { from: f.from - len, to: f.from - 1, cat: f.cat, item: f.item }));
      t.prev = { from: f.from - len, to: f.from - 1, revC: prev.revC, wastePct: prev.wastePct };
    } else t.prev = null;
    return t;
  }
  function byDay(rows) {
    const m = new Map();
    rows.forEach((r) => {
      const d = m.get(r.rec.SaleDate) || { date: r.rec.SaleDate, week: r.week, dow: r.dow, revC: 0, sold: 0 };
      d.revC += r.revC; d.sold += r.rec.Sold; m.set(r.rec.SaleDate, d);
    });
    return Array.from(m.values()).sort((a, b) => a.date - b.date);
  }
  function byCategory(db, f) {
    const rows = rowsFor(db, { from: f.from, to: f.to }, true);
    const cm = catMap(db), out = {};
    db.categories.forEach((c) => { out[c.CategoryID] = { id: c.CategoryID, name: c.CategoryName, revC: 0, sold: 0 }; });
    rows.forEach((r) => { const o = out[r.item.CategoryID]; o.revC += r.revC; o.sold += r.rec.Sold; });
    void cm;
    return Object.keys(out).map((k) => out[k]);
  }
  function pivot(rows, db) {
    const cells = {}, rowT = {}, colT = [0, 0, 0, 0, 0]; let grand = 0, revGrand = 0;
    const revCells = {}, revRow = {}, revCol = [0, 0, 0, 0, 0];
    const ids = [];
    rows.forEach((r) => {
      const id = r.item.ItemID;
      if (!cells[id]) { cells[id] = [0, 0, 0, 0, 0]; revCells[id] = [0, 0, 0, 0, 0]; rowT[id] = 0; revRow[id] = 0; ids.push(id); }
      cells[id][r.dow] += r.rec.Sold; revCells[id][r.dow] += r.revC;
      rowT[id] += r.rec.Sold; revRow[id] += r.revC;
      colT[r.dow] += r.rec.Sold; revCol[r.dow] += r.revC; grand += r.rec.Sold; revGrand += r.revC;
    });
    ids.sort();
    void db;
    return { ids: ids, units: { cells: cells, rowT: rowT, colT: colT, grand: grand }, rev: { cells: revCells, rowT: revRow, colT: revCol, grand: revGrand } };
  }

  /* ---------- Reorder rules: this function is the decision tree on the page ---------- */
  // Perishable? -> waste last week over 10%? -> order to forecast / order forecast + 10%
  // Not perishable? -> days of stock left under 3? -> Reorder now; under 5? -> Reorder soon; otherwise Hold
  function decide(perishable, wastePct, daysCover) {
    if (perishable) return wastePct > 10 ? 'forecast' : 'buffer';
    if (daysCover < 3) return 'now';
    if (daysCover < 5) return 'soon';
    return 'hold';
  }
  const ACTIONS = { now: 'Reorder now', soon: 'Reorder soon', hold: 'Hold', forecast: 'Order to forecast', buffer: 'Order forecast + 10%' };
  const URGENCY = { now: 0, soon: 1, forecast: 2, buffer: 3, hold: 4 };
  function reorderList(db, f) {
    f = normFilter(f);
    const dates = Array.from(new Set(db.sales.map((r) => r.SaleDate))).sort((a, b) => a - b);
    const last10 = new Set(dates.slice(-10)), last5 = new Set(dates.slice(-5));
    const out = [];
    db.items.forEach((it) => {
      if (f.cat && it.CategoryID !== f.cat) return;
      if (f.item && it.ItemID !== f.item) return;
      let sold10 = 0, prep5 = 0, waste5 = 0;
      db.sales.forEach((r) => {
        if (r.ItemID !== it.ItemID) return;
        if (last10.has(r.SaleDate)) sold10 += r.Sold;
        if (last5.has(r.SaleDate)) { prep5 += r.Prepared; waste5 += r.Wasted; }
      });
      const avg = sold10 / 10;                                               // average units sold per trading day, last 10 days
      const perishable = it.Perishable === 'Y';
      const wastePct = prep5 > 0 ? waste5 * 100 / prep5 : 0;
      const days = avg > 0 ? it.OnHand / avg : Infinity;
      const key = decide(perishable, wastePct, days);
      let qty = 0, why;
      if (key === 'now' || key === 'soon') { qty = Math.max(1, Math.ceil((sold10 * 6 - it.OnHand * 10) / 10)); why = 'Not perishable. ' + (Math.round(days * 10) / 10).toFixed(1) + ' days of stock left (' + it.OnHand + ' on hand, ' + avg.toFixed(1) + ' sold a day): under ' + (key === 'now' ? '3' : '5') + '.'; }
      else if (key === 'hold') why = 'Not perishable. ' + (days === Infinity ? 'No sales in the last 10 days' : (Math.round(days * 10) / 10).toFixed(1) + ' days of stock left') + ': 5 or more.';
      else if (key === 'forecast') { qty = Math.ceil(sold10 / 2); why = 'Perishable. Waste last week was ' + wastePct.toFixed(1) + '%, over 10%.'; }
      else { qty = Math.ceil(sold10 * 11 / 20); why = 'Perishable. Waste last week was ' + wastePct.toFixed(1) + '%, 10% or less.'; }
      out.push({ item: it, key: key, action: ACTIONS[key], qty: qty, avg: avg, days: days, wastePct: wastePct, perishable: perishable, why: why });
    });
    out.sort((a, b) => URGENCY[a.key] - URGENCY[b.key] || (a.days - b.days) || a.item.ItemID.localeCompare(b.item.ItemID));
    return out;
  }

  /* ---------- What-if model (a simple, stated model, not a prediction) ---------- */
  // Demand at a new price = current daily demand x (old price / new price) ^ elasticity; units sold = the smaller of demand and prepared.
  function whatIfBase(db, itemId, f) {
    f = normFilter(f);
    const it = itemMap(db)[itemId];
    const rows = rowsFor(db, { from: f.from, to: f.to, item: itemId }, false);
    const days = new Set(rows.map((r) => r.rec.SaleDate)).size;
    const t = totals(rows);
    if (!it || days === 0) return null;
    return { item: it, days: days, demand: t.sold / days, prepared: t.prepared / days, wasteRate: t.prepared > 0 ? t.wasted / t.prepared : 0, weeklyRevC: t.revC / days * 5, weeklyWasteUnits: t.wasted / days * 5, weeklyPrepared: t.prepared / days * 5 };
  }
  function whatIf(base, price, qty) {
    const it = base.item, p0 = it.UnitPrice, e = ELASTICITY[it.CategoryID];
    const demand = base.demand * Math.pow(p0 / price, e);
    const sold = Math.min(qty, demand);
    const perishable = it.Perishable === 'Y';
    const wasted = perishable ? Math.max(0, qty - sold) : qty * base.wasteRate;
    const revC = sold * cents(price) * 5;
    const costC = (sold + wasted) * cents(it.UnitCost) * 5;
    return { demand: demand, sold: sold, wasted: wasted, prepared: qty, wastePct: qty > 0 ? wasted * 100 / qty : 0, revC: revC, marginC: revC - costC, lost: Math.max(0, demand - qty), weeklyWaste: wasted * 5, weeklyRev: revC };
  }

  /* ---------- Checking typed data (validation) ---------- */
  const LIMIT = 500;
  function validateRecord(db, raw) {
    const errors = [], bad = [];
    const err = (field, msg) => { errors.push(msg); if (bad.indexOf(field) < 0) bad.push(field); };
    const get = (k) => (raw[k] == null ? '' : String(raw[k]).trim());
    const date = get('date'), itemId = get('itemId');
    const fields = [['prepared', 'Prepared'], ['sold', 'Sold'], ['wasted', 'Wasted']];
    if (!date) err('date', 'Date is required.');                               // presence checks
    if (!itemId) err('itemId', 'Item is required.');
    fields.forEach((f) => { if (get(f[0]) === '') err(f[0], f[1] + ' is required.'); });
    let dn = null;
    if (date) {
      const p = parseDMY(date);
      if (p.error === 'format') err('date', 'Date must be written dd/mm/yyyy, for example 10/06/2026.');   // format check
      else if (p.error === 'real') err('date', date + ' is not a real date.');
      else if (weekdayIdx(p.n) > 4) err('date', date + ' is a ' + DOW_LONG[weekdayIdx(p.n)] + '; the canteen trades Monday to Friday.');
      else if (!db.sales.some((r) => r.SaleDate === p.n)) err('date', 'There is no sales record for ' + date + '. Records run from ' + fmtDate(START) + ' to ' + fmtDate(lastDate(db)) + '.');   // existence check
      else dn = p.n;
    }
    const item = itemId ? itemMap(db)[itemId] : null;
    if (itemId && !item) err('itemId', '"' + itemId + '" is not an item in the Items table.');
    const num = {};
    fields.forEach((f) => {
      const v = get(f[0]);
      if (v === '') return;
      if (/^\d+$/.test(v)) {                                                   // type check, then range check
        const x = +v;
        if (x > LIMIT) err(f[0], f[1] + ' must be between 0 and ' + LIMIT + ' (you entered ' + x + ').');
        else num[f[0]] = x;
      } else if (/^-\d+$/.test(v)) err(f[0], f[1] + ' cannot be negative (you entered ' + v + ').');
      else if (/^-?\d*\.\d+$/.test(v)) err(f[0], f[1] + ' must be a whole number of items (you entered ' + v + ').');
      else err(f[0], f[1] + ' must be a whole number, digits only (you entered "' + v + '").');
    });
    if (num.prepared != null && num.sold != null && num.wasted != null) {       // cross-field checks
      if (num.sold + num.wasted > num.prepared) { err('sold', 'Sold (' + num.sold + ') plus wasted (' + num.wasted + ') is more than prepared (' + num.prepared + ').'); bad.push('wasted', 'prepared'); }
      else if (item && item.Perishable === 'Y' && num.sold + num.wasted !== num.prepared) { err('wasted', item.ItemName + ' is perishable, so everything not sold is thrown out: wasted should be ' + (num.prepared - num.sold) + '.'); }
    }
    if (errors.length) return { ok: false, errors: errors, bad: bad };
    return { ok: true, errors: [], bad: [], record: { SaleDate: dn, ItemID: item.ItemID, Prepared: num.prepared, Sold: num.sold, Wasted: num.wasted } };
  }
  function applyCorrection(db, rec) {
    const row = db.sales.find((r) => r.SaleDate === rec.SaleDate && r.ItemID === rec.ItemID);
    const before = { Prepared: row.Prepared, Sold: row.Sold, Wasted: row.Wasted };
    row.Prepared = rec.Prepared; row.Sold = rec.Sold; row.Wasted = rec.Wasted;
    return { row: row, before: before };
  }

  /* ---------- A tiny interpreter for the SQL in the NESA Course Specifications ---------- */
  // SELECT, FROM, WHERE (with AND and =, <>, <, <=, >, >=), ORDER BY (ASC or DESC). Tables are joined in WHERE by matching key fields.
  const SCHEMA = {
    Categories: { CategoryID: 'text', CategoryName: 'text' },
    Items: { ItemID: 'text', ItemName: 'text', CategoryID: 'text', UnitPrice: 'number', UnitCost: 'number', Perishable: 'text', OnHand: 'number' },
    DailySales: { SaleID: 'text', SaleDate: 'date', ItemID: 'text', Prepared: 'number', Sold: 'number', Wasted: 'number' }
  };
  function tokenise(sql) {
    const re = /\s*('(?:[^']|'')*'|<=|>=|<>|[=<>,]|[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)?|\d+(?:\.\d+)?)/y;
    const out = []; let pos = 0; sql = sql.trim();
    while (pos < sql.length) {
      re.lastIndex = pos;
      const m = re.exec(sql);
      if (!m) throw new Error('Syntax error near "' + sql.slice(pos, pos + 12) + '"');
      out.push(m[1]); pos = re.lastIndex;
      while (/\s/.test(sql[pos] || '')) pos++;
    }
    return out;
  }
  function runSQL(db, sql) {
    const tk = tokenise(sql), up = (i) => (tk[i] || '').toUpperCase();
    let i = 0;
    const expect = (w) => { if (up(i) !== w) throw new Error('Expected ' + w + ' but found "' + (tk[i] || 'end of query') + '"'); i++; };
    const isId = (t) => /^[A-Za-z_]/.test(t || '') && !['SELECT', 'FROM', 'WHERE', 'ORDER', 'BY', 'AND', 'ASC', 'DESC', 'OR', 'NOT', 'GROUP', 'JOIN', 'SUM', 'COUNT'].includes(up(i));
    expect('SELECT');
    const selRaw = [];
    do { if (selRaw.length) i++; if (!isId(tk[i])) throw new Error('Expected a field name after SELECT'); selRaw.push(tk[i++]); } while (tk[i] === ',');
    expect('FROM');
    const tables = [];
    do { if (tables.length) i++; if (!SCHEMA[tk[i]]) throw new Error('Unknown table "' + (tk[i] || '') + '"'); tables.push(tk[i++]); } while (tk[i] === ',');
    const resolve = (name) => {
      if (name.indexOf('.') > -1) {
        const p = name.split('.');
        if (tables.indexOf(p[0]) < 0 || !SCHEMA[p[0]][p[1]]) throw new Error('Unknown field "' + name + '"');
        return { t: p[0], f: p[1] };
      }
      const hits = tables.filter((t) => SCHEMA[t][name]);
      if (hits.length !== 1) throw new Error(hits.length ? 'Field "' + name + '" is in more than one table; write Table.' + name : 'Unknown field "' + name + '"');
      return { t: hits[0], f: name };
    };
    const operand = (t) => {
      if (t[0] === "'") return { lit: t.slice(1, -1).replace(/''/g, "'"), str: true };
      if (/^\d/.test(t)) return { lit: +t, str: false };
      return { ref: resolve(t) };
    };
    const conds = [];
    if (up(i) === 'WHERE') {
      i++;
      for (;;) {
        const l = operand(tk[i++]); const op = tk[i++];
        if (!['=', '<>', '<', '<=', '>', '>='].includes(op)) throw new Error('Expected a comparison operator, found "' + (op || 'end of query') + '"');
        const r = operand(tk[i++]);
        conds.push({ l: l, op: op, r: r });
        if (up(i) === 'AND') { i++; continue; }
        break;
      }
    }
    const order = [];
    if (up(i) === 'ORDER') {
      i++; expect('BY');
      do { if (order.length) i++; const ref = resolve(tk[i++]); let dir = 1; if (up(i) === 'ASC') i++; else if (up(i) === 'DESC') { dir = -1; i++; } order.push({ ref: ref, dir: dir }); } while (tk[i] === ',');
    }
    if (i < tk.length) throw new Error('"' + tk[i] + '" is not part of the course specification SQL (SELECT, FROM, WHERE, ORDER BY)');
    const cols = selRaw.map(resolve);
    const data = { Categories: db.categories, Items: db.items, DailySales: db.sales };
    // A literal is converted to the type of the field it is compared with (dates are written dd/mm/yyyy)
    const val = (o, other, row) => {
      if (o.ref) return row[o.ref.t][o.ref.f];
      if (other && other.ref) {
        const ty = SCHEMA[other.ref.t][other.ref.f];
        if (ty === 'date') { const p = parseDMY(o.lit); if (p.error) throw new Error('"' + o.lit + '" is not a date written dd/mm/yyyy'); return p.n; }
        if (ty === 'number') return +o.lit;
      }
      return o.lit;
    };
    const test = (c, row) => {
      const a = val(c.l, c.r, row), b = val(c.r, c.l, row);
      switch (c.op) { case '=': return a === b; case '<>': return a !== b; case '<': return a < b; case '<=': return a <= b; case '>': return a > b; default: return a >= b; }
    };
    const need = (c) => [c.l, c.r].filter((o) => o.ref).map((o) => o.ref.t);
    const result = [];
    const bound = {};
    (function walk(d) {
      if (d === tables.length) { result.push(Object.assign({}, bound)); return; }
      const t = tables[d];
      const ready = conds.filter((c) => need(c).indexOf(t) > -1 && need(c).every((x) => tables.indexOf(x) <= d));
      data[t].forEach((row) => { bound[t] = row; if (ready.every((c) => test(c, bound))) walk(d + 1); });
    })(0);
    result.sort((x, y) => { for (const o of order) { const a = x[o.ref.t][o.ref.f], b = y[o.ref.t][o.ref.f]; if (a < b) return -o.dir; if (a > b) return o.dir; } return 0; });
    const rows = result.map((r) => cols.map((c) => r[c.t][c.f]));
    return { cols: cols.map((c) => c.t + '.' + c.f), types: cols.map((c) => SCHEMA[c.t][c.f]), rows: rows };
  }
  // The query that matches the dashboard's current filters
  function sqlFor(db, f) {
    f = normFilter(f);
    const cm = catMap(db), im = itemMap(db);
    const lines = [
      'SELECT DailySales.SaleDate, Items.ItemName, DailySales.Prepared, DailySales.Sold, DailySales.Wasted, Items.UnitPrice',
      'FROM DailySales, Items' + (f.cat ? ', Categories' : ''),
      'WHERE Items.ItemID = DailySales.ItemID'
    ];
    if (f.cat) lines.push('AND Categories.CategoryID = Items.CategoryID');
    lines.push("AND DailySales.SaleDate >= '" + fmtDate(weekStart(f.from)) + "'", "AND DailySales.SaleDate <= '" + fmtDate(weekStart(f.to) + 4) + "'");
    if (f.cat) lines.push("AND Categories.CategoryName = '" + cm[f.cat].CategoryName + "'");
    if (f.item) lines.push("AND Items.ItemName = '" + im[f.item].ItemName + "'");
    lines.push('ORDER BY DailySales.SaleDate ASC, Items.ItemName ASC');
    return lines.join('\n');
  }

  /* ---------- Spreadsheet-style functions (the ones in the Course Specifications) ---------- */
  const SS = {
    SUM: (a) => a.reduce((t, x) => t + x, 0),
    MAX: (a) => a.reduce((m, x) => (x > m ? x : m), -Infinity),
    COUNT: (a) => a.length,
    IF: (test, yes, no) => (test ? yes : no),
    // LOOKUP(value, sorted keys, results): the result beside the last key that is not greater than the value
    LOOKUP: (v, keys, results) => { let at = -1; for (let k = 0; k < keys.length; k++) if (keys[k] <= v) at = k; if (at < 0) throw new Error('#N/A'); return results[at]; }
  };
  // The same calculations the spreadsheet does, with its formulas written as function calls
  function sheetCheck(db, f) {
    f = normFilter(f);
    const itemsA = db.items.map((i) => i.ItemID), itemsB = db.items.map((i) => i.ItemName), itemsC = db.items.map((i) => i.CategoryID), itemsD = db.items.map((i) => cents(i.UnitPrice));
    const from = weekStart(f.from), to = weekStart(f.to) + 4;
    const cm = catMap(db);
    const catWanted = f.cat ? cm[f.cat].CategoryID : '';
    const F = [], D = [], C = [], E = [], G = [], names = [];
    db.sales.forEach((r) => {
      const price = SS.LOOKUP(r.ItemID, itemsA, itemsD);                         // =LOOKUP(B2, Items!A:A, Items!D:D)
      const cat = SS.LOOKUP(r.ItemID, itemsA, itemsC);
      const name = SS.LOOKUP(r.ItemID, itemsA, itemsB);
      const keep = SS.IF(r.SaleDate >= from, SS.IF(r.SaleDate <= to, SS.IF(catWanted === '' || cat === catWanted, SS.IF(f.item === '' || r.ItemID === f.item, 1, 0), 0), 0), 0);
      F.push(r.Sold * price * keep); D.push(r.Sold * keep); C.push(r.Prepared * keep); E.push(r.Wasted * keep); G.push(keep); names.push(name);
    });
    const perItem = itemsA.map((id) => SS.SUM(D.filter((x, k) => db.sales[k].ItemID === id)));
    const best = SS.MAX(perItem);
    return { revC: SS.SUM(F), sold: SS.SUM(D), prepared: SS.SUM(C), wasted: SS.SUM(E), rows: SS.SUM(G), top: best > 0 ? itemsB[perItem.indexOf(best)] : null, topUnits: best > 0 ? best : 0 };
  }
  // Runs the dashboard, the SQL and the spreadsheet on the same filters and reports whether they agree
  function threeWay(db, f) {
    const dash = kpis(db, f);
    const sql = sqlFor(db, f);
    const res = runSQL(db, sql);
    const ix = (n) => res.cols.indexOf(n);
    let revC = 0, sold = 0, prepared = 0, wasted = 0;
    res.rows.forEach((r) => { revC += r[ix('DailySales.Sold')] * cents(r[ix('Items.UnitPrice')]); sold += r[ix('DailySales.Sold')]; prepared += r[ix('DailySales.Prepared')]; wasted += r[ix('DailySales.Wasted')]; });
    const sh = sheetCheck(db, f);
    const q = { rows: res.rows.length, revC: revC, sold: sold, prepared: prepared, wasted: wasted, res: res };
    const same = (a, b) => a.n === b.rows && a.revC === b.revC && a.sold === b.sold && a.prepared === b.prepared && a.wasted === b.wasted;
    const dashN = { n: dash.n, revC: dash.revC, sold: dash.sold, prepared: dash.prepared, wasted: dash.wasted };
    return {
      sql: sql, dash: dash, q: q, sheet: sh,
      sqlOK: same(dashN, q),
      sheetOK: same(dashN, sh) && (dash.top ? dash.top.name === sh.top && dash.top.units === sh.topUnits : sh.top === null)
    };
  }

  return {
    START: START, WEEKS: WEEKS, DOW: DOW, DOW_LONG: DOW_LONG, CARNIVAL: CARNIVAL, ELASTICITY: ELASTICITY, ACTIONS: ACTIONS, LIMIT: LIMIT,
    buildDB: buildDB, itemMap: itemMap, catMap: catMap, weekOf: weekOf, weekStart: weekStart, lastDate: lastDate,
    fmtDate: fmtDate, fmtShort: fmtShort, money: money, int: int, cents: cents, weekdayIdx: weekdayIdx, parseDMY: parseDMY,
    normFilter: normFilter, reconcile: reconcile, rowsFor: rowsFor, totals: totals, kpis: kpis, byDay: byDay, byCategory: byCategory, pivot: pivot,
    decide: decide, reorderList: reorderList, whatIfBase: whatIfBase, whatIf: whatIf,
    validateRecord: validateRecord, applyCorrection: applyCorrection,
    runSQL: runSQL, sqlFor: sqlFor, SS: SS, sheetCheck: sheetCheck, threeWay: threeWay
  };
})();

/* ================================================================================================================
   The dashboard, the query check and the live test table (browser only)
   ================================================================================================================ */
(function () {
  'use strict';
  if (typeof document === 'undefined') return;
  const NS = 'http://www.w3.org/2000/svg';

  function h(tag, attrs, kids) {
    const e = document.createElement(tag);
    Object.keys(attrs || {}).forEach((k) => {
      const v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'text') e.textContent = v;
      else if (k === 'class') e.className = v;
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    });
    (kids || []).forEach((c) => { if (c != null) e.append(c.nodeType ? c : document.createTextNode(String(c))); });
    return e;
  }
  function sv(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach((k) => { if (attrs[k] != null) e.setAttribute(k, attrs[k]); });
    if (parent) parent.append(e);
    return e;
  }
  const clear = (n) => { while (n.firstChild) n.removeChild(n.firstChild); };
  const pct = (v, dp) => (v == null ? 'n/a' : v.toFixed(dp == null ? 1 : dp) + '%');
  const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let uid = 0;
  const nextId = (p) => p + '-' + (++uid);

  /* ---------- Shared state ---------- */
  const IM = () => EX.itemMap(state.db), CM = () => EX.catMap(state.db);
  const state = {
    db: EX.buildDB(),
    f: { from: 1, to: EX.WEEKS, cat: '', item: '' },
    notice: '', metric: 'rev', hover: null,
    wi: { item: 'I01', price: null, qty: null },
    tableOpen: false, page: 0, corrected: new Set(), log: []
  };
  const panels = [];
  function renderAll() { panels.forEach((p) => p.update()); }
  function setFilter(patch, changed) {
    const n = EX.reconcile(state.db, Object.assign({}, state.f, patch), changed);
    state.f = { from: n.from, to: n.to, cat: n.cat, item: n.item };
    state.notice = n.notice;
    state.hover = null; state.page = 0;
    if (changed === 'item' && n.item) { state.wi = { item: n.item, price: null, qty: null }; }
    renderAll();
  }
  const weeksLabel = (f) => (f.from === f.to ? 'week ' + f.from : 'weeks ' + f.from + ' to ' + f.to);
  const filterLabel = (f) => {
    const cm = CM(), im = IM();
    return weeksLabel(f) + ', ' + (f.cat ? cm[f.cat].CategoryName : 'all categories') + ', ' + (f.item ? im[f.item].ItemName : 'all items');
  };
  const metricVal = (m, revC, sold) => (m === 'rev' ? EX.money(revC, 0) : EX.int(sold));

  /* ---------- Small helpers for charts ---------- */
  function niceMax(v) {
    if (v <= 0) return 1;
    const mag = Math.pow(10, Math.floor(Math.log10(v))), n = v / mag;
    const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
    return step * mag;
  }
  function width(box) { return Math.max(260, Math.floor(box.clientWidth) || 560); }

  /* ================= Filters ================= */
  function filtersPanel() {
    const el = h('form', { class: 'ex-filters', 'aria-label': 'Dashboard filters', onsubmit: (e) => e.preventDefault() });
    const wk = (label, key) => {
      const id = nextId('ex-wk');
      const sel = h('select', { id: id });
      for (let w = 1; w <= EX.WEEKS; w++) sel.append(h('option', { value: w, text: 'Week ' + w + ' (from ' + EX.fmtShort(EX.weekStart(w)) + ')' }));
      sel.addEventListener('change', () => { const p = {}; p[key] = +sel.value; setFilter(p); });
      return { sel: sel, wrap: h('div', { class: 'ex-field' }, [h('label', { for: id, text: label }), sel]) };
    };
    const from = wk('From week', 'from'), to = wk('To week', 'to');
    const catBox = h('div', { class: 'ex-pills', role: 'group', 'aria-label': 'Category' });
    const catBtns = [['', 'All']].concat(state.db.categories.map((c) => [c.CategoryID, c.CategoryName])).map((c) => {
      const b = h('button', { type: 'button', class: 'ex-pill', 'aria-pressed': 'false', text: c[1] });
      b.addEventListener('click', () => setFilter({ cat: c[0] }, 'cat'));
      b.dataset.v = c[0]; catBox.append(b); return b;
    });
    const itemId = nextId('ex-item');
    const itemSel = h('select', { id: itemId });
    itemSel.addEventListener('change', () => setFilter({ item: itemSel.value }, 'item'));
    const metricBox = h('div', { class: 'ex-pills', role: 'group', 'aria-label': 'Measure shown in the charts and pivot table' });
    const mBtns = [['rev', 'Revenue ($)'], ['units', 'Items sold']].map((m) => {
      const b = h('button', { type: 'button', class: 'ex-pill', 'aria-pressed': 'false', text: m[1] });
      b.addEventListener('click', () => { state.metric = m[0]; renderAll(); });
      b.dataset.v = m[0]; metricBox.append(b); return b;
    });
    const reset = h('button', { type: 'button', class: 'ex-btn ex-btn-quiet', text: 'Reset filters' });
    reset.addEventListener('click', () => { state.metric = 'rev'; setFilter({ from: 1, to: EX.WEEKS, cat: '', item: '' }, 'cat'); });
    el.append(
      h('div', { class: 'ex-filter-row' }, [from.wrap, to.wrap, h('div', { class: 'ex-field' }, [h('label', { for: itemId, text: 'Item' }), itemSel])]),
      h('div', { class: 'ex-filter-row' }, [h('div', { class: 'ex-field' }, [h('span', { class: 'ex-lab', text: 'Category' }), catBox]), h('div', { class: 'ex-field' }, [h('span', { class: 'ex-lab', text: 'Show' }), metricBox]), reset])
    );
    function update() {
      from.sel.value = state.f.from; to.sel.value = state.f.to;
      catBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === state.f.cat)));
      mBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === state.metric)));
      clear(itemSel);
      itemSel.append(h('option', { value: '', text: 'All items' }));
      state.db.items.filter((i) => !state.f.cat || i.CategoryID === state.f.cat).forEach((i) => itemSel.append(h('option', { value: i.ItemID, text: i.ItemName })));
      itemSel.value = state.f.item;
    }
    return { el: el, update: update };
  }

  /* ================= Status line and KPI tiles ================= */
  function kpiPanel() {
    const status = h('p', { class: 'ex-status', role: 'status', 'aria-live': 'polite' });
    const list = h('ul', { class: 'ex-kpis', 'aria-label': 'Key figures for the current filters' });
    function tile(label, value, note, mod) {
      return h('li', { class: 'ex-kpi' + (mod ? ' ' + mod : '') }, [h('span', { class: 'ex-kpi-label', text: label }), h('span', { class: 'ex-kpi-value', text: value }), h('span', { class: 'ex-kpi-note', text: note })]);
    }
    function update() {
      const k = EX.kpis(state.db, state.f);
      status.textContent = 'Showing ' + filterLabel(state.f) + ': ' + k.n + ' records.' + (state.notice ? ' ' + state.notice : '');
      clear(list);
      const empty = k.n === 0;
      let revNote = 'No earlier weeks to compare with';
      if (empty) revNote = 'No sales match these filters';
      else if (k.prev) {
        const d = k.revC - k.prev.revC, p = k.prev.revC ? d * 100 / k.prev.revC : null;
        revNote = (d >= 0 ? 'Up ' : 'Down ') + (p == null ? '' : Math.abs(p).toFixed(1) + '% (') + EX.money(Math.abs(d), 0) + (p == null ? '' : ')') + ' on ' + weeksLabel(k.prev);
      }
      let wasteNote = 'No earlier weeks to compare with';
      if (empty) wasteNote = 'No sales match these filters';
      else if (k.prev && k.prev.wastePct != null && k.wastePct != null) {
        const d = k.wastePct - k.prev.wastePct;
        wasteNote = (d >= 0 ? 'Up ' : 'Down ') + Math.abs(d).toFixed(1) + ' points on ' + weeksLabel(k.prev);
      }
      list.append(
        tile('Revenue', empty ? 'n/a' : EX.money(k.revC), revNote),
        tile('Items sold', empty ? 'n/a' : EX.int(k.sold), empty ? 'No sales match these filters' : EX.int(k.prepared) + ' put out for sale'),
        tile('Top seller', k.top ? k.top.name : 'n/a', k.top ? EX.int(k.top.units) + ' sold' : 'No sales match these filters'),
        tile('Waste', pct(k.wastePct), empty ? 'No sales match these filters' : EX.int(k.wasted) + ' thrown out, cost ' + EX.money(k.wasteC, 0) + '. ' + wasteNote, 'is-waste')
      );
    }
    return { el: h('div', {}, [status, list]), update: update };
  }

  /* ================= Sales over time (line chart) ================= */
  function linePanel() {
    const box = h('div', { class: 'ex-chart', tabindex: '0', role: 'group' });
    const readout = h('p', { class: 'ex-readout', 'aria-live': 'polite' });
    const alt = h('details', { class: 'ex-alt' });
    const head = h('h4', { class: 'ex-card-title' });
    let days = [];
    function readoutFor(i) {
      const d = days[i];
      const when = EX.DOW_LONG[d.dow] + ' ' + EX.fmtDate(d.date) + ' (week ' + d.week + ')';
      return when + ': ' + EX.money(d.revC, 0) + ' from ' + EX.int(d.sold) + ' items' + (d.date === EX.CARNIVAL ? '. This was the fictional sports carnival day.' : '.');
    }
    function summary() {
      if (!days.length) return 'No sales match these filters.';
      let hi = days[0], lo = days[0], tot = 0, totU = 0;
      const val = (d) => (state.metric === 'rev' ? d.revC : d.sold);
      days.forEach((d) => { if (val(d) > val(hi)) hi = d; if (val(d) < val(lo)) lo = d; tot += d.revC; totU += d.sold; });
      const fmt = (d) => metricVal(state.metric, d.revC, d.sold);
      const avg = state.metric === 'rev' ? EX.money(tot / days.length, 0) : EX.int(totU / days.length);
      return 'Highest: ' + EX.DOW[hi.dow] + ' ' + EX.fmtShort(hi.date) + ', ' + fmt(hi) + '. Lowest: ' + EX.DOW[lo.dow] + ' ' + EX.fmtShort(lo.date) + ', ' + fmt(lo) + '. Average per trading day: ' + avg + '. Move over the chart, or use the left and right arrow keys, to read each day.';
    }
    function draw() {
      clear(box);
      if (!days.length) { box.append(h('p', { class: 'ex-empty', text: 'No sales match these filters.' })); return; }
      const rev = state.metric === 'rev';
      const w = width(box), hh = w < 480 ? 230 : 270;
      const m = { l: rev ? 54 : 44, r: 14, t: 18, b: 30 }, iw = w - m.l - m.r, ih = hh - m.t - m.b, n = days.length;
      const vals = days.map((d) => (rev ? d.revC / 100 : d.sold));
      const ymax = niceMax(Math.max.apply(null, vals) * 1.05);
      const x = (i) => (n === 1 ? m.l + iw / 2 : m.l + iw * i / (n - 1)), y = (v) => m.t + ih - ih * v / ymax;
      const svg = sv('svg', { viewBox: '0 0 ' + w + ' ' + hh, width: w, height: hh, class: 'ex-svg', role: 'img', 'aria-label': (rev ? 'Line chart of daily revenue in dollars. ' : 'Line chart of daily items sold. ') + summary() }, box);
      const ticks = 4;
      for (let t = 0; t <= ticks; t++) {
        const v = ymax * t / ticks, yy = y(v);
        sv('line', { x1: m.l, x2: w - m.r, y1: yy, y2: yy, class: 'ex-gl' }, svg);
        sv('text', { x: m.l - 8, y: yy + 4, 'text-anchor': 'end', class: 'ex-tick' }, svg).textContent = rev ? '$' + EX.int(v) : EX.int(v);
      }
      const single = days[days.length - 1].week === days[0].week;
      days.forEach((d, i) => {
        if (single || d.dow === 0) {
          sv('text', { x: x(i), y: hh - 8, 'text-anchor': single ? 'middle' : 'start', class: 'ex-tick' }, svg).textContent = single ? EX.DOW[d.dow] : 'W' + d.week;
        }
      });
      let path = '';
      days.forEach((d, i) => { path += (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(vals[i]).toFixed(1); });
      if (n > 1) sv('path', { d: path + 'L' + x(n - 1).toFixed(1) + ' ' + y(0) + 'L' + x(0).toFixed(1) + ' ' + y(0) + 'Z', class: 'ex-area' }, svg);
      sv('path', { d: path, class: 'ex-line' }, svg);
      if (n <= 20) days.forEach((d, i) => sv('circle', { cx: x(i), cy: y(vals[i]), r: 3.5, class: 'ex-dot' }, svg));
      // Peak label and the carnival marker
      let pk = 0; vals.forEach((v, i) => { if (v > vals[pk]) pk = i; });
      const ci = days.findIndex((d) => d.date === EX.CARNIVAL);
      if (ci >= 0) {
        sv('circle', { cx: x(ci), cy: y(vals[ci]), r: 6, class: 'ex-mark' }, svg);
        const anchor = x(ci) > w - 90 ? 'end' : x(ci) < m.l + 60 ? 'start' : 'middle';
        sv('text', { x: x(ci), y: y(vals[ci]) + 26, 'text-anchor': anchor, class: 'ex-note' }, svg).textContent = 'Carnival day';
      }
      if (pk !== ci && n > 1) {
        const anchor = x(pk) > w - 70 ? 'end' : x(pk) < m.l + 40 ? 'start' : 'middle';
        sv('text', { x: x(pk), y: y(vals[pk]) - 9, 'text-anchor': anchor, class: 'ex-note' }, svg).textContent = 'Peak ' + (rev ? '$' + EX.int(vals[pk]) : EX.int(vals[pk]));
      }
      const g = sv('g', { class: 'ex-hover', 'aria-hidden': 'true' }, svg);
      if (state.hover != null && days[state.hover]) {
        const i = state.hover;
        sv('line', { x1: x(i), x2: x(i), y1: m.t, y2: m.t + ih, class: 'ex-cross' }, g);
        sv('circle', { cx: x(i), cy: y(vals[i]), r: 6, class: 'ex-focus' }, g);
      }
      const cover = sv('rect', { x: m.l, y: m.t, width: iw, height: ih, fill: 'transparent' }, svg);
      cover.addEventListener('pointermove', (e) => {
        const r = svg.getBoundingClientRect(), px = (e.clientX - r.left) * (w / r.width);
        const i = n === 1 ? 0 : Math.min(n - 1, Math.max(0, Math.round((px - m.l) / iw * (n - 1))));
        if (i !== state.hover) { state.hover = i; redrawOnly(); }
      });
      cover.addEventListener('pointerleave', () => { if (state.hover != null) { state.hover = null; redrawOnly(); } });
    }
    function redrawOnly() { draw(); readout.textContent = state.hover != null && days[state.hover] ? readoutFor(state.hover) : summary(); }
    box.addEventListener('keydown', (e) => {
      if (!days.length) return;
      let i = state.hover;
      if (e.key === 'ArrowRight') i = i == null ? 0 : Math.min(days.length - 1, i + 1);
      else if (e.key === 'ArrowLeft') i = i == null ? days.length - 1 : Math.max(0, i - 1);
      else if (e.key === 'Home') i = 0; else if (e.key === 'End') i = days.length - 1;
      else if (e.key === 'Escape') i = null; else return;
      e.preventDefault(); state.hover = i; redrawOnly();
    });
    function update() {
      days = EX.byDay(EX.rowsFor(state.db, state.f));
      const rev = state.metric === 'rev';
      head.textContent = (rev ? 'Revenue' : 'Items sold') + ' per trading day';
      box.setAttribute('aria-label', 'Daily ' + (rev ? 'revenue' : 'items sold') + ' line chart for ' + filterLabel(state.f) + '. Use the left and right arrow keys to read each day.');
      redrawOnly();
      clear(alt);
      alt.append(h('summary', { text: 'View the daily figures as a table' }));
      const tb = h('tbody');
      days.forEach((d) => tb.append(h('tr', {}, [h('th', { scope: 'row', text: EX.DOW[d.dow] + ' ' + EX.fmtDate(d.date) }), h('td', { class: 'ex-num', text: EX.money(d.revC) }), h('td', { class: 'ex-num', text: EX.int(d.sold) })])));
      alt.append(h('div', { class: 'table-wrap ex-scroll', tabindex: '0', role: 'region', 'aria-label': 'Daily figures table' }, [h('table', {}, [h('caption', { text: 'Daily revenue and items sold for ' + filterLabel(state.f) }), h('thead', {}, [h('tr', {}, [h('th', { scope: 'col', text: 'Day' }), h('th', { scope: 'col', class: 'ex-num', text: 'Revenue' }), h('th', { scope: 'col', class: 'ex-num', text: 'Items sold' })])]), tb])]));
    }
    return { el: h('section', { class: 'ex-card', 'aria-label': 'Sales over time' }, [head, box, readout, alt]), update: update, redraw: () => { draw(); }, box: box };
  }

  /* ================= Sales by category (bar chart, also a slicer) ================= */
  function barPanel() {
    const box = h('div', { class: 'ex-chart ex-bars' });
    const head = h('h4', { class: 'ex-card-title' });
    const note = h('p', { class: 'ex-caption' });
    function draw() {
      clear(box);
      const rev = state.metric === 'rev';
      const cats = EX.byCategory(state.db, state.f).sort((a, b) => b.revC - a.revC);
      const total = cats.reduce((t, c) => t + (rev ? c.revC : c.sold), 0);
      const w = width(box), rowH = 40, labW = 96, valW = 100, hh = cats.length * rowH + 8;
      const svg = sv('svg', { viewBox: '0 0 ' + w + ' ' + hh, width: w, height: hh, class: 'ex-svg', role: 'group', 'aria-label': 'Bar chart of ' + (rev ? 'revenue' : 'items sold') + ' by category. Each bar is a button that filters the dashboard to that category.' }, box);
      const max = Math.max.apply(null, cats.map((c) => (rev ? c.revC : c.sold)).concat([1]));
      cats.forEach((c, i) => {
        const v = rev ? c.revC : c.sold, y = 4 + i * rowH, bw = Math.max(2, (w - labW - valW) * v / max);
        const on = state.f.cat === c.id, dim = state.f.cat && !on;
        const g = sv('g', { class: 'ex-bar-row' + (on ? ' is-on' : '') + (dim ? ' is-dim' : ''), role: 'button', tabindex: '0', 'aria-pressed': String(on), 'aria-label': c.name + ': ' + metricVal(state.metric, c.revC, c.sold) + ', ' + (total ? Math.round(v * 100 / total) : 0) + ' per cent of the total. ' + (on ? 'Selected. Press to clear the category filter.' : 'Press to filter to this category.') }, svg);
        sv('rect', { x: 0, y: y - 2, width: w, height: rowH - 4, rx: 6, class: 'ex-bar-hit' }, g);
        sv('text', { x: 8, y: y + 20, class: 'ex-tick ex-bar-lab' }, g).textContent = c.name;
        sv('rect', { x: labW, y: y + 6, width: bw, height: 20, rx: 3, class: 'ex-bar' }, g);
        sv('text', { x: labW + bw + 8, y: y + 21, class: 'ex-tick ex-bar-val' }, g).textContent = metricVal(state.metric, c.revC, c.sold) + ' (' + (total ? Math.round(v * 100 / total) : 0) + '%)';
        const act = () => setFilter({ cat: on ? '' : c.id }, 'cat');
        g.addEventListener('click', act);
        g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
      });
    }
    function update() {
      head.textContent = (state.metric === 'rev' ? 'Revenue' : 'Items sold') + ' by category';
      note.textContent = 'Every category for ' + weeksLabel(state.f) + '. Choose a bar to filter the whole dashboard.';
      draw();
    }
    return { el: h('section', { class: 'ex-card', 'aria-label': 'Sales by category' }, [head, box, note]), update: update, redraw: draw };
  }

  /* ================= Pivot summary: item by weekday ================= */
  function pivotPanel() {
    const wrap = h('div', { class: 'table-wrap ex-scroll', tabindex: '0', role: 'region', 'aria-label': 'Pivot table of items by weekday' });
    const head = h('h4', { class: 'ex-card-title' });
    const heat = h('label', { class: 'ex-check' });
    const cb = h('input', { type: 'checkbox', checked: true });
    cb.addEventListener('change', update);
    heat.append(cb, ' Shade the busiest cells');
    function update() {
      const rev = state.metric === 'rev';
      head.textContent = (rev ? 'Revenue' : 'Items sold') + ' by item and weekday';
      clear(wrap);
      const rows = EX.rowsFor(state.db, state.f);
      const pv = EX.pivot(rows, state.db), src = rev ? pv.rev : pv.units, im = IM();
      if (!pv.ids.length) { wrap.append(h('p', { class: 'ex-empty', text: 'No sales match these filters.' })); return; }
      const fmt = (v) => (rev ? EX.money(v, 0) : EX.int(v));
      let max = 0; pv.ids.forEach((id) => src.cells[id].forEach((v) => { if (v > max) max = v; }));
      const thead = h('thead', {}, [h('tr', {}, [h('th', { scope: 'col', text: 'Item' })].concat(EX.DOW.map((d) => h('th', { scope: 'col', class: 'ex-num', text: d })), [h('th', { scope: 'col', class: 'ex-num', text: 'Total' })]))]);
      const tb = h('tbody');
      pv.ids.forEach((id) => {
        const tr = h('tr', {}, [h('th', { scope: 'row', text: im[id].ItemName })]);
        src.cells[id].forEach((v) => {
          const td = h('td', { class: 'ex-num', text: fmt(v) });
          if (cb.checked && max > 0 && v > 0) td.setAttribute('style', 'background: rgba(var(--ex-heat), ' + (0.06 + 0.44 * v / max).toFixed(2) + ')');
          if (v === max && max > 0) td.classList.add('ex-max');
          tr.append(td);
        });
        tr.append(h('td', { class: 'ex-num ex-total', text: fmt(src.rowT[id]) }));
        tb.append(tr);
      });
      const foot = h('tfoot', {}, [h('tr', {}, [h('th', { scope: 'row', text: 'All shown' })].concat(src.colT.map((v) => h('td', { class: 'ex-num', text: fmt(v) })), [h('td', { class: 'ex-num ex-total', text: fmt(src.grand) })]))]);
      wrap.append(h('table', {}, [h('caption', { text: (rev ? 'Revenue' : 'Items sold') + ' by item and weekday, ' + filterLabel(state.f) }), thead, tb, foot]));
    }
    return { el: h('section', { class: 'ex-card', 'aria-label': 'Pivot table' }, [head, h('div', { class: 'ex-card-tools' }, [heat]), wrap, h('p', { class: 'ex-caption', text: 'Rows are items and columns are weekdays, added up over the chosen weeks. Look down the Fri column: the hot food and drinks rows are busiest on Fridays.' })]), update: update };
  }

  /* ================= What-if ================= */
  function whatIfPanel() {
    const head = h('h4', { class: 'ex-card-title', text: 'What-if: price and quantity' });
    const itemId = nextId('ex-wi-item'), pId = nextId('ex-wi-price'), qId = nextId('ex-wi-qty');
    const itemSel = h('select', { id: itemId });
    state.db.items.forEach((i) => itemSel.append(h('option', { value: i.ItemID, text: i.ItemName })));
    const price = h('input', { type: 'range', id: pId, step: '10' });
    const qty = h('input', { type: 'range', id: qId, step: '1' });
    const pOut = h('output', { for: pId, class: 'ex-out' }), qOut = h('output', { for: qId, class: 'ex-out' });
    const resetBtn = h('button', { type: 'button', class: 'ex-btn ex-btn-quiet', text: 'Back to current price and quantity' });
    const sentence = h('p', { class: 'ex-status', role: 'status', 'aria-live': 'polite' });
    const table = h('div', { class: 'table-wrap ex-whatif-table' });
    let base = null;
    itemSel.addEventListener('change', () => { state.wi = { item: itemSel.value, price: null, qty: null }; update(); });
    price.addEventListener('input', () => { state.wi.price = +price.value / 100; results(); });
    qty.addEventListener('input', () => { state.wi.qty = +qty.value; results(); });
    resetBtn.addEventListener('click', () => { state.wi.price = null; state.wi.qty = null; update(); });
    function results() {
      if (!base) return;
      const p = state.wi.price, q = state.wi.qty;
      pOut.textContent = '$' + p.toFixed(2); qOut.textContent = q + ' a day';
      price.setAttribute('aria-valuetext', '$' + p.toFixed(2)); qty.setAttribute('aria-valuetext', q + ' a day');
      const r = EX.whatIf(base, p, q), it = base.item;
      const baseSold = base.demand * 5, baseMargin = base.weeklyRevC - (baseSold + base.weeklyWasteUnits) * EX.cents(it.UnitCost);
      const rows = [
        ['Weekly revenue', EX.money(base.weeklyRevC, 0), EX.money(r.weeklyRev, 0), r.weeklyRev - base.weeklyRevC, true],
        ['Weekly margin', EX.money(baseMargin, 0), EX.money(r.marginC, 0), r.marginC - baseMargin, true],
        ['Items wasted per week', base.weeklyWasteUnits.toFixed(0), r.weeklyWaste.toFixed(0), r.weeklyWaste - base.weeklyWasteUnits, false],
        ['Waste share', pct(base.wasteRate * 100), pct(r.wastePct), r.wastePct - base.wasteRate * 100, false]
      ];
      clear(table);
      const tb = h('tbody');
      rows.forEach((x) => {
        const d = x[3], txt = x[0] === 'Waste share' ? (d >= 0 ? '+' : '') + d.toFixed(1) + ' points' : x[4] ? (d >= 0 ? '+' : '-') + EX.money(Math.abs(d), 0) : (d >= 0 ? '+' : '') + d.toFixed(0);
        tb.append(h('tr', {}, [h('th', { scope: 'row', text: x[0] }), h('td', { class: 'ex-num', text: x[1] }), h('td', { class: 'ex-num ex-strong', text: x[2] }), h('td', { class: 'ex-num', text: Math.abs(d) < 0.05 ? 'no change' : txt })]));
      });
      table.append(h('table', {}, [h('caption', { text: 'Projected effect for ' + it.ItemName + ' (a model, not a prediction)' }), h('thead', {}, [h('tr', {}, [h('th', { scope: 'col', text: 'Measure' }), h('th', { scope: 'col', class: 'ex-num', text: 'Now' }), h('th', { scope: 'col', class: 'ex-num', text: 'What-if' }), h('th', { scope: 'col', class: 'ex-num', text: 'Change' })])]), tb]));
      const dRev = r.weeklyRev - base.weeklyRevC;
      let s = 'At $' + p.toFixed(2) + ' with ' + q + ' ' + it.ItemName.toLowerCase() + ' put out a day, projected weekly revenue is ' + EX.money(r.weeklyRev, 0) + ' (' + (Math.abs(dRev) < 50 ? 'about the same as now' : (dRev > 0 ? 'up ' : 'down ') + EX.money(Math.abs(dRev), 0)) + ').';
      if (r.lost >= 0.5) s += ' Demand of about ' + r.demand.toFixed(0) + ' a day is more than the ' + q + ' put out, so it would sell out and about ' + r.lost.toFixed(0) + ' sales a day would be missed.';
      else if (it.Perishable === 'Y') s += ' About ' + r.wasted.toFixed(0) + ' would be thrown out each day.';
      sentence.textContent = s;
    }
    function update() {
      itemSel.value = state.wi.item;
      base = EX.whatIfBase(state.db, state.wi.item, state.f);
      if (!base) { sentence.textContent = 'There are no sales for that item in the chosen weeks, so there is nothing to project from.'; clear(table); return; }
      const it = base.item, p0c = EX.cents(it.UnitPrice), q0 = Math.round(base.prepared);
      price.min = Math.round(it.UnitPrice * 5) * 10; price.max = Math.round(it.UnitPrice * 15) * 10; price.value = state.wi.price == null ? p0c : Math.round(state.wi.price * 100);
      qty.min = 0; qty.max = Math.max(10, Math.ceil(q0 * 1.6)); qty.value = state.wi.qty == null ? q0 : state.wi.qty;
      state.wi.price = +price.value / 100; state.wi.qty = +qty.value;
      results();
    }
    const el = h('section', { class: 'ex-card', 'aria-label': 'What-if panel' }, [
      head,
      h('p', { class: 'ex-caption', text: 'Uses the average day in the chosen weeks. Move a slider and read what would change.' }),
      h('div', { class: 'ex-field' }, [h('label', { for: itemId, text: 'Item' }), itemSel]),
      h('div', { class: 'ex-field' }, [h('label', { for: pId, text: 'Price' }), h('div', { class: 'ex-slide' }, [price, pOut])]),
      h('div', { class: 'ex-field' }, [h('label', { for: qId, text: 'Items put out for sale each day' }), h('div', { class: 'ex-slide' }, [qty, qOut])]),
      sentence, table, resetBtn,
      h('p', { class: 'ex-caption', text: 'Margin is revenue less the cost of items made or bought. Waste share is items thrown out as a share of items put out. Model: demand changes with price by (old price / new price) to the power of an assumed elasticity for the category; items sold is the smaller of demand and items put out. Fresh food that is not sold is thrown out. The elasticities are assumptions from the interviews, not measurements.' })
    ]);
    return { el: el, update: update };
  }

  /* ================= Reorder list ================= */
  function reorderPanel() {
    const wrap = h('div', { class: 'table-wrap ex-reorder' });
    const head = h('h4', { class: 'ex-card-title', text: 'Reorder list' });
    const BADGE = { now: 'is-now', soon: 'is-soon', hold: 'is-hold', forecast: 'is-fc', buffer: 'is-buf' };
    const MARK = { now: '! ', soon: '~ ', hold: '', forecast: '', buffer: '' };
    function update() {
      clear(wrap);
      const list = EX.reorderList(state.db, state.f);
      if (!list.length) { wrap.append(h('p', { class: 'ex-empty', text: 'No items match the category and item filters.' })); return; }
      const tb = h('tbody');
      list.forEach((r) => {
        tb.append(h('tr', {}, [
          h('th', { scope: 'row' }, [h('span', { class: 'ex-item-name', text: r.item.ItemName }), h('span', { class: 'ex-why', text: r.why })]),
          h('td', {}, [h('span', { class: 'ex-badge ' + BADGE[r.key], text: MARK[r.key] + r.action }), h('span', { class: 'ex-why', text: r.qty ? 'Order ' + EX.int(r.qty) + ' units' : 'No order needed' })])
        ]));
      });
      wrap.append(h('table', {}, [h('caption', { text: 'Suggested orders for next week, from the decision tree' }), h('thead', {}, [h('tr', {}, [h('th', { scope: 'col', text: 'Item and rule used' }), h('th', { scope: 'col', text: 'Action and order' })])]), tb]));
    }
    return { el: h('section', { class: 'ex-card', 'aria-label': 'Reorder list' }, [head, h('p', { class: 'ex-caption', text: 'Always based on the latest two weeks and the stock count at the last Friday stocktake (the week filter does not change it). The category and item filters do. Order = 5 days of sales plus a 20% buffer, less stock on hand; fresh food is ordered to the forecast.' }), wrap]), update: update };
  }

  /* ================= Data table (the records behind every number) ================= */
  const PAGE = 20;
  function tablePanel() {
    const btn = h('button', { type: 'button', class: 'ex-btn', 'aria-expanded': 'false', text: 'Show the data table' });
    const csv = h('button', { type: 'button', class: 'ex-btn ex-btn-quiet', text: 'Download these rows as CSV' });
    const body = h('div', { class: 'ex-tablebody' }); body.hidden = true;
    const pager = h('div', { class: 'ex-pager' });
    let rows = [];
    btn.addEventListener('click', () => { state.tableOpen = !state.tableOpen; update(); });
    csv.addEventListener('click', () => {
      const lines = ['SaleID,SaleDate,ItemName,Category,Prepared,Sold,Wasted,Revenue'];
      const cm = CM();
      rows.forEach((r) => lines.push([r.rec.SaleID, EX.fmtDate(r.rec.SaleDate), '"' + r.item.ItemName + '"', '"' + cm[r.item.CategoryID].CategoryName + '"', r.rec.Prepared, r.rec.Sold, r.rec.Wasted, (r.revC / 100).toFixed(2)].join(',')));
      const url = URL.createObjectURL(new Blob([lines.join('\r\n') + '\r\n'], { type: 'text/csv' }));
      const a = h('a', { href: url, download: 'canteen-insights-sample.csv' }); document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    function update() {
      rows = EX.rowsFor(state.db, state.f).sort((a, b) => a.rec.SaleDate - b.rec.SaleDate || a.rec.ItemID.localeCompare(b.rec.ItemID));
      btn.setAttribute('aria-expanded', String(state.tableOpen)); btn.textContent = state.tableOpen ? 'Hide the data table' : 'Show the data table (' + rows.length + ' records)';
      body.hidden = !state.tableOpen; csv.hidden = !state.tableOpen;
      if (!state.tableOpen) return;
      const pages = Math.max(1, Math.ceil(rows.length / PAGE)); if (state.page >= pages) state.page = pages - 1;
      clear(body); clear(pager);
      const cm = CM(), tb = h('tbody');
      rows.slice(state.page * PAGE, state.page * PAGE + PAGE).forEach((r) => {
        const fixed = state.corrected.has(r.rec.SaleID);
        tb.append(h('tr', { class: fixed ? 'is-fixed' : null }, [h('td', { text: r.rec.SaleID + (fixed ? ' (corrected)' : '') }), h('td', { text: EX.fmtDate(r.rec.SaleDate) }), h('td', { text: EX.DOW[r.dow] }), h('td', { text: r.item.ItemName }), h('td', { text: cm[r.item.CategoryID].CategoryName }), h('td', { class: 'ex-num', text: r.rec.Prepared }), h('td', { class: 'ex-num', text: r.rec.Sold }), h('td', { class: 'ex-num', text: r.rec.Wasted }), h('td', { class: 'ex-num', text: EX.money(r.revC) })]));
      });
      const th = (t, n) => h('th', { scope: 'col', class: n ? 'ex-num' : null, text: t });
      body.append(h('div', { class: 'table-wrap ex-scroll', tabindex: '0', role: 'region', 'aria-label': 'Sales records table' }, [h('table', {}, [h('caption', { text: 'DailySales records for ' + filterLabel(state.f) + ' (Revenue = Sold x UnitPrice)' }), h('thead', {}, [h('tr', {}, [th('SaleID'), th('SaleDate'), th('Day'), th('Item'), th('Category'), th('Prepared', 1), th('Sold', 1), th('Wasted', 1), th('Revenue', 1)])]), tb])]));
      const prev = h('button', { type: 'button', class: 'ex-btn ex-btn-quiet', text: 'Previous' }), next = h('button', { type: 'button', class: 'ex-btn ex-btn-quiet', text: 'Next' });
      prev.disabled = state.page === 0; next.disabled = state.page >= pages - 1;
      prev.addEventListener('click', () => { state.page--; update(); }); next.addEventListener('click', () => { state.page++; update(); });
      pager.append(prev, h('span', { class: 'ex-pageinfo', text: rows.length ? 'Rows ' + (state.page * PAGE + 1) + ' to ' + Math.min(rows.length, state.page * PAGE + PAGE) + ' of ' + rows.length : 'No rows' }), next);
      body.append(pager);
    }
    return { el: h('section', { class: 'ex-card ex-wide', 'aria-label': 'Data table' }, [h('h4', { class: 'ex-card-title', text: 'Data table view' }), h('p', { class: 'ex-caption', text: 'The same records the charts are drawn from. Every total above is the sum of a column here.' }), h('div', { class: 'ex-row-btns' }, [btn, csv]), body]), update: update };
  }

  /* ================= Correct a record (data entry with validation) ================= */
  function entryPanel() {
    const F = {};
    const fld = (key, label, attrs) => {
      const id = nextId('ex-in'); const inp = attrs.tag === 'select' ? h('select', { id: id }) : h('input', Object.assign({ id: id, type: 'text', autocomplete: 'off' }, attrs));
      F[key] = inp;
      return h('div', { class: 'ex-field' }, [h('label', { for: id, text: label }), inp]);
    };
    const form = h('form', { class: 'ex-entry', novalidate: true, 'aria-label': 'Correct a sales record' });
    const dateF = fld('date', 'Date (dd/mm/yyyy)', { placeholder: '10/06/2026', inputmode: 'numeric' });
    const itemF = fld('itemId', 'Item', { tag: 'select' });
    state.db.items.forEach((i) => F.itemId.append(h('option', { value: i.ItemID, text: i.ItemName })));
    const prepF = fld('prepared', 'Prepared', { inputmode: 'numeric', placeholder: '46' });
    const soldF = fld('sold', 'Sold', { inputmode: 'numeric', placeholder: '44' });
    const wastF = fld('wasted', 'Wasted', { inputmode: 'numeric', placeholder: '2' });
    const msg = h('div', { class: 'ex-msg', role: 'status', 'aria-live': 'polite' });
    const logList = h('ol', { class: 'ex-log' });
    const save = h('button', { type: 'submit', class: 'ex-btn ex-btn-primary', text: 'Check and save' });
    const restore = h('button', { type: 'button', class: 'ex-btn ex-btn-quiet', text: 'Restore the original data' });
    const EXAMPLES = [
      ['A valid correction', { date: '10/06/2026', itemId: 'I01', prepared: '46', sold: '44', wasted: '2' }],
      ['Sold more than prepared', { date: '10/06/2026', itemId: 'I01', prepared: '46', sold: '50', wasted: '0' }],
      ['Letters in a number', { date: '10/06/2026', itemId: 'I01', prepared: '46', sold: 'abc', wasted: '2' }],
      ['A Saturday', { date: '13/06/2026', itemId: 'I01', prepared: '46', sold: '44', wasted: '2' }],
      ['A date that does not exist', { date: '31/02/2026', itemId: 'I01', prepared: '46', sold: '44', wasted: '2' }]
    ];
    const ex = h('div', { class: 'ex-row-btns', role: 'group', 'aria-label': 'Fill the form with an example' });
    EXAMPLES.forEach((e) => {
      const b = h('button', { type: 'button', class: 'ex-btn ex-btn-quiet', text: e[0] });
      b.addEventListener('click', () => { Object.keys(e[1]).forEach((k) => { F[k].value = e[1][k]; }); Object.keys(F).forEach((k) => F[k].removeAttribute('aria-invalid')); clear(msg); msg.append(h('p', { text: 'Example loaded. Press Check and save to see what the dashboard does with it.' })); });
      ex.append(b);
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const raw = {}; Object.keys(F).forEach((k) => { raw[k] = F[k].value; });
      const r = EX.validateRecord(state.db, raw);
      Object.keys(F).forEach((k) => { if (r.bad.indexOf(k) >= 0) F[k].setAttribute('aria-invalid', 'true'); else F[k].removeAttribute('aria-invalid'); });
      clear(msg);
      const n = state.log.length + 1;
      if (!r.ok) {
        msg.className = 'ex-msg is-bad';
        msg.append(h('p', { class: 'ex-msg-h', text: 'Not saved. ' + r.errors.length + (r.errors.length === 1 ? ' problem to fix:' : ' problems to fix:') }), h('ul', {}, r.errors.map((t) => h('li', { text: t }))));
        state.log.push('Entry ' + n + ' rejected: ' + r.errors[0]);
      } else {
        const done = EX.applyCorrection(state.db, r.record);
        state.corrected.add(done.row.SaleID);
        msg.className = 'ex-msg is-good';
        const im = IM()[r.record.ItemID].ItemName;
        msg.append(h('p', { class: 'ex-msg-h', text: 'Saved. ' + im + ' on ' + EX.fmtDate(r.record.SaleDate) + ' changed from ' + done.before.Sold + ' sold and ' + done.before.Wasted + ' wasted to ' + r.record.Sold + ' sold and ' + r.record.Wasted + ' wasted. Every panel has been recalculated.' }));
        state.log.push('Entry ' + n + ' saved: ' + im + ', ' + EX.fmtDate(r.record.SaleDate) + ', sold ' + r.record.Sold + ', wasted ' + r.record.Wasted);
        renderAll();
      }
      showLog();
    });
    restore.addEventListener('click', () => { state.db = EX.buildDB(); state.corrected = new Set(); state.log.push('Original data restored'); clear(msg); msg.className = 'ex-msg is-good'; msg.append(h('p', { class: 'ex-msg-h', text: 'The original sample data has been restored.' })); showLog(); renderAll(); });
    function showLog() { clear(logList); state.log.slice(-6).forEach((t) => logList.append(h('li', { text: t }))); }
    form.append(h('div', { class: 'ex-filter-row' }, [dateF, itemF]), h('div', { class: 'ex-filter-row' }, [prepF, soldF, wastF]), h('div', { class: 'ex-row-btns' }, [save, restore]));
    return {
      el: h('section', { class: 'ex-card ex-wide', 'aria-label': 'Correct a record' }, [
        h('h4', { class: 'ex-card-title', text: 'Correct a record' }),
        h('p', { class: 'ex-caption', text: 'The canteen manager can fix a day’s counts. Every field is checked before anything is saved: presence, type, range, date format and cross-field rules. Try the examples.' }),
        ex, form, msg, h('h5', { class: 'ex-sub', text: 'Entry log (last six)' }), logList
      ]), update: function () { }
    };
  }

  /* ================= Assemble the dashboard ================= */
  function mountApp(root) {
    clear(root);
    const filters = filtersPanel(), kpi = kpiPanel(), line = linePanel(), bars = barPanel(), pv = pivotPanel(), wi = whatIfPanel(), ro = reorderPanel(), tb = tablePanel(), en = entryPanel();
    const flag = h('p', { class: 'ex-flag' }, [h('strong', { text: 'Fictional data. ' }), 'A student’s example project. The canteen, the items and every number are invented and generated by a seeded random-number program, so they are the same every time you load the page.']);
    root.append(flag, filters.el, kpi.el, h('div', { class: 'ex-grid ex-grid-charts' }, [line.el, bars.el]), pv.el, h('div', { class: 'ex-grid ex-grid-two' }, [wi.el, ro.el]), tb.el, en.el);
    [filters, kpi, line, bars, pv, wi, ro, tb, en].forEach((p) => panels.push(p));
    renderAll();
    let raf = 0;
    const redraw = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { line.redraw(); bars.redraw(); }); };
    if (window.ResizeObserver) { new ResizeObserver(redraw).observe(line.box); } else window.addEventListener('resize', redraw);
  }

  /* ================= Query check: dashboard, SQL and spreadsheet agree ================= */
  const PRESETS = [
    ['All data', { from: 1, to: EX.WEEKS, cat: '', item: '' }],
    ['Meat pie, week 5', { from: 5, to: 5, cat: '', item: 'I01' }],
    ['Drinks, weeks 3 to 5', { from: 3, to: 5, cat: 'C3', item: '' }]
  ];
  function mountVerify(root) {
    clear(root);
    const presets = h('div', { class: 'ex-row-btns', role: 'group', 'aria-label': 'Set the dashboard filters to an example' });
    PRESETS.forEach((p) => { const b = h('button', { type: 'button', class: 'ex-btn ex-btn-quiet', text: p[0] }); b.addEventListener('click', () => { state.metric = 'rev'; setFilter(p[1], p[1].item ? 'item' : 'cat'); }); presets.append(b); });
    const cur = h('p', { class: 'ex-status', role: 'status', 'aria-live': 'polite' });
    const sqlBox = h('pre', { class: 'ex-sql', tabindex: '0', 'aria-label': 'SQL query for the current filters' });
    const out = h('div', { class: 'table-wrap' });
    const extra = h('div', { class: 'ex-extra' });
    function update() {
      const t = EX.threeWay(state.db, state.f);
      cur.textContent = 'The dashboard is showing ' + filterLabel(state.f) + '.';
      sqlBox.textContent = t.sql;
      clear(out);
      const d = t.dash;
      const row = (name, o, ok, how) => h('tr', {}, [h('th', { scope: 'row' }, [h('span', { class: 'ex-item-name', text: name }), h('span', { class: 'ex-why', text: how })]), h('td', { class: 'ex-num', text: EX.int(o.rows) }), h('td', { class: 'ex-num', text: EX.int(o.sold) }), h('td', { class: 'ex-num', text: EX.money(o.revC) }), h('td', { class: 'ex-num', text: pct(o.prepared ? o.wasted * 100 / o.prepared : null) }), h('td', {}, [ok == null ? 'Reference' : h('span', { class: 'ex-badge ' + (ok ? 'is-hold' : 'is-now'), text: ok ? 'Agrees' : 'Does not agree' })])]);
      out.append(h('table', {}, [
        h('caption', { text: 'The same filters worked out three ways' }),
        h('thead', {}, [h('tr', {}, [h('th', { scope: 'col', text: 'Method' }), h('th', { scope: 'col', class: 'ex-num', text: 'Rows' }), h('th', { scope: 'col', class: 'ex-num', text: 'Items sold' }), h('th', { scope: 'col', class: 'ex-num', text: 'Revenue' }), h('th', { scope: 'col', class: 'ex-num', text: 'Waste' }), h('th', { scope: 'col', text: 'Result' })])]),
        h('tbody', {}, [
          row('Dashboard', { rows: d.n, sold: d.sold, revC: d.revC, prepared: d.prepared, wasted: d.wasted }, null, 'JavaScript totals over the filtered records'),
          row('SQL query above', { rows: t.q.rows, sold: t.q.sold, revC: t.q.revC, prepared: t.q.prepared, wasted: t.q.wasted }, t.sqlOK, 'Rows returned by the query, then Sold x UnitPrice added up'),
          row('Spreadsheet formulas', { rows: t.sheet.rows, sold: t.sheet.sold, revC: t.sheet.revC, prepared: t.sheet.prepared, wasted: t.sheet.wasted }, t.sheetOK, 'SUM, IF and LOOKUP applied row by row; top seller by MAX')
        ])
      ]));
      clear(extra);
      const cs = h('p', { class: 'ex-caption', text: 'Top seller: dashboard says ' + (d.top ? d.top.name + ' (' + EX.int(d.top.units) + ')' : 'none') + '; the spreadsheet’s MAX of the item totals says ' + (t.sheet.top ? t.sheet.top + ' (' + EX.int(t.sheet.topUnits) + ')' : 'none') + '.' });
      extra.append(cs);
      // The queries printed in the notes are the ones the dashboard runs
      document.querySelectorAll('[data-ex-sql]').forEach((code) => {
        const p = PRESETS.find((x) => x[0] === code.dataset.exSql);
        const blk = code.closest('.code-block'), st = blk && blk.nextElementSibling && blk.nextElementSibling.classList.contains('ex-sql-check') ? blk.nextElementSibling : null;
        if (!p || !st) return;
        const same = EX.sqlFor(state.db, p[1]).replace(/\s+/g, ' ') === code.textContent.replace(/\s+/g, ' ').trim();
        st.textContent = same ? 'Checked in your browser: this is exactly the query the dashboard runs for "' + p[0] + '".' : 'This query has drifted from the one the dashboard runs.';
      });
    }
    // A fourth query: days on which 10 or more fresh items were thrown out (checked against a plain JavaScript filter)
    const qc = document.getElementById('ex-query-c');
    if (qc) {
      const b = qc.querySelector('button'), res = qc.querySelector('.ex-qc-out');
      if (b) b.addEventListener('click', () => {
        clear(res);
        try {
          const r = EX.runSQL(state.db, qc.previousElementSibling.querySelector('code').textContent);
          const im = IM(); const js = state.db.sales.filter((x) => im[x.ItemID].Perishable === 'Y' && x.Wasted >= 10).length;
          res.append(h('p', { class: 'ex-status', text: r.rows.length + ' rows returned' + (r.rows.length === js ? '; a plain JavaScript filter over the same records also finds ' + js + '. They agree.' : '; a plain JavaScript filter finds ' + js + '. They do NOT agree.') }));
          const tb = h('tbody'); r.rows.slice(0, 5).forEach((x) => tb.append(h('tr', {}, [h('td', { text: EX.fmtDate(x[0]) }), h('td', { text: x[1] }), h('td', { class: 'ex-num', text: x[2] }), h('td', { class: 'ex-num', text: x[3] })])));
          res.append(h('div', { class: 'table-wrap' }, [h('table', {}, [h('caption', { text: 'First five rows of the result' }), h('thead', {}, [h('tr', {}, ['SaleDate', 'ItemName', 'Prepared', 'Wasted'].map((t2, k) => h('th', { scope: 'col', class: k > 1 ? 'ex-num' : null, text: t2 })))]), tb])]));
        } catch (e) { res.append(h('p', { class: 'ex-status', text: 'Query error: ' + e.message })); }
      });
    }
    root.append(h('div', { class: 'ex-card ex-wide' }, [h('h4', { class: 'ex-card-title', text: 'Live check: does the SQL match the dashboard?' }), h('p', { class: 'ex-caption', text: 'This panel follows the dashboard’s filters. Pick an example, or change the filters in the dashboard, and the query below is rewritten and run.' }), presets, cur, sqlBox, out, extra]));
    panels.push({ update: update });
    update();
  }

  /* ================= Live test table ================= */
  function runTests() {
    const rows = document.querySelectorAll('tr[data-test]');
    if (!rows.length) return;
    const db = EX.buildDB();
    const all = { from: 1, to: EX.WEEKS };
    const val = (o) => { const r = EX.validateRecord(db, Object.assign({ date: '10/06/2026', itemId: 'I01', prepared: '46', sold: '44', wasted: '2' }, o)); return r.ok ? 'Accepted' : 'Rejected: ' + r.errors.join(' '); };
    const T = {
      N1: () => { const k = EX.kpis(db, all); return EX.money(k.revC) + ' and ' + EX.int(k.sold) + ' items'; },
      N2: () => { const k = EX.kpis(db, { from: 3, to: 5, cat: 'C3' }); return EX.money(k.revC) + ' and ' + EX.int(k.sold) + ' items'; },
      N3: () => { const r = EX.reorderList(db, { from: 1, to: EX.WEEKS, item: 'I06' })[0]; return r.action + ', order ' + r.qty; },
      N4: () => { const b = EX.whatIfBase(db, 'I01', all), p = EX.whatIf(b, 4.5, Math.round(b.prepared)); return 'Revenue change ' + EX.money(p.weeklyRev - b.weeklyRevC); },
      N5: () => val({}),
      N6: () => { const a = EX.threeWay(db, all), b = EX.threeWay(db, { from: 5, to: 5, item: 'I01' }); return a.sqlOK && a.sheetOK && b.sqlOK && b.sheetOK ? 'All three methods agree' : 'Mismatch'; },
      B1: () => EX.rowsFor(db, { from: 5, to: 5 }).length + ' records',
      B2: () => { const k = EX.kpis(db, { from: 5, to: 8 }); return k.prev ? 'Compared with ' + weeksLabel(k.prev) : 'No comparison'; },
      B3: () => { const k = EX.kpis(db, { from: 4, to: 8 }); return k.prev ? 'Compared with ' + weeksLabel(k.prev) : 'No comparison'; },
      B4: () => val({ prepared: '46', sold: '46', wasted: '0' }),
      B5: () => val({ prepared: '46', sold: '47', wasted: '0' }),
      B6: () => val({ prepared: '500', sold: '500', wasted: '0' }),
      B7: () => val({ prepared: '501', sold: '44', wasted: '2' }),
      B8: () => EX.ACTIONS[EX.decide(false, 0, 3)] + ' at 3.0 days; ' + EX.ACTIONS[EX.decide(false, 0, 2.9)] + ' at 2.9 days',
      B9: () => EX.ACTIONS[EX.decide(true, 10, Infinity)] + ' at 10%; ' + EX.ACTIONS[EX.decide(true, 10.1, Infinity)] + ' at 10.1%',
      E1: () => val({ sold: 'abc' }),
      E2: () => val({ sold: '-5' }),
      E3: () => val({ prepared: '' }),
      E4: () => val({ date: '31/02/2026' }),
      E5: () => val({ date: '13/06/2026' }),
      E6: () => val({ date: '10 June 2026' }),
      E7: () => val({ sold: '3.5' }),
      E8: () => val({ itemId: 'I11', prepared: '20', sold: '15', wasted: '2' }),
      E9: () => { const n = EX.reconcile(db, { from: 1, to: 8, cat: 'C3', item: 'I01' }, 'cat'); return 'Item filter "' + (n.item || 'All items') + '"; ' + n.notice; },
      E10: () => { const n = EX.normFilter({ from: 6, to: 3 }); return 'Weeks ' + n.from + ' to ' + n.to + '. ' + n.notice; },
      E11: () => { const k = EX.kpis(db, { from: 1, to: 8, cat: 'C3', item: 'I01' }); return k.n + ' records, waste ' + pct(k.wastePct) + ', top seller ' + (k.top ? k.top.name : 'none'); }
    };
    let pass = 0;
    rows.forEach((tr) => {
      const id = tr.dataset.test, exp = tr.querySelector('.ex-exp').textContent.trim().replace(/\s+/g, ' ');
      let got;
      try { got = T[id](); } catch (e) { got = 'Error: ' + e.message; }
      const ok = got === exp;
      if (ok) pass++;
      tr.querySelector('.ex-actual').textContent = got;
      const r = tr.querySelector('.ex-result'); r.textContent = ok ? 'Pass' : 'Fail'; r.className = 'ex-result ' + (ok ? 'is-pass' : 'is-fail');
    });
    const sum = document.getElementById('ex-test-summary');
    if (sum) { sum.textContent = pass + ' of ' + rows.length + ' tests pass. These results were produced just now, in your browser, by running the dashboard’s own functions on a fresh copy of the sample data.'; sum.className = 'ex-status ' + (pass === rows.length ? 'is-pass' : 'is-fail'); }
  }

  /* ================= Facts quoted in the notes, worked out from the original data ================= */
  function fillFacts() {
    const db = EX.buildDB(), all = { from: 1, to: EX.WEEKS };
    const k = EX.kpis(db, all), im = EX.itemMap(db);
    const waste = (id) => EX.totals(EX.rowsFor(db, { from: 1, to: EX.WEEKS, item: id })).wastePct;
    const friSold = EX.rowsFor(db, { from: 1, to: EX.WEEKS, item: 'I01' }).filter((r) => r.dow === 4 && r.rec.Sold === r.rec.Prepared).length;
    const F = { rows: EX.int(k.n), revenue: EX.money(k.revC), items: EX.int(k.sold), waste: pct(k.wastePct), wasteCost: EX.money(k.wasteC), top: k.top.name, topUnits: EX.int(k.top.units), pieFridays: String(friSold),
      hamWaste: pct(waste('I05')), fruitWaste: pct(waste('I11')), toastieWaste: pct(waste('I03')), sausageWaste: pct(waste('I02')), pieWaste: pct(waste('I01')), saving: EX.money(k.wasteC * 0.25) };
    document.querySelectorAll('[data-ex-fact]').forEach((n) => { const v = F[n.dataset.exFact]; if (v != null) n.textContent = v; });
    void im;
  }

  function init() {
    fillFacts();
    const app = document.getElementById('ex-app');
    if (app) mountApp(app);
    const ver = document.getElementById('ex-verify');
    if (ver) mountVerify(ver);
    runTests();
    window.EXAMPLE_PROJECT = { EX: EX, state: state };   // for the browser tests
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
