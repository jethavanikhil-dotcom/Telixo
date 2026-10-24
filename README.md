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

## Kinetic (Awwwards-style experimental)

`kinetic/` is built from scratch with no shared visuals. The typography is the artwork:
off-white paper, near-black ink and one electric blue, set in Archivo's variable width
and weight axes.

- **Hero:** each headline line is sized to span the page. Letters near the cursor widen
  and get heavier; on scroll the lines slide apart and lean with scroll speed.
- **Story:** the three story lines assemble from scattered letters, blow apart, rise in
  and compress together. The channel tags merge into one "Outcome".
- **Channels:** a giant hover list with rolling names and a floating preview card that
  follows the cursor. Click opens the details.
- **Inbox:** Elena's timeline as a horizontal parade of giant speech bubbles.
- **Workflow:** one word scrambles through Message → Intent → Routing → Action → Resolved.
- **Intelligence:** a marquee whose speed and direction follow your scroll.
- **Impact:** the outlined 10x fills with blue as you scroll (the claim is still a placeholder).

Uses `assets/vendor/lenis.min.js` for smooth scrolling. With reduced motion, every
section is static and readable in place.

## Telixo website (`site/`) — built to the gap-analysis brief

`site/` is the full Telixo marketing site from *Telixo.co — Website Gap Analysis & UX/UI
Design Brief*, in the Kinetic theme (Archivo + IBM Plex Mono, paper / charcoal #252525 /
green #20C28B). It is self-contained: deploy the `site/` folder as the web root.

**Build:** pages are generated, so the header and footer stay identical everywhere.

```
python3 site/_build/build.py          # writes site/**/index.html and site/404.html
```

- `_build/lib.py` — navigation data, icons, the header (mega menus) and footer, page layout.
- `_build/comp.py` — section building blocks (heroes, rows, steps, stacks, timelines, …).
- `_build/pages_product.py`, `pages_solutions.py`, `pages_more.py` — page content.
- `_build/home_body.html` — the homepage body.
- `site.css` (theme + homepage), `ui.css` (header + components), `core.js` (header,
  smooth scroll, cursor, page transitions), `pages.js` (scroll animations), `widgets.js`
  (interactive widgets), `home.js` (homepage only).

**Header (brief §4):** Product · Solutions · Integrations · Pricing · Resources · Company,
plus Log in, Book a Demo (WhatsApp) and Start free. One mega-menu shell morphs between
panels; Solutions has a nested By industry / By team menu; Resources includes the free
tools; Company includes the legal pages. Announcement bar, scroll progress line,
hide-on-scroll, full-screen mobile menu.

**Pages (35):** home · 6 product pages · solutions overview + 5 industries + 3 teams ·
integrations + Twilio + Odoo · pricing · FAQ · contact · about · careers · security ·
blog · guides · customer stories · free tools + WhatsApp link generator + QR code
generator · privacy policy · terms · refund and cancellation policy · 404.

Not built: compare pages and a docs site (brief P2), and login/signup screens (they belong
to the app; the header links go to the URLs in `CONFIG` at the top of `core.js`).

**To supply before launch** (marked on the pages with a dashed green outline):

- `CONFIG` in `site/core.js`: app login URL, app signup URL, WhatsApp number.
- Pricing: real plans, prices, seat limits, features per plan, annual saving, Meta fees note.
- Testimonials and customer stories: real quotes, names, results (each quote used once).
- "Why shared phones fail": 3–4 sourced statistics (homepage).
- Logos / customer count / Meta Business Partner badge (only if true).
- FAQ and product answers marked for confirmation (Meta setup, Twilio billing, Odoo
  sync fields and direction, setup steps, data storage, DPDP).
- Security claims (only what can be proved), status page link.
- About: team photos, names and roles; the Digipine Infotech LLP relationship.
- Careers: hiring email and process; blog, guides: real posts (topics shown are suggestions).
- Contact: reply time, office address and hours, email; social links; form and newsletter
  endpoints (forms show a success message but send nothing yet).
- Privacy policy and terms text from telixo.co; the refund policy text.
- Real product screenshots to replace the HTML illustrations.

### Interaction layer (patterns from 21st.dev)

Rebuilt in plain JS/CSS in the Kinetic theme (no React, no new dependencies):

- **Directional mega menu**: moving between menus slides the old panel out one way and the
  new one in from the other, while the shell resizes (`core.js` `openMega`, `ui.css` `mgIn`/`mgOut`).
- **Letter swap**: header links, buttons, menu titles and footer links roll each letter up
  on hover (`.sw`). Screen readers get the plain label.
- **Scramble**: mono arrow links (`.mg-go`, `.more`, `[data-scramble]`) decode on hover.
- **Spotlight**: cards get a green glow and lit edge that follow the pointer (`.spot`).
- **Homepage, "Every chat gets a clear path"**: a sentence travels along a wavy line as you
  scroll, the line draws itself and a dot marks the step (`.trail`).
- **Homepage, "It starts with one inbox"**: pinned zoom-out from the shared inbox to all the
  product areas (`.zoom`). Phones and tablets get a plain grid.
- **Solutions hero**: the headline cycles through industries and teams (`[data-slot]`).

All of it is mouse-only or skipped under `prefers-reduced-motion`.

## Sylva hero (ThreeUI `<SylvaHero variant="living-green" />`)

`sylva/` renders the ThreeUI **SylvaHero — Living Green** component from its exact
published source (`@designcodeio/threeui@1.2.0`, MIT), using the configured usage in
`sylva/src/Scene.tsx`. Open `/sylva/`.

- `sylva/src/` — the configured usage (`Scene.tsx`) and the mount (`main.tsx`).
- `sylva/dist/` — the built static bundle (React + the package's `SylvaHero`,
  `LandingPageFrame`, `pageTypography`, `pageRecipes` and `style.css`).
  Rebuild with `cd sylva && npm install && npm run build`.
- `landing-pages/inner-green-3d.html` and `landing-pages/inner-green-assets/` — the
  canonical scene and its local Three.js runtime, fonts and images, copied
  byte-for-byte from the package. `SylvaHero` loads them from `/landing-pages/…`,
  so the site must be served from the repository root.

Verified SHA-256 (match the ThreeUI source registry):

| File | SHA-256 |
| --- | --- |
| `landing-pages/inner-green-3d.html` | `69c3694bd63f44ef9f007ebe4dac57a83e4402e0cdf6b54dd10b96dd4f05e197` |
| `landing-pages/inner-green-assets/three.min.js` | `8a5f7249903b54d30f79f708699d2fed2d6a1d0741a4cd41377d1f01bb5a2271` |
| `landing-pages/inner-green-assets/card-ecostove.jpg` | `70ce084084902bc502f00c366405b661ecdff90dee95d363b36a6e146829e433` |
| `landing-pages/inner-green-assets/card-ethos.jpg` | `337627390f499b3ae272cec9e2f83c817694a82f42e1aa10a7b26a2c7d679dff` |
| `landing-pages/inner-green-assets/lexend-latin.woff2` | `1ec8f6ee2750554b4bc59ff0b507d316a82a7ba37e0e5bebc41d3bd9b9faad46` |
