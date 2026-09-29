/* ============================================================
   "Check your understanding" quizzes.
   Fills every <div class="quiz" data-quiz="key"></div> from
   window.HSC_QUIZZES. Each topic page loads its own bank,
   js/quizzes/<slug>.js, which adds its questions to that object:

     window.HSC_QUIZZES = Object.assign(window.HSC_QUIZZES || {}, {
       'ds-1': [ { q: '…', options: ['…', '…'], answer: 0, why: '…' } ],
     });

   Real radio groups in fieldsets; feedback and explanations appear
   after checking.
   ============================================================ */
(() => {
  let uid = 0;

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function mount(host) {
    const questions = (window.HSC_QUIZZES || {})[host.dataset.quiz];
    if (!questions || host.dataset.ready) return;
    host.dataset.ready = '1';
    const id = 'quiz' + (++uid);

    const head = el('div', 'quiz-head');
    head.append(el('p', 'quiz-kicker', 'Check your understanding'),
      el('p', 'quiz-sub', `${questions.length} quick questions on this part. Choose an answer for each, then check.`));
    const form = el('form', 'quiz-form');
    form.noValidate = true;

    questions.forEach((item, qi) => {
      const fs = el('fieldset', 'quiz-q');
      const legend = el('legend');
      legend.append(el('span', 'quiz-num', String(qi + 1)), el('span', 'quiz-text', item.q));
      fs.append(legend);
      item.options.forEach((opt, oi) => {
        const lab = el('label', 'quiz-opt');
        const input = el('input');
        input.type = 'radio';
        input.name = `${id}-q${qi}`;
        input.value = String(oi);
        lab.append(input, el('span', 'quiz-letter', 'ABCDEFGH'[oi]), el('span', 'quiz-opt-text', opt));
        fs.append(lab);
      });
      const fb = el('p', 'quiz-feedback');
      fb.hidden = true;
      fs.append(fb);
      form.append(fs);
    });

    const bar = el('div', 'quiz-bar');
    const check = el('button', 'quiz-btn quiz-check', 'Check answers');
    check.type = 'submit';
    const reset = el('button', 'quiz-btn', 'Try again');
    reset.type = 'button';
    reset.hidden = true;
    const score = el('p', 'quiz-score');
    score.setAttribute('role', 'status');
    score.setAttribute('aria-live', 'polite');
    bar.append(check, reset, score);
    form.append(bar);

    const updateCount = () => {
      const n = form.querySelectorAll('input:checked').length;
      check.textContent = n === questions.length ? 'Check answers' : `Check answers (${n}/${questions.length})`;
    };
    form.addEventListener('change', updateCount);
    updateCount();

    form.addEventListener('submit', e => {
      e.preventDefault();
      let right = 0, answered = 0;
      form.querySelectorAll('.quiz-q').forEach((fs, qi) => {
        const item = questions[qi];
        const chosen = fs.querySelector('input:checked');
        const fb = fs.querySelector('.quiz-feedback');
        fs.classList.remove('is-right', 'is-wrong');
        fs.querySelectorAll('.quiz-opt').forEach((lab, oi) => {
          lab.classList.toggle('is-answer', oi === item.answer);
        });
        if (!chosen) {
          fb.hidden = false;
          fb.textContent = 'Not answered. ' + item.why;
          fs.classList.add('is-wrong');
          return;
        }
        answered++;
        const ok = Number(chosen.value) === item.answer;
        if (ok) right++;
        fs.classList.add(ok ? 'is-right' : 'is-wrong');
        fb.hidden = false;
        fb.textContent = (ok ? 'Correct. ' : `Not quite — the answer is "${item.options[item.answer]}". `) + item.why;
      });
      form.querySelectorAll('input').forEach(i => { i.disabled = true; });
      check.hidden = true;
      reset.hidden = false;
      host.dataset.score = right === questions.length ? 'full' : right === 0 ? 'none' : 'some';
      score.textContent = `You got ${right} out of ${questions.length}` +
        (answered < questions.length ? ` (${questions.length - answered} not answered).` : '.') +
        (right === questions.length ? ' Great work!' : ' Read the explanations, then try again.');
      reset.focus();
    });

    reset.addEventListener('click', () => {
      form.reset();
      form.querySelectorAll('input').forEach(i => { i.disabled = false; });
      form.querySelectorAll('.quiz-q').forEach(fs => {
        fs.classList.remove('is-right', 'is-wrong');
        fs.querySelector('.quiz-feedback').hidden = true;
        fs.querySelectorAll('.quiz-opt').forEach(l => l.classList.remove('is-answer'));
      });
      score.textContent = '';
      delete host.dataset.score;
      reset.hidden = true;
      check.hidden = false;
      updateCount();
      form.querySelector('input').focus();
    });

    host.append(head, form);
  }

  function mountAll() { document.querySelectorAll('.quiz[data-quiz]').forEach(mount); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountAll);
  else mountAll();
})();
