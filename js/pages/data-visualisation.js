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
