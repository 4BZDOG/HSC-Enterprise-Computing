/* Still diagram (process): how interactive media communicates a message to an audience and learns from the response.
   Interactive media and the user experience › Communicating with interactive media. */
HSCAnim.define('im-communication', {
  still: true,
  title: 'Process diagram: interactive media as a two-way conversation',
  alt: 'A loop. The sender (an enterprise or creator) encodes a message as text, images, audio, video and interaction. It travels through a channel and device such as a web page, app, kiosk or game to the audience, who read, watch, tap and swipe. The audience gives feedback through clicks, shares, comments and analytics, and the sender refines the message and design. Barriers such as slow pages, low contrast and missing captions block the channel and are removed by good user experience design.',
  layouts: { wide: { size: [730, 370], minWidth: 730 }, tall: { size: [400, 690] } },
  setup(s) {
    const c = s.compact, L = s.g(s.back);
    const card = (x, y, text, tone, w = 156, h = 76) => s.node(s.root, { x, y, w, h, shape: 'card', tone, text, size: 13.5 });
    if (!c) {
      const sender = card(90, 80, 'Sender\nenterprise or\ncreator', 'teal-t');
      const msg = card(272, 80, 'Message\ntext, image, audio,\nvideo, interaction', 'mustard-t');
      const chan = card(454, 80, 'Channel and device\nweb page, app,\nkiosk, game', 'plum-t');
      const aud = card(636, 80, 'Audience\nreads, watches,\ntaps, swipes', 'sage-t');
      const fb = card(636, 250, 'Feedback\nclicks, shares,\ncomments, analytics', 'sky-t');
      const ref = card(90, 250, 'Refine\nmessage and\ndesign', 'teal-t');
      const bar = card(363, 250, 'Barriers\nslow pages, low contrast,\nno captions', 'terra-t', 190, 76);
      s.link(L, sender, msg, { from: 'right', to: 'left' });
      s.link(L, msg, chan, { from: 'right', to: 'left' });
      s.link(L, chan, aud, { from: 'right', to: 'left' });
      s.link(L, aud, fb, { from: 'bottom', to: 'top' });
      s.link(L, fb, ref, { from: 'bottom', to: 'bottom', via: [[636, 336], [90, 336]], label: 'learn from users', labelSize: 13, labelAt: [363, 336] });
      s.link(L, ref, sender, { from: 'top', to: 'bottom' });
      s.link(L, bar, chan, { from: 'top', to: 'bottom', dashed: true, cls: 'is-bad' });
    } else {
      const ys = [50, 165, 280, 395, 510, 625];
      const sender = card(130, ys[0], 'Sender\nenterprise or creator', 'teal-t', 200, 66);
      const msg = card(130, ys[1], 'Message\ntext, image, audio,\nvideo, interaction', 'mustard-t', 200, 76);
      const chan = card(130, ys[2], 'Channel and device\nweb page, app,\nkiosk, game', 'plum-t', 200, 76);
      const aud = card(130, ys[3], 'Audience\nreads, watches,\ntaps, swipes', 'sage-t', 200, 76);
      const fb = card(130, ys[4], 'Feedback\nclicks, shares,\ncomments, analytics', 'sky-t', 200, 76);
      const ref = card(130, ys[5], 'Refine\nmessage and design', 'teal-t', 200, 66);
      const bar = card(310, ys[2], 'Barriers\nslow pages,\nlow contrast,\nno captions', 'terra-t', 150, 96);
      [[sender, msg], [msg, chan], [chan, aud], [aud, fb], [fb, ref]].forEach(([a, b]) => s.link(L, a, b));
      s.link(L, ref, sender, { from: 'left', to: 'left', via: [[14, ys[5]], [14, ys[0]]], label: 'repeat', labelSize: 13, labelAt: [44, 340] });
      s.link(L, bar, chan, { from: 'left', to: 'right', dashed: true, cls: 'is-bad' });
    }
  }
});
