/* Interactive labs: small helpers shared by the hands-on tools on topic pages.
   Loaded before a page's own script (see js/pages/<slug>.js). Everything the tools show is written
   with textContent, never innerHTML, so nothing typed or stored can inject markup.
   Vanilla JS, no storage. The same file is in the sister site's js/ folder; keep the two identical.

   Labs.el(tag, cls, text)            create an element
   Labs.shell(host, cls, title, lead) fill a lab host with its kicker, title and lead
   Labs.table(headers, opts)          a lab table: { wrap, tbody, clear(), add(cells, rowClass) }
   Labs.sorter(host, config)          a "which category does this belong to?" practice set */
(() => {
  'use strict';

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };

  function shell(host, cls, title, lead) {
    host.replaceChildren();
    host.classList.add('lab');
    if (cls) host.classList.add(cls);
    host.append(el('p', 'lab-kicker', 'Try it'), el('h4', 'lab-title', title), el('p', 'lab-lead', lead));
    return host;
  }

  /* A lab table. Cells are strings or DOM nodes; opts.num lists the right-aligned numeric columns and
     opts.stack lets the rows turn into stacked cards on a phone (each cell shows its column name);
     opts.raw keeps the headings exactly as written (field names), instead of the small capitals style. */
  function table(headers, opts) {
    opts = opts || {};
    const num = opts.num || [];
    const wrap = el('div', 'lab-table-wrap');
    const tbl = el('table', 'lab-table' + (opts.stack ? ' lab-table--stack' : '') + (opts.raw ? ' lab-table--raw' : ''));
    const thead = el('thead'), hr = el('tr');
    headers.forEach((h, i) => hr.append(el('th', num.includes(i) ? 'num' : null, h)));
    thead.append(hr);
    const tbody = el('tbody');
    tbl.append(thead, tbody);
    wrap.append(tbl);
    return {
      wrap, tbl, tbody,
      clear() { tbody.replaceChildren(); },
      add(cells, rowClass) {
        const tr = el('tr', rowClass || null);
        cells.forEach((c, i) => {
          const td = el('td', num.includes(i) ? 'num' : null);
          td.setAttribute('data-label', headers[i]);
          if (c instanceof Node) td.append(c); else td.textContent = c;
          tr.append(td);
        });
        tbody.append(tr);
        return tr;
      }
    };
  }

  /* A practice set: read an item, choose its category, read why. One item at a time, with a running score.
     config = {
       cls, title, lead,
       noun: 'incident',                       used in "Incident 2 of 7"
       choices: [{ key: 'C', label: 'Confidentiality' }, ...],
       items: [{ text, ans: 'C', why: 'Reason.', extra: 'Optional second paragraph.', visual: () => Node }, ...],   visual is optional: a chart or picture shown under the text
       extraLabel: 'Privacy',                  prefix for each item's `extra` paragraph
       keepCase: true,                         do not lower-case the category name in feedback (acronyms)
       closing: 'Sentence shown under the final score.'
     } */
  function sorter(host, config) {
    const items = config.items, choices = config.choices;
    const noun = config.noun || 'question';
    const label = key => (choices.find(c => c.key === key) || {}).label || key;
    shell(host, config.cls, config.title, config.lead);

    const progress = el('p', 'lab-score');
    const card = el('div', 'lab-panel lab-card');
    const group = el('div', 'lab-seg');
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', config.groupLabel || 'Choose a category');
    const fb = el('div', 'lab-feedback');
    fb.hidden = true;
    fb.setAttribute('role', 'status');
    const actions = el('div', 'lab-actions');
    const next = el('button', 'lab-btn lab-btn--primary', 'Next ' + noun);
    next.type = 'button';
    next.hidden = true;
    actions.append(next);
    host.append(progress, card, group, fb, actions);

    let i = 0, right = 0, answered = false, done = false;
    const buttons = choices.map(c => {
      const b = el('button', null, c.label);
      b.type = 'button';
      b.addEventListener('click', () => answer(c.key));
      group.append(b);
      return [c.key, b];
    });

    function score(n) {
      progress.replaceChildren(el('b', null, String(right)), document.createTextNode(' correct of ' + n + ' answered.' + (n < items.length && !answered ? ' ' + noun.charAt(0).toUpperCase() + noun.slice(1) + ' ' + (i + 1) + ' of ' + items.length + '.' : '')));
    }

    function show() {
      const item = items[i];
      answered = false;
      card.replaceChildren(el('p', null, item.text));
      if (item.visual) card.append(item.visual());
      buttons.forEach(([, b]) => { b.disabled = false; b.removeAttribute('aria-pressed'); });
      group.hidden = false;
      fb.hidden = true;
      next.hidden = true;
      score(i);
    }

    function answer(key) {
      if (answered) return;
      answered = true;
      const item = items[i];
      const ok = key === item.ans;
      if (ok) right++;
      buttons.forEach(([k, b]) => { b.disabled = true; if (k === key) b.setAttribute('aria-pressed', 'true'); });
      fb.hidden = false;
      fb.className = 'lab-feedback ' + (ok ? 'is-good' : 'is-bad');
      fb.replaceChildren(el('p', null, (ok ? 'Correct: ' : 'Not quite. This one is ') + (config.keepCase ? label(item.ans) : label(item.ans).toLowerCase()) + '. ' + item.why));
      if (item.extra) fb.append(el('p', null, (config.extraLabel ? config.extraLabel + ': ' : '') + item.extra));
      next.hidden = false;
      next.textContent = i === items.length - 1 ? 'See my score' : 'Next ' + noun;
      score(i + 1);
      next.focus();
    }

    next.addEventListener('click', () => {
      if (done) { i = 0; right = 0; done = false; show(); return; }
      if (i === items.length - 1) {
        done = true;
        card.replaceChildren(el('p', null, 'You got ' + right + ' of ' + items.length + ' right. ' + (config.closing || '')));
        group.hidden = true;
        fb.hidden = true;
        next.textContent = 'Start again';
        progress.replaceChildren(el('b', null, String(right)), document.createTextNode(' correct of ' + items.length + '.'));
        return;
      }
      i++;
      show();
    });
    show();
  }

  window.Labs = { el, shell, table, sorter };
})();
