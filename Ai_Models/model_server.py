"""
AI Model Server (YOLOv8 Classification)
=========================================
Flask API wrapping the YOLOv8 waste classification model (best_v2.pt).
The Node.js backend can call POST /predict with a multipart image,
or POST /predict/camera with a base64 image.

NOTE: The yolo_waste_server.py is the primary server for production/IoT use
(includes ESP32-CAM + MQTT). This server is a lightweight alternative for
web-only classification (no MQTT, no ESP32-CAM auto-loop).

Both bind to port 8000 — do not run both at the same time.

Start: python model_server.py
Port : 8000  (configurable via PORT env var)
"""

import os
import base64
import tempfile
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO

app = Flask(__name__)
CORS(app)

# ─── MODEL ─────────────────────────────────────────────────────────────────
_BASE      = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(_BASE, "best_v2.pt")
MEMORY_DB  = os.path.join(_BASE, "memory.json")

import json
from PIL import Image

# ─── INSTANT MEMORY SYSTEM ──────────────────────────────────────────────────
def get_image_hash(img_path):
    """Generate a perceptual hash to identify similar images."""
    try:
        with Image.open(img_path) as img:
            # Resize to 8x8 and grayscale for a simple fingerprint
            img = img.resize((8, 8), Image.Resampling.LANCZOS).convert('L')
            pixels = list(img.getdata())
            avg = sum(pixels) / len(pixels)
            return "".join("1" if p > avg else "0" for p in pixels)
    except:
        return None

def load_memory():
    if os.path.exists(MEMORY_DB):
        try:
            with open(MEMORY_DB, 'r') as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_memory(memory_data):
    with open(MEMORY_DB, 'w') as f:
        json.dump(memory_data, f, indent=2)

# Load memory into a global dict for fast lookup
_MEMORY = load_memory()

# Waste class metadata
WASTE_META = {
    "Biodegradable": {
        "color":  "#4CAF50",
        "icon":   "🌿",
        "bin":    "Green Bin",
        "tip":    "Place in the green bin. Consider home composting for bonus Swachh Points!",
        "points": 15,
    },
    "Recyclable": {
        "color":  "#3b82f6",
        "icon":   "♻️",
        "bin":    "Blue Bin",
        "tip":    "Clean and dry before disposal. Drop in the blue bin for maximum points.",
        "points": 20,
    },
    "Hazardous": {
        "color":  "#ef4444",
        "icon":   "⚠️",
        "bin":    "Red Bin (Hazardous Drop Point)",
        "tip":    "Do NOT mix with regular waste. Use designated drop points at ward offices.",
        "points": 25,
    },
    "Mixed": {
        "color":  "#f59e0b",
        "icon":   "🗑️",
        "bin":    "Grey Bin",
        "tip":    "Please segregate before disposal to avoid point deduction.",
        "points": 5,
    },
}
_DEFAULT_META = {
    "color":  "#6b7280",
    "icon":   "❓",
    "bin":    "Check locally",
    "tip":    "Unable to determine waste type. Please segregate manually.",
    "points": 0,
}

# ─── MIXED WASTE DETECTION THRESHOLDS ──────────────────────────────────────
CONF_THRESHOLD     = 0.6    # Below this → Mixed Waste (low confidence)
MIX_DIFF_THRESHOLD = 0.2   # If top1 - top2 < this → Mixed Waste (ambiguous)


def map_class(raw_name: str) -> str:
    """Map raw YOLO class label to a standard waste type."""
    name = raw_name.lower().strip()
    if name in ("biodegradable",) or any(k in name for k in ("bio", "organic", "food", "green")):
        return "Biodegradable"
    if name in ("recyclable",) or any(k in name for k in ("recycl", "plastic", "paper", "metal", "glass")):
        return "Recyclable"
    if name in ("hazardous",) or any(k in name for k in ("hazard", "toxic", "battery", "chemical")):
        return "Hazardous"
    return "Mixed"


# Load model ONCE at startup
_MODEL = None
_MODEL_LOADED = False
try:
    _MODEL = YOLO(MODEL_PATH)
    _MODEL_LOADED = True
    print(f"[INFO] YOLOv8 model loaded: {MODEL_PATH}")
    print(f"[INFO] Classes: {_MODEL.names}")
except Exception as _e:
    print(f"[WARN] Model load failed ({_e}) — running in demo mode")


