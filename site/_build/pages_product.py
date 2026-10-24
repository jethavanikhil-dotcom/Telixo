"""Product pages (brief §5.2): one page per feature."""
from lib import Page, icon
from comp import (hero_split, hero_word, hero_center, sec, head, rows, steps, related, quote, band, chat,
                  win, ill_note, bento, stack, timeline, compare, flips, faq)

ALL = ["product/inbox/", "product/campaigns/", "product/contacts/", "product/team/", "product/calling/", "product/odoo/"]


def rel(p, me):
    return [k for k in ALL if k != me][:3] if me != "product/inbox/" else ["product/campaigns/", "product/contacts/", "product/team/"]


def av(i, color):
    return f'<span class="av sm" style="--a:{color}">{i}</span>'


# ---------------------------------------------------------------- Shared Inbox
def inbox(p):
    p.section = "product"
    demo = f'''<div class="win wd-assign" data-widget="assign">
  <div class="win-top"><i></i><i></i><i></i><span class="mono">Shared inbox</span><span class="chip-s ok" data-assign-status>Unassigned</span></div>
  <div class="as-body">
    <aside class="as-list">
      <div class="as-row is-on"><span class="av" style="--a:#252525">VS</span><div><b>Vikram Shah</b><p>Is the 2BHK still available?</p></div><span class="as-owner" data-assign-owner>—</span></div>
      <div class="as-row"><span class="av" style="--a:#8FE3C5">AN</span><div><b>Arjun Nair</b><p>Table for 6 tonight?</p></div><span class="as-owner">Rohit</span></div>
      <div class="as-row"><span class="av" style="--a:#0E8A5F">NK</span><div><b>Neha Kapoor</b><p>Thanks, order received!</p></div><span class="as-owner">Meera</span></div>
    </aside>
    <div class="as-chat">
      <div class="as-msgs" data-assign-msgs>
        <p class="m in">Hi, is the 2BHK in Baner still available?</p>
        <p class="m in">Can I see it this weekend?</p>
      </div>
      <div class="as-pick">
        <span class="mono">Assign this chat</span>
        <div class="as-people">
          <button type="button" data-person="Priya" data-role="Sales">{av("P", "#20C28B")}Priya</button>
          <button type="button" data-person="Rohit" data-role="Support">{av("R", "#252525")}Rohit</button>
          <button type="button" data-person="Meera" data-role="Front desk">{av("M", "#0E8A5F")}Meera</button>
        </div>
      </div>
    </div>
  </div>
</div>{ill_note("Try it: assign the chat. Example data.")}'''

    note = win("Internal note", '''<p class="m in">Do you deliver to Kothrud?</p>
<p class="m note"><span class="mono">Internal note · Rohit</span>@Priya we do, Tuesdays and Fridays. Can you confirm?</p>
<p class="m out">Yes! We deliver to Kothrud on Tuesdays and Fridays.</p>''')
    status = win("Chat status", '''<div class="st-list">
<div class="st-row"><b>Ananya Rao</b><span class="chip-s">Open</span></div>
<div class="st-row"><b>Vikram Shah</b><span class="chip-s" style="background:#FFF3C4">Waiting on customer</span></div>
<div class="st-row"><b>Neha Kapoor</b><span class="chip-s ok">Resolved ✓</span></div>
<div class="st-row"><b>Arjun Nair</b><span class="chip-s">Open</span></div></div>''')
    one = win("One number", '''<div class="one-num"><span class="one-phone">{wa}<b>+91 98••• ••000</b><small class="mono">Business number</small></span>
<div class="one-team">{a}{b}{c}{d}</div></div>'''.format(wa=icon("wa"), a=av("K", "#252525"), b=av("P", "#20C28B"), c=av("R", "#0E8A5F"), d=av("M", "#8FE3C5")))

    body = hero_split("Product · Shared Inbox", 'One number. <span class="brand">Every</span> teammate.',
                      "Every WhatsApp chat on your business number lands in one inbox your whole team works from. Assign each chat, leave notes, and see who is on it.", demo)
    body += sec(2, "Why it matters", '<p class="scrub" data-scrub="inbox,assigned">Stop passing one phone around. Put every customer chat in one inbox, assigned to the right person, with the history in view.</p>', "Shared Inbox")
    body += sec(3, "What you get", head("Built for a team, <em>not one phone.</em>", "Three things change the day you move your WhatsApp number into Telixo.") + rows([
        ("01 · Assignment", "Every chat has an owner", "Assign a conversation to a teammate in one click, so a customer gets one clear reply instead of three or none.", status),
        ("02 · Internal notes", "Talk about it, privately", "Leave notes and mention teammates inside the chat. Customers never see them.", note),
        ("03 · One number", "Your whole team, one number", "Customers keep messaging the number they already know. Your team answers it from their own logins.", one),
    ]), "Benefits")
    body += sec(4, "How it works", head("Live in <em>four steps.</em>", small=True) + steps([
        ("Connect", "Connect your WhatsApp Business number to Telixo."),
        ("Invite", "Add your teammates and choose their roles."),
        ("Assign", "Route each new chat to the right person."),
        ("Resolve", "Reply, add notes and mark chats resolved."),
    ]), "Four steps")
    body += sec(5, "Related features", head("Works best <em>with.</em>", small=True) + related(p, rel(p, "product/inbox/")), "Product")
    body += sec(6, "Customer story", quote("retail"), "Placeholder")
    body += band('One inbox for <em>your whole team.</em>', "Move your WhatsApp number into Telixo and start replying together.", n=7)
    return body


