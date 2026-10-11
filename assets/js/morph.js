// VECTOR MORPH — one living cloud of points that morphs between vector shapes.
// Shapes are drawn as 2D vectors (paths, strokes) on an offscreen canvas,
// sampled into points and given depth. The cloud is pinned to the artwork
// slots (hero, story, final CTA); the cursor scatters points, clicks ripple.

import * as THREE from 'three';
import { motionOK, clamp, lerp } from './svg.js';

const N_WIDE = 6400;
const N_NARROW = 3600;
const C = {
  calls: new THREE.Color('#425BFF'),
  sms: new THREE.Color('#0BA5EC'),
  whatsapp: new THREE.Color('#1FBF5B'),
  ai: new THREE.Color('#101828'),
  accent: new THREE.Color('#425BFF'),
  ink: new THREE.Color('#101828'),
  soft: new THREE.Color('#9AA8FF'),
};
const CHANNELS = ['calls', 'sms', 'whatsapp', 'ai'];
const LABELS = ['01  CALLS', '02  SMS', '03  WHATSAPP', '04  AI AGENTS'];

const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const rand = (a = -1, b = 1) => a + Math.random() * (b - a);

// --------------------------------------------------------------- sampling
// Draw a vector on a 256×256 canvas and return the covered pixel positions.
function pixels(draw) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 256;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = ctx.strokeStyle = '#000';
  ctx.lineCap = ctx.lineJoin = 'round';
  draw(ctx);
  const data = ctx.getImageData(0, 0, 256, 256).data;
  const pts = [];
  for (let y = 0; y < 256; y += 2) {
    for (let x = 0; x < 256; x += 2) if (data[(y * 256 + x) * 4 + 3] > 120) pts.push([x, y]);
  }
  return pts;
}

const ICONS = {
  calls: (ctx) => {
    ctx.translate(30, 30);
    ctx.scale(8.2, 8.2);
    ctx.fill(new Path2D('M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z'));
  },
  sms: (ctx) => {
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.roundRect(28, 44, 200, 140, 22);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(70, 184); ctx.lineTo(56, 226); ctx.lineTo(110, 184);
    ctx.stroke();
    ctx.lineWidth = 14;
    [[72, 92, 184], [72, 128, 150]].forEach(([x, y, x2]) => { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y); ctx.stroke(); });
  },
  whatsapp: (ctx) => {
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.arc(130, 122, 92, Math.PI * 0.78, Math.PI * 2.62);
    ctx.lineTo(40, 222);
    ctx.closePath();
    ctx.stroke();
    ctx.translate(82, 74);
    ctx.scale(4.2, 4.2);
    ctx.fill(new Path2D('M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z'));
  },
  ai: (ctx) => {
    const nodes = [[50, 128], [118, 128], [206, 54], [206, 128], [206, 202]];
    ctx.lineWidth = 11;
    [[0, 1], [1, 2], [1, 3], [1, 4], [2, 3], [3, 4]].forEach(([a, b]) => {
      ctx.beginPath(); ctx.moveTo(...nodes[a]); ctx.lineTo(...nodes[b]); ctx.stroke();
    });
    nodes.forEach(([x, y], i) => { ctx.beginPath(); ctx.arc(x, y, i === 1 ? 30 : 22, 0, Math.PI * 2); ctx.fill(); });
  },
  mark: (ctx) => {
    ctx.translate(8, 8);
    ctx.scale(7.5, 7.5);
    ctx.lineWidth = 2.1;
    ctx.stroke(new Path2D('M2 7c7 0 8 9 13 9M2 13c5 0 7 3 13 3M2 19c5 0 7-3 13-3M2 25c7 0 8-9 13-9'));
    ctx.beginPath(); ctx.arc(22, 16, 6.5, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(22, 16, 2.6, 0, Math.PI * 2); ctx.fill();
  },
};

const PIX = {};
const pix = (name) => (PIX[name] ||= pixels(ICONS[name]));

