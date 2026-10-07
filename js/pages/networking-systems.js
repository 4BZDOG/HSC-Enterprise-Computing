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

/* Networking systems page: hands-on labs built on the shared lab kit (css/labs.css, js/labs.js).
   1. Wi-Fi signal explorer: move a router around a floor plan and see distance and walls weaken the signal.
   2. Transfer-time calculator: how connection, signal, congestion and priority change a transfer.
   3. Smart home security audit: harden a default home network and see which attacks it stops.
   4. Two practice sets: cloud service models (IaaS, PaaS, SaaS) and cloud storage types.
   The numbers are round, illustrative values chosen for comparison, not measurements of any product. */
(function () {
  'use strict';
  var el = Labs.el;

  /* ---------- 1. Wi-Fi signal explorer ---------- */
  var WORLD = { x0: -1.5, y0: -1.5, w: 17, h: 12 };            // metres, including a margin outside the house
  var ROOMS = [
    { n: 'Bedroom 1', x: 2.25, y: 0.55 }, { n: 'Bedroom 2', x: 6.75, y: 0.55 }, { n: 'Study', x: 11.5, y: 0.55 },
    { n: 'Lounge', x: 3.5, y: 5.0 }, { n: 'Kitchen', x: 10.5, y: 5.0 }
  ];
  var DEVICES = [
    { n: 'Phone', room: 'Bedroom 1', x: 2.6, y: 3.2 }, { n: 'Printer', room: 'Bedroom 2', x: 7.2, y: 3.4 },
    { n: 'Laptop', room: 'Study', x: 11.8, y: 2.6 }, { n: 'Smart TV', room: 'Lounge', x: 1.2, y: 7.2 },
    { n: 'Camera', room: 'Kitchen', x: 12.8, y: 8.0 }
  ];
  // Walls: ext = outside wall; the gaps in the inside walls are doorways where the signal passes freely
  var WALLS = [
    [0, 0, 14, 0, 1], [14, 0, 14, 9, 1], [14, 9, 0, 9, 1], [0, 9, 0, 0, 1],
    [4.5, 0, 4.5, 4.5, 0], [9, 0, 9, 4.5, 0],
    [0, 4.5, 1.5, 4.5, 0], [2.5, 4.5, 6, 4.5, 0], [7, 4.5, 11, 4.5, 0], [12, 4.5, 14, 4.5, 0],
    [7, 4.5, 7, 6, 0], [7, 7.2, 7, 9, 0]
  ].map(function (w) { return { x1: w[0], y1: w[1], x2: w[2], y2: w[3], ext: !!w[4] }; });
  var WALL_DB = { plaster: 3, brick: 8, concrete: 12 };
  var LEVELS = [
    { min: -50, name: 'Excellent', cls: 'is-good', col: '#1a9850' },
    { min: -60, name: 'Good', cls: 'is-good', col: '#8cc84b' },
    { min: -70, name: 'Fair', cls: 'is-warn', col: '#f1d35a' },
    { min: -80, name: 'Weak', cls: 'is-warn', col: '#f08a4b' },
    { min: -999, name: 'No usable signal', cls: 'is-bad', col: '#c8372d' }
  ];
  function level(dbm) { for (var i = 0; i < LEVELS.length; i++) if (dbm >= LEVELS[i].min) return LEVELS[i]; return LEVELS[4]; }

  function buildWifi(host) {
    Labs.shell(host, 'net-wifi', 'Wi-Fi signal explorer', 'Move the router around this floor plan and watch the coverage change. Distance weakens a signal, and every wall it passes through weakens it again. Colours show signal strength, and the table lists each device.');
    var st = { x: 0.7, y: 0.7, band: '2.4', wall: 'plaster' };

    var row = el('div', 'lab-row');
    var fx = el('div', 'lab-field'), lx = el('label'), ox = el('output'), ix = el('input');
    lx.htmlFor = 'net-wifi-x'; lx.append(document.createTextNode('Router across: '), ox); ix.type = 'range'; ix.id = 'net-wifi-x'; ix.min = 0.3; ix.max = 13.7; ix.step = 0.1;
    fx.append(lx, ix);
    var fy = el('div', 'lab-field'), ly = el('label'), oy = el('output'), iy = el('input');
    ly.htmlFor = 'net-wifi-y'; ly.append(document.createTextNode('Router down: '), oy); iy.type = 'range'; iy.id = 'net-wifi-y'; iy.min = 0.3; iy.max = 8.7; iy.step = 0.1;
    fy.append(ly, iy);
    var fw = el('div', 'lab-field'), lw = el('label', null, 'Inside walls'), sw = el('select');
    lw.htmlFor = 'net-wifi-wall'; sw.id = 'net-wifi-wall';
    [['plaster', 'Plasterboard (light)'], ['brick', 'Brick (heavy)'], ['concrete', 'Concrete (heaviest)']].forEach(function (o) { var op = el('option', null, o[1]); op.value = o[0]; sw.append(op); });
    fw.append(lw, sw);
    var band = el('div', 'lab-seg'); band.setAttribute('role', 'group'); band.setAttribute('aria-label', 'Wi-Fi band');
    var b24 = el('button', null, '2.4 GHz'), b5 = el('button', null, '5 GHz'); b24.type = b5.type = 'button'; band.append(b24, b5);
    var fb = el('div', 'lab-field'); fb.append(el('span', 'lab-label', 'Band'), band);
    row.append(fx, fy, fw, fb);
    host.append(row);

    var presets = el('div', 'lab-chips');
    presets.setAttribute('aria-label', 'Router positions to try');
    [['Corner of Bedroom 1', 0.7, 0.7], ['Behind the kitchen wall', 13.2, 8.3], ['Central: near the doorways', 6.5, 4.3]].forEach(function (p) {
      var b = el('button', 'lab-chip', p[0]); b.type = 'button';
      b.addEventListener('click', function () { st.x = p[1]; st.y = p[2]; update(); });
      presets.append(b);
    });
    var presetRow = el('div', 'lab-row');
    presetRow.append(el('span', 'lab-label', 'Try a position:'), presets);
    host.append(presetRow);

    var stage = el('div', 'lab-stage net-wifi-stage');
    var cv = el('canvas');
    cv.setAttribute('role', 'img');
    cv.setAttribute('aria-label', 'Floor plan of a house with five rooms and five numbered devices, coloured by Wi-Fi signal strength. The table below lists the same signal readings.');
    stage.append(cv);
    var legend = el('div', 'net-wifi-legend');
    LEVELS.slice().reverse().forEach(function (L) { var s = el('span', null, L.name); var sw2 = el('i'); sw2.style.background = L.col; s.prepend(sw2); legend.append(s); });
    host.append(stage, legend);

    var tab = Labs.table(['Device', 'Distance', 'Walls crossed', 'Signal', 'Rating'], { num: [1, 2, 3], stack: true });
    var out = el('div', 'lab-readout'); out.setAttribute('role', 'status');
    host.append(tab.wrap, out);
    host.append(el('p', 'lab-note', 'Signal strength is in dBm: closer to zero is stronger (-50 is much stronger than -80). The model is simplified: it counts distance and walls only, and ignores furniture, floors and other networks. Real routers and buildings differ.'));

    function loss(x1, y1, x2, y2) {
      var total = 0, n = 0;
      for (var i = 0; i < WALLS.length; i++) {
        var w = WALLS[i];
        var d = (x2 - x1) * (w.y2 - w.y1) - (y2 - y1) * (w.x2 - w.x1);
        if (Math.abs(d) < 1e-9) continue;
        var t = ((w.x1 - x1) * (w.y2 - w.y1) - (w.y1 - y1) * (w.x2 - w.x1)) / d;
        var u = ((w.x1 - x1) * (y2 - y1) - (w.y1 - y1) * (x2 - x1)) / d;
        if (t > 1e-6 && t < 1 - 1e-6 && u >= 0 && u <= 1) {
          total += (w.ext ? WALL_DB.brick : WALL_DB[st.wall]) * (st.band === '5' ? 1.5 : 1);
          n++;
        }
      }
      return { db: total, n: n };
    }
    function signal(x, y) {
      var d = Math.max(1, Math.hypot(x - st.x, y - st.y));
      var p1 = st.band === '5' ? -45 : -40, exp = st.band === '5' ? 2.6 : 2.2;
      var L = loss(st.x, st.y, x, y);
      return { dbm: p1 - 10 * exp * Math.log10(d) - L.db, d: Math.hypot(x - st.x, y - st.y), n: L.n };
    }

    var view = WORLD;
    function css(name, fallback) { return getComputedStyle(host).getPropertyValue(name).trim() || fallback; }
    function draw() {
      var wpx = Math.max(280, stage.clientWidth), narrow = wpx < 520;
      var W = narrow ? { x0: -0.5, y0: -0.5, w: 15, h: 10 } : WORLD;
      var S = wpx / W.w, hpx = Math.round(W.h * S), dpr = window.devicePixelRatio || 1;
      view = W;
      cv.width = Math.round(wpx * dpr); cv.height = Math.round(hpx * dpr);
      cv.style.height = hpx + 'px';
      var c = cv.getContext('2d');
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var X = function (m) { return (m - W.x0) * S; }, Y = function (m) { return (m - W.y0) * S; };
      var ink = css('--text-primary', '#111'), muted = css('--text-secondary', '#444'), bg = css('--bg-tertiary', '#fff'), surface = css('--surface', '#fff');
      c.fillStyle = bg; c.fillRect(0, 0, wpx, hpx);
      var step = 0.25;
      c.globalAlpha = 0.62;
      for (var gx = W.x0; gx < W.x0 + W.w; gx += step) for (var gy = W.y0; gy < W.y0 + W.h; gy += step) {
        c.fillStyle = level(signal(gx + step / 2, gy + step / 2).dbm).col;
        c.fillRect(X(gx), Y(gy), step * S + 0.6, step * S + 0.6);
      }
      c.globalAlpha = 1;
      // house shade, so the outside reads as outside
      c.strokeStyle = ink; c.lineCap = 'round';
      WALLS.forEach(function (w) { c.lineWidth = w.ext ? 5 : 3; c.globalAlpha = w.ext ? 0.9 : 0.75; c.beginPath(); c.moveTo(X(w.x1), Y(w.y1)); c.lineTo(X(w.x2), Y(w.y2)); c.stroke(); });
      c.globalAlpha = 1;
      var fs = Math.max(11, Math.min(13, S * 0.62));
      c.font = '600 ' + fs + 'px ' + css('--font-body', 'sans-serif');
      c.textAlign = 'center'; c.textBaseline = 'middle';
      if (!narrow) ROOMS.forEach(function (r) {
        var t = S < 24 ? r.n.replace('Bedroom ', 'Bed ') : r.n, tw = c.measureText(t).width + 8;
        c.fillStyle = surface; c.globalAlpha = 0.82; c.fillRect(X(r.x) - tw / 2, Y(r.y) - fs * 0.8, tw, fs * 1.6); c.globalAlpha = 1;
        c.fillStyle = ink; c.fillText(t, X(r.x), Y(r.y));
      });
      DEVICES.forEach(function (d, i) {
        c.fillStyle = surface; c.strokeStyle = ink; c.lineWidth = 2;
        c.beginPath(); c.rect(X(d.x) - 9, Y(d.y) - 9, 18, 18); c.fill(); c.stroke();
        c.fillStyle = ink; c.textBaseline = 'middle'; c.fillText(String(i + 1), X(d.x), Y(d.y) + 0.5);
        if (!narrow) { c.textBaseline = 'top'; c.fillText(d.n, X(d.x), Y(d.y) + 11); }
      });
      // the router
      c.fillStyle = surface; c.strokeStyle = ink; c.lineWidth = 3;
      c.beginPath(); c.arc(X(st.x), Y(st.y), 11, 0, 7); c.fill(); c.stroke();
      c.fillStyle = ink; c.beginPath(); c.arc(X(st.x), Y(st.y), 4, 0, 7); c.fill();
      if (!narrow) { c.textBaseline = 'bottom'; c.fillText('Router', X(st.x), Y(st.y) - 14); }
    }

    function update() {
      st.x = Math.min(13.7, Math.max(0.3, st.x)); st.y = Math.min(8.7, Math.max(0.3, st.y));
      ix.value = st.x; iy.value = st.y; ox.textContent = st.x.toFixed(1) + ' m'; oy.textContent = st.y.toFixed(1) + ' m'; sw.value = st.wall;
      b24.setAttribute('aria-pressed', String(st.band === '2.4')); b5.setAttribute('aria-pressed', String(st.band === '5'));
      tab.clear();
      var worst = null, rows = [];
      DEVICES.forEach(function (d, i) {
        var r = signal(d.x, d.y), L = level(r.dbm);
        rows.push({ d: d, r: r, L: L });
        if (!worst || r.dbm < worst.r.dbm) worst = rows[rows.length - 1];
        tab.add([(i + 1) + '. ' + d.n + ' (' + d.room + ')', r.d.toFixed(1) + ' m', String(r.n), Math.round(r.dbm) + ' dBm', el('span', 'lab-badge ' + L.cls, L.name)]);
      });
      var street = signal(15.2, 4.5), leak = level(street.dbm);
      out.replaceChildren();
      out.append(el('p', null, 'Weakest device: ' + worst.d.n + ' in the ' + worst.d.room.toLowerCase() + ' (' + Math.round(worst.r.dbm) + ' dBm, ' + worst.L.name.toLowerCase() + '). It is ' + worst.r.d.toFixed(1) + ' m from the router with ' + worst.r.n + (worst.r.n === 1 ? ' wall' : ' walls') + ' in between.'));
      out.append(el('p', null, 'At the footpath outside the right-hand wall the signal is ' + Math.round(street.dbm) + ' dBm (' + leak.name.toLowerCase() + ')' + (street.dbm > -75 ? ', so a stranger there could try to connect.' : ', so very little leaks out of the house.')));
      out.className = 'lab-readout ' + (worst.r.dbm >= -70 ? 'is-good' : worst.r.dbm >= -80 ? 'is-warn' : 'is-bad');
      draw();
    }

    function toWorld(e) { var r = cv.getBoundingClientRect(); return { x: view.x0 + (e.clientX - r.left) / r.width * view.w, y: view.y0 + (e.clientY - r.top) / r.height * view.h }; }
    var drag = false;
    cv.addEventListener('pointerdown', function (e) { if (e.pointerType === 'touch') return; drag = true; cv.setPointerCapture(e.pointerId); var p = toWorld(e); st.x = p.x; st.y = p.y; update(); });
    cv.addEventListener('pointermove', function (e) { if (!drag) return; var p = toWorld(e); st.x = p.x; st.y = p.y; update(); });
    cv.addEventListener('pointerup', function () { drag = false; });
    cv.addEventListener('click', function (e) { if (e.pointerType === 'mouse' || drag) return; var p = toWorld(e); st.x = p.x; st.y = p.y; update(); });
    ix.addEventListener('input', function () { st.x = +ix.value; update(); });
    iy.addEventListener('input', function () { st.y = +iy.value; update(); });
    sw.addEventListener('change', function () { st.wall = sw.value; update(); });
    b24.addEventListener('click', function () { st.band = '2.4'; update(); });
    b5.addEventListener('click', function () { st.band = '5'; update(); });
    if ('ResizeObserver' in window) new ResizeObserver(function () { draw(); }).observe(stage); else window.addEventListener('resize', draw);
    update();
  }

  /* ---------- 2. Transfer-time calculator ---------- */
  var CONNS = [
    { id: 'bt', name: 'Bluetooth', mbps: 2, lat: 20, wireless: true, note: 'a few metres' },
    { id: '3g', name: '3G mobile', mbps: 3, lat: 120, wireless: true },
    { id: 'adsl', name: 'ADSL2+ broadband', mbps: 15, lat: 25, wireless: false },
    { id: 'sat', name: 'Satellite (geostationary)', mbps: 25, lat: 600, wireless: true },
    { id: '4g', name: '4G mobile', mbps: 40, lat: 45, wireless: true },
    { id: 'nbn', name: 'NBN fixed line, 50 Mbit/s plan', mbps: 48, lat: 15, wireless: false },
    { id: '5g', name: '5G mobile', mbps: 200, lat: 20, wireless: true },
    { id: 'wifi', name: 'Wi-Fi inside the building', mbps: 300, lat: 3, wireless: true },
    { id: 'eth', name: 'Gigabit Ethernet cable', mbps: 940, lat: 1, wireless: false }
  ];
  var FILES = [
    { n: 'A photo', mb: 4 }, { n: 'A song', mb: 6 }, { n: 'A software update', mb: 1500 }, { n: 'An HD movie', mb: 4000 }, { n: 'A laptop backup', mb: 50000 }
  ];
  function human(sec) {
    if (sec < 1) return 'under a second';
    if (sec < 90) return Math.round(sec) + ' seconds';
    if (sec < 5400) return (sec / 60).toFixed(sec < 600 ? 1 : 0) + ' minutes';
    if (sec < 172800) return (sec / 3600).toFixed(1) + ' hours';
    return (sec / 86400).toFixed(1) + ' days';
  }
  function buildTransfer(host) {
    Labs.shell(host, 'net-transfer', 'How long will the transfer take?', 'Choose a file and a connection, then change the conditions. Time depends on the speed you actually get, which falls with a weak signal and with other people using the link. Delay (latency) matters for live use such as video calls.');
    var st = { file: 3, size: 4000, conn: 'nbn', signal: 1, busy: 0, qos: false };
    var row = el('div', 'lab-row');
    var f1 = el('div', 'lab-field'), l1 = el('label', null, 'What are you sending?'), s1 = el('select'); l1.htmlFor = s1.id = 'net-tr-file';
    FILES.forEach(function (f, i) { var o = el('option', null, f.n + ' (' + (f.mb >= 1000 ? f.mb / 1000 + ' GB' : f.mb + ' MB') + ')'); o.value = i; s1.append(o); });
    s1.value = st.file; f1.append(l1, s1);
    var f2 = el('div', 'lab-field'), l2 = el('label', null, 'Connection'), s2 = el('select'); l2.htmlFor = s2.id = 'net-tr-conn';
    CONNS.forEach(function (c) { var o = el('option', null, c.name); o.value = c.id; s2.append(o); });
    s2.value = st.conn; f2.append(l2, s2);
    row.append(f1, f2); host.append(row);

    var row2 = el('div', 'lab-row');
    var f3 = el('div', 'lab-field'), l3 = el('label', null, 'Signal quality (wireless only)'), s3 = el('select'); l3.htmlFor = s3.id = 'net-tr-sig';
    [[1, 'Strong: close, clear line'], [0.6, 'Fair: a wall or two away'], [0.25, 'Weak: far away or blocked']].forEach(function (o) { var op = el('option', null, o[1]); op.value = o[0]; s3.append(op); });
    f3.append(l3, s3);
    var f4 = el('div', 'lab-field'), l4 = el('label'), o4 = el('output'), i4 = el('input'); l4.htmlFor = i4.id = 'net-tr-busy'; l4.append(document.createTextNode('Link already used by others: '), o4);
    i4.type = 'range'; i4.min = 0; i4.max = 90; i4.step = 5; i4.value = 0; f4.append(l4, i4);
    var f5 = el('label', 'lab-check'), c5 = el('input'); c5.type = 'checkbox'; f5.append(c5, document.createTextNode('Give this transfer priority (QoS)'));
    row2.append(f3, f4, f5); host.append(row2);

    var stats = el('div', 'lab-stats');
    var sSpeed = el('div', 'lab-stat'), sTime = el('div', 'lab-stat'), sLat = el('div', 'lab-stat'), sUse = el('div', 'lab-stat');
    [[sSpeed, 'Speed you actually get'], [sTime, 'Time to transfer'], [sLat, 'Round-trip delay'], [sUse, 'Good for']].forEach(function (p) { p[0].append(el('span', null, p[1]), el('b')); stats.append(p[0]); });
    host.append(stats);
    var chartTitle = el('h5', 'lab-sub', 'The same transfer on every connection, with these conditions');
    var chart = el('div', 'net-bars');
    var tips = el('div', 'lab-readout');
    host.append(chartTitle, chart, tips);
    host.append(el('p', 'lab-note', 'Speeds are typical round numbers for comparison (megabits per second, where 8 megabits make 1 megabyte), not guarantees. Real speeds depend on the plan, the provider, the device and the time of day. Priority only helps when the link is shared.'));

    function speedFor(c) {
      var share = 1 - (st.qos ? st.busy / 300 : st.busy / 100);   // priority protects most of your share
      return c.mbps * (c.wireless ? st.signal : 1) * Math.max(0.05, share);
    }
    function update() {
      var c = CONNS.filter(function (x) { return x.id === st.conn; })[0];
      var sp = speedFor(c), sec = st.size * 8 / sp;
      o4.textContent = st.busy + '%';
      sSpeed.lastChild.textContent = (sp >= 10 ? Math.round(sp) : sp.toFixed(1)) + ' Mbit/s';
      sTime.lastChild.textContent = human(sec);
      sLat.lastChild.textContent = c.lat + ' ms';
      var uses = []; if (c.lat <= 50) uses.push('gaming'); if (c.lat <= 150) uses.push('video calls');
      sUse.lastChild.textContent = uses.length ? uses.join(' and ') : 'bulk downloads, not live use';
      chart.replaceChildren();
      var list = CONNS.map(function (x) { return { c: x, t: st.size * 8 / speedFor(x) }; }).sort(function (a, b) { return a.t - b.t; });
      var max = Math.log10(list[list.length - 1].t + 1) || 1;
      list.forEach(function (it) {
        var r = el('div', 'net-bar' + (it.c.id === st.conn ? ' is-sel' : ''));
        var bar = el('span', 'net-bar-fill'); bar.style.width = Math.max(3, Math.log10(it.t + 1) / max * 100) + '%';
        var track = el('div', 'net-bar-track'); track.append(bar);
        r.append(el('span', 'net-bar-name', it.c.name), track, el('span', 'net-bar-time', human(it.t)));
        chart.append(r);
      });
      var t = [];
      if (c.wireless && st.signal < 1) t.push('Proximity: moving closer or removing obstacles would restore the full ' + c.mbps + ' Mbit/s. A cable would remove the signal problem altogether.');
      if (st.busy >= 40) t.push('Flow scheduling: ' + st.busy + '% of the link is already in use. Schedule large transfers for quiet times such as overnight' + (st.qos ? '' : ', or tick priority (QoS) so this transfer is protected from the other traffic') + '.');
      if (c.id === 'sat') t.push('Satellite adds a long delay because the signal travels about 36 000 km each way to a geostationary satellite, which is why video calls lag even when the speed is fine.');
      if (!t.length) t.push('These are good conditions. Try a weaker signal or a busier link and compare, then switch to a cable and see what changes.');
      tips.replaceChildren(el('p', null, 'What would help: ' + t.join(' ')));
      chart.setAttribute('role', 'list');
    }
    s1.addEventListener('change', function () { st.file = +s1.value; st.size = FILES[st.file].mb; update(); });
    s2.addEventListener('change', function () { st.conn = s2.value; update(); });
    s3.addEventListener('change', function () { st.signal = +s3.value; update(); });
    i4.addEventListener('input', function () { st.busy = +i4.value; update(); });
    c5.addEventListener('change', function () { st.qos = c5.checked; update(); });
    update();
  }

  /* ---------- 3. Smart home security audit ---------- */
  var HS_SETTINGS = [
    { id: 'adminpw', label: 'Router admin password', opts: ['The default on the sticker', 'Changed to a long, unique password'] },
    { id: 'wifi', label: 'Wi-Fi security', opts: ['Open (no password)', 'WEP (old)', 'WPA2 with AES', 'WPA3'] },
    { id: 'wifipw', label: 'Wi-Fi passphrase', opts: ['Short or easy to guess', 'Long and unique'] },
    { id: 'upnp', label: 'UPnP', opts: ['On', 'Off'] },
    { id: 'remote', label: 'Remote administration of the router', opts: ['On', 'Off'] },
    { id: 'seg', label: 'Cameras and smart devices', opts: ['On the same network as laptops', 'On a separate IoT network'] },
    { id: 'iotpw', label: 'Camera and device passwords', opts: ['Factory defaults', 'Changed to unique ones'] },
    { id: 'updates', label: 'Router and device updates', opts: ['Never installed', 'Automatic'] },
    { id: 'access', label: 'Watching the camera when away', opts: ['Port forwarding to the camera', 'Through a VPN to home', 'No remote access'] },
    { id: 'ssid', label: 'Network name (SSID)', opts: ['Broadcast', 'Hidden'] },
    { id: 'backup', label: 'Backups of family files', opts: ['None', 'One copy on the same computer', '3-2-1, with a tested restore'] }
  ];
  var HS_SCEN = [
    { n: 'The camera is recruited into a botnet', f: function (s) {
      var exposed = s.upnp === 0 || s.access === 0;
      if (s.iotpw === 1) return ['Blocked', 'is-good', 'The camera\'s password was changed, so the automated login attempts used by botnets fail.'];
      if (!exposed) return ['Partly', 'is-warn', 'The camera is not reachable from the internet, but a default password is still waiting for any malware inside the home. Change it.'];
      return ['At risk', 'is-bad', 'A default password on a camera that is reachable from the internet is exactly how botnets such as Mirai grew.'];
    } },
    { n: 'A stranger joins your Wi-Fi', f: function (s) {
      if (s.wifi <= 1) return ['At risk', 'is-bad', s.wifi === 0 ? 'An open network lets anyone connect and read unencrypted traffic.' : 'WEP can be broken in minutes with free tools.'];
      if (s.wifipw === 0) return ['At risk', 'is-bad', 'Good encryption does not help when the passphrase is easy to guess.'];
      return ['Blocked', 'is-good', 'Strong encryption and a long, unique passphrase. Hiding the network name adds almost nothing, because it is still sent when devices connect.'];
    } },
    { n: 'An attacker takes over the router', f: function (s) {
      if (s.adminpw === 0) return ['At risk', 'is-bad', 'Default router passwords are published online. Whoever controls the router controls all the traffic.'];
      if (s.remote === 0) return ['Partly', 'is-warn', 'The password is strong, but remote administration lets anyone on the internet try to reach the login page. Turn it off.'];
      return ['Blocked', 'is-good', 'A strong admin password and no remote administration.'];
    } },
    { n: 'A hacked camera reaches your laptop and NAS', f: function (s) {
      if (s.seg === 0) return ['At risk', 'is-bad', 'On one flat network a compromised device can try every other device.'];
      return ['Blocked', 'is-good', 'The IoT network is separate, so the firewall stops the camera reaching the laptops.'];
    } },
    { n: 'A known software flaw is exploited', f: function (s) {
      if (s.updates === 0) return ['At risk', 'is-bad', 'Updates fix flaws that criminals already know how to use. Without them the router and devices stay exposed.'];
      return ['Blocked', 'is-good', 'Automatic updates close known flaws soon after they are published.'];
    } },
    { n: 'Ransomware encrypts the family\'s files', f: function (s) {
      if (s.backup === 0) return ['At risk', 'is-bad', 'With no backup the files are gone unless a ransom is paid.'];
      if (s.backup === 1) return ['Partly', 'is-warn', 'A copy on the same computer is usually encrypted along with the originals.'];
      return ['Recoverable', 'is-good', 'A tested 3-2-1 backup lets the family restore without paying.'];
    } }
  ];
  function buildHomeSec(host) {
    Labs.shell(host, 'net-homesec', 'Smart home security audit', 'This family\'s network is running on factory settings. Change the settings one at a time and watch which attacks it can stop. One setting is a trap: see whether it really helps.');
    var st = {};
    HS_SETTINGS.forEach(function (s) { st[s.id] = 0; });
    var grid = el('div', 'net-hs-grid');
    HS_SETTINGS.forEach(function (s) {
      var f = el('div', 'lab-field'), l = el('label', null, s.label), sel = el('select');
      l.htmlFor = sel.id = 'net-hs-' + s.id;
      s.opts.forEach(function (o, i) { var op = el('option', null, o); op.value = i; sel.append(op); });
      sel.addEventListener('change', function () { st[s.id] = +sel.value; update(); });
      f.append(l, sel); grid.append(f);
    });
    host.append(grid);
    var reset = el('button', 'lab-btn', 'Back to factory settings'); reset.type = 'button';
    reset.addEventListener('click', function () { HS_SETTINGS.forEach(function (s) { st[s.id] = 0; host.querySelector('#net-hs-' + s.id).value = 0; }); update(); });
    var scoreBox = el('div', 'lab-row net-hs-score');
    var scoreTxt = el('p', 'lab-score'); var meter = el('div', 'lab-meter'); var bar = el('span'); meter.append(bar);
    scoreBox.append(scoreTxt); scoreBox.append(meter);
    host.append(scoreBox);
    var tab = Labs.table(['Attack', 'Result', 'Why'], { stack: true });
    var actions = el('div', 'lab-actions');
    actions.append(reset);
    host.append(tab.wrap, actions);
    host.append(el('p', 'lab-note', 'A simplified model for teaching. Real risk depends on the devices and on what an attacker can already reach, and no setting makes a network completely safe.'));

    function update() {
      tab.clear();
      var pts = 0;
      HS_SCEN.forEach(function (sc) {
        var r = sc.f(st);
        pts += r[1] === 'is-good' ? 1 : r[1] === 'is-warn' ? 0.5 : 0;
        var tr = tab.add([sc.n, el('span', 'lab-badge ' + r[1], r[0]), r[2]]);
        tr.lastChild.classList.add('lab-wide');
      });
      var pct = Math.round(pts / HS_SCEN.length * 100);
      scoreTxt.replaceChildren(el('b', null, pct + '%'), document.createTextNode(' of the attacks stopped'));
      bar.style.width = pct + '%'; bar.className = pct >= 80 ? 'is-good' : pct >= 40 ? 'is-warn' : 'is-bad';
      scoreTxt.setAttribute('role', 'status');
    }
    update();
  }

  /* ---------- 4. Practice sets ---------- */
  function buildCloudModels(host) {
    Labs.sorter(host, {
      cls: 'net-cloudsort', keepCase: true,
      title: 'IaaS, PaaS or SaaS?',
      lead: 'Read each situation and choose the cloud service model. Ask who manages the operating system, the platform and the application.',
      noun: 'situation',
      groupLabel: 'Cloud service model',
      choices: [{ key: 'IaaS', label: 'IaaS' }, { key: 'PaaS', label: 'PaaS' }, { key: 'SaaS', label: 'SaaS' }],
      items: [
        { text: 'A start-up rents virtual servers from a provider, installs its own operating system and database, and keeps them patched itself.', ans: 'IaaS', why: 'The provider supplies only the basic computing: servers, storage and networking. The customer manages everything above that, which gives the most control and needs the most skill.' },
        { text: 'School staff use a hosted email and calendar service in a web browser. The provider looks after everything except the staff accounts and the messages themselves.', ans: 'SaaS', why: 'The customer uses finished software. The provider runs the application, the platform and the infrastructure, and the school manages users and data.' },
        { text: 'Developers upload their web app\'s code to a service that handles the servers, operating system updates and scaling automatically.', ans: 'PaaS', why: 'The provider manages the infrastructure and the platform. The customer manages only its own application and data, so developers can focus on code.' },
        { text: 'A bank rents hundreds of virtual machines for a week to test an application at peak load, then deletes them.', ans: 'IaaS', why: 'Renting raw virtual machines on demand is infrastructure as a service. The bank installs and configures the software on them, and pays only while they exist.' },
        { text: 'A clinic uses an online booking system and pays a monthly fee per user. It cannot change how the software works.', ans: 'SaaS', why: 'A ready-made application delivered over the internet and paid for by subscription is software as a service.' },
        { text: 'A research team runs its own analysis code on a managed database service whose server patches and backups are handled by the provider.', ans: 'PaaS', why: 'The team writes and runs its own code, but the provider looks after the platform underneath it: the database software, its operating system and the servers.' }
      ],
      closing: 'A quick test: the more you manage yourself, the closer to IaaS; the less you manage, the closer to SaaS.'
    });
  }
  function buildCloudStorage(host) {
    Labs.sorter(host, {
      cls: 'net-storagesort',
      title: 'Which storage type?',
      lead: 'Read each situation and choose the type of storage that fits. Think about who can access the data and which services the organisation gets.',
      noun: 'situation',
      groupLabel: 'Storage type',
      choices: [{ key: 'public', label: 'Public cloud' }, { key: 'private', label: 'Private cloud' }, { key: 'hybrid', label: 'Hybrid cloud' }, { key: 'onprem', label: 'On premises' }],
      items: [
        { text: 'A start-up with unpredictable demand stores customers\' uploads with a large provider and pays by the gigabyte.', ans: 'public', why: 'Shared infrastructure owned by a provider, reached over the internet, with capacity that scales up and down and a pay-by-use price.' },
        { text: 'A government agency keeps sensitive records on cloud-style infrastructure that only that agency uses, in its own data centre.', ans: 'private', why: 'The infrastructure is dedicated to one organisation. It offers self-service and scaling within what the agency owns, with more control over security and location.' },
        { text: 'A hospital keeps patient records on its own cloud and uses a public service to analyse de-identified research data.', ans: 'hybrid', why: 'Private and public cloud are connected, so sensitive data stays under the hospital\'s control while the public service provides cheap, scalable computing.' },
        { text: 'A small workshop keeps its job files on a network storage device in the back office, and has no need for internet access to reach them.', ans: 'onprem', why: 'The hardware is owned and run inside the organisation\'s building and accessed over its local network. It is not a cloud service, so capacity is fixed and the workshop handles its own backup.' },
        { text: 'A school keeps its live data on servers in its comms room and copies encrypted backups to a provider\'s online storage.', ans: 'hybrid', why: 'On-premises storage working together with public cloud storage is a hybrid arrangement: local control and speed plus cheap off-site backup.' },
        { text: 'A freelance designer shares large files with clients through a subscription file-sharing service.', ans: 'public', why: 'Anyone with an account and internet access can use a public cloud service, and the provider looks after the hardware, which suits sharing with people outside the organisation.' }
      ],
      closing: 'In an exam, name the type, then justify it with the two criteria in the dot point: how the data is accessed and which services the organisation gets.'
    });
  }

  function init() {
    document.querySelectorAll('[data-net="wifi"]').forEach(buildWifi);
    document.querySelectorAll('[data-net="transfer"]').forEach(buildTransfer);
    document.querySelectorAll('[data-net="homesec"]').forEach(buildHomeSec);
    document.querySelectorAll('[data-net="cloud-models"]').forEach(buildCloudModels);
    document.querySelectorAll('[data-net="cloud-storage"]').forEach(buildCloudStorage);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
