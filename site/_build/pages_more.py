"""Integrations, pricing, FAQ, contact, company, resources, tools and legal pages."""
from lib import Page, icon, WHATSAPP, SIGNUP
from comp import (hero_split, hero_word, hero_center, sec, head, steps, band, faq, bento, stack, marquee,
                  win, ill_note, related, quote, timeline, ctas)


def form_field(id_, label, kind="text", req=True, auto="", err="This field is required.", extra=""):
    r = " required" if req else ""
    a = f' autocomplete="{auto}"' if auto else ""
    if kind == "textarea":
        ctl = f'<textarea id="{id_}" name="{id_}"{r}{extra}></textarea>'
    else:
        ctl = f'<input id="{id_}" name="{id_}" type="{kind}"{r}{a}{extra}>'
    return f'<div class="field-s"><label for="{id_}">{label}</label>{ctl}<span class="err">{err}</span></div>'


# ---------------------------------------------------------------- integrations
INTS = [
    ("integrations/twilio/", "phone", "Twilio", "calling", "Calling", "Call customers from their WhatsApp chat, through your Twilio connection."),
    ("integrations/odoo/", "sync", "Odoo", "crm", "CRM and ERP", "Keep contacts in sync between Telixo and Odoo."),
]


def integrations(p):
    p.section = "integrations"
    nodes = [("phone", "Twilio", "0deg", ""), ("sync", "Odoo", "180deg", ""), ("plus", "Your tool?", "90deg", "soon"), ("plus", "Request", "270deg", "soon")]
    orb = '<div class="orb" aria-hidden="true"><div class="orb-ring"></div><div class="orb-ring r2"></div><div class="orb-spin">' + "".join(
        f'<div class="orb-node {s}" style="--a:{a}"><span>{icon(ic) if ic != "plus" else ""}{t}</span></div>' for ic, t, a, s in nodes) + \
        f'</div><div class="orb-core"><img src="{p.u("assets/img/telixo-logo.png")}" alt=""></div></div>'
    cards = "".join(f'''<a class="int-card" href="{p.u(h)}" data-item data-tags="{tag}" data-cursor="Open">
  <span class="int-logo">{icon(ic)}</span><span class="chip-s">{cat}</span><b>{name}</b><p>{d}</p><span class="mg-go">Details {icon("arrow")}</span></a>''' for h, ic, name, tag, cat, d in INTS)
    cards += f'''<a class="int-card req" href="#request" data-item data-tags="request" data-cursor="Ask"><span class="int-logo">{icon("plug")}</span><span class="chip-s">Request</span><b>Need another tool?</b><p>Tell us which tool you use and what you want to connect.</p><span class="mg-go">Request it {icon("arrow")}</span></a>'''
    directory = f'''<div data-filter>
  <div class="fbar">
    <label class="fsearch"><span class="sr-only">Search integrations</span>{icon("search")}<input id="int-q" type="search" placeholder="Search integrations"></label>
    <div class="fchips"><button type="button" data-cat="all" aria-pressed="true">All</button><button type="button" data-cat="calling" aria-pressed="false">Calling</button><button type="button" data-cat="crm" aria-pressed="false">CRM and ERP</button></div>
  </div>
  <div class="fgrid">{cards}</div>
  <p class="fempty" hidden>No integration matches that yet. <a href="#request" class="more mono">Request it →</a></p>
</div>'''
    form = f'''<div class="req-wrap">
  <form class="req-form" data-form novalidate>
    {form_field("rq-name", "Your name", auto="name")}
    {form_field("rq-email", "Work email", "email", auto="email", err="Enter a valid email address.")}
    {form_field("rq-tool", "Which tool?")}
    {form_field("rq-why", "What should it do?", "textarea", req=False)}
    <button class="pill-btn brand" type="submit">Send request {icon("arrow")}</button>
  </form>
  <div class="form-ok" data-form-done hidden tabindex="-1"><b>Request noted.</b><p>Thanks. <span class="todo">Connect this form to the team's inbox or CRM so requests reach someone.</span></p></div>
</div>'''
    body = hero_center("Integrations", 'Telixo works with <span class="brand">your tools.</span>',
                       "Twilio for calling and Odoo for contacts today, with room for more. Ask for the tool you need.",
                       f'<div style="width:100%;margin-top:clamp(28px,4vw,56px)" data-reveal="scale">{orb}</div>')
    body += sec(2, "Directory", head("All <em>integrations.</em>", "Search or filter by category.") + directory, "Searchable")
    body += sec(3, "Request an integration", '<div class="split-2" id="request">' + head("Missing <em>a tool?</em>", "Tell us what you use. Requests help us decide what to build next.", small=True) + f'<div class="wrap">{form}</div></div>', "Request")
    body += band('Connect Telixo <em>to your stack.</em>', "Start free and connect Twilio or Odoo.", n=4)
    return body


def int_detail(p, name, ic, other_ic, lede, does, setup, qs):
    p.section = "integrations"
    art = f'''<div class="conn" aria-hidden="true">
  <span class="conn-tile"><img src="{p.u("assets/img/telixo-logo.png")}" alt=""></span>
  <svg class="conn-line" viewBox="0 0 200 20" preserveAspectRatio="none"><path d="M0 10 H200"/></svg>
  <span class="conn-tile dark">{icon(other_ic)}<b>{name}</b></span>
</div>'''
    body = hero_split(f"Integrations · {name}", f'Telixo <span class="brand">+</span> {name}', lede, art)
    body += sec(2, "What it does", head(f"What {name} <em>adds.</em>", small=True) + bento(does), "Overview")
    body += sec(3, "Setup", head("Get set up.", '<span class="todo">Confirm these setup steps with the product team.</span>', small=True) + steps(setup), "Steps")
    body += sec(4, "Questions", '<div class="wrap" style="margin-top:clamp(28px,4vw,48px)">' + faq(qs) + "</div>", f"{name} FAQ")
    body += sec(5, "Other integrations", f'<div class="wrap" style="margin-top:clamp(28px,4vw,48px)"><a class="int-link" href="{p.u("integrations/")}" data-cursor="Open"><span class="mono">Directory</span><b>All integrations</b>{icon("arrow")}</a></div>', "Integrations")
    body += band(f'Connect {name} <em>today.</em>', f"Start free and connect {name} from Telixo.", n=6)
    return body


