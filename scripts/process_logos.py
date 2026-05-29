import os
import json
from PIL import Image, ImageOps

def make_transparent_and_dark_mode(img, threshold=240, mode="standard"):
    """
    Standard mode: Makes periphery white transparent.
    Smart Dark mode: Makes periphery white transparent AND converts black/gray text to white.
    """
    img = img.convert("RGBA")
    datas = img.getdata()
    
    new_data = []
    
    # Mode-specific parameters
    # Mode "standard" = just transparency
    # Mode "dark" = transparency + whiten dark-grays/blacks while preserving colors
    
    for item in datas:
        r, g, b, a = item
        
        # 1. Background Transparency Check (threshold-based white removal)
        if r > threshold and g > threshold and b > threshold:
            new_data.append((255, 255, 255, 0)) # Fully transparent
            continue
            
        # 2. Dark Mode Color Switching (only if in "dark" mode)
        if mode == "dark":
            # Identify "Neutral Dark" pixels (Grays and Blacks)
            # Check for low saturation: max difference between R,G,B is small
            # AND low brightness: mean of R,G,B is relatively low
            diff = max(r, g, b) - min(r, g, b)
            avg = (r + g + b) / 3
            
            if diff < 30 and avg < 200: # Threshold for "Dark Gray/Black"
                # Switch to white but preserve original alpha
                new_data.append((255, 255, 255, a))
                continue
        
        # 3. Preserve Original pixel (including colored icons)
        new_data.append(item)
            
    img.putdata(new_data)
    return img


def generate_favicon(transparent_img, size=64):
    """
    Content-aware favicon generator.
    Uses getbbox() to detect the exact logo content area from a transparent image,
    then applies a smart heuristic for horizontal logos (Icon + Text) and fits it
    into a square canvas while maximizing size.
    """
    img = transparent_img.convert("RGBA")
    
    # Step 1: Detect the bounding box of non-transparent content
    bbox = img.getbbox()
    
    if bbox is None:
        return Image.new("RGBA", (size, size), (0, 0, 0, 0))
    
    # Step 2: Content cropping & Smart Icon Extraction
    content = img.crop(bbox)
    content_w, content_h = content.size
    
    # HEURISTIC: If the logo is significantly wider than it is tall (horizontal layout),
    # it likely has a square icon on the left followed by text on the right.
    # A wide logo shrunk to a square becomes microscopic, so we extract the left square.
    if content_w > content_h * 1.3:
        # Crop the leftmost square area (width = height)
        left_square = content.crop((0, 0, content_h, content_h))
        # Re-evaluate the bounding box of this new square to ensure no empty space
        icon_bbox = left_square.getbbox()
        if icon_bbox:
            content = left_square.crop(icon_bbox)
            content_w, content_h = content.size

    # Step 3: Calculate scale to fit within the target square
    # Maximize the size using 96% of the canvas (very little padding)
    usable_size = int(size * 0.96)
    scale = min(usable_size / content_w, usable_size / content_h)
    
    new_w = max(1, int(content_w * scale))
    new_h = max(1, int(content_h * scale))
    
    # Step 4: High-quality downscale using LANCZOS resampling
    content_resized = content.resize((new_w, new_h), Image.LANCZOS)
    
    # Step 5: Center on a transparent square canvas
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    offset_x = (size - new_w) // 2
    offset_y = (size - new_h) // 2
    canvas.paste(content_resized, (offset_x, offset_y), content_resized)
    
    return canvas


def process_directory(input_dir, output_dirs, favicon_dir):
    """
    Main processing pipeline:
    1. Generate transparent versions (standard + dark mode)
    2. Generate content-aware favicons from the transparent versions
    """
    # Ensure all output dirs exist
    for mode, path in output_dirs.items():
        if not os.path.exists(path):
            os.makedirs(path)
    
    if not os.path.exists(favicon_dir):
        os.makedirs(favicon_dir)
        
    print(f"Scanning {input_dir} for logos...")
    files = sorted([f for f in os.listdir(input_dir) if f.lower().endswith('.png') and f.startswith('logo')])
    
    total_processed = 0
    favicon_count = 0
    
    for filename in files:
        input_path = os.path.join(input_dir, filename)
        
        try:
            with Image.open(input_path) as img:
                print(f"\nProcessing {filename} ({img.size[0]}x{img.size[1]})...")
                
                # ── Phase 1: Transparency Processing ─────────────────────
                # 1a. Standard Transparent Version
                standard_path = os.path.join(output_dirs["standard"], filename)
                std_img = make_transparent_and_dark_mode(img, mode="standard")
                std_img.save(standard_path, "PNG")
                
                # 1b. Smart Dark Mode Version (White text)
                dark_path = os.path.join(output_dirs["dark"], filename)
                dark_img = make_transparent_and_dark_mode(img, mode="dark")
                dark_img.save(dark_path, "PNG")
                
                print(f"  ✓ Transparent versions generated")
                
                # ── Phase 2: Favicon Generation ──────────────────────────
                # Use the standard transparent version as source for favicon
                # (better content detection since background is already removed)
                
                # Generate 64x64 favicon (good balance of clarity and file size)
                favicon_img = generate_favicon(std_img, size=64)
                
                # Extract the logo number for the favicon filename
                # e.g., "logo12.png" → "FavIcon_logo12.png"
                favicon_filename = f"FavIcon_{filename}"
                favicon_path = os.path.join(favicon_dir, favicon_filename)
                favicon_img.save(favicon_path, "PNG", optimize=True)
                
                favicon_count += 1
                print(f"  ✓ Favicon generated: {favicon_filename} (64x64)")
                
                total_processed += 1
                
        except Exception as e:
            print(f"  ✗ Error processing {filename}: {e}")

    # Generate metadata for the frontend
    metadata = {
        "totalLogos": len(files),
        "faviconSize": 64,
        "faviconDir": "/Logos/Favicons/"
    }
    metadata_path = os.path.join(input_dir, "logo_metadata.json")
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"\n{'='*60}")
    print(f"  Pipeline Complete!")
    print(f"  • {total_processed} logos processed")
    print(f"  • {favicon_count} favicons generated at 64x64")
    print(f"  • Metadata: {metadata_path}")
    print(f"{'='*60}")


if __name__ == "__main__":
    input_folder = r"frontend/public/Logos"
    output_folders = {
        "standard": r"frontend/public/Logos/Transparent",
        "dark": r"frontend/public/Logos/Transparent_Dark"
    }
    favicon_folder = r"frontend/public/Logos/Favicons"
    
    process_directory(input_folder, output_folders, favicon_folder)
    print("\nSmart Logo Laboratory Pipeline complete.")
