/* Animated diagram: how HTTPS secures a connection.
   Networking Systems › Evaluate hardware and software for transmission of data (unsecured and encrypted data); Cybersecurity › encryption. */
(() => {
  const VARIANTS = { https: 'HTTPS', http: 'Plain HTTP', imposter: 'Imposter site' };
  const CARD = 'card 4111 1111 1111 1111';
  const CIPHER = 'Qx9#vL2@7!Kd e8$Wm&3Pz+r';
  const HASH = 'a3f9 c2e1';

  /* Scene-only cut-outs */

  function certificate(s, at, o = {}) {
    const g = s.g(s.root, 'pa-cert', at);
    const art = s.g(g);
    art.setAttribute('filter', 'url(#pa-cut)');
    s.el('rect', { x: -60, y: -42, width: 120, height: 84, rx: 4, class: 'f-paper' }, art);
    s.el('rect', { x: -55, y: -37, width: 110, height: 74, rx: 2, class: 'pa-cert-border' }, art);
    s.text(g, 'Certificate', { y: -24, cls: 'pa-cert-title' });
    s.text(g, 'shop.example', { x: -47, y: -9, anchor: 'start', cls: 'pa-mono', size: 10 });
    s.text(g, 'valid to 2027', { x: -47, y: 4, anchor: 'start', cls: 'pa-t-xs pa-muted', size: 9.5 });
    g.lock = s.padlock(g, { at: { x: -38, y: 27, s: .66 }, open: true });
    s.text(g, 'public key', { x: -28, y: 31, anchor: 'start', cls: 'pa-t-xs pa-muted', size: 8.5 });
    g.seal = s.g(g, null, { x: 38, y: 22, r: o.forged ? 14 : 0 });
    s.el('path', { d: 'M-8 6 L-11 20 L-5 16 L-1 21 Z M8 6 L11 20 L5 16 L1 21 Z', class: o.forged ? 'f-plum' : 'f-terra' }, g.seal);
    s.el('path', { d: o.forged ? 'M0 -13 L4 -10 L12 -9 L11 -2 L13 4 L7 8 L2 13 L-4 10 L-11 9 L-11 2 L-13 -4 L-8 -9 Z' : 'M0 -13 A13 13 0 1 1 -.01 -13 Z', class: o.forged ? 'f-plum' : 'f-terra' }, g.seal);
    s.text(g.seal, o.forged ? 'ok?' : 'CA', { y: 0, valign: 'middle', cls: 'pa-t-xs pa-on pa-strong' });
    return g;
  }

  function lockbox(s, at) {
    const g = s.g(s.front, 'pa-lockbox', at);
    const art = s.g(g);
    art.setAttribute('filter', 'url(#pa-cut)');
    s.el('rect', { x: -22, y: -14, width: 44, height: 30, rx: 4, class: 'f-kraft' }, art);
    s.el('rect', { x: -22, y: -14, width: 44, height: 9, rx: 3, class: 'f-shade' }, art);
    s.el('rect', { x: -4, y: -14, width: 8, height: 30, class: 'f-mustard' }, art);
    return g;
  }

  function warningPage(s, x, y, w, h) {
    const g = s.g(s.root, 'pa-warning', { x, y, o: 0 });
    s.el('rect', { x: 0, y: 0, width: w, height: h, rx: 2, class: 'f-terra' }, g);
    s.mark(g, false, { at: { x: w / 2, y: h * .3 }, r: 16 });
    s.text(g, 'Your connection\nis not private', { x: w / 2, y: h * .62, valign: 'middle', cls: 'pa-t-lg pa-on' });
    s.text(g, 'This certificate is not trusted.', { x: w / 2, y: h * .86, cls: 'pa-t-xs pa-on' });
    return g;
  }

  /* Setup */

  function setup(s) {
    const L = s.L;
    const [bx, by, bw, bh] = L.browser;
    const cw = bw, ch = bh - 72;
    // Content-area coordinates → scene coordinates
    const C = s.C = (x, y) => ({ x: bx + x, y: by + 72 + y });
    const secure = !s.is('http');

    s.el('path', { d: L.wire, class: 'pa-wire' }, s.back);
    s.text(s.back, 'the internet', { x: L.wireLabel[0], y: L.wireLabel[1], cls: 'pa-name' });

    s.win = s.browser(s.root, { at: { x: bx, y: by }, w: bw, h: bh, url: secure ? 'https://shop.example' : 'http://shop.example' });
    s.text(s.win.pages[0], secure ? 'connecting…' : 'shop.example', { x: cw - 12, y: ch - 14, anchor: 'end', cls: 'pa-t-xs pa-muted' });
    if (!secure) s.text(s.win, 'Not secure', { x: bw - 18, y: 58, anchor: 'end', cls: 'pa-t-xs is-bad pa-strong' });
    s.addrLock = s.padlock(s.win.lock, { tone: 'sage', at: { s: .55, o: 0 } });

    // The shop (or Eve's fake one) and its private key
    const [kx, ky, kw, kh] = L.shop;
    const fake = s.is('imposter');
    s.shop = s.building(s.root, { at: { x: kx, y: ky }, w: kw, h: kh, roof: 'shop', tone: fake ? 'plum' : 'teal', sign: 'shop.example', face: true });
    if (!fake && secure) {
      s.priv = s.key(s.root, { at: { x: L.priv[0], y: L.priv[1] }, tone: 'plum' });
      s.text(s.root, 'private key\n(never leaves)', { x: L.priv[0] + 24, y: L.priv[1] - 3, anchor: 'start', cls: 'pa-t-xs pa-muted' });
    }

    // Eve, listening in (or running the fake shop)
    if (!fake) s.el('path', { d: L.tap, class: 'pa-tap' }, s.back);
    s.eve = s.folk(s.root, { at: { x: fake ? L.eveFake[0] : L.eve[0], y: fake ? L.eveFake[1] : L.eve[1] }, tone: 'mustard', hat: 'headphones', name: 'Eve', mood: 'smirk' });

    // The Certificate Authority vouches for sites (it signed the certificate earlier)
    if (secure) {
      s.ca = s.folk(s.root, { at: { x: L.ca[0], y: L.ca[1], s: .8 }, tone: 'plum', hat: 'tophat', mood: 'happy' });
      s.text(s.root, 'Certificate Authority', { x: L.ca[0], y: L.ca[1] + 16, cls: 'pa-name' });
    }

    // Handshake props, in the browser's content area
    s.cert = certificate(s, Object.assign(C(cw * .3, 56), { o: 0 }), { forged: fake });
    s.hashA = s.tag(s.root, Object.assign({ text: HASH, mono: true, size: 11, tone: 'mustard' }, C(cw * .76, 26)));
    s.hashB = s.tag(s.root, Object.assign({ text: fake ? '? ? ? ?' : HASH, mono: true, size: 11, tone: 'mustard' }, C(cw * .76, 86)));
    s.set(s.hashA, { o: 0 });
    s.set(s.hashB, { o: 0 });
    const m = C(cw * .76, 56);
    s.match = s.mark(s.root, !fake, { at: { x: m.x, y: m.y, o: 0 }, r: 10 });
    const p0 = C(cw * .3 + 62, 30), p1 = C(cw * .53, 10), p2 = C(cw * .76 - 46, 26);
    s.hashArrow = s.set(s.arrow(s.root, `M${p0.x} ${p0.y} Q${p1.x} ${p1.y} ${p2.x} ${p2.y}`), { o: 0 });
    const hw = C(cw * .53, 6);
    s.hashWord = s.set(s.text(s.root, 'hash', { x: hw.x, y: hw.y, cls: 'pa-name', size: 11.5 }), { o: 0 });
    s.caKey = s.key(s.root, { at: C(32, ch - 30), tone: 'sage' });
    const kl = C(54, ch - 27);
    s.caKeyLabel = s.text(s.root, 'trusted CA keys', { x: kl.x, y: kl.y, anchor: 'start', cls: 'pa-t-xs pa-muted' });
    if (!secure) { s.set(s.caKey, { o: 0 }); s.set(s.caKeyLabel, { o: 0 }); }

    // Checklist under the browser
    const rows = ['Signature is valid', 'Name matches', 'Not expired'];
    const [cx, cy] = L.check;
    s.check = s.g(s.root, 'pa-checklist', { x: cx, y: cy, o: 0 });
    const art = s.g(s.check);
    art.setAttribute('filter', 'url(#pa-cut)');
    s.el('rect', { x: -92, y: 0, width: 184, height: 20 + rows.length * 25, rx: 6, class: 'f-paper' }, art);
    s.el('path', { d: `M-82 0 V${20 + rows.length * 25}`, class: 'pa-margin' }, art);
    s.checks = rows.map((label, i) => {
      s.text(s.check, label, { x: -72, y: 22 + i * 25, anchor: 'start', valign: 'middle', cls: 'pa-t-sm' });
      const ok = s.mark(s.check, true, { at: { x: 72, y: 22 + i * 25, o: 0 }, r: 9 });
      const no = s.mark(s.check, false, { at: { x: 72, y: 22 + i * 25, o: 0 }, r: 9 });
      return { ok, no };
    });

    // Session key, the box it travels in and the padlock that seals it
    s.sessKey = s.key(s.root, { at: Object.assign(C(cw * .3, 44), { o: 0, s: 1.2 }), tone: 'mustard' });
    s.boxKey = s.key(s.front, { at: Object.assign(C(cw * .3, 44), { o: 0, s: 1.2 }), tone: 'mustard' });
    s.box = lockbox(s, Object.assign(C(cw * .62, 70), { o: 0 }));
    s.pub = s.padlock(s.front, { at: Object.assign(C(cw * .3 - 38, 83), { o: 0, s: .66 }), open: true, tone: 'mustard' });
    s.shopKey = s.key(s.root, { at: { x: L.shopKey[0], y: L.shopKey[1], o: 0, s: 1.2 }, tone: 'mustard' });

    // The message itself
    s.msg = s.tag(s.front, Object.assign({ text: CARD, mono: true, size: 10.5 }, C(cw / 2, ch / 2)));
    s.set(s.msg, { o: 0 });
    s.hello = s.envelope(s.front, { label: 'hello', at: Object.assign(C(cw - 10, 20), { o: 0 }) });
    s.warning = warningPage(s, bx + 1, by + 72, bw - 2, ch - 1);
  }

  /* Helpers */

  function eveSays(s, text, o = {}) {
    if (s.eveBubble) s.hide(s.eveBubble, { dur: 160 });
    const [ex, ey] = s.is('imposter') ? s.L.eveFake : s.L.eve;
    const dx = s.is('imposter') ? s.L.eveFakeDx : s.L.eveDx;
    const b = s.eveBubble = s.bubble(s.front, Object.assign({ text, at: { x: ex + 10, y: ey - 70 }, dx }, o));
    return s.pop(b);
  }

  function travel(s, el, toShop, o = {}) {
    const [ax, ay] = s.L.wireA, [zx, zy] = s.L.wireB;
    return toShop ? s.move(el, zx, zy, Object.assign({ dur: 1300 }, o)) : s.move(el, ax, ay, Object.assign({ dur: 1300 }, o));
  }

  async function sendHello(s) {
    const [ax, ay] = s.L.wireA;
    await s.pop(s.hello);
    await s.move(s.hello, ax, ay, { dur: 350 });
    await travel(s, s.hello, true);
    s.gaze(s.shop, 'wide');
    await s.hide(s.hello, { dur: 200 });
    s.gaze(s.shop, 'open');
  }

  async function certArrives(s) {
    const [zx, zy] = s.L.wireB;
    const home = s.at(s.cert);
    s.set(s.cert, { x: zx, y: zy, s: .5, o: 1 });
    await s.pop(s.cert, { s: .5, from: .6 });
    await travel(s, s.cert, false);
    await s.move(s.cert, home.x, home.y);
    await s.to(s.cert, { s: 1 }, { dur: 300, ease: 'spring' });
  }

  async function hashCert(s) {
    s.set(s.hashArrow, { o: 1 });
    s.show(s.hashWord);
    await s.draw(s.hashArrow);
    await s.pop(s.hashA);
  }

  async function tryCAKey(s, works) {
    const home = s.at(s.caKey);
    const seal = s.at(s.cert);
    const sx = seal.x + 38, sy = seal.y + 22;
    await s.move(s.caKey, sx - 22, sy + 2, { arc: 30 });
    if (!works) {
      await s.shake(s.caKey, { amp: 4 });
      await s.wobble(s.cert.seal, { amp: 10 });
      await s.move(s.caKey, home.x, home.y, { arc: 20 });
      return;
    }
    await s.to(s.caKey, { r: 90 }, { dur: 260 });
    await s.to(s.cert.seal, { s: 1.25 }, { dur: 160 });
    await s.to(s.cert.seal, { s: 1 }, { dur: 180 });
    const b = s.at(s.hashB);
    s.set(s.hashB, { x: sx, y: sy, o: 0 });
    await s.pop(s.hashB, { from: .3 });
    await s.move(s.hashB, b.x, b.y, { arc: 20 });
    s.to(s.caKey, { r: 0 }, { dur: 200 });
    await s.move(s.caKey, home.x, home.y, { arc: 20 });
  }

  function tick(s, i, ok) { return s.pop(ok ? s.checks[i].ok : s.checks[i].no); }

  function beats(v) {
    if (v === 'http') return [
      {
        say: "You type `http://shop.example`, with no S. Eve is listening on the network in between."
      },
      {
        say: "There's no handshake and no certificate. Your browser sends your card number straight away, as *plain text*.",
        async run(s) {
          await s.pop(s.msg);
          await s.move(s.msg, s.L.wireA[0], s.L.wireA[1], { dur: 400 });
          await travel(s, s.msg, true, { dur: 1600 });
          await s.move(s.msg, s.L.inbox[0], s.L.inbox[1]);
          s.gaze(s.shop, 'wide');
        }
      },
      {
        say: 'Eve reads every character as it goes past. She could copy it, or even change it before it arrives.',
        async run(s) {
          s.mood(s.eve, 'grin');
          await eveSays(s, s.compact ? 'card 4111 1111\n1111 1111' : CARD, { mono: true, size: 10.5 });
          await s.hop(s.eve, { h: 10, n: 2, dur: 320 });
        }
      },
      {
        say: "Without a certificate you can't even be sure it's the real shop. That's why browsers mark plain HTTP pages *Not secure*.",
        async run(s) {
          const [bx, by, bw] = s.L.browser;
          await s.ring(bx + bw - 50, by + 54, { r: 26, cls: 'is-bad' });
          s.ring(bx + bw - 50, by + 54, { r: 26, cls: 'is-bad' });
        }
      }
    ];

    if (v === 'imposter') return [
      {
        say: 'Eve sets up a fake shop and tricks the network into sending your shop.example traffic to her instead.'
      },
      {
        say: 'Your browser says hello and asks the site to prove who it is.',
        run: sendHello
      },
      {
        say: 'The fake shop sends a certificate for shop.example. No real *Certificate Authority* would sign it, so Eve signed it herself.',
        async run(s) {
          await certArrives(s);
          s.mood(s.ca, 'sad');
          const b = s.bubble(s.front, { text: 'Not my seal!', at: { x: s.L.ca[0] + 20, y: s.L.ca[1] - 52 }, dx: s.L.caDx });
          s.pop(b);
          await s.wobble(s.ca, { amp: 10 });
          s.mood(s.ca, 'flat');
        }
      },
      {
        say: "Your browser hashes the certificate, then tries the CA keys it trusts on the signature. None of them opens it, so the certificate can't be genuine.",
        async run(s) {
          await hashCert(s);
          await tryCAKey(s, false);
          await s.pop(s.hashB);
          await s.pop(s.match);
          await s.pop(s.check);
          await tick(s, 0, false);
        }
      },
      {
        say: 'The browser stops and shows a full-page warning. Your card number is never sent.',
        async run(s) {
          await s.all(['hashA', 'hashB', 'match', 'hashArrow', 'hashWord'].map(k => s.hide(s[k], { dur: 150 })));
          await s.show(s.warning);
          s.win.url.classList.add('is-bad');
          s.mood(s.eve, 'sad');
          await eveSays(s, 'Drat!');
          await s.wobble(s.eve, { amp: 6 });
        }
      }
    ];

    return [
      {
        say: 'You type `https://shop.example`. Before anything private is sent, your browser and the shop set up a secure connection. Eve is listening on the network in between.'
      },
      {
        say: 'Your browser says hello and asks the shop to prove who it is.',
        async run(s) {
          await sendHello(s);
          await eveSays(s, 'just a hello…');
        }
      },
      {
        say: 'The shop replies with its *SSL/TLS certificate*: its name, an expiry date and its *public key* (an open padlock), all signed by a *Certificate Authority*.',
        async run(s) {
          await certArrives(s);
          await eveSays(s, 'a certificate. Boring.');
          await s.hop(s.ca, { h: 8 });
        }
      },
      {
        say: "Is it genuine? Your browser *hashes* the certificate, then opens the CA's *digital signature* with the CA's public key, which came built into the browser. The two *hash values* match, so the certificate is real and unchanged.",
        async run(s) {
          await hashCert(s);
          await tryCAKey(s, true);
          await s.pop(s.match);
          const m = s.at(s.match);
          s.ring(m.x, m.y, { r: 14, cls: 'is-good' });
          await s.pop(s.check);
          await tick(s, 0, true);
        }
      },
      {
        say: "It also checks that the name matches the site you asked for and that the certificate hasn't expired. The shop is *authenticated*.",
        async run(s) {
          await tick(s, 1, true);
          await s.wait(200);
          await tick(s, 2, true);
        }
      },
      {
        say: "Now your browser makes a random *session key* and locks a copy in a box with the shop's open padlock. Anyone can snap that padlock shut, but only the shop's *private key* can open it.",
        async run(s) {
          await s.all(['hashA', 'hashB', 'match'].map(k => s.hide(s[k])).concat(s.to(s.cert, { o: .35, s: .8 }), s.hide(s.hashArrow), s.hide(s.hashWord)));
          const k = s.at(s.sessKey);
          await s.pop(s.sessKey, { s: 1.2 });
          s.burst(k.x, k.y, { n: 6, spread: 26 });
          await s.pop(s.box);
          s.set(s.boxKey, { o: 1 });
          const bb = s.at(s.box);
          await s.move(s.boxKey, bb.x, bb.y - 4, { arc: 24, r: 20 });
          await s.to(s.boxKey, { s: .5, o: 0 }, { dur: 200 });
          const lock = s.at(s.cert.lock);
          const c = s.at(s.cert);
          s.set(s.pub, { x: c.x + lock.x * .8, y: c.y + lock.y * .8, o: 1, s: .6 });
          s.set(s.cert.lock, { o: 0 });
          await s.move(s.pub, bb.x, bb.y + 4, { arc: 30 });
          await s.to(s.pub, { s: 1 }, { dur: 200 });
          await s.lock(s.pub, true);
          await s.hop(s.box, { h: 4, dur: 240 });
        }
      },
      {
        say: "The box crosses the internet. Eve takes a copy as it passes, but she can't open it: she doesn't have the private key.",
        async run(s) {
          const [ax, ay] = s.L.wireA;
          await s.all([s.move(s.box, ax, ay, { dur: 450 }), s.move(s.pub, ax, ay + 4, { dur: 450 })]);
          await s.all([travel(s, s.box, true, { dur: 1500 }), s.move(s.pub, s.L.wireB[0], s.L.wireB[1] + 4, { dur: 1500 })]);
          s.mood(s.eve, 'shock');
          await eveSays(s, 'locked?!');
          await s.shake(s.eve, { amp: 3 });
        }
      },
      {
        say: 'The shop opens the padlock with its private key. Now both sides hold the same session key, and nobody else does.',
        async run(s) {
          const b = s.at(s.box);
          await s.move(s.priv, b.x - 26, b.y + 6, { arc: 30 });
          await s.to(s.priv, { r: 90 }, { dur: 220 });
          await s.lock(s.pub, false);
          await s.all([s.hide(s.pub), s.move(s.priv, s.L.priv[0], s.L.priv[1], { arc: 20 }), s.to(s.priv, { r: 0 }, { dur: 400 })]);
          s.set(s.shopKey, { x: b.x, y: b.y, o: 1, s: .6 });
          await s.hide(s.box, { dur: 200 });
          await s.move(s.shopKey, s.L.shopKey[0], s.L.shopKey[1], { arc: 20 });
          await s.to(s.shopKey, { s: 1.2 }, { dur: 300, ease: 'spring' });
          const a = s.at(s.sessKey), z = s.at(s.shopKey);
          s.ring(a.x, a.y, { r: 20, cls: 'is-good' });
          s.ring(z.x, z.y, { r: 20, cls: 'is-good' });
          s.mood(s.eve, 'sad');
          await s.wait(300);
        }
      },
      {
        say: 'From here on, everything is encrypted with the fast *symmetric* session key. Your card number leaves as *cipher text* and the shop turns it back into *plain text*.',
        async run(s) {
          await s.hide(s.cert, { dur: 200 });
          await s.pop(s.msg);
          await s.hop(s.sessKey, { h: 6 });
          await s.scramble(s.msg.label, CIPHER, { dur: 900 });
          await s.move(s.msg, s.L.wireA[0], s.L.wireA[1], { dur: 400 });
          await travel(s, s.msg, true, { dur: 1500 });
          await eveSays(s, CIPHER.slice(0, 13) + '…?', { mono: true, size: 10.5 });
          await s.move(s.msg, s.L.inbox[0], s.L.inbox[1]);
          await s.hop(s.shopKey, { h: 6 });
          await s.scramble(s.msg.label, CARD, { dur: 900 });
          s.gaze(s.shop, 'wide');
        }
      },
      {
        say: "That's HTTPS: *asymmetric* keys prove who's who and deliver the session key, then *symmetric* encryption protects the data. Your browser shows the padlock.",
        async run(s) {
          s.gaze(s.shop, 'open');
          await s.pop(s.addrLock, { s: .55 });
          const [bx, by] = s.L.browser;
          s.burst(bx + 26, by + 54, { n: 8, spread: 30, tones: ['mustard', 'sage', 'teal'] });
          await s.hop(s.shop, { h: 5 });
        }
      }
    ];
  }

  HSCAnim.define('https', {
    title: 'How HTTPS secures a connection: certificates, keys and cipher text',
    variantsLabel: 'Connection',
    layouts: {
      wide: {
        size: [760, 476],
        browser: [16, 26, 272, 258],
        wire: 'M288 168 C352 146 392 190 424 168 S500 146 566 168', wireA: [300, 164], wireB: [556, 164], wireLabel: [508, 196],
        tap: 'M424 172 V336', eve: [424, 412], eveDx: 56, eveFake: [712, 424], eveFakeDx: -44,
        ca: [424, 92], caDx: 70, shop: [650, 300, 150, 138], priv: [598, 336], shopKey: [650, 108], check: [152, 310], inbox: [650, 262]
      },
      tall: {
        size: [400, 820],
        browser: [14, 14, 372, 258],
        wire: 'M200 272 C184 330 216 380 200 430 S184 480 200 540', wireA: [200, 290], wireB: [200, 520], wireLabel: [160, 420],
        tap: 'M204 440 C260 440 300 436 320 452', eve: [322, 530], eveDx: -30, eveFake: [340, 790], eveFakeDx: -30,
        ca: [80, 540], caDx: 24, shop: [200, 770, 160, 132], priv: [124, 802], shopKey: [96, 690], check: [100, 290], inbox: [200, 730]
      }
    },
    setup,
    variants: Object.keys(VARIANTS).map(id => ({ id, label: VARIANTS[id], beats: beats(id) }))
  });
})();
