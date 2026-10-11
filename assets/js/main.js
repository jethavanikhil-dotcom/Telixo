import { initUI } from './ui.js';
import { initHero, initFinale } from './circuit.js';
import { initStory } from './story.js';
import { initChannels } from './channels.js';
import { initInbox } from './inbox.js';
import { initWorkflow } from './workflow.js';
import { initNetwork } from './network.js';
import { initImpact } from './impact.js';
import { initDepth } from './depth.js';

gsap.registerPlugin(ScrollTrigger);

const load = (name) => fetch(new URL(`../data/${name}.json`, import.meta.url)).then((r) => r.json());
const $ = (s) => document.querySelector(s);

initUI();

// Real 3D when the browser supports WebGL; the SVG artwork stays as the fallback.
// <html data-engine="morph"> uses the particle morph instead of the 3D circuit.
const engine = document.documentElement.dataset.engine;
let webgl = false;
try {
  const { supportsWebGL } = await import('./scene3d.js');
  const { initScene } = engine === 'morph' ? { initScene: (await import('./morph.js')).initMorph } : await import('./scene3d.js');
  if (supportsWebGL()) {
    webgl = initScene({
      canvas: $('.gl'), labels: $('.gl-labels'),
      heroArt: $('.hero-art'), story: $('#platform'), storyArt: $('.story-art'),
      cta: $('#demo'), ctaArt: $('.cta-art'),
    });
  }
} catch (err) {
  console.warn('3D scene unavailable, using SVG artwork.', err);
}

initHero($('#top'), { art: !webgl });
initStory($('#platform'), { art3d: webgl });

const [channels, inbox, workflow] = await Promise.all([load('channels'), load('inbox'), load('workflow')]);
let motion = null;
const channelsApi = initChannels($('#channels'), channels, { onUserSelect: (i) => motion?.jumpToChannel(i) });
initInbox($('#inbox'), inbox);
initWorkflow($('#workflow'), workflow);
initNetwork($('#system'));
initImpact($('#impact'));
if (!webgl) initFinale($('#demo'));
initDepth();
// High animation depth: scroll-driven sections, magnetic cursor, reactive dot grids.
const { initMotion } = await import('./motion.js');
motion = initMotion({ channels: channelsApi });
const { initDotFields, initMagnetic } = await import('./interact.js');
initDotFields('.channels, .workflow, .impact, .cta');
initMagnetic('.btn, .btn-link, .nav-links a, .channel-tabs .name');

ScrollTrigger.sort();
ScrollTrigger.refresh();
document.fonts?.ready.then(() => ScrollTrigger.refresh());
