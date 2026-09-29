/* ============================================================
   Animated diagrams: a small paper-theatre engine.

   A scene is a cast of paper cut-outs (built in setup) and a
   list of beats. A beat is one caption plus the motion that goes
   with it. The player plays, pauses and steps through beats, and
   rebuilds any earlier moment by replaying beats instantly.

   Markup:  <div class="anim" data-anim="csrf"></div>
   Scenes:  js/anims/<name>.js calls HSCAnim.define(name, def).
            This file loads each scene a page uses on demand.
   Guide:   .claude/skills/add-animation.md

   Ported from the sister HSC SE site. The engine, player
   and SE kit are unchanged; everything added for Enterprise Computing
   sits under "EC extensions" (search for it), plus two small options
   on s.link() (`straight`, `both`) and the EC shapes in s.node().

   Conventions for scene authors
   · Build everything in setup(s). Keep references on s (s.bank = …),
     never in variables outside the scene: setup runs again on
     every rewind and layout change.
   · Move things only with s.* motion helpers and wait only with
     s.wait(). They finish instantly while rewinding, so a beat must
     never await a raw setTimeout or event.
   · Anchors: standing things (folk, buildings) sit on their feet at
     (0, 0); small props (envelope, cookie, key…) are centred on
     (0, 0); panels (browser, card, plot) start at their top left.
   ============================================================ */