def twilio(p):
    return int_detail(p, "Twilio", "phone", "phone", "Call customers through Twilio from the same place your team chats with them on WhatsApp.", [
        ("w2 green", "phone", "Call from the chat", "Start a call from the customer's WhatsApp conversation."),
        ("", "clock", "Calls on the timeline", "Calls sit next to the chat history."),
        ("", "team", "For the whole team", "Anyone with access can call from the shared inbox."),
    ], [("Connect", "Connect your Twilio account to Telixo."), ("Choose numbers", "Pick the Twilio number your team calls from."), ("Call", "Call customers from their chat.")], [
        ("Do I need a Twilio account?", '<span class="todo">Confirm whether customers bring their own Twilio account.</span>'),
        ("How is calling billed?", '<span class="todo">Confirm how Twilio charges are billed.</span>'),
        ("Which countries can I call?", '<span class="todo">Confirm supported countries and numbers.</span>'),
    ])


def odoo_int(p):
    return int_detail(p, "Odoo", "sync", "sync", "Keep contact details in step between Telixo and Odoo, so your team works from the same customer record.", [
        ("w2 ink", "sync", "Contacts in sync", "Customer details match in Telixo and Odoo."),
        ("", "contacts", "No double entry", "Stop copying details between tools."),
        ("", "tag", "Tags and segments", '<span class="todo">Confirm whether tags sync.</span>'),
    ], [("Connect", "Link your Odoo database."), ("Map", "Choose the contacts and fields to sync."), ("Work", "Use the same customer details in both tools.")], [
        ("Which Odoo versions are supported?", '<span class="todo">Confirm supported Odoo versions and editions.</span>'),
        ("Is the sync one-way or two-way?", '<span class="todo">Confirm the sync direction.</span>'),
        ("How often does it sync?", '<span class="todo">Confirm the sync frequency.</span>'),
    ])


# ---------------------------------------------------------------- pricing
def pricing(p):
    p.section = "pricing"
    plans = [
        ("Starter", "For small teams getting started", ["Shared inbox", "Contacts and tags", "Campaigns to opted-in contacts", "Basic roles", "Email support"], False),
        ("Growth", "For growing teams that sell and support", ["Everything in Starter", "Advanced roles", "Calling with Twilio", "Odoo sync", "Priority support"], True),
        ("Business", "For larger teams with more control", ["Everything in Growth", "More seats", "Custom roles", "Onboarding help", "Dedicated contact"], False),
    ]
    cards = "".join(f'''<article class="plan{" hot" if hot else ""}">
  {'<span class="plan-badge mono">Most popular</span>' if hot else ''}
  <p class="mono">{name}</p>
  <p class="plan-for">{for_}</p>
  <p class="plan-price"><span class="todo" data-price-m>₹ —</span><span class="todo" data-price-y hidden>₹ —</span><small> / month</small></p>
  <p class="plan-seats mono"><span class="todo">Seat limit</span></p>
  <ul>{"".join(f"<li>{icon('check')}{f}</li>" for f in feats)}</ul>
  <a class="pill-btn {"brand" if hot else "ghost"}" href="{SIGNUP}" data-link="signup">Start free</a>
</article>''' for name, for_, feats, hot in plans)
    rows_ = [
        ("Inbox", [("Shared inbox", "y y y"), ("Assignment and internal notes", "y y y"), ("Chat status", "y y y")]),
        ("Campaigns", [("Campaigns and broadcasts", "y y y"), ("Scheduling", "t y y")]),
        ("Contacts", [("Contacts, tags and segments", "y y y"), ("Import contacts", "y y y")]),
        ("Team", [("Seats", "t t t"), ("Roles", "t y y"), ("Custom roles", "n n y")]),
        ("Integrations", [("Calling with Twilio", "n y y"), ("Odoo sync", "n y y")]),
        ("Support", [("Support channel", "t t t"), ("Onboarding help", "n n y")]),
    ]
    def cell(v):
        return {"y": f'<span class="yes" aria-label="Included">{icon("check")}</span>', "n": '<span class="no" aria-label="Not included">—</span>', "t": '<span class="todo">Set</span>'}[v]
    body_rows = "".join(f'<tr class="grp"><th colspan="4" scope="colgroup">{g}</th></tr>' + "".join(
        f'<tr><th scope="row">{f}</th>' + "".join(f"<td>{cell(v)}</td>" for v in vals.split()) + "</tr>" for f, vals in items) for g, items in rows_)
    table = f'''<div class="cmp-table-wrap"><table class="cmp-table">
<thead><tr><th scope="col"><span class="sr-only">Feature</span></th><th scope="col">Starter</th><th scope="col" class="hot">Growth</th><th scope="col">Business</th></tr></thead>
<tbody>{body_rows}</tbody></table></div>'''
    body = f'''<section class="ph ph-center" id="top">
  <p class="mono eyebrow">Pricing</p>
  <h1 class="ph-title" data-kin>Plans for every <span class="brand">growing team.</span></h1>
  <p class="lede wide">Pick a plan and start free. Prices in Indian rupees.</p>
  <div class="bill" data-billing>
    <div class="tabs-x" role="tablist" aria-label="Billing period" data-tabs><span class="ind"></span>
      <button type="button" role="tab" aria-selected="true" data-tab="m">Monthly</button>
      <button type="button" role="tab" aria-selected="false" data-tab="y">Annual</button>
    </div>
    <span class="chip-s ok">Save <span class="todo">—%</span> with annual</span>
  </div>
  <p class="todo-box" style="max-width:62ch;text-align:left">Plan names, prices, seat limits and the features in each plan are a layout example from the brief. Replace them with Telixo's real plans before launch.</p>
</section>
<section class="sec tight"><div class="plans" data-stagger data-dock-start>{cards}</div>
<p class="meta-note wrap"><span class="mono">Meta conversation fees</span> <span class="todo">If Meta's per-conversation fees apply, say here that they are billed separately and link to Meta's rates.</span></p></section>'''
    body += sec(2, "Compare plans", head("Compare <em>every plan.</em>", "Plan names stay pinned as you scroll.") + table, "Feature table")
    body += sec(3, "Pricing questions", '<div class="wrap" style="margin-top:clamp(28px,4vw,48px)">' + faq([
        ("Is there a free trial?", '<span class="todo">Confirm what “Start free” includes and for how long.</span>'),
        ("Are Meta's WhatsApp fees included?", '<span class="todo">Confirm whether Meta’s per-conversation fees are billed separately.</span>'),
        ("Can I change plans later?", '<span class="todo">Confirm upgrade and downgrade rules.</span>'),
        ("How do seats work?", '<span class="todo">Confirm how seats are counted and priced.</span>'),
        ("Which payment methods do you accept?", '<span class="todo">Confirm payment methods (UPI, cards, bank transfer) and GST invoicing.</span>'),
        ("Can I cancel any time?", f'See the <a href="{p.u("refund-policy/")}">refund and cancellation policy</a>. <span class="todo">Confirm the cancellation terms.</span>'),
    ]) + "</div>", "6 questions")
    body += band('Start with <em>the right plan.</em>', "Start free, or book a demo and we will help you choose.", n=4)
    return body


