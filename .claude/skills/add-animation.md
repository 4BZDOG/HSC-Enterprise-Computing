---
name: add-animation
description: >
  Add an animated diagram ("paper theatre" scene) to a topic page: a
  step-through animation with captions, play/pause, scenario tabs and a text
  transcript, drawn by js/anim.js in the Data Studio palette. Covers the
  style guide, the scene API, wiring a scene into a page, the animated
  scenes already available, and checks.
category: content
---

# Skill: add-animation

Use this skill when the user asks for an animation, an animated diagram, or a
more engaging visual of a concept that changes over time (a request travelling,
keys being exchanged, a model training, a rollout over weeks).

A static diagram is usually enough for structure (a class diagram, a DFD).
Animate when the concept *is* a sequence or a process, or when a "what if"
comparison helps (different defences, learning rates, methods).

---

## How it fits together

| File | Role |
|---|---|
| `js/anim.js` | Engine, player and the shared paper kit. One copy per page. |
| `css/anim.css` | Player UI and every colour, read from the `--pc-*` tokens defined in `css/theme.css` (section 11b), light and dark. |
| `js/anims/<name>.js` | One scene. The engine loads it on demand from `data-anim="<name>"`. |

This engine, its API and its scenes are shared with the sister Software
Engineering site, so a scene written for either works on both. Enterprise
Computing's own additions (system flowchart symbols, storyboards, schemas and
so on) are still-diagram helpers; see `.claude/skills/paper-diagrams.md`.

Animated scenes available now (copied from the sister site, with the wording
adjusted for Enterprise Computing). Not yet placed in any page: pick the ones
a topic needs, using the syllabus dot point in the last column.

| Scene | Shows off | Fits the syllabus |
|---|---|---|
| `packets` | many props travelling in parallel along routes, a fixed landing table so rewinds match; variants for a lost packet | Networking systems: how data moves across a network |
| `https` | props moving along a wire, scramble to cipher text, padlocks and keys; three variants | Networking systems and Cybersecurity: unsecured and encrypted data |
| `waterfall-agile` | two different casts from one `setup`, sharing a value chart | Enterprise project: waterfall and agile development approaches |
| `implementation-methods` | one `render(s)` driven by a timeline value, four variants from one plan table | Enterprise project: direct, parallel, pilot and phased implementation |
| `knn` | the same data under three parameter values (K), a vote card | Data science and Intelligent systems: machine learning and statistical modelling |
| `gradient-descent` | data-driven redraw each frame with `s.tween`, plots | Data science: machine learning and statistical modelling (regression) |

Still scenes from the same source (`dt-spam`, `dt-training-model`,
`gantt-project`, `agile-sprint`, `ai-ml-dl`, `bias-cycle`, `nn-layers`,
`ssa-encryption`, `seq-dns`, `seq-http`) and the NESA reference scenes
(`spec-*`) are listed in `paper-diagrams.md`. Every scene appears on
`reference/diagram-gallery.html` (hidden from the navigation), where it can
be reviewed in light and dark mode and at phone width.

---

## Steps

### 1  Write the scene: `js/anims/<name>.js`

```js
/* Animated diagram: <what it shows>.
   <Topic> › <section>. */
(() => {
  function setup(s) {
    // Build the whole cast in its opening positions. Keep references on s.
    s.you = s.folk(s.root, { at: { x: 120, y: 380 }, tone: 'teal', name: 'you' });
    s.server = s.building(s.root, { at: { x: 620, y: 330 }, roof: 'bank', tone: 'sage', sign: 'MyBank', face: true });
    s.msg = s.envelope(s.front, { label: 'GET /', at: { x: 200, y: 200, o: 0 } });
  }

  const beats = [
    { say: 'Opening state: what we are looking at.' },     // beat 0 has no run()
    {
      say: 'Your browser sends a *request*.',
      async run(s) {
        await s.pop(s.msg);
        await s.move(s.msg, 560, 260, { arc: 60 });
        s.gaze(s.server, 'wide');
      }
    }
  ];

  HSCAnim.define('<name>', {
    title: 'Short title for screen readers',
    layouts: {
      wide: { size: [760, 440] /* , positions… */ },
      tall: { size: [400, 760] /* , positions… */ }   // optional: used below 560 px
    },
    setup,
    beats                      // or: variantsLabel + variants: [{ id, label, beats }]
  });
})();
```

### 2  Put it in the page

Inside the right `<section>`, as a numbered figure (like every other diagram):

