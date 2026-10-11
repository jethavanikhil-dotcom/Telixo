// THE COMMUNICATION CIRCUIT — 3D edition.
// One Three.js scene, drawn on a fixed transparent canvas above the page and
// pinned to the artwork slots in the hero, the scroll story and the final CTA.
// The same objects travel between those slots, so the visitor follows one
// physical "installation" from fragmented channels to one connected system.

import * as THREE from 'three';
import { RoomEnvironment } from '../vendor/three/RoomEnvironment.js';
import { RoundedBoxGeometry } from '../vendor/three/RoundedBoxGeometry.js';
import { motionOK, clamp, lerp, fract } from './svg.js';

const KINDS = ['calls', 'sms', 'whatsapp', 'ai'];
const LABELS = ['01  CALLS', '02  SMS', '03  WHATSAPP', '04  AI AGENTS'];
const RATE = [0.83, 1.27, 0.61, 0.97];
const OFFSET = [0.1, 0.55, 0.3, 0.8];
const BEAT = 0.75;

const V = (x, y, z = 0) => new THREE.Vector3(x, y, z);
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Layout in stage units. Hero/CTA use a compact composition, the story a wide one.
const LAYOUT = {
  heroPos: [V(-5.4, 3.45, 0.6), V(-4.2, 1.15, -0.5), V(-5.2, -1.15, 0.4), V(-4.0, -3.45, -0.6)],
  heroYaw: [0.2, 0.12, 0.18, 0.1],
  heroCore: V(2.3, 0, 0),
  heroScatter: [V(-1.6, 1.4, 1.4), V(-1.0, 0.3, -1.6), V(-1.8, -0.5, 1.2), V(-0.8, -1.6, -1.4)],
  scatter: [V(-8.4, 2.5, -1.2), V(-2.6, -2.9, 1.4), V(3.0, 2.9, -1.8), V(8.0, -2.5, 0.8)],
  scatterRot: [[0.25, 0.6, -0.14], [-0.2, -0.5, 0.1], [0.3, 0.45, -0.08], [-0.25, -0.7, 0.14]],
  col: [V(-7.6, 3.5), V(-7.6, 1.17), V(-7.6, -1.17), V(-7.6, -3.5)],
  storyCore: V(-1.6, 0, 0),
  ai: V(4.2, 2.2, 0), human: V(4.2, -2.2, 0), outcome: V(8.6, 0, 0),
};
// [width, height, centre x] of each composition, used to fit it into its slot.
const DESIGN = { hero: [14.2, 10.8, 0.2], story: [21.4, 10.4, 0.4] };

// ---------------------------------------------------------------- materials
const ACCENT = new THREE.Color('#425BFF');
const M = {
  clay: new THREE.MeshStandardMaterial({ color: '#F8F9FC', roughness: 0.62, envMapIntensity: 0.5 }),
  edge: new THREE.LineBasicMaterial({ color: '#C9D1DE' }),
  claySoft: new THREE.MeshStandardMaterial({ color: '#EEF1F7', roughness: 0.55, envMapIntensity: 0.5 }),
  grey: new THREE.MeshStandardMaterial({ color: '#C3CBD9', roughness: 0.5 }),
  ink: new THREE.MeshStandardMaterial({ color: '#101828', roughness: 0.35 }),
  accent: new THREE.MeshStandardMaterial({ color: ACCENT, roughness: 0.35, emissive: ACCENT, emissiveIntensity: 0.25 }),
  gloss: new THREE.MeshPhysicalMaterial({
    color: ACCENT, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.06,
    emissive: ACCENT, emissiveIntensity: 0.2, envMapIntensity: 1.2,
  }),
  wa: new THREE.MeshStandardMaterial({ color: '#25D366', roughness: 0.4, emissive: '#25D366', emissiveIntensity: 0.12 }),
  waSoft: new THREE.MeshStandardMaterial({ color: '#E2F8EA', roughness: 0.5 }),
  wire: new THREE.LineBasicMaterial({ color: '#8E9CFF', transparent: true, opacity: 0.85 }),
  wireStrong: new THREE.LineBasicMaterial({ color: ACCENT }),
};