# ---------------------------------------------------------------- FAQ
FAQ_GROUPS = [
    ("start", "Getting started", [
        ("What is Telixo?", "Telixo is a WhatsApp Business platform for businesses in India: a shared inbox for your team, campaigns and broadcasts, contacts and roles, with Twilio calling and Odoo contact sync."),
        ("Can several people use one number?", "Yes. Your whole team works from one WhatsApp Business number in the shared inbox, and each chat can be assigned to one person."),
        ("Do I need coding skills?", 'No coding is needed to use the inbox, campaigns or contacts. <span class="todo">Confirm how number connection works and whether the team helps with Meta setup.</span>'),
        ("How long does setup take?", '<span class="todo">Confirm typical setup time.</span>'),
    ]),
    ("meta", "WhatsApp API and Meta approval", [
        ("Is Telixo an official WhatsApp Business API provider?", '<span class="todo">Confirm how Telixo connects to the WhatsApp Business Platform, and whether it is, or works through, a Meta Business Partner.</span>'),
        ("Will broadcasts get my number blocked?", "WhatsApp can limit or block numbers when people report or block their messages. Send campaigns only to contacts who opted in, use approved templates, and keep messages relevant."),
        ("What is a message template?", "A pre-approved message format that WhatsApp requires for messages a business starts. You fill in details such as the customer's name."),
        ("Can I keep my current number?", '<span class="todo">Confirm whether an existing WhatsApp number can be moved to Telixo, and what happens to the WhatsApp Business app on it.</span>'),
    ]),
    ("billing", "Pricing and billing", [
        ("How much does Telixo cost?", "See the pricing page for plans. Telixo has plans for businesses in India."),
        ("Are Meta's fees included?", '<span class="todo">Confirm whether Meta’s per-conversation fees are billed separately.</span>'),
        ("Do you provide GST invoices?", '<span class="todo">Confirm GST invoicing.</span>'),
    ]),
    ("data", "Data and security", [
        ("Who can see our chats?", "Roles control what each team member can see. Owners and admins decide who has access."),
        ("Where is our data stored?", '<span class="todo">Confirm data storage location.</span>'),
        ("Is Telixo DPDP Act ready?", '<span class="todo">Add only what the team can prove about India’s DPDP Act.</span>'),
    ]),
]


def faq_page(p):
    p.section = "resources"
    nav = "".join(f'<a href="#g-{k}">{t}</a>' for k, t, _ in FAQ_GROUPS)
    groups = "".join(f'''<section class="fq-group" id="g-{k}" data-group><h2 class="h3">{t}</h2><div class="faq-list">{"".join(f'<details data-item><summary>{q}</summary><div><p>{a}</p></div></details>' for q, a in qs)}</div></section>''' for k, t, qs in FAQ_GROUPS)
    body = f'''<section class="ph fq-hero" id="top">
  <p class="mono eyebrow">Resources · FAQ</p>
  <h1 class="ph-title" data-kin>Ask us <span class="brand">anything.</span></h1>
  <label class="fq-search" data-dock-start><span class="sr-only">Search questions</span>{icon("search")}<input id="fq-q" type="search" placeholder="Search questions, for example “Meta”" data-fq-q></label>
  <p class="mono fq-count" data-fq-count aria-live="polite"></p>
</section>
<section class="sec tight"><div class="fq-layout faq" data-fq>
  <nav class="doc-toc" aria-label="Question groups" data-toc>{nav}</nav>
  <div class="fq-groups">{groups}<p class="fempty" data-fq-empty hidden>No question matches. Try another word, or ask us on WhatsApp.</p></div>
  <aside class="faq-card"><p class="mono">Still have questions?</p><p class="faq-card-t">Chat with the Telixo team on WhatsApp.</p>
    <a class="pill-btn brand" href="{WHATSAPP}" data-link="whatsapp" target="_blank" rel="noopener">Chat on WhatsApp</a>
    <a class="more mono" href="{p.u("contact/")}">Or use the contact form →</a></aside>
</div></section>'''
    body += band('Ready when <em>you are.</em>', "Start free, or book a demo first.", n=3)
    return body


