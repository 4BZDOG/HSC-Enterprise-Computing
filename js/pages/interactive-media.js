/* Interactive media and the user experience: page demos (vanilla JS, no storage, no network).
   1. Compression explorer: draws one image, then compares real PNG (lossless) and JPEG (lossy) output.
   2. Cookie-banner nudge: count the clicks needed to refuse tracking under two designs. */
(function () {
  'use strict';

  function fmtBytes(n) { return n < 1024 ? n + ' bytes' : (n / 1024).toFixed(1) + ' KB'; }

  /* ---------- 1. Compression explorer ---------- */
  function initCompress() {
    var root = document.getElementById('im-compress');
    if (!root) return;
    var cvPng = document.getElementById('im-cv-png'), cvJpg = document.getElementById('im-cv-jpg');
    var range = document.getElementById('im-q'), out = document.getElementById('im-q-out');
    var zoom = document.getElementById('im-zoom'), readout = document.getElementById('im-readout');
    var capJpg = document.getElementById('im-cap-jpg');
    if (!cvPng || !cvJpg || !range || !cvPng.getContext || !cvPng.toBlob) { if (readout) readout.textContent = 'This demo needs a browser with canvas support.'; return; }

    var W = 320, H = 200;
    var src = document.createElement('canvas'); src.width = W; src.height = H;
    var g = src.getContext('2d');
    // A photo-like gradient sky and hills, plus a flat-colour sign with sharp text (where lossy artefacts show).
    var sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#2a6fdb'); sky.addColorStop(0.65, '#bfe3ff'); sky.addColorStop(1, '#f4f0d8');
    g.fillStyle = sky; g.fillRect(0, 0, W, H);
    g.fillStyle = '#ffd54a'; g.beginPath(); g.arc(262, 46, 24, 0, Math.PI * 2); g.fill();
    var hill = g.createLinearGradient(0, 120, 0, H); hill.addColorStop(0, '#2f9e5a'); hill.addColorStop(1, '#14532d');
    g.fillStyle = hill; g.beginPath(); g.moveTo(0, 150); g.quadraticCurveTo(90, 100, 180, 140); g.quadraticCurveTo(250, 168, W, 128); g.lineTo(W, H); g.lineTo(0, H); g.closePath(); g.fill();
    g.fillStyle = '#f2c94c'; g.fillRect(14, 28, 138, 56);
    g.strokeStyle = '#000'; g.lineWidth = 3; g.strokeRect(14, 28, 138, 56);
    g.fillStyle = '#000'; g.font = 'bold 34px Arial, Helvetica, sans-serif'; g.textBaseline = 'middle'; g.fillText('OPEN', 28, 57);
    g.lineWidth = 2; g.beginPath(); g.moveTo(170, 96); g.lineTo(230, 96); g.lineTo(200, 76); g.closePath(); g.stroke();

    var crop = { x: 14, y: 30, w: 80, h: 50 };   // magnified region: sign edge and the letter O
    var pngBytes = null, jpgBytes = null, jpgImg = null, pngImg = null, timer = null, token = 0;

    function draw(cv, img) {
      var c = cv.getContext('2d');
      c.imageSmoothingEnabled = !zoom.checked;
      c.clearRect(0, 0, W, H);
      if (zoom.checked) c.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, W, H);
      else c.drawImage(img, 0, 0, W, H);
    }
    function toImage(blob, cb) {
      var url = URL.createObjectURL(blob), im = new Image();
      im.onload = function () { cb(im); URL.revokeObjectURL(url); };
      im.onerror = function () { URL.revokeObjectURL(url); };
      im.src = url;
    }
    function redraw() {
      if (pngImg) draw(cvPng, pngImg);
      if (jpgImg) draw(cvJpg, jpgImg);
    }
    function report(q) {
      if (pngBytes === null || jpgBytes === null) return;
      var diff = Math.round(Math.abs(1 - jpgBytes / pngBytes) * 100);
      var cmp = jpgBytes < pngBytes ? diff + '% smaller than the PNG' : diff + '% larger than the PNG';
      readout.textContent = 'PNG (lossless): ' + fmtBytes(pngBytes) + '. JPEG at quality ' + q + ' (lossy): ' + fmtBytes(jpgBytes) + ', ' + cmp + '. ' +
        (q <= 40 ? 'Look at the edges of the letters: the fuzz and blocks are compression artefacts, detail that was thrown away.' :
          q <= 75 ? 'Turn the quality down to see what the encoder throws away.' : 'At high quality the loss is hard to see, but the file is bigger.');
    }
    function update() {
      var q = parseInt(range.value, 10), my = ++token;
      out.textContent = q;
      if (capJpg) capJpg.textContent = 'Lossy (JPEG, quality ' + q + ')';
      src.toBlob(function (b) { if (my !== token || !b) return; pngBytes = b.size; toImage(b, function (im) { pngImg = im; draw(cvPng, im); }); report(q); }, 'image/png');
      src.toBlob(function (b) { if (my !== token || !b) return; jpgBytes = b.size; toImage(b, function (im) { jpgImg = im; draw(cvJpg, im); }); report(q); }, 'image/jpeg', q / 100);
    }
    range.addEventListener('input', function () { out.textContent = range.value; clearTimeout(timer); timer = setTimeout(update, 90); });
    zoom.addEventListener('change', redraw);
    update();
  }

  /* ---------- 2. Cookie-banner nudge ---------- */
  function initNudge() {
    var root = document.getElementById('im-nudge');
    if (!root) return;
    var stage = document.getElementById('im-nudge-stage'), status = document.getElementById('im-nudge-status');
    var why = document.getElementById('im-nudge-why'), clicksEl = document.getElementById('im-nudge-clicks');
    var radios = root.querySelectorAll('input[name="im-design"]');
    var st;

    var WHY = {
      A: ['Visual hierarchy: “Accept all” is big and coloured, while “Manage options” is small grey text.',
          'Default effect: the optional categories are already ticked once you open the options.',
          'Asymmetric effort: accepting takes 1 click; refusing takes 4 (Manage, untick, untick, Save).'],
      B: ['Equal weight: “Accept all” and “Reject non-essential” look the same and sit side by side.',
          'Sensible default: optional categories are off unless the user turns them on.',
          'Symmetric effort: accepting and refusing each take 1 click.']
    };

    function design() { for (var i = 0; i < radios.length; i++) if (radios[i].checked) return radios[i].value; return 'A'; }
    function reset() {
      st = { d: design(), view: 'main', clicks: 0, an: design() === 'A', mk: design() === 'A', done: false };
      render();
    }
    function tick() { st.clicks++; clicksEl.textContent = st.clicks; }
    function finish(kind) {
      st.done = true;
      var on = (st.an ? 1 : 0) + (st.mk ? 1 : 0);
      var msg;
      if (kind === 'accept') msg = 'You accepted all cookies in ' + st.clicks + (st.clicks === 1 ? ' click.' : ' clicks.') + ' That is what design ' + st.d + ' was built to make easiest.';
      else if (kind === 'reject') msg = 'You refused non-essential cookies in ' + st.clicks + (st.clicks === 1 ? ' click.' : ' clicks.');
      else msg = on === 0 ? 'You refused non-essential cookies, but it took ' + st.clicks + ' clicks.' : 'You saved your choices, but ' + on + ' optional ' + (on === 1 ? 'category is' : 'categories are') + ' still on. That is the default effect: many people would not notice.';
      status.textContent = msg;
      stage.querySelectorAll('button,input').forEach(function (el) { el.disabled = true; });
    }
    function render() {
      clicksEl.textContent = st.clicks;
      status.textContent = 'Task: refuse the optional cookies, then count how many clicks it took.';
      why.innerHTML = WHY[st.d].map(function (t) { return '<li>' + t + '</li>'; }).join('');
      var h = '<div class="im-shop"><div class="im-shop-head"><span>Wattle &amp; Co</span><span aria-hidden="true">Cart (0)</span></div>' +
        '<div class="im-shop-body"><p>Handmade candles and soap (a made-up shop for this demo).</p></div>' +
        '<div class="im-banner" role="region" aria-label="Cookie choices"><h5>We value your privacy</h5>';
      if (st.view === 'main') {
        h += '<p>We use cookies to run the site and, if you agree, to measure visits and show you ads.</p><div class="im-banner-row">';
        if (st.d === 'A') h += '<button type="button" class="im-b im-b--main" data-a="accept">Accept all</button><button type="button" class="im-b im-b--link" data-a="options">Manage options</button>';
        else h += '<button type="button" class="im-b" data-a="accept">Accept all</button><button type="button" class="im-b" data-a="reject">Reject non-essential</button><button type="button" class="im-b im-b--link" data-a="options">Choose settings</button>';
        h += '</div>';
      } else {
        h += '<p>Choose which cookies we may use.</p>' +
          '<label class="im-opt"><input type="checkbox" checked disabled> Essential <span>(always on: needed for the cart)</span></label>' +
          '<label class="im-opt"><input type="checkbox" data-a="an"' + (st.an ? ' checked' : '') + '> Analytics <span>(measure visits)</span></label>' +
          '<label class="im-opt"><input type="checkbox" data-a="mk"' + (st.mk ? ' checked' : '') + '> Marketing <span>(personalised ads)</span></label>' +
          '<div class="im-banner-row">' + (st.d === 'A'
            ? '<button type="button" class="im-b im-b--main" data-a="accept">Accept all</button><button type="button" class="im-b im-b--link" data-a="save">Save my choices</button>'
            : '<button type="button" class="im-b im-b--main" data-a="save">Save my choices</button><button type="button" class="im-b" data-a="accept">Accept all</button>') + '</div>';
      }
      h += '</div></div>';
      stage.innerHTML = h;
      var first = stage.querySelector('button, input:not([disabled])');
      if (st.view === 'options' && first && document.activeElement && root.contains(document.activeElement) === false) { /* keep focus where it is */ }
    }

    stage.addEventListener('click', function (e) {
      var t = e.target.closest('[data-a]');
      if (!t || st.done) return;
      var a = t.getAttribute('data-a');
      if (a === 'an' || a === 'mk') { tick(); st[a] = t.checked; return; }
      tick();
      if (a === 'options') { st.view = 'options'; render(); var f = stage.querySelector('input[data-a="an"]'); if (f) f.focus(); }
      else if (a === 'accept') { st.an = st.mk = true; finish('accept'); }
      else if (a === 'reject') { st.an = st.mk = false; finish('reject'); }
      else if (a === 'save') finish('save');
    });
    root.querySelector('[data-a="reset"]').addEventListener('click', reset);
    for (var i = 0; i < radios.length; i++) radios[i].addEventListener('change', reset);
    reset();
  }

  function init() { initCompress(); initNudge(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

/* Interactive media: labs built on the shared kit (css/labs.css, js/labs.js).
   1. Asset size calculator: the working for the uncompressed size of an image, a sound and a video clip.
   2. Contrast checker: the WCAG contrast ratio of text on a background, with an automatic fix.
   3. Practice sets: which file format suits a purpose, and which hardware matters most for a project. */
(function () {
  'use strict';
  var el = Labs.el;
  var nf = new Intl.NumberFormat('en-AU');
  function size(bytes) {
    if (bytes < 1e3) return nf.format(Math.round(bytes)) + ' bytes';
    if (bytes < 1e6) return (bytes / 1e3).toFixed(1) + ' kB';
    if (bytes < 1e9) return (bytes / 1e6).toFixed(bytes < 1e8 ? 1 : 0) + ' MB';
    return (bytes / 1e9).toFixed(1) + ' GB';
  }
  function dur(sec) {
    if (sec < 1) return 'under a second';
    if (sec < 90) return Math.round(sec) + ' seconds';
    if (sec < 5400) return (sec / 60).toFixed(1) + ' minutes';
    return (sec / 3600).toFixed(1) + ' hours';
  }

  /* ---------- 1. Asset size calculator ---------- */
  function buildSize(host) {
    Labs.shell(host, 'im-size', 'Asset size calculator', 'Work out how big a digitised asset is before compression, then see what compression and your connection do to it. The working is shown line by line, as you would write it in an exam.');
    var st = { kind: 'image', w: 1920, h: 1080, depth: 24, secs: 180, rate: 44100, bits: 16, ch: 2, vw: 1920, fps: 30, vsecs: 60, mp3: 128, vbit: 8, mbps: 50 };
    var tabs = el('div', 'lab-seg');
    tabs.setAttribute('role', 'group'); tabs.setAttribute('aria-label', 'Type of asset');
    var tb = {};
    [['image', 'Image'], ['sound', 'Sound'], ['video', 'Video']].forEach(function (k) {
      var b = el('button', null, k[1]); b.type = 'button'; b.addEventListener('click', function () { st.kind = k[0]; render(); }); tabs.append(b); tb[k[0]] = b;
    });
    var tabRow = el('div', 'lab-row'); tabRow.append(tabs);
    var fields = el('div', 'lab-row im-size-fields');
    var work = el('div', 'lab-panel');
    var stats = el('div', 'lab-stats');
    var net = el('div', 'lab-row');
    host.append(tabRow, fields, work, stats, net);
    host.append(el('p', 'lab-note', 'Sizes use 1 kB = 1,000 bytes, 1 MB = 1,000,000 bytes, as the worked examples above do. The compressed figures are for comparison only: real files depend on the codec, the settings and the content.'));

    function num(label, key, min, max, step, unit) {
      var f = el('div', 'lab-field'), l = el('label', null, label), i = el('input');
      l.htmlFor = i.id = 'im-size-' + key; i.type = 'number'; i.min = min; i.max = max; i.step = step; i.value = st[key];
      i.addEventListener('input', function () { var v = parseFloat(i.value); if (v >= min && v <= max) { st[key] = v; calc(); } });
      f.append(l, i); fields.append(f); return i;
    }
    function pick(label, key, opts) {
      var f = el('div', 'lab-field'), l = el('label', null, label), s = el('select');
      l.htmlFor = s.id = 'im-size-' + key;
      opts.forEach(function (o) { var op = el('option', null, o[1]); op.value = o[0]; s.append(op); });
      s.value = st[key];
      s.addEventListener('change', function () { st[key] = +s.value; calc(); });
      f.append(l, s); fields.append(f); return s;
    }
    function preset(label, opts) {
      var f = el('div', 'lab-field'), l = el('label', null, label), s = el('select');
      l.htmlFor = s.id = 'im-size-preset';
      opts.forEach(function (o, i) { var op = el('option', null, o[0]); op.value = i; s.append(op); });
      s.addEventListener('change', function () { var o = opts[+s.value]; o[1](); render(); });
      f.append(l, s); fields.append(f);
    }

    function render() {
      fields.replaceChildren();
      Object.keys(tb).forEach(function (k) { tb[k].setAttribute('aria-pressed', String(st.kind === k)); });
      if (st.kind === 'image') {
        preset('Start from', [['Choose a starting point', function () {}], ['Full HD screen, 1920 × 1080', function () { st.w = 1920; st.h = 1080; }], ['4K screen, 3840 × 2160', function () { st.w = 3840; st.h = 2160; }], ['Phone photo, 4000 × 3000', function () { st.w = 4000; st.h = 3000; }], ['A4 scan at 300 dpi, 2481 × 3507', function () { st.w = 2481; st.h = 3507; }]]);
        num('Width (pixels)', 'w', 1, 20000, 1); num('Height (pixels)', 'h', 1, 20000, 1);
        pick('Colour depth (bits per pixel)', 'depth', [[1, '1 bit: 2 colours'], [8, '8 bits: 256 colours'], [24, '24 bits: 16.7 million colours'], [32, '32 bits: 24-bit colour plus transparency']]);
      } else if (st.kind === 'sound') {
        num('Length (seconds)', 'secs', 1, 7200, 1);
        pick('Sampling rate', 'rate', [[8000, '8,000 Hz (telephone)'], [22050, '22,050 Hz'], [44100, '44,100 Hz (CD)'], [48000, '48,000 Hz (video)'], [96000, '96,000 Hz (studio)']]);
        pick('Bit depth', 'bits', [[8, '8 bits'], [16, '16 bits'], [24, '24 bits']]);
        pick('Channels', 'ch', [[1, '1 (mono)'], [2, '2 (stereo)']]);
      } else {
        pick('Frame size', 'vw', [[1280, '1280 × 720 (HD)'], [1920, '1920 × 1080 (full HD)'], [3840, '3840 × 2160 (4K)']]);
        pick('Frames per second', 'fps', [[24, '24 fps'], [30, '30 fps'], [60, '60 fps']]);
        num('Length (seconds)', 'vsecs', 1, 3600, 1);
      }
      net.replaceChildren();
      var f = el('div', 'lab-field'), l = el('label', null, 'Your download speed (megabits per second)'), i = el('input');
      l.htmlFor = i.id = 'im-size-mbps'; i.type = 'number'; i.min = 1; i.max = 10000; i.value = st.mbps;
      i.addEventListener('input', function () { var v = parseFloat(i.value); if (v >= 1) { st.mbps = v; calc(); } });
      f.append(l, i); net.append(f);
      if (st.kind === 'sound') { var g = el('div', 'lab-field'), lg = el('label', null, 'MP3 bit rate (kilobits per second)'), ig = el('input'); lg.htmlFor = ig.id = 'im-size-mp3'; ig.type = 'number'; ig.min = 32; ig.max = 320; ig.value = st.mp3; ig.addEventListener('input', function () { var v = parseFloat(ig.value); if (v >= 32 && v <= 320) { st.mp3 = v; calc(); } }); g.append(lg, ig); net.append(g); }
      if (st.kind === 'video') { var g2 = el('div', 'lab-field'), lg2 = el('label', null, 'Compressed bit rate (megabits per second)'), ig2 = el('input'); lg2.htmlFor = ig2.id = 'im-size-vbit'; ig2.type = 'number'; ig2.min = 1; ig2.max = 100; ig2.value = st.vbit; ig2.addEventListener('input', function () { var v = parseFloat(ig2.value); if (v >= 1 && v <= 100) { st.vbit = v; calc(); } }); g2.append(lg2, ig2); net.append(g2); }
      if (st.kind === 'image') { var g3 = el('div', 'lab-field'), lg3 = el('label'), og = el('output'), ig3 = el('input'); lg3.htmlFor = ig3.id = 'im-size-ratio'; lg3.append(document.createTextNode('Compression ratio: '), og); ig3.type = 'range'; ig3.min = 1; ig3.max = 50; ig3.value = st.ratio || 10; st.ratio = +ig3.value; ig3.addEventListener('input', function () { st.ratio = +ig3.value; calc(); }); g3.append(lg3, ig3); net.append(g3); st.ratioOut = og; }
      calc();
    }

    function stat(label, value) { var s = el('div', 'lab-stat'); s.append(el('span', null, label), el('b', null, value)); stats.append(s); }
    function calc() {
      var steps = [], raw, comp, compLabel;
      if (st.kind === 'image') {
        var px = st.w * st.h; raw = px * st.depth / 8;
        steps.push('Pixels = width × height = ' + nf.format(st.w) + ' × ' + nf.format(st.h) + ' = ' + nf.format(px));
        steps.push('Bytes = pixels × bits per pixel ÷ 8 = ' + nf.format(px) + ' × ' + st.depth + ' ÷ 8 = ' + nf.format(raw));
        comp = raw / st.ratio; compLabel = 'After ' + st.ratio + ':1 compression';
        if (st.ratioOut) st.ratioOut.textContent = st.ratio + ':1';
      } else if (st.kind === 'sound') {
        var bps = st.rate * st.bits * st.ch; raw = bps * st.secs / 8;
        steps.push('Bits per second = rate × bit depth × channels = ' + nf.format(st.rate) + ' × ' + st.bits + ' × ' + st.ch + ' = ' + nf.format(bps));
        steps.push('Bytes = bits per second × seconds ÷ 8 = ' + nf.format(bps) + ' × ' + nf.format(st.secs) + ' ÷ 8 = ' + nf.format(raw));
        comp = st.mp3 * 1000 * st.secs / 8; compLabel = 'As MP3 at ' + st.mp3 + ' kbit/s';
      } else {
        var hh = st.vw === 1280 ? 720 : st.vw === 1920 ? 1080 : 2160;
        var frame = st.vw * hh * 3, perSec = frame * st.fps; raw = perSec * st.vsecs;
        steps.push('One frame = ' + nf.format(st.vw) + ' × ' + nf.format(hh) + ' pixels × 3 bytes = ' + nf.format(frame) + ' bytes');
        steps.push('One second = frame × frames per second = ' + nf.format(frame) + ' × ' + st.fps + ' = ' + nf.format(perSec) + ' bytes');
        steps.push('Whole clip = per second × seconds = ' + nf.format(perSec) + ' × ' + nf.format(st.vsecs) + ' = ' + nf.format(raw) + ' bytes (before sound)');
        comp = st.vbit * 1e6 * st.vsecs / 8; compLabel = 'Compressed at ' + st.vbit + ' Mbit/s';
      }
      work.replaceChildren(el('h5', null, 'Working'));
      var ol = el('ol', 'lab-list'); steps.forEach(function (t) { ol.append(el('li', 'lab-mono', t)); }); work.append(ol);
      stats.replaceChildren();
      stat('Uncompressed', size(raw)); stat(compLabel, size(comp)); stat('Saved by compression', Math.round((1 - comp / raw) * 100) + '%');
      stat('Download time uncompressed', dur(raw * 8 / (st.mbps * 1e6))); stat('Download time compressed', dur(comp * 8 / (st.mbps * 1e6)));
    }
    render();
  }

  /* ---------- 2. Contrast checker ---------- */
  function lin(c) { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  function lum(rgb) { return 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]); }
  function ratio(a, b) { var l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); }
  function hex(h) { return [1, 3, 5].map(function (i) { return parseInt(h.slice(i, i + 2), 16); }); }
  function toHex(rgb) { return '#' + rgb.map(function (v) { var s = Math.max(0, Math.min(255, Math.round(v))).toString(16); return s.length < 2 ? '0' + s : s; }).join(''); }

  function buildContrast(host) {
    Labs.shell(host, 'im-contrast', 'Contrast checker', 'Choose a text colour, a background colour and a text size. The tool works out the WCAG contrast ratio and tells you whether the text is readable for people with low vision or in bright light.');
    var st = { fg: '#767676', bg: '#ffffff', px: 18, bold: false };
    var row = el('div', 'lab-row');
    var f1 = el('div', 'lab-field'), l1 = el('label', null, 'Text colour'), i1 = el('input'); l1.htmlFor = i1.id = 'im-con-fg'; i1.type = 'color'; i1.value = st.fg;
    var f2 = el('div', 'lab-field'), l2 = el('label', null, 'Background colour'), i2 = el('input'); l2.htmlFor = i2.id = 'im-con-bg'; i2.type = 'color'; i2.value = st.bg;
    var f3 = el('div', 'lab-field'), l3 = el('label'), o3 = el('output'), i3 = el('input'); l3.htmlFor = i3.id = 'im-con-px'; l3.append(document.createTextNode('Text size: '), o3); i3.type = 'range'; i3.min = 12; i3.max = 40; i3.value = st.px;
    var f4 = el('label', 'lab-check'), i4 = el('input'); i4.type = 'checkbox'; f4.append(i4, document.createTextNode('Bold'));
    row.append(f1, f2, f3, f4); f1.append(l1, i1); f2.append(l2, i2); f3.append(l3, i3);
    var presets = el('div', 'lab-chips');
    [['Light grey on white', '#aaaaaa', '#ffffff'], ['Mid grey on white', '#767676', '#ffffff'], ['Navy on white', '#0b1b2e', '#ffffff'], ['White on teal', '#ffffff', '#0a7c86'], ['Yellow on white', '#e8c317', '#ffffff'], ['Red on green', '#d62828', '#2a9d3a']].forEach(function (p) {
      var b = el('button', 'lab-chip', p[0]); b.type = 'button'; b.addEventListener('click', function () { st.fg = p[1]; st.bg = p[2]; i1.value = st.fg; i2.value = st.bg; update(); }); presets.append(b);
    });
    var prow = el('div', 'lab-row'); prow.append(el('span', 'lab-label', 'Try:'), presets);
    host.append(row, prow);
    var prev = el('div', 'im-con-preview');
    var sample = el('p', 'im-con-sample', 'Book your seat for the Riverside Library events night');
    var btn = el('span', 'im-con-btn', 'Book now');
    prev.append(sample, btn);
    var out = el('div', 'lab-stats');
    var sRatio = el('div', 'lab-stat'), sAA = el('div', 'lab-stat'), sAAA = el('div', 'lab-stat'), sType = el('div', 'lab-stat');
    [[sRatio, 'Contrast ratio'], [sAA, 'Level AA (the usual target)'], [sAAA, 'Level AAA'], [sType, 'Counts as']].forEach(function (p) { p[0].append(el('span', null, p[1]), el('b')); out.append(p[0]); });
    var msg = el('div', 'lab-readout'); msg.setAttribute('role', 'status');
    var fix = el('button', 'lab-btn', 'Darken or lighten the text until it passes AA'); fix.type = 'button';
    var act = el('div', 'lab-actions'); act.append(fix);
    host.append(prev, out, msg, act);
    host.append(el('p', 'lab-note', 'WCAG 2.2 needs a ratio of at least 4.5:1 for normal text and 3:1 for large text (at least 24 px, or 18.7 px and bold) at level AA, and 7:1 and 4.5:1 at level AAA. A ratio runs from 1:1 (no difference) to 21:1 (black on white). Never rely on colour alone to carry meaning, as the red on green example shows.'));

    function update() {
      var fg = hex(st.fg), bg = hex(st.bg), r = ratio(fg, bg);
      var large = st.px >= 24 || (st.bold && st.px >= 18.66);
      var needAA = large ? 3 : 4.5, needAAA = large ? 4.5 : 7;
      o3.textContent = st.px + ' px';
      sample.style.color = st.fg; sample.style.background = st.bg; sample.style.fontSize = st.px + 'px'; sample.style.fontWeight = st.bold ? '700' : '400';
      btn.style.color = st.bg; btn.style.background = st.fg; btn.style.fontSize = Math.max(14, st.px * 0.8) + 'px'; btn.style.fontWeight = st.bold ? '700' : '600';
      sRatio.lastChild.textContent = r.toFixed(2) + ' : 1';
      sAA.lastChild.replaceChildren(el('span', 'lab-badge ' + (r >= needAA ? 'is-good' : 'is-bad'), r >= needAA ? 'Pass' : 'Fail'));
      sAAA.lastChild.replaceChildren(el('span', 'lab-badge ' + (r >= needAAA ? 'is-good' : 'is-warn'), r >= needAAA ? 'Pass' : 'Fail'));
      sType.lastChild.textContent = large ? 'Large text' : 'Normal text';
      msg.className = 'lab-readout ' + (r >= needAA ? 'is-good' : 'is-bad');
      msg.textContent = r >= needAA ? 'This pairing meets level AA for ' + (large ? 'large' : 'normal') + ' text (needs ' + needAA + ':1, has ' + r.toFixed(2) + ':1).' + (r < needAAA ? ' It does not reach AAA, which asks for ' + needAAA + ':1.' : '') : 'This pairing fails level AA for ' + (large ? 'large' : 'normal') + ' text: it needs ' + needAA + ':1 and has ' + r.toFixed(2) + ':1. People with low vision, and anyone using a phone in bright sun, will struggle to read it.';
      fix.hidden = r >= needAA;
    }
    function repair() {
      var fg = hex(st.fg), bg = hex(st.bg), large = st.px >= 24 || (st.bold && st.px >= 18.66), need = large ? 3 : 4.5;
      var toward = lum(bg) > 0.4 ? [0, 0, 0] : [255, 255, 255];
      for (var t = 0; t <= 1.0001; t += 0.01) {
        var c = fg.map(function (v, i) { return v + (toward[i] - v) * t; });
        if (ratio(c, bg) >= need) { st.fg = toHex(c); break; }
      }
      i1.value = st.fg; update();
    }
    i1.addEventListener('input', function () { st.fg = i1.value; update(); });
    i2.addEventListener('input', function () { st.bg = i2.value; update(); });
    i3.addEventListener('input', function () { st.px = +i3.value; update(); });
    i4.addEventListener('change', function () { st.bold = i4.checked; update(); });
    fix.addEventListener('click', repair);
    update();
  }

  /* ---------- 3. Practice sets ---------- */
  function buildFormats(host) {
    Labs.sorter(host, {
      cls: 'im-formats', keepCase: true,
      title: 'Which file format?',
      lead: 'Read each purpose and choose the most suitable format. Think about quality, file size, features such as transparency, and compatibility.',
      noun: 'purpose',
      groupLabel: 'File format',
      choices: [{ key: 'JPEG', label: 'JPEG' }, { key: 'PNG', label: 'PNG' }, { key: 'GIF', label: 'GIF' }, { key: 'SVG', label: 'SVG' }, { key: 'WAV', label: 'WAV' }, { key: 'MP3', label: 'MP3' }, { key: 'MP4', label: 'MP4' }],
      items: [
        { text: 'A logo for a website that must stay sharp on a phone and on a large display, and be small to download.', ans: 'SVG', why: 'A vector format stores shapes as instructions, so it scales to any size without blur and stays small for simple shapes.' },
        { text: 'A photograph of a school event for a news page, where a small file matters more than perfect detail.', ans: 'JPEG', why: 'Lossy compression gives small files for photographs. The discarded detail is hard to see at normal size.' },
        { text: 'A screenshot with small text and an icon on a transparent background, to put in a help page.', ans: 'PNG', why: 'Lossless compression keeps sharp edges, and PNG supports full transparency. JPEG would blur the text and cannot be transparent.' },
        { text: 'A tiny looping graphic of a bouncing arrow that must play everywhere without a video player.', ans: 'GIF', why: 'GIF supports simple animation and is understood almost everywhere. It is poor for photographs because it is limited to 256 colours per frame.' },
        { text: 'A podcast episode that listeners stream over mobile data.', ans: 'MP3', why: 'Lossy compression makes small files that play almost everywhere, and speech loses little at a sensible bit rate.' },
        { text: 'The master recording of a band, to be edited in a studio with no loss of quality.', ans: 'WAV', why: 'Uncompressed audio is an exact copy of the recording. The files are very large, which is acceptable for a master that will be edited and then compressed for delivery.' },
        { text: 'A two-minute promotional video that has to play on phones, browsers and televisions.', ans: 'MP4', why: 'MP4 with H.264 video and AAC audio is the safest default: it plays on nearly every device and compresses video heavily.' }
      ],
      closing: 'In an exam, name the format and justify it with at least two of the features in the table: type, compression, file size, transparency or animation, and compatibility.'
    });
  }
  function buildHardware(host) {
    Labs.sorter(host, {
      cls: 'im-hardware', keepCase: true,
      title: 'Which hardware matters most?',
      lead: 'Each project below is limited by one part of the system more than the others. Choose the component the project depends on most.',
      noun: 'project',
      groupLabel: 'Most important hardware',
      choices: [{ key: 'GPU', label: 'Graphics processor' }, { key: 'RAM', label: 'Memory (RAM)' }, { key: 'Storage', label: 'Fast storage' }, { key: 'Audio', label: 'Audio capture' }, { key: 'Network', label: 'Network' }],
      items: [
        { text: 'A school builds a VR safety-training scene. A dropped frame makes users feel unwell.', ans: 'GPU', why: 'VR must draw two views at a high, steady frame rate. A powerful graphics processor keeps the frame rate smooth and the delay low.' },
        { text: 'A designer edits a very large poster with hundreds of layers, and the program slows to a crawl.', ans: 'RAM', why: 'Layers and large images are held in memory. When RAM runs out, the computer swaps data to the drive, which is far slower.' },
        { text: 'An editor scrubs back and forth through hours of 4K footage and waits each time for the picture to load.', ans: 'Storage', why: 'Raw video is read from the drive continuously. A fast SSD loads frames quickly, while a slow drive makes scrubbing stutter.' },
        { text: 'A community radio team records interviews with guests in a small room.', ans: 'Audio', why: 'Capture quality limits everything that follows. A good microphone and an audio interface (the analogue-to-digital converter) matter more than a powerful processor.' },
        { text: 'A multiplayer mobile game feels laggy for players on a shared connection, although their phones are fast.', ans: 'Network', why: 'Multiplayer response time depends on bandwidth, latency and reliability. A faster phone cannot fix a slow or congested connection.' }
      ],
      closing: 'Evaluating hardware means judging it against the project\'s requirements, including the audience\'s devices, not choosing the most expensive part.'
    });
  }

  function init() {
    document.querySelectorAll('[data-im="size"]').forEach(buildSize);
    document.querySelectorAll('[data-im="contrast"]').forEach(buildContrast);
    document.querySelectorAll('[data-im="formats"]').forEach(buildFormats);
    document.querySelectorAll('[data-im="hardware"]').forEach(buildHardware);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
