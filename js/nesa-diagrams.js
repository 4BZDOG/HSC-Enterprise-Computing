/* ============================================================
   NESA modelling diagrams: structure charts and data flow diagrams
   drawn with the symbols in the NESA Enterprise Computing Course
   Specifications (DFD symbols pp. 4-5: circle process, open-ended data
   store, near-square external entity, labelled curved data flows). Mermaid has no notation for data and flag couples,
   repetition arcs or open-ended data stores, so these are drawn here
   as SVG from data in js/nesa-diagram-data.js. Data flow diagrams
   (DFDs) are the ones Enterprise Computing pages use most.

   Markup: <div class="nesa-diagram" data-diagram="key"></div>
   ============================================================ */
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  let uid = 0;

  function svg(tag, attrs, parent) {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  }

  function label(parent, x, y, text, cls, anchor) {
    const rows = String(text).split('\n');
    const t = svg('text', { x, y: y - (rows.length - 1) * 7.5, class: cls || 'nd-text', 'text-anchor': anchor || 'middle' }, parent);
    rows.forEach((r, i) => { svg('tspan', { x, dy: i ? 15 : 0 }, t).textContent = r; });
    return t;
  }

  function arrowDefs(root, id) {
    const defs = svg('defs', {}, root);
    const m = svg('marker', { id, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
    svg('path', { d: 'M0 0 L10 5 L0 10 z', class: 'nd-arrowhead' }, m);
  }

  /* ── Structure charts ───────────────────────────────────── */
  // Tidy tree layout: leaves sit side by side; parents centre over their children.
  function layoutTree(def) {
    const W = def.boxWidth || 122, H = def.boxHeight || 44, GAP = def.gap || 16, LEVEL = def.levelGap || 118;
    const pos = {};
    let cursor = 0;
    (function place(id, depth) {
      const node = def.modules[id];
      const kids = node.children || [];
      if (!kids.length) {
        pos[id] = { x: cursor + W / 2, y: depth * LEVEL + H / 2 };
        cursor += W + GAP;
      } else {
        kids.forEach(k => place(k, depth + 1));
        const xs = kids.map(k => pos[k].x);
        pos[id] = { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: depth * LEVEL + H / 2 };
      }
    })(def.root, 0);
    return { pos, W, H, width: cursor - GAP };
  }

  function drawStructure(host, def) {
    const { pos, W, H, width } = layoutTree(def);
    const PAD = 90;
    const depth = Math.max(...Object.values(pos).map(p => p.y)) + H / 2;
    const root = svg('svg', { viewBox: `${-PAD} -20 ${width + PAD * 2} ${depth + 40}`, role: 'img', class: 'nd-svg' });
    const aid = 'nd-arrow-' + (++uid);
    arrowDefs(root, aid);
    const lines = svg('g', { class: 'nd-lines' }, root);
    const marks = svg('g', {}, root);

    for (const id in def.modules) {
      const node = def.modules[id];
      const p = pos[id];
      const kids = node.children || [];
      const px = p.x, py = p.y + H / 2;
      kids.forEach(k => {
        const c = pos[k];
        svg('line', { x1: px, y1: py, x2: c.x, y2: c.y - H / 2, class: 'nd-line' }, lines);
      });
      // Decision: a small diamond where the lines to selectively called modules meet.
      if (node.decision) {
        svg('path', { d: `M${px} ${py} l9 9 l-9 9 l-9 -9 z`, class: 'nd-diamond' }, marks);
      }
      // Repetition: a curved arrow across the connecting lines.
      if (node.repeat) {
        const r = 24, cy = py + 6;
        svg('path', { d: `M${px - r} ${cy + 4} A ${r} ${r * 0.7} 0 0 0 ${px + r} ${cy + 4}`, class: 'nd-repeat', 'marker-end': `url(#${aid})` }, marks);
        const left = node.repeatSide === 'left';
        label(marks, left ? px - r - 6 : px + r + 6, cy + 26, node.repeat, 'nd-note', left ? 'end' : 'start');
      }
    }

    // Couples: an arrow beside the connecting line, open circle for data, filled circle for a flag.
    (def.couples || []).forEach(c => {
      const a = pos[c.from], b = pos[c.to];
      const x1 = a.x, y1 = a.y + H / 2, x2 = b.x, y2 = b.y - H / 2;
      const t = c.at == null ? 0.5 : c.at;
      const mx = x1 + (x2 - x1) * t, my = y1 + (y2 - y1) * t;
      const len = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / len, uy = (y2 - y1) / len;
      const side = c.side === 'left' ? -1 : 1;
      const nx = -uy * side, ny = ux * side;            // perpendicular offset
      const ox = mx + nx * 16, oy = my + ny * 16;
      const dir = c.dir === 'up' ? -1 : 1;              // up = child returns data to parent
      const sx = ox - ux * 16 * dir, sy = oy - uy * 16 * dir, ex = ox + ux * 16 * dir, ey = oy + uy * 16 * dir;
      svg('line', { x1: sx, y1: sy, x2: ex, y2: ey, class: 'nd-couple', 'marker-end': `url(#${aid})` }, marks);
      svg('circle', { cx: sx - ux * 4 * dir, cy: sy - uy * 4 * dir, r: 4.5, class: c.kind === 'flag' ? 'nd-flag' : 'nd-data' }, marks);
      label(marks, ox + nx * 10 + (nx >= 0 ? 4 : -4), oy + ny * 10 + 4, c.label, 'nd-note', nx >= 0 ? 'start' : 'end');
    });

    const boxes = svg('g', {}, root);
    for (const id in def.modules) {
      const p = pos[id];
      svg('rect', { x: p.x - W / 2, y: p.y - H / 2, width: W, height: H, class: 'nd-box nd-module' + (id === def.root ? ' nd-root' : '') }, boxes);
      label(boxes, p.x, p.y + 4, def.modules[id].label);
    }
    host.appendChild(root);
  }

  /* ── Data flow diagrams ─────────────────────────────────── */
  // Proportions as NESA draws them (Course Specifications p.4): an external entity is a closed,
  // near-square rectangle (a little taller than wide); a data store is about 1.6 times wider than
  // tall, open on the right; a process is a circle.
  const SIZE = { process: 46, entityW: 92, entityH: 96, storeW: 122, storeH: 76 };

  // Point on a node's outline in the direction of (tx, ty).
  function edgePoint(n, tx, ty) {
    const dx = tx - n.x, dy = ty - n.y, d = Math.hypot(dx, dy) || 1;
    if (n.type === 'process') {
      const r = n.r || SIZE.process;
      return [n.x + dx / d * r, n.y + dy / d * r];
    }
    const hw = (n.type === 'store' ? SIZE.storeW : SIZE.entityW) / 2, hh = (n.type === 'store' ? SIZE.storeH : SIZE.entityH) / 2;
    const s = Math.min(hw / Math.abs(dx || 1e-6), hh / Math.abs(dy || 1e-6));
    return [n.x + dx * s, n.y + dy * s];
  }

  function drawDFD(host, def) {
    const [w, h] = def.size;
    const root = svg('svg', { viewBox: `0 0 ${w} ${h}`, role: 'img', class: 'nd-svg' });
    const aid = 'nd-arrow-' + (++uid);
    arrowDefs(root, aid);
    const flows = svg('g', {}, root);
    const shapes = svg('g', {}, root);
    const N = def.nodes;

    (def.flows || []).forEach(f => {
      const a = N[f.from], b = N[f.to];
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      const bend = f.bend == null ? 30 : f.bend;              // curved, as in the specification
      const cx = mx - (b.y - a.y) / len * bend, cy = my + (b.x - a.x) / len * bend;
      const [x1, y1] = edgePoint(a, cx, cy), [x2, y2] = edgePoint(b, cx, cy);
      svg('path', { d: `M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`, class: 'nd-flow', 'marker-end': `url(#${aid})` }, flows);
      // Label on the outside of the curve so it never sits on the line.
      const bx = 0.25 * x1 + 0.5 * cx + 0.25 * x2, by = 0.25 * y1 + 0.5 * cy + 0.25 * y2;
      const nx = -(b.y - a.y) / len * Math.sign(bend || 1), ny = (b.x - a.x) / len * Math.sign(bend || 1);
      const lx = bx + nx * 12, ly = by + ny * 12;
      // `at: [x, y]` (with optional `anchor`) places the label exactly; otherwise it sits just outside the curve
      const t = f.at
        ? label(flows, f.at[0], f.at[1] + 4, f.label, 'nd-flow-label', f.anchor || 'middle')
        : label(flows, lx + (f.dx || 0), ly + (f.dy || 0) + 4, f.label, 'nd-flow-label', Math.abs(nx) > 0.5 ? (nx > 0 ? 'start' : 'end') : 'middle');
      t.setAttribute('paint-order', 'stroke');
    });

    for (const id in N) {
      const n = N[id];
      if (n.type === 'process') {
        svg('circle', { cx: n.x, cy: n.y, r: n.r || SIZE.process, class: 'nd-box nd-process' }, shapes);
      } else if (n.type === 'entity') {
        svg('rect', { x: n.x - SIZE.entityW / 2, y: n.y - SIZE.entityH / 2, width: SIZE.entityW, height: SIZE.entityH, class: 'nd-box nd-entity' }, shapes);
      } else {
        // Data store: a rectangle open on the right.
        const x = n.x - SIZE.storeW / 2, y = n.y - SIZE.storeH / 2;
        svg('rect', { x, y, width: SIZE.storeW, height: SIZE.storeH, class: 'nd-store-fill' }, shapes);
        svg('path', { d: `M${x + SIZE.storeW} ${y} H${x} V${y + SIZE.storeH} H${x + SIZE.storeW}`, class: 'nd-store' }, shapes);
      }
      label(shapes, n.x, n.y + 4, n.label);
    }
    host.appendChild(root);
  }

  function mount(el) {
    if (el.dataset.ready) return;
    const def = (window.HSC_NESA_DIAGRAMS || {})[el.dataset.diagram];
    if (!def) return;
    el.dataset.ready = '1';
    (def.type === 'dfd' ? drawDFD : drawStructure)(el, def);
    const s = el.querySelector('svg');
    if (s && def.alt) s.setAttribute('aria-label', def.alt);
    // Wide diagrams scroll inside their figure on phones instead of shrinking the text
    if (s) s.style.minWidth = Math.round(s.viewBox.baseVal.width) + 'px';
  }

  function mountAll() { document.querySelectorAll('.nesa-diagram[data-diagram]').forEach(mount); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountAll);
  else mountAll();
})();