# ---------------------------------------------------------------- contact
def contact(p):
    p.section = "company"
    sizes = "".join(f'<label class="opt"><input type="radio" name="size" value="{v}"{" required" if i == 0 else ""}><span>{v}</span></label>' for i, v in enumerate(["1–5", "6–20", "21–50", "51+"]))
    body = f'''<section class="ph" id="top">
  <div class="ph-split">
    <div class="ph-copy">
      <p class="mono eyebrow">Company · Contact</p>
      <h1 class="ph-title" data-kin>Let’s <span class="brand">talk.</span></h1>
      <p class="lede wide">Tell us about your team and we will get back to you. Prefer WhatsApp? Chat with us directly.</p>
      <div class="ct-cards" data-stagger>
        <a class="ct-card" href="{WHATSAPP}" data-link="whatsapp" target="_blank" rel="noopener" data-dock-start>{icon("wa")}<div><b>Chat on WhatsApp</b><span class="mono">Fastest way to reach us</span></div></a>
        <div class="ct-card">{icon("clock")}<div><b>Reply time</b><span class="todo">Expected reply time</span></div></div>
        <div class="ct-card">{icon("building")}<div><b>Office</b><span class="todo">Address and office hours</span></div></div>
      </div>
    </div>
    <div class="convo" data-reveal="scale">
      <div class="convo-head"><span class="av" style="--a:var(--brand)">TX</span><div><b>Telixo team</b><span class="mono">Usually replies <span class="todo">reply time</span></span></div></div>
      <form class="convo-body" data-form novalidate>
        <p class="cq">Hi! What’s your name?</p>
        {form_field("ct-name", "Your name", auto="name")}
        <p class="cq">Which work email should we reply to?</p>
        {form_field("ct-email", "Work email", "email", auto="email", err="Enter a valid email address.")}
        <p class="cq">And a phone number, in case WhatsApp is easier?</p>
        {form_field("ct-phone", "Phone", "tel", auto="tel", err="Enter a phone number.", extra=' pattern="[0-9+ ()-]{7,}"')}
        <p class="cq">How big is your team?</p>
        <div class="field-s"><span class="mono" style="color:var(--muted)">Company size</span><div class="opts">{sizes}</div><span class="err">Pick a team size.</span></div>
        <p class="cq">What can we help with?</p>
        {form_field("ct-msg", "Message", "textarea")}
        <button class="pill-btn brand" type="submit">Send {icon("arrow")}</button>
      </form>
      <div class="form-ok" data-form-done hidden tabindex="-1"><b>Thanks, message received.</b><p>We will reply by email. <span class="todo">Connect this form to the team's inbox or CRM.</span></p></div>
    </div>
  </div>
</section>'''
    body += band('Rather see it <em>live?</em>', "Book a demo and see Telixo with your own channels.", label="Book a Demo →", href=WHATSAPP, link="whatsapp", n=2)
    return body


# ---------------------------------------------------------------- about
def about(p):
    p.section = "company"
    team = "".join(f'<div class="person"><span class="person-ph"><span class="todo">Photo</span></span><b class="todo">Name</b><span class="mono todo">Role</span></div>' for _ in range(4))
    chapters = [
        ("The problem we saw", "Indian businesses run on WhatsApp, but most share one phone between the whole team. Chats get missed and customer history disappears."),
        ("What we built", "Telixo puts that WhatsApp number into a shared inbox, with campaigns, contacts, roles, Twilio calling and Odoo sync."),
        ("Where we are going", '<span class="todo">One or two sentences on where Telixo is headed, in the team’s own words.</span>'),
    ]
    ch = "".join(f'<article class="chap"><span class="stack-n">{i:02d}</span><h3 class="h3">{t}</h3><p class="body-l">{d}</p></article>' for i, (t, d) in enumerate(chapters, 1))
    values = [("Plain words", "We explain things the way our customers talk."), ("Your data stays yours", "Customer data belongs to the business, not to a staff phone."), ("Small teams first", "We build for businesses that do a lot with a few people."), ("Show, don't claim", "We publish only what we can prove.")]
    vals = "".join(f'<article class="val"><span class="mono">0{i}</span><h3 class="h3">{t}</h3><p>{d}</p></article>' for i, (t, d) in enumerate(values, 1))
    body = hero_word("Company · About", "About", 'We help teams talk to customers <span class="brand">together.</span>',
                     "Telixo is a WhatsApp Business platform for businesses in India, built by Digipine Infotech LLP.")
    body += sec(2, "Mission", '<p class="scrub" data-scrub="together,team">Every business in India talks to customers on WhatsApp. We want every team to do it together, with nothing missed and nothing lost.</p>', "Why we exist")
    body += sec(3, "Our story", f'<div class="story3"><div class="story3-l">{head("Three chapters, <em>so far.</em>")}</div><div class="story3-r">{ch}</div></div>', "Story")
    body += sec(4, "Values", head("What we <em>stand for.</em>", small=True) + f'<div class="vals" data-tilt>{vals}</div>', "Values")
    body += sec(5, "Team", head("The people <em>behind Telixo.</em>", '<span class="todo">Add team photos, names and roles.</span>', small=True) + f'<div class="people" data-stagger>{team}</div>', "Team")
    body += sec(6, "Digipine Infotech LLP", f'''<div class="dg" data-reveal="clip"><p class="mono">Built by</p><p class="dg-name">Digipine Infotech LLP</p>
<p class="dg-text"><span class="todo">Describe how Telixo relates to Digipine Infotech LLP: who builds it, who supports it, and where the company is registered.</span></p></div>''', "Company")
    body += band('Work with us, <em>or talk to us.</em>', "We are always happy to hear from businesses and people who want to build with us.", label="Contact us →", href=p.u("contact/"), link="", n=7)
    return body


