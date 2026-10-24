"""Shared layout for every Telixo page: head, header with mega menus, footer.

Pages are written as Python functions in pages_*.py and rendered by build.py.
All internal links are relative, so the site works from any folder.
"""
import os
from html import escape

# Destinations the team still has to confirm. core.js applies the same values
# at runtime from its CONFIG block; these are the no-JS fallbacks.
LOGIN = "/login"
SIGNUP = "/signup"
WHATSAPP = "https://wa.me/910000000000"

# ---------------------------------------------------------------- icons
# 24×24 line icons, stroke = currentColor.
_I = {
    "inbox": '<path d="M3 13l2.5-7h13L21 13v6H3z"/><path d="M3 13h5l1.5 2.5h5L16 13h5"/>',
    "megaphone": '<path d="M4 10v4h3l7 4V6L7 10z"/><path d="M17.5 9.5a3.5 3.5 0 010 5"/><path d="M7 14l1 5h2.5l-1-4.5"/>',
    "contacts": '<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M7.5 17.5c1-2.2 2.6-3 4.5-3s3.5.8 4.5 3"/>',
    "team": '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3.5 19c.8-3.2 2.9-5 5.5-5s4.7 1.8 5.5 5"/><path d="M15 14.2c2.4-.3 4.6 1.1 5.4 4.3"/>',
    "phone": '<path d="M6.5 3.5l3 .5 1.5 4-2 1.5a11 11 0 005.5 5.5l1.5-2 4 1.5.5 3c0 1.2-1 2-2.2 2C10.5 19.5 4.5 13.5 4.5 5.7c0-1.2.8-2.2 2-2.2z"/>',
    "sync": '<path d="M4 9a8 8 0 0114-3l2 2"/><path d="M20 4v4h-4"/><path d="M20 15a8 8 0 01-14 3l-2-2"/><path d="M4 20v-4h4"/>',
    "store": '<path d="M4 9l1.5-5h13L20 9"/><path d="M4 9h16v2a2.7 2.7 0 01-5.3 0 2.7 2.7 0 01-5.4 0A2.7 2.7 0 014 11z"/><path d="M5.5 13v7h13v-7"/><path d="M10 20v-4h4v4"/>',
    "building": '<path d="M4 20V9l8-5 8 5v11"/><path d="M9 20v-5h6v5"/><path d="M9 10h.01M15 10h.01"/>',
    "health": '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M12 8v8M8 12h8"/>',
    "education": '<path d="M2.5 9L12 4.5 21.5 9 12 13.5z"/><path d="M6.5 11v4.5c1.5 1.5 3.4 2.2 5.5 2.2s4-.7 5.5-2.2V11"/><path d="M21.5 9v5"/>',
    "scissors": '<circle cx="6.5" cy="6.5" r="2.5"/><circle cx="6.5" cy="17.5" r="2.5"/><path d="M8.6 8L20 18M8.6 16L20 6"/>',
    "chart": '<path d="M4 20V4"/><path d="M4 20h16"/><path d="M7 15l4-4 3 3 5-6"/>',
    "headset": '<path d="M4 14v-2a8 8 0 0116 0v2"/><rect x="3.5" y="13" width="4" height="6" rx="1.5"/><rect x="16.5" y="13" width="4" height="6" rx="1.5"/><path d="M18.5 19c0 1.5-2 2.5-5 2.5"/>',
    "target": '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    "plug": '<path d="M9 3v5M15 3v5"/><path d="M6.5 8h11v3a5.5 5.5 0 01-11 0z"/><path d="M12 16.5V21"/>',
    "tag": '<path d="M3.5 12.5V4h8.5l8.5 8.5-8.5 8.5z"/><circle cx="8" cy="8.5" r="1.5"/>',
    "book": '<path d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5z"/><path d="M4 20.5A2.5 2.5 0 016.5 23H20"/>',
    "map": '<path d="M3.5 6l5.5-2 6 2 5.5-2v14l-5.5 2-6-2-5.5 2z"/><path d="M9 4v14M15 6v14"/>',
    "star": '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
    "question": '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 114 2c-1 .7-1.5 1.2-1.5 2.5"/><path d="M12 17h.01"/>',
    "link": '<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>',
    "qr": '<rect x="3.5" y="3.5" width="6" height="6" rx="1"/><rect x="14.5" y="3.5" width="6" height="6" rx="1"/><rect x="3.5" y="14.5" width="6" height="6" rx="1"/><path d="M14.5 14.5h2v2h-2zM18.5 18.5h2v2h-2zM18.5 14.5h2M14.5 18.5v2"/>',
    "info": '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>',
    "briefcase": '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5h6v2"/><path d="M3 12.5h18"/>',
    "mail": '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6l8.5 7 8.5-7"/>',
    "shield": '<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.2-7.5 9.5-4.3-1.3-7.5-4.9-7.5-9.5V6z"/><path d="M8.8 12l2.3 2.3 4.2-4.6"/>',
    "doc": '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 12h6M9 16h6"/>',
    "arrow": '<path d="M5 12h14M13 6l6 6-6 6"/>',
    "check": '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    "x": '<path d="M6 6l12 12M18 6L6 18"/>',
    "wa": '<path d="M4 20l1.2-4A8.5 8.5 0 1112 20.5a8.4 8.4 0 01-4-1z"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 .8a4.7 4.7 0 01-2.5-2.5l.8-1-1-2z"/>',
    "clock": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    "spark": '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
    "lock": '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 018 0v3"/>',
    "search": '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
}


