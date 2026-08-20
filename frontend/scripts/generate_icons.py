"""One-off script to generate branded PWA icons matching the navbar compass
mark (accent-500 orange needle on a primary-900 dark background). Not part
of the build pipeline — run manually if the brand icon ever changes.
"""
import math
from PIL import Image, ImageDraw

PRIMARY_900 = (26, 62, 78, 255)
WHITE = (255, 255, 255, 255)
ACCENT_500 = (253, 95, 12, 255)

OUT_DIR = "/Users/aastriyagaire/Desktop/Tourist-Guider/frontend/public"


def draw_compass(size: int, padding_ratio: float) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    corner_radius = size * 0.22
    draw.rounded_rectangle([0, 0, size - 1, size - 1], radius=corner_radius, fill=PRIMARY_900)

    cx, cy = size / 2, size / 2
    r = size * (0.5 - padding_ratio)

    ring_width = max(2, size * 0.028)
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=WHITE, width=int(ring_width))

    needle_len = r * 0.82
    needle_width = r * 0.32

    def rotate(x, y, deg):
        rad = math.radians(deg)
        rx = x * math.cos(rad) - y * math.sin(rad)
        ry = x * math.sin(rad) + y * math.cos(rad)
        return (cx + rx, cy + ry)

    angle = -35
    north = rotate(0, -needle_len, angle)
    south = rotate(0, needle_len, angle)
    left = rotate(-needle_width, 0, angle)
    right = rotate(needle_width, 0, angle)

    draw.polygon([north, right, south], fill=ACCENT_500)
    draw.polygon([north, left, south], fill=WHITE)

    hub_r = size * 0.035
    draw.ellipse([cx - hub_r, cy - hub_r, cx + hub_r, cy + hub_r], fill=WHITE)

    return img


for size in (192, 512):
    draw_compass(size, padding_ratio=0.09).save(f"{OUT_DIR}/icon-{size}.png")

draw_compass(512, padding_ratio=0.22).save(f"{OUT_DIR}/icon-maskable-512.png")

print("Icons written to", OUT_DIR)
