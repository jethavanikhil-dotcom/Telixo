// High animation depth: scroll-driven sections, kinetic type and a
// magnetic cursor ring. Everything here is skipped for reduced motion.

import { motionOK } from './svg.js';

export function initMotion({ channels }) {
  if (!motionOK()) return null;
  document.documentElement.classList.add('motion-high');

  let jumpToChannel = null;

  gsap.matchMedia().add('(min-width: 900px)', () => {
    // Channels: scrolling through the section selects each channel in turn.
    const scroller = document.querySelector('.channels-scroll');
    channels.takeOver();
    const st = ScrollTrigger.create({
      trigger: scroller, start: 'top top+=68', end: 'bottom bottom',
      onUpdate: (self) => channels.select(Math.min(channels.count - 1, Math.floor(self.progress * channels.count))),
    });
    jumpToChannel = (i) => {
      const target = st.start + (st.end - st.start) * ((i + 0.5) / channels.count);
      window.scrollTo({ top: target, behavior: 'smooth' });
    };

    // Hero: headline lines drift apart as the hero scrolls away.
    gsap.to('.hero .h1 .line', {
      x: (i) => -14 - i * 34, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.5 },
    });
    gsap.to('.hero-copy', {
      y: -70, opacity: 0.25, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: '20% top', end: 'bottom top', scrub: 0.5 },
    });

    // Final CTA: lines slide in from the right with the scroll.
    gsap.from('.cta .h1 .line', {
      x: (i) => 90 + i * 50, ease: 'none',
      scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'center 60%', scrub: 0.6 },
    });

    return () => { jumpToChannel = null; };
  });

  // Section headings float slightly slower than the page.
  gsap.utils.toArray('.section-head, .impact-head').forEach((h) => {
    gsap.fromTo(h, { y: 36 }, {
      y: -24, ease: 'none',
      scrollTrigger: { trigger: h, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  // Footer wordmark rises and tightens.
  gsap.fromTo('.wordmark', { yPercent: 40, letterSpacing: '0.02em' }, {
    yPercent: 0, letterSpacing: '-0.07em', ease: 'none',
    scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: 0.6 },
  });

  initCursor();
  return { jumpToChannel: (i) => jumpToChannel?.(i) };
}

// A ring that trails the cursor and grows over anything clickable.
function initCursor() {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  ring.setAttribute('aria-hidden', 'true');
  document.body.appendChild(ring);
  const x = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3.out' });
  const y = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3.out' });
  window.addEventListener('pointermove', (e) => {
    x(e.clientX); y(e.clientY);
    ring.classList.add('is-on');
  }, { passive: true });
  document.addEventListener('pointerleave', () => ring.classList.remove('is-on'));
  const HOVER = 'a, button, [role="tab"], label, input, summary';
  const DRAG = '.webgl .hero-art, .webgl .cta-art';
  document.addEventListener('pointerover', (e) => {
    const drag = e.target.closest(DRAG);
    ring.classList.toggle('is-drag', !!drag);
    ring.classList.toggle('is-hover', !drag && !!e.target.closest(HOVER));
  });
  document.addEventListener('pointerdown', () => ring.classList.add('is-press'));
  document.addEventListener('pointerup', () => ring.classList.remove('is-press'));
}
