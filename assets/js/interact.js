// Interactive vector details: cursor-reactive dot fields behind white
// sections, and buttons that lean towards the cursor.

import { motionOK } from './svg.js';

export function initDotFields(selector) {
  if (!motionOK() || !window.matchMedia('(pointer: fine)').matches) return;
  document.querySelectorAll(selector).forEach((section) => {
    const canvas = document.createElement('canvas');
    canvas.className = 'dotfield';
    canvas.setAttribute('aria-hidden', 'true');
    section.prepend(canvas);
    const ctx = canvas.getContext('2d');
    const GAP = 26;
    let w = 0, h = 0, dpr = 1, dots = [];
    const mouse = { x: -999, y: -999, s: 0, target: 0 };
    let visible = false;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = section.offsetWidth;
      h = section.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      dots = [];
      for (let y = GAP / 2; y < h; y += GAP) for (let x = GAP / 2; x < w; x += GAP) dots.push([x, y]);
    }
    new ResizeObserver(resize).observe(section);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(section);
    section.addEventListener('pointermove', (e) => {
      const r = section.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.target = 1;
    });
    section.addEventListener('pointerleave', () => { mouse.target = 0; });

    let idle = 0;
    gsap.ticker.add(() => {
      if (!visible) return;
      mouse.s += (mouse.target - mouse.s) * 0.08;
      if (mouse.s < 0.002 && mouse.target === 0) { if (idle++ > 2) return; } else idle = 0;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const R = 170;
      for (const [x, y] of dots) {
        const dx = x - mouse.x, dy = y - mouse.y;
        const d = Math.hypot(dx, dy);
        const f = d < R ? (1 - d / R) ** 2 * mouse.s : 0;
        const px = x + (dx / (d || 1)) * f * 14;
        const py = y + (dy / (d || 1)) * f * 14;
        ctx.fillStyle = f > 0.02 ? `rgba(66,91,255,${(0.25 + f * 0.75).toFixed(3)})` : 'rgba(152,162,179,0.32)';
        ctx.beginPath();
        ctx.arc(px, py, 1.05 + f * 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  });
}

export function initMagnetic(selector) {
  if (!motionOK() || !window.matchMedia('(pointer: fine)').matches) return;
  document.querySelectorAll(selector).forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.28);
      yTo((e.clientY - r.top - r.height / 2) * 0.4);
    });
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}
