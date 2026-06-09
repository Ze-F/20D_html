/* ============================================================
   MATH 20D Walkthrough — Navigation
   Responsibilities:
     1. Inject left sidebar (course-wide file list, current highlighted)
     2. Auto-generate right "On this page" TOC from h2/h3
     3. Scroll-spy via IntersectionObserver
     4. Dark-mode toggle (localStorage + prefers-color-scheme)
     5. Inject prev/next links at the bottom of <main>
   ============================================================ */

(function () {
  'use strict';

  // ---------- File ordering (single source of truth) ----------
  const FILES = [
    { href: 'index.html',                       label: 'Index',                            section: '' },
    { href: '01-foundations.html',              label: '01. Foundations',                  section: '1.1, 1.3' },
    { href: '02-first-order.html',              label: '02. First-Order ODEs',             section: '2.1, 2.2, 2.4, 2.5, 2.6' },
    { href: '03-homog-second-order.html',       label: '03. Homog Second-Order',           section: '3.1–3.4' },
    { href: '04-nonhomog-second-order.html',    label: '04. Nonhomog Second-Order',        section: '3.5, 3.6' },
    { href: '05-systems-theory.html',           label: '05. Systems · Theory',             section: '7.1–7.4' },
    { href: '06-systems-methods.html',          label: '06. Systems · Methods',            section: '7.5, 7.6' },
    { href: '07-laplace-basics.html',           label: '07. Laplace · Basics',             section: '6.1, 6.2' },
    { href: '08-laplace-discontinuous.html',    label: '08. Laplace · Discontinuous',      section: '6.3–6.6' },
    { href: '09-series-solutions.html',         label: '09. Series Solutions',             section: '5.1, 5.2, 5.3' },
    { href: 'mt2-01-secondorder.html',          label: 'MT2 · Part 1 — 2nd-Order',         section: '3.5, 3.6 HW' },
    { href: 'mt2-02-systems.html',              label: 'MT2 · Part 2 — Systems',           section: '7.1, 7.3–7.6 HW' },
    { href: 'mt2-03-laplace.html',              label: 'MT2 · Part 3 — Laplace',           section: '6.1–6.4 HW' },
    { href: 'mt2-04-practice.html',             label: "MT2 · Part 4 — Prof's Practice",   section: '15 practice problems' },
    { href: 'mt2-05-drills.html',               label: 'MT2 · Part 5 — Targeted Drills',   section: '§3.6, Laplace signs, complex' },
    { href: '10-final-sprint.html',             label: 'Final · 冲刺 Sprint',              section: 'cumulative · 速查 + 25 题' },
    { href: 'cram/01-foundations.html',           label: 'Cram · 01 Foundations',            section: '1.1, 1.3' },
    { href: 'cram/02-first-order.html',           label: 'Cram · 02 First-Order',            section: '2.1–2.6' },
    { href: 'cram/03-homog-second-order.html',    label: 'Cram · 03 Homog 2nd-Order',        section: '3.1–3.4' },
    { href: 'cram/04-nonhomog-second-order.html', label: 'Cram · 04 Nonhomog 2nd-Order',     section: '3.5, 3.6' },
    { href: 'cram/05-systems-theory.html',        label: 'Cram · 05 Systems Theory',         section: '7.1–7.4' },
    { href: 'cram/06-systems-methods.html',       label: 'Cram · 06 Systems Methods',        section: '7.5, 7.6' },
    { href: 'cram/07-laplace-basics.html',        label: 'Cram · 07 Laplace Basics',         section: '6.1, 6.2' },
    { href: 'cram/08-laplace-discontinuous.html', label: 'Cram · 08 Laplace Discontinuous',  section: '6.3–6.6' },
    { href: 'cram/09-series-solutions.html',      label: 'Cram · 09 Series Solutions',       section: '5.1–5.3' },
    { href: 'hw/hw1.html',                      label: 'HW · HW1 (Sec 1.1–2.4)',           section: 'Classification · Linear · Separable' },
    { href: 'hw/hw2.html',                      label: 'HW · HW2 (Sec 2.5, 2.6, 3.1)',     section: 'Autonomous · Exact · Constant coeff' },
    { href: 'hw/hw3.html',                      label: 'HW · HW3 (Sec 3.2–3.5)',           section: 'Wronskian · Complex / Repeated · Undet' },
    { href: 'hw/hw4.html',                      label: 'HW · HW4 (Sec 3.6)',               section: 'Variation of parameters' },
    { href: 'hw/hw5.html',                      label: 'HW · HW5 (Sec 7.1, 7.3–7.5)',      section: 'Systems · Eigenvalue / vector' },
    { href: 'hw/hw6.html',                      label: 'HW · HW6 (Sec 7.6, 6.1, 6.2)',     section: 'Complex eigvals · Laplace intro' },
    { href: 'hw/hw7.html',                      label: 'HW · HW7 (Sec 6.3, 6.4)',          section: 'Step function · Discontinuous forcing' },
    { href: 'hw/hw8.html',                      label: 'HW · HW8 (Sec 6.5)',               section: 'Impulse · Dirac delta' },
    { href: 'hw/hw9.html',                      label: 'HW · HW9 (Sec 6.6, 5.1–5.3)',      section: 'Convolution · Series solutions' },
  ];

  // ---------- Helpers ----------
  // Known subdirectories under the walkthrough root. When the current file
  // lives one level inside one of these, links emitted by injectLeftSidebar()
  // and injectPageNav() need a '../' prefix to reach root-level files.
  const KNOWN_SUBDIRS = ['hw', 'cram'];

  function pathPrefix() {
    const segs = window.location.pathname.split('/').filter(Boolean);
    return (segs.length >= 2 && KNOWN_SUBDIRS.includes(segs[segs.length - 2])) ? '../' : '';
  }

  function currentFile() {
    const segs = window.location.pathname.split('/').filter(Boolean);
    const last = segs[segs.length - 1] || '';
    // Trailing slash or non-html URL falls back to index
    if (!last || !last.includes('.html')) return 'index.html';
    // If in a known subdir, return the path-from-root (subdir/file.html)
    if (segs.length >= 2 && KNOWN_SUBDIRS.includes(segs[segs.length - 2])) {
      return segs.slice(-2).join('/');
    }
    return last;
  }

  // ---------- 1. Inject left sidebar ----------
  function injectLeftSidebar() {
    const aside = document.querySelector('.sidebar-left');
    if (!aside) return;
    const current = currentFile();
    const prefix = pathPrefix();
    const items = FILES.map(f => {
      const isCurrent = f.href === current;
      const cls = isCurrent ? 'current' : '';
      const sectionTag = f.section ? `<div style="font-size:0.78rem;color:var(--fg-muted);margin-top:2px">${f.section}</div>` : '';
      return `<li><a class="${cls}" href="${prefix}${f.href}">${f.label}${sectionTag}</a></li>`;
    }).join('');
    aside.innerHTML = `<h4 style="margin-top:0;font-size:0.78rem;text-transform:uppercase;letter-spacing:0.04em;color:var(--fg-muted);margin-bottom:12px">Walkthrough</h4><ul>${items}</ul>`;
  }

  // ---------- 2. Inject right sidebar (On This Page) ----------
  function injectRightSidebar() {
    const aside = document.querySelector('.sidebar-right');
    if (!aside) return;
    const headings = document.querySelectorAll('.main h2[id], .main h3[id]');
    if (headings.length === 0) {
      aside.innerHTML = '';
      return;
    }
    const items = Array.from(headings).map(h => {
      const cls = h.tagName === 'H3' ? 'toc-h3' : '';
      return `<li class="${cls}"><a href="#${h.id}" data-target="${h.id}">${h.textContent}</a></li>`;
    }).join('');
    aside.innerHTML = `<h4>On This Page</h4><ul>${items}</ul>`;
  }

  // ---------- 3. Scroll-spy via IntersectionObserver ----------
  // We track which headings are currently in the trigger band and
  // activate the topmost-in-document-order one. This avoids the bug
  // where naive "clear-all then set-active on each entry in a batch"
  // ends up picking whichever entry happens to be processed last
  // (which during fast scroll is usually the bottom one).
  function setupScrollSpy() {
    const headings = Array.from(document.querySelectorAll('.main h2[id], .main h3[id]'));
    const tocLinks = Array.from(document.querySelectorAll('.sidebar-right a[data-target]'));
    if (headings.length === 0 || tocLinks.length === 0) return;

    const linkByTarget = {};
    tocLinks.forEach(a => { linkByTarget[a.dataset.target] = a; });

    const visible = new Set();

    function recomputeActive() {
      // Find first heading (in document order) that is currently in the band.
      let activeId = null;
      for (const h of headings) {
        if (visible.has(h.id)) { activeId = h.id; break; }
      }
      // If nothing is in the band (e.g., between two headings, or at very top),
      // fall back to the most recent heading above the band.
      if (activeId === null) {
        const triggerY = window.innerHeight * 0.15;
        for (let i = headings.length - 1; i >= 0; i--) {
          if (headings[i].getBoundingClientRect().top < triggerY) {
            activeId = headings[i].id;
            break;
          }
        }
      }
      tocLinks.forEach(a => a.classList.toggle('active', a.dataset.target === activeId));
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      });
      recomputeActive();
    }, {
      rootMargin: '-15% 0px -70% 0px',  // narrow band ~15% from top of viewport
      threshold: 0,
    });

    headings.forEach(h => observer.observe(h));
    // Also recompute once on init (handles refresh in the middle of a page)
    recomputeActive();
  }

  // ---------- 4. Dark mode toggle ----------
  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    const btn = document.querySelector('.theme-toggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀️ Light' : '🌙 Dark';
  }

  function initTheme() {
    let stored = null;
    try { stored = localStorage.getItem('theme'); } catch (e) { /* blocked storage */ }
    let theme;
    if (stored === 'light' || stored === 'dark') {
      theme = stored;
    } else {
      theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark' : 'light';
    }
    applyTheme(theme);
  }

  function setupThemeToggle() {
    const btn = document.querySelector('.theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const current = document.documentElement.dataset.theme || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('theme', next); } catch (e) { /* storage blocked — apply but don't persist */ }
      applyTheme(next);
    });
  }

  // ---------- 5. Inject prev/next footer links ----------
  function injectPageNav() {
    const main = document.querySelector('.main');
    if (!main) return;
    const current = currentFile();
    const idx = FILES.findIndex(f => f.href === current);
    if (idx === -1) return;
    const prev = idx > 0 ? FILES[idx - 1] : null;
    const next = idx < FILES.length - 1 ? FILES[idx + 1] : null;
    const prefix = pathPrefix();

    const prevHtml = prev
      ? `<a class="prev" href="${prefix}${prev.href}">← ${prev.label}</a>`
      : `<span></span>`;
    const nextHtml = next
      ? `<a class="next" href="${prefix}${next.href}">${next.label} →</a>`
      : `<span></span>`;

    const footer = document.createElement('div');
    footer.className = 'page-footer';
    footer.innerHTML = `${prevHtml}${nextHtml}`;
    main.appendChild(footer);
  }

  // ---------- Entry point ----------
  function init() {
    initTheme();           // set theme BEFORE injecting UI to avoid flash
    injectLeftSidebar();
    injectRightSidebar();
    setupScrollSpy();
    setupThemeToggle();
    injectPageNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
