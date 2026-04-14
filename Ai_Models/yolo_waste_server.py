"""
AI Smart Kachra Vahan — Unified YOLO Waste Detection Server
===========================================================
Exposes all endpoints expected by the Node.js backend:
  POST /predict             → classify uploaded image file
  POST /predict/camera      → classify base64-encoded image
  GET  /detect-from-cam     → capture from ESP32-CAM & classify
  GET  /detect              → manual trigger (IoT / legacy)
  GET  /health              → health check
  GET  /model/info          → model metadata

MQTT publishes to 'swachh/waste_detection' on every new detection.

Start : python yolo_waste_server.py
Port  : 8000  (override with PORT env var)
Config: set ESP32_CAM_URL / MQTT_BROKER / MQTT_PORT / CONF_THRESHOLD
        / AUTO_INTERVAL env vars as needed.
"""

import os
import time
import json
import base64
import threading
import tempfile

import cv2
import numpy as np
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import paho.mqtt.client as mqtt

# ─── CONFIGURATION ───────────────────────────────────────────────────────────────────────
CAM_URL        = os.environ.get("ESP32_CAM_URL",   "http://192.168.43.84/capture")

MQTT_BROKER    = os.environ.get("MQTT_BROKER",    "broker.emqx.io")
MQTT_PORT      = int(os.environ.get("MQTT_PORT",  "1883"))
MQTT_TOPIC     = "swachh/waste_detection"
CONF_THRESHOLD = float(os.environ.get("CONF_THRESHOLD", "0.5"))
AUTO_INTERVAL  = int(os.environ.get("AUTO_INTERVAL",    "0"))  # Set to 0 to disable auto-loop

# ─── DYNAMIC IP DISCOVERY ──────────────────────────────────────────────────
_CURRENT_CAM_IP = "http://192.168.43.84/capture"
_last_scan_time = 0
_scan_lock = threading.Lock()

def _find_esp32():
    """Try to find the ESP32-CAM by scanning nearby IPs on the subnet if it moves."""
    global _CURRENT_CAM_IP, _last_scan_time
    
    # Cooldown: Don't scan more than once every 60 seconds
    now = time.time()
    if now - _last_scan_time < 60:
        return False
        
    with _scan_lock: # Only one thread should scan at a time
        # Check again inside lock
        if now - _last_scan_time < 60: return False
        _last_scan_time = now
        
        try:
            # Extract IP part: http://192.168.29.85/capture -> 192.168.29.85
            ip_part = CAM_URL.split("//")[-1].split("/")[0]
            # Get subnet: 192.168.29.85 -> 192.168.29
            base_ip = ".".join(ip_part.split(".")[:-1])
            
            if not base_ip or len(base_ip.split('.')) < 3:
                base_ip = "192.168.43" # Fallback to user's known subnet
                
            print(f"📡 [Scan] ESP32 not found at {_CURRENT_CAM_IP}. Scanning {base_ip}.1-254...")
            
            # Scan a wider range to be sure
            for i in range(1, 255):
                test_url = f"http://{base_ip}.{i}/capture"
                if test_url == _CURRENT_CAM_IP: continue
                try:
                    # Fast timeout for scanning
                    r = requests.get(test_url, timeout=0.2)
                    if r.status_code == 200:
                        print(f"✨ [Found!] ESP32-CAM moved to: {test_url}")
                        _CURRENT_CAM_IP = test_url
                        return True
                except:
                    continue
        except Exception as e:
            print(f"❌ Scan error: {e}")
    return False



# ─── MODEL PATH ────────────────────────────────────────────────────────────────
_BASE      = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(_BASE, "best_v2.pt")

if os.path.isfile(MODEL_PATH):
    print(f"✅ Model found: {MODEL_PATH}")
else:
    print(f"❌ Model file not found: {MODEL_PATH}")
    print("   Make sure best_v2.pt is present in the Ai_Models/ folder.")

# ─── CREDIT SYSTEM INTEGRATION ─────────────────────────────────────────────
from credit_system import process_segregation_event

# Mock in-memory user registry for real-time tracking
_USERS = {}

