"""Solutions pages (brief §5.3): industry and team landing pages."""
from lib import Page, icon, INDUSTRIES, TEAMS
from comp import (hero_split, hero_word, hero_center, sec, head, flips, chat, quote, band, hscroll, stack,
                  timeline, bento, marquee, win, ill_note, related, compare)


def workflow(name, sub, initials, msgs, title, lede, n):
    return sec(n, "Mini workflow", f'''<div class="wf2">
  <div class="wf2-copy">{head(title, lede)}</div>
  <div class="wf2-phone" data-reveal="scale">{chat(name, sub, msgs, initials)}{ill_note("Example conversation.")}</div>
</div>''', "Example")


def problems(items, n, title="Three problems, <em>three fixes.</em>"):
    return sec(n, "Problems we solve", head(title, "Tap a card to see how Telixo handles it.") + flips(items), "Problem → fix")


# ---------------------------------------------------------------- industries
def retail(p):
    tracker = '''<div class="win"><div class="win-top"><i></i><i></i><i></i><span class="mono">Order #TX-2041</span><span class="chip-s ok">Updates on WhatsApp</span></div>
<div class="win-body"><div class="trk" data-trk>
<div class="trk-step on"><i></i><b>Confirmed</b><small class="mono">Mon 10:12</small></div>
<div class="trk-step on"><i></i><b>Packed</b><small class="mono">Mon 16:40</small></div>
<div class="trk-step"><i></i><b>Shipped</b><small class="mono">Tue</small></div>
<div class="trk-step"><i></i><b>Delivered</b><small class="mono">Wed</small></div>
</div><p class="m out" style="max-width:none">Your order is packed and leaves tomorrow morning. Reply here with any questions.</p></div></div>'''
    body = hero_split("Solutions · Retail", 'Every order, <span class="brand">every question,</span> one chat.',
                      "Order updates, product questions and repeat offers on WhatsApp, answered by your whole team from one inbox.", tracker + ill_note())
    body += problems([
        ("“Where is my order?”", "Customers message for updates and staff search through phones for answers.", "Updates in the same chat", "Send order updates on WhatsApp and answer follow-ups from the shared inbox."),
        ("Lost repeat buyers", "Happy customers never hear from you again after their first order.", "Offers to opted-in buyers", "Tag repeat customers and send them offers they agreed to receive."),
        ("Questions at peak hours", "Sale days bring more chats than one phone can handle.", "The whole team replies", "Assign chats across your team so nobody waits."),
    ], 2)
    body += sec(3, "Order journey", head("From cart to <em>doorstep.</em>", "Where WhatsApp helps along the way.") + hscroll([
        ("Order placed", "Confirm the order on WhatsApp the moment it lands."),
        ("Packed", "Let the customer know it is on its way."),
        ("Questions", "Answer size, colour and delivery questions in the same chat."),
        ("Delivered", "Check everything arrived as expected."),
        ("Come back", "Send a new-arrivals offer to buyers who opted in."),
    ]), "Scroll sideways")
    body += workflow("Kiran's Boutique", "Business account", "KB", [
        ("tpl", "Hi Ananya, your order #TX-2041 is confirmed. We will message you when it ships.", "10:12"),
        ("in", "Thanks! Can I change the size to M?", "10:20"),
        ("sys", "Assigned to Priya", ""),
        ("out", "Done, size M it is. Same delivery date.", "10:23"),
        ("tpl", "Your order has shipped and arrives Wednesday.", "Tue"),
    ], "Order updates <em>that answer back.</em>", "An example retail flow: confirm, change, ship.", 4)
    body += sec(5, "Customer story", quote("retail"), "Placeholder")
    body += band('Sell more <em>on WhatsApp.</em>', "Bring order updates and customer questions into one inbox.", n=6)
    return body


