/* Networking systems page: the "Campus network lab" widget (graph and network theory).
   Students choose a start and end site, switch cables on and off, and see the shortest path (Dijkstra, step by step),
   degree, betweenness and closeness centrality, connectedness and the adjacency matrix update live.
   Vanilla JS, no storage, no external libraries. Networking systems › Graph theory in network design. */
(function () {
  'use strict';
  var root = document.getElementById('net-lab');
  if (!root) return;

  /* Seven campus buildings; weights are cable lengths in metres. */
  var NODES = [
    { id: 'A', name: 'Admin', x: 60, y: 180 }, { id: 'B', name: 'Library', x: 190, y: 62 },
    { id: 'C', name: 'Science', x: 190, y: 298 }, { id: 'D', name: 'Hall', x: 330, y: 180 },
    { id: 'E', name: 'Gym', x: 450, y: 298 }, { id: 'F', name: 'Tech', x: 450, y: 62 },
    { id: 'G', name: 'Canteen', x: 580, y: 180 }
  ];
  var EDGES = [['A', 'B', 40], ['A', 'C', 25], ['B', 'C', 15], ['B', 'D', 30], ['C', 'D', 20],
    ['C', 'E', 45], ['D', 'E', 10], ['D', 'F', 35], ['E', 'G', 30], ['F', 'G', 15]];
  var W = 640, H = 360;
  var ids = NODES.map(function (n) { return n.id; });
  var byId = {}; NODES.forEach(function (n) { byId[n.id] = n; });
  var off = {}, state = { from: 'A', to: 'G', bySize: false, tall: false };
  var INF = Infinity;
  var NS = 'http://www.w3.org/2000/svg';

  function key(e) { return e[0] + e[1]; }
  function active() { return EDGES.filter(function (e) { return !off[key(e)]; }); }
  function neighbours(edges) {
    var m = {}; ids.forEach(function (i) { m[i] = []; });
    edges.forEach(function (e) { m[e[0]].push([e[1], e[2]]); m[e[1]].push([e[0], e[2]]); });
    return m;
  }
  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

  /* Dijkstra with a snapshot of the distance table after each node is finalised. */
  function dijkstra(adj, from, to) {
    var dist = {}, prev = {}, done = {}, steps = [];
    ids.forEach(function (i) { dist[i] = INF; }); dist[from] = 0;
    for (;;) {
      var best = null;
      ids.forEach(function (i) { if (!done[i] && dist[i] < INF && (best === null || dist[i] < dist[best])) best = i; });
      if (best === null) break;
      done[best] = true;
      adj[best].forEach(function (p) {
        if (!done[p[0]] && dist[best] + p[1] < dist[p[0]]) { dist[p[0]] = dist[best] + p[1]; prev[p[0]] = best; }
      });
      steps.push({ node: best, dist: Object.assign({}, dist), done: Object.assign({}, done) });
      if (best === to) break;
    }
    var path = [];
    if (dist[to] < INF) for (var v = to; v !== undefined; v = prev[v]) path.unshift(v);
    return { dist: dist, path: path, steps: steps };
  }

  /* All-pairs shortest distances and shortest-path counts (for betweenness). */
  function allPairs(adj) {
    var D = {}, S = {};
    ids.forEach(function (s) {
      var dist = {}, done = {}, order = [], sigma = {};
      ids.forEach(function (i) { dist[i] = INF; sigma[i] = 0; }); dist[s] = 0; sigma[s] = 1;
      for (;;) {
        var b = null;
        ids.forEach(function (i) { if (!done[i] && dist[i] < INF && (b === null || dist[i] < dist[b])) b = i; });
        if (b === null) break;
        done[b] = true; order.push(b);
        adj[b].forEach(function (p) { if (!done[p[0]] && dist[b] + p[1] < dist[p[0]]) dist[p[0]] = dist[b] + p[1]; });
      }
      order.forEach(function (v) {
        if (v === s) return;
        adj[v].forEach(function (p) { if (dist[p[0]] + p[1] === dist[v] && done[p[0]]) sigma[v] += sigma[p[0]]; });
      });
      D[s] = dist; S[s] = sigma;
    });
    return { D: D, S: S };
  }

  function components(adj) {
    var comp = {}, n = 0;
    ids.forEach(function (i) {
      if (comp[i] !== undefined) return;
      var q = [i]; comp[i] = n;
      while (q.length) { var v = q.shift(); adj[v].forEach(function (p) { if (comp[p[0]] === undefined) { comp[p[0]] = n; q.push(p[0]); } }); }
      n++;
    });
    return { comp: comp, count: n };
  }

  /* ---------- skeleton ---------- */
  var opts = ids.map(function (i) { return '<option value="' + i + '">' + i + ' – ' + byId[i].name + '</option>'; }).join('');
  var cableBoxes = EDGES.map(function (e) {
    return '<label class="net-lab-cable"><input type="checkbox" data-cable="' + key(e) + '" checked> ' + e[0] + '–' + e[1] + ' <span>' + e[2] + ' m</span></label>';
  }).join('');
  root.innerHTML =
    '<div class="net-lab-controls">' +
      '<label>From <select id="net-lab-from">' + opts + '</select></label>' +
      '<label>To <select id="net-lab-to">' + opts + '</select></label>' +
      '<label class="net-lab-check"><input type="checkbox" id="net-lab-size"> Size nodes by degree</label>' +
      '<button type="button" class="btn btn-outline net-lab-reset" id="net-lab-reset">Reset</button>' +
    '</div>' +
    '<fieldset class="net-lab-cables"><legend>Cables in service (untick to cut a cable, or click a cable in the picture)</legend>' + cableBoxes + '</fieldset>' +
    '<div class="net-lab-stage"><svg id="net-lab-svg" role="img" aria-label="Weighted graph of seven campus buildings"></svg></div>' +
    '<p class="net-lab-status" id="net-lab-status" role="status" aria-live="polite"></p>' +
    '<div class="net-lab-out">' +
      '<h5>Dijkstra&rsquo;s algorithm, step by step</h5><div class="table-wrap" id="net-lab-steps"></div>' +
      '<h5>Centrality and connectedness</h5><div class="table-wrap" id="net-lab-metrics"></div>' +
      '<details class="net-lab-matrix"><summary>Adjacency matrix (cable length in metres, 0 = no cable)</summary><div class="table-wrap" id="net-lab-matrix"></div></details>' +
    '</div>';

  var svg = root.querySelector('#net-lab-svg'), selFrom = root.querySelector('#net-lab-from'), selTo = root.querySelector('#net-lab-to');
  selFrom.value = state.from; selTo.value = state.to;

  function pos(n) { return state.tall ? [n.y, n.x] : [n.x, n.y]; }

  /* ---------- render ---------- */
  function update() {
    var edges = active(), adj = neighbours(edges);
    var res = dijkstra(adj, state.from, state.to), ap = allPairs(adj), cc = components(adj);
    var deg = {}; ids.forEach(function (i) { deg[i] = adj[i].length; });
    var onPath = {}, pathEdge = {};
    res.path.forEach(function (v, i) { onPath[v] = true; if (i) pathEdge[[res.path[i - 1], v].sort().join('')] = true; });

    // SVG
    var vw = state.tall ? H : W, vh = state.tall ? W : H;
    svg.setAttribute('viewBox', '0 0 ' + vw + ' ' + vh);
    svg.style.maxWidth = vw + 'px';
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var gE = el('g', null, svg), gL = el('g', null, svg), gN = el('g', null, svg);
    EDGES.forEach(function (e) {
      var a = pos(byId[e[0]]), b = pos(byId[e[1]]), k = key(e);
      var cls = 'net-edge' + (off[k] ? ' is-off' : '') + (pathEdge[k] && !off[k] ? ' is-path' : '');
      el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: cls }, gE);
      var hit = el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: 'net-edge-hit', 'data-cable': k }, gE);
      var t = el('title', null, hit); t.textContent = 'Cable ' + e[0] + '–' + e[1] + ', ' + e[2] + ' m. Click to ' + (off[k] ? 'restore' : 'cut') + ' it.';
      var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, w = String(e[2]).length * 9 + 10;
      el('rect', { x: mx - w / 2, y: my - 11, width: w, height: 22, rx: 5, class: 'net-w-bg' + (off[k] ? ' is-off' : '') }, gL);
      var tx = el('text', { x: mx, y: my + 5, class: 'net-w' + (off[k] ? ' is-off' : '') }, gL); tx.textContent = e[2];
    });
    NODES.forEach(function (n) {
      var p = pos(n), r = state.bySize ? 16 + deg[n.id] * 6 : 24;
      var cls = 'net-node comp-' + (cc.comp[n.id] % 4) + (onPath[n.id] ? ' is-path' : '') + (n.id === state.from ? ' is-from' : '') + (n.id === state.to ? ' is-to' : '');
      var g = el('g', { class: cls, 'data-node': n.id }, gN);
      el('circle', { cx: p[0], cy: p[1], r: r }, g);
      var t = el('text', { x: p[0], y: p[1] + 5, class: 'net-n' }, g); t.textContent = n.id;
      var nm = el('text', { x: p[0], y: p[1] + r + 16, class: 'net-nn' }, g); nm.textContent = n.name;
    });
    var okLen = res.dist[state.to];
    svg.setAttribute('aria-label', 'Weighted graph of seven campus buildings. ' + (res.path.length ? 'Shortest path from ' + state.from + ' to ' + state.to + ' is ' + res.path.join(' to ') + ', ' + okLen + ' metres.' : 'No path from ' + state.from + ' to ' + state.to + '.'));

    // status
    var st = root.querySelector('#net-lab-status'), msg;
    var connected = cc.count === 1;
    var connTxt = connected ? '<strong>Connected:</strong> every building can reach every other.' :
      '<strong>Disconnected:</strong> ' + cc.count + ' separate components (' + Array.from({ length: cc.count }, function (_, c) { return '{' + ids.filter(function (i) { return cc.comp[i] === c; }).join(', ') + '}'; }).join(' and ') + ').';
    if (state.from === state.to) msg = 'Choose two different buildings.';
    else if (!res.path.length) msg = '<strong>No path</strong> from ' + state.from + ' to ' + state.to + ': they are in different components.';
    else {
      var parts = [];
      for (var i = 1; i < res.path.length; i++) { var a = res.path[i - 1], b = res.path[i]; parts.push(EDGES.filter(function (e) { return (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a); })[0][2]); }
      msg = '<strong>Shortest path:</strong> ' + res.path.join(' → ') + ' (' + parts.join(' + ') + ' = <strong>' + okLen + ' m</strong>, ' + (res.path.length - 1) + ' hop' + (res.path.length === 2 ? '' : 's') + ').';
    }
    st.innerHTML = msg + '<br>' + connTxt;

    // Dijkstra table
    var h = '<table class="net-table"><thead><tr><th>Step</th><th>Finalised</th>' + ids.map(function (i) { return '<th>' + i + '</th>'; }).join('') + '</tr></thead><tbody>';
    res.steps.forEach(function (s, i) {
      h += '<tr><td>' + (i + 1) + '</td><td><strong>' + s.node + '</strong></td>' + ids.map(function (j) {
        var v = s.dist[j] === INF ? '∞' : s.dist[j];
        return '<td class="' + (s.done[j] ? 'is-done' : '') + '">' + v + '</td>';
      }).join('') + '</tr>';
    });
    h += '</tbody></table><p class="net-note">Shaded cells are final. Each step finalises the unvisited node with the smallest distance, then updates its neighbours.</p>';
    root.querySelector('#net-lab-steps').innerHTML = h;

    // Metrics
    var bet = {}, clo = {};
    ids.forEach(function (v) { bet[v] = 0; });
    ids.forEach(function (s, si) { ids.forEach(function (t, ti) {
      if (ti <= si || ap.D[s][t] === INF) return;
      ids.forEach(function (v) {
        if (v === s || v === t) return;
        if (ap.D[s][v] + ap.D[v][t] === ap.D[s][t]) bet[v] += ap.S[s][v] * ap.S[v][t] / ap.S[s][t];
      });
    }); });
    ids.forEach(function (v) {
      var sum = 0; ids.forEach(function (u) { if (u !== v) sum += ap.D[v][u]; });
      clo[v] = connected ? (ids.length - 1) / sum : null;
    });
    function max(o) { var m = -1; ids.forEach(function (i) { if (o[i] !== null && o[i] > m) m = o[i]; }); return m; }
    var md = max(deg), mb = max(bet), mc = max(clo);
    var mh = '<table class="net-table"><thead><tr><th>Node</th><th>Degree</th><th>Betweenness</th><th>Closeness</th><th>Component</th></tr></thead><tbody>';
    ids.forEach(function (v) {
      function c(val, m, txt) { return '<td>' + (val !== null && val === m && m > 0 ? '<strong class="net-max">' + txt + '</strong>' : txt) + '</td>'; }
      mh += '<tr><td>' + v + ' <span class="net-dim">' + byId[v].name + '</span></td>' + c(deg[v], md, deg[v]) + c(Math.round(bet[v] * 10) / 10, Math.round(mb * 10) / 10, (Math.round(bet[v] * 10) / 10).toFixed(1)) +
        c(clo[v] === null ? null : Math.round(clo[v] * 1000) / 1000, mc === null ? null : Math.round(mc * 1000) / 1000, clo[v] === null ? 'n/a' : clo[v].toFixed(3)) + '<td>' + (cc.comp[v] + 1) + '</td></tr>';
    });
    mh += '</tbody></table><p class="net-note">Bold marks the highest value in each column. Degree = number of working cables. Betweenness counts how often a node lies on shortest (by cable length) paths between other pairs. Closeness = (n − 1) ÷ sum of shortest distances to all other nodes, only defined while the graph is connected.</p>';
    root.querySelector('#net-lab-metrics').innerHTML = mh;

    // adjacency matrix
    var wt = {}; edges.forEach(function (e) { wt[e[0] + e[1]] = wt[e[1] + e[0]] = e[2]; });
    var mx = '<table class="net-table net-matrix"><thead><tr><th></th>' + ids.map(function (i) { return '<th>' + i + '</th>'; }).join('') + '</tr></thead><tbody>';
    ids.forEach(function (r) { mx += '<tr><th>' + r + '</th>' + ids.map(function (c2) { var v = wt[r + c2] || 0; return '<td class="' + (v ? 'is-done' : '') + '">' + v + '</td>'; }).join('') + '</tr>'; });
    root.querySelector('#net-lab-matrix').innerHTML = mx + '</tbody></table>';

    // sync checkboxes
    root.querySelectorAll('[data-cable]').forEach(function (c) { if (c.type === 'checkbox') c.checked = !off[c.getAttribute('data-cable')]; });
    selFrom.value = state.from; selTo.value = state.to;
  }

  /* ---------- events ---------- */
  selFrom.addEventListener('change', function () { state.from = selFrom.value; update(); });
  selTo.addEventListener('change', function () { state.to = selTo.value; update(); });
  root.querySelector('#net-lab-size').addEventListener('change', function (e) { state.bySize = e.target.checked; update(); });
  root.querySelector('#net-lab-reset').addEventListener('click', function () {
    off = {}; state.from = 'A'; state.to = 'G'; state.bySize = false; root.querySelector('#net-lab-size').checked = false; update();
  });
  root.querySelector('.net-lab-cables').addEventListener('change', function (e) {
    var k = e.target.getAttribute && e.target.getAttribute('data-cable'); if (!k) return;
    off[k] = !e.target.checked; update();
  });
  var pick = 'from';
  svg.addEventListener('click', function (e) {
    var t = e.target, k = t.getAttribute && t.getAttribute('data-cable');
    if (k) { off[k] = !off[k]; update(); return; }
    var g = t.closest && t.closest('[data-node]');
    if (g) { state[pick] = g.getAttribute('data-node'); pick = pick === 'from' ? 'to' : 'from'; update(); }
  });

  function fit() {
    var tall = root.clientWidth < 520;
    if (tall !== state.tall) { state.tall = tall; update(); }
  }
  window.addEventListener('resize', fit);
  state.tall = root.clientWidth < 520;
  update();
})();
