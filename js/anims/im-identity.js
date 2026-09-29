/* Still diagram (concept): how identifiers, an e-profile, a data trail and auto-profiling build a digital identity.
   Interactive media and the user experience › Digital identities and profiling. */
HSCAnim.define('im-identity', {
  still: true,
  title: 'Concept diagram: how a digital identity is built',
  alt: 'Two sources feed a digital identity. You create a personal e-profile (name, photo, bio, links) and this goes straight to your digital identity. You also leave a data trail (posts, likes, searches, purchases, location). Identifiers such as a username, email address, device ID, cookie ID and IP address link that trail to one account. Algorithms then infer an auto-profile (interests, age range, likely purchases), which also feeds the digital identity that others and systems see. Privacy settings at the bottom control what is collected and who can see the profile.',
  layouts: { wide: { size: [740, 400], minWidth: 740 }, tall: { size: [400, 860] } },
  setup(s) {
    const c = s.compact, L = s.g(s.back);
    const card = (x, y, text, tone, w, h) => s.node(s.root, { x, y, w, h, shape: 'card', tone, text, size: 13.5 });
    if (!c) {
      const prof = card(120, 66, 'Personal e-profile\nyou choose: name,\nphoto, bio, links', 'teal-t', 200, 78);
      const trail = card(120, 200, 'Data trail\nposts, likes, searches,\npurchases, location', 'mustard-t', 200, 78);
      const ids = card(370, 200, 'Identifiers\nusername, email, device ID,\ncookie ID, IP address', 'plum-t', 220, 78);
      const auto = card(620, 200, 'Auto-profile\ninferred by algorithms:\ninterests, age range', 'sky-t', 200, 78);
      const ident = card(620, 66, 'Digital identity\nhow others and systems\nsee you online', 'sage-t', 200, 78);
      const priv = card(390, 346, 'Privacy settings: choose what is collected,\nwho sees your e-profile, and whether ads use your data', 'paper', 560, 52);
      s.link(L, prof, ident, { from: 'right', to: 'left', label: 'you choose', labelSize: 13, labelAt: [370, 52] });
      s.link(L, trail, ids, { from: 'right', to: 'left' });
      s.link(L, ids, auto, { from: 'right', to: 'left' });
      s.link(L, auto, ident, { from: 'top', to: 'bottom' });
      s.link(L, [120, 320], trail, { from: 'top', to: 'bottom', dashed: true, cls: 'is-good' });
      s.link(L, [620, 320], auto, { from: 'top', to: 'bottom', dashed: true, cls: 'is-good' });
    } else {
      const prof = card(130, 60, 'Personal e-profile\nyou choose: name,\nphoto, bio, links', 'teal-t', 220, 78);
      const trail = card(130, 200, 'Data trail\nposts, likes, searches,\npurchases, location', 'mustard-t', 220, 78);
      const ids = card(130, 340, 'Identifiers\nusername, email, device ID,\ncookie ID, IP address', 'plum-t', 240, 78);
      const auto = card(130, 480, 'Auto-profile\ninferred by algorithms:\ninterests, age range', 'sky-t', 220, 78);
      const ident = card(130, 620, 'Digital identity\nhow others and systems\nsee you online', 'sage-t', 220, 78);
      const priv = card(200, 780, 'Privacy settings: choose what\nis collected, who sees your\ne-profile, and whether ads\nuse your data', 'paper', 300, 76);
      s.link(L, trail, ids); s.link(L, ids, auto); s.link(L, auto, ident);
      s.link(L, prof, ident, { from: 'right', to: 'right', via: [[345, 60], [345, 620]], label: 'you choose', labelSize: 13, labelAt: [345, 330] });
      s.link(L, priv, ident, { from: 'top', to: 'bottom', dashed: true, cls: 'is-good' });
    }
  }
});