def real_estate(p):
    listing = '''<div class="lst" data-reveal="scale"><div class="lst-img"><span class="chip-s ok">Ready to move</span></div>
<div class="lst-body"><b>2BHK · Baner, Pune</b><p class="mono" style="color:var(--muted)">Example listing</p>
<div class="lst-row"><span class="chip-s">Site visit · Sun 11:00</span><span class="chip-s ok">Lead: Vikram Shah</span></div></div></div>'''
    art = lambda title, chips: win(title, '<div class="seg">' + "".join(f'<span class="chip-s{" ok" if i == 0 else ""}">{c}</span>' for i, c in enumerate(chips)) + '</div>')  # noqa: E731
    body = hero_split("Solutions · Real Estate", 'Every enquiry <em>to a</em> <span class="brand">site visit.</span>',
                      "Listing enquiries, site visits and follow-ups on WhatsApp, with every lead assigned to the right agent.", listing + ill_note(), flip=True)
    body += problems([
        ("Leads go cold", "Enquiries arrive at night and on weekends, and nobody follows up in time.", "Every lead has an owner", "New enquiries are assigned to an agent, so someone always picks them up."),
        ("Agents leave with contacts", "Buyer chats live on personal phones and walk out with the agent.", "Chats stay with the business", "Conversations live in Telixo, not on someone's phone."),
        ("Site visits get missed", "Visit times get lost in long chats.", "Reminders before the visit", "Send a reminder with the address before every visit."),
    ], 2)
    body += sec(3, "Lead lifecycle", head("From enquiry <em>to keys.</em>", "Four stages most leads go through.") + stack([
        ("Enquiry", "A buyer messages about a listing from a portal or ad.", art("New lead", ["Source: listing", "2BHK · Baner", "Unassigned"])),
        ("Qualify", "The agent asks about budget, timing and location.", art("Qualified", ["Assigned · Priya", "Wants: 2BHK", "Moving in 3 months"])),
        ("Site visit", "Visit booked and confirmed with a reminder.", art("Visit", ["Sun 11:00", "Reminder sent", "Address shared"])),
        ("Follow-up", "Answer questions and keep the conversation going.", art("Follow-up", ["Call logged", "Documents shared", "Owner: Priya"])),
    ]), "Stages")
    body += workflow("Skyline Realty", "Business account", "SR", [
        ("in", "Is the 2BHK in Baner still available?", "21:40"),
        ("sys", "Assigned to Priya", ""),
        ("out", "Yes it is! Would Sunday 11:00 work for a visit?", "09:05"),
        ("in", "Sunday works.", "09:12"),
        ("tpl", "Reminder: your site visit is tomorrow at 11:00. Location: Baner, Pune.", "Sat"),
    ], "Night-time lead, <em>morning visit.</em>", "An example real estate flow.", 4)
    body += sec(5, "Customer story", quote("real estate"), "Placeholder")
    body += band('Close more <em>site visits.</em>', "Give every enquiry an owner and a fast reply.", n=6)
    return body


def healthcare(p):
    appt = '''<div class="appt" data-reveal="scale"><span class="mono" style="color:var(--brand-deep)">Appointment</span><b>Dental check-up</b>
<p>Thursday · 10:30</p><div class="appt-btns"><span>Confirm</span><span>Reschedule</span></div></div>'''
    body = hero_center("Solutions · Healthcare", 'Appointments, <span class="brand">answered.</span>',
                       "Booking requests, reminders and follow-ups on WhatsApp, handled by your front desk from one shared inbox.",
                       f'<div style="margin-top:clamp(20px,3vw,40px)">{appt}{ill_note()}</div>')
    body += problems([
        ("Phones ring all day", "The front desk juggles calls, walk-ins and messages at once.", "Bookings by message", "Patients book and reschedule on WhatsApp; the team replies when free."),
        ("Missed appointments", "Patients forget, and the slot goes empty.", "Reminders that ask for a reply", "Send a reminder with Confirm and Reschedule options."),
        ("Messages on one phone", "Only one person can answer, and the history is hard to find.", "One inbox for the desk", "Everyone at the front desk works from the same inbox."),
    ], 2)
    body += sec(3, "Patient journey", head("From booking <em>to follow-up.</em>", "An example journey. Share only what patients agreed to receive on WhatsApp.") + timeline([
        ("Day 0", "Booking request", "A patient asks for a slot; the front desk offers two times."),
        ("Day 6", "Reminder", "A reminder goes out the day before, with Confirm and Reschedule options."),
        ("Day 7", "Visit", "The patient arrives on time; the front desk sees the confirmation."),
        ("Day 14", "Follow-up", "A short follow-up message asks how they are doing."),
    ]), "Example")
    body += workflow("City Dental Care", "Business account", "CD", [
        ("in", "Hi, can I book a check-up this week?", "09:02"),
        ("out", "Of course. Thursday 10:30 or Friday 17:00?", "09:06"),
        ("in", "Thursday please.", "09:07"),
        ("tpl", "Reminder: your appointment is tomorrow at 10:30. Reply 1 to confirm or 2 to reschedule.", "Wed"),
        ("in", "1", "Wed"),
    ], "Booking reminders <em>that get replies.</em>", "An example clinic flow.", 4)
    body += sec(5, "Customer story", quote("healthcare"), "Placeholder")
    body += band('Fewer missed <em>appointments.</em>', "Move bookings and reminders to WhatsApp.", n=6)
    return body


