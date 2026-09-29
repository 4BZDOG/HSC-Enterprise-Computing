/* Still diagram (NESA storyboard): four linked screens of the Canteen Insights dashboard (a fictional project).
   Notation: NESA Enterprise Computing Course Specifications, p.9 (title, Help button, navigation buttons with the current page highlighted,
   content panel, a dot and arrow where a button opens another screen).
   Example Enterprise Project › Researching and planning (storyboards). */
HSCAnim.define('ex-storyboard', {
  still: true,
  title: 'Storyboard: the Canteen Insights dashboard',
  alt: 'Storyboard of four Canteen Insights screens. Screen 1, Dashboard, has key figure boxes, a line chart placeholder and a bar chart placeholder, with buttons Dashboard, Weekdays, What-if, Reorder and Exit and Dashboard highlighted. Screen 2, Weekdays, shows the pivot table of items by weekday. Screen 3, What-if, has a price setting, a quantity setting and a results table. Screen 4, Reorder, has the reorder list table. Every screen has a Help button. Double-headed arrows show that the Weekdays, What-if and Reorder buttons on the Dashboard open those screens and that each of them has a Dashboard button that returns to screen 1.',
  layout: { size: [830, 710], minWidth: 830 },
  setup(s) {
    const nav = (cur, dots) => ['Dashboard', 'Weekdays', 'What-if', 'Reorder', 'Exit'].map((l) => (l === cur ? { label: l, active: true } : l === 'Exit' || !dots ? { label: l } : { label: l, dot: dots[l] }));
    s.storyboard(s.root, {
      screens: [
        { id: 'dash', x: 12, y: 40, w: 350, h: 290, n: 1, caption: 'Dashboard (home)', title: 'Canteen Insights', nav: nav('Dashboard', { Weekdays: 'right', 'What-if': 'left', Reorder: 'right' }),
          body: [{ heading: 'Revenue, items sold, top seller, waste' }, { boxes: [{ lines: 2 }, { lines: 2 }, { lines: 2 }], h: 46 }, { boxes: [{ image: 'Line chart:\nsales over time' }, { image: 'Bar chart:\nby category' }], h: 78 }] },
        { id: 'week', x: 468, y: 40, w: 350, h: 290, n: 2, caption: 'Weekdays (pivot table)', title: 'Weekdays', nav: nav('Weekdays'),
          body: [{ heading: 'Items sold by weekday' }, { table: [4, 3], rowH: 42 }] },
        { id: 'wi', x: 12, y: 400, w: 350, h: 290, n: 3, caption: 'What-if', title: 'What-if', nav: nav('What-if'),
          body: [{ heading: 'Price and quantity sliders' }, { lines: 2 }, { table: [3, 2], rowH: 42 }] },
        { id: 'ro', x: 468, y: 400, w: 350, h: 290, n: 4, caption: 'Reorder list', title: 'Reorder', nav: nav('Reorder'),
          body: [{ heading: 'What to order next week' }, { table: [4, 2], rowH: 42 }] }
      ],
      links: [
        { from: 'dash.Weekdays', to: 'week', bend: -24, both: true },
        { from: 'dash.What-if', to: 'wi', bend: 40, both: true },
        { from: 'dash.Reorder', to: 'ro', bend: 30, both: true }
      ]
    });
  }
});
