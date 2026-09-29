/* Still diagram (NESA network diagram): network segmentation with a firewall, a DMZ, a guest zone and an air-gapped backup.
   Notation: NESA Course Specifications, p.10 (every device labelled). Cybersecurity › Hardware and software protection (isolation, firewalls).
   Bottom-line idea: an attacker who gets into one zone cannot reach the others freely. */
(() => {
  HSCAnim.define('cyber-segmentation', {
    still: true,
    title: 'Network diagram: segmentation, firewall, DMZ and air gap',
    alt: 'Network diagram. The Internet connects to a Firewall. The Firewall connects to three separate zones. The DMZ holds a public web server. The Corporate LAN has a switch joined to two staff computers and a file server. The Guest Wi-Fi zone has a wireless access point and a smart phone. A fourth zone, the air gap, holds an offline backup server with no network connection to anything. Every device is labelled.',
    layouts: { wide: { size: [780, 580], minWidth: 780 }, tall: { size: [340, 870] } },
    setup(s) {
      const L = s.g(s.back), D = (type, label, x, y) => s.device(s.root, { type, label, x, y });
      const grp = (x, y, w, h, t, tone) => {
        s.el('rect', { x, y, width: w, height: h, rx: 12, class: 'pa-group' }, s.back);
        s.text(s.back, t, { x: x + w / 2, y: y + 22, cls: 'pa-group-t' });
      };
      const net = (a, b) => s.link(L, a, b, { head: false, straight: true, cls: 'is-net' });
      if (!s.compact) {
        D('internet', 'Internet', 390, 44);
        D('router', 'Firewall', 390, 150);
        net([390, 92], [390, 132]);
        grp(20, 225, 210, 185, 'DMZ');
        grp(250, 225, 290, 330, 'Corporate LAN');
        grp(560, 225, 200, 185, 'Guest Wi-Fi');
        grp(560, 430, 200, 125, 'Air gap: no link');
        D('server', 'Public web\nserver', 125, 290);
        D('switch', 'Switch', 395, 285);
        D('computer', 'Staff\ncomputer', 315, 440);
        D('computer', 'Staff\ncomputer', 395, 440);
        D('server', 'File\nserver', 475, 440);
        D('wireless', 'Access\npoint', 640, 290);
        D('phone', 'Smart\nphone', 712, 290);
        D('server', 'Offline\nbackup', 660, 490);
        net([364, 165], [150, 272]);
        net([390, 168], [392, 268]);
        net([416, 165], [640, 270]);
        net([395, 300], [315, 417]); net([395, 300], [395, 417]); net([395, 300], [475, 419]);
        net([668, 290], [686, 290]);
        s.text(s.root, 'Guests cannot\nreach staff computers', { x: 660, y: 384, cls: 'pa-chip-t', size: 13 });
        s.text(s.root, 'Only web\ntraffic allowed in', { x: 125, y: 384, cls: 'pa-chip-t', size: 13 });
      } else {
        D('internet', 'Internet', 170, 40);
        D('router', 'Firewall', 170, 140);
        net([170, 88], [170, 122]);
        grp(10, 205, 150, 180, 'DMZ');
        grp(180, 205, 150, 180, 'Guest Wi-Fi');
        grp(10, 405, 320, 290, 'Corporate LAN');
        grp(10, 715, 320, 130, 'Air gap: no network link');
        D('server', 'Public web\nserver', 85, 275);
        D('wireless', 'Access\npoint', 225, 275);
        D('phone', 'Smart\nphone', 290, 275);
        D('switch', 'Switch', 170, 465);
        D('computer', 'Staff\ncomputer', 80, 600);
        D('computer', 'Staff\ncomputer', 170, 600);
        D('server', 'File\nserver', 260, 600);
        D('server', 'Offline\nbackup', 170, 785);
        net([150, 155], [85, 255]);
        net([190, 155], [225, 255]);
        net([170, 158], [170, 445]);
        net([170, 480], [80, 578]); net([170, 480], [170, 578]); net([170, 480], [260, 578]);
        net([247, 275], [268, 275]);
      }
    }
  });
})();
