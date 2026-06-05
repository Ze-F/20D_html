# MATH 20D Walkthrough — Style Guide

This is the contract for all Phase 3 content files (`02-first-order.html` through `08-laplace-discontinuous.html`). The finalized `01-foundations.html` is the canonical exemplar — mimic it. When in doubt, read 01 and copy.

---

## 1. Language pattern

### The rule
- **Prose/narrative**: Chinese.
- **Technical terms**: English, inline within Chinese sentences. **Never** translate.
- **Flow priority**: when borderline, English usually wins.

### Always English, no exceptions
`ODE`, `PDE`, `derivative`, `order`, `linear`, `nonlinear`, `homogeneous`, `nonhomogeneous`, `coefficient`, `constant`, `polynomial`, `continuous`, `differentiable`, `function`, `equation`, `solution`, `general solution`, `particular solution`, `initial condition`, `initial value problem` (IVP), `existence`, `uniqueness`, `eigenvalue`, `eigenvector`, `Wronskian`, `characteristic equation`, `superposition`, `Laplace transform`, `forcing function`, `phase line`, `phase plane`, `equilibrium`, `stable`, `unstable`, `direction field`, `slope field`, `domain`, `interval`, `convergence`, `divergence`, `integrating factor`, `separable`, `exact`, `autonomous`, `system`, `matrix`, `vector`, `inverse`, `transpose`, `step function`, `unit impulse`, `Dirac delta`, `convolution`, `power series`, `recurrence`, `radius of convergence`.

### Acceptable Chinese narrative phrases
"考虑", "我们想", "因此", "这意味着", "举个例子", "如下", "也就是说", "下面看一个例子", "解出", "代入", "整理得", "由此可见", "更进一步", "需要注意", "回顾一下"…

### Example sentences (target voice)
> 考虑一个 first-order linear ODE: $y' + p(t)y = g(t)$。我们想找到 general solution——也就是包含 arbitrary constant 的解族。

> 由 $L$ 的 linearity（即 $L(\alpha y_1 + \beta y_2) = \alpha Ly_1 + \beta Ly_2$），得 $L(\alpha y_1 + \beta y_2) = 0$。

> Nonlinear ODEs 不满足叠加原理，所以没有这套 machinery，通常只能做数值计算或定性分析。

### Tone
Friendly textbook-explainer. Show *why*, not just *how*. Address common confusion proactively ("这里容易混淆", "注意区分"). Avoid lecture-stiff register; avoid corporate fluff.

---

## 2. File structure

Every content file's `<main>` should follow this skeleton:

```
<h1>NN. Page Title</h1>
<p class="note">Textbook sections X.Y &amp; X.Z &nbsp;·&nbsp; UCSD MATH 20D Spring 2026</p>

<section><h2 id="notation">Notation</h2>...</section>

<section><h2 id="topic-1-kebab">主题 1</h2>
  <h3 id="subtopic-1a">...</h3>
  ...
</section>

<section><h2 id="topic-2-kebab">主题 2</h2>...</section>

...

<section><h2 id="summary">Summary</h2>
  <h3 id="key-points">本节要点</h3>
  <h3 id="looking-ahead">Looking Ahead</h3>
</section>
```

### Rules
- **Always start with a Notation section** declaring this file's conventions (which variable is independent, prime notation, etc.). Match prof's notation for the sections you cover. 2–4 paragraphs is typical.
- **Every `<h2>` and `<h3>` must have `id="..."`** (kebab-case English, e.g., `id="undetermined-coefficients"`). The right-sidebar TOC depends on this.
- **Wrap each major topic in `<section>`** for semantic grouping.
- **End with a Summary section** containing `key-points` and `looking-ahead` subheadings. Looking-ahead bridges to the next file.
- **Don't touch** `<head>`, `<header class="app-header">`, `<aside class="sidebar-left">`, `<aside class="sidebar-right">`, or closing tags.

---

## 3. Box types — when and how

### Markup pattern (consistent across all 4 types)
```html
<div class="box intuition">
  <p class="box-title">💡 Intuition — short subtitle</p>
  <p>...prose, can be multiple paragraphs separated by <br><br> inside one <p>, or by multiple <p> tags...</p>
</div>
```
Replace `intuition` with `deeper`, `warning`, or `example`. Box-title format: `EMOJI Type — short subtitle`.

### When to use each

