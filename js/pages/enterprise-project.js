/* Enterprise project: interactive widget.
   Development-approach chooser: six questions about a project score the five NESA approaches
   (waterfall, agile, prototyping, end-user, outsourcing) with simple, visible rules.
   Vanilla JS; the host holds a static fallback message if this file does not run. */
(() => {
  'use strict';

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };

  const APPROACHES = ['Waterfall (structured)', 'Agile', 'Prototyping', 'End-user', 'Outsourcing'];
  // Points for each answer, in the order of APPROACHES.
  const QUESTIONS = [
    { short: 'Requirements', text: 'How clear are the requirements?', options: [
      ['Clear and unlikely to change', [3, 0, 0, 1, 2]],
      ['Partly clear', [1, 2, 2, 1, 1]],
      ['Unclear, or likely to change', [0, 3, 3, 1, 0]]] },
    { short: 'Feedback', text: 'How available are the client and users for feedback?', options: [
      ['Rarely available', [2, 0, 0, 0, 2]],
      ['Sometimes available', [1, 1, 1, 1, 1]],
      ['Regularly available', [0, 3, 3, 2, 0]]] },
    { short: 'Size and risk', text: 'How big and how risky is the system?', options: [
      ['Small and low risk', [0, 1, 1, 3, 0]],
      ['Medium size or moderate risk', [2, 2, 2, 0, 1]],
      ['Large, or a failure would be costly or unsafe', [3, 2, 1, 0, 2]]] },
    { short: 'Skills', text: 'Does the team have the skills it needs?', options: [
      ['Has all the skills', [1, 1, 1, 1, 0]],
      ['Some skills are missing', [1, 1, 1, 0, 2]],
      ['Most skills are missing', [0, 0, 0, 0, 3]]] },
    { short: 'Users', text: 'Who will use the system?', options: [
      ['Only the builder or a few colleagues', [0, 1, 1, 3, 0]],
      ['One organisation', [1, 2, 2, 1, 1]],
      ['The public or many organisations', [2, 2, 1, 0, 2]]] },
    { short: 'Timing', text: 'When is a working version useful?', options: [
      ['A usable version is needed early', [0, 3, 2, 2, 1]],
      ['Only the finished system is useful', [2, 1, 1, 0, 1]]] }
  ];
  const PRESETS = [
    { name: 'ClubHub', answers: [1, 2, 1, 0, 1, 0] },
    { name: 'Hospital patient records', answers: [0, 1, 2, 1, 1, 1] },
    { name: 'Secretary’s own spreadsheet', answers: [0, 2, 0, 0, 0, 0] },
    { name: 'Start-up prototype', answers: [2, 2, 1, 1, 2, 0] }
  ];
  const RISKS = [
    'Building the wrong thing, and finding problems late.',
    'Scope creep and lighter documentation; needs committed users.',
    'Endless refinement, or a prototype mistaken for the finished product.',
    'No testing or documentation, and it depends on one person.',
    'Less control, communication gaps and dependence on the supplier.'
  ];

  function build(host) {
    host.replaceChildren();
    host.append(el('h4', null, 'Development approach chooser'));
    host.append(el('p', 'ep-lead', 'Answer six questions about a project. Each answer adds points to each approach, and the highest score is a starting point for your reasoning, not the answer.'));

    const presets = el('div', 'ep-presets');
    presets.append(el('span', 'ep-presets-label', 'Try an example:'));
    const btns = PRESETS.map((p, i) => {
      const b = el('button', 'ep-btn', p.name);
      b.type = 'button';
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => { apply(i); });
      presets.append(b);
      return b;
    });
    host.append(presets);

    const cols = el('div', 'ep-cols');
    const form = el('div', 'ep-form');
    const groups = QUESTIONS.map((q, qi) => {
      const fs = el('fieldset', 'ep-q');
      fs.append(el('legend', null, `${qi + 1}. ${q.text}`));
      const inputs = q.options.map(([label], oi) => {
        const lab = el('label', 'ep-opt');
        const inp = document.createElement('input');
        inp.type = 'radio';
        inp.name = `ep-q${qi}`;
        inp.value = String(oi);
        inp.addEventListener('change', () => { btns.forEach(b => b.setAttribute('aria-pressed', 'false')); update(); });
        lab.append(inp, el('span', null, label));
        fs.append(lab);
        return inp;
      });
      form.append(fs);
      return inputs;
    });
    const out = el('div', 'ep-out');
    out.setAttribute('aria-live', 'polite');
    cols.append(form, out);
    host.append(cols);
    host.append(el('p', 'ep-note', 'Real projects often blend approaches, for example structured requirements with agile delivery. The scores use simple rules chosen for teaching.'));

    function answers() {
      return groups.map(g => g.findIndex(i => i.checked));
    }
    function apply(pi) {
      PRESETS[pi].answers.forEach((a, qi) => { groups[qi][a].checked = true; });
      btns.forEach((b, i) => b.setAttribute('aria-pressed', String(i === pi)));
      update();
    }
    function update() {
      const a = answers();
      out.replaceChildren();
      if (a.some(x => x < 0)) {
        out.append(el('h5', null, 'Scores'));
        out.append(el('p', 'ep-note', 'Answer all six questions, or choose an example, to see the scores.'));
        return;
      }
      const scores = APPROACHES.map((_, k) => a.reduce((sum, oi, qi) => sum + QUESTIONS[qi].options[oi][1][k], 0));
      const max = Math.max(...scores);
      const top = scores.map((s, k) => (s === max ? k : -1)).filter(k => k >= 0);
      out.append(el('h5', null, 'Scores (out of 18)'));
      APPROACHES.forEach((name, k) => {
        const row = el('div', 'ep-row' + (top.includes(k) ? ' is-top' : ''));
        row.append(el('span', 'ep-name', name));
        const track = el('span', 'ep-track');
        const fill = el('span', 'ep-fill');
        fill.style.width = `${Math.round(scores[k] / 18 * 100)}%`;
        track.append(fill);
        row.append(track, el('span', 'ep-score', String(scores[k])));
        out.append(row);
      });
      const why = el('div', 'ep-why');
      const lead = top.length > 1 ? 'Joint highest: ' + top.map(k => APPROACHES[k]).join(' and ') : 'Highest: ' + APPROACHES[top[0]];
      why.append(el('strong', null, lead));
      const k = top[0];
      const reasons = a.map((oi, qi) => ({ qi, oi, pts: QUESTIONS[qi].options[oi][1][k] })).filter(r => r.pts >= 2);
      const ul = el('ul');
      if (reasons.length) {
        reasons.forEach(r => ul.append(el('li', null, `${QUESTIONS[r.qi].short}: ${QUESTIONS[r.qi].options[r.oi][0].toLowerCase()} (+${r.pts})`)));
        why.append(el('p', null, 'Main reasons:'));
        why.append(ul);
      }
      why.append(el('p', null, 'Watch for: ' + RISKS[k]));
      out.append(why);
    }
    update();
  }

  function start() {
    const host = document.querySelector('[data-ep-chooser]');
    if (host) build(host);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
