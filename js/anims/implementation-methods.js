/* Animated diagram: system implementation methods (direct, phased, parallel, pilot).
   Enterprise Project › Producing and implementing (preferred system implementation method). */
(() => {
  const OFFICES = ['Sales', 'Warehouse', 'Accounts', 'Support'];
  const MODULES = ['Orders', 'Stock', 'Payroll'];
  const ROOFS = ['terra', 'sage', 'mustard', 'plum'];
  const WEEKS = 8;
  const VARIANTS = { direct: 'Direct', phased: 'Phased', parallel: 'Parallel', pilot: 'Pilot' };

  // When each row (office, or module for phased) leaves the old system and joins the new one,
  // and when a bug appears and is fixed. `fallback` means the old system covers for the outage.
  const PLANS = {
    direct: { rows: 'offices', oldEnd: [3, 3, 3, 3], newStart: [3, 3, 3, 3], bug: { at: 3.4, fixed: 5, rows: [0, 1, 2, 3] }, rating: [3, 1, 1] },
    phased: { rows: 'modules', oldEnd: [2, 4, 6], newStart: [2, 4, 6], bug: { at: 4.4, fixed: 5.4, rows: [1] }, rating: [2, 2, 3] },
    parallel: { rows: 'offices', oldEnd: [6, 6, 6, 6], newStart: [2, 2, 2, 2], bug: { at: 3, fixed: 4, rows: [0, 1, 2, 3], fallback: true }, rating: [1, 3, 2] },
    pilot: { rows: 'offices', oldEnd: [2, 6, 6, 6], newStart: [2, 6, 6, 6], bug: { at: 3, fixed: 4, rows: [0] }, rating: [1, 2, 2] }
  };
  const RATINGS = [
    ['Risk', ['Low', 'Medium', 'High']],
    ['Cost', ['Low', 'Medium', 'High']],
    ['Time', ['Short', 'Medium', 'Long']]
  ];
  const TONES = ['sage', 'mustard', 'terra'];

  /* Setup */

  function office(s, i, x, y) {
    const g = s.g(s.root, 'pa-office', { x, y });
    s.building(g, { w: 128, h: 88, roof: 'house', tone: ROOFS[i], door: false });
    const scr = s.g(g, null, { x: -44, y: -76 });
    s.el('rect', { x: -5, y: -5, width: 98, height: 60, rx: 4, class: 'f-ink-fixed' }, scr);
    g.bands = MODULES.map((_, m) => {
      const by = m * 17;
      return {
        old: s.el('rect', { x: 0, y: by, width: 88, height: 14, rx: 2, class: 'f-hatch' }, scr),
        neu: s.el('rect', { x: 0, y: by, width: 88, height: 14, rx: 2, class: 'f-teal pa-new' }, scr),
        y: by
      };
    });
    g.bug = s.bug(g, { at: { x: 0, y: -52, s: .8, o: 0 } });
    g.worker = s.folk(g, { at: { x: 52, y: 4, s: .6 }, tone: 'teal', hat: 'cap', hatTone: ROOFS[i], sweat: true });
    s.text(g, OFFICES[i], { y: 20, cls: 'pa-name' });
    g.flag = s.g(g, null, { x: 0, y: -124, o: 0 });
    s.el('path', { d: 'M0 0 V-26', class: 'pa-flagpole' }, g.flag);
    s.el('path', { d: 'M0 -26 L34 -19 L0 -12 Z', class: 'f-terra' }, g.flag);
    s.text(g.flag, 'pilot', { x: 13, y: -19, valign: 'middle', cls: 'pa-t-xs pa-on pa-strong', size: 8.5 });
    return g;
  }

  function setup(s) {
    const L = s.L, plan = s.plan = PLANS[s.variant];
    s.t = 0;
    s.offices = OFFICES.map((_, i) => office(s, i, L.offices[i][0], L.offices[i][1]));

    // Timeline chart: one row per office (or module), an old lane over a new lane
    const [cx, cy, cw] = L.chart;
    const X = s.X = w => cx + w / WEEKS * cw;
    const labels = plan.rows === 'modules' ? MODULES : OFFICES;
    const rowH = 34;
    s.text(s.root, 'weeks', { x: cx - 10, y: cy - 14, anchor: 'end', cls: 'pa-name' });
    for (let w = 0; w <= WEEKS; w++) {
      s.el('line', { x1: X(w), y1: cy - 6, x2: X(w), y2: cy + labels.length * rowH, class: 'pa-week' }, s.back);
      s.text(s.root, String(w), { x: X(w), y: cy - 14, cls: 'pa-t-xs pa-muted' });
    }
    s.rows = labels.map((label, r) => {
      const y = cy + r * rowH + 4;
      s.text(s.root, label, { x: cx - 10, y: y + 12, anchor: 'end', valign: 'middle', cls: 'pa-t-sm' });
      s.el('rect', { x: X(0), y, width: cw, height: 11, rx: 2, class: 'pa-lane' }, s.back);
      s.el('rect', { x: X(0), y: y + 13, width: cw, height: 11, rx: 2, class: 'pa-lane' }, s.back);
      return {
        old: s.el('rect', { x: X(0), y, height: 11, rx: 2, class: 'f-hatch pa-bar' }),
        neu: s.el('rect', { x: X(0), y: y + 13, height: 11, rx: 2, class: 'f-teal' }),
        out: s.el('rect', { x: X(0), y: y + 13, height: 11, class: 'f-outage' })
      };
    });
    // Each bug leaves a mark on the chart where it struck
    s.rows.forEach((row, r) => {
      if (plan.bug.rows.includes(r)) row.bug = s.bug(s.root, { at: { x: X(plan.bug.at), y: cy + r * rowH + 22, s: .5, r: -90, o: 0 } });
    });
    const bottom = cy + labels.length * rowH;
    s.head = s.g(s.root, 'pa-playhead');
    s.el('line', { x1: 0, y1: cy - 4, x2: 0, y2: bottom, class: 'pa-playhead-line' }, s.head);
    s.el('path', { d: `M-6 ${cy - 8} H6 L0 ${cy - 1} Z`, class: 'f-terra' }, s.head);

    // Legend and the verdict chips
    const [lx, ly] = L.legend;
    [['f-hatch', 'old system'], ['f-teal', 'new system'], ['f-outage', 'not working']].forEach(([cls, label], i) => {
      const x = lx + i * L.legendGap;
      s.el('rect', { x, y: ly - 6, width: 22, height: 12, rx: 2, class: cls + ' pa-key' });
      s.text(s.root, label, { x: x + 28, y: ly, anchor: 'start', valign: 'middle', cls: 'pa-t-xs' });
    });
    const [vx, vy] = L.verdict;
    s.chips = RATINGS.map(([name, words], i) => {
      const level = plan.rating[i];
      const tone = TONES[level - 1];
      const chip = s.tag(s.root, { text: `${name}: ${words[level - 1]}`, x: vx + i * L.verdictGap, y: vy, w: L.verdictGap - 10, tone, on: tone !== 'mustard', size: 12 });
      s.set(chip, { o: 0 });
      return chip;
    });

    render(s);
  }

  /* Drawing the moment `s.t` */

  function render(s) {
    const { plan, t, X } = s;
    const bug = plan.bug;
    const bugOn = t >= bug.at && t < bug.fixed;

    s.set(s.head, { x: X(t) });

    s.rows.forEach((row, r) => {
      const oldEnd = Math.min(t, plan.oldEnd[r]);
      row.old.setAttribute('width', Math.max(0, X(oldEnd) - X(0)));
      const ns = plan.newStart[r];
      row.neu.setAttribute('x', X(ns));
      row.neu.setAttribute('width', Math.max(0, X(t) - X(ns)));
      const hit = !bug.fallback && bug.rows.includes(r) && t > bug.at;
      row.out.setAttribute('x', X(bug.at));
      row.out.setAttribute('width', hit ? Math.max(0, X(Math.min(t, bug.fixed)) - X(bug.at)) : 0);
      if (row.bug) s.set(row.bug, { o: t >= bug.at ? 1 : 0 });
    });

    s.offices.forEach((o, i) => {
      let split = false, down = false;
      o.bands.forEach((band, m) => {
        const r = plan.rows === 'modules' ? m : i;
        const oldOn = t < plan.oldEnd[r], newOn = t >= plan.newStart[r];
        split = split || (oldOn && newOn);
        band.old.setAttribute('width', oldOn ? (newOn ? 42 : 88) : 0);
        band.neu.setAttribute('x', oldOn && newOn ? 46 : 0);
        band.neu.setAttribute('width', newOn ? (oldOn ? 42 : 88) : 0);
      });
      const hitRow = plan.rows === 'modules' ? bug.rows[0] : i;
      const hit = bugOn && (plan.rows === 'modules' || bug.rows.includes(i));
      if (hit) {
        const band = o.bands[plan.rows === 'modules' ? hitRow : 1];
        s.set(o.bug, { x: split ? 24 : 0, y: -76 + band.y + 7, o: 1 });
        down = !bug.fallback;
      } else {
        s.set(o.bug, { o: 0 });
      }
      s.mood(o.worker, down ? 'shock' : split ? 'flat' : 'happy');
      o.worker.sweat.style.opacity = split && !down ? 1 : 0;
    });
  }

  function advance(s, to, dur) {
    const from = s.t;
    return s.tween({ dur: dur || Math.abs(to - from) * 650, ease: 'linear' }, k => {
      s.t = from + (to - from) * k;
      render(s);
    });
  }

  // Sparkles on the screens that just changed over
  function celebrate(s, offices, band) {
    offices.forEach(i => {
      const o = s.at(s.offices[i]);
      s.burst(o.x, o.y - 76 + (band == null ? 24 : band * 17 + 7), { n: 6, spread: 28, tones: ['mustard', 'teal'] });
    });
  }

  async function verdict(s) {
    for (const chip of s.chips) await s.pop(chip, { dur: 420 });
  }

  const ALL = [0, 1, 2, 3];

  const BEATS = {
    direct: [
      { say: 'Four teams run the business on the *old system*. The new one is built and tested. How should they switch? *Direct*: everyone changes over on the same day.' },
      {
        say: 'Weeks 0 to 3: business as usual while everyone is trained. Then, on changeover day, the old system is switched off and everyone moves to the new one at once.',
        async run(s) { await advance(s, 3); celebrate(s, ALL); await s.wait(500); }
      },
      {
        say: "Week 3½: a bug! Every team is hit at the same moment, and there's no old system to fall back on.",
        async run(s) { await advance(s, 3.4, 400); s.ring(s.X(3.4), s.L.chart[1] + 60, { r: 30, cls: 'is-bad' }); await advance(s, 4.6, 1000); }
      },
      {
        say: 'The fix arrives in week 5 and work resumes. Direct is the quickest and cheapest method, but the riskiest: if it fails, it fails for everyone.',
        async run(s) { await advance(s, 5, 400); celebrate(s, ALL); await advance(s, 8, 1600); await verdict(s); }
      }
    ],
    phased: [
      { say: '*Phased*: the new system arrives one module at a time. Every team switches its Orders module first, then Stock, then Payroll.' },
      {
        say: 'Week 2: the new Orders module goes live for everyone. Stock and Payroll stay on the old system for now.',
        async run(s) { await advance(s, 2); celebrate(s, ALL, 0); await s.wait(500); }
      },
      {
        say: 'Week 4: the Stock module goes live, and a bug hits it. Only Stock is affected; Orders keeps working.',
        async run(s) { await advance(s, 4); celebrate(s, ALL, 1); await advance(s, 4.4, 400); await advance(s, 5, 700); }
      },
      {
        say: 'Week 6: Payroll switches over. Each change is small and easier to manage, but the whole changeover takes the longest.',
        async run(s) { await advance(s, 6); celebrate(s, ALL, 2); await advance(s, 8, 1400); await verdict(s); }
      }
    ],
    parallel: [
      { say: '*Parallel*: the old and new systems run side by side until the new one has proved itself.' },
      {
        say: 'Week 2: the new system starts alongside the old one. Every team now enters everything twice, once in each system.',
        async run(s) { await advance(s, 2); celebrate(s, ALL); await s.wait(500); }
      },
      {
        say: 'Week 3: a bug in the new system! No harm done: the old system is still running, so work carries on while it is fixed.',
        async run(s) { await advance(s, 3); await s.wait(300); await advance(s, 4, 900); }
      },
      {
        say: "Week 6: the two systems' results match, so the old one is switched off. The safest method, but double the work makes it the most expensive.",
        async run(s) { await advance(s, 6); celebrate(s, ALL); await advance(s, 8, 1400); await verdict(s); }
      }
    ],
    pilot: [
      { say: '*Pilot*: one team trials the new system first, while everyone else keeps using the old one.' },
      {
        say: 'Week 2: the Sales team becomes the pilot and switches over.',
        async run(s) { await s.pop(s.offices[0].flag); await advance(s, 2); celebrate(s, [0]); await s.wait(500); }
      },
      {
        say: "Week 3: the pilot finds a bug. Only one team is affected, and it's fixed before anyone else switches.",
        async run(s) { await advance(s, 3); await s.wait(300); await advance(s, 4, 900); }
      },
      {
        say: 'Week 6: with the problems ironed out, everyone else switches over. Lower risk than direct, and cheaper than parallel.',
        async run(s) { await advance(s, 6); celebrate(s, [1, 2, 3]); await advance(s, 8, 1400); await verdict(s); }
      }
    ]
  };

  HSCAnim.define('implementation-methods', {
    title: 'System implementation methods: switching from the old system to the new',
    variantsLabel: 'Method',
    layouts: {
      wide: {
        size: [760, 486],
        offices: [[100, 176], [280, 176], [460, 176], [640, 176]],
        chart: [130, 256, 600], legend: [130, 418], legendGap: 130, verdict: [280, 456], verdictGap: 150
      },
      tall: {
        size: [400, 652],
        offices: [[104, 160], [296, 160], [104, 330], [296, 330]],
        chart: [98, 402, 286], legend: [24, 574], legendGap: 124, verdict: [72, 620], verdictGap: 128
      }
    },
    setup,
    variants: Object.keys(VARIANTS).map(id => ({ id, label: VARIANTS[id], beats: BEATS[id] }))
  });
})();
