/* Animated diagram: training a linear regression model by gradient descent.
   Data Science › Processing and presenting data (machine learning and statistical modelling, regression). */
(() => {
  // Hours studied and exam scores (the same data as the Types of Algorithms example)
  const XS = [1, 2, 3, 4, 5, 6, 7, 8];
  const YS = [45, 55, 60, 65, 70, 75, 80, 88];
  const N = XS.length, MID = 4.5;
  const VARIANTS = { right: 'Just right', small: 'Too small', big: 'Too big' };
  const RATE = { right: 0.06, small: 0.006, big: 0.2 };
  const EPOCHS = { right: 40, small: 40, big: 12 };

  // The line is m·(x − 4.5) + b, so c = b − 4.5m. Centring x keeps the steps well behaved.
  const predict = (p, x) => p.m * (x - MID) + p.b;
  const intercept = p => p.b - p.m * MID;
  const mse = p => XS.reduce((a, x, i) => a + (predict(p, x) - YS[i]) ** 2, 0) / N;

  function train(rate, epochs) {
    const P = [{ m: 0, b: 50 }];
    for (let e = 0; e < epochs; e++) {
      const p = P[P.length - 1];
      let gm = 0, gb = 0;
      XS.forEach((x, i) => {
        const err = predict(p, x) - YS[i];
        gm += 2 * err * (x - MID) / N;
        gb += 2 * err / N;
      });
      P.push({ m: p.m - rate * gm, b: p.b - rate * gb });
    }
    return P;
  }

  const lerpP = (a, b, k) => ({ m: a.m + (b.m - a.m) * k, b: a.b + (b.b - a.b) * k });
  const fmt = (v, d) => (Math.abs(v) >= 1000 ? Math.round(v).toLocaleString('en-AU') : v.toFixed(d));

  /* Setup */

  function setup(s) {
    const L = s.L, v = s.variant;
    s.P = train(RATE[v], EPOCHS[v]);
    s.M = s.P.map(mse);
    s.cur = { p: s.P[0], e: 0 };
    s.vis = { line: 0, resid: 0, sq: 0, loss: 0 };

    const [px, py, pw, ph] = L.plot;
    const plot = s.plot(s.root, { x: px, y: py, w: pw, h: ph, xr: [0, 10], yr: [30, 100], xTicks: [0, 2, 4, 6, 8, 10], yTicks: [40, 60, 80, 100], xLabel: 'hours studied', yLabel: 'exam score' });
    s.X = plot.X; s.Y = plot.Y;
    const inside = s.g(s.root);
    inside.setAttribute('clip-path', plot.clip);
    s.squares = XS.map(() => s.el('rect', { class: 'pa-square' }, inside));
    s.fit = s.el('line', { class: 'pa-fit' }, inside);
    s.resid = XS.map(() => s.el('line', { class: 'pa-resid' }, inside));
    const dots = s.g(s.root);
    dots.setAttribute('filter', 'url(#pa-cut)');
    XS.forEach((x, i) => s.el('circle', { cx: s.X(x), cy: s.Y(YS[i]), r: 6.5, class: 'f-teal' }, dots));
    s.eq = s.text(s.root, '', { x: px + 14, y: py + 24, anchor: 'start', cls: 'pa-eq' });
    s.guide = s.g(s.root, null, { o: 0 });

    // The model, riding the end of its own line
    s.rider = s.folk(s.root, { tone: 'plum', mood: 'happy', at: { s: .6, o: 0 } });
    s.riderBubble = null;

    // Loss curve
    const [lx, ly, lw, lh] = L.loss;
    const loss = s.plot(s.root, { x: lx, y: ly, w: lw, h: lh, xr: [0, 40], yr: [0, 500], xTicks: [0, 10, 20, 30, 40], yTicks: [0, 250, 500], xLabel: 'epoch', yLabel: 'MSE', yLabelGap: 36 });
    s.LX = loss.X; s.LY = loss.Y;
    const lin = s.g(s.root);
    lin.setAttribute('clip-path', loss.clip);
    s.lossPath = s.el('path', { class: 'pa-loss' }, lin);
    s.lossDot = s.el('circle', { r: 4.5, class: 'f-plum' }, lin);
    s.offChart = s.text(s.root, '↑ off the chart!', { x: lx + lw - 4, y: ly + 14, anchor: 'end', cls: 'pa-t-sm is-bad pa-strong' });
    s.set(s.offChart, { o: 0 });

    // Read-outs
    const [rx, ry, rw] = L.readout;
    const rows = [['learning rate', String(RATE[v])], ['epoch', '0'], ['slope m', '0.00'], ['intercept c', '50.0'], ['MSE', '—']];
    const card = s.g(s.root, null, { x: rx, y: ry });
    const art = s.g(card);
    art.setAttribute('filter', 'url(#pa-cut)');
    s.el('rect', { x: 0, y: 0, width: rw, height: 14 + rows.length * 23, rx: 6, class: 'f-paper' }, art);
    s.read = {};
    rows.forEach(([label, val], i) => {
      const y = 19 + i * 23;
      s.text(card, label, { x: 14, y, anchor: 'start', valign: 'middle', cls: 'pa-t-sm pa-muted' });
      s.read[label] = s.text(card, val, { x: rw - 14, y, anchor: 'end', valign: 'middle', cls: 'pa-mono pa-strong' });
    });
    s.readCard = card;

    const [cx, cy] = L.code;
    s.code = s.g(s.root, null, { x: cx, y: cy, o: 0 });
    const codeArt = s.g(s.code);
    codeArt.setAttribute('filter', 'url(#pa-cut)');
    s.el('rect', { x: -112, y: -22, width: 224, height: 44, rx: 5, class: 'f-ink-fixed' }, codeArt);
    const best = s.P[s.P.length - 1];
    s.text(s.code, `model.coef_       → ${best.m.toFixed(2)}\nmodel.intercept_  → ${intercept(best).toFixed(1)}`, { y: 0, valign: 'middle', cls: 'pa-mono pa-code', size: 11, lh: 1.35 });

    render(s);
  }

  /* Drawing the current state */

  function render(s) {
    const { p, e } = s.cur, vis = s.vis;
    const [px, py, pw, ph] = s.L.plot;
    const Y = s.Y, X = s.X;

    s.fit.setAttribute('x1', X(0));
    s.fit.setAttribute('y1', Y(predict(p, 0)));
    s.fit.setAttribute('x2', X(10));
    s.fit.setAttribute('y2', Y(predict(p, 10)));
    s.fit.style.opacity = vis.line;

    XS.forEach((x, i) => {
      const y0 = Y(YS[i]), y1 = Y(predict(p, x));
      const r = s.resid[i];
      r.setAttribute('x1', X(x)); r.setAttribute('x2', X(x));
      r.setAttribute('y1', y0); r.setAttribute('y2', y0 + (y1 - y0) * vis.resid);
      r.style.opacity = vis.resid ? 1 : 0;
      const side = Math.abs(y1 - y0);
      const q = s.squares[i];
      q.setAttribute('x', X(x));
      q.setAttribute('y', Math.min(y0, y1));
      q.setAttribute('width', side * vis.sq);
      q.setAttribute('height', side);
      q.style.opacity = vis.sq ? 1 : 0;
    });

    const m = p.m, c = intercept(p);
    s.eq.textContent = vis.line ? `y = ${fmt(m, 2)}x ${c < 0 ? '−' : '+'} ${fmt(Math.abs(c), 1)}` : '';
    s.read.epoch.textContent = String(Math.round(e));
    s.read['slope m'].textContent = fmt(m, 2);
    s.read['intercept c'].textContent = fmt(c, 1);
    s.read.MSE.textContent = vis.sq ? fmt(mse(p) * Math.min(1, vis.sq * 1.2), 1) : '—';

    // Loss curve up to the current (possibly fractional) epoch
    const pts = [];
    const whole = Math.floor(e);
    for (let i = 0; i <= whole && i < s.M.length; i++) pts.push([s.LX(i), s.LY(s.M[i])]);
    if (e > whole) pts.push([s.LX(e), s.LY(mse(p))]);
    s.lossPath.setAttribute('d', vis.loss && pts.length ? 'M' + pts.map(q => q.map(n => n.toFixed(1)).join(' ')).join(' L') : '');
    const last = pts[pts.length - 1];
    s.lossDot.style.opacity = vis.loss ? 1 : 0;
    if (last) { s.lossDot.setAttribute('cx', last[0]); s.lossDot.setAttribute('cy', last[1]); }
    s.set(s.offChart, { o: vis.loss && mse(p) > 500 ? 1 : 0 });

    // The rider stands on the line near its right-hand end, tilting with it
    const rx = 9.1, ry = Y(predict(p, rx));
    const top = py + 18, bottom = py + ph;
    const slopePx = (Y(predict(p, 10)) - Y(predict(p, 0))) / (X(10) - X(0));
    const angle = Math.atan(slopePx) * 180 / Math.PI;
    s.set(s.rider, { x: X(rx), y: Math.min(bottom, Math.max(top, ry)) - 2, r: Math.max(-40, Math.min(40, angle * .6)) });
  }

  function step(s, from, to, dur) {
    const a = s.P[from], b = s.P[to];
    return s.tween({ dur, ease: 'inOut' }, k => {
      s.cur = { p: lerpP(a, b, k), e: from + (to - from) * k };
      render(s);
    });
  }

  async function run(s, from, to, each) {
    for (let e = from; e < to; e++) {
      await step(s, e, e + 1, each);
      if (s.is('big') && e % 2 === 0) s.mood(s.rider, 'shock');
    }
  }

  function riderSays(s, text) {
    if (s.riderBubble) s.hide(s.riderBubble, { dur: 150 });
    const r = s.at(s.rider);
    const b = s.riderBubble = s.bubble(s.front, { text, at: { x: r.x - 6, y: r.y - 36 }, dx: -40 });
    return s.pop(b);
  }

  /* Beats */

  const common = [
    {
      say: "Eight students' study hours and exam scores. Training a *linear regression* model means finding the line y = mx + c that fits them best."
    },
    {
      say: "Training starts with a guess: a flat line with m = 0 and c = 50. It's clearly wrong.",
      async run(s) {
        await s.tween({ dur: 600 }, k => { s.vis.line = k; render(s); });
        s.set(s.rider, { o: 1 });
        await s.pop(s.rider, { s: .6 });
      }
    },
    {
      say: 'Measure each error: the vertical gap between a point and the line, called the *residual*.',
      async run(s) {
        await s.tween({ dur: 900, ease: 'inOut' }, k => { s.vis.resid = k; render(s); });
      }
    },
    {
      say: 'Square every error and average the squares: the *mean squared error* (MSE). Squaring makes every error positive and punishes big misses most, so big squares mean a bad fit.',
      async run(s) {
        await s.tween({ dur: 1100, ease: 'out' }, k => { s.vis.sq = k; render(s); });
        s.vis.loss = 1;
        render(s);
        const d = s.lossDot;
        s.ring(+d.getAttribute('cx'), +d.getAttribute('cy'), { r: 10 });
      }
    }
  ];

  async function firstStep(s) {
    const up = predict(s.P[1], 9.5) > predict(s.P[0], 9.5);
    const x = s.X(9.6), y = s.Y(predict(s.P[0], 9.6));
    const arrow = s.arrow(s.guide, `M${x} ${y + (up ? -10 : 10)} V${y + (up ? -58 : 58)}`);
    s.text(s.guide, up ? 'tilt up' : 'tilt down', { x: x - 10, y: y + (up ? -34 : 38), anchor: 'end', cls: 'pa-name' });
    s.set(s.guide, { o: 1 });
    await s.draw(arrow, { dur: 500 });
    await s.wait(300);
    await step(s, 0, 1, 1400);
    await s.hide(s.guide);
  }

  const variants = {
    right: [
      {
        say: '*Gradient descent* works out which way to tilt and shift the line to shrink the squares, then takes one small step. The size of the step is the *learning rate*.',
        run: firstStep
      },
      {
        say: 'Repeat. Each pass through the data is an *epoch*. The squares shrink and the loss curve drops.',
        async run(s) { await run(s, 1, EPOCHS.right, 110); }
      },
      {
        say: 'The squares stop shrinking: the model has *converged*. The best line still has some error, but no other line has a smaller MSE. scikit-learn stores m and c as `model.coef_` and `model.intercept_`.',
        async run(s) {
          await s.pop(s.code, { from: .8 });
          s.mood(s.rider, 'grin');
          await s.hop(s.rider, { h: 10, n: 2, dur: 320 });
        }
      },
      {
        say: 'Now the model can predict. For 9 hours of study, `model.predict([[9]])` reads the answer off the line: about 93 marks.',
        async run(s) {
          const p = s.P[s.P.length - 1];
          const X = s.X, Y = s.Y, y9 = predict(p, 9);
          const [px, py, pw, ph] = s.L.plot;
          s.guide.replaceChildren();
          s.set(s.guide, { o: 1 });
          const up = s.arrow(s.guide, `M${X(9)} ${py + ph} V${Y(y9) + 8}`, { dashed: true });
          const across = s.arrow(s.guide, `M${X(9) - 8} ${Y(y9)} H${px + 4}`, { dashed: true });
          await s.draw(up, { dur: 600 });
          const star = s.sparkle(s.guide, { at: { x: X(9), y: Y(y9) }, tone: 'terra' });
          await s.pop(star, { s: 1.4 });
          await s.draw(across, { dur: 600 });
          const t = s.tag(s.guide, { text: y9.toFixed(1), mono: true, size: 11, x: px - 26, y: Y(y9), tone: 'mustard' });
          await s.pop(t);
        }
      }
    ],
    small: [
      {
        say: 'With a learning rate that is too small, gradient descent points the right way but each step barely moves the line.',
        run: firstStep
      },
      {
        say: 'After 40 epochs the line is still well below the points and the squares are still big. It would get there eventually, but training would take far longer, and computing time costs money.',
        async run(s) {
          await run(s, 1, EPOCHS.small, 110);
          s.mood(s.rider, 'flat');
          await riderSays(s, 'are we there yet?');
        }
      }
    ],
    big: [
      {
        say: 'With a learning rate that is too big, the step overshoots: the line tips too far and the squares get *bigger*, not smaller.',
        async run(s) {
          await firstStep(s);
          s.mood(s.rider, 'shock');
        }
      },
      {
        say: 'Every overshoot is bigger than the last. Instead of settling, the loss explodes: the model *diverges*. The fix is a smaller learning rate, which is part of tuning a model.',
        async run(s) {
          await run(s, 1, EPOCHS.big, 260);
          s.mood(s.rider, 'shock');
          await riderSays(s, 'whoaaa!');
        }
      }
    ]
  };

  HSCAnim.define('gradient-descent', {
    title: 'Training a regression model: gradient descent shrinks the squared errors',
    variantsLabel: 'Learning rate',
    layouts: {
      wide: {
        size: [760, 440],
        plot: [70, 22, 400, 340], loss: [548, 30, 196, 120], readout: [512, 214, 232], code: [628, 384]
      },
      tall: {
        size: [400, 790],
        plot: [60, 16, 322, 300], loss: [80, 400, 290, 110], readout: [30, 568, 340], code: [200, 748]
      }
    },
    setup,
    variants: Object.keys(VARIANTS).map(id => ({ id, label: VARIANTS[id], beats: common.concat(variants[id]) }))
  });
})();