const GEO = {
  tile: new RoundedBoxGeometry(2.8, 1.6, 0.14, 4, 0.06),
  port: new THREE.SphereGeometry(0.075, 20, 12),
  bar: new THREE.BoxGeometry(0.05, 1, 0.05),
  pill: new RoundedBoxGeometry(0.24, 0.36, 0.1, 2, 0.03),
  dot: new THREE.SphereGeometry(0.065, 16, 10),
  node: new THREE.SphereGeometry(0.075, 16, 10),
  panel: new RoundedBoxGeometry(2.9, 1.15, 0.16, 3, 0.05),
};

// Fine outlines keep white objects legible on a white page.
const EDGES = {
  tile: new THREE.EdgesGeometry(GEO.tile, 40),
  panel: new THREE.EdgesGeometry(GEO.panel, 40),
};

// ----------------------------------------------------------------- emitters
function cubic(p0, p1, p2, p3) { return new THREE.CubicBezierCurve3(p0, p1, p2, p3); }

const BUILD = {
  calls(g) {
    const n = 26;
    const bars = new THREE.InstancedMesh(GEO.bar, M.accent, n);
    bars.castShadow = true;
    g.add(bars);
    const d = new THREE.Object3D();
    return (c) => {
      for (let i = 0; i < n; i++) {
        const u = i / (n - 1);
        const env = Math.pow(Math.sin(Math.PI * u), 1.3);
        const h = 0.07 + 0.95 * env * Math.abs(Math.sin(u * 12 - c * 7) * (0.6 + 0.4 * Math.sin(u * 5 + c * 3)));
        d.position.set(-1.1 + u * 2.2, 0, 0.12);
        d.scale.set(1, h, 1);
        d.updateMatrix();
        bars.setMatrixAt(i, d.matrix);
      }
      bars.instanceMatrix.needsUpdate = true;
    };
  },

  sms(g) {
    const low = new THREE.Color('#B4C0FF');
    const pills = Array.from({ length: 6 }, (_, i) => {
      const m = new THREE.Mesh(GEO.pill, M.accent.clone());
      m.position.set(-0.85 + i * 0.34, 0, 0.12);
      m.castShadow = true;
      g.add(m);
      return m;
    });
    return (c) => pills.forEach((m, i) => {
      const k = Math.exp(-fract(c - i * 0.11) * 7);
      m.position.z = 0.12 + 0.16 * k;
      m.material.color.copy(low).lerp(ACCENT, k);
      m.material.emissiveIntensity = 0.05 + 0.6 * k;
    });
  },

  whatsapp(g) {
    const inBubble = new THREE.Mesh(new RoundedBoxGeometry(1.35, 0.56, 0.14, 3, 0.09), M.claySoft);
    inBubble.position.set(-0.45, 0.27, 0.13);
    inBubble.castShadow = true;
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.22, 4), M.claySoft);
    tail.position.set(-0.98, 0.0, 0.13);
    tail.rotation.z = Math.PI * 0.82;
    const dots = [-0.75, -0.48, -0.21].map((x) => {
      const m = new THREE.Mesh(GEO.dot, M.ink);
      m.position.set(x, 0.27, 0.24);
      return m;
    });
    const reply = new THREE.Group();
    const outBubble = new THREE.Mesh(new RoundedBoxGeometry(1.2, 0.46, 0.14, 3, 0.08), M.waSoft);
    outBubble.castShadow = true;
    const l1 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.045, 0.03), M.wa);
    l1.position.set(-0.08, 0.07, 0.09);
    const l2 = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.045, 0.03), M.wa);
    l2.position.set(-0.22, -0.07, 0.09);
    reply.add(outBubble, l1, l2);
    reply.position.set(0.5, -0.33, 0.2);
    g.add(inBubble, tail, ...dots, reply);
    return (c) => {
      dots.forEach((d, i) => { d.position.y = 0.27 + 0.07 * Math.max(0, Math.sin(c * Math.PI * 3 - i * 0.9)); });
      const ph = fract(c * 0.5);
      const o = clamp((ph - 0.4) * 8) * clamp((1 - ph) * 10);
      reply.scale.setScalar(0.35 + 0.65 * o);
      reply.position.z = 0.2 + 0.12 * o;
    };
  },

  ai(g) {
    const root = V(-1.05, 0, 0.12);
    const split = V(-0.4, 0, 0.12);
    const ends = [V(1.0, 0.48, 0.12), V(1.0, 0, 0.12), V(1.0, -0.48, 0.12)];
    const trunk = new THREE.Mesh(new THREE.TubeGeometry(cubic(root, root, split, split), 4, 0.02, 6), M.accent);
    g.add(trunk);
    [root, split].forEach((p) => { const m = new THREE.Mesh(GEO.node, M.ink); m.position.copy(p); g.add(m); });
    const branches = ends.map((e) => {
      const curve = cubic(split, V(split.x + 0.6, 0, 0.12), V(e.x - 0.7, e.y, 0.12), e);
      const mat = M.grey.clone();
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.018, 6), mat);
      const node = new THREE.Mesh(GEO.node, mat);
      node.position.copy(e);
      g.add(tube, node);
      return { curve, mat };
    });
    const runner = new THREE.Mesh(GEO.node, M.accent);
    g.add(runner);
    const grey = new THREE.Color('#C3CBD9');
    let last = -1;
    return (c) => {
      const k = Math.floor(c * 0.8) % 3;
      if (k !== last) {
        branches.forEach((b, i) => {
          b.mat.color.copy(i === k ? ACCENT : grey);
          b.mat.emissive.copy(i === k ? ACCENT : new THREE.Color(0));
          b.mat.emissiveIntensity = i === k ? 0.3 : 0;
        });
        last = k;
      }
      runner.position.copy(branches[k].curve.getPoint(Math.min(1, fract(c * 0.8) * 1.25)));
      runner.position.z = 0.16;
    };
  },
};

