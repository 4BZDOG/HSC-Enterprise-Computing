/* Still diagram (NESA storyboard): three linked screens for a community library events website.
   Uses the notation of the NESA Enterprise Computing Course Specifications, p.9 (title, Help button, navigation
   buttons with the current page highlighted, content panel, dot-and-arrow links), applied to a new example.
   Interactive media and the user experience › Design tools for an engaging UI. */
HSCAnim.define('im-storyboard-events', {
  still: true,
  title: 'Storyboard: three pages for a community library events website',
  alt: 'Storyboard of three screens for the Riverside Library website. Screen 1, Riverside Library (home page), shows a what\'s on this week panel, a text box and a photo of the reading room. Screen 2, Events, describes the events. Screen 3, Bookings, shows a booking table. Each screen has Home, Bookings, Events and Exit buttons, a Help button, and the current page is highlighted. Arrows show the links: Home to Bookings and to Events, Events to Home and to Bookings, Bookings to Home and to Events.',
  layout: { size: [800, 660], minWidth: 800 },
  setup(s) {
    s.storyboard(s.root, {
      screens: [
        { id: 'home', x: 12, y: 40, w: 340, h: 262, n: 1, caption: 'Riverside Library (home page)', title: 'Riverside Library',
          nav: [{ label: 'Home', active: true }, { label: 'Bookings', dot: 'right' }, { label: 'Events', dot: 'left' }, { label: 'Exit' }],
          body: [{ heading: 'What’s on this week' }, { lines: 3 }, { boxes: [{ lines: 4 }, { image: 'Photo of\nreading room' }], h: 74 }] },
        { id: 'events', x: 12, y: 372, w: 340, h: 262, n: 2, caption: 'Events page', title: 'Events',
          nav: [{ label: 'Home', dot: 'right' }, { label: 'Bookings', dot: 'right' }, { label: 'Events', active: true }, { label: 'Exit' }],
          body: [{ heading: 'Description of events' }, { lines: 9 }] },
        { id: 'bookings', x: 436, y: 206, w: 340, h: 262, n: 3, caption: 'Bookings page', title: 'Bookings',
          nav: [{ label: 'Home', dot: 'left' }, { label: 'Bookings', active: true }, { label: 'Events', dot: 'left' }, { label: 'Exit' }],
          body: [{ heading: 'Book a seat' }, { table: [3, 2], rowH: 44 }] }
      ],
      links: [
        { from: 'home.Bookings', to: [436, 268], bend: -22 },
        { from: 'home.Events', to: [22, 384], bend: 34 },
        { from: 'events.Home', to: [150, 304], bend: -34 },
        { from: 'events.Bookings', to: [436, 446], bend: 14 },
        { from: 'bookings.Home', to: [354, 200], bend: 34 },
        { from: 'bookings.Events', to: [340, 416], bend: -22, both: true }
      ]
    });
  }
});
