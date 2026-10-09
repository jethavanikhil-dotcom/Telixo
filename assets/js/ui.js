// Navigation, demo request dialog and section headline reveals.

import { motionOK } from './svg.js';

// Where demo requests are sent. Replace with Telixo's real sales address.
const DEMO_EMAIL = 'demo@example.com';

export function initUI() {
  const body = document.body;
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-toggle');
  const links = document.getElementById('nav-links');

  const setMenu = (open) => {
    body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  toggle.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
  links.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  ScrollTrigger.create({
    start: 8, end: 'max',
    onToggle: (self) => nav.classList.toggle('is-scrolled', self.isActive),
  });

  // Demo dialog: a short form that opens a pre-filled email.
  const dialog = document.getElementById('demo-dialog');
  const form = dialog.querySelector('form');
  document.querySelectorAll('[data-demo]').forEach((btn) => btn.addEventListener('click', () => {
    setMenu(false);
    dialog.showModal();
  }));
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const d = new FormData(form);
    const channels = d.getAll('channels').join(', ') || 'Not specified';
    const text = `Name: ${d.get('name')}\nWork email: ${d.get('email')}\nCompany: ${d.get('company')}\nChannels: ${channels}`;
    window.location.href = `mailto:${DEMO_EMAIL}?subject=${encodeURIComponent(`Demo request — ${d.get('company')}`)}&body=${encodeURIComponent(text)}`;
    form.innerHTML = '<p class="form-done">Thanks — your email app should open with the request ready to send.</p>';
  });

  document.getElementById('year').textContent = new Date().getFullYear();

  // Section headlines reveal line by line, once.
  if (motionOK()) {
    document.querySelectorAll('.reveal').forEach((h) => {
      gsap.from(h.querySelectorAll('.line > span'), {
        yPercent: 105, duration: 1, ease: 'power4.out', stagger: 0.08,
        scrollTrigger: { trigger: h, start: 'top 85%', once: true },
      });
    });
  }
}
