/* Quiz bank for the Project Management Guide (topics/project-guide.html).
   One entry per data-quiz key on the page: pg-1 to pg-7, five questions each.
   Each question: { q: "…", options: ["…", "…", "…", "…"], answer: <index of the right option>, why: "…" }. */
window.HSC_QUIZZES = Object.assign(window.HSC_QUIZZES || {}, {
  "pg-1": [
    {
      "q": "Which list gives NESA's four stages of the design and production process in order?",
      "options": [
        "Planning, building, testing, launching",
        "Analysis, design, coding, maintenance",
        "Identifying and defining, researching and planning, producing and implementing, testing and evaluating",
        "Requirements, prototype, release, review"
      ],
      "answer": 2,
      "why": "These are NESA's four Enterprise project subheadings. The other lists are generic sequences that do not use NESA's stage names."
    },
    {
      "q": "A team writes a problem definition and a list of measurable success criteria. Which stage are they in?",
      "options": [
        "Identifying and defining",
        "Researching and planning",
        "Producing and implementing",
        "Testing and evaluating"
      ],
      "answer": 0,
      "why": "Defining the problem and setting success criteria belong to the first stage. The criteria are used again in the last stage."
    },
    {
      "q": "During testing a client says a key feature is missing, so the team updates the requirements and the plan. What does this show?",
      "options": [
        "The project has failed",
        "Stage 1 should have been skipped",
        "Planning is unnecessary",
        "The process is iterative: what is learned later can send you back to earlier stages"
      ],
      "answer": 3,
      "why": "NESA lists an iterative approach. Returning to earlier stages is normal, and recording it in the diary is good evidence of managing the project."
    },
    {
      "q": "Which piece of evidence best belongs to stage 4, testing and evaluating?",
      "options": [
        "A Gantt chart drawn before work began",
        "A results table showing expected and actual results, and an evaluation against the success criteria",
        "The interview notes from the client",
        "A budget for the first year"
      ],
      "answer": 1,
      "why": "Test results and an evaluation against criteria are the outputs of stage 4. The other items belong to stages 1 and 2."
    },
    {
      "q": "A student says, \"I will write my diary entries at the end so they are neat.\" What is the main problem with this?",
      "options": [
        "Diaries must be handwritten",
        "Diaries are only needed in stage 1",
        "The diary should record progress at regular intervals; late entries lose detail and weaken it as evidence",
        "Neat entries are not allowed"
      ],
      "answer": 2,
      "why": "NESA says entries are made at regular intervals. A diary written after the event cannot show real problems, decisions and dates."
    }
  ],
  "pg-2": [
    {
      "q": "A regional council needs a records system built to a detailed written specification. The council is hard to reach after the contract is signed, and the requirements will not change. Which approach fits best?",
      "options": [
        "Waterfall (structured)",
        "Agile",
        "Prototyping",
        "End-user development"
      ],
      "answer": 0,
      "why": "Clear, stable requirements and low client availability suit waterfall, which relies on a signed-off specification rather than frequent feedback."
    },
    {
      "q": "A club secretary is not sure what a booking screen should look like and says, \"I will know it when I see it.\" Which approach helps most?",
      "options": [
        "Waterfall",
        "Prototyping",
        "Outsourcing",
        "A direct implementation"
      ],
      "answer": 1,
      "why": "Prototyping builds a quick version early so the user can react to something real. Direct implementation is a changeover method, not a development approach."
    },
    {
      "q": "What is the main risk of agile development when the client is rarely available?",
      "options": [
        "Sprints become longer than the project",
        "The backlog cannot be written",
        "Agile does not allow testing",
        "There is no client feedback at the reviews, so the team may build the wrong thing quickly"
      ],
      "answer": 3,
      "why": "Agile depends on frequent client feedback at each review. Without it, the team loses its main way of checking that it is on track."
    },
    {
      "q": "A farm co-op's bookkeeper builds a stock tracker in a spreadsheet for her own use. Which approach is this?",
      "options": [
        "Outsourcing",
        "Waterfall",
        "End-user development",
        "Agile"
      ],
      "answer": 2,
      "why": "End-user development is when the people who will use the system build or adapt it themselves with tools they already know."
    },
    {
      "q": "Which statement about choosing an approach is best?",
      "options": [
        "Agile is always better because it is modern",
        "Choose one approach, justify it with facts about your project and state a drawback you are accepting",
        "Waterfall cannot include testing",
        "Real projects never combine approaches"
      ],
      "answer": 1,
      "why": "No approach is best in general. A justified choice uses reasons from the project (client availability, requirements, skills, time, budget) and notes its weakness. Projects often combine approaches."
    }
  ],
  "pg-3": [
    {
      "q": "Tasks: A (2 days), then B (3 days) and C (5 days) start together after A, then D (4 days) needs both B and C. What is the length of the critical path?",
      "options": [
        "11 days",
        "9 days",
        "14 days",
        "10 days"
      ],
      "answer": 0,
      "why": "The longest route is A, C, D: 2 + 5 + 4 = 11 days. The route A, B, D is only 9 days, so B has 2 days of float."
    },
    {
      "q": "What does it mean when a task has float?",
      "options": [
        "It is on the critical path",
        "It is complete",
        "It has no owner",
        "It can slip by some days without delaying the finish date"
      ],
      "answer": 3,
      "why": "Float is spare time. Tasks with float are off the critical path, and only delays that use up all their float move the end date."
    },
    {
      "q": "A task is planned for 10 days and 8 days have passed, but only half of the work is finished. What percentage complete should the chart show?",
      "options": [
        "80%",
        "20%",
        "50%",
        "100%"
      ],
      "answer": 2,
      "why": "Percentage complete measures finished work, not time used. The gap between 80% of the time and 50% of the work is a sign that the task is behind."
    },
    {
      "q": "Which is the best-written task for a weekly action plan?",
      "options": [
        "Build the Menu and Orders tables and enter five test records",
        "Work on database",
        "Do some coding",
        "Team to finish soon"
      ],
      "answer": 0,
      "why": "A good task is small, specific and checkable, so you can tell whether it is finished. The others are vague and have no clear owner or result."
    },
    {
      "q": "A budget for a school project lists only the build hours. What is the biggest weakness?",
      "options": [
        "Hours cannot be costed",
        "Budgets must be in a spreadsheet",
        "Projects should have no budget",
        "It leaves out other costs such as ongoing hosting, training and a contingency"
      ],
      "answer": 3,
      "why": "A useful budget includes costs that continue after the build and a reserve for surprises, so the client sees the real cost of owning the system."
    }
  ],
  "pg-4": [
    {
      "q": "Which is an open interview question?",
      "options": [
        "You would like an app, wouldn't you?",
        "How do you take an order at the moment?",
        "Is the deadline in November?",
        "Do you have a budget?"
      ],
      "answer": 1,
      "why": "An open question invites a description and gives you information you did not expect. Leading and yes/no questions do not."
    },
    {
      "q": "In MoSCoW prioritisation, which category is \"the project fails without it\"?",
      "options": [
        "Should have",
        "Could have",
        "Must have",
        "Won't have (this time)"
      ],
      "answer": 2,
      "why": "Must-haves are the requirements without which the system is useless. Should and could are less critical, and \"won't\" is agreed out of scope for now."
    },
    {
      "q": "A client keeps adding features after the requirements were agreed, with no change to the schedule. What is this called, and what helps?",
      "options": [
        "Scope creep; a signed-off prioritised list and a change process",
        "Float; a longer Gantt chart",
        "Beta testing; more users",
        "Parallel running; a second system"
      ],
      "answer": 0,
      "why": "Uncontrolled additions are scope creep. A signed-off priority list lets you show what each new request would displace."
    },
    {
      "q": "Why is version history in a shared document useful for a project?",
      "options": [
        "It makes the file smaller",
        "It shows who changed what and when, and lets the team restore an earlier version",
        "It removes the need for backups",
        "It replaces the process diary"
      ],
      "answer": 1,
      "why": "Version history is a record of changes that supports collaboration and recovery. Backups and a diary are still needed."
    },
    {
      "q": "A survey has these questions: \"Do you love our great canteen?\" and \"How easy is ordering at recess? (1 very hard to 5 very easy)\". What is the main problem with the first?",
      "options": [
        "It is too short",
        "It collects quantitative data",
        "It cannot be counted",
        "It is a leading question that pushes people towards one answer"
      ],
      "answer": 3,
      "why": "Leading questions bias the results. The rating question gives countable, less biased data."
    }
  ],
  "pg-5": [
    {
      "q": "A risk register rates \"Team member absent\" as likelihood 2 and consequence 2 on a 1-to-3 scale. What is the score if it is calculated by multiplying?",
      "options": [
        "2",
        "6",
        "4",
        "9"
      ],
      "answer": 2,
      "why": "Likelihood multiplied by consequence: 2 x 2 = 4. The score lets you rank risks so you respond to the biggest first."
    },
    {
      "q": "A team backs up its database to the cloud every night to lessen the damage if a file is corrupted. Which risk response is this?",
      "options": [
        "Avoid",
        "Reduce",
        "Transfer",
        "Accept"
      ],
      "answer": 1,
      "why": "Backups reduce the consequence of losing the file; they do not remove the risk. Avoiding would change the plan so the risk cannot happen."
    },
    {
      "q": "The four common feasibility areas are technical, economic, schedule and:",
      "options": [
        "Operational",
        "Artistic",
        "Structural",
        "Recreational"
      ],
      "answer": 0,
      "why": "Operational feasibility asks whether people will actually use the system and whether it suits how they work."
    },
    {
      "q": "A hospital changes its patient records system and cannot accept any failure. Which implementation method fits best?",
      "options": [
        "Direct",
        "Phased",
        "Pilot in a car park",
        "Parallel"
      ],
      "answer": 3,
      "why": "Parallel running keeps the old system as a fallback while results are compared, which suits critical systems, at the cost of double work."
    },
    {
      "q": "Which set best describes operation and maintenance documentation?",
      "options": [
        "A list of features the client wanted",
        "The Gantt chart",
        "How to back up and restore, add users, fix common faults and who to contact",
        "A marketing brochure"
      ],
      "answer": 2,
      "why": "Operation and maintenance documentation helps people run and keep the system going. NESA also asks you to trial it during testing."
    }
  ],
  "pg-6": [
    {
      "q": "A field accepts whole numbers from 1 to 20. Which set contains only boundary values?",
      "options": [
        "0, 1, 20, 21",
        "5, 10, 15",
        "abc, blank, 2.5",
        "3, 7, 12"
      ],
      "answer": 0,
      "why": "Boundary values sit at and just either side of the limits: 0 and 21 (just outside) and 1 and 20 (the edges). 5, 10, 15 are normal data; abc, blank, 2.5 are erroneous."
    },
    {
      "q": "When should the expected result for each test be decided?",
      "options": [
        "After the test is run",
        "Only for failed tests",
        "Only by the client",
        "Before the test is run"
      ],
      "answer": 3,
      "why": "Working out the expected result in advance means you are checking the system, not simply accepting what it does."
    },
    {
      "q": "The system meets every line of the written specification, but the canteen manager finds it unusable at recess. This is a failure of:",
      "options": [
        "Verification only",
        "Validation, because the specification did not match the real need",
        "Nothing, because the tests passed",
        "The Gantt chart"
      ],
      "answer": 1,
      "why": "Verification asks whether it was built correctly to the specification. Validation asks whether it is the right system for the real need, which it is not."
    },
    {
      "q": "Which is the strongest evaluation statement?",
      "options": [
        "The project went well.",
        "The system has many features.",
        "Two of three timed orders met the \"under one minute\" criterion; the third was slowed by item search, so I will add shortcut buttons.",
        "I enjoyed working on it."
      ],
      "answer": 2,
      "why": "An evaluation makes a judgement against a criterion, with evidence and a next step. The others are claims or descriptions."
    },
    {
      "q": "After fixing a fault found in testing, what should you do?",
      "options": [
        "Re-run the failed test and nearby tests, and record the result",
        "Assume it is fixed",
        "Delete the failed test result",
        "Skip acceptance testing"
      ],
      "answer": 0,
      "why": "A fix can break something else, so retest the failed test and related tests and record the retest."
    }
  ],
  "pg-7": [
    {
      "q": "According to NESA, how many take-home tasks can a school-based assessment program include, and what is the maximum weighting?",
      "options": [
        "Two, each up to 20%",
        "One, worth no more than 15%",
        "Three, worth 10% each",
        "None"
      ],
      "answer": 1,
      "why": "NESA's limit is no more than one take-home task worth no more than 15%. It starts in Term 4 2026 for HSC courses and Term 1 2027 for Year 11 courses."
    },
    {
      "q": "NESA has said schools should not rely on which of the following as the main safeguard against malpractice?",
      "options": [
        "A process diary",
        "A written assessment notification",
        "Supervised tasks",
        "AI detection tools"
      ],
      "answer": 3,
      "why": "NESA has said schools should not rely on AI detection tools as the main safeguard. Task design and evidence of a student's own work matter more."
    },
    {
      "q": "Which is the best evidence that project work is your own?",
      "options": [
        "A neat final report",
        "A friend's signature",
        "Dated diary entries, version history, drafts and the ability to explain your decisions",
        "The file's size"
      ],
      "answer": 2,
      "why": "Records made along the way, and your ability to explain the work, are hard to fake and show your own knowledge, skills and understanding."
    },
    {
      "q": "What do the NESA pages checked for this guide say about a mandatory Enterprise Project task or its weighting?",
      "options": [
        "A project worth 40% is mandatory",
        "No mandatory project task, weighting or word limit is published; the school decides",
        "The project is examined in the HSC",
        "The project must be a take-home task"
      ],
      "answer": 1,
      "why": "NESA publishes the two 50% course components and the take-home limit, but not a required project task. The HSC exam is a written online paper."
    },
    {
      "q": "Your teacher gives you a different due date from the one in this guide. What should you do?",
      "options": [
        "Follow your school's assessment schedule and task notification",
        "Follow this guide",
        "Ask a friend to choose",
        "Ignore both"
      ],
      "answer": 0,
      "why": "This guide is a study aid. Your school's formal assessment schedule and written task notification always apply."
    }
  ]
});
