"""Builds topics/resources.html, the Certified Resources page.

Every link is listed once in SECTIONS below. Only two kinds of source
belong here:
  * official NESA / NSW Curriculum documents for Enterprise Computing 11-12
  * the standards bodies or official documentation behind a syllabus concept
Check each URL still resolves before adding it, and update CHECKED.

    python3 scripts/build-resources.py

The page shell (head, navigation, footer) comes from scripts/page_shell.py and
scripts/site-chrome.py, so it always matches the rest of the site.
"""
import html
import os
import re
import sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
sys.path.insert(0, os.path.join(ROOT, 'scripts'))
import page_shell as shell  # noqa: E402

CHECKED = '29 September 2026'
CURR = 'https://curriculum.nsw.edu.au/learning-areas/tas/enterprise-computing-11-12-2022'

# Topic keys → (label, page, year) for the "Links to" chips.
TOPICS = {
    'all':     ('Whole course', None, 'core'),
    'im':      ('Interactive Media and the User Experience', 'interactive-media.html', 'y11'),
    'net':     ('Networking Systems and Social Computing', 'networking-systems.html', 'y11'),
    'cyber':   ('Principles of Cybersecurity', 'cybersecurity.html', 'y11'),
    'ds':      ('Data Science', 'data-science.html', 'y12'),
    'dv':      ('Data Visualisation', 'data-visualisation.html', 'y12'),
    'is':      ('Intelligent Systems', 'intelligent-systems.html', 'y12'),
    'ep':      ('Enterprise Project', 'enterprise-project.html', 'y12'),
    'toolkit': ('Course Toolkit', 'toolkit.html', 'core'),
    'project': ('Project Management Guide', 'project-guide.html', 'core'),
}