function makeEmitter(kind) {
  const g = new THREE.Group();
  const tile = new THREE.Mesh(GEO.tile, M.clay);
  tile.castShadow = true;
  tile.receiveShadow = true;
  tile.add(new THREE.LineSegments(EDGES.tile, M.edge));
  const port = new THREE.Mesh(GEO.port, M.accent);
  port.position.set(1.4, 0, 0);
  g.add(tile, port);
  return { g, update: BUILD[kind](g) };
}

// --------------------------------------------------------------------- core
function squareFrame(s, b, mat) {
  const g = new THREE.Group();
  const h = new THREE.BoxGeometry(s + b, b, b);
  const v = new THREE.BoxGeometry(b, s - b, b);
  [[0, s / 2, h], [0, -s / 2, h], [s / 2, 0, v], [-s / 2, 0, v]].forEach(([x, y, geo]) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, 0);
    m.castShadow = true;
    m.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), M.edge));
    g.add(m);
  });
  return g;
}

function makeCore() {
  const g = new THREE.Group();
  const outer = squareFrame(2.6, 0.09, M.clay);
  const mid = squareFrame(1.9, 0.065, M.clay);
  const inner = squareFrame(1.3, 0.05, M.claySoft);
  const ring = new THREE.Group();
  ring.add(new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.014, 8, 160), M.grey));
  const ticks = new THREE.InstancedMesh(new THREE.BoxGeometry(0.014, 0.014, 0.12), M.grey, 72);
  const d = new THREE.Object3D();
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    d.position.set(Math.cos(a) * 2.05, Math.sin(a) * 2.05, 0);
    d.scale.set(1, 1, i % 6 === 0 ? 2.2 : 1);
    d.updateMatrix();
    ticks.setMatrixAt(i, d.matrix);
  }
  ring.add(ticks);
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.42, 48, 32), M.gloss);
  sphere.castShadow = true;
  const inletY = [0.78, 0.26, -0.26, -0.78];
  inletY.forEach((y) => { const m = new THREE.Mesh(GEO.port, M.accent); m.position.set(-1.3, y, 0); outer.add(m); });
  const out = new THREE.Mesh(GEO.port, M.accent);
  out.position.set(1.3, 0, 0);
  outer.add(out);
  g.add(outer, mid, inner, ring, sphere);

  let bump = 0;
  return {
    g,
    inlet: (i) => V(-1.3, inletY[i]),
    outlet: V(1.3, 0),
    pulse(k = 1) { bump = Math.min(1.6, bump + k); },
    update(t, dt) {
      bump *= Math.exp(-dt * 4);
      mid.rotation.set(t * 0.35, t * 0.18, 0);
      inner.rotation.set(0, -t * 0.5, t * 0.2);
      ring.rotation.set(1.15 + Math.sin(t * 0.3) * 0.12, 0, t * 0.08);
      sphere.scale.setScalar(1 + 0.2 * bump);
      M.gloss.emissiveIntensity = 0.2 + 0.7 * bump;
    },
  };
}

