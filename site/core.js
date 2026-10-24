// Telixo — shared engine for every page.
// Header (morphing mega menus, mobile menu), smooth scroll, cursor label,
// page transitions, footer wordmark, the mobile CTA dock and the newsletter.
// Pages add their own behaviour in pages.js / home.js through window.TX.
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
  const store = {
    get: (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) { /* storage blocked */ } },
  };

  $$('[data-link]').forEach((a) => { if (CONFIG[a.dataset.link]) a.href = CONFIG[a.dataset.link]; });
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
  if (!motion) root.classList.add('reduced');
  if (fine && motion) root.classList.add('has-cursor');

  // Letters and words, for kinetic type.
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
  // Words and letters, keeping inline elements such as <em> or .brand spans.
  const splitKin = (el) => {
    const out = [];
    [...el.childNodes].forEach((node) => {
      if (node.nodeType === 1) {
        if (node.tagName === 'BR') return;
        out.push(...splitKin(node));
        return;
      }
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((part) => {
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

  // ---------------------------------------------------------------- announcement bar
  const annc = $('[data-annc]');
  if (annc) {
    if (store.get('telixo-annc') === 'off') annc.remove();
    else $('[data-annc-x]', annc).addEventListener('click', () => { store.set('telixo-annc', 'off'); annc.remove(); root.style.setProperty('--annc', '0px'); });
  }
  const syncAnnc = () => root.style.setProperty('--annc', `${document.body.contains(annc) ? annc.offsetHeight : 0}px`);
  syncAnnc();
  window.addEventListener('resize', syncAnnc);

  // ---------------------------------------------------------------- header: mega menus
  const hdr = $('[data-hdr]');
  const stage = $('[data-mg-stage]');
  const shell = $('[data-mg-shell]');
  const triggers = $$('[data-mega]');
  const panels = $$('[data-panel]');
  const desktop = window.matchMedia('(min-width: 1101px)');
  let openKey = null;
  let closeT;
  const order = triggers.map((t) => t.dataset.mega);

  // The shell morphs its size to each panel; panels slide in from the side
  // the pointer came from.
  const sizeShell = (panel) => {
    const r = panel.getBoundingClientRect();
    shell.style.width = `${r.width}px`;
    shell.style.height = `${r.height}px`;
  };
  const openMega = (key) => {
    clearTimeout(closeT);
    if (openKey === key) return;
    const prev = openKey;
    openKey = key;
    const panel = panels.find((p) => p.dataset.panel === key);
    const dir = prev ? Math.sign(order.indexOf(key) - order.indexOf(prev)) : 0;
    // Directional swap (after 21st.dev "Directional Menu"): the new panel slides
    // in from the side you are heading to while the old one slides out the other way.
    panels.forEach((p) => {
      const on = p === panel;
      clearTimeout(p._outT);
      if (on) {
        p.hidden = false;
        p.classList.remove('is-out');
        p.style.setProperty('--from', `${dir * 100}px`);
        p.classList.remove('is-on');
        void p.offsetWidth;
        p.classList.add('is-on');
      } else if (!p.hidden) {
        p.classList.remove('is-on');
        if (dir && motion) {
          p.style.setProperty('--to', `${-dir * 100}px`);
          p.classList.add('is-out');
          p._outT = setTimeout(() => { p.classList.remove('is-out'); p.hidden = true; }, 350);
        } else p.hidden = true;
      }
    });
    triggers.forEach((t) => t.setAttribute('aria-expanded', t.dataset.mega === key));
    // Centre the panel under its trigger, kept inside the viewport.
    const tr = triggers.find((t) => t.dataset.mega === key).getBoundingClientRect();
    const w = panel.getBoundingClientRect().width;
    const left = Math.min(Math.max(16, tr.left + tr.width / 2 - w / 2), window.innerWidth - w - 16);
    stage.style.setProperty('--x', `${left}px`);
    sizeShell(panel);
    hdr.classList.add('mega-open');
  };
  const closeMega = () => {
    openKey = null;
    hdr.classList.remove('mega-open');
    triggers.forEach((t) => t.setAttribute('aria-expanded', 'false'));
    setTimeout(() => { if (!openKey) panels.forEach((p) => { p.hidden = true; p.classList.remove('is-on', 'is-out'); }); }, 260);
  };
  const laterClose = () => { clearTimeout(closeT); closeT = setTimeout(closeMega, 120); };
  triggers.forEach((t) => {
    t.addEventListener('click', () => (openKey === t.dataset.mega ? closeMega() : openMega(t.dataset.mega)));
    t.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse' && desktop.matches) openMega(t.dataset.mega); });
    t.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') laterClose(); });
    t.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); openMega(t.dataset.mega); $('a, button', panels.find((p) => p.dataset.panel === t.dataset.mega))?.focus(); }
    });
  });
  if (stage) {
    stage.addEventListener('pointerenter', () => clearTimeout(closeT));
    stage.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') laterClose(); });
    stage.addEventListener('focusout', (e) => { if (!hdr.contains(e.relatedTarget)) closeMega(); });
  }
  $$('.hdr-list a').forEach((a) => a.addEventListener('pointerenter', () => { if (desktop.matches) laterClose(); }));
  document.addEventListener('click', (e) => { if (openKey && !e.target.closest('[data-hdr]')) closeMega(); });

  // Nested menu inside Solutions: industry / team.
  $$('[data-sub]').forEach((b) => {
    const pick = () => {
      const panel = b.closest('[data-panel]');
      $$('[data-sub]', panel).forEach((x) => x.setAttribute('aria-selected', x === b));
      $$('[data-subpanel]', panel).forEach((x) => x.classList.toggle('is-on', x.dataset.subpanel === b.dataset.sub));
      sizeShell(panel);
    };
    b.addEventListener('click', pick);
    b.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') pick(); });
  });

  // A pill slides under whichever top-level item the pointer is on.
  const pill = $('[data-hdr-pill]');
  const list = $('[data-hdr-list]');
  if (pill && list) {
    const nav = list.parentElement;
    const place = (el) => {
      const a = el.getBoundingClientRect();
      const b = nav.getBoundingClientRect();
      pill.style.transform = `translate(${a.left - b.left}px, 0)`;
      pill.style.width = `${a.width}px`;
      pill.classList.add('on');
    };
    $$('.hdr-link', list).forEach((el) => {
      el.addEventListener('pointerenter', () => place(el));
      el.addEventListener('focus', () => place(el));
    });
    list.addEventListener('pointerleave', () => { if (!openKey) pill.classList.remove('on'); });
    const keep = new MutationObserver(() => {
      const t = triggers.find((x) => x.getAttribute('aria-expanded') === 'true');
      if (t) place(t); else pill.classList.remove('on');
    });
    triggers.forEach((t) => keep.observe(t, { attributes: true, attributeFilter: ['aria-expanded'] }));
  }

  // ---------------------------------------------------------------- mobile menu
  const burger = $('[data-burger]');
  const mnav = $('[data-mnav]');
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    burger?.setAttribute('aria-expanded', open);
    if (open) closeMega();
  };
  burger?.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  mnav?.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (openKey) { const t = triggers.find((x) => x.dataset.mega === openKey); closeMega(); t?.focus(); } else setMenu(false);
  });
  desktop.addEventListener('change', () => { setMenu(false); closeMega(); });

  // ---------------------------------------------------------------- newsletter
  const news = $('.news');
  news?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!news.reportValidity()) return;
    // TODO: send the address to the newsletter provider once one is chosen.
    $('.news-row', news).outerHTML = '<p class="form-done">Thanks, you’re on the list.</p>';
  });

  // ---------------------------------------------------------------- mobile CTA dock
  // Shows once the page's first call to action scrolls away; hides at the final one.
  const dock = $('.dock');
  const first = $('[data-dock-start]') || $('.hero-ctas') || $('main section');
  const last = $('[data-dock-end]') || $('#start') || $('.foot');
  if (dock && first && last) {
    const seen = { first: true, last: false };
    new IntersectionObserver((entries) => {
      entries.forEach((e) => { seen[e.target === first ? 'first' : 'last'] = e.isIntersecting; });
      document.body.classList.toggle('dock-on', !seen.first && !seen.last);
    }).observe(first);
    new IntersectionObserver((entries) => {
      entries.forEach((e) => { seen.last = e.isIntersecting; });
      document.body.classList.toggle('dock-on', !seen.first && !seen.last);
    }).observe(last);
  }

  const TX = window.TX = { CONFIG, $, $$, motion, fine, splitLetters, splitWords, splitKin, store, lenis: null, wheelGate: null, gsap: null };

  // Without GSAP (blocked script) the page still works: just no motion.
  if (!window.gsap || !window.ScrollTrigger) { document.dispatchEvent(new Event('tx:ready')); return; }
  gsap.registerPlugin(ScrollTrigger);
  TX.gsap = gsap;

  // ---------------------------------------------------------------- smooth scroll
  let lenis = null;
  if (motion && window.Lenis) {
    // TX.wheelGate lets a pinned section take over wheel input (the homepage reel).
    lenis = new Lenis({ lerp: 0.12, virtualScroll: (e) => (TX.wheelGate ? TX.wheelGate(e) : true) });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    TX.lenis = lenis;
  }
  const scrollTo = (target) => {
    if (lenis) { lenis.scrollTo(target, { duration: 1.2, offset: target === 0 ? 0 : -90 }); return; }
    if (target === 0) window.scrollTo({ top: 0 });
    else target.scrollIntoView();
  };
  TX.scrollTo = scrollTo;
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    const target = id === '#top' ? 0 : (id.length > 1 ? $(id) : null);
    if (target === null) return;
    e.preventDefault();
    setMenu(false);
    closeMega();
    scrollTo(target);
  });

  // ---------------------------------------------------------------- header on scroll
  // Frosted once the page moves; hides while reading down, returns on the way up.
  const bar = $('[data-progress]');
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    hdr.classList.toggle('is-scrolled', y > 8);
    if (!openKey && !document.body.classList.contains('menu-open')) {
      if (y > lastY + 6 && y > 240) hdr.classList.add('is-hidden');
      else if (y < lastY - 6) hdr.classList.remove('is-hidden');
      // Sticky elements on the page sit under the header only while it shows.
      root.classList.toggle('hdr-off', hdr.classList.contains('is-hidden'));
    }
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------------------------------------------------------------- cursor label
  if (fine && motion) {
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
  }

  // ---------------------------------------------------------------- magnetic buttons
  if (fine && motion) {
    $$('.magnet').forEach((el) => {
      const mx = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
      const my = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * 0.25);
        my((e.clientY - r.top - r.height / 2) * 0.35);
      });
      el.addEventListener('pointerleave', () => { mx(0); my(0); });
    });
  }

  // ---------------------------------------------------------------- letter swap
  // After 21st.dev "Letter Swap": each letter rolls up and a copy rolls in from
  // below, one after another. Screen readers get the plain label.
  const swapText = (el) => {
    const node = [...el.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
    if (!node || el.querySelector('.sw')) return;
    const text = node.textContent.trim();
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = text;
    const sw = document.createElement('span');
    sw.className = 'sw';
    sw.setAttribute('aria-hidden', 'true');
    [...text].forEach((ch, i) => {
      const c = ch === ' ' ? ' ' : ch;
      const cell = document.createElement('span');
      cell.className = 'sw-c';
      cell.style.setProperty('--i', i);
      cell.innerHTML = '<span></span><span></span>';
      cell.firstChild.textContent = c;
      cell.lastChild.textContent = c;
      sw.append(cell);
    });
    node.replaceWith(sr, sw);
  };
  if (fine && motion) {
    $$('.hdr-link, .hdr-cta .login, .pill-btn, .mg-item b, .foot-cols a, .mnav-cta a').forEach(swapText);
  }

  // ---------------------------------------------------------------- scramble
  // Mono arrow links decode through random glyphs on hover.
  if (fine && motion) {
    const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+/<>=';
    $$('.mg-go, .more, [data-scramble]').forEach((el) => {
      const node = [...el.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
      if (!node) return;
      const text = node.textContent;
      let raf = 0;
      el.closest('a, button, .mg-item, .mg-feature, article')?.addEventListener('pointerenter', () => {
        cancelAnimationFrame(raf);
        const t0 = performance.now();
        const tick = (now) => {
          const done = Math.floor((now - t0) / 28);
          node.textContent = [...text].map((ch, i) => (i < done || ch === ' ' ? ch : glyphs[(Math.random() * glyphs.length) | 0])).join('');
          if (done < text.length) raf = requestAnimationFrame(tick);
          else node.textContent = text;
        };
        raf = requestAnimationFrame(tick);
      });
    });
  }

  // ---------------------------------------------------------------- spotlight
  // A soft green glow follows the pointer across cards, with a lit edge.
  if (fine && motion) {
    $$('.rel a, .bx, .int-card, .tool-card, .plan, .val, .cs-tpl article, .hs-card, .ct-card, .bn-cell, .mg-item').forEach((el) => {
      el.classList.add('spot');
      const g = document.createElement('i');
      g.className = 'spot-glow';
      g.setAttribute('aria-hidden', 'true');
      el.append(g);
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - r.left}px`);
        el.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }

  // ---------------------------------------------------------------- page transitions
  // A paper sheet wipes up as you leave and away as the next page arrives.
  const pt = $('.pt');
  if (pt && motion) {
    if (store.get('telixo-pt') === '1') {
      root.classList.add('pt-enter');
      store.set('telixo-pt', '0');
      requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('pt-enter')));
    }
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target === '_blank' || a.hasAttribute('download') || a.dataset.link) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
      e.preventDefault();
      store.set('telixo-pt', '1');
      root.classList.add('pt-leave');
      setTimeout(() => { location.href = url.href; }, 520);
    });
    window.addEventListener('pageshow', (e) => { if (e.persisted) root.classList.remove('pt-leave', 'pt-enter'); });
  }

  // ---------------------------------------------------------------- footer wordmark
  const fw = $('.foot-word');
  if (fw) {
    const fit = () => {
      fw.style.fontSize = '100px';
      fw.style.display = 'inline-block';
      const w = fw.scrollWidth;
      fw.style.display = '';
      fw.style.fontSize = `${100 * (window.innerWidth * 0.97) / w}px`;
    };
    fit();
    document.fonts?.ready.then(fit);
    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(fit, 150); });
    if (motion) {
      gsap.from(splitLetters(fw), {
        yPercent: 100, ease: 'none', stagger: 0.06,
        scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: 0.6 },
      });
    }
  }

  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  document.dispatchEvent(new Event('tx:ready'));
})();