def get_or_create_user(user_id="default_user"):
    if user_id not in _USERS:
        _USERS[user_id] = {
            "user_id": user_id,
            "total_points": 0,
            "daily_points": 0,
            "history": []
        }
    return _USERS[user_id]


# ─── WASTE CLASS METADATA ──────────────────────────────────────────────────
WASTE_META = {
    "Biodegradable": {
        "color":  "#4CAF50",
        "icon":   "🌿",
        "bin":    "Green Bin",
        "tip":    "Place in the green bin. Consider home composting for bonus Swachh Points!",
    },
    "Recyclable": {
        "color":  "#3b82f6",
        "icon":   "♻️",
        "bin":    "Blue Bin",
        "tip":    "Clean and dry before disposal. Drop in the blue bin for maximum points.",
    },
    "Hazardous": {
        "color":  "#ef4444",
        "icon":   "⚠️",
        "bin":    "Red Bin (Hazardous Drop Point)",
        "tip":    "Do NOT mix with regular waste. Use designated drop points at ward offices.",
    },
    "Mixed": {
        "color":  "#f59e0b",
        "icon":   "🗑️",
        "bin":    "Grey Bin",
        "tip":    "Please segregate before disposal to avoid point deduction.",
    },
}
_DEFAULT_META = {
    "color":  "#6b7280",
    "icon":   "❓",
    "bin":    "Check locally",
    "tip":    "Unable to determine waste type. Please segregate manually.",
}


# ─── CLASS NAME → STANDARD TYPE ────────────────────────────────────────────
# The best_v2.pt has 3 classes: {0: 'Hazardous', 1: 'biodegradable', 2: 'recyclable'}
# We normalise the raw class name to title case for our UI categories.
def map_class(raw_name: str) -> str:
    """Map raw YOLO class label to one of the standard waste types."""
    name = raw_name.lower().strip()
    if name in ("biodegradable",) or any(k in name for k in ("bio", "organic", "food", "green", "vegeta", "fruit")):
        return "Biodegradable"
    if name in ("recyclable",) or any(k in name for k in ("recycl", "plastic", "paper", "metal", "glass", "card", "bottle", "can")):
        return "Recyclable"
    if name in ("hazardous",) or any(k in name for k in ("hazard", "toxic", "battery", "chemical", "medical", "e-waste", "ewaste")):
        return "Hazardous"
    return "Mixed"


def build_result(
    raw_name: str,
    confidence: float,
    all_scores: dict | None = None,
    all_detections: list | None = None,
    demo_mode: bool = False,
    user_id: str = "default_user"
) -> dict:
    """Build a fully enriched result dict expected by the Node.js backend."""
    waste_type = map_class(raw_name)
    meta = WASTE_META.get(waste_type, _DEFAULT_META)
    
    # --- Integration with Credit Scoring System ---
    # Construct ML Output for the Credit Engine
    # If all_scores is empty (detection mode), we use confidence for the primary class
    composition = {k.lower(): v * 100 for k, v in (all_scores or {waste_type: confidence}).items()}
    # Ensure all 3 categories exist
    for cat in ["hazardous", "biodegradable", "recyclable"]:
        if cat not in composition: composition[cat] = 0.0

    ml_data = {
        "composition": composition,
        "objects": all_detections or [{"class": raw_name, "confidence": confidence}]
    }
    
    # Process through our Backend Systems Engine
    user_obj = get_or_create_user(user_id)
    incentive_data = process_segregation_event(ml_data, user_obj)

    return {
        "waste_type":     waste_type,
        "raw_class":      raw_name,
        "confidence":     round(confidence, 4),
        "color":          meta["color"],
        "icon":           meta["icon"],
        "bin":            meta["bin"],
        "tip":            meta["tip"],
        "all_scores":     all_scores or {},
        "all_detections": all_detections or [],
        "demo_mode":      demo_mode,
        
        # New Credit & Incentive Fields
        "credit_score":      incentive_data["credit_score"],
        "points":            incentive_data["points"],
        "feedback":          incentive_data["feedback"],
        "user_total_points": incentive_data["user_total_points"],
        "user_tier":         incentive_data["user_tier"]
    }


