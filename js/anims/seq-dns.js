/* Still diagram (sequence): how DNS finds an IP address.
   Networking Systems › Network architecture and infrastructure (addressing and DNS). */
HSCAnim.define('seq-dns', {
  still: true,
  title: 'Sequence diagram: how DNS finds an IP address',
  alt: 'Sequence diagram. The browser asks its cache for www.google.com. If cached, the IP address comes straight back. If not, the ISP resolver asks a root server, which refers it to the .com TLD server, which refers it to the authoritative name server, which returns 142.250.70.142. The resolver passes it back, the cache saves it for its TTL, and the browser connects.',
  layout: { size: [780, 820], minWidth: 640 },
  setup(s) {
    s.sequence(s.root, {
      x: 0, y: 10, w: 780, cardW: 118,
      actors: [
        { id: 'b', label: 'Browser', tone: 'teal', on: true },
        { id: 'c', label: 'Browser\ncache', tone: 'teal-t' },
        { id: 'r', label: 'ISP\nresolver', tone: 'sage-t' },
        { id: 'root', label: 'Root\nserver', tone: 'plum-t' },
        { id: 't', label: '.com TLD\nserver', tone: 'plum-t' },
        { id: 'a', label: 'Authoritative\nname server', tone: 'mustard-t' }
      ],
      steps: [
        { from: 'b', to: 'c', text: 'www.google.com?' },
        { from: 'c', to: 'c', text: 'check the cache\n(TTL still valid?)' },
        { section: 'If it is cached' },
        { from: 'c', to: 'b', text: 'IP address (fast)', reply: true },
        { section: 'If it is not cached' },
        { from: 'c', to: 'r', text: 'www.google.com?' },
        { from: 'r', to: 'root', text: 'where is .com?' },
        { from: 'root', to: 'r', text: 'ask the TLD server', reply: true },
        { from: 'r', to: 't', text: 'where is google.com?' },
        { from: 't', to: 'r', text: "ask Google's server", reply: true },
        { from: 'r', to: 'a', text: 'www.google.com?' },
        { from: 'a', to: 'r', text: '142.250.70.142', reply: true },
        { from: 'r', to: 'c', text: '142.250.70.142', reply: true },
        { from: 'c', to: 'c', text: 'save it\n(TTL 3600 s)' },
        { from: 'c', to: 'b', text: 'IP address', reply: true },
        { note: 'connects to 142.250.70.142', over: ['b', 'c'] }
      ]
    });
  }
});
