"""Generate the Lottie JSON animations in assets/animations/.

Run: python3 tools/build_animations.py
"""
import json
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "assets" / "animations"
ACCENT = [0.184, 0.357, 0.918, 1]   # #2f5bea
ACCENT_2 = [0.373, 0.784, 0.988, 1]  # #5fc8fc
EASE = {"i": {"x": [0.42], "y": [1]}, "o": {"x": [0.58], "y": [0]}}


def static(v):
    return {"a": 0, "k": v}


def anim(frames):
    """frames: list of (time, value). Value is a list."""
    keys = []
    for n, (t, v) in enumerate(frames):
        k = {"t": t, "s": v}
        if n < len(frames) - 1:
            k.update(EASE)
        keys.append(k)
    return {"a": 1, "k": keys}


def transform(p=(0, 0), s=(100, 100), r=0, o=100):
    return {"ty": "tr", "p": static(list(p)), "a": static([0, 0]),
            "s": static(list(s)), "r": static(r), "o": static(o)}


def ellipse(size, p=(0, 0)):
    return {"ty": "el", "p": static(list(p)), "s": static([size, size]), "d": 1}


def fill(color):
    return {"ty": "fl", "c": static(color), "o": static(100), "r": 1}


def stroke(color, width):
    return {"ty": "st", "c": static(color), "o": static(100), "w": static(width), "lc": 2, "lj": 2}


def trim(start, end):
    return {"ty": "tm", "s": static(start), "e": static(end), "o": static(0), "m": 1}


def layer(ind, name, shapes, op, p, r=None, s=None, o=None):
    ks = {
        "o": o or static(100),
        "r": r or static(0),
        "p": static(p) if not isinstance(p, dict) else p,
        "a": static([0, 0, 0]),
        "s": s or static([100, 100, 100]),
    }
    return {"ddd": 0, "ind": ind, "ty": 4, "nm": name, "sr": 1, "ks": ks, "ao": 0,
            "shapes": [{"ty": "gr", "nm": name, "it": shapes + [transform()]}],
            "ip": 0, "op": op, "st": 0, "bm": 0}


def comp(name, w, h, op, layers, fr=60):
    return {"v": "5.7.4", "fr": fr, "ip": 0, "op": op, "w": w, "h": h,
            "nm": name, "ddd": 0, "assets": [], "layers": layers}


def hero():
    op, c = 240, [200, 200, 0]
    layers = [
        # Three orbiting dots
        *[layer(i + 1, f"orbit-{i}", [ellipse(14, (150, 0)), fill(ACCENT_2)], op, c,
                r=anim([(0, [i * 120]), (op, [i * 120 + 360])]))
          for i in range(3)],
        # Outer arc, clockwise
        layer(4, "ring-outer", [ellipse(300), trim(0, 65), stroke(ACCENT, 6)], op, c,
              r=anim([(0, [0]), (op, [360])])),
        # Inner arc, counter-clockwise
        layer(5, "ring-inner", [ellipse(220), trim(0, 40), stroke(ACCENT_2, 4)], op, c,
              r=anim([(0, [0]), (op, [-360])])),
        # Pulsing core
        layer(6, "core", [ellipse(110), fill(ACCENT)], op, c,
              s=anim([(0, [100, 100, 100]), (op / 2, [118, 118, 100]), (op, [100, 100, 100])])),
        # Soft halo behind the core
        layer(7, "halo", [ellipse(110), fill(ACCENT_2)], op, c,
              s=anim([(0, [100, 100, 100]), (op, [190, 190, 100])]),
              o=anim([(0, [45]), (op, [0])])),
    ]
    return comp("hero", 400, 400, op, layers)


def loader():
    op = 60
    layers = []
    for i in range(3):
        x, d = 50 + i * 50, i * 8
        layers.append(layer(i + 1, f"dot-{i}", [ellipse(22), fill(ACCENT)], op,
                            anim([(0, [x, 60, 0]), (10 + d, [x, 60, 0]), (25 + d, [x, 35, 0]),
                                  (40 + d, [x, 60, 0]), (op, [x, 60, 0])])))
    return comp("loader", 200, 100, op, layers)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for name, data in {"hero": hero(), "loader": loader()}.items():
        (OUT / f"{name}.json").write_text(json.dumps(data, separators=(",", ":")))
        print(f"wrote assets/animations/{name}.json")