| Box | Density | Purpose | Length |
|---|---|---|---|
| 💡 Intuition | ~1 per major concept (every other H2 typically) | Geometric/physical intuition; "what to picture"; analogies; *why* a definition takes this form | 3–8 sentences; often a vivid metaphor + concrete example |
| 📖 Deeper | ~1 per major method or theory | Textbook-sourced derivation, method comparison, formal proof prof skipped, forward-pointer to later chapters | 4–12 sentences |
| ⚠️ Warning | opportunistic | Common confusions, "X ≠ Y", easy-to-make mistakes, edge cases | 2–5 sentences; often with a contrasting bullet list |
| 📝 Example | every prof example MUST appear + 1–2 textbook examples added when prof's coverage thin | A complete worked example | Statement → solution → optional remark |

### Targets per file
| Coverage | Min boxes (rough) |
|---|---|
| 2 sections of prof notes | ≥3 intuition, ≥1 deeper, ≥1 warning, ≥3 example |
| 4 sections | ≥5 intuition, ≥2 deeper, ≥2 warning, ≥6 example |
| 5–6 sections | ≥6 intuition, ≥3 deeper, ≥2 warning, ≥10 example |

Don't pad — these are floors not ceilings. Skip a box if a section genuinely doesn't need one.

---

## 4. Definition / Theorem markup

Definitions and theorems appear FREQUENTLY (~5–15 per file). They use lightweight inline blocks, NOT full boxes, to keep visual noise down:

```html
<div class="def">
  <span class="def-label">Definition (name).</span>
  Statement in Chinese narrative with English terms inline. Math via $...$ or $$...$$.
</div>

<div class="thm">
  <span class="thm-label">Theorem (name).</span>
  Statement.
  <br><br>
  <em>Proof.</em> Optional proof sketch.
  $$...optional display math...$$
  $\square$
</div>
```

- `def-label` uses **bold**, `thm-label` uses ***bold italic***.
- The label name (in parens) should be the English technical term: `Definition (linear ODE)`, `Theorem (Existence-Uniqueness)`, `Theorem (Wronskian and linear independence)`, etc.
- Proof sketches inside `thm` end with `$\square$` (q.e.d. symbol).

---

## 5. Math syntax

### Delimiters
- **Inline**: `$...$`
- **Display**: `$$...$$` — **bare**, NOT wrapped in `<p>`:
  ```html
  <div class="def">
    <span class="def-label">Definition.</span>
    $$y' + p(t)y = g(t)$$
  </div>
  ```
  When display math is inside a `<p>` mixed with prose, that's fine (prose `<p>` legitimately contains math).

