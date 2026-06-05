# MATH 20D — Differential Equations · HTML Walkthrough

UCSD Spring 2026 self-study walkthrough for MATH 20D (Differential Equations), built as a pure static HTML site.

**Live site:** https://ze-f.github.io/20D_html/

## What's here

- **Concept walkthrough** (Chinese narrative + English technical terms) covering the entire course in the professor's lecture order:
  - `01-foundations.html` — §1.1, 1.3 (classification, direction fields)
  - `02-first-order.html` — §2.1, 2.2, 2.4, 2.5, 2.6
  - `03-homog-second-order.html` — §3.1, 3.2, 3.3, 3.4
  - `04-nonhomog-second-order.html` — §3.5, 3.6 (undetermined coefficients, variation of parameters)
  - `05-systems-theory.html` — §7.1, 7.2, 7.3, 7.4
  - `06-systems-methods.html` — §7.5, 7.6
  - `07-laplace-basics.html` — §6.1, 6.2
  - `08-laplace-discontinuous.html` — §6.3, 6.4, 6.5, 6.6
  - `09-series-solutions.html` — §5.1, 5.2, 5.3
- **Per-HW walkthroughs** (`hw/hw1.html` – `hw/hw9.html`) — problem-by-problem solutions.
- **Midterm 2 review** (`mt2-01` … `mt2-05`) — application-oriented review pages.

## Tech stack

Pure HTML + CSS + JS, no build step. KaTeX 0.16.x is bundled offline in `assets/katex/`. A single shared `style.css` and `nav.js` drive the three-column layout, dark-mode toggle, and sticky sidebars.

## How to read locally

Double-click `index.html`. If math renders in a wrong-looking serif font (Chrome `file://` font CORS issue):

- Open in Safari (most permissive), **or**
- Run a local server: `python3 -m http.server 8000`, then visit `http://localhost:8000/`.
