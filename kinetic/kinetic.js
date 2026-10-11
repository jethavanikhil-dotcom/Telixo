// Telixo — Kinetic
// Typography does the work: letters react to the cursor, scatter and
// reassemble on scroll, and words rewrite themselves.
(() => {
  const root = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const motion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(pointer: fine)').matches;
  const loader = $('.loader');

  if (!window.gsap || !window.ScrollTrigger) { loader.remove(); return; }
  gsap.registerPlugin(ScrollTrigger);
  if (!motion) root.classList.add('reduced');
  if (fine && motion) root.classList.add('has-cursor');

  // Split an element's text into inline-block letters (and optional words).
  const splitLetters = (el, cls = 'lt') => {
    const text = el.textContent;
    el.textContent = '';
    return [...text].map((c) => {
      const s = document.createElement('span');
      s.className = cls;
      s.textContent = c === ' ' ? ' ' : c;
      el.appendChild(s);
      return s;
    });
  };
  const splitWords = (el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    const chars = [];
    words.forEach((w, i) => {
      const ws = document.createElement('span');
      ws.className = 'w';
      [...w].forEach((c) => {
        const s = document.createElement('span');
        s.className = 'ch';
        s.textContent = c;
        ws.appendChild(s);
        chars.push(s);
      });
      el.appendChild(ws);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
    return chars;
  };

  // ---------------------------------------------------------------- basics
  $('#year').textContent = new Date().getFullYear();

  const toggle = $('.bar-toggle');
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.textContent = open ? 'Close' : 'Menu';
  };
  toggle.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  // Demo request: a short form that opens a pre-filled email.
  const DEMO_EMAIL = 'demo@example.com'; // replace with Telixo's real sales address
  const dialog = $('#demo-dialog');
  const form = $('form', dialog);
  $$('[data-demo]').forEach((b) => b.addEventListener('click', () => { setMenu(false); dialog.showModal(); }));
  $('[data-close]', dialog).addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const d = new FormData(form);
    const body = `Name: ${d.get('name')}\nWork email: ${d.get('email')}\nCompany: ${d.get('company')}`;
    window.location.href = `mailto:${DEMO_EMAIL}?subject=${encodeURIComponent(`Demo request — ${d.get('company')}`)}&body=${encodeURIComponent(body)}`;
    form.innerHTML = '<p class="form-done">Thanks — your email app should open with the request ready to send.</p>';
  });

  // Smooth scroll (motion only); anchor links go through it.
  let lenis = null;
  if (motion && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const target = a.getAttribute('href') === '#top' ? 0 : $(a.getAttribute('href'));
    if (target === null) return;
    setMenu(false);
    if (lenis) { e.preventDefault(); lenis.scrollTo(target, { duration: 1.4 }); }
  });

  // Channels: rows open on click (works everywhere).
  const rows = $$('.ch-row');
  rows.forEach((row) => row.addEventListener('click', () => {
    const open = row.getAttribute('aria-expanded') !== 'true';
    rows.forEach((r) => r.setAttribute('aria-expanded', r === row && open));
  }));

  // Workflow copy, shared by both modes.
  const STEPS = [
    ['Message', "A customer message arrives on WhatsApp and joins the customer's existing timeline."],
    ['Intent', 'The request is classified using the whole conversation history as context.'],
    ['Routing', 'Routine and within policy, so it goes to an AI agent. Anything else goes to your team.'],
    ['Action', 'The order is updated in the connected system and the customer gets a confirmation.'],
    ['Resolved', 'Resolved on first contact. Sales gets a follow-up task with the full context attached.'],
  ];
  const word = $('[data-word]');
  const cap = $('[data-cap]');
  word.removeAttribute('aria-live');
  cap.setAttribute('aria-live', 'polite');

  // Static fallback: everything readable in place.
  if (!motion) {
    loader.remove();
    cap.innerHTML = `<ol>${STEPS.map(([w, c], i) => `<li><b>${String(i + 1).padStart(2, '0')} ${w}.</b> ${c}</li>`).join('')}</ol>`;
    cap.removeAttribute('aria-live');
    $$('.wf-ticks li').forEach((li) => li.classList.add('on'));
    return;
  }

  // ---------------------------------------------------------------- cursor
  if (fine) {
    const cur = $('.cursor');
    const label = $('.cursor-label', cur);
    const cx = gsap.quickTo(cur, 'x', { duration: 0.35, ease: 'power3.out' });
    const cy = gsap.quickTo(cur, 'y', { duration: 0.35, ease: 'power3.out' });
    window.addEventListener('pointermove', (e) => { cx(e.clientX); cy(e.clientY); });
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest('[data-cursor]');
      cur.classList.toggle('is-big', !!t);
      if (t) label.textContent = t.dataset.cursor;
    });
    document.addEventListener('pointerleave', () => gsap.to(cur, { autoAlpha: 0, duration: 0.2 }));
    document.addEventListener('pointerenter', () => gsap.to(cur, { autoAlpha: 1, duration: 0.2 }));
  }

  // ---------------------------------------------------------------- hero
  const kin = $('.kin');
  const lines = $$('.kin-line', kin);
  const letters = lines.map((l) => splitLetters(l));
  const allLetters = letters.flat();

  // Each line is sized so it spans the full measure.
  const fitLines = () => {
    const avail = kin.clientWidth - parseFloat(getComputedStyle(kin).paddingLeft) * 2;
    lines.forEach((l) => {
      l.style.fontSize = '100px';
      l.style.display = 'inline-block';
      const w = l.scrollWidth;
      l.style.display = '';
      l.style.fontSize = `${Math.min(100 * (avail * 0.96) / w, window.innerHeight * 0.19)}px`;
    });
    const fw = $('.foot-word');
    fw.style.fontSize = '100px';
    fw.style.display = 'inline-block';
    const w = fw.scrollWidth;
    fw.style.display = '';
    fw.style.fontSize = `${100 * (window.innerWidth * 0.97) / w}px`;
  };
  fitLines();

  // Letters near the cursor widen and get heavier.
  const BASE_W = 72; const MAX_W = 112; const BASE_G = 820; const MAX_G = 900;
  const state = allLetters.map(() => ({ w: BASE_W, g: BASE_G }));
  const mouse = { x: -9999, y: -9999 };
  let heroOn = true;
  ScrollTrigger.create({ trigger: '.hero', start: 'top bottom', end: 'bottom top', onToggle: (s) => { heroOn = s.isActive; } });
  if (fine) window.addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  else {
    // Touch: a slow wave of width moves through the letters instead.
    gsap.ticker.add((t) => { mouse.x = (Math.sin(t * 0.6) * 0.5 + 0.5) * window.innerWidth; mouse.y = (Math.cos(t * 0.4) * 0.5 + 0.5) * window.innerHeight * 0.7 + 80; });
  }
  gsap.ticker.add(() => {
    if (!heroOn) return;
    const r = Math.max(180, window.innerWidth * 0.16);
    allLetters.forEach((el, i) => {
      const b = el.getBoundingClientRect();
      const d = Math.hypot(mouse.x - (b.left + b.width / 2), mouse.y - (b.top + b.height / 2));
      const k = Math.max(0, 1 - d / r) ** 2;
      const s = state[i];
      s.w += (BASE_W + (MAX_W - BASE_W) * k - s.w) * 0.14;
      s.g += (BASE_G + (MAX_G - BASE_G) * k - s.g) * 0.14;
      el.style.setProperty('--w', s.w.toFixed(1));
      el.style.setProperty('--g', s.g.toFixed(0));
    });
  });

  // Scroll: lines slide apart; scroll speed leans them over.
  lines.forEach((l, i) => {
    gsap.to(l, {
      xPercent: i % 2 ? 14 : -14, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.4 },
    });
  });
  const skew = gsap.quickTo(lines, 'skewX', { duration: 0.5, ease: 'power3.out' });
  const bubSkew = gsap.quickTo('.bub', 'skewX', { duration: 0.6, ease: 'power3.out' });
  let vel = 0;
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (s) => {
      vel = s.getVelocity();
      const k = gsap.utils.clamp(-12, 12, vel / -220);
      skew(k);
      bubSkew(k * 0.6);
    },
  });

  // ---------------------------------------------------------------- loader + intro
  if (lenis) lenis.stop();
  window.scrollTo(0, 0);
  const count = $('[data-count]', loader);
  const n = { v: 0 };
  const intro = gsap.timeline({ paused: true })
    .from(allLetters, { yPercent: 110, rotate: 10, autoAlpha: 0, duration: 1.1, ease: 'expo.out', stagger: { each: 0.018, from: 'random' } })
    .from('.hero .meta-row, .hero-foot > *', { y: 24, autoAlpha: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08 }, 0.4)
    .from('.bar', { yPercent: -100, autoAlpha: 0, duration: 0.8, ease: 'power3.out' }, 0.3);
  const ready = Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]);
  gsap.timeline()
    .to(n, { v: 100, duration: 1.3, ease: 'power2.inOut', onUpdate: () => { count.textContent = String(Math.round(n.v)).padStart(3, '0'); } })
    .add(() => {
      ready.then(() => {
        fitLines();
        ScrollTrigger.refresh();
        gsap.timeline({ onComplete: () => loader.remove() })
          .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'expo.inOut' })
          .add(() => { intro.play(); if (lenis) lenis.start(); }, 0.35);
      });
    });

  // ---------------------------------------------------------------- story
  const phrases = $$('.phrase');
  const phraseChars = phrases.map((p) => splitWords($('.phrase-text', p)));
  const subs = phrases.map((p) => $('.phrase-sub', p));
  const phaseN = $('[data-phase-n]');
  const rnd = gsap.utils.random;
  // Function values so the scatter is re-rolled to the viewport on refresh.
  const scatter = {
    x: () => rnd(-window.innerWidth * 0.45, window.innerWidth * 0.45),
    y: () => rnd(-window.innerHeight * 0.4, window.innerHeight * 0.4),
    rotate: () => rnd(-160, 160), scale: () => rnd(0.4, 2.2), autoAlpha: 0,
  };
  const home = { x: 0, y: 0, rotate: 0, scale: 1, autoAlpha: 1 };
  phraseChars.forEach((c, i) => { if (i) gsap.set(c, { autoAlpha: 0 }); });
  gsap.set(subs, { autoAlpha: 0, y: 20 });

  const tags = $$('.tag');
  const tagBox = $('.tags');
  // Layouts per phase, as fractions of the pinned frame.
  const tagAt = (phase, i) => {
    const W = tagBox.clientWidth; const H = tagBox.clientHeight; const sm = W < 700;
    if (phase === 0) {
      const spots = sm ? [[0.22, 0.2], [0.78, 0.24], [0.24, 0.86], [0.76, 0.82], [0.5, 0.86]]
        : [[0.12, 0.26], [0.86, 0.22], [0.16, 0.8], [0.82, 0.78], [0.5, 0.86]];
      return { x: spots[i][0] * W, y: spots[i][1] * H };
    }
    if (phase === 1) {
      const gap = sm ? 0.22 : 0.11;
      return { x: W / 2 + (i - 1.5) * gap * W, y: H * (sm ? 0.84 : 0.82) };
    }
    return { x: W / 2, y: H * 0.86 }; // every channel merges into one outcome
  };
  const tagSet = (phase) => ({ x: (i) => tagAt(phase, i).x, y: (i) => tagAt(phase, i).y });
  gsap.set(tags, { xPercent: -50, yPercent: -50, ...tagSet(0), autoAlpha: 0 });

  const st = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: '.story', start: 'top top', end: 'bottom bottom', scrub: 0.8, invalidateOnRefresh: true,
      onUpdate: (s) => { phaseN.textContent = `0${s.progress < 0.36 ? 1 : s.progress < 0.7 ? 2 : 3}`; },
    },
  });
  // Phase 1: assembles out of chaos.
  // (fromTo throughout: the timeline is invalidated on refresh, and a plain
  // from() would re-record its end state mid-animation.)
  st.fromTo(phraseChars[0], scatter, { ...home, ease: 'power3.out', stagger: { each: 0.004, from: 'random' }, duration: 1 }, 0)
    .to(subs[0], { autoAlpha: 1, y: 0, duration: 0.3 }, 0.7)
    .fromTo(tags.slice(0, 4), { ...tagSet(0), scale: 0, autoAlpha: 0 }, { ...tagSet(0), scale: 1, autoAlpha: 1, stagger: 0.08, duration: 0.4 }, 0.3)
    // ...and blows apart.
    .to(phraseChars[0], { y: () => rnd(-window.innerHeight * 0.6, -window.innerHeight * 0.2), rotate: () => rnd(-90, 90), autoAlpha: 0, stagger: { each: 0.004, from: 'random' }, duration: 0.6 }, 1.8)
    .to(subs[0], { autoAlpha: 0, y: -20, duration: 0.2 }, 1.8)
    // Phase 2: rises in line by line, tags fall into a row.
    .fromTo(phraseChars[1], { yPercent: 120, autoAlpha: 0, rotateX: -80 }, { yPercent: 0, autoAlpha: 1, rotateX: 0, stagger: 0.02, duration: 0.6 }, 2.2)
    .to(subs[1], { autoAlpha: 1, y: 0, duration: 0.3 }, 2.6)
    .to(tags.slice(0, 4), { ...tagSet(1), duration: 0.8 }, 2.1)
    .to(phraseChars[1], { yPercent: -120, autoAlpha: 0, stagger: 0.012, duration: 0.5 }, 3.6)
    .to(subs[1], { autoAlpha: 0, y: -20, duration: 0.2 }, 3.6)
    // Phase 3: compresses together; the channels merge into one outcome.
    .fromTo(phraseChars[2], { scaleX: 3, autoAlpha: 0, x: (i) => (i % 2 ? 1 : -1) * 120 }, { scaleX: 1, autoAlpha: 1, x: 0, stagger: { each: 0.01, from: 'center' }, duration: 0.7 }, 4.0)
    .to(subs[2], { autoAlpha: 1, y: 0, duration: 0.3 }, 4.5)
    .to(tags.slice(0, 4), { ...tagSet(2), scale: 0.6, duration: 0.7 }, 4.0)
    .to(tags.slice(0, 4), { autoAlpha: 0, duration: 0.2 }, 4.6)
    .fromTo(tags[4], { ...tagSet(2), scale: 0, autoAlpha: 0 }, { ...tagSet(2), scale: 1.3, autoAlpha: 1, ease: 'back.out(2)', duration: 0.5 }, 4.6)
    .to({}, { duration: 0.6 });

  // ---------------------------------------------------------------- channels: floating preview
  const preview = $('.preview');
  const pvs = $$('.pv', preview);
  if (fine) {
    const px = gsap.quickTo(preview, 'left', { duration: 0.6, ease: 'power3.out' });
    const py = gsap.quickTo(preview, 'top', { duration: 0.6, ease: 'power3.out' });
    const list = $('.ch-list');
    list.addEventListener('pointermove', (e) => {
      const left = e.clientX > window.innerWidth * 0.6 ? e.clientX - 350 : e.clientX + 70;
      px(left); py(e.clientY - 120);
    });
    rows.forEach((row) => row.addEventListener('pointerenter', () => {
      pvs.forEach((p) => p.classList.toggle('is-on', p.dataset.pv === row.dataset.ch));
      preview.classList.add('is-on');
    }));
    list.addEventListener('pointerleave', () => preview.classList.remove('is-on'));
  }

  // ---------------------------------------------------------------- inbox: horizontal parade
  gsap.matchMedia().add('(min-width: 901px)', () => {
    const parade = $('.parade');
    const dist = () => Math.max(0, parade.scrollWidth - window.innerWidth);
    gsap.to(parade, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: '.inbox-pin', start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 0.6, invalidateOnRefresh: true },
    });
    gsap.from('.bub', {
      rotate: (i) => (i % 2 ? 3 : -3), y: 50, ease: 'none', stagger: 0.1,
      scrollTrigger: { trigger: '.inbox-pin', start: 'top top', end: () => `+=${dist()}`, scrub: 0.6 },
    });
  });

  // ---------------------------------------------------------------- workflow: the word rewrites itself
  // All five words are stacked in one clipped line. Scroll position drives
  // every letter directly (no timed tweens), so each word always flips
  // through in turn, at any scroll speed: letters roll up out of view one
  // after another while the next word's letters roll in from below.
  const ticks = $$('.wf-ticks li');
  const stepN = $('[data-step-n]');
  const foot = $('.wf-foot');
  word.textContent = '';
  word.setAttribute('aria-hidden', 'true');
  const reel = STEPS.map(([txt], i) => {
    const line = document.createElement('span');
    line.className = `wf-line${i === STEPS.length - 1 ? ' is-last' : ''}`;
    const ls = [...txt].map((c) => {
      const sp = document.createElement('span');
      sp.className = 'wl';
      sp.textContent = c;
      line.appendChild(sp);
      return sp;
    });
    word.appendChild(line);
    return ls;
  });
  const ease = gsap.parseEase('power2.inOut');
  let step = -1;
  const setStep = (i) => {
    if (i === step) return;
    step = i;
    ticks.forEach((li, k) => { li.classList.toggle('on', k <= i); li.classList.toggle('cur', k === i); });
    stepN.textContent = `0${i + 1}`;
    cap.textContent = STEPS[i][1];
    gsap.fromTo(cap, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out', overwrite: true });
  };
  const HOLD = 0.28; // each word holds still for this much of its slot either side
  const drawReel = (pos) => {
    reel.forEach((ls, i) => {
      ls.forEach((el, k) => {
        const t = pos - i - (k - ls.length / 2) * 0.03;
        const a = Math.abs(t);
        const m = a <= HOLD ? 0 : ease(Math.min(1, (a - HOLD) / (1 - 2 * HOLD)));
        const dir = t > 0 ? -1 : 1;
        el.style.transform = `translate3d(0,${(dir * m * 115).toFixed(2)}%,0) rotateX(${(-dir * m * 75).toFixed(1)}deg)`;
        el.style.setProperty('--lw', (80 + 20 * Math.sin(pos * Math.PI * 2 + k * 0.8)).toFixed(1));
      });
    });
  };
  drawReel(0);
  setStep(0);
  ScrollTrigger.create({
    trigger: '.workflow', start: 'top top', end: 'bottom bottom',
    onUpdate: (s) => {
      // The five words fill the first 90%; the rest is a short hold before release.
      const pos = Math.min(1, s.progress / 0.9) * (STEPS.length - 1);
      drawReel(pos);
      setStep(Math.round(pos));
      foot.style.setProperty('--p', s.progress.toFixed(4));
    },
  });
  gsap.from('.wf-word', { yPercent: 40, autoAlpha: 0, scrollTrigger: { trigger: '.workflow', start: 'top 70%', end: 'top top', scrub: 0.6 } });

  // ---------------------------------------------------------------- marquee: speed follows scroll
  const mqs = $$('.mq-row').map((row, i) => {
    const inner = $('.mq-in', row);
    row.appendChild(inner.cloneNode(true));
    return { els: $$('.mq-in', row), dir: i ? 1 : -1, pos: 0 };
  });
  let mqDir = 1;
  gsap.ticker.add((t, dt) => {
    if (Math.abs(vel) > 5) mqDir = vel > 0 ? 1 : -1;
    const boost = Math.min(Math.abs(vel) / 60, 40);
    mqs.forEach((m) => {
      const w = m.els[0].offsetWidth;
      if (!w) return;
      m.pos += m.dir * mqDir * (1.2 + boost) * (dt / 16.7);
      const x = gsap.utils.wrap(-w, 0, m.pos);
      m.els.forEach((el) => { el.style.transform = `translate3d(${x}px,0,0)`; });
    });
    vel *= 0.92;
  });

  // ---------------------------------------------------------------- impact
  gsap.to('[data-ten]', {
    backgroundPosition: '0% 0', ease: 'none',
    scrollTrigger: { trigger: '.ten-wrap', start: 'top 80%', end: 'bottom 40%', scrub: 0.6 },
  });
  gsap.from('[data-ten]', {
    scaleY: 0.4, transformOrigin: '50% 100%', ease: 'none',
    scrollTrigger: { trigger: '.ten-wrap', start: 'top bottom', end: 'top 40%', scrub: 0.6 },
  });
  gsap.from('.outcomes li', {
    y: 50, autoAlpha: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1,
    scrollTrigger: { trigger: '.outcomes', start: 'top 85%', once: true },
  });

  // Section headings: lines rise into place.
  $$('.channels .h2, .impact .h2, .cta .h2').forEach((h) => gsap.from(h, {
    yPercent: 30, autoAlpha: 0, duration: 1, ease: 'expo.out',
    scrollTrigger: { trigger: h, start: 'top 85%', once: true },
  }));
  gsap.from('.ch-list li', {
    y: 40, autoAlpha: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08,
    scrollTrigger: { trigger: '.ch-list', start: 'top 85%', once: true },
  });

  // ---------------------------------------------------------------- footer word
  const footLetters = splitLetters($('.foot-word'));
  gsap.from(footLetters, {
    yPercent: 100, ease: 'none', stagger: 0.06,
    scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: 0.6 },
  });

  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { fitLines(); ScrollTrigger.refresh(); }, 150); });
})();