# ─── MODEL LOADING ─────────────────────────────────────────────────────────
try:
    model = YOLO(MODEL_PATH)
    MODEL_LOADED = True
    print("✅ YOLO Model loaded. Classes:", model.names)
except Exception as _e:
    print(f"❌ Model load failed: {_e}")
    model = None
    MODEL_LOADED = False


# ─── BIN LEVEL TRACKING ──────────────────────────────────────────────────
# Map bin IDs to their ultrasonic distance data and calculate fill levels.
# We update the 'bins.json' file so the Route Optimizer sees real-time data.
MQTT_BIN_TOPIC = "swachh/bin_level"
MAX_BIN_DEPTH  = 200 # cm (Distance when bin is empty. Adjust to your hardware)
MIN_BIN_DEPTH  = 10  # cm (Distance when bin is 100% full)

def update_bin_data(bin_id, distance):
    """Calculate fill % and write to bins.json for the Route Optimizer."""
    try:
        # Calculate fill % (Higher distance = emptier bin)
        # Formula: max 0, min 100 of (Total - Current) / (Total - Min) * 100
        fill_pct = max(0, min(100, ((MAX_BIN_DEPTH - distance) / (MAX_BIN_DEPTH - MIN_BIN_DEPTH)) * 100))
        fill_pct = round(fill_pct, 1)

        data_path = os.path.join(_BASE, "route optimization", "data", "bins.json")
        if not os.path.exists(data_path): return

        with _state_lock: # Prevent concurrent file writes
            with open(data_path, "r+", encoding="utf-8") as f:
                bins = json.load(f)
                updated = False
                for b in bins:
                    if b["id"] == bin_id:
                        b["fill"] = fill_pct
                        updated = True
                        break
                
                if updated:
                    f.seek(0)
                    json.dump(bins, f, indent=2)
                    f.truncate()
                    print(f"📊 [Sensor] Bin {bin_id} updated: {distance}cm -> {fill_pct}% full")
    except Exception as e:
        print(f"❌ Bin update error: {e}")


# ─── MQTT CLIENT ──────────────────────────────────────────────────────────
_mqtt_connected = False

def _on_mqtt_message(client, userdata, msg):
    """Handle incoming MQTT messages on subscribed topics."""
    try:
        payload = msg.payload.decode("utf-8")
        topic   = msg.topic
        print(f"📡 [MQTT DEBUG] Received on topic: {topic} | Payload: {payload}")

        # Real-time Bin Level Tracking (Ultrasonic Sensor)
        if topic == MQTT_BIN_TOPIC:
            # Format expected: "Distance: 14.86" or "14.86"
            try:
                # Clean up the string to find the number
                import re
                numbers = re.findall(r"[-+]?\d*\.\d+|\d+", payload)
                if not numbers:
                    print(f"⚠️ [MQTT] No numeric distance found in payload: {payload}")
                    return
                distance = float(numbers[0])
                update_bin_data("B1", distance) 
            except Exception as e:
                print(f"⚠️ [MQTT] Parse error: {e}")

    except Exception as e:
        print(f"⚠️ MQTT message decode error: {e}")


def _on_connect(client, userdata, flags, rc):
    global _mqtt_connected
    if rc == 0:
        _mqtt_connected = True
        print("✅ MQTT connected")
        # Subscribe to bin level topic
        client.subscribe(MQTT_BIN_TOPIC)
        print(f"📡 Subscribed to: {MQTT_BIN_TOPIC}")
    else:
        print(f"❌ MQTT connection failed, rc={rc}")


def _on_disconnect(client, userdata, rc):
    global _mqtt_connected
    _mqtt_connected = False
    print(f"⚠️ MQTT disconnected (rc={rc}), will auto-reconnect")


mqtt_client = mqtt.Client(client_id="waste-server", protocol=mqtt.MQTTv311)
mqtt_client.on_connect    = _on_connect
mqtt_client.on_disconnect = _on_disconnect
mqtt_client.on_message    = _on_mqtt_message # Handle incoming data
mqtt_client.reconnect_delay_set(min_delay=1, max_delay=30)