# ---------------------------------------------------------------- Campaigns
def campaigns(p):
    p.section = "product"
    builder = f'''<div class="win wd-camp" data-widget="campaign">
  <div class="win-top"><i></i><i></i><i></i><span class="mono">New campaign</span><span class="chip-s ok">Approved template</span></div>
  <div class="cp-body">
    <div class="cp-form">
      <span class="mono">Audience · opted-in contacts only</span>
      <div class="cp-opts" data-cp="aud">
        <button type="button" aria-pressed="true" data-v="Repeat customers">Repeat customers</button>
        <button type="button" aria-pressed="false" data-v="New leads">New leads</button>
        <button type="button" aria-pressed="false" data-v="Everyone opted in">Everyone opted in</button>
      </div>
      <span class="mono">Template</span>
      <div class="cp-opts" data-cp="tpl">
        <button type="button" aria-pressed="true" data-v="offer">Offer</button>
        <button type="button" aria-pressed="false" data-v="reminder">Reminder</button>
        <button type="button" aria-pressed="false" data-v="update">Update</button>
      </div>
      <span class="mono">Schedule</span>
      <div class="cp-opts" data-cp="when">
        <button type="button" aria-pressed="true" data-v="Saturday, 10:00">Sat 10:00</button>
        <button type="button" aria-pressed="false" data-v="Now">Send now</button>
      </div>
    </div>
    <div class="cp-phone">
      <div class="cm in tpl cp-msg" data-cp-msg>Hi Ananya, this Saturday get a free hair spa with any haircut. Reply BOOK to reserve a slot.<div class="btns"><span>Book now</span><span>Stop promotions</span></div></div>
      <p class="mono cp-meta" data-cp-meta>To: Repeat customers · Saturday, 10:00</p>
    </div>
  </div>
</div>{ill_note("Try it: change the audience and template. Example data.")}'''

    rules = '''<ul class="rules">
<li>{c}<div><b>Only message people who opted in</b><p>Collect consent before you add someone to a campaign.</p></div></li>
<li>{c}<div><b>Use approved message templates</b><p>WhatsApp requires approved templates for business-initiated messages.</p></div></li>
<li>{c}<div><b>Make it easy to stop</b><p>Add a clear opt-out, and respect it.</p></div></li>
<li>{c}<div><b>Keep it relevant</b><p>People who report or block your messages can get your number limited.</p></div></li>
</ul>'''.format(c=f'<span class="rule-ic">{icon("check")}</span>')

    def art(kind):
        if kind == 1:
            return win("Audience", '<div class="seg"><span class="chip-s ok">Tag: Repeat customer</span><span class="chip-s ok">Opted in</span><span class="chip-s">City: Pune</span><span class="chip-s">+ Add filter</span></div>')
        if kind == 2:
            return '<div class="cm in tpl" style="max-width:320px;background:#fff">Hi {{name}}, your appointment is on {{date}} at {{time}}. Reply 1 to confirm or 2 to reschedule.<div class="btns"><span>Confirm</span><span>Reschedule</span></div></div>'
        if kind == 3:
            return win("Schedule", '<div class="cal">' + "".join(f'<span class="{"on" if d == 6 else ""}">{n}</span>' for d, n in enumerate(["M", "T", "W", "T", "F", "S", "S"])) + '</div><p class="mono" style="color:var(--muted)">Saturday · 10:00</p>')
        return win("Replies", '<div class="st-list"><div class="st-row"><b>Ananya Rao</b><span class="chip-s ok">Replied: BOOK</span></div><div class="st-row"><b>Neha Kapoor</b><span class="chip-s">Delivered</span></div><div class="st-row"><b>Arjun Nair</b><span class="chip-s ok">Replied: BOOK</span></div></div>')

    body = hero_split("Product · Campaigns and Broadcasts", 'Send offers <em>people</em> <span class="brand">want.</span>',
                      "Pick an audience of opted-in contacts, choose an approved template and schedule it. Replies come back to the shared inbox.", builder, flip=True)
    body += sec(2, "From idea to inbox", head("Four moves, <em>one campaign.</em>", "Each campaign follows the same simple path.") + stack([
        ("Choose who", "Group opted-in contacts by tag, segment or history.", art(1)),
        ("Pick a template", "Use a WhatsApp-approved template with the customer's details filled in.", art(2)),
        ("Schedule it", "Send now or pick a time that suits your customers.", art(3)),
        ("Reply together", "Responses arrive in the shared inbox, where your team picks them up.", art(4)),
    ]), "Campaign flow")
    body += sec(3, "Stay on the right side", '<div class="split-2">' + head("Good habits <em>for broadcasts.</em>", "WhatsApp protects its users. These habits keep your number in good standing.", small=True) + f'<div class="wrap">{rules}</div></div>', "WhatsApp rules")
    body += sec(4, "Related features", head("Pairs <em>well with.</em>", small=True) + related(p, ["product/contacts/", "product/inbox/", "product/odoo/"]), "Product")
    body += sec(5, "Customer story", quote("salon"), "Placeholder")
    body += band('Your next campaign <em>starts here.</em>', "Send offers and reminders to the customers who asked for them.", n=6)
    return body


