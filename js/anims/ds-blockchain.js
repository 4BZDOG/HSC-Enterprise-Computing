/* Animated diagram: how a blockchain links blocks with hashes, why editing one block is detected,
   and how many copies of the ledger reach consensus. Hashes are real SHA-256 values, shortened to four
   hexadecimal characters so they fit on the page (each block hashes its previous hash and its data).
   Data Science › Blockchain (managing and verifying data). */
(() => {
  const VARIANTS = { tamper: 'Tamper with a block', ledger: 'Many copies' };
  const BLOCKS = [
    { data: 'Ava pays Ben $20', prev: '0000', hash: '12b7' },
    { data: 'Ben pays Cara $5', prev: '12b7', hash: 'af70' },
    { data: 'Cara pays Dan $12', prev: 'af70', hash: '7560' }
  ];
  const EDIT = { data: 'Ben pays Cara $500', hash: '2895' };
  const NEXT = { data: 'Dan pays Eli $8', prev: '7560', hash: '22d5' };
  const NODES = ['Node A', 'Node B', 'Node C'];

  /* One full block: header, data, previous hash and its own hash. Top-left at (x, y). */
  function block(s, i, [x, y, w, h], b) {
    const g = s.g(s.root, null, { x, y });
    const art = s.g(g);
    art.setAttribute('filter', 'url(#pa-cut)');
    const body = s.el('rect', { width: w, height: h, rx: 8, class: 'f-paper pa-outline' }, art);
    s.el('rect', { width: w, height: 32, rx: 8, class: 'f-sheet pa-outline' }, art);
    s.text(g, 'Block ' + (i + 1), { x: 12, y: 16, anchor: 'start', valign: 'middle', cls: 'pa-node-t pa-strong', size: 14 });
    s.text(g, 'Data', { x: 12, y: 50, anchor: 'start', valign: 'middle', cls: 'pa-node-t pa-muted', size: 13 });
    const dataT = s.text(g, b.data, { x: 12, y: 70, anchor: 'start', valign: 'middle', cls: 'pa-mono', size: 13.5 });
    s.text(g, 'Previous hash', { x: 12, y: 98, anchor: 'start', valign: 'middle', cls: 'pa-node-t pa-muted', size: 13 });
    const prevBg = s.el('rect', { x: w - 74, y: 86, width: 62, height: 24, rx: 4, class: 'f-sheet' }, g);
    const prevT = s.text(g, b.prev, { x: w - 43, y: 98, valign: 'middle', cls: 'pa-mono pa-strong', size: 14 });
    s.text(g, 'Hash', { x: 12, y: 126, anchor: 'start', valign: 'middle', cls: 'pa-node-t pa-muted', size: 13 });
    const hashBg = s.el('rect', { x: w - 74, y: 114, width: 62, height: 24, rx: 4, class: 'f-mustard' }, g);
    const hashT = s.text(g, b.hash, { x: w - 43, y: 126, valign: 'middle', cls: 'pa-mono pa-strong pa-ink-fixed', size: 14 });
    const ok = s.mark(g, true, { at: { x: w - 22, y: 16, o: 0 }, r: 10 });
    const bad = s.mark(g, false, { at: { x: w - 22, y: 16, o: 0 }, r: 10 });
    return { g, x, y, w, h, body, dataT, prevT, prevBg, hashT, hashBg, ok, bad };
  }

  const tone = (b, t) => b.body.setAttribute('class', 'f-' + t + ' pa-outline');

  /* A small block for the "many copies" variant. */
  function mini(s, [x, y, w, h], i, hash) {
    const g = s.g(s.root, null, { x, y });
    const art = s.g(g);
    art.setAttribute('filter', 'url(#pa-cut)');
    const body = s.el('rect', { width: w, height: h, rx: 6, class: 'f-paper pa-outline' }, art);
    s.text(g, 'Block ' + (i + 1), { x: w / 2, y: 15, valign: 'middle', cls: 'pa-node-t pa-muted', size: 13 });
    const hashT = s.text(g, hash, { x: w / 2, y: h - 14, valign: 'middle', cls: 'pa-mono pa-strong', size: 14 });
    return { g, x, y, w, h, body, hashT };
  }

  function setup(s) {
    const L = s.L;
    if (s.is('ledger')) return setupLedger(s, L);
    s.blocks = BLOCKS.map((b, i) => block(s, i, L.blocks[i], b));
    // Links: each block's hash is copied into the next block
    s.links = [0, 1].map(i => {
      const a = s.blocks[i], b = s.blocks[i + 1];
      const d = L.tall
        ? `M${a.x + a.w - 43} ${a.y + a.h} V${b.y}`
        : `M${a.x + a.w} ${a.y + 126} H${a.x + a.w + 24} V${b.y + 98} H${b.x}`;
      const p = s.arrow(s.back, d);
      s.set(p, { o: 0 });
      return p;
    });
    // A cross that lands on the second link when the hashes stop matching
    const l0 = s.blocks[1], l1 = s.blocks[2];
    const mid = L.tall ? [l0.x + l0.w - 43, (l0.y + l0.h + l1.y) / 2] : [(l0.x + l0.w + l1.x) / 2, l0.y + 112];
    s.linkBad = s.mark(s.front, false, { at: { x: mid[0], y: mid[1], o: 0 }, r: 11 });
    s.att = s.folk(s.root, { at: { x: L.att[0], y: L.att[1], o: 0 }, tone: 'plum', hat: 'mask', mood: 'smirk' });
    s.attLabel = s.text(s.root, 'Attacker', { x: L.att[0], y: L.att[1] + 18, cls: 'pa-name', size: 14 });
    s.set(s.attLabel, { o: 0 });
  }

  function setupLedger(s, L) {
    s.copies = NODES.map((name, r) => {
      const [lx, ly] = L.labels[r];
      s.text(s.root, name, { x: lx, y: ly, anchor: L.tall ? 'start' : 'middle', cls: 'pa-name', size: 14 });
      const row = [];
      for (let i = 0; i < 4; i++) {
        const m = mini(s, [L.rowX + i * L.step, L.rowY[r], L.mw, L.mh], i, i < 3 ? BLOCKS[i].hash : NEXT.hash);
        if (i === 3) s.set(m.g, { o: 0 });
        row.push(m);
      }
      row.arrows = [0, 1, 2].map(i => {
        const a = row[i], b = row[i + 1];
        const ar = s.arrow(s.back, `M${a.x + a.w} ${a.y + a.h / 2} H${b.x}`);
        if (i === 2) s.set(ar, { o: 0 });
        return ar;
      });
      return row;
    });
    // The vote card
    const [vx, vy, vw, vh] = L.card;
    const card = s.card = s.g(s.root, null, { x: vx, y: vy, o: 0 });
    const c = s.g(card);
    c.setAttribute('filter', 'url(#pa-cut)');
    s.el('rect', { width: vw, height: vh, rx: 6, class: 'f-paper' }, c);
    s.text(card, 'Comparing the copies', { x: 14, y: 22, anchor: 'start', cls: 'pa-cert-title', size: 14 });
    s.agree = s.text(card, 'Copies that agree: 0', { x: 14, y: 46, anchor: 'start', cls: 'pa-node-t', size: 14 });
    s.differ = s.text(card, 'Copies that differ: 0', { x: 14, y: 68, anchor: 'start', cls: 'pa-node-t', size: 14 });
  }

  /* Beats */

  const tamperBeats = [
    { say: 'Three *blocks* of a ledger. Each holds some data, the *hash* of the block before it and its own hash.' },
    {
      say: 'A *hash function* turns everything in a block into a short fixed-length fingerprint. Change one character and the fingerprint changes completely. Here block 1 is hashed.',
      async run(s) {
        const b = s.blocks[0];
        s.ring(b.x + b.w - 43, b.y + 126, { r: 22 });
        await s.scramble(b.hashT, BLOCKS[0].hash, { dur: 900 });
        await s.pop(b.ok, { from: .5 });
      }
    },
    {
      say: 'Block 2 stores block 1’s hash as its *previous hash*, and block 3 stores block 2’s. That linking is the *chain*.',
      async run(s) {
        s.links.forEach((p, i) => { s.show(p, { dur: 300 }); s.draw(p, { dur: 700, delay: i * 500 }); });
        await s.wait(900);
        s.ring(s.blocks[1].x + s.blocks[1].w - 43, s.blocks[1].y + 98, { r: 22 });
        s.ring(s.blocks[2].x + s.blocks[2].w - 43, s.blocks[2].y + 98, { r: 22, delay: 300 });
        await s.all([s.pop(s.blocks[1].ok, { from: .5 }), s.pop(s.blocks[2].ok, { from: .5, delay: 250 })]);
      }
    },
    {
      say: 'An attacker edits block 2, changing $5 to $500.',
      async run(s) {
        await s.pop(s.att);
        s.show(s.attLabel);
        const b = s.blocks[1];
        await s.type(b.dataT, EDIT.data, { dur: 700 });
        tone(b, 'terra-t');
        s.shake(b.g, { amp: 4 });
      }
    },
    {
      say: 'Block 2’s hash is recalculated from its new contents. It is now 2895, not af70: the fingerprint no longer matches.',
      async run(s) {
        const b = s.blocks[1];
        s.hide(b.ok, { dur: 120 });
        await s.scramble(b.hashT, EDIT.hash, { dur: 900 });
        await s.pop(b.bad, { from: .5 });
      }
    },
    {
      say: 'Block 3 still records af70 as its previous hash. The link no longer matches, so the chain is *broken* from block 2 onwards and anyone checking the chain can see it.',
      async run(s) {
        const b = s.blocks[2];
        s.links[1].style.fill = 'none';
        s.links[1].style.stroke = 'var(--pa-terra)';
        s.pop(s.linkBad, { from: .4 });
        s.ring(b.x + b.w - 43, b.y + 98, { r: 22, cls: 'is-bad' });
        tone(b, 'terra-t');
        s.hide(b.ok, { dur: 120 });
        await s.pop(b.bad, { from: .5 });
        await s.wobble(b.g, { amp: 2 });
      }
    },
    {
      say: 'To hide the edit, the attacker would have to recalculate block 3 and every later block, and on a real blockchain do it on most copies of the ledger before anyone notices.',
      async run(s) {
        s.mood && s.mood(s.att, 'flat');
        await s.wobble(s.att, { amp: 5 });
      }
    }
  ];

  const ledgerBeats = [
    { say: 'In a *distributed ledger* many computers, called *nodes*, each keep a full copy of the chain. Here three nodes hold identical copies.' },
    {
      say: 'A new transaction, Dan pays Eli $8, is sent to every node. Each node checks that it follows the rules, then the nodes *reach consensus* on the next block.',
      async run(s) {
        s.copies.forEach(row => s.show(row.arrows[2], { dur: 400 }));
        await s.all(s.copies.map((row, r) => s.pop(row[3].g, { from: .4, delay: r * 200 })));
        s.copies.forEach(row => s.ring(row[3].x + row[3].w / 2, row[3].y + row[3].h / 2, { r: 24 }));
        await s.wait(300);
      }
    },
    {
      say: 'Someone alters Node C’s copy of block 2. Its hash changes, and the later blocks in that copy no longer link to it.',
      async run(s) {
        const row = s.copies[2];
        tone(row[1], 'terra-t');
        await s.scramble(row[1].hashT, EDIT.hash, { dur: 700 });
        tone(row[2], 'terra-t');
        tone(row[3], 'terra-t');
        await s.shake(row[1].g, { amp: 4 });
      }
    },
    {
      say: 'The nodes compare copies. Two match and one differs, so the network accepts the majority copy. This is the *consensus* rule at work.',
      async run(s) {
        await s.pop(s.card, { from: .8 });
        await s.all([s.count(s.agree, 0, 2, { fmt: v => 'Copies that agree: ' + Math.round(v), dur: 600 }),
          s.count(s.differ, 0, 1, { fmt: v => 'Copies that differ: ' + Math.round(v), dur: 600 })]);
        s.ring(s.copies[2][1].x + s.copies[2][1].w / 2, s.copies[2][1].y + s.copies[2][1].h / 2, { r: 24, cls: 'is-bad' });
      }
    },
    {
      say: 'Node C’s altered copy is rejected and repaired from the others. To change the ledger for good, an attacker would have to control most of the nodes at once.',
      async run(s) {
        const row = s.copies[2];
        await s.scramble(row[1].hashT, BLOCKS[1].hash, { dur: 600 });
        [1, 2, 3].forEach(i => tone(row[i], 'sage-t'));
        s.burst(row[1].x + row[1].w / 2, row[1].y, { n: 8, spread: 30, tones: ['sage', 'mustard'] });
        await s.wait(500);
        [1, 2, 3].forEach(i => tone(row[i], 'paper'));
      }
    }
  ];

  HSCAnim.define('ds-blockchain', {
    title: 'Blockchain: hashes link the blocks, so an edited block breaks the chain and the copies must agree',
    variantsLabel: 'Story',
    layouts: {
      wide: {
        size: [760, 350],
        blocks: [[30, 34, 200, 146], [280, 34, 200, 146], [530, 34, 200, 146]],
        att: [380, 318], note: [380, 340],
        rowX: 150, step: 148, mw: 112, mh: 50, rowY: [24, 104, 184],
        labels: [[76, 49], [76, 129], [76, 209]], card: [230, 256, 300, 84]
      },
      tall: {
        size: [400, 720], tall: true,
        blocks: [[50, 24, 300, 146], [50, 224, 300, 146], [50, 424, 300, 146]],
        att: [200, 690], note: [200, 715],
        rowX: 26, step: 90, mw: 76, mh: 50, rowY: [70, 230, 390],
        labels: [[26, 52], [26, 212], [26, 372]], card: [50, 530, 300, 84]
      }
    },
    setup,
    variants: [
      { id: 'tamper', label: VARIANTS.tamper, beats: tamperBeats },
      { id: 'ledger', label: VARIANTS.ledger, beats: ledgerBeats }
    ]
  });
})();
