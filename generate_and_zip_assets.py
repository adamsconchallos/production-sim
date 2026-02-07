import os
from PIL import Image
import numpy as np

# --- Configuration ---
INPUT_FILE = 'muntadis_logo.png'
OUTPUT_DIR = 'public'  # Output assets directly to public folder
# ---------------------

def generate_and_zip_assets():
    print(f"Processing {INPUT_FILE}...")

    # 1. Load image and create a transparent version
    try:
        img = Image.open(INPUT_FILE).convert('RGBA')
    except FileNotFoundError:
        print(f"Error: Could not find {INPUT_FILE}. Please make sure it is in this directory.")
        return

    data = np.array(img)
    bg_color = data[0, 0, :3]
    dist = np.linalg.norm(data[:, :, :3] - bg_color, axis=2)
    mask = dist > 30

    new_data = data.copy()
    new_data[:, :, 3] = np.where(mask, 255, 0).astype(np.uint8)
    transparent_img = Image.fromarray(new_data, 'RGBA')

    # 2. Crop to content
    coords = np.argwhere(mask)
    y0, x0 = coords.min(axis=0)
    y1, x1 = coords.max(axis=0) + 1
    cropped_logo = transparent_img.crop((x0, y0, x1, y1))

    # 3. Generate all required files
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Full Logo (Transparent)
    logo_filename = os.path.join(OUTPUT_DIR, 'logo_transparent.png')
    cropped_logo.save(logo_filename)
    print(f"  Created: {logo_filename}")

    # Crop to just the 'M' symbol for icons
    # (Heuristic: crop to top 70% of the logo height)
    symbol_crop = cropped_logo.crop((0, 0, cropped_logo.width, int(cropped_logo.height * 0.7)))

    # Favicon (multi-size .ico)
    favicon_filename = os.path.join(OUTPUT_DIR, 'favicon.ico')
    symbol_crop.save(favicon_filename, sizes=[(16, 16), (32, 32), (48, 48)])
    print(f"  Created: {favicon_filename}")

    # PWA / Mobile Icons
    icon_180 = os.path.join(OUTPUT_DIR, 'apple-touch-icon.png')
    symbol_crop.resize((180, 180), Image.LANCZOS).save(icon_180)
    print(f"  Created: {icon_180}")

    icon_192 = os.path.join(OUTPUT_DIR, 'android-chrome-192.png')
    symbol_crop.resize((192, 192), Image.LANCZOS).save(icon_192)
    print(f"  Created: {icon_192}")

    icon_512 = os.path.join(OUTPUT_DIR, 'android-chrome-512.png')
    symbol_crop.resize((512, 512), Image.LANCZOS).save(icon_512)
    print(f"  Created: {icon_512}")

    print(f"\nSuccess! All assets have been generated in {OUTPUT_DIR}/")

if __name__ == "__main__":
    # You'll need to install pillow and numpy first:
    # pip install pillow numpy
    generate_and_zip_assets()