function makePanel() {
  const g = new THREE.Group();
  const slab = new THREE.Mesh(GEO.panel, M.clay);
  slab.castShadow = true;
  slab.receiveShadow = true;
  slab.add(new THREE.LineSegments(EDGES.panel, M.edge));
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.15, 0.2), M.accent);
  bar.position.x = -1.45;
  g.add(slab, bar);
  return g;
}

// -------------------------------------------------------- wires & particles
class Wire {
  constructor(parent, mat, n = 64) {
    this.n = n;
    this.pos = new Float32Array((n + 1) * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    this.line = new THREE.Line(geo, mat);
    this.line.frustumCulled = false;
    parent.add(this.line);
    this.curve = null;
  }

  set(curve, draw = 1) {
    this.curve = curve;
    this.len = curve.v0.distanceTo(curve.v3) * 1.2 + 0.5;
    if (draw <= 0.001) { this.line.visible = false; return; }
    this.line.visible = true;
    for (let i = 0; i <= this.n; i++) {
      const p = curve.getPoint(i / this.n);
      this.pos[i * 3] = p.x; this.pos[i * 3 + 1] = p.y; this.pos[i * 3 + 2] = p.z;
    }
    this.line.geometry.attributes.position.needsUpdate = true;
    this.line.geometry.setDrawRange(0, Math.ceil((this.n + 1) * draw));
  }
}

function link(a, b, k = 0.45) {
  const d = Math.max(0.8, a.distanceTo(b) * k);
  return cubic(a.clone(), a.clone().add(V(d, 0, 0)), b.clone().add(V(-d, 0, 0)), b.clone());
}

// AI route: same ends, a bowed middle, so the three alternatives split and rejoin.
function bowed(a, b, off) {
  const d = Math.max(0.8, a.distanceTo(b) * 0.45);
  return cubic(a.clone(), a.clone().add(V(d, off * 1.6, off)), b.clone().add(V(-d, off * 1.6, -off)), b.clone());
}

function particleMesh(kind) {
  switch (kind) {
    case 0: return new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 10), M.accent);
    case 1: return new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.13, 0.1, 2, 0.03), M.accent);
    case 2: return new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.16, 0.1, 2, 0.05), M.wa);
    case 3: return new THREE.Mesh(new THREE.OctahedronGeometry(0.12), M.ink);
    default: return new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 8), M.accent);
  }
}

class Particles {
  constructor(parent) { this.parent = parent; this.items = []; }

  // legs: functions returning the live Wire for each leg (wires move with the layout).
  add({ kind, legs, speed = 7, duration, wait = 0, onLeg, onDone }) {
    const mesh = particleMesh(kind);
    mesh.visible = false;
    this.parent.add(mesh);
    this.items.push({ mesh, legs, speed, duration, wait, leg: 0, u: 0, onLeg, onDone });
  }

  update(dt) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const p = this.items[i];
      if (p.wait > 0) { p.wait -= dt; continue; }
      const w = p.legs[p.leg]();
      if (!w.curve) continue;
      p.u += p.duration ? dt / (p.duration / p.legs.length) : (dt * p.speed) / w.len;
      if (p.u >= 1) {
        p.onLeg?.(p.leg);
        p.leg += 1;
        p.u = 0;
        if (p.leg >= p.legs.length) {
          this.parent.remove(p.mesh);
          this.items.splice(i, 1);
          p.onDone?.();
          continue;
        }
      }
      p.mesh.visible = true;
      p.mesh.position.copy(p.legs[p.leg]().curve.getPoint(p.u));
      p.mesh.rotation.y += dt * 2;
    }
  }

  clear() {
    this.items.forEach((p) => this.parent.remove(p.mesh));
    this.items = [];
  }
}

// --------------------------------------------------------------------- init
export function supportsWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch { return false; }
}