# ---------------------------------------------------------------- Contacts
def contacts(p):
    p.section = "product"
    rows_ = [
        ("AR", "#20C28B", "Ananya Rao", "+91 98••• ••421", ["repeat", "haircut"], "Priya"),
        ("VS", "#252525", "Vikram Shah", "+91 97••• ••560", ["lead", "buyer"], "Priya"),
        ("NK", "#0E8A5F", "Neha Kapoor", "+91 99••• ••108", ["repeat", "vip"], "Rohit"),
        ("AN", "#8FE3C5", "Arjun Nair", "+91 90••• ••233", ["lead"], "Meera"),
        ("SQ", "#6E6E73", "Sana Qureshi", "+91 98••• ••774", ["vip", "haircut"], "Rohit"),
    ]
    trs = "".join(f'<div class="tr" data-item data-tags="{" ".join(tags)}"><span>{av(i, c)}{n}</span><span class="mono">{ph}</span><span>{"".join(f"<i class=tg>{t}</i>" for t in tags)}</span><span>{o}</span></div>' for i, c, n, ph, tags, o in rows_)
    table = f'''<div class="win" data-filter>
  <div class="win-top"><i></i><i></i><i></i><span class="mono">Contacts</span><span class="chip-s ok">Synced with Odoo</span></div>
  <div class="win-body">
    <div class="fchips">
      <button type="button" data-cat="all" aria-pressed="true">All</button>
      <button type="button" data-cat="repeat" aria-pressed="false">Repeat</button>
      <button type="button" data-cat="lead" aria-pressed="false">Lead</button>
      <button type="button" data-cat="vip" aria-pressed="false">VIP</button>
      <button type="button" data-cat="haircut" aria-pressed="false">Haircut</button>
    </div>
    <div class="sc-table ct-table"><div class="tr th mono"><span>Name</span><span>Phone</span><span>Tags</span><span>Owner</span></div>{trs}</div>
  </div>
</div>{ill_note("Try it: filter by tag. Example data.")}'''

    profile = f'''<div class="anat" data-draw>
  <svg class="anat-lines" viewBox="0 0 1000 560" preserveAspectRatio="none" aria-hidden="true">
    <path d="M330 120 C 230 120, 200 70, 120 70" /><path d="M330 250 C 230 250, 200 220, 120 220" />
    <path d="M670 160 C 770 160, 800 110, 880 110" /><path d="M670 330 C 770 330, 800 330, 880 330" /><path d="M500 470 C 500 510, 500 520, 500 530" />
  </svg>
  <div class="anat-card">
    <span class="av lg" style="--a:#20C28B">AR</span><b>Ananya Rao</b><span class="mono" style="color:var(--muted)">+91 98••• ••421</span>
    <div class="s-tags"><span>Repeat customer</span><span>Haircut</span></div>
    <div class="anat-hist"><span class="mono">History</span><p>WhatsApp · Booked Saturday 4:00</p><p>Call · 2 min</p><p>Campaign · Saturday offer</p></div>
  </div>
  <span class="anat-l l1 mono">Name and number</span><span class="anat-l l2 mono">Tags and segments</span>
  <span class="anat-l r1 mono">Owner on your team</span><span class="anat-l r2 mono">Chat and call history</span><span class="anat-l b1 mono">Synced with Odoo</span>
</div>'''

    body = hero_split("Product · Contacts and CRM", 'Know every <span class="brand">customer.</span>',
                      "Contacts, tags and chat history in one place. Group customers for your next campaign and keep the details in sync with Odoo.", table)
    body += sec(2, "Anatomy of a contact", head("Everything about a customer, <em>in one card.</em>", "Each contact keeps what your team needs before replying.") + f'<div class="wrap" style="margin-top:clamp(32px,4vw,56px)">{profile}</div>', "Contact profile")
    body += sec(3, "What you can do", head("Organise, <em>then act.</em>", small=True) + bento([
        ("w2 ink", "tag", "Tags that mean something", "Mark customers as repeat, lead, VIP or anything your business uses."),
        ("", "target", "Segments", "Group contacts by tag for a campaign or a follow-up list."),
        ("", "clock", "Full history", "See every chat, call and campaign for a customer."),
        ("", "contacts", "Import contacts", "Bring in your existing customer list."),
        ("green", "sync", "Odoo sync", "Keep contact details matching in Telixo and Odoo."),
        ("w2", "team", "Owners", "Give each customer an owner, so follow-ups never slip."),
    ]), "Features")
    body += sec(4, "Related features", head("Use contacts <em>everywhere.</em>", small=True) + related(p, ["product/campaigns/", "product/odoo/", "product/inbox/"]), "Product")
    body += sec(5, "Customer story", quote("real estate"), "Placeholder")
    body += band('Every customer, <em>in one place.</em>', "Bring your contacts into Telixo and start segmenting.", n=6)
    return body


