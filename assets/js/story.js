// Scroll story: Fragmented → Connected → Intelligent.
// One artwork evolves continuously with scroll; nothing is swapped out.

import { el, link, sampler, prepDraw, Flow, loop, particle, ping, DIR, dotGrid } from './svg.js';
import { glyph, GW, GH, ORDER } from './glyphs.js';
import { buildCore } from './circuit.js';

const LAYOUTS = {
  wide: {
    vb: [1600, 640], scale: 1.2, port: 'right', label: 1,
    frag: [[110, 70, -5], [560, 420, 4], [1010, 60, -3], [1330, 400, 6]],
    col: [[190, 40], [190, 190], [190, 340], [190, 490]],
    hub: [760, 320, 220], hubIn: 'left', hubOut: 'right',
    ai: [1060, 150, 230, 96], human: [1060, 394, 230, 96], outcome: [1350, 272, 220, 96],
    nodeIn: 'left', nodeOut: 'right',
  },
  tall: {
    vb: [800, 1080], scale: 1.3, port: 'right', label: 1.5,
    frag: [[40, 70, -5], [430, 250, 5], [70, 560, -4], [440, 800, 6]],
    col: [[30, 60], [30, 200], [30, 340], [30, 480]],
    hub: [580, 340, 190], hubIn: 'left', hubOut: 'bottom',
    ai: [40, 700, 330, 120], human: [430, 700, 330, 120], outcome: [235, 920, 330, 120],
    nodeIn: 'top', nodeOut: 'bottom',
  },
};

const DARK = {
  '--s-bg': '#0B1020', '--s-ink': '#F8FAFC', '--s-muted': '#98A2B3',
  '--art-bg': '#0B1020', '--art-ink': '#F8FAFC', '--art-muted': '#98A2B3',
  '--art-line': 'rgba(248,250,252,0.14)', '--art-line-strong': 'rgba(248,250,252,0.4)',
  '--art-accent': '#7387FF', '--art-soft': 'rgba(66,91,255,0.22)',
};

function nodeBox(parent, [x, y, w, h], title, sub, fontScale) {
  const g = el('g', {}, parent);
  el('rect', { x, y, width: w, height: h, class: 'ln2 bgf' }, g);
  el('rect', { x, y, width: 3, height: h, class: 'acf' }, g);
  el('text', { x: x + 20, y: y + h * 0.46, class: 'node-title', text: title, style: `font-size:${20 * fontScale}px` }, g);
  el('text', { x: x + 20, y: y + h * 0.46 + 24 * fontScale, class: 'lbl', text: sub, style: `font-size:${11 * fontScale}px` }, g);
  return { g, pts: { left: [x, y + h / 2], right: [x + w, y + h / 2], top: [x + w / 2, y], bottom: [x + w / 2, y + h] } };
}