def icon(name, cls="ic"):
    return (f'<svg class="{cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{_I[name]}</svg>')


# ---------------------------------------------------------------- navigation
PRODUCT = [
    ("product/inbox/", "inbox", "Shared Inbox", "One WhatsApp number, answered by your whole team"),
    ("product/campaigns/", "megaphone", "Campaigns and Broadcasts", "Offers and reminders to opted-in contacts"),
    ("product/contacts/", "contacts", "Contacts and CRM", "Every customer, tagged and organised"),
    ("product/team/", "team", "Team and Roles", "Control who sees and does what"),
    ("product/calling/", "phone", "Calling (Twilio)", "Call customers from the same workspace"),
    ("product/odoo/", "sync", "Odoo Sync", "Keep contacts in sync with Odoo"),
]
INDUSTRIES = [
    ("solutions/retail/", "store", "Retail", "Order updates and repeat buyers"),
    ("solutions/real-estate/", "building", "Real Estate", "Leads, site visits and follow-ups"),
    ("solutions/healthcare/", "health", "Healthcare", "Appointments and reminders"),
    ("solutions/education/", "education", "Education", "Admissions and parent updates"),
    ("solutions/restaurants-salons/", "scissors", "Restaurants and Salons", "Bookings and fewer no-shows"),
]
TEAMS = [
    ("solutions/sales/", "chart", "Sales", "Follow up every lead on time"),
    ("solutions/support/", "headset", "Support", "One queue, clear ownership"),
    ("solutions/marketing/", "target", "Marketing", "Campaigns to opted-in contacts"),
]
RESOURCES = [
    ("blog/", "book", "Blog", "Ideas for selling and supporting on WhatsApp"),
    ("guides/", "map", "Guides", "Step-by-step help for Indian businesses"),
    ("customers/", "star", "Customer Stories", "How teams use Telixo"),
    ("faq/", "question", "FAQ", "Answers before you book a demo"),
]
TOOLS = [
    ("tools/whatsapp-link/", "link", "WhatsApp link generator", "Make a wa.me link with a message"),
    ("tools/qr-code/", "qr", "WhatsApp QR code", "Print a QR that opens a chat"),
]
COMPANY = [
    ("about/", "info", "About", "Why we build Telixo"),
    ("careers/", "briefcase", "Careers", "Work with us"),
    ("contact/", "mail", "Contact", "Talk to the team"),
    ("security/", "shield", "Security", "How we protect your data"),
]
LEGAL = [
    ("privacy-policy/", "Privacy Policy"),
    ("terms/", "Terms and Conditions"),
    ("refund-policy/", "Refund and Cancellation Policy"),
]