# ---------------------------------------------------------------- Team and roles
def team(p):
    p.section = "product"
    perms = [
        ("See all chats", "admin manager"), ("See assigned chats", "admin manager agent"),
        ("Reply to customers", "admin manager agent"), ("Assign chats", "admin manager"),
        ("Send campaigns", "admin manager"), ("Export contacts", "admin"), ("Manage team and billing", "admin"),
    ]
    rows_ = "".join(f'<div class="perm" data-roles="{r}">{t}<i class="tog"></i></div>' for t, r in perms)
    matrix = f'''<div class="win wd-roles" data-widget="roles" data-tab-scope>
  <div class="win-top"><i></i><i></i><i></i><span class="mono">Roles</span><span class="chip-s ok">Example roles</span></div>
  <div class="win-body">
    <div class="tabs-x" role="tablist" aria-label="Role" data-tabs><span class="ind"></span>
      <button type="button" role="tab" aria-selected="false" data-tab="admin">Admin</button>
      <button type="button" role="tab" aria-selected="false" data-tab="manager">Manager</button>
      <button type="button" role="tab" aria-selected="true" data-tab="agent">Agent</button>
    </div>
    <div class="sc-perms" style="background:#fff;border-radius:16px;box-shadow:0 0 0 1px var(--line)">{rows_}</div>
  </div>
</div>{ill_note("Try it: switch roles. Role names and permissions are examples.")}'''

    body = hero_split("Product · Team and Roles", 'The right access <em>for</em> <span class="brand">everyone.</span>',
                      "Invite your team to one workspace and decide what each person can see and do. Owners keep control; agents get what they need to reply.", matrix, flip=True)
    body += sec(2, "A day on the inbox", head("Handovers <em>without the chaos.</em>", "Roles and assignment keep a busy day organised. Example day at a salon.") + timeline([
        ("09:00 · Opening", "Front desk picks up overnight chats", "Meera sees every unassigned chat from the night and assigns bookings to stylists."),
        ("12:30 · Lunch rush", "Sales handles the offers", "Priya answers replies to the weekend campaign. Agents see only the chats assigned to them."),
        ("16:00 · Shift change", "Handover in one click", "Rohit's open chats move to the evening team, with notes, so nobody repeats a question."),
        ("20:00 · Closing", "The owner checks the day", "Karan sees what is open, who handled what, and which chats are resolved."),
    ]), "Example day")
    body += sec(3, "Why roles matter", head("Control, <em>without slowing anyone down.</em>", small=True) + bento([
        ("w2 green", "shield", "Customer data stays protected", "Limit who can export contacts or see every chat."),
        ("", "team", "Clear ownership", "Every chat and customer has a named owner."),
        ("", "briefcase", "Easy onboarding", "Add a new teammate with the right role in minutes."),
        ("w2 ink", "lock", "People leave, data stays", "Chats live in Telixo, not on a staff member's phone."),
    ]), "Benefits")
    body += sec(4, "Related features", head("Built for <em>teams.</em>", small=True) + related(p, ["product/inbox/", "product/contacts/", "product/calling/"]), "Product")
    body += sec(5, "Customer story", quote("restaurant"), "Placeholder")
    body += band('Give your team <em>the right keys.</em>', "Invite your team and set their roles today.", n=6)
    return body


