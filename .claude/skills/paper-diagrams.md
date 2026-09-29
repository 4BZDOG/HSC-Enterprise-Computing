---
name: paper-diagrams
description: >
  Draw a static ("still") diagram with the diagram kit in js/anim.js: NESA
  Enterprise Computing flowcharts, system flowcharts, data flow diagrams,
  decision trees, storyboards, network diagrams, graphs, Gantt charts and
  schemas, plus sequence, state, class and concept diagrams. Covers the
  course notation (with NESA page numbers), colour coding, text sizes,
  layout, the ready-made reference scenes, and wiring a diagram into a page.
  Use it for any new or redrawn static figure.
category: content
---

# Skill: paper-diagrams

Static figures are drawn at runtime by the same engine as the animated
diagrams, so the two look like one family: soft fills, a subtle cut shadow,
Space Grotesk and IBM Plex type, and the Data Studio palette in light and
dark mode. A still diagram is a scene with `still: true` and no beats. It
has no player, gets an **Enlarge** button, and scrolls sideways inside its
figure on phones when it is wide.

This engine is the one used by the sister Software Engineering site. The
engine, the API and the scenes in `js/anims/` are shared, so a scene written
for either site works on both. Enterprise Computing adds the symbols the
NESA Enterprise Computing Course Specifications need (system flowcharts,
storyboards, schemas, graphs, network devices, Gantt tables). Those are
marked "EC" below and live under "EC extensions" in `js/anim.js`.

Use a still diagram for structure and reference; use an animated diagram
(`.claude/skills/add-animation.md`) when the idea is a process that unfolds
over time. Data flow diagrams and structure charts stay in
`js/nesa-diagrams.js` (they have their own data file, `js/nesa-diagram-data.js`)
and take the same fills from `css/theme.css`.

**Before drawing anything, look at the gallery.** `reference/diagram-gallery.html`
(open it with `python3 -m http.server 8831`) shows every scene below in the
standard figure markup, in light and dark mode. Copy the closest scene.

---

## Course notation (NESA Enterprise Computing Course Specifications)

Page numbers are those of the specifications; the transcription is
`resources/ec-course-specifications.md`. Get the symbols right before
anything else. `scripts/check-site.py` checks flowcharts, system flowcharts
and decision trees.

