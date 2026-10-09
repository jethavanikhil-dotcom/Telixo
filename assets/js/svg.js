// Small SVG + motion toolkit shared by every artwork on the page.

export const NS = 'http://www.w3.org/2000/svg';

export function el(tag, attrs = {}, parent) {
  const node = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'text') node.textContent = value;
    else node.setAttribute(key, value);
  }
  if (parent) parent.appendChild(node);
  return node;
}

export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
export const fract = (x) => x - Math.floor(x);

const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
export const motionOK = () => !reduceQuery.matches;

export const DIR = { left: [-1, 0], right: [1, 0], top: [0, -1], bottom: [0, 1] };

// Cubic link between two points that leaves `a` along `da` and enters `b` from `db`.
export function link(a, da, b, db, k = 0.45) {
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]) * k;
  return `M${a} C${a[0] + da[0] * d},${a[1] + da[1] * d} ${b[0] + db[0] * d},${b[1] + db[1] * d} ${b}`;
}

// Four L-shaped corner marks instead of a full box.
export function corners(parent, x, y, w, h, s = 9, cls = 'ln2') {
  const d = [
    `M${x},${y + s} V${y} H${x + s}`,
    `M${x + w - s},${y} H${x + w} V${y + s}`,
    `M${x + w},${y + h - s} V${y + h} H${x + w - s}`,
    `M${x + s},${y + h} H${x} V${y + h - s}`,
  ].join(' ');
  return el('path', { d, class: cls }, parent);
}

// Pre-samples a path (must be in the DOM) so particles can follow it cheaply.
// Returns at(u) -> [x, y, angle] for u in 0..1; at.len is the path length.
export function sampler(path, n = 140) {
  const len = path.getTotalLength();
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const p = path.getPointAtLength((len * i) / n);
    pts.push([p.x, p.y]);
  }
  const at = (u) => {
    const f = clamp(u) * n;
    const i = Math.min(Math.floor(f), n - 1);
    const r = f - i;
    const a = pts[i];
    const b = pts[i + 1];
    return [a[0] + (b[0] - a[0]) * r, a[1] + (b[1] - a[1]) * r, Math.atan2(b[1] - a[1], b[0] - a[0])];
  };
  at.len = len;
  return at;
}

// Hides a stroke so it can be "drawn" by tweening strokeDashoffset to 0.
export function prepDraw(path) {
  const len = path.getTotalLength();
  path.style.strokeDasharray = `${len} ${len}`;
  path.style.strokeDashoffset = len;
  path._len = len;
  return len;
}

// One shared ticker. A loop only runs while its element is near the viewport
// and the visitor has not asked for reduced motion.
const loops = new Set();
export function loop(target, fn) {
  const handle = { fn, visible: false };
  const io = new IntersectionObserver(([entry]) => { handle.visible = entry.isIntersecting; }, { rootMargin: '160px 0px' });
  io.observe(target);
  loops.add(handle);
  fn(0, 0);
  return () => { io.disconnect(); loops.delete(handle); };
}

gsap.ticker.add((time, deltaMs) => {
  if (!motionOK()) return;
  const dt = Math.min(deltaMs, 64) / 1000;
  loops.forEach((h) => { if (h.visible) h.fn(time, dt); });
});

// Particles travelling along a chain of sampled paths.
export class Flow {
  constructor(layer) {
    this.layer = layer;
    this.items = [];
  }

  // route: array of samplers. duration (s) overrides speed (units/s) and is split across legs.
  add({ route, make, speed = 160, duration, wait = 0, rotate = false, onLeg, onDone }) {
    const node = make(this.layer);
    node.style.visibility = 'hidden';
    this.items.push({ node, route, leg: 0, u: 0, speed, duration, wait, rotate, onLeg, onDone });
  }

  update(dt) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const p = this.items[i];
      if (p.wait > 0) { p.wait -= dt; continue; }
      const seg = p.route[p.leg];
      p.u += p.duration ? dt / (p.duration / p.route.length) : (dt * p.speed) / seg.len;
      if (p.u >= 1) {
        p.onLeg?.(p.leg);
        p.leg += 1;
        p.u = 0;
        if (p.leg >= p.route.length) {
          p.node.remove();
          this.items.splice(i, 1);
          p.onDone?.();
          continue;
        }
      }
      const [x, y, a] = p.route[p.leg](p.u);
      p.node.style.visibility = '';
      p.node.setAttribute('transform', p.rotate
        ? `translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${((a * 180) / Math.PI).toFixed(1)})`
        : `translate(${x.toFixed(1)},${y.toFixed(1)})`);
    }
  }

  clear() {
    this.items.forEach((p) => p.node.remove());
    this.items = [];
  }
}

// Signal shapes: each channel travels as its own recognisable mark.
export function particle(kind, layer) {
  switch (kind) {
    case 'calls': return el('circle', { r: 3.4, class: 'acf' }, layer);
    case 'sms': return el('rect', { x: -4.5, y: -3, width: 9, height: 6, class: 'acf' }, layer);
    case 'whatsapp': return el('path', {
      d: 'M-5,-4.5 h10 a1.5,1.5 0 0 1 1.5,1.5 v5 a1.5,1.5 0 0 1 -1.5,1.5 h-6 l-3,3 v-3 h-1 a1.5,1.5 0 0 1 -1.5,-1.5 v-5 a1.5,1.5 0 0 1 1.5,-1.5 z',
      class: 'waf',
    }, layer);
    case 'ai': return el('path', { d: 'M0,-4.5 L4.5,0 L0,4.5 L-4.5,0 Z', class: 'inkf' }, layer);
    default: return el('circle', { r: 2.8, class: 'acf' }, layer);
  }
}

// Expanding ring used when a signal lands on a node.
export function ping(layer, x, y, r = 14) {
  if (!motionOK()) return;
  const c = el('circle', { cx: x, cy: y, r: 3, class: 'ac ping' }, layer);
  gsap.to(c, { attr: { r }, opacity: 0, duration: 0.8, ease: 'power2.out', onComplete: () => c.remove() });
}

// Faint dot grid with soft edges, used behind the large artworks.
let uid = 0;
export function dotGrid(svg, w, h, step = 28) {
  const id = `g${uid++}`;
  const defs = el('defs', {}, svg);
  const pat = el('pattern', { id: `${id}p`, width: step, height: step, patternUnits: 'userSpaceOnUse' }, defs);
  el('circle', { cx: 1.5, cy: 1.5, r: 1.1, class: 'gridf' }, pat);
  const grad = el('radialGradient', { id: `${id}r` }, defs);
  el('stop', { offset: '0.35', 'stop-color': '#fff' }, grad);
  el('stop', { offset: '1', 'stop-color': '#000' }, grad);
  const mask = el('mask', { id: `${id}m` }, defs);
  el('rect', { x: -40, y: -40, width: w + 80, height: h + 80, fill: `url(#${id}r)` }, mask);
  const g = el('g', { mask: `url(#${id}m)` }, svg);
  return el('rect', { x: -40, y: -40, width: w + 80, height: h + 80, fill: `url(#${id}p)` }, g);
}