def run_inference(img_path: str) -> dict:
    """Run YOLO on the image and return enriched result, checking memory first."""
    # 1. Check Instant Memory first
    img_hash = get_image_hash(img_path)
    if img_hash and img_hash in _MEMORY:
        stored = _MEMORY[img_hash]
        waste_type = stored["label"]
        meta = WASTE_META.get(waste_type, _DEFAULT_META)
        print(f"🧠 [Memory Hit] Found correction for this object: {waste_type}")
        return {
            "waste_type":     waste_type,
            "raw_class":      stored.get("raw", "memory_hit"),
            "confidence":     1.0, # 100% sure because user said so
            "color":          meta["color"],
            "icon":           meta["icon"],
            "bin":            meta["bin"],
            "tip":            meta["tip"],
            "points":         meta["points"],
            "all_scores":     {waste_type: 1.0},
            "all_detections": [],
            "demo_mode":      False,
            "from_memory":    True
        }

    # 2. Run AI Inference if not in memory
    if not _MODEL_LOADED or _MODEL is None:
        return {
            "error":      True,
            "waste_type":  "Unknown",
            "raw_class":   "model_not_loaded",
            "confidence":  0.0,
            "color":       "#6b7280",
            "icon":        "❌",
            "bin":         "N/A",
            "tip":         "YOLO model (best_v2.pt) failed to load. Check the server logs.",
            "points":      0,
            "all_scores":  {},
            "all_detections": [],
            "demo_mode":   True,
        }

    results = _MODEL(img_path, verbose=False)
    result  = results[0]

    raw_name   = None
    confidence = 0.0
    all_scores = {}
    mix_status = None       # Will be set if mixed waste is detected

    # Classification model (produces .probs)
    if hasattr(result, "probs") and result.probs is not None:
        probs_tensor = result.probs.data.cpu().numpy()
        all_scores   = {_MODEL.names[i]: round(float(p), 4) for i, p in enumerate(probs_tensor)}

        # Sort by probability (descending)
        sorted_indices = np.argsort(probs_tensor)[::-1]
        top1      = float(probs_tensor[sorted_indices[0]])
        top2      = float(probs_tensor[sorted_indices[1]])
        top1_cls  = _MODEL.names[sorted_indices[0]]
        top2_cls  = _MODEL.names[sorted_indices[1]]

        confidence = top1
        raw_name   = top1_cls

        # ─── MIXED WASTE LOGIC ──────────────────────────────────
        if top1 < CONF_THRESHOLD:
            mix_status = "Mixed Waste (low confidence)"
            print(f"🔀 Mixed — low confidence: {top1_cls} ({top1:.3f})")
        elif abs(top1 - top2) < MIX_DIFF_THRESHOLD:
            mix_status = f"Mixed Waste ({map_class(top1_cls)} + {map_class(top2_cls)})"
            print(f"🔀 Mixed — ambiguous: {top1_cls} ({top1:.3f}) vs {top2_cls} ({top2:.3f})")
        else:
            print(f"📊 Classification — top: {top1_cls} ({top1:.3f})")

        # Log composition
        print("   Composition: " + ", ".join(f"{k}: {v*100:.1f}%" for k, v in all_scores.items()))

    # Detection model (produces .boxes)
    elif hasattr(result, "boxes") and result.boxes is not None and len(result.boxes) > 0:
        best       = max(result.boxes, key=lambda b: float(b.conf[0]))
        raw_name   = _MODEL.names[int(best.cls[0])]
        confidence = float(best.conf[0])
        all_scores = {_MODEL.names[int(b.cls[0])]: round(float(b.conf[0]), 4) for b in result.boxes}
        print(f"📦 Detection — best: {raw_name} ({confidence:.3f})")

    else:
        print("⚠️ No detection result")
        meta = WASTE_META.get("Mixed", _DEFAULT_META)
        return {
            "waste_type": "Mixed", "raw_class": "unknown", "confidence": 0.0,
            "color": meta["color"], "icon": meta["icon"], "bin": meta["bin"],
            "tip": "No objects detected in the image. Try a clearer photo.",
            "points": meta["points"],
            "all_scores": {}, "all_detections": [], "demo_mode": False,
        }

    # ─── BUILD RESPONSE ─────────────────────────────────────────
    if mix_status:
        # Mixed waste detected
        meta = WASTE_META["Mixed"]
        return {
            "waste_type":     "Mixed",
            "raw_class":      raw_name,
            "confidence":     round(confidence, 4),
            "color":          meta["color"],
            "icon":           meta["icon"],
            "bin":            meta["bin"],
            "tip":            f"{mix_status}. Please segregate before disposal.",
            "points":         meta["points"],
            "all_scores":     all_scores,
            "all_detections": [],
            "demo_mode":      False,
            "mix_status":     mix_status,
        }

    # Single class — confident prediction
    waste_type = map_class(raw_name)
    meta = WASTE_META.get(waste_type, _DEFAULT_META)

    return {
        "waste_type":     waste_type,
        "raw_class":      raw_name,
        "confidence":     round(confidence, 4),
        "color":          meta["color"],
        "icon":           meta["icon"],
        "bin":            meta["bin"],
        "tip":            meta["tip"],
        "points":         meta["points"],
        "all_scores":     all_scores,
        "all_detections": [],
        "demo_mode":      False,
    }


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model_loaded': _MODEL_LOADED})


