// TELIXO SIGNAL ROOM
// The whole page is one continuous 3D space. Scrolling moves the camera
// through eight stops; at each stop it slows down (dwell) and the HTML copy
// for that stop fades in above the scene. Between stops the camera flies.

import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from '../assets/vendor/three/CSS3DRenderer.js';
import { FontLoader } from '../assets/vendor/three/FontLoader.js';
import { TextGeometry } from '../assets/vendor/three/TextGeometry.js';
import { RoomEnvironment } from '../assets/vendor/three/RoomEnvironment.js';
import { RoundedBoxGeometry } from '../assets/vendor/three/RoundedBoxGeometry.js';
import {
  supportsWebGL, KINDS, LABELS, RATE, OFFSET, BEAT, LAYOUT, M,
  makeEmitter, makeCore, makePanel, Wire, Particles, link, bowed,
} from '../assets/js/scene3d.js';
import { createInbox } from '../assets/js/inbox.js';
import { initUI } from '../assets/js/ui.js';
import { motionOK, clamp, lerp } from '../assets/js/svg.js';

gsap.registerPlugin(ScrollTrigger);

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const WHITE = new THREE.Color('#FFFFFF');
const NIGHT = new THREE.Color('#0B1020');
const GRID_DAY = new THREE.Color('#EEF1F6');
const GRID_NIGHT = new THREE.Color('#1B2338');
const GREEN = new THREE.Color('#12B76A');
const GREY = new THREE.Color('#C3CBD9');
const ACCENT = new THREE.Color('#425BFF');

const FEED = [
  ['whatsapp', 'Delivery change request', 'AI agent', 'Resolved'],
  ['calls', 'Enterprise pricing question', 'Sales · Sam', 'Assigned'],
  ['sms', 'Appointment reminder reply', 'AI agent', 'Confirmed'],
  ['ai', 'Password reset', 'AI agent', 'Resolved'],
  ['calls', 'Billing dispute', 'Support · Priya', 'Escalated'],
  ['whatsapp', 'Order status', 'AI agent', 'Resolved'],
  ['sms', 'Quote follow-up', 'Sales · Sam', 'Scheduled'],
];

initUI();
main().catch((err) => {
  console.error(err);
  document.documentElement.classList.add('no-gl');
});

