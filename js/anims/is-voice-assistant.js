/* Still diagram (concept): the steps a voice assistant follows from a spoken request to a reply.
   Intelligent systems › Intelligent agents and search engines. */
HSCAnim.define('is-voice-assistant', {
  still: true,
  title: 'Concept diagram: how a voice assistant handles a request',
  alt: 'Five steps in order. One, the wake word is heard by a small model on the device. Two, speech recognition turns the sound into text. Three, language understanding works out the intent and the details, such as play music in the kitchen. Four, the agent acts: it searches, answers a question or sends a command to a smart device. Five, the reply is spoken by text to speech or shown on a screen.',
  layouts: { wide: { size: [800, 236], minWidth: 800 }, tall: { size: [400, 800] } },
  setup(s) {
    const L = s.g(s.back), tall = s.compact;
    const steps = [
      ['1', 'Wake word', 'A small model on\nthe device listens\nfor one phrase', 'sky-t'],
      ['2', 'Speech to text', 'Sound is turned\ninto written words', 'sky-t'],
      ['3', 'Understand', 'Work out the intent\nand details: play,\nkitchen, jazz', 'sage-t'],
      ['4', 'Act', 'Search, answer or\nsend a command\nto a smart device', 'teal-t'],
      ['5', 'Reply', 'Speak the answer\nor show it on\na screen', 'plum-t']
    ];
    const nodes = steps.map(([n, title, sub, tone], i) => {
      const x = tall ? 200 : 78 + i * 161, y = tall ? 74 + i * 150 : 104;
      const c = s.node(s.root, { x, y, w: tall ? 330 : 140, h: tall ? 112 : 150, shape: 'card', tone });
      const ty = tall ? y - 34 : y - 50;
      s.text(s.root, n + '. ' + title, { x, y: ty, cls: 'pa-t pa-strong', size: 14.5 });
      s.text(s.root, sub, { x, y: ty + (tall ? 42 : 58), cls: 'pa-t', size: 13.5, lh: 1.3 });
      return c;
    });
    for (let i = 0; i < 4; i++) s.link(L, nodes[i], nodes[i + 1], { from: tall ? 'bottom' : 'right', to: tall ? 'top' : 'left' });
    if (!tall) s.text(s.root, 'A spoken request becomes text, then an intent, then an action, then a reply.', { x: 400, y: 218, cls: 'pa-t pa-soft', size: 13.5 });
  }
});