export function initStory(section, { art3d = false } = {}) {
  const sticky = section.querySelector('.story-sticky');
  const svg = section.querySelector('.story-art');
  const stages = [...section.querySelectorAll('[data-stage]')];
  const marks = [...section.querySelectorAll('.story-progress li')];

  // The nav turns dark while it sits over the dark third of the story.
  ScrollTrigger.create({
    trigger: section,
    start: () => `top+=${(section.offsetHeight - window.innerHeight) * 0.68} top`,
    end: 'bottom top+=68',
    invalidateOnRefresh: true,
    toggleClass: { targets: document.body, className: 'nav-dark' },
  });

  gsap.matchMedia().add({ wide: '(min-width: 900px)', tall: '(max-width: 899px)' }, (ctx) => {
    const L = LAYOUTS[ctx.conditions.wide ? 'wide' : 'tall'];
    // On wide screens with WebGL the 3D scene draws the story; the SVG is built but stays idle.
    const idle = art3d && ctx.conditions.wide;
    svg.classList.toggle('is-idle', idle);
    svg.replaceChildren();
    svg.setAttribute('viewBox', `0 0 ${L.vb}`);
    svg.classList.toggle('is-tall', !ctx.conditions.wide);
    dotGrid(svg, ...L.vb, 32);

    const lLinks = el('g', {}, svg);
    const lOuts = el('g', {}, svg);
    const lFlow = el('g', {}, svg);
    const lHub = el('g', {}, svg);
    const lNodes = el('g', {}, svg);
    const lGlyphs = el('g', {}, svg);

    const [hx, hy, hs] = L.hub;
    const hub = buildCore(lHub, hx, hy, hs);
    const pings = el('g', {}, lHub);

    // Glyphs are positioned by plain objects so scroll can drive them exactly.
    const glyphs = ORDER.map((k) => glyph(k, lGlyphs, { ports: [L.port] }));
    const pos = L.frag.map(([x, y, r]) => ({ x, y, r, s: L.scale * 0.88 }));
    const place = () => glyphs.forEach((g, i) => {
      const p = pos[i];
      g.g.setAttribute('transform', `translate(${p.x.toFixed(1)},${p.y.toFixed(1)}) rotate(${p.r.toFixed(2)}) scale(${p.s.toFixed(3)})`);
    });
    place();

    // Connectors from each channel's settled position into the hub.
    const links = L.col.map(([x, y], i) => {
      const port = glyphs[i].port();
      const a = [x + port[0] * L.scale, y + port[1] * L.scale];
      const b = hub.side(L.hubIn, i, 4);
      const p = el('path', { d: link(a, DIR[L.port], b, DIR[L.hubIn], 0.5), class: 'ac' }, lLinks);
      prepDraw(p);
      return { el: p, at: sampler(p), inlet: b };
    });

    // Outcome network: hub → AI agent / human team → outcome.
    const fs = L.label;
    const ai = nodeBox(lNodes, L.ai, 'AI agent', 'ROUTINE REQUESTS', fs);
    const human = nodeBox(lNodes, L.human, 'Human team', 'COMPLEX CONVERSATIONS', fs);
    const outcome = nodeBox(lNodes, L.outcome, 'Outcome', 'CLOSED · RESOLVED', fs);
    const hubOut = hub.side(L.hubOut);
    const mk = (a, da, b, db) => {
      const p = el('path', { d: link(a, DIR[da], b, DIR[db], 0.5), class: 'ac' }, lOuts);
      prepDraw(p);
      return { el: p, at: sampler(p) };
    };
    const toAi = mk(hubOut, L.hubOut, ai.pts[L.nodeIn], L.nodeIn);
    const toHuman = mk(hubOut, L.hubOut, human.pts[L.nodeIn], L.nodeIn);
    const aiOut = mk(ai.pts[L.nodeOut], L.nodeOut, outcome.pts[L.nodeIn], L.nodeIn);
    const humanOut = mk(human.pts[L.nodeOut], L.nodeOut, outcome.pts[L.nodeIn], L.nodeIn);

    // --- scroll timeline (3 units: one per stage) -------------------------
    const st = { sync: 0 };
    gsap.set(sticky, {
      '--s-bg': '#FFFFFF', '--s-ink': '#101828', '--s-muted': '#667085',
      '--art-bg': '#FFFFFF', '--art-ink': '#101828', '--art-muted': '#667085',
      '--art-line': '#DCE1EA', '--art-line-strong': '#A4AEBF',
      '--art-accent': '#425BFF', '--art-soft': '#EEF2FF',
    });
    gsap.set(stages.slice(1), { autoAlpha: 0 });
    gsap.set(lHub, { opacity: 0, scale: 0.8, transformOrigin: '50% 50%' });
    gsap.set([ai.g, human.g, outcome.g], { opacity: 0 });

    const flow = new Flow(lFlow);
    let stageIndex = 0;
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.8 },
      onUpdate: () => {
        place();
        const p = tl.progress() * 3;
        const idx = p < 0.95 ? 0 : p < 1.95 ? 1 : 2;
        if (idx !== stageIndex) {
          stageIndex = idx;
          marks.forEach((m, i) => m.classList.toggle('is-on', i === idx));
        }
        if (p < 1.4) flow.clear();
      },
    });

    // Stage 1 → 2: channels travel into a column and synchronise.
    pos.forEach((p, i) => tl.to(p, { x: L.col[i][0], y: L.col[i][1], r: 0, s: L.scale, duration: 0.8, ease: 'power2.inOut' }, 0.4 + i * 0.06));
    tl.to(st, { sync: 1, duration: 0.6 }, 1.0)
      .to(lHub, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }, 0.95)
      .to(links.map((l) => l.el), { strokeDashoffset: 0, duration: 0.45, stagger: 0.06 }, 1.2);

    // Stage 2 → 3: routing appears, the room goes dark.
    tl.to(sticky, { ...DARK, duration: 0.35 }, 1.95)
      .to([ai.g, human.g], { opacity: 1, duration: 0.25, stagger: 0.08 }, 2.1)
      .to([toAi.el, toHuman.el], { strokeDashoffset: 0, duration: 0.35 }, 2.1)
      .to(outcome.g, { opacity: 1, duration: 0.25 }, 2.35)
      .to([aiOut.el, humanOut.el], { strokeDashoffset: 0, duration: 0.3 }, 2.35)
      .to({}, { duration: 0.3 }, 2.7);

    // Copy changes between stages.
    tl.to(stages[0], { autoAlpha: 0, y: -28, duration: 0.18 }, 0.82)
      .fromTo(stages[1], { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.18 }, 1.0)
      .to(stages[1], { autoAlpha: 0, y: -28, duration: 0.18 }, 1.82)
      .fromTo(stages[2], { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.18 }, 2.0);

    // --- live signals -----------------------------------------------------
    let nextEmit = 0;
    const stop = idle ? () => {} : loop(svg, (t, dt) => {
      glyphs.forEach((g) => g.update(t, st.sync));
      hub.spin(t);
      const p = tl.progress() * 3;
      if (p > 1.6 && t > nextEmit) {
        const i = Math.floor(Math.random() * 4);
        const routed = p > 2.55;
        const toAgent = Math.random() < 0.65;
        const route = [links[i].at];
        if (routed) route.push(...(toAgent ? [toAi.at, aiOut.at] : [toHuman.at, humanOut.at]));
        flow.add({
          route, speed: 260, make: (l) => particle(ORDER[i], l),
          onLeg: (leg) => {
            if (leg === 0) { ping(pings, ...links[i].inlet); hub.pulse(0.6); }
          },
        });
        nextEmit = t + (routed ? 0.32 : 0.45);
      }
      flow.update(dt);
    });

    return () => {
      stop();
      flow.clear();
    };
  });
}