class Page:
    """One output page. `path` is the folder below site/ ('' for the homepage)."""

    def __init__(self, path, title, description, body, *, css=(), js=(), body_class="", section=""):
        self.path, self.title, self.description = path, title, description
        self.body, self.css, self.js, self.body_class, self.section = body, css, js, body_class, section

    @property
    def depth(self):
        return 0 if not self.path else self.path.strip("/").count("/") + 1

    def u(self, target):
        """Relative URL from this page to a site path such as 'pricing/'."""
        up = "../" * self.depth
        if target.startswith(("http", "#", "/", "mailto:")):
            return target
        if INDEX_LINKS and (target == "" or target.endswith("/")):
            target += "index.html"
        return (up + target) or "./"


def _mega_item(p, href, ic, title, desc, current):
    cur = ' aria-current="page"' if current else ""
    return (f'<a class="mg-item" href="{p.u(href)}"{cur}><span class="mg-ic">{icon(ic)}</span>'
            f'<span><b>{title}</b><small>{desc}</small></span></a>')


def header(p):
    cur = lambda href: p.path == href.rstrip("/")  # noqa: E731
    sec = p.section

    def link_cls(name):
        return ' is-current' if sec == name else ''

    product = "".join(_mega_item(p, *it, cur(it[0])) for it in PRODUCT)
    ind = "".join(_mega_item(p, *it, cur(it[0])) for it in INDUSTRIES)
    teams = "".join(_mega_item(p, *it, cur(it[0])) for it in TEAMS)
    res = "".join(_mega_item(p, *it, cur(it[0])) for it in RESOURCES)
    tools = "".join(_mega_item(p, *it, cur(it[0])) for it in TOOLS)
    comp = "".join(_mega_item(p, *it, cur(it[0])) for it in COMPANY)
    legal = "".join(f'<a href="{p.u(h)}">{t}</a>' for h, t in LEGAL)

    return f'''<div class="annc" data-annc>
  <p><span class="mono">Telixo + Odoo</span> Keep your contacts in sync between Telixo and Odoo. <a href="{p.u('product/odoo/')}">See how it works <span aria-hidden="true">→</span></a></p>
  <button type="button" class="annc-x" aria-label="Dismiss announcement" data-annc-x>{icon("x")}</button>
</div>
<header class="hdr" data-hdr>
  <div class="hdr-in">
    <a class="logo" href="{p.u('')}" data-cursor="Home"><img src="{p.u('assets/img/telixo-logo.png')}" alt="Telixo" width="98" height="33"></a>
    <nav class="hdr-nav" aria-label="Primary">
      <ul class="hdr-list" data-hdr-list>
        <li><button class="hdr-link{link_cls('product')}" type="button" aria-expanded="false" aria-controls="mg-product" data-mega="product">Product<i class="chev" aria-hidden="true"></i></button></li>
        <li><button class="hdr-link{link_cls('solutions')}" type="button" aria-expanded="false" aria-controls="mg-solutions" data-mega="solutions">Solutions<i class="chev" aria-hidden="true"></i></button></li>
        <li><a class="hdr-link{link_cls('integrations')}" href="{p.u('integrations/')}">Integrations</a></li>
        <li><a class="hdr-link{link_cls('pricing')}" href="{p.u('pricing/')}">Pricing</a></li>
        <li><button class="hdr-link{link_cls('resources')}" type="button" aria-expanded="false" aria-controls="mg-resources" data-mega="resources">Resources<i class="chev" aria-hidden="true"></i></button></li>
        <li><button class="hdr-link{link_cls('company')}" type="button" aria-expanded="false" aria-controls="mg-company" data-mega="company">Company<i class="chev" aria-hidden="true"></i></button></li>
      </ul>
      <span class="hdr-pill" aria-hidden="true" data-hdr-pill></span>
    </nav>
    <div class="hdr-cta">
      <a class="login" href="{LOGIN}" data-link="login">Log in</a>
      <a class="pill-btn ghost sm" href="{WHATSAPP}" data-link="whatsapp" data-cursor="Chat" target="_blank" rel="noopener">Book a Demo<span class="sr-only"> (opens WhatsApp)</span></a>
      <a class="pill-btn brand sm magnet" href="{SIGNUP}" data-link="signup" data-cursor="Start">Start free</a>
    </div>
    <button class="hdr-burger" type="button" aria-expanded="false" aria-controls="mnav" data-burger><span></span><span></span><b class="sr-only">Menu</b></button>
  </div>

  <div class="mg-stage" data-mg-stage>
    <div class="mg-shell" data-mg-shell>
      <div class="mg" id="mg-product" data-panel="product" hidden>
        <div class="mg-main">
          <p class="mg-label mono">Product</p>
          <div class="mg-grid two">{product}</div>
        </div>
        <a class="mg-feature" href="{p.u('')}#tour">
          <span class="mg-feat-art mg-art-chat" aria-hidden="true"><i class="b in"></i><i class="b out"></i><i class="b in s"></i><i class="b out s"></i></span>
          <span class="mono">Product tour</span>
          <b>See every feature on real screens</b>
          <span class="mg-go">Take the tour {icon("arrow")}</span>
        </a>
      </div>

      <div class="mg" id="mg-solutions" data-panel="solutions" hidden>
        <div class="mg-tabs" role="tablist" aria-label="Solutions">
          <button type="button" role="tab" aria-selected="true" data-sub="industry">By industry {icon("arrow")}</button>
          <button type="button" role="tab" aria-selected="false" data-sub="team">By team {icon("arrow")}</button>
          <a class="mg-all mono" href="{p.u('solutions/')}">All solutions →</a>
        </div>
        <div class="mg-main">
          <div class="mg-sub is-on" data-subpanel="industry"><p class="mg-label mono">By industry</p><div class="mg-grid two">{ind}</div></div>
          <div class="mg-sub" data-subpanel="team"><p class="mg-label mono">By team</p><div class="mg-grid">{teams}</div></div>
        </div>
      </div>

      <div class="mg" id="mg-resources" data-panel="resources" hidden>
        <div class="mg-main">
          <p class="mg-label mono">Learn</p>
          <div class="mg-grid">{res}</div>
        </div>
        <div class="mg-main mg-side">
          <p class="mg-label mono">Free tools</p>
          <div class="mg-grid">{tools}</div>
          <a class="mg-all mono" href="{p.u('tools/')}">All free tools →</a>
        </div>
      </div>

      <div class="mg" id="mg-company" data-panel="company" hidden>
        <div class="mg-main">
          <p class="mg-label mono">Company</p>
          <div class="mg-grid two">{comp}</div>
          <div class="mg-legal"><span class="mono">Legal</span>{legal}</div>
        </div>
        <a class="mg-feature dark" href="{WHATSAPP}" data-link="whatsapp" target="_blank" rel="noopener">
          <span class="mg-feat-art mg-art-wa" aria-hidden="true">{icon("wa")}</span>
          <span class="mono">Talk to us</span>
          <b>Chat with the Telixo team on WhatsApp</b>
          <span class="mg-go">Open WhatsApp {icon("arrow")}</span>
        </a>
      </div>
    </div>
  </div>
  <div class="hdr-progress" aria-hidden="true"><i data-progress></i></div>
</header>

<div class="mnav" id="mnav" data-mnav>
  <div class="mnav-in">
    <details class="mnav-group"><summary>Product</summary><div class="mnav-items">{product}</div></details>
    <details class="mnav-group"><summary>Solutions</summary><div class="mnav-items"><p class="mg-label mono">By industry</p>{ind}<p class="mg-label mono">By team</p>{teams}<a class="mg-all mono" href="{p.u('solutions/')}">All solutions →</a></div></details>
    <a class="mnav-link" href="{p.u('integrations/')}">Integrations</a>
    <a class="mnav-link" href="{p.u('pricing/')}">Pricing</a>
    <details class="mnav-group"><summary>Resources</summary><div class="mnav-items">{res}<p class="mg-label mono">Free tools</p>{tools}</div></details>
    <details class="mnav-group"><summary>Company</summary><div class="mnav-items">{comp}<div class="mg-legal">{legal}</div></div></details>
    <div class="mnav-cta">
      <a class="pill-btn brand" href="{SIGNUP}" data-link="signup">Start free</a>
      <a class="pill-btn ghost" href="{WHATSAPP}" data-link="whatsapp" target="_blank" rel="noopener">Book a Demo</a>
      <a class="login" href="{LOGIN}" data-link="login">Log in</a>
    </div>
  </div>
</div>'''