| Diagram | Symbols (kit `shape` or helper) | Rules |
|---|---|---|
| Data flow diagram (pp. 4-5) | `js/nesa-diagrams.js`: circle process, open-ended data store (open on the right), closed near-square external entity, labelled curved data flow | Every flow has an arrowhead and a label. Two flows between the same pair curve to opposite sides. A **Level 0** (context) diagram has one process, the external entities and no data stores. Data: `spec-dfd-voting`, `spec-dfd-voting-l0`. Key: `spec-dfd-symbols`. |
| Flowchart (p. 6) | `terminator`, `process`, `decision`, `io` (parallelogram); `subprogram` for a named module | Read top to bottom and left to right. Starts with a terminator reading `START` (NESA's word) or `BEGIN` and ends with `END`. Every arrow leaving a decision is labelled Yes/No (or True/False). Arrows show the direction of flow. Example: `spec-flowchart-delivery`; key: `spec-flowchart-symbols`. |
| System flowchart (p. 7) | EC shapes `sf-document` (paper document), `process`, `sf-storage` (direct access storage), `sf-display` (online display), `sf-manual` (manual operation), `sf-input` (online input), `sf-tape` (magnetic tape), `sf-cloud`, `sf-telecom` (the telecommunications link symbol on its own); connector `s.telecomLink(parent, a, b)` | Shows the main processes and devices of a system. Arrows show the direction of **data** between symbols (`both: true` for read and write). Join with `s.link(..., { straight: true })`. Do not mix in flowchart symbols (terminator, decision, io). NESA prints "Online dispay" (sic): write "Online display". Example: `spec-sysflow-doctor`; key: `spec-sysflow-symbols`. |
| Decision tree (p. 8) | `process` (question), `process` with `sage-t`/`terra-t` (final action) | Two forms, both in the specifications: horizontal (`spec-dt-smart-house`, columns of settings) and vertical (`spec-dt-buy-car`, rectangles joined by straight branches). Rectangles, not diamonds. Every branch labelled. Each path ends in another decision or a final action. |
| Data dictionary (p. 9) | **An HTML table, not a diagram** | Columns: field name, data type, data format, field size, description, example. Formats: X = character, N = digit, # = numeric digit. Use `<table>` in the page. |
| Storyboard (p. 9) | `s.storyboard()` / `s.screen()` (EC) | Screens with a title, a Help button, navigation buttons (the current page highlighted) and a content panel; a dot on a button with an arrow means "this button opens that screen". Number and caption each screen. Example: `spec-storyboard`. |
| Network diagram (p. 10) | `s.device()` (EC): internet, router, hub, switch, server, computer, laptop, tablet, phone, wireless, printer; dotted links with `cls: 'is-net'` | **Label every device.** Different packages draw devices differently, so the icons are free; the labels and connections are not. Example: `spec-network`. |
| Graph and network theory (p. 11) | `s.graph()` (EC): circle nodes (vertices) and straight edges | Node size may show size or importance; edge labels give the relationship; `weight` puts a number on an edge, `directed` adds arrowheads. Examples: `spec-graph-weighted` (NESA), `graph-weights` (numbers on edges). |
| Gantt chart (p. 12) | `s.ganttTable()` (EC) for NESA's table style; `s.gantt()` for the simple week chart | Self-explanatory task names, a clear dated time scale, dependencies as elbow arrows, milestones as hollow diamonds. Resources and percentage complete: solid part of the bar is work done. Examples: `spec-gantt-requirements`, `spec-gantt-resources`, `gantt-project`. |
| Schema (p. 16) | `s.tableBox()` + `s.relation()` (EC) | A table is a rectangle with the bold table name in a header box, then one field per line. **(P)** marks a primary key and **(F)** a foreign key; relationship lines join the key fields with **1** at the one end and **∞** at the many end. Other notations are acceptable (`keys: 'pk'`, `many: 'crow'`: `schema-alt`). Example: `spec-schema-games`. |
| Sequence diagram | `s.sequence()` | Actors across the top, solid arrows for requests, dashed for replies, numbered steps. |
| Class / state diagram | `s.classBox()`, `card` states + `s.link()` | Not in the specifications; use only if a syllabus dot point needs it. |
| Concept, process, architecture, cycle | `card`, `s.link`, cast from the kit | Free form, but keep to the colour code below. |

The specifications contain no risk matrix, no UML/use-case notation and no
pseudocode standard. Anything not in the table above is free-form.

NESA is the source of every symbol: keep the acknowledgement on the page
(NESA's copyright note is in `resources/ec-course-specifications.md`) and do
not publish NESA's page images.

## Colour code

Every symbol has its own fill by default, so readers learn the notation by
colour too. Only override a tone when the colour carries meaning. The tone
names are the ones the kit has always used; in this theme they are:

| Tone | Data Studio colour | Default use |
|---|---|---|
| `teal` (solid) | theme teal | Terminators; the user/client actor; "done" work in a Gantt bar |
| `mustard-t` | theme amber tint | Decisions and questions; data stores |
| `blush-t` | soft coral-pink tint | Input/output (flowchart parallelogram) |
| `sky-t` | soft blue tint | **All system flowchart symbols** except the plain `process` |
| `paper` | white / navy | Processes |
| `sheet` | pale slate | Subprograms, external entities, table headers |
| `sage-t` / `sage` | green | Good outcomes, "pass", working, approved |
| `terra-t` / `terra` | red-coral | Bad outcomes, "fail", errors, rejected, risk |
| `teal-t`, `plum-t` (violet) | tints | Neutral groupings (client side, external systems); DFD processes are `teal-t` |

Tints (`-t`) are soft versions for large shapes; text on them uses the
theme ink. Solid `teal`, `terra`, `sage`, `plum` get light text
automatically (dark text in dark mode); `mustard`, `blush` and `sky` keep
dark text in both modes. The tokens behind the tones are the `--pc-*`
custom properties in `css/theme.css` (section 11b): change a colour there,
never inside a scene.

## Clear text, always

- Node text 14px (13px minimum in dense diagrams); connector labels 13px
  (`labelSize: 13`). Never smaller.
- A still is never drawn bigger than its natural size (`maxWidth = W`), so
  design at the size you want it read. For a wide diagram set
  `minWidth` equal to the width (the figure then scrolls sideways on a phone
  instead of shrinking the text below 13px).
- Break labels with `\n` rather than letting them run: 2-3 short lines.
- Keep labels on connectors short (`Yes`, `No`, `Pass`). Place them with
  `labelAt` or `labelNear: 'start'` so they never sit on a shape or in a
  narrow gap. On a DFD, `at: [x, y]` (and `anchor`) places a flow's label.
- Prefer **vertical** layouts (flowcharts and trees read top to bottom and
  fit a phone), or give a `tall` layout.
- Write out every word in the `alt` text: it is the screen-reader version.
- No emoji inside a diagram. Australian English (organisation, colour).

---

## Steps

### 1  Write `js/anims/<name>.js`

```js
/* Still diagram (NESA flowchart): <what it shows>.
   NESA Enterprise Computing Course Specifications, p.6.
   <Topic> › <section>. */
HSCAnim.define('fc-example', {
  still: true,
  title: 'Flowchart: check a user’s age',
  alt: 'Flowchart. START, INPUT age. If age is 18 or more, OUTPUT Welcome; otherwise OUTPUT Too young. END.',
  layout: { size: [560, 460], minWidth: 560 },   // or layouts: { wide, tall }
  setup(s) {
    const X = 200, L = s.g(s.back);        // connectors go behind the shapes
    const begin = s.node(s.root, { x: X, y: 34, w: 180, h: 42, shape: 'terminator', text: 'START' });
    const input = s.node(s.root, { x: X, y: 104, w: 170, h: 44, shape: 'io', text: 'INPUT age' });
    const old = s.node(s.root, { x: X, y: 190, w: 170, h: 72, shape: 'decision', text: 'age ≥ 18?' });
    const yes = s.node(s.root, { x: X, y: 290, w: 190, h: 44, shape: 'io', text: "OUTPUT 'Welcome'" });
    const no = s.node(s.root, { x: 420, y: 190, w: 200, h: 44, shape: 'io', text: "OUTPUT 'Too young'" });
    const end = s.node(s.root, { x: X, y: 380, w: 180, h: 42, shape: 'terminator', text: 'END' });
    s.link(L, begin, input);
    s.link(L, input, old);
    s.link(L, old, yes, { label: 'Yes', labelSize: 13, labelAt: [X + 40, 245] });
    s.link(L, old, no, { from: 'right', to: 'left', label: 'No', labelSize: 13, labelNear: 'start', dy: -12 });
    s.link(L, yes, end);
    s.link(L, no, s.port(end, 'right'), { from: 'bottom', via: [[420, 380]] });
  }
});
```

One scene per file: the engine loads `js/anims/<name>.js` for `data-anim="<name>"`, so
a file must define exactly the scene it is named after. Small shared helpers (for
example `T()`, `IO()`, `D()` for flowchart symbols) are copied into each file.
Give a scene a new name only if its content differs from the file it was copied from.

### 2  Put it in the page

```html
<figure class="figure">
<figcaption class="figure-head">
  <p class="figure-kicker"><span class="figure-kind">Flowchart</span></p>
  <h4 class="figure-title">Check a user's age</h4>
  <p class="figure-lead">One sentence on what the diagram shows.</p>
</figcaption>
<div class="figure-canvas figure-canvas--still">
  <div class="anim" data-anim="fc-example"></div>
</div>
<div class="figure-notes">
  <div><h5>What to notice</h5><ul><li>…</li></ul></div>
  <p class="figure-try"><strong>Try this</strong>…</p>
</div>
</figure>
```

`figure-kind` matters: the checker applies the flowchart rules to
`Flowchart`, the nine-symbol rule to `System flowchart` and the rectangle
rule to `Decision tree`. A data flow diagram is
`<div class="nesa-diagram" data-diagram="key"></div>` in a plain
`.figure-canvas`, with the data in `js/nesa-diagram-data.js`.

A page with a `data-anim` diagram must link `../css/anim.css` and load
`../js/anim.js` (see `add-animation.md`); `python3 scripts/site-chrome.py`
sets their `?v=`, and it changes when any scene file changes.

### 3  Check it

```bash
python3 -m http.server 8831     # open the page; check light, dark and a 390 px wide window
python3 scripts/site-chrome.py
python3 scripts/check-site.py
```

---

## Reference scenes (copy the nearest one)

**NESA worked examples and keys** (Course Specifications page in brackets):

| Scene | Shows |
|---|---|
| `spec-dfd-symbols` (4), `spec-flowchart-symbols` (6), `spec-sysflow-symbols` (7) | The symbol keys |
| `spec-dfd-voting`, `spec-dfd-voting-l0` (5) | Voting-system DFD and its Level 0 diagram (`nesa-diagrams.js` data) |
| `spec-flowchart-delivery` (6) | Flowchart with three decisions and a merge |
| `spec-sysflow-doctor` (7) | System flowchart with all the device symbols and a telecommunications link |
| `spec-dt-smart-house` (8), `spec-dt-buy-car` (8) | Horizontal and vertical decision trees |
| `spec-storyboard` (9) | Three linked screens |
| `spec-network` (10) | Router, hubs and devices |
| `spec-graph-weighted` (11) | Social network graph with labelled links |
| `spec-gantt-requirements`, `spec-gantt-resources` (12) | Gantt with dependencies and milestone; Gantt with resources and % complete |
| `spec-schema-games` (16) | Three-table schema |

**Extensions:** `graph-weights` (weighted, numbered edges), `schema-alt` (PK/FK badges, crow's foot).

**Ported from the Software Engineering site** (content unchanged apart from
wording): stills `dt-spam`, `dt-training-model`, `gantt-project`,
`agile-sprint`, `ai-ml-dl`, `bias-cycle`, `nn-layers`, `ssa-encryption`,
`seq-dns`, `seq-http`; animated `packets`, `https`, `waterfall-agile`,
`implementation-methods`, `knn`, `gradient-descent`.

## Kit reference

| Call | What it draws |
|---|---|
| `s.node(parent, { x, y, w, h, shape, text, tone, size, id })` | A symbol centred on (x, y). `shape`: `process`, `terminator`, `decision`, `io`, `subprogram`, `card`, `circle`, `entity`, `store` (`id` adds the store's ID box); EC: `sf-document`, `sf-storage`, `sf-display`, `sf-manual`, `sf-input`, `sf-tape` (w = h), `sf-cloud`, `sf-telecom`. |
| `s.port(node, side, offset)` | The point on a node's edge (`top`, `bottom`, `left`, `right`). |
| `s.rim(node, [x, y])` | EC: where a straight line from the node's centre towards a point crosses its outline. |
| `s.link(parent, a, b, { from, to, via, mid, curve, straight, both, label, labelAt, labelNear, labelSize, dashed, head, cls })` | A connector with an arrowhead. Right-angled by default; `via` points route around shapes; `curve` bends it (DFD style); EC: `straight` joins the outlines with a diagonal, `both` adds a second arrowhead. `cls: 'is-good'` / `'is-bad'` / `'is-net'` colour or dot it. |
| `s.telecomLink(parent, a, b, { amp, label })` | EC: a line with a zig-zag break and an arrow (NESA's telecommunications link). |
| `s.graph(parent, { nodes: [{ id, x, y, r, label, tone }], edges: [{ a, b, label, weight, directed, curve }], directed })` | EC: graph theory. Returns `{ nodes, edges }`. |
| `s.screen(parent, { x, y, w, h, title, nav: [{ label, active, dot }], body, n, caption })` | EC: one storyboard screen, top left at (x, y). `body` blocks: `{ heading }`, `{ lines }`, `{ boxes: [{ lines } \| { image }] }`, `{ table: [rows, cols] }`. `.btn[label]` is the button's dot. |
| `s.storyboard(parent, { screens, links: [{ from: 'home.Prices', to: 'prices' \| 'prices.Home' \| [x, y], bend, both }] })` | EC: screens plus navigation arrows. |
| `s.tableBox(parent, { x, y, w, name, fields, keys })` and `s.relation(parent, { t, f, side }, { t, f, side }, { one, many, mid })` | EC: schema tables (top left) and one-to-many lines. Fields: `'Name'` or `{ name, key: 'P' \| 'F' \| 'PF' }`; `keys: 'nesa'` or `'pk'`; `many: '∞'` or `'crow'`. |
| `s.device(parent, { type, label, x, y })` | EC: line-art network device with a label below. |
| `s.ganttTable(parent, { x, y, cols, days, dayW, head, shade, rows })` | EC: NESA-style Gantt table. Rows: `{ id, label, date, start, dur, tone, pct, text, who, summary, indent, milestone, mdate, after }`. |
| `s.classBox(parent, { x, y, w, name, attrs, methods, tone })` | A UML class; works with `port()` and `link()`. |
| `s.chip(parent, text, x, y)` | A small paper label. |
| `s.sequence(parent, { x, y, w, actors, steps })` | Sequence diagram. Steps: `{ from, to, text, reply }`, `{ section }`, `{ note, over: [a, b] }`. Returns the bottom y. |
| `s.gantt(parent, { x, y, w, days, labelW, tick, tickLabel, sections })` | Simple week Gantt. Rows: `{ id, label, start, dur, tone, milestone, after, tag }`. |
| `s.plot(...)`, `s.folk(...)`, `s.building(...)`, `s.padlock(...)`, `s.key(...)` … | Anything from the animation kit, drawn still. |

Groups (a dashed box around related shapes) are a `rect` with class
`pa-group` in `s.back`, titled with class `pa-group-t`.

## Checklist

- [ ] Symbols match the table above; flowcharts start with START (or BEGIN) and end with END
- [ ] System flowcharts use only the nine system flowchart symbols; decision trees use rectangles
- [ ] Every decision branch is labelled; no label sits on a shape
- [ ] No text under 13px; nothing clipped at the edges; wide diagrams scroll inside the figure at 390 px
- [ ] Light and dark mode both read clearly
- [ ] `alt` describes the whole diagram in words
- [ ] Figure has a kind, title, lead, What to notice and Try this; NESA acknowledged where its notation is used
- [ ] `python3 scripts/site-chrome.py` then `python3 scripts/check-site.py` pass
