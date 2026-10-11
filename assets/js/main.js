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

const load = (name) => fetch(`assets/data/${name}.json`).then((r) => r.json());
const $ = (s) => document.querySelector(s);

initUI();

// Real 3D when the browser supports WebGL; the SVG artwork stays as the fallback.
let webgl = false;
try {
  const { supportsWebGL, initScene } = await import('./scene3d.js');
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
initChannels($('#channels'), channels);
initInbox($('#inbox'), inbox);
initWorkflow($('#workflow'), workflow);
initNetwork($('#system'));
initImpact($('#impact'));
if (!webgl) initFinale($('#demo'));
initDepth();

ScrollTrigger.sort();
ScrollTrigger.refresh();
document.fonts?.ready.then(() => ScrollTrigger.refresh());
