"""Page specifications: one entry per NESA dot point, in NESA's order.

resources/nesa-syllabus-content.md is the source of truth for the dot points.
This file adds what NESA does not supply: a short section id, a student-friendly
heading and the most relevant outcome codes for each dot point.

Each part is a list of tuples:

    (section id, heading, outcome codes, start of the dot point's text)

The last item is checked against the syllabus (the dot point must begin with
that text), so scripts/scaffold-page.py and scripts/restructure.py stop with a
clear error if the syllabus or this file has drifted: a reordered, missing or
extra dot point cannot go unnoticed.

Section ids are unique within a page. Outcomes come from the focus area's own
outcome list in the syllabus file (its *Outcomes:* line), and the page's outcome
range in the header is derived from that same line.
"""

# slug -> page settings. 'focus_area' is NESA's focus area title, exactly as it
# appears in resources/nesa-syllabus-content.md; 'year' is 11 or 12 (40 or 30
# indicative hours); 'quiz' is the quiz key prefix (data-quiz="<prefix>-<part>").
SPECS = {
    # ── Year 11 ────────────────────────────────────────────────────────────
    'interactive-media': {
        'focus_area': 'Interactive media and the user experience',
        'title': 'Interactive Media and the User Experience',
        'year': 11,
        'quiz': 'im',
        'parts': [
            [
                ('ux-communicate', 'Communicating with Interactive Media', 'EC-11-01, EC-11-11', 'Investigate how interactive media and the user experience'),
                ('im-issues', 'Social, Ethical and Legal Issues', 'EC-11-07', 'Investigate social, ethical and legal issues when developing'),
                ('im-evolution', 'Evolution of Interactive Media', 'EC-11-06, EC-11-07', 'Research the evolution of interactive media'),
                ('im-enterprise', 'Interactive Media in Enterprises', 'EC-11-01', 'Describe the contribution of interactive media systems'),
                ('im-hardware', 'Hardware Performance Requirements', 'EC-11-08, EC-11-10', 'Evaluate the performance requirements of hardware'),
                ('creative-processes', 'Supporting Creative Processes', 'EC-11-06, EC-11-07', 'Explain how interactive media systems can support creative'),
                ('behaviour-influence', 'Influencing Human Behaviour', 'EC-11-01, EC-11-07', 'Examine how human behaviour may be influenced'),
                ('digital-marketing', 'Digital Marketing and Consumer Behaviour', 'EC-11-04, EC-11-07', 'Investigate how digital marketing techniques'),
                ('social-media-apps', 'Social Media and Human Connection', 'EC-11-01, EC-11-07', 'Evaluate social media applications'),
                ('digital-identity', 'Digital Identities and Profiling', 'EC-11-03, EC-11-07', 'Explore how interactive media platforms support the creation'),
            ],
            [
                ('file-formats', 'Choosing File Formats', 'EC-11-02, EC-11-08', 'Select and use appropriate file formats'),
                ('media-software', 'Software for Interactive Elements', 'EC-11-08', 'Use software to develop elements'),
                ('digitise-assets', 'Digitising Assets and Compression', 'EC-11-02, EC-11-08', 'Use hardware and software to digitise assets'),
                ('ui-vs-ux', 'How the UI Shapes the UX', 'EC-11-08, EC-11-10', 'Explain how the user interface (UI) impacts'),
                ('ui-design-tools', 'Design Tools for an Engaging UI', 'EC-11-08, EC-11-11', 'Apply design tools and techniques'),
            ],
            [
                ('design-thinking-ux', 'Design Thinking for a Front-End System', 'EC-11-08, EC-11-09, EC-11-11', 'Apply design thinking to develop a front-end'),
                ('data-journalism', 'Interactive Data Journalism', 'EC-11-04, EC-11-05, EC-11-11', 'Develop and publish an interactive work of data journalism'),
                ('im-project-approach', 'Choosing a Project Management Approach', 'EC-11-08, EC-11-09', 'Select an appropriate project management approach'),
                ('user-interaction', 'User Interaction in Web-Based Systems', 'EC-11-01, EC-11-10', 'Apply features of user interaction and UX'),
            ],
        ],
    },
    'networking-systems': {
        'focus_area': 'Networking systems and social computing',
        'title': 'Networking Systems and Social Computing',
        'year': 11,
        'quiz': 'net',
        'parts': [
            [
                ('disruptive-tech', 'Disruptive Technology', 'EC-11-01, EC-11-06, EC-11-07', 'Investigate the effects of disruptive technology'),
                ('social-graph-theory', 'Graph Theory in Social Networks', 'EC-11-04, EC-11-06', 'Investigate the application of graph and network theory in the design of social'),
                ('mobile-apps-social', 'Web Apps and Mobile Apps', 'EC-11-01, EC-11-06', 'Describe how web applications and dedicated apps'),
                ('iot-iome', 'IoT and the Internet of Me', 'EC-11-03, EC-11-06, EC-11-07', 'Investigate how the development of hardware and software has influenced'),
                ('startup-success', 'What Makes a Start-Up Succeed', 'EC-11-01, EC-11-06', 'Outline the business and individual cultural characteristics'),
            ],
            [
                ('connectivity-work', 'Connectivity and Work Practices', 'EC-11-01, EC-11-06', 'Investigate how the developments in network connectivity'),
                ('digital-workflows', 'Digital Workflows', 'EC-11-01, EC-11-10', 'Examine the benefits and limitations of digital workflows'),
                ('storage-requirements', 'Enterprise Data Storage Requirements', 'EC-11-02, EC-11-03', 'Investigate data storage requirements'),
                ('cloud-services', 'Cloud Computing Services', 'EC-11-01, EC-11-06', 'Explore cloud computing services'),
                ('cloud-storage-types', 'Types of Cloud Storage', 'EC-11-02, EC-11-03, EC-11-10', 'Compare different types of cloud-based data storage'),
            ],
            [
                ('it-infrastructure', 'Enterprise IT Infrastructure', 'EC-11-01', 'Describe key components of an organisation'),
                ('transmission-media', 'Transmission Media', 'EC-11-01, EC-11-08', 'Describe how transmission media is used'),
                ('transmission-interference', 'Interference with Data Transmission', 'EC-11-01, EC-11-10', 'Explain factors that interfere with the transmission of data'),
                ('improve-data-flow', 'Improving Data Flow', 'EC-11-08, EC-11-10', 'Investigate ways to improve data flow'),
                ('network-theory', 'Graph Theory in Network Design', 'EC-11-05, EC-11-08', 'Investigate the application of graph theory and network theory'),
                ('iot-interoperability', 'IoT Interoperability and SCADA', 'EC-11-01, EC-11-06', 'Explore device interoperability'),
                ('iot-protocols', 'IoT Communication Protocols', 'EC-11-02, EC-11-06', 'Investigate communication protocols between devices'),
                ('ml-iot', 'Machine Learning and IoT', 'EC-11-04, EC-11-05, EC-11-06', 'Explore the benefits of interfacing machine learning'),
                ('network-access-security', 'Controlling Access to Networks', 'EC-11-03, EC-11-07', 'Investigate security measures used to control access'),
                ('home-network-security', 'Securing a Smart Home Network', 'EC-11-03, EC-11-07', 'Examine data security for an intelligent home network'),
            ],
            [
                ('design-network', 'Designing and Modelling a Network', 'EC-11-08, EC-11-11', 'Design and model a network of interconnected devices'),
                ('network-project-tools', 'Project Management Tools', 'EC-11-08, EC-11-09', 'Apply appropriate project management tools'),
                ('configure-devices', 'Configuring Network Devices', 'EC-11-03, EC-11-08', 'Configure devices within a network'),
                ('security-protocols', 'Security Procedures and Protocols', 'EC-11-03, EC-11-09', 'Implement procedures and security protocols'),
                ('network-performance', 'Optimising Network Performance', 'EC-11-08, EC-11-10', 'Explore opportunities for optimising network performance'),
                ('transmission-hw-sw', 'Hardware and Software for Data Transmission', 'EC-11-03, EC-11-10', 'Evaluate the role of hardware and software'),
            ],
        ],
    },
    'cybersecurity': {
        'focus_area': 'Principles of cybersecurity',
        'title': 'Principles of Cybersecurity',
        'year': 11,
        'quiz': 'cyber',
        'parts': [
            [
                ('privacy-trust-foi', 'Privacy, Trust and Freedom of Information', 'EC-11-03, EC-11-07', 'Explain privacy, trust and freedom of information'),
                ('privacy-principles', 'Privacy and Security Principles', 'EC-11-03, EC-11-04', 'Describe privacy and security principles'),
                ('personal-privacy', 'Protecting Your Own Data', 'EC-11-03, EC-11-07', 'Investigate how an individual can contribute'),
                ('social-vulnerabilities', 'Social Networking Vulnerabilities', 'EC-11-03, EC-11-07', 'Explore security vulnerabilities of social networking'),
                ('breach-attributes', 'Attributes of a Cybersecurity Breach', 'EC-11-03, EC-11-04', 'Describe the attributes of a cybersecurity breach'),
                ('threat-actors', 'Threat Actors and Vulnerabilities', 'EC-11-01, EC-11-03', 'Investigate vulnerabilities exploited by the threat actor'),
            ],
            [
                ('cybercrime-threats', 'Cybercrime Threats', 'EC-11-01, EC-11-07', 'Investigate cybercrime threats to an enterprise'),
                ('protect-data', 'Hardware and Software Protection', 'EC-11-03, EC-11-06', 'Research hardware and software strategies'),
                ('risk-management', 'Cyber Risk Management', 'EC-11-03, EC-11-09', 'Investigate cyber risk management'),
                ('risk-matrix', 'Assessing Risk with a Risk Matrix', 'EC-11-03, EC-11-09', 'Assess cyber risk by implementing risk-management strategies'),
            ],
            [
                ('breach-impacts', 'Impacts of Cybersecurity Breaches', 'EC-11-01, EC-11-07', 'Explain impacts of cybersecurity breaches'),
                ('cyber-law', 'Cybersecurity Law and Legislation', 'EC-11-07', 'Identify laws and legislation associated with cybersecurity'),
                ('emerging-threats', 'Current and Emerging Cybercrime', 'EC-11-06, EC-11-07', 'Explore current and emerging cybercrime threats'),
            ],
        ],
    },
    # ── Year 12 ────────────────────────────────────────────────────────────
    'data-science': {
        'focus_area': 'Data science',
        'title': 'Data Science',
        'year': 12,
        'quiz': 'ds',
        'parts': [
            [
                ('quant-qual', 'Quantitative and Qualitative Data', 'EC-12-02, EC-12-04', 'Explore the difference between quantitative and qualitative'),
                ('data-types', 'Data Types for Representing Data', 'EC-12-02, EC-12-04', 'Determine which data types are used'),
                ('measurement-levels', 'Levels of Measurement', 'EC-12-02, EC-12-05', 'Explore nominal, ordinal, interval and ratio'),
                ('data-sampling', 'Data Sampling and Collection', 'EC-12-03, EC-12-04', 'Investigate data sampling'),
                ('data-reliability', 'Assessing Primary and Secondary Data', 'EC-12-02, EC-12-10', 'Assess the relevance, accuracy, validity and reliability'),
                ('informatics', 'Informatics and Understanding Data', 'EC-12-02, EC-12-04', 'Investigate how informatics supports'),
                ('present-data', 'Interpreting and Presenting Data', 'EC-12-05, EC-12-11', 'Interpret and present data using graphs'),
                ('structured-data', 'Structured and Unstructured Datasets', 'EC-12-02, EC-12-04', 'Investigate structured and unstructured datasets'),
                ('alternative-data', 'Likes, Emoticons and Memes as Data', 'EC-12-04, EC-12-06', 'Explore the use of likes, emoticons and memes'),
                ('data-errors', 'Errors, Uncertainty and Limitations', 'EC-12-02, EC-12-10', 'Examine the impact of errors, uncertainty and limitations'),
                ('blockchain', 'Blockchain', 'EC-12-03, EC-12-06', 'Explain how blockchain technology'),
                ('privacy-features', 'Software Features and Data Privacy', 'EC-12-03, EC-12-07', 'Examine software features that affect the privacy'),
                ('big-data', 'Big Data and Data Warehousing', 'EC-12-04, EC-12-06', 'Explore the use of big data and data warehousing'),
                ('data-mining', 'Data Mining', 'EC-12-04, EC-12-07', 'Explore the risks and benefits of data mining'),
                ('data-scale', 'The Impact of Data Scale', 'EC-12-06, EC-12-07', 'Analyse the impact of data scale'),
                ('storage-methods', 'Methods of Data Storage', 'EC-12-03, EC-12-10', 'Evaluate the effectiveness of different methods for data storage'),
            ],
            [
                ('ethical-data-use', 'Ethical Use of Data', 'EC-12-07', 'Investigate the ethical use of data'),
                ('data-issues', 'Social, Ethical and Legal Issues', 'EC-12-03, EC-12-07', 'Explore social, ethical and legal issues associated with using data'),
                ('data-law', 'Legal Issues in Data Handling', 'EC-12-03, EC-12-07', 'Investigate the legal issues surrounding data collection'),
                ('curated-data', 'Curated Data and Social Behaviour', 'EC-12-04, EC-12-07', 'Investigate the influence of curated and communicated data'),
            ],
            [
                ('spreadsheet-summary', 'Summarising Data in a Spreadsheet', 'EC-12-05, EC-12-08', 'Summarise data using a spreadsheet'),
                ('spreadsheet-analysis', 'Spreadsheet Analysis Features', 'EC-12-05, EC-12-08', 'Collate information using spreadsheet analysis features'),
                ('filter-sort', 'Filtering, Grouping and Sorting', 'EC-12-05, EC-12-08', 'Filter, group and sort data in a spreadsheet'),
                ('data-dashboard', 'Developing a Data Dashboard', 'EC-12-05, EC-12-11', 'Apply spreadsheet analysis features to develop a data dashboard'),
                ('flat-file', 'Developing a Flat-File Database', 'EC-12-03, EC-12-08', 'Develop a flat-file database'),
                ('relational-db', 'Designing a Relational Database', 'EC-12-03, EC-12-08', 'Apply computational thinking to design a relational database'),
                ('ml-analytics', 'Machine Learning and Statistical Modelling', 'EC-12-05, EC-12-06', 'Explore how machine learning and statistical modelling'),
            ],
        ],
    },
    'data-visualisation': {
        'focus_area': 'Data visualisation',
        'title': 'Data Visualisation',
        'year': 12,
        'quiz': 'dv',
        'parts': [
            [
                ('dv-purposes', 'Purposes of Data Visualisation', 'EC-12-02, EC-12-11', 'Explain the purposes of data visualisation'),
                ('dv-software-features', 'Software Features for Understanding Data', 'EC-12-05, EC-12-08', 'Describe how features of software contribute'),
                ('dv-patterns', 'Identifying Patterns and Trends', 'EC-12-04, EC-12-05', 'Identify patterns in data by interpreting and comparing'),
                ('analytics-evolution', 'Evolution of Hardware and Software', 'EC-12-06', 'Investigate the impact of the evolution of hardware and software'),
                ('olap', 'Online Analytical Processing (OLAP)', 'EC-12-04, EC-12-05', 'Describe online analytical processing'),
                ('data-integrity', 'Data Integrity', 'EC-12-03, EC-12-10', 'Assess data integrity in the development'),
                ('dv-warehousing', 'Data Warehousing and Visualisation', 'EC-12-02, EC-12-04', 'Explain the impact of enterprise data warehousing'),
                ('dv-big-data', 'Big Data and Visualisation Design', 'EC-12-04, EC-12-06', 'Explain how big data affects the design'),
                ('dv-bias', 'Bias in Visualisations', 'EC-12-03, EC-12-07', 'Evaluate bias in data collection'),
            ],
            [
                ('dv-tools', 'Evaluating Visualisation Tools', 'EC-12-08, EC-12-10', 'Evaluate the effectiveness of software tools'),
                ('interrogate-data', 'Interrogating a Visualisation', 'EC-12-05, EC-12-10', 'Interrogate data from a data visualisation'),
            ],
            [
                ('graphic-design-tools', 'Graphic Design Tools', 'EC-12-08, EC-12-11', 'Use graphic design tools'),
                ('dv-ux', 'User Experience and Visualisation', 'EC-12-10, EC-12-11', 'Explain how user experience (UX) influences'),
                ('ux-criteria', 'Criteria for Evaluating User Experience', 'EC-12-10', 'Develop and implement criteria for evaluating'),
                ('emerging-ui-ux', 'Emerging Technologies in UI and UX', 'EC-12-06', 'Investigate the impact of emerging hardware and software technologies'),
            ],
            [
                ('source-data', 'Sourcing and Organising Data', 'EC-12-03, EC-12-04', 'Research, source, organise and store data'),
                ('develop-visualisation', 'Designing and Developing a Visualisation', 'EC-12-05, EC-12-08, EC-12-11', 'Design and develop a data visualisation'),
                ('dv-data-security', 'Maintaining Data Security', 'EC-12-03', 'Investigate and implement methods to maintain data security'),
            ],
        ],
    },
    'intelligent-systems': {
        'focus_area': 'Intelligent systems',
        'title': 'Intelligent Systems',
        'year': 12,
        'quiz': 'is',
        'parts': [
            [
                ('dss-applications', 'Decision Support Systems', 'EC-12-01, EC-12-04', 'Investigate applications of decision support systems'),
                ('decision-categories', 'Categories of Decision-Making', 'EC-12-01, EC-12-02', 'Describe categories of decision-making'),
                ('expert-applications', 'Applications of Expert Systems', 'EC-12-01', 'Investigate common applications of expert systems'),
                ('expert-features', 'Key Features of an Expert System', 'EC-12-02, EC-12-08', 'Describe key features of an expert system'),
                ('expert-advances', 'From Rules to Probability', 'EC-12-06', 'Research factors that have allowed expert systems to advance'),
                ('changing-needs', 'Changing Needs and Expert Systems', 'EC-12-01, EC-12-06', 'Describe how people'),
                ('intelligent-agents', 'Intelligent Agents and Search Engines', 'EC-12-04, EC-12-06', 'Describe the operation of simplistic and complex intelligent agents'),
                ('inference-engines', 'Inference Engine Techniques', 'EC-12-02, EC-12-08', 'Compare techniques used by different inference engines'),
                ('is-hardware', 'Hardware in Intelligent Systems', 'EC-12-06, EC-12-08', 'Investigate the hardware used in an intelligent system'),
                ('is-computational-thinking', 'Computational Thinking in Design', 'EC-12-08', 'Explore how computational thinking can be integrated'),
                ('is-diagrams', 'Communicating Logical Processes', 'EC-12-08, EC-12-11', 'Communicate the logical processes performed'),
                ('is-disruption', 'Disruptive Effects of Intelligent Systems', 'EC-12-06, EC-12-07', 'Investigate the disruptive effects of intelligent systems'),
                ('is-ethics', 'Social and Ethical Issues', 'EC-12-07', 'Investigate social and ethical issues'),
                ('is-emerging', 'Current and Emerging Technologies', 'EC-12-06', 'Investigate current and emerging technologies'),
                ('is-enterprise-needs', 'Meeting Enterprise Needs', 'EC-12-01, EC-12-06', 'Explain how intelligent systems combine innovative techniques'),
            ],
            [
                ('iot-infrastructure', 'Infrastructure for an Intelligent Network', 'EC-12-01, EC-12-08', 'Investigate the infrastructure requirements'),
                ('iot-data', 'Data in an Intelligent IoT Network', 'EC-12-02, EC-12-04', 'Explore collection, type, storage, processing'),
                ('simulation-automation', 'Simulation, Modelling and Automation', 'EC-12-01, EC-12-05', 'Investigate the application of simulation, data modelling'),
                ('surveillance', 'Intelligent Systems in Surveillance', 'EC-12-03, EC-12-07', 'Explain the role of intelligent systems in surveillance'),
                ('ai-iot', 'AI and Efficiency in IoT', 'EC-12-01, EC-12-06', 'Explain how AI supports efficiency'),
            ],
            [
                ('rules-facts', 'Rules and Facts for an Expert System', 'EC-12-08', 'Develop a set of rules and facts'),
                ('certainty-decision-tree', 'Certainty Factors and Decision Trees', 'EC-12-05, EC-12-08', 'Apply certainty factors to construct a decision tree'),
                ('verify-dss-data', 'Verifying Data Sources', 'EC-12-03, EC-12-10', 'Verify the sources of data'),
                ('knowledge-base', 'Building a Knowledge Base', 'EC-12-08, EC-12-11', 'Use a flowchart to develop a knowledge base'),
                ('smart-system', 'Designing an Automated Smart System', 'EC-12-08, EC-12-11', 'Design and model an automated smart system'),
                ('automated-processing', 'Implementing Automated Processing', 'EC-12-08', 'Implement automated processing using software'),
                ('assess-dss-output', 'Assessing Decision Support Output', 'EC-12-05, EC-12-10', 'Assess the output produced by a decision support system'),
                ('expert-efficiency', 'Expert Systems and Efficiency', 'EC-12-01, EC-12-06', 'Explain how expert systems contribute'),
            ],
        ],
    },
    'enterprise-project': {
        'focus_area': 'Enterprise project',
        'title': 'Enterprise Project',
        'year': 12,
        'quiz': 'ep',
        'parts': [
            [
                ('manage-document', 'Managing and Documenting a Project', 'EC-12-08, EC-12-09', 'Describe the tools and processes used to manage and document'),
                ('changing-enterprise', 'The Changing Nature of Enterprise', 'EC-12-06, EC-12-07', 'Explain the effect of the changing nature of enterprise'),
            ],
            [
                ('design-tools', 'Tools for Design and Development', 'EC-12-08, EC-12-09', 'Investigate tools that support the design and development'),
                ('thinking-skills', 'Computational, Design and Systems Thinking', 'EC-12-08', 'Describe how computational, design and systems thinking'),
                ('collaboration-criteria', 'Collaborating and Managing Criteria', 'EC-12-08, EC-12-09', 'Select key collaborating and managing criteria'),
            ],
            [
                ('requirements-tools', 'Tools for Requirements and Limitations', 'EC-12-08, EC-12-10', 'Apply tools to inform the requirements and limitations'),
                ('development-approaches', 'Choosing a Development Approach', 'EC-12-08, EC-12-09', 'Explore and apply the most suitable development approach'),
                ('implementation-plan', 'Planning Implementation', 'EC-12-08, EC-12-09, EC-12-10', 'Develop an implementation plan'),
            ],
            [
                ('verify-validate', 'Verifying and Validating a System', 'EC-12-09, EC-12-10', 'Verify and validate an enterprise computing system'),
            ],
        ],
    },
}