# Each entry is
#   (title, publisher, format 'Web'|'PDF'|'DOCX', url, one-line description, [topic keys])
# The 44 NESA / NSW Curriculum links come from resources/ec-official-links.md (every one returned
# HTTP 200 on CHECKED); the last section adds the legislation and standards bodies behind syllabus
# concepts. Only add a URL that returns HTTP 200 (curl -sS -o /dev/null -w "%{http_code}" -L <url>).
LIB = 'https://library.curriculum.nsw.edu.au/341419dc-8ec2-0289-7225-6db7f2d751ef'
SECTIONS = [
    ('nesa-syllabus', 'Official NESA', 'Syllabus and Course Specifications',
     'The documents the course and the HSC exam are written from. Start here.', [
        ('Enterprise Computing 11–12 Syllabus (2022): overview', 'NSW Curriculum · NESA', 'Web',
         f'{CURR}/overview',
         'Course description, how the course is organised and the Aboriginal and Torres Strait Islander protocols.', ['all']),
        ('Course structure, hours and requirements', 'NSW Curriculum · NESA', 'Web',
         f'{CURR}/overview/course',
         'Indicative hours, enrolment details and the link to the Course Specifications.', ['all']),
        ('Rationale', 'NSW Curriculum · NESA', 'Web',
         f'{CURR}/rationale',
         'Why NESA teaches Enterprise Computing and what students gain from it.', ['all']),
        ('Aim', 'NSW Curriculum · NESA', 'Web',
         f'{CURR}/aim',
         'The single statement of purpose that every outcome supports.', ['all']),
        ('Outcomes', 'NSW Curriculum · NESA', 'Web',
         f'{CURR}/outcomes',
         'Year 11 (EC-11-01 to EC-11-11) and Year 12 (EC-12-01 to EC-12-11) outcomes, the codes used in these notes.', ['all']),
        ('Content: every focus area and dot point', 'NSW Curriculum · NESA', 'Web',
         f'{CURR}/content',
         'The exact dot points these notes follow, for all seven focus areas.', ['im', 'net', 'cyber', 'ds', 'dv', 'is', 'ep']),
        ('Syllabus glossary', 'NSW Curriculum · NESA', 'Web',
         f'{CURR}/glossary',
         'NESA’s own definitions of the 81 terms marked NESA in the notes’ glossary.', ['all']),
        ('Higher School Certificate Course Specifications: Enterprise Computing', 'NESA', 'PDF',
         f'{LIB}/1299d565-a98e-4578-a5c6-53262a5ecc08/enterprise-computing-11-12-higher-school-certificate-course-specifications.PDF',
         'The integral, examinable notation and methods: DFDs, flowcharts, system flowcharts, decision trees, data dictionaries, storyboards, network diagrams, Gantt charts, schemas, SQL and spreadsheet functions.', ['toolkit', 'project']),
        ('Course overview image (Figure 1)', 'NESA', 'Web',
         f'{LIB}/8e92c6ff-de21-4583-a306-2d13aa376ec9/enterprise-computing-11-12-course-overview-image.PNG',
         'NESA’s diagram of how the focus areas, project work and skills fit together.', ['all']),
        ('NESA website: Enterprise Computing 11–12 Syllabus (2022)', 'NESA', 'Web',
         'https://www.nsw.gov.au/education-and-training/nesa/curriculum/tas/enterprise-computing-11-12-2022',
         'The NESA website entry that points to the NSW Curriculum syllabus pages.', ['all']),
        ('Record of changes', 'NSW Curriculum · NESA', 'Web',
         f'{CURR}/teaching-and-learning/record-of-changes',
         'The official change log for the syllabus and its supporting material.', ['all']),
    ]),
    ('nesa-exam', 'Official NESA', 'Assessment and the HSC examination',
     'How the course is assessed at school and in the HSC, and the rules schools follow.', [
        ('Assessment', 'NSW Curriculum · NESA', 'Web',
         f'{CURR}/assessment',
         'The starting page for assessment; it opens on the course standards.', ['all']),
        ('Course standards', 'NSW Curriculum · NESA', 'Web',
         f'{CURR}/assessment/course-standards',
         'The Common Grade Scale (Preliminary) and the HSC performance band descriptions.', ['all']),
        ('School-based assessment', 'NSW Curriculum · NESA', 'Web',
         f'{CURR}/assessment/school-based-assessment',
         'Year 11 and Year 12 components (50% each), task weighting guidance and the take-home task limit.', ['all', 'ep']),
        ('HSC examinations', 'NSW Curriculum · NESA', 'Web',
         f'{CURR}/assessment/hsc-examinations',
         'The exam specification (80 marks, 2 hours 30 minutes, online), exam tools and familiarisation questions.', ['all']),
        ('ACE rules: assessment programs (2.1)', 'NSW Curriculum · NESA', 'Web',
         'https://curriculum.nsw.edu.au/ace-rules/ace2/assessment-programs',
         'The rules for Preliminary and HSC school-based assessment programs, including take-home tasks and generative AI.', ['all']),
        ('ACE rules', 'NSW Curriculum · NESA', 'Web',
         'https://curriculum.nsw.edu.au/ace-rules',
         'Assessment, Certification and Examination rules and requirements.', ['all']),
        ('NESA 29/26: new limit on take-home assessment tasks', 'NESA', 'Web',
         'https://www.nsw.gov.au/education-and-training/nesa/news/all/new-take-home-assessment-rules',
         'Official notice of the limit on take-home tasks from Term 4 2026, exempt courses and generative AI requirements.', ['all']),
        ('NESA 34/26: changes to the ACE rules on take-home tasks and AI', 'NESA', 'Web',
         'https://www.nsw.gov.au/education-and-training/nesa/news/all/changes-ace-rules-take-home-tasks-artifical-intelligence',
         'Official notice of the rule changes and when they take effect.', ['all']),
        ('HSC exam provisions', 'NESA', 'Web',
         'https://www.nsw.gov.au/education-and-training/nesa/hsc/exam-provisions',
         'Exam provisions for students with disability.', ['all']),
    ]),
    ('nesa-papers', 'Official NESA', 'HSC exam papers, marking guidelines and the online exam',
     'Enterprise Computing is examined online, so practise with NESA’s own materials and tools.', [
        ('Enterprise Computing HSC exam papers', 'NESA', 'Web',
         'https://www.nsw.gov.au/education-and-training/nesa/curriculum/hsc-exam-papers/enterprise-computing',
         'The index of Enterprise Computing HSC exam packs (2025 is the first).', ['all']),
        ('Enterprise Computing 2025 HSC exam pack', 'NESA', 'Web',
         'https://www.nsw.gov.au/education-and-training/nesa/curriculum/hsc-exam-papers/enterprise-computing/2025',
         'Links to the online exam, marking guidelines, question-by-question marker feedback and sample responses. There is no downloadable paper.', ['all']),
        ('2025 HSC Enterprise Computing marking guidelines', 'NESA', 'PDF',
         'https://www.nsw.gov.au/sites/default/files/noindex/2025-11/2025-hsc-enterprise-computing-mg.pdf',
         'Criteria, marks and sample answers for every question of the 2025 exam.', ['all']),
        ('2025 HSC sample full-mark responses', 'NESA', 'PDF',
         'https://www.nsw.gov.au/sites/default/files/noindex/2026-08/enterprise-computing-2025-full-mark-samples.PDF',
         'Sample full-mark responses to the short-answer questions.', ['all']),
        ('HSC online exam and familiarisation questions', 'NESA', 'Web',
         'https://fam.hsconline.nesa.nsw.edu.au/',
         'NESA’s online exam environment: practise with the spreadsheet, drawing and screen design tools.', ['toolkit', 'dv']),
        ('Marking guidelines: HSC familiarisation questions', 'NESA', 'PDF',
         f'{LIB}/cca2dc84-cb5e-484d-a953-a0f6245c3b3c/enterprise-computing-hsc-marking-guidelines.PDF',
         'Marking guidelines for the familiarisation questions, including a Level 0 DFD, formulas and classification items.', ['toolkit']),
        ('Marking guidelines: online HSC sample exam', 'NESA', 'PDF',
         f'{LIB}/d70ae793-5609-4110-86ac-6955d72240ae/enterprise-computing-sample-exam-marking-guidelines.PDF',
         'Marking guidelines for the online sample exam (the exam itself is only available through Schools Online).', ['all']),
        ('Spreadsheet tool: video transcript', 'NESA', 'DOCX',
         f'{LIB}/7635a868-ee00-4f1f-a640-6700d7a35a0b/stage-6-syllabus-spreadsheet-tool-video-transcript.docx',
         'What the online exam spreadsheet tool does and how to use it.', ['toolkit', 'ds', 'dv']),
        ('Drawing tool: video transcript', 'NESA', 'DOCX',
         f'{LIB}/53052c2e-22c5-43ae-80ac-0aeab740692f/stage-6-syllabus-drawing-tool-video-transcript.docx',
         'What the online exam drawing tool does; it is used for diagrams such as DFDs.', ['toolkit']),
        ('Screen design tool: video transcript', 'NESA', 'DOCX',
         f'{LIB}/9cafcc28-127d-4ec0-99e8-c5259dce9688/stage-6-syllabus-screen-design-tool-video-transcript.DOCX',
         'What the online exam screen design tool does; it is used for interface and storyboard questions.', ['toolkit', 'im']),
        ('HSC exam resources', 'NESA', 'Web',
         'https://www.nsw.gov.au/education-and-training/nesa/curriculum/hsc-exam-resources',
         'NESA’s hub for HSC standards materials and exam packs.', ['all']),
    ]),
    ('nesa-support', 'Official NESA', 'Teaching and learning',
     'Sample programs, units and advice NESA published alongside the syllabus. Useful for seeing how a course can be sequenced.', [
        ('Teaching and learning', 'NSW Curriculum · NESA', 'Web',
         f'{CURR}/teaching-and-learning',
         'The index of teaching support: advice, resources, sample units and the record of changes.', ['all']),
        ('Teaching advice', 'NSW Curriculum · NESA', 'Web',
         f'{CURR}/teaching-and-learning/teaching-advice',
         'Why each focus area matters, project work advice and Life Skills considerations.', ['all', 'ep']),
        ('Teaching resources', 'NSW Curriculum · NESA', 'Web',
         f'{CURR}/teaching-and-learning/teaching-resources',
         'The list of Course Specifications, sample scope and sequences, sample units and other support material.', ['all']),
        ('Sample scope and sequence: Year 11, 120 hours', 'NESA', 'DOCX',
         f'{LIB}/92e65083-39ec-4bc9-825b-46490b700a28/enterprise-computing-11-12-2022-sample-scope-and-sequence-year-11-120-hours.docx',
         'One way to sequence the Year 11 units across 120 hours.', ['im', 'net', 'cyber']),
        ('Sample scope and sequence: Year 12, 120 hours', 'NESA', 'DOCX',
         f'{LIB}/1e63412d-e558-4636-8b87-4077dc8bab6b/enterprise-computing-11-12-2022-sample-scope-and-sequence-year-12-120-hours.DOCX',
         'One way to sequence the Year 12 units, for example Processing and Presenting and Humans vs Machine.', ['ds', 'dv', 'is', 'ep']),
        ('Sample scope and sequence B: Year 12, 120 hours', 'NESA', 'DOCX',
         f'{LIB}/6ee4c672-8346-4cc9-bb12-dfe525a646d5/enterprise-computing-11-12-2022-sample-scope-and-sequence-b-year-12-120-hours.DOCX',
         'An alternative Year 12 sequence.', ['ds', 'dv', 'is', 'ep']),
        ('Sample unit: Year 11, Networking systems and social computing', 'NESA', 'DOCX',
         f'{LIB}/9fa2a93e-dd7b-48aa-a5be-33d102da7e51/enterprise-computing-11-12-2022-sample-unit-year-11-networking-systems-and-social-computing.DOCX',
         'A worked unit with teaching, learning and assessment activities.', ['net']),
        ('Sample unit: Year 12, Enterprise computing project', 'NESA', 'DOCX',
         f'{LIB}/49d4eae6-b47f-42a9-a0a0-6e6b8a2300e8/enterprise-computing-11-12-2022-sample-unit-year-12-enterprise-computing-project.docx',
         'A worked unit for the Year 12 Enterprise Project focus area.', ['ep']),
        ('Bibliography', 'NESA', 'DOCX',
         f'{LIB}/d467b131-74cd-473f-9373-5ed002b59ec9/enterprise-computing-11-12-and-computing-technology-life-skills-bibliography.DOCX',
         'The reference list used to develop the Enterprise Computing and Computing Technology Life Skills syllabuses.', ['all']),
        ('Engagement report', 'NESA', 'PDF',
         f'{LIB}/7444a155-66d4-49b0-a82f-0fa457aa8360/enterprise-computing-11-12-2022-and-computing-technology-life-skills-11-12-2022-engagement-report.PDF',
         'The consultation report on the development of the syllabus.', ['all']),
        ('Parent and carer guide', 'NESA', 'PDF',
         f'{LIB}/8bfe2efa-f1e1-4632-9e97-35f727dd67a4/enterprise-computing-11-12-2022-parent-and-carer-guide.PDF',
         'A short overview of what students learn, written for families.', ['all']),
        ('Introduction to the Computing Technologies 7–12 Syllabuses: transcript', 'NESA', 'DOCX',
         f'{LIB}/9263c0d3-0a10-4887-831c-74aca48900b0/introduction-to-the-computing-technologies-7-12-syllabus-transcript.DOCX',
         'A transcript of the introductory video across the 7–12 computing syllabuses.', ['all']),
        ('Professional learning: Enterprise Computing 11–12', 'NESA Learning', 'Web',
         'https://catalog.learning.nesa.nsw.edu.au/browse/t/cr/courses/enterprise-computing-1112-and-computing-technology-life-skills-1112-professional-learning',
         'The NESA Learning catalogue course for teachers, linked from the syllabus content page.', ['all']),
    ]),
    ('standards', 'Official source', 'Legislation and standards behind the syllabus concepts',
     'Primary sources for ideas the syllabus names. These organisations are not NESA; each is the authority on its own topic.', [
        ('Australian Privacy Principles', 'Office of the Australian Information Commissioner (OAIC)', 'Web',
         'https://www.oaic.gov.au/privacy/australian-privacy-principles',
         'The thirteen principles for how personal information is collected, used, stored and disclosed.', ['cyber', 'ds', 'im']),
        ('Notifiable Data Breaches scheme', 'Office of the Australian Information Commissioner (OAIC)', 'Web',
         'https://www.oaic.gov.au/privacy/notifiable-data-breaches',
         'When a data breach must be reported and to whom.', ['cyber']),
        ('Privacy Act 1988 (Cth)', 'Federal Register of Legislation', 'Web',
         'https://www.legislation.gov.au/C2004A03712/latest/text',
         'The Act itself, as currently in force.', ['cyber', 'ds']),
        ('Cybercrime Act 2001 (Cth)', 'Federal Register of Legislation', 'Web',
         'https://www.legislation.gov.au/C2004A00937/latest/text',
         'The Australian law on offences against computers and data.', ['cyber']),
        ('Copyright Act 1968 (Cth)', 'Federal Register of Legislation', 'Web',
         'https://www.legislation.gov.au/C1968A00063/latest/text',
         'The Act that protects creators’ rights, including for software, images and music.', ['im', 'ds']),
        ('Web Content Accessibility Guidelines (WCAG)', 'World Wide Web Consortium (W3C)', 'Web',
         'https://www.w3.org/WAI/standards-guidelines/wcag/',
         'The international accessibility standard behind designing for people with disability.', ['im', 'dv']),
        ('Creative Commons licences', 'Creative Commons', 'Web',
         'https://creativecommons.org/licenses/',
         'What each standard licence lets you do with someone else’s work.', ['im']),
        ('MQTT', 'MQTT.org', 'Web',
         'https://mqtt.org/',
         'The lightweight publish/subscribe messaging protocol widely used by Internet of Things devices.', ['net', 'is']),
        ('Maiam nayri Wingara Indigenous Data Sovereignty Collective', 'Maiam nayri Wingara', 'Web',
         'https://www.maiamnayriwingara.org/',
         'The Indigenous Data Sovereignty principles for Aboriginal and Torres Strait Islander Peoples in Australia.', ['ds']),
    ]),
]

