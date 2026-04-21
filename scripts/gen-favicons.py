#!/usr/bin/env python3
"""P11.4 — Favicon-Generator für den CSC-Raumplaner.

Erzeugt PNG-Favicons in Standardgrößen (16/32/48/192/512) aus einem
programmatisch gerenderten Icon. Das Icon ist ein stilisiertes 🌿 auf
dunklem, abgerundetem Hintergrund (CSC-Grün + dunkler BG für Kontrast
auf Dark- und Light-Themes).

Benötigt: Pillow (`pip install Pillow`). Auf diesem System ist Pillow
bereits installiert.

Läuft einmalig vor Release. Output geht nach public/ — Vite kopiert
daraus ins dist/.

Usage:
    python scripts/gen-favicons.py
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).parent.parent
PUBLIC = ROOT / "public"

BG_COLOR = (12, 16, 12, 255)       # almost-black dark green
FG_COLOR = (74, 222, 128, 255)     # CSC green (--gr)
STROKE = (14, 83, 45, 255)         # darker green stroke (--gr3)

SIZES = [16, 32, 48, 192, 512]


def draw_leaf(img: Image.Image) -> None:
    """Paint a stylized 5-lobed hemp leaf on the given image (in place)."""
    w, h = img.size
    d = ImageDraw.Draw(img)

    # Background: rounded rect filling the canvas
    pad = max(1, w // 16)
    d.rounded_rectangle(
        [pad, pad, w - pad, h - pad],
        radius=max(2, w // 8),
        fill=BG_COLOR,
    )

    # Simplified 5-fingered leaf: center stalk + 4 side-lobes. Scale
    # everything off the canvas size so 16px and 512px look consistent.
    cx, cy = w / 2, h / 2
    r = w * 0.36  # leaf radius

    # Stalk (vertical line)
    d.line([(cx, cy + r * 0.3), (cx, cy + r * 0.9)], fill=STROKE, width=max(1, w // 32))

    # 5 elliptical "leaflets" around the center, each slightly rotated.
    for i, angle_factor in enumerate([-0.9, -0.45, 0, 0.45, 0.9]):
        # Angles from upright (top) leaflet splaying outward
        import math
        angle = angle_factor * math.pi / 2
        tip_x = cx + math.sin(angle) * r
        tip_y = cy - math.cos(angle) * r * (0.8 + 0.2 * (1 - abs(angle_factor)))
        # Lobe: ellipse from center towards tip
        # We approximate with a thick line + circle for the tip blob.
        lobe_w = max(1, int(w * 0.08 * (1 - abs(angle_factor) * 0.3)))
        d.line([(cx, cy), (tip_x, tip_y)], fill=FG_COLOR, width=lobe_w * 2)
        blob_r = lobe_w * 1.2
        d.ellipse(
            [tip_x - blob_r, tip_y - blob_r, tip_x + blob_r, tip_y + blob_r],
            fill=FG_COLOR,
            outline=STROKE,
            width=max(1, w // 64),
        )


def main() -> int:
    PUBLIC.mkdir(parents=True, exist_ok=True)
    for size in SIZES:
        # Oversample + downsize for smoother edges on small icons.
        over = 4 if size < 64 else 2
        big = Image.new("RGBA", (size * over, size * over), (0, 0, 0, 0))
        draw_leaf(big)
        img = big.resize((size, size), Image.LANCZOS)
        out = PUBLIC / f"icon-{size}.png"
        img.save(out, "PNG", optimize=True)
        print(f"wrote {out.relative_to(ROOT)} ({out.stat().st_size} bytes)")

    # Multi-resolution .ico for legacy browsers (also from the 32px version)
    ico = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    over = 4
    big = Image.new("RGBA", (32 * over, 32 * over), (0, 0, 0, 0))
    draw_leaf(big)
    ico = big.resize((32, 32), Image.LANCZOS)
    ico.save(PUBLIC / "favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
    print(f"wrote public/favicon.ico")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
