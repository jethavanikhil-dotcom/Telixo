// THE COMMUNICATION CIRCUIT — the signature artwork.
// Four channel signals travel along their own paths into one central structure.
// mode 'hero'  : channels run independently, artwork scatters as you scroll away.
// mode 'final' : the same artwork assembles on scroll and runs on one shared beat.

import { el, link, sampler, prepDraw, Flow, loop, motionOK, particle, ping, dotGrid } from './svg.js';
import { glyph, GW, GH, ORDER } from './glyphs.js';

// Central structure: nested squares, crosshairs and a slowly turning tick ring.
export function buildCore(parent, cx, cy, S) {
  const g = el('g', { transform: `translate(${cx},${cy})` }, parent);
  const ticks = el('g', {}, g);
  const R = S * 0.74;
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    const major = i % 6 === 0;
    const l = major ? S * 0.05 : S * 0.022;
    el('line', {
      x1: (Math.cos(a) * R).toFixed(2), y1: (Math.sin(a) * R).toFixed(2),
      x2: (Math.cos(a) * (R + l)).toFixed(2), y2: (Math.sin(a) * (R + l)).toFixed(2),
      class: major ? 'ln2' : 'ln',
    }, ticks);
  }
  el('rect', { x: -S / 2, y: -S / 2, width: S, height: S, class: 'ln2 bgf' }, g);
  [[0, -S / 2, 0, -S * 0.18], [0, S * 0.18, 0, S / 2], [-S / 2, 0, -S * 0.18, 0], [S * 0.18, 0, S / 2, 0]]
    .forEach(([x1, y1, x2, y2]) => el('line', { x1, y1, x2, y2, class: 'ln' }, g));
  el('rect', { x: -S * 0.34, y: -S * 0.34, width: S * 0.68, height: S * 0.68, class: 'ln' }, g);
  const inner = el('rect', { x: -S * 0.18, y: -S * 0.18, width: S * 0.36, height: S * 0.36, class: 'core-inner' }, g);
  el('circle', { r: S * 0.045, class: 'acf' }, g);

  return {
    g,
    pulse(strength = 1) {
      if (!motionOK()) return;
      gsap.fromTo(inner, { scale: 1 + 0.16 * strength, transformOrigin: '50% 50%' },
        { scale: 1, duration: 0.7, ease: 'power3.out', overwrite: true });
    },
    spin(t) { ticks.setAttribute('transform', `rotate(${((t * 4) % 360).toFixed(2)})`); },
    // Inlet i of n on one side of the outer square, in parent coordinates.
    side(s, i = 0, n = 1) {
      const off = (i - (n - 1) / 2) * S * 0.2;
      if (s === 'left') return [cx - S / 2, cy + off];
      if (s === 'right') return [cx + S / 2, cy + off];
      if (s === 'top') return [cx + off, cy - S / 2];
      return [cx + off, cy + S / 2];
    },
  };
}

const VB = [700, 580];
const POS = { calls: [20, 48], sms: [96, 178], whatsapp: [28, 308], ai: [104, 438] };
const SCATTER = {
  calls: { x: -60, y: -70, rotation: -7 },
  sms: { x: -30, y: -24, rotation: 5 },
  whatsapp: { x: -70, y: 34, rotation: -4 },
  ai: { x: -24, y: 86, rotation: 8 },
};