def education(p):
    board = '''<div class="board" data-reveal="scale"><p class="mono">Notice board</p>
<div class="board-pin"><b>Admissions open</b><span class="mono">Grade 6 · enquiries welcome</span></div>
<div class="board-pin y"><b>Fee reminder</b><span class="mono">Due on the 10th</span></div>
<div class="board-pin g"><b>Sports day</b><span class="mono">Saturday · 9:00</span></div></div>'''
    body = hero_split("Solutions · Education", 'Admissions to <em>announcements,</em> <span class="brand">one number.</span>',
                      "Answer admission enquiries, send fee reminders and share updates with parents on WhatsApp, from one shared inbox.", board + ill_note())
    body += problems([
        ("Enquiries pile up", "Admission season brings more questions than the office can answer.", "The office shares the load", "Assign enquiries across staff and reply faster."),
        ("Updates get lost", "Important notices drown in busy parent groups.", "Direct messages to parents", "Send updates to the parents who opted in, one to one."),
        ("Fee follow-ups", "Reminders take hours of calls.", "Reminders on WhatsApp", "Send polite reminders with the details parents need."),
    ], 2)
    body += sec(3, "Parent communication", head("Everything parents <em>need to know.</em>", "Where WhatsApp helps a school or coaching centre.") + bento([
        ("w2 green", "education", "Admission enquiries", "Answer questions about seats, fees and documents."),
        ("", "clock", "Fee reminders", "Polite reminders before the due date."),
        ("", "megaphone", "Announcements", "Holidays, events and timetable changes."),
        ("w2 ink", "team", "One office, one inbox", "Every staff member works from the same number."),
    ]), "Use cases")
    body += workflow("Green Valley School", "Business account", "GV", [
        ("in", "Are admissions open for Grade 6?", "11:15"),
        ("sys", "Assigned to Admissions", ""),
        ("out", "Yes, they are. Can we share the form and fee details here?", "11:20"),
        ("in", "Yes please.", "11:21"),
        ("tpl", "Here is the admission form and the list of documents. Reply with any questions.", "11:22"),
    ], "Enquiry to <em>application.</em>", "An example admissions flow.", 4)
    body += sec(5, "Customer story", quote("education"), "Placeholder")
    body += band('Talk to parents <em>where they are.</em>', "Bring admissions and updates into one inbox.", n=6)
    return body


