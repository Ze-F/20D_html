/* ============================================================
   MATH 20D Walkthrough — Interactive plot library
   Vanilla JS, no dependencies. Renders SVG plots with:
     - Multiple curves (solid or faded)
     - Impulse arrows (vertical, optional sign)
     - Auto axes + ticks + zero line
     - Hover crosshair with (t, y) readout
     - Optional slider control for parameterized plots

   API:
     const plot = new Plot(svgEl, {
       xRange: [0, 8],
       yRange: 'auto' | [ymin, ymax],
       xLabel: 't', yLabel: 'y',
       caption: 'optional caption text',
     });
     plot.addCurve(t => Math.sin(t));            // main curve
     plot.addImpulse(Math.PI, 1);                // impulse at t=π, magnitude +1
     plot.render();

   For sliders, use Plot.bindSlider(plot, sliderEl, readoutEl, rebuildFn).
   ============================================================ */

(function (window) {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';

  function el(tag, attrs) {
    const e = document.createElementNS(SVG_NS, tag);
    if (attrs) {
      for (const k in attrs) {
        if (attrs[k] != null) e.setAttribute(k, attrs[k]);
      }
    }
    return e;
  }

  // Compute "nice" tick step for a range, targeting ~5–8 ticks
  function niceStep(span, target = 6) {
    const raw = span / target;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const norm = raw / mag;
    let step;
    if (norm < 1.5) step = 1;
    else if (norm < 3) step = 2;
    else if (norm < 7) step = 5;
    else step = 10;
    return step * mag;
  }

  // Build a path "d" string from sampled (t, y) values, splitting where y is
  // discontinuous (jump > threshold) so we get hard step-like edges instead of
  // diagonal connections through the jump.
  function pathFromSamples(samples, xPx, yPx, jumpThreshold) {
    let d = '';
    let inSegment = false;
    for (let i = 0; i < samples.length; i++) {
      const { t, y } = samples[i];
      if (!isFinite(y)) { inSegment = false; continue; }
      const px = xPx(t), py = yPx(y);
      if (!inSegment) {
        d += `M ${px.toFixed(2)} ${py.toFixed(2)} `;
        inSegment = true;
      } else {
        // Detect jump: break the path
        if (jumpThreshold != null && i > 0 && isFinite(samples[i-1].y)) {
          const dy = Math.abs(y - samples[i-1].y);
          if (dy > jumpThreshold) {
            d += `M ${px.toFixed(2)} ${py.toFixed(2)} `;
            continue;
          }
        }
        d += `L ${px.toFixed(2)} ${py.toFixed(2)} `;
      }
    }
    return d;
  }

  class Plot {
    constructor(svgEl, opts = {}) {
      this.svg = svgEl;
      this.xRange = opts.xRange || [0, 10];
      this.yRange = opts.yRange || 'auto';
      this.xLabel = opts.xLabel || 't';
      this.yLabel = opts.yLabel || 'y';
      this.caption = opts.caption || null;
      this.width = opts.width || 720;
      this.height = opts.height || 280;
      this.padding = { l: 50, r: 16, t: 14, b: 32 };
      this.samples = opts.samples || 600;
      this.jumpThreshold = opts.jumpThreshold ?? null;
      this.curves = [];
      this.impulses = [];

      // Configure SVG viewBox
      svgEl.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
      svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      svgEl.classList.add('plot-svg');
    }

    addCurve(fn, opts = {}) {
      this.curves.push({ fn, faded: !!opts.faded, label: opts.label || null });
      return this;
    }

    addImpulse(t, magnitude = 1, opts = {}) {
      this.impulses.push({ t, magnitude, faded: !!opts.faded });
      return this;
    }

    clear() {
      this.curves = [];
      this.impulses = [];
      return this;
    }

    xPx(t) {
      const { l, r } = this.padding;
      return l + (t - this.xRange[0]) * (this.width - l - r) / (this.xRange[1] - this.xRange[0]);
    }
    yPx(y) {
      const { t, b } = this.padding;
      return this.height - b - (y - this.yRange[0]) * (this.height - t - b) / (this.yRange[1] - this.yRange[0]);
    }

    computeYRange() {
      let ymin = Infinity, ymax = -Infinity;
      for (const c of this.curves) {
        for (let i = 0; i <= this.samples; i++) {
          const t = this.xRange[0] + i * (this.xRange[1] - this.xRange[0]) / this.samples;
          const y = c.fn(t);
          if (isFinite(y)) {
            if (y < ymin) ymin = y;
            if (y > ymax) ymax = y;
          }
        }
      }
      // Account for impulse arrow heights (visual ~unit height)
      for (const imp of this.impulses) {
        if (imp.magnitude > 0) ymax = Math.max(ymax, imp.magnitude);
        else ymin = Math.min(ymin, imp.magnitude);
      }
      if (!isFinite(ymin) || !isFinite(ymax)) { ymin = -1; ymax = 1; }
      if (ymax - ymin < 0.5) { const c = (ymin + ymax) / 2; ymin = c - 0.5; ymax = c + 0.5; }
      const pad = 0.12 * (ymax - ymin);
      return [ymin - pad, ymax + pad];
    }

    drawAxes() {
      const { l, r, t, b } = this.padding;
      const x0 = l, x1 = this.width - r;
      const y0 = this.height - b, y1 = t;

      // Outer frame: bottom + left axis
      this.svg.appendChild(el('line', { class: 'plot-axis', x1: x0, y1: y0, x2: x1, y2: y0 }));
      this.svg.appendChild(el('line', { class: 'plot-axis', x1: x0, y1: y0, x2: x0, y2: y1 }));

      // X ticks
      const xStep = niceStep(this.xRange[1] - this.xRange[0]);
      const xStart = Math.ceil(this.xRange[0] / xStep) * xStep;
      for (let v = xStart; v <= this.xRange[1] + 1e-9; v += xStep) {
        const px = this.xPx(v);
        this.svg.appendChild(el('line', { class: 'plot-tick', x1: px, y1: y0, x2: px, y2: y0 + 4 }));
        // X grid (light)
        this.svg.appendChild(el('line', { class: 'plot-grid', x1: px, y1: y0, x2: px, y2: y1 }));
        const label = el('text', { class: 'plot-tick-label', x: px, y: y0 + 16, 'text-anchor': 'middle' });
        label.textContent = formatTick(v);
        this.svg.appendChild(label);
      }

      // Y ticks
      const yStep = niceStep(this.yRange[1] - this.yRange[0]);
      const yStart = Math.ceil(this.yRange[0] / yStep) * yStep;
      for (let v = yStart; v <= this.yRange[1] + 1e-9; v += yStep) {
        const py = this.yPx(v);
        this.svg.appendChild(el('line', { class: 'plot-tick', x1: x0 - 4, y1: py, x2: x0, y2: py }));
        this.svg.appendChild(el('line', { class: 'plot-grid', x1: x0, y1: py, x2: x1, y2: py }));
        const label = el('text', { class: 'plot-tick-label', x: x0 - 7, y: py + 4, 'text-anchor': 'end' });
        label.textContent = formatTick(v);
        this.svg.appendChild(label);
      }

      // Zero line (if 0 is in y range)
      if (this.yRange[0] < 0 && this.yRange[1] > 0) {
        const py = this.yPx(0);
        this.svg.appendChild(el('line', { class: 'plot-zero-line', x1: x0, y1: py, x2: x1, y2: py }));
      }

      // Axis labels
      const xL = el('text', { class: 'plot-axis-label', x: x1, y: y0 + 26, 'text-anchor': 'end' });
      xL.textContent = this.xLabel;
      this.svg.appendChild(xL);
      const yL = el('text', { class: 'plot-axis-label', x: x0 + 6, y: y1 + 4, 'text-anchor': 'start' });
      yL.textContent = this.yLabel;
      this.svg.appendChild(yL);
    }

    drawImpulse(imp) {
      const px = this.xPx(imp.t);
      const baseY = this.yPx(0);
      const tipY = this.yPx(imp.magnitude);
      const lineCls = imp.faded ? 'plot-impulse-line-faded' : 'plot-impulse-line';
      const headCls = imp.faded ? 'plot-impulse-head-faded' : 'plot-impulse-head';
      // Vertical line from y=0 to y=magnitude
      this.svg.appendChild(el('line', { class: lineCls, x1: px, y1: baseY, x2: px, y2: tipY }));
      // Arrowhead — small triangle pointing in the direction of the impulse
      const dir = imp.magnitude >= 0 ? -1 : 1;  // arrow points away from baseline (up if positive)
      const headSize = 6;
      const p1x = px, p1y = tipY;
      const p2x = px - 4, p2y = tipY - dir * headSize;
      const p3x = px + 4, p3y = tipY - dir * headSize;
      this.svg.appendChild(el('polygon', {
        class: headCls,
        points: `${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y}`,
      }));
    }

    drawCurve(c) {
      const cls = c.faded ? 'plot-curve-faded' : 'plot-curve';
      const samples = [];
      for (let i = 0; i <= this.samples; i++) {
        const t = this.xRange[0] + i * (this.xRange[1] - this.xRange[0]) / this.samples;
        samples.push({ t, y: c.fn(t) });
      }
      const d = pathFromSamples(samples, t => this.xPx(t), y => this.yPx(y), this.jumpThreshold);
      this.svg.appendChild(el('path', { class: cls, d }));
    }

    setupHover() {
      if (this.curves.length === 0) return;
      const { l, r, t, b } = this.padding;
      const mainCurve = this.curves.find(c => !c.faded) || this.curves[0];

      const hLine = el('line', { class: 'plot-hover-line', x1: 0, y1: t, x2: 0, y2: this.height - b });
      const hDot = el('circle', { class: 'plot-hover-dot', cx: 0, cy: 0, r: 3.5 });
      const readoutBg = el('rect', { class: 'plot-hover-readout-bg', x: 0, y: 0, width: 0, height: 0, rx: 3 });
      const readout = el('text', { class: 'plot-hover-readout', x: 0, y: 0 });
      this.svg.appendChild(hLine);
      this.svg.appendChild(readoutBg);
      this.svg.appendChild(readout);
      this.svg.appendChild(hDot);

      const updateAtX = (clientPx) => {
        const rect = this.svg.getBoundingClientRect();
        const scale = this.width / rect.width;
        const xPxLocal = (clientPx - rect.left) * scale;
        if (xPxLocal < l || xPxLocal > this.width - r) return;
        // Reverse xPx to data t
        const tData = this.xRange[0] + (xPxLocal - l) * (this.xRange[1] - this.xRange[0]) / (this.width - l - r);
        const yData = mainCurve.fn(tData);
        const yPxLocal = isFinite(yData) ? this.yPx(yData) : this.yPx(0);
        hLine.setAttribute('x1', xPxLocal);
        hLine.setAttribute('x2', xPxLocal);
        hDot.setAttribute('cx', xPxLocal);
        hDot.setAttribute('cy', yPxLocal);
        // Readout
        const txt = `t = ${tData.toFixed(2)},  y = ${isFinite(yData) ? yData.toFixed(3) : '—'}`;
        readout.textContent = txt;
        // Position readout: top of plot, right of crosshair (or left if near right edge)
        const textWidth = txt.length * 6.6;  // estimate
        const bgPad = 4;
        let rx = xPxLocal + 8;
        if (rx + textWidth + 2 * bgPad > this.width - r) rx = xPxLocal - 8 - textWidth - 2 * bgPad;
        const ry = t + 4;
        readoutBg.setAttribute('x', rx - bgPad);
        readoutBg.setAttribute('y', ry);
        readoutBg.setAttribute('width', textWidth + 2 * bgPad);
        readoutBg.setAttribute('height', 18);
        readout.setAttribute('x', rx);
        readout.setAttribute('y', ry + 13);
      };

      this.svg.addEventListener('mousemove', e => updateAtX(e.clientX));
      this.svg.addEventListener('touchmove', e => {
        if (e.touches.length > 0) updateAtX(e.touches[0].clientX);
      }, { passive: true });
    }

    render() {
      if (this.yRange === 'auto') this.yRange = this.computeYRange();
      while (this.svg.firstChild) this.svg.removeChild(this.svg.firstChild);
      this.drawAxes();
      for (const imp of this.impulses) this.drawImpulse(imp);
      for (const c of this.curves) this.drawCurve(c);
      this.setupHover();
      return this;
    }
  }

  function formatTick(v) {
    if (Math.abs(v) < 1e-10) return '0';
    // Show as integer multiples of π when close
    const pi = Math.PI;
    const ratio = v / pi;
    if (Math.abs(ratio - Math.round(ratio)) < 0.01 && Math.abs(ratio) >= 0.5) {
      const k = Math.round(ratio);
      if (k === 1) return 'π';
      if (k === -1) return '−π';
      return `${k}π`;
    }
    // Else decimal
    if (Math.abs(v) >= 100) return v.toFixed(0);
    if (Math.abs(v) >= 10) return v.toFixed(1);
    return v.toFixed(2).replace(/\.?0+$/, '');
  }

  /** Bind a slider element to a plot rebuild function.
   *  rebuildFn(value) is called on slider change; it should reconfigure
   *  the plot (clear + add curves/impulses) and return the readout text.
   */
  function bindSlider(slider, readoutEl, rebuildFn) {
    const update = () => {
      const v = +slider.value;
      const text = rebuildFn(v);
      if (readoutEl) readoutEl.textContent = text;
    };
    slider.addEventListener('input', update);
    update();
  }

  window.Plot = Plot;
  window.bindSlider = bindSlider;
})(window);
