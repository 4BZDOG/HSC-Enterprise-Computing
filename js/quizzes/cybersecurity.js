/* Quiz bank for Principles of Cybersecurity (topics/cybersecurity.html).
   One entry per data-quiz key on the page: cyber-1, cyber-2, cyber-3.
   Each question: { q: "…", options: ["…", "…", "…"], answer: <index of the right option>, why: "…" }.
   The samples below only prove the machinery works: replace each with 4 to 6 real questions. */
window.HSC_QUIZZES = Object.assign(window.HSC_QUIZZES || {}, {
  // CONTENT: replace this sample with 4 to 6 questions on part 1 (Understanding privacy and security).
  'cyber-1': [
    { q: 'Sample question: which NESA part of this topic does this quiz belong to?',
      options: ['Understanding privacy and security', 'Security awareness', 'Cyber law and ethics'],
      answer: 0,
      why: 'This placeholder shows the quiz machinery working. It belongs to Part 1, Understanding privacy and security.' },
  ],
  // CONTENT: replace this sample with 4 to 6 questions on part 2 (Security awareness).
  'cyber-2': [
    { q: 'Sample question: which NESA part of this topic does this quiz belong to?',
      options: ['Understanding privacy and security', 'Security awareness', 'Cyber law and ethics'],
      answer: 1,
      why: 'This placeholder shows the quiz machinery working. It belongs to Part 2, Security awareness.' },
  ],
  // CONTENT: replace this sample with 4 to 6 questions on part 3 (Cyber law and ethics).
  'cyber-3': [
    { q: 'Sample question: which NESA part of this topic does this quiz belong to?',
      options: ['Understanding privacy and security', 'Security awareness', 'Cyber law and ethics'],
      answer: 2,
      why: 'This placeholder shows the quiz machinery working. It belongs to Part 3, Cyber law and ethics.' },
  ],
});
