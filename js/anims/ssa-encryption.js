/* Still diagram (concept): symmetric and asymmetric encryption, and how HTTPS uses both.
   Cybersecurity › Security awareness (password protection, encryption and permissions). */
(() => {
  function panel(s, x, y, w, h, title, tone) {
    const g = s.g(s.back);
    s.el('rect', { x, y, width: w, height: h, rx: 12, class: 'f-' + tone }, g).setAttribute('filter', 'url(#pa-cut)');
    s.text(s.root, title, { x: x + w / 2, y: y + 26, cls: 'pa-title' });
  }

  // One row of the story: sender, message tag, arrow, cipher tag, arrow, receiver.
  function row(s, x, y, w, o) {
    const a = s.folk(s.root, { at: { x: x + 34, y: y + 40, s: .8 }, tone: 'teal', name: 'Alice' });
    const b = s.folk(s.root, { at: { x: x + w - 34, y: y + 40, s: .8 }, tone: 'mustard', name: 'Bob' });
    const mid = x + w / 2;
    s.tag(s.root, { text: 'HELLO', mono: true, x: x + 110, y: y + 6, w: 70 });
    s.link(s.root, [x + 150, y + 6], [mid - 42, y + 6], { from: 'right', to: 'left' });
    s.tag(s.root, { text: 'x9#Qv', mono: true, x: mid, y: y + 6, w: 76, tone: 'plum', on: true });
    s.link(s.root, [mid + 42, y + 6], [x + w - 150, y + 6], { from: 'right', to: 'left' });
    s.tag(s.root, { text: 'HELLO', mono: true, x: x + w - 110, y: y + 6, w: 70 });
    o.left(x + (mid - 42 + x + 150) / 2 - x, y);
    o.right(mid + 42 + (x + w - 150 - mid - 42) / 2, y);
  }

  HSCAnim.define('ssa-encryption', {
    still: true,
    title: 'Symmetric and asymmetric encryption',
    alt: 'Symmetric: Alice and Bob share one secret key, which both encrypts and decrypts. Asymmetric: Bob publishes an open padlock (public key) that anyone can lock; only his private key opens it. HTTPS uses asymmetric encryption to share a session key, then fast symmetric encryption.',
    layouts: {
      wide: { size: [760, 430], panels: [[16, 16, 356, 318], [388, 16, 356, 318]], note: [380, 390] },
      tall: { size: [400, 760], panels: [[12, 12, 376, 310], [12, 336, 376, 310]], note: [200, 712] }
    },
    setup(s) {
      const [[ax, ay, aw, ah], [bx, by, bw, bh]] = s.L.panels;
      panel(s, ax, ay, aw, ah, 'Symmetric: one shared key', 'sage-t');
      panel(s, bx, by, bw, bh, 'Asymmetric: a key pair', 'plum-t');

      // Symmetric
      row(s, ax, ay + 130, aw, {
        left: (x, y) => s.key(s.root, { at: { x: ax + aw * .33, y: y - 36 }, tone: 'mustard' }),
        right: (x, y) => s.key(s.root, { at: { x: ax + aw * .67, y: y - 36 }, tone: 'mustard' })
      });
      s.text(s.root, 'encrypt', { x: ax + aw * .33, y: ay + 130 + 34, cls: 'pa-chip-t' });
      s.text(s.root, 'decrypt', { x: ax + aw * .67, y: ay + 130 + 34, cls: 'pa-chip-t' });
      s.text(s.root, 'The same secret key locks and unlocks.\nFast (e.g. AES-256), but the key must\nreach Bob safely first.', { x: ax + aw / 2, y: ay + 250, cls: 'pa-t', size: 13, lh: 1.35 });

      // Asymmetric
      row(s, bx, by + 130, bw, {
        left: (x, y) => s.padlock(s.root, { at: { x: bx + bw * .33, y: y - 36 }, tone: 'mustard' }),
        right: (x, y) => s.key(s.root, { at: { x: bx + bw * .67, y: y - 36 }, tone: 'plum' })
      });
      s.text(s.root, "Bob's\npublic key", { x: bx + bw * .33, y: by + 130 + 34, cls: 'pa-chip-t', lh: 1.15 });
      s.text(s.root, "Bob's\nprivate key", { x: bx + bw * .67, y: by + 130 + 34, cls: 'pa-chip-t', lh: 1.15 });
      s.text(s.root, 'Anyone can snap Bob\'s padlock shut;\nonly his private key opens it. Slower\n(e.g. RSA), but nothing secret is shared.', { x: bx + bw / 2, y: by + 250, cls: 'pa-t', size: 13, lh: 1.35 });

      const [nx, ny] = s.L.note;
      s.node(s.root, { x: nx, y: ny, w: s.compact ? 376 : 700, h: s.compact ? 70 : 52, shape: 'card', tone: 'mustard-t', size: 13.5, text: s.compact ? 'HTTPS uses both: asymmetric keys share\na one-time session key, then fast\nsymmetric encryption protects the data.' : 'HTTPS uses both: asymmetric keys safely share a one-time session key,\nthen fast symmetric encryption protects the data.' });
    }
  });
})();
