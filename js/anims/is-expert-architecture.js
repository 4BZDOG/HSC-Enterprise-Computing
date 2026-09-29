/* Still diagram (concept): the parts of an expert system and how they connect.
   Intelligent systems › Key features of an expert system. */
HSCAnim.define('is-expert-architecture', {
  still: true,
  title: 'Concept diagram: the parts of an expert system',
  alt: 'Concept diagram of an expert system. The user talks to the user interface, which passes questions and answers to the inference engine. The inference engine reads the knowledge base of facts and IF-THEN rules and keeps the facts about the current case in working memory. An explanation facility tells the user how and why a conclusion was reached. A domain expert and a knowledge engineer build and edit the knowledge base.',
  layout: { size: [800, 440], minWidth: 800 },
  setup(s) {
    const L = s.g(s.back);
    const C = (x, y, w, h, text, tone) => s.node(s.root, { x, y, w, h, shape: 'card', tone, text, size: 14 });
    const user = C(58, 210, 96, 76, 'User', 'sheet');
    const ui = C(214, 210, 140, 104, 'User interface\nquestions,\nanswers and\nexplanations', 'sky-t');
    const ie = C(418, 210, 180, 104, 'Inference engine\nforward chaining\nbackward chaining', 'sage-t');
    const kb = C(700, 210, 170, 104, 'Knowledge base\nfacts and\nIF–THEN rules', 'teal-t');
    const wm = C(418, 60, 190, 64, 'Working memory\nfacts about this case', 'mustard-t');
    const ex = C(700, 60, 176, 70, 'Domain expert and\nknowledge engineer', 'plum-t');
    const xp = C(214, 372, 200, 64, 'Explanation facility\nhow and why', 'blush-t');
    const st = { straight: true, both: true };
    s.link(L, user, ui, st);
    s.link(L, ui, ie, st);
    s.link(L, ie, kb, Object.assign({ label: 'reads rules', labelSize: 13, labelAt: [561, 190] }, st));
    s.link(L, wm, ie, st);
    s.link(L, ex, kb, { straight: true, label: 'build and edit', labelSize: 13, labelAt: [640, 136] });
    s.link(L, ie, xp, { from: 'bottom', to: 'right' });
    s.link(L, xp, ui, { straight: true });
  }
});