### Multi-line equations
**Always** `\begin{aligned}...\end{aligned}` inside `$$...$$`. **Never** `\begin{align}` (KaTeX doesn't support it):
```
$$\begin{aligned}
y' &= 3y \\
y(0) &= 1
\end{aligned}$$
```

Use `\\` for line breaks, `&` for alignment.

### Common LaTeX vocabulary you'll need
- Fractions: `\dfrac{a}{b}` (display style, looks better in `$...$`) vs `\frac{a}{b}` (auto-sized)
- Roots: `\sqrt{x}`, `\sqrt[n]{x}`
- Powers/subscripts: `y^{(n)}`, `a_{n-1}`
- Special functions: `\sin`, `\cos`, `\tan`, `\exp`, `\ln`, `\log`
- Greek: `\alpha`, `\beta`, `\theta`, `\lambda`, `\omega`, `\Omega`, `\Phi`
- Operators: `\cdot`, `\times`, `\equiv`, `\neq`, `\leq`, `\geq`, `\approx`, `\to`, `\Rightarrow`, `\Leftrightarrow`
- Sets/spaces: `\mathbb{R}`, `\mathbb{C}`, `\in`, `\subseteq`, `\subset`, `\forall`, `\exists`
- Differential operators: `\partial`, `\nabla`, `\dfrac{d}{dt}`, `\dfrac{\partial}{\partial t}`
- Vectors/matrices: `\mathbf{x}`, `\vec{x}`, `\begin{pmatrix}a&b\\c&d\end{pmatrix}`, `\det`

---

## 6. Example numbering

Every `📝 Example` box title uses the format:

```
📝 Example A.B.N — Short descriptor as a noun phrase
```

- `A.B` = textbook section (e.g., `2.4`, `7.5`)
- `N` = running count within that section. Use prof's numbering when prof's notes number examples explicitly; otherwise number sequentially starting from 1.
- Descriptor is a **noun phrase**, not a verb phrase: `Diffusion equation`, `Pendulum`, `Verification of $y=e^t$` (not `Verify $y=e^t$`).
- For examples NOT in prof notes (textbook-sourced additions): append ` (supplementary)`. E.g., `📝 Example 2.4.4 — Lipschitz failure on a strip (supplementary)`.

---

## 7. HTML utility classes available

These are defined in `assets/style.css`. Use them instead of inline styles:

| Class | Use |
|---|---|
| `note` | Muted small text (subtitle, page meta, footnotes inside content). `<p class="note">...</p>` |
| `data-table` | Any data table (direction field tables, eigenvalue tables, comparison tables). `<table class="data-table"><tr><th>...` — no inline border styles. |

**Don't introduce new inline styles** for repeated patterns. If you need a new utility and 01 doesn't already have it, flag it in your final report rather than inventing inline-styled ad-hoc.

---

## 8. Section-by-section length targets

These are guidelines, not strict ceilings. Aim for ~2-2.5× the prof notes' Chinese-character equivalent (about 1000 Chinese chars per prof PDF page when fully translated and expanded with intuition).

| File | Prof notes pages | Target Chinese chars |
|---|---:|---:|
| 02-first-order | 27 | ~15,000–20,000 |
| 03-homog-second-order | 14 | ~9,000–12,000 |
| 04-nonhomog-second-order | 13 | ~8,000–11,000 |
| 05-systems-theory | 13 | ~8,000–11,000 |
| 06-systems-methods | 13 | ~8,000–11,000 |
| 07-laplace-basics | 13 | ~8,000–11,000 |
| 08-laplace-discontinuous | 13 | ~8,000–11,000 |

(File 01 hit ~4,500 for 4pp; same ratio applies.)

Verify with:
```bash
python3 -c "s=open('FILE').read(); print(sum(1 for c in s if '一' <= c <= '鿿'))"
```

---

## 9. Forbidden patterns (will fail review)

| Pattern | Why | Fix |
|---|---|---|
| `齐次`, `通解`, `阶`, `线性的`, `二阶导` etc. (translated terms) | Per spec §6: never translate | Use English term |
| `<p>$$...$$</p>` (pure display math wrapped in `<p>`) | HTML5 semantics + inconsistency with 01 | Unwrap: bare `$$...$$` |
| `<table style="border-collapse:...">` (inline table styles) | Pattern duplication; CSS class exists | `<table class="data-table">` |
| `<p style="color:var(--fg-muted);font-size:...">` (inline muted styles) | Pattern duplication; CSS class exists | `<p class="note">` |
| `\begin{align}` | KaTeX doesn't support this; renders broken | `\begin{aligned}` inside `$$...$$` |
| `<h2>` without `id="..."` | Breaks right-sidebar TOC | Add `id` |
| Touching `<head>`, `<header>`, `<aside>`, closing tags | Breaks layout/nav | Only modify inside `<main>` |
| Verb-phrase example titles (`Verify $y=...$`) | Pattern break from 01's noun phrases | `Verification of $y=...$` |
| Filling in the `<aside>` containers with content | nav.js injects sidebars at runtime | Leave `<aside>` empty with comment |

---

## 10. Cross-file references

Use English nouns: "见 File 02 (Sec 2.4)", "later in this file we'll see…", "by the Existence-Uniqueness Theorem in File 02", "as discussed in §direction-fields above". Don't use file numbers without context ("see 02"), and avoid forward refs to chapters that aren't published yet (e.g., don't reference File 09 / Ch 5 except as Looking Ahead).

---

## 11. Quick checklist before submitting

- [ ] Every `<h2>` and `<h3>` has a kebab-case `id`
- [ ] Notation section present at top
- [ ] Summary section at bottom (with key-points + looking-ahead)
- [ ] Box density meets targets for file's section count
- [ ] All prof examples present (`📝 Example A.B.N`); supplementary examples tagged
- [ ] Multi-line math uses `\begin{aligned}`
- [ ] No display math wrapped in `<p>`
- [ ] Tables use `class="data-table"`; muted notes use `class="note"`
- [ ] No translated technical terms (grep for `齐次|通解|线性的|二阶导|一阶 ODE`)
- [ ] `<aside>` containers left empty
- [ ] Chinese char count within target range

---

## Reference exemplar

Re-read `01-foundations.html` whenever in doubt. Specific patterns worth observing:
- How the Notation section motivates conventions before listing them (`01-foundations.html` lines 56–87)
- How an Intuition box uses a physical analogy + concise verbal picture (lines 130–138)
- How a Warning box uses bullet contrast (lines 151–159)
- How a Theorem block ends with `$\square$` (line 197)
- How Examples use a `<strong>Solution:</strong>` lead-in within the box body to separate statement from work