def footer(p):
    col = lambda title, items: (f'<div><p class="mono">{title}</p>' + "".join(  # noqa: E731
        f'<a href="{p.u(h)}">{t}</a>' for h, t in items) + "</div>")
    product = [(h, t) for h, _, t, _ in PRODUCT] + [("pricing/", "Pricing"), ("integrations/", "Integrations")]
    sols = [(h, t) for h, _, t, _ in INDUSTRIES + TEAMS]
    res = [(h, t) for h, _, t, _ in RESOURCES] + [("tools/", "Free tools")]
    comp = [(h, t) for h, _, t, _ in COMPANY]
    return f'''<footer class="foot">
  <div class="foot-top">
    <form class="news" novalidate>
      <label for="news-email" class="mono">Newsletter</label>
      <p>WhatsApp tips and product updates for growing teams.</p>
      <div class="news-row">
        <input id="news-email" name="email" type="email" placeholder="Work email" autocomplete="email" required>
        <button class="pill-btn brand sm" type="submit">Subscribe</button>
      </div>
    </form>
    <div class="foot-cols">
      {col("Product", product)}
      {col("Solutions", sols)}
      {col("Resources", res)}
      {col("Company", comp)}
      {col("Legal", LEGAL)}
      <div><p class="mono">Contact</p><a href="{WHATSAPP}" data-link="whatsapp" target="_blank" rel="noopener">WhatsApp <span class="todo">number</span></a><span class="todo">hello@ email address</span><address><b>Digipine Infotech LLP</b><br><span class="todo">Registered office address</span></address></div>
      <div><p class="mono">Social</p><span class="todo">LinkedIn, Instagram and other profile links</span></div>
    </div>
  </div>
  <div class="foot-row mono">
    <span>© <span id="year"></span> Telixo · A product of Digipine Infotech LLP</span>
    <a href="#top" data-top>Back to top ↑</a>
  </div>
  <p class="foot-word" aria-hidden="true">Telixo</p>
</footer>

<div class="dock" role="region" aria-label="Get started">
  <a class="pill-btn brand" href="{SIGNUP}" data-link="signup">Start free</a>
  <a class="pill-btn ghost" href="{WHATSAPP}" data-link="whatsapp" target="_blank" rel="noopener">Book a Demo<span class="sr-only"> (opens WhatsApp)</span></a>
</div>'''


