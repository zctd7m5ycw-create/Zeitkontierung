"""
Erzeugt die App-Icons in public/ (Stoppuhr auf dunklem Grund).

Aufruf (Python 3 mit Pillow):  python3 scripts/generate-icons.py
Die SVG-Variante für den Browser-Tab liegt separat in public/favicon.svg.
"""
import math
from pathlib import Path

from PIL import Image, ImageDraw

BACKGROUND = (24, 24, 27)
FOREGROUND = (244, 244, 245)
ACCENT = (74, 120, 230)
PUBLIC_DIR = Path(__file__).resolve().parent.parent / "public"


def draw_icon(size: int, glyph_scale: float = 1.0, supersample: int = 4) -> Image.Image:
    canvas = size * supersample
    image = Image.new("RGB", (canvas, canvas), BACKGROUND)
    draw = ImageDraw.Draw(image)
    unit = canvas / 1024 * glyph_scale
    cx, cy = canvas / 2, canvas / 2 + 40 * unit

    # Zifferblatt
    radius = 290 * unit
    draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], outline=FOREGROUND, width=int(62 * unit))

    # Krone oben
    crown_w, crown_h = 120 * unit, 56 * unit
    top = cy - radius - 34 * unit - crown_h
    draw.rounded_rectangle([cx - crown_w / 2, top, cx + crown_w / 2, top + crown_h], radius=crown_h / 2, fill=FOREGROUND)
    draw.rectangle([cx - 22 * unit, top + crown_h - 4 * unit, cx + 22 * unit, cy - radius + 10 * unit], fill=FOREGROUND)

    # Zeiger (40° nach rechts geneigt)
    length, width = 175 * unit, 54 * unit
    angle = math.radians(-90 + 40)
    end_x, end_y = cx + length * math.cos(angle), cy + length * math.sin(angle)
    draw.line([cx, cy, end_x, end_y], fill=ACCENT, width=int(width))
    for px, py in [(cx, cy), (end_x, end_y)]:
        draw.ellipse([px - width / 2, py - width / 2, px + width / 2, py + width / 2], fill=ACCENT)

    return image.resize((size, size), Image.LANCZOS)


if __name__ == "__main__":
    draw_icon(180).save(PUBLIC_DIR / "apple-touch-icon.png")
    draw_icon(192).save(PUBLIC_DIR / "icon-192.png")
    draw_icon(512).save(PUBLIC_DIR / "icon-512.png")
    # Für Android: Motiv kleiner, damit es im runden Ausschnitt vollständig bleibt.
    draw_icon(512, glyph_scale=0.78).save(PUBLIC_DIR / "icon-maskable-512.png")
    print(f"Icons erzeugt in {PUBLIC_DIR}")
