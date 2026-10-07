/* Course Toolkit: labs built on the shared kit (css/labs.css, js/labs.js).
   1. Decision tree tracer: answer the questions of a decision tree one at a time and read off the path and the IF-THEN rule.
   Follows NESA's decision tree conventions: conditions are questions, each answer is a labelled branch and each path ends in an action.
   Everything shown is written with textContent. */
(function () {
  'use strict';
  var el = Labs.el;

  // A node is { q: 'question?', yes: node | 'Action', no: node | 'Action' }, the question written as a condition
  var TREES = [
    { id: 'car', name: 'Buying a car (NESA example)', cond: ['mileage is under 10 000 km', 'the type is an SUV', 'the colour is silver', 'optional accessories are included'],
      root: { q: 'Is the mileage under 10 000 km?', c: 'the mileage is under 10 000 km',
        yes: { q: 'Is the type an SUV?', c: 'the type is an SUV', yes: 'Buy', no: { q: 'Is the colour silver?', c: 'the colour is silver', yes: 'Buy', no: 'Do not buy' } },
        no: { q: 'Is the type an SUV?', c: 'the type is an SUV', yes: 'Buy', no: { q: 'Are there optional accessories?', c: 'there are optional accessories', yes: 'Buy', no: 'Do not buy' } } } },
    { id: 'laptop', name: 'Lending a school laptop', root: { q: 'Is the student in Year 11 or 12?', c: 'the student is in Year 11 or 12',
        yes: { q: 'Has a signed agreement been returned?', c: 'a signed agreement has been returned', yes: 'Issue the laptop', no: 'Ask the student to sign the agreement' },
        no: { q: 'Has a teacher approved the loan?', c: 'a teacher has approved the loan', yes: 'Issue the laptop', no: 'Refuse the loan' } } },
    { id: 'helpdesk', name: 'Help desk: a laptop will not work', root: { q: 'Is the power light on?', c: 'the power light is on',
        yes: { q: 'Does the screen show a picture?', c: 'the screen shows a picture', yes: { q: 'Is Wi-Fi connected?', c: 'Wi-Fi is connected', yes: 'No fault found', no: 'Restart the Wi-Fi adapter' }, no: 'Connect to an external screen' },
        no: { q: 'Is the charger plugged in?', c: 'the charger is plugged in', yes: 'Try a different charger', no: 'Plug in the charger' } } }
  ];

  function paths(node, trail, out) {
    if (typeof node === 'string') { out.push({ conds: trail.slice(), action: node }); return out; }
    paths(node.yes, trail.concat([{ c: node.c, ans: true }]), out);
    paths(node.no, trail.concat([{ c: node.c, ans: false }]), out);
    return out;
  }
  function ruleText(p) { return 'IF ' + p.conds.map(function (x) { return x.ans ? x.c : 'NOT (' + x.c + ')'; }).join(' AND ') + ' THEN ' + p.action; }

  function buildTree(host) {
    Labs.shell(host, 'tk-tree', 'Follow a path through a decision tree', 'Choose a tree and answer its questions with Yes or No. The tool shows the path you took, the final action and the IF-THEN rule that path stands for. Every tree has one rule for each final action.');
    var st = { tree: 0, trail: [] };
    var row = el('div', 'lab-row');
    var f = el('div', 'lab-field'), l = el('label', null, 'Decision tree'), sel = el('select'); l.htmlFor = sel.id = 'tk-tree-pick';
    TREES.forEach(function (t, i) { var o = el('option', null, t.name); o.value = i; sel.append(o); });
    f.append(l, sel); row.append(f); host.append(row);
    var card = el('div', 'lab-panel tk-tree-card'); host.append(card);
    var crumbs = el('ol', 'tk-tree-trail'); crumbs.setAttribute('aria-label', 'Path so far'); host.append(crumbs);
    var rules = el('div', 'lab-panel'); rules.append(el('h5', null, 'All the rules in this tree (one for each path)')); var ul = el('ul', 'tk-tree-rules'); rules.append(ul); host.append(rules);
    host.append(el('p', 'lab-note', 'NESA draws decision trees as boxes (rectangles), with every branch labelled and every path ending in an action. Here the same tree is shown as questions and rules so that you can trace a path step by step. Each condition is a yes-or-no question; the branches from a question never overlap and never leave a case out.'));
    var actions = el('div', 'lab-actions'); var back = el('button', 'lab-btn', 'Back one question'); back.type = 'button'; var again = el('button', 'lab-btn lab-btn--quiet', 'Start again'); again.type = 'button'; actions.append(back, again); host.insertBefore(actions, crumbs);

    function currentNode() { var n = TREES[st.tree].root; st.trail.forEach(function (a) { n = a ? n.yes : n.no; }); return n; }
    function update() {
      var t = TREES[st.tree], node = currentNode();
      card.replaceChildren();
      if (typeof node === 'string') {
        card.append(el('p', 'tk-tree-end', 'Final action'), el('p', 'tk-tree-action', node));
        var tr = []; var n = t.root; st.trail.forEach(function (a) { tr.push({ c: n.c, ans: a }); n = a ? n.yes : n.no; });
        card.append(el('p', null, ruleText({ conds: tr, action: node })));
      } else {
        card.append(el('p', 'tk-tree-q', node.q));
        var g = el('div', 'lab-seg'); g.setAttribute('role', 'group'); g.setAttribute('aria-label', 'Answer');
        [['Yes', true], ['No', false]].forEach(function (a) { var b = el('button', null, a[0]); b.type = 'button'; b.addEventListener('click', function () { st.trail.push(a[1]); update(); var nb = card.querySelector('.lab-seg button'); if (nb) nb.focus(); }); g.append(b); });
        card.append(g);
      }
      crumbs.replaceChildren();
      var n2 = t.root;
      st.trail.forEach(function (a) { var li = el('li'); li.append(el('span', null, n2.q), document.createTextNode(' '), el('span', 'lab-badge ' + (a ? 'is-good' : 'is-warn'), a ? 'Yes' : 'No')); crumbs.append(li); n2 = a ? n2.yes : n2.no; });
      back.disabled = !st.trail.length;
      ul.replaceChildren();
      var all = paths(t.root, [], []);
      var tNode = t.root, mine = [];
      all.forEach(function (p, i) {
        var li = el('li', 'tk-tree-rule'); li.textContent = ruleText(p);
        var match = st.trail.length <= p.conds.length && st.trail.every(function (a, k) { return p.conds[k].ans === a; });
        if (match && st.trail.length) li.classList.add('is-on');
        if (match && st.trail.length === p.conds.length) li.classList.add('is-done');
        ul.append(li);
      });
    }
    sel.addEventListener('change', function () { st.tree = +sel.value; st.trail = []; update(); });
    back.addEventListener('click', function () { st.trail.pop(); update(); });
    again.addEventListener('click', function () { st.trail = []; update(); });
    update();
  }

  /* ---------- SQL practice on the games schema used in the notes ---------- */
  function iso(s) { var p = s.split('/'); return p[2] + '-' + p[1] + '-' + p[0]; }
  var GAMES = {
    Publishers: { cols: [{ n: 'Publisher_ID', type: 'int' }, { n: 'Name', type: 'text' }], rows: [[1, 'Games Inc'], [2, 'PixelWorks'], [3, 'Southern Cross Games']] },
    Developers: { cols: [{ n: 'Developer_ID', type: 'int' }, { n: 'First_name', type: 'text' }, { n: 'Last_name', type: 'text' }], rows: [[1, 'Mia', 'Nguyen'], [2, 'Liam', "O'Brien"], [3, 'Priya', 'Patel'], [4, 'Tom', 'Walker']] },
    Games: { cols: [{ n: 'ID', type: 'int' }, { n: 'Name', type: 'text' }, { n: 'Release_date', type: 'date' }, { n: 'Cost', type: 'dec2' }, { n: 'Publisher_ID', type: 'int' }, { n: 'Developer_ID', type: 'int' }],
      rows: [[1, 'Reef Runner', '15/03/2022', 19.95, 1, 1], [2, 'Outback Dash', '02/06/2022', 9.99, 2, 2], [3, 'Star Harbour', '21/11/2022', 39.95, 1, 3], [4, 'Kelp Quest', '10/03/2023', 14.95, 3, 1], [5, 'Dingo Derby', '27/03/2023', 24.95, 2, 4], [6, 'Tidal Trader', '05/09/2023', 29.95, 1, 4], [7, 'Coral Code', '18/01/2022', 12.50, 3, 3], [8, 'Night Market', '30/03/2023', 34.95, 1, 2]].map(function (r) { r[2] = iso(r[2]); return r; }) }
  };
  function buildSql(host) {
    MiniSQL.lab(host, {
      cls: 'tk-sql', title: 'Run SQL on the games database',
      lead: 'These are the same three tables as the worked queries above. Choose a task, write the query with SELECT, FROM, WHERE and ORDER BY, and run it. Your result is checked against the expected one.',
      db: GAMES, keys: { Publishers: ['Publisher_ID'], Developers: ['Developer_ID'], Games: ['ID'] }, free: true,
      tasks: [
        { q: 'Show the name and release date of every game that costs more than 20, in alphabetical order by name.', hint: 'One table (Games). Numbers do not need quotes: WHERE Cost > 20. Sort with ORDER BY Name ASC.',
          answer: 'SELECT Name, Release_date\nFROM Games\nWHERE Cost > 20\nORDER BY Name ASC' },
        { q: 'Show the name and release date of all games released from 1 March 2022 to 31 March 2023, in alphabetical order by name.', hint: 'Two conditions joined by AND, with dates written as \'01/03/2022\' (day/month/year). Use >= and <=.',
          answer: "SELECT Name, Release_date\nFROM Games\nWHERE Release_date >= '01/03/2022' AND Release_date <= '31/03/2023'\nORDER BY Name ASC" },
        { q: 'Show the name of each game with the name of its publisher, for games released in 2023, in order of release date.', hint: 'Both Games and Publishers have a field called Name, so write Games.Name and Publishers.Name. Link the tables with Games.Publisher_ID = Publishers.Publisher_ID.',
          answer: "SELECT Games.Name, Publishers.Name\nFROM Games, Publishers\nWHERE Games.Publisher_ID = Publishers.Publisher_ID\nAND Games.Release_date >= '01/01/2023' AND Games.Release_date <= '31/12/2023'\nORDER BY Games.Release_date ASC" },
        { q: 'Show each developer\'s first name and last name, together with the name of the games they developed for the publisher Games Inc, in descending order of last name.', hint: 'Three tables in FROM: Games, Developers, Publishers. Two joins in WHERE (on Publisher_ID and on Developer_ID) and one condition on Publishers.Name.',
          answer: "SELECT Developers.First_name, Developers.Last_name, Games.Name\nFROM Games, Developers, Publishers\nWHERE Publishers.Name = 'Games Inc'\nAND Publishers.Publisher_ID = Games.Publisher_ID\nAND Developers.Developer_ID = Games.Developer_ID\nORDER BY Developers.Last_name DESC" }
      ]
    });
  }

  function init() {
    document.querySelectorAll('[data-tk="tree"]').forEach(buildTree);
    document.querySelectorAll('[data-tk="sql"]').forEach(buildSql);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