# ---------------------------------------------------------------- careers
def careers(p):
    p.section = "company"
    board = '''<div class="flap" data-flap aria-label="Open roles: none listed right now">
  <div class="flap-row mono"><span>Role</span><span>Team</span><span>Location</span></div>
  <div class="flap-line" data-flap-text="NO OPEN ROLES RIGHT NOW"></div>
  <div class="flap-line dim" data-flap-text="WRITE TO US ANYWAY"></div>
</div>'''
    body = hero_word("Company · Careers", "Careers", 'Build tools Indian <span class="brand">businesses use daily.</span>',
                     "We are a small team building Telixo. When we hire, roles appear here.")
    body += sec(2, "Open roles", head("Open <em>roles.</em>", "This board updates when we hire.") + f'<div class="wrap" style="margin-top:clamp(28px,4vw,48px)">{board}</div>' +
                f'<div class="wrap fallback"><p class="body-l">No role that fits? Send us a note about what you do best.</p><p class="mono"><span class="todo">careers@ email address</span></p></div>', "Hiring board")
    body += sec(3, "Culture", marquee(["Ship small", "Talk to customers", "Write it down", "Own it"]) + marquee(["Plain words", "Small teams", "Customer first"], rev=True, outline=True) +
                head("How we <em>work.</em>", '<span class="todo">Describe the team’s culture in its own words: how you work, where, and what you value.</span>', small=True), "Culture")
    body += sec(4, "How we hire", head("Our process, <em>in four steps.</em>", '<span class="todo">Confirm the hiring steps.</span>', small=True) + steps([
        ("Apply", "Send your note and work samples."), ("Chat", "A short conversation with the team."), ("Task", "A small, paid task close to the real work."), ("Offer", "We decide quickly and tell you why."),
    ]), "Process")
    body += band('Want to build <em>with us?</em>', "Tell us what you would like to work on.", label="Get in touch →", href=p.u("contact/"), link="", n=5)
    return body


# ---------------------------------------------------------------- security
def security(p):
    p.section = "company"
    shield = f'''<div class="shield" aria-hidden="true"><span class="sh-ring"></span><span class="sh-ring r2"></span><span class="sh-ring r3"></span><span class="sh-core">{icon("shield")}</span></div>'''
    layers = [
        ("Roles and permissions", "Owners decide who can see all chats, who can export contacts and who manages billing. Agents see what they need to reply.", win("Roles", '<div class="seg"><span class="chip-s ok">Admin</span><span class="chip-s">Manager</span><span class="chip-s">Agent</span></div>')),
        ("Chats stay with the business", "Conversations live in Telixo, not on a staff member's phone, so they stay with your business when people move on.", win("Ownership", '<p class="m in">Chat history · kept in Telixo</p>')),
        ("Encryption and access controls", '<span class="todo">Describe encryption in transit and at rest, and access controls, only as far as the team can prove.</span>', '<div class="lk">' + icon("lock") + '</div>'),
        ("India’s DPDP Act", '<span class="todo">Add a note on the Digital Personal Data Protection Act, 2023: what Telixo does as a data processor and what customers must do. Only publish what the team can prove.</span>', '<div class="lk">' + icon("doc") + '</div>'),
    ]
    body = hero_center("Company · Security", 'Your customers’ chats, <span class="brand">protected.</span>',
                       "How Telixo looks after customer data on WhatsApp. We publish only what we can prove.",
                       f'<div style="margin-top:clamp(20px,3vw,40px)">{shield}</div>')
    body += sec(2, "Trust, layer by layer", head("Layer <em>by layer.</em>", "What protects your data, from the people on your team to the systems underneath.") + stack(layers), "Security")
    body += sec(3, "Status and certifications", head("Proof, <em>not promises.</em>", small=True) + bento([
        ("w2 ink", "clock", "Uptime and status", '<span class="todo">Link a public status page when one exists.</span>'),
        ("", "shield", "Meta Business Partner", '<span class="todo">Show the badge only if Telixo holds this status.</span>'),
        ("", "doc", "Policies", f'Read our <a class="more" href="{p.u("privacy-policy/")}">privacy policy</a> and <a class="more" href="{p.u("terms/")}">terms</a>.'),
    ]), "Proof")
    body += band('Security questions? <em>Ask us.</em>', "Talk to the team about how Telixo handles your data.", label="Contact us →", href=p.u("contact/"), link="", n=4)
    return body


# ---------------------------------------------------------------- resources
TOPICS = [
    ("whatsapp", "Moving your team off a shared WhatsApp phone", "What changes, what stays the same, and how to plan the switch."),
    ("whatsapp", "WhatsApp message templates, explained", "What templates are, why WhatsApp needs them, and how to write good ones."),
    ("sales", "Following up WhatsApp leads on time", "A simple routine for sales teams."),
    ("support", "Running support from one WhatsApp number", "Ownership, status and handovers."),
    ("marketing", "Opt-in first: building a list people want", "How to collect consent the right way."),
    ("sales", "Site visits that happen: a real estate playbook", "From enquiry to visit to follow-up."),
]