VERSION = "8"
# Hosts that do not serve folder/index.html need explicit index.html links (preview builds).
INDEX_LINKS = os.environ.get("INDEX_LINKS") == "1"


def render(p):
    css = "".join(f'\n  <link rel="stylesheet" href="{p.u(c)}?v={VERSION}">' for c in ("site.css", "ui.css", *p.css))
    js = "".join(f'\n  <script src="{p.u(j)}?v={VERSION}" defer></script>' for j in ("core.js", "pages.js", "widgets.js", *p.js))
    body_cls = f' class="{p.body_class}"' if p.body_class else ""
    return f'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{escape(p.title)}</title>
  <meta name="description" content="{escape(p.description)}">
  <meta name="theme-color" content="#FAFAF7">
  <link rel="icon" href="{p.u('favicon.svg')}" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=IBM+Plex+Mono:wght@400;500&display=swap">
  <link rel="stylesheet" href="{p.u('assets/vendor/lenis.css')}">{css}
  <script>document.documentElement.classList.add('js');</script>
  <script src="{p.u('assets/vendor/gsap.min.js')}" defer></script>
  <script src="{p.u('assets/vendor/ScrollTrigger.min.js')}" defer></script>
  <script src="{p.u('assets/vendor/lenis.min.js')}" defer></script>{js}
</head>
<body{body_cls}>
  <div class="pt" aria-hidden="true"><span class="pt-word">Telixo</span></div>
  <div class="cursor" aria-hidden="true"><span class="cursor-label"></span></div>
  <a class="skip" href="#main">Skip to content</a>
{header(p)}
  <main id="main">
{p.body}
  </main>
{footer(p)}
</body>
</html>
'''
