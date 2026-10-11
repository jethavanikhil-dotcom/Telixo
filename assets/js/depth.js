// Depth for the 2D sections: product UI and diagrams settle out of perspective
// as they scroll in, and the channel map tilts towards the cursor.

import { motionOK } from './svg.js';

export function initDepth() {
  if (!motionOK()) return;

  gsap.matchMedia().add('(min-width: 900px)', () => {
    gsap.fromTo('.app', { rotateX: 26, scale: 0.9, y: 40, transformPerspective: 1800, transformOrigin: '50% 0%' }, {
      rotateX: 0, scale: 1, y: 0, ease: 'none',
      scrollTrigger: { trigger: '#inbox', start: 'top 90%', end: 'top 5%', scrub: 0.6 },
    });
    gsap.fromTo('.wf-graph', { rotateX: 22, transformPerspective: 1600, transformOrigin: '50% 100%' }, {
      rotateX: 0, ease: 'none',
      scrollTrigger: { trigger: '.wf-scroll', start: 'top 95%', end: 'top 20%', scrub: 0.6 },
    });

    const map = document.querySelector('.channel-visual');
    gsap.set(map, { transformPerspective: 1400 });
    const rx = gsap.quickTo(map, 'rotateX', { duration: 0.8, ease: 'power3.out' });
    const ry = gsap.quickTo(map, 'rotateY', { duration: 0.8, ease: 'power3.out' });
    const move = (e) => {
      const r = map.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * 10);
      rx(-((e.clientY - r.top) / r.height - 0.5) * 8);
    };
    const reset = () => { rx(0); ry(0); };
    map.addEventListener('pointermove', move);
    map.addEventListener('pointerleave', reset);
    return () => { map.removeEventListener('pointermove', move); map.removeEventListener('pointerleave', reset); };
  });

  gsap.fromTo('.net-svg', { rotateX: 34, transformPerspective: 1400, transformOrigin: '50% 100%' }, {
    rotateX: 8, ease: 'none',
    scrollTrigger: { trigger: '.interlude-stage', start: 'top 95%', end: 'center 50%', scrub: 0.6 },
  });
}
