"""One-off script: generate PWA icons from the existing Renfit logo.

Not part of the build pipeline — run manually whenever the source logo
changes:

    python scripts/generate-pwa-icons.py

Crops the logo's visible content (auto-detected bounding box, since the
source PNG has large black padding), then pastes it centered onto square
canvases matching the brand's dark background (#0B0B0B) at each required
PWA icon size. Also writes a simple SVG favicon using the same brand colors
so browser tabs get a crisp icon without needing a raster fetch.
"""

from pathlib import Path

from PIL import Image

SRC = Path(__file__).resolve().parent.parent / "src" / "imports" / "image.png"
OUT_DIR = Path(__file__).resolve().parent.parent / "public"
BG = (11, 11, 11)  # #0B0B0B — brand background
SIZES = [192, 512]
MASKABLE_PADDING_RATIO = 0.15  # keep content inside the "safe zone" for maskable icons


def find_bbox(im: Image.Image, threshold: int = 24) -> tuple[int, int, int, int]:
    px = im.convert("RGB").load()
    w, h = im.size
    minx, miny, maxx, maxy = w, h, 0, 0
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            r, g, b = px[x, y]
            if r > threshold or g > threshold or b > threshold:
                minx, miny = min(minx, x), min(miny, y)
                maxx, maxy = max(maxx, x), max(maxy, y)
    return minx, miny, maxx, maxy


def make_icon(logo: Image.Image, size: int, padding_ratio: float) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), (*BG, 255))
    target = int(size * (1 - padding_ratio * 2))
    resized = logo.copy()
    resized.thumbnail((target, target), Image.LANCZOS)
    x = (size - resized.width) // 2
    y = (size - resized.height) // 2
    canvas.paste(resized, (x, y), resized if resized.mode == "RGBA" else None)
    return canvas


def main() -> None:
    OUT_DIR.mkdir(exist_ok=True)
    im = Image.open(SRC).convert("RGBA")
    minx, miny, maxx, maxy = find_bbox(im)
    pad = 10
    box = (
        max(0, minx - pad),
        max(0, miny - pad),
        min(im.width, maxx + pad),
        min(im.height, maxy + pad),
    )
    logo = im.crop(box)

    for size in SIZES:
        icon = make_icon(logo, size, padding_ratio=0.08)
        icon.convert("RGB").save(OUT_DIR / f"icon-{size}.png")
        print(f"wrote icon-{size}.png")

    # Maskable variant (Android adaptive icons) needs extra safe-zone padding
    # so OS-applied masks (circle, squircle, etc.) don't clip the logo.
    maskable = make_icon(logo, 512, padding_ratio=MASKABLE_PADDING_RATIO)
    maskable.convert("RGB").save(OUT_DIR / "icon-maskable-512.png")
    print("wrote icon-maskable-512.png")

    # Apple touch icon (no transparency, standard 180x180)
    apple = make_icon(logo, 180, padding_ratio=0.1)
    apple.convert("RGB").save(OUT_DIR / "apple-touch-icon.png")
    print("wrote apple-touch-icon.png")


if __name__ == "__main__":
    main()
