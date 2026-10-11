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

Design settings: layout medium, information per screen medium, animation depth high
(scroll-driven sections and magnetic cursor effects, in `assets/js/motion.js` and
`assets/js/interact.js`).

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

## Signal Room (experimental)

`signal-room/` is an alternative, fully immersive version of the landing page: one
continuous 3D room where scrolling moves the camera through eight stops (Arrival,
Fragments, Channels, Inbox, Workflow, Intelligence, Impact, Connect). The inbox is
the real HTML product UI placed in 3D with CSS3D. It reuses the shared data,
styles and 3D parts from `assets/`. Open `/signal-room/` on the local server.
Without WebGL it falls back to a plain, readable page.

## Vector Morph (experimental)

`vector/` is the same page with a different signature artwork: one cloud of
~6,000 3D points that morphs between vector shapes (signal globe → four channel
icons → connected ring → routed outcomes → Telixo mark). The cursor scatters
points and a click sends a ripple; white sections get a cursor-reactive dot grid
and buttons lean towards the cursor. It is the main page with
`<html data-engine="morph">`, so content changes in `index.html` should be copied
into `vector/index.html` (paths there point to `../assets/`).

## Conversation Stack (new direction)

`stack/` is a completely new design with no shared code or visuals: white base with
soft channel tints (blue, sky, green, amber), Bricolage Grotesque + Geist type,
a floating pill nav, a centred hero over an isometric stage where the customer
story plays out live, a channel marquee, stacking story cards, a horizontal
channel gallery, a bento inbox with working filters, a workflow with a sticky
request card, a before/after switch and a light CTA. Only GSAP + ScrollTrigger.
