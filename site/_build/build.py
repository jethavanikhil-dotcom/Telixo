"""Build every Telixo page into site/.  Run:  python3 site/_build/build.py"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)
sys.path.insert(0, HERE)

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
        with open(target, "w", encoding="utf-8") as f:
            f.write(render(p))
    print(f"Built {len(pages)} pages")


if __name__ == "__main__":
    main()
