/* Data science page: three small interactive tools. Vanilla JS, no storage, no external libraries.
   1. Trip explorer (#ds-explorer): slicers, filter, sort, group and a pivot summary over the Bellbird Bikes trips,
      with the equivalent NESA-syntax SQL query shown underneath.
   2. Mini blockchain (#ds-chain): edit a block and watch the hashes (real SHA-256) stop matching.
   3. Levels of measurement quick check (#ds-levels).
   Data Science › Levels of measurement, Blockchain, Filtering, grouping and sorting, Developing a data dashboard. */
(function () {
  'use strict';

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function money(v) { return '$' + v.toFixed(2); }
  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    for (var k in attrs || {}) n.setAttribute(k, attrs[k]);
    if (html != null) n.innerHTML = html;
    return n;
  }

  /* ------------------------------------------------------------------ 1. Trip explorer */

  var RATES = { Casual: [1.0, 0.25], Member: [0.0, 0.10] };
  var STATIONS = ['Market Square', 'Riverside Park', 'Hospital'];
  var TYPES = ['Member', 'Casual'];
  // TripID, TripDate, RiderType, Station, Minutes, Km (Fare is worked out from the Rates sheet, as in the notes)
  var RAW = [
    ['T001', '07/09/2026', 'Member', 'Market Square', 12, 2.8], ['T002', '07/09/2026', 'Casual', 'Riverside Park', 25, 4.6],
    ['T003', '07/09/2026', 'Member', 'Hospital', 9, 1.9], ['T004', '08/09/2026', 'Casual', 'Market Square', 18, 3.4],
    ['T005', '08/09/2026', 'Member', 'Market Square', 14, 3.0], ['T006', '08/09/2026', 'Member', 'Riverside Park', 31, 6.2],
    ['T007', '09/09/2026', 'Casual', 'Hospital', 7, 1.5], ['T008', '09/09/2026', 'Casual', 'Riverside Park', 42, 8.1],
    ['T009', '09/09/2026', 'Member', 'Hospital', 11, 2.2], ['T010', '10/09/2026', 'Member', 'Market Square', 22, 4.4],
    ['T011', '10/09/2026', 'Casual', 'Hospital', 15, 2.9], ['T012', '11/09/2026', 'Member', 'Market Square', 13, 2.7],
    ['T013', '11/09/2026', 'Casual', 'Riverside Park', 55, 10.4], ['T014', '12/09/2026', 'Casual', 'Riverside Park', 38, 7.0],
    ['T015', '12/09/2026', 'Member', 'Riverside Park', 27, 5.3], ['T016', '12/09/2026', 'Member', 'Hospital', 10, 2.1],
    ['T017', '13/09/2026', 'Casual', 'Market Square', 20, 3.8], ['T018', '13/09/2026', 'Casual', 'Riverside Park', 47, 9.0]
  ];
  var ROWS = RAW.map(function (r) {
    var rate = RATES[r[2]];
    return { TripID: r[0], TripDate: r[1], RiderType: r[2], Station: r[3], Minutes: r[4], Km: r[5],
      Fare: Math.round((rate[0] + rate[1] * r[4]) * 100) / 100 };
  });
  var COLS = [
    { k: 'TripID', label: 'TripID', num: false }, { k: 'TripDate', label: 'TripDate', num: false },
    { k: 'Station', label: 'Station', num: false }, { k: 'RiderType', label: 'RiderType', num: false },
    { k: 'Minutes', label: 'Minutes', num: true }, { k: 'Km', label: 'Km', num: true }, { k: 'Fare', label: 'Fare', num: true }
  ];
  var DIMS = { none: 'None', Station: 'Station', RiderType: 'RiderType', TripDate: 'TripDate' };
  var MEASURES = {
    count: { label: 'Count of TripID', fn: function (a) { return a.length; }, fmt: function (v) { return String(v); } },
    sum: { label: 'Sum of Fare', fn: function (a) { return a.reduce(function (t, r) { return t + r.Fare; }, 0); }, fmt: money },
    mean: { label: 'Mean of Minutes', fn: function (a) { return a.length ? a.reduce(function (t, r) { return t + r.Minutes; }, 0) / a.length : NaN; }, fmt: function (v) { return isNaN(v) ? '' : v.toFixed(1); } },
    max: { label: 'Maximum of Minutes', fn: function (a) { return a.length ? Math.max.apply(null, a.map(function (r) { return r.Minutes; })) : NaN; }, fmt: function (v) { return isNaN(v) ? '' : String(v); } }
  };

  function initExplorer(root) {
    var st = { stations: new Set(STATIONS), types: new Set(TYPES), minMin: 0, sortK: 'TripID', dir: 1, rowDim: 'Station', colDim: 'RiderType', measure: 'sum', cf: true };

    function pills(name, list, set) {
      var wrap = el('div', { class: 'ds-slicer', role: 'group', 'aria-label': name + ' slicer' });
      wrap.appendChild(el('span', { class: 'ds-slicer-title' }, name));
      list.forEach(function (v) {
        var b = el('button', { type: 'button', class: 'ds-pill', 'aria-pressed': 'true', 'data-v': v }, esc(v));
        b.addEventListener('click', function () {
          if (set.has(v)) set.delete(v); else set.add(v);
          b.setAttribute('aria-pressed', set.has(v) ? 'true' : 'false');
          render();
        });
        wrap.appendChild(b);
      });
      return wrap;
    }
    function select(id, label, opts, value, onChange) {
      var wrap = el('label', { class: 'ds-field', for: id }, '<span>' + esc(label) + '</span>');
      var s = el('select', { id: id });
      Object.keys(opts).forEach(function (k) { s.appendChild(el('option', { value: k }, esc(typeof opts[k] === 'string' ? opts[k] : opts[k].label))); });
      s.value = value;
      s.addEventListener('change', function () { onChange(s.value); render(); });
      wrap.appendChild(s);
      return wrap;
    }

    root.innerHTML = '';
    var bar = el('div', { class: 'ds-controls' });
    bar.appendChild(pills('Station', STATIONS, st.stations));
    bar.appendChild(pills('Rider type', TYPES, st.types));
    var minWrap = el('label', { class: 'ds-field', for: 'ds-min' }, '<span>Minutes at least</span>');
    var minIn = el('input', { id: 'ds-min', type: 'number', min: '0', max: '60', step: '5', value: '0', inputmode: 'numeric' });
    minIn.addEventListener('input', function () { st.minMin = Math.max(0, parseInt(minIn.value, 10) || 0); render(); });
    minWrap.appendChild(minIn);
    bar.appendChild(minWrap);
    var cfWrap = el('label', { class: 'ds-check' });
    var cf = el('input', { type: 'checkbox', checked: 'checked' });
    cf.addEventListener('change', function () { st.cf = cf.checked; render(); });
    cfWrap.appendChild(cf);
    cfWrap.appendChild(document.createTextNode(' Conditional formatting: Fare of $10 or more'));
    bar.appendChild(cfWrap);
    root.appendChild(bar);

    var status = el('p', { class: 'ds-status', 'aria-live': 'polite' });
    root.appendChild(status);
    var tableHost = el('div', { class: 'table-wrap ds-table-wrap' });
    root.appendChild(tableHost);

    root.appendChild(el('h5', { class: 'ds-h5' }, 'Pivot table'));
    var pv = el('div', { class: 'ds-controls' });
    pv.appendChild(select('ds-rows', 'Rows', DIMS, st.rowDim, function (v) { st.rowDim = v; }));
    pv.appendChild(select('ds-cols', 'Columns', DIMS, st.colDim, function (v) { st.colDim = v; }));
    pv.appendChild(select('ds-val', 'Values', MEASURES, st.measure, function (v) { st.measure = v; }));
    root.appendChild(pv);
    var pivotHost = el('div', { class: 'table-wrap ds-table-wrap' });
    root.appendChild(pivotHost);
    var bars = el('div', { class: 'ds-bars', 'aria-hidden': 'true' });
    root.appendChild(bars);

    root.appendChild(el('h5', { class: 'ds-h5' }, 'The same filter and sort as a query (Course Specifications SQL)'));
    var sqlHost = el('div', { class: 'code-block' });
    var sqlPre = el('pre'); var sqlCode = el('code', { class: 'language-sql' });
    sqlPre.appendChild(sqlCode); sqlHost.appendChild(sqlPre);
    root.appendChild(sqlHost);
    var reset = el('button', { type: 'button', class: 'btn btn-outline ds-reset' }, 'Reset');
    reset.addEventListener('click', function () { initExplorer(root); });
    root.appendChild(reset);

    function filtered() {
      return ROWS.filter(function (r) { return st.stations.has(r.Station) && st.types.has(r.RiderType) && r.Minutes >= st.minMin; });
    }
    function sorted(rows) {
      var k = st.sortK;
      return rows.slice().sort(function (a, b) {
        var x = a[k], y = b[k];
        if (k === 'TripDate') { x = a.TripDate.split('/').reverse().join(''); y = b.TripDate.split('/').reverse().join(''); }
        var c = typeof x === 'number' ? x - y : String(x).localeCompare(String(y));
        return (c || a.TripID.localeCompare(b.TripID)) * st.dir;
      });
    }
    function orGroup(field, set, all) {
      var vals = all.filter(function (v) { return set.has(v); });
      if (vals.length === all.length) return null;
      var parts = vals.map(function (v) { return field + " = '" + v + "'"; });
      if (!parts.length) return field + " = ''";
      return parts.length > 1 ? '(' + parts.join(' OR ') + ')' : parts[0];
    }
    function sql() {
      var where = [orGroup('Station', st.stations, STATIONS), orGroup('RiderType', st.types, TYPES), st.minMin > 0 ? 'Minutes >= ' + st.minMin : null].filter(Boolean);
      var s = 'SELECT TripID, TripDate, Station, RiderType, Minutes, Km, Fare\nFROM Trips';
      if (where.length) s += '\nWHERE ' + where.join('\nAND ');
      s += '\nORDER BY ' + st.sortK + (st.dir === 1 ? ' ASC' : ' DESC');
      return s;
    }
    function keys(rows, dim) {
      if (dim === 'none') return ['All trips'];
      var seen = [];
      rows.forEach(function (r) { if (seen.indexOf(r[dim]) < 0) seen.push(r[dim]); });
      if (dim === 'Station' || dim === 'RiderType') return seen.sort();
      return seen.sort(function (a, b) { return a.split('/').reverse().join('').localeCompare(b.split('/').reverse().join('')); });
    }
    function inGroup(r, dim, key) { return dim === 'none' || r[dim] === key; }

    function render() {
      var rows = sorted(filtered());
      var total = rows.reduce(function (t, r) { return t + r.Fare; }, 0);
      status.innerHTML = 'Showing <strong>' + rows.length + '</strong> of ' + ROWS.length + ' trips. Total fare for the rows shown: <strong>' + money(total) + '</strong>.';

      var h = '<table><caption class="ds-cap">Sheet &ldquo;Trips&rdquo; (click a heading to sort)</caption><thead><tr>';
      COLS.forEach(function (c) {
        var active = st.sortK === c.k;
        h += '<th scope="col"' + (active ? ' aria-sort="' + (st.dir === 1 ? 'ascending' : 'descending') + '"' : '') + '><button type="button" class="ds-sort" data-k="' + c.k + '">' + c.label + (active ? (st.dir === 1 ? ' &#9650;' : ' &#9660;') : '') + '</button></th>';
      });
      h += '</tr></thead><tbody>';
      if (!rows.length) h += '<tr><td colspan="7">No trips match the filters.</td></tr>';
      rows.forEach(function (r) {
        h += '<tr>' + COLS.map(function (c) {
          var v = r[c.k];
          var txt = c.k === 'Fare' ? money(v) : c.k === 'Km' ? v.toFixed(1) : esc(v);
          var cls = c.num ? ' class="ds-num' + (c.k === 'Fare' && st.cf && r.Fare >= 10 ? ' ds-hot' : '') + '"' : '';
          return '<td' + cls + '>' + txt + '</td>';
        }).join('') + '</tr>';
      });
      h += '</tbody></table>';
      tableHost.innerHTML = h;
      Array.prototype.forEach.call(tableHost.querySelectorAll('.ds-sort'), function (b) {
        b.addEventListener('click', function () {
          var k = b.getAttribute('data-k');
          if (st.sortK === k) st.dir = -st.dir; else { st.sortK = k; st.dir = 1; }
          render();
          var again = tableHost.querySelector('.ds-sort[data-k="' + k + '"]'); if (again) again.focus();
        });
      });

      // Pivot table over the filtered rows (slicers and filter apply to the pivot too)
      var m = MEASURES[st.measure];
      var rk = keys(rows, st.rowDim), ck = keys(rows, st.colDim);
      var p = '<table><caption class="ds-cap">' + esc(m.label) + '</caption><thead><tr><th scope="col">' + (st.rowDim === 'none' ? '' : esc(DIMS[st.rowDim])) + (st.colDim === 'none' ? '' : ' \\ ' + esc(DIMS[st.colDim])) + '</th>';
      if (st.colDim !== 'none') { ck.forEach(function (c) { p += '<th scope="col">' + esc(c) + '</th>'; }); p += '<th scope="col">Grand total</th>'; }
      else p += '<th scope="col">' + esc(m.label) + '</th>';
      p += '</tr></thead><tbody>';
      var rowTotals = [];
      rk.forEach(function (r) {
        var inRow = rows.filter(function (x) { return inGroup(x, st.rowDim, r); });
        p += '<tr><th scope="row">' + esc(r) + '</th>';
        if (st.colDim !== 'none') {
          ck.forEach(function (c) {
            var cell = inRow.filter(function (x) { return inGroup(x, st.colDim, c); });
            p += '<td class="ds-num">' + (cell.length ? m.fmt(m.fn(cell)) : '') + '</td>';
          });
        }
        var rt = m.fn(inRow);
        rowTotals.push([r, rt]);
        p += '<td class="ds-num ds-total">' + m.fmt(rt) + '</td></tr>';
      });
      if (rk.length > 1 || !rows.length) {
        p += '<tr class="ds-grand"><th scope="row">Grand total</th>';
        if (st.colDim !== 'none') ck.forEach(function (c) {
          var col = rows.filter(function (x) { return inGroup(x, st.colDim, c); });
          p += '<td class="ds-num">' + (col.length ? m.fmt(m.fn(col)) : '') + '</td>';
        });
        p += '<td class="ds-num ds-total">' + (rows.length ? m.fmt(m.fn(rows)) : '') + '</td></tr>';
      }
      p += '</tbody></table>';
      pivotHost.innerHTML = p;

      var max = Math.max.apply(null, rowTotals.map(function (x) { return isNaN(x[1]) ? 0 : x[1]; }).concat([0.0001]));
      bars.innerHTML = rowTotals.length > 1 || st.rowDim !== 'none' ? rowTotals.map(function (x) {
        var w = isNaN(x[1]) ? 0 : Math.round(x[1] / max * 100);
        return '<div class="ds-bar-row"><span class="ds-bar-label">' + esc(x[0]) + '</span><span class="ds-bar-track"><span class="ds-bar" style="width:' + w + '%"></span></span><span class="ds-bar-val">' + m.fmt(x[1]) + '</span></div>';
      }).join('') : '';
      sqlCode.textContent = sql();
    }
    render();
  }

  /* ------------------------------------------------------------------ 2. Mini blockchain */

  // Compact synchronous SHA-256 (FIPS 180-4), so the demo also works when the page is opened from a file.
  var K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
  function utf8(str) {
    var out = [];
    for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i);
      if (c >= 0xd800 && c < 0xdc00 && i + 1 < str.length) { c = 0x10000 + ((c - 0xd800) << 10) + (str.charCodeAt(++i) - 0xdc00); }
      if (c < 0x80) out.push(c);
      else if (c < 0x800) out.push(0xc0 | c >> 6, 0x80 | c & 63);
      else if (c < 0x10000) out.push(0xe0 | c >> 12, 0x80 | c >> 6 & 63, 0x80 | c & 63);
      else out.push(0xf0 | c >> 18, 0x80 | c >> 12 & 63, 0x80 | c >> 6 & 63, 0x80 | c & 63);
    }
    return out;
  }
  function sha256(str) {
    var m = utf8(str), l = m.length * 8;
    m.push(0x80);
    while (m.length % 64 !== 56) m.push(0);
    for (var i = 7; i >= 0; i--) m.push(i > 3 ? 0 : (l >>> (i * 8)) & 255);
    var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    var W = new Array(64);
    function rr(x, n) { return (x >>> n) | (x << (32 - n)); }
    for (var o = 0; o < m.length; o += 64) {
      for (var t = 0; t < 16; t++) W[t] = (m[o + 4 * t] << 24) | (m[o + 4 * t + 1] << 16) | (m[o + 4 * t + 2] << 8) | m[o + 4 * t + 3];
      for (t = 16; t < 64; t++) {
        var s0 = rr(W[t - 15], 7) ^ rr(W[t - 15], 18) ^ (W[t - 15] >>> 3), s1 = rr(W[t - 2], 17) ^ rr(W[t - 2], 19) ^ (W[t - 2] >>> 10);
        W[t] = (W[t - 16] + s0 + W[t - 7] + s1) | 0;
      }
      var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (t = 0; t < 64; t++) {
        var S1 = rr(e, 6) ^ rr(e, 11) ^ rr(e, 25), ch = (e & f) ^ (~e & g), t1 = (h + S1 + ch + K[t] + W[t]) | 0;
        var S0 = rr(a, 2) ^ rr(a, 13) ^ rr(a, 22), mj = (a & b) ^ (a & c) ^ (b & c), t2 = (S0 + mj) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      H = [(H[0] + a) | 0, (H[1] + b) | 0, (H[2] + c) | 0, (H[3] + d) | 0, (H[4] + e) | 0, (H[5] + f) | 0, (H[6] + g) | 0, (H[7] + h) | 0];
    }
    return H.map(function (x) { return ('00000000' + (x >>> 0).toString(16)).slice(-8); }).join('');
  }
  var ZERO = new Array(65).join('0');
  function blockHash(prev, data) { return sha256(prev + '|' + data); }

  var CHAIN_DATA = ['Ava pays Ben $20', 'Ben pays Cara $5', 'Cara pays Dan $12', 'Dan pays Eli $8'];

  function initChain(root) {
    var blocks = [], prev = ZERO;
    CHAIN_DATA.forEach(function (d, i) { blocks.push({ data: d, prev: prev }); prev = blockHash(prev, d); });
    var networkTip = prev;
    root.innerHTML = '';
    var wrap = el('div', { class: 'ds-chain' });
    root.appendChild(wrap);
    var msg = el('p', { class: 'ds-status', 'aria-live': 'polite' });
    root.appendChild(msg);
    var btns = el('div', { class: 'ds-chain-btns' });
    var fix = el('button', { type: 'button', class: 'btn btn-outline' }, 'Attacker: recalculate the later blocks');
    var reset = el('button', { type: 'button', class: 'btn btn-outline' }, 'Reset');
    btns.appendChild(fix); btns.appendChild(reset);
    root.appendChild(btns);

    var cards = blocks.map(function (b, i) {
      var c = el('div', { class: 'ds-block' });
      c.innerHTML = '<div class="ds-block-h"><strong>Block ' + (i + 1) + '</strong><span class="ds-flag" aria-hidden="true"></span></div>' +
        '<label class="ds-blk-l" for="ds-data-' + i + '">Data</label><input id="ds-data-' + i + '" class="ds-blk-in" type="text" maxlength="40" value="' + esc(b.data) + '" />' +
        '<div class="ds-hrow"><span>Previous hash</span><code class="ds-prev"></code></div>' +
        '<div class="ds-hrow"><span>Hash</span><code class="ds-hash"></code></div>' +
        '<div class="ds-verdict"></div>';
      wrap.appendChild(c);
      c.querySelector('input').addEventListener('input', function (e) { b.data = e.target.value; update(); });
      return c;
    });

    function live() { return blocks.map(function (b) { return blockHash(b.prev, b.data); }); }
    function update() {
      var hs = live(), broken = -1;
      blocks.forEach(function (b, i) {
        var c = cards[i];
        c.querySelector('.ds-prev').textContent = b.prev.slice(0, 8);
        c.querySelector('.ds-hash').textContent = hs[i].slice(0, 8);
        var linkOk = i === 0 || b.prev === hs[i - 1];
        if (!linkOk && broken < 0) broken = i;
        var bad = broken >= 0 && i >= broken;
        c.classList.toggle('is-bad', bad);
        c.querySelector('.ds-flag').textContent = bad ? 'Chain broken' : 'Valid';
        c.querySelector('.ds-verdict').textContent = i === 0 ? 'First block: previous hash is all zeros.' : linkOk ? 'Previous hash matches block ' + i + '.' : 'Previous hash does not match block ' + i + '’s hash now (' + hs[i - 1].slice(0, 8) + ').';
      });
      var tip = hs[hs.length - 1];
      if (broken >= 0) msg.innerHTML = 'The chain breaks at <strong>block ' + (broken + 1) + '</strong>: its stored previous hash no longer equals the recalculated hash of block ' + broken + '. Every honest node would reject this copy.';
      else if (tip !== networkTip) msg.innerHTML = 'Every link now matches, but the last hash is <code>' + tip.slice(0, 8) + '</code> and the rest of the network holds <code>' + networkTip.slice(0, 8) + '</code>. The other nodes still have the original chain, so the majority rejects this copy.';
      else msg.innerHTML = 'The chain is valid and matches the network’s last hash <code>' + networkTip.slice(0, 8) + '</code>. Edit any data box to change a block.';
      fix.disabled = broken < 0;
    }
    fix.addEventListener('click', function () {
      for (var i = 1; i < blocks.length; i++) blocks[i].prev = blockHash(blocks[i - 1].prev, blocks[i - 1].data);
      update();
    });
    reset.addEventListener('click', function () { initChain(root); });
    update();
  }

  /* ------------------------------------------------------------------ 3. Levels of measurement quick check */

  var LEVELS = ['Nominal', 'Ordinal', 'Interval', 'Ratio'];
  var ITEMS = [
    ['Bike model (Standard or E-bike)', 'Nominal', 'Categories with no natural order.'],
    ['Trip length in minutes', 'Ratio', 'Equal gaps and a true zero: 0 minutes means no trip, and 40 is twice 20.'],
    ['Rider rating: 1 star to 5 stars', 'Ordinal', 'The order matters but the gap between 1 and 2 stars is not guaranteed equal to the gap between 4 and 5.'],
    ['Air temperature at the station in °C', 'Interval', 'Equal gaps but 0 °C is not “no temperature”, so 20 °C is not twice as hot as 10 °C.'],
    ['Station name', 'Nominal', 'Labels only.'],
    ['Number of free docks at a station', 'Ratio', 'A count with a true zero (no free docks).'],
    ['Finishing place in a school bike race (1st, 2nd, 3rd)', 'Ordinal', 'Rank order only: the gaps between places can be very different.'],
    ['Date of the trip (for example 9 September 2026)', 'Interval', 'Equal gaps between days, but there is no true zero date.']
  ];

  function initLevels(root) {
    root.innerHTML = '';
    var list = el('ol', { class: 'ds-levels-list' });
    ITEMS.forEach(function (it, i) {
      var li = el('li', { class: 'ds-lv' });
      var id = 'ds-lv-' + i;
      li.innerHTML = '<label for="' + id + '" class="ds-lv-q">' + esc(it[0]) + '</label>';
      var s = el('select', { id: id });
      s.appendChild(el('option', { value: '' }, 'Choose a level'));
      LEVELS.forEach(function (l) { s.appendChild(el('option', { value: l }, l)); });
      li.appendChild(s);
      var fb = el('span', { class: 'ds-lv-fb', 'aria-live': 'polite' });
      li.appendChild(fb);
      s.addEventListener('change', function () { fb.textContent = ''; li.classList.remove('is-right', 'is-wrong'); });
      list.appendChild(li);
    });
    root.appendChild(list);
    var out = el('p', { class: 'ds-status', 'aria-live': 'polite' });
    var check = el('button', { type: 'button', class: 'btn btn-primary' }, 'Check my answers');
    var again = el('button', { type: 'button', class: 'btn btn-outline' }, 'Clear');
    var row = el('div', { class: 'ds-chain-btns' }); row.appendChild(check); row.appendChild(again);
    root.appendChild(row); root.appendChild(out);
    check.addEventListener('click', function () {
      var right = 0, answered = 0;
      Array.prototype.forEach.call(list.children, function (li, i) {
        var v = li.querySelector('select').value, fb = li.querySelector('.ds-lv-fb');
        li.classList.remove('is-right', 'is-wrong');
        if (!v) { fb.textContent = ''; return; }
        answered++;
        if (v === ITEMS[i][1]) { right++; li.classList.add('is-right'); fb.textContent = 'Correct. ' + ITEMS[i][2]; }
        else { li.classList.add('is-wrong'); fb.textContent = 'Not quite. ' + ITEMS[i][2] + ' Answer: ' + ITEMS[i][1] + '.'; }
      });
      out.textContent = answered ? right + ' of ' + ITEMS.length + ' correct (' + answered + ' answered).' : 'Choose a level for each variable first.';
    });
    again.addEventListener('click', function () { initLevels(root); });
  }

  function boot() {
    var a = document.getElementById('ds-explorer'); if (a) initExplorer(a);
    var b = document.getElementById('ds-chain'); if (b) initChain(b);
    var c = document.getElementById('ds-levels'); if (c) initLevels(c);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