```html
<figure class="figure">
<figcaption class="figure-head">
  <p class="figure-kicker"><span class="figure-kind">Animated diagram</span></p>
  <h4 class="figure-title">Title that states the idea</h4>
  <p class="figure-lead">One sentence on what to watch.</p>
</figcaption>
<div class="figure-canvas figure-canvas--anim">
  <div class="anim" data-anim="<name>"></div>
</div>
<div class="figure-notes">
  <div><h5>What to notice</h5><ul><li>The learning point.</li></ul><p class="figure-controls">Choose … with the tabs. Step with ◀ and ▶ (or the arrow keys), play or pause with Space.</p></div>
  <p class="figure-try"><strong>Try this</strong>A short task using the animation.</p>
</div>
</figure>
```

Once per page, if it isn't there already:

```html
<link rel="stylesheet" href="../css/anim.css" />              <!-- in <head>, after theme.css -->
<script src="../js/anim.js" defer></script>                   <!-- after progress.js -->
```

Run `python3 scripts/site-chrome.py` afterwards: it adds the `?v=` cache-busting
hash to both. `anim.js` passes its `?v=` on to the scene files it loads, and
the script hashes `anim.js` together with everything in `js/anims/`, so editing
a scene changes the hash on every page that uses animations.

### 3  Check it

```bash
python3 -m http.server 8831          # open the page, append #<section-id>, or reference/diagram-gallery.html
python3 scripts/site-chrome.py       # cache-busting versions
python3 scripts/check-site.py        # fails if a scene file or the engine link is missing
```

Look at it in light and dark mode, at phone width (under 560 px the tall
layout is used), and with the OS "reduce motion" setting on (no autoplay;
each step appears instantly).

---

## Style guide: paper theatre

The engine draws a little paper theatre: flat cut-outs with a soft cast
shadow, no outlines, a slight hand-cut tilt, moved by an unseen hand. In
Enterprise Computing the shadow is subtle and the colours are the Data Studio
palette (cool white and slate surfaces, teal, amber, violet, red-coral, green),
so the scenes sit in the site's dashboard look. Keep it friendly but never at
the cost of accuracy. The tone names below are unchanged from the sister
site; only their colours differ (`css/theme.css`, section 11b).

- **Cast.** People are bean-shaped `folk` with blinking eyes and a mood.
  Institutions are `building`s whose windows are eyes. Use the same roles
  every time:

  | Role | Tone | Accessory |
  |---|---|---|
  | You, the user | `teal` | none |
  | Attacker (Mallory) | `plum` (violet) | `mask` |
  | Eavesdropper (Eve) | `mustard` (amber) | `headphones` |
  | Authority (CA, admin) | `plum` (violet) | `tophat` |
  | Worker, team member | `teal` | `cap` |
  | Server, bank, shop | `building` in `sage` or `teal` | `face: true` |

- **Colour meaning.** `sage` = OK, approved, working. `terra` = error, danger,
  rejected. `mustard` = keys, cookies, highlights, money. `plum` = attacker
  or the thing being trained. `teal` = the user and new systems. Old or
  legacy things use the hatch fill (`f-hatch`).
- **Motion.** Things pop in with a spring (`pop`), travel on arcs (`move`
  with `arc`), hop when pleased (`hop`), shake or wobble to say no (`shake`,
  `wobble`), and verdicts land as rubber stamps (`stamp`). Use `ring` to
  point at something and `burst` to celebrate. One idea moves at a time.
- **Words.** A caption is one idea in 12–40 words, Australian English (organisation, colour), in
  the present tense. Bold the syllabus term with `*term*` and put code in
  backticks. Labels inside the SVG are a word or two; the caption carries
  the explanation. No emoji inside the SVG.
- **Length.** 4–10 beats per variant. Beat 0 is the opening state (no
  `run`). If there is a "what if", make each case a variant tab rather than
  a longer single story.
- **Accuracy.** Say in *What to notice* where the picture simplifies (for
  example, the HTTPS scene notes that TLS 1.3 uses a key exchange).

---

## Scene API (`s`)

A scene's `setup(s)` and each beat's `run(s)` receive the same `s`.

**Info:** `s.W`, `s.H` (viewBox size), `s.L` (the current layout object),
`s.compact` (true in the tall layout), `s.variant`, `s.is('id', …)`,
`s.rand()` (seeded, so rewinds look identical).

**Layers** (draw order): `s.back`, `s.root`, `s.front`, `s.fx`.

**Building:** `s.g(parent, cls, at)`, `s.el(tag, attrs, parent)`,
`s.text(parent, str, { x, y, cls, anchor, valign, size, lh })` (`\n` for
lines), `s.measure(str, size, mono)`, `s.tilt(el, deg)`, `s.raise(el)`,
`s.remove(el)`.