def restaurants(p):
    ticket = '''<div class="tix" data-reveal="scale"><div class="tix-a"><span class="mono">Booking</span><b>Table for 4</b><p>Friday · 20:00</p></div>
<div class="tix-b"><span class="mono">Booking</span><b>Haircut</b><p>Saturday · 16:00</p></div></div>'''
    body = hero_word("Solutions · Restaurants and Salons", "Booked.", 'Bookings, reminders and <span class="brand">fewer no-shows.</span>',
                     "Take bookings on WhatsApp, send reminders before the slot and fill gaps with offers to regulars.",
                     f'<div class="wrap" style="margin-top:clamp(20px,3vw,40px)">{ticket}{ill_note()}</div>')
    body += sec(2, "The cost of a no-show", '<p class="scrub" data-scrub="reminder,confirm">An empty chair or table costs more than a reminder ever will. Send one, ask for a reply, and fill the gaps you still have.</p>', "Bookings")
    body += problems([
        ("No-shows", "Customers forget the slot and the time is lost.", "Reminders with a reply", "Send a reminder the day before and ask customers to confirm."),
        ("Booking by phone", "Staff stop work to answer calls.", "Bookings by message", "Customers book on WhatsApp; staff reply between appointments."),
        ("Quiet weekdays", "Some days stay half empty.", "Offers to regulars", "Send a weekday offer to regulars who opted in."),
    ], 3)
    body += sec(4, "Who it is for", marquee(["Salons", "Spas", "Restaurants", "Cafés", "Cloud kitchens", "Barbers"]) + marquee(["Bookings", "Reminders", "Offers", "Feedback"], rev=True, outline=True), "Restaurants and salons")
    body += workflow("Glow Studio", "Business account", "GS", [
        ("in", "Do you have a haircut slot this Saturday?", "10:40"),
        ("out", "Yes: 11:30 or 16:00?", "10:42"),
        ("in", "16:00 please 🙂", "10:43"),
        ("tpl", "Reminder: your haircut is tomorrow at 16:00. Reply 1 to confirm or 2 to reschedule.", "Fri"),
        ("in", "1", "Fri"),
        ("sys", "Booking confirmed", ""),
    ], "Reminders that <em>fill slots.</em>", "An example salon flow: book, remind, confirm.", 5)
    body += sec(6, "Customer story", quote("salon"), "Placeholder")
    body += band('Fill every <em>slot.</em>', "Move bookings and reminders to WhatsApp.", n=7)
    return body


# ---------------------------------------------------------------- teams
def sales(p):
    lead = '''<div class="lead-card" data-reveal="scale"><div class="lead-top"><span class="av" style="--a:#252525">VS</span><div><b>Vikram Shah</b><span class="mono">Lead · from WhatsApp</span></div></div>
<div class="seg"><span class="chip-s ok">Stage: Qualified</span><span class="chip-s">Owner: Priya</span><span class="chip-s">Follow up: Friday</span></div></div>'''
    cols = [("New", ["Arjun Nair", "Sana Qureshi"]), ("Qualified", ["Vikram Shah"]), ("Visit / demo", ["Neha Kapoor"]), ("Won", ["Ananya Rao"])]
    board = '<div class="kb" data-kanban>' + "".join(
        f'<div class="kb-col"><p class="mono">{c}</p>' + "".join(f'<div class="kb-card" data-k="{n}"><b>{n}</b><span class="mono">WhatsApp</span></div>' for n in names) + '</div>'
        for c, names in cols) + '</div>'
    body = hero_split("Solutions · Sales teams", 'Follow up <em>every</em> <span class="brand">lead.</span>',
                      "Give every WhatsApp lead an owner, keep the conversation history in one place and never lose a follow-up.", lead + ill_note())
    body += problems([
        ("Slow first replies", "Leads message once and buy elsewhere.", "Assigned on arrival", "New chats go to a salesperson straight away."),
        ("Follow-ups slip", "Nobody remembers who promised to call back.", "Owners and history", "Each lead has an owner and the full chat history."),
        ("Leads on personal phones", "Pipeline walks out of the door with a salesperson.", "The business keeps the lead", "Chats and contacts stay in Telixo."),
    ], 2)
    body += sec(3, "Pipeline", head("Watch leads <em>move.</em>", "An example pipeline. Scroll to move the leads along.") + f'<div class="wrap">{board}</div>', "Example board")
    body += workflow("Telixo Sales", "Business account", "TS", [
        ("in", "Hi, I'd like pricing for 10 users.", "15:02"),
        ("sys", "Assigned to Priya · Sales", ""),
        ("out", "Happy to help! Could we do a quick call tomorrow at 11?", "15:05"),
        ("in", "Sure.", "15:06"),
        ("sys", "Follow-up set · tomorrow 11:00", ""),
    ], "Lead in, <em>owner on it.</em>", "An example sales flow.", 4)
    body += sec(5, "Related features", head("Sales <em>toolkit.</em>", small=True) + related(p, ["product/inbox/", "product/contacts/", "product/calling/"]), "Product")
    body += band('Never miss <em>a lead.</em>', "Give your sales team one WhatsApp inbox.", n=6)
    return body


