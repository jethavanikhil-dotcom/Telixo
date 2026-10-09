// The four channel signals. Each one has its own motion:
//   Calls     – an audio waveform
//   SMS       – short rectangular pulses
//   WhatsApp  – conversational message shapes
//   AI Agents – a branching path that picks a route
// Every glyph runs on its own clock. Raising `sync` towards 1 pulls all four
// onto one shared beat, which is how the page shows channels "connecting".

import { el, corners, lerp, fract, clamp } from './svg.js';

export const GW = 150;
export const GH = 80;
export const ORDER = ['calls', 'sms', 'whatsapp', 'ai'];

const LABELS = { calls: '01  CALLS', sms: '02  SMS', whatsapp: '03  WHATSAPP', ai: '04  AI AGENTS' };
const RATE = { calls: 0.83, sms: 1.27, whatsapp: 0.61, ai: 0.97 };
const OFFSET = { calls: 0.1, sms: 0.55, whatsapp: 0.3, ai: 0.8 };
const BEAT = 0.75;

const clock = (kind, t, sync) => lerp(t * RATE[kind] + OFFSET[kind], t * BEAT, sync);

const PORTS = { right: [GW, GH / 2], left: [0, GH / 2], top: [GW / 2, 0], bottom: [GW / 2, GH] };

export function glyph(kind, parent, { ports = ['right'], label = true } = {}) {
  const g = el('g', { class: `glyph glyph-${kind}` }, parent);
  el('rect', { width: GW, height: GH, class: 'bgf' }, g);
  corners(g, 0, 0, GW, GH, 9, 'ln2');
  if (label) el('text', { x: 0, y: -12, class: 'lbl', text: LABELS[kind] }, g);
  const body = el('g', {}, g);
  ports.forEach((side) => el('circle', { cx: PORTS[side][0], cy: PORTS[side][1], r: 3.5, class: 'port' }, g));
  const draw = BUILD[kind](body);
  return {
    g,
    kind,
    port: (side = ports[0]) => PORTS[side],
    update: (t, sync = 0) => draw(clock(kind, t, sync)),
  };
}

function bez([p0, p1, p2, p3], t) {
  const m = 1 - t;
  const a = m * m * m, b = 3 * m * m * t, c = 3 * m * t * t, d = t * t * t;
  return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]];
}

const BUILD = {
  calls(b) {
    el('line', { x1: 14, y1: GH / 2, x2: GW - 14, y2: GH / 2, class: 'ln' }, b);
    const wave = el('path', { class: 'ac' }, b);
    return (c) => {
      const amp = 20 * (0.62 + 0.38 * Math.sin(c * 2.1));
      let d = '';
      for (let x = 14; x <= GW - 14; x += 2) {
        const u = (x - 14) / (GW - 28);
        const env = Math.pow(Math.sin(Math.PI * u), 1.6);
        const y = GH / 2 + amp * env * Math.sin(u * 22 - c * 9) * (0.6 + 0.4 * Math.sin(u * 7 + c * 3));
        d += `${x === 14 ? 'M' : 'L'}${x},${y.toFixed(1)}`;
      }
      wave.setAttribute('d', d);
    };
  },

  sms(b) {
    const start = (GW - (5 * 19 + 11)) / 2;
    const bars = Array.from({ length: 6 }, (_, i) =>
      el('rect', { x: start + i * 19, y: GH / 2 - 9, width: 11, height: 18, class: 'acf' }, b));
    return (c) => bars.forEach((r, i) => {
      const f = fract(c - i * 0.11);
      r.setAttribute('opacity', (0.12 + 0.88 * Math.exp(-f * 7)).toFixed(2));
    });
  },

  whatsapp(b) {
    el('path', {
      d: 'M18,14 h64 a4,4 0 0 1 4,4 v18 a4,4 0 0 1 -4,4 h-56 l-8,7 v-7 a4,4 0 0 1 -4,-4 v-18 a4,4 0 0 1 4,-4 z',
      class: 'ln2 bgf',
    }, b);
    const dots = [38, 50, 62].map((x) => el('circle', { cx: x, cy: 27, r: 2.4, class: 'inkf' }, b));
    const reply = el('g', {}, b);
    el('path', {
      d: 'M74,48 h54 a4,4 0 0 1 4,4 v12 l6,6 h-64 a4,4 0 0 1 -4,-4 v-14 a4,4 0 0 1 4,-4 z',
      class: 'wa-bubble',
    }, reply);
    el('line', { x1: 80, y1: 56, x2: 122, y2: 56, class: 'wa-line' }, reply);
    el('line', { x1: 80, y1: 62, x2: 106, y2: 62, class: 'wa-line' }, reply);
    return (c) => {
      dots.forEach((d, i) => {
        const lift = Math.max(0, Math.sin(c * Math.PI * 3 - i * 0.9));
        d.setAttribute('cy', (27 - lift * 3).toFixed(2));
      });
      const phase = fract(c * 0.5);
      const o = clamp((phase - 0.4) * 8) * clamp((1 - phase) * 10);
      reply.setAttribute('opacity', (0.18 + 0.82 * o).toFixed(2));
    };
  },

  ai(b) {
    const root = [16, GH / 2];
    const split = [54, GH / 2];
    const ends = [[GW - 18, 16], [GW - 18, GH / 2], [GW - 18, GH - 16]];
    el('line', { x1: root[0], y1: root[1], x2: split[0], y2: split[1], class: 'ac' }, b);
    const branches = ends.map((e) => {
      const pts = [split, [split[0] + 30, split[1]], [e[0] - 40, e[1]], e];
      return { pts, path: el('path', { d: `M${pts[0]} C${pts[1]} ${pts[2]} ${pts[3]}`, class: 'ln2' }, b) };
    });
    [root, split].forEach((p) => el('circle', { cx: p[0], cy: p[1], r: 3, class: 'inkf' }, b));
    const nodes = ends.map((e) => el('circle', { cx: e[0], cy: e[1], r: 3, class: 'node-off' }, b));
    const dot = el('circle', { r: 2.6, class: 'acf' }, b);
    let last = -1;
    return (c) => {
      const k = Math.floor(c * 0.8) % 3;
      if (k !== last) {
        branches.forEach((br, i) => br.path.setAttribute('class', i === k ? 'ac' : 'ln2'));
        nodes.forEach((n, i) => n.setAttribute('class', i === k ? 'acf' : 'node-off'));
        last = k;
      }
      const [x, y] = bez(branches[k].pts, Math.min(1, fract(c * 0.8) * 1.25));
      dot.setAttribute('cx', x.toFixed(1));
      dot.setAttribute('cy', y.toFixed(1));
    };
  },
};