(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const DEFS = {};
  const KIT = {};
  const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  const self = document.currentScript;
  const SRC = self ? self.src.split('?')[0] : '';
  const BASE = SRC ? SRC.replace(/[^/]*$/, '') : '../js/';
  const VERSION = (self && /[?&]v=([^&]+)/.exec(self.src) || [])[1] || '1';
  const TALL_BELOW = 560;   // stage width (px) under which a scene's tall layout is used
  let uid = 0;

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const r2 = v => Math.round(v * 100) / 100;

  function svg(tag, attrs, parent) {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) if (attrs[k] != null) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  }

  function h(tag, cls, text) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text != null) el.textContent = text;
    return el;
  }

  // Captions may use *emphasis* and `code`.
  function rich(str) {
    const frag = document.createDocumentFragment();
    String(str).split(/(\*[^*]+\*|`[^`]+`)/).forEach(part => {
      if (!part) return;
      if (part[0] === '*' && part.length > 2) frag.append(h('strong', null, part.slice(1, -1)));
      else if (part[0] === '`' && part.length > 2) frag.append(h('code', null, part.slice(1, -1)));
      else frag.append(part);
    });
    return frag;
  }
  const plain = str => String(str).replace(/[*`]/g, '');

  // Deterministic randomness, so a rewound scene looks exactly the same.
  function seeded(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), a | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const hash = str => [...str].reduce((a, c) => (Math.imul(a, 31) + c.charCodeAt(0)) | 0, 7);

  const EASE = {
    linear: t => t,
    in: t => t * t * t,
    out: t => 1 - Math.pow(1 - t, 3),
    inOut: t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    spring: t => { const c = 2.1; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }
  };

  /* ── Shared SVG defs: paper shadows, hatching, arrowheads ── */

  function sharedDefs() {
    if (document.getElementById('pa-defs')) return;
    const s = svg('svg', { id: 'pa-defs', width: 0, height: 0, 'aria-hidden': 'true', focusable: 'false' });
    s.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    s.innerHTML = `<defs>
      <filter id="pa-cut" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow class="pa-shadow" dx="0" dy="1.4" stdDeviation="1.1"/></filter>
      <filter id="pa-lift" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow class="pa-shadow pa-shadow-lift" dx="0" dy="6" stdDeviation="4"/></filter>
      <pattern id="pa-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect class="pa-hatch-bg" width="7" height="7"/><rect class="pa-hatch-ink" width="2" height="7"/></pattern>
      <pattern id="pa-outage" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><rect class="pa-outage-bg" width="8" height="8"/><rect class="pa-outage-ink" width="3" height="8"/></pattern>
      <marker id="pa-inherit" viewBox="0 0 14 14" refX="13" refY="7" markerWidth="12" markerHeight="12" orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path class="pa-inherit-head" d="M1 1 L13 7 L1 13 Z"/></marker>
      <marker id="pa-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="pa-arrowhead" d="M0 0 L10 5 L0 10 z"/></marker>
    </defs>`;
    document.body.appendChild(s);
  }

  /* ── Clock: every tween in a scene runs through one of these ── */

  class Clock {
    constructor() {
      this.jobs = new Set();
      this.instant = false;
      this.raf = 0;
      this.tick = this.tick.bind(this);
    }

    run(dur, step, ease, delay) {
      if (this.instant || (dur <= 0 && !delay)) { step(1, true); return Promise.resolve(); }
      return new Promise(resolve => {
        this.jobs.add({ t0: performance.now() + (delay || 0), dur: Math.max(1, dur), step, ease, resolve });
        if (!this.raf) this.raf = requestAnimationFrame(this.tick);
      });
    }

    tick(now) {
      this.raf = 0;
      for (const j of [...this.jobs]) {
        if (now < j.t0) continue;
        const k = Math.min(1, (now - j.t0) / j.dur);
        j.step(k < 1 ? j.ease(k) : 1, k >= 1);
        if (k >= 1) { this.jobs.delete(j); j.resolve(); }
      }
      if (this.jobs.size) this.raf = requestAnimationFrame(this.tick);
    }

    // Snap everything in flight to its end state.
    finish() {
      const jobs = [...this.jobs];
      this.jobs.clear();
      jobs.forEach(j => { j.step(1, true); j.resolve(); });
    }
  }

  /* ── Transform state kept per element ── */

  const STATE = new WeakMap();
  function st(el) {
    let s = STATE.get(el);
    if (!s) { s = { x: 0, y: 0, r: 0, s: 1, sx: 1, sy: 1, o: 1 }; STATE.set(el, s); }
    return s;
  }
  function paint(el) {
    const s = st(el);
    let t = `translate(${r2(s.x)} ${r2(s.y)})`;
    if (s.r) t += ` rotate(${r2(s.r)})`;
    const kx = s.s * s.sx, ky = s.s * s.sy;
    const k3 = v => Math.round(Math.max(v, .001) * 1000) / 1000;
    if (kx !== 1 || ky !== 1) t += ` scale(${k3(kx)} ${k3(ky)})`;
    el.setAttribute('transform', t);
    const o = clamp(s.o, 0, 1);
    el.style.opacity = o >= 1 ? '' : String(r2(o));
    el.style.visibility = o <= 0.01 ? 'hidden' : '';
  }

  /* ── Scene: what a scene's setup and beats receive as `s` ── */

  class Scene {
    constructor(player, host, mode) {
      const def = player.def;
      this.player = player;
      this.clock = player.clock;
      this.mode = mode;
      this.compact = mode === 'tall';
      this.L = (def.layouts && def.layouts[mode]) || def.layout || {};
      [this.W, this.H] = this.L.size || def.size || [760, 440];
      this.variant = player.variants[player.vi].id;
      this.rand = seeded(hash(player.name + this.variant + mode));
      this.svg = svg('svg', {
        class: 'anim-svg', viewBox: `0 0 ${this.W} ${this.H}`,
        'aria-hidden': 'true', focusable: 'false', preserveAspectRatio: 'xMidYMid meet'
      });
      host.replaceChildren(this.svg);
      this.back = this.g(this.svg, 'pa-layer-back');
      this.root = this.g(this.svg, 'pa-layer');
      this.front = this.g(this.svg, 'pa-layer-front');
      this.fx = this.g(this.svg, 'pa-layer-fx');
    }

    is(...ids) { return ids.includes(this.variant); }

    /* Building blocks */
    el(tag, attrs, parent) { return svg(tag, attrs, parent || this.root); }

    g(parent, cls, at) {
      const g = svg('g', cls ? { class: cls } : {}, parent || this.root);
      if (at) this.set(g, at);
      return g;
    }

    text(parent, str, o = {}) {
      const lines = String(str).split('\n');
      const size = o.size || 13, lh = (o.lh || 1.25) * size;
      const y0 = (o.y || 0) - (o.valign === 'middle' ? (lines.length - 1) * lh / 2 : 0);
      const t = svg('text', {
        x: o.x || 0, y: y0, class: o.cls || 'pa-t',
        'text-anchor': o.anchor || 'middle',
        'dominant-baseline': o.valign === 'middle' ? 'central' : null,
        style: o.size ? `font-size:${o.size}px` : null
      }, parent || this.root);
      if (lines.length === 1) t.textContent = lines[0];
      else lines.forEach((line, i) => { svg('tspan', { x: o.x || 0, dy: i ? lh : 0 }, t).textContent = line; });
      return t;
    }

    // Rough text width, good enough to size tags and bubbles before layout.
    measure(str, size = 13, mono = false) {
      return Math.max(...String(str).split('\n').map(l => l.length)) * size * (mono ? .61 : .54);
    }

    // A small random tilt, so cut-outs never look machine-straight.
    tilt(el, max = 2) { return this.set(el, { r: (this.rand() * 2 - 1) * max }); }

    raise(el) { el.parentNode.appendChild(el); return el; }
    remove(el) { if (el && el.parentNode) el.parentNode.removeChild(el); }

    /* Motion. Every helper returns a promise and finishes instantly when rewinding. */
    set(el, props) { Object.assign(st(el), props); paint(el); return el; }
    at(el) { return Object.assign({}, st(el)); }

    tween(o, step) {
      return this.clock.run(o.dur == null ? 450 : o.dur, step, EASE[o.ease || 'out'] || EASE.out, o.delay || 0);
    }

    to(el, props, o = {}) {
      let from;
      return this.tween(o, k => {
        const s = st(el);
        if (!from) from = Object.assign({}, s);
        for (const key in props) s[key] = lerp(from[key], props[key], k);
        paint(el);
      });
    }

    // Travel to (x, y), optionally along an arc `arc` px high.
    move(el, x, y, o = {}) {
      const cur = st(el);
      const dist = Math.hypot(x - cur.x, y - cur.y);
      let a, c;
      return this.tween({ dur: o.dur == null ? clamp(260 + dist * 1.5, 320, 1150) : o.dur, ease: o.ease || 'inOut', delay: o.delay }, k => {
        const s = st(el);
        if (!a) {
          a = { x: s.x, y: s.y, r: s.r };
          c = { x: (a.x + x) / 2, y: (a.y + y) / 2 - (o.arc || 0) };
        }
        const u = 1 - k;
        s.x = u * u * a.x + 2 * u * k * c.x + k * k * x;
        s.y = u * u * a.y + 2 * u * k * c.y + k * k * y;
        if (o.r != null) s.r = lerp(a.r, o.r, k);
        paint(el);
      });
    }

    pop(el, o = {}) {
      const target = o.s == null ? 1 : o.s;
      this.set(el, { o: 0, s: target * (o.from == null ? .4 : o.from) });
      return this.to(el, { o: 1, s: target }, { dur: o.dur || 520, ease: 'spring', delay: o.delay });
    }

    show(el, o = {}) { return this.to(el, { o: 1 }, { dur: o.dur || 320, delay: o.delay }); }
    hide(el, o = {}) { return this.to(el, { o: 0 }, { dur: o.dur || 280, delay: o.delay }); }

    // One jiggle at a time per element: a second one mid-air would take the
    // wrong resting place. Returns a function to call when it ends.
    busy(el, kind) {
      const tag = '_pa' + kind;
      if (el[tag]) return null;
      el[tag] = true;
      return () => { el[tag] = false; };
    }

    // Jump on the spot, with a little squash on landing.
    hop(el, o = {}) {
      const high = o.h == null ? 12 : o.h, n = o.n || 1;
      const free = this.busy(el, 'hop');
      if (!free) return Promise.resolve();
      let y0;
      return this.tween({ dur: (o.dur || 440) * n, ease: 'linear', delay: o.delay }, (k, done) => {
        if (done) free();
        const s = st(el);
        if (y0 == null) y0 = s.y;
        const p = (k * n) % 1;
        const ground = done ? 1 : 1 - Math.sin(p * Math.PI);
        s.y = done ? y0 : y0 - high * 4 * p * (1 - p);
        s.sy = done ? 1 : 1 - .09 * ground * ground + .05 * (1 - ground);
        s.sx = done ? 1 : 1 + .07 * ground * ground;
        paint(el);
      });
    }

    // Side-to-side shake: "no", or a failed attempt.
    shake(el, o = {}) {
      const amp = o.amp || 5, n = o.n || 3;
      const free = this.busy(el, 'shake');
      if (!free) return Promise.resolve();
      let x0;
      return this.tween({ dur: o.dur || 480, ease: 'linear', delay: o.delay }, (k, done) => {
        if (done) free();
        const s = st(el);
        if (x0 == null) x0 = s.x;
        s.x = done ? x0 : x0 + amp * Math.sin(k * n * Math.PI * 2) * (1 - k);
        paint(el);
      });
    }

    // Rock back and forth about the anchor.
    wobble(el, o = {}) {
      const amp = o.amp || 8, n = o.n || 2;
      const free = this.busy(el, 'wobble');
      if (!free) return Promise.resolve();
      let r0;
      return this.tween({ dur: o.dur || 600, ease: 'linear', delay: o.delay }, (k, done) => {
        if (done) free();
        const s = st(el);
        if (r0 == null) r0 = s.r;
        s.r = done ? r0 : r0 + amp * Math.sin(k * n * Math.PI * 2) * (1 - k);
        paint(el);
      });
    }

    // Rubber stamp: drops from above and lands with a thump.
    stamp(el, o = {}) {
      const r = o.r == null ? -8 : o.r;
      this.set(el, { o: 0, s: 1.9, r: r - 14 });
      return this.to(el, { o: 1, s: 1, r }, { dur: 280, ease: 'in', delay: o.delay })
        .then(() => this.to(el, { s: 1.06 }, { dur: 70 }))
        .then(() => this.to(el, { s: 1 }, { dur: 140 }));
    }

    // Draw a stroke on, from start to end.
    draw(path, o = {}) {
      const len = (path.getTotalLength && path.getTotalLength()) || 600;
      path.style.strokeDasharray = `${len} ${len}`;
      path.style.strokeDashoffset = len;
      return this.tween({ dur: o.dur || clamp(len * 2, 300, 1200), ease: o.ease || 'inOut', delay: o.delay }, (k, done) => {
        path.style.strokeDashoffset = done ? '' : len * (1 - k);
        if (done) path.style.strokeDasharray = '';
      });
    }

    count(el, from, to, o = {}) {
      const fmt = o.fmt || (v => String(Math.round(v)));
      return this.tween({ dur: o.dur || 800, ease: o.ease || 'out', delay: o.delay }, k => { el.textContent = fmt(lerp(from, to, k)); });
    }

    type(el, str, o = {}) {
      return this.tween({ dur: o.dur || clamp(str.length * 30, 250, 2000), ease: 'linear', delay: o.delay }, k => {
        el.textContent = str.slice(0, Math.round(str.length * k));
      });
    }

    // Letters churn and settle into new text: plain text ⇄ cipher text.
    scramble(el, to, o = {}) {
      const from = el.textContent, n = Math.max(from.length, to.length);
      const glyphs = '#%&*+=?@$!0123456789ABCDEFGHJKLMNPQRSTVWXYZabcdefghkmnpqrstuvwxyz';
      return this.tween({ dur: o.dur || 1000, ease: 'linear', delay: o.delay }, (k, done) => {
        if (done) { el.textContent = to; return; }
        let out = '';
        for (let i = 0; i < n; i++) {
          const settle = .35 + .65 * (i / n);
          if (k >= settle) out += to[i] || '';
          else if (k >= settle - .35) out += (to[i] === ' ' ? ' ' : glyphs[Math.floor(Math.random() * glyphs.length)]);
          else out += from[i] || '';
        }
        el.textContent = out;
      });
    }

    wait(ms) { return this.tween({ dur: ms, ease: 'linear' }, () => {}); }

    all(list) { return Promise.all(list); }

    /* Effects that leave nothing behind (skipped while rewinding) */

    // An expanding ring that says "look here".
    ring(x, y, o = {}) {
      if (this.clock.instant) return Promise.resolve();
      const c = svg('circle', { cx: x, cy: y, r: o.r || 18, class: 'pa-ring ' + (o.cls || '') }, this.fx);
      return this.tween({ dur: o.dur || 700, ease: 'out', delay: o.delay }, (k, done) => {
        c.setAttribute('r', (o.r || 18) * (1 + k * .9));
        c.style.opacity = String(1 - k);
        if (done) this.remove(c);
      });
    }

    // A handful of paper sparkles thrown out from (x, y).
    burst(x, y, o = {}) {
      if (this.clock.instant) return Promise.resolve();
      const n = o.n || 8, jobs = [];
      for (let i = 0; i < n; i++) {
        const sp = this.sparkle(this.fx, { tone: o.tones ? o.tones[i % o.tones.length] : (o.tone || 'mustard') });
        const ang = (i / n) * Math.PI * 2 + Math.random() * .6;
        const d = (o.spread || 40) * (.6 + Math.random() * .6);
        this.set(sp, { x, y, s: .3, o: 1, r: Math.random() * 90 });
        jobs.push(this.tween({ dur: 700 + Math.random() * 300, ease: 'out' }, (k, done) => {
          this.set(sp, { x: x + Math.cos(ang) * d * k, y: y + Math.sin(ang) * d * k + 14 * k * k, s: .3 + .7 * Math.sin(k * Math.PI), o: 1 - k * k, r: 90 * k });
          if (done) this.remove(sp);
        }));
      }
      return Promise.all(jobs);
    }
  }

  /* ── Paper kit: the shared cast of cut-outs ────────────────
     Tones: teal, terra, sage, mustard, plum, blush, paper, sheet, kraft, ink. */

  const MOUTHS = {
    happy: 'M-5 -30 Q0 -25 5 -30',
    grin: 'M-7 -31 Q0 -22 7 -31 Z',
    smirk: 'M-5 -29 Q1 -25 6 -31',
    flat: 'M-4 -28.5 H4',
    sad: 'M-5 -26 Q0 -31 5 -26',
    shock: 'M0 -32.5 a2.6 3.2 0 1 0 .01 0 Z'
  };
  const FILLED = new Set(['grin', 'shock']);
  const NODE_TONES = { terminator: 'teal', decision: 'mustard-t', io: 'blush-t', subprogram: 'sheet', entity: 'sheet' };
  const SF_SHAPES = ['sf-document', 'sf-storage', 'sf-display', 'sf-manual', 'sf-input', 'sf-tape', 'sf-cloud'];
  SF_SHAPES.forEach(k => { NODE_TONES[k] = 'sky-t'; });      // system flowchart symbols share one tone
  const DARK_TONES = ['teal', 'terra', 'sage', 'plum'];      // text in --pa-on
  const LIGHT_TONES = ['mustard', 'blush', 'sky'];           // text stays dark in both themes

  Object.assign(KIT, {
    // A paper bean character standing on (0, 0).
    folk(parent, o = {}) {
      const g = this.g(parent, 'pa-folk', o.at);
      this.el('ellipse', { cx: 0, cy: 1, rx: 21, ry: 3.6, class: 'pa-floor' }, g);
      const idle = this.g(g, 'pa-idle-breathe');
      const body = this.g(idle, 'pa-cut-g');
      body.setAttribute('filter', 'url(#pa-cut)');
      this.el('path', { d: 'M-22 -5 C-24 -31 -17 -58 0 -58 C17 -58 24 -31 22 -5 Q22 0 17 0 H-17 Q-22 0 -22 -5 Z', class: 'f-' + (o.tone || 'teal') }, body);
      this.el('path', { d: 'M-15 -41 Q-13 -50 -5 -53', class: 'pa-shine' }, body);
      if (o.hat === 'tophat') {
        this.el('rect', { x: -12, y: -80, width: 24, height: 22, rx: 2, class: 'f-ink-fixed' }, body);
        this.el('rect', { x: -12, y: -66, width: 24, height: 4, class: 'f-mustard' }, body);
        this.el('rect', { x: -18, y: -60, width: 36, height: 4, rx: 2, class: 'f-ink-fixed' }, body);
      } else if (o.hat === 'cap') {
        this.el('path', { d: 'M-17 -50 Q-15 -64 0 -64 Q15 -64 17 -50 Z', class: 'f-' + (o.hatTone || 'mustard') }, body);
        this.el('path', { d: 'M4 -51 H24 Q24 -47 20 -47 H4 Z', class: 'f-' + (o.hatTone || 'mustard') }, body);
      }
      this.el('ellipse', { cx: -13, cy: -30, rx: 4.2, ry: 2.6, class: 'pa-blush' }, body);
      this.el('ellipse', { cx: 13, cy: -30, rx: 4.2, ry: 2.6, class: 'pa-blush' }, body);
      if (o.hat === 'mask') {
        this.el('rect', { x: -20, y: -45, width: 40, height: 13, rx: 6.5, class: 'f-ink-fixed' }, body);
        this.el('path', { d: 'M19 -41 L27 -45 M19 -37 L27 -35', class: 'pa-line-ink' }, body);
      }
      const eyes = this.g(body, 'pa-eyes');
      eyes.style.animationDelay = (-this.rand() * 5).toFixed(2) + 's';
      const eye = o.hat === 'mask' ? 'f-paper-fixed' : 'f-ink-fixed';
      this.el('ellipse', { cx: -7.5, cy: -38.5, rx: 2.7, ry: 3.1, class: eye }, eyes);
      this.el('ellipse', { cx: 7.5, cy: -38.5, rx: 2.7, ry: 3.1, class: eye }, eyes);
      g.mouth = this.el('path', { d: MOUTHS.happy, class: 'pa-mouth' }, body);
      if (o.hat === 'headphones') {
        this.el('path', { d: 'M-24 -34 C-26 -70 26 -70 24 -34', class: 'pa-band' }, body);
        this.el('rect', { x: -29, y: -42, width: 9, height: 16, rx: 4, class: 'f-ink-fixed' }, body);
        this.el('rect', { x: 20, y: -42, width: 9, height: 16, rx: 4, class: 'f-ink-fixed' }, body);
      }
      if (o.sweat) g.sweat = this.el('path', { d: 'M20 -52 q4 6 0 9 q-4 -3 0 -9 z', class: 'f-sky pa-sweat' }, body);
      if (o.name) g.name = this.text(g, o.name, { y: 19, cls: 'pa-name' });
      g.body = body;
      if (o.mood) this.mood(g, o.mood);
      return g;
    },

    mood(folk, m) {
      folk.mouth.setAttribute('d', MOUTHS[m] || MOUTHS.happy);
      folk.mouth.classList.toggle('is-filled', FILLED.has(m));
      folk.dataset.mood = m;
      return folk;
    },

    // A browser window, top left at (0, 0). Draw pages into b.pages[i].
    browser(parent, o = {}) {
      const w = o.w || 300, hgt = o.h || 240;
      const b = this.g(parent, 'pa-browser', o.at);
      const frame = this.g(b);
      frame.setAttribute('filter', 'url(#pa-cut)');
      this.el('rect', { width: w, height: hgt, rx: 10, class: 'f-paper' }, frame);
      this.el('path', { d: `M0 34 V10 Q0 0 10 0 H${w - 10} Q${w} 0 ${w} 10 V34 Z`, class: 'f-sheet' }, frame);
      ['terra', 'mustard', 'sage'].forEach((t, i) => this.el('circle', { cx: 15 + i * 13, cy: 17, r: 4.2, class: 'f-' + t }, frame));
      b.tabs = (o.tabs || []).map((label, i) => {
        const tw = o.tabW || 104, x = 58 + i * (tw + 4);
        const tab = this.g(frame, 'pa-tab');
        this.el('path', { d: `M${x} 34 L${x + 7} 9 Q${x + 8} 6 ${x + 12} 6 H${x + tw - 12} Q${x + tw - 8} 6 ${x + tw - 7} 9 L${x + tw} 34 Z`, class: 'pa-tab-shape' }, tab);
        this.text(tab, label, { x: x + tw / 2, y: 24, cls: 'pa-t-sm pa-tab-label' });
        return tab;
      });
      this.el('rect', { x: 10, y: 41, width: w - 20, height: 25, rx: 12.5, class: 'f-sheet' }, b);
      b.lock = this.g(b, null, { x: 26, y: 53.5 });
      b.url = this.text(b, o.url || '', { x: 38, y: 58, anchor: 'start', cls: 'pa-mono' });
      b.pages = (o.tabs && o.tabs.length ? o.tabs : ['']).map(() => this.g(b, 'pa-page', { x: 0, y: 72 }));
      b.w = w; b.h = hgt; b.inner = { w, h: hgt - 72 };
      if (o.tabs && o.tabs.length) this.showTab(b, o.active || 0, true);
      return b;
    },

    showTab(b, i, now) {
      b.tabs.forEach((t, j) => t.classList.toggle('is-active', i === j));
      return Promise.all(b.pages.map((p, j) => {
        const o = j === i ? 1 : 0;
        if (now) { this.set(p, { o }); return null; }
        return this.to(p, { o }, { dur: 260 });
      }));
    },

    // A building standing on (0, 0). roof: 'bank' | 'shop' | 'house'.
    building(parent, o = {}) {
      const w = o.w || 160, hgt = o.h || 150, tone = o.tone || 'sage';
      const g = this.g(parent, 'pa-building', o.at);
      this.el('ellipse', { cx: 0, cy: 1, rx: w * .58, ry: 5, class: 'pa-floor' }, g);
      const art = this.g(g);
      art.setAttribute('filter', 'url(#pa-cut)');
      this.el('rect', { x: -w / 2, y: -hgt, width: w, height: hgt, rx: 3, class: 'f-paper' }, art);
      if (o.roof === 'bank') {
        this.el('path', { d: `M${-w / 2 - 12} ${-hgt} L0 ${-hgt - 42} L${w / 2 + 12} ${-hgt} Z`, class: 'f-' + tone }, art);
        this.el('rect', { x: -w / 2 - 8, y: -hgt, width: w + 16, height: 9, class: 'f-' + tone }, art);
        for (let i = 0; i < 4; i++) {
          const cx = -w / 2 + w * (i + .5) / 4;
          this.el('rect', { x: cx - 7, y: -hgt + 44, width: 14, height: hgt - 56, class: 'f-sheet' }, art);
          this.el('rect', { x: cx - 7, y: -hgt + 44, width: 4, height: hgt - 56, class: 'f-shade' }, art);
        }
        this.el('rect', { x: -w / 2 - 6, y: -12, width: w + 12, height: 12, class: 'f-' + tone }, art);
      } else if (o.roof === 'shop') {
        const n = 6, sw = (w + 16) / n;
        for (let i = 0; i < n; i++) {
          const x = -w / 2 - 8 + i * sw;
          this.el('path', { d: `M${x} ${-hgt + 8} H${x + sw} V${-hgt + 30} A${sw / 2} ${sw / 3} 0 0 1 ${x} ${-hgt + 30} Z`, class: i % 2 ? 'f-paper' : 'f-' + tone }, art);
        }
        this.el('rect', { x: -w / 2 - 8, y: -hgt - 30, width: w + 16, height: 38, rx: 4, class: 'f-' + tone }, art);
      } else {
        this.el('path', { d: `M${-w / 2 - 10} ${-hgt + 2} L0 ${-hgt - 36} L${w / 2 + 10} ${-hgt + 2} Z`, class: 'f-' + tone }, art);
      }
      if (o.sign) {
        const y = o.roof === 'shop' ? -hgt - 11 : o.roof === 'bank' ? -hgt - 13 : -hgt - 8;
        g.sign = this.text(art, o.sign, { y, cls: 'pa-sign', valign: 'middle' });
      }
      if (o.face) {
        const ey = o.roof === 'bank' ? -hgt + 26 : -hgt + 58;
        const eyes = this.g(art, 'pa-eyes pa-window-eyes');
        eyes.style.animationDelay = (-this.rand() * 5).toFixed(2) + 's';
        [-1, 1].forEach(sgn => {
          this.el('rect', { x: sgn * 24 - 12, y: ey - 11, width: 24, height: 22, rx: 5, class: 'f-paper-fixed' }, eyes);
          this.el('circle', { cx: sgn * 24, cy: ey + 1, r: 4.5, class: 'f-ink-fixed' }, eyes);
        });
        g.eyes = eyes;
      }
      if (o.door !== false) {
        const dw = o.roof === 'bank' ? 30 : 34, dh = o.roof === 'bank' ? 40 : 48, dy = o.roof === 'bank' ? -12 : 0;
        this.el('path', { d: `M${-dw / 2} ${dy} V${dy - dh + dw / 2} A${dw / 2} ${dw / 2} 0 0 1 ${dw / 2} ${dy - dh + dw / 2} V${dy} Z`, class: 'f-' + tone }, art);
        this.el('path', { d: `M${-dw / 2} ${dy} V${dy - dh + dw / 2} A${dw / 2} ${dw / 2} 0 0 1 ${dw / 2} ${dy - dh + dw / 2} V${dy} Z`, class: 'f-shade' }, art);
      }
      g.art = art; g.w = w; g.h = hgt;
      return g;
    },

    // Narrow or widen a building's window-eyes: 'open' | 'squint' | 'wide'.
    gaze(b, how) {
      if (b.eyes) {
        b.eyes.classList.toggle('is-squint', how === 'squint');
        b.eyes.classList.toggle('is-wide', how === 'wide');
      }
      return b;
    },

    envelope(parent, o = {}) {
      const g = this.g(parent, 'pa-envelope', o.at);
      const art = this.g(g);
      art.setAttribute('filter', 'url(#pa-cut)');
      this.el('rect', { x: -30, y: -20, width: 60, height: 40, rx: 4, class: 'f-' + (o.tone || 'paper') }, art);
      this.el('path', { d: 'M-30 20 L-7 1 M30 20 L7 1', class: 'pa-fold' }, art);
      this.el('path', { d: 'M-30 -20 L0 4 L30 -20', class: 'pa-flap' }, art);
      if (o.label) g.label = this.tag(g, { text: o.label, y: 34, mono: true, size: 11 });
      return g;
    },

    tag(parent, o = {}) {
      const size = o.size || 11.5;
      const w = o.w || this.measure(o.text, size, o.mono) + 24, hh = size + 11;
      const g = this.g(parent, 'pa-tag', { x: o.x || 0, y: o.y || 0 });
      const art = this.g(g);
      art.setAttribute('filter', 'url(#pa-cut)');
      this.el('rect', { x: -w / 2, y: -hh / 2, width: w, height: hh, rx: 4, class: 'f-' + (o.tone || 'paper') }, art);
      this.el('circle', { cx: -w / 2 + 7, cy: 0, r: 2, class: 'pa-tag-hole' }, art);
      // Light paper tones keep dark text in both themes
      const ink = o.on ? ' pa-on' : ['mustard', 'blush', 'sky'].includes(o.tone) ? ' pa-ink-fixed' : '';
      g.label = this.text(g, o.text, { x: 4, y: 0, valign: 'middle', cls: (o.mono ? 'pa-mono' : 'pa-t-sm') + ink, size });
      g.w = w;
      return g;
    },

    cookie(parent, o = {}) {
      const g = this.g(parent, 'pa-cookie', o.at);
      const art = this.g(g);
      art.setAttribute('filter', 'url(#pa-cut)');
      this.el('path', { d: 'M12.6 -3.4 A13 13 0 1 1 3.4 -12.6 A6.5 6.5 0 0 0 12.6 -3.4 Z', class: 'f-cookie' }, art);
      [[-5, -3, 2.2], [3, 4, 2], [-3, 6, 1.7], [5, -3, 1.5], [-8, 3, 1.4]].forEach(([x, y, r]) =>
        this.el('circle', { cx: x, cy: y, r, class: 'f-choc' }, art));
      return g;
    },

    padlock(parent, o = {}) {
      const g = this.g(parent, 'pa-padlock', o.at);
      const art = this.g(g);
      art.setAttribute('filter', 'url(#pa-cut)');
      g.shackle = this.g(art, null, { y: o.open ? -6 : 0 });
      this.el('path', { d: 'M-7 -3 V-10 A7 7 0 0 1 7 -10 V-3', class: 'pa-shackle' }, g.shackle);
      this.el('rect', { x: -11, y: -4, width: 22, height: 18, rx: 3.5, class: 'f-' + (o.tone || 'mustard') }, art);
      this.el('circle', { cx: 0, cy: 3.5, r: 2.4, class: 'f-ink-fixed' }, art);
      this.el('rect', { x: -1, y: 4, width: 2, height: 5, class: 'f-ink-fixed' }, art);
      return g;
    },

    lock(p, closed = true) {
      return this.to(p.shackle, { y: closed ? 0 : -6 }, { dur: 220, ease: closed ? 'in' : 'out' });
    },

    key(parent, o = {}) {
      const g = this.g(parent, 'pa-key', o.at);
      const art = this.g(g);
      art.setAttribute('filter', 'url(#pa-cut)');
      this.el('path', { d: 'M-6 -1.8 H14 V1.8 H12 V6 H9 V1.8 H6.5 V5 H3.5 V1.8 H-6 Z', class: 'f-' + (o.tone || 'mustard') }, art);
      this.el('circle', { cx: -11, cy: 0, r: 7, class: 'f-' + (o.tone || 'mustard') }, art);
      this.el('circle', { cx: -12, cy: 0, r: 2.6, class: 'pa-key-hole' }, art);
      if (o.label) g.label = this.text(g, o.label, { y: 20, cls: 'pa-t-xs' });
      return g;
    },

    coin(parent, o = {}) {
      const g = this.g(parent, 'pa-coin', o.at);
      const art = this.g(g);
      art.setAttribute('filter', 'url(#pa-cut)');
      this.el('circle', { r: 9, class: 'f-mustard' }, art);
      this.el('circle', { r: 6.3, class: 'pa-coin-rim' }, art);
      this.text(art, '$', { y: 0, valign: 'middle', cls: 'pa-coin-t' });
      return g;
    },

    // A tick or cross in a paper disc: s.mark(parent, true) / s.mark(parent, false).
    mark(parent, ok, o = {}) {
      const g = this.g(parent, 'pa-mark', o.at);
      const art = this.g(g);
      art.setAttribute('filter', 'url(#pa-cut)');
      this.el('circle', { r: o.r || 11, class: ok ? 'f-sage' : 'f-terra' }, art);
      this.el('path', { d: ok ? 'M-5 0.5 L-1.5 4 L5.5 -4' : 'M-4 -4 L4 4 M4 -4 L-4 4', class: 'pa-mark-ink' }, art);
      return g;
    },

    stampMark(parent, o = {}) {
      const g = this.g(parent, 'pa-stamp is-' + (o.tone || 'terra'), o.at);
      const size = o.size || 15;
      const w = o.w || this.measure(o.text, size) + 30, hh = size + 16;
      this.el('rect', { x: -w / 2, y: -hh / 2, width: w, height: hh, rx: 5, class: 'pa-stamp-frame' }, g);
      this.el('rect', { x: -w / 2 + 4, y: -hh / 2 + 4, width: w - 8, height: hh - 8, rx: 3, class: 'pa-stamp-frame is-thin' }, g);
      this.text(g, o.text, { y: 1, valign: 'middle', cls: 'pa-stamp-t', size });
      this.set(g, { o: 0 });
      return g;
    },

    // Speech bubble pointing at (0, 0); the body sits above (or below with o.below).
    bubble(parent, o = {}) {
      const size = o.size || 12.5;
      const lines = String(o.text).split('\n');
      const w = o.w || this.measure(o.text, size, o.mono) + 26;
      const hh = lines.length * size * 1.3 + 16;
      const dx = o.dx || 0, below = !!o.below;
      const y0 = below ? 12 : -12 - hh;
      const g = this.g(parent, 'pa-bubble', o.at);
      const art = this.g(g);
      art.setAttribute('filter', 'url(#pa-cut)');
      const tx = clamp(0 - dx, -w / 2 + 12, w / 2 - 12) + dx;
      this.el('rect', { x: dx - w / 2, y: y0, width: w, height: hh, rx: Math.min(14, hh / 2), class: 'f-' + (o.tone || 'paper') }, art);
      this.el('path', { d: below ? `M${tx - 7} 13 L0 0 L${tx + 7} 13 Z` : `M${tx - 7} -13 L0 0 L${tx + 7} -13 Z`, class: 'f-' + (o.tone || 'paper') }, art);
      g.label = this.text(g, o.text, { x: dx, y: y0 + hh / 2, valign: 'middle', cls: (o.mono ? 'pa-mono' : 'pa-t') + (o.cls ? ' ' + o.cls : ''), size });
      this.set(g, { o: 0 });
      return g;
    },

    sparkle(parent, o = {}) {
      const g = this.g(parent, 'pa-sparkle', o.at);
      this.el('path', { d: 'M0 -8 Q1.2 -1.2 8 0 Q1.2 1.2 0 8 Q-1.2 1.2 -8 0 Q-1.2 -1.2 0 -8 Z', class: 'f-' + (o.tone || 'mustard') }, g);
      return g;
    },

    bug(parent, o = {}) {
      const g = this.g(parent, 'pa-bug', o.at);
      const idle = this.g(g, 'pa-idle-wiggle');
      this.el('path', { d: 'M-6 -6 L-10 -10 M0 -7 L0 -11 M6 -6 L10 -10 M-6 6 L-10 10 M0 7 L0 11 M6 6 L10 10', class: 'pa-bug-legs' }, idle);
      this.el('path', { d: 'M-15 -3 L-19 -8 M-15 3 L-19 8', class: 'pa-bug-legs' }, idle);
      const art = this.g(idle);
      art.setAttribute('filter', 'url(#pa-cut)');
      this.el('circle', { cx: -12, cy: 0, r: 4.5, class: 'f-ink-fixed' }, art);
      this.el('ellipse', { rx: 10, ry: 8, class: 'f-terra' }, art);
      this.el('path', { d: 'M-8 0 H10', class: 'pa-bug-seam' }, art);
      this.el('circle', { cx: 3, cy: -3.5, r: 1.8, class: 'f-ink-fixed' }, art);
      this.el('circle', { cx: 4, cy: 3.5, r: 1.6, class: 'f-ink-fixed' }, art);
      return g;
    },

    // An arrow along any path (straight or curved).
    arrow(parent, d, o = {}) {
      return this.el('path', { d, class: 'pa-arrow' + (o.dashed ? ' is-dashed' : '') + (o.cls ? ' ' + o.cls : ''), 'marker-end': o.head === false ? null : 'url(#pa-arrow)' }, parent);
    },

    // A small data plot on graph paper. Returns scales X(v), Y(v).
    plot(parent, o) {
      const { x, y, w, h: ph } = o;
      const [x0, x1] = o.xr, [y0, y1] = o.yr;
      const g = this.g(parent, 'pa-plot');
      const X = v => x + (v - x0) / (x1 - x0) * w;
      const Y = v => y + ph - (v - y0) / (y1 - y0) * ph;
      const sheet = this.g(g);
      sheet.setAttribute('filter', 'url(#pa-cut)');
      this.el('rect', { x: x - 6, y: y - 6, width: w + 12, height: ph + 12, rx: 4, class: 'f-paper' }, sheet);
      const grid = this.g(g, 'pa-grid');
      (o.xTicks || []).forEach(v => this.el('line', { x1: X(v), y1: y, x2: X(v), y2: y + ph }, grid));
      (o.yTicks || []).forEach(v => this.el('line', { x1: x, y1: Y(v), x2: x + w, y2: Y(v) }, grid));
      this.el('path', { d: `M${x} ${y} V${y + ph} H${x + w}`, class: 'pa-axis' }, g);
      (o.xTicks || []).forEach(v => this.text(g, String(v), { x: X(v), y: y + ph + 16, cls: 'pa-t-xs pa-muted' }));
      (o.yTicks || []).forEach(v => this.text(g, String(v), { x: x - 8, y: Y(v), anchor: 'end', valign: 'middle', cls: 'pa-t-xs pa-muted' }));
      if (o.xLabel) this.text(g, o.xLabel, { x: x + w / 2, y: y + ph + 34, cls: 'pa-t-sm pa-soft' });
      if (o.yLabel) {
        const t = this.text(g, o.yLabel, { x: 0, y: 0, cls: 'pa-t-sm pa-soft' });
        t.setAttribute('transform', `translate(${x - (o.yLabelGap || 38)} ${y + ph / 2}) rotate(-90)`);
      }
      const clip = 'pa-clip-' + (++uid);
      const cp = svg('clipPath', { id: clip }, g);
      svg('rect', { x, y, width: w, height: ph }, cp);
      g.clip = `url(#${clip})`;
      g.X = X; g.Y = Y;
      return g;
    },

    /* ── Diagram kit: still diagrams in the course notation ──
       Symbols keep a clear ink outline (they are the notation) on paper
       fills with a cut shadow. Shapes: process, terminator, decision, io,
       subprogram (flowcharts); entity, circle, store (DFDs); card (free). */
    node(parent, o) {
      const shape = o.shape || 'process';
      let w = o.w || 150, hh = o.h || 44;
      if (shape === 'sf-tape') w = hh = Math.max(w, hh);      // a circle with a tail
      // Each symbol has its own colour, so a reader learns the notation by colour too
      const tone = o.tone || NODE_TONES[shape] || 'paper';
      const g = this.g(parent, 'pa-node is-' + shape, { x: o.x || 0, y: o.y || 0 });
      const art = this.g(g);
      art.setAttribute('filter', 'url(#pa-cut)');
      const cls = 'f-' + tone + (shape === 'card' ? ' pa-card-edge' : ' pa-outline');
      const x0 = -w / 2, y0 = -hh / 2;
      if (shape === 'decision') {
        this.el('path', { d: `M0 ${y0} L${w / 2} 0 L0 ${hh / 2} L${x0} 0 Z`, class: cls }, art);
      } else if (shape === 'io') {
        const k = Math.min(16, hh * .35);
        this.el('path', { d: `M${x0 + k} ${y0} H${w / 2} L${w / 2 - k} ${hh / 2} H${x0} Z`, class: cls }, art);
      } else if (shape === 'circle') {
        this.el('circle', { r: w / 2, class: cls }, art);
      } else if (shape === 'store') {
        this.el('rect', { x: x0, y: y0, width: w, height: hh, class: 'f-' + tone }, art);
        this.el('path', { d: `M${w / 2} ${y0} H${x0} V${hh / 2} H${w / 2}`, class: 'pa-outline-line' }, art);
        if (o.id) {
          this.el('path', { d: `M${x0 + 30} ${y0} V${hh / 2}`, class: 'pa-outline-line' }, art);
          this.text(g, o.id, { x: x0 + 15, y: 0, valign: 'middle', cls: 'pa-node-t pa-strong', size: o.size || 14 });
        }
      } else if (EC_SHAPES[shape]) {
        EC_SHAPES[shape].call(this, art, { x0, y0, x1: w / 2, y1: hh / 2, w, h: hh, cls, tone });
      } else {
        const rx = shape === 'terminator' ? hh / 2 : shape === 'card' ? 10 : 3;
        this.el('rect', { x: x0, y: y0, width: w, height: hh, rx, class: cls }, art);
        if (shape === 'subprogram') this.el('path', { d: `M${x0 + 9} ${y0} V${hh / 2} M${w / 2 - 9} ${y0} V${hh / 2}`, class: 'pa-outline-line' }, art);
      }
      if (o.text != null) {
        const tx = shape === 'store' && o.id ? 15 : 0;
        const ty = EC_LABEL_DY[shape] ? EC_LABEL_DY[shape](w, hh) : 0;
        const ink = o.on || DARK_TONES.includes(tone) ? ' pa-on' : LIGHT_TONES.includes(tone) ? ' pa-ink-fixed' : '';
        g.label = this.text(g, o.text, { x: tx, y: ty, valign: 'middle', cls: 'pa-node-t' + ink + (o.cls ? ' ' + o.cls : ''), size: o.size || 14, lh: 1.25 });
      }
      g.box = { x: o.x || 0, y: o.y || 0, w, h: hh, shape: shape === 'sf-tape' ? 'circle' : shape };
      return g;
    },

    // A point on a node's edge: side is top, bottom, left or right; `off` slides along it.
    port(n, side = 'bottom', off = 0) {
      const { x, y, w, h: hh, shape } = n.box;
      const r = shape === 'circle' ? w / 2 : null;
      if (side === 'top') return [x + off, y - (r || hh / 2)];
      if (side === 'bottom') return [x + off, y + (r || hh / 2)];
      if (side === 'left') return [x - (r || w / 2), y + off];
      return [x + (r || w / 2), y + off];
    },

    // Connector from a to b (nodes or [x, y] points). Right-angle elbows unless
    // `via` points or `curve` (a bend in px, for DFD flows) are given.
    link(parent, a, b, o = {}) {
      const from = o.from || 'bottom', to = o.to || 'top';
      const mid = n => (Array.isArray(n) ? n : [n.box.x, n.box.y]);
      // EC: `straight` joins the two shapes' outlines with one straight (diagonal) line
      const p0 = Array.isArray(a) ? a : o.straight ? this.rim(a, mid(b)) : this.port(a, from, o.fromOff || 0);
      const p1 = Array.isArray(b) ? b : o.straight ? this.rim(b, mid(a)) : this.port(b, to, o.toOff || 0);
      let d, pts = [p0];
      if (o.curve) {
        const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2;
        const len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) || 1;
        const cx = mx - (p1[1] - p0[1]) / len * o.curve, cy = my + (p1[0] - p0[0]) / len * o.curve;
        d = `M${r2(p0[0])} ${r2(p0[1])} Q${r2(cx)} ${r2(cy)} ${r2(p1[0])} ${r2(p1[1])}`;
        pts = [p0, [(p0[0] + 2 * cx + p1[0]) / 4, (p0[1] + 2 * cy + p1[1]) / 4], p1];
      } else {
        if (o.via) pts.push(...o.via);
        else if (o.straight) { /* p0 to p1 direct */ }
        else {
          const v0 = from === 'top' || from === 'bottom', v1 = to === 'top' || to === 'bottom';
          if (v0 && v1 && p0[0] !== p1[0]) { const my = o.mid != null ? o.mid : (p0[1] + p1[1]) / 2; pts.push([p0[0], my], [p1[0], my]); }
          else if (!v0 && !v1 && p0[1] !== p1[1]) { const mx = o.mid != null ? o.mid : (p0[0] + p1[0]) / 2; pts.push([mx, p0[1]], [mx, p1[1]]); }
          else if (v0 && !v1) pts.push([p0[0], p1[1]]);
          else if (!v0 && v1) pts.push([p1[0], p0[1]]);
        }
        pts.push(p1);
        d = 'M' + pts.map(p => `${r2(p[0])} ${r2(p[1])}`).join(' L');
      }
      const path = this.el('path', { d, class: 'pa-link' + (o.dashed ? ' is-dashed' : '') + (o.cls ? ' ' + o.cls : ''), 'marker-end': o.head === false ? null : `url(#${o.marker || 'pa-arrow'})`, 'marker-start': o.both ? 'url(#pa-arrow)' : null }, parent);
      if (o.label) {
        let lx, ly;
        if (o.labelAt) [lx, ly] = o.labelAt;
        else if (o.labelNear === 'start') {
          const [q0, q1] = [pts[0], pts[1]], len = Math.hypot(q1[0] - q0[0], q1[1] - q0[1]) || 1, t = Math.min(1, 22 / len);
          lx = q0[0] + (q1[0] - q0[0]) * t; ly = q0[1] + (q1[1] - q0[1]) * t;
        } else {
          let best = 0;
          for (let i = 0; i < pts.length - 1; i++) {
            const len = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
            if (len >= best) { best = len; lx = (pts[i][0] + pts[i + 1][0]) / 2; ly = (pts[i][1] + pts[i + 1][1]) / 2; }
          }
        }
        this.chip(parent, o.label, lx + (o.dx || 0), ly + (o.dy || 0), { cls: o.labelCls, size: o.labelSize });
      }
      return path;
    },

    // A small paper label sitting on a line.
    chip(parent, text, x, y, o = {}) {
      const size = o.size || 12.5, lines = String(text).split('\n');
      const w = this.measure(text, size) + 14, hh = lines.length * size * 1.25 + 8;
      const g = this.g(parent, 'pa-chip', { x, y });
      this.el('rect', { x: -w / 2, y: -hh / 2, width: w, height: hh, rx: Math.min(8, hh / 2), class: 'pa-chip-bg' }, g);
      this.text(g, text, { y: 0, valign: 'middle', cls: 'pa-chip-t' + (o.cls ? ' ' + o.cls : ''), size, lh: 1.25 });
      return g;
    },

    // A sequence diagram: actors across the top, numbered messages down the page.
    // steps: { from, to, text, reply } · { note, over: [a, b] } · { section } (alt / else)
    sequence(parent, o) {
      const ids = o.actors.map(a => a.id);
      const col = o.w / ids.length, X = id => o.x + col * (ids.indexOf(id) + .5);
      const top = o.y, cardH = o.cardH || 46, row = o.row || 46;
      const life = this.g(parent), lines = this.g(parent), cards = this.g(parent), marks = this.g(parent);
      let y = top + cardH + 30, n = 0;
      o.steps.forEach(st => {
        if (st.section) {
          this.el('path', { d: `M${o.x} ${y - 8} H${o.x + o.w}`, class: 'pa-section-line' }, marks);
          this.chip(marks, st.section, o.x + this.measure(st.section, 12) / 2 + 12, y - 8, { cls: 'pa-strong' });
          y += 26;
          return;
        }
        if (st.note) {
          const ends = st.over.map(X), a = Math.min(...ends), b = Math.max(...ends);
          const nw = Math.max(this.measure(st.note, 12.5) + 28, b - a + 40);
          const cx = clamp((a + b) / 2, o.x + nw / 2 + 2, o.x + o.w - nw / 2 - 2);
          this.node(marks, { x: cx, y: y + 6, w: nw, h: 20 + 15.6 * String(st.note).split('\n').length, shape: 'card', tone: 'mustard-t', text: st.note, size: 12.5 });
          y += row + 4 + (String(st.note).split('\n').length - 1) * 14;
          return;
        }
        n++;
        const xa = X(st.from), xb = X(st.to);
        const tl = String(st.text).split('\n').length;
        if (st.from === st.to) {
          y += (tl - 1) * 15;
          this.el('path', { d: `M${xa} ${y - 8} H${xa + 30} V${y + 12} H${xa + 4}`, class: 'pa-link' + (st.reply ? ' is-dashed' : ''), 'marker-end': 'url(#pa-arrow)' }, lines);
          this.text(marks, st.text, { x: xa + 38, y: y - 3 - (tl - 1) * 15, anchor: 'start', valign: 'middle', cls: 'pa-seq-t', size: 12.5, lh: 1.2 });
          this.numberDot(marks, xa, y - 8, n);
          y += row + 4;
          return;
        }
        y += (tl - 1) * 15;
        this.el('path', { d: `M${xa} ${y} H${xb + (xb > xa ? -3 : 3)}`, class: 'pa-link' + (st.reply ? ' is-dashed' : ''), 'marker-end': 'url(#pa-arrow)' }, lines);
        this.text(marks, st.text, { x: (xa + xb) / 2, y: y - 9 - (tl - 1) * 15, cls: 'pa-seq-t', size: 12.5, lh: 1.2 });
        this.numberDot(marks, xa, y, n);
        y += row;
      });
      const bottom = y - row / 2 + 10;
      o.actors.forEach(a => {
        const x = X(a.id);
        this.el('path', { d: `M${x} ${top + cardH} V${bottom}`, class: 'pa-lifeline' }, life);
        this.node(cards, { x, y: top + cardH / 2, w: Math.min(col - 10, o.cardW || 132), h: cardH, shape: 'card', tone: a.tone || 'sheet', text: a.label, size: 13, cls: 'pa-strong' + (a.on ? ' pa-on' : '') });
      });
      return bottom;
    },

    // A Gantt chart. sections: [{ name, rows: [{ id, label, start, dur, tone, milestone, after }] }]
    // Times are in days; `after` draws a dependency arrow from that row's end.
    gantt(parent, o) {
      const { x, y, w, days } = o, lw = o.labelW || 180, rh = o.rowH || 30, cw = w - lw;
      const X = d => x + lw + d / days * cw;
      const g = this.g(parent, 'pa-gantt');
      const rows = [];
      let cy = y + 30;
      o.sections.forEach(sec => {
        this.el('rect', { x, y: cy, width: w, height: sec.rows.length * rh + 26, rx: 6, class: 'pa-gantt-band' }, g);
        this.text(g, sec.name, { x: x + 10, y: cy + 15, anchor: 'start', cls: 'pa-group-t', size: 13 });
        cy += 26;
        sec.rows.forEach(r => { rows.push(Object.assign({ y: cy + rh / 2 }, r)); cy += rh; });
      });
      const bottom = cy;
      const tick = o.tick || 7;
      for (let d = 0; d <= days; d += tick) {
        this.el('line', { x1: X(d), y1: y + 20, x2: X(d), y2: bottom, class: 'pa-week' }, g);
        this.text(g, o.tickLabel ? o.tickLabel(d) : String(d), { x: X(d), y: y + 12, cls: 'pa-t-xs pa-muted' });
      }
      const byId = {};
      const bars = this.g(g);
      rows.forEach(r => {
        byId[r.id] = r;
        this.text(g, r.label, { x: x + lw - 10, y: r.y, anchor: 'end', valign: 'middle', cls: 'pa-t-sm' + (r.strong ? ' pa-strong' : '') });
        if (r.milestone) {
          const mx = X(r.start);
          const m = this.g(bars, null, { x: mx, y: r.y });
          m.setAttribute('filter', 'url(#pa-cut)');
          this.el('path', { d: 'M0 -9 L9 0 L0 9 L-9 0 Z', class: 'f-' + (r.tone || 'terra') + ' pa-outline' }, m);
        } else {
          const b = this.g(bars);
          b.setAttribute('filter', 'url(#pa-cut)');
          this.el('rect', { x: X(r.start), y: r.y - rh * .32, width: X(r.start + r.dur) - X(r.start), height: rh * .64, rx: 4, class: 'f-' + (r.tone || 'teal') }, b);
          if (r.tag) this.text(g, r.tag, { x: X(r.start) + 6, y: r.y, anchor: 'start', valign: 'middle', cls: 'pa-t-xs pa-strong ' + (['teal', 'terra', 'sage', 'plum'].includes(r.tone || 'teal') ? 'pa-on' : 'pa-ink-fixed') });
        }
      });
      rows.forEach(r => {
        if (!r.after) return;
        const p = byId[r.after], sx = X(p.start + (p.dur || 0)), ex = X(r.start);
        this.el('path', { d: `M${sx} ${p.y} H${Math.max(sx + 6, ex - 8)} V${r.y + (r.y > p.y ? -rh * .34 : rh * .34)}`, class: 'pa-dep', 'marker-end': 'url(#pa-arrow)' }, g);
      });
      g.X = X; g.bottom = bottom;
      return g;
    },

    // A UML class: name, then attributes, then methods. Returns a node, so port() and link() work.
    classBox(parent, o) {
      const w = o.w || 200, size = o.size || 13, lh = size * 1.35;
      const attrs = o.attrs || [], methods = o.methods || [];
      const hName = 34, hA = Math.max(1, attrs.length) * lh + 12, hM = Math.max(1, methods.length) * lh + 12;
      const hh = hName + hA + hM;
      const g = this.g(parent, 'pa-class', { x: o.x, y: o.y });
      const art = this.g(g);
      art.setAttribute('filter', 'url(#pa-cut)');
      this.el('rect', { x: -w / 2, y: -hh / 2, width: w, height: hh, rx: 3, class: 'f-paper pa-outline' }, art);
      this.el('rect', { x: -w / 2, y: -hh / 2, width: w, height: hName, rx: 3, class: 'f-' + (o.tone || 'teal-t') + ' pa-outline' }, art);
      this.el('path', { d: `M${-w / 2} ${-hh / 2 + hName + hA} H${w / 2}`, class: 'pa-outline-line' }, art);
      this.text(g, o.name, { y: -hh / 2 + hName / 2, valign: 'middle', cls: 'pa-node-t pa-strong', size: 14.5 });
      const list = (items, y0) => items.forEach((t, i) => this.text(g, t, { x: -w / 2 + 10, y: y0 + 6 + lh * (i + .5), anchor: 'start', valign: 'middle', cls: 'pa-mono', size: size - 1 }));
      list(attrs, -hh / 2 + hName);
      list(methods, -hh / 2 + hName + hA);
      g.box = { x: o.x, y: o.y, w, h: hh, shape: 'process' };
      return g;
    },

    numberDot(parent, x, y, n) {
      const g = this.g(parent, 'pa-num', { x, y });
      this.el('circle', { r: 9, class: 'f-terra' }, g);
      this.text(g, String(n), { y: 0, valign: 'middle', cls: 'pa-num-t', size: 10.5 });
      return g;
    }
  });

  /* ── EC extensions: Enterprise Computing notation ─────────────
     Symbols and helpers for the diagrams in the NESA Enterprise
     Computing Course Specifications. Same conventions as the kit above:
     shapes are centred on (x, y) unless stated; panels are top left.

       System flowcharts (p.7)  node shapes sf-document, sf-storage,
                                sf-display, sf-manual, sf-input, sf-tape,
                                sf-cloud, sf-telecom (symbol only);
                                s.telecomLink(parent, a, b)
       Outlines                 s.rim(node, [x, y])   link(..., { straight, both })
       Graph theory (p.11)      s.graph(parent, { nodes, edges })
       Storyboards (p.9)        s.screen(parent, ...) · s.storyboard(parent, ...)
       Schemas (p.16)           s.tableBox(parent, ...) · s.relation(parent, a, b)
       Network diagrams (p.10)  s.device(parent, { type, label, x, y })
       Gantt charts (p.12)      s.ganttTable(parent, ...)
     ─────────────────────────────────────────────────────────── */

  const storageRy = (w, h) => Math.min(16, h * .17);
  const EC_LABEL_DY = {
    'sf-storage': (w, h) => storageRy(w, h) * .7,
    'sf-document': (w, h) => -h * .05,
    'sf-cloud': (w, h) => h * .07
  };
  const EC_SHAPES = {
    // Paper document: a rectangle with a wavy bottom edge
    'sf-document'(art, d) {
      const P = (u, v) => `${r2(d.x0 + u * d.w)} ${r2(d.y0 + v * d.h)}`;
      this.el('path', { d: `M${P(0, 0)} H${r2(d.x1)} V${r2(d.y0 + .81 * d.h)} C${P(.9, .81)} ${P(.8, .79)} ${P(.66, .84)} C${P(.5, .89)} ${P(.42, 1)} ${P(.27, 1)} C${P(.17, 1)} ${P(.1, .99)} ${P(0, .92)} Z`, class: d.cls }, art);
    },
    // Direct access storage: a cylinder (full ellipse on top, curved base)
    'sf-storage'(art, d) {
      const ry = r2(storageRy(d.w, d.h)), rx = d.w / 2;
      this.el('path', { d: `M${d.x0} ${r2(d.y0 + ry)} A${rx} ${ry} 0 0 1 ${d.x1} ${r2(d.y0 + ry)} V${r2(d.y1 - ry)} A${rx} ${ry} 0 0 1 ${d.x0} ${r2(d.y1 - ry)} Z`, class: d.cls }, art);
      this.el('ellipse', { cx: 0, cy: r2(d.y0 + ry), rx, ry, class: d.cls }, art);
    },
    // Online display: pointed on the left, curved on the right
    'sf-display'(art, d) {
      const k = d.w * .2, c = d.w * .17;
      this.el('path', { d: `M${d.x0} 0 L${r2(d.x0 + k)} ${d.y0} H${r2(d.x1 - c)} A${r2(c)} ${r2(d.h / 2)} 0 0 1 ${r2(d.x1 - c)} ${d.y1} H${r2(d.x0 + k)} Z`, class: d.cls }, art);
    },
    // Manual operation: an inverted trapezium
    'sf-manual'(art, d) {
      this.el('path', { d: `M${d.x0} ${d.y0} H${d.x1} L${r2(d.x1 - d.w * .2)} ${d.y1} H${r2(d.x0 + d.w * .2)} Z`, class: d.cls }, art);
    },
    // Online input: square left, right and bottom edges; the top edge slopes up to the right
    'sf-input'(art, d) {
      this.el('path', { d: `M${d.x0} ${r2(d.y0 + d.h * .18)} L${d.x1} ${d.y0} V${d.y1} H${d.x0} Z`, class: d.cls }, art);
    },
    // Magnetic tape: a circle whose lower right is squared off into a small tail
    'sf-tape'(art, d) {
      const r = d.w / 2, ty = r2(r * .65), tx = r2(Math.sqrt(1 - .65 * .65) * r);
      this.el('path', { d: `M0 ${r} H${r} V${ty} L${tx} ${ty} A${r} ${r} 0 1 0 0 ${r} Z`, class: d.cls }, art);
    },
    // Cloud: three rounded humps on a flat base
    'sf-cloud'(art, d) {
      const P = (u, v) => `${r2(d.x0 + u * d.w)} ${r2(d.y0 + v * d.h)}`;
      this.el('path', { d: `M${P(.2, 1)} H${r2(d.x0 + d.w * .78)} C${P(.92, 1)} ${P(1, .88)} ${P(1, .72)} C${P(1, .58)} ${P(.92, .48)} ${P(.8, .46)} C${P(.78, .2)} ${P(.62, 0)} ${P(.46, 0)} C${P(.3, 0)} ${P(.2, .15)} ${P(.19, .32)} C${P(.06, .34)} ${P(0, .5)} ${P(0, .68)} C${P(0, .86)} ${P(.08, 1)} ${P(.2, 1)} Z`, class: d.cls }, art);
    },
    // Telecommunications link (the symbol alone): a Z made of three straight strokes
    'sf-telecom'(art, d) {
      this.el('path', { d: `M${d.x1} ${d.y0} H${r2(d.x0 + d.w * .3)} L${r2(d.x0 + d.w * .78)} ${d.y1} H${d.x0}`, class: 'pa-outline-line' }, art);
    }
  };
  Object.assign(KIT, {
    // Where a straight line from the centre of node n towards [x, y] crosses n's outline.
    rim(n, to) {
      const { x, y, w, h: hh, shape } = n.box, dx = to[0] - x, dy = to[1] - y;
      if (!dx && !dy) return [x, y];
      if (shape === 'circle') { const d = Math.hypot(dx, dy); return [x + dx / d * w / 2, y + dy / d * w / 2]; }
      if (shape === 'decision') { const k = 1 / (Math.abs(dx) / (w / 2) + Math.abs(dy) / (hh / 2)); return [x + dx * k, y + dy * k]; }
      const k = Math.min((w / 2) / Math.abs(dx || 1e-9), (hh / 2) / Math.abs(dy || 1e-9));
      return [x + dx * k, y + dy * k];
    },

    // Telecommunications link: a line with the zig-zag "lightning" break, ending in an arrow.
    // a and b are nodes or [x, y] points. `amp` is the height of the zig-zag in px.
    telecomLink(parent, a, b, o = {}) {
      const mid = n => (Array.isArray(n) ? n : [n.box.x, n.box.y]);
      const p0 = Array.isArray(a) ? a : this.rim(a, mid(b)), p1 = Array.isArray(b) ? b : this.rim(b, mid(a));
      const L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) || 1, u = [(p1[0] - p0[0]) / L, (p1[1] - p0[1]) / L], n = [-u[1], u[0]];
      const amp = o.amp || 16, at = (t, k) => [p0[0] + u[0] * L * t + n[0] * k, p0[1] + u[1] * L * t + n[1] * k];
      const pts = [p0, at(.44, amp * .15), at(.16, -amp), p1];
      const d = 'M' + pts.map(p => `${r2(p[0])} ${r2(p[1])}`).join(' L');
      const path = this.el('path', { d, class: 'pa-link is-telecom' + (o.cls ? ' ' + o.cls : ''), 'marker-end': o.head === false ? null : 'url(#pa-arrow)' }, parent);
      if (o.label) { const q = at(.3, -amp - 16); this.chip(parent, o.label, q[0] + (o.dx || 0), q[1] + (o.dy || 0), { size: o.labelSize }); }
      return path;
    },

    /* ── Graph and network theory (NESA p.11) ──────────────────
       nodes: [{ id, x, y, r, label, tone, size }]  circles: r shows importance or dataset size
       edges: [{ a, b, label, weight, directed, curve, dashed, tone }]
       Undirected edges are plain lines; `directed` (or o.directed) adds an arrowhead at b.
       `weight` prints a number on the edge; `label` prints a word (NESA labels the relationship).
       Returns { nodes: {id: node}, edges: [path] }. */
    graph(parent, o) {
      const g = this.g(parent, 'pa-graph');
      const lines = this.g(g), labels = this.g(g), dots = this.g(g);
      const nodes = {};
      (o.nodes || []).forEach(n => {
        const r = n.r || 16;
        nodes[n.id] = this.node(dots, { x: n.x, y: n.y, w: r * 2, h: r * 2, shape: 'circle', text: n.label, tone: n.tone, size: n.size || (r >= 34 ? 15 : 13), cls: n.cls });
      });
      const edges = [];
      (o.edges || []).forEach(e => {
        const A = nodes[e.a], B = nodes[e.b];
        const ca = [A.box.x, A.box.y], cb = [B.box.x, B.box.y];
        let d, mid;
        if (e.curve) {
          const mx = (ca[0] + cb[0]) / 2, my = (ca[1] + cb[1]) / 2, len = Math.hypot(cb[0] - ca[0], cb[1] - ca[1]) || 1;
          const c = [mx - (cb[1] - ca[1]) / len * e.curve, my + (cb[0] - ca[0]) / len * e.curve];
          const p0 = this.rim(A, c), p1 = this.rim(B, c);
          d = `M${r2(p0[0])} ${r2(p0[1])} Q${r2(c[0])} ${r2(c[1])} ${r2(p1[0])} ${r2(p1[1])}`;
          mid = [(p0[0] + 2 * c[0] + p1[0]) / 4, (p0[1] + 2 * c[1] + p1[1]) / 4];
        } else {
          const p0 = this.rim(A, cb), p1 = this.rim(B, ca);
          d = `M${r2(p0[0])} ${r2(p0[1])} L${r2(p1[0])} ${r2(p1[1])}`;
          mid = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
        }
        const directed = e.directed != null ? e.directed : !!o.directed;
        edges.push(this.el('path', { d, class: 'pa-link pa-edge' + (e.dashed ? ' is-dashed' : '') + (e.cls ? ' ' + e.cls : ''), 'marker-end': directed ? 'url(#pa-arrow)' : null }, lines));
        const txt = e.weight != null ? String(e.weight) : e.label;
        if (txt != null && txt !== '') {
          const size = e.weight != null ? 13.5 : 13, w = this.measure(txt, size) + 8;
          const lg = this.g(labels, null, { x: mid[0] + (e.dx || 0), y: mid[1] + (e.dy || 0) });
          this.el('rect', { x: -w / 2, y: -size * .75, width: w, height: size * 1.5, class: 'pa-edge-bg' }, lg);
          this.text(lg, txt, { y: 0, valign: 'middle', cls: e.weight != null ? 'pa-t pa-strong' : 'pa-t', size });
        }
      });
      g.nodes = nodes; g.edges = edges;
      return g;
    },

    /* ── Storyboards (NESA p.9) ────────────────────────────────
       A screen is drawn top left at (x, y). nav: [{ label, active, dot: 'left'|'right', bold }]
       body: [{ heading }, { lines: n }, { boxes: [{ lines: n } | { image: 'text' }] }, { table: [rows, cols] }]
       `n` and `caption` add a numbered caption above the frame's top left corner (allow 26px above y).
       s.screen returns a node-like group: .box (for port/rim) and .btn[label] = the button's dot. */
    screen(parent, o) {
      const x = o.x || 0, y = o.y || 0, w = o.w || 260, h = o.h || 210;
      const nav = o.nav || [], navW = o.navW || 78, bh = 26, gap = 8, top = 42;
      const g = this.g(parent, 'pa-screen', { x, y });
      const art = this.g(g);
      art.setAttribute('filter', 'url(#pa-cut)');
      this.el('rect', { width: w, height: h, class: 'f-paper pa-outline' }, art);
      this.text(g, o.title, { x: w / 2, y: 20, cls: 'pa-node-t pa-strong', size: 14 });
      if (o.help !== false) {
        const hx = w - 62;
        this.el('rect', { x: hx, y: 9, width: 54, height: 22, rx: 11, class: 'f-paper pa-outline-thin' }, g);
        this.text(g, 'Help', { x: hx + 20, y: 20, valign: 'middle', cls: 'pa-t', size: 13 });
        this.el('circle', { cx: hx + 42, cy: 20, r: 7, class: 'pa-outline-thin f-paper' }, g);
        this.el('path', { d: `M${hx + 39.8} 18.2 a2.3 2.3 0 1 1 3.6 1.9 c-.9 .6 -1.4 1 -1.4 2 M${hx + 42} 24.6 v.1`, class: 'pa-glyph' }, g);
      }
      g.btn = {};
      nav.forEach((b, i) => {
        const last = b.bold || b.label === 'Exit';
        const by = last ? h - 12 - bh : top + i * (bh + gap);
        this.el('rect', { x: 10, y: by, width: navW, height: bh, rx: 9, class: (b.active ? 'f-sky' : 'f-paper') + ' pa-outline-thin' }, g);
        this.text(g, b.label, { x: 10 + navW / 2, y: by + bh / 2, valign: 'middle', cls: 'pa-t' + (last ? ' pa-strong' : '') + (b.active ? ' pa-ink-fixed' : ''), size: 13 });
        if (b.dot) {
          const dx = b.dot === 'left' ? 10 : 10 + navW;
          this.el('circle', { cx: dx, cy: by + bh / 2, r: 3.6, class: 'f-ink' }, g);
          g.btn[b.label] = [x + dx, y + by + bh / 2];
        }
      });
      const cx = navW + 22, cw = w - cx - 10, ch = h - top - 10;
      this.el('rect', { x: cx, y: top, width: cw, height: ch, rx: 9, class: 'f-paper pa-outline-thin' }, g);
      let by = top + 10;
      const dots = (n, x0, x1, y0) => { for (let i = 0; i < n; i++) this.el('path', { d: `M${x0} ${y0 + i * 12} H${x1}`, class: 'pa-dots' }, g); return n * 12; };
      (o.body || []).forEach(b => {
        if (b.heading) { this.text(g, b.heading, { x: cx + 10, y: by + 8, anchor: 'start', valign: 'middle', cls: 'pa-t', size: 13.5 }); by += 24; }
        if (b.lines) by += dots(b.lines, cx + 10, cx + cw - 10, by + 6) + 6;
        if (b.boxes) {
          const n = b.boxes.length, bw = (cw - 20 - (n - 1) * 8) / n, bhh = b.h || 62;
          b.boxes.forEach((bx, i) => {
            const px = cx + 10 + i * (bw + 8);
            this.el('rect', { x: px, y: by, width: bw, height: bhh, rx: 7, class: 'f-paper pa-outline-thin' }, g);
            if (bx.image) this.text(g, bx.image, { x: px + bw / 2, y: by + bhh / 2, valign: 'middle', cls: 'pa-t pa-soft', size: 13, lh: 1.2 });
            else dots(bx.lines || 3, px + 8, px + bw - 8, by + 12);
          });
          by += bhh + 8;
        }
        if (b.table) {
          const [rows, cols] = b.table, tw = cw - 20, rh = b.rowH || 40, cw2 = tw / cols;
          this.el('rect', { x: cx + 10, y: by, width: tw, height: rows * rh, class: 'f-paper pa-outline-thin' }, g);
          for (let r = 1; r < rows; r++) this.el('path', { d: `M${cx + 10} ${by + r * rh} H${cx + 10 + tw}`, class: 'pa-outline-thin' }, g);
          for (let c = 1; c < cols; c++) this.el('path', { d: `M${cx + 10 + c * cw2} ${by} V${by + rows * rh}`, class: 'pa-outline-thin' }, g);
          for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) dots(2, cx + 16 + c * cw2, cx + 4 + (c + 1) * cw2, by + r * rh + 14);
          by += rows * rh + 6;
        }
      });
      if (o.n != null) {
        const nd = this.g(g, 'pa-num', { x: 0, y: -13 });
        this.el('circle', { r: 11, class: 'f-terra' }, nd);
        this.text(nd, String(o.n), { y: 0, valign: 'middle', cls: 'pa-num-t', size: 13 });
      }
      if (o.caption) this.text(g, o.caption, { x: o.n != null ? 16 : 0, y: -13, anchor: 'start', valign: 'middle', cls: 'pa-t pa-strong', size: 13 });
      g.box = { x: x + w / 2, y: y + h / 2, w, h, shape: 'process' };
      return g;
    },

    // A set of screens with navigation arrows.
    // screens: [{ id, x, y, w, h, title, nav, body, n, caption }]
    // links: [{ from: 'home.Prices', to: 'prices' | 'prices.Home' | [x, y], bend, both, label }]
    storyboard(parent, o) {
      const g = this.g(parent, 'pa-storyboard');
      const screens = {};
      o.screens.forEach(sc => { screens[sc.id] = this.screen(g, sc); });
      const arrows = this.g(g, 'pa-story-links');
      (o.links || []).forEach(l => {
        const [sid, btn] = l.from.split('.');
        const p0 = screens[sid].btn[btn];
        if (!p0) return;
        let p1;
        if (Array.isArray(l.to)) p1 = l.to;
        else {
          const [tid, tb] = l.to.split('.');
          p1 = tb && screens[tid].btn[tb] ? screens[tid].btn[tb] : this.rim(screens[tid], p0);
        }
        this.link(arrows, p0, p1, { curve: l.bend == null ? 34 : l.bend, both: l.both, label: l.label, labelAt: l.labelAt, cls: 'pa-nav' });
      });
      g.screens = screens;
      return g;
    },

    /* ── Schemas (NESA p.16) ───────────────────────────────────
       A table is a rectangle with a bold name in a header box, then one field per line.
       fields: ['Name', { name: 'ID', key: 'P' }, { name: 'Publisher_ID', key: 'F' }]  (P = primary, F = foreign, 'PF' = both)
       o.keys: 'nesa' (default) writes (P) and (F) after the name; 'pk' writes PK and FK badges instead.
       Drawn top left at (x, y). t.rows[name] gives the row's y and its left and right edge points. */
    tableBox(parent, o) {
      const size = o.size || 15, rh = o.rowH || 26, hh0 = o.headH || 32, w = o.w || 200, x = o.x || 0, y = o.y || 0;
      const fields = o.fields.map(f => (typeof f === 'string' ? { name: f } : f));
      const h = hh0 + fields.length * rh + 8;
      const g = this.g(parent, 'pa-table', { x, y });
      const art = this.g(g);
      art.setAttribute('filter', 'url(#pa-cut)');
      this.el('rect', { width: w, height: h, class: 'f-paper pa-outline' }, art);
      this.el('rect', { width: w, height: hh0, class: 'f-' + (o.tone || 'sheet') + ' pa-outline' }, art);
      this.text(g, o.name, { x: 10, y: hh0 / 2, anchor: 'start', valign: 'middle', cls: 'pa-node-t pa-strong', size: size + .5 });
      g.rows = {};
      fields.forEach((f, i) => {
        const cy = hh0 + 4 + rh * (i + .5);
        const nesa = (o.keys || 'nesa') === 'nesa';
        const mark = f.key ? (f.key === 'PF' ? 'P, F' : f.key) : '';
        this.text(g, f.name + (nesa && mark ? ` (${mark})` : ''), { x: 10, y: cy, anchor: 'start', valign: 'middle', cls: 'pa-node-t' + (f.key && f.key.includes('P') && !nesa ? ' pa-strong' : ''), size });
        if (mark && !nesa) {
          const badge = mark.replace('P', 'PK').replace('F', 'FK');
          const bw = this.measure(badge, 13, true) + 12;
          this.el('rect', { x: w - bw - 8, y: cy - 10, width: bw, height: 20, rx: 4, class: f.key.includes('P') ? 'f-mustard-t pa-outline-thin' : 'f-sky-t pa-outline-thin' }, g);
          this.text(g, badge, { x: w - bw / 2 - 8, y: cy + .5, valign: 'middle', cls: 'pa-mono pa-strong', size: 13 });
        }
        g.rows[f.name] = { y: y + cy, left: [x, y + cy], right: [x + w, y + cy] };
      });
      g.box = { x: x + w / 2, y: y + h / 2, w, h, shape: 'process' };
      return g;
    },

    // A relationship between two fields. a and b: { t: table, f: 'field', side: 'left' | 'right' }.
    // `one` says which end is the "one" side ('a' or 'b'); the other end is "many":
    // `many` is '∞' (NESA) or 'crow' (crow's foot).
    relation(parent, a, b, o = {}) {
      const ra = a.t.rows[a.f], rb = b.t.rows[b.f];
      const p0 = a.side === 'left' ? ra.left : ra.right, p1 = b.side === 'left' ? rb.left : rb.right;
      const mid = o.mid != null ? o.mid : (p0[0] + p1[0]) / 2;
      const pts = [p0, [mid, p0[1]], [mid, p1[1]], p1];
      const g = this.g(parent, 'pa-relation');
      this.el('path', { d: 'M' + pts.map(p => `${r2(p[0])} ${r2(p[1])}`).join(' L'), class: 'pa-link', 'marker-end': null }, g);
      const oneEnd = (o.one || 'a') === 'a' ? [p0, a.side] : [p1, b.side], manyEnd = (o.one || 'a') === 'a' ? [p1, b.side] : [p0, a.side];
      const dir = side => (side === 'left' ? -1 : 1);
      this.text(g, '1', { x: oneEnd[0][0] + dir(oneEnd[1]) * 10, y: oneEnd[0][1] - 11, cls: 'pa-node-t', size: 14 });
      const [mp, ms] = manyEnd;
      if ((o.many || '∞') === 'crow') {
        const d = dir(ms), fx = mp[0] + d * 15;
        this.el('path', { d: `M${fx} ${mp[1]} L${mp[0]} ${mp[1] - 7} M${fx} ${mp[1]} L${mp[0]} ${mp[1]} M${fx} ${mp[1]} L${mp[0]} ${mp[1] + 7}`, class: 'pa-outline-line' }, g);
      } else {
        this.text(g, '∞', { x: mp[0] + dir(ms) * 12, y: mp[1] - 10, cls: 'pa-node-t', size: 17 });
      }
      return g;
    },

    /* ── Network diagram devices (NESA p.10) ───────────────────
       Line-art icons with a label underneath, centred on (x, y).
       type: internet, router, hub, switch, server, computer, laptop, tablet, phone, wireless, printer.
       Join them with s.link(..., { via: [...], head: false, cls: 'is-net' }). */
    device(parent, o) {
      const g = this.g(parent, 'pa-device', { x: o.x || 0, y: o.y || 0 });
      const ln = (d, cls) => this.el('path', { d, class: cls || 'pa-dev is-line' }, g);
      const fill = (el) => { el.setAttribute('class', 'pa-dev f-paper'); return el; };
      const dotsRow = (n, x0, dx, y) => { for (let i = 0; i < n; i++) this.el('circle', { cx: x0 + i * dx, cy: y, r: 1.7, class: 'f-ink' }, g); };
      switch (o.type) {
        case 'internet':
          ln('M-22 -4 Q0 -24 22 -4'); ln('M-15 3 Q0 -10 15 3'); ln('M-8 10 Q0 3 8 10');
          this.el('circle', { cx: 0, cy: 15, r: 2.2, class: 'f-ink' }, g);
          break;
        case 'router':
          ln('M-14 -3 L-19 -17 M14 -3 L19 -17');
          fill(this.el('rect', { x: -26, y: -3, width: 52, height: 20, rx: 4 }, g)); dotsRow(3, -9, 9, 7);
          break;
        case 'hub': case 'switch': {
          fill(this.el('rect', { x: -27, y: -8, width: 54, height: 18, rx: 4 }, g));
          if (o.type === 'hub') dotsRow(4, -10.5, 7, 1); else dotsRow(6, -14, 5.6, 1);
          break;
        }
        case 'server':
          [-16, -3, 10].forEach(y => { fill(this.el('rect', { x: -19, y, width: 38, height: 11, rx: 2.5 }, g)); this.el('circle', { cx: -12, cy: y + 5.5, r: 1.7, class: 'f-ink' }, g); });
          break;
        case 'computer':
          fill(this.el('rect', { x: -19, y: -20, width: 38, height: 26, rx: 2.5 }, g));
          this.el('rect', { x: -15, y: -16, width: 30, height: 18, rx: 1.5, class: 'pa-dev f-sky-t' }, g);
          ln('M-4 6 V11 M4 6 V11'); ln('M-13 11 H13 L17 17 H-17 Z');
          break;
        case 'laptop':
          fill(this.el('rect', { x: -17, y: -19, width: 34, height: 23, rx: 2.5 }, g));
          this.el('rect', { x: -13, y: -15, width: 26, height: 15, rx: 1.5, class: 'pa-dev f-sky-t' }, g);
          fill(this.el('path', { d: 'M-24 4 H24 L21 11 H-21 Z' }, g));
          break;
        case 'tablet':
          fill(this.el('rect', { x: -15, y: -21, width: 30, height: 42, rx: 4 }, g));
          this.el('rect', { x: -11.5, y: -16, width: 23, height: 30, rx: 1, class: 'pa-dev f-sky-t' }, g);
          this.el('circle', { cx: 0, cy: 17.5, r: 1.8, class: 'pa-dev f-paper' }, g);
          break;
        case 'phone':
          fill(this.el('rect', { x: -10, y: -21, width: 20, height: 42, rx: 4 }, g));
          this.el('rect', { x: -7, y: -15, width: 14, height: 28, rx: 1, class: 'pa-dev f-sky-t' }, g);
          ln('M-3 -18 H3'); this.el('circle', { cx: 0, cy: 17.5, r: 1.5, class: 'pa-dev f-paper' }, g);
          break;
        case 'wireless':      // the Bluetooth rune
          this.el('path', { d: 'M-8 -10 L9 5 L0 13 V-13 L9 -5 L-8 10', class: 'pa-dev is-line is-bold' }, g);
          break;
        case 'printer':
          fill(this.el('rect', { x: -18, y: -6, width: 36, height: 17, rx: 3 }, g));
          fill(this.el('rect', { x: -11, y: -18, width: 22, height: 12 }, g));
          fill(this.el('rect', { x: -11, y: 6, width: 22, height: 10 }, g));
          break;
        default: fill(this.el('rect', { x: -20, y: -16, width: 40, height: 32, rx: 4 }, g));
      }
      if (o.label) g.label = this.text(g, o.label, { y: 36, cls: 'pa-t', size: 13, lh: 1.15 });
      g.box = { x: o.x || 0, y: o.y || 0, w: o.w || 60, h: o.h || 46, shape: 'process' };
      return g;
    },

    /* ── Gantt charts as NESA draws them (p.12) ────────────────
       A table on the left (ID, task name, planned start) and a dated timeline on the right.
       cols: [{ key: 'id' | 'label' | 'date', label, w, align }]   left columns
       days, dayW: number and width of the timeline's day columns
       head: header rows over the timeline: [[{ label, span }], [{ label }, ...]]
       shade: day columns to shade (weekends)
       rows: [{ id, label, date, start, dur, tone, pct, text, who, summary, indent, milestone, mdate, after }]
             `pct` shades that share of the bar in the solid tone (work done) and the rest in its tint;
             `text` is written after the bar in the bar's colour, `who` after it in ink.
             `after` is the id of a row this one depends on: an elbow arrow joins its end to this start.
       Returns the group: g.X(day) is the x of a day column's left edge, g.bottom the last y. */
    ganttTable(parent, o) {
      const x = o.x || 0, y = o.y || 0, rh = o.rowH || 32, hr = o.headRowH || 26, dw = o.dayW || 24;
      const cols = o.cols, leftW = cols.reduce((a, c) => a + c.w, 0), tx = x + leftW;
      const headH = hr * o.head.length, tw = o.days * dw, top = y + headH;
      const rows = o.rows, bodyH = rows.length * rh, g = this.g(parent, 'pa-gtable');
      const X = d => tx + d * dw;
      // header
      this.el('rect', { x, y: top, width: leftW + tw, height: bodyH, class: 'pa-gbody' }, g);
      this.el('rect', { x, y, width: leftW + tw, height: headH, class: 'pa-ghead' }, g);
      let cx = x;
      cols.forEach(c => {
        this.text(g, c.label, { x: cx + c.w / 2, y: y + headH / 2, valign: 'middle', cls: 'pa-ghead-t pa-strong', size: 13.5, lh: 1.15 });
        cx += c.w;
      });
      o.head.forEach((row, ri) => {
        let d = 0;
        row.forEach(c => {
          const span = c.span || 1, x0 = X(d), w = span * dw;
          this.el('rect', { x: x0, y: y + ri * hr, width: w, height: hr, class: 'pa-ghead-cell' }, g);
          this.text(g, c.label, { x: x0 + w / 2, y: y + ri * hr + hr / 2, valign: 'middle', cls: 'pa-ghead-t' + (ri === 0 ? ' pa-strong' : ''), size: 13 });
          d += span;
        });
      });
      // body
      (o.shade || []).forEach(d => this.el('rect', { x: X(d), y: top, width: dw, height: bodyH, class: 'pa-gshade' }, g));
      rows.forEach((r, i) => this.el('path', { d: `M${x} ${top + (i + 1) * rh} H${tx + tw}`, class: 'pa-grow' }, g));
      this.el('path', { d: `M${x} ${top} V${top + bodyH} H${tx + tw} V${top} M${tx} ${top} V${top + bodyH}`, class: 'pa-grow is-frame' }, g);
      cols.slice(0, -1).forEach((c, i) => { const px = x + cols.slice(0, i + 1).reduce((a, k) => a + k.w, 0); this.el('path', { d: `M${px} ${top} V${top + bodyH}`, class: 'pa-grow' }, g); });
      const byId = {}, bars = this.g(g), deps = this.g(g);
      rows.forEach((r, i) => {
        const cy = top + i * rh + rh / 2, tone = r.tone || 'teal';
        r.cy = cy; byId[r.id] = r;
        let px = x;
        cols.forEach(c => {
          if (c.key === 'id') this.text(g, String(r.id), { x: px + c.w / 2, y: cy, valign: 'middle', cls: 'pa-t', size: 14 });
          else if (c.key === 'date') this.text(g, r.date || '', { x: px + c.w / 2, y: cy, valign: 'middle', cls: 'pa-t pa-strong', size: 13 });
          else {
            const ind = (r.indent || 0) * 16 + 8;
            if (r.summary) {
              this.el('rect', { x: px + ind, y: cy - 6, width: 12, height: 12, class: 'pa-gbox' }, g);
              this.el('path', { d: `M${px + ind + 3} ${cy} H${px + ind + 9}`, class: 'pa-gbox-line' }, g);
            }
            this.text(g, r.label, { x: px + ind + (r.summary ? 19 : 0), y: cy, anchor: 'start', valign: 'middle', cls: 'pa-t' + (r.summary ? ' pa-strong' : ''), size: c.size || 14 });
          }
          px += c.w;
        });
        if (r.milestone) {
          const mx = X(r.start) + dw / 2;
          const m = this.g(bars, null, { x: mx, y: cy });
          this.el('path', { d: 'M0 -9 L9 0 L0 9 L-9 0 Z', class: 'pa-gmile pa-tone-' + tone }, m);
          if (r.mdate) this.text(g, r.mdate, { x: mx + 16, y: cy, anchor: 'start', valign: 'middle', cls: 'pa-t pa-strong', size: 13 });
          r.ex = mx + 9; r.sx = mx - 9;
          return;
        }
        const x0 = X(r.start), x1 = X(r.start + r.dur), bh = rh * (r.summary ? .34 : .46), by = cy - bh / 2;
        const b = this.g(bars);
        b.setAttribute('filter', 'url(#pa-cut)');
        if (r.pct != null) {
          this.el('rect', { x: x0, y: by, width: x1 - x0, height: bh, rx: 2, class: 'f-' + tone + '-r' }, b);
          if (r.pct > 0) this.el('rect', { x: x0, y: by, width: (x1 - x0) * r.pct / 100, height: bh, rx: 2, class: 'f-' + tone }, b);
        } else this.el('rect', { x: x0, y: by, width: x1 - x0, height: bh, rx: 2, class: 'f-' + tone }, b);
        r.sx = x0; r.ex = x1;
        if (r.text) {
          const t = this.text(g, r.text, { x: x1 + 8, y: cy, anchor: 'start', valign: 'middle', cls: 'pa-t pa-strong pa-tx-' + tone, size: 13 });
          if (r.who) { const ts = svg('tspan', { dx: 6, class: 'pa-tx-ink' }, t); ts.textContent = r.who; }
        }
      });
      rows.forEach(r => {
        if (!r.after) return;
        const p = byId[r.after], ex = p.ex, sx = r.sx, py = p.cy, sy = r.cy, hb = rh * .23;
        const down = sy > py;
        let d;
        if (sx >= ex + 10) d = `M${ex} ${py + (down ? hb : -hb)} V${sy} H${sx - 1}`;
        else { const my = py + (down ? rh * .5 : -rh * .5); d = `M${ex} ${py} H${ex + 7} V${my} H${sx - 8} V${sy} H${sx - 1}`; }
        this.el('path', { d, class: 'pa-dep is-solid', 'marker-end': 'url(#pa-arrow)' }, deps);
      });
      g.X = X; g.bottom = top + bodyH; g.width = leftW + tw;
      return g;
    }
  });

  Object.assign(Scene.prototype, KIT);

  /* ── Player: one per .anim element ── */

  class Player {
    constructor(root, name, def) {
      this.root = root;
      this.name = name;
      this.def = def;
      this.id = 'anim' + (++uid);
      this.variants = def.variants || [{ id: 'main', label: '', beats: def.beats }];
      this.vi = 0;
      this.pos = 0;
      this.clock = new Clock();
      this.queue = Promise.resolve();
      this.playing = false;
      this.userPaused = false;
      this.ended = false;
      this.inView = false;
      this.build();
      this.mode = this.pickMode();
      this.enqueue(() => this.seek(0));
      this.observe();
    }

    get beats() { return this.variants[this.vi].beats; }

    /* DOM */

    build() {
      const { root, def } = this;
      root.classList.add('anim');
      root.replaceChildren();
      root.setAttribute('role', 'group');
      root.setAttribute('aria-roledescription', 'animated diagram');
      root.setAttribute('aria-label', def.title);
      root.tabIndex = 0;

      if (this.variants.length > 1) {
        const bar = h('div', 'anim-tabs');
        bar.setAttribute('role', 'group');
        bar.setAttribute('aria-label', def.variantsLabel || 'Scenario');
        bar.append(h('span', 'anim-tabs-label', def.variantsLabel || 'Scenario'));
        this.tabs = this.variants.map((v, i) => {
          const b = h('button', 'anim-tab', v.label);
          b.type = 'button';
          b.addEventListener('click', () => this.choose(i));
          bar.append(b);
          return b;
        });
        root.append(bar);
      }

      this.stage = h('div', 'anim-stage');

      const cap = this.cap = h('div', 'anim-caption');
      this.stepNo = h('span', 'anim-step');
      this.say = h('p', 'anim-say');
      this.say.setAttribute('aria-live', 'polite');
      cap.append(this.stepNo, this.say);

      const bar = h('div', 'anim-controls');
      const btn = (label, text, cls, fn) => {
        const b = h('button', 'anim-btn' + (cls ? ' ' + cls : ''), text);
        b.type = 'button';
        b.title = label;
        b.setAttribute('aria-label', label);
        b.addEventListener('click', fn);
        return b;
      };
      this.btnBack = btn('Back one step (Left arrow)', '◀ Back', null, () => this.manual(() => this.seek(this.pos - 1)));
      this.btnPlay = btn('Play (Space)', '▶ Play', 'anim-play', () => this.togglePlay());
      this.btnNext = btn('Next step (Right arrow)', 'Next ▶', null, () => this.manual(() => this.forward()));
      this.dots = h('ol', 'anim-dots');
      this.btnReset = btn('Start again (R)', '↺', 'anim-reset', () => this.manual(() => this.seek(0)));
      bar.append(this.btnBack, this.btnPlay, this.btnNext, this.dots, this.btnReset);

      this.transcript = h('details', 'anim-transcript');
      this.transcriptTitle = h('summary', null, 'Read the steps');
      this.transcriptList = h('ol');
      this.transcript.append(this.transcriptTitle, this.transcriptList);

      root.append(this.stage, cap, bar, this.transcript);
      root.addEventListener('keydown', e => this.onKey(e));
      this.buildBeatsUI();
    }

    buildBeatsUI() {
      this.dots.replaceChildren();
      this.dotBtns = this.beats.map((b, i) => {
        const li = h('li');
        const d = h('button', 'anim-dot');
        d.type = 'button';
        d.setAttribute('aria-label', `Step ${i + 1}: ${plain(b.say).slice(0, 80)}`);
        d.addEventListener('click', () => this.manual(() => (i === this.pos + 1 ? this.forward() : this.seek(i))));
        li.append(d);
        this.dots.append(li);
        return d;
      });
      this.transcriptList.replaceChildren(...this.beats.map(b => { const li = h('li'); li.append(rich(b.say)); return li; }));
      const v = this.variants[this.vi];
      this.transcriptTitle.textContent = v.label ? `Read the steps: ${v.label}` : 'Read the steps';
      this.fitCaption();
    }

    // Reserve room for the longest caption, so the controls don't jump between steps.
    // Measured on a hidden copy, so screen readers don't hear every caption.
    fitCaption() {
      const w = this.cap.clientWidth;
      if (!w || w === this.capWidth) return;
      this.capWidth = w;
      const probe = h('div', 'anim-caption');
      probe.style.cssText = `position:absolute;left:0;top:0;width:${w}px;min-height:0;visibility:hidden`;
      const say = h('p', 'anim-say');
      probe.append(h('span', 'anim-step', '10 / 10'), say);
      this.root.append(probe);
      let tallest = 0;
      this.variants.forEach(v => v.beats.forEach(b => {
        say.replaceChildren(rich(b.say));
        tallest = Math.max(tallest, probe.offsetHeight);
      }));
      probe.remove();
      this.cap.style.minHeight = tallest + 'px';
    }

    render() {
      const n = this.beats.length, i = this.pos;
      this.stepNo.textContent = `${i + 1} / ${n}`;
      this.say.replaceChildren(rich(this.beats[i].say));
      this.dotBtns.forEach((d, j) => {
        d.classList.toggle('is-on', j === i);
        d.classList.toggle('is-past', j < i);
        if (j === i) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current');
      });
      this.btnBack.disabled = i <= 0;
      this.btnNext.disabled = i >= n - 1;
      const atEnd = i >= n - 1;
      this.btnPlay.textContent = this.playing ? '❚❚ Pause' : atEnd ? '↺ Replay' : '▶ Play';
      this.btnPlay.setAttribute('aria-label', this.playing ? 'Pause (Space)' : atEnd ? 'Replay from the start' : 'Play (Space)');
      this.btnPlay.setAttribute('aria-pressed', String(this.playing));
      if (this.tabs) this.tabs.forEach((t, j) => t.setAttribute('aria-pressed', String(j === this.vi)));
      this.root.classList.toggle('is-playing', this.playing);
    }

    /* Moving between beats */

    pickMode() {
      const w = this.stage.clientWidth || this.root.clientWidth || 800;
      return this.def.layouts && this.def.layouts.tall && w < TALL_BELOW ? 'tall' : 'wide';
    }

    // Rebuild the scene and replay beats 0..i instantly.
    async seek(i) {
      i = clamp(i, 0, this.beats.length - 1);
      this.clock.finish();
      this.clock.instant = true;
      const s = new Scene(this, this.stage, this.mode);
      this.scene = s;
      this.def.setup(s);
      for (let j = 0; j <= i; j++) if (this.beats[j].run) await this.beats[j].run(s);
      this.clock.instant = reduceMQ.matches;
      this.pos = i;
      if (i < this.beats.length - 1) this.ended = false;
      this.render();
    }

    async forward() {
      if (this.pos >= this.beats.length - 1) return false;
      this.pos++;
      this.render();
      this.clock.instant = reduceMQ.matches;
      const beat = this.beats[this.pos];
      if (beat.run) await beat.run(this.scene);
      return true;
    }

    // Finish the beat in progress straight away.
    hurry() {
      this.clock.instant = true;
      this.clock.finish();
    }

    enqueue(fn) {
      this.queue = this.queue.then(fn).catch(e => console.error(e));
      return this.queue;
    }

    manual(fn) {
      this.pause(true);
      this.hurry();
      return this.enqueue(fn);
    }

    choose(i) {
      if (i === this.vi) return;
      this.pause(true);
      this.hurry();
      this.enqueue(async () => {
        this.vi = i;
        this.buildBeatsUI();
        await this.seek(0);
      });
      if (!reduceMQ.matches) { this.userPaused = false; this.play(true); }
    }

    /* Playback */

    holdFor(beat) {
      if (beat.hold != null) return beat.hold;
      const words = plain(beat.say).split(/\s+/).length;
      return clamp(700 + words * 200, 2200, 7000);
    }

    hold(ms) {
      return new Promise(resolve => {
        this.release = () => { clearTimeout(this.holdTimer); this.release = null; resolve(); };
        this.holdTimer = setTimeout(this.release, ms);
      });
    }

    togglePlay() {
      if (this.playing) { this.pause(true); return; }
      this.userPaused = false;
      if (this.pos >= this.beats.length - 1) {
        this.hurry();
        this.enqueue(() => this.seek(0));
      }
      this.play(true);
    }

    play(soon) {
      if (this.playing) return;
      this.playing = true;
      this.render();
      let first = true;
      this.enqueue(async () => {
        while (this.playing) {
          await this.hold(first && soon ? 450 : this.holdFor(this.beats[this.pos]));
          first = false;
          if (!this.playing) return;
          if (this.pos >= this.beats.length - 1) {
            this.ended = true;
            this.pause(false);
            return;
          }
          await this.forward();
        }
      });
    }

    pause(byUser) {
      if (byUser) this.userPaused = true;
      if (this.release) this.release();
      if (!this.playing) return;
      this.playing = false;
      this.render();
    }

    onKey(e) {
      if (e.target.closest('input, summary, details')) return;
      if (e.key === 'ArrowRight') this.manual(() => this.forward());
      else if (e.key === 'ArrowLeft') this.manual(() => this.seek(this.pos - 1));
      else if (e.key === ' ' && !e.target.closest('button')) this.togglePlay();
      else if (e.key === 'r' || e.key === 'R') this.manual(() => this.seek(0));
      else if (e.key === 'Home') this.manual(() => this.seek(0));
      else if (e.key === 'End') this.manual(() => this.seek(this.beats.length - 1));
      else return;
      e.preventDefault();
    }

    observe() {
      const resume = () => {
        this.root.classList.toggle('is-offscreen', !this.inView || document.hidden);
        if (this.inView && !document.hidden && !this.userPaused && !this.ended && !reduceMQ.matches) this.play();
        else this.pause(false);
      };
      if ('IntersectionObserver' in window) {
        // "In view" once most of it shows, or it fills most of a short screen.
        new IntersectionObserver(entries => {
          const e = entries[0];
          this.inView = e.isIntersecting && (e.intersectionRatio >= .45 || e.intersectionRect.height >= window.innerHeight * .6);
          resume();
        }, { threshold: [0, .15, .3, .45, .6, .8, 1] }).observe(this.root);
      }
      document.addEventListener('visibilitychange', resume);
      if ('ResizeObserver' in window) {
        new ResizeObserver(() => {
          this.fitCaption();
          const mode = this.pickMode();
          if (mode === this.mode) return;
          this.mode = mode;
          const was = this.playing;
          this.pause(false);
          this.hurry();
          this.enqueue(() => this.seek(this.pos)).then(() => { if (was) this.play(); });
        }).observe(this.root);
      }
      reduceMQ.addEventListener?.('change', () => { if (reduceMQ.matches) this.pause(true); });
    }
  }

  /* ── Still diagrams: one frame, no player ──
     A scene with `still: true` draws its setup once, in the same paper
     style, and redraws only when the layout (wide / tall) changes. */

  class Still {
    constructor(root, name, def) {
      this.root = root;
      this.name = name;
      this.def = def;
      this.clock = new Clock();
      this.clock.instant = true;
      this.variants = [{ id: 'main' }];
      this.vi = 0;
      root.classList.add('anim', 'anim-still');
      root.replaceChildren();
      root.setAttribute('role', 'img');
      root.setAttribute('aria-label', def.alt || def.title);
      this.stage = h('div', 'anim-stage');
      root.append(this.stage);
      this.draw();
      if ('ResizeObserver' in window && def.layouts && def.layouts.tall) {
        new ResizeObserver(() => { if (this.pickMode() !== this.mode) this.draw(); }).observe(root);
      }
    }

    pickMode() { return Player.prototype.pickMode.call(this); }

    draw() {
      this.mode = this.pickMode();
      const s = new Scene(this, this.stage, this.mode);
      this.def.setup(s);
      // Never scale up past natural size (text stays at its designed size);
      // wide ones keep a minimum width and scroll sideways on small screens.
      s.svg.style.maxWidth = s.W + 'px';
      const min = this.def.minWidth || s.L.minWidth;
      if (min) s.svg.style.minWidth = min + 'px';
    }
  }

  /* ── Loading and mounting ── */

  const requested = {};
  function load(name) {
    if (DEFS[name] || requested[name]) return;
    requested[name] = true;
    const s = document.createElement('script');
    s.src = `${BASE}anims/${name}.js?v=${VERSION}`;
    s.onerror = () => console.warn('No animation called', name);
    document.head.appendChild(s);
  }

  function mountAll() {
    sharedDefs();
    document.querySelectorAll('[data-anim]').forEach(el => {
      if (el._anim) return;
      const name = el.dataset.anim;
      if (!DEFS[name]) { load(name); return; }
      el._anim = DEFS[name].still ? new Still(el, name, DEFS[name]) : new Player(el, name, DEFS[name]);
    });
  }

  let ready = false;
  window.HSCAnim = {
    define(name, def) {
      DEFS[name] = def;
      if (ready) mountAll();
    },
    // Add a reusable cut-out to the kit: HSCAnim.kit('robot', function (parent, o) { … }).
    kit(name, fn) { KIT[name] = fn; Scene.prototype[name] = fn; },
    mountAll
  };

  // Printed notes get every animation's steps as text.
  window.addEventListener('beforeprint', () => document.querySelectorAll('.anim-transcript').forEach(d => { d.open = true; }));

  // Mount after main.js's DOMContentLoaded work (glossary links etc.) has run.
  const start = () => { ready = true; mountAll(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