def blog(p):
    p.section = "resources"
    cards = "".join(f'''<article class="post" data-item data-tags="{tag}"><div class="post-img" data-parallax="-8"></div><span class="chip-s">{tag}</span><h3>{t}</h3><p>{d}</p><span class="chip-s todo-chip">Planned topic</span></article>''' for tag, t, d in TOPICS)
    body = hero_word("Resources · Blog", "Blog", 'Ideas for selling and supporting <span class="brand">on WhatsApp.</span>', "Practical notes for Indian businesses that run on WhatsApp.", buttons=False)
    body += f'''<section class="sec tight"><article class="feat" data-reveal="clip" data-dock-start>
  <div class="feat-img"><span class="chip-s ok">Featured</span></div>
  <div class="feat-copy"><span class="mono">Featured post</span><h2 class="h3"><span class="todo">Featured post title</span></h2><p class="body-l"><span class="todo">Pick one published post to feature here.</span></p></div>
</article></section>'''
    body += sec(2, "All posts", head("Latest <em>posts.</em>", '<span class="todo">These are suggested first topics. Replace them with published posts.</span>') + f'''<div data-filter>
  <div class="fbar"><div class="fchips">
    <button type="button" data-cat="all" aria-pressed="true">All</button><button type="button" data-cat="whatsapp" aria-pressed="false">WhatsApp</button>
    <button type="button" data-cat="sales" aria-pressed="false">Sales</button><button type="button" data-cat="support" aria-pressed="false">Support</button><button type="button" data-cat="marketing" aria-pressed="false">Marketing</button>
  </div></div>
  <div class="fgrid">{cards}</div></div>''', "Filter by topic")
    body += band('Put the ideas <em>to work.</em>', "Try them with your own team in Telixo.", n=3)
    return body


GUIDES = [
    ("Getting started", "Set up a shared inbox"), ("WhatsApp API", "Business API approval basics"), ("Templates", "Write templates that get approved"),
    ("Consent", "Collect opt-in the right way"), ("DPDP Act", "Data protection basics for WhatsApp"), ("Odoo", "Keep contacts in sync"),
]


def guides(p):
    p.section = "resources"
    heights = [330, 300, 350, 310, 340, 296]
    spines = "".join(f'<button type="button" class="spine" style="--i:{i};height:{heights[i]}px" aria-expanded="false"><span class="spine-t">{t}</span><span class="spine-open"><span class="mono">{k}</span><b>{t}</b><span class="chip-s todo-chip">Planned guide</span></span></button>' for i, (k, t) in enumerate(GUIDES))
    body = hero_split("Resources · Guides", 'Step-by-step <span class="brand">help.</span>', "Guides for Indian businesses moving their WhatsApp to a team inbox. Pick a book off the shelf.",
                      f'<div class="shelf" data-shelf>{spines}</div>' + ill_note("Planned guides. Replace with published ones."), buttons=False)
    body += sec(2, "How guides work", head("Read, <em>then do.</em>", "Each guide ends with a checklist you can follow in Telixo.", small=True) + steps([
        ("Read", "A short explanation of the topic."), ("Follow", "Step-by-step instructions with screenshots."), ("Check", "A checklist to confirm you are done."),
    ]), "Format")
    body += band('Need a hand <em>setting up?</em>', "Book a demo and we will walk you through it.", label="Book a Demo →", href=WHATSAPP, link="whatsapp", n=3)
    return body


def customers(p):
    p.section = "resources"
    body = f'''<section class="ph" id="top">
  <p class="mono eyebrow">Resources · Customer Stories</p>
  <div class="cs-hero">
    <p class="cs-num"><span class="todo">00%</span></p>
    <div class="ph-copy"><h1 class="ph-title" data-kin>Real teams, <span class="brand">real results.</span></h1>
      <p class="lede wide">How businesses use Telixo. Each story leads with one result the customer agreed to share.</p>{ctas()}</div>
  </div>
</section>'''
    body += sec(2, "Story template", head("How each story <em>is told.</em>", '<span class="todo">Turn alpha-user quotes into stories using this layout.</span>') + f'''<div class="cs-tpl" data-stagger>
  <article><span class="mono">Challenge</span><h3 class="h3">What wasn’t working</h3><p><span class="todo">The customer’s problem before Telixo.</span></p></article>
  <article><span class="mono">Solution</span><h3 class="h3">What they changed</h3><p><span class="todo">How they set up Telixo.</span></p></article>
  <article class="ink"><span class="mono">Result</span><h3 class="h3">What happened</h3><p><span class="todo">One measurable result, with the customer’s approval.</span></p></article>
</div>''' + f'<div style="margin-top:clamp(28px,4vw,48px)">{quote("customer")}</div>', "Template")
    inds = ["Salon", "Restaurant", "Real estate", "Retail", "Services"]
    cards = "".join(f'<article class="cs-card"><span class="chip-s">{i}</span><p class="cs-big"><span class="todo">Result</span></p><p><span class="todo">Business name · City</span></p><span class="chip-s todo-chip">Story coming</span></article>' for i in inds)
    body += sec(3, "Stories", head("Stories <em>by industry.</em>", small=True) + f'<div class="cs-grid" data-stagger>{cards}</div>', "Coming")
    body += band('Write the next <em>story with us.</em>', "Start free and tell us how it goes.", n=4)
    return body