# ---------------------------------------------------------------- Calling
def calling(p):
    p.section = "product"
    call = f'''<div class="win wd-call" data-widget="call">
  <div class="win-top"><i></i><i></i><i></i><span class="mono">Vikram Shah · WhatsApp</span><span class="chip-s ok">Twilio</span></div>
  <div class="win-body">
    <p class="m in">Can we see the flat on Sunday?</p>
    <p class="m out">Sure! Let me call you to fix a time.</p>
    <div class="call-box" data-call-state="idle">
      <span class="call-dot"></span>
      <div><b data-call-label>Call Vikram Shah</b><p class="mono" data-call-sub>Through Twilio · from this chat</p></div>
      <div class="call-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <button type="button" class="call-btn" data-call-btn>Call</button>
    </div>
    <p class="m sys-log" data-call-log hidden>☏ Call · <span data-call-dur>00:00</span> · logged to this chat</p>
  </div>
</div>{ill_note("Try it: place the call. Example data.")}'''

    body = hero_split("Product · Calling with Twilio", 'Chat first. <em>Call</em> <span class="brand">when it helps.</span>',
                      "When a chat needs a conversation, call the customer through Telixo's Twilio integration, from the same place you chat with them.", call)
    body += sec(2, "Before and after", head("Drag to see <em>the difference.</em>", "Drag the handle to compare.") + compare(
        "Calls from personal phones", ["No record of the call", "Customer gets a stranger's number", "Notes live in someone's head"],
        "Calls from the chat", ["Call from the customer's chat", "Your business identity, every time", "The call sits on the chat timeline"]), "Compare")
    body += sec(3, "One timeline", head("Chats and calls, <em>in order.</em>", "Every touchpoint with a customer stays in one place. Example timeline.") + timeline([
        ("10:02 · WhatsApp", "A question comes in", "Vikram asks if the 2BHK is still available."),
        ("10:05 · Assigned", "Priya picks it up", "The chat is assigned to Priya from Sales."),
        ("10:09 · Call", "Priya calls through Twilio", "A short call to understand what Vikram needs. The call is logged."),
        ("10:15 · WhatsApp", "Visit confirmed", "Priya sends the address and confirms Sunday at 11:00."),
    ]), "Example timeline")
    body += sec(4, "Questions", '<div class="wrap" style="margin-top:clamp(28px,4vw,48px)">' + faq([
        ("Do I need my own Twilio account?", '<span class="todo">Confirm with the product team: whether customers connect their own Twilio account or use one Telixo provides.</span>'),
        ("How are calls billed?", '<span class="todo">Confirm how Twilio calling charges are billed.</span>'),
        ("Are calls recorded?", '<span class="todo">Confirm whether call recording is available, and how consent is handled.</span>'),
    ]) + "</div>", "Calling FAQ")
    body += sec(5, "Related features", head("Better <em>together.</em>", small=True) + related(p, ["product/inbox/", "product/contacts/", "product/team/"]), "Product")
    body += band('Call without <em>switching apps.</em>', "Connect Twilio and call customers from their chat.", n=6)
    return body