def support(p):
    q = '''<div class="queue" data-queue data-reveal="scale"><p class="mono">Support queue</p>
<div class="q-in"><span class="q-chat">Order not delivered</span><span class="q-chat">Change my booking</span><span class="q-chat">Invoice copy please</span></div>
<div class="q-agents"><span><span class="av" style="--a:#20C28B">P</span>Priya</span><span><span class="av" style="--a:#252525">R</span>Rohit</span><span><span class="av" style="--a:#0E8A5F">M</span>Meera</span></div></div>'''
    body = hero_center("Solutions · Support teams", 'One queue. <span class="brand">Clear owners.</span>',
                       "Every support chat lands in one shared queue, goes to the right person and gets resolved with the history in view.",
                       f'<div class="wrap" style="width:100%;margin-top:clamp(20px,3vw,40px)">{q}{ill_note()}</div>')
    body += problems([
        ("Duplicate replies", "Two people answer the same customer, differently.", "One owner per chat", "Assignment makes it clear who is replying."),
        ("Lost context", "Customers repeat themselves to every new person.", "The history travels with the chat", "Notes and past messages are right there."),
        ("No idea what is open", "Nobody can say which chats still need an answer.", "Status on every chat", "Open, waiting and resolved, at a glance."),
    ], 2)
    body += sec(3, "Before and after", head("Drag to <em>compare.</em>") + compare(
        "Support from one phone", ["Customers wait for whoever has the phone", "No record of who said what", "Owners guess what is still open"],
        "Support from Telixo", ["The whole team answers", "Notes and history on every chat", "Clear status for every conversation"]), "Compare")
    body += workflow("Kiran's Boutique Support", "Business account", "KB", [
        ("in", "My order hasn't arrived yet.", "12:10"),
        ("sys", "Assigned to Rohit · Support", ""),
        ("out", "Sorry about that! Checking with the courier now.", "12:12"),
        ("out", "It arrives tomorrow before 14:00. I'll check in after.", "12:20"),
        ("sys", "Marked resolved", ""),
    ], "Question in, <em>resolved.</em>", "An example support flow.", 4)
    body += sec(5, "Related features", head("Support <em>toolkit.</em>", small=True) + related(p, ["product/inbox/", "product/team/", "product/contacts/"]), "Product")
    body += band('Resolve chats <em>together.</em>', "Give your support team one shared queue.", n=6)
    return body


def marketing(p):
    days = "".join(f'<span class="cg-d{" on" if i in (2, 5, 9, 12, 16, 19, 23, 26) else ""}" style="--i:{i}"></span>' for i in range(28))
    cal = f'''<div class="win"><div class="win-top"><i></i><i></i><i></i><span class="mono">Campaign calendar</span><span class="chip-s ok">Opted-in contacts</span></div>
<div class="win-body"><div class="cg" data-cg>{days}</div><p class="mono" style="color:var(--muted)">Example month · lit days have a campaign</p></div></div>'''
    body = hero_split("Solutions · Marketing teams", 'Campaigns people <span class="brand">reply to.</span>',
                      "Plan WhatsApp campaigns to opted-in contacts, use approved templates and hand replies straight to sales and support.", cal + ill_note(), flip=True)
    body += problems([
        ("Blasts that annoy", "Untargeted messages get reported and blocked.", "Segments and consent", "Send to opted-in contacts, grouped by what they care about."),
        ("Replies with nowhere to go", "People answer a campaign and nobody sees it.", "Replies land in the inbox", "Your team picks up campaign replies like any other chat."),
        ("Copy-paste lists", "Lists live in spreadsheets and go stale.", "Contacts in one place", "Tags and segments update as your team works."),
    ], 2)
    body += sec(3, "A campaign, step by step", head("Plan, send, <em>hand over.</em>") + hscroll([
        ("Segment", "Pick opted-in contacts by tag or history."),
        ("Template", "Write an approved template with personal details."),
        ("Schedule", "Send at a time your audience is likely to read."),
        ("Replies", "Replies arrive in the shared inbox."),
        ("Hand over", "Assign interested replies to sales."),
    ]), "Scroll sideways")
    body += workflow("Glow Studio", "Business account", "GS", [
        ("tpl", "Hi Ananya, this Saturday get a free hair spa with any haircut. Reply BOOK to reserve a slot.", "Sat 10:00"),
        ("in", "BOOK", "10:14"),
        ("sys", "Assigned to Meera · Front desk", ""),
        ("out", "Lovely! 11:30 or 16:00 on Saturday?", "10:16"),
    ], "Campaign to <em>conversation.</em>", "An example marketing flow.", 4)
    body += sec(5, "Related features", head("Marketing <em>toolkit.</em>", small=True) + related(p, ["product/campaigns/", "product/contacts/", "product/inbox/"]), "Product")
    body += band('Send campaigns <em>people want.</em>', "Plan your first WhatsApp campaign in Telixo.", n=6)
    return body


