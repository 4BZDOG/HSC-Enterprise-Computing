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
