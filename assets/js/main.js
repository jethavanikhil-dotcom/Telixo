import { initUI } from './ui.js';
import { initHero, initFinale } from './circuit.js';
import { initStory } from './story.js';
import { initChannels } from './channels.js';
import { initInbox } from './inbox.js';
import { initWorkflow } from './workflow.js';
import { initNetwork } from './network.js';
import { initImpact } from './impact.js';

gsap.registerPlugin(ScrollTrigger);

const load = (name) => fetch(`assets/data/${name}.json`).then((r) => r.json());
const $ = (s) => document.querySelector(s);

initUI();
initHero($('#top'));
initStory($('#platform'));

const [channels, inbox, workflow] = await Promise.all([load('channels'), load('inbox'), load('workflow')]);
initChannels($('#channels'), channels);
initInbox($('#inbox'), inbox);
initWorkflow($('#workflow'), workflow);
initNetwork($('#system'));
initImpact($('#impact'));
initFinale($('#demo'));

ScrollTrigger.sort();
ScrollTrigger.refresh();
document.fonts?.ready.then(() => ScrollTrigger.refresh());