# ---------------------------------------------------------------- tools
def tools(p):
    p.section = "resources"
    body = hero_center("Resources · Free tools", 'Free WhatsApp <span class="brand">tools.</span>', "Small tools you can use right now. No sign-up.", buttons=False)
    body += f'''<section class="sec tight"><div class="tool-cards" data-tilt data-dock-start>
  <a href="{p.u("tools/whatsapp-link/")}" class="tool-card"><span class="mg-ic">{icon("link")}</span><b>WhatsApp link generator</b><p>Make a wa.me link that opens a chat with your number and a ready message.</p><code class="tool-demo">wa.me/9198•••••000?text=Hi</code><span class="mg-go">Open the tool {icon("arrow")}</span></a>
  <a href="{p.u("tools/qr-code/")}" class="tool-card ink"><span class="mg-ic">{icon("qr")}</span><b>WhatsApp QR code</b><p>Turn your WhatsApp link into a QR code for your shop, menu or flyer.</p><span class="tool-qr" aria-hidden="true"></span><span class="mg-go">Open the tool {icon("arrow")}</span></a>
  <div class="tool-card soon"><span class="mg-ic">{icon("spark")}</span><b>WhatsApp button generator</b><p>Add a “Chat on WhatsApp” button to your website.</p><span class="chip-s todo-chip">Planned tool</span></div>
</div></section>'''
    body += band('Want the whole <em>team on it?</em>', "Links and QR codes bring chats in. Telixo helps your team answer them.", n=2)
    return body


def tool_form(prefix):
    return f'''<div class="tool-form">
  <div class="field-s"><label for="{prefix}-cc">Country code</label><select id="{prefix}-cc" data-t="cc"><option value="91" selected>India (+91)</option><option value="971">UAE (+971)</option><option value="44">UK (+44)</option><option value="1">US / Canada (+1)</option><option value="65">Singapore (+65)</option></select></div>
  <div class="field-s"><label for="{prefix}-num">WhatsApp number · example, replace with yours</label><input id="{prefix}-num" type="tel" inputmode="numeric" placeholder="98765 43210" value="98765 43210" data-t="num" autocomplete="tel-national"><span class="err">Enter a number with 6 to 14 digits.</span></div>
  <div class="field-s"><label for="{prefix}-msg">Message (optional)</label><textarea id="{prefix}-msg" data-t="msg" placeholder="Hi! I'd like to know more.">Hi! I'd like to know more.</textarea></div>
</div>'''


def wa_link(p):
    p.section = "resources"
    tool = f'''<div class="tool" data-tool="link">
  {tool_form("wl")}
  <div class="tool-out">
    <p class="mono">Your link</p>
    <div class="tool-link"><input id="wl-out" readonly data-t-out value="Enter your number to create a link"><button type="button" class="pill-btn brand sm" data-copy="#wl-out">Copy</button></div>
    <a class="pill-btn ghost sm" data-t-open href="#" target="_blank" rel="noopener" aria-disabled="true">Test the link ↗</a>
    <p class="mono">Preview</p>
    <div class="tool-prev"><div class="cm out" data-t-prev>Hi! I'd like to know more.</div></div>
  </div>
</div>'''
    body = hero_split("Free tool · WhatsApp link generator", 'Make a <span class="brand">WhatsApp</span> link.', "Enter your number and an optional message. Anyone who taps the link opens a chat with you, message ready to send.", tool, buttons=False)
    body += sec(2, "Where to use it", head("Put your link <em>everywhere.</em>", small=True) + bento([
        ("w2 green", "link", "Instagram bio", "Let followers message you in one tap."),
        ("", "mail", "Email signature", "A chat link under your name."),
        ("", "megaphone", "Ads", "Send ad clicks straight into a chat."),
    ]), "Ideas")
    body += sec(3, "Next step", f'<div class="wrap" style="margin-top:clamp(28px,4vw,48px)"><a class="int-link" href="{p.u("tools/qr-code/")}" data-cursor="Open"><span class="mono">Free tool</span><b>Turn it into a QR code</b>{icon("arrow")}</a></div>', "QR code")
    body += band('Got chats coming in? <em>Answer them together.</em>', "Telixo gives your whole team one WhatsApp inbox.", n=4)
    return body


def qr(p):
    p.section = "resources"
    tool = f'''<div class="tool" data-tool="qr">
  {tool_form("qr")}
  <div class="tool-out">
    <div class="qr-box"><canvas id="qr-canvas" width="320" height="320" role="img" aria-label="QR code for your WhatsApp link"></canvas></div>
    <div class="tabs-x" role="tablist" aria-label="QR colour" data-tabs data-qr-colour><span class="ind"></span>
      <button type="button" role="tab" aria-selected="true" data-tab="#252525">Charcoal</button><button type="button" role="tab" aria-selected="false" data-tab="#0E8A5F">Green</button>
    </div>
    <a class="pill-btn brand sm" data-qr-dl href="#" download="whatsapp-qr.png" aria-disabled="true">Download PNG</a>
    <p class="mono" data-t-out-text style="color:var(--muted);word-break:break-all"></p>
  </div>
</div>'''
    body = hero_split("Free tool · WhatsApp QR code", 'Scan to <span class="brand">chat.</span>', "Make a QR code that opens a WhatsApp chat with you. Print it on your counter, menu or flyer.", tool, buttons=False, flip=True)
    body += sec(2, "Print tips", head("Make it <em>easy to scan.</em>", small=True) + bento([
        ("", "qr", "Size", "Print at least 2 × 2 cm, larger for posters."),
        ("w2 ink", "spark", "Say what happens", "Add a line like “Scan to chat on WhatsApp”."),
        ("", "check", "Test it", "Scan with your own phone before printing."),
    ]), "Tips")
    body += band('Scans become chats. <em>We help you answer.</em>', "Telixo gives your whole team one WhatsApp inbox.", n=3)
    return body