// A shape is { pos: Float32Array(n*3), col: Float32Array(n*3) } with exactly n points.
class Shape {
  constructor(n) { this.n = n; this.pos = new Float32Array(n * 3); this.col = new Float32Array(n * 3); this.i = 0; }
  put(x, y, z, c) {
    if (this.i >= this.n) return;
    const k = this.i * 3;
    this.pos[k] = x; this.pos[k + 1] = y; this.pos[k + 2] = z;
    this.col[k] = c.r; this.col[k + 1] = c.g; this.col[k + 2] = c.b;
    this.i++;
  }
  icon(name, count, cx, cy, size, color, depth = 0.6) {
    const p = pix(name);
    for (let j = 0; j < count; j++) {
      const [px, py] = p[Math.floor(Math.random() * p.length)];
      this.put(cx + ((px + rand(0, 2)) / 256 - 0.5) * size, cy - ((py + rand(0, 2)) / 256 - 0.5) * size, rand(-depth, depth), color);
    }
  }
  line(count, a, b, color, jitter = 0.05) {
    for (let j = 0; j < count; j++) {
      const t = Math.random();
      this.put(lerp(a[0], b[0], t) + rand(-jitter, jitter), lerp(a[1], b[1], t) + rand(-jitter, jitter), rand(-jitter, jitter) * 2, color);
    }
  }
  curve(count, a, b, color) {
    // Horizontal S-curve, like the wires in the circuit.
    for (let j = 0; j < count; j++) {
      const t = Math.random();
      const e = t * t * (3 - 2 * t);
      this.put(lerp(a[0], b[0], t), lerp(a[1], b[1], e), rand(-0.05, 0.05), color);
    }
  }
  ring(count, cx, cy, r, color, band = 0.12, tilt = 0) {
    for (let j = 0; j < count; j++) {
      const a = Math.random() * Math.PI * 2;
      const rr = r + rand(-band, band);
      const y = Math.sin(a) * rr;
      this.put(cx + Math.cos(a) * rr, cy + y * Math.cos(tilt), y * Math.sin(tilt) + rand(-0.05, 0.05), color);
    }
  }
  disc(count, cx, cy, r, color) {
    for (let j = 0; j < count; j++) {
      const a = Math.random() * Math.PI * 2;
      const rr = Math.sqrt(Math.random()) * r;
      this.put(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, rand(-0.2, 0.2), color);
    }
  }
  fill(color) { while (this.i < this.n) this.put(rand(-12, 12), rand(-7, 7), rand(-6, 2), color); return this; }
}