ICONS = {
    'PDF':  '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M9.5 14h5M9.5 17h3"/>',
    'DOCX': '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M9.5 12.5l1.2 5 1.3-3.5 1.3 3.5 1.2-5"/>',
    'Web':  '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 2.6 15.4 0 18M12 3c-2.6 2.6-2.6 15.4 0 18"/>',
}


def e(s):
    return html.escape(s, quote=True)


def card(title, pub, fmt, url, why, topics):
    chips = []
    for t in topics:
        label, page, year = TOPICS[t]
        chip = f'<span class="chip chip-{year}">{e(label)}</span>'
        if page:
            chip = f'<a class="chip chip-{year}" href="{page}">{e(label)}</a>'
        chips.append(chip)
    return f'''          <article class="res-card">
            <div class="res-top">
              <span class="res-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false">{ICONS[fmt]}</svg></span>
              <span class="res-fmt">{fmt}</span>
            </div>
            <h3 class="res-title"><a href="{e(url)}" target="_blank" rel="noopener">{e(title)}<span class="sr-only"> (opens in a new tab)</span></a></h3>
            <p class="res-pub">{e(pub)}</p>
            <p class="res-why">{e(why)}</p>
            <div class="res-links"><span class="res-links-label">Links to</span>{"".join(chips)}</div>
          </article>
'''