# ---------------------------------------------------------------- legal
def legal(p, title, word, sections, intro):
    p.section = "company"
    toc = "".join(f'<a href="#s-{i}">{t}</a>' for i, (t, _) in enumerate(sections, 1))
    secs = "".join(f'<section id="s-{i}"><h2>{t}</h2><p>{d}</p></section>' for i, (t, d) in enumerate(sections, 1))
    body = hero_word(f"Legal · {title}", word, title, intro, buttons=False)
    body += f'<div class="doc"><nav class="doc-toc" aria-label="On this page" data-toc>{toc}</nav><div class="doc-body">{secs}</div></div>'
    return body


def privacy(p):
    return legal(p, "Privacy Policy", "Privacy", [("Current policy", '<span class="todo">Paste the current Privacy Policy from telixo.co here, unchanged.</span>'), ("Contact", '<span class="todo">Privacy contact email.</span>')],
                 '<span class="todo">Last updated date.</span>')


def terms(p):
    return legal(p, "Terms and Conditions", "Terms", [("Current terms", '<span class="todo">Paste the current Terms and Conditions from telixo.co here, unchanged.</span>'), ("Contact", '<span class="todo">Legal contact email.</span>')],
                 '<span class="todo">Last updated date.</span>')


def refund(p):
    return legal(p, "Refund and Cancellation Policy", "Refunds", [
        ("Who this applies to", '<span class="todo">Which plans and payments this policy covers.</span>'),
        ("Cancelling a subscription", '<span class="todo">How to cancel and when it takes effect.</span>'),
        ("Refunds", '<span class="todo">When refunds are given, and how they are calculated.</span>'),
        ("How to request a refund", '<span class="todo">Where to write and what to include.</span>'),
        ("Timelines", '<span class="todo">How long refunds take to reach the customer.</span>'),
        ("Contact", '<span class="todo">Billing contact email.</span>'),
    ], 'New page requested by the brief. <span class="todo">The policy text must come from Telixo; nothing here is final.</span>')


def not_found(p):
    return f'''<section class="ph ph-center nf" id="top">
  <p class="mono eyebrow">Error 404</p>
  <p class="ph-word" data-fit data-kin aria-hidden="true">404</p>
  <h1 class="h3">This chat went quiet.</h1>
  <p class="lede wide">The page you were looking for isn't here. Try one of these instead.</p>
  <div class="btn-row" style="justify-content:center"><a class="pill-btn brand" href="{p.u('')}">Go to the homepage</a><a class="pill-btn ghost" href="{p.u('faq/')}">Read the FAQ</a><a class="pill-btn ghost" href="{p.u('contact/')}">Contact us</a></div>
</section>'''


def pages():
    spec = [
        ("integrations", integrations, "Integrations · Telixo", "Telixo integrations: Twilio for calling and Odoo for contacts, with a request form for more.", ""),
        ("integrations/twilio", twilio, "Twilio Integration · Telixo", "Call customers through Twilio from their WhatsApp chat in Telixo.", ""),
        ("integrations/odoo", odoo_int, "Odoo Integration · Telixo", "Keep contacts in sync between Telixo and Odoo.", ""),
        ("pricing", pricing, "Pricing · Telixo", "Telixo plans for Indian businesses, with a plan comparison and pricing FAQ.", ""),
        ("faq", faq_page, "FAQ · Telixo", "Answers about Telixo, the WhatsApp Business API, pricing and data security.", ""),
        ("contact", contact, "Contact · Telixo", "Talk to the Telixo team by form or on WhatsApp.", ""),
        ("about", about, "About · Telixo", "Telixo helps Indian businesses talk to customers on WhatsApp as a team. Built by Digipine Infotech LLP.", ""),
        ("careers", careers, "Careers · Telixo", "Work with the team building Telixo.", ""),
        ("security", security, "Security · Telixo", "How Telixo protects customer data on WhatsApp.", ""),
        ("blog", blog, "Blog · Telixo", "Ideas for selling and supporting customers on WhatsApp.", ""),
        ("guides", guides, "Guides · Telixo", "Step-by-step WhatsApp guides for Indian businesses.", ""),
        ("customers", customers, "Customer Stories · Telixo", "How businesses use Telixo.", ""),
        ("tools", tools, "Free WhatsApp Tools · Telixo", "Free WhatsApp link and QR code generators.", ""),
        ("tools/whatsapp-link", wa_link, "WhatsApp Link Generator · Telixo", "Create a free wa.me WhatsApp link with a pre-filled message.", ""),
        ("tools/qr-code", qr, "WhatsApp QR Code Generator · Telixo", "Create a free QR code that opens a WhatsApp chat.", "assets/vendor/qrcode.js"),
        ("privacy-policy", privacy, "Privacy Policy · Telixo", "Telixo privacy policy.", ""),
        ("terms", terms, "Terms and Conditions · Telixo", "Telixo terms and conditions.", ""),
        ("refund-policy", refund, "Refund and Cancellation Policy · Telixo", "Telixo refund and cancellation policy.", ""),
    ]
    out = []
    for path, fn, title, desc, extra_js in spec:
        p = Page(path, title, desc, "", body_class="page", js=(extra_js,) if extra_js else ())
        p.body = fn(p)
        out.append(p)
    nf = Page("", "Page not found · Telixo", "This page does not exist.", "", body_class="page")
    nf.outfile = "404.html"
    nf.body = not_found(nf)
    out.append(nf)
    return out
