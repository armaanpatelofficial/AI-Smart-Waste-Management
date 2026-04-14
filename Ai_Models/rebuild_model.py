"""
Rebuild best.pt from extracted directory.
The best.pt folder contains the extracted PyTorch model.
This script re-packages it into a proper .pt file that ultralytics can load.

Usage: python rebuild_model.py
"""

import zipfile
import os

EXTRACTED_DIR = os.path.join(os.path.dirname(__file__), 'best.pt', 'best')
OUTPUT_FILE   = os.path.join(os.path.dirname(__file__), 'best_v2.pt')

def rebuild():
    if not os.path.isdir(EXTRACTED_DIR):
        print(f"[ERROR] Extracted model directory not found: {EXTRACTED_DIR}")
        return

    print(f"[INFO] Re-packaging model from: {EXTRACTED_DIR}")
    print(f"[INFO] Output file: {OUTPUT_FILE}")

    with zipfile.ZipFile(OUTPUT_FILE, 'w', zipfile.ZIP_STORED) as zf:
        for root, dirs, files in os.walk(EXTRACTED_DIR):
            for file in files:
                file_path = os.path.join(root, file)
                # Archive name should be relative to the parent of EXTRACTED_DIR
                arcname = os.path.relpath(file_path, os.path.dirname(EXTRACTED_DIR))
                zf.write(file_path, arcname)
                print(f"  Added: {arcname}")

    size_mb = os.path.getsize(OUTPUT_FILE) / (1024 * 1024)
    print(f"\n[SUCCESS] Model rebuilt: {OUTPUT_FILE} ({size_mb:.2f} MB)")

if __name__ == '__main__':
    rebuild()
