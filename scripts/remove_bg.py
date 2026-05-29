import os
import sys
from pathlib import Path

try:
    from rembg import remove
    from PIL import Image
except ImportError:
    print("Error: Missing required libraries.")
    print("Please install them using: pip install rembg pillow onnxruntime")
    sys.exit(1)

def process_image(input_path):
    """
    Removes the background from an image and saves it as a transparent PNG.
    """
    input_path = Path(input_path)
    if not input_path.exists():
        print(f"Error: File not found - {input_path}")
        return

    print(f"Processing: {input_path.name}...")
    
    try:
        # Open the image
        input_image = Image.open(input_path)
        
        # Remove background
        output_image = remove(input_image)
        
        # Prepare output path
        output_path = input_path.parent / f"{input_path.stem}_no_bg.png"
        
        # Save the result
        output_image.save(output_path)
        print(f"Success! Saved to: {output_path}")
        
    except Exception as e:
        print(f"An error occurred while processing {input_path.name}: {e}")

if __name__ == "__main__":
    # Specific images to process
    target_images = [
        r"C:\Users\himil.chauhan\Downloads\Gemini_Generated_Image_x4x29lx4x29lx4x2.png",
        r"C:\Users\himil.chauhan\Downloads\Gemini_Generated_Image_w6m4gaw6m4gaw6m4.png"
    ]
    
    # Process each image
    for img_path in target_images:
        process_image(img_path)
    
    print("\nBackground removal complete.")