try:
    mqtt_client.connect(MQTT_BROKER, MQTT_PORT, keepalive=60)
    mqtt_client.loop_start()  # non-blocking background thread
except Exception as _e:
    print(f"⚠️ MQTT initial connect failed: {_e} — will retry automatically")


def send_mqtt(waste_type: str) -> None:
    if not _mqtt_connected:
        print("⚠️ MQTT not connected — skipping publish")
        return
    payload = json.dumps({"waste_type": waste_type, "timestamp": time.time()})
    result = mqtt_client.publish(MQTT_TOPIC, payload, qos=1)
    if result.rc == mqtt.MQTT_ERR_SUCCESS:
        print(f"📡 MQTT sent: {payload}")
    else:
        print(f"❌ MQTT publish failed (rc={result.rc})")


_state_lock  = threading.Lock()
_last_result = None   # last *waste* detection
_latest_frame = None  # raw JPEG bytes of the tray for streaming
_last_detection_time = 0 # Debounce for MQTT/DB triggers


# ─── INFERENCE ─────────────────────────────────────────────────────────────
def run_inference(img_path: str) -> dict:
    """Run YOLO on *img_path* and return an enriched result dict."""
    if not MODEL_LOADED or model is None:
        return build_result("Mixed", 0.5, demo_mode=True)

    results = model(img_path, verbose=False)
    result  = results[0]

    raw_name       = None
    confidence     = 0.0
    all_scores     = {}
    all_detections = []

    # ── Classification model (produces .probs) ──────────────────────────
    if hasattr(result, "probs") and result.probs is not None:
        probs      = result.probs.data.tolist()
        all_scores = {model.names[i]: round(p, 4) for i, p in enumerate(probs)}
        top_idx    = int(result.probs.top1)
        confidence = float(result.probs.top1conf)
        raw_name   = model.names[top_idx]
        print(f"📊 Classification — top: {raw_name} ({confidence:.3f})")

    # ── Detection model (produces .boxes) ──────────────────────────────
    elif hasattr(result, "boxes") and result.boxes is not None and len(result.boxes) > 0:
        for box in result.boxes:
            cls_idx = int(box.cls[0])
            conf    = float(box.conf[0])
            all_detections.append({"class": model.names[cls_idx], "confidence": round(conf, 4)})

        best       = max(result.boxes, key=lambda b: float(b.conf[0]))
        raw_name   = model.names[int(best.cls[0])]
        confidence = float(best.conf[0])
        all_scores = {d["class"]: d["confidence"] for d in all_detections}
        print(f"📦 Detection — best: {raw_name} ({confidence:.3f}), total boxes: {len(result.boxes)}")

    else:
        print("⚠️ No detection result")
        return build_result("Mixed", 0.0, {}, [])

    if confidence < CONF_THRESHOLD:
        print(f"⚠️ Confidence {confidence:.3f} below threshold {CONF_THRESHOLD} — returning Mixed")
        return build_result("Mixed", confidence, all_scores, all_detections)

    print(f"✅ Final: {map_class(raw_name)} (raw={raw_name}, conf={confidence:.3f})")
    return build_result(raw_name, confidence, all_scores, all_detections)


# ─── ESP32-CAM CAPTURE ─────────────────────────────────────────────────────
def capture_from_esp32(retries=3, flash=True) -> tuple:
    """
    Fetch one JPEG frame. Optional flash control.
    """
    global _CURRENT_CAM_IP, _latest_frame
    base_url = _CURRENT_CAM_IP.replace("/capture", "")
    
    def toggle_flash(level):
        """Helper to set ESP32-CAM LED intensity."""
        if not flash: return
        try:
            requests.get(f"{base_url}/control?var=led_intensity&val={level}", timeout=2)
        except:
            pass

    for attempt in range(retries):
        try:
            if flash:
                print("💡 Flash ON...")
                toggle_flash(255)
                time.sleep(0.3)
            
            response = requests.get(_CURRENT_CAM_IP, timeout=5)
            
            if flash:
                print("🌑 Flash OFF...")
                toggle_flash(0)
            
            if response.status_code == 200:
                # Update global latest frame for MJPEG stream
                with _state_lock:
                    _latest_frame = response.content
                
                img_arr = np.frombuffer(response.content, np.uint8)
                frame   = cv2.imdecode(img_arr, cv2.IMREAD_COLOR)
                if frame is not None:
                    tmp = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False)
                    cv2.imwrite(tmp.name, frame)
                    tmp.close()
                    _, buf    = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
                    img_b64   = base64.b64encode(buf).decode("utf-8")
                    return tmp.name, img_b64
            
            print(f"⚠️ [Attempt {attempt+1}] ESP32-CAM error ({response.status_code})")
        except Exception as e:
            print(f"⚠️ [Attempt {attempt+1}] ESP32-CAM timeout at {_CURRENT_CAM_IP} - {e}")
            toggle_flash(0) # Ensure off on error

        if attempt < retries - 1:
            time.sleep(1)
    
    # Discovery removed from automatic capture flow to avoid hangs.
    # User should trigger a scan or we can do it in the background thread.
    return None, None



