/* Animated diagram: data packets crossing the internet and being reassembled.
   Networking Systems › Network architecture and infrastructure (how data moves across a network). */
(() => {
  const VARIANTS = { ok: 'All arrive', lost: 'A packet is lost' };
  const CHUNKS = ['HEL', 'LO,', ' WO', 'RLD'];
  // Routes through the routers: a different path for each packet
  const ROUTES = [['R1', 'R3', 'R6'], ['R2', 'R5', 'R7'], ['R1', 'R4', 'R7'], ['R2', 'R4', 'R6']];
  const RESEND = ['R2', 'R5', 'R7'];
  const LINKS = [['S', 'R1'], ['S', 'R2'], ['R1', 'R3'], ['R1', 'R4'], ['R2', 'R4'], ['R2', 'R5'], ['R3', 'R6'], ['R4', 'R6'], ['R4', 'R7'], ['R5', 'R7'], ['R6', 'D'], ['R7', 'D']];
  const SPEED = [1, 1.9, 1.2, 1.45];   // hop time multipliers, giving arrival order 1, 3, 4, 2
  // Where each packet lands on arrival (fixed, so rewinding matches playing)
  const LANDING = { ok: [0, 3, 1, 2], lost: [0, 2, 3, 1] };

  function packet(s, i, at) {
    const g = s.g(s.front, 'pa-packet', at);
    const art = s.g(g);
    art.setAttribute('filter', 'url(#pa-cut)');
    s.el('rect', { x: -22, y: -14, width: 44, height: 28, rx: 4, class: 'f-paper' }, art);
    s.el('rect', { x: -22, y: -14, width: 13, height: 28, rx: 4, class: 'f-mustard' }, art);
    s.text(g, String(i + 1), { x: -15.5, y: 0, valign: 'middle', cls: 'pa-t-sm pa-ink-fixed pa-strong' });
    s.text(g, CHUNKS[i].replace(' ', '␣'), { x: 6, y: 0, valign: 'middle', cls: 'pa-mono', size: 11 });
    return g;
  }

  function setup(s) {
    const L = s.L, N = s.N = Object.assign({}, L.nodes);
    const [bx, by, bw, bh] = L.browser;
    s.win = s.browser(s.root, { at: { x: bx, y: by }, w: bw, h: bh, url: 'you: 192.168.1.5' });
    s.text(s.win.pages[0], 'HELLO, WORLD', { x: bw / 2, y: 34, cls: 'pa-mono pa-strong', size: 14 });
    N.S = L.out;
    const [dx, dy] = L.server;
    s.server = s.building(s.root, { at: { x: dx, y: dy }, w: 130, h: 100, roof: 'house', tone: 'teal', face: true, door: false });
    s.tag(s.root, { text: '93.184.216.34', mono: true, size: 10.5, x: dx, y: dy + 16 });
    N.D = L.in;

    LINKS.forEach(([a, b]) => s.el('path', { d: `M${N[a][0]} ${N[a][1]} L${N[b][0]} ${N[b][1]}`, class: 'pa-wire' }, s.back));
    s.routers = {};
    Object.keys(L.nodes).forEach(k => {
      const g = s.g(s.root, 'pa-router', { x: N[k][0], y: N[k][1] });
      const art = s.g(g);
      art.setAttribute('filter', 'url(#pa-cut)');
      s.el('circle', { r: 15, class: 'f-sage' }, art);
      s.el('path', { d: 'M-7 -3 H7 M3 -7 L7 -3 L3 1 M7 3 H-7 M-3 -1 L-7 3 L-3 7', class: 'pa-mark-ink' }, art);
      s.routers[k] = g;
    });
    s.text(s.back, 'routers', { x: L.routerLabel[0], y: L.routerLabel[1], cls: 'pa-name' });

    // Packets start inside the browser, lined up in order
    s.packets = CHUNKS.map((_, i) => packet(s, i, { x: L.start[0] + i * 48, y: L.start[1], o: 0 }));
    s.slots = CHUNKS.map((_, i) => [L.pile[0] + i * 48, L.pile[1]]);
    s.message = s.text(s.root, '', { x: L.pile[0] + 72, y: L.pile[1] + 36, cls: 'pa-mono pa-strong', size: 15 });

    // Header close-up
    const [hx, hy] = L.header;
    s.header = s.g(s.front, null, { x: hx, y: hy, o: 0 });
    const card = s.g(s.header);
    card.setAttribute('filter', 'url(#pa-cut)');
    s.el('rect', { x: 0, y: 0, width: 196, height: 96, rx: 6, class: 'f-paper' }, card);
    s.el('rect', { x: 0, y: 0, width: 196, height: 62, rx: 6, class: 'f-sheet' }, card);
    s.text(s.header, 'header', { x: 10, y: 15, anchor: 'start', cls: 'pa-t-xs pa-muted' });
    s.text(s.header, 'from  192.168.1.5\nto    93.184.216.34\nseq   1 of 4', { x: 10, y: 30, anchor: 'start', cls: 'pa-mono', size: 10.5, lh: 1.25 });
    s.text(s.header, 'payload', { x: 10, y: 78, anchor: 'start', cls: 'pa-t-xs pa-muted' });
    s.text(s.header, '"HEL"', { x: 64, y: 79, anchor: 'start', cls: 'pa-mono', size: 11 });
    s.resend = s.envelope(s.front, { label: 'resend #3', at: { x: N.D[0], y: N.D[1], o: 0, s: .6 } });
  }

  async function travel(s, i, route, delay, drop) {
    const p = s.packets[i];
    const N = s.N;
    await s.wait(delay);
    await s.move(p, N.S[0], N.S[1], { dur: 300 });
    for (const k of route) {
      await s.move(p, N[k][0], N[k][1], { dur: 520 * SPEED[i] });
      s.hop(s.routers[k], { h: 4, dur: 220 });
      if (drop === k) {
        await s.shake(s.routers[k], { amp: 4 });
        await s.all([s.to(p, { y: s.at(p).y + 40, r: 70, o: 0 }, { dur: 600, ease: 'in' })]);
        return;
      }
    }
    await s.move(p, N.D[0], N.D[1], { dur: 420 * SPEED[i] });
    const k = LANDING[s.variant][i];
    await s.move(p, s.slots[k][0], s.slots[k][1], { arc: 20, dur: 380 });
  }

  async function reassemble(s) {
    await s.all(s.packets.map((p, i) => s.move(p, s.slots[i][0], s.slots[i][1] + 2, { arc: 30, dur: 700 })));
    await s.type(s.message, 'HELLO, WORLD', { dur: 700 });
    s.gaze(s.server, 'wide');
    await s.hop(s.server, { h: 5 });
    s.burst(s.L.pile[0] + 72, s.L.pile[1] + 30, { n: 8, spread: 40, tones: ['mustard', 'teal', 'sage'] });
  }

  const common = [
    { say: 'Your browser needs to send HELLO, WORLD to the server at 93.184.216.34. Between you is a web of *routers*.' },
    {
      say: 'The message is split into small *data packets*. Each one has a *header* with the source and destination *IP addresses* and a *sequence number*.',
      async run(s) {
        for (const p of s.packets) await s.pop(p, { dur: 380 });
        await s.pop(s.header, { from: .8 });
      }
    }
  ];

  const BEATS = {
    ok: common.concat([
      {
        say: 'Each packet travels on its own. Routers read the destination IP and pass it along, so packets take *different routes* and arrive out of order.',
        async run(s) {
          await s.hide(s.header);
          await s.all(ROUTES.map((r, i) => travel(s, i, r, i * 160)));
        }
      },
      {
        say: 'At the server, TCP uses the sequence numbers to put the packets back in order, and the message is whole again.',
        run: reassemble
      }
    ]),
    lost: common.concat([
      {
        say: 'The packets set off by different routes, but a busy router drops packet 3.',
        async run(s) {
          await s.hide(s.header);
          await s.all(ROUTES.map((r, i) => travel(s, i, r, i * 160, i === 2 ? 'R4' : null)));
        }
      },
      {
        say: 'The server has packets 1, 2 and 4. The gap in the sequence numbers shows 3 is missing, so TCP asks for it again.',
        async run(s) {
          const N = s.N;
          s.gaze(s.server, 'squint');
          await s.pop(s.resend, { s: .6 });
          for (const k of RESEND.slice().reverse().concat('S')) await s.move(s.resend, N[k][0], N[k][1], { dur: 420 });
          await s.hide(s.resend);
          s.gaze(s.server, 'open');
        }
      },
      {
        say: 'The browser sends packet 3 again, this time by another route.',
        async run(s) {
          const p = s.packets[2];
          s.set(p, Object.assign({ r: 0, o: 0 }, { x: s.L.start[0] + 96, y: s.L.start[1] }));
          await s.pop(p);
          await travel(s, 2, RESEND, 0);
        }
      },
      {
        say: 'With every sequence number present, TCP puts the packets in order and the message is complete.',
        run: reassemble
      }
    ])
  };

  HSCAnim.define('packets', {
    title: 'Data packets: split, routed separately and reassembled',
    variantsLabel: 'Journey',
    layouts: {
      wide: {
        size: [760, 430],
        browser: [16, 60, 200, 156], out: [216, 200], start: [44, 192],
        nodes: { R1: [290, 110], R2: [290, 300], R3: [430, 70], R4: [430, 205], R5: [430, 340], R6: [560, 130], R7: [560, 280] },
        routerLabel: [430, 30], server: [680, 250], in: [616, 200], pile: [572, 330], header: [20, 244]
      },
      tall: {
        size: [400, 830],
        browser: [100, 10, 200, 158], out: [200, 184], start: [128, 142],
        nodes: { R1: [110, 300], R2: [290, 300], R3: [60, 420], R4: [200, 420], R5: [340, 420], R6: [120, 530], R7: [280, 530] },
        routerLabel: [350, 360], server: [200, 720], in: [200, 610], pile: [128, 772], header: [102, 178]
      }
    },
    setup,
    variants: Object.keys(VARIANTS).map(id => ({ id, label: VARIANTS[id], beats: BEATS[id] }))
  });
})();
