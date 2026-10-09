# Telixo

Static website for Telixo — plain HTML, CSS and JavaScript, no build step.

## Structure

```
index.html                Main page
assets/css/style.css      Styles
assets/js/main.js         Mobile menu, footer year
assets/js/animations.js   Lottie players, preloader, GSAP intro + scroll reveals
assets/animations/*.json  Lottie (JSON) animations
assets/vendor/            lottie-web 5.12.2, GSAP 3.12.5 + ScrollTrigger (local copies)
assets/img/               Images
tools/build_animations.py Generates the JSON files in assets/animations/
```

## Animations

- **Lottie (JSON):** add `data-lottie="assets/animations/<file>.json"` to any
  element and it becomes a player. Add `data-loop` to loop it, or
  `data-autoplay="false"` to start paused. Animations exported from After
  Effects (Bodymovin) or downloaded from LottieFiles drop straight into
  `assets/animations/`.
- **Scroll reveal:** add `data-reveal` to any element to fade it up as it
  scrolls into view (GSAP ScrollTrigger).
- Visitors with "reduce motion" turned on get static frames instead.

To regenerate the built-in hero and loader animations:

```
python3 tools/build_animations.py
```

## Run locally

Lottie loads its JSON files over HTTP, so serve the folder instead of opening
`index.html` directly:

```
python3 -m http.server 8000
```

then visit http://localhost:8000.