# ─── AUTO DETECTION LOOP ───────────────────────────────────────────────────
def auto_run() -> None:
    """Continuous Monitoring Thread.
    1. Share latest image via _latest_frame.
    2. When waste is DETECTED, trigger MQTT/UI updates.
    """
    global _last_result, _last_detection_time
    
    print("🚀 Continuous Monitoring started. Waiting for AUTO_INTERVAL > 0...")
    while True:
        if AUTO_INTERVAL <= 0:
            time.sleep(1)
            continue
            
        try:
            # Poll camera WITHOUT flash for continuous look
            img_path, img_b64 = capture_from_esp32(retries=1, flash=False)
            if img_path:
                result = run_inference(img_path)
                
                waste_type = result.get("waste_type", "Unknown")
                confidence = result.get("confidence", 0.0)
                
                # SMART TRIGGER: Only update UI/MQTT if we actually see waste
                # with decent confidence, and it's not "Mixed" (fallback)
                if waste_type != "Mixed" and confidence >= CONF_THRESHOLD:
                    # Debounce: don't spam hardware more than once every 5 seconds for same item
                    now = time.time()
                    if now - _last_detection_time > 5:
                        print(f"🎯 [AUTO] Waste Detected: {waste_type} ({confidence:.2f})")
                        
                        # Re-capture with flash for better data if needed? 
                        # Actually, let's just use the current frame to keep it fast.
                        result["image"]     = img_b64
                        result["timestamp"] = now
                        
                        with _state_lock:
                            _last_result = result
                            _last_detection_time = now

                        send_mqtt(waste_type)
                
                if os.path.exists(img_path):
                    os.unlink(img_path)
        except Exception as e:
            print(f"❌  Monitor error: {e}")
            # If camera is lost, try to find it (respects cooldown)
            _find_esp32()

        # In continuous mode, we wait very little (300ms) or use AUTO_INTERVAL if set high
        interval = max(0.2, AUTO_INTERVAL) if AUTO_INTERVAL > 0 else 1.0
        time.sleep(interval)


# ─── STREAMING ──────────────────────────────────────────────────────────────
from flask import Response

def generate_frames():
    while True:
        with _state_lock:
            if _latest_frame is None:
                time.sleep(0.5)
                continue
            frame = _latest_frame
        
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
        time.sleep(0.1) # Max 10 FPS for stream to avoid CPU spike


# ─── FLASK APP ─────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)


@app.route("/video_feed")
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status":         "ok",
        "model_loaded":   MODEL_LOADED,
        "mqtt_connected": _mqtt_connected,
        "cam_url":        CAM_URL,
        "auto_loop":      AUTO_INTERVAL > 0
    })


@app.route("/model/info", methods=["GET"])
def model_info():
    classes = list(model.names.values()) if MODEL_LOADED and model else []
    return jsonify({
        "model_type":     "YOLOv8",
        "loaded":         MODEL_LOADED,
        "classes":        classes,
        "model_path":     MODEL_PATH,
        "conf_threshold": CONF_THRESHOLD,
    })


