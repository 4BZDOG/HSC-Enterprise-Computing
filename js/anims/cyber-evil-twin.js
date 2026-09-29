/* Animated diagram: an evil twin Wi-Fi network, with and without HTTPS.
   Cybersecurity › Social networking vulnerabilities (evil twins); Hardware and software protection (encryption). */
(() => {
  const SSID = 'Cafe_Free_WiFi';
  const SECRET = 'password: sunny22';
  const CIPHER = 'Qx9#vL2@7!Kd';

  function setup(s) {
    const L = s.L;
    const g = s.g(s.back);
    s.link(g, L.lineA, L.lineB, { straight: true, head: false, cls: 'is-net' });
    s.net = s.device(s.root, { type: 'internet', label: 'Internet', x: L.net[0], y: L.net[1] });
    s.router = s.device(s.root, { type: 'router', label: 'Cafe router', x: L.router[0], y: L.router[1] });
    s.tagReal = s.tag(s.root, { text: SSID, mono: true, size: 13, x: L.tagReal[0], y: L.tagReal[1] });
    s.set(s.tagReal, { o: 0 });

    s.laptop = s.device(s.root, { type: 'laptop', label: "Attacker's laptop", x: L.laptop[0], y: L.laptop[1] });
    s.set(s.laptop, { o: 0 });
    s.mal = s.folk(s.root, { at: { x: L.mal[0], y: L.mal[1], o: 0 }, tone: 'plum', hat: 'mask', mood: 'smirk' });
    s.tagEvil = s.tag(s.root, { text: SSID, mono: true, size: 13, tone: 'plum', on: true, x: L.tagEvil[0], y: L.tagEvil[1] });
    s.set(s.tagEvil, { o: 0 });

    // radio waves from the evil twin towards you
    s.waves = s.g(s.root, null, { x: L.laptop[0], y: L.laptop[1] - 12, r: L.waveAngle, o: 0 });
    [26, 44, 62].forEach(r => {
      const a = 38 * Math.PI / 180, cx = r * Math.cos(a), cy = r * Math.sin(a);
      s.el('path', { d: `M${cx} ${-cy} A${r} ${r} 0 0 1 ${cx} ${cy}`, class: 'pa-tap' }, s.waves);
    });

    s.you = s.folk(s.root, { at: { x: L.you[0], y: L.you[1] }, tone: 'teal', mood: 'happy' });
    s.text(s.root, 'You, on your phone', { x: L.you[0], y: L.you[1] + 20, cls: 'pa-name', size: 13.5 });

    s.msg = s.envelope(s.front, { at: { x: L.you[0], y: L.you[1] - 30, o: 0 } });
    s.msg.note = s.tag(s.msg, { text: 'join?', mono: true, size: 13, y: -34 });
    s.warn = s.tag(s.front, { text: 'Certificate warning', tone: 'terra', on: true, size: 12, x: L.you[0] + (L.warnDx || 0), y: L.you[1] - 96 });
    s.set(s.warn, { o: 0 });
  }

  function say(s, who, text, o = {}) {
    if (s.said) s.hide(s.said, { dur: 140 });
    const at = who === 'mal' ? { x: s.L.mal[0] + 8, y: s.L.mal[1] - 66 } : { x: s.L.you[0] + 8, y: s.L.you[1] - 66 };
    const dx = who === 'mal' ? (s.L.malDx || 0) : (s.L.youDx || 0);
    const b = s.said = s.bubble(s.front, Object.assign({ text, at, dx }, o));
    return s.pop(b);
  }

  async function reset(s) { if (s.said) await s.hide(s.said, { dur: 160 }); }

  const shared = [
    {
      say: 'You are in a cafe. The real Wi-Fi is called *Cafe_Free_WiFi*. Your phone remembers that name and joins it automatically whenever it hears it.',
      async run(s) { await s.pop(s.tagReal); }
    },
    {
      say: 'Mallory sets up an *evil twin*: a rogue access point broadcasting the same name. Anyone can choose any network name, and an open network cannot prove who runs it.',
      async run(s) {
        await s.pop(s.laptop);
        await s.pop(s.mal);
        await s.pop(s.tagEvil);
        s.mood(s.mal, 'grin');
        await s.hop(s.mal, { h: 8 });
      }
    },
    {
      say: 'Your phone hears two networks with one name. Mallory is closer, so that signal is stronger, and your phone joins the evil twin without asking.',
      async run(s) {
        await s.pop(s.waves, { from: .6 });
        await s.pop(s.msg);
        await s.move(s.msg, s.L.laptop[0], s.L.laptop[1] - 26, { dur: 1100, arc: 30 });
        await s.hide(s.msg, { dur: 200 });
        await say(s, 'you', 'Connected!');
        await s.hop(s.you, { h: 8 });
      }
    }
  ];

  const plain = [
    ...shared,
    {
      say: 'You log in to a site over plain *HTTP*. Your traffic now passes through Mallory’s laptop, and nothing is scrambled, so Mallory can read your password.',
      async run(s) {
        await reset(s);
        s.msg.note.label.textContent = SECRET;
        await s.pop(s.msg);
        await s.move(s.msg, s.L.laptop[0], s.L.laptop[1] - 26, { dur: 1100, arc: 30 });
        s.mood(s.mal, 'grin');
        await say(s, 'mal', SECRET, { mono: true, size: 13 });
        await s.hop(s.mal, { h: 10, n: 2, dur: 300 });
      }
    },
    {
      say: 'Mallory passes your traffic on to the real router, so the site still works and you notice nothing. Sitting in the middle like this is a *man-in-the-middle* attack.',
      async run(s) {
        await reset(s);
        await s.move(s.msg, s.L.router[0], s.L.router[1] + 30, { dur: 1100, arc: -30 });
        await s.move(s.msg, s.L.net[0], s.L.net[1] + 30, { dur: 700 });
        await s.hide(s.msg, { dur: 200 });
        s.ring(s.L.laptop[0], s.L.laptop[1], { r: 34, cls: 'is-bad' });
      }
    },
    {
      say: 'Defences: check the network name with staff, switch off auto-join for open networks, use mobile data or a *VPN* on public Wi-Fi, and prefer networks that need a password or a certificate to join.',
      async run(s) {
        await reset(s);
        s.mood(s.you, 'happy');
        await say(s, 'you', 'Use mobile\ndata instead');
        s.burst(s.L.you[0], s.L.you[1] - 30, { n: 8, spread: 30, tones: ['mustard', 'sage', 'teal'] });
      }
    }
  ];

  const secure = [
    ...shared,
    {
      say: 'This time you use a site over *HTTPS*. Your device and the site agree a key, so your login travels as *cipher text* that only the site can turn back into plain text.',
      async run(s) {
        await reset(s);
        s.msg.note.label.textContent = SECRET;
        await s.pop(s.msg);
        await s.scramble(s.msg.note.label, CIPHER, { dur: 800 });
        await s.move(s.msg, s.L.laptop[0], s.L.laptop[1] - 26, { dur: 1100, arc: 30 });
        s.mood(s.mal, 'sad');
        await say(s, 'mal', CIPHER + '…?', { mono: true, size: 13 });
        await s.wobble(s.mal, { amp: 8 });
      }
    },
    {
      say: 'Mallory can still see which sites you contact and can block traffic. If Mallory shows a fake login page with a fake certificate, your browser warns you. The evil twin is still a risk, but the damage is limited.',
      async run(s) {
        await reset(s);
        await s.move(s.msg, s.L.router[0], s.L.router[1] + 30, { dur: 1100, arc: -30 });
        await s.hide(s.msg, { dur: 200 });
        await s.pop(s.warn);
        await s.wobble(s.you, { amp: 6 });
      }
    },
    {
      say: 'Defences work in layers: HTTPS protects the content, a VPN or mobile data avoids the rogue network, and turning off auto-join stops your phone choosing it in the first place.',
      async run(s) {
        await reset(s);
        await s.hide(s.warn, { dur: 200 });
        s.mood(s.you, 'happy');
        s.burst(s.L.you[0], s.L.you[1] - 30, { n: 8, spread: 30, tones: ['mustard', 'sage', 'teal'] });
        await s.hop(s.you, { h: 8 });
      }
    }
  ];

  HSCAnim.define('cyber-evil-twin', {
    title: 'An evil twin Wi-Fi network, with and without HTTPS',
    variantsLabel: 'Connection',
    layouts: {
      wide: {
        size: [760, 460],
        net: [670, 100], router: [450, 100], lineA: [486, 96], lineB: [640, 96], tagReal: [450, 42],
        laptop: [320, 300], mal: [430, 350], tagEvil: [320, 206], waveAngle: 160, you: [110, 380], malDx: 30, youDx: 20, warnDx: 60
      },
      tall: {
        size: [340, 760],
        net: [280, 100], router: [150, 100], lineA: [186, 96], lineB: [250, 96], tagReal: [150, 42],
        laptop: [210, 440], mal: [285, 500], tagEvil: [210, 346], waveAngle: 145, you: [70, 680], malDx: -40, youDx: 30, warnDx: 80
      }
    },
    setup,
    variants: [
      { id: 'http', label: 'Plain HTTP', beats: plain },
      { id: 'https', label: 'HTTPS', beats: secure }
    ]
  });
})();
