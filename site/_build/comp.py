"""Section building blocks. Each returns an HTML string."""
from lib import icon, SIGNUP, WHATSAPP, PRODUCT


def meta(n, label, right=""):
    r = f'<span class="hide-sm">{right}</span>' if right else "<span></span>"
    return f'<div class="meta-row mono"><span>({n:02d})</span><span>{label}</span>{r}</div>'


def ctas(primary="Start free", secondary="Book a Demo", dock=True):
    d = " data-dock-start" if dock else ""
    return (f'<div class="btn-row hero-ctas"{d}>'
            f'<a class="pill-btn brand magnet" href="{SIGNUP}" data-link="signup" data-cursor="Start">{primary} <span aria-hidden="true">→</span></a>'
            f'<a class="pill-btn ghost" href="{WHATSAPP}" data-link="whatsapp" data-cursor="Chat" target="_blank" rel="noopener">{secondary}<span class="sr-only"> (opens WhatsApp)</span></a></div>')


def hero_split(eyebrow, title, lede, art, *, flip=False, buttons=True, extra=""):
    f = " flip" if flip else ""
    b = ctas() if buttons else ""
    return f'''<section class="ph" id="top">
  <div class="ph-split{f}">
    <div class="ph-copy">
      <p class="mono eyebrow">{eyebrow}</p>
      <h1 class="ph-title" data-kin>{title}</h1>
      <p class="lede wide">{lede}</p>
      {b}{extra}
    </div>
    <div class="ph-art" data-reveal="scale">{art}</div>
  </div>
</section>'''


def hero_word(eyebrow, word, title, lede, art="", buttons=True):
    b = ctas() if buttons else ""
    return f'''<section class="ph" id="top">
  <p class="mono eyebrow">{eyebrow}</p>
  <p class="ph-word" data-fit data-kin aria-hidden="true">{word}</p>
  <div class="ph-under">
    <div class="ph-copy"><h1 class="h3">{title}</h1><p class="lede wide">{lede}</p></div>
    {b}
  </div>
  {art}
</section>'''


def hero_center(eyebrow, title, lede, art="", buttons=True):
    b = ctas() if buttons else ""
    return f'''<section class="ph ph-center" id="top">
  <p class="mono eyebrow">{eyebrow}</p>
  <h1 class="ph-title" data-kin>{title}</h1>
  <p class="lede wide">{lede}</p>
  {b}
  {art}
</section>'''


def h2(text, small=False, split=True):
    s = " small" if small else ""
    d = " data-split" if split else ""
    return f'<h2 class="h2{s}"{d}>{text}</h2>'


def sec(n, label, inner, right="", cls="", id_=""):
    i = f' id="{id_}"' if id_ else ""
    return f'<section class="sec {cls}"{i}>{meta(n, label, right)}\n{inner}\n</section>'


def head(title, lede="", small=False):
    s = " small" if small else ""
    l = f'<p class="body-l">{lede}</p>' if lede else ""
    return f'<div class="sec-head"><h2 class="h2{s}" data-split>{title}</h2>{l}</div>'


def rows(items):
    out = []
    for i, (eyebrow, title, text, art) in enumerate(items, 1):
        out.append(f'''<div class="row">
  <div class="row-copy" data-reveal="{'left' if i % 2 else 'right'}"><span class="row-n">{eyebrow}</span><h3 class="h3">{title}</h3><p class="body-l">{text}</p></div>
  <div class="row-art" data-reveal="clip">{art}</div>
</div>''')
    return f'<div class="rows">{"".join(out)}</div>'


def steps(items):
    lis = "".join(f'<li><span class="n">{i:02d}</span><h3>{t}</h3><p>{d}</p></li>' for i, (t, d) in enumerate(items, 1))
    return f'<ol class="steps-x" data-steps style="--n:{len(items)}">{lis}</ol>'


def related(p, keys):
    picks = [it for it in PRODUCT if it[0] in keys]
    cards = "".join(f'<a href="{p.u(h)}"><span class="mg-ic">{icon(ic)}</span><b>{t}</b><p>{d}</p><span class="mg-go">Learn more {icon("arrow")}</span></a>'
                    for h, ic, t, d in picks)
    return f'<div class="rel" data-tilt>{cards}</div>'


def quote(industry):
    return f'''<figure class="qt" data-reveal="clip">
  <blockquote>
    <p><span class="todo">Result headline from a {industry} customer</span></p>
    <p style="font-size:clamp(18px,1.6vw,24px);text-transform:none;font-variation-settings:'wdth' 100,'wght' 420;line-height:1.4"><span class="todo">One real alpha-user quote, used only once on the site.</span></p>
    <cite><span class="todo">Name · Role · Business · City</span></cite>
  </blockquote>
</figure>'''


def band(title_html, lede, label="Start free →", href=SIGNUP, link="signup", n=None, label2="Every channel, one team"):
    m = meta(n, "Get started", label2) if n else ""
    return f'''<section class="band" id="start" data-dock-end>
  {m}
  {h2(title_html)}
  <p class="lede">{lede}</p>
  <a class="mega" href="{href}" data-link="{link}" data-cursor="Go"><span class="mega-in" data-text="{label}">{label}</span></a>
  <div class="cta-row mono">
    <a href="{WHATSAPP}" data-link="whatsapp" target="_blank" rel="noopener">Book a Demo on WhatsApp ↗</a>
    <a href="/login" data-link="login">Already a customer? Log in →</a>
  </div>
</section>'''


