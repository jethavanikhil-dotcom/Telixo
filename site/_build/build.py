"""Build every Telixo page into site/.  Run:  python3 site/_build/build.py"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.environ.get("OUT") or os.path.dirname(HERE)
sys.path.insert(0, HERE)

import re  # noqa: E402
import lib  # noqa: E402
from lib import Page, render  # noqa: E402
import pages_product  # noqa: E402
import pages_solutions  # noqa: E402
import pages_more  # noqa: E402


def home():
    with open(os.path.join(HERE, "home_body.html"), encoding="utf-8") as f:
        body = f.read()
    return Page("", "Telixo — WhatsApp Business platform for growing teams in India",
                "Telixo is a WhatsApp Business platform for businesses in India: one shared inbox for your whole team, campaigns and broadcasts, contacts and roles, with Twilio calling and Odoo contact sync.",
                body, js=("home.js",))


def main():
    pages = [home(), *pages_product.pages(), *pages_solutions.pages(), *pages_more.pages()]
    for p in pages:
        out = getattr(p, "outfile", None)
        target = os.path.join(SITE, out) if out else os.path.join(SITE, p.path, "index.html")
        os.makedirs(os.path.dirname(target), exist_ok=True)
        html = render(p)
        if lib.INDEX_LINKS:
            # Relative folder links → explicit index.html (for hosts without folder indexes).
            html = re.sub(r'href="((?:\.\./)*[a-z0-9\-/]*/|\./)(#[^"]*)?"',
                          lambda m: f'href="{"" if m.group(1) == "./" else m.group(1)}index.html{m.group(2) or ""}"', html)
        with open(target, "w", encoding="utf-8") as f:
            f.write(html)
    print(f"Built {len(pages)} pages")


if __name__ == "__main__":
    main()
