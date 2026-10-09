// Autonomous workflow: a single request travels through the network as you scroll.

import { el, link, sampler, prepDraw, DIR, clamp } from './svg.js';

const STEP = 1.2; // timeline units per hop

function layout(wide) {
  if (wide) {
    return {
      vb: [1424, 520], out: 'right', into: 'left',
      box: (n) => ({ x: 14 + n.col * 238, y: 260 + n.row * 140 - 52, w: 208, h: 104 }),
    };
  }
  return {
    vb: [380, 1220], out: 'bottom', into: 'top',
    box: (n) => (n.row === 0
      ? { x: 30, y: 30 + n.col * 210, w: 320, h: 104 }
      : { x: n.row < 0 ? 14 : 198, y: 30 + n.col * 210, w: 168, h: 104 }),
  };
}

const sidePt = (b, s) => ({
  left: [b.x, b.y + b.h / 2], right: [b.x + b.w, b.y + b.h / 2],
  top: [b.x + b.w / 2, b.y], bottom: [b.x + b.w / 2, b.y + b.h],
}[s]);

export function initWorkflow(section, data) {
  const svg = section.querySelector('.wf-svg');
  const caption = section.querySelector('.wf-caption');
  const scrollEl = section.querySelector('.wf-scroll');
  const byId = Object.fromEntries(data.nodes.map((n) => [n.id, n]));

  gsap.matchMedia().add({ wide: '(min-width: 900px)', tall: '(max-width: 899px)' }, (ctx) => {
    const wide = ctx.conditions.wide;
    const L = layout(wide);
    svg.replaceChildren();
    svg.setAttribute('viewBox', `0 0 ${L.vb}`);
    svg.classList.toggle('is-tall', !wide);

    const lEdges = el('g', {}, svg);
    const lNodes = el('g', {}, svg);
    const lDot = el('g', {}, svg);

    const boxes = Object.fromEntries(data.nodes.map((n) => [n.id, L.box(n)]));
    const edges = {};
    const alts = [];
    const sides = (a, b) => {
      if (!wide || byId[a].row === byId[b].row) return [L.out, L.into];
      const vertical = (row) => (row < 0 ? 'top' : 'bottom');
      return byId[a].row === 0 ? [vertical(byId[b].row), 'left'] : ['right', vertical(byId[a].row)];
    };
    data.edges.forEach(([a, b, kind]) => {
      const [so, si] = sides(a, b);
      const p = el('path', {
        d: link(sidePt(boxes[a], so), DIR[so], sidePt(boxes[b], si), DIR[si], 0.6),
        class: kind === 'alt' ? 'wf-edge alt' : 'wf-edge',
      }, lEdges);
      edges[`${a}>${b}`] = p;
      if (kind === 'alt') alts.push(p);
    });

    const nodes = {};
    data.nodes.forEach((n) => {
      const b = boxes[n.id];
      const g = el('g', { class: 'wf-node' }, lNodes);
      el('rect', { x: b.x, y: b.y, width: b.w, height: b.h, rx: 3, class: 'wf-box' }, g);
      el('text', { x: b.x + 16, y: b.y + 26, class: 'wf-idx', text: n.index }, g);
      el('text', { x: b.x + 16, y: b.y + 58, class: 'wf-title', text: n.title }, g);
      el('text', { x: b.x + 16, y: b.y + 82, class: 'wf-detail', text: n.detail }, g);
      el('circle', { cx: b.x + b.w - 18, cy: b.y + 22, r: 4, class: 'wf-led' }, g);
      if (n.id === 'done') {
        el('path', { d: `M${b.x + b.w - 26},${b.y + 22} l5,5 l10,-11`, class: 'wf-check' }, g);
      }
      nodes[n.id] = g;
    });

    const path = data.path;
    const main = path.slice(1).map((id, i) => edges[`${path[i]}>${id}`]);
    main.forEach(prepDraw);
    const samplers = main.map((p) => sampler(p));
    const dot = el('g', { class: 'wf-dot' }, lDot);
    el('circle', { r: 13, class: 'wf-dot-halo' }, dot);
    el('circle', { r: 5.5, class: 'acf' }, dot);

    let lastStep = -1;
    const end = (path.length - 1) * STEP;

    const render = () => {
      const T = tl.time();
      path.forEach((id, k) => nodes[id].classList.toggle('is-on', T >= k * STEP + 0.02));
      nodes.human.classList.toggle('is-considered', T >= 2 * STEP + 0.6);
      nodes.done.classList.toggle('is-done', T >= end);

      if (T < 0.2) {
        dot.style.opacity = 0;
      } else {
        const j = Math.min(main.length - 1, Math.floor((T - 0.2) / STEP));
        const f = clamp((T - 0.2 - j * STEP) / 1.0);
        const [x, y] = samplers[j](f);
        dot.style.opacity = 1;
        dot.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)})`);
      }

      const step = clamp(Math.floor(T / STEP), 0, path.length - 1);
      if (step !== lastStep) {
        lastStep = step;
        const n = byId[path[step]];
        caption.innerHTML = `<span class="mono">${n.index} · ${n.title}</span>${n.caption}`;
      }
    };

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: wide
        ? { trigger: scrollEl, start: 'top top+=68', end: 'bottom bottom', scrub: 0.6 }
        : { trigger: svg, start: 'top 75%', end: 'bottom 55%', scrub: 0.6 },
      onUpdate: render,
    });
    main.forEach((p, j) => tl.to(p, { strokeDashoffset: 0, duration: 1 }, j * STEP + 0.2));
    tl.fromTo(alts, { opacity: 0 }, { opacity: 1, duration: 0.8 }, 2 * STEP + 0.2)
      .to({}, { duration: 0.8 }, end);
    render();
  });
}
