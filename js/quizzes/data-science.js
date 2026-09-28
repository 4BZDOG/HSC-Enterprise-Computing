/* Quiz bank for Data Science (topics/data-science.html).
   One entry per data-quiz key on the page: ds-1, ds-2, ds-3.
   Each question: { q: "…", options: ["…", "…", "…"], answer: <index of the right option>, why: "…" }.
   The samples below only prove the machinery works: replace each with 4 to 6 real questions. */
window.HSC_QUIZZES = Object.assign(window.HSC_QUIZZES || {}, {
  // CONTENT: replace this sample with 4 to 6 questions on part 1 (Collecting, storing and analysing data).
  'ds-1': [
    { q: 'Sample question: which NESA part of this topic does this quiz belong to?',
      options: ['Collecting, storing and analysing data', 'Data quality', 'Processing and presenting data'],
      answer: 0,
      why: 'This placeholder shows the quiz machinery working. It belongs to Part 1, Collecting, storing and analysing data.' },
  ],
  // CONTENT: replace this sample with 4 to 6 questions on part 2 (Data quality).
  'ds-2': [
    { q: 'Sample question: which NESA part of this topic does this quiz belong to?',
      options: ['Collecting, storing and analysing data', 'Data quality', 'Processing and presenting data'],
      answer: 1,
      why: 'This placeholder shows the quiz machinery working. It belongs to Part 2, Data quality.' },
  ],
  // CONTENT: replace this sample with 4 to 6 questions on part 3 (Processing and presenting data).
  'ds-3': [
    { q: 'Sample question: which NESA part of this topic does this quiz belong to?',
      options: ['Collecting, storing and analysing data', 'Data quality', 'Processing and presenting data'],
      answer: 2,
      why: 'This placeholder shows the quiz machinery working. It belongs to Part 3, Processing and presenting data.' },
  ],
});
