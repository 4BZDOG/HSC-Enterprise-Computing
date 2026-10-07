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

/* Data science: labs built on the shared kit (css/labs.css, js/labs.js, js/minisql.js).
   1. Sampling simulator: five ways of choosing a sample from one population, repeated to show random error and bias.
   2. Update anomaly demo: rename a rider in a flat file and in linked tables.
   3. SQL practice: write queries with the four Course Specification keywords on the Bellbird Bikes tables.
   4. Spreadsheet practice: type formulas (SUM, AVERAGE, IF, LOOKUP, absolute references, fill down) and have them checked.
   All data is fictional. */
(function () {
  'use strict';
  var el = Labs.el;

  /* ---------- 1. Sampling simulator ---------- */
  // A town of 200 people. Weekly hours on a streaming service fall with age, so who is asked changes the answer.
  var AGE = [{ n: 'Under 25', count: 60, mean: 12, col: '#0a7c86' }, { n: '25 to 54', count: 80, mean: 7, col: '#e8a317' }, { n: '55 and over', count: 60, mean: 3, col: '#6d3fd9' }];
  function rng(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  var POP = (function () {
    var r = rng(2026), out = [];
    AGE.forEach(function (g, gi) {
      for (var i = 0; i < g.count; i++) {
        var h = Math.max(0.5, g.mean + (r() + r() + r() - 1.5) * g.mean * 0.9);
        out.push({ g: gi, h: Math.round(h * 10) / 10 });
      }
    });
    // The roll is in random order (as an electoral roll is), so age groups are mixed together
    for (var i = out.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = out[i]; out[i] = out[j]; out[j] = t; }
    return out.map(function (p, k) { p.id = k; return p; });
  })();
  var TRUE_MEAN = POP.reduce(function (a, p) { return a + p.h; }, 0) / POP.length;
  var METHODS = [
    { id: 'random', name: 'Simple random', note: 'Every person has the same chance of being chosen, like drawing names from a hat.' },
    { id: 'systematic', name: 'Systematic', note: 'Choose a random start on the roll, then every k-th person. The roll is in no useful order, so this behaves like random.' },
    { id: 'stratified', name: 'Stratified', note: 'Split the population into age groups and sample each group in proportion to its size, so every group is represented.' },
    { id: 'convenience', name: 'Convenience', note: 'Ask whoever is easy to reach. Here the interviewer stands near a university and a shopping centre, so older people are rarely asked.' },
    { id: 'voluntary', name: 'Voluntary online poll', note: 'People choose whether to respond, and heavy streamers are keener to have their say.' }
  ];
  function shuffle(a, r) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function draw(method, n) {
    var idx = POP.map(function (p, i) { return i; });
    if (method === 'random') return shuffle(idx, Math.random).slice(0, n);
    if (method === 'systematic') { var k = Math.floor(POP.length / n), s = Math.floor(Math.random() * k), o = []; for (var i = 0; i < n; i++) o.push((s + i * k) % POP.length); return o; }
    if (method === 'stratified') {
      var out = [], left = n;
      AGE.forEach(function (g, gi) {
        var members = idx.filter(function (i) { return POP[i].g === gi; });
        var take = gi === AGE.length - 1 ? left : Math.round(n * g.count / POP.length);
        left -= take; out = out.concat(shuffle(members, Math.random).slice(0, take));
      });
      return out;
    }
    if (method === 'convenience') {
      var near = idx.filter(function (i) { return POP[i].g < 2; });             // under 25 and 25 to 54, not older people
      var young = near.filter(function (i) { return POP[i].g === 0; }), mid = near.filter(function (i) { return POP[i].g === 1; });
      // The interviewer is by a university, so most people who pass are young
      var pool = shuffle(young, Math.random).slice(0, Math.ceil(n * 0.75)).concat(shuffle(mid, Math.random).slice(0, Math.floor(n * 0.25)));
      return pool.slice(0, n);
    }
    // voluntary: keys u^(1/w) with weight w = hours^1.5 give a weighted draw without replacement
    var keyed = idx.map(function (i) { return { i: i, k: Math.pow(Math.random(), 1 / Math.pow(POP[i].h, 1.5)) }; });
    keyed.sort(function (a, b) { return b.k - a.k; });
    return keyed.slice(0, n).map(function (x) { return x.i; });
  }
  function mean(idx) { return idx.reduce(function (a, i) { return a + POP[i].h; }, 0) / idx.length; }

  function buildSampling(host) {
    Labs.shell(host, 'ds-sampling', 'Sampling simulator', 'A town has 200 people. Each hour a week on a streaming service is recorded, and the true average is known. Choose a sampling method, draw samples and see how close the sample averages get. Draw one sample at a time, or 200 to see the pattern.');
    var st = { method: 'random', n: 20, last: null, means: [] };
    var row = el('div', 'lab-row');
    var fm = el('div', 'lab-field'); fm.append(el('span', 'lab-label', 'Sampling method'));
    var chips = el('div', 'lab-chips'); chips.setAttribute('role', 'group'); chips.setAttribute('aria-label', 'Sampling method');
    var chipBtns = METHODS.map(function (m) { var b = el('button', 'lab-chip', m.name); b.type = 'button'; b.addEventListener('click', function () { st.method = m.id; st.means = []; st.last = null; update(); }); chips.append(b); return b; });
    fm.append(chips);
    var fn = el('div', 'lab-field'), ln = el('label'), on = el('output'), inN = el('input'); ln.htmlFor = inN.id = 'ds-samp-n'; ln.append(document.createTextNode('Sample size: '), on);
    inN.type = 'range'; inN.min = 10; inN.max = 80; inN.step = 5; inN.value = st.n; fn.append(ln, inN);
    row.append(fm, fn); host.append(row);
    var note = el('p', 'lab-note'); host.append(note);
    var actions = el('div', 'lab-actions');
    var b1 = el('button', 'lab-btn lab-btn--primary', 'Draw one sample'), b2 = el('button', 'lab-btn', 'Draw 200 samples'), b3 = el('button', 'lab-btn lab-btn--quiet', 'Clear');
    [b1, b2, b3].forEach(function (b) { b.type = 'button'; actions.append(b); });
    host.append(actions);

    var split = el('div', 'lab-split lab-split--wide-left');
    var NS = 'http://www.w3.org/2000/svg';
    function svgEl(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.append(e); return e; }
    var dotsBox = el('div', 'lab-stage ds-samp-dots');
    var dots = svgEl('svg', { viewBox: '0 0 400 230', role: 'img', 'aria-label': 'The 200 people of the town as dots, coloured by age group. Sampled people have a dark ring.' }, dotsBox);
    var circles = POP.map(function (p, i) { var cx = 20 + (i % 20) * 18.5, cy = 22 + Math.floor(i / 20) * 18.5; return svgEl('circle', { cx: cx, cy: cy, r: 6.5, fill: AGE[p.g].col, opacity: 0.8 }, dots); });
    var legend = el('div', 'ds-samp-legend');
    AGE.forEach(function (g) { var s = el('span', null, g.n + ' (' + g.count + ')'); var i = el('i'); i.style.background = g.col; s.prepend(i); legend.append(s); });
    var left = el('div', 'lab-stack'); left.append(dotsBox, legend);
    var histBox = el('div', 'lab-stage ds-samp-hist');
    var hist = svgEl('svg', { viewBox: '0 0 400 230', role: 'img', 'aria-label': 'Histogram of the sample averages so far, with the true average marked.' }, histBox);
    split.append(left, histBox); host.append(split);
    var stats = el('div', 'lab-stats'); host.append(stats);
    var msg = el('div', 'lab-readout'); msg.setAttribute('role', 'status'); host.append(msg);
    host.append(el('p', 'lab-note', 'The population and the weekly hours are made up for this demonstration. The idea is real: a sample is only useful if it represents the population, and a bigger sample cannot repair a method that leaves some people out.'));

    function drawHist() {
      hist.replaceChildren();
      var X0 = 34, X1 = 388, Y0 = 18, Y1 = 188, MIN = 0, MAX = 16, B = 32, w = (X1 - X0) / B;
      svgEl('line', { x1: X0, y1: Y1, x2: X1, y2: Y1, stroke: 'currentColor', 'stroke-width': 1, opacity: 0.5 }, hist);
      for (var t = 0; t <= 16; t += 4) { var x = X0 + (t - MIN) / (MAX - MIN) * (X1 - X0); var tx = svgEl('text', { x: x, y: Y1 + 16, 'text-anchor': 'middle', 'font-size': 13, fill: 'currentColor' }, hist); tx.textContent = t; }
      var lab = svgEl('text', { x: (X0 + X1) / 2, y: 223, 'text-anchor': 'middle', 'font-size': 13, fill: 'currentColor' }, hist); lab.textContent = 'Sample average (hours a week)';
      var bins = new Array(B).fill(0);
      st.means.forEach(function (m) { var b = Math.min(B - 1, Math.max(0, Math.floor((m - MIN) / (MAX - MIN) * B))); bins[b]++; });
      var top = Math.max(1, Math.max.apply(null, bins));
      bins.forEach(function (c, i) { if (!c) return; var h = c / top * (Y1 - Y0 - 14); svgEl('rect', { x: X0 + i * w + 1, y: Y1 - h, width: w - 2, height: h, fill: '#0a7c86', opacity: 0.85 }, hist); });
      var tx2 = X0 + (TRUE_MEAN - MIN) / (MAX - MIN) * (X1 - X0);
      svgEl('line', { x1: tx2, y1: Y0, x2: tx2, y2: Y1, stroke: '#c8372d', 'stroke-width': 2.5, 'stroke-dasharray': '5 3' }, hist);
      var tl = svgEl('text', { x: Math.min(tx2 + 5, 300), y: Y0 + 8, 'font-size': 13, 'font-weight': 700, fill: '#c8372d' }, hist); tl.textContent = 'True average ' + TRUE_MEAN.toFixed(1);
      if (!st.means.length) { var e = svgEl('text', { x: 211, y: 110, 'text-anchor': 'middle', 'font-size': 14, fill: 'currentColor', opacity: 0.7 }, hist); e.textContent = 'Draw some samples to fill this in'; }
    }
    function update() {
      var m = METHODS.filter(function (x) { return x.id === st.method; })[0];
      chipBtns.forEach(function (b, i) { b.setAttribute('aria-pressed', String(METHODS[i].id === st.method)); });
      on.textContent = st.n; note.textContent = m.note;
      circles.forEach(function (c) { c.setAttribute('stroke', 'none'); c.setAttribute('opacity', st.last ? 0.3 : 0.8); });
      if (st.last) st.last.forEach(function (i) { circles[i].setAttribute('stroke', '#0b1b2e'); circles[i].setAttribute('stroke-width', 2.5); circles[i].setAttribute('opacity', 1); });
      drawHist();
      stats.replaceChildren();
      function stat(l, v) { var s = el('div', 'lab-stat'); s.append(el('span', null, l), el('b', null, v)); stats.append(s); }
      stat('True average (whole town)', TRUE_MEAN.toFixed(1) + ' h');
      stat('This sample', st.last ? mean(st.last).toFixed(1) + ' h' : 'none yet');
      if (st.means.length > 1) {
        var avg = st.means.reduce(function (a, v) { return a + v; }, 0) / st.means.length, lo = Math.min.apply(null, st.means), hi = Math.max.apply(null, st.means);
        stat('Average of ' + st.means.length + ' samples', avg.toFixed(1) + ' h');
        stat('Range of sample averages', lo.toFixed(1) + ' to ' + hi.toFixed(1));
        var bias = avg - TRUE_MEAN;
        msg.className = 'lab-readout ' + (Math.abs(bias) < 0.6 ? 'is-good' : 'is-bad');
        msg.textContent = Math.abs(bias) < 0.6
          ? 'The sample averages centre on the true average (off by ' + (bias >= 0 ? '+' : '') + bias.toFixed(1) + ' h), so this method is not biased. Individual samples still vary, which is random error; a larger sample narrows the spread.'
          : 'The sample averages centre ' + Math.abs(bias).toFixed(1) + ' h ' + (bias > 0 ? 'above' : 'below') + ' the true average. That is bias: the method leaves out or favours some people, and every sample is wrong in the same direction. Increase the sample size and the spread narrows, but the centre does not move.';
      } else {
        msg.className = 'lab-readout';
        msg.textContent = st.last ? 'One sample can be close or far from the truth by chance. Draw 200 samples to see whether the method is biased.' : 'Choose a method and draw a sample.';
      }
    }
    b1.addEventListener('click', function () { st.last = draw(st.method, st.n); st.means.push(mean(st.last)); update(); });
    b2.addEventListener('click', function () { for (var i = 0; i < 200; i++) { st.last = draw(st.method, st.n); st.means.push(mean(st.last)); } update(); });
    b3.addEventListener('click', function () { st.means = []; st.last = null; update(); });
    inN.addEventListener('input', function () { st.n = +inN.value; st.means = []; st.last = null; update(); });
    update();
  }

  /* ---------- 2. Update anomaly demo ---------- */
  var FLAT = [['T001', 'Ava', 'Chen', 'Member', 'Market Square', '$1.20'], ['T005', 'Ava', 'Chen', 'Member', 'Market Square', '$1.40'], ['T012', 'Ava', 'Chen', 'Member', 'Market Square', '$1.30'], ['T002', 'Ben', 'Taylor', 'Casual', 'Riverside Park', '$7.25'], ['T007', 'Ben', 'Taylor', 'Casual', 'Hospital', '$2.75'], ['T014', 'Ben', 'Taylor', 'Casual', 'Riverside Park', '$10.50']];
  function buildAnomaly(host) {
    Labs.shell(host, 'ds-anomaly', 'Why store a fact once?', 'Ava Chen has changed her surname to Park. Update the flat file, where her name is typed on every trip, and then the linked tables, where it is stored once. Then search for her.');
    var flat = FLAT.map(function (r) { return r.slice(); });
    var rider = { id: 'R01', first: 'Ava', last: 'Chen' };
    var split = el('div', 'lab-split'); host.append(split);

    var a = el('div', 'lab-panel'); a.append(el('h5', null, 'Flat file: type the new surname in each row'));
    var fTab = Labs.table(['TripID', 'FirstName', 'Surname', 'RiderType', 'Station', 'Fare'], {});
    var inputs = [];
    function fillFlat() {
      fTab.clear(); inputs = [];
      flat.forEach(function (r, i) {
        var cells = r.map(function (v, c) {
          if (c !== 2 || r[1] !== 'Ava') return v;
          var inp = el('input'); inp.type = 'text'; inp.value = v; inp.maxLength = 20; inp.setAttribute('aria-label', 'Surname for trip ' + r[0]); inp.className = 'ds-an-input';
          inp.addEventListener('input', function () { flat[i][2] = inp.value; report(); }); inputs.push(inp); return inp;
        });
        fTab.add(cells);
      });
    }
    fillFlat(); a.append(fTab.wrap);
    var fRes = el('div', 'lab-feedback is-info'); fRes.setAttribute('role', 'status'); a.append(fRes);

    var b = el('div', 'lab-panel'); b.append(el('h5', null, 'Linked tables: type it once'));
    var rTab = Labs.table(['RiderID', 'FirstName', 'Surname', 'RiderType'], {});
    var inpR = el('input'); inpR.type = 'text'; inpR.value = rider.last; inpR.maxLength = 20; inpR.className = 'ds-an-input'; inpR.setAttribute('aria-label', 'Surname for rider R01');
    rTab.add(['R01', 'Ava', inpR, 'Member']); rTab.add(['R02', 'Ben', 'Taylor', 'Casual']);
    var tTab = Labs.table(['TripID', 'RiderID', 'Fare'], {});
    [['T001', 'R01', '$1.20'], ['T005', 'R01', '$1.40'], ['T012', 'R01', '$1.30'], ['T002', 'R02', '$7.25'], ['T007', 'R02', '$2.75'], ['T014', 'R02', '$10.50']].forEach(function (r) { tTab.add(r); });
    b.append(rTab.wrap, tTab.wrap);
    var lRes = el('div', 'lab-feedback is-info'); lRes.setAttribute('role', 'status'); b.append(lRes);
    split.append(a, b);
    inpR.addEventListener('input', function () { rider.last = inpR.value; report(); });
    host.append(el('p', 'lab-note', 'In the linked tables, a trip stores only the RiderID. The name is looked up from Riders when a report or query needs it, so it can never disagree with itself. Real rider records also need the rider\'s consent and care, because names are personal information.'));

    function report() {
      var names = flat.filter(function (r) { return r[1] === 'Ava'; }).map(function (r) { return r[2].trim().toLowerCase(); });
      var distinct = names.filter(function (n, i) { return names.indexOf(n) === i; });
      var parkRows = names.filter(function (n) { return n === 'park'; }).length;
      fRes.className = 'lab-feedback ' + (distinct.length > 1 ? 'is-bad' : parkRows === names.length ? 'is-good' : 'is-info');
      fRes.textContent = distinct.length > 1
        ? 'Inconsistent: Ava appears under ' + distinct.length + ' different surnames. A search for "Park" finds ' + parkRows + ' of her ' + names.length + ' trips. This is a data integrity problem.'
        : parkRows === names.length ? 'All ' + names.length + ' rows now say Park, but you had to edit every one of them and a single missed row would have caused an error.' : 'Edit the three rows for Ava. The more trips she takes, the more rows there are to change.';
      var lastName = rider.last.trim();
      lRes.className = 'lab-feedback ' + (lastName.toLowerCase() === 'park' ? 'is-good' : 'is-info');
      lRes.textContent = lastName.toLowerCase() === 'park'
        ? 'One edit. All 3 of Ava\'s trips, in every query and report, now show Park, because they all point to the same RiderID.'
        : 'Change the surname in the Riders table. One edit updates every trip.';
    }
    report();
  }

  /* ---------- 3. SQL practice on the Bellbird Bikes tables ---------- */
  function iso(s) { var p = s.split('/'); return p[2] + '-' + p[1] + '-' + p[0]; }
  var BB = {
    Riders: { cols: [{ n: 'RiderID', type: 'text' }, { n: 'FirstName', type: 'text' }, { n: 'Surname', type: 'text' }, { n: 'RiderType', type: 'text' }],
      rows: [['R01', 'Ava', 'Chen', 'Member'], ['R02', 'Ben', 'Taylor', 'Casual'], ['R03', 'Cara', 'Nguyen', 'Member'], ['R04', 'Dylan', 'Smith', 'Casual'], ['R05', 'Eli', 'Johnson', 'Member'], ['R06', 'Farah', 'Ali', 'Casual']] },
    Stations: { cols: [{ n: 'StationID', type: 'text' }, { n: 'StationName', type: 'text' }, { n: 'Docks', type: 'int' }], rows: [['S1', 'Market Square', 12], ['S2', 'Riverside Park', 10], ['S3', 'Hospital', 8]] },
    Bikes: { cols: [{ n: 'BikeID', type: 'text' }, { n: 'Model', type: 'text' }], rows: [['B01', 'Standard'], ['B02', 'E-bike'], ['B03', 'Standard'], ['B04', 'Standard'], ['B05', 'E-bike']] },
    Trips: { cols: [{ n: 'TripID', type: 'text' }, { n: 'TripDate', type: 'date' }, { n: 'Minutes', type: 'int' }, { n: 'Km', type: 'real' }, { n: 'Fare', type: 'money' }, { n: 'RiderID', type: 'text' }, { n: 'BikeID', type: 'text' }, { n: 'StationID', type: 'text' }],
      rows: [['T001', '07/09/2026', 12, 2.8, 1.20, 'R01', 'B01', 'S1'], ['T002', '07/09/2026', 25, 4.6, 7.25, 'R02', 'B02', 'S2'], ['T003', '07/09/2026', 9, 1.9, 0.90, 'R03', 'B03', 'S3'], ['T004', '08/09/2026', 18, 3.4, 5.50, 'R04', 'B01', 'S1'], ['T005', '08/09/2026', 14, 3.0, 1.40, 'R01', 'B04', 'S1'], ['T006', '08/09/2026', 31, 6.2, 3.10, 'R05', 'B02', 'S2'], ['T007', '09/09/2026', 7, 1.5, 2.75, 'R02', 'B05', 'S3'], ['T008', '09/09/2026', 42, 8.1, 11.50, 'R06', 'B03', 'S2'], ['T009', '09/09/2026', 11, 2.2, 1.10, 'R03', 'B01', 'S3'], ['T010', '10/09/2026', 22, 4.4, 2.20, 'R05', 'B04', 'S1'], ['T011', '10/09/2026', 15, 2.9, 4.75, 'R04', 'B02', 'S3'], ['T012', '11/09/2026', 13, 2.7, 1.30, 'R01', 'B05', 'S1'], ['T013', '11/09/2026', 55, 10.4, 14.75, 'R06', 'B03', 'S2'], ['T014', '12/09/2026', 38, 7.0, 10.50, 'R02', 'B01', 'S2'], ['T015', '12/09/2026', 27, 5.3, 2.70, 'R05', 'B02', 'S2'], ['T016', '12/09/2026', 10, 2.1, 1.00, 'R03', 'B04', 'S3'], ['T017', '13/09/2026', 20, 3.8, 6.00, 'R04', 'B05', 'S1'], ['T018', '13/09/2026', 47, 9.0, 12.75, 'R06', 'B03', 'S2']].map(function (r) { r[1] = iso(r[1]); return r; }) }
  };
  function buildSql(host) {
    MiniSQL.lab(host, {
      cls: 'ds-sql', title: 'SQL practice: Bellbird Bikes',
      lead: 'Write queries with the four keywords in the Course Specifications: SELECT, FROM, WHERE and ORDER BY. Choose a task, type your query and run it. The result is checked against the expected answer.',
      db: BB, keys: { Riders: ['RiderID'], Stations: ['StationID'], Bikes: ['BikeID'], Trips: ['TripID'] }, free: true,
      tasks: [
        { q: 'List the first name and surname of every Member, in surname order (A to Z).', hint: 'One table (Riders). SELECT the two fields, FROM Riders, WHERE RiderType = \'Member\' (text goes in single quotes), then ORDER BY Surname ASC.',
          answer: "SELECT FirstName, Surname\nFROM Riders\nWHERE RiderType = 'Member'\nORDER BY Surname ASC" },
        { q: 'Show the TripID, Minutes and Fare of every trip longer than 30 minutes, with the longest trip first.', hint: 'One table (Trips). Numbers are not in quotes: WHERE Minutes > 30. For the longest first, sort by Minutes in descending order (DESC).',
          answer: 'SELECT TripID, Minutes, Fare\nFROM Trips\nWHERE Minutes > 30\nORDER BY Minutes DESC' },
        { q: 'Show the TripID and Fare of trips on or after 10/09/2026 that cost more than $5, in TripID order.', hint: 'Two conditions in one WHERE joined by AND. Write the date as \'10/09/2026\' and the fare as a plain number, 5.',
          answer: "SELECT TripID, Fare\nFROM Trips\nWHERE TripDate >= '10/09/2026' AND Fare > 5\nORDER BY TripID ASC" },
        { q: 'Show the TripID and the station name for every trip that started at Market Square.', hint: 'Two tables: list Trips, Stations in FROM and link them in WHERE with Trips.StationID = Stations.StationID, then add AND Stations.StationName = \'Market Square\'.',
          answer: "SELECT Trips.TripID, Stations.StationName\nFROM Trips, Stations\nWHERE Trips.StationID = Stations.StationID\nAND Stations.StationName = 'Market Square'\nORDER BY Trips.TripID ASC" },
        { q: 'For each Casual rider\'s trips, show the rider\'s surname, the TripID and the Fare, with the most expensive trip first.', hint: 'Join Riders and Trips on RiderID, add AND Riders.RiderType = \'Casual\', and ORDER BY Trips.Fare DESC. Write Trips.RiderID with the table name, because both tables have a RiderID field.',
          answer: "SELECT Riders.Surname, Trips.TripID, Trips.Fare\nFROM Riders, Trips\nWHERE Riders.RiderID = Trips.RiderID\nAND Riders.RiderType = 'Casual'\nORDER BY Trips.Fare DESC" },
        { q: 'Show the TripID, the bike model and the fare for E-bike trips that cost more than $5, cheapest first.', hint: 'Join Trips and Bikes on BikeID, then add conditions for Bikes.Model and Trips.Fare.',
          answer: "SELECT Trips.TripID, Bikes.Model, Trips.Fare\nFROM Trips, Bikes\nWHERE Trips.BikeID = Bikes.BikeID\nAND Bikes.Model = 'E-bike'\nAND Trips.Fare > 5\nORDER BY Trips.Fare ASC" }
      ]
    });
  }

  function init() {
    document.querySelectorAll('[data-ds="sampling"]').forEach(buildSampling);
    document.querySelectorAll('[data-ds="anomaly"]').forEach(buildAnomaly);
    document.querySelectorAll('[data-ds="sql"]').forEach(buildSql);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

/* Data science: spreadsheet practice. A small formula engine (SUM, MAX, MIN, COUNT, AVERAGE, STDEV, ABS, SQRT, INT, ROUND,
   IF, LOOKUP, relative and absolute references, other sheets) drives a copy of the Bellbird Bikes workbook used in the notes.
   Students type formulas, fill them down, and have each task checked. Function names follow Excel and Google Sheets;
   NESA's Course Specifications name the same functions (MAXIMUM, MINIMUM, MEAN, STANDARD DEVIATION). */
(function () {
  'use strict';
  var el = Labs.el;
  var ERR = { DIV: '#DIV/0!', NAME: '#NAME?', REF: '#REF!', VAL: '#VALUE!', NA: '#N/A', CYC: '#CYCLE!' };

  function colNum(s) { var n = 0; for (var i = 0; i < s.length; i++) n = n * 26 + s.charCodeAt(i) - 64; return n; }
  function colName(n) { var s = ''; while (n > 0) { var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; }

  var TRIPS = [
    ['T001', '07/09/2026', 'Market Square', 'Member', 12, 2.8], ['T002', '07/09/2026', 'Riverside Park', 'Casual', 25, 4.6], ['T003', '07/09/2026', 'Hospital', 'Member', 9, 1.9],
    ['T004', '08/09/2026', 'Market Square', 'Casual', 18, 3.4], ['T005', '08/09/2026', 'Market Square', 'Member', 14, 3.0], ['T006', '08/09/2026', 'Riverside Park', 'Member', 31, 6.2],
    ['T007', '09/09/2026', 'Hospital', 'Casual', 7, 1.5], ['T008', '09/09/2026', 'Riverside Park', 'Casual', 42, 8.1], ['T009', '09/09/2026', 'Hospital', 'Member', 11, 2.2],
    ['T010', '10/09/2026', 'Market Square', 'Member', 22, 4.4], ['T011', '10/09/2026', 'Hospital', 'Casual', 15, 2.9], ['T012', '11/09/2026', 'Market Square', 'Member', 13, 2.7],
    ['T013', '11/09/2026', 'Riverside Park', 'Casual', 55, 10.4], ['T014', '12/09/2026', 'Riverside Park', 'Casual', 38, 7.0], ['T015', '12/09/2026', 'Riverside Park', 'Member', 27, 5.3],
    ['T016', '12/09/2026', 'Hospital', 'Member', 10, 2.1], ['T017', '13/09/2026', 'Market Square', 'Casual', 20, 3.8], ['T018', '13/09/2026', 'Riverside Park', 'Casual', 47, 9.0]
  ];
  var HEAD = ['TripID', 'TripDate', 'Station', 'RiderType', 'Minutes', 'Km', 'Fare', 'TripLength', 'FarePerKm', 'Surcharge', 'Summary', 'Value', 'UnlockFee', 'Label'];   // columns A to N
  var LAST = 19;

  function Book() {
    this.sheets = { Trips: {}, Rates: {} };
    var T = this.sheets.Trips, R = this.sheets.Rates;
    HEAD.forEach(function (h, i) { T[colName(i + 1) + '1'] = { v: h }; });
    TRIPS.forEach(function (r, i) {
      var row = i + 2;
      r.forEach(function (v, c) { T[colName(c + 1) + row] = { v: v }; });
      T['G' + row] = { f: '=LOOKUP(D' + row + ',Rates!$A$2:$A$3,Rates!$B$2:$B$3)+LOOKUP(D' + row + ',Rates!$A$2:$A$3,Rates!$C$2:$C$3)*E' + row };
      T['H' + row] = { f: '=IF(E' + row + '>=30,"Long","Short")' };
    });
    [['K3', 'Total fare'], ['K4', 'Mean minutes'], ['K5', 'Longest trip'], ['K6', 'Spread of minutes'], ['P1', 'Surcharge rate']].forEach(function (p) { T[p[0]] = { v: p[1] }; });
    T.Q1 = { v: 0.1 };
    R.A1 = { v: 'RiderType' }; R.B1 = { v: 'Unlock fee' }; R.C1 = { v: 'Per minute' };
    R.A2 = { v: 'Casual' }; R.B2 = { v: 1 }; R.C2 = { v: 0.25 }; R.A3 = { v: 'Member' }; R.B3 = { v: 0 }; R.C3 = { v: 0.1 };
    this.cache = null;
  }

  // ---- formula engine ----
  function tokenise(f) {
    var re = /\s*(?:("(?:[^"]|"")*")|((?:(?:'[^']+'|[A-Za-z_][A-Za-z0-9_]*)!)?\$?[A-Za-z]{1,2}\$?\d+(?::\$?[A-Za-z]{1,2}\$?\d+)?)(?![A-Za-z0-9_(])|(\d+\.?\d*|\.\d+)|([A-Za-z][A-Za-z0-9_.]*)(?=\s*\()|(TRUE|FALSE)|(<=|>=|<>|[-+*\/^&=<>%(),]))/gy;
    var out = [], m, pos = 0;
    f = f.slice(1);
    re.lastIndex = 0;
    while (pos < f.length && (m = re.exec(f)) !== null) {
      pos = re.lastIndex;
      if (m[1] != null) out.push({ t: 's', v: m[1].slice(1, -1).replace(/""/g, '"') });
      else if (m[2] != null) out.push({ t: 'r', v: m[2] });
      else if (m[3] != null) out.push({ t: 'n', v: parseFloat(m[3]) });
      else if (m[4] != null) out.push({ t: 'f', v: m[4].toUpperCase() });
      else if (m[5] != null) out.push({ t: 'b', v: m[5] === 'TRUE' });
      else out.push({ t: 'o', v: m[6] });
      if (/^\s*$/.test(f.slice(pos))) { pos = f.length; }
    }
    if (pos < f.length && f.slice(pos).trim()) throw { e: ERR.NAME, m: 'The formula contains "' + f.slice(pos).trim().slice(0, 12) + '", which the spreadsheet does not understand. Check the spelling of the function name, and put text in double quotes.' };
    return out;
  }
  function parseF(tokens) {
    var p = 0;
    function peek() { return tokens[p]; }
    function op(v) { var t = tokens[p]; if (t && t.t === 'o' && t.v === v) { p++; return true; } return false; }
    function expr() {
      var l = concat();
      for (;;) { var t = peek(); if (t && t.t === 'o' && ['=', '<>', '<', '<=', '>', '>='].indexOf(t.v) >= 0) { p++; l = { k: 'cmp', o: t.v, l: l, r: concat() }; } else break; }
      return l;
    }
    function concat() { var l = add(); while (op('&')) l = { k: 'cat', l: l, r: add() }; return l; }
    function add() { var l = mul(); for (;;) { if (op('+')) l = { k: 'bin', o: '+', l: l, r: mul() }; else if (op('-')) l = { k: 'bin', o: '-', l: l, r: mul() }; else break; } return l; }
    function mul() { var l = pow(); for (;;) { if (op('*')) l = { k: 'bin', o: '*', l: l, r: pow() }; else if (op('/')) l = { k: 'bin', o: '/', l: l, r: pow() }; else break; } return l; }
    function pow() { var l = unary(); while (op('^')) l = { k: 'bin', o: '^', l: l, r: unary() }; return l; }
    function unary() { if (op('-')) return { k: 'neg', e: unary() }; if (op('+')) return unary(); return post(); }
    function post() { var e = prim(); while (op('%')) e = { k: 'bin', o: '/', l: e, r: { k: 'num', v: 100 } }; return e; }
    function prim() {
      var t = tokens[p++];
      if (!t) throw { e: ERR.VAL, m: 'The formula ends too soon. Something is missing after the last operator or bracket.' };
      if (t.t === 'n') return { k: 'num', v: t.v };
      if (t.t === 's') return { k: 'str', v: t.v };
      if (t.t === 'b') return { k: 'bool', v: t.v };
      if (t.t === 'r') return { k: 'ref', v: t.v };
      if (t.t === 'f') {
        if (!op('(')) throw { e: ERR.NAME, m: 'A function name must be followed by a bracket.' };
        var args = [];
        if (!op(')')) { for (;;) { args.push(expr()); if (op(',')) continue; if (op(')')) break; throw { e: ERR.VAL, m: 'Separate the parts of a function with commas, and close every bracket.' }; } }
        return { k: 'fn', n: t.v, a: args };
      }
      if (t.t === 'o' && t.v === '(') { var e = expr(); if (!op(')')) throw { e: ERR.VAL, m: 'A bracket is not closed.' }; return e; }
      throw { e: ERR.VAL, m: 'Unexpected "' + t.v + '" in the formula.' };
    }
    var ast = expr();
    if (p < tokens.length) throw { e: ERR.VAL, m: 'Unexpected "' + tokens[p].v + '" in the formula. Check the commas and brackets.' };
    return ast;
  }
  function parseRef(ref, sheet) {
    var m = /^(?:('[^']+'|[A-Za-z_][A-Za-z0-9_]*)!)?\$?([A-Za-z]{1,2})\$?(\d+)(?::\$?([A-Za-z]{1,2})\$?(\d+))?$/.exec(ref);
    var sh = m[1] ? m[1].replace(/'/g, '') : sheet;
    var c1 = colNum(m[2].toUpperCase()), r1 = +m[3], c2 = m[4] ? colNum(m[4].toUpperCase()) : c1, r2 = m[5] ? +m[5] : r1;
    return { sheet: sh, c1: Math.min(c1, c2), c2: Math.max(c1, c2), r1: Math.min(r1, r2), r2: Math.max(r1, r2), range: !!m[4] };
  }
  Book.prototype.evalCell = function (sheet, addr, stack) {
    var cell = (this.sheets[sheet] || {})[addr];
    if (!cell) return '';
    if (cell.f === undefined) return cell.v;
    var key = sheet + '!' + addr;
    if (this.cache[key] !== undefined) return this.cache[key];
    stack = stack || {};
    if (stack[key]) throw { e: ERR.CYC, m: 'This formula refers to itself, directly or through other cells.' };
    stack[key] = true;
    var val;
    try { val = this.evalAst(parseF(tokenise(cell.f)), sheet, stack); if (val && val.range) val = val.vals[0]; }
    catch (e) { val = e && e.e ? { err: e.e, msg: e.m } : { err: ERR.VAL, msg: String(e) }; }
    delete stack[key];
    this.cache[key] = val;
    return val;
  };
  Book.prototype.evalAst = function (n, sheet, stack) {
    var self = this;
    function num(v) {
      if (v && v.err) throw { e: v.err, m: v.msg };
      if (v && v.range) v = v.vals[0];
      if (typeof v === 'number') return v;
      if (typeof v === 'boolean') return v ? 1 : 0;
      if (v === '' || v === undefined) return 0;
      if (typeof v === 'string' && v.trim() !== '' && !isNaN(+v)) return +v;
      throw { e: ERR.VAL, m: 'A formula needs a number here, but found the text "' + v + '".' };
    }
    function flat(args) {
      var out = [];
      args.forEach(function (a) { if (a && a.range) a.vals.forEach(function (x) { if (x && x.err) throw { e: x.err, m: x.msg }; out.push({ v: x, fromRange: true }); }); else out.push({ v: a, fromRange: false }); });
      return out;
    }
    function nums(args) { return flat(args).filter(function (x) { return typeof x.v === 'number' || (!x.fromRange && x.v !== '' && !isNaN(+x.v)); }).map(function (x) { return +x.v; }); }
    function ev(x) { return self.evalAst(x, sheet, stack); }
    switch (n.k) {
      case 'num': case 'str': case 'bool': return n.v;
      case 'neg': return -num(ev(n.e));
      case 'ref': {
        var r = parseRef(n.v, sheet);
        if (!self.sheets[r.sheet]) throw { e: ERR.REF, m: 'There is no sheet called "' + r.sheet + '". The sheets are Trips and Rates.' };
        if (!r.range) { var v = self.evalCell(r.sheet, colName(r.c1) + r.r1, stack); if (v && v.err) throw { e: v.err, m: v.msg }; return v; }
        var vals = [];
        for (var rr = r.r1; rr <= r.r2; rr++) for (var cc = r.c1; cc <= r.c2; cc++) vals.push(self.evalCell(r.sheet, colName(cc) + rr, stack));
        return { range: true, vals: vals, rows: r.r2 - r.r1 + 1, cols: r.c2 - r.c1 + 1 };
      }
      case 'bin': {
        var a = num(ev(n.l)), b = num(ev(n.r));
        if (n.o === '+') return a + b; if (n.o === '-') return a - b; if (n.o === '*') return a * b;
        if (n.o === '/') { if (b === 0) throw { e: ERR.DIV, m: 'Division by zero.' }; return a / b; }
        return Math.pow(a, b);
      }
      case 'cat': return String(ev(n.l)) + String(ev(n.r));
      case 'cmp': {
        var x = ev(n.l), y = ev(n.r); if (x && x.range) x = x.vals[0]; if (y && y.range) y = y.vals[0];
        if (x && x.err) throw { e: x.err, m: x.msg }; if (y && y.err) throw { e: y.err, m: y.msg };
        if (typeof x === 'string' && typeof y === 'string') { x = x.toLowerCase(); y = y.toLowerCase(); }
        switch (n.o) { case '=': return x === y; case '<>': return x !== y; case '<': return x < y; case '<=': return x <= y; case '>': return x > y; default: return n.o === '>=' ? x >= y : false; }
      }
      case 'fn': {
        var name = { MAXIMUM: 'MAX', MINIMUM: 'MIN', MEAN: 'AVERAGE', 'STDEV.S': 'STDEV' }[n.n] || n.n;
        if (name === 'IF') {
          if (n.a.length < 2 || n.a.length > 3) throw { e: ERR.VAL, m: 'IF needs a test, a value if TRUE and a value if FALSE: IF(test, if_true, if_false).' };
          var cnd = ev(n.a[0]); if (cnd && cnd.err) throw { e: cnd.err, m: cnd.msg };
          return cnd ? ev(n.a[1]) : (n.a[2] ? ev(n.a[2]) : false);
        }
        var args = n.a.map(ev);
        function need(k, usage) { if (args.length !== k) throw { e: ERR.VAL, m: name + ' needs ' + k + (k === 1 ? ' value' : ' values') + ': ' + usage + '.' }; }
        switch (name) {
          case 'SUM': return nums(args).reduce(function (s, v) { return s + v; }, 0);
          case 'COUNT': return nums(args).length;
          case 'MAX': { var m = nums(args); return m.length ? Math.max.apply(null, m) : 0; }
          case 'MIN': { var m2 = nums(args); return m2.length ? Math.min.apply(null, m2) : 0; }
          case 'AVERAGE': { var q = nums(args); if (!q.length) throw { e: ERR.DIV, m: 'There are no numbers to average.' }; return q.reduce(function (s, v) { return s + v; }, 0) / q.length; }
          case 'STDEV': { var d = nums(args); if (d.length < 2) throw { e: ERR.DIV, m: 'Standard deviation needs at least two numbers.' }; var mu = d.reduce(function (s, v) { return s + v; }, 0) / d.length; return Math.sqrt(d.reduce(function (s, v) { return s + (v - mu) * (v - mu); }, 0) / (d.length - 1)); }
          case 'ABS': need(1, 'ABS(number)'); return Math.abs(num(args[0]));
          case 'SQRT': need(1, 'SQRT(number)'); if (num(args[0]) < 0) throw { e: ERR.VAL, m: 'The square root of a negative number is not defined.' }; return Math.sqrt(num(args[0]));
          case 'INT': need(1, 'INT(number)'); return Math.floor(num(args[0]));
          case 'ROUND': need(2, 'ROUND(number, digits)'); return Math.round(num(args[0]) * Math.pow(10, num(args[1]))) / Math.pow(10, num(args[1]));
          case 'LOOKUP': {
            need(3, 'LOOKUP(value, search_range, result_range)');
            var key = args[0]; if (key && key.range) key = key.vals[0];
            var sr = args[1], rr2 = args[2];
            if (!sr || !sr.range || !rr2 || !rr2.range) throw { e: ERR.VAL, m: 'LOOKUP needs two ranges: where to search and where to take the answer from.' };
            for (var i = 0; i < sr.vals.length; i++) {
              var s1 = sr.vals[i], k1 = key;
              if (typeof s1 === 'string' && typeof k1 === 'string') { s1 = s1.toLowerCase(); k1 = k1.toLowerCase(); }
              if (s1 === k1) return rr2.vals[i];
            }
            throw { e: ERR.NA, m: 'LOOKUP did not find "' + key + '" in the search range.' };
          }
        }
        throw { e: ERR.NAME, m: 'The spreadsheet does not know a function called ' + n.n + '. Try SUM, COUNT, MAX, MIN, AVERAGE, STDEV, ABS, SQRT, INT, IF or LOOKUP.' };
      }
    }
    throw { e: ERR.VAL, m: 'The formula could not be worked out.' };
  };
  Book.prototype.value = function (sheet, addr) { this.cache = this.cache || {}; var v = this.evalCell(sheet, addr); return v; };
  Book.prototype.reset = function () { this.cache = {}; };

  // Fill down: shift relative row numbers, keep absolute ones
  function shiftFormula(f, dRows) {
    return f.split('"').map(function (part, i) {
      if (i % 2) return part;
      return part.replace(/((?:'[^']+'|[A-Za-z_][A-Za-z0-9_]*)!)?(\$?)([A-Za-z]{1,2})(\$?)(\d+)(?![A-Za-z0-9_(])/g, function (m, sh, dc, col, dr, row) { return (sh || '') + dc + col + dr + (dr ? row : (+row + dRows)); });
    }).join('"');
  }
  function fmtVal(v, col) {
    if (v && v.err) return v.err;
    if (v === undefined || v === '') return '';
    if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
    if (typeof v === 'number') {
      if (col === 'G' || col === 'J') return '$' + v.toFixed(2);
      if (col === 'F') return v.toFixed(1);
      return Number.isInteger(v) ? String(v) : String(Math.round(v * 10000) / 10000);
    }
    return String(v);
  }

  var TASKS = [
    { q: 'In L3, work out the total fare of all 18 trips.', cells: ['L3'], exp: function () { return TRIPS.reduce(function (s, r) { return s + fare(r); }, 0); }, model: '=SUM(G2:G19)', hint: 'Fares are in column G, rows 2 to 19. Use SUM with a range: SUM(G2:G19).' },
    { q: 'In L4, work out the mean (average) trip length in minutes.', cells: ['L4'], exp: function () { return TRIPS.reduce(function (s, r) { return s + r[4]; }, 0) / TRIPS.length; }, model: '=AVERAGE(E2:E19)', hint: 'Minutes are in column E. NESA calls this function MEAN; spreadsheets call it AVERAGE.' },
    { q: 'In L5, find the longest trip in minutes.', cells: ['L5'], exp: function () { return Math.max.apply(null, TRIPS.map(function (r) { return r[4]; })); }, model: '=MAX(E2:E19)', hint: 'NESA calls this function MAXIMUM; spreadsheets call it MAX.' },
    { q: 'In L6, work out the spread of the trip lengths using standard deviation.', cells: ['L6'], exp: function () { var m = TRIPS.reduce(function (s, r) { return s + r[4]; }, 0) / TRIPS.length; return Math.sqrt(TRIPS.reduce(function (s, r) { return s + (r[4] - m) * (r[4] - m); }, 0) / (TRIPS.length - 1)); }, model: '=STDEV(E2:E19)', hint: 'The function is STDEV (or STDEV.S in some spreadsheets). Use the Minutes range E2:E19.' },
    { q: 'In I2, work out the fare per kilometre for the first trip (Fare ÷ Km), then fill down to I19.', cells: range('I', 2, 19), exp: function (a) { var r = TRIPS[+a.slice(1) - 2]; return fare(r) / r[5]; }, model: '=G2/F2', fill: true, hint: 'Write =G2/F2 in I2 and press "Fill down". The row numbers are relative, so they move down with the formula: G3/F3, G4/F4 and so on.' },
    { q: 'In J2, add a surcharge to each fare using the rate in Q1: Fare × rate. Fill down to J19. The rate must not move as you fill down.', cells: range('J', 2, 19), exp: function (a) { var r = TRIPS[+a.slice(1) - 2]; return fare(r) * 0.1; }, model: '=G2*$Q$1', fill: true, hint: 'Make the reference to the rate absolute with dollar signs: $Q$1. Then it stays fixed while G2 changes to G3, G4 and so on.' },
    { q: 'In M2, use LOOKUP to find each trip\'s unlock fee from the Rates sheet, using the rider type in D2. Fill down to M19.', cells: range('M', 2, 19), exp: function (a) { var r = TRIPS[+a.slice(1) - 2]; return r[3] === 'Casual' ? 1 : 0; }, model: '=LOOKUP(D2,Rates!$A$2:$A$3,Rates!$B$2:$B$3)', fill: true, hint: 'LOOKUP(value, search range, result range). Search Rates!$A$2:$A$3 for D2 and take the answer from Rates!$B$2:$B$3. Lock both ranges with dollar signs.' },
    { q: 'In N2, use IF to label each trip "Pricey" when the fare is more than $5, otherwise "OK". Fill down to N19.', cells: range('N', 2, 19), exp: function (a) { return fare(TRIPS[+a.slice(1) - 2]) > 5 ? 'Pricey' : 'OK'; }, model: '=IF(G2>5,"Pricey","OK")', fill: true, hint: 'IF(test, value if TRUE, value if FALSE). Text results go in double quotes.' }
  ];
  function range(col, a, b) { var o = []; for (var i = a; i <= b; i++) o.push(col + i); return o; }
  function fare(r) { var rate = r[3] === 'Casual' ? [1, 0.25] : [0, 0.1]; return Math.round((rate[0] + rate[1] * r[4]) * 100) / 100; }

  function buildSheet(host) {
    Labs.shell(host, 'ds-sheet', 'Spreadsheet practice: the Bellbird fare sheet', 'This is the Trips workbook from the notes. The fares and trip lengths are already worked out. Choose a task, click a cell, type the formula in the formula bar and press Enter. Use Fill down to copy a formula down the column. Change a number and watch everything recalculate.');
    var book = new Book(); book.reset();
    var st = { sheet: 'Trips', sel: 'L3', task: 0 };

    var row = el('div', 'lab-row');
    var tabs = el('div', 'lab-seg'); tabs.setAttribute('role', 'group'); tabs.setAttribute('aria-label', 'Sheet');
    var tb = {};
    ['Trips', 'Rates'].forEach(function (n) { var b = el('button', null, 'Sheet: ' + n); b.type = 'button'; b.addEventListener('click', function () { st.sheet = n; st.sel = n === 'Trips' ? 'L3' : 'A2'; render(); }); tabs.append(b); tb[n] = b; });
    var chips = el('div', 'lab-chips'); chips.setAttribute('role', 'group'); chips.setAttribute('aria-label', 'Task');
    var chipBtns = TASKS.map(function (t, i) { var b = el('button', 'lab-chip', 'Task ' + (i + 1)); b.type = 'button'; b.addEventListener('click', function () { st.task = i; st.sheet = 'Trips'; st.sel = t.cells[0]; render(true); }); chips.append(b); return b; });
    row.append(tabs); host.append(row, chips);
    var taskP = el('p', 'ds-sheet-task'); host.append(taskP);

    var bar = el('div', 'ds-sheet-bar');
    var addr = el('span', 'ds-sheet-addr'); var fx = el('span', 'ds-sheet-fx', 'fx');
    var inp = el('input'); inp.type = 'text'; inp.spellcheck = false; inp.setAttribute('aria-label', 'Formula bar'); inp.autocomplete = 'off';
    bar.append(addr, fx, inp); host.append(bar);
    var actions = el('div', 'lab-actions');
    var bFill = el('button', 'lab-btn', 'Fill down to row 19'), bCheck = el('button', 'lab-btn lab-btn--primary', 'Check this task'), bHint = el('button', 'lab-btn', 'Hint'), bModel = el('button', 'lab-btn', 'Show the formula'), bReset = el('button', 'lab-btn lab-btn--quiet', 'Reset the sheet');
    [bFill, bCheck, bHint, bModel, bReset].forEach(function (b) { b.type = 'button'; actions.append(b); });
    var fb = el('div', 'lab-feedback is-info'); fb.hidden = true; fb.setAttribute('role', 'status');
    var wrap = el('div', 'lab-table-wrap ds-sheet-wrap'); wrap.tabIndex = 0; wrap.setAttribute('role', 'group'); wrap.setAttribute('aria-label', 'Spreadsheet');
    var grid = el('table', 'ds-sheet-grid'); wrap.append(grid);
    host.append(wrap, actions, fb);
    host.append(el('p', 'lab-note', 'Functions available: SUM, COUNT, MAX (NESA: MAXIMUM), MIN (MINIMUM), AVERAGE (MEAN), STDEV (STANDARD DEVIATION), ABS, SQRT, INT, ROUND, IF and LOOKUP, with the comparisons = <> < <= > >=. A formula always starts with =. Real spreadsheets have many more functions, and LOOKUP behaves slightly differently between products.'));

    function cellAt(a) { var s = book.sheets[st.sheet]; return s[a]; }
    function maxCol() { return st.sheet === 'Trips' ? 17 : 4; }
    function maxRow() { return st.sheet === 'Trips' ? LAST : 6; }
    function drawGrid() {
      grid.replaceChildren();
      var hr = el('tr'); hr.append(el('th', 'ds-sheet-corner'));
      for (var c = 1; c <= maxCol(); c++) hr.append(el('th', 'ds-sheet-col', colName(c)));
      var th = el('thead'); th.append(hr); grid.append(th);
      var tbody = el('tbody'); grid.append(tbody);
      var refs = highlighted();
      for (var r = 1; r <= maxRow(); r++) {
        var tr = el('tr'); tr.append(el('th', 'ds-sheet-rowh', String(r)));
        for (var c2 = 1; c2 <= maxCol(); c2++) {
          var a = colName(c2) + r, cell = cellAt(a), td = el('td');
          var v = cell ? book.value(st.sheet, a) : '';
          td.textContent = fmtVal(v, colName(c2));
          td.dataset.addr = a;
          if (typeof v === 'number') td.classList.add('is-num');
          if (v && v.err) td.classList.add('is-err');
          if (cell && cell.f !== undefined) td.classList.add('is-formula');
          if (r === 1) td.classList.add('is-head');
          if (a === st.sel) td.classList.add('is-sel');
          if (refs.some(function (x) { return x.sheet === st.sheet && colNum(a.replace(/\d+/, '')) >= x.c1 && colNum(a.replace(/\d+/, '')) <= x.c2 && r >= x.r1 && r <= x.r2; })) td.classList.add('is-ref');
          td.tabIndex = a === st.sel ? 0 : -1;
          td.setAttribute('role', 'gridcell');
          tr.append(td);
        }
        tbody.append(tr);
      }
    }
    function highlighted() {
      var c = cellAt(st.sel); if (!c || c.f === undefined) return [];
      var out = []; (c.f.match(/(?:(?:'[^']+'|[A-Za-z_][A-Za-z0-9_]*)!)?\$?[A-Za-z]{1,2}\$?\d+(?::\$?[A-Za-z]{1,2}\$?\d+)?/g) || []).forEach(function (r) { if (/^[A-Za-z]+\d+$/.test(r) || /[:$!]/.test(r) || /^[A-Za-z]{1,2}\d+$/.test(r)) { try { out.push(parseRef(r, st.sheet)); } catch (e) { /* ignore */ } } });
      return out;
    }
    function render(scroll) {
      book.reset();
      Object.keys(tb).forEach(function (n) { tb[n].setAttribute('aria-pressed', String(st.sheet === n)); });
      chipBtns.forEach(function (b, i) { b.setAttribute('aria-pressed', String(i === st.task)); });
      taskP.textContent = 'Task ' + (st.task + 1) + ' of ' + TASKS.length + ': ' + TASKS[st.task].q;
      bFill.hidden = !TASKS[st.task].fill;
      addr.textContent = st.sel;
      var c = cellAt(st.sel); inp.value = c ? (c.f !== undefined ? c.f : (c.v === undefined ? '' : String(c.v))) : '';
      drawGrid();
      if (scroll) {
        // Scroll only the sheet, never the page
        var td = grid.querySelector('.is-sel');
        if (td) { wrap.scrollLeft = Math.max(0, td.offsetLeft - wrap.clientWidth / 2); wrap.scrollTop = Math.max(0, td.offsetTop - wrap.clientHeight / 2); }
      }
    }
    function commit() {
      var s = book.sheets[st.sheet], text = inp.value.trim();
      if (!text) delete s[st.sel];
      else if (text[0] === '=') s[st.sel] = { f: text };
      else s[st.sel] = { v: isNaN(+text) ? text : +text };
      render();
      var c = s[st.sel];
      if (c && c.f !== undefined) { var v = book.value(st.sheet, st.sel); if (v && v.err) { fb.hidden = false; fb.className = 'lab-feedback is-bad'; fb.textContent = v.err + ' ' + (v.msg || ''); return; } }
      fb.hidden = true;
    }
    grid.addEventListener('click', function (e) { var td = e.target.closest('td'); if (!td) return; st.sel = td.dataset.addr; fb.hidden = true; render(); });
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); commit(); } else if (e.key === 'Escape') { render(); } });
    inp.addEventListener('blur', function () { var c = cellAt(st.sel); var cur = c ? (c.f !== undefined ? c.f : String(c.v === undefined ? '' : c.v)) : ''; if (inp.value.trim() !== cur) commit(); });
    wrap.addEventListener('keydown', function (e) {
      var m = /^([A-Z]+)(\d+)$/.exec(st.sel), c = colNum(m[1]), r = +m[2], d = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.key];
      if (!d) return; e.preventDefault();
      c = Math.min(maxCol(), Math.max(1, c + d[0])); r = Math.min(maxRow(), Math.max(1, r + d[1])); st.sel = colName(c) + r; render(true); var t = grid.querySelector('.is-sel'); if (t) t.focus();
    });
    bFill.addEventListener('click', function () {
      var c = cellAt(st.sel); if (!c || c.f === undefined) { fb.hidden = false; fb.className = 'lab-feedback is-warn'; fb.textContent = 'Select a cell that contains a formula, and press Fill down.'; return; }
      var m = /^([A-Z]+)(\d+)$/.exec(st.sel), row0 = +m[2];
      for (var r = row0 + 1; r <= LAST; r++) book.sheets.Trips[m[1] + r] = { f: shiftFormula(c.f, r - row0) };
      fb.hidden = true; render();
    });
    bHint.addEventListener('click', function () { fb.hidden = false; fb.className = 'lab-feedback is-info'; fb.textContent = 'Hint: ' + TASKS[st.task].hint; });
    bModel.addEventListener('click', function () {
      var t = TASKS[st.task];
      book.sheets.Trips[t.cells[0]] = { f: t.model };
      if (t.fill) { var m = /^([A-Z]+)(\d+)$/.exec(t.cells[0]); for (var r = 3; r <= LAST; r++) book.sheets.Trips[m[1] + r] = { f: shiftFormula(t.model, r - 2) }; }
      st.sheet = 'Trips'; st.sel = t.cells[0]; fb.hidden = false; fb.className = 'lab-feedback is-info'; fb.textContent = 'The formula in ' + t.cells[0] + ' is ' + t.model + (t.fill ? ', filled down to row 19.' : '.'); render(true);
    });
    bReset.addEventListener('click', function () { book = new Book(); book.reset(); st.sheet = 'Trips'; st.sel = TASKS[st.task].cells[0]; fb.hidden = true; render(true); });
    bCheck.addEventListener('click', function () {
      var t = TASKS[st.task], bad = null, typed = false;
      book.reset();
      for (var i = 0; i < t.cells.length; i++) {
        var a = t.cells[i], c = book.sheets.Trips[a], v = c ? book.value('Trips', a) : undefined, e = t.exp(a);
        if (!c) { bad = a + ' is empty.'; break; }
        if (c.f === undefined) typed = true;
        if (v && v.err) { bad = a + ' shows ' + v.err + '. ' + (v.msg || ''); break; }
        var ok = typeof e === 'number' ? (typeof v === 'number' && Math.abs(v - e) < 0.005) : v === e;
        if (!ok) { bad = a + ' shows ' + fmtVal(v, a[0]) + ', but the expected value is ' + fmtVal(e, a[0]) + '.'; break; }
      }
      fb.hidden = false;
      if (bad) { fb.className = 'lab-feedback is-warn'; fb.textContent = 'Not yet. ' + bad + (t.fill ? ' Have you filled the formula down to row 19?' : ''); }
      else if (typed) { fb.className = 'lab-feedback is-warn'; fb.textContent = 'The value is right, but you typed it. Use a formula, so the answer updates when the data changes.'; }
      else { fb.className = 'lab-feedback is-good'; fb.textContent = 'Correct. Every cell in this task has the expected value, and each one is a formula.'; }
    });
    render(true);
  }
  function init() { document.querySelectorAll('[data-ds="sheet"]').forEach(buildSheet); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
