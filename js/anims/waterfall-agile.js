/* Animated diagram: Waterfall and Agile, and when the client gets a working system.
   Enterprise Project › Producing and implementing (waterfall and agile development approaches). */
(() => {
  const VARIANTS = { waterfall: 'Waterfall', agile: 'Agile' };
  const STAGES = ['Requirements', 'Design', 'Development', 'Testing', 'Installation', 'Maintenance'];
  const WEEKS = 12;
  const FEATURES = ['log in', 'timetable', 'notices', 'rostering', 'reports', 'export'];

  // Share of the finished system the client can actually use at week t
  const value = {
    waterfall: t => (t >= 11 ? 100 : 0),
    agile: t => Math.min(6, Math.floor(t / 2 + 1e-9)) * (100 / 6)
  };

  function setup(s) {
    const L = s.L;
    s.t = 0;
    s.client = s.folk(s.root, { at: { x: L.client[0], y: L.client[1] }, tone: 'teal', name: 'the client', mood: 'happy' });

    if (s.is('waterfall')) {
      const [x0, y0, dx, dy, w] = L.stairs;
      s.tiles = STAGES.map((name, i) => {
        const g = s.g(s.root, 'pa-stage', { x: x0 + i * dx, y: y0 + i * dy });
        const art = s.g(g);
        art.setAttribute('filter', 'url(#pa-cut)');
        g.bg = s.el('rect', { width: w, height: 30, rx: 6, class: 'f-paper' }, art);
        s.text(g, name, { x: 14, y: 15, anchor: 'start', valign: 'middle', cls: 'pa-t-sm pa-strong' });
        g.tick = s.mark(g, true, { at: { x: w - 14, y: 15, o: 0 }, r: 8 });
        if (i < STAGES.length - 1) s.el('path', { d: `M${x0 + i * dx + 30} ${y0 + i * dy + 30} Q${x0 + i * dx + 32} ${y0 + (i + 1) * dy + 6} ${x0 + (i + 1) * dx + 6} ${y0 + (i + 1) * dy + 12}`, class: 'pa-fall' }, s.back);
        return g;
      });
      s.drop = s.g(s.front, 'pa-drop', Object.assign(tilePos(s, 0), { o: 0 }));
      const d = s.g(s.drop, 'pa-idle-bob');
      d.setAttribute('filter', 'url(#pa-cut)');
      s.el('path', { d: 'M0 -13 C6 -4 9 1 9 5 A9 9 0 0 1 -9 5 C-9 1 -6 -4 0 -13 Z', class: 'f-sky' }, d);
      s.el('circle', { cx: -3, cy: 4, r: 1.6, class: 'f-ink-fixed' }, d);
      s.el('circle', { cx: 3, cy: 4, r: 1.6, class: 'f-ink-fixed' }, d);
    } else {
      const [cx, cy, r] = L.loop;
      s.el('circle', { cx, cy, r, class: 'pa-loop' }, s.back);
      ['Plan', 'Build', 'Test', 'Review'].forEach((name, i) => {
        const a = -Math.PI / 2 + i * Math.PI / 2;
        const out = i % 2 ? 40 : 22;
        s.tag(s.root, { text: name, x: cx + Math.cos(a) * (r + out), y: cy + Math.sin(a) * (r + out), size: 12, tone: ['sage', 'teal', 'mustard', 'plum'][i], on: i !== 2 });
      });
      s.sprint = s.text(s.root, 'Sprint 1', { x: cx, y: cy, valign: 'middle', cls: 'pa-eq' });
      s.runner = s.g(s.front, null, { x: cx, y: cy - r });
      s.el('circle', { r: 7, class: 'f-terra' }, s.runner).setAttribute('filter', 'url(#pa-cut)');
      const [bx, by] = L.blocks;
      s.blocks = FEATURES.map((f, i) => {
        const b = s.tag(s.root, { text: f, x: bx, y: by - i * 27, w: 110, size: 11.5, tone: i === 3 ? 'mustard' : 'teal', on: i !== 3 });
        s.set(b, { o: 0 });
        return b;
      });
      s.text(s.root, 'working system', { x: bx + 55, y: by + 26, anchor: 'end', cls: 'pa-name' });
    }
    s.ask = s.bubble(s.front, { text: 'Can it do rostering too?', at: { x: L.client[0] - 8, y: L.client[1] - 64 }, dx: L.askDx });

    // Chart: how much working software the client has, week by week
    const [px, py, pw, ph] = L.chart;
    const plot = s.plot(s.root, { x: px, y: py, w: pw, h: ph, xr: [0, WEEKS], yr: [0, 100], xTicks: [0, 2, 4, 6, 8, 10, 12], yTicks: [0, 50, 100], xLabel: 'week', yLabel: 'usable', yLabelGap: 34 });
    s.X = plot.X; s.Y = plot.Y;
    s.area = s.el('path', { class: 'pa-value' });
    s.head = s.el('line', { y1: py, y2: py + ph, class: 'pa-playhead-line' });
    render(s);
  }

  function tilePos(s, i) {
    const [x0, y0, dx, dy] = s.L.stairs;
    return { x: x0 + i * dx - 12, y: y0 + i * dy + 12 };
  }

  function render(s) {
    const f = value[s.variant], X = s.X, Y = s.Y;
    let d = `M${X(0)} ${Y(0)}`;
    for (let w = 0; w <= s.t + 1e-9; w += 0.05) d += ` L${X(w).toFixed(1)} ${Y(f(w)).toFixed(1)}`;
    d += ` L${X(s.t).toFixed(1)} ${Y(f(s.t)).toFixed(1)} L${X(s.t).toFixed(1)} ${Y(0)} Z`;
    s.area.setAttribute('d', d);
    s.head.setAttribute('x1', X(s.t));
    s.head.setAttribute('x2', X(s.t));
  }

  function advance(s, to, dur) {
    const from = s.t;
    return s.tween({ dur: dur || (to - from) * 450, ease: 'linear' }, k => { s.t = from + (to - from) * k; render(s); });
  }

  // Waterfall: the droplet moves to a stage; finished stages get a tick
  async function flow(s, i, o = {}) {
    s.tiles.forEach((t, j) => t.bg.setAttribute('class', j === i ? 'f-sky' : 'f-paper'));
    const p = tilePos(s, i);
    await s.move(s.drop, p.x, p.y, Object.assign({ arc: 16, dur: 600 }, o));
  }
  const done = (s, i) => s.pop(s.tiles[i].tick, { dur: 360 });

  // Agile: one sprint goes round the loop and delivers a feature
  async function sprint(s, n) {
    const [cx, cy, r] = s.L.loop;
    s.sprint.textContent = 'Sprint ' + (n + 1);
    await s.all([
      s.tween({ dur: 1500, ease: 'inOut' }, k => {
        const a = -Math.PI / 2 + k * Math.PI * 2;
        s.set(s.runner, { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
      }),
      advance(s, (n + 1) * 2, 1500)
    ]);
    await s.pop(s.blocks[n]);
    s.hop(s.client, { h: 6 });
  }

  const BEATS = {
    waterfall: [
      { say: '*Waterfall* works through the stages in order, like water falling down a series of steps. Each stage is finished and signed off before the next begins.' },
      {
        say: 'Weeks 0 to 3: the requirements are gathered and signed off, then the whole design is completed.',
        async run(s) {
          await s.pop(s.drop);
          await advance(s, 1.5); await done(s, 0);
          await flow(s, 1); await advance(s, 3); await done(s, 1);
        }
      },
      {
        say: "Weeks 3 to 6: development builds the whole system. The client hasn't seen anything working yet.",
        async run(s) { await flow(s, 2); await advance(s, 6); s.mood(s.client, 'flat'); }
      },
      {
        say: 'Week 6: the client changes their mind. Going back up a waterfall is hard: the design has to be reworked before development can carry on.',
        async run(s) {
          await s.pop(s.ask);
          s.mood(s.client, 'happy');
          s.set(s.tiles[1].tick, { o: 0 });
          await flow(s, 1, { arc: 30, dur: 1100 });
          await s.wobble(s.drop, { amp: 10 });
          await advance(s, 7); await done(s, 1);
          await flow(s, 2); await advance(s, 9); await done(s, 2);
          await s.hide(s.ask);
        }
      },
      {
        say: 'Testing and installation come last. The client gets a working system only in week 11, all at once, and any problems found now are the most expensive to fix.',
        async run(s) {
          await flow(s, 3); await advance(s, 10.5); await done(s, 3);
          await flow(s, 4); await advance(s, 11); await done(s, 4);
          await flow(s, 5);
          s.mood(s.client, 'grin');
          await s.hop(s.client, { h: 10 });
          await advance(s, 12, 500);
        }
      }
    ],
    agile: [
      { say: '*Agile* builds the system in short *sprints* of two to four weeks. Each sprint plans, builds, tests and reviews one small, working piece.' },
      {
        say: 'Sprint 1: the team builds the most important feature first. At the review, the client uses a real, working system after only two weeks.',
        async run(s) { await sprint(s, 0); s.mood(s.client, 'grin'); }
      },
      {
        say: "Sprints 2 and 3 each add another working feature, and the client's feedback at every review shapes what comes next.",
        async run(s) { s.mood(s.client, 'happy'); await sprint(s, 1); await sprint(s, 2); }
      },
      {
        say: 'Week 6: the client changes their mind. No drama: the new feature goes on the list and is built in the very next sprint.',
        async run(s) { await s.pop(s.ask); await sprint(s, 3); await s.hide(s.ask); }
      },
      {
        say: 'By week 12 the client has been using a working system for ten weeks. Agile suits projects whose requirements are likely to change, at the cost of less up-front certainty about the final scope and date.',
        async run(s) { await sprint(s, 4); await sprint(s, 5); s.mood(s.client, 'grin'); await s.hop(s.client, { h: 10 }); }
      }
    ]
  };

  HSCAnim.define('waterfall-agile', {
    title: 'Waterfall and Agile: when does the client get a working system?',
    variantsLabel: 'Approach',
    layouts: {
      wide: {
        size: [760, 440], client: [676, 250], askDx: -70,
        stairs: [40, 20, 84, 42, 150], loop: [230, 136, 86], blocks: [470, 238],
        chart: [80, 296, 640, 90]
      },
      tall: {
        size: [400, 600], client: [62, 336], askDx: 50,
        stairs: [14, 12, 46, 42, 150], loop: [146, 128, 60], blocks: [338, 250],
        chart: [60, 420, 320, 100]
      }
    },
    setup,
    variants: Object.keys(VARIANTS).map(id => ({ id, label: VARIANTS[id], beats: BEATS[id] }))
  });
})();
