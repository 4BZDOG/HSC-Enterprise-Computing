/* Still diagram (concept): how a botnet is built and used for a DDoS attack.
   Cybersecurity › Cybercrime threats (bots and botnets). */
(() => {
  HSCAnim.define('cyber-botnet', {
    still: true,
    title: 'How a botnet is built and used in a DDoS attack',
    alt: 'Concept diagram. Step 1: an attacker (the botmaster) spreads malware to many devices such as computers, phones and routers, which become bots. Step 2: the attacker sends commands through a command and control server to all the bots. Step 3: the bots together flood a target web server with requests, so a genuine user cannot get through.',
    layouts: { wide: { size: [780, 400], minWidth: 780 }, tall: { size: [340, 760] } },
    setup(s) {
      const L = s.g(s.back), D = (type, label, x, y) => s.device(s.root, { type, label, x, y });
      const wide = !s.compact;
      const P = wide
        ? { atk: [70, 230], c2: [230, 210], grp: [340, 70, 210, 290], bots: [[400, 130], [490, 130], [400, 215], [490, 215], [400, 300], [490, 300]], tgt: [690, 190], user: [690, 330] }
        : { atk: [80, 60], c2: [80, 170], grp: [100, 250, 220, 250], bots: [[150, 310], [250, 310], [150, 395], [250, 395], [150, 470], [250, 470]], tgt: [150, 620], user: [270, 660] };
      const types = ['computer', 'phone', 'router', 'laptop', 'printer', 'computer'];
      const labels = ['Bot', 'Bot', 'Bot', 'Bot', 'Bot', 'Bot'];
      const [gx, gy, gw, gh] = P.grp;
      s.el('rect', { x: gx, y: gy, width: gw, height: gh, rx: 12, class: 'pa-group' }, s.back);
      s.text(s.back, 'Botnet: infected devices', { x: gx + gw / 2, y: gy + 22, cls: 'pa-group-t' });
      const atk = s.folk(s.root, { at: { x: P.atk[0], y: P.atk[1] }, tone: 'plum', hat: 'mask', mood: 'smirk' });
      s.text(s.root, 'Attacker\n(botmaster)', { x: P.atk[0], y: P.atk[1] + 22, cls: 'pa-name', size: 13.5 });
      D('server', 'Command and\ncontrol (C2)', P.c2[0], P.c2[1]);
      P.bots.forEach((b, i) => D(types[i], labels[i], b[0], b[1]));
      D('server', 'Target web\nserver', P.tgt[0], P.tgt[1]);
      const u = s.folk(s.root, { at: { x: P.user[0], y: P.user[1] }, tone: 'teal', mood: 'sad' });
      s.text(s.root, 'Genuine user:\ncannot get in', { x: P.user[0], y: P.user[1] + 22, cls: 'pa-name', size: 13.5 });
      if (wide) {
        s.link(L, [P.atk[0] + 34, P.atk[1] - 10], [P.c2[0] - 34, P.c2[1]], { straight: true, cls: 'is-bad' });
        s.link(L, [P.c2[0] + 32, P.c2[1]], [gx, P.c2[1]], { straight: true, cls: 'is-bad' });
        s.link(L, [gx + gw, P.tgt[1]], [P.tgt[0] - 34, P.tgt[1]], { straight: true, cls: 'is-bad' });
        s.mark(s.root, false, { at: { x: P.user[0] + 44, y: P.user[1] - 46 }, r: 11 });
        s.text(s.root, '1  Malware turns many\ndevices into bots', { x: 445, y: 32, cls: 'pa-chip-t', size: 13 });
        s.text(s.root, '2  Attacker commands\n    the bots', { x: 150, y: 168, cls: 'pa-chip-t', size: 13 });
        s.text(s.root, '3  Flood of\n    requests', { x: 616, y: 150, cls: 'pa-chip-t', size: 13 });
      } else {
        s.link(L, [P.atk[0], P.atk[1] + 42], [P.c2[0], P.c2[1] - 34], { straight: true, cls: 'is-bad' });
        s.link(L, [P.c2[0], P.c2[1] + 40], [P.c2[0], gy], { straight: true, cls: 'is-bad' });
        s.link(L, [gx + gw / 2, gy + gh], [P.tgt[0], P.tgt[1] - 36], { straight: true, cls: 'is-bad' });
        s.mark(s.root, false, { at: { x: P.user[0] + 40, y: P.user[1] - 46 }, r: 11 });
        s.text(s.root, '1  Malware turns\n    devices into bots', { x: 225, y: 46, cls: 'pa-chip-t', size: 13 });
        s.text(s.root, '2  Attacker\n    commands bots', { x: 215, y: 150, cls: 'pa-chip-t', size: 13 });
        s.text(s.root, '3  Flood of requests', { x: 100, y: 550, cls: 'pa-chip-t', size: 13 });
      }
    }
  });
})();
