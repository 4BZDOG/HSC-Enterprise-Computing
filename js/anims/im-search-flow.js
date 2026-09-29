/* Still diagram (NESA flowchart): search, filter, sort and select on a school-uniform shop.
   NESA Enterprise Computing Course Specifications, p.6 notation (input/output, process, decision, terminator).
   Interactive media and the user experience › User interaction in web-based systems. */
(() => {
  const X = 220;
  HSCAnim.define('im-search-flow', {
    still: true,
    title: 'Flowchart: search, filter and select a product in an online shop',
    alt: 'Flowchart. START. Input: search words. Process: search the catalogue. Decision: any results? No: output no results and suggestions, then back to the search input. Yes: output the list of results. Input: filter and sort choices. Process: update the list. Decision: suitable item found? No: return to the filter and sort input. Yes: process add item to cart. END.',
    layout: { size: [620, 760], minWidth: 620 },
    setup(s) {
      const L = s.g(s.back);
            const IO = (x, y, text, w = 210, h = 46) => s.node(s.root, { x, y, w, h, shape: 'io', text });
      const P = (y, text) => s.node(s.root, { x: X, y, w: 200, h: 44, shape: 'process', text });
      const D = (y, text) => s.node(s.root, { x: X, y, w: 190, h: 76, shape: 'decision', text });
      const start = s.node(s.root, { x: X, y: 30, w: 150, h: 40, shape: 'terminator', text: 'START' });
      const inp = IO(X, 100, 'INPUT search words');
      const srch = P(172, 'Search the catalogue');
      const d1 = D(256, 'Any results?');
      const none = IO(510, 256, "OUTPUT 'No results'\nand suggestions", 190, 56);
      const list = IO(X, 346, 'OUTPUT list of results');
      const filt = IO(X, 418, 'INPUT filter and\nsort choices', 210, 50);
      const upd = P(494, 'Update the list');
      const d2 = D(578, 'Suitable item\nfound?');
      const add = P(668, 'Add item to cart');
      const end = s.node(s.root, { x: X, y: 736, w: 150, h: 40, shape: 'terminator', text: 'END' });
      s.link(L, start, inp); s.link(L, inp, srch); s.link(L, srch, d1);
      s.link(L, d1, list, { label: 'Yes', labelSize: 13, labelAt: [X + 22, 310] });
      s.link(L, d1, none, { from: 'right', to: 'left', label: 'No', labelSize: 13, labelAt: [X + 116, 242] });
      s.link(L, none, s.port(inp, 'right'), { from: 'top', via: [[510, 100]] });
      s.link(L, list, filt); s.link(L, filt, upd); s.link(L, upd, d2);
      s.link(L, d2, add, { label: 'Yes', labelSize: 13, labelAt: [X + 24, 630] });
      s.link(L, d2, s.port(filt, 'right'), { from: 'right', via: [[490, 578], [490, 418]], label: 'No', labelSize: 13, labelAt: [X + 116, 564] });
      s.link(L, add, end);
    }
  });
})();
