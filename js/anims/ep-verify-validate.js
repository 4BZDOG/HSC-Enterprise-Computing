/* Still diagram (concept): verification checks the built system against the specification; validation checks it against the client's real needs.
   Enterprise project › Testing and evaluating (verify and validate an enterprise computing system). */
HSCAnim.define('ep-verify-validate', {
  still: true,
  title: 'Verify and validate: two different checks',
  alt: 'Concept diagram. The club’s real needs are captured as the requirements and design. The requirements and design are built as the ClubHub system. Verification is a check between the system and the requirements: was the system built to the specification? Validation is a check between the system and the club’s real needs: does it solve the right problem for the people who use it?',
  layout: { size: [800, 400], minWidth: 800 },
  setup(s) {
    const L = s.g(s.back);
    const needs = s.node(s.root, { x: 250, y: 60, w: 300, h: 64, shape: 'card', tone: 'teal-t', text: 'The club’s real needs\n(what members and staff must be able to do)', size: 13.5 });
    const req = s.node(s.root, { x: 150, y: 220, w: 240, h: 64, shape: 'card', tone: 'paper', text: 'Requirements\nand design\n(the specification)', size: 14 });
    const sys = s.node(s.root, { x: 650, y: 220, w: 240, h: 64, shape: 'card', tone: 'sage-t', text: 'The built ClubHub\nsystem', size: 14 });
    s.link(L, needs, req, { from: 'left', to: 'top', via: [[150, 60]], label: 'captured as', labelSize: 13, labelAt: [96, 128] });
    s.link(L, req, sys, { from: 'right', to: 'left', straight: true, label: 'built as', labelSize: 13, labelAt: [400, 204] });
    // The two checks
    s.link(L, req, sys, { from: 'bottom', to: 'bottom', via: [[150, 330], [650, 330]], both: true, dashed: true, label: 'VERIFY: does the system match the specification?', labelSize: 13, labelAt: [400, 330] });
    s.link(L, needs, sys, { from: 'right', to: 'top', via: [[650, 60]], both: true, dashed: true, label: 'VALIDATE: does it\nmeet the real needs?', labelSize: 13, labelAt: [650, 130] });
    s.text(s.root, 'Are we building the product right?', { x: 400, y: 372, cls: 'pa-t pa-soft', size: 13.5 });
    s.text(s.root, 'Are we building the right product?', { x: 650, y: 20, cls: 'pa-t pa-soft', size: 13.5 });
  }
});
