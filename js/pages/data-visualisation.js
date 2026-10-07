/* Data visualisation page: the "Interrogate the chart" widget.
   A small chart of a clearly fictional dataset (45 hire bookings at an imaginary beachside shop, plus one optional
   large corporate booking). Students change the aggregation (total, average, count), the grouping (month or
   category), apply filters, and toggle the outlier to see how the chart, the mean and the median respond.
   Vanilla JS and SVG, no storage, no external libraries. Data Visualisation › Interrogating a visualisation. */
(function () {
  'use strict';
  var root = document.getElementById('dv-lab');
  if (!root) return;

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  var CATS = ['Kayak', 'Paddleboard', 'Bike'];
  /* [month, category, booking value in dollars]. Fictional. */
  var RAW = [["Jan","Paddleboard",55],["Jan","Bike",50],["Jan","Kayak",80],["Jan","Paddleboard",65],["Jan","Bike",55],["Jan","Bike",55],["Jan","Kayak",90],["Jan","Bike",45],["Jan","Paddleboard",60],["Jan","Paddleboard",85],["Feb","Kayak",90],["Feb","Kayak",65],["Feb","Bike",55],["Feb","Bike",40],["Feb","Kayak",60],["Feb","Kayak",100],["Feb","Bike",45],["Feb","Kayak",110],["Feb","Paddleboard",90],["Mar","Kayak",95],["Mar","Kayak",85],["Mar","Bike",45],["Mar","Bike",55],["Mar","Bike",30],["Mar","Kayak",80],["Mar","Paddleboard",75],["Mar","Paddleboard",65],["Apr","Paddleboard",70],["Apr","Bike",50],["Apr","Kayak",110],["Apr","Bike",35],["Apr","Paddleboard",85],["Apr","Paddleboard",75],["Apr","Kayak",75],["May","Paddleboard",60],["May","Bike",45],["May","Bike",30],["May","Paddleboard",80],["May","Paddleboard",45],["May","Kayak",70],["Jun","Paddleboard",45],["Jun","Kayak",100],["Jun","Kayak",100],["Jun","Kayak",70],["Jun","Bike",35]];
  var OUTLIER = { m: 'Mar', c: 'Kayak', v: 2400, note: 'Corporate team-building day (30 kayaks)' };
  var RECORDS = RAW.map(function (r, i) { return { id: i + 1, m: r[0], c: r[1], v: r[2] }; });
  var NS = 'http://www.w3.org/2000/svg';

  var state = { group: 'month', measure: 'sum', cat: 'All', months: 'All', outlier: false, zero: true };
  var $ = {};

  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function h(tag, attrs, html) {
    var n = document.createElement(tag);
    for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    if (html != null) n.innerHTML = html;
    return n;
  }
  function money(v) {
    var neg = v < 0; v = Math.abs(v);
    var s = (Math.abs(v - Math.round(v)) < 0.005) ? String(Math.round(v)) : v.toFixed(2);
    var parts = s.split('.'); parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (neg ? '-' : '') + '$' + parts.join('.');
  }
  function fmt(v, measure) { return measure === 'count' ? String(Math.round(v)) : money(v); }
  function median(a) {
    if (!a.length) return null;
    var s = a.slice().sort(function (x, y) { return x - y; }), m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }
  function niceStep(range, ticks) {
    var raw = range / ticks, p = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10)), f = raw / p;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p;
  }

  function data() {
    var rs = RECORDS.slice();
    if (state.outlier) rs.push({ id: 46, m: OUTLIER.m, c: OUTLIER.c, v: OUTLIER.v, outlier: true });
    return rs.filter(function (r) {
      if (state.cat !== 'All' && r.c !== state.cat) return false;
      if (state.months === 'Jan-Mar' && MONTHS.indexOf(r.m) > 2) return false;
      if (state.months === 'Apr-Jun' && MONTHS.indexOf(r.m) < 3) return false;
      return true;
    });
  }
  function keys() {
    if (state.group === 'category') return CATS.slice();
    if (state.months === 'Jan-Mar') return MONTHS.slice(0, 3);
    if (state.months === 'Apr-Jun') return MONTHS.slice(3);
    return MONTHS.slice();
  }
  function aggregate(rs) {
    return keys().map(function (k) {
      var vals = rs.filter(function (r) { return (state.group === 'month' ? r.m : r.c) === k; }).map(function (r) { return r.v; });
      var sum = vals.reduce(function (a, b) { return a + b; }, 0);
      var value = state.measure === 'count' ? vals.length : state.measure === 'sum' ? sum : (vals.length ? sum / vals.length : null);
      return { key: k, n: vals.length, value: value };
    });
  }

  /* ---------- Build the controls once ---------- */
  function radio(name, value, label, checked) {
    var id = 'dv-' + name + '-' + value;
    var w = h('label', { 'class': 'dv-opt', 'for': id });
    var i = h('input', { type: 'radio', name: 'dv-' + name, id: id, value: value });
    if (checked) i.checked = true;
    w.appendChild(i); w.appendChild(document.createTextNode(' ' + label));
    return w;
  }
  function build() {
    root.innerHTML = '';
    var controls = h('div', { 'class': 'dv-controls' });

    var g1 = h('fieldset', { 'class': 'dv-fs' }, '<legend>Group the bars by</legend>');
    g1.appendChild(radio('group', 'month', 'Month', true)); g1.appendChild(radio('group', 'category', 'Category', false));
    var g2 = h('fieldset', { 'class': 'dv-fs' }, '<legend>Aggregation (what each bar shows)</legend>');
    g2.appendChild(radio('measure', 'sum', 'Total ($)', true)); g2.appendChild(radio('measure', 'avg', 'Average ($)', false)); g2.appendChild(radio('measure', 'count', 'Count (bookings)', false));

    var f = h('div', { 'class': 'dv-filters' });
    var cl = h('label', { 'class': 'dv-sel', 'for': 'dv-cat' }, 'Filter: category ');
    $.cat = h('select', { id: 'dv-cat' }, ['All'].concat(CATS).map(function (c) { return '<option value="' + c + '">' + (c === 'All' ? 'All categories' : c) + '</option>'; }).join(''));
    cl.appendChild($.cat);
    var ml = h('label', { 'class': 'dv-sel', 'for': 'dv-months' }, 'Filter: months ');
    $.months = h('select', { id: 'dv-months' }, '<option value="All">All months (Jan to Jun)</option><option value="Jan-Mar">Jan to Mar</option><option value="Apr-Jun">Apr to Jun</option>');
    ml.appendChild($.months);
    f.appendChild(cl); f.appendChild(ml);

    var t = h('div', { 'class': 'dv-toggles' });
    var ol = h('label', { 'class': 'dv-check', 'for': 'dv-outlier' });
    $.outlier = h('input', { type: 'checkbox', id: 'dv-outlier' });
    ol.appendChild($.outlier); ol.appendChild(document.createTextNode(' Add the outlier: one ' + money(OUTLIER.v) + ' corporate booking in March'));
    var zl = h('label', { 'class': 'dv-check', 'for': 'dv-zero' });
    $.zero = h('input', { type: 'checkbox', id: 'dv-zero' }); $.zero.checked = true;
    zl.appendChild($.zero); zl.appendChild(document.createTextNode(' Start the value axis at zero'));
    $.reset = h('button', { type: 'button', 'class': 'btn dv-reset' }, 'Reset');
    t.appendChild(ol); t.appendChild(zl); t.appendChild($.reset);

    controls.appendChild(g1); controls.appendChild(g2); controls.appendChild(f); controls.appendChild(t);
    root.appendChild(controls);

    $.title = h('h5', { 'class': 'dv-chart-title', id: 'dv-chart-title' });
    $.stage = h('div', { 'class': 'dv-stage' });
    $.svg = el('svg', { 'class': 'dv-svg', role: 'img', 'aria-labelledby': 'dv-chart-title dv-summary' });
    $.stage.appendChild($.svg);
    $.summary = h('p', { 'class': 'dv-summary', id: 'dv-summary', 'aria-live': 'polite' });
    $.stats = h('div', { 'class': 'dv-stats' });
    $.read = h('p', { 'class': 'dv-read' });
    $.details = h('details', { 'class': 'dv-details' }, '<summary>Show the bookings behind the chart</summary>');
    $.tableWrap = h('div', { 'class': 'table-wrap' });
    $.details.appendChild($.tableWrap);
    [$.title, $.stage, $.summary, $.stats, $.read, $.details].forEach(function (n) { root.appendChild(n); });

    root.addEventListener('change', function (e) {
      var t = e.target;
      if (t.name === 'dv-group') state.group = t.value;
      else if (t.name === 'dv-measure') state.measure = t.value;
      else if (t === $.cat) state.cat = t.value;
      else if (t === $.months) state.months = t.value;
      else if (t === $.outlier) state.outlier = t.checked;
      else if (t === $.zero) state.zero = t.checked;
      render();
    });
    $.reset.addEventListener('click', function () {
      state = { group: 'month', measure: 'sum', cat: 'All', months: 'All', outlier: false, zero: true };
      root.querySelector('#dv-group-month').checked = true;
      root.querySelector('#dv-measure-sum').checked = true;
      $.cat.value = 'All'; $.months.value = 'All'; $.outlier.checked = false; $.zero.checked = true;
      render();
    });
    if (window.ResizeObserver) new ResizeObserver(function () { render(true); }).observe($.stage);
    else window.addEventListener('resize', function () { render(true); });
  }

  /* ---------- Draw ---------- */
  var lastW = 0;
  function render(fromResize) {
    var rs = data();
    var groups = aggregate(rs);
    var W = Math.max(270, Math.round(($.stage.clientWidth || 600) - 10));
    if (fromResize === true && W === lastW) return;
    lastW = W;
    var H = 320, m = { l: 62, r: 14, t: 26, b: 44 };
    var vals = groups.map(function (g) { return g.value; }).filter(function (v) { return v != null; });
    var vmax = vals.length ? Math.max.apply(null, vals) : 1, vmin = vals.length ? Math.min.apply(null, vals) : 0;
    if (vmax <= 0) vmax = 1;
    var lo = 0, truncated = false;
    if (!state.zero && vals.length > 1 && vmin > 0) {
      var span = vmax - vmin || vmax * 0.1;
      var step0 = niceStep(vmax - 0, 4);
      lo = Math.max(0, Math.floor((vmin - span * 0.35) / step0) * step0);
      truncated = lo > 0;
    }
    var step = niceStep(vmax - lo, 4);
    var hi = Math.ceil(vmax / step) * step;
    if (hi === lo) hi = lo + step;
    var plotW = W - m.l - m.r, plotH = H - m.t - m.b;
    var Y = function (v) { return m.t + plotH - (v - lo) / (hi - lo) * plotH; };

    while ($.svg.firstChild) $.svg.removeChild($.svg.firstChild);
    $.svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    $.svg.setAttribute('width', W); $.svg.setAttribute('height', H);

    for (var t = lo; t <= hi + step / 2; t += step) {
      el('line', { x1: m.l, x2: W - m.r, y1: Y(t), y2: Y(t), 'class': 'dv-grid' }, $.svg);
      el('text', { x: m.l - 8, y: Y(t), 'class': 'dv-tick', 'text-anchor': 'end', 'dominant-baseline': 'middle' }, $.svg).textContent = fmt(t, state.measure);
    }
    el('line', { x1: m.l, x2: m.l, y1: m.t, y2: m.t + plotH, 'class': 'dv-axis' }, $.svg);
    el('line', { x1: m.l, x2: W - m.r, y1: m.t + plotH, y2: m.t + plotH, 'class': 'dv-axis' }, $.svg);

    var band = plotW / groups.length, bw = Math.min(72, band * 0.6);
    groups.forEach(function (g, i) {
      var cx = m.l + band * (i + 0.5);
      el('text', { x: cx, y: m.t + plotH + 22, 'class': 'dv-cat', 'text-anchor': 'middle' }, $.svg).textContent = g.key;
      if (g.value == null) {
        el('text', { x: cx, y: m.t + plotH - 8, 'class': 'dv-val', 'text-anchor': 'middle' }, $.svg).textContent = 'no data';
        return;
      }
      var top = Y(Math.max(g.value, lo)), base = Y(lo);
      var flagged = state.outlier && g.n && (state.group === 'month' ? g.key === OUTLIER.m : g.key === OUTLIER.c);
      var r = el('rect', { x: cx - bw / 2, y: top, width: bw, height: Math.max(0, base - top), 'class': 'dv-bar' + (flagged ? ' is-outlier' : '') }, $.svg);
      el('title', {}, r).textContent = g.key + ': ' + fmt(g.value, state.measure) + ' (' + g.n + ' bookings)';
      el('text', { x: cx, y: top - 7 - ((band < 52 && i % 2) ? 16 : 0), 'class': 'dv-val', 'text-anchor': 'middle' }, $.svg).textContent = fmt(g.value, state.measure);
    });
    if (truncated) {
      el('text', { x: W - m.r, y: 14, 'class': 'dv-warn', 'text-anchor': 'end' }, $.svg).textContent = 'Axis starts at ' + fmt(lo, state.measure) + ', not zero';
    }

    var mname = { sum: 'Total booking value', avg: 'Average booking value', count: 'Number of bookings' }[state.measure];
    var scope = (state.cat === 'All' ? 'all categories' : state.cat) + ', ' + (state.months === 'All' ? 'January to June' : state.months.replace('-', ' to ').replace('Jan', 'January').replace('Mar', 'March').replace('Apr', 'April').replace('Jun', 'June'));
    $.title.textContent = mname + ' by ' + state.group + ' (' + scope + ')';

    var withVal = groups.filter(function (g) { return g.value != null; });
    if (withVal.length) {
      var best = withVal.reduce(function (a, b) { return b.value > a.value ? b : a; });
      var worst = withVal.reduce(function (a, b) { return b.value < a.value ? b : a; });
      $.summary.textContent = 'Highest bar: ' + best.key + ' (' + fmt(best.value, state.measure) + '). Lowest bar: ' + worst.key + ' (' + fmt(worst.value, state.measure) + ').';
      $.svg.setAttribute('aria-label', $.title.textContent);
    } else {
      $.summary.textContent = 'No bookings match the filters.';
    }

    /* Statistics for the filtered records */
    var v = rs.map(function (r) { return r.v; });
    var total = v.reduce(function (a, b) { return a + b; }, 0), mean = v.length ? total / v.length : null, med = median(v);
    var mx = v.length ? Math.max.apply(null, v) : null;
    $.stats.innerHTML = '';
    [['Bookings', v.length ? String(v.length) : '0'], ['Total', v.length ? money(total) : '-'], ['Mean', mean == null ? '-' : money(mean)], ['Median', med == null ? '-' : money(med)], ['Largest', mx == null ? '-' : money(mx)]].forEach(function (p) {
      $.stats.appendChild(h('div', { 'class': 'dv-stat' }, '<span class="dv-stat-k">' + p[0] + '</span><span class="dv-stat-v">' + p[1] + '</span>'));
    });
    var msg;
    if (mean == null) msg = 'Nothing to summarise: try a wider filter.';
    else if (med > 0 && mean > med * 1.25) msg = 'The mean (' + money(mean) + ') is well above the median (' + money(med) + '). A few very large values are pulling the mean up, so the median describes a typical booking better.';
    else msg = 'The mean (' + money(mean) + ') and median (' + money(med) + ') are close, so the values are spread fairly evenly.';
    $.read.textContent = msg;

    /* Table of records */
    var rows = rs.slice().sort(function (a, b) { return MONTHS.indexOf(a.m) - MONTHS.indexOf(b.m); }).map(function (r) {
      return '<tr' + (r.outlier ? ' class="dv-row-out"' : '') + '><td>' + r.id + '</td><td>' + r.m + '</td><td>' + r.c + '</td><td>' + money(r.v) + (r.outlier ? ' (outlier)' : '') + '</td></tr>';
    }).join('');
    $.tableWrap.innerHTML = '<table><thead><tr><th>ID</th><th>Month</th><th>Category</th><th>Booking value</th></tr></thead><tbody>' + (rows || '<tr><td colspan="4">No bookings match the filters.</td></tr>') + '</tbody></table>';
  }

  build();
  render();
})();

