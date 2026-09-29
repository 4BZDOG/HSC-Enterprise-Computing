/* Still diagram (NESA storyboard): three linked screens for booking a court in ClubHub, a fictional sports club system.
   Notation: NESA Enterprise Computing Course Specifications, p.9 (title, Help button, navigation buttons with the current page highlighted, content panel, dot and arrow for links).
   Enterprise project › Producing and implementing (storyboards as a design tool). */
HSCAnim.define('ep-storyboard-booking', {
  still: true,
  title: 'Storyboard: booking a court in ClubHub',
  alt: 'Storyboard of three ClubHub screens. Screen 1, ClubHub home, has an Information panel, a text box and a picture of the courts, and buttons Home, Book, Stock and Exit, with Home highlighted. Screen 2, Book a court, has a heading, Choose court, date and time, and a table of available times, with Book highlighted and a Confirm button. Screen 3, Booking confirmed, shows the booking details and a receipt message, with Confirm highlighted. Each screen has a Help button. Arrows show that the Book button on screen 1 opens screen 2, and the Confirm button on screen 2 opens screen 3.',
  layout: { size: [930, 360], minWidth: 930 },
  setup(s) {
    s.storyboard(s.root, {
      screens: [
        { id: 'home', x: 10, y: 40, w: 276, h: 296, n: 1, caption: 'ClubHub home', title: 'ClubHub',
          nav: [{ label: 'Home', active: true }, { label: 'Book', dot: 'right' }, { label: 'Stock' }, { label: 'Exit' }],
          body: [{ heading: 'Information' }, { lines: 3 }, { boxes: [{ lines: 4 }, { image: 'Picture of\nthe courts' }], h: 84 }] },
        { id: 'book', x: 327, y: 40, w: 276, h: 296, n: 2, caption: 'Book a court', title: 'Book a court',
          nav: [{ label: 'Home' }, { label: 'Book', active: true }, { label: 'Confirm', dot: 'right' }, { label: 'Exit' }],
          body: [{ heading: 'Choose court, date, time' }, { table: [3, 2], rowH: 44 }] },
        { id: 'confirm', x: 644, y: 40, w: 276, h: 296, n: 3, caption: 'Booking confirmed', title: 'Confirmed',
          nav: [{ label: 'Home' }, { label: 'Book' }, { label: 'Confirm', active: true }, { label: 'Exit' }],
          body: [{ heading: 'Your booking' }, { lines: 4 }, { boxes: [{ lines: 3 }], h: 70 }] }
      ],
      links: [
        { from: 'home.Book', to: 'book', bend: -24 },
        { from: 'book.Confirm', to: 'confirm', bend: -24 }
      ]
    });
  }
});
