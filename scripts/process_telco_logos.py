"""
Telco Logo Processor
====================
Removes white/light backgrounds from Telco logos and saves them as
clean, transparent, square PNGs ready for use in the map icon atlas.

Output goes to: frontend/public/telco-logos/ (URL-safe, no spaces/apostrophes)
"""

import os
import sys
from PIL import Image, ImageOps

# ─── Configuration ──────────────────────────────────────────────────────────
INPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "Telco's Logo")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "telco-logos")
TARGET_SIZE = 128  # Square output size (good for map atlas at 2x-4x DPI)
WHITE_THRESHOLD = 230  # Pixels with R,G,B all above this → transparent
LIGHT_GRAY_THRESHOLD = 210  # Extended threshold for edge anti-aliasing cleanup


def remove_background(img, threshold=WHITE_THRESHOLD, edge_threshold=LIGHT_GRAY_THRESHOLD):
    """
    Remove white/near-white background from an image.
    Uses a two-pass approach:
      1. Remove pure white pixels (above threshold)
      2. Clean up light gray edge artifacts (anti-aliased pixels near edges)
    """
    img = img.convert("RGBA")
    pixels = img.load()
    width, height = img.size

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]

            # Skip already transparent pixels
            if a == 0:
                continue

            # Pass 1: Remove white/near-white background
            if r > threshold and g > threshold and b > threshold:
                pixels[x, y] = (255, 255, 255, 0)
                continue

            # Pass 2: Clean up light gray anti-aliasing artifacts
            # These are semi-white pixels at the edges of the logo content
            if r > edge_threshold and g > edge_threshold and b > edge_threshold:
                # Check saturation — if it's a gray (low color variance), make transparent
                diff = max(r, g, b) - min(r, g, b)
                if diff < 15:  # Very low saturation = gray
                    # Fade out proportionally (softer edge)
                    avg = (r + g + b) / 3
                    new_alpha = int(max(0, (edge_threshold - avg) / (edge_threshold - threshold) * a))
                    pixels[x, y] = (r, g, b, new_alpha)

    return img


def crop_and_square(img, target_size=TARGET_SIZE):
    """
    Crop to content bounding box, then fit into a square canvas
    centered with padding for a clean map icon look.
    """
    # Get bounding box of non-transparent content
    bbox = img.getbbox()
    if bbox is None:
        return Image.new("RGBA", (target_size, target_size), (0, 0, 0, 0))

    # Crop to content
    content = img.crop(bbox)
    content_w, content_h = content.size

    # Scale to fit in target square with 6% padding per side (88% usable)
    usable = int(target_size * 0.88)
    scale = min(usable / content_w, usable / content_h)
    new_w = max(1, int(content_w * scale))
    new_h = max(1, int(content_h * scale))

    # High-quality resize
    content_resized = content.resize((new_w, new_h), Image.LANCZOS)

    # Center on transparent square canvas
    canvas = Image.new("RGBA", (target_size, target_size), (0, 0, 0, 0))
    offset_x = (target_size - new_w) // 2
    offset_y = (target_size - new_h) // 2
    canvas.paste(content_resized, (offset_x, offset_y), content_resized)

    return canvas


def process_logo(input_path, output_path, name):
    """Process a single logo: remove BG → crop → square → save."""
    try:
        with Image.open(input_path) as img:
            original_size = img.size
            print(f"  📦 {name} ({original_size[0]}x{original_size[1]})")

            # Step 1: Remove background
            transparent = remove_background(img)

            # Step 2: Crop and fit into square
            final = crop_and_square(transparent)

            # Step 3: Save optimized PNG
            final.save(output_path, "PNG", optimize=True)

            out_size = os.path.getsize(output_path)
            print(f"     ✅ → {TARGET_SIZE}x{TARGET_SIZE} transparent ({out_size // 1024}KB)")
            return True

    except Exception as e:
        print(f"     ❌ Error: {e}")
        return False


def main():
    print("=" * 60)
    print("  Telco Logo Processor")
    print("  Removes backgrounds & creates square transparent PNGs")
    print("=" * 60)

    # Validate directories
    if not os.path.exists(INPUT_DIR):
        print(f"\n❌ Input directory not found: {INPUT_DIR}")
        sys.exit(1)

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Find all PNG files
    files = sorted([f for f in os.listdir(INPUT_DIR) if f.lower().endswith('.png')])
    print(f"\n📂 Found {len(files)} logos in: {INPUT_DIR}")
    print(f"📁 Output: {OUTPUT_DIR}\n")

    success = 0
    failed = 0

    for filename in files:
        input_path = os.path.join(INPUT_DIR, filename)
        # Normalize filename: lowercase, underscores, no spaces
        clean_name = filename.replace(" ", "_").lower()
        output_path = os.path.join(OUTPUT_DIR, clean_name)

        if process_logo(input_path, output_path, filename):
            success += 1
        else:
            failed += 1

    print(f"\n{'=' * 60}")
    print(f"  ✅ {success} logos processed successfully")
    if failed:
        print(f"  ❌ {failed} logos failed")
    print(f"  📁 Output: {OUTPUT_DIR}")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
