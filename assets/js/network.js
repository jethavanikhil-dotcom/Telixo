// Dark interlude: many conversations moving through the routing layer at once.

import { el, link, sampler, Flow, loop, motionOK, ping, DIR } from './svg.js';

const INPUTS = [['calls', 'Calls'], ['sms', 'SMS'], ['whatsapp', 'WhatsApp'], ['ai', 'AI Agents']];
const OUTPUTS = ['Sales pipeline', 'Support queue', 'AI resolution', 'Follow-ups'];
const FEED = [
  ['whatsapp', 'Delivery change request', 'AI agent', 'Resolved'],
  ['calls', 'Enterprise pricing question', 'Sales · Sam', 'Assigned'],
  ['sms', 'Appointment reminder reply', 'AI agent', 'Confirmed'],
  ['ai', 'Password reset', 'AI agent', 'Resolved'],
  ['calls', 'Billing dispute', 'Support · Priya', 'Escalated'],
  ['whatsapp', 'Order status', 'AI agent', 'Resolved'],
  ['sms', 'Quote follow-up', 'Sales · Sam', 'Scheduled'],
  ['whatsapp', 'Return request', 'AI agent', 'Label sent'],
];

function row([ch, topic, route, state]) {
  const li = document.createElement('li');
  li.innerHTML = `<i class="dot" style="--c:var(--c-${ch})"></i><span class="feed-topic">${topic}</span><span class="feed-route">→ ${route}</span><span class="feed-state">${state}</span>`;
  return li;
}

export function initNetwork(section) {
  const svg = section.querySelector('.net-svg');
  const list = section.querySelector('.feed-list');

  // White → night on the way in, night → white on the way out.
  if (motionOK()) {
    gsap.fromTo(section, { backgroundColor: '#FFFFFF', color: '#101828' }, {
      backgroundColor: '#0B1020', color: '#F8FAFC', ease: 'none',
      scrollTrigger: { trigger: section, start: 'top 85%', end: 'top 30%', scrub: true },
    });
    gsap.fromTo(section, { backgroundColor: '#0B1020', color: '#F8FAFC' }, {
      backgroundColor: '#FFFFFF', color: '#101828', ease: 'none', immediateRender: false,
      scrollTrigger: { trigger: section, start: 'bottom 70%', end: 'bottom 15%', scrub: true },
    });
  }
  ScrollTrigger.create({
    trigger: section, start: 'top top+=68', end: 'bottom 45%',
    toggleClass: { targets: document.body, className: 'nav-dark' },
  });

  // Live feed (simulated, labelled as such in the markup).
  let feedIndex = 0;
  for (let i = 0; i < 5; i++) list.append(row(FEED[feedIndex++ % FEED.length]));
  let feedClock = 0;

  gsap.matchMedia().add({ wide: '(min-width: 900px)', tall: '(max-width: 899px)' }, (ctx) => {
    const wide = ctx.conditions.wide;
    const [W, H] = wide ? [1000, 640] : [600, 860];
    svg.replaceChildren();
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.classList.toggle('is-tall', !wide);
    const along = wide ? 'right' : 'bottom';
    const back = wide ? 'left' : 'top';
    const place = (a, c) => (wide ? [a * W, c * H] : [c * W, a * H]);
    const cross = (n, i) => 0.14 + (i * 0.72) / (n - 1);

    const cols = [[0.07, 4], [0.37, 3], [0.63, 4], [0.93, 4]]
      .map(([a, n]) => Array.from({ length: n }, (_, i) => place(a, cross(n, i))));

    const lEdges = el('g', {}, svg);
    const lFlow = el('g', {}, svg);
    const lNodes = el('g', {}, svg);

    const edgeMap = new Map();
    const addEdge = (c, i, j) => {
      const p = el('path', { d: link(cols[c][i], DIR[along], cols[c + 1][j], DIR[back], 0.5), class: 'net-edge' }, lEdges);
      const e = { p, at: sampler(p), hot: 0 };
      edgeMap.set(`${c}:${i}>${j}`, e);
      return e;
    };
    cols[0].forEach((_, i) => cols[1].forEach((__, j) => addEdge(0, i, j)));
    cols[1].forEach((_, i) => cols[2].forEach((__, j) => addEdge(1, i, j)));
    cols[2].forEach((_, i) => cols[3].forEach((__, j) => { if (Math.abs(i - j) <= 1) addEdge(2, i, j); }));

    // Nodes and labels.
    cols[0].forEach(([x, y], i) => {
      el('rect', { x: x - 6, y: y - 6, width: 12, height: 12, class: `net-in in-${INPUTS[i][0]}` }, lNodes);
      el('text', wide ? { x: x - 6, y: y - 18, class: 'lbl', text: INPUTS[i][1].toUpperCase() } : { x, y: y - 16, class: 'lbl mid', text: INPUTS[i][1].toUpperCase() }, lNodes);
    });
    [1, 2].forEach((c) => cols[c].forEach(([x, y]) => {
      el('circle', { cx: x, cy: y, r: 13, class: 'ln' }, lNodes);
      el('circle', { cx: x, cy: y, r: 5, class: 'net-hub' }, lNodes);
    }));
    cols[3].forEach(([x, y], i) => {
      el('rect', { x: x - 5, y: y - 5, width: 10, height: 10, class: 'ln2 bgf' }, lNodes);
      el('text', wide ? { x: x + 5, y: y - 18, class: 'lbl end', text: OUTPUTS[i].toUpperCase() } : { x, y: y + 26, class: 'lbl mid', text: OUTPUTS[i].toUpperCase() }, lNodes);
    });
    const pings = el('g', {}, lNodes);

    const flow = new Flow(lFlow);
    const heat = (e, d) => { e.hot += d; e.p.classList.toggle('is-hot', e.hot > 0); };
    const pick = (n) => Math.floor(Math.random() * n);
    let nextSpawn = 0;

    const stop = loop(svg, (t, dt) => {
      if (t > nextSpawn && flow.items.length < 18) {
        const i = pick(4), j = pick(3), k = pick(4);
        const outs = [k - 1, k, k + 1].filter((m) => m >= 0 && m < 4);
        const m = outs[pick(outs.length)];
        const route = [edgeMap.get(`0:${i}>${j}`), edgeMap.get(`1:${j}>${k}`), edgeMap.get(`2:${k}>${m}`)];
        const ends = [cols[1][j], cols[2][k], cols[3][m]];
        heat(route[0], 1);
        flow.add({
          route: route.map((e) => e.at), speed: 210 + Math.random() * 80, rotate: true,
          make: (l) => {
            const g = el('g', {}, l);
            el('line', { x1: -16, y1: 0, x2: 0, y2: 0, class: 'net-tail' }, g);
            el('circle', { r: 2.8, class: 'acf' }, g);
            return g;
          },
          onLeg: (leg) => {
            heat(route[leg], -1);
            if (route[leg + 1]) heat(route[leg + 1], 1);
            if (leg < 2) ping(pings, ...ends[leg], 18);
          },
        });
        nextSpawn = t + 0.22;
      }
      flow.update(dt);

      feedClock += dt;
      if (feedClock > 2.2) {
        feedClock = 0;
        const li = row(FEED[feedIndex++ % FEED.length]);
        list.prepend(li);
        gsap.from(li, { autoAlpha: 0, y: -10, duration: 0.5, ease: 'power3.out' });
        if (list.children.length > 5) list.lastElementChild.remove();
      }
    });

    return () => { stop(); flow.clear(); };
  });
}
