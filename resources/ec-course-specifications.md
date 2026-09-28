# Enterprise Computing – Higher School Certificate Course Specifications (transcription)

**Source document:** *Higher School Certificate Course Specifications – Enterprise Computing*, NSW Education Standards Authority (NESA), 21 pages, document ID D2022/519328, © 2023 NESA. PDF footer reads "updated Feb 2023" (page 4) and "updated March 2023" (pages 5–21).

**Official URL:** https://library.curriculum.nsw.edu.au/341419dc-8ec2-0289-7225-6db7f2d751ef/1299d565-a98e-4578-a5c6-53262a5ecc08/enterprise-computing-11-12-higher-school-certificate-course-specifications.PDF
(linked from the Overview, Content and Assessment tabs of https://curriculum.nsw.edu.au/learning-areas/tas/enterprise-computing-11-12-2022/overview; HTTP 200 checked 28 September 2026)

**Local copy:** `resources/enterprise-computing-11-12-2022-course-specifications.pdf`
**Page renders (PNG, 110 dpi):** `resources/spec-pages/ec-spec-page-NN.png` (see the index below).

**Transcribed by:** text extracted with PyMuPDF, then every diagram page viewed as an image and described by hand. Where text is quoted it is verbatim (including NESA's own typos, marked *(sic)*). Descriptions of diagrams are the transcriber's, written so that each symbol can be redrawn as SVG.

---

## Status of this document (important)

NESA states on page 4 (verbatim):

> "Enterprise Computing Course Specifications are an integral part of the course content for Year 11 and Year 12 and indicate the depth of study required for some concepts in the Enterprise Computing 11–12 Syllabus. The Enterprise Computing 11–12 Syllabus must be applied in conjunction with the Enterprise Computing Course Specifications."

The syllabus page (https://curriculum.nsw.edu.au/learning-areas/tas/enterprise-computing-11-12-2022/content, "Enterprise Computing course specifications") repeats this. Anything the specifications name (symbols, SQL keywords, spreadsheet functions, testing/implementation methods) is therefore examinable content at the depth shown.

The 2025 HSC marking feedback (https://www.nsw.gov.au/education-and-training/nesa/curriculum/hsc-exam-papers/enterprise-computing/2025) confirms these are used in the exam: Question 21 required a Level 0 versus Level 1 data flow diagram "using the correct DFD symbols"; Question 15(b) required SQL with "four structured query language (SQL) keywords" and a join; Question 18 required spreadsheet formulas (SUM, LOOKUP, IF); Question 19 required an interface (screen) design; Question 22(a) required a Gantt chart used to "schedule and track a team's allocated activities".

## Contents and page index

| PDF page | Section | Diagram/symbols on page? | PNG render |
|---|---|---|---|
| 1 | Cover | No | – |
| 2 | Copyright and acknowledgement | No | – |
| 3 | Table of contents | No | – |
| 4 | Introduction; System and Data Modelling Tools; Data flow diagrams – symbols | Yes (4 DFD symbols) | `spec-pages/ec-spec-page-04.png` |
| 5 | Voting-system DFD; Level 0 DFD | Yes | `spec-pages/ec-spec-page-05.png` |
| 6 | Flowcharts (4 symbols and worked example) | Yes | `spec-pages/ec-spec-page-06.png` |
| 7 | System flowcharts (9 symbols and worked example) | Yes | `spec-pages/ec-spec-page-07.png` |
| 8 | Decision trees (two representations) | Yes | `spec-pages/ec-spec-page-08.png` |
| 9 | Data dictionary (table); Storyboards | Yes (storyboard) | `spec-pages/ec-spec-page-09.png` |
| 10 | Network diagram | Yes | `spec-pages/ec-spec-page-10.png` |
| 11 | Graph and network theory (2 symbols and worked example) | Yes | `spec-pages/ec-spec-page-11.png` |
| 12 | Project Management Tools – Gantt charts (two examples) | Yes | `spec-pages/ec-spec-page-12.png` |
| 13 | Process diaries/log books | No | – |
| 14 | System implementation methods | No | – |
| 15 | Methods for testing a system | No | – |
| 16 | Relational databases – normalisation; schemas (diagram) | Yes | `spec-pages/ec-spec-page-16.png` |
| 17 | SQL syntax | No | – |
| 18 | Machine learning and statistical modelling | No | – |
| 19 | Application software specifications – database software | No | – |
| 20 | Spreadsheet software; expert system software | No | – |
| 21 | Graphics software; presentation software | No | – |

The specifications contain **no risk matrix**, no UML/use-case notation, no entity-relationship "crow's foot" standard and no pseudocode standard. Every notation is on the pages above.

---

# System and Data Modelling Tools (pages 4–11)

## 1. Data flow diagrams (DFDs) – pages 4–5

### 1.1 Symbols (page 4)

NESA's heading is "Symbols". Four symbols are shown, each with a label inside the shape and NESA's definition beside it.

| Symbol | Shape (for redrawing) | NESA wording (verbatim) |
|---|---|---|
| **Process** | A **circle** (outline only, thin dark line, no fill) with the label "Process" centred inside. | "A circle represents a process. A process uses input(s) to generate output(s)." |
| **Data store** | A **rectangle open on one side**: the top edge, bottom edge and left edge are drawn; the **right edge is missing** (open). Wider than it is tall (about 1.6 : 1). Label "Data store" inside. In the voting diagram, arrows enter and leave through the open right side. | "A data store can be an electronic file or non-computer storage." |
| **External entity** | A **closed, near-square rectangle** (about 1.2 : 1 tall, outline only) with the label "External entity" on two lines. | "An external entity can be any person, organisation or element that provides data to the system or receives data from the system." |
| **Data flow** | A **labelled, curved arrow**. In the symbol key it is drawn as a flattened ellipse-like arc (an open curve, with a small arrowhead at the upper right) with the label "Data flow" inside the curve. In diagrams it is a smooth curved line ending in a solid triangular arrowhead, with its label written beside the curve (not inside). | "A labelled, curved arrow represents the flow of data between processes, data stores and external entities." |

Drawing conventions visible in NESA's own diagrams (pages 5 and 4): strokes are thin dark grey/black, no fills, sans-serif labels; every data flow line carries an arrowhead and a text label. A pair of flows between the same two symbols (e.g. Voting and Endorsed candidates) is drawn as two separate parallel curves, one each way, each with its own label. NESA does not number processes in these examples.

### 1.2 Worked example – voting system (page 5, upper diagram)

NESA text (page 4): "The following data flow diagram models a voting system." (The diagram is at the top of page 5.)

Symbols used:
- External entities (squares): **Candidates**, **Voters**, **Public**
- Processes (circles): **Nomination process**, **Voting**, **Results**
- Data stores (open-right rectangles): **Endorsed candidates**, **Electoral roll**

Data flows (source → destination : label):

| From | To | Label |
|---|---|---|
| Candidates | Nomination process | Candidates' details |
| Nomination process | Endorsed candidates | Successful candidates' details |
| Voters | Voting | Voters' details and vote |
| Voting | Voters | Confirmation |
| Endorsed candidates | Voting | List of candidates |
| Voting | Endorsed candidates | Vote |
| Electoral roll | Voting | Already voted or Vote accepted |
| Voting | Electoral roll | Voters' details |
| Endorsed candidates | Results | Candidates' details and accumulated votes |
| Results | Public | Election results |

Approximate layout (top to bottom): Candidates (top right) and Nomination process (top centre-right); Voters (top left); Voting circle in the middle; Endorsed candidates store on the right of Voting; Electoral roll store at lower left; Results circle at the bottom; Public square at lower right.

### 1.3 Level 0 data flow diagram (page 5, lower diagram)

NESA wording (verbatim): "Level 0 data flow diagrams represent an overview of the entire system and do not show data stores or internal processes. The following represents a Level 0 data flow diagram for the voting system."

The Level 0 diagram contains one central process circle (**Voting**) and three external entities (**Candidates**, **Voters**, **Public**). No data stores. Flows:

| From | To | Label |
|---|---|---|
| Candidates | Voting | Candidates' details |
| Voters | Voting | Voters' details and vote |
| Voting | Voters | Confirmation |
| Voting | Public | Election results |

Layout: Candidates at top left, Voting circle at centre, Voters below-left of Voting, Public at right.

---

## 2. Flowcharts – page 6

NESA wording (verbatim): "Flowcharts are diagrams that represent logic and are read from top to bottom and left to right. The following symbols are used."

Four symbols, drawn in a row with text inside each:

| Symbol name (NESA label) | Shape (for redrawing) |
|---|---|
| **input or output** | A **parallelogram** – slanted left and right sides leaning to the right (top edge shifted right relative to the bottom edge). Label "input or output" on two lines. |
| **terminator** | A **stadium / rounded-end rectangle** (a pill shape: straight top and bottom, fully semicircular left and right ends). Label "terminator". |
| **process** | A plain **rectangle**. Label "process". |
| **decision** | A **diamond** (rhombus, wider than tall). Label "decision". |

NESA note (verbatim): "NOTE: The arrows in the flowchart are used to show the direction of flow."

### Worked example (page 6): delivery charge for perishable and non-perishable items

NESA text: "The following flowchart represents the logic to determine the application of a delivery charge to perishable and non-perishable items."

Flow, top to bottom:
1. **START** (terminator)
2. **Enter if item perishable** (input/output parallelogram)
3. Decision: **Contains perishable items?**
   - **Yes** → line runs right then down into the process "Delivery charge applies".
   - **No** ↓
4. **Enter the delivery distance** (input/output)
5. Decision: **Delivery distance >10km?**
   - **Yes** → (right) to decision **Value of order ≤$100?**
     - **Yes** → (right, then down) to process "Delivery charge applies".
     - **No** → line runs back left to join the "No" line coming from the previous decision, into "No delivery charge".
   - **No** ↓ to process **No delivery charge**.
6. Process **Delivery charge applies** – its output line runs down and back left to join the main line above END.
7. Process **No delivery charge** ↓
8. **END** (terminator)

Yes/No labels are written beside the exit arrows of each diamond. All connectors are straight lines with orthogonal turns and arrowheads; there are no separate connector or off-page symbols.

---

## 3. System flowcharts – page 7

NESA wording (verbatim): "System flowcharts are used to represent the main processes and devices in a system. Symbols include the following."

Nine symbols, arranged 3 × 3 (label to the right of each shape). Labels are exactly as printed, including the misspelling "Online dispay" *(sic – NESA's typo for "Online display")*.

| Symbol name (NESA label) | Shape (for redrawing) |
|---|---|
| **Paper document** | A rectangle whose **bottom edge is wavy** (a single S-shaped curve: dipping down on the left, rising on the right). Top and sides straight. |
| **Process** | A plain **rectangle** (wider than tall). |
| **Direct access storage** | A **cylinder / "can"**: a vertical cylinder with an elliptical top (full ellipse visible) and a curved (elliptical arc) bottom; sides straight. |
| **Online dispay** *(sic)* | A **hexagon-like "display" shape**: pointed on the left (two straight edges converging to a point), straight top and bottom edges, and a **curved (convex arc) right side**. |
| **Manual operation** | An **inverted trapezium**: wide top edge, shorter bottom edge, sloping sides. |
| **Telecommunications link** | A **lightning-bolt / zig-zag line**: a horizontal line at the top (right half), a diagonal running from the top-left down to the lower right, and a horizontal line at the bottom (left half) – a stretched "Z" or "N" outline made only of line segments (no closed shape). |
| **Online input** | A quadrilateral with **straight left, right and bottom edges and a sloping top edge** (top edge rises from the lower left corner to the higher right corner), so the left side is shorter than the right side. |
| **Magnetic tape** | A **circle with a short square-cornered tail** at the bottom right (a circle whose lower-right is drawn out to a small horizontal step, like a tape reel). |
| **Cloud** | A conventional **cloud outline** (three rounded humps on top, flat/rounded base). |

NESA note (verbatim): "NOTE: The arrows in system flowcharts are used to show the direction of data between each of the symbols."

### Worked example (page 7): a doctor managing patient information

NESA text: "The following system flowchart represents part of a system used by a doctor in managing patient information."

Elements and connections (straight arrows, some diagonal):

| From | To | Notes |
|---|---|---|
| **Patient details** (Online input) | **Add a new patient** (Process) | single arrow |
| **Add a new patient** (Process) | **Patient file** (Direct access storage) | **double-headed** arrow (read and write) |
| **Add a new patient** | **Patient confirmation** (Online display) | single arrow |
| **Patient file** | **Consultation** (Process) | single arrow |
| **Visit details** (Online input) | **Consultation** | single arrow |
| **Consultation** | **Consultation file** (Direct access storage) | single arrow |
| **Consultation file** | **Health data** (Cloud) | joined through a **Telecommunications link** symbol drawn between the cylinder and the cloud, with an arrow into the cloud |
| **Consultation** | **Billing** (Process) | single arrow |
| **Billing** | **Patient account** (Paper document) | single arrow |

---

## 4. Decision trees – page 8

NESA wording (verbatim, including the missing word): "A decision tree is a that represents all possible combinations of decisions and their resulting actions. Branches are shown to describe the eventual action diagram depending on the condition at the time. Each decision path will lead to either another decision or a final action." *(sic – "a that" appears in the original.)*

### 4.1 Horizontal (left-to-right) decision tree – smart-house comfort control

NESA text: "The following decision tree shows the rules in controlling the comfort levels within a 'smart' house."

Layout: a root label **Actions** on the far left; branches fan out to the right as straight diagonal lines; column headings (italic) across the top: **Inside temperature | Humidity | Fan | Cooling | Heating | Window**. Leaves are shown as text separated by short horizontal dashes ("——").

| Inside temperature | Humidity | Fan | Cooling | Heating | Window |
|---|---|---|---|---|---|
| > 30°C | > 50% | High | On | Off | Closed |
| > 30°C | ≤ 50% | Medium | On | Off | Closed |
| 15–30°C | > 50% | Medium | On | Off | Closed |
| 15–30°C | ≤ 50% | Medium | Off | Off | Open |
| < 15°C | > 50% | Low | Off | Off | Open |
| < 15°C | ≤ 50% | Medium | Off | On | Closed |

Structure: Actions → three temperature branches (> 30°C, 15–30°C, < 15°C); each temperature branch splits into two humidity branches (> 50%, ≤ 50%); each humidity branch ends in a horizontal chain of settings.

### 4.2 Vertical (top-down) decision tree – buying a car

NESA text: "The following diagram shows another way to represent a decision tree."

Nodes are **rectangles** (outline only) joined by straight diagonal lines labelled **Yes** / **No** (left branch Yes, right branch No). Leaves ("Buy" / "Do not buy") are also rectangles.

```
                  [Mileage < 10 000 km]
                 Yes /            \ No
        [Type = SUV]                [Type = SUV]
        Yes /   \ No                Yes /   \ No
       [Buy]  [Colour = Silver]   [Buy]  [Optional Accessories]
              Yes /    \ No              Yes /        \ No
             [Buy]  [Do not buy]       [Buy]      [Do not buy]
```

---

## 5. Data dictionary – page 9

NESA wording (verbatim): "A data dictionary provides a comprehensive description of each field in a database. This commonly includes field name, data type, data format, field size, description and example. An example of a data dictionary is shown."

| Field name | Data type | Data format | Field size | Description | Example |
|---|---|---|---|---|---|
| UserID | Text | XXXNNNN | 7 | Unique seven-character field with 4 digits | XYZ1539 |
| FirstName | Text | XXX…XXX | 25 | First name of employee | Jo |
| Surname | Text | XXX…XXX | 25 | Surname of employee | Smith |
| DOB | Date | DD/MM/YYYY | 10 | Date of birth | 15/07/1982 |
| HourlyPayRate | Currency | $#####.## | 9 | Rate of pay expressed in dollars per hour | $34.50 |
| Height | Real | #.## | 3 | Height in metres, with two decimal places | 1.58 |
| FeesPaid | Boolean | *(blank)* | 1 | Y or N for Yes or No | Y |

Presentation: a bordered table with a bold header row, thin black grid lines. Note the data types used (Text, Date, Currency, Real, Boolean) and the format notation (X = character, N = digit, # = numeric digit).

---

## 6. Storyboards – page 9

NESA wording (verbatim): "A storyboard shows the various interfaces (screens) as well as the links between them."

"The following storyboard shows the relationship between three pages of information aimed at promoting a school canteen on a website."

Three screen wireframes, each a **rounded-corner-free rectangle** (thin outline) containing:
- a **bold title** at top centre;
- a small rounded "**Help (?)**" button at top right (a pill with the word "Help" and a circled question mark);
- a **left navigation column** of rounded-rectangle buttons: **Home**, **Prices**, **Specials**, and **Exit** (Exit sits at the bottom of the column, bold). The button for the *current* page is filled **light blue**;
- a **content panel** (rounded rectangle) to the right of the navigation column, containing a heading and dotted lines representing text.

| Screen | Title | Highlighted (current) button | Content panel |
|---|---|---|---|
| Top left | **School Canteen** | Home (blue) | "Information" heading and dotted text lines; below it two boxes side by side: a dotted-text box and a box labelled *Image of canteen* (italic) |
| Bottom left | **Specials** | Specials (blue) | "Description of specials" and many dotted text lines |
| Right (lower, offset) | **Prices** | Prices (blue) | "Price list" heading and a 2 × 3 table of dotted-text cells |

Links between screens: each navigation button that links elsewhere has a small **black dot at its edge**, from which a **curved arrow** runs to the destination screen (arrowhead at the destination):
- School Canteen: **Prices** dot → arrow to the Prices screen; **Specials** dot → arrow down to the Specials screen.
- Specials: **Home** dot → arrow up to the School Canteen screen; **Prices** dot → arrow to the Prices screen.
- Prices: **Home** dot → arrow to the School Canteen screen; **Specials** dot → double-headed curved arrow linking with the Specials screen's content area.

Conclusion for drawing: dot-and-arrow = "this button navigates to that screen"; the highlighted (blue) button marks the current screen.

---

## 7. Network diagram – page 10

NESA wording (verbatim): "Students are expected to document a network using symbols to represent the component devices (nodes) and how they are connected. Network diagrams are also known as network maps."

"The following network diagram shows a network which includes a variety of devices. Different software packages represent the devices using different symbols. Students should clearly label all devices on their network diagrams."

The diagram is a hub-and-spoke map using **line-art device icons with a text label under each**, and **thin dotted (blue/violet) lines** as connections:

| Icon | Label | Description of icon |
|---|---|---|
| Wi-Fi signal arcs | **Internet** | three stacked curved arcs with a dot (wireless symbol), top centre |
| Router | **Router** | small rounded box with three dots on the front and two short antennae on top, centre |
| Hub | **Hub** (two of them) | flat rounded rectangle with four dots on the front; one on the left and one on the right of the router |
| Desktop computer with a phone beside it | **Computer** (six of them) | monitor on a keyboard base with a smartphone icon alongside; small arrows between the phone and the computer show data exchange |
| Tablet with phone | **Tablet** | tablet icon with a phone icon and exchange arrows, top left |
| Smartphone | **Smart phone** | tall rounded rectangle, bottom left |
| Bluetooth symbol | **Wireless device** | the Bluetooth rune glyph, bottom centre |
| Laptop | **Laptop** | open laptop outline, bottom right |

Connections (dotted lines): Internet–Router (vertical); Router–Hub (left) and Router–Hub (right) (horizontal); the left Hub connects to Tablet and three Computers; the right Hub connects to four Computers (right column); Router–Wireless device (vertical, downwards); Wireless device–Smart phone and Wireless device–Laptop (horizontal).

---

## 8. Graph and network theory – page 11

NESA wording (verbatim): "Graph and network theory can be applied in the design of social networks. The following symbols are used."

| Symbol | Shape | Representation (NESA, verbatim) |
|---|---|---|
| Links (edge) | A **straight horizontal line** (thin, dark navy) | "Links (edge): used to connect nodes (vertices), groups of nodes or clusters" |
| Node/vertex | A **circle** (outline only, thin dark line, no fill) | "An individual or category (node/vertex). Size may be used to indicate size of a dataset where appropriate." |

Worked example (verbatim description): "The diagram represents VB's social network. DS, SK, JM and FG are all individuals in VB's network. The categories, Online music, Online videos and Tech teach are also part of this social networking group. The labels on the links show the relationship between VB and individuals and categories."

Drawing details: **VB** is drawn as the largest circle in the centre (size encodes importance). Named nodes are mid-sized circles containing their labels: **DS**, **SK**, **JM**, **FG** (individuals) and **Online music**, **Online videos**, **Tech teach** (categories). About a dozen small **unlabelled circles** sit around the periphery as additional nodes connecting the network. Edges are straight lines, some with a text label breaking the line:

| Edge | Label |
|---|---|
| VB – DS | Friend |
| VB – SK | Friend |
| VB – JM | Friend |
| VB – FG | Friend |
| VB – Online music | Listen |
| VB – Online videos | Watch |
| VB – Tech teach | Group |

Other unlabelled edges join the small circles to each other and to DS, SK, JM, FG, Online music, Online videos and Tech teach, forming a mesh around VB. Only these seven relationships to VB carry labels.

---

# Project Management Tools (pages 12–13)

## 9. Gantt charts – page 12

NESA wording (verbatim): "A Gantt chart displays each of the component tasks in a proposed system development on an estimated timeline. Tasks should be named with self-explanatory titles. The estimated time required for each task and its dependent tasks should be clearly shown. The time scale should be clearly indicated with dates and important milestones in the project clearly marked."

"The following diagram shows the main elements of a Gantt chart. Other formats are acceptable."

### 9.1 Example 1 – requirements gathering (main elements)

Layout: a table with a dark-navy header. Left columns: **ID** and **Task name**. Right: a **timeline** with a month row (**Aug**, **Sept**) and a day-number row (**30, 31** in Aug; **1 to 16** in Sept). Alternate/weekend day columns are shaded light grey. Tasks are **solid blue horizontal bars** placed on the timeline; **elbow arrows** join the end of a predecessor bar to the start of its dependent bar (dependencies); a **hollow diamond** marks a **milestone**.

| ID | Task name | Bar (approximate placement read from the chart) |
|---|---|---|
| 1 | Interview participants | 30–31 Aug |
| 2 | Collate interview results | about 3 Sept (after task 1) |
| 3 | Document participant needs | about 4–5 Sept (after task 2) |
| 4 | Identify system processes | about 4–5 Sept (parallel with 3) |
| 5 | Identify data/information needs | about 4–5 Sept (parallel with 3 and 4) |
| 6 | Produce a data flow diagram | about 6–10 Sept (after 5) |
| 7 | Produce a requirements report | about 11–15 Sept (after 6) |
| 8 | Requirements milestone | hollow diamond at about 16 Sept (after 7) |

### 9.2 Example 2 – resources and percentage completion

NESA wording (verbatim): "Gantt charts can also be used to allocate resources, including team members, to specific tasks. The following chart shows the percentage completion of tasks by each team member. Charts should be regularly updated during development to reflect actual versus estimated times for tasks."

Layout: left table with columns **Task name** and **Planned start date** (dd-mm-yyyy); timeline header with week-commencing labels **31 Oct 2022, 7 Nov 2022, 14 Nov 2022, 21 Nov 2022, 28 Nov 2022, 5 Dec** and a day-letter row (**M T W T F S S** repeated). Rows are grouped into collapsible **summary tasks** (a boxed minus sign) with indented sub-tasks. Each bar is coloured by phase: **blue** (1. Analysis), **pink** (2. Design), **green** (3. Development). The **darker portion of a bar shows percentage complete**; the **lighter portion is remaining work**. Bar labels give the task name, % complete and, where allocated, the **team member(s)**. Milestones are hollow diamonds with a date label.

| Row | Planned start | Bar label / notes (as printed) |
|---|---|---|
| **1. Analysis** (summary) | 31-10-2022 | "1. Analysis 69%" |
| On-site meetings | 31-10-2022 | milestone diamond, label "31-10-2022" |
| Discussions with… (summary) | 1-11-2022 | "Discussion with Stakeholders 90%" |
| Stakeholder req… | 1-11-2022 | "Stakeholder Requirement 1 100% Sara McLoy and Maria Hughs" |
| Stakeholder req… | 1-11-2022 | "Stakeholder Requirement 2 100%" |
| Customer requir… | 3-11-2022 | "Customer Requirement 1 50%" |
| Document Current… | 7-11-2022 | "Document Current Systems 0% James Larry and Maria Hughs" |
| Analysis complete | 10-11-2022 | milestone diamond, label "10-11-2022" |
| **2. Design** (summary) | 11-11-2022 | "2. Design 0%" |
| Design database | 11-11-2022 | "Design Database 0% Maria Hughs" |
| Software design | 14-11-2022 | "Software Design 0% Rebecca McCabe" |
| Interface design | 17-11-2022 | "Interface Design 0%" |
| Create design spec… | 19-11-2022 | "Create Design Specification 0% Danny Lee" |
| Design complete | 17-11-2022 | milestone diamond, label "24-11-2022" (as printed; the planned start and the milestone label differ in the original) |
| **3. Development** (summary) | 17-11-2022 | "3." (label truncated at the chart edge) |
| Deploy Developmen… | 29-11-2022 | "Deploy Development" |
| Develop System Mo… | 17-11-2022 | "Development System Modules 0% Steven" |
| Integrate System M… | 22-11-2022 | "Integrate System Modules 0%" |

Names are placeholder people in NESA's example (spelling as printed, e.g. "Hughs", "McCabe").

---

## 10. Process diaries/log books – page 13

NESA wording (verbatim): "Process diaries/log books are used to document the progress of a project.

Entries made by team members at regular intervals should include:
- date
- person making the entry
- progress since the last entry
- tasks achieved
- stumbling blocks or issues encountered and how they were managed
- possible approaches for upcoming tasks
- reflective comments
- resources used."

---

# System Implementation Methods – page 14

NESA wording (verbatim): "Students are expected to recognise and understand these system implementation methods:
- direct
- parallel
- pilot
- phased."

(The specifications give only the four names; no definitions are supplied on this page. Definitions of "system implementation" appear in the syllabus glossary.)

# Methods for Testing a System – page 15

NESA wording (verbatim): "Students are expected to recognise and understand the following methods for testing a system:
- functional testing
- acceptance testing
- live data
- simulated data
- beta testing
- volume testing."

(Again the specifications give only the names, no definitions.)

---

# Relational databases – page 16

## Normalisation

NESA wording (verbatim): "Normalisation is a process used in relational database design where data duplication is minimised by separating the database into a number of smaller linked tables. Each table should include fields that are solely dependent on the primary key in each table. If a database contains redundant data, potentially these data elements may not be updated consistently, leading to a data integrity problem."

## Schemas

NESA wording (verbatim): "A schema shows the organisational structure of a database. It shows the entities and their attributes. It should clearly identify the primary key in each table and the links and relationships between tables. The following demonstrates one way a schema can be represented. There are other acceptable methods that students can use."

### Schema diagram (page 16) – games database

Notation: each table is a **rectangle** with a **bold table name in a header box** (separated from the attribute list by a horizontal line), followed by the **attribute (field) names** listed one per line beneath. **(P)** after a field name marks the **primary key**; **(F)** marks a **foreign key**. The legend below the diagram reads "P = Primary key    F = Foreign key". Relationship lines are **thin orthogonal (right-angle) lines** joining the key fields, with **"1"** written at the "one" end and **"∞"** (infinity sign) at the "many" end.

| Table | Fields (in order) |
|---|---|
| **Games** | ID (P); Name; Release_date; Cost; Publisher_ID (F); Developer_ID (F) |
| **Publishers** | Publisher_ID (P); Name |
| **Developers** | Developer_ID (P); First_name; Last_name |

Relationships:
- **Publishers 1 — ∞ Games**, joined on Publisher_ID (line leaves Publisher_ID in Publishers, "1" at Publishers, "∞" at the Publisher_ID (F) row in Games).
- **Developers 1 — ∞ Games**, joined on Developer_ID ("1" at Developers, "∞" at the Developer_ID (F) row in Games).

Layout: Games on the left, Publishers in the middle, Developers on the right, all three at the same height.

---

# SQL Syntax – page 17

NESA wording (verbatim): "Structured Query Language (SQL) is a language used to access and manipulate data in relational databases. For the HSC Enterprise Computing course, students are expected to know the following standard syntax.
- SELECT (what is to be displayed)
- FROM (the tables to be used)
- WHERE (the search criteria which may come from multiple tables)
- ORDER BY (the sequence in which the results are displayed)"

These are the **four SQL keywords** examinable (SELECT, FROM, WHERE, ORDER BY). NESA's examples use ASC / DESC after ORDER BY, the logical operator AND, comparison operators (>=, <=, =), and dotted `Table.Field` notation.

**Example 1** (verbatim). "Using the schema set out on page 16 of this document, applying the following query will display the name and release date of all games released from 1 March 2022 to 31 March 2023. The results will be displayed in alphabetical order by game name."

```sql
SELECT Name, Release_date
FROM Games
WHERE Release_date >= '01/03/2022' AND Release_date <= '31/03/2023'
ORDER BY Name ASC
```

(The original uses typographic quotation marks around the dates and wraps the WHERE line onto a second line.)

**Example 2** (verbatim). "Applying the following query will display each developer's name, together with the games they have developed for the publisher 'Games Inc', listed in descending order of the developer's last name."

```sql
SELECT Developers.First_name, Developers.Last_name, Games.Name
FROM Games, Developers, Publishers
WHERE Publishers.Name = 'Games Inc'
AND Publishers.Publisher_ID = Games.Publisher_ID
AND Developers.Developer_ID = Games.Developer_ID
ORDER BY Developers.Last_name DESC
```

Note the join style: tables are listed in FROM separated by commas and joined in WHERE using key equality (there is no JOIN … ON syntax in the specification). The 2025 HSC marking feedback (Q15(b)) refers to "use a correct join clause to link related fields in tables" and to date formats using '-' rather than '/' in the stimulus tables, so follow the format of the stimulus data in the exam.

---

# Machine Learning and Statistical Modelling – page 18

NESA wording (verbatim): "Students should know that machine learning and statistical modelling can be used independently or together to analyse datasets and make predictions, but they are not required to understand the underlying logic of either. Students are expected to be aware of their use in real world scenarios."

---

# Application Software Specifications (pages 19–21)

NESA wording (verbatim): "Students should be familiar with the use of the following features."

## Database software – page 19

"Database software should allow students to:
- create flat file databases and relational databases
- use relational operators, including:
  - CONTAINS, DOES NOT CONTAIN
  - EQUALS, NOT EQUAL TO
  - GREATER THAN, GREATER THAN OR EQUAL TO
  - LESS THAN, LESS THAN OR EQUAL TO
- use logical operators, including:
  - AND, OR and NOT
- create queries and use a query language to search on single and multiple fields across one or more tables
- sort data using multiple fields to specify the sequence
- design forms and reports
- implement and display a schema
- import and export data
- apply security to the database."

## Spreadsheet software – page 20

"Spreadsheet software should allow students to:
- enter text, numeric values and formulas
- copy cells using both absolute and relative referencing
- fill down and across
- use built-in and user determined formulas, including:
  - Arithmetic: SUM, MAXIMUM, MINIMUM, COUNT, ABSOLUTE VALUE, SQUARE ROOT, INTEGER, PART
  - Statistical: MEAN, STANDARD DEVIATION
  - Logical: IF (determines a value based on a condition being TRUE or FALSE)
  - relational operators: LESS THAN OR EQUAL TO, EQUAL TO, NOT EQUAL TO, GREATER THAN and GREATER THAN OR EQUAL TO
  - Other: LOOKUP(s)
- print all or parts of a spreadsheet
- import data from a variety of sources
- export spreadsheet data in a variety of formats
- manipulate rows and columns of a spreadsheet and apply a variety of formats
- record, run and edit macro routines to automate processing
- sort selected areas of the spreadsheet
- configure page layouts and manipulate page breaks
- work with data across multiple sheets
- apply conditional formatting to display information
- use filters and pivot tables to display information
- generate and configure charts in a variety of formats, including:
  - bar charts
  - column charts
  - line charts
  - scatter graphs
  - pie charts
- save a chart to a file format for use in other software."

(In the PDF the function names are written in capitals as descriptive names: MAXIMUM, MINIMUM, ABSOLUTE VALUE, SQUARE ROOT, INTEGER, PART, MEAN, STANDARD DEVIATION – not as product-specific syntax such as MAX, ABS, SQRT, INT, AVERAGE, STDEV. "PART" is NESA's wording; its meaning is not defined in the document.)

## Expert system software – page 20

"Expert system software should allow students to:
- develop a set of IF–THEN rules
- add, remove and edit rules
- display the rules that the system has used to reach a conclusion in both a text format and as a decision tree."

## Graphics software – page 21

"Graphics software should allow students to:
- create and manipulate bitmapped images
- create and manipulate vector graphics as geometric shapes
- rotate, crop, resize and distort graphic images
- import and export graphic data in a variety of formats
- apply textures, patterns and transparent background
- use templates, colour themes and animations."

## Presentation software – page 21

"Presentation software should allow students to:
- create and manipulate text
- apply editing and formatting features
- insert and display text, images, audio, video and animations
- import and export data
- embed objects such as charts and tables from other applications
- use hyperlinks within and outside the presentation
- use templates and themes."

---

# Copyright and licence note (page 2) – relevant to reuse on the study-notes site

NESA's page 2 states that the documents on the NESA and NSW Curriculum websites are Crown copyright, that the websites "hold the only official and up-to-date versions", and that users agree "not to modify the material or any part of the material without the written permission of NESA", "to reproduce a single copy for personal bona fide study use only and not to reproduce any major extract or the entire material without the permission of NESA", "to include this copyright notice in any copy made" and "to acknowledge that NESA is the source of the material."

Under "Special arrangements applying to the NSW Curriculum Reform", NESA grants "a limited non-exclusive licence to: teachers employed in NSW government schools and registered non-government schools; parents of children registered for home schooling – to use, modify and adapt the NSW syllabuses for non-commercial educational use only. The adaptation must not have the effect of bringing NESA into disrepute." The note adds that these arrangements "do not apply to private/home tutoring companies, professional learning service providers, publishers, and other organisations." Copyright enquiries: copyright@nesa.nsw.edu.au.

Practical implication for the site: any redrawn SVG symbols and reproduced text should carry an acknowledgement that NESA is the source, link to the official PDF, and be presented as a study aid, not as a replacement for the official document. Bulk reproduction of the PDF pages themselves (the PNG renders in `spec-pages/`) is for internal reference while drawing the SVGs and should not be published on the site without NESA permission.
