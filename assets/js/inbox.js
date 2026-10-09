// Unified inbox: one customer story told across five channel events.
// On wide screens the story advances with scroll; on small screens it reads top to bottom.

import { motionOK } from './svg.js';

const CH = {
  calls: { label: 'Call', icon: '<path d="M5 3h3l1.5 4-2 1.2a9 9 0 0 0 4.3 4.3L13 10.5l4 1.5v3a2 2 0 0 1-2 2A13 13 0 0 1 3 5a2 2 0 0 1 2-2z"/>' },
  sms: { label: 'SMS', icon: '<rect x="3" y="4" width="14" height="10" rx="1.5"/><path d="M7 14v3l3-3"/>' },
  whatsapp: { label: 'WhatsApp', icon: '<path d="M10 3a7 7 0 0 0-6 10.6L3 17l3.5-1A7 7 0 1 0 10 3z"/>' },
  ai: { label: 'AI agent', icon: '<circle cx="5" cy="10" r="1.6"/><circle cx="15" cy="5" r="1.6"/><circle cx="15" cy="15" r="1.6"/><path d="M6.5 10h3l4-4.2M9.5 10l4 4.2"/>' },
  system: { label: 'Telixo', icon: '<path d="M4.5 10.5l3.5 3.5 7.5-8"/>' },
};

const icon = (k) => `<svg viewBox="0 0 20 20" aria-hidden="true">${CH[k].icon}</svg>`;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function eventHTML(e) {
  if (e.channel === 'system') {
    return `<li class="ev ev-system"><span class="ev-icon">${icon('system')}</span><p>${esc(e.body)}</p><time>${e.time}</time></li>`;
  }
  const head = `<header><span class="ev-ch">${CH[e.channel].label}</span><strong>${esc(e.actor)}</strong>${e.to ? `<span class="ev-to">→ ${esc(e.to)}</span>` : ''}<time>${e.time}</time></header>`;
  let body;
  if (e.channel === 'calls') {
    const bars = Array.from({ length: 34 }, (_, i) => `<i style="--h:${(0.25 + Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6))).toFixed(2)}"></i>`).join('');
    body = `<div class="ev-call"><div class="ev-call-top"><span>${esc(e.title)}</span><span class="wave">${bars}</span></div><p>${esc(e.body)}</p></div>`;
  } else if (e.channel === 'ai') {
    body = `<div class="ev-agent"><span class="ev-intent">${esc(e.title)}</span><p class="bubble out">${esc(e.body)}</p></div>`;
  } else {
    body = `<p class="bubble ${e.direction}">${esc(e.body)}</p>`;
  }
  return `<li class="ev ev-${e.channel} dir-${e.direction}"><span class="ev-icon">${icon(e.channel)}</span><div class="ev-main">${head}${body}<p class="ev-meta">${esc(e.meta)}</p></div></li>`;
}