def faq(qs):
    items = "".join(f'<details><summary>{q}</summary><div><p>{a}</p></div></details>' for q, a in qs)
    return f'<div class="faq"><div class="faq-list" data-stagger>{items}</div></div>'


def chat(name, sub, msgs, initials="TX", loop=True):
    """msgs: list of (kind, text, time) where kind in in/out/sys/tpl."""
    ms = []
    for kind, text, t in msgs:
        cls = "cm out tpl" if kind == "tpl" else f"cm {kind}"
        tm = f"<small>{t}</small>" if t else ""
        ms.append(f'<div class="{cls}">{text}{tm}</div>')
    lp = " data-loop" if loop else ""
    return f'''<div class="chat" role="img" aria-label="Example WhatsApp conversation with {name}">
  <div class="chat-in" data-chat{lp}>
    <div class="chat-head"><span class="av" style="--a:#fff;color:var(--brand-deep)">{initials}</span><div><b>{name}</b><small>{sub}</small></div></div>
    <div class="chat-msgs">{"".join(ms)}</div>
    <div class="chat-foot"><span>Message</span><i>➤</i></div>
  </div>
</div>'''


def win(title, body, chip=""):
    c = f'<span class="chip-s ok">{chip}</span>' if chip else ""
    return f'<div class="win"><div class="win-top"><i></i><i></i><i></i><span class="mono">{title}</span>{c}</div><div class="win-body">{body}</div></div>'


def ill_note(text="Illustration with example data."):
    return f'<p class="ill-note mono">{text}</p>'


def bento(cells):
    """cells: (cls, icon, title, text)"""
    out = "".join(f'<div class="bx {c}"><span class="mg-ic">{icon(ic)}</span><div><h3>{t}</h3><p style="margin-top:10px">{d}</p></div></div>' for c, ic, t, d in cells)
    return f'<div class="bento" data-stagger>{out}</div>'


def stack(cards):
    """cards: (title, text, art)"""
    out = "".join(f'''<article class="stack-card"><div style="display:grid;gap:18px;align-content:center"><span class="stack-n">{i:02d}</span><h3 class="h3">{t}</h3><p class="body-l">{d}</p></div><div>{a}</div></article>'''
                  for i, (t, d, a) in enumerate(cards, 1))
    return f'<div class="stack" data-stack>{out}</div>'


def hscroll(cards):
    out = "".join(f'<article class="hs-card"><span class="stack-n">{i:02d}</span><div style="display:grid;gap:14px"><h3>{t}</h3><p>{d}</p></div></article>' for i, (t, d) in enumerate(cards, 1))
    return f'<div class="hs" data-hscroll><div class="hs-track">{out}</div></div>'


def timeline(items):
    lis = "".join(f'<li><span class="mono when">{w}</span><div><h3>{t}</h3><p>{d}</p></div></li>' for w, t, d in items)
    return f'<ol class="tl" data-timeline>{lis}</ol>'


def compare(before_title, before_items, after_title, after_items):
    bl = "".join(f'<span>{icon("x")}{x}</span>' for x in before_items)
    al = "".join(f'<span>{x}{icon("check")}</span>' for x in after_items)
    return f'''<div class="cmp" data-compare>
  <div class="cmp-side cmp-before"><div class="cmp-in"><span class="mono">Before</span><h3>{before_title}</h3><div class="cmp-list">{bl}</div></div></div>
  <div class="cmp-side cmp-after"><div class="cmp-in"><span class="mono">With Telixo</span><h3>{after_title}</h3><div class="cmp-list">{al}</div></div></div>
  <div class="cmp-handle"><button type="button" role="slider" aria-label="Compare before and with Telixo" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">⇆</button></div>
</div>'''


def marquee(words, rev=False, outline=False):
    o = " outline" if outline else ""
    inner = "".join(f'<span>{w}</span><i>✦</i>' for w in words)
    r = "rev" if rev else "fwd"
    return f'<div class="mq"><div class="mq-row" data-marquee="{r}"><div class="mq-in{o}">{inner}</div></div></div>'


def flips(items):
    """items: (problem_title, problem_text, solution_title, solution_text)"""
    out = "".join(f'''<div class="flip" data-flip><div class="flip-in">
  <div class="flip-face f"><span class="mono">Problem {i:02d}</span><div style="display:grid;gap:12px"><h3>{pt}</h3><p>{pd}</p></div><button class="flip-btn" type="button" aria-pressed="false">See the fix {icon("arrow")}</button></div>
  <div class="flip-face b"><span class="mono">With Telixo</span><div style="display:grid;gap:12px"><h3>{st}</h3><p>{sd}</p></div><button class="flip-btn" type="button" aria-pressed="true">Back to the problem {icon("arrow")}</button></div>
</div></div>''' for i, (pt, pd, st, sd) in enumerate(items, 1))
    return f'<div class="flips" data-stagger>{out}</div>'
