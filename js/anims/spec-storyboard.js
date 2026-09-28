/* Still diagram (NESA storyboard): three linked screens promoting a school canteen website.
   NESA Enterprise Computing Course Specifications, p.9 (redrawn with the diagram kit).
   Enterprise Computing › Designing and documenting interfaces (storyboards). */
HSCAnim.define('spec-storyboard', {
  still: true,
  title: 'Storyboard: three pages promoting a school canteen',
  alt: 'Storyboard of three screens. Screen 1, School Canteen, has an Information panel, a text box and a picture of the canteen. Screen 2, Specials, describes the specials. Screen 3, Prices, shows a price list table. Each screen has Home, Prices, Specials and Exit buttons, a Help button, and the current page is highlighted. Arrows show the links: Canteen to Prices and to Specials, Specials to Canteen and to Prices, Prices to Canteen and to Specials.',
  layout: { size: [800, 660], minWidth: 800 },
  setup(s) {
    s.storyboard(s.root, {
      screens: [
        { id: 'home', x: 12, y: 40, w: 340, h: 262, n: 1, caption: 'School Canteen (home page)', title: 'School Canteen',
          nav: [{ label: 'Home', active: true }, { label: 'Prices', dot: 'right' }, { label: 'Specials', dot: 'left' }, { label: 'Exit' }],
          body: [{ heading: 'Information' }, { lines: 3 }, { boxes: [{ lines: 4 }, { image: 'Image of\ncanteen' }], h: 74 }] },
        { id: 'specials', x: 12, y: 372, w: 340, h: 262, n: 2, caption: 'Specials page', title: 'Specials',
          nav: [{ label: 'Home', dot: 'right' }, { label: 'Prices', dot: 'right' }, { label: 'Specials', active: true }, { label: 'Exit' }],
          body: [{ heading: 'Description of specials' }, { lines: 9 }] },
        { id: 'prices', x: 436, y: 206, w: 340, h: 262, n: 3, caption: 'Prices page', title: 'Prices',
          nav: [{ label: 'Home', dot: 'left' }, { label: 'Prices', active: true }, { label: 'Specials', dot: 'left' }, { label: 'Exit' }],
          body: [{ heading: 'Price list' }, { table: [3, 2], rowH: 44 }] }
      ],
      links: [
        { from: 'home.Prices', to: [436, 268], bend: -22 },
        { from: 'home.Specials', to: [22, 384], bend: 34 },
        { from: 'specials.Home', to: [150, 304], bend: -34 },
        { from: 'specials.Prices', to: [436, 446], bend: 14 },
        { from: 'prices.Home', to: [354, 200], bend: 34 },
        { from: 'prices.Specials', to: [340, 416], bend: -22, both: true }
      ]
    });
  }
});