export function initScene({ canvas, labels, heroArt, story, storyArt, cta, ctaArt }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(30, 1, 1, 200);
  camera.position.set(0, 0, 32);
  const viewH = 2 * Math.tan(THREE.MathUtils.degToRad(15)) * 32;

  scene.add(new THREE.HemisphereLight('#ffffff', '#D5DCE8', 1.1));
  const rig = new THREE.Group();
  const stage = new THREE.Group();
  rig.add(stage);
  scene.add(rig);

  const key = new THREE.DirectionalLight('#ffffff', 1.7);
  key.position.set(4, 12, 10);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -18, right: 18, top: 14, bottom: -14, near: 0.5, far: 80 });
  key.shadow.radius = 5;
  key.shadow.blurSamples = 12;
  key.shadow.bias = -0.0006;
  rig.add(key, key.target);
  const fill = new THREE.DirectionalLight('#EEF2FF', 0.7);
  fill.position.set(-10, 2, 6);
  rig.add(fill);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 30), new THREE.ShadowMaterial({ opacity: 0.05 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -5.2;
  ground.receiveShadow = true;
  stage.add(ground);

  // Objects
  const emitters = KINDS.map((k) => makeEmitter(k));
  emitters.forEach((e) => stage.add(e.g));
  const core = makeCore();
  stage.add(core.g);
  const panels = { ai: makePanel(), human: makePanel(), outcome: makePanel() };
  Object.values(panels).forEach((p) => stage.add(p));
  const endNode = new THREE.Mesh(GEO.port, M.accent);
  stage.add(endNode);

  const wires = KINDS.map((k, i) => (i === 3
    ? [new Wire(stage, M.wire), new Wire(stage, M.wire), new Wire(stage, M.wire)]
    : [new Wire(stage, M.wire)]));
  const heroOutWire = new Wire(stage, M.wireStrong, 8);
  const outWires = { ai: new Wire(stage, M.wireStrong), human: new Wire(stage, M.wireStrong), aiOut: new Wire(stage, M.wireStrong), humanOut: new Wire(stage, M.wireStrong) };
  const particles = new Particles(stage);

  // Pings: expanding rings where a signal lands.
  const pings = [];
  const ringGeo = new THREE.TorusGeometry(0.12, 0.012, 6, 32);
  function ping(pos) {
    if (!motionOK()) return;
    const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true }));
    m.position.copy(pos);
    stage.add(m);
    pings.push({ m, life: 0 });
  }

  // DOM labels for the 3D objects (crisp text at any scale).
  const mkLabel = (html, cls) => {
    const el = document.createElement('div');
    el.className = `gl-label ${cls}`;
    el.innerHTML = html;
    labels.appendChild(el);
    return el;
  };
  const emitterLabels = LABELS.map((t) => mkLabel(t, 'is-chan'));
  const panelLabels = {
    ai: mkLabel('<strong>AI agent</strong><span>ROUTINE REQUESTS</span>', 'is-panel'),
    human: mkLabel('<strong>Human team</strong><span>COMPLEX CONVERSATIONS</span>', 'is-panel'),
    outcome: mkLabel('<strong>Outcome</strong><span>CLOSED · RESOLVED</span>', 'is-panel'),
  };

  // ------------------------------------------------------------ interaction
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const drag = { on: false, x: 0, yaw: 0, vel: 0 };
  window.addEventListener('pointermove', (e) => {
    pointer.tx = e.clientX / window.innerWidth - 0.5;
    pointer.ty = e.clientY / window.innerHeight - 0.5;
    if (drag.on) {
      const dx = e.clientX - drag.x;
      drag.x = e.clientX;
      drag.vel = dx * 0.006;
      drag.yaw = clamp(drag.yaw + drag.vel, -1.1, 1.1);
    }
  }, { passive: true });
  [heroArt, ctaArt].forEach((area) => {
    area.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return; // touch keeps native scrolling
      drag.on = true;
      drag.x = e.clientX;
      area.classList.add('is-dragging');
    });
  });
  window.addEventListener('pointerup', () => {
    drag.on = false;
    heroArt.classList.remove('is-dragging');
    ctaArt.classList.remove('is-dragging');
  });

  // ---------------------------------------------------------------- sizing
  let vw = 0, vh = 0, storyTop = 0, storyLen = 1;
  const wideQuery = window.matchMedia('(min-width: 900px)');
  function resize() {
    vw = window.innerWidth;
    vh = window.innerHeight;
    renderer.setSize(vw, vh, false);
    camera.aspect = vw / vh;
    camera.updateProjectionMatrix();
    storyTop = story.getBoundingClientRect().top + window.scrollY;
    storyLen = Math.max(1, story.offsetHeight - vh);
  }
  window.addEventListener('resize', resize);
  resize();
  if (document.fonts) document.fonts.ready.then(resize);
  window.addEventListener('load', resize);

  const fit = (r, [w, h, cx]) => {
    const wpp = viewH / vh;
    const s = Math.min((r.width * wpp) / w, (r.height * wpp) / h);
    return { x: (r.left + r.width / 2 - vw / 2) * wpp - cx * s, y: -(r.top + r.height / 2 - vh / 2) * wpp, s };
  };

  // ------------------------------------------------------------------ frame
  const tmp = V(0, 0, 0);
  const proj = V(0, 0, 0);
  let mode = 'hero';
  let next = [0.3, 1.0, 1.7, 2.4];
  let nextBeat = 0;
  let nextStory = 0;
  const intro = { t: motionOK() ? 0 : 1 };
  if (motionOK()) gsap.to(intro, { t: 1, duration: 2.2, ease: 'power2.out', delay: 0.25 });

  function emitHero(i, t) {
    const w = i === 3 ? wires[3][Math.floor(Math.random() * 3)] : wires[i][0];
    particles.add({
      kind: i, legs: [() => w], speed: 5 + Math.random() * 2,
      onDone: () => {
        core.pulse(0.7);
        ping(core.g.position.clone().add(core.inlet(i)));
        if (Math.random() < 0.6) particles.add({ kind: 9, legs: [() => heroOutWire], speed: 6 });
      },
    });
    next[i] = t + 1.2 + Math.random() * 1.8;
  }

  function emitStory(routed) {
    const i = Math.floor(Math.random() * 4);
    const w = i === 3 ? wires[3][Math.floor(Math.random() * 3)] : wires[i][0];
    const legs = [() => w];
    if (routed) {
      const agent = Math.random() < 0.65;
      legs.push(() => (agent ? outWires.ai : outWires.human), () => (agent ? outWires.aiOut : outWires.humanOut));
    }
    particles.add({
      kind: i, legs, speed: 9,
      onLeg: (leg) => { if (leg === 0) { core.pulse(0.5); ping(core.g.position.clone().add(core.inlet(i))); } },
    });
  }

  function emitBeat() {
    KINDS.forEach((_, i) => {
      const w = i === 3 ? wires[3][1] : wires[i][0];
      particles.add({
        kind: i, legs: [() => w], duration: 1.5,
        onDone: i === 0 ? () => {
          core.pulse(1.3);
          for (let k = 0; k < 3; k++) particles.add({ kind: 9, legs: [() => heroOutWire], speed: 6, wait: k * 0.16 });
        } : undefined,
      });
    });
  }

  function placeLabel(el, obj, local, alpha) {
    if (alpha < 0.02) { el.style.opacity = 0; return; }
    proj.copy(local);
    obj.localToWorld(proj);
    proj.project(camera);
    const x = (proj.x * 0.5 + 0.5) * vw;
    const y = (-proj.y * 0.5 + 0.5) * vh;
    el.style.opacity = alpha;
    el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
  }

  let lastY = -1;
  let lastTime = 0;
  function frame(time, deltaMs) {
    const moving = motionOK();
    const dt = Math.min(deltaMs, 64) / 1000;
    const y = window.scrollY;
    if (!moving && y === lastY && time - lastTime < 1) return;
    lastY = y;
    lastTime = time;
    const t = moving ? time : 1.2;
    const wide = wideQuery.matches;

    const hR = heroArt.getBoundingClientRect();
    const sR = storyArt.getBoundingClientRect();
    const cR = ctaArt.getBoundingClientRect();
    const cS = cta.getBoundingClientRect();

    const leave = clamp(y / Math.max(1, storyTop));
    const storyP = clamp((y - storyTop) / storyLen) * 3;
    let nextMode;
    if (wide && sR.bottom > 0 && y < storyTop + storyLen + vh) nextMode = 'main';
    else if (!wide && hR.bottom > 0) nextMode = 'mobile';
    else if (cR.top < vh && cR.bottom > 0) nextMode = 'cta';
    else nextMode = 'off';
    if (nextMode !== mode) { particles.clear(); mode = nextMode; }

    if (mode === 'off') {
      canvas.style.opacity = 0;
      labels.style.opacity = 0;
      return;
    }

    // ---- layout state for this frame
    let anchor;
    let alpha = 1, link1 = 1, coreVis = 1, heroOut = 1, route = 0, sync = 0, interact = 1;
    const it = ease(intro.t);
    const pos = [], rot = [];
    let corePos = LAYOUT.heroCore;

    if (mode === 'main') {
      const k = ease(leave);
      const a = fit(hR, DESIGN.hero);
      const b = fit(sR, DESIGN.story);
      anchor = { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), s: lerp(a.s, b.s, k) };
      interact = 1 - smooth(0, 0.3, leave);
      if (leave < 1) {
        KINDS.forEach((_, i) => {
          pos.push(LAYOUT.heroPos[i].clone().lerp(LAYOUT.scatter[i], k));
          const sr = LAYOUT.scatterRot[i];
          rot.push([sr[0] * k, lerp(LAYOUT.heroYaw[i], sr[1], k), sr[2] * k]);
        });
        corePos = LAYOUT.heroCore.clone().lerp(LAYOUT.storyCore, k);
        coreVis = 1 - smooth(0, 0.6, leave);
        link1 = 1 - smooth(0, 0.45, leave);
        heroOut = 1 - smooth(0, 0.35, leave);
      } else {
        KINDS.forEach((_, i) => {
          const m = smooth(0.4 + i * 0.06, 1.25 + i * 0.06, storyP);
          const drift = (1 - m) * 0.15;
          pos.push(LAYOUT.scatter[i].clone().lerp(LAYOUT.col[i], m).add(V(0, Math.sin(t * 0.7 + i * 1.7) * drift, 0)));
          const sr = LAYOUT.scatterRot[i];
          rot.push([sr[0] * (1 - m), lerp(sr[1], 0.1, m), sr[2] * (1 - m)]);
        });
        corePos = LAYOUT.storyCore;
        coreVis = smooth(0.95, 1.45, storyP);
        link1 = smooth(1.2, 1.7, storyP);
        heroOut = 0;
        sync = smooth(1.0, 1.6, storyP);
        route = storyP;
      }
    } else {
      const area = mode === 'cta' ? cR : hR;
      anchor = fit(area, DESIGN.hero);
      let spread;
      if (mode === 'cta') {
        const a = clamp((vh - cS.top) / (vh * 0.8));
        spread = 1 - ease(a);
        link1 = smooth(0.45, 0.95, a);
        coreVis = 0.15 + 0.85 * smooth(0, 0.6, a);
        sync = 1;
      } else {
        spread = ease(leave);
        alpha = 1 - smooth(0.35, 0.9, leave);
        link1 = 1 - smooth(0, 0.5, leave);
        coreVis = 1 - 0.3 * leave;
      }
      heroOut = link1;
      KINDS.forEach((_, i) => {
        pos.push(LAYOUT.heroPos[i].clone().add(LAYOUT.heroScatter[i].clone().multiplyScalar(spread)));
        const sr = LAYOUT.scatterRot[i];
        rot.push([sr[0] * spread, lerp(LAYOUT.heroYaw[i], sr[1], spread), sr[2] * spread]);
      });
    }

    // Hero entrance: tiles rise into place and the lines draw in.
    if (mode !== 'cta' && it < 1) {
      pos.forEach((p, i) => { p.y -= (1 - smooth(i * 0.08, 0.6 + i * 0.08, it)) * 1.2; });
      link1 *= smooth(0.35, 1, it);
      heroOut *= smooth(0.6, 1, it);
      coreVis *= smooth(0, 0.7, it);
    }

    // ---- apply
    rig.position.set(anchor.x, anchor.y, 0);
    rig.scale.setScalar(anchor.s);
    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;
    if (!drag.on) { drag.yaw *= 0.95; }
    stage.rotation.y = (drag.yaw + pointer.x * 0.35) * interact;
    stage.rotation.x = (pointer.y * 0.18 + 0.04) * interact;

    emitters.forEach((e, i) => {
      e.g.position.copy(pos[i]);
      e.g.rotation.set(...rot[i]);
      e.g.scale.setScalar(it < 1 && mode !== 'cta' ? 0.85 + 0.15 * smooth(i * 0.08, 0.6 + i * 0.08, it) : 1);
      const c = lerp(t * RATE[i] + OFFSET[i], t * BEAT, sync);
      e.update(c);
    });

    core.g.position.copy(corePos);
    core.g.visible = coreVis > 0.01;
    core.g.scale.setScalar(Math.max(0.001, 0.4 + 0.6 * coreVis));
    core.update(t, moving ? dt : 0);

    // Wires: emitter ports into the core inlets.
    KINDS.forEach((_, i) => {
      const a = tmp.set(1.4, 0, 0).applyEuler(emitters[i].g.rotation).multiplyScalar(emitters[i].g.scale.x).add(pos[i]).clone();
      const b = core.inlet(i).multiplyScalar(core.g.scale.x).add(corePos);
      if (i === 3) [-0.55, 0, 0.55].forEach((off, j) => wires[3][j].set(bowed(a, b, off), link1));
      else wires[i][0].set(link(a, b), link1);
    });

    const outA = core.outlet.clone().multiplyScalar(core.g.scale.x).add(corePos);
    heroOutWire.set(link(outA, outA.clone().add(V(3.4, 0, 0))), heroOut);
    endNode.visible = heroOut > 0.9;
    endNode.position.copy(outA).add(V(3.4, 0, 0));

    const showRoute = mode === 'main' && route > 2.05;
    const pIn = smooth(2.1, 2.4, route);
    const pOut = smooth(2.35, 2.7, route);
    Object.entries(panels).forEach(([name, g]) => {
      const vis = name === 'outcome' ? pOut : pIn;
      g.visible = showRoute && vis > 0.01;
      g.position.copy(LAYOUT[name]);
      g.scale.setScalar(0.7 + 0.3 * vis);
    });
    if (showRoute) {
      outWires.ai.set(link(outA, LAYOUT.ai.clone().add(V(-1.45, 0, 0))), pIn);
      outWires.human.set(link(outA, LAYOUT.human.clone().add(V(-1.45, 0, 0))), pIn);
      outWires.aiOut.set(link(LAYOUT.ai.clone().add(V(1.45, 0, 0)), LAYOUT.outcome.clone().add(V(-1.45, 0, 0))), pOut);
      outWires.humanOut.set(link(LAYOUT.human.clone().add(V(1.45, 0, 0)), LAYOUT.outcome.clone().add(V(-1.45, 0, 0))), pOut);
    } else {
      Object.values(outWires).forEach((w) => w.set(w.curve || link(V(0, 0), V(1, 0)), 0));
    }

    // ---- signals
    if (moving) {
      if ((mode === 'hero' || mode === 'mobile' || (mode === 'main' && leave < 0.05)) && it > 0.9) {
        KINDS.forEach((_, i) => { if (t > next[i]) emitHero(i, t); });
      } else if (mode === 'main' && storyP > 1.6 && t > nextStory) {
        emitStory(storyP > 2.6);
        nextStory = t + (storyP > 2.6 ? 0.3 : 0.45);
      } else if (mode === 'cta' && link1 > 0.98 && t > nextBeat) {
        emitBeat();
        nextBeat = t + 2.4;
      }
      if (mode === 'main' && leave > 0.05 && storyP < 1.5 && particles.items.length) particles.clear();
      particles.update(dt);
      for (let i = pings.length - 1; i >= 0; i--) {
        const p = pings[i];
        p.life += dt / 0.8;
        p.m.scale.setScalar(1 + p.life * 3.5);
        p.m.material.opacity = 1 - p.life;
        if (p.life >= 1) { stage.remove(p.m); pings.splice(i, 1); }
      }
    }

    renderer.render(scene, camera);
    canvas.style.opacity = alpha;
    labels.style.opacity = alpha;

    emitters.forEach((e, i) => placeLabel(emitterLabels[i], e.g, V(-1.4, 1.02, 0.05), Math.min(1, it * 1.5)));
    Object.entries(panelLabels).forEach(([name, el]) => {
      const vis = showRoute ? (name === 'outcome' ? pOut : pIn) : 0;
      placeLabel(el, panels[name], V(-1.18, 0.34, 0.1), vis);
    });
  }

  gsap.ticker.add(frame);
  document.documentElement.classList.add('webgl');
  return true;
}