export function createCircuit(svg, { mode = 'hero' } = {}) {
  const final = mode === 'final';
  svg.setAttribute('viewBox', `0 0 ${VB}`);
  const grid = dotGrid(svg, ...VB);

  const scrollPaths = el('g', {}, svg);
  const paths = el('g', {}, scrollPaths);
  const flowLayer = el('g', {}, scrollPaths);
  const scrollCore = el('g', {}, svg);
  const introCore = el('g', {}, scrollCore);
  const glyphLayer = el('g', {}, svg);

  const core = buildCore(introCore, 520, 290, 190);
  const inlets = el('g', {}, introCore);

  const glyphs = {}, scrollWraps = {}, introWraps = {}, routes = {}, inletPts = {};
  const pathEls = [];

  ORDER.forEach((k, i) => {
    scrollWraps[k] = el('g', {}, glyphLayer);
    introWraps[k] = el('g', {}, scrollWraps[k]);
    glyphs[k] = glyph(k, introWraps[k]);
    glyphs[k].g.setAttribute('transform', `translate(${POS[k]})`);

    const a = [POS[k][0] + GW, POS[k][1] + GH / 2];
    const b = core.side('left', i, 4);
    inletPts[k] = b;
    el('circle', { cx: b[0], cy: b[1], r: 3.2, class: 'port' }, inlets);

    if (k === 'ai') {
      // Branching, adaptive route: three alternatives that split and rejoin.
      routes[k] = [-34, 0, 34].map((off) => {
        const mx = (a[0] + b[0]) / 2;
        const my = (a[1] + b[1]) / 2 + off;
        const d = `M${a} C${a[0] + 50},${a[1]} ${mx - 50},${my} ${mx},${my} S${b[0] - 50},${b[1]} ${b}`;
        const p = el('path', { d, class: off === 0 ? 'ln2' : 'ln' }, paths);
        pathEls.push(p);
        return sampler(p);
      });
    } else {
      const p = el('path', { d: link(a, [1, 0], b, [-1, 0], 0.5), class: 'ln2' }, paths);
      pathEls.push(p);
      routes[k] = [sampler(p)];
    }
  });

  const outStart = core.side('right');
  const outPath = el('path', { d: `M${outStart} H${VB[0] - 14}`, class: 'ac' }, paths);
  pathEls.push(outPath);
  el('circle', { cx: VB[0] - 14, cy: outStart[1], r: 4, class: 'port' }, paths);
  const outRoute = sampler(outPath);

  // --- signals ------------------------------------------------------------
  const flow = new Flow(flowLayer);
  let active = false;
  const next = { calls: 0.2, sms: 0.9, whatsapp: 1.6, ai: 2.3 };
  let nextBeat = 0;

  function emitOut(count = 1) {
    for (let i = 0; i < count; i++) {
      flow.add({ route: [outRoute], make: (l) => particle('out', l), speed: 170, wait: i * 0.16 });
    }
  }

  function spawn(k, duration) {
    const route = k === 'ai' ? [routes.ai[Math.floor(Math.random() * 3)]] : routes[k];
    flow.add({
      route, duration, speed: 120 + Math.random() * 50,
      make: (l) => particle(k, l),
      onDone: () => {
        ping(inlets, ...inletPts[k]);
        if (final) {
          if (k === 'calls') { core.pulse(1.4); emitOut(3); }
        } else {
          core.pulse(0.8);
          if (Math.random() < 0.6) emitOut(1);
        }
      },
    });
  }

  loop(svg, (t, dt) => {
    ORDER.forEach((k) => glyphs[k].update(t, final ? 1 : 0));
    core.spin(t);
    if (active) {
      if (final) {
        if (t > nextBeat) { ORDER.forEach((k) => spawn(k, 1.5)); nextBeat = t + 2.4; }
      } else {
        ORDER.forEach((k) => {
          if (t > next[k]) { spawn(k); next[k] = t + 1.2 + Math.random() * 1.8; }
        });
      }
    }
    flow.update(dt);
  });

  const all = (obj) => ORDER.map((k) => obj[k]);

  return {
    setActive(on) {
      if (on === active) return;
      active = on;
      if (!on) flow.clear();
      else { nextBeat = 0; Object.keys(next).forEach((k) => { next[k] = 0; }); }
    },

    // Hero entrance: frames slide in, lines draw, the core settles.
    intro() {
      pathEls.forEach(prepDraw);
      return gsap.timeline()
        .from(all(introWraps), { opacity: 0, x: -18, duration: 0.8, ease: 'power3.out', stagger: 0.1 }, 0)
        .from(introCore, { opacity: 0, scale: 0.9, transformOrigin: '50% 50%', duration: 1, ease: 'power3.out' }, 0.1)
        .to(pathEls, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut', stagger: 0.08 }, 0.35)
        .add(() => this.setActive(true), 1.1);
    },

    // Scrubbed as the hero leaves: the system comes apart into separate channels.
    scatter() {
      const tl = gsap.timeline({ defaults: { ease: 'none' } });
      ORDER.forEach((k) => tl.to(scrollWraps[k], { ...SCATTER[k], duration: 1 }, 0));
      tl.to(scrollPaths, { opacity: 0, duration: 0.5 }, 0)
        .to(scrollCore, { opacity: 0.2, scale: 0.86, transformOrigin: '50% 50%', duration: 1 }, 0);
      return tl;
    },

    // Scrubbed in the final section: the same pieces come back together.
    assemble(tl) {
      pathEls.forEach(prepDraw);
      ORDER.forEach((k) => tl.from(scrollWraps[k], { ...SCATTER[k], duration: 1 }, 0));
      tl.from(scrollCore, { opacity: 0.2, scale: 0.86, transformOrigin: '50% 50%', duration: 0.9 }, 0)
        .to(pathEls, { strokeDashoffset: 0, duration: 0.6, stagger: 0.04 }, 0.4);
      return tl;
    },

    // Restrained, cursor-responsive depth: a gentle tilt plus a counter-moving grid.
    parallax(area) {
      if (!window.matchMedia('(pointer: fine)').matches) return;
      gsap.set(svg, { transformPerspective: 1400 });
      const ry = gsap.quickTo(svg, 'rotationY', { duration: 0.9, ease: 'power3.out' });
      const rx = gsap.quickTo(svg, 'rotationX', { duration: 0.9, ease: 'power3.out' });
      const gx = gsap.quickTo(grid, 'x', { duration: 1.2, ease: 'power3.out' });
      const gy = gsap.quickTo(grid, 'y', { duration: 1.2, ease: 'power3.out' });
      area.addEventListener('pointermove', (e) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        ry(nx * 6); rx(-ny * 5); gx(-nx * 22); gy(-ny * 16);
      });
      area.addEventListener('pointerleave', () => { ry(0); rx(0); gx(0); gy(0); });
    },
  };
}

export function initHero(section) {
  const art = createCircuit(section.querySelector('.circuit'), { mode: 'hero' });
  const root = document.documentElement;

  if (!motionOK()) {
    root.classList.add('is-ready');
    return;
  }

  gsap.timeline({ delay: 0.1 })
    .from(section.querySelectorAll('.h1 .line > span'), { yPercent: 108, duration: 1.1, ease: 'power4.out', stagger: 0.08 }, 0)
    .from(section.querySelectorAll('[data-hero-in]'), { autoAlpha: 0, y: 14, duration: 0.8, ease: 'power3.out', stagger: 0.08 }, 0.4)
    .add(art.intro(), 0.25);
  root.classList.add('is-ready');

  art.parallax(section);

  gsap.timeline({
    scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: 0.6 },
  }).add(art.scatter());
}

export function initFinale(section) {
  const art = createCircuit(section.querySelector('.circuit'), { mode: 'final' });
  if (!motionOK()) { art.setActive(true); return; }
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: section, start: 'top 80%', end: 'center 55%', scrub: 0.8,
      onUpdate: (self) => art.setActive(self.progress > 0.92),
    },
  });
  art.assemble(tl);
}