**Kit** (anchor: *feet* = stands on (0, 0), *centre*, *top-left*):

| Part | Anchor | Notes |
|---|---|---|
| `folk(parent, { tone, hat, name, mood, sweat })` | feet | `hat`: mask, headphones, tophat, cap · `s.mood(f, mood)`: happy, grin, smirk, flat, sad, shock |
| `building(parent, { w, h, roof, tone, sign, face, door })` | feet | `roof`: bank, shop, house · `s.gaze(b, how)`: open, squint, wide |
| `browser(parent, { w, h, url, tabs })` | top-left | draw pages into `b.pages[i]` · `s.showTab(b, i)` · `b.url`, `b.lock` |
| `envelope(parent, { label, tone })` | centre | `e.label` |
| `tag(parent, { text, mono, tone, on, x, y, w, size })` | centre | `t.label` |
| `bubble(parent, { text, dx, below, mono })` | tail tip | starts hidden: `s.pop(b)` |
| `stampMark(parent, { text, tone })` | centre | starts hidden: `s.stamp(m)` |
| `mark(parent, ok, { r })` | centre | tick (sage) or cross (terra) |
| `cookie`, `coin`, `key({ tone })`, `padlock({ open, tone })`, `sparkle`, `bug` | centre | `s.lock(p, closed)` |
| `arrow(parent, d, { dashed, head })` | path | pair with `s.draw` |
| `plot(parent, { x, y, w, h, xr, yr, xTicks, yTicks, xLabel, yLabel })` | top-left | returns scales `p.X(v)`, `p.Y(v)` and `p.clip` |

Add a part for one scene with `HSCAnim.kit('name', function (parent, o) { … })`
in the scene file. If a second scene needs it, move it into `KIT` in
`js/anim.js`.

**Motion** (all return promises; `await` them to sequence):
`s.set(el, props)` (instant), `s.at(el)`, `s.to(el, { x, y, r, s, sx, sy, o }, { dur, ease, delay })`,
`s.move(el, x, y, { arc, dur, r })`, `s.pop(el, { s, from })`, `s.show`, `s.hide`,
`s.hop(el, { h, n })`, `s.shake`, `s.wobble`, `s.stamp`, `s.draw(path)`,
`s.count(textEl, from, to, { fmt })`, `s.type(textEl, str)`, `s.scramble(textEl, str)`,
`s.tween({ dur, ease }, k => …)` (anything else, redrawn each frame),
`s.wait(ms)`, `s.all([...])`. Eases: `linear`, `in`, `out`, `inOut`, `spring`.

**Effects** (leave nothing behind, skipped while rewinding): `s.ring(x, y, { r, cls })` (`cls`: `is-good` or `is-bad`),
`s.burst(x, y, { n, spread, tones })`.

---

## Rules that keep rewinding working

The player rebuilds a moment by running `setup` again and replaying earlier
beats instantly. So:

1. Build everything in `setup`, and keep references on `s` (`s.bank = …`),
   never in variables outside the scene.
2. Don't name a reference after a kit part (`s.cookie = …` would replace the
   `cookie()` builder for that scene). Use `s.jarCookie`, `s.myKey` and so on.
3. Change the scene only through `s.*` helpers or plain DOM calls, and wait
   only with `s.wait()` or other `s.*` promises. Never `await` a raw
   `setTimeout`, fetch or event: it won't finish instantly when rewinding.
4. Anything random must use `s.rand()`, not `Math.random()`.
5. When props move in parallel, don't let the order they *finish* in decide
   anything (such as which slot a packet lands in): rewinding finishes them
   in a different order. Fix the outcome in a table instead.
6. For a data-driven scene, keep the state on `s` (e.g. `s.t`) and redraw
   everything from it in one `render(s)` called from `s.tween`.

---

## Checklist

- [ ] `js/anims/<name>.js` calls `HSCAnim.define('<name>', …)` with a `title`
- [ ] Both layouts checked (wide, and tall at phone width) if the scene has text-heavy parts
- [ ] Light and dark mode checked; text on `mustard`/`blush` tags stays dark (the kit does this)
- [ ] Reduced motion checked: no autoplay, every step readable
- [ ] Figure has kind "Animated diagram", a title, a lead, What to notice and Try this
- [ ] Page loads `css/anim.css` and `js/anim.js` once
- [ ] Wording says "system" or "enterprise system", not "software", where the syllabus does
- [ ] `python3 scripts/site-chrome.py` then `python3 scripts/check-site.py` pass