# ---------------------------------------------------------------- Odoo
def odoo(p):
    p.section = "product"
    sync = f'''<div class="wd-sync" data-widget="sync">
  <div class="sy-card"><p class="mono">Telixo</p>
    <label class="field-s"><span class="mono" style="color:var(--muted)">Name</span><input id="sy-name" value="Ananya Rao" data-sy="name"></label>
    <label class="field-s"><span class="mono" style="color:var(--muted)">Phone</span><input id="sy-phone" value="+91 98765 43421" data-sy="phone"></label>
    <label class="field-s"><span class="mono" style="color:var(--muted)">Tag</span><input id="sy-tag" value="Repeat customer" data-sy="tag"></label>
  </div>
  <div class="sy-mid" aria-hidden="true"><svg viewBox="0 0 120 40"><path d="M2 20 H118" class="sy-flow"/></svg><span class="sy-ic">{icon("sync")}</span><span class="mono sy-state" data-sy-state>In sync</span></div>
  <div class="sy-card dark"><p class="mono">Odoo</p>
    <div class="sy-out"><span class="mono">Name</span><b data-sy-out="name">Ananya Rao</b></div>
    <div class="sy-out"><span class="mono">Phone</span><b data-sy-out="phone">+91 98765 43421</b></div>
    <div class="sy-out"><span class="mono">Tag</span><b data-sy-out="tag">Repeat customer</b></div>
  </div>
</div>{ill_note("Try it: edit a field in Telixo. Example data.")}'''

    mapping = '''<div class="map" data-draw>
  <div class="map-col"><p class="mono">Telixo contact</p><span>Name</span><span>Phone</span><span>Email</span><span>Tags</span></div>
  <svg class="map-lines" viewBox="0 0 200 240" preserveAspectRatio="none" aria-hidden="true">
    <path d="M0 62 C 100 62, 100 62, 200 62"/><path d="M0 118 C 100 118, 100 118, 200 118"/><path d="M0 174 C 100 174, 100 174, 200 174"/><path d="M0 230 C 100 230, 100 230, 200 230"/>
  </svg>
  <div class="map-col dark"><p class="mono">Odoo contact</p><span>Name</span><span>Phone</span><span>Email</span><span>Tags</span></div>
</div>'''

    body = hero_center("Product · Odoo Sync", 'Contacts that match <span class="brand">everywhere.</span>',
                       "Telixo keeps contacts in sync with Odoo, so your team works from the same customer details in both tools.",
                       f'<div class="wrap" style="width:100%;margin-top:clamp(20px,3vw,40px)" data-reveal="scale">{sync}</div>')
    body += sec(2, "What lines up", head("Field to field, <em>kept in step.</em>", '<span class="todo">Confirm the exact fields that sync and the sync direction with the product team.</span> Example mapping below.') + f'<div class="wrap" style="margin-top:clamp(32px,4vw,56px)">{mapping}</div>', "Field mapping")
    body += sec(3, "Set up", head("Connect Odoo <em>in three steps.</em>", '<span class="todo">Confirm the setup steps with the product team.</span>', small=True) + steps([
        ("Connect", "Link your Odoo database to Telixo."),
        ("Choose", "Pick which contacts and fields to keep in sync."),
        ("Work", "Your team sees the same customer details in both tools."),
    ]), "Setup")
    body += sec(4, "Related features", head("Built around <em>your contacts.</em>", small=True) + related(p, ["product/contacts/", "product/campaigns/", "product/inbox/"]), "Product")
    body += sec(5, "Integration", f'<div class="wrap" style="margin-top:clamp(28px,4vw,48px)"><a class="int-link" href="{p.u("integrations/odoo/")}" data-cursor="Open"><span class="mono">Integration details</span><b>Telixo + Odoo</b>{icon("arrow")}</a></div>', "Integrations")
    body += band('Keep Odoo and WhatsApp <em>in step.</em>', "Connect Odoo and stop copying customer details by hand.", n=6)
    return body


def pages():
    out = []
    for path, fn, title, desc in [
        ("product/inbox", inbox, "Shared Inbox · Telixo", "One WhatsApp number, answered by your whole team. Assign chats, leave internal notes and see who is on it."),
        ("product/campaigns", campaigns, "Campaigns and Broadcasts · Telixo", "Send offers and reminders on WhatsApp to opted-in contacts with approved templates."),
        ("product/contacts", contacts, "Contacts and CRM · Telixo", "Contacts, tags and chat history in one place, with segments and Odoo sync."),
        ("product/team", team, "Team and Roles · Telixo", "Invite your team and control who can see and do what in your WhatsApp inbox."),
        ("product/calling", calling, "Calling with Twilio · Telixo", "Call customers through Twilio from the same place you chat with them on WhatsApp."),
        ("product/odoo", odoo, "Odoo Sync · Telixo", "Keep contacts in sync between Telixo and Odoo."),
    ]:
        p = Page(path, title, desc, "", body_class="page")
        p.body = fn(p)
        out.append(p)
    return out