@app.route('/predict', methods=['POST'])
def predict_endpoint():
    """Accept multipart image upload, run YOLO, return enriched result."""
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    img_file = request.files['image']
    tmp = tempfile.NamedTemporaryFile(suffix='.jpg', delete=False)
    try:
        img_file.save(tmp.name)
        tmp.close()
        result = run_inference(tmp.name)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if os.path.exists(tmp.name):
            os.unlink(tmp.name)


@app.route('/predict/camera', methods=['POST'])
def predict_camera():
    """Accept base64 image in JSON body, run YOLO, return enriched result."""
    data      = request.get_json(silent=True) or {}
    image_b64 = data.get("image")
    if not image_b64:
        return jsonify({"error": "No image data. Send base64 'image' field."}), 400

    tmp = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False)
    try:
        tmp.write(base64.b64decode(image_b64))
        tmp.close()
        result = run_inference(tmp.name)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(tmp.name):
            os.unlink(tmp.name)


@app.route('/model/info', methods=['GET'])
def model_info():
    classes = list(_MODEL.names.values()) if _MODEL_LOADED and _MODEL else []
    return jsonify({
        "model_type":     "YOLOv8",
        "loaded":         _MODEL_LOADED,
        "classes":        classes,
        "model_path":     MODEL_PATH,
    })


# ─── FEEDBACK & RETRAINING ────────────────────────────────────────────────
import shutil
import uuid

# Corrections dataset directory
CORRECTIONS_DIR = os.path.join(_BASE, "corrections")
# The 3 model classes (must match model output names exactly)
MODEL_CLASSES = ["Hazardous", "biodegradable", "recyclable"]


def _ensure_corrections_dirs():
    """Create the corrections dataset folder structure if it doesn't exist."""
    for split in ("train", "val"):
        for cls in MODEL_CLASSES:
            d = os.path.join(CORRECTIONS_DIR, split, cls)
            os.makedirs(d, exist_ok=True)


_ensure_corrections_dirs()


@app.route('/feedback', methods=['POST'])
def feedback():
    """
    Save a corrected image to the corrections dataset.
    Accepts multipart form with:
      - 'image': the image file  OR
      - 'image_base64': base64 encoded image
      - 'correct_label': one of Hazardous / biodegradable / recyclable
    """
    correct_label = request.form.get("correct_label") or ""
    correct_label = correct_label.strip()

    # Normalise label to match model class names
    label_lower = correct_label.lower()
    matched = None
    for cls in MODEL_CLASSES:
        if cls.lower() == label_lower:
            matched = cls
            break
    if not matched:
        return jsonify({"error": f"Invalid label '{correct_label}'. Must be one of {MODEL_CLASSES}"}), 400

    # Get image from either file upload or base64
    img_bytes = None
    if "image" in request.files:
        img_bytes = request.files["image"].read()
    elif request.form.get("image_base64"):
        try:
            raw = request.form["image_base64"]
            # Strip data URL prefix if present
            if "," in raw:
                raw = raw.split(",", 1)[1]
            img_bytes = base64.b64decode(raw)
        except Exception as e:
            return jsonify({"error": f"Invalid base64: {e}"}), 400

    if not img_bytes or len(img_bytes) < 100:
        return jsonify({"error": "No image provided or image too small"}), 400

    # Save — 80% train, 20% val
    import random
    split = "train" if random.random() < 0.8 else "val"
    fname = f"{uuid.uuid4().hex}.jpg"
    dest = os.path.join(CORRECTIONS_DIR, split, matched, fname)
    with open(dest, "wb") as f:
        f.write(img_bytes)

    # Count total corrections
    total = sum(
        len(os.listdir(os.path.join(CORRECTIONS_DIR, s, c)))
        for s in ("train", "val") for c in MODEL_CLASSES
        if os.path.isdir(os.path.join(CORRECTIONS_DIR, s, c))
    )

    print(f"✅ Feedback saved: {matched}/{split}/{fname}  (total corrections: {total})")

    # 4. Save to Instant Memory
    # Temporary save for hashing
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
        tmp.write(img_bytes)
        tmp_path = tmp.name
    
    try:
        img_hash = get_image_hash(tmp_path)
        if img_hash:
            _MEMORY[img_hash] = {
                "label": matched,
                "raw":   matched.lower(),
                "time":  fname
            }
            save_memory(_MEMORY)
            print(f"🧠 [Memory Saved] Corrected prediction for hash: {img_hash[:10]}...")
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)

    return jsonify({
        "status":  "saved",
        "label":   matched,
        "split":   split,
        "total":   total,
        "remembered": True
    })



