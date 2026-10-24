// Telixo — interactive widgets on the inner pages (runs after core.js and pages.js).
// Every widget works without animation; GSAP only adds motion when allowed.
(() => {
  const TX = window.TX;
  const { $, $$, motion } = TX;
  const G = window.gsap && window.ScrollTrigger ? window.gsap : null;
  const anim = !!G && motion;
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // FLIP helper: move nodes, then animate from their old positions.
  const flip = (nodes, change) => {
    const first = nodes.map((n) => n.getBoundingClientRect());
    change();
    if (!anim) return;
    nodes.forEach((n, i) => {
      const last = n.getBoundingClientRect();
      const dx = first[i].left - last.left;
      const dy = first[i].top - last.top;
      if (dx || dy) G.fromTo(n, { x: dx, y: dy }, { x: 0, y: 0, duration: 0.7, ease: 'expo.out', clearProps: 'transform' });
    });
  };

  // ---------------------------------------------------------------- Shared inbox: assign a chat
  $$('[data-widget="assign"]').forEach((w) => {
    const msgs = $('[data-assign-msgs]', w);
    const owner = $('[data-assign-owner]', w);
    const status = $('[data-assign-status]', w);
    let t;
    $$('[data-person]', w).forEach((b) => b.addEventListener('click', () => {
      const who = b.dataset.person;
      $$('[data-person]', w).forEach((x) => x.setAttribute('aria-pressed', x === b));
      owner.textContent = who;
      status.textContent = `Assigned · ${who}`;
      $$('.sysm, .m.out', msgs).forEach((m) => m.remove());
      msgs.insertAdjacentHTML('beforeend', `<p class="sysm">Assigned to ${esc(who)} · ${esc(b.dataset.role)}</p>`);
      clearTimeout(t);
      t = setTimeout(() => {
        msgs.insertAdjacentHTML('beforeend', `<p class="m out">Hi Vikram, ${esc(who)} here. Yes, it's available. Does Saturday 11:00 work for a visit?</p>`);
        if (anim) G.from(msgs.lastElementChild, { y: 14, autoAlpha: 0, duration: 0.5, ease: 'power3.out' });
      }, 700);
    }));
  });

  // ---------------------------------------------------------------- Campaign builder
  $$('[data-widget="campaign"]').forEach((w) => {
    const msg = $('[data-cp-msg]', w);
    const meta = $('[data-cp-meta]', w);
    const names = { 'Repeat customers': 'Ananya', 'New leads': 'Vikram', 'Everyone opted in': 'Neha' };
    const tpl = {
      offer: (n) => [`Hi ${n}, this Saturday get a free hair spa with any haircut. Reply BOOK to reserve a slot.`, ['Book now', 'Stop promotions']],
      reminder: (n) => [`Hi ${n}, a reminder that your appointment is on Saturday at 16:00. Reply 1 to confirm or 2 to reschedule.`, ['Confirm', 'Reschedule']],
      update: (n) => [`Hi ${n}, our new opening hours from Monday are 10:00 to 20:00. See you soon!`, ['Stop promotions']],
    };
    const state = { aud: 'Repeat customers', tpl: 'offer', when: 'Saturday, 10:00' };
    const render = () => {
      const [text, btns] = tpl[state.tpl](names[state.aud]);
      msg.classList.add('swap');
      setTimeout(() => {
        msg.innerHTML = `${esc(text)}<div class="btns">${btns.map((b) => `<span>${esc(b)}</span>`).join('')}</div>`;
        meta.textContent = `To: ${state.aud} · ${state.when}`;
        msg.classList.remove('swap');
      }, anim ? 180 : 0);
    };
    $$('[data-cp]', w).forEach((group) => $$('button', group).forEach((b) => b.addEventListener('click', () => {
      $$('button', group).forEach((x) => x.setAttribute('aria-pressed', x === b));
      state[group.dataset.cp] = b.dataset.v;
      render();
    })));
  });

  // ---------------------------------------------------------------- Roles: switches follow the chosen role
  $$('[data-widget="roles"]').forEach((w) => {
    const tabs = $('[data-tabs]', w);
    const apply = (role) => $$('[data-roles]', w).forEach((row, i) => {
      const on = row.dataset.roles.split(' ').includes(role);
      setTimeout(() => $('.tog', row).classList.toggle('on', on), anim ? i * 60 : 0);
    });
    tabs.addEventListener('tab', (e) => apply(e.detail));
    apply('agent');
  });

  // ---------------------------------------------------------------- Calling: ring, talk, log
  $$('[data-widget="call"]').forEach((w) => {
    const box = $('.call-box', w);
    const btn = $('[data-call-btn]', w);
    const label = $('[data-call-label]', w);
    const sub = $('[data-call-sub]', w);
    const log = $('[data-call-log]', w);
    const dur = $('[data-call-dur]', w);
    let tick; let ring; let s = 0;
    const fmt = (n) => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
    const set = (state) => { box.dataset.callState = state; };
    btn.addEventListener('click', () => {
      const st = box.dataset.callState;
      if (st === 'idle') {
        set('ringing'); label.textContent = 'Calling Vikram Shah…'; sub.textContent = 'Ringing through Twilio'; btn.textContent = 'Cancel'; log.hidden = true;
        ring = setTimeout(() => {
          set('live'); s = 0; label.textContent = 'On call · Vikram Shah'; btn.textContent = 'End';
          sub.textContent = `Twilio · ${fmt(0)}`;
          tick = setInterval(() => { s += 1; sub.textContent = `Twilio · ${fmt(s)}`; }, 1000);
        }, 1600);
      } else {
        clearTimeout(ring); clearInterval(tick);
        if (st === 'live') { dur.textContent = fmt(Math.max(s, 1)); log.hidden = false; if (anim) G.from(log, { y: 10, autoAlpha: 0, duration: 0.5 }); }
        set('idle'); label.textContent = 'Call Vikram Shah'; sub.textContent = 'Through Twilio · from this chat'; btn.textContent = 'Call again';
      }
    });
  });

  // ---------------------------------------------------------------- Odoo: edits sync across
  $$('[data-widget="sync"]').forEach((w) => {
    const state = $('[data-sy-state]', w);
    let t;
    $$('[data-sy]', w).forEach((input) => input.addEventListener('input', () => {
      w.classList.add('busy');
      state.textContent = 'Syncing…';
      clearTimeout(t);
      t = setTimeout(() => {
        $$('[data-sy]', w).forEach((i) => {
          const out = $(`[data-sy-out="${i.dataset.sy}"]`, w);
          if (out.textContent !== i.value) { out.textContent = i.value || '—'; out.classList.add('flash'); setTimeout(() => out.classList.remove('flash'), 900); }
        });
        w.classList.remove('busy');
        state.textContent = 'In sync';
      }, 750);
    }));
  });

  // ---------------------------------------------------------------- Pricing: monthly / annual
  $$('[data-billing]').forEach((b) => {
    $('[data-tabs]', b).addEventListener('tab', (e) => {
      const y = e.detail === 'y';
      $$('[data-price-m]').forEach((el) => { el.hidden = y; });
      $$('[data-price-y]').forEach((el) => { el.hidden = !y; });
      if (anim) G.fromTo('.plan-price', { y: 8, autoAlpha: 0.3 }, { y: 0, autoAlpha: 1, duration: 0.4, stagger: 0.05 });
    });
  });

  // ---------------------------------------------------------------- FAQ search with highlights
  $$('[data-fq]').forEach((box) => {
    const input = $('[data-fq-q]');
    const count = $('[data-fq-count]');
    const empty = $('[data-fq-empty]', box);
    const items = $$('details[data-item]', box).map((d) => ({ d, sum: $('summary', d), text: $('summary', d).textContent, body: $('div', d).textContent.toLowerCase() }));
    const run = () => {
      const q = input.value.trim().toLowerCase();
      let n = 0;
      items.forEach((it) => {
        const inSum = it.text.toLowerCase().includes(q);
        const ok = !q || inSum || it.body.includes(q);
        it.d.hidden = !ok;
        if (ok) n += 1;
        it.sum.innerHTML = q && inSum ? esc(it.text).replace(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig'), '<mark>$1</mark>') : esc(it.text);
        if (q && ok && !inSum) it.d.open = true;
      });
      $$('[data-group]', box).forEach((g) => { g.hidden = !$$('details[data-item]', g).some((d) => !d.hidden); });
      empty.hidden = n > 0;
      count.textContent = q ? `${n} question${n === 1 ? '' : 's'} match “${input.value.trim()}”` : '';
    };
    input?.addEventListener('input', run);
  });

  // ---------------------------------------------------------------- Careers: split-flap board
  $$('[data-flap]').forEach((board) => {
    const CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lines = $$('[data-flap-text]', board).map((line) => {
      const target = line.dataset.flapText;
      line.innerHTML = [...target].map((c) => `<span class="fl${c === ' ' ? ' sp' : ''}">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
      return { cells: $$('.fl', line), target };
    });
    if (!anim) return;
    const play = () => lines.forEach(({ cells, target }, li) => cells.forEach((cell, i) => {
      if (target[i] === ' ') return;
      let n = 0;
      const total = 6 + i + li * 4;
      const id = setInterval(() => {
        n += 1;
        cell.textContent = n >= total ? target[i] : CH[(Math.random() * CH.length) | 0];
        if (n >= total) clearInterval(id);
      }, 45);
    }));
    ScrollTrigger.create({ trigger: board, start: 'top 80%', once: true, onEnter: play });
  });

  // ---------------------------------------------------------------- Guides: pull a book off the shelf
  $$('[data-shelf]').forEach((shelf) => {
    const books = $$('.spine', shelf);
    const open = (b) => books.forEach((x) => x.setAttribute('aria-expanded', x === b));
    books.forEach((b) => {
      b.addEventListener('click', () => open(b));
      b.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') open(b); });
    });
    open(books[0]);
  });

  // ---------------------------------------------------------------- Retail: order moves along
  $$('[data-trk]').forEach((trk) => {
    const steps = $$('.trk-step', trk);
    if (!anim) return;
    ScrollTrigger.create({ trigger: trk, start: 'top 80%', once: true, onEnter: () => setTimeout(() => steps[2].classList.add('on'), 900) });
  });

  // ---------------------------------------------------------------- Sales: cards move through the pipeline as you scroll
  $$('[data-kanban]').forEach((kb) => {
    const cols = $$('.kb-col', kb);
    const card = (n) => $(`[data-k="${n}"]`, kb);
    const plan = [
      { n: 'Arjun Nair', from: 0, to: 1 },
      { n: 'Vikram Shah', from: 1, to: 2 },
      { n: 'Neha Kapoor', from: 2, to: 3 },
    ];
    if (!anim) return;
    let stage = 0;
    const go = (target) => {
      if (target === stage) return;
      const all = $$('.kb-card', kb);
      flip(all, () => {
        while (stage < target) { const m = plan[stage]; cols[m.to].appendChild(card(m.n)); if (m.to === 3) card(m.n).classList.add('won'); stage += 1; }
        while (stage > target) { stage -= 1; const m = plan[stage]; const c = card(m.n); c.classList.remove('won'); cols[m.from].insertBefore(c, $('.kb-card', cols[m.from])); }
      });
    };
    ScrollTrigger.create({ trigger: kb, start: 'top 70%', end: 'bottom 30%', onUpdate: (s) => go(Math.min(plan.length, Math.floor(s.progress * (plan.length + 1)))) });
  });

  // ---------------------------------------------------------------- Support: chats flow to agents
  $$('[data-queue]').forEach((q) => {
    const inbox = $('.q-in', q);
    const agents = $$('.q-agents > span', q);
    const chats = $$('.q-chat', inbox);
    if (!anim) return;
    let i = 0; let timer; let on = false;
    const step = () => {
      if (!on) return;
      if (i < chats.length) {
        const c = chats[i];
        flip([c], () => agents[i % agents.length].appendChild(c));
        i += 1;
        timer = setTimeout(step, 1300);
      } else {
        timer = setTimeout(() => { flip(chats, () => chats.forEach((c) => inbox.appendChild(c))); i = 0; timer = setTimeout(step, 1300); }, 2400);
      }
    };
    ScrollTrigger.create({ trigger: q, start: 'top 85%', end: 'bottom top', onToggle: (s) => { on = s.isActive; clearTimeout(timer); if (on) timer = setTimeout(step, 800); } });
  });

  // ---------------------------------------------------------------- Marketing: calendar days light up
  $$('[data-cg]').forEach((cg) => {
    if (!anim) return;
    cg.dataset.anim = '1';
    const days = $$('.cg-d.on', cg);
    ScrollTrigger.create({ trigger: cg, start: 'top 85%', end: 'bottom 45%', scrub: true, onUpdate: (s) => days.forEach((d, i) => d.classList.toggle('lit', s.progress > i / days.length)) });
  });

  // ---------------------------------------------------------------- Free tools: WhatsApp link + QR code
  $$('[data-tool]').forEach((tool) => {
    const kind = tool.dataset.tool;
    const cc = $('[data-t="cc"]', tool);
    const num = $('[data-t="num"]', tool);
    const msg = $('[data-t="msg"]', tool);
    const field = num.closest('.field-s');
    const build = () => {
      const digits = num.value.replace(/\D/g, '').replace(/^0+/, '');
      const ok = digits.length >= 6 && digits.length <= 14;
      field.classList.toggle('bad', !!num.value && !ok);
      const text = msg.value.trim();
      const link = ok ? `https://wa.me/${cc.value}${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}` : '';
      return { link, ok, text };
    };
    if (kind === 'link') {
      const out = $('[data-t-out]', tool);
      const open = $('[data-t-open]', tool);
      const prev = $('[data-t-prev]', tool);
      const update = () => {
        const { link, ok, text } = build();
        out.value = ok ? link : 'Enter your number to create a link';
        open.href = ok ? link : '#';
        open.setAttribute('aria-disabled', !ok);
        prev.textContent = text || 'Your chat opens with an empty message.';
      };
      [cc, num, msg].forEach((el) => el.addEventListener('input', update));
      update();
    }
    // The QR library is the page's own script and may load after this file.
    if (kind === 'qr') {
      if (window.qrcode) initQr(); else window.addEventListener('load', initQr);
    }
    function initQr() {
      const canvas = $('#qr-canvas', tool);
      const dl = $('[data-qr-dl]', tool);
      const outText = $('[data-t-out-text]', tool);
      let colour = '#252525';
      const draw = () => {
        const { link, ok } = build();
        const ctx = canvas.getContext('2d');
        const size = canvas.width;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        if (!ok) {
          ctx.fillStyle = 'rgba(37,37,37,.08)';
          for (let y = 0; y < 25; y += 1) for (let x = 0; x < 25; x += 1) if ((x * 7 + y * 13) % 5 < 2) ctx.fillRect(16 + x * 11.5, 16 + y * 11.5, 11, 11);
          dl.setAttribute('aria-disabled', 'true');
          outText.textContent = 'Enter your number to create a QR code.';
          return;
        }
        const qr = window.qrcode(0, 'M');
        qr.addData(link);
        qr.make();
        const n = qr.getModuleCount();
        const quiet = 4;
        const cell = Math.floor(size / (n + quiet * 2));
        const off = Math.floor((size - cell * n) / 2);
        ctx.fillStyle = colour;
        for (let r = 0; r < n; r += 1) for (let c = 0; c < n; c += 1) if (qr.isDark(r, c)) ctx.fillRect(off + c * cell, off + r * cell, cell, cell);
        dl.href = canvas.toDataURL('image/png');
        dl.setAttribute('aria-disabled', 'false');
        outText.textContent = link;
        if (anim) G.fromTo(canvas, { scale: 0.96 }, { scale: 1, duration: 0.4, ease: 'back.out(2)' });
      };
      [cc, num, msg].forEach((el) => el.addEventListener('input', draw));
      $('[data-qr-colour]', tool)?.addEventListener('tab', (e) => { colour = e.detail; draw(); });
      draw();
    }
  });
})();