@app.route("/predict", methods=["POST"])
def predict_endpoint():
    """Direct image upload (ESP32-CAM POSTing results here)."""
    if "image" not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    img_file = request.files["image"]
    tmp = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False)
    try:
        img_file.save(tmp.name)
        tmp.close()
        result = run_inference(tmp.name)
        send_mqtt(result["waste_type"])
        return jsonify(result)
    except Exception as e:
        print(f"[/predict] Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(tmp.name):
            os.unlink(tmp.name)


@app.route("/predict/camera", methods=["POST"])
def predict_camera():
    """Accept base64 image in JSON body."""
    data      = request.get_json(silent=True) or {}
    image_b64 = data.get("image")
    if not image_b64:
        return jsonify({"error": "No image data. Send base64 'image' field."}), 400

    tmp = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False)
    try:
        tmp.write(base64.b64decode(image_b64))
        tmp.close()
        result = run_inference(tmp.name)
        send_mqtt(result["waste_type"])
        return jsonify(result)
    except Exception as e:
        print(f"[/predict/camera] Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(tmp.name):
            os.unlink(tmp.name)


@app.route("/detect-from-cam", methods=["GET"])
def detect_from_cam():
    """
    TRIGGER POINT: This is the endpoint the ESP32 should call when waste is sensed.
    1. Turn Flash ON
    2. /capture from ESP32
    3. Turn Flash OFF
    4. YOLO Inference
    5. Publish to MQTT
    """
    global _last_result
    print("🔔  Detection Triggered via /detect-from-cam...")
    img_path, img_b64 = capture_from_esp32()
    if img_path is None:
        return jsonify({"error": f"Could not capture from ESP32-CAM at {CAM_URL}"}), 503

    try:
        result             = run_inference(img_path)
        result["image"]    = img_b64  # base64 for frontend preview
        waste_type         = result["waste_type"]

        with _state_lock:
            _last_result = result

        # Always publish MQTT (even for same type — ESP32 needs every trigger)
        send_mqtt(waste_type)

        return jsonify(result)
    except Exception as e:
        print(f"[/detect-from-cam] Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if img_path and os.path.exists(img_path):
            os.unlink(img_path)


@app.route("/detect", methods=["GET"])
def detect_route():
    """Simplified legacy trigger."""
    global _last_result
    img_path, _ = capture_from_esp32()
    if img_path is None:
        with _state_lock:
            cached = _last_result
        if cached:
            return jsonify({"result": cached.get("waste_type", "Unknown"), "cached": True})
        return jsonify({"error": "Camera unavailable and no cached result"}), 503

    try:
        result     = run_inference(img_path)
        waste_type = result.get("waste_type", "Unknown")
        with _state_lock:
            _last_result = result
        send_mqtt(waste_type)
        return jsonify({"result": waste_type})
    except Exception as e:
        print(f"[/detect] Error: {e}")
        return jsonify({"error": str(e)}), 500
@app.route("/latest-result", methods=["GET"])
def get_latest_result():
    """Returns the most recent detection result from the auto-detect loop."""
    with _state_lock:
        if _last_result is None:
            return jsonify({"status": "no_detections"}), 200
        return jsonify(_last_result)


@app.route("/toggle-auto", methods=["POST"])
def toggle_auto():
    """Allow frontend to start/stop the auto-detection loop."""
    global AUTO_INTERVAL
    data = request.get_json(silent=True) or {}
    interval = data.get("interval", 0)
    
    AUTO_INTERVAL = float(interval)
    
    # If starting loop and it's not already running in background... 
    # (Actually it always runs but respects AUTO_INTERVAL)
    
    return jsonify({
        "status": "updated",
        "auto_loop": AUTO_INTERVAL > 0,
        "interval": AUTO_INTERVAL
    })


# ─── MAIN ──────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    # Start background thread (will check AUTO_INTERVAL inside)
    threading.Thread(target=auto_run, daemon=True).start()

    port = int(os.environ.get("PORT", 8000))
    print(f"\n🚀 AI Smart Kachra Vahan Server")
    print(f"🔗 YOLO Waste Server running at http://0.0.0.0:{port}")
    print(f"💡 Recommended Setup: ESP32 triggers http://0.0.0.0:{port}/detect-from-cam\n")
    
    app.run(host="0.0.0.0", port=port, debug=False, threaded=True)