async function main() {
  const loaderBar = $('.loader-bar i');
  const setLoad = (p) => loaderBar.style.setProperty('--p', p);

  if (!supportsWebGL()) {
    document.documentElement.classList.add('no-gl');
    return;
  }

  const load = (n) => fetch(`../assets/data/${n}.json`).then((r) => r.json());
  const [channelData, inboxData, workflowData] = await Promise.all([load('channels'), load('inbox'), load('workflow')]);
  setLoad(0.45);
  const font = await new FontLoader().loadAsync('../assets/vendor/three/helvetiker_bold.typeface.json');
  setLoad(0.75);

  // ------------------------------------------------------------ renderer
  const canvas = $('.room-gl');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const css3d = new CSS3DRenderer();
  $('.room-css3d').appendChild(css3d.domElement);

  const scene = new THREE.Scene();
  scene.background = WHITE.clone();
  scene.fog = new THREE.Fog(WHITE.clone(), 26, 92);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 400);
  scene.add(new THREE.HemisphereLight('#ffffff', '#D5DCE8', 1.1));
  const key = new THREE.DirectionalLight('#ffffff', 1.7);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -24, right: 24, top: 16, bottom: -16, near: 0.5, far: 90 });
  key.shadow.radius = 5;
  key.shadow.blurSamples = 12;
  key.shadow.bias = -0.0006;
  scene.add(key, key.target);
  const fill = new THREE.DirectionalLight('#EEF2FF', 0.6);
  fill.position.set(-20, 6, 10);
  scene.add(fill);

  // ------------------------------------------------------------ the room
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), new THREE.ShadowMaterial({ opacity: 0.06 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -3, -180);
  floor.receiveShadow = true;
  scene.add(floor);

  const gridPts = [];
  for (let x = -150; x <= 150; x += 5) gridPts.push(x, -2.98, 60, x, -2.98, -440);
  for (let z = 60; z >= -440; z -= 5) gridPts.push(-150, -2.98, z, 150, -2.98, z);
  const gridGeo = new THREE.BufferGeometry();
  gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridPts, 3));
  const gridMat = new THREE.LineBasicMaterial({ color: GRID_DAY.clone() });
  scene.add(new THREE.LineSegments(gridGeo, gridMat));

  const DUST = 1100;
  const dustArr = new Float32Array(DUST * 3);
  const dustBase = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) {
    dustBase[i * 3] = (Math.random() - 0.5) * 90;
    dustBase[i * 3 + 1] = -2.5 + Math.random() * 18;
    dustBase[i * 3 + 2] = 40 - Math.random() * 470;
  }
  dustArr.set(dustBase);
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustArr, 3));
  const dustMat = new THREE.PointsMaterial({ color: ACCENT, size: 0.07, transparent: true, opacity: 0.3, depthWrite: false });
  const dust = new THREE.Points(dustGeo, dustMat);
  dust.frustumCulled = false;
  scene.add(dust);

  // ------------------------------------------------------------ helpers
  const tmp = V();
  const labelsRoot = $('.room-labels');
  const labels = [];
  function addLabel(html, cls, obj, local) {
    const el = document.createElement('div');
    el.className = `gl-label ${cls}`;
    el.innerHTML = html;
    el.style.opacity = 0;
    labelsRoot.appendChild(el);
    const L = { el, obj, local, alpha: 0, shown: false };
    labels.push(L);
    return L;
  }
  function placeLabels() {
    const w = window.innerWidth, h = window.innerHeight;
    for (const L of labels) {
      if (L.alpha < 0.02 || !L.obj.visible) {
        if (L.shown) { L.el.style.opacity = 0; L.shown = false; }
        continue;
      }
      tmp.copy(L.local);
      L.obj.localToWorld(tmp);
      const dist = tmp.distanceTo(camera.position);
      tmp.project(camera);
      if (tmp.z > 1) { L.el.style.opacity = 0; L.shown = false; continue; }
      const fogA = 1 - smooth(32, 60, dist);
      const sx = (tmp.x * 0.5 + 0.5) * w;
      // Labels give way to the copy column on the left of wide screens.
      const copyA = narrow ? 1 : smooth(w * 0.34, w * 0.46, sx);
      L.el.style.opacity = (L.alpha * fogA * copyA).toFixed(3);
      L.el.style.transform = `translate(${sx.toFixed(1)}px, ${((-tmp.y * 0.5 + 0.5) * h).toFixed(1)}px)`;
      L.shown = true;
    }
  }

  const pings = [];
  const ringGeo = new THREE.TorusGeometry(0.12, 0.012, 6, 32);
  const waveGeo = new THREE.TorusGeometry(0.5, 0.006, 6, 96);
  function ping(parent, pos, size = 1) {
    if (!motionOK()) return;
    const wave = size > 1;
    const m = new THREE.Mesh(wave ? waveGeo : ringGeo, new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, depthWrite: false }));
    m.position.copy(pos);
    parent.add(m);
    pings.push({ m, parent, life: 0, size: wave ? size / 4.5 : size, wave });
  }
  function updatePings(dt) {
    for (let i = pings.length - 1; i >= 0; i--) {
      const p = pings[i];
      p.life += dt / 0.8;
      p.m.scale.setScalar((1 + p.life * 3.5) * p.size);
      p.m.material.opacity = (1 - p.life) * (p.wave ? 0.55 : 1);
      if (p.life >= 1) { p.parent.remove(p.m); p.m.material.dispose(); pings.splice(i, 1); }
    }
  }

  const portOf = (e) => V(1.4, 0, 0).applyEuler(e.g.rotation).multiplyScalar(e.g.scale.x).add(e.g.position);
  const chanLabel = (i, e) => addLabel(LABELS[i], 'is-chan', e.g, V(-1.4, 1.02, 0.05));
  const edged = (geo, mat) => {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = true;
    m.receiveShadow = true;
    m.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 40), M.edge));
    return m;
  };

  // ============================================================ STATIONS

  // Arrival + Connect: the Communication Circuit.
  function buildCircuit(origin, { beat = false } = {}) {
    const g = new THREE.Group();
    g.position.copy(origin);
    scene.add(g);
    const em = KINDS.map((k) => makeEmitter(k));
    em.forEach((e, i) => { e.g.rotation.y = LAYOUT.heroYaw[i]; e.g.position.copy(LAYOUT.heroPos[i]); g.add(e.g); });
    const core = makeCore();
    core.g.position.copy(LAYOUT.heroCore);
    core.g.scale.setScalar(1.15);
    g.add(core.g);
    const wires = KINDS.map((_, i) => (i === 3 ? [0, 1, 2].map(() => new Wire(g, M.wire)) : [new Wire(g, M.wire)]));
    const out = new Wire(g, M.wireStrong, 8);
    const parts = new Particles(g);
    const lab = em.map((e, i) => chanLabel(i, e));
    const inlet = (i) => core.inlet(i).multiplyScalar(core.g.scale.x).add(core.g.position);
    const next = [0.3, 1.0, 1.7, 2.4];
    let nextBeat = 0;
    let beatAt = -10;

    return {
      update(t, dt, local, live) {
        em.forEach((e, i) => {
          const b = LAYOUT.heroPos[i];
          let y = b.y + (motionOK() ? Math.sin(t * 0.9 + i * 1.3) * 0.08 : 0);
          const ph = (t - beatAt - i * 0.12) / 0.6;
          if (beat && ph > 0 && ph < 1) y += Math.sin(ph * Math.PI) * 0.35;
          e.g.position.set(b.x, y, b.z);
          e.update(lerp(t * RATE[i] + OFFSET[i], t * BEAT, beat ? 1 : 0));
          lab[i].alpha = 1;
        });
        core.update(t, dt);
        KINDS.forEach((_, i) => {
          const a = portOf(em[i]);
          if (i === 3) [-0.55, 0, 0.55].forEach((o, j) => wires[3][j].set(bowed(a, inlet(i), o), 1));
          else wires[i][0].set(link(a, inlet(i)), 1);
        });
        const oa = core.outlet.clone().multiplyScalar(core.g.scale.x).add(core.g.position);
        out.set(link(oa, oa.clone().add(V(5, 0, 0))), 1);
        if (live) {
          if (beat) {
            if (t > nextBeat) {
              beatAt = t;
              nextBeat = t + 2.4;
              KINDS.forEach((_, i) => {
                const w = i === 3 ? wires[3][1] : wires[i][0];
                parts.add({
                  kind: i, legs: [() => w], duration: 1.5,
                  onDone: i === 0 ? () => {
                    core.pulse(1.3);
                    ping(g, core.g.position, 8);
                    for (let k = 0; k < 3; k++) parts.add({ kind: 9, legs: [() => out], speed: 7, wait: k * 0.16 });
                  } : undefined,
                });
              });
            }
          } else {
            KINDS.forEach((_, i) => {
              if (t < next[i]) return;
              const w = i === 3 ? wires[3][Math.floor(Math.random() * 3)] : wires[i][0];
              parts.add({
                kind: i, legs: [() => w], speed: 5 + Math.random() * 2,
                onDone: () => {
                  core.pulse(0.7);
                  ping(g, inlet(i));
                  if (Math.random() < 0.35) ping(g, core.g.position, 5);
                  if (Math.random() < 0.6) parts.add({ kind: 9, legs: [() => out], speed: 7 });
                },
              });
              next[i] = t + 0.8 + Math.random() * 1.4;
            });
          }
        }
        parts.update(dt);
      },
    };
  }

  // Fragments: scattered → connected → routed.
  function buildStory(origin) {
    const g = new THREE.Group();
    g.position.copy(origin);
    scene.add(g);
    const em = KINDS.map((k) => makeEmitter(k));
    em.forEach((e) => g.add(e.g));
    const core = makeCore();
    core.g.position.copy(LAYOUT.storyCore);
    g.add(core.g);
    const panels = { ai: makePanel(), human: makePanel(), outcome: makePanel() };
    Object.entries(panels).forEach(([n, p]) => { p.position.copy(LAYOUT[n]); g.add(p); });
    const pl = {
      ai: addLabel('<strong>AI agent</strong><span>ROUTINE REQUESTS</span>', 'is-panel', panels.ai, V(-1.18, 0.34, 0.1)),
      human: addLabel('<strong>Human team</strong><span>COMPLEX CONVERSATIONS</span>', 'is-panel', panels.human, V(-1.18, 0.34, 0.1)),
      outcome: addLabel('<strong>Outcome</strong><span>CLOSED · RESOLVED</span>', 'is-panel', panels.outcome, V(-1.18, 0.34, 0.1)),
    };
    const lab = em.map((e, i) => chanLabel(i, e));
    const wires = KINDS.map((_, i) => (i === 3 ? [0, 1, 2].map(() => new Wire(g, M.wire)) : [new Wire(g, M.wire)]));
    const ow = { ai: new Wire(g, M.wireStrong), human: new Wire(g, M.wireStrong), aiOut: new Wire(g, M.wireStrong), humanOut: new Wire(g, M.wireStrong) };
    const parts = new Particles(g);
    let nextEmit = 0;

    return {
      update(t, dt, local, live) {
        const p = local * 3;
        em.forEach((e, i) => {
          const m = smooth(0.3 + i * 0.06, 1.2 + i * 0.06, p);
          const drift = motionOK() ? (1 - m) * 0.25 : 0;
          e.g.position.copy(LAYOUT.scatter[i]).lerp(LAYOUT.col[i], m).add(V(0, Math.sin(t * 0.7 + i * 1.7) * drift, 0));
          const sr = LAYOUT.scatterRot[i];
          e.g.rotation.set(sr[0] * (1 - m) * 1.4, lerp(sr[1] * 1.4, 0.1, m), sr[2] * (1 - m) * 1.4);
          e.update(lerp(t * RATE[i] + OFFSET[i], t * BEAT, smooth(1.0, 1.6, p)));
          lab[i].alpha = 1;
        });
        const vis = smooth(0.95, 1.45, p);
        core.g.visible = vis > 0.01;
        core.g.scale.setScalar(Math.max(0.001, 0.4 + 0.6 * vis));
        core.update(t, dt);
        const linkDraw = smooth(1.2, 1.7, p);
        const inlet = (i) => core.inlet(i).multiplyScalar(core.g.scale.x).add(core.g.position);
        KINDS.forEach((_, i) => {
          const a = portOf(em[i]);
          if (i === 3) [-0.55, 0, 0.55].forEach((o, j) => wires[3][j].set(bowed(a, inlet(i), o), linkDraw));
          else wires[i][0].set(link(a, inlet(i)), linkDraw);
        });
        const pIn = smooth(2.1, 2.4, p);
        const pOut = smooth(2.35, 2.7, p);
        Object.entries(panels).forEach(([n, pg]) => {
          const v = n === 'outcome' ? pOut : pIn;
          pg.visible = v > 0.01;
          pg.rotation.y = (1 - v) * -1.5;
          pg.scale.setScalar(0.85 + 0.15 * v);
          pl[n].alpha = v;
        });
        const outA = core.outlet.clone().multiplyScalar(core.g.scale.x).add(core.g.position);
        const L = (n, dx) => LAYOUT[n].clone().add(V(dx, 0, 0));
        ow.ai.set(link(outA, L('ai', -1.45)), pIn);
        ow.human.set(link(outA, L('human', -1.45)), pIn);
        ow.aiOut.set(link(L('ai', 1.45), L('outcome', -1.45)), pOut);
        ow.humanOut.set(link(L('human', 1.45), L('outcome', -1.45)), pOut);

        if (live && p > 1.6 && t > nextEmit) {
          const i = Math.floor(Math.random() * 4);
          const w = i === 3 ? wires[3][Math.floor(Math.random() * 3)] : wires[i][0];
          const legs = [() => w];
          if (p > 2.6) {
            const agent = Math.random() < 0.65;
            legs.push(() => (agent ? ow.ai : ow.human), () => (agent ? ow.aiOut : ow.humanOut));
          }
          parts.add({ kind: i, legs, speed: 9, onLeg: (leg) => { if (leg === 0) { core.pulse(0.5); ping(g, inlet(i)); } } });
          nextEmit = t + (p > 2.6 ? 0.3 : 0.45);
        }
        if (p < 1.5) parts.clear();
        parts.update(dt);
      },
    };
  }

  // Channels: four pillars around a hub; the camera walks past each in turn.
  function buildChannels(origin, data, onActive) {
    const g = new THREE.Group();
    g.position.copy(origin);
    scene.add(g);
    const hub = makeCore();
    hub.g.position.set(0, 0.6, 0);
    g.add(hub.g);
    const pillarGeo = new RoundedBoxGeometry(3.6, 6.4, 0.4, 3, 0.08);
    const stripeGeo = new THREE.BoxGeometry(0.08, 6.4, 0.44);
    const items = KINDS.map((k, i) => {
      const a = THREE.MathUtils.degToRad(-60 + i * 40);
      const pg = new THREE.Group();
      const base = V(Math.sin(a) * 9.5, 0, -Math.cos(a) * 9.5 + 1.5);
      pg.position.copy(base);
      pg.rotation.y = -a;
      const slab = edged(pillarGeo, M.clay);
      slab.position.y = 0.2;
      const stripeMat = M.grey.clone();
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.position.set(-1.8, 0.2, 0);
      const e = makeEmitter(k);
      e.g.position.set(0, 1.3, 0.3);
      pg.add(slab, stripe, e.g);
      g.add(pg);
      const lab = addLabel(LABELS[i], 'is-chan', e.g, V(-1.4, 1.02, 0.05));
      const name = addLabel(`<strong>${data[i].name}</strong><span>${data[i].role.toUpperCase()}</span>`, 'is-panel', pg, V(-1.45, -0.6, 0.3));
      g.updateMatrixWorld(true);
      const port = e.g.localToWorld(V(0, -0.8, 0.08));
      g.worldToLocal(port);
      const dir = V(base.x, 0, base.z).normalize();
      const end = hub.g.position.clone().add(dir.clone().multiplyScalar(1.5));
      const curve = new THREE.CubicBezierCurve3(port, port.clone().add(V(0, -2.4, 0)), end.clone().add(dir.clone().multiplyScalar(3)).add(V(0, -1.4, 0)), end);
      const wire = new Wire(g, M.wire);
      wire.set(curve, 1);
      const back = new Wire(g, M.wire);
      back.set(new THREE.CubicBezierCurve3(curve.v3.clone(), curve.v2.clone(), curve.v1.clone(), curve.v0.clone()), 0);
      return { pg, base, e, stripeMat, wire, back, lab, name, push: 0 };
    });
    const parts = new Particles(g);
    let active = -1;
    let nextEmit = 0;
    items.forEach((it) => it.e.update(0.4));

    return {
      update(t, dt, local, live) {
        const act = clamp(Math.floor(local * 4), 0, 3);
        if (act !== active) {
          active = act;
          items.forEach((it, i) => {
            const on = i === act;
            it.stripeMat.color.copy(on ? ACCENT : GREY);
            it.stripeMat.emissive.copy(on ? ACCENT : new THREE.Color(0));
            it.stripeMat.emissiveIntensity = on ? 0.35 : 0;
            it.wire.line.material = on ? M.wireStrong : M.wire;
          });
          parts.clear();
          onActive(act);
        }
        items.forEach((it, i) => {
          it.push += ((i === active ? 1 : 0) - it.push) * 0.08;
          it.pg.position.copy(it.base).add(it.base.clone().setY(0).normalize().multiplyScalar(-0.8 * it.push));
          if (i === active) it.e.update(t * RATE[i] + OFFSET[i]);
          it.lab.alpha = 0.5 + 0.5 * it.push;
          it.name.alpha = 0.35 + 0.65 * it.push;
        });
        hub.update(t, dt);
        if (live && t > nextEmit) {
          const it = items[active];
          parts.add({
            kind: active, legs: [() => it.wire], speed: 7,
            onDone: () => {
              hub.pulse(0.7);
              ping(g, hub.g.position, 5);
              items.forEach((o, j) => { if (j !== active) parts.add({ kind: 9, legs: [() => o.back], speed: 6, wait: j * 0.05 }); });
            },
          });
          nextEmit = t + 0.8;
        }
        parts.update(dt);
      },
    };
  }

  // Inbox: the real product UI, placed in the room with CSS3D.
  function buildInbox(origin, data, stepEls) {
    const g = new THREE.Group();
    g.position.copy(origin);
    scene.add(g);
    const app = document.createElement('div');
    app.className = 'app';
    const inbox = createInbox(app, data, stepEls);
    inbox.hideAll();
    inbox.setStep(0);
    const obj = new CSS3DObject(app);
    obj.scale.setScalar(0.0102);
    obj.position.set(0, 2.4, 0);
    g.add(obj);
    const w = 1180 * 0.0102, h = 680 * 0.0102;
    const back = edged(new RoundedBoxGeometry(w + 0.3, h + 0.3, 0.3, 3, 0.08), M.clay);
    back.position.set(0, 2.4, -0.25);
    g.add(back);
    const top = 2.4 + h / 2;
    const em = KINDS.map((k, i) => {
      const e = makeEmitter(k);
      e.g.scale.setScalar(0.85);
      e.g.position.set(-4.6 + i * 3.07, top + 1.9, 0.6);
      g.add(e.g);
      return e;
    });
    const lab = em.map((e, i) => chanLabel(i, e));
    const wires = em.map((e) => {
      const a = e.g.position.clone().add(V(0, -0.8 * 0.85, 0.05));
      const b = V(a.x, top, 0.05);
      const wr = new Wire(g, M.wire);
      wr.set(new THREE.CubicBezierCurve3(a, a.clone().add(V(0, -0.5, 0.4)), b.clone().add(V(0, 0.5, 0.4)), b), 1);
      return wr;
    });
    const parts = new Particles(g);
    const order = ['calls', 'sms', 'whatsapp', 'ai'];
    let nextEmit = 0;

    return {
      obj,
      update(t, dt, local, live) {
        const step = clamp(Math.floor(local * 5.3), 0, 4);
        inbox.setStep(step);
        em.forEach((e, i) => { e.update(t * RATE[i] + OFFSET[i]); lab[i].alpha = 1; });
        wires.forEach((wr, i) => { wr.line.material = (i === step || step === 4) ? M.wireStrong : M.wire; });
        if (live && t > nextEmit) {
          const ch = step === 4 ? Math.floor(Math.random() * 4) : order.indexOf(data.steps[step].event.channel);
          if (ch >= 0) parts.add({ kind: ch, legs: [() => wires[ch]], speed: 7 });
          nextEmit = t + 0.6;
        }
        parts.update(dt);
        const d = camera.position.distanceTo(tmp.setFromMatrixPosition(obj.matrixWorld));
        app.style.opacity = (1 - smooth(30, 55, d)).toFixed(3);
      },
    };
  }

  // Workflow: one request travels along a row of slabs.
  function buildWorkflow(origin, data, onStep) {
    const g = new THREE.Group();
    g.position.copy(origin);
    scene.add(g);
    const byId = Object.fromEntries(data.nodes.map((n) => [n.id, n]));
    const slabGeo = new RoundedBoxGeometry(3.6, 1.6, 0.22, 3, 0.06);
    const barGeo = new THREE.BoxGeometry(0.07, 1.6, 0.26);
    const nodes = {};
    data.nodes.forEach((n) => {
      const ng = new THREE.Group();
      ng.position.set(-11.5 + n.col * 4.6, 0.6 - n.row * 2.7, n.row === 0 ? 0 : 0.8 * n.row);
      const slab = edged(slabGeo, M.clay);
      const barMat = M.grey.clone();
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.x = -1.8;
      ng.add(slab, bar);
      g.add(ng);
      const label = addLabel(`<em>${n.index}</em><strong>${n.title}</strong><span>${n.detail.toUpperCase()}</span>`, 'is-panel', ng, V(-1.5, 0.52, 0.14));
      nodes[n.id] = { ng, barMat, label };
    });
    const side = (id, s) => {
      const p = nodes[id].ng.position;
      return { left: V(p.x - 1.8, p.y, p.z), right: V(p.x + 1.8, p.y, p.z), top: V(p.x, p.y + 0.8, p.z), bottom: V(p.x, p.y - 0.8, p.z) }[s];
    };
    const dashMat = new THREE.LineDashedMaterial({ color: '#A4AEBF', dashSize: 0.18, gapSize: 0.14 });
    const edges = {};
    data.edges.forEach(([a, b, kind]) => {
      const ra = byId[a].row, rb = byId[b].row;
      let s1 = 'right', s2 = 'left';
      if (ra === 0 && rb !== 0) s1 = rb < 0 ? 'top' : 'bottom';
      if (ra !== 0 && rb === 0) s2 = ra < 0 ? 'top' : 'bottom';
      const A = side(a, s1), B = side(b, s2);
      const dA = { right: V(1.4), top: V(0, 1.2), bottom: V(0, -1.2) }[s1];
      const dB = { left: V(-1.4), top: V(0, 1.2), bottom: V(0, -1.2) }[s2];
      const curve = new THREE.CubicBezierCurve3(A, A.clone().add(dA), B.clone().add(dB), B);
      const wr = new Wire(g, kind === 'alt' ? dashMat : M.wireStrong);
      wr.set(curve, kind === 'alt' ? 1 : 0);
      if (kind === 'alt') wr.line.computeLineDistances();
      edges[`${a}>${b}`] = { wr, curve, alt: kind === 'alt' };
    });
    const path = data.path;
    const main = path.slice(1).map((id, i) => edges[`${path[i]}>${id}`]);
    const sig = new THREE.Mesh(new THREE.SphereGeometry(0.24, 32, 20), M.gloss);
    sig.castShadow = true;
    g.add(sig);
    const STEP = 1.2;
    const END = (path.length - 1) * STEP;
    let lastStep = -1;

    return {
      sig,
      update(t, dt, local) {
        const T = local * (END + 0.8);
        main.forEach((e, j) => e.wr.set(e.curve, clamp((T - (j * STEP + 0.2)) / 1.0)));
        Object.values(edges).forEach((e) => { if (e.alt) e.wr.line.material.opacity = 1; });
        path.forEach((id, k) => {
          const on = T >= k * STEP + 0.02;
          const done = id === 'done' && T >= END;
          nodes[id].barMat.color.copy(done ? GREEN : on ? ACCENT : GREY);
          nodes[id].label.el.classList.toggle('is-done', done);
        });
        Object.values(nodes).forEach((n) => { n.label.alpha = 1; });
        if (T < 0.2) {
          sig.position.copy(side(path[0], 'right'));
        } else {
          const j = Math.min(main.length - 1, Math.floor((T - 0.2) / STEP));
          const f = clamp((T - 0.2 - j * STEP) / 1.0);
          sig.position.copy(main[j].curve.getPoint(f));
        }
        sig.scale.setScalar(1 + (motionOK() ? Math.sin(t * 4) * 0.08 : 0));
        const step = clamp(Math.floor(T / STEP), 0, path.length - 1);
        if (step !== lastStep) { lastStep = step; onStep(byId[path[step]]); }
      },
    };
  }

  // Intelligence: a volume of routing nodes with many conversations in flight.
  function buildIntel(origin) {
    const g = new THREE.Group();
    g.position.copy(origin);
    scene.add(g);
    const cols = [
      { x: -13, y: [5.4, 3.2, 1.0, -1.2], z: [-2, 1.5, -1, 2] },
      { x: -4.5, y: [4.6, 2.2, -0.2], z: [1.5, -2, 1] },
      { x: 4.5, y: [5.2, 2.9, 0.6, -1.6], z: [-1.5, 2, -2, 1] },
      { x: 13, y: [5, 2.6, 0.2, -2.2], z: [1, -1, 1.8, -1.5] },
    ].map((c) => c.y.map((y, i) => V(c.x, y, c.z[i])));
    const chColors = ['#425BFF', '#0BA5EC', '#25D366', '#F8FAFC'];
    cols[0].forEach((p, i) => {
      const m = new THREE.Mesh(new RoundedBoxGeometry(0.6, 0.6, 0.6, 2, 0.08), new THREE.MeshStandardMaterial({ color: chColors[i], emissive: chColors[i], emissiveIntensity: 0.35, roughness: 0.3 }));
      m.position.copy(p);
      g.add(m);
      addLabel(LABELS[i], 'is-chan', m, V(-0.3, 0.6, 0));
    });
    const hubGeo = new THREE.SphereGeometry(0.34, 32, 20);
    const haloGeo = new THREE.TorusGeometry(0.75, 0.012, 6, 64);
    const hubs = [];
    [1, 2].forEach((c) => cols[c].forEach((p) => {
      const m = new THREE.Mesh(hubGeo, M.gloss);
      m.position.copy(p);
      const halo = new THREE.Mesh(haloGeo, M.grey);
      halo.position.copy(p);
      g.add(m, halo);
      hubs.push(halo);
    }));
    const outNames = ['Sales pipeline', 'Support queue', 'AI resolution', 'Follow-ups'];
    cols[3].forEach((p, i) => {
      const m = edged(new RoundedBoxGeometry(2.6, 0.8, 0.16, 3, 0.05), M.clay);
      m.position.copy(p).add(V(1.3, 0, 0));
      g.add(m);
      addLabel(`<strong>${outNames[i]}</strong>`, 'is-panel', m, V(-1.15, 0.12, 0.1));
    });
    const netMat = new THREE.LineBasicMaterial({ color: '#7387FF', transparent: true, opacity: 0.28 });
    const edgeMap = new Map();
    const add = (c, i, j) => {
      const wr = new Wire(g, netMat, 40);
      wr.set(link(cols[c][i], cols[c + 1][j], 0.45), 1);
      edgeMap.set(`${c}:${i}>${j}`, wr);
    };
    cols[0].forEach((_, i) => cols[1].forEach((__, j) => add(0, i, j)));
    cols[1].forEach((_, i) => cols[2].forEach((__, j) => add(1, i, j)));
    cols[2].forEach((_, i) => cols[3].forEach((__, j) => { if (Math.abs(i - j) <= 1) add(2, i, j); }));
    const parts = new Particles(g);
    const pick = (n) => Math.floor(Math.random() * n);
    let nextSpawn = 0;
    const labelObjs = labels.slice(-8);

    return {
      update(t, dt, local, live) {
        labelObjs.forEach((L) => { L.alpha = 1; });
        hubs.forEach((h, i) => { h.rotation.set(t * 0.4 + i, t * 0.3, 0); });
        if (live && t > nextSpawn && parts.items.length < 28) {
          const i = pick(4), j = pick(3), k = pick(4);
          const outs = [k - 1, k, k + 1].filter((m) => m >= 0 && m < 4);
          const m = outs[pick(outs.length)];
          const legs = [edgeMap.get(`0:${i}>${j}`), edgeMap.get(`1:${j}>${k}`), edgeMap.get(`2:${k}>${m}`)];
          parts.add({
            kind: i, legs: legs.map((w) => () => w), speed: 9 + Math.random() * 3,
            onLeg: (leg) => { if (leg < 2) ping(g, cols[leg + 1][leg === 0 ? j : k], 1); },
          });
          nextSpawn = t + 0.16;
        }
        parts.update(dt);
      },
    };
  }

  // Impact: a sculpted "10x".
  function buildImpact(origin) {
    const g = new THREE.Group();
    g.position.copy(origin);
    scene.add(g);
    const geo = new TextGeometry('10x', {
      font, size: 4.2, height: 1.1, curveSegments: 10,
      bevelEnabled: true, bevelThickness: 0.14, bevelSize: 0.08, bevelSegments: 4,
    });
    geo.computeBoundingBox();
    geo.center();
    const mesh = new THREE.Mesh(geo, [M.gloss, M.clay]);
    mesh.castShadow = true;
    mesh.position.set(3.4, 0.6, 0);
    const plinth = edged(new RoundedBoxGeometry(13, 0.6, 4.4, 3, 0.1), M.clay);
    plinth.position.set(3.4, -2.7, 0);
    g.add(mesh, plinth);
    const upTo = addLabel('<span>UP TO</span>', 'is-panel', mesh, V(-4.9, 2.6, 0.6));
    const caption = addLabel('<strong>faster ticket resolution*</strong>', 'is-panel', mesh, V(-4.9, -2.5, 0.6));
    const rings = [0, 1, 2].map((k) => {
      const r = new THREE.Mesh(new THREE.TorusGeometry(5.2 + k * 0.6, 0.01, 6, 160), M.grey);
      r.position.copy(mesh.position);
      r.rotation.x = Math.PI / 2;
      g.add(r);
      return r;
    });
    return {
      update(t, dt, local) {
        mesh.rotation.y = -0.35 + local * 0.6 + (motionOK() ? Math.sin(t * 0.4) * 0.04 : 0);
        rings.forEach((r, k) => { r.rotation.z = t * (0.1 + k * 0.05); r.position.y = mesh.position.y - 2.2 + k * 0.05; });
        upTo.alpha = 1;
        caption.alpha = 1;
      },
    };
  }

  // ============================================================ STOPS
  const O = {
    arrival: V(0, 0, 0),
    fragments: V(2, -0.4, -50),
    channels: V(-16, 0, -104),
    inbox: V(-4, 0, -156),
    workflow: V(12, 0, -204),
    intelligence: V(0, 0, -256),
    impact: V(-12, 0, -306),
    connect: V(0, 0, -356),
  };

  const tabs = $$('.room-tabs [role="tab"]');
  const panelEl = $('.room-panel');
  function showChannel(i) {
    const d = channelData[i];
    tabs.forEach((t, j) => { t.setAttribute('aria-selected', j === i); t.tabIndex = j === i ? 0 : -1; });
    panelEl.innerHTML = `<p class="eyebrow"><i class="dot" style="--c:var(--c-${d.id})"></i>${d.role}</p>
      <p class="desc">${d.description}</p><ul>${d.points.map((p) => `<li>${p}</li>`).join('')}</ul>`;
    if (motionOK()) gsap.from(panelEl.children, { autoAlpha: 0, y: 10, duration: 0.45, stagger: 0.05, ease: 'power3.out' });
  }
  const capEl = $('.room-caption');
  const showStep = (n) => { capEl.innerHTML = `<span class="mono">${n.index} · ${n.title}</span>${n.caption || ''}`; };

  const stations = {
    arrival: buildCircuit(O.arrival),
    fragments: buildStory(O.fragments),
    channels: buildChannels(O.channels, channelData, showChannel),
    inbox: buildInbox(O.inbox, inboxData, $$('.room-steps li')),
    workflow: buildWorkflow(O.workflow, workflowData, showStep),
    intelligence: buildIntel(O.intelligence),
    impact: buildImpact(O.impact),
    connect: buildCircuit(O.connect, { beat: true }),
  };

  // Camera pose for each stop at dwell progress l (0..1). `cx` is where to
  // centre the view on narrow screens, `k` how far to step back there.
  const P = (o, pos, look) => ({ pos: o.clone().add(pos), look: o.clone().add(look) });
  const STOPS = [
    { id: 'arrival', dwell: 1.0, cx: 0, k: 2.2, pose: (l) => P(O.arrival, V(-5.4, 0.8, lerp(18, 15.5, l)), V(-5.4, 0, 0)) },
    {
      id: 'fragments', dwell: 3.2, cx: 0, k: 1.7,
      pose: (l) => {
        const a = smooth(0, 0.45, l), b = smooth(0.66, 1, l);
        return P(O.fragments, V(lerp(-5.6, -4, b), lerp(11, 2.6, a), lerp(20, 25, a)), V(lerp(-5.6, -4, b), lerp(-2.4, -0.8, a), 0));
      },
    },
    {
      id: 'channels', dwell: 3.2, cx: 0, k: 1.7,
      pose: (l) => {
        const th = THREE.MathUtils.degToRad(lerp(-42, 42, l));
        return P(O.channels, V(Math.sin(th) * 23 - 6.5, 3.4, Math.cos(th) * 23 + 1), V(Math.sin(th) * 4 - 7.8, 0.6, -3.5));
      },
    },
    { id: 'inbox', dwell: 3.0, cx: 0, k: 1.6, pose: (l) => P(O.inbox, V(lerp(-4.6, -2.6, l), 4.4, lerp(17.6, 16.6, l)), V(-3.1, 3.6, 0)) },
    {
      id: 'workflow', dwell: 2.6, cx: null, k: 1.8,
      pose: (l) => {
        const sx = clamp(-11.5 + l * 26, -11.5, 11.5);
        return P(O.workflow, V(sx - 6, 3, 15), V(sx - 5.2, 0.3, 0));
      },
    },
    { id: 'intelligence', dwell: 2.2, cx: 0, k: 1.6, pose: (l) => P(O.intelligence, V(lerp(-17, -2, l), lerp(6, 3.4, l), lerp(27, 22, l)), V(lerp(-9.5, -4.5, l), 2, -1)) },
    { id: 'impact', dwell: 1.8, cx: 3.4, k: 1.9, pose: (l) => P(O.impact, V(lerp(-8.5, -5.5, l), 1.6, lerp(23, 21, l)), V(-4.8, 0.2, 0)) },
    { id: 'connect', dwell: 1.6, cx: 0, k: 2.2, pose: (l) => P(O.connect, V(-5.4, lerp(0.8, 1.6, l), lerp(15.5, 19, l)), V(-5.4, 0, 0)) },
  ];
  const TRANSIT = 1.0;
  let acc = 0;
  STOPS.forEach((s, i) => {
    s.start = acc;
    s.end = acc + s.dwell;
    acc = s.end + (i < STOPS.length - 1 ? TRANSIT : 0);
    s.el = document.getElementById(s.id);
    s.station = stations[s.id];
  });
  const TOTAL = acc;

  const spacer = $('.room-scroll');
  let vw = 0, vh = 0, narrow = false;
  function resize() {
    vw = window.innerWidth;
    vh = window.innerHeight;
    narrow = vw / vh < 1;
    renderer.setSize(vw, vh, false);
    css3d.setSize(vw, vh);
    camera.aspect = vw / vh;
    camera.fov = narrow ? 52 : 40;
    camera.updateProjectionMatrix();
    spacer.style.height = `${TOTAL * vh + vh}px`;
  }
  window.addEventListener('resize', resize);
  resize();
  // Scroll offset for a point inside a stop (used by links and tests).
  window.__roomStops = Object.fromEntries(STOPS.map((st) => [st.id, (f) => (st.start + st.dwell * f) * vh]));

  function frameFor(stop, l) {
    const p = stop.pose(l);
    if (narrow) {
      const dir = p.pos.clone().sub(p.look);
      dir.x *= 0.3;
      p.look.y -= 2.6;
      if (stop.cx !== null) p.look.x = O[stop.id].x + stop.cx;
      p.pos = p.look.clone().add(dir.multiplyScalar(stop.k));
    }
    return p;
  }

  // Where are we? Dwell at a stop, or flying between two.
  function where(s) {
    for (let i = 0; i < STOPS.length; i++) {
      const st = STOPS[i];
      if (s <= st.end) {
        if (s >= st.start || i === 0) return { i, local: clamp((s - st.start) / st.dwell), transit: false };
        return { i, prev: i - 1, t: clamp((s - STOPS[i - 1].end) / TRANSIT), transit: true };
      }
    }
    return { i: STOPS.length - 1, local: 1, transit: false };
  }

  // Navigation: links and the rail jump to a stop.
  const railBtns = $$('.rail button');
  $$('[data-stop-link]').forEach((a) => a.addEventListener('click', (e) => {
    const st = STOPS.find((s) => s.id === a.dataset.stopLink);
    if (!st) return;
    e.preventDefault();
    window.scrollTo({ top: (st.start + st.dwell * (st.id === 'arrival' ? 0 : 0.04)) * vh, behavior: motionOK() ? 'smooth' : 'auto' });
  }));
  tabs.forEach((tab, i) => tab.addEventListener('click', () => {
    const st = STOPS.find((s) => s.id === 'channels');
    window.scrollTo({ top: (st.start + st.dwell * ((i + 0.5) / 4)) * vh, behavior: motionOK() ? 'smooth' : 'auto' });
  }));

  const phases = $$('.phase');
  const marks = $$('.phase-marks li');
  let phaseIdx = 0;
  const feedList = $('.room-feed .feed-list');
  let feedI = 0;
  const feedRow = ([ch, topic, route, state]) => {
    const li = document.createElement('li');
    li.innerHTML = `<i class="dot" style="--c:var(--c-${ch})"></i><span class="feed-topic">${topic}</span><span class="feed-route">→ ${route}</span><span class="feed-state">${state}</span>`;
    return li;
  };
  for (let i = 0; i < 5; i++) feedList.append(feedRow(FEED[feedI++ % FEED.length]));
  let feedClock = 0;

  // ------------------------------------------------------------ frame
  const camPos = V(), camLook = V();
  const target = { pos: V(), look: V() };
  let first = true;
  let lastRail = -1;

  gsap.ticker.add((time, deltaMs) => {
    const moving = motionOK();
    const dt = Math.min(deltaMs, 64) / 1000;
    const t = moving ? time : 1.2;
    const s = window.scrollY / vh;
    const w = where(s);

    // Camera target
    if (w.transit) {
      const a = frameFor(STOPS[w.prev], 1), b = frameFor(STOPS[w.i], 0);
      const e = ease(w.t);
      target.pos.copy(a.pos).lerp(b.pos, e).add(V(0, Math.sin(Math.PI * w.t) * 3, 0));
      target.look.copy(a.look).lerp(b.look, ease(clamp(w.t * 1.15)));
    } else {
      const p = frameFor(STOPS[w.i], w.local);
      target.pos.copy(p.pos);
      target.look.copy(p.look);
    }
    const k = first || !moving ? 1 : 1 - Math.exp(-dt * 5);
    camPos.lerp(target.pos, k);
    camLook.lerp(target.look, k);
    first = false;
    camera.position.copy(camPos);
    camera.lookAt(camLook);
    key.target.position.copy(camLook);
    key.position.copy(camLook).add(V(7, 15, 11));

    // Darkness for the intelligence room
    const intel = STOPS.find((x) => x.id === 'intelligence');
    const dark = smooth(intel.start - TRANSIT * 0.8, intel.start, s) * (1 - smooth(intel.end, intel.end + TRANSIT * 0.8, s));
    scene.background.copy(WHITE).lerp(NIGHT, dark);
    scene.fog.color.copy(scene.background);
    scene.fog.far = lerp(92, 70, dark);
    scene.fog.near = lerp(26, 34, dark);
    gridMat.color.copy(GRID_DAY).lerp(GRID_NIGHT, dark);
    dustMat.opacity = 0.3 + 0.35 * dark;
    floor.material.opacity = 0.06 * (1 - dark);
    document.body.classList.toggle('room-dark', dark > 0.5);

    // Which stations run this frame
    labels.forEach((L) => { L.alpha = 0; });
    const activeIdx = w.transit ? [w.prev, w.i] : [w.i];
    STOPS.forEach((st, i) => {
      const on = activeIdx.includes(i);
      const local = w.transit ? (i === w.prev ? 1 : 0) : w.local;
      if (st.station.obj) st.station.obj.visible = on;
      if (on) st.station.update(t, moving ? dt : 0, local, moving && !w.transit);
    });

    // Copy overlays
    STOPS.forEach((st, i) => {
      let o = 0;
      if (!w.transit && w.i === i) {
        o = (i === 0 ? 1 : smooth(0, 0.08, w.local)) * (i === STOPS.length - 1 ? 1 : 1 - smooth(0.92, 1, w.local));
      }
      st.el.style.opacity = o.toFixed(3);
      st.el.style.transform = `translateY(${((1 - o) * 18).toFixed(1)}px)`;
      st.el.classList.toggle('is-live', o > 0.01);
      st.el.classList.toggle('is-solid', o > 0.6);
    });

    // Fragments copy follows its three phases
    if (!w.transit && STOPS[w.i].id === 'fragments') {
      const idx = w.local < 0.36 ? 0 : w.local < 0.68 ? 1 : 2;
      if (idx !== phaseIdx) {
        phaseIdx = idx;
        phases.forEach((p, i) => p.classList.toggle('is-on', i === idx));
        marks.forEach((m, i) => m.classList.toggle('is-on', i === idx));
      }
    }

    // Rail
    const railIdx = w.transit ? (w.t < 0.5 ? w.prev : w.i) : w.i;
    if (railIdx !== lastRail) {
      lastRail = railIdx;
      railBtns.forEach((b, i) => b.classList.toggle('is-on', i === railIdx));
    }

    // Feed while in the intelligence room
    if (moving && !w.transit && STOPS[w.i].id === 'intelligence') {
      feedClock += dt;
      if (feedClock > 2) {
        feedClock = 0;
        const li = feedRow(FEED[feedI++ % FEED.length]);
        feedList.prepend(li);
        gsap.from(li, { autoAlpha: 0, y: -10, duration: 0.5, ease: 'power3.out' });
        if (feedList.children.length > 5) feedList.lastElementChild.remove();
      }
    }

    // Dust drifts slowly upward
    if (moving) {
      for (let i = 0; i < DUST; i++) {
        dustArr[i * 3 + 1] = -2.5 + ((dustBase[i * 3 + 1] + 2.5 + t * 0.15 * (0.5 + (i % 7) * 0.1)) % 18);
      }
      dustGeo.attributes.position.needsUpdate = true;
    }

    updatePings(moving ? dt : 0);
    renderer.render(scene, camera);
    css3d.render(scene, camera);
    placeLabels();
  });

  setLoad(1);
  setTimeout(() => $('.loader').classList.add('is-done'), 350);
}