/* Data visualisation: labs built on the shared kit (css/labs.css, js/labs.js).
   1. OLAP explorer: slice, dice, drill down, roll up and pivot a small cube of fictional cafe sales.
   2. Practice sets: which chart answers the question, what is wrong with this chart, and which validation check catches this value.
   All data is fictional. */
(function () {
  'use strict';
  var el = Labs.el;
  var NS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.append(e); return e; }

  /* ---------- 1. OLAP explorer ---------- */
  var REGIONS = ['Coast', 'Inland'], PRODUCTS = ['Coffee', 'Cake', 'Tea'], QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];
  var MONTHS = [['Jan', 'Feb', 'Mar'], ['Apr', 'May', 'Jun'], ['Jul', 'Aug', 'Sep'], ['Oct', 'Nov', 'Dec']];
  // Sales in $000: SALES[region][product][quarter]. Totals match the worked figures in the notes (Coast 336, Inland 236, all 572).
  var SALES = { Coast: { Coffee: [40, 44, 52, 48], Cake: [20, 22, 26, 30], Tea: [12, 14, 15, 13] }, Inland: { Coffee: [27, 31, 33, 31], Cake: [14, 15, 17, 21], Tea: [10, 11, 13, 13] } };
  function split3(t) { var b = Math.floor(t / 3), r = t - 3 * b; return r === 0 ? [b, b, b] : r === 1 ? [b, b + 1, b] : [b + 1, b + 1, b]; }
  var DIMS = { Region: REGIONS, Product: PRODUCTS, Time: null };

  function buildOlap(host) {
    Labs.shell(host, 'dv-olap-lab', 'OLAP cube explorer', 'This cube holds fictional café sales in thousands of dollars, by Product, Region and Time. Change the view and the tool names the OLAP operation you have just used. Each operation only changes how the same numbers are viewed.');
    var st = { rows: 'Product', cols: 'Time', level: 'Quarter', sel: { Region: { Coast: true, Inland: true }, Product: { Coffee: true, Cake: true, Tea: true }, Time: { Q1: true, Q2: true, Q3: true, Q4: true } } };

    var row = el('div', 'lab-row');
    function pickDim(label, key) {
      var f = el('div', 'lab-field'), l = el('label', null, label), s = el('select'); l.htmlFor = s.id = 'dv-olap-' + key;
      ['Product', 'Time', 'Region'].forEach(function (d) { var o = el('option', null, d); o.value = d; s.append(o); });
      s.value = st[key]; s.addEventListener('change', function () { st[key] = s.value; if (st.rows === st.cols) { var other = key === 'rows' ? 'cols' : 'rows'; st[other] = ['Product', 'Time', 'Region'].filter(function (d) { return d !== st[key] && d !== (key === 'rows' ? st.cols : st.rows); })[0] || 'Region'; } sync(); update(); });
      f.append(l, s); row.append(f); return s;
    }
    var sRows = pickDim('Down the side', 'rows'), sCols = pickDim('Across the top', 'cols');
    var fl = el('div', 'lab-field'); fl.append(el('span', 'lab-label', 'Time level'));
    var lv = el('div', 'lab-seg'); lv.setAttribute('role', 'group'); lv.setAttribute('aria-label', 'Time level');
    var lvBtn = {};
    ['Year', 'Quarter', 'Month'].forEach(function (n) { var b = el('button', null, n); b.type = 'button'; b.addEventListener('click', function () { st.level = n; update(); }); lv.append(b); lvBtn[n] = b; });
    fl.append(lv); row.append(fl); host.append(row);

    var filters = el('div', 'lab-row dv-olap-filters'); host.append(filters);
    var tableBox = el('div'); var ops = el('div', 'lab-readout'); ops.setAttribute('role', 'status');
    host.append(tableBox, ops);
    host.append(el('p', 'lab-note', 'Slice and dice keep some values and hide the rest. Drill-down and roll-up change the level of detail inside a hierarchy (year, quarter, month). Pivot swaps the axes. Dimensions not on an axis are added together (rolled up). Quarter and month figures are the fictional values from the notes; the months in each quarter are split evenly.'));

    function sync() { /* keep the selects in step */ sRows.value = st.rows; sCols.value = st.cols; }
    function timeValues() { return st.level === 'Year' ? ['Year'] : st.level === 'Quarter' ? QUARTERS : [].concat.apply([], MONTHS); }
    function valuesOf(dim) { return dim === 'Time' ? timeValues() : DIMS[dim]; }
    function quarterOf(m) { for (var q = 0; q < 4; q++) if (MONTHS[q].indexOf(m) >= 0) return q; return 0; }
    function cell(regions, products, timeKey) {
      var total = 0;
      regions.forEach(function (r) { products.forEach(function (p) {
        var q = SALES[r][p];
        if (timeKey === 'Year') total += q.reduce(function (a, b) { return a + b; }, 0);
        else if (QUARTERS.indexOf(timeKey) >= 0) total += q[QUARTERS.indexOf(timeKey)];
        else { var qi = quarterOf(timeKey); total += split3(q[qi])[MONTHS[qi].indexOf(timeKey)]; }
      }); });
      return total;
    }
    function keptTime() { // the time values allowed by the quarter filter
      return timeValues().filter(function (t) { if (t === 'Year') return true; var q = QUARTERS.indexOf(t) >= 0 ? QUARTERS.indexOf(t) : quarterOf(t); return st.sel.Time[QUARTERS[q]]; });
    }
    function chosen(dim) { return dim === 'Time' ? keptTime() : DIMS[dim].filter(function (v) { return st.sel[dim][v]; }); }

    function drawFilters() {
      filters.replaceChildren();
      ['Region', 'Product', 'Time'].forEach(function (dim) {
        var f = el('fieldset', 'dv-olap-set'); f.append(el('legend', null, dim === 'Time' ? 'Quarters included' : dim + 's included'));
        (dim === 'Time' ? QUARTERS : DIMS[dim]).forEach(function (v) {
          var l = el('label', 'lab-check'), c = el('input'); c.type = 'checkbox'; c.checked = !!st.sel[dim][v]; l.append(c, document.createTextNode(v));
          c.addEventListener('change', function () { st.sel[dim][v] = c.checked; if (!Object.keys(st.sel[dim]).some(function (k) { return st.sel[dim][k]; })) { st.sel[dim][v] = true; } update(); });
          f.append(l);
        });
        filters.append(f);
      });
    }
    function update() {
      Object.keys(lvBtn).forEach(function (n) { lvBtn[n].setAttribute('aria-pressed', String(st.level === n)); });
      drawFilters();
      var third = ['Product', 'Time', 'Region'].filter(function (d) { return d !== st.rows && d !== st.cols; })[0];
      var rv = chosen(st.rows), cv = chosen(st.cols);
      var tab = Labs.table([st.rows + ' \\ ' + st.cols].concat(cv).concat(['Total']), { num: cv.map(function (c, i) { return i + 1; }).concat([cv.length + 1]) });
      function val(rKey, cKey) {
        var ctx = { Region: chosen('Region'), Product: chosen('Product'), Time: null };
        var tKey = null;
        [[st.rows, rKey], [st.cols, cKey]].forEach(function (p) { if (p[0] === 'Region') ctx.Region = [p[1]]; else if (p[0] === 'Product') ctx.Product = [p[1]]; else tKey = p[1]; });
        if (tKey !== null) return cell(ctx.Region, ctx.Product, tKey);
        // time is the third dimension: add up the kept time values at this level
        return keptTime().reduce(function (a, t) { return a + cell(ctx.Region, ctx.Product, t); }, 0);
      }
      var colTot = cv.map(function () { return 0; }), grand = 0;
      rv.forEach(function (r) {
        var rowTot = 0, cells = [r];
        cv.forEach(function (c, i) { var v = val(r, c); rowTot += v; colTot[i] += v; cells.push(String(v)); });
        grand += rowTot; cells.push(String(rowTot)); tab.add(cells);
      });
      tab.add(['Total'].concat(colTot.map(String)).concat([String(grand)]), 'is-sel');
      tableBox.replaceChildren(tab.wrap);
      // Name the operations in use, compared with the starting view (Product by Quarter, everything included)
      var used = [];
      var dimsKept = {};
      ['Region', 'Product'].forEach(function (d) { dimsKept[d] = chosen(d).length; });
      var timeQ = QUARTERS.filter(function (q) { return st.sel.Time[q]; }).length;
      var sliced = [], diced = [];
      [['Region', REGIONS.length], ['Product', PRODUCTS.length], ['Time', 4]].forEach(function (p) {
        var kept = p[0] === 'Time' ? timeQ : dimsKept[p[0]];
        if (kept === 1) sliced.push(p[0] + ' = ' + (p[0] === 'Time' ? QUARTERS.filter(function (q) { return st.sel.Time[q]; })[0] : chosen(p[0])[0]));
        else if (kept < p[1]) diced.push(p[0] + ' limited to ' + (p[0] === 'Time' ? QUARTERS.filter(function (q) { return st.sel.Time[q]; }).join(', ') : chosen(p[0]).join(', ')));
      });
      if (sliced.length) used.push('Slice (' + sliced.join('; ') + '): one dimension is fixed to a single value.');
      if (diced.length || sliced.length > 1) used.push('Dice (' + diced.concat(sliced.length > 1 ? ['two dimensions fixed'] : []).join('; ') + '): values chosen on more than one dimension give a smaller sub-cube.');
      if (st.level === 'Month') used.push('Drill-down: Time moved from Quarter down to Month, which is more detail.');
      if (st.level === 'Year') used.push('Roll-up: Time moved from Quarter up to Year, which is less detail.');
      var startView = st.rows === 'Product' && st.cols === 'Time';
      if (!startView && third !== 'Time' && chosen(third).length > 1) used.push('Roll-up: ' + third + ' is not on an axis, so its values are added together.');
      else if (!startView && third === 'Time' && keptTime().length > 1) used.push('Roll-up: Time is not on an axis, so its values are added together.');
      else if (startView && chosen('Region').length > 1) used.push('Roll-up: Region is not on an axis, so Coast and Inland are added together.');
      if (st.rows !== 'Product' || st.cols !== 'Time') used.push('Pivot: the axes are arranged differently from the starting view (Product down the side, Time across the top). It is the same data viewed from another angle.');
      ops.className = 'lab-readout';
      var onlyBase = used.length === 1 && used[0].indexOf('Region is not on an axis') > -1 && st.level === 'Quarter';
      if (onlyBase) used = [];
      ops.replaceChildren(el('p', null, used.length ? 'Operations in this view:' : 'This is the starting view: Product down the side, Quarter across the top, with Coast and Inland added together. Nothing has been sliced, diced, drilled or pivoted yet.'));
      if (used.length) { var ul = el('ul', 'lab-list'); used.forEach(function (u) { ul.append(el('li', null, u)); }); ops.append(ul); }
      ops.append(el('p', 'lab-note', 'The grand total of the cells shown is $' + grand + ' thousand. Try: tick only Coast (slice), then tick only Coffee and Cake and Q3 and Q4 as well (dice), then change the time level to Month (drill-down).'));
    }
    update();
  }

  /* ---------- 2. Practice sets ---------- */
  function chartVisual(kind) {
    return function () {
      var box = el('div', 'dv-flaw-visual');
      var svg = svgEl('svg', { viewBox: '0 0 360 190', role: 'img', class: 'dv-svg' }, box);
      function txt(x, y, s, extra) { var t = svgEl('text', Object.assign({ x: x, y: y, 'font-size': 13 }, extra || {}), svg); t.textContent = s; return t; }
      function bar(x, y, w, h, cls) { svgEl('rect', { x: x, y: y, width: w, height: h, class: cls || 'dv-bar' }, svg); }
      if (kind === 'axis') {
        svg.setAttribute('aria-label', 'Bar chart titled "Customer satisfaction". Two bars: Last year about 78 and This year about 82. The vertical axis starts at 75, so the second bar looks about twice as tall.');
        txt(180, 16, 'Customer satisfaction (%)', { 'text-anchor': 'middle', 'font-weight': 700 });
        [75, 80, 85].forEach(function (v, i) { var y = 160 - i * 55; svgEl('line', { x1: 50, y1: y, x2: 340, y2: y, class: 'dv-grid' }, svg); txt(44, y + 4, String(v), { 'text-anchor': 'end' }); });
        bar(90, 160 - (78 - 75) * 11, 70, (78 - 75) * 11); bar(210, 160 - (82 - 75) * 11, 70, (82 - 75) * 11);
        txt(125, 180, 'Last year', { 'text-anchor': 'middle' }); txt(245, 180, 'This year', { 'text-anchor': 'middle' });
      } else if (kind === 'range') {
        svg.setAttribute('aria-label', 'Line chart titled "Sales are soaring". It shows only March to June, rising from 40 to 70. A note says the data for January and February, which were higher, is not shown.');
        txt(180, 16, 'Sales are soaring! ($000, Mar to Jun)', { 'text-anchor': 'middle', 'font-weight': 700 });
        var pts = [[70, 140], [140, 110], [210, 80], [280, 48]];
        svgEl('polyline', { points: pts.map(function (p) { return p.join(','); }).join(' '), class: 'dv-line', fill: 'none' }, svg);
        pts.forEach(function (p) { svgEl('circle', { cx: p[0], cy: p[1], r: 4, class: 'dv-dot' }, svg); });
        ['Mar', 'Apr', 'May', 'Jun'].forEach(function (m, i) { txt(pts[i][0], 180, m, { 'text-anchor': 'middle' }); });
        svgEl('line', { x1: 50, y1: 160, x2: 340, y2: 160, class: 'dv-grid' }, svg);
      } else if (kind === 'pie') {
        svg.setAttribute('aria-label', 'A pie chart with twelve thin slices, one for each month of the year, titled "Sales by month". The slices are almost the same size and cannot be told apart or compared.');
        txt(180, 16, 'Sales by month, one slice each', { 'text-anchor': 'middle', 'font-weight': 700 });
        var cx = 180, cy = 105, r = 70, vals = [8, 9, 7, 9, 8, 10, 8, 9, 7, 8, 9, 8], tot = vals.reduce(function (a, b) { return a + b; }, 0), a0 = -Math.PI / 2;
        vals.forEach(function (v, i) {
          var a1 = a0 + v / tot * Math.PI * 2, large = a1 - a0 > Math.PI ? 1 : 0;
          svgEl('path', { d: 'M' + cx + ',' + cy + ' L' + (cx + r * Math.cos(a0)) + ',' + (cy + r * Math.sin(a0)) + ' A' + r + ',' + r + ' 0 ' + large + ' 1 ' + (cx + r * Math.cos(a1)) + ',' + (cy + r * Math.sin(a1)) + ' Z', class: 'dv-slice dv-slice-' + (i % 4) }, svg);
          a0 = a1;
        });
      } else if (kind === 'context') {
        svg.setAttribute('aria-label', 'A line chart that climbs steeply from left to right. It has no title, no axis labels, no units and no source.');
        svgEl('polyline', { points: '30,150 80,140 130,120 180,95 230,70 280,40 330,22', class: 'dv-line', fill: 'none' }, svg);
        svgEl('line', { x1: 30, y1: 170, x2: 340, y2: 170, class: 'dv-grid' }, svg); svgEl('line', { x1: 30, y1: 10, x2: 30, y2: 170, class: 'dv-grid' }, svg);
      } else {
        svg.setAttribute('aria-label', 'Two bar charts side by side, both showing a rise from 10 to 20, one labelled "Our shop" with a vertical scale from 0 to 25 and one labelled "Rival shop" with a scale from 0 to 100, so the rival looks much smaller although both doubled.');
        txt(95, 16, 'Our shop', { 'text-anchor': 'middle', 'font-weight': 700 }); txt(265, 16, 'Rival shop', { 'text-anchor': 'middle', 'font-weight': 700 });
        svgEl('line', { x1: 30, y1: 160, x2: 160, y2: 160, class: 'dv-grid' }, svg); svgEl('line', { x1: 200, y1: 160, x2: 330, y2: 160, class: 'dv-grid' }, svg);
        txt(26, 164, '0', { 'text-anchor': 'end' }); txt(26, 40, '25', { 'text-anchor': 'end' }); txt(196, 164, '0', { 'text-anchor': 'end' }); txt(196, 40, '100', { 'text-anchor': 'end' });
        bar(50, 160 - 10 / 25 * 120, 40, 10 / 25 * 120); bar(105, 160 - 20 / 25 * 120, 40, 20 / 25 * 120);
        bar(220, 160 - 10 / 100 * 120, 40, 10 / 100 * 120, 'dv-bar dv-bar-2'); bar(275, 160 - 20 / 100 * 120, 40, 20 / 100 * 120, 'dv-bar dv-bar-2');
        txt(70, 180, 'Jan', { 'text-anchor': 'middle' }); txt(125, 180, 'Jun', { 'text-anchor': 'middle' }); txt(240, 180, 'Jan', { 'text-anchor': 'middle' }); txt(295, 180, 'Jun', { 'text-anchor': 'middle' });
      }
      return box;
    };
  }

  function buildChartChoice(host) {
    Labs.sorter(host, {
      cls: 'dv-chartsort', keepCase: true,
      title: 'Which chart answers the question?',
      lead: 'Read each question and choose the chart type that answers it most clearly. Think about what the data is: categories, time, parts of a whole or two measures.',
      noun: 'question', groupLabel: 'Chart type',
      choices: [{ key: 'Column or bar chart', label: 'Column or bar' }, { key: 'Line chart', label: 'Line' }, { key: 'Pie chart', label: 'Pie' }, { key: 'Scatter graph', label: 'Scatter' }],
      items: [
        { text: 'A café wants to compare total sales of coffee, cake, tea and sandwiches last month.', ans: 'Column or bar chart', why: 'Comparing a measure across separate categories is the job of a column or bar chart. The heights or lengths are easy to compare against a common baseline.' },
        { text: 'A school wants to show how daily attendance has changed over the 40 weeks of the year.', ans: 'Line chart', why: 'A line connects values in time order, so rises, falls and seasonal patterns are easy to see. Weeks are a continuous sequence, not separate categories.' },
        { text: 'A council wants to show how its $2 million budget is split between four services, adding to 100%.', ans: 'Pie chart', why: 'A pie shows parts of one whole, and works when there are only a few slices. The slices must add to 100% for the whole to make sense.' },
        { text: 'A teacher wants to see whether students who study more hours a week tend to get higher marks.', ans: 'Scatter graph', why: 'A scatter graph plots two numeric measures against each other, one point per student, so a relationship (and any outliers) shows up as a pattern of points.' },
        { text: 'A farm wants to compare average rainfall in each of the 12 months, to see which months are wettest.', ans: 'Column or bar chart', why: 'Twelve months on a pie would be unreadable, and a line would suggest the months flow into each other. Columns make the wettest months stand out.', },
        { text: 'A manager wants to track the daily temperature of a cold-storage room across one week, to spot sudden changes.', ans: 'Line chart', why: 'Readings taken in time order are a trend, and sudden jumps appear as sharp changes in the line.' }
      ],
      closing: 'Match the chart to the question: comparing categories, showing change over time, showing parts of a whole, or showing a relationship between two measures.'
    });
  }

  function buildFlaws(host) {
    var C = [{ key: 'Truncated axis', label: 'Truncated axis' }, { key: 'Cherry-picked range', label: 'Cherry-picked range' }, { key: 'Wrong chart type', label: 'Wrong chart type' }, { key: 'Missing context', label: 'Missing context' }, { key: 'Mismatched scales', label: 'Mismatched scales' }];
    Labs.sorter(host, {
      cls: 'dv-flaws', keepCase: true,
      title: 'What is wrong with this chart?',
      lead: 'Each chart below is built from honest numbers, yet each one misleads. Look at the chart and choose the technique it uses. Then read how to fix it.',
      noun: 'chart', groupLabel: 'Misleading technique',
      choices: C,
      items: [
        { text: 'The chart says satisfaction "doubled". The numbers behind it are 78% last year and 82% this year.', ans: 'Truncated axis', visual: chartVisual('axis'), why: 'The vertical axis starts at 75, not 0, so a 4-point rise looks like the bar has doubled in height. Fix: start a bar chart\'s axis at zero, or show the numbers.' },
        { text: 'The headline says "Sales are soaring!". A note says January and February, which were higher, are left out.', ans: 'Cherry-picked range', visual: chartVisual('range'), why: 'Only the months that rise are shown. Choosing a start and end date that supports the story hides the bigger picture. Fix: show the full period, or explain why a shorter one is fair.' },
        { text: 'A manager shows sales for each of the 12 months as slices of one pie.', ans: 'Wrong chart type', visual: chartVisual('pie'), why: 'Months are a sequence, not parts of one whole, and twelve almost equal slices cannot be compared by eye. Fix: a column or line chart shows month-to-month change clearly.' },
        { text: 'A chart is shared online with the caption "Look how fast this is growing".', ans: 'Missing context', visual: chartVisual('context'), why: 'With no title, axis labels, units or source, the viewer cannot tell what is growing, how much, over what time or where the data came from. Fix: title, label axes with units, and cite the source.' },
        { text: 'Two shops each doubled their sales from 10 to 20. The charts sit side by side.', ans: 'Mismatched scales', visual: chartVisual('scales'), why: 'The two charts use different vertical scales (0 to 25 and 0 to 100), so the same growth looks very different. Fix: use the same scale for charts that are meant to be compared.' }
      ],
      closing: 'Bias in a visualisation can come from the choice of data, the scale, the chart type or what is left out. Always check the axis, the time range, the chart type and the context.'
    });
  }

  function buildValidation(host) {
    Labs.sorter(host, {
      cls: 'dv-validate', keepCase: true,
      title: 'Which validation check catches it?',
      lead: 'A data entry form accepts a value only if it passes a check. Read each bad value and choose the check that would catch it.',
      noun: 'value', groupLabel: 'Validation check',
      choices: [{ key: 'Data type', label: 'Data type' }, { key: 'Range', label: 'Range' }, { key: 'Format', label: 'Format' }, { key: 'Presence', label: 'Presence' }, { key: 'List', label: 'List or lookup' }, { key: 'Consistency', label: 'Consistency' }],
      items: [
        { text: 'A customer\'s age is entered as 214.', ans: 'Range', why: 'The value is the right kind (a number) but outside the sensible limits, for example 0 to 120. A range check rejects it.' },
        { text: 'The quantity field contains the word "twelve".', ans: 'Data type', why: 'A data type check makes sure the value is the kind the field expects. Quantity must be a number, not text.' },
        { text: 'An Australian postcode is entered as 20000 (five digits).', ans: 'Format', why: 'A format check tests the pattern: a postcode must be exactly four digits (NNNN). The value is a number in a sensible range, but the wrong pattern.' },
        { text: 'A sale is saved with the date field left empty.', ans: 'Presence', why: 'A presence check makes sure that a required field is not blank, because every sale must have a date.' },
        { text: 'The state field contains "Texas" in a database of Australian customers.', ans: 'List', why: 'A list (or lookup) check accepts only values from an allowed set, such as NSW, VIC, QLD, SA, WA, TAS, NT and ACT.' },
        { text: 'An order is recorded as delivered on 3 March, but it was ordered on 10 March.', ans: 'Consistency', why: 'Each date is valid on its own, but the two fields disagree: a delivery cannot be earlier than the order. A consistency check compares related fields.' }
      ],
      closing: 'Validation checks that data is reasonable and allowed. Verification checks that it was copied or entered correctly, for example by entering it twice. A value can pass validation and still be wrong.'
    });
  }

  function init() {
    document.querySelectorAll('[data-dv="olap"]').forEach(buildOlap);
    document.querySelectorAll('[data-dv="chart-choice"]').forEach(buildChartChoice);
    document.querySelectorAll('[data-dv="flaws"]').forEach(buildFlaws);
    document.querySelectorAll('[data-dv="validate"]').forEach(buildValidation);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
