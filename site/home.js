// Telixo — homepage only (runs after core.js, which provides window.TX).
// Kinetic hero, the problem story, the product tour, the How it works reel
// and the testimonial parade.
(() => {
  const TX = window.TX;
  const { $, $$, motion, fine, splitLetters, splitWords } = TX;
  const loader = $('.loader');
  const lenis = TX.lenis;
  if (!window.gsap || !window.ScrollTrigger) { loader?.remove(); return; }

  // ---------------------------------------------------------------- product tour
  // Feature copy scrolls on the left; the screenshot on the right follows it.
  // Tabs jump straight to a feature. Plain scrolling, nothing is locked.
  const tSteps = $$('.tour-step');
  const tTabs = $$('.tour-tabs [data-tab]');
  const tScrs = $$('.scr');
  const tTitle = $('[data-scr-title]');
  const T_TITLES = ['Shared inbox', 'Campaigns', 'Contacts', 'Team and roles', 'Calling', 'Odoo sync'];
  let tCur = -1;
  const setScr = (i) => {
    if (i === tCur) return;
    tCur = i;
    tScrs.forEach((el, k) => el.classList.toggle('is-on', k === i));
    tSteps.forEach((el, k) => el.classList.toggle('is-on', k === i));
    tTabs.forEach((b, k) => { b.setAttribute('aria-selected', k === i); b.tabIndex = k === i ? 0 : -1; });
    tTitle.textContent = `Telixo · ${T_TITLES[i]}`;
    const tab = tTabs[i];
    tab.parentElement.scrollTo({ left: tab.offsetLeft - 16, behavior: 'smooth' });
  };
  setScr(0);
  const phone = window.matchMedia('(max-width: 900px)');
  let tIO;
  const watchSteps = () => {
    if (tIO) tIO.disconnect();
    // Desktop: the step crossing the middle of the screen. Phones: the step
    // just below the sticky screenshot.
    tIO = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) setScr(+e.target.dataset.step); }),
      { rootMargin: phone.matches ? '-62% 0px -30% 0px' : '-48% 0px -48% 0px' });
    tSteps.forEach((el) => tIO.observe(el));
  };
  watchSteps();
  phone.addEventListener('change', watchSteps);
  const goStep = (i) => {
    setScr(i);
    const el = tSteps[i];
    const r = el.getBoundingClientRect();
    const y = window.scrollY + r.top - (phone.matches ? window.innerHeight * 0.62 - 20 : (window.innerHeight - r.height) / 2);
    if (lenis) lenis.scrollTo(y, { duration: 1 });
    else window.scrollTo({ top: y, behavior: motion ? 'smooth' : 'auto' });
  };
  tTabs.forEach((b, i) => {
    b.addEventListener('click', () => goStep(i));
    b.addEventListener('keydown', (e) => {
      const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!d) return;
      const j = (i + d + tTabs.length) % tTabs.length;
      goStep(j);
      tTabs[j].focus();
    });
  });
  // The call timer on the Calling screen.
  const callT = $('[data-call-time]');
  let callS = 84;
  if (motion) setInterval(() => { if (tCur !== 4) return; callS += 1; callT.textContent = `${String(Math.floor(callS / 60)).padStart(2, '0')}:${String(callS % 60).padStart(2, '0')}`; }, 1000);

  // How it works: the four steps from the brief.
  const STEPS = [
    ['Connect', 'Connect your WhatsApp Business number to Telixo.'],
    ['Add team', 'Invite your team and choose what each person can see and do.'],
    ['Organise', 'Import your contacts, tag and group them, and keep them in sync with Odoo.'],
    ['Message', 'Reply together from one shared inbox, and send campaigns and broadcasts.'],
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
    $('[data-typing]').style.display = 'none';
    return;
  }

  // ---------------------------------------------------------------- hero
  const kin = $('.kin');
  const lines = $$('.kin-line', kin);
  // Split into words (so the sentence wraps between words on phones) and
  // letters, keeping inner spans such as the green "team.".
  const splitKin = (el) => {
    const out = [];
    [...el.childNodes].forEach((node) => {
      if (node.nodeType === 1) { out.push(...splitKin(node)); return; }
      const parts = node.textContent.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      parts.forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
        const w = document.createElement('span');
        w.className = 'kw';
        [...part].forEach((c) => {
          const lt = document.createElement('span');
          lt.className = 'lt';
          lt.textContent = c;
          w.appendChild(lt);
          out.push(lt);
        });
        frag.appendChild(w);
      });
      node.replaceWith(frag);
    });
    return out;
  };
  const letters = lines.map((l) => splitKin(l));
  const allLetters = letters.flat();

  // Both lines share one size, set so the longer line spans the measure.
  // On phones the sentence simply wraps (CSS size).
  const fitLines = () => {
    const avail = kin.clientWidth - parseFloat(getComputedStyle(kin).paddingLeft) * 2;
    if (window.innerWidth <= 700) lines.forEach((l) => { l.style.fontSize = ''; });
    else {
      const widest = Math.max(...lines.map((l) => {
        l.style.fontSize = '100px';
        l.style.display = 'inline-block';
        const w = l.scrollWidth;
        l.style.display = '';
        return w;
      }));
      const size = Math.min(100 * (avail * 0.97) / widest, window.innerHeight * 0.2);
      lines.forEach((l) => { l.style.fontSize = `${size}px`; });
    }
  };
  fitLines();

  // Letters near the cursor widen and get heavier.
  const BASE_W = 72; const MAX_W = 112; const BASE_G = 820; const MAX_G = 900;
  const state = allLetters.map(() => ({ w: BASE_W, g: BASE_G }));
  const mouse = { x: -9999, y: -9999 };
  let heroOn = true;
  ScrollTrigger.create({ trigger: '.hero', start: 'top bottom', end: 'bottom top', onToggle: (s) => { heroOn = s.isActive; } });
  // Mouse only: phones skip this work entirely, and it sleeps once settled.
  let settled = true;
  if (fine) window.addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; settled = false; });
  if (fine) gsap.ticker.add(() => {
    if (!heroOn || settled) return;
    let moving = 0;
    const r = Math.max(180, window.innerWidth * 0.16);
    allLetters.forEach((el, i) => {
      const b = el.getBoundingClientRect();
      const d = Math.hypot(mouse.x - (b.left + b.width / 2), mouse.y - (b.top + b.height / 2));
      const k = Math.max(0, 1 - d / r) ** 2;
      const s = state[i];
      const dw = (BASE_W + (MAX_W - BASE_W) * k - s.w) * 0.14;
      s.w += dw;
      s.g += (BASE_G + (MAX_G - BASE_G) * k - s.g) * 0.14;
      moving = Math.max(moving, Math.abs(dw));
      el.style.setProperty('--w', s.w.toFixed(1));
      el.style.setProperty('--g', s.g.toFixed(0));
    });
    if (moving < 0.02) settled = true;
  });

  // Scroll speed leans the lines over.
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

  // ---------------------------------------------------------------- hero: product screenshot
  // The screenshot tilts up into place as you scroll, and the chat plays on a loop.
  gsap.fromTo('.shot', { rotateX: 16, scale: 0.94, y: 30 }, {
    rotateX: 0, scale: 1, y: 0, ease: 'none',
    scrollTrigger: { trigger: '.shot-wrap', start: 'top bottom', end: 'top 15%', scrub: 0.6 },
  });
  const msgs = $$('[data-m]');
  const typing = $('[data-typing]');
  const show = (el) => { el.style.display = ''; gsap.fromTo(el, { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, ease: 'power3.out' }); };
  const hide = (el) => { el.style.display = 'none'; };
  const chat = gsap.timeline({ repeat: -1, repeatDelay: 2.2, delay: 2.4 })
    .call(() => { msgs.forEach(hide); hide(typing); });
  msgs.forEach((m, i) => {
    const t = 0.4 + i * 1.6;
    if (m.classList.contains('in')) chat.call(() => { typing.style.display = ''; }, null, t - 0.9).call(() => hide(typing), null, t);
    chat.call(() => show(m), null, t);
  });
  chat.to({}, { duration: 2.6 });

  // ---------------------------------------------------------------- loader + intro
  // Short, and only on the first visit in a session; repeat visits go straight in.
  let seen = false;
  try { seen = sessionStorage.getItem('telixo-intro') === '1'; sessionStorage.setItem('telixo-intro', '1'); } catch (e) { /* storage blocked */ }
  if (lenis) lenis.stop();
  window.scrollTo(0, 0);
  const count = $('[data-count]', loader);
  const n = { v: 0 };
  const intro = gsap.timeline({ paused: true })
    .from(allLetters, { yPercent: 110, rotate: 10, autoAlpha: 0, duration: 0.9, ease: 'expo.out', stagger: { each: 0.012, from: 'random' } })
    .from('.hero .meta-row, .hero-foot > *', { y: 24, autoAlpha: 0, duration: 0.8, ease: 'power3.out', stagger: 0.06 }, 0.25)
    .from('.hdr-in', { y: -30, autoAlpha: 0, duration: 0.7, ease: 'power3.out', clearProps: 'transform,opacity,visibility' }, 0.2);
  const ready = Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]);
  const start = () => { fitLines(); ScrollTrigger.refresh(); intro.play(); if (lenis) lenis.start(); };
  if (seen) { loader.remove(); ready.then(start); } else {
    gsap.timeline()
      .to(n, { v: 100, duration: 0.5, ease: 'power2.inOut', onUpdate: () => { count.textContent = String(Math.round(n.v)).padStart(3, '0'); } })
      .add(() => {
        ready.then(() => {
          gsap.timeline({ onComplete: () => loader.remove() })
            .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 0.6, ease: 'expo.inOut' })
            .add(start, 0.2);
        });
      });
  }

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
    return { x: W / 2, y: H * 0.86 }; // every role merges into one shared inbox
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

  // ---------------------------------------------------------------- testimonials: horizontal parade
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
  // All the step words are stacked in one clipped line. Scroll position drives
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
      sp.textContent = c === ' ' ? '\u00a0' : c;
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
  // Each word gets an equal share of the pinned scroll (a short lead-in and
  // lead-out either side), and when scrolling stops mid-change the page
  // settles on the nearest word, so no step is skipped with a fast wheel.
  const LEAD = 0.05;
  const posOf = (p) => gsap.utils.clamp(0, 1, (p - LEAD) / (1 - 2 * LEAD)) * (STEPS.length - 1);
  const wf = ScrollTrigger.create({
    trigger: '.workflow', start: 'top top', end: 'bottom bottom',
    onUpdate: (s) => {
      const pos = posOf(s.progress);
      drawReel(pos);
      setStep(Math.round(pos));
      foot.style.setProperty('--p', s.progress.toFixed(4));
    },
  });
  const stepY = (k) => wf.start + (wf.end - wf.start) * (LEAD + (1 - 2 * LEAD) * k / (STEPS.length - 1));
  // Touch and keyboard scrolling: settle on the nearest word when scrolling stops.
  ScrollTrigger.addEventListener('scrollEnd', () => {
    if (gateBusy()) return;
    const y = window.scrollY;
    if (y <= stepY(0) || y >= stepY(STEPS.length - 1)) return;
    const ty = stepY(Math.round(posOf((y - wf.start) / (wf.end - wf.start))));
    if (Math.abs(ty - y) < 3) return;
    if (lenis) lenis.scrollTo(ty, { duration: 0.3 });
    else window.scrollTo({ top: ty, behavior: 'smooth' });
  });

  // Wheel and trackpad: inside the section, one gesture = one word. A fast
  // flick or trackpad momentum can no longer fly past the middle words; the
  // next word only comes once the current one has been on screen and the
  // gesture has paused (or after a beat, for continuous wheeling).
  let stepping = false;
  let stepAt = 0;
  let lastWheel = 0;
  const gateBusy = () => stepping || performance.now() - stepAt < 220;
  const goTo = (y) => {
    stepping = true;
    stepAt = performance.now();
    lenis.scrollTo(y, { duration: 0.35, lock: true, force: true, onComplete: () => { stepping = false; } });
  };
  TX.wheelGate = (e) => {
    if (!e.event.type.includes('wheel') || !e.deltaY) return true;
    const now = performance.now();
    const quiet = now - lastWheel > 80;
    lastWheel = now;
    const dir = Math.sign(e.deltaY);
    const cur = lenis.targetScroll;
    const first = stepY(0);
    const last = stepY(STEPS.length - 1);
    const inside = cur > first - 2 && cur < last + 2;
    const block = () => { e.event.preventDefault(); return false; };
    if (!inside) {
      // Don't let one big flick jump over the whole section: stop at its edge.
      if (dir > 0 && cur < first && cur + e.deltaY > first) { if (!stepping) goTo(first); return block(); }
      if (dir < 0 && cur > last && cur + e.deltaY < last) { if (!stepping) goTo(last); return block(); }
      return true;
    }
    const k = Math.round(posOf((cur - wf.start) / (wf.end - wf.start)));
    // Leaving at either end is normal scrolling, once the end word has been seen.
    if ((dir > 0 && k === STEPS.length - 1) || (dir < 0 && k === 0)) {
      return gateBusy() || (!quiet && now - stepAt < 450) ? block() : true;
    }
    if (stepping || !(quiet || now - stepAt > 480) || now - stepAt < 220) return block();
    goTo(stepY(k + dir));
    return block();
  };
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

  // ---------------------------------------------------------------- reveals
  gsap.from('.why-list li', {
    y: 50, autoAlpha: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1,
    scrollTrigger: { trigger: '.why-list', start: 'top 85%', once: true },
  });
  gsap.from('.faq details', {
    y: 30, autoAlpha: 0, duration: 0.7, ease: 'power3.out', stagger: 0.06,
    scrollTrigger: { trigger: '.faq-list', start: 'top 85%', once: true },
  });
  gsap.from('.trust-row > *', {
    y: 30, autoAlpha: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1,
    scrollTrigger: { trigger: '.trust-row', start: 'top 90%', once: true },
  });

  // Section headings: lines rise into place.
  $$('.why .h2, .tour .h2, .faq .h2, .cta .h2').forEach((h) => gsap.from(h, {
    yPercent: 30, autoAlpha: 0, duration: 1, ease: 'expo.out',
    scrollTrigger: { trigger: h, start: 'top 85%', once: true },
  }));
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { fitLines(); ScrollTrigger.refresh(); }, 150); });
})();