@app.route('/feedback/stats', methods=['GET'])
def feedback_stats():
    """Return count of correction images per class."""
    stats = {}
    total = 0
    for cls in MODEL_CLASSES:
        count = 0
        for split in ("train", "val"):
            d = os.path.join(CORRECTIONS_DIR, split, cls)
            if os.path.isdir(d):
                count += len([f for f in os.listdir(d) if f.endswith(('.jpg', '.png', '.jpeg'))])
        stats[cls] = count
        total += count
    return jsonify({"classes": stats, "total": total})


@app.route('/retrain', methods=['POST'])
def retrain():
    """
    Fine-tune the model on the accumulated corrections dataset.
    Uses incremental training: loads the current model and trains a few more epochs
    on the new correction images.
    """
    global _MODEL, _MODEL_LOADED

    # Check we have enough corrections
    train_dir = os.path.join(CORRECTIONS_DIR, "train")
    total_train = 0
    for cls in MODEL_CLASSES:
        d = os.path.join(train_dir, cls)
        if os.path.isdir(d):
            total_train += len([f for f in os.listdir(d) if f.endswith(('.jpg', '.png', '.jpeg'))])

    if total_train < 3:
        return jsonify({
            "error": f"Need at least 3 correction images to retrain (have {total_train}). "
                     "Submit more feedback first."
        }), 400

    try:
        print(f"🔄 Starting retraining with {total_train} correction images...")

        # Load current model for fine-tuning
        model_to_train = YOLO(MODEL_PATH)

        # Fine-tune on corrections dataset
        # YOLOv8 classify training expects: data=<parent_dir> containing train/ and val/
        results = model_to_train.train(
            data=CORRECTIONS_DIR,
            epochs=10,
            imgsz=224,
            batch=8,
            lr0=0.0005,       # Low learning rate for fine-tuning
            freeze=8,         # Freeze first 8 layers (backbone), only train head
            patience=5,
            project=os.path.join(_BASE, "retrain_runs"),
            name="finetune",
            exist_ok=True,
            verbose=True,
        )

        # Find the new best model
        retrain_best = os.path.join(_BASE, "retrain_runs", "finetune", "weights", "best.pt")
        if not os.path.isfile(retrain_best):
            # Fallback to last.pt
            retrain_best = os.path.join(_BASE, "retrain_runs", "finetune", "weights", "last.pt")

        if os.path.isfile(retrain_best):
            # Backup old model
            backup = MODEL_PATH + ".backup"
            if os.path.isfile(MODEL_PATH):
                shutil.copy2(MODEL_PATH, backup)
                print(f"📦 Old model backed up to {backup}")

            # Replace with new model
            shutil.copy2(retrain_best, MODEL_PATH)
            print(f"✅ New model saved to {MODEL_PATH}")

            # Reload model
            _MODEL = YOLO(MODEL_PATH)
            _MODEL_LOADED = True
            print(f"✅ Model reloaded. Classes: {_MODEL.names}")

            return jsonify({
                "status":        "success",
                "message":       f"Model retrained on {total_train} images and reloaded.",
                "classes":       list(_MODEL.names.values()),
                "backup_saved":  True,
            })
        else:
            return jsonify({"error": "Retraining completed but no model weights found."}), 500

    except Exception as e:
        print(f"❌ Retrain error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Retraining failed: {str(e)}"}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    print(f"[INFO] YOLOv8 Model Server starting on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=False, threaded=True)