function makeShapes(n) {
  const q = Math.floor(n / 4);
  const S = {};

  // Hero: a signal globe with four channel orbits.
  S.globe = new Shape(n);
  const g = Math.floor(n * 0.62);
  for (let j = 0; j < g; j++) {
    const y = 1 - (j / (g - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = j * 2.399963;
    const x = Math.cos(th) * r, z = Math.sin(th) * r;
    S.globe.put(x * 3.4 + 0.6, y * 3.4, z * 3.4, C.ink.clone().lerp(C.accent, (y + 1) / 2));
  }
  const ro = Math.floor((n - g) / 4);
  CHANNELS.forEach((k, i) => S.globe.ring(ro, 0.6, 0, 4.4 + i * 0.35, C[k], 0.03, 1.05 + i * 0.5));
  S.globe.fill(C.soft);

  // Fragmented: four large channel icons spread across the space.
  S.frag = new Shape(n);
  const fragAt = [[-7.6, 2.3], [-2.4, -2.4], [2.8, 2.4], [7.8, -2.2]];
  CHANNELS.forEach((k, i) => S.frag.icon(k, q, fragAt[i][0], fragAt[i][1], 4.4, C[k], 0.9));
  S.frag.fill(C.soft);

  // Connected: icons line up and feed one ring.
  S.conn = new Shape(n);
  const colY = [3.4, 1.15, -1.15, -3.4];
  const ic = Math.floor(n * 0.13);
  CHANNELS.forEach((k, i) => S.conn.icon(k, ic, -7.8, colY[i], 2.1, C[k], 0.3));
  S.conn.ring(Math.floor(n * 0.22), -1.4, 0, 2.2, C.accent, 0.1);
  S.conn.disc(Math.floor(n * 0.05), -1.4, 0, 0.55, C.accent);
  const sp = Math.floor(n * 0.05);
  CHANNELS.forEach((k, i) => S.conn.curve(sp, [-6.6, colY[i]], [-3.5, colY[i] * 0.35], C[k]));
  S.conn.fill(C.soft);

  // Routed: the ring sends conversations to an AI agent or the team, then to an outcome.
  S.route = new Shape(n);
  CHANNELS.forEach((k, i) => S.route.icon(k, Math.floor(n * 0.09), -7.8, colY[i], 2.1, C[k], 0.3));
  S.route.ring(Math.floor(n * 0.14), -1.4, 0, 2.2, C.accent, 0.1);
  S.route.disc(Math.floor(n * 0.04), -1.4, 0, 0.55, C.accent);
  CHANNELS.forEach((k, i) => S.route.curve(Math.floor(n * 0.025), [-6.6, colY[i]], [-3.5, colY[i] * 0.35], C[k]));
  S.route.curve(Math.floor(n * 0.05), [0.8, 0], [4.2, 2.3], C.accent);
  S.route.curve(Math.floor(n * 0.05), [0.8, 0], [4.2, -2.3], C.accent);
  S.route.icon('ai', Math.floor(n * 0.07), 5.2, 2.3, 1.9, C.ink, 0.25);
  S.route.disc(Math.floor(n * 0.06), 5.2, -2.3, 0.85, C.accent);
  S.route.curve(Math.floor(n * 0.04), [6.2, 2.3], [8.6, 0], C.accent);
  S.route.curve(Math.floor(n * 0.04), [6.2, -2.3], [8.6, 0], C.accent);
  S.route.ring(Math.floor(n * 0.06), 9.4, 0, 0.9, C.whatsapp, 0.06);
  S.route.disc(Math.floor(n * 0.03), 9.4, 0, 0.35, C.whatsapp);
  S.route.fill(C.soft);

  // Final: the Telixo mark, with the four channels arriving as streams.
  S.mark = new Shape(n);
  S.mark.icon('mark', n, 0.2, 0, 8.4, C.ink, 0.35);
  S.mark.fill(C.soft);
  // colour the four input lines by channel (they sit left of the ring)
  for (let j = 0; j < S.mark.n; j++) {
    const x = S.mark.pos[j * 3], y = S.mark.pos[j * 3 + 1];
    if (x < 0.6) {
      const k = y > 1.6 ? 0 : y > 0 ? 1 : y > -1.6 ? 2 : 3;
      const c = C[CHANNELS[k]];
      S.mark.col[j * 3] = c.r; S.mark.col[j * 3 + 1] = c.g; S.mark.col[j * 3 + 2] = c.b;
    } else if (Math.hypot(x - 2.05, y) < 0.9) {
      S.mark.col[j * 3] = C.accent.r; S.mark.col[j * 3 + 1] = C.accent.g; S.mark.col[j * 3 + 2] = C.accent.b;
    }
  }

  // Loose cloud (before the final mark assembles).
  S.cloud = new Shape(n);
  for (let j = 0; j < n; j++) {
    const a = Math.random() * Math.PI * 2, r = 3 + Math.random() * 6;
    S.cloud.put(Math.cos(a) * r, Math.sin(a) * r * 0.6, rand(-4, 4), C.soft.clone().lerp(C.accent, Math.random() * 0.5));
  }

  // Shuffle-free pairing works because every shape fills its slots in a
  // different spatial order; that crossing is what makes the morph swirl.
  return S;
}

const VERT = /* glsl */`
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute vec3 cFrom;
  attribute vec3 cTo;
  attribute float aRand;
  uniform float uMix;
  uniform float uTime;
  uniform float uSize;
  uniform vec3 uMouse;
  uniform float uMouseStr;
  uniform vec4 uRipple;
  uniform float uDark;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = aRand * 0.35;
    float m = smoothstep(d, d + 0.65, uMix);
    vec3 p = mix(aFrom, aTo, m);
    float fly = sin(m * 3.14159);
    p.z += fly * (aRand - 0.5) * 4.0;
    p.y += fly * (fract(aRand * 7.31) - 0.5) * 1.2;

    p += 0.05 * vec3(sin(uTime * 1.3 + aRand * 40.0), cos(uTime * 1.1 + aRand * 30.0), sin(uTime * 0.9 + aRand * 20.0));

    vec2 dv = p.xy - uMouse.xy;
    float dist = length(dv);
    float f = uMouseStr * (1.0 - smoothstep(0.0, 2.6, dist));
    p.xy += normalize(dv + 1e-4) * f * 1.7;
    p.z += f * 1.8;

    float rt = uTime - uRipple.w;
    if (rt > 0.0 && rt < 3.0) {
      float rd = length(p.xy - uRipple.xy);
      float front = exp(-pow(rd - rt * 5.0, 2.0) * 0.6);
      p.z += front * exp(-rt * 0.9) * 1.6;
    }

    vColor = mix(cFrom, cTo, m);
    // On a dark background, near-black points turn light so they stay visible.
    float lum = dot(vColor, vec3(0.299, 0.587, 0.114));
    vColor = mix(vColor, vec3(0.86, 0.89, 0.97), uDark * (1.0 - smoothstep(0.08, 0.3, lum)));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * (0.55 + aRand * 0.9) / -mv.z;
    vAlpha = clamp(1.15 - (-mv.z - 26.0) / 14.0, 0.35, 1.0) * (0.75 + 0.25 * (1.0 - fly));
    gl_Position = projectionMatrix * mv;
  }
`;
const FRAG = /* glsl */`
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    if (r > 0.5) discard;
    gl_FragColor = vec4(vColor, smoothstep(0.5, 0.32, r) * vAlpha * uOpacity);
  }
`;

const DESIGN = { hero: [11.6, 10.4, 0.6], narrow: [12.4, 11, 0.6], story: [21, 10, 0.8], cta: [10, 9.4, 0.2] };

export function initMorph({ canvas, labels, heroArt, story, storyArt, cta, ctaArt }) {
  const narrowStart = window.matchMedia('(max-width: 899px)').matches;
  const n = narrowStart ? N_NARROW : N_WIDE;
  const S = makeShapes(n);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 1, 200);
  camera.position.set(0, 0, 32);
  const viewH = 2 * Math.tan(THREE.MathUtils.degToRad(15)) * 32;

  const geo = new THREE.BufferGeometry();
  const aFrom = new THREE.BufferAttribute(new Float32Array(n * 3), 3);
  const aTo = new THREE.BufferAttribute(new Float32Array(n * 3), 3);
  const cFrom = new THREE.BufferAttribute(new Float32Array(n * 3), 3);
  const cTo = new THREE.BufferAttribute(new Float32Array(n * 3), 3);
  const aRand = new THREE.BufferAttribute(Float32Array.from({ length: n }, () => Math.random()), 1);
  geo.setAttribute('position', aFrom);
  geo.setAttribute('aFrom', aFrom);
  geo.setAttribute('aTo', aTo);
  geo.setAttribute('cFrom', cFrom);
  geo.setAttribute('cTo', cTo);
  geo.setAttribute('aRand', aRand);
  const uniforms = {
    uMix: { value: 0 }, uTime: { value: 0 }, uSize: { value: 150 }, uOpacity: { value: 1 },
    uDark: { value: 0 }, uMouse: { value: new THREE.Vector3(99, 99, 0) }, uMouseStr: { value: 0 }, uRipple: { value: new THREE.Vector4(0, 0, 0, -10) },
  };
  const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, transparent: true, depthWrite: false });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  const rig = new THREE.Group();
  const stage = new THREE.Group();
  stage.add(points);
  rig.add(stage);
  scene.add(rig);

  let pair = '';
  function setPair(a, b) {
    const key = `${a}>${b}`;
    if (key === pair) return;
    pair = key;
    aFrom.array.set(S[a].pos); cFrom.array.set(S[a].col);
    aTo.array.set(S[b].pos); cTo.array.set(S[b].col);
    [aFrom, aTo, cFrom, cTo].forEach((x) => { x.needsUpdate = true; });
  }

  // Labels that sit next to the vector icons.
  const mk = (html, cls) => {
    const el = document.createElement('div');
    el.className = `gl-label ${cls}`;
    el.innerHTML = html;
    el.style.opacity = 0;
    labels.appendChild(el);
    return el;
  };
  const fragAt = [[-7.6, 2.3], [-2.4, -2.4], [2.8, 2.4], [7.8, -2.2]];
  const colY = [3.4, 1.15, -1.15, -3.4];
  const chanLabels = LABELS.map((t) => mk(t, 'is-chan'));
  const routeLabels = [
    { el: mk('<strong>AI agent</strong><span>ROUTINE REQUESTS</span>', 'is-panel'), at: [6.4, 2.6] },
    { el: mk('<strong>Human team</strong><span>COMPLEX CONVERSATIONS</span>', 'is-panel'), at: [6.4, -2.0] },
    { el: mk('<strong>Outcome</strong><span>CLOSED · RESOLVED</span>', 'is-panel'), at: [8.4, -1.4] },
  ];

  // Interaction: cursor scatters points; click (or tap) sends a ripple.
  const pointer = { x: 0, y: 0, nx: 0, ny: 0, inside: false };
  const ndc = new THREE.Vector2();
  const ray = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const hit = new THREE.Vector3();
  let rippleAt = null;
  window.addEventListener('pointermove', (e) => {
    pointer.x = e.clientX; pointer.y = e.clientY;
    pointer.nx = e.clientX / window.innerWidth - 0.5;
    pointer.ny = e.clientY / window.innerHeight - 0.5;
    pointer.inside = true;
  }, { passive: true });
  document.addEventListener('pointerleave', () => { pointer.inside = false; });
  [heroArt, ctaArt, storyArt].forEach((el) => el.addEventListener('pointerdown', (e) => { rippleAt = [e.clientX, e.clientY]; }));
  const toLocal = (cx, cy) => {
    ndc.set((cx / vw) * 2 - 1, -(cy / vh) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    stage.updateMatrixWorld();
    plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 0, 1).applyQuaternion(stage.getWorldQuaternion(new THREE.Quaternion())), stage.getWorldPosition(new THREE.Vector3()));
    if (!ray.ray.intersectPlane(plane, hit)) return null;
    return stage.worldToLocal(hit.clone());
  };

  // Sizing
  let vw = 0, vh = 0, storyTop = 0, storyLen = 1;
  const wideQuery = window.matchMedia('(min-width: 900px)');
  function resize() {
    vw = window.innerWidth; vh = window.innerHeight;
    renderer.setSize(vw, vh, false);
    camera.aspect = vw / vh;
    camera.updateProjectionMatrix();
    storyTop = story.getBoundingClientRect().top + window.scrollY;
    storyLen = Math.max(1, story.offsetHeight - vh);
    uniforms.uSize.value = (vw < 900 ? 110 : 150) * renderer.getPixelRatio();
  }
  window.addEventListener('resize', resize);
  window.addEventListener('load', resize);
  document.fonts?.ready.then(resize);
  resize();

  const fit = (r, [w, h, cx]) => {
    const wpp = viewH / vh;
    const s = Math.min((r.width * wpp) / w, (r.height * wpp) / h);
    return { x: (r.left + r.width / 2 - vw / 2) * wpp - cx * s, y: -(r.top + r.height / 2 - vh / 2) * wpp, s };
  };

  const intro = { t: motionOK() ? 0 : 1 };
  if (motionOK()) gsap.to(intro, { t: 1, duration: 2.4, ease: 'power3.out', delay: 0.2 });

  const proj = new THREE.Vector3();
  function place(el, x, y, alpha) {
    if (alpha < 0.02) { el.style.opacity = 0; return; }
    proj.set(x, y, 0);
    stage.localToWorld(proj);
    proj.project(camera);
    el.style.opacity = alpha.toFixed(3);
    el.style.transform = `translate(${((proj.x * 0.5 + 0.5) * vw).toFixed(1)}px, ${((-proj.y * 0.5 + 0.5) * vh).toFixed(1)}px)`;
  }

  let lastY = -1, mouseStr = 0;
  gsap.ticker.add((time) => {
    const moving = motionOK();
    const y = window.scrollY;
    if (!moving && y === lastY && intro.t >= 1) return;
    lastY = y;
    const wide = wideQuery.matches;
    const hR = heroArt.getBoundingClientRect();
    const sR = storyArt.getBoundingClientRect();
    const cR = ctaArt.getBoundingClientRect();
    const cS = cta.getBoundingClientRect();
    const leave = clamp(y / Math.max(1, storyTop));
    const p = clamp((y - storyTop) / storyLen) * 3;

    let dark = 0, want, anchor, mix, alpha = 1, fragW = 0, routeW = 0, connW = 0, heroW = 0;
    if (wide && sR.bottom > 0 && y < storyTop + storyLen + vh) {
      const k = ease(leave);
      const a = fit(hR, DESIGN.hero), b = fit(sR, DESIGN.story);
      anchor = { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), s: lerp(a.s, b.s, k) };
      heroW = 1 - k;
      if (leave < 0.02 && intro.t < 1) {
        want = ['cloud', 'globe']; mix = intro.t;
      } else if (leave < 1) {
        want = ['globe', 'frag']; mix = leave; fragW = smooth(0.6, 1, leave);
      } else if (p < 1.6) {
        want = ['frag', 'conn']; mix = smooth(0.45, 1.3, p); fragW = 1 - smooth(0.45, 0.9, p); connW = smooth(1.0, 1.3, p);
      } else {
        want = ['conn', 'route']; mix = smooth(2.0, 2.7, p); connW = 1; routeW = smooth(2.4, 2.75, p);
      }
      dark = leave < 1 ? 0 : smooth(1.95, 2.3, p);
    } else if (!wide && hR.bottom > 0) {
      anchor = fit(hR, DESIGN.narrow);
      if (leave < 0.02 && intro.t < 1) { want = ['cloud', 'globe']; mix = intro.t; } else { want = ['globe', 'cloud']; mix = leave * 0.8; }
      alpha = 1 - smooth(0.4, 0.95, leave);
      heroW = 1;
    } else if (cR.top < vh && cR.bottom > 0) {
      anchor = fit(cR, wide ? DESIGN.cta : DESIGN.narrow);
      want = ['cloud', 'mark'];
      mix = ease(clamp((vh - cS.top) / (vh * 0.85)));
      heroW = 0.6;
    } else {
      canvas.style.opacity = 0;
      labels.style.opacity = 0;
      return;
    }

    setPair(...want);

    rig.position.set(anchor.x, anchor.y, 0);
    rig.scale.setScalar(anchor.s);
    const t = moving ? time : 0;
    stage.rotation.y = heroW * (Math.sin(t * 0.25) * 0.5 + pointer.nx * 0.5) + (1 - heroW) * pointer.nx * 0.12;
    stage.rotation.x = heroW * pointer.ny * 0.3 + (1 - heroW) * pointer.ny * 0.08;

    uniforms.uMix.value = mix;
    uniforms.uTime.value = t;
    uniforms.uOpacity.value = 1;
    uniforms.uDark.value = dark;

    // Cursor: only inside the cloud's area, eased in and out.
    let target = 0;
    if (moving && pointer.inside && wide) {
      const local = toLocal(pointer.x, pointer.y);
      if (local) { uniforms.uMouse.value.lerp(local, 0.25); target = 1; }
    }
    mouseStr += (target - mouseStr) * 0.08;
    uniforms.uMouseStr.value = mouseStr;
    if (rippleAt && moving) {
      const local = toLocal(...rippleAt);
      if (local) uniforms.uRipple.value.set(local.x, local.y, 0, t);
      rippleAt = null;
    }

    renderer.render(scene, camera);
    canvas.style.opacity = alpha;
    labels.style.opacity = alpha;

    chanLabels.forEach((el, i) => {
      if (fragW > 0.02) place(el, fragAt[i][0] - 2.1, fragAt[i][1] + 2.5, fragW);
      else place(el, -6.5, colY[i] + 0.6, connW);
    });
    routeLabels.forEach((r) => place(r.el, r.at[0], r.at[1], routeW));
  });

  document.documentElement.classList.add('webgl');
  return true;
}
