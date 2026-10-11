// Interactive channel map. Selecting a channel lights its path into the hub;
// the hub then shares that context outward to the other three channels.

import { el, link, sampler, Flow, loop, motionOK, particle, ping, DIR, dotGrid } from './svg.js';
import { glyph, ORDER } from './glyphs.js';
import { buildCore } from './circuit.js';

const VB = [800, 640];
const HUB = [400, 320, 150];
const SPOTS = {
  calls: { at: [325, 30], port: 'bottom', inlet: 'top' },
  sms: { at: [626, 280], port: 'left', inlet: 'right' },
  whatsapp: { at: [24, 280], port: 'right', inlet: 'left' },
  ai: { at: [325, 530], port: 'top', inlet: 'bottom' },
};

export function initChannels(section, data, { onUserSelect } = {}) {
  const svg = section.querySelector('.channel-map');
  const tabs = [...section.querySelectorAll('[role="tab"]')];
  const panel = section.querySelector('.channel-panel');

  svg.setAttribute('viewBox', `0 0 ${VB}`);
  dotGrid(svg, ...VB, 32);
  const lRing = el('g', {}, svg);
  const lSpokes = el('g', {}, svg);
  const lFlow = el('g', {}, svg);
  const lHub = el('g', {}, svg);
  const lGlyphs = el('g', {}, svg);

  const hub = buildCore(lHub, ...HUB);
  const pings = el('g', {}, lHub);

  // Faint outer ring: the wider ecosystem every channel belongs to.
  el('circle', { cx: HUB[0], cy: HUB[1], r: 236, class: 'ln dash' }, lRing);

  const items = ORDER.map((k) => {
    const spot = SPOTS[k];
    const wrap = el('g', { class: 'map-item' }, lGlyphs);
    const g = glyph(k, wrap, { ports: [spot.port] });
    g.g.setAttribute('transform', `translate(${spot.at})`);
    const port = g.port();
    const a = [spot.at[0] + port[0], spot.at[1] + port[1]];
    const b = hub.side(spot.inlet);
    const path = el('path', { d: link(a, DIR[spot.port], b, DIR[spot.inlet], 0.4), class: 'spoke' }, lSpokes);
    const fwd = sampler(path);
    const back = (u) => { const [x, y, ang] = fwd(1 - u); return [x, y, ang + Math.PI]; };
    back.len = fwd.len;
    return { k, g, wrap, path, fwd, back, inlet: b, port: a };
  });

  const flow = new Flow(lFlow);
  let active = 0;
  let interacted = false;
  let nextEmit = 0;
  let lastT = 0;

  function render(i, animate) {
    const d = data[i];
    panel.innerHTML = `
      <p class="eyebrow"><i class="dot" style="--c:var(--c-${d.id})"></i>${d.role}</p>
      <p class="channel-desc">${d.description}</p>
      <ul class="channel-points">${d.points.map((p) => `<li>${p}</li>`).join('')}</ul>`;
    if (animate && motionOK()) {
      gsap.from(panel.children, { autoAlpha: 0, y: 10, duration: 0.5, ease: 'power3.out', stagger: 0.05 });
    }
  }

  function select(i, { focus = false, user = false } = {}) {
    if (user) interacted = true;
    const changed = i !== active;
    active = i;
    tabs.forEach((t, j) => {
      const on = j === i;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
    });
    if (focus) tabs[i].focus();
    items.forEach((it, j) => {
      it.path.classList.toggle('is-on', j === i);
      it.wrap.classList.toggle('is-dim', j !== i);
    });
    items[i].g.update(lastT, 0);
    if (changed) { flow.clear(); nextEmit = 0; }
    render(i, changed);
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => { select(i, { user: true }); onUserSelect?.(i); });
    tab.addEventListener('mouseenter', () => items[i].path.classList.add('is-hover'));
    tab.addEventListener('mouseleave', () => items[i].path.classList.remove('is-hover'));
    tab.addEventListener('keydown', (e) => {
      const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
      if (e.key in keys) {
        e.preventDefault();
        const j = (i + keys[e.key] + tabs.length) % tabs.length;
        select(j, { focus: true, user: true });
        onUserSelect?.(j);
      } else if (e.key === 'Home') { e.preventDefault(); select(0, { focus: true, user: true }); }
      else if (e.key === 'End') { e.preventDefault(); select(tabs.length - 1, { focus: true, user: true }); }
    });
  });

  items.forEach((it) => it.g.update(0, 0));
  select(0);

  // Until someone picks a channel, gently cycle through them while in view.
  let autoTimer = 0;
  loop(svg, (t, dt) => {
    lastT = t;
    const it = items[active];
    it.g.update(t, 0);
    hub.spin(t);
    if (t > nextEmit) {
      flow.add({
        route: [it.fwd], speed: 230, make: (l) => particle(it.k, l),
        onDone: () => {
          ping(pings, ...it.inlet);
          hub.pulse(0.6);
          items.forEach((o, j) => {
            if (j !== active) flow.add({ route: [o.back], speed: 200, make: (l) => particle('out', l), wait: j * 0.05 });
          });
        },
      });
      nextEmit = t + 1.1;
    }
    flow.update(dt);
    if (!interacted && dt) {
      autoTimer += dt;
      if (autoTimer > 6) { autoTimer = 0; select((active + 1) % items.length); }
    }
  });

  return {
    select: (i) => { if (i !== active) select(i); },
    // Scroll now drives the selection, so stop the automatic cycling.
    takeOver: () => { interacted = true; },
    count: items.length,
  };
}
