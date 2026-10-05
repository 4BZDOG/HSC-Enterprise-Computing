/* ============================================================
   HSC Enterprise Computing Notes: main JS
   Navigation, theme, collapsible parts and sections, contents
   sheet, lightbox, glossary popovers. Vanilla JS, no dependencies.
   Every localStorage key starts with "ec-" because this site shares
   an origin (4bzdog.github.io) with sister sites.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Skip Link (Accessibility) ── */
  const mainContent = document.querySelector('.main-content, .content-body, main');
  if (mainContent) {
    if (!mainContent.id) mainContent.id = 'main-content';
    const skipLink = document.createElement('a');
    skipLink.href = '#' + mainContent.id;
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  /* ── Theme Toggle ── */
  const THEME_KEY = 'ec-theme';
  let stored = null;
  try { stored = localStorage.getItem(THEME_KEY); } catch {}
  const saved = stored ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', saved);

  const themeButtons = document.querySelectorAll('#theme-toggle, #theme-toggle-mobile');

  const SUN_ICON =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/>' +
    '<path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"/></svg>';
  const MOON_ICON =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"/></svg>';

  function updateThemeIcon(btn, theme) {
    if (!btn) return;
    const icon = theme === 'dark' ? SUN_ICON : MOON_ICON;
    const label = btn.id === 'theme-toggle-mobile' ? (theme === 'dark' ? ' Light mode' : ' Dark mode') : '';
    btn.innerHTML = icon + label;
    btn.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  }

  const applyTheme = next => {
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem(THEME_KEY, next); } catch {}
    themeButtons.forEach(b => updateThemeIcon(b, next));
  };

  themeButtons.forEach(btn => {
    updateThemeIcon(btn, saved);
    btn.addEventListener('click', e => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Premium: animate the swap as a circular reveal from the toggle button.
      if (!document.startViewTransition || reduce) {
        applyTheme(next);
        return;
      }
      const r = btn.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      const root = document.documentElement;
      root.style.setProperty('--theme-x', x + 'px');
      root.style.setProperty('--theme-y', y + 'px');
      root.style.setProperty('--theme-r', radius + 'px');
      root.classList.add('theme-transition');
      const vt = document.startViewTransition(() => applyTheme(next));
      vt.finished.finally(() => root.classList.remove('theme-transition'));
    });
  });

  /* NESA Enterprise Computing 11–12 outcomes, shown when hovering an outcome chip.
     Text is NESA's, from resources/nesa-syllabus-content.md (scripts/check-site.py keeps them in step). */
  const OUTCOME_TEXT = {
    'EC-11-01': 'Describes how systems are used in a range of enterprises',
    'EC-11-02': 'Describes the function of data and information within enterprise computing systems',
    'EC-11-03': 'Describes how data is safely and securely collected, stored and manipulated when developing enterprise computing systems',
    'EC-11-04': 'Describes how data is used in enterprise computing systems',
    'EC-11-05': 'Applies tools and resources to analyse datasets',
    'EC-11-06': 'Explains how innovative technologies have influenced enterprise computing systems',
    'EC-11-07': 'Explores the social, ethical and legal implications of the application of enterprise computing systems on the individual, society and the environment',
    'EC-11-08': 'Selects and uses tools and resources to design and develop an enterprise computing system',
    'EC-11-09': 'Documents the management and evaluates the development of an enterprise solution',
    'EC-11-10': 'Investigates the effectiveness of an enterprise computing system',
    'EC-11-11': 'Communicates an enterprise computing solution to an intended audience',
    'EC-12-01': 'Explains how systems meet the needs of a range of enterprises',
    'EC-12-02': 'Explains the function of data and information within enterprise computing systems',
    'EC-12-03': 'Explains and evaluates how data is safely and securely collected, stored and manipulated when developing enterprise computing systems',
    'EC-12-04': 'Explains how data is used in enterprise computing systems',
    'EC-12-05': 'Applies tools and resources to analyse complex datasets',
    'EC-12-06': 'Analyses how innovative technologies have influenced enterprise computing systems',
    'EC-12-07': 'Explains the social, ethical and legal implications of the application of enterprise computing systems on the individual, society and the environment',
    'EC-12-08': 'Justifies the selection and use of tools and resources to design and develop an enterprise computing system',
    'EC-12-09': 'Selects and applies methods to record the management and evaluate the development of an enterprise computing system',
    'EC-12-10': 'Evaluates the effectiveness of an enterprise computing system',
    'EC-12-11': 'Communicates an enterprise computing solution to a specific audience'
  };

  /* ── Transform Outcome Subtitles to Badges ── */
  document.querySelectorAll('.outcome-subtitle').forEach(el => {
    const content = el.innerHTML.trim();
    const outcomePattern = /\(([^)]+)\)/;
    const match = content.match(outcomePattern);

    if (match) {
      const codes = match[1].split(',').map(code => code.trim());
      let newHTML = '';
      codes.forEach((code, i) => {
        const text = OUTCOME_TEXT[code];
        newHTML += text
          ? `<span class="outcome-badge" tabindex="0" data-outcome="${text}" aria-label="${code}: ${text}">${code}</span>`
          : `<span class="outcome-badge">${code}</span>`;
        if (i < codes.length - 1) newHTML += ' ';
      });
      el.innerHTML = newHTML;
    }
  });

  /* ── Nav Active State (URL-based, works across all pages) ── */
  (function () {
    const filename = window.location.pathname.split('/').pop() || 'index.html';

    // Mark matching links active and flag parent dropdown
    document.querySelectorAll('.nav-links > li > a, .nav-dropdown-menu a, .mobile-menu a').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href.split('/').pop() === filename) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
        const dropdown = link.closest('.nav-dropdown');
        if (dropdown) dropdown.classList.add('nav-dropdown--has-active');
      }
    });
  })();

  /* ── Nav Dropdowns ── */
  (function () {
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    if (!dropdowns.length) return;

    function openDd(dd) {
      dd.classList.add('open');
      dd.querySelector('.nav-dropdown-btn').setAttribute('aria-expanded', 'true');
    }
    function closeDd(dd) {
      dd.classList.remove('open');
      dd.querySelector('.nav-dropdown-btn').setAttribute('aria-expanded', 'false');
    }
    function closeAll(except) {
      dropdowns.forEach(d => { if (d !== except) closeDd(d); });
    }

    dropdowns.forEach(dd => {
      const btn  = dd.querySelector('.nav-dropdown-btn');
      const menu = dd.querySelector('.nav-dropdown-menu');
      let closeTimer;

      // ── Hover (desktop) ──────────────────────────────────────
      // Small close-delay so fast mouse movement between items doesn't flash closed.
      // Only where a pointer can hover: a tap on a touch screen sends mouseenter first, which opened the
      // menu and then let the same tap's click shut it again.
      const canHover = window.matchMedia('(hover: hover)');
      dd.addEventListener('mouseenter', () => {
        if (!canHover.matches) return;
        clearTimeout(closeTimer);
        closeAll(dd);
        openDd(dd);
      });
      dd.addEventListener('mouseleave', () => {
        if (!canHover.matches) return;   // on touch, a tap elsewhere (the document click) closes it
        closeTimer = setTimeout(() => closeDd(dd), 80);
      });

      // ── Click / touch toggle ──────────────────────────────────
      // A mouse click on a menu that hover has already opened keeps it open, not shut under the pointer.
      btn.addEventListener('click', e => {
        const wasOpen = dd.classList.contains('open');
        if (wasOpen && e.detail > 0 && canHover.matches) return;
        closeAll();
        if (!wasOpen) openDd(dd);
      });

      // ── Keyboard: trigger button ──────────────────────────────
      btn.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openDd(dd);
          menu.querySelector('a')?.focus();
        }
        if (e.key === 'Escape') closeDd(dd);
      });

      // ── Keyboard: inside menu ─────────────────────────────────
      menu.addEventListener('keydown', e => {
        const items = [...menu.querySelectorAll('a')];
        const idx   = items.indexOf(document.activeElement);
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          items[Math.min(idx + 1, items.length - 1)]?.focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (idx === 0) { btn.focus(); closeDd(dd); }
          else items[Math.max(idx - 1, 0)]?.focus();
        } else if (e.key === 'Escape') {
          btn.focus(); closeDd(dd);
        } else if (e.key === 'Tab') {
          closeDd(dd);
        }
      });
    });

    // ── Click outside ─────────────────────────────────────────
    document.addEventListener('click', e => {
      if (!e.target.closest('.nav-dropdown')) closeAll();
    });
  })();

  /* ── Mobile Menu ── */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (hamburger && mobileMenu) {
    // The bars fold into a cross in CSS, keyed off aria-expanded
    const setOpen = open => {
      mobileMenu.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
      hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };

    hamburger.addEventListener('click', () => setOpen(!mobileMenu.classList.contains('open')));

    // Close on link click or Escape
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) { setOpen(false); hamburger.focus(); }
    });
  }

  /* ── Shared scroll loop: every scroll-driven update runs once per frame ── */
  const scrollTasks = [];
  let scrollQueued = false;
  function onScrollFrame(fn) { scrollTasks.push(fn); fn(); }
  window.addEventListener('scroll', () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => { scrollQueued = false; scrollTasks.forEach(fn => fn()); });
  }, { passive: true });

  /* ── Navbar scrolled state ── */
  const navEl = document.querySelector('.navbar');
  if (navEl) {
    const updateNavState = () => navEl.classList.toggle('scrolled', window.scrollY > 8);
    onScrollFrame(updateNavState);
  }

  /* ── Reading Progress Bar ── */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    navbar.appendChild(progressBar);

    const hasToc = document.querySelector('.toc-list');
    if (hasToc) {
      document.documentElement.classList.add('has-toc');
      const updateProgress = () => {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? Math.min(100, (window.scrollY / docHeight) * 100) : 0;
        // CSS uses `calc(var(--scroll-pct, 0) * 1%)` to size the bar.
        progressBar.style.setProperty('--scroll-pct', pct);
      };
      onScrollFrame(updateProgress);
    }
  }

  /* ── Scroll-to-Top Button ── */
  const scrollBtn = document.createElement('button');
  scrollBtn.className = 'scroll-top-btn';
  scrollBtn.setAttribute('aria-label', 'Scroll to top');
  scrollBtn.innerHTML = '&#8593;'; // ↑ arrow
  document.body.appendChild(scrollBtn);

  const SCROLL_THRESHOLD = 400;
  const updateScrollBtn = () => {
    scrollBtn.classList.toggle('visible', window.scrollY > SCROLL_THRESHOLD);
  };
  onScrollFrame(updateScrollBtn);

  scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ── Table of Contents — Active Highlight on Scroll ── */
  const tocLinks = document.querySelectorAll('.toc-list a');
  if (tocLinks.length > 0) {
    // Tag part-label list items (those without an anchor child)
    document.querySelectorAll('.toc-list > li').forEach(li => {
      if (!li.querySelector('a')) {
        li.classList.add('toc-part-label');
      }
    });

    const allTocLis = Array.from(document.querySelectorAll('.toc-list > li'));

    function setActivePart(activeLi) {
      document.querySelectorAll('.toc-part-label').forEach(pl => pl.classList.remove('toc-part-active'));
      if (!activeLi) return;
      const idx = allTocLis.indexOf(activeLi);
      for (let i = idx; i >= 0; i--) {
        if (allTocLis[i].classList.contains('toc-part-label')) {
          allTocLis[i].classList.add('toc-part-active');
          break;
        }
      }
    }

    // Observe sections directly (they carry the IDs the TOC hrefs target)
    const sections = Array.from(document.querySelectorAll('.content-body section[id]'));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        tocLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));

        const activeLink = document.querySelector(`.toc-list a[href="#${id}"]`);
        if (activeLink) {
          // Scroll sidebar to keep active link visible
          // Scroll only the sidebar list; scrollIntoView would also nudge the page.
          const box = activeLink.closest('.sidebar');
          if (box && box.scrollHeight > box.clientHeight) {
            const lr = activeLink.getBoundingClientRect();
            const br = box.getBoundingClientRect();
            if (lr.top < br.top + 40 || lr.bottom > br.bottom - 40) {
              box.scrollTo({ top: box.scrollTop + lr.top - br.top - br.height / 3, behavior: 'smooth' });
            }
          }
          setActivePart(activeLink.closest('li'));
        }
      });
    }, { rootMargin: '-10% 0px -80% 0px' });

    sections.forEach(s => observer.observe(s));
  }

  /* ── Search (home page) ── */
  const searchInput = document.getElementById('topic-search');
  if (searchInput) {
    const cards = document.querySelectorAll('.topic-card');

    // Aria-live region for screen-reader feedback
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    searchInput.parentNode.insertBefore(liveRegion, searchInput.nextSibling);

    // No-results message
    const noResults = document.createElement('p');
    noResults.className = 'search-no-results';
    noResults.textContent = 'No topics match your search.';
    noResults.hidden = true;
    searchInput.closest('section, div')?.appendChild(noResults);

    let searchTimer;
    searchInput.addEventListener('input', e => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        const q = e.target.value.toLowerCase().trim();
        let visibleCount = 0;
        cards.forEach(card => {
          // The illustration's labels are decorative: search only the card's own text.
          const text = Array.from(card.children).filter(c => !c.classList.contains('card-art')).map(c => c.textContent).join(' ').toLowerCase();
          const show = !q || text.includes(q);
          card.style.display = show ? '' : 'none';
          if (show) visibleCount++;
        });
        noResults.hidden = visibleCount > 0 || !q;
        liveRegion.textContent = q
          ? `${visibleCount} topic${visibleCount !== 1 ? 's' : ''} found`
          : '';
      }, 150);
    });
  }

  /* ── "/" focuses the topic search ── */
  if (searchInput) {
    document.addEventListener('keydown', e => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return;
      e.preventDefault();
      searchInput.focus();
    });
  }

  /* ── Reveal-on-scroll for home page sections ── */
  const revealEls = document.querySelectorAll('.glance-card, .glance-outcomes');
  if (revealEls.length && 'IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealEls.forEach((el, i) => {
      el.classList.add('reveal-item');
      el.style.transitionDelay = `${(i % 4) * 70}ms`;
    });
    const revealObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('revealed');
        revealObs.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => revealObs.observe(el));
  }

  /* ── Smooth Scroll for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── Staggered Card Entrance (transition-based, no animation conflicts) ── */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cardGrids = document.querySelectorAll('.topics-grid');
  if (cardGrids.length && 'IntersectionObserver' in window && !prefersReducedMotion) {
    cardGrids.forEach(grid => {
      const cards = Array.from(grid.querySelectorAll('.topic-card'));
      // Set hidden state via JS only — cards remain visible if JS is absent
      cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(22px)';
      });
      const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const card = entry.target;
          const delay = cards.indexOf(card) * 70;
          card.classList.add('card-visible');
          // Double-rAF: first frame commits the hidden inline styles to the renderer,
          // second frame applies the visible state so the transition actually fires.
          requestAnimationFrame(() => requestAnimationFrame(() => {
            card.style.transitionDelay = `${delay}ms`;
            card.style.opacity = '1';
            card.style.transform = '';
          }));
          // After entrance completes: clear inline styles AND remove card-visible so the
          // card falls back to `transition: all 200ms` — making hover snappy again.
          card.addEventListener('transitionend', () => {
            card.style.transitionDelay = '';
            card.style.opacity = '';
            card.style.transform = '';
            card.classList.remove('card-visible');
          }, { once: true });
          obs.unobserve(card);
        });
      }, { threshold: 0.08 });
      cards.forEach(card => obs.observe(card));
    });
  }

  /* ── Fallback: show all cards on non-home topic pages ── */
  const nonGridCards = document.querySelectorAll('.info-card, .def-card');
  if (nonGridCards.length && 'IntersectionObserver' in window) {
    const anim = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('fade-in'); anim.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    nonGridCards.forEach(el => anim.observe(el));
  }

  /* ── Hero Stat Counter Animation ── */
  const statEls = document.querySelectorAll('.hero-stat-num[data-count]');
  if (statEls.length && 'IntersectionObserver' in window) {
    // Suppress per-tick SR announcements; final value is already in the DOM
    statEls.forEach(el => el.setAttribute('aria-live', 'off'));
    const counterObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const end = Number.parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        counterObs.unobserve(el);
        if (!Number.isFinite(end)) return;
        el.classList.add('stat-animated');
        if (prefersReducedMotion) {
          el.textContent = end + suffix;
          return;
        }
        const duration = 1400;
        const startTime = performance.now();
        const tick = now => {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * end) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    statEls.forEach(el => counterObs.observe(el));
  }

  /* ── Collapsible Major Part Blocks ── */
  (function () {
    const PART_KEY = 'ec-parts';
    const pageKey = window.location.pathname;

    function getState() {
      try { return JSON.parse(localStorage.getItem(PART_KEY) || '{}'); }
      catch { return {}; }
    }
    function setState(key, collapsed) {
      const s = getState();
      if (collapsed) s[key] = 1; else delete s[key];
      try { localStorage.setItem(PART_KEY, JSON.stringify(s)); } catch {}
    }

    document.querySelectorAll('.part-block').forEach((block, idx) => {
      const stateKey = `${pageKey}::part-${idx}`;

      // Inject chevron
      const chevron = document.createElement('span');
      chevron.className = 'part-chevron';
      chevron.setAttribute('aria-hidden', 'true');
      chevron.innerHTML = `<svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>`;
      block.appendChild(chevron);

      // Wrap all following siblings until the next .part-block in an animated group
      const group    = document.createElement('div');
      const inner    = document.createElement('div');
      group.className = 'part-group';
      inner.className = 'part-group-inner';
      group.appendChild(inner);

      const siblings = [];
      let el = block.nextElementSibling;
      while (el && !el.classList.contains('part-block')) {
        siblings.push(el);
        el = el.nextElementSibling;
      }
      block.insertAdjacentElement('afterend', group);
      siblings.forEach(s => inner.appendChild(s));

      // Restore saved collapse state
      const isCollapsed = getState()[stateKey] === 1;
      if (isCollapsed) {
        block.classList.add('part-collapsed');
        group.classList.add('part-collapsed');
        group.inert = true;
      }

      block.setAttribute('role', 'button');
      block.setAttribute('aria-expanded', String(!isCollapsed));
      block.setAttribute('tabindex', '0');

      function toggle() {
        const nowCollapsed = block.classList.toggle('part-collapsed');
        group.classList.toggle('part-collapsed', nowCollapsed);
        group.inert = nowCollapsed; // hidden content leaves the tab order
        block.setAttribute('aria-expanded', String(!nowCollapsed));
        setState(stateKey, nowCollapsed);
      }

      block.addEventListener('click', toggle);
      block.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
    });
  })();

  /* ── Collapsible Syllabus Sections ── */
  (function () {
    const COLLAPSE_KEY = 'ec-collapsed';
    const pageKey = window.location.pathname;

    function getState() {
      try { return JSON.parse(localStorage.getItem(COLLAPSE_KEY) || '{}'); }
      catch { return {}; }
    }

    function setState(key, collapsed) {
      const s = getState();
      if (collapsed) s[key] = 1;
      else delete s[key];
      try { localStorage.setItem(COLLAPSE_KEY, JSON.stringify(s)); } catch {}
    }

    document.querySelectorAll('h2.syllabus-phase').forEach((h2, idx) => {
      const section = h2.closest('section');
      if (!section) return;
      const sectionId = section.id || `sec-${idx}`;
      const stateKey = `${pageKey}::${sectionId}`;

      /* ── Move outcome badges into the header ── */
      const nextSib = h2.nextElementSibling;
      if (nextSib && nextSib.classList.contains('outcome-subtitle')) {
        h2.appendChild(nextSib);
      }

      /* ── Move syllabus concept into the header ── */
      const conceptEl = h2.nextElementSibling;
      if (conceptEl && conceptEl.classList.contains('syllabus-concept')) {
        conceptEl.innerHTML = conceptEl.innerHTML.replace(/📌\s*/, '');
        h2.appendChild(conceptEl);
      }

      /* ── Add chevron ── */
      const chevron = document.createElement('span');
      chevron.className = 'section-chevron';
      chevron.setAttribute('aria-hidden', 'true');
      chevron.innerHTML = `<svg viewBox="0 0 16 16"><polyline points="4 6 8 10 12 6"/></svg>`;
      h2.appendChild(chevron);

      /* ── Wrap body content ── */
      const body  = document.createElement('div');
      body.className = 'section-body';
      const inner = document.createElement('div');
      inner.className = 'section-body-inner';
      body.appendChild(inner);

      // Move every sibling after h2 into the inner div
      const siblings = [];
      let el = h2.nextElementSibling;
      while (el) { siblings.push(el); el = el.nextElementSibling; }
      siblings.forEach(s => inner.appendChild(s));
      section.appendChild(body);

      /* ── Restore saved collapse state ── */
      const isCollapsed = getState()[stateKey] === 1;
      if (isCollapsed) {
        h2.classList.add('section-collapsed');
        body.classList.add('section-collapsed');
        body.inert = true;
      }

      /* ── Accessibility ── */
      h2.setAttribute('role', 'button');
      h2.setAttribute('tabindex', '0');
      h2.setAttribute('aria-expanded', String(!isCollapsed));

      /* ── Toggle on click or keyboard ── */
      function toggle() {
        const nowCollapsed = h2.classList.toggle('section-collapsed');
        body.classList.toggle('section-collapsed', nowCollapsed);
        body.inert = nowCollapsed; // hidden content leaves the tab order
        h2.setAttribute('aria-expanded', String(!nowCollapsed));
        setState(stateKey, nowCollapsed);
      }

      h2.addEventListener('click', toggle);
      h2.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
    });

    /* ── Auto-expand part + section when TOC link is clicked ── */
    document.querySelectorAll('.toc-list a[href^="#"]').forEach(link => {
      link.addEventListener('click', () => {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        // Expand collapsed part-group first
        const partGroup = target.closest('.part-group');
        if (partGroup?.classList.contains('part-collapsed')) {
          partGroup.previousElementSibling?.click();
        }
        // Expand collapsed section
        const h2 = target.tagName === 'SECTION'
          ? target.querySelector('h2.syllabus-phase')
          : target.closest('section')?.querySelector('h2.syllabus-phase');
        if (h2?.classList.contains('section-collapsed')) h2.click();
      });
    });
  })();

  /* ── Mobile Table of Contents (bottom sheet) ── */
  (() => {
    const sidebarToc = document.querySelector('.sidebar .toc-list');
    if (!sidebarToc) return;

    const fab = document.createElement('button');
    fab.className = 'mobile-toc-fab';
    fab.type = 'button';
    fab.setAttribute('aria-label', 'Open table of contents');
    fab.setAttribute('aria-expanded', 'false');
    fab.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<line x1="8" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/>' +
      '<line x1="8" y1="18" x2="20" y2="18"/><line x1="3.5" y1="6" x2="3.51" y2="6"/>' +
      '<line x1="3.5" y1="12" x2="3.51" y2="12"/><line x1="3.5" y1="18" x2="3.51" y2="18"/></svg>' +
      '<span>Contents</span>';

    const backdrop = document.createElement('div');
    backdrop.className = 'mobile-toc-backdrop';

    const panel = document.createElement('nav');
    panel.className = 'mobile-toc-panel';
    panel.setAttribute('aria-label', 'Table of contents');
    panel.setAttribute('aria-hidden', 'true');

    const header = document.createElement('div');
    header.className = 'mobile-toc-header';
    header.innerHTML = '<span>On this page</span>' +
      '<button class="mobile-toc-close" type="button" aria-label="Close table of contents">&times;</button>';

    const list = sidebarToc.cloneNode(true);
    list.classList.remove('toc-list');
    list.classList.add('mobile-toc-list');
    // Clones don't inherit the sidebar links' event listeners; strip ids just in case
    list.removeAttribute('id');

    panel.appendChild(header);
    panel.appendChild(list);
    document.body.appendChild(fab);
    document.body.appendChild(backdrop);
    document.body.appendChild(panel);

    // The footer's last rows sit where the button floats: it steps aside while the footer reaches that zone
    const footerEl = document.querySelector('footer');
    if (footerEl && 'IntersectionObserver' in window) {
      new IntersectionObserver(entries => fab.classList.toggle('is-over-footer', entries[0].isIntersecting),
        { rootMargin: '0px 0px -90px 0px' }).observe(footerEl);
    }

    let lastFocus = null;
    const open = () => {
      lastFocus = document.activeElement;
      // Mirror the sidebar's current active-section highlight into the sheet
      const activeHref = document.querySelector('.sidebar .toc-list a.active')?.getAttribute('href');
      let activeMobile = null;
      list.querySelectorAll('a').forEach(a => {
        const on = a.getAttribute('href') === activeHref;
        a.classList.toggle('active', on);
        if (on) activeMobile = a;
      });
      backdrop.classList.add('open');
      panel.classList.add('open');
      fab.setAttribute('aria-expanded', 'true');
      panel.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (activeMobile) activeMobile.scrollIntoView({ block: 'center' });
      const first = panel.querySelector('.mobile-toc-close');
      if (first) first.focus();
    };
    const close = () => {
      backdrop.classList.remove('open');
      panel.classList.remove('open');
      fab.setAttribute('aria-expanded', 'false');
      panel.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    };

    fab.addEventListener('click', () => {
      panel.classList.contains('open') ? close() : open();
    });
    backdrop.addEventListener('click', close);
    header.querySelector('.mobile-toc-close').addEventListener('click', close);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && panel.classList.contains('open')) close();
    });

    // Delegate link clicks to the real sidebar link so the existing
    // expand-collapsed-section + smooth-scroll handlers fire.
    list.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const href = link.getAttribute('href');
        close();
        const real = document.querySelector('.sidebar .toc-list a[href="' + href + '"]');
        setTimeout(() => {
          if (real) {
            real.click();
          } else {
            const target = document.querySelector(href);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 140);
      });
    });
  })();

  /* ── Deep-link handling: expand collapsed part/section for #hash targets ── */
  (() => {
    const revealHashTarget = () => {
      const hash = location.hash;
      if (!hash || hash.length < 2) return;
      let target;
      try { target = document.querySelector(hash); } catch { return; }
      if (!target) return;
      // Expand a collapsed part-group (click its part-block header)
      const partGroup = target.closest('.part-group');
      if (partGroup && partGroup.classList.contains('part-collapsed')) {
        partGroup.previousElementSibling?.click();
      }
      // Expand a collapsed section
      const section = target.tagName === 'SECTION' ? target : target.closest('section');
      const h2 = section?.querySelector('h2.syllabus-phase');
      if (h2 && h2.classList.contains('section-collapsed')) h2.click();
      // Scroll once the expand transition has started
      setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    };
    // Defer so the part/section collapse initialisers have finished wrapping.
    setTimeout(revealHashTarget, 0);
    window.addEventListener('hashchange', revealHashTarget);
  })();

  /* ── Copy-link anchors on sub-headings ── */
  (() => {
    // Section sub-headings only — exclude glossary term cards, which have their
    // own #term-* ids and :target highlight (don't clutter them with anchors).
    const headings = Array.from(document.querySelectorAll('.content-body h3'))
      .filter(h => !h.closest('.glossary-term'));
    if (!headings.length) return;

    const slugify = s => s.toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

    const used = new Set(Array.from(document.querySelectorAll('[id]')).map(e => e.id));
    const LINK_SVG =
      '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.5 1.5"/>' +
      '<path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.5-1.5"/></svg>';

    headings.forEach(h => {
      let id = h.id;
      if (!id) {
        const base = slugify(h.textContent) || 'section';
        id = base;
        let n = 2;
        while (used.has(id)) id = base + '-' + (n++);
        h.id = id;
      }
      used.add(id);

      const a = document.createElement('a');
      a.className = 'heading-anchor';
      a.href = '#' + id;
      a.setAttribute('aria-label', 'Copy link to section: ' + h.textContent.trim());
      a.innerHTML = LINK_SVG;

      a.addEventListener('click', e => {
        e.preventDefault();
        const url = location.origin + location.pathname + '#' + id;
        const flash = () => {
          a.classList.add('copied');
          setTimeout(() => a.classList.remove('copied'), 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(flash, flash);
        } else {
          flash();
        }
        // Reflect the section in the address bar without a jarring jump
        try { history.replaceState(null, '', '#' + id); } catch (err) {}
      });

      h.appendChild(a);
    });
  })();

  /* ── Diagram Lightbox Feature ── */
  (() => {
    class DiagramLightbox {
      constructor() {
        this.modal = document.getElementById('diagram-lightbox');
        this.overlay = document.querySelector('.lightbox-overlay');
        this.container = document.querySelector('.lightbox-container');
        this.content = document.getElementById('lightbox-content');
        this.closeBtn = document.querySelector('.lightbox-close');
        this.zoomInBtn = document.getElementById('zoom-in');
        this.zoomOutBtn = document.getElementById('zoom-out');
        this.resetBtn = document.getElementById('reset-view');
        this.zoomLevel = document.getElementById('zoom-level');

        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.minZoom = 0.5;
        this.maxZoom = 3;
        this.zoomStep = 0.1;
        this.isDragging = false;
        this.lastX = 0;
        this.lastY = 0;
        this._triggerEl = null; // element that opened the lightbox

        if (this.modal) this.init();
      }

      init() {
        // Every figure with a drawn diagram (Mermaid SVG, NESA diagram or inline SVG) gets an "Enlarge" button.
        document.querySelectorAll('.figure-canvas:not(.figure-canvas--trace)').forEach(canvas => {
          // Still diagrams (js/anim.js) draw after this runs, so they are matched by their marker, not their <svg>
          if (!canvas.querySelector('.mermaid, .nesa-diagram, svg, .anim-still, [data-anim]') || canvas.classList.contains('figure-canvas--anim')) return;
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'figure-zoom';
          btn.textContent = 'Enlarge';
          const title = canvas.closest('.figure')?.querySelector('.figure-title')?.textContent || 'diagram';
          btn.setAttribute('aria-label', `Enlarge: ${title}`);
          btn.addEventListener('click', () => {
            // Pre-rendered diagrams ship a light and a dark SVG; open the one on show.
            const svg = [...canvas.querySelectorAll('svg')].find(s => s.getClientRects().length);
            if (svg) this.open(svg, btn);
          });
          const head = canvas.closest('.figure')?.querySelector('.figure-kicker');
          (head || canvas).appendChild(btn);
        });

        // Modal controls
        this.closeBtn.addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', () => this.close());
        this.container.addEventListener('click', e => e.stopPropagation());

        this.zoomInBtn.addEventListener('click', () => this.zoomIn());
        this.zoomOutBtn.addEventListener('click', () => this.zoomOut());
        this.resetBtn.addEventListener('click', () => this.reset());

        // Keyboard controls
        document.addEventListener('keydown', e => {
          if (!this.isOpen()) return;
          if (e.key === 'Escape') this.close();
          if (e.key === '+' || e.key === '=') { e.preventDefault(); this.zoomIn(); }
          if (e.key === '-' || e.key === '_') { e.preventDefault(); this.zoomOut(); }
          if (e.key === '0') { e.preventDefault(); this.reset(); }
        });

        // Mouse wheel zoom
        this.content.addEventListener('wheel', e => {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (e.deltaY < 0) this.zoomIn();
            else this.zoomOut();
          }
        }, { passive: false });

        // Pan — mouse
        this.content.addEventListener('mousedown', e => {
          if (e.button !== 0) return;
          this.isDragging = true;
          this.lastX = e.clientX;
          this.lastY = e.clientY;
          this.content.classList.add('panning');
          e.preventDefault();
        });

        document.addEventListener('mousemove', e => {
          if (!this.isDragging || !this.isOpen()) return;
          this.panX += e.clientX - this.lastX;
          this.panY += e.clientY - this.lastY;
          this.lastX = e.clientX;
          this.lastY = e.clientY;
          this.updateTransform();
        });

        document.addEventListener('mouseup', () => {
          this.isDragging = false;
          this.content.classList.remove('panning');
        });

        // Pan / pinch — touch
        let touchDistance = 0;

        this.content.addEventListener('touchstart', e => {
          if (e.touches.length === 1) {
            this.isDragging = true;
            this.lastX = e.touches[0].clientX;
            this.lastY = e.touches[0].clientY;
          } else if (e.touches.length === 2) {
            this.isDragging = false;
            touchDistance = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY
            );
          }
        });

        this.content.addEventListener('touchmove', e => {
          if (e.touches.length === 1 && this.isDragging) {
            this.panX += e.touches[0].clientX - this.lastX;
            this.panY += e.touches[0].clientY - this.lastY;
            this.lastX = e.touches[0].clientX;
            this.lastY = e.touches[0].clientY;
            this.updateTransform();
          } else if (e.touches.length === 2) {
            const current = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY
            );
            if (touchDistance > 0) {
              const ratio = current / touchDistance;
              if (ratio > 1.1) { this.zoomIn(); touchDistance = current; }
              else if (ratio < 0.9) { this.zoomOut(); touchDistance = current; }
            }
          }
        }, { passive: true });

        this.content.addEventListener('touchend', () => {
          this.isDragging = false;
        });
      }

      open(element, trigger = null) {
        this._triggerEl = trigger;
        const clone = element.cloneNode(true);

        // Mermaid renders SVGs with explicit px width/height attributes.
        // Remove them so CSS max-width/max-height can scale the SVG to fit
        // the canvas. Preserve (or synthesise) a viewBox for correct aspect ratio.
        if (!clone.getAttribute('viewBox')) {
          const w = parseFloat(clone.getAttribute('width'))  || 800;
          const h = parseFloat(clone.getAttribute('height')) || 600;
          clone.setAttribute('viewBox', `0 0 ${w} ${h}`);
        }
        clone.removeAttribute('width');
        clone.removeAttribute('height');

        this.content.innerHTML = '';
        this.content.appendChild(clone);

        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.updateTransform();
        this.updateZoomLevel();

        this.modal.classList.add('active');
        this.modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        // Trigger reflow so the SVG renders at its new dimensions before focus
        void this.content.offsetWidth;
        this.closeBtn.focus();
      }

      close() {
        this.modal.classList.remove('active');
        this.modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        this.content.innerHTML = '';
        // Return focus to the element that opened the lightbox
        if (this._triggerEl) {
          this._triggerEl.focus({ preventScroll: true });
          this._triggerEl = null;
        }
      }

      zoomIn() {
        if (this.zoom < this.maxZoom) {
          this.zoom = Math.min(this.maxZoom, this.zoom + this.zoomStep);
          this.updateTransform();
          this.updateZoomLevel();
        }
      }

      zoomOut() {
        if (this.zoom > this.minZoom) {
          this.zoom = Math.max(this.minZoom, this.zoom - this.zoomStep);
          this.updateTransform();
          this.updateZoomLevel();
        }
      }

      reset() {
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.updateTransform();
        this.updateZoomLevel();
      }

      updateTransform() {
        this.content.style.transform =
          `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
      }

      updateZoomLevel() {
        if (this.zoomLevel) this.zoomLevel.textContent = `${Math.round(this.zoom * 100)}%`;
      }

      isOpen() {
        return this.modal?.classList.contains('active') ?? false;
      }
    }

    new DiagramLightbox();
  })();

  /* ── Copy code button ── */
  document.querySelectorAll('.code-block').forEach(block => {
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = 'Copy';
    copyBtn.setAttribute('aria-label', 'Copy code to clipboard');
    copyBtn.addEventListener('click', () => {
      const code = block.querySelector('code')?.textContent || '';
      navigator.clipboard.writeText(code).then(() => {
        copyBtn.textContent = 'Copied!';
        copyBtn.setAttribute('aria-label', 'Code copied to clipboard');
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
          copyBtn.setAttribute('aria-label', 'Copy code to clipboard');
          copyBtn.classList.remove('copied');
        }, 2000);
      }).catch(() => {
        // Fallback for environments without clipboard API
        try {
          const ta = document.createElement('textarea');
          ta.value = code;
          ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          copyBtn.textContent = 'Copied!';
          copyBtn.classList.add('copied');
          setTimeout(() => {
            copyBtn.textContent = 'Copy';
            copyBtn.classList.remove('copied');
          }, 2000);
        } catch {}
      });
    });
    block.appendChild(copyBtn);
  });
  /* ── Glossary keywords: bold, linked, with an inline definition popover ──
     Terms come from js/glossary-data.js (generated from glossary.html by
     scripts/build-glossary.py). The first mention of each term in every
     syllabus section becomes a button that opens a short definition and
     example in place, with a link through to the full glossary. */
  (() => {
    const data = window.HSC_GLOSSARY;
    if (!data || window.location.pathname.includes('glossary.html')) return;
    const contentBody = document.querySelector('.content-body');
    if (!contentBody) return;

    const inTopics = /\/topics\//.test(window.location.pathname);
    const glossaryHref = inTopics ? 'glossary.html' : 'topics/glossary.html';

    const byId = new Map(data.map(t => [t.id, t]));
    // Every obvious way a term is written in the notes: spaced, hyphenated or
    // joined ("plain text", "plain-text", "plaintext"), singular or plural,
    // possessive, Australian or US spelling, and straight or curly apostrophes.
    const lookup = new Map();          // lower-case spelling → { id, exact }
    const add = (form, id, exact) => {
      const k = form.toLowerCase();
      if (!lookup.has(k)) lookup.set(k, { id, exact });
    };
    const numberForms = w => {
      const out = [w];
      if (/(?:ss|is|us)$/i.test(w)) out.push(w + 'es');                 // class → classes, analysis stays
      else if (/[^aeiou]y$/i.test(w)) out.push(w.slice(0, -1) + 'ies'); // library → libraries
      else if (/(?:s|x|z|ch|sh)$/i.test(w)) out.push(w + 'es');
      else out.push(w + 's');
      if (/[^s]s$/i.test(w) && !/(?:is|us|ies|ops)$/i.test(w) && w.length > 4) out.push(w.slice(0, -1)); // requirements → requirement
      if (/ies$/i.test(w)) out.push(w.slice(0, -3) + 'y');              // user stories → user story
      return out;
    };
    const spellingForms = w => {
      const out = new Set([w]);
      out.add(w.replace(/is(ation|e|ed|ing)\b/gi, 'iz$1'));             // authorisation ↔ authorization
      out.add(w.replace(/iz(ation|e|ed|ing)\b/gi, 'is$1'));
      out.add(w.replace(/'/g, '’'));
      return [...out];
    };
    data.filter(t => t.link !== false).forEach(t => t.aliases.forEach(alias => {
      const a = alias.replace(/’/g, "'");
      if (/^[A-Z0-9/&-]{2,6}$/.test(a)) {                               // acronyms keep their case
        [a, a + 's', a + "'s", a + '’s'].forEach(f => add(f, t.id, f));
        return;
      }
      // Keep the alias's own separators ("non-functional requirements") and
      // also try it all spaced, all hyphenated and all joined up.
      const words = a.split(/[\s-]+/);
      const own = a.match(/[\s-]+/g) || [];
      const sepSets = [own, ...[' ', '-', ''].map(j => own.map(() => j))];
      sepSets.forEach(seps => {
        numberForms(words[words.length - 1]).forEach(last => {
          const parts = [...words.slice(0, -1), last];
          const base = parts.reduce((acc, w, i) => i ? acc + seps[i - 1] + w : w, '');
          spellingForms(base).forEach(f => {
            add(f, t.id, null);
            add(f + "'s", t.id, null);
            add(f + '’s', t.id, null);
          });
        });
      });
    }));
    const spellings = [...lookup.keys()].sort((a, b) => b.length - a.length)
      .map(t => t.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
    const pattern = new RegExp(`(?<![\\w-])(${spellings.join('|')})(?![\\w-])`, 'gi');

    const excludeTags = new Set(['A', 'BUTTON', 'PRE', 'CODE', 'TH', 'SCRIPT', 'STYLE',
      'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SUMMARY', 'LABEL']);
    const excludeClasses = ['mermaid', 'code-block', 'algo-trace', 'part-block',
      'curriculum-banner', 'syllabus-phase', 'outcome-subtitle', 'syllabus-concept', 'syllabus-including', 'gloss', 'quiz', 'figure-head', 'gh-app'];

    const walker = document.createTreeWalker(contentBody, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        for (let el = node.parentElement; el && el !== contentBody; el = el.parentElement) {
          if (excludeTags.has(el.tagName) || excludeClasses.some(c => el.classList.contains(c))) {
            return NodeFilter.FILTER_REJECT;
          }
        }
        return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    // First mention per term per section, so each section introduces its own keywords.
    const seen = new WeakMap();
    nodes.forEach(node => {
      const scope = node.parentElement.closest('section') || contentBody;
      if (!seen.has(scope)) seen.set(scope, new Set());
      const used = seen.get(scope);
      const text = node.nodeValue;
      let frag = null, last = 0, m;
      pattern.lastIndex = 0;
      while ((m = pattern.exec(text))) {
        const hit = lookup.get(m[0].toLowerCase());
        if (!hit || (hit.exact && m[0] !== hit.exact)) continue;
        if (used.has(hit.id)) continue;
        used.add(hit.id);
        frag = frag || document.createDocumentFragment();
        frag.append(text.slice(last, m.index));
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'gloss';
        btn.dataset.term = hit.id;
        btn.setAttribute('aria-haspopup', 'dialog');
        btn.setAttribute('aria-expanded', 'false');
        btn.textContent = m[0];
        frag.append(btn);
        last = pattern.lastIndex;
      }
      if (frag) {
        frag.append(text.slice(last));
        node.replaceWith(frag);
      }
    });

    // Popover
    const pop = document.createElement('div');
    pop.className = 'gloss-pop';
    pop.setAttribute('role', 'dialog');
    pop.hidden = true;
    pop.innerHTML = '<button type="button" class="gloss-close" aria-label="Close definition">✕</button>' +
      '<p class="gloss-name"></p><p class="gloss-def"></p><p class="gloss-ex"></p>' +
      '<a class="gloss-more">Open in the glossary →</a>';
    document.body.append(pop);
    let opener = null;

    function place(btn) {
      const r = btn.getBoundingClientRect();
      const w = Math.min(340, window.innerWidth - 24);
      pop.style.width = w + 'px';
      const left = Math.max(12, Math.min(r.left + r.width / 2 - w / 2, window.innerWidth - w - 12));
      pop.style.left = left + window.scrollX + 'px';
      const below = r.bottom + 10;
      const h = pop.offsetHeight;
      const top = below + h > window.innerHeight - 8 && r.top - h - 10 > 8 ? r.top - h - 10 : below;
      pop.style.top = top + window.scrollY + 'px';
    }

    function open(btn) {
      const t = byId.get(btn.dataset.term);
      if (!t) return;
      if (opener) opener.setAttribute('aria-expanded', 'false');
      opener = btn;
      pop.querySelector('.gloss-name').textContent = t.name;
      pop.querySelector('.gloss-def').textContent = t.def;
      const ex = pop.querySelector('.gloss-ex');
      ex.hidden = !t.example;
      ex.innerHTML = t.example ? '<strong>Example:</strong> ' : '';
      if (t.example) ex.append(t.example);
      pop.querySelector('.gloss-more').href = `${glossaryHref}#${t.id}`;
      pop.setAttribute('aria-label', `Definition: ${t.name}`);
      pop.hidden = false;
      place(btn);
      btn.setAttribute('aria-expanded', 'true');
      pop.querySelector('.gloss-close').focus({ preventScroll: true });
    }

    function close(returnFocus) {
      if (pop.hidden) return;
      pop.hidden = true;
      if (opener) {
        opener.setAttribute('aria-expanded', 'false');
        if (returnFocus) opener.focus({ preventScroll: true });
      }
      opener = null;
    }

    document.addEventListener('click', e => {
      const btn = e.target.closest('.gloss');
      if (btn) {
        e.preventDefault();
        if (opener === btn) close(false); else open(btn);
      } else if (e.target.closest('.gloss-close')) {
        close(true);
      } else if (!e.target.closest('.gloss-pop')) {
        close(false);
      }
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !pop.hidden) close(true);
    });
    window.addEventListener('resize', () => { if (opener) place(opener); });
  })();

});
