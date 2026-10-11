// Telixo — Conversation Stack
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const motion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ---------------------------------------------------------------- basics
  const toggle = $('.nav-toggle');
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  toggle.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  $('#nav-links').addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  $('#year').textContent = new Date().getFullYear();

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

  // ------------------------------------------------- hero: the story, live
  const iso = $('.iso');
  const call = $('.dev-call');
  const timer = $('[data-timer]');
  const show = (k, on = true) => $$(`[data-step="${k}"]`, iso).forEach((el) => el.classList.toggle('is-shown', on));

  if (!motion) {
    ['1', '2b', '3', '3b'].forEach((k) => show(k));
    timer.textContent = '04:12';
  } else {
    let callStart = 0;
    gsap.ticker.add((t) => {
      if (!call.classList.contains('is-live')) return;
      const s = Math.floor((t - callStart) * 9) + 30; // sped up for the demo
      timer.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    });
    const reset = () => {
      $$('[data-step]', iso).forEach((el) => el.classList.remove('is-shown'));
      iso.classList.remove('is-merged');
      timer.textContent = '00:00';
    };
    gsap.timeline({ repeat: -1, delay: 0.6 })
      .call(reset)
      .call(() => { callStart = gsap.ticker.time; call.classList.add('is-live'); }, null, 0.3)
      .call(() => show('1'), null, 2.2)
      .call(() => show('2'), null, 3.4)
      .call(() => { show('2', false); show('2b'); }, null, 4.6)
      .call(() => { call.classList.remove('is-live'); show('3'); }, null, 5.6)
      .call(() => show('3b'), null, 6.4)
      .call(() => iso.classList.add('is-merged'), null, 8.0)
      .call(() => iso.classList.remove('is-merged'), null, 12.4)
      .to({}, { duration: 1.4 }, 12.4);

    if (fine) {
      const hero = $('.hero');
      hero.addEventListener('pointermove', (e) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        gsap.to(iso, { '--rx': `${(-ny * 8).toFixed(2)}deg`, '--rz': `${(nx * 10).toFixed(2)}deg`, duration: 0.9, ease: 'power3.out', overwrite: 'auto' });
      });
      hero.addEventListener('pointerleave', () => gsap.to(iso, { '--rx': '0deg', '--rz': '0deg', duration: 1.2, ease: 'power3.out' }));
    }

    // Hero entrance
    gsap.from('.hero-copy > *', { y: 24, autoAlpha: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, delay: 0.1 });
    gsap.from('.dev', { autoAlpha: 0, y: 40, duration: 1, ease: 'power3.out', stagger: 0.1, delay: 0.35, clearProps: 'opacity,visibility,transform' });
    gsap.to('.stage', { y: -80, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  if (!motion) return finishStatic();

  // ------------------------------------------------- stacking story cards
  const cards = $$('.card');
  cards.forEach((card, i) => {
    if (i < cards.length - 1) {
      gsap.to(card, {
        scale: 0.93, y: -12, ease: 'none',
        scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top 20%', scrub: true },
      });
    }
    gsap.from(card.querySelectorAll('.card-copy > *'), {
      y: 26, autoAlpha: 0, duration: 0.8, ease: 'power3.out', stagger: 0.07,
      scrollTrigger: { trigger: card, start: 'top 75%', toggleActions: 'play none none reverse' },
    });
  });
  // Card 2: the scattered windows fly into one timeline.
  const connect = $('.art-connect');
  const flyTo = { f1: [150, 50], f2: [-150, 10], f3: [150, -80], f4: [-150, -90] };
  gsap.timeline({ scrollTrigger: { trigger: connect, start: 'top 80%', end: 'center 50%', scrub: 0.6 } })
    .from(connect.querySelectorAll('.row'), { x: 40, autoAlpha: 0, stagger: 0.12 }, 0.2)
    .to(Object.keys(flyTo).map((k) => connect.querySelector(`.${k}`)), {
      x: (i) => Object.values(flyTo)[i][0], y: (i) => Object.values(flyTo)[i][1], scale: 0.5, autoAlpha: 0, transformOrigin: '50% 50%', stagger: 0.08,
    }, 0);
  // Card 3: conversations route to an agent or the team, then resolve.
  const outcome = $('.art-outcome');
  gsap.timeline({ scrollTrigger: { trigger: outcome, start: 'top 80%', end: 'center 50%', scrub: 0.6 } })
    .from([outcome.querySelector('.pill-ai'), outcome.querySelector('.pill-team')], { scale: 0.6, autoAlpha: 0, transformOrigin: '0% 50%', stagger: 0.1 })
    .from(outcome.querySelector('.receipt'), { scale: 0.5, autoAlpha: 0, transformOrigin: '50% 50%' });

  // ------------------------------------------------- channels: horizontal
  gsap.matchMedia().add('(min-width: 861px)', () => {
    const track = $('.h-track');
    const bar = $('.h-progress i');
    const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
    gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: '.h-pin', start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 0.6, invalidateOnRefresh: true,
        onUpdate: (s) => { bar.style.transform = `scaleX(${s.progress})`; },
      },
    });
  });

  // ------------------------------------------------- inbox bento
  document.documentElement.classList.add('motion');
  gsap.from('.tile', {
    y: 40, autoAlpha: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08,
    scrollTrigger: { trigger: '.bento', start: 'top 78%', once: true, onEnter: () => $('.tl').classList.add('is-in') },
  });
  const typed = $('.typed');
  ScrollTrigger.create({
    trigger: typed, start: 'top 85%', once: true,
    onEnter: () => {
      const text = typed.dataset.text;
      const o = { n: 0 };
      gsap.to(o, { n: text.length, duration: 2.6, ease: 'none', delay: 0.6, onUpdate: () => { typed.textContent = text.slice(0, Math.round(o.n)); } });
    },
  });
  ScrollTrigger.create({ trigger: '.t-status', start: 'top 85%', once: true, onEnter: () => $('.t-status').classList.add('is-in') });

  finishCommon();

  // ------------------------------------------------- shared (also static)
  function finishCommon() {
    // Timeline filters
    const filters = $$('.filters button');
    filters.forEach((b) => b.addEventListener('click', () => {
      filters.forEach((x) => x.classList.toggle('is-on', x === b));
      const f = b.dataset.filter;
      $$('.tl li').forEach((li) => li.classList.toggle('is-dim', f !== 'all' && li.dataset.ch !== f));
    }));

    // Workflow: the sticky card follows the step in view.
    const steps = $$('.wf-steps li');
    const layers = $$('.wf-layer');
    const stateEl = $('[data-state]');
    const STATES = ['New', 'Classified', 'Routed to AI agent', 'Updating order', 'Resolved'];
    const setStep = (n) => {
      steps.forEach((li, i) => li.classList.toggle('is-on', i === n));
      layers.forEach((l) => l.classList.toggle('is-shown', +l.dataset.l <= n));
      stateEl.textContent = STATES[n];
      stateEl.classList.toggle('is-done', n === 4);
    };
    setStep(0);
    steps.forEach((li, i) => ScrollTrigger.create({
      trigger: li, start: 'top 60%', end: 'bottom 60%',
      onToggle: (self) => { if (self.isActive) setStep(i); },
    }));

    // Before / after
    const sw = $('.switch');
    const views = { before: $('.v-before'), after: $('.v-after') };
    const setView = (v) => {
      $$('button', sw).forEach((b) => b.setAttribute('aria-selected', b.dataset.view === v));
      sw.classList.toggle('is-after', v === 'after');
      Object.entries(views).forEach(([k, el]) => el.classList.toggle('is-on', k === v));
    };
    let touched = false;
    $$('button', sw).forEach((b) => b.addEventListener('click', () => { touched = true; setView(b.dataset.view); }));
    if (motion) {
      ScrollTrigger.create({
        trigger: '.compare-stage', start: 'top 65%', once: true,
        onEnter: () => setTimeout(() => { if (!touched) setView('after'); }, 1600),
      });
      const count = $('[data-count]');
      const n = { v: 1 };
      gsap.to(n, { v: 10, duration: 1.8, ease: 'power3.out', scrollTrigger: { trigger: count, start: 'top 85%', once: true }, onUpdate: () => { count.textContent = Math.round(n.v); } });
      gsap.from('.oc', { y: 30, autoAlpha: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08, scrollTrigger: { trigger: '.outcomes', start: 'top 80%', once: true } });
      $$('.section-head').forEach((h) => gsap.from(h.children, {
        y: 28, autoAlpha: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08,
        scrollTrigger: { trigger: h, start: 'top 80%', once: true },
      }));

      // CTA: channel chips drift with the cursor.
      if (fine) {
        const cta = $('.cta');
        const orbs = $$('.orbit .o').map((el, i) => ({
          x: gsap.quickTo(el, 'x', { duration: 1, ease: 'power3.out' }),
          y: gsap.quickTo(el, 'y', { duration: 1, ease: 'power3.out' }),
          k: (i % 2 ? -1 : 1) * (14 + i * 4),
        }));
        cta.addEventListener('pointermove', (e) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          orbs.forEach((o) => { o.x(nx * o.k); o.y(ny * o.k); });
        });
      }
    }
  }

  function finishStatic() {
    $('.t-status').classList.add('is-in');
    const typedEl = $('.typed');
    typedEl.textContent = typedEl.dataset.text;
    finishCommon();
  }
})();
