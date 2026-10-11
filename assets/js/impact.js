// Business impact: small diagrams that explain each outcome. No invented numbers.

import { el, link, sampler, loop, motionOK, fract } from './svg.js';

const VIS = {
  // Requests leave the queue and are resolved one after another.
  support(svg) {
    el('line', { x1: 8, y1: 32, x2: 176, y2: 32, class: 'ln' }, svg);
    el('circle', { cx: 186, cy: 32, r: 9, class: 'ac bgf' }, svg);
    el('path', { d: 'M181.5,32 l3,3 l6,-6.5', class: 'ac' }, svg);
    const items = Array.from({ length: 6 }, () => el('rect', { y: 27, width: 10, height: 10, class: 'acf' }, svg));
    return (t) => items.forEach((r, i) => {
      const u = fract(t * 0.22 + i / 6);
      r.setAttribute('x', (8 + u * 160).toFixed(1));
      r.setAttribute('opacity', Math.min(1, (1 - u) * 6, u * 10).toFixed(2));
    });
  },
  // Every touchpoint on one line, with the follow-up already scheduled.
  followup(svg) {
    el('line', { x1: 8, y1: 32, x2: 190, y2: 32, class: 'ln' }, svg);
    const kinds = ['calls', 'sms', 'whatsapp'];
    const dots = kinds.map((k, i) => el('circle', { cx: 24 + i * 50, cy: 32, r: 5, class: `ch-${k}` }, svg));
    const ring = el('circle', { cx: 178, cy: 32, r: 8, class: 'ac dash bgf' }, svg);
    el('circle', { cx: 178, cy: 32, r: 3, class: 'acf' }, svg);
    return (t) => {
      const k = Math.floor(fract(t * 0.35) * 4);
      dots.forEach((d, i) => d.setAttribute('r', i === k ? 6.5 : 4.5));
      ring.setAttribute('r', (k === 3 ? 11 : 8).toString());
    };
  },
  // Four separate threads merge into one.
  unified(svg) {
    const ys = [8, 24, 40, 56];
    const kinds = ['calls', 'sms', 'whatsapp', 'ai'];
    const paths = ys.map((y) => el('path', { d: link([6, y], [1, 0], [120, 32], [-1, 0], 0.55), class: 'ln2' }, svg));
    el('line', { x1: 120, y1: 32, x2: 194, y2: 32, class: 'ac' }, svg);
    el('circle', { cx: 120, cy: 32, r: 3.5, class: 'acf' }, svg);
    const s = paths.map((p) => sampler(p, 40));
    const dots = kinds.map((k) => el('circle', { r: 3, class: `ch-${k}` }, svg));
    return (t) => dots.forEach((d, i) => {
      const u = fract(t * 0.4 + i * 0.25);
      const [x, y] = u < 0.62 ? s[i](u / 0.62) : [120 + ((u - 0.62) / 0.38) * 74, 32];
      d.setAttribute('cx', x.toFixed(1));
      d.setAttribute('cy', y.toFixed(1));
    });
  },
  // A sweep marks which steps run automatically and which stay with people.
  workflow(svg) {
    el('line', { x1: 12, y1: 32, x2: 188, y2: 32, class: 'ln' }, svg);
    const auto = [true, true, false, true, true, false];
    const nodes = auto.map((a, i) => el('rect', { x: 8 + i * 34, y: 25, width: 14, height: 14, class: 'ln2 bgf' }, svg));
    const bar = el('rect', { x: 8, y: 48, height: 2, width: 0, class: 'acf' }, svg);
    return (t) => {
      const u = fract(t * 0.25);
      bar.setAttribute('width', (u * 184).toFixed(1));
      nodes.forEach((n, i) => n.setAttribute('class', (auto[i] && u * 6 > i ? 'acf' : 'ln2 bgf')));
    };
  },
};

export function initImpact(section) {
  section.querySelectorAll('[data-vis]').forEach((svg) => {
    svg.setAttribute('viewBox', '0 0 200 64');
    const draw = VIS[svg.dataset.vis](svg);
    loop(svg, (t) => draw(motionOK() ? t : 2.6));
  });

  const counter = section.querySelector('[data-count]');
  if (counter && motionOK()) {
    // The figure counts up as it scrolls into view (and back down if you scroll back).
    const n = { v: 1 };
    gsap.to(n, {
      v: 10, ease: 'none',
      scrollTrigger: { trigger: counter, start: 'top 90%', end: 'top 45%', scrub: 0.4 },
      onUpdate: () => { counter.textContent = Math.round(n.v); },
    });
  }

  if (motionOK()) {
    // Each outcome row slides in with the scroll, parts staggered.
    section.querySelectorAll('.outcome').forEach((row) => {
      gsap.from(row.children, {
        x: (i) => 60 + i * 30, autoAlpha: 0, ease: 'none', stagger: 0.08,
        scrollTrigger: { trigger: row, start: 'top 98%', end: 'top 62%', scrub: 0.5 },
      });
    });
  }
}
