// Telixo — section behaviours shared by the inner pages (runs after core.js).
// Everything is opt-in through data attributes, and every section is complete
// at rest: motion only adds to content that is already readable.
(() => {
  const TX = window.TX;
  const { $, $$, motion, fine, splitKin, splitLetters } = TX;
  const G = window.gsap && window.ScrollTrigger ? window.gsap : null;
  const anim = !!G && motion;

  // ---------------------------------------------------------------- kinetic titles
  // Letters near the cursor widen and get heavier; on load they rise in.
  $$('[data-kin]').forEach((title) => {
    const letters = splitKin(title);
    if (!anim) return;
    G.from(letters, { yPercent: 105, autoAlpha: 0, rotate: 6, duration: 0.9, ease: 'expo.out', stagger: { each: 0.012, from: 'start' }, delay: 0.15 });
    if (!fine) return;
    const base = parseFloat(getComputedStyle(title).getPropertyValue('--kin-w')) || 74;
    const st = letters.map(() => ({ w: base, g: 860 }));
    let mx = -9999; let my = -9999; let settled = true; let on = true;
    window.addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; settled = false; });
    ScrollTrigger.create({ trigger: title, start: 'top bottom', end: 'bottom top', onToggle: (s) => { on = s.isActive; } });
    G.ticker.add(() => {
      if (!on || settled) return;
      const r = Math.max(160, window.innerWidth * 0.14);
      let moving = 0;
      letters.forEach((el, i) => {
        const b = el.getBoundingClientRect();
        const k = Math.max(0, 1 - Math.hypot(mx - (b.left + b.width / 2), my - (b.top + b.height / 2)) / r) ** 2;
        const s = st[i];
        const dw = (base + (112 - base) * k - s.w) * 0.14;
        s.w += dw;
        s.g += (860 + 40 * k - s.g) * 0.14;
        moving = Math.max(moving, Math.abs(dw));
        el.style.setProperty('--w', s.w.toFixed(1));
        el.style.setProperty('--g', s.g.toFixed(0));
      });
      if (moving < 0.02) settled = true;
    });
  });

  // ---------------------------------------------------------------- one word, full width
  $$('[data-fit]').forEach((el) => {
    const fit = () => {
      el.style.fontSize = '100px';
      const w = el.scrollWidth;
      const avail = el.parentElement.clientWidth - (parseFloat(getComputedStyle(el.parentElement).paddingLeft) || 0) * 2;
      el.style.fontSize = `${Math.min(100 * (avail * 0.99) / w, window.innerHeight * 0.42)}px`;
    };
    fit();
    document.fonts?.ready.then(() => { fit(); window.ScrollTrigger?.refresh(); });
    window.addEventListener('resize', fit);
  });

  // ---------------------------------------------------------------- stateful widgets work without motion too
  // Flip cards
  $$('[data-flip]').forEach((card) => {
    const btns = $$('.flip-btn', card);
    const set = (on) => { card.classList.toggle('is-on', on); btns.forEach((b) => b.setAttribute('aria-pressed', on)); };
    btns.forEach((b) => b.addEventListener('click', () => set(!card.classList.contains('is-on'))));
  });

  // Tabs with a sliding indicator; panels optional
  $$('[data-tabs]').forEach((bar) => {
    const ind = $('.ind', bar);
    const tabs = $$('[role="tab"]', bar);
    const place = (t) => { if (!ind) return; ind.style.width = `${t.offsetWidth}px`; ind.style.transform = `translateX(${t.offsetLeft - 5}px)`; };
    const pick = (t) => {
      tabs.forEach((x) => { x.setAttribute('aria-selected', x === t); x.tabIndex = x === t ? 0 : -1; });
      place(t);
      const scope = bar.closest('[data-tab-scope]') || document;
      $$('[data-tabpanel]', scope).forEach((p) => { p.hidden = p.dataset.tabpanel !== t.dataset.tab; });
      bar.dispatchEvent(new CustomEvent('tab', { detail: t.dataset.tab }));
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => pick(t));
      t.addEventListener('keydown', (e) => {
        const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        if (!d) return;
        const n = tabs[(i + d + tabs.length) % tabs.length];
        pick(n); n.focus();
      });
    });
    const start = tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0];
    requestAnimationFrame(() => pick(start));
    document.fonts?.ready.then(() => place(tabs.find((t) => t.getAttribute('aria-selected') === 'true')));
    window.addEventListener('resize', () => place(tabs.find((t) => t.getAttribute('aria-selected') === 'true')));
  });

  // Filter grid: chips + search over [data-tags] / text
  $$('[data-filter]').forEach((box) => {
    const items = $$('[data-item]', box);
    const chips = $$('.fchips button', box);
    const input = $('.fsearch input', box);
    const empty = $('.fempty', box);
    let cat = 'all';
    const apply = () => {
      const q = (input?.value || '').trim().toLowerCase();
      let shown = 0;
      items.forEach((it) => {
        const ok = (cat === 'all' || (it.dataset.tags || '').split(' ').includes(cat)) && (!q || it.textContent.toLowerCase().includes(q));
        if (ok && it.hidden && anim) G.fromTo(it, { autoAlpha: 0, y: 16, scale: 0.98 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: 'power3.out', clearProps: 'all' });
        it.hidden = !ok;
        if (ok) shown += 1;
      });
      if (empty) empty.hidden = shown > 0;
      box.dispatchEvent(new CustomEvent('filtered', { detail: { q, cat, shown } }));
    };
    chips.forEach((c) => c.addEventListener('click', () => {
      cat = c.dataset.cat;
      chips.forEach((x) => x.setAttribute('aria-pressed', x === c));
      apply();
    }));
    input?.addEventListener('input', apply);
  });

  // Forms: friendly validation and an in-page success state (no backend yet)
  $$('[data-form]').forEach((form) => {
    const fields = $$('.field-s', form);
    const check = (f) => {
      const el = $('input, select, textarea', f);
      const bad = el && !el.checkValidity();
      f.classList.toggle('bad', !!bad);
      return !bad;
    };
    fields.forEach((f) => $('input, select, textarea', f)?.addEventListener('blur', () => check(f)));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const ok = fields.map(check).every(Boolean);
      if (!ok) { $('.bad input, .bad select, .bad textarea', form)?.focus(); return; }
      // TODO: send to the team's form endpoint or CRM once it exists.
      const done = $('[data-form-done]', form.parentElement);
      form.hidden = true;
      if (done) { done.hidden = false; done.focus?.(); }
    });
  });

  // Before / after slider (drag, click or arrow keys)
  $$('[data-compare]').forEach((box) => {
    const btn = $('.cmp-handle button', box);
    let v = 50;
    const set = (x) => { v = Math.min(96, Math.max(4, x)); box.style.setProperty('--c', `${v}%`); btn.setAttribute('aria-valuenow', Math.round(v)); };
    const fromEvent = (e) => { const r = box.getBoundingClientRect(); set(((e.clientX - r.left) / r.width) * 100); };
    let drag = false;
    box.addEventListener('pointerdown', (e) => { drag = true; box.setPointerCapture(e.pointerId); fromEvent(e); });
    box.addEventListener('pointermove', (e) => { if (drag) fromEvent(e); });
    box.addEventListener('pointerup', () => { drag = false; });
    btn.addEventListener('keydown', (e) => {
      const d = { ArrowLeft: -5, ArrowRight: 5, Home: -100, End: 100 }[e.key];
      if (d === undefined) return;
      e.preventDefault();
      set(v + d);
    });
    set(50);
    if (anim) {
      const o = { v: 85 };
      G.fromTo(o, { v: 85 }, { v: 50, duration: 1.6, ease: 'power3.inOut', onUpdate: () => set(o.v), scrollTrigger: { trigger: box, start: 'top 70%', once: true } });
    }
  });

  // Table of contents that follows the reader
  $$('[data-toc]').forEach((toc) => {
    const links = $$('a', toc);
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.toggle('on', a.getAttribute('href') === `#${e.target.id}`));
    }), { rootMargin: '-30% 0px -60% 0px' });
    links.forEach((a) => { const s = $(a.getAttribute('href')); if (s) io.observe(s); });
  });

  // Copy buttons
  $$('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
    const src = $(b.dataset.copy);
    const text = src.value ?? src.textContent;
    const label = b.textContent;
    try { await navigator.clipboard.writeText(text); b.textContent = 'Copied'; } catch (e) { src.select?.(); b.textContent = 'Press Ctrl+C'; }
    setTimeout(() => { b.textContent = label; }, 1600);
  }));

  // Chat simulations: messages arrive one by one when the phone comes into view
  $$('[data-chat]').forEach((chat) => {
    const msgs = $$('.cm', chat);
    if (!anim) { msgs.forEach((m) => m.classList.add('on')); return; }
    let timer; let i = 0;
    const step = () => {
      if (i < msgs.length) { msgs[i].classList.add('on'); i += 1; timer = setTimeout(step, msgs[i - 1].classList.contains('sys') ? 700 : 1100); }
      else if (chat.hasAttribute('data-loop')) timer = setTimeout(() => { msgs.forEach((m) => m.classList.remove('on')); i = 0; timer = setTimeout(step, 600); }, 3200);
    };
    ScrollTrigger.create({ trigger: chat, start: 'top 80%', onEnter: () => { if (!i) step(); }, onLeaveBack: () => {} });
    window.addEventListener('pagehide', () => clearTimeout(timer));
  });

  if (!anim) return;

  // ---------------------------------------------------------------- reveals
  // Elements are visible by default; these only animate them on the way in.
  $$('[data-reveal]').forEach((el) => {
    const kind = el.dataset.reveal;
    const from = kind === 'clip' ? { clipPath: 'inset(0 0 100% 0 round 24px)', y: 40 }
      : kind === 'scale' ? { scale: 0.92, autoAlpha: 0 }
        : kind === 'left' ? { x: -60, autoAlpha: 0 }
          : kind === 'right' ? { x: 60, autoAlpha: 0 } : { y: 40, autoAlpha: 0 };
    G.from(el, { ...from, duration: 1.1, ease: 'expo.out', clearProps: 'clipPath,transform', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
  $$('[data-stagger]').forEach((box) => {
    G.from(box.children, { y: 44, autoAlpha: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, scrollTrigger: { trigger: box, start: 'top 86%', once: true } });
  });
  // Section headings: letters rise
  $$('[data-split]').forEach((h) => {
    G.from(splitKin(h), { yPercent: 100, autoAlpha: 0, duration: 0.8, ease: 'expo.out', stagger: 0.012, scrollTrigger: { trigger: h, start: 'top 88%', once: true } });
  });

  // ---------------------------------------------------------------- scrubbed statement
  $$('[data-scrub]').forEach((el) => {
    const green = (el.dataset.scrub || '').split(',').map((w) => w.trim().toLowerCase()).filter(Boolean);
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    const spans = words.map((w, i) => {
      const s = document.createElement('span');
      s.className = `sw${green.includes(w.toLowerCase().replace(/[^a-z0-9]/g, '')) ? ' g' : ''}`;
      s.textContent = w;
      el.appendChild(s);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
      return s;
    });
    ScrollTrigger.create({
      trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true,
      onUpdate: (s) => { const n = Math.round(s.progress * spans.length); spans.forEach((sp, i) => sp.classList.toggle('lit', i < n)); },
    });
  });

  // ---------------------------------------------------------------- steps and timelines fill
  $$('[data-steps], [data-timeline]').forEach((box) => {
    const items = $$(':scope > li', box);
    box.style.setProperty('--p', 0);
    ScrollTrigger.create({
      trigger: box, start: 'top 78%', end: 'bottom 55%', scrub: true,
      onUpdate: (s) => {
        box.style.setProperty('--p', s.progress.toFixed(3));
        items.forEach((li, i) => li.classList.toggle('on', s.progress >= i / items.length));
      },
    });
  });

  // ---------------------------------------------------------------- tilt cards
  if (fine) {
    $$('[data-tilt] > *').forEach((card) => {
      const rx = G.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' });
      const ry = G.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' });
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * 14);
        rx(-((e.clientY - r.top) / r.height - 0.5) * 12);
      });
      card.addEventListener('pointerleave', () => { rx(0); ry(0); });
    });
  }

  // ---------------------------------------------------------------- stacking cards
  $$('[data-stack]').forEach((box) => {
    const cards = $$('.stack-card', box);
    cards.forEach((c, i) => {
      c.style.setProperty('--i', i);
      const next = cards[i + 1];
      if (!next) return;
      G.fromTo(c, { scale: 1, filter: 'brightness(1)' }, { scale: 0.92, filter: 'brightness(0.94)', ease: 'none', scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 30%', scrub: true } });
    });
  });

  // ---------------------------------------------------------------- horizontal track (desktop)
  G.matchMedia().add('(min-width: 901px)', () => {
    $$('[data-hscroll]').forEach((sec) => {
      const track = $('.hs-track', sec);
      const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
      G.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: sec, start: 'top 12%', end: () => `+=${dist()}`, pin: true, scrub: 0.6, invalidateOnRefresh: true } });
    });
  });

  // ---------------------------------------------------------------- parallax and line drawing
  $$('[data-parallax]').forEach((el) => {
    G.to(el, { yPercent: parseFloat(el.dataset.parallax) || -12, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  $$('[data-draw] path, [data-draw] line, [data-draw] polyline').forEach((p) => {
    const len = p.getTotalLength();
    p.style.strokeDasharray = len;
    G.fromTo(p, { strokeDashoffset: len }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: p.closest('[data-draw]'), start: 'top 75%', end: 'bottom 50%', scrub: true } });
  });

  // ---------------------------------------------------------------- marquee whose speed follows scroll
  let vel = 0;
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => { vel = s.getVelocity(); } });
  const rows = $$('[data-marquee]').map((row, i) => {
    const inner = row.firstElementChild;
    row.appendChild(inner.cloneNode(true));
    return { els: [...row.children], dir: row.dataset.marquee === 'rev' ? 1 : -1, pos: 0 };
  });
  if (rows.length) {
    G.ticker.add((t, dt) => {
      const boost = Math.min(Math.abs(vel) / 70, 30);
      rows.forEach((m) => {
        const w = m.els[0].offsetWidth;
        if (!w) return;
        m.pos += m.dir * (vel < 0 ? -1 : 1) * (1 + boost) * (dt / 16.7);
        const x = G.utils.wrap(-w, 0, m.pos);
        m.els.forEach((el) => { el.style.transform = `translate3d(${x}px,0,0)`; });
      });
      vel *= 0.92;
    });
  }

  document.fonts?.ready.then(() => ScrollTrigger.refresh());
})();
