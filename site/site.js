// Telixo — Homepage
// Built to the website gap-analysis brief (§4 navigation, §6 homepage), in the
// Kinetic theme: letters react to the cursor and scatter and reassemble on
// scroll. Scrolling is never taken over: every section reads at the reader's pace.
(() => {
  // Destinations the team still has to confirm (brief §5.12): one place to change them.
  const CONFIG = {
    login: '/login', // app login URL (app subdomain, confirm with the dev team)
    signup: '/signup', // app signup URL for "Start free"
    whatsapp: 'https://wa.me/910000000000?text=' + encodeURIComponent('Hi Telixo, I would like to book a demo.'), // replace 910000000000 with Telixo's WhatsApp number
  };

  const root = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const motion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(pointer: fine)').matches;
  const loader = $('.loader');

  $$('[data-link]').forEach((a) => { if (CONFIG[a.dataset.link]) a.href = CONFIG[a.dataset.link]; });

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
  const menus = $$('.has-menu');
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.textContent = open ? 'Close' : 'Menu';
    if (!open) closeMenus();
  };
  toggle.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));

  // Header dropdowns: hover on desktop, click/tap and keyboard everywhere.
  const desktop = window.matchMedia('(min-width: 1101px)');
  const openMenu = (li, open) => {
    li.classList.toggle('open', open);
    $('.nav-btn', li).setAttribute('aria-expanded', open);
  };
  const closeMenus = (except) => menus.forEach((li) => { if (li !== except) openMenu(li, false); });
  menus.forEach((li) => {
    let t;
    $('.nav-btn', li).addEventListener('click', () => { const open = !li.classList.contains('open'); closeMenus(li); openMenu(li, open); });
    li.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'mouse' || !desktop.matches) return; clearTimeout(t); closeMenus(li); openMenu(li, true); });
    li.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'mouse' || !desktop.matches) return; t = setTimeout(() => openMenu(li, false), 160); });
    li.addEventListener('focusout', (e) => { if (desktop.matches && !li.contains(e.relatedTarget)) openMenu(li, false); });
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.has-menu')) closeMenus(); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const li = menus.find((m) => m.classList.contains('open'));
    if (li) { openMenu(li, false); $('.nav-btn', li).focus(); } else setMenu(false);
  });
  $('#nav').addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });

  // Newsletter: no list provider is connected yet.
  const news = $('.news');
  news.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!news.reportValidity()) return;
    // TODO: send the address to the newsletter provider once one is chosen.
    $('.news-row', news).outerHTML = '<p class="form-done">Thanks, you’re on the list.</p>';
  });

  if (!window.gsap || !window.ScrollTrigger) { loader.remove(); return; }
  gsap.registerPlugin(ScrollTrigger);
  if (!motion) root.classList.add('reduced');
  if (fine && motion) root.classList.add('has-cursor');

  // Smooth scroll (motion only); anchor links go through it.
  let lenis = null;
  if (motion && window.Lenis) {
    lenis = new Lenis({ lerp: 0.12 });
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
    if (lenis && target === 0) { e.preventDefault(); lenis.scrollTo(0, { duration: 1.4 }); return; }
    if (lenis) { e.preventDefault(); lenis.scrollTo(target, { duration: 1.4 }); }
  });

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

  // ---------------------------------------------------------------- mobile CTA dock
  // Appears once the hero buttons scroll away; hides at the final CTA band.
  const dockSeen = { hero: true, end: false };
  const dockIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => { dockSeen[e.target === $('.hero-ctas') ? 'hero' : 'end'] = e.isIntersecting; });
    document.body.classList.toggle('dock-on', !dockSeen.hero && !dockSeen.end);
  });
  dockIO.observe($('.hero-ctas'));
  dockIO.observe($('#start'));

  // Static fallback: everything readable in place.
  const stepItems = $$('.steps-list li');
  if (!motion) {
    loader.remove();
    stepItems.forEach((li) => li.classList.add('on'));
    $('[data-typing]').style.display = 'none';
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
  let vel = 0;
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (s) => {
      vel = s.getVelocity();
      const k = gsap.utils.clamp(-12, 12, vel / -220);
      skew(k);
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
    .from('.bar', { yPercent: -100, autoAlpha: 0, duration: 0.7, ease: 'power3.out', clearProps: 'transform' }, 0.2); // a leftover transform would trap the fixed mobile menu inside the bar
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

  // ---------------------------------------------------------------- how it works
  // Each step word rises letter by letter; the line fills as you scroll past.
  const stepWords = $$('.step-w').map((el) => splitLetters(el));
  gsap.from(stepWords.flat(), {
    yPercent: 110, autoAlpha: 0, duration: 0.8, ease: 'expo.out', stagger: 0.025,
    scrollTrigger: { trigger: '.steps-list', start: 'top 85%', once: true },
  });
  const stepsList = $('.steps-list');
  stepsList.style.setProperty('--p', 0);
  stepItems.forEach((li) => li.classList.remove('on'));
  ScrollTrigger.create({
    trigger: stepsList, start: 'top 80%', end: 'bottom 55%', scrub: true,
    onUpdate: (s) => {
      stepsList.style.setProperty('--p', s.progress.toFixed(3));
      stepItems.forEach((li, i) => li.classList.toggle('on', s.progress >= i / stepItems.length));
    },
  });

  // ---------------------------------------------------------------- testimonials
  gsap.from('.parade > *', {
    y: 50, autoAlpha: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08,
    scrollTrigger: { trigger: '.parade', start: 'top 85%', once: true },
  });

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
  $$('.why .h2, .steps .h2, .tour .h2, .faq .h2, .cta .h2').forEach((h) => gsap.from(h, {
    yPercent: 30, autoAlpha: 0, duration: 1, ease: 'expo.out',
    scrollTrigger: { trigger: h, start: 'top 85%', once: true },
  }));
  // ---------------------------------------------------------------- footer word
  const footLetters = splitLetters($('.foot-word'));
  gsap.from(footLetters, {
    yPercent: 100, ease: 'none', stagger: 0.06,
    scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: 0.6 },
  });

  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { fitLines(); ScrollTrigger.refresh(); }, 150); });
})();