# ---------------------------------------------------------------- overview
def overview(p):
    def hl(items, start):
        return '<ul class="hl">' + "".join(
            f'<li><a href="{p.u(h)}" data-cursor="Open"><span class="ch-n mono">{i:02d}</span><span class="ch-name"><span class="roll" data-text="{t.replace(" and ", " & ")}">{t.replace(" and ", " & ")}</span></span><span class="ch-role mono">{d}</span></a></li>'
            for i, (h, _, t, d) in enumerate(items, start)) + '</ul>'
    body = hero_word("Solutions", "Solutions", 'Telixo for <span class="sr-only">your business.</span><span class="slot brand" aria-hidden="true" data-slot="your business.|retail.|real estate.|clinics.|schools.|restaurants.|salons.|sales teams.|support teams.|marketing teams.">your business.</span>',
                     "Pick your industry or your team to see how a shared WhatsApp inbox fits the way you work.")
    body += sec(2, "By industry", head("By <em>industry.</em>", "Your testimonials already span these businesses. Each has its own page.") + hl(INDUSTRIES, 1), "Hover a row")
    body += sec(3, "By team", head("By <em>team.</em>", small=True) + hl(TEAMS, 6), "Hover a row")
    body += band('Not sure where <em>you fit?</em>', "Book a demo and we will show you Telixo with your own channels.", label="Book a Demo →", href="https://wa.me/910000000000", link="whatsapp", n=4)
    return body


def pages():
    spec = [
        ("solutions", overview, "Solutions · Telixo", "How Telixo fits retail, real estate, healthcare, education, restaurants and salons, and sales, support and marketing teams."),
        ("solutions/retail", retail, "Telixo for Retail", "Order updates, product questions and offers on WhatsApp, from one shared inbox."),
        ("solutions/real-estate", real_estate, "Telixo for Real Estate", "Listing enquiries, site visits and follow-ups on WhatsApp, with every lead assigned."),
        ("solutions/healthcare", healthcare, "Telixo for Healthcare", "Appointment bookings and reminders on WhatsApp for clinics and front desks."),
        ("solutions/education", education, "Telixo for Education", "Admission enquiries, fee reminders and parent updates on WhatsApp."),
        ("solutions/restaurants-salons", restaurants, "Telixo for Restaurants and Salons", "Bookings, reminders and fewer no-shows on WhatsApp."),
        ("solutions/sales", sales, "Telixo for Sales Teams", "Assign every WhatsApp lead and never lose a follow-up."),
        ("solutions/support", support, "Telixo for Support Teams", "One shared WhatsApp support queue with clear owners."),
        ("solutions/marketing", marketing, "Telixo for Marketing Teams", "WhatsApp campaigns to opted-in contacts, with replies handed to your team."),
    ]
    out = []
    for path, fn, title, desc in spec:
        p = Page(path, title, desc, "", body_class="page", section="solutions")
        p.body = fn(p)
        out.append(p)
    return out