def build():
    title = 'Certified Resources'
    desc = ('Official NESA syllabus documents and the standards bodies behind every Enterprise Computing 11–12 concept, '
            'in one place.')
    head = shell.head(title=title, description=desc, path='topics/resources.html',
                      crumbs=[('Home', shell.SITE_URL), ('Resources', f'{shell.SITE_URL}#resources'),
                              (title, f'{shell.SITE_URL}topics/resources.html')])
    nav = shell.nav_shell('../index.html')

    toc = ''.join(f'        <li><a href="#{sid}"><span class="toc-num">{i}</span>{e(h)}</a></li>\n'
                  for i, (sid, _, h, _, _) in enumerate(SECTIONS, 1))
    total = sum(len(items) for *_, items in SECTIONS)
    nesa = sum(len(items) for sid, kind, *_, items in SECTIONS if kind == 'Official NESA')

    body = []
    for sid, kind, heading, lead, items in SECTIONS:
        stamp = 'res-stamp-nesa' if kind == 'Official NESA' else 'res-stamp-std'
        body.append(f'''        <section id="{sid}" class="res-section">
          <div class="res-head">
            <span class="res-stamp {stamp}">{e(kind)}</span>
            <h2>{e(heading)}</h2>
            <p>{e(lead)}</p>
          </div>
          <div class="res-grid">
{"".join(card(*it) for it in items)}          </div>
        </section>
''')

    page = f'''{head}{nav}  <!-- ── Page Header ── -->
  <header class="topic-header">
    <div class="topic-header-inner">
      <nav class="topic-breadcrumb" aria-label="Breadcrumb">
        <a href="../index.html">Home</a> <span>›</span>
        <a href="../index.html#resources">Resources</a> <span>›</span>
        <span>Certified Resources</span>
      </nav>
      <h1>Certified Resources</h1>
      <p class="text-muted-dark max-w-600 mt-2 fs-sm lh-base">
        The <strong>official NESA documents</strong> for Enterprise Computing 11–12, and the <strong>legislation and standards bodies</strong> behind the concepts the syllabus names. Each one says which part of the course it supports.
      </p>
      <div class="topic-header-meta">
        <span class="meta-pill">Year 11 &amp; 12</span>
        <span class="meta-pill">{nesa} NESA document{"s" if nesa != 1 else ""}</span>
        <span class="meta-pill">{total - nesa} official source{"s" if total - nesa != 1 else ""}</span>
        <span class="meta-pill">Links checked {CHECKED}</span>
      </div>
    </div>
  </header>

  <!-- ── Page Layout ── -->
  <div class="page-layout">
    <aside class="sidebar">
      <div class="toc-title">Contents</div>
      <ul class="toc-list">
{toc}      </ul>
    </aside>

    <main class="page-content">
      <div class="content-body res-page">
        <!-- Generated by scripts/build-resources.py: edit the data there, not this file. -->
        <div class="callout info res-note"><strong>What "certified" means here</strong>
          Sections labelled <strong>Official NESA</strong> are published by NESA or the NSW Curriculum website and define the course. The <strong>Official source</strong> section links to the legislation and organisations behind concepts the syllabus names; each is the authority on its own topic, not on the syllabus. Links open in a new tab.
        </div>
        <div class="callout warning res-note"><strong>The Course Specifications are part of the course</strong>
          NESA&rsquo;s <em>Higher School Certificate Course Specifications</em> set out the notation, methods and lists you are expected to know and use in the HSC exam. This site links to NESA&rsquo;s official PDF and never hosts a copy, so you always read the current version.
        </div>
        <div class="callout info res-note"><strong>Acknowledgement</strong>
          The syllabus content, glossary definitions and Course Specifications referred to on this site are &copy; NSW Education Standards Authority (NESA), used under NESA&rsquo;s licence for NSW teachers&rsquo; non-commercial educational use. NESA is the source of this material and its websites hold the only official and up-to-date versions. EntComp Notes is a study aid and is not endorsed by NESA. Links checked {CHECKED}; if one has moved, start from the <a href="{CURR}" target="_blank" rel="noopener">NSW Curriculum syllabus page</a>.
        </div>
{"".join(body)}      </div>
    </main>
  </div>

{shell.FOOTER_SHELL}
{shell.scripts(diagrams=False, progress=False, lightbox=False)}'''
    shell.write_page('topics/resources.html', page)
    print(f'topics/resources.html: {total} resource(s) in {len(SECTIONS)} section(s)')


if __name__ == '__main__':
    build()
