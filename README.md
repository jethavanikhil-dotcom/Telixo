# Telixo

Landing page for Telixo — one autonomous platform for Calls, SMS, WhatsApp and AI Agents.

Static site: HTML, CSS and JavaScript modules. No build step.

The signature artwork is a real 3D scene (Three.js, WebGL). If a browser has no WebGL,
the page falls back to the SVG version of the same artwork automatically.

## Concept: The Communication Circuit

One artwork evolves down the page. Four channel signals each have their own motion
(waveform, SMS pulses, message bubbles, branching AI paths). They start fragmented,
connect to one hub, route to an AI agent or a human team, and come back fully
connected in the final section.

| Section | What moves |
| --- | --- |
| Hero | Circuit draws in, signals travel to the core, cursor tilt; scatters on scroll |
| Story (`#platform`) | Sticky, scroll-scrubbed: fragmented → connected → routed (turns navy) |
| Channels | Tabbed channel map; the active channel's path and context light up |
| Inbox | Product UI; one customer's call → SMS → WhatsApp → AI agent story advances with scroll |
| Workflow | A request travels through intent, routing, action and resolution |
| Intelligence layer | Dark section; many simulated conversations route through the network |
| Impact | Outcome rows with small explanatory diagrams |
| Final CTA | The hero circuit reassembles and runs on one shared beat |

## Structure

```
index.html
assets/css/style.css     Design tokens, typography, layout, artwork styles
assets/js/main.js        Entry point
assets/js/svg.js         SVG helpers, shared ticker, particle flows
assets/js/glyphs.js      The four channel signal glyphs
assets/js/scene3d.js     3D Communication Circuit (hero, story, final CTA)
assets/js/depth.js       Perspective effects for inbox, workflow, channel map, network
assets/js/circuit.js     SVG fallback of the signature artwork (hero + final CTA)
assets/js/story.js       Scroll story
assets/js/channels.js    Channel map
assets/js/inbox.js       Unified inbox UI
assets/js/workflow.js    Workflow graph
assets/js/network.js     Dark interlude network
assets/js/impact.js      Impact diagrams
assets/js/ui.js          Nav, menu, demo dialog, headline reveals
assets/data/*.json       Channel copy, inbox story, workflow graph
assets/vendor/           GSAP 3.12.5 + ScrollTrigger, Three.js 0.160.0 (local copies)
```

Edit copy in `index.html` and `assets/data/*.json`.

## Before publishing

- **10x claim:** “up to 10x faster” appears in the hero and the Impact section, with a
  visible placeholder footnote (`#fn-10x`). Back it with Telixo product data, or remove it.
- **Demo requests:** “Book a Demo” opens a form that pre-fills an email. Set the address
  in `DEMO_EMAIL` in `assets/js/ui.js` (currently `demo@example.com`).
- **Product claims:** the channel descriptions and inbox story are written for the design.
  Check that they match what the product actually does.

## Motion and accessibility

- Animation loops only run while their section is on screen.
- With “reduce motion” turned on: no autoplay loops, parallax or intro animation.
  Scroll-linked states still follow the scroll position, and all content stays visible.
- On screens under 900px: simplified layouts, vertical graphs and no sticky inbox or workflow.

## Run locally

The page loads JavaScript modules and JSON, so serve the folder instead of opening the file:

```
python3 -m http.server 8000
```

then visit http://localhost:8000.