function build(app, data) {
  const c = data.customer;
  const convo = data.conversations.map((v) => `
    <li class="${v.active ? 'is-active' : ''}">
      <span class="avatar">${v.initials}</span>
      <span class="li-main"><span class="li-top"><strong>${esc(v.name)}</strong><time>${v.time}</time></span>
      <span class="li-prev"><i class="dot" style="--c:var(--c-${v.channel})"></i><span ${v.active ? 'data-preview' : ''}>${esc(v.preview || '')}</span></span></span>
    </li>`).join('');

  app.innerHTML = `
    <div class="app-bar">
      <span class="app-brand"><svg viewBox="0 0 32 32" aria-hidden="true"><use href="#mark"/></svg>Inbox</span>
      <span class="app-search">Search conversations, people, orders…</span>
      <span class="app-user"><span class="avatar sm">SC</span></span>
    </div>
    <div class="app-body">
      <aside class="app-list" aria-label="Conversations">
        <div class="app-list-head"><span>All channels</span><span class="mono">Open</span></div>
        <ul>${convo}</ul>
      </aside>
      <section class="thread" aria-label="Conversation with ${esc(c.name)}">
        <header class="thread-head">
          <div><strong>${esc(c.name)}</strong><span>${esc(c.company)}</span></div>
          <div class="thread-meta">
            <span class="chips">${['calls', 'sms', 'whatsapp', 'ai'].map((k) => `<span class="chip" title="${CH[k].label}">${icon(k)}</span>`).join('')}</span>
            <span class="status" data-status></span>
          </div>
        </header>
        <ol class="timeline">${data.steps.map((s) => eventHTML(s.event)).join('')}</ol>
        <div class="composer"><span class="composer-ch">${icon('whatsapp')} WhatsApp</span><span class="composer-input">Reply to ${esc(c.name.split(' ')[0])}…</span></div>
      </section>
      <aside class="profile" aria-label="Customer profile">
        <div class="profile-id"><span class="avatar lg">${c.initials}</span><strong>${esc(c.name)}</strong><span>${esc(c.role)} · ${esc(c.company)}</span></div>
        <dl>
          <div><dt>Phone</dt><dd>${esc(c.phone)}</dd></div>
          <div><dt>WhatsApp</dt><dd>${esc(c.whatsapp)}</dd></div>
          <div><dt>Owner</dt><dd data-owner></dd></div>
          <div><dt>Deal</dt><dd>${esc(c.deal)}</dd></div>
          <div><dt>Stage</dt><dd data-stage-name></dd></div>
        </dl>
        <div class="summary"><span class="mono">AI summary</span><p data-summary></p></div>
        <div class="tags">${c.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div>
      </aside>
    </div>`;
}

export function initInbox(section, data) {
  const app = section.querySelector('.app');
  build(app, data);

  const events = [...app.querySelectorAll('.ev')];
  const steps = [...section.querySelectorAll('.inbox-steps li')];
  const q = (s) => app.querySelector(s);
  const status = q('[data-status]');
  let current = -1;

  function apply(n, animate) {
    const s = data.steps[n];
    status.textContent = s.status;
    status.dataset.state = /resolved/i.test(s.status) ? 'done' : /waiting/i.test(s.status) ? 'wait' : 'open';
    q('[data-owner]').textContent = s.owner;
    q('[data-stage-name]').textContent = s.stage;
    q('[data-preview]').textContent = s.preview;
    const summary = q('[data-summary]');
    summary.textContent = s.summary;
    steps.forEach((li, i) => li.classList.toggle('is-on', i <= n));
    if (animate) gsap.fromTo(summary, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 });
  }

  function setStep(n) {
    if (n === current) return;
    const animate = motionOK();
    events.forEach((ev, i) => {
      const show = i <= n;
      if (show && ev.hidden) {
        ev.hidden = false;
        if (animate) gsap.fromTo(ev, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power3.out', delay: (i - Math.max(current, 0)) * 0.06 });
      } else if (!show) {
        ev.hidden = true;
      }
    });
    apply(n, animate && current !== -1);
    current = n;
  }

  gsap.matchMedia().add({ wide: '(min-width: 900px)', narrow: '(max-width: 899px)' }, (ctx) => {
    if (ctx.conditions.wide) {
      events.forEach((ev) => { ev.hidden = true; });
      current = -1;
      setStep(0);
      ScrollTrigger.create({
        trigger: section.querySelector('.inbox-scroll'),
        start: 'top top+=68',
        end: 'bottom bottom',
        onUpdate: (self) => setStep(Math.min(data.steps.length - 1, Math.floor(self.progress * data.steps.length))),
      });
      return () => { events.forEach((ev) => { ev.hidden = false; gsap.set(ev, { clearProps: 'all' }); }); };
    }
    events.forEach((ev) => { ev.hidden = false; });
    current = data.steps.length - 1;
    apply(current, false);
    if (motionOK()) {
      events.forEach((ev) => gsap.from(ev, { autoAlpha: 0, y: 20, duration: 0.6, ease: 'power3.out', scrollTrigger: { trigger: ev, start: 'top 90%', once: true } }));
    }
    return undefined;
  });
}
