"""
AI Smart Kachra Vahan — Waste Image Classifier
================================================
Model  : MobileNetV2 fine-tuned on custom waste dataset
Classes: Biodegradable | Recyclable | Hazardous | Mixed
Usage  : python waste_classifier.py --image path/to/img.jpg
"""

import os
import json
import argparse
import numpy as np

# ── Optional heavy imports (comment out if not installed) ──
try:
    import tensorflow as tf
    from tensorflow.keras.applications import MobileNetV2
    from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
    from tensorflow.keras.preprocessing import image as keras_image
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False

# ── Constants ─────────────────────────────────────────────
IMG_SIZE    = (224, 224)
CLASSES     = ['Biodegradable', 'Recyclable', 'Hazardous', 'Mixed']
MODEL_PATH  = os.path.join(os.path.dirname(__file__), 'waste_model.h5')

TIPS = {
    'Biodegradable': 'Place in the green bin. Consider home composting for bonus Swachh Points!',
    'Recyclable':    'Clean and dry before disposal. Drop in the blue bin for maximum points.',
    'Hazardous':     'Do NOT mix with regular waste. Use designated drop points at ward offices.',
    'Mixed':         'Please segregate before disposal to avoid point deduction.',
}


# ── Model loader ──────────────────────────────────────────
def load_model():
    """Load fine-tuned MobileNetV2 or fall back to base weights."""
    if not TF_AVAILABLE:
        raise ImportError("TensorFlow is not installed. Run: pip install tensorflow")

    if os.path.exists(MODEL_PATH):
        print(f"[INFO] Loading saved model from {MODEL_PATH}")
        return tf.keras.models.load_model(MODEL_PATH)

    print("[INFO] No saved model found — loading base MobileNetV2 (demo mode)")
    base = MobileNetV2(weights='imagenet', include_top=False,
                       input_shape=(*IMG_SIZE, 3), pooling='avg')
    x = tf.keras.layers.Dense(128, activation='relu')(base.output)
    x = tf.keras.layers.Dropout(0.3)(x)
    out = tf.keras.layers.Dense(len(CLASSES), activation='softmax')(x)
    model = tf.keras.Model(inputs=base.input, outputs=out)
    return model


# ── Inference ─────────────────────────────────────────────
def predict(img_path: str, model=None) -> dict:
    """
    Predict waste type from an image file.

    Returns
    -------
    dict with keys: waste_type, confidence, tip, all_scores
    """
    if not TF_AVAILABLE:
        # Fallback demo output when TF is not available
        import random
        cls  = random.choice(CLASSES)
        conf = round(random.uniform(0.65, 0.96), 4)
        return {
            'waste_type':  cls,
            'confidence':  conf,
            'tip':         TIPS[cls],
            'all_scores':  {c: round(random.uniform(0.01, 0.2), 4) for c in CLASSES},
            'demo_mode':   True,
        }

    if model is None:
        model = load_model()

    img  = keras_image.load_img(img_path, target_size=IMG_SIZE)
    arr  = keras_image.img_to_array(img)
    arr  = preprocess_input(np.expand_dims(arr, axis=0))

    preds      = model.predict(arr, verbose=0)[0]
    top_idx    = int(np.argmax(preds))
    waste_type = CLASSES[top_idx]
    confidence = float(preds[top_idx])

    return {
        'waste_type':  waste_type,
        'confidence':  round(confidence, 4),
        'tip':         TIPS[waste_type],
        'all_scores':  {CLASSES[i]: round(float(preds[i]), 4) for i in range(len(CLASSES))},
        'demo_mode':   False,
    }


# ── Training scaffold ─────────────────────────────────────
def build_training_model():
    """
    Returns a compiled model ready for fine-tuning.
    Dataset structure expected:
        data/
          train/
            Biodegradable/ ...
            Recyclable/    ...
            Hazardous/     ...
            Mixed/         ...
          val/ (same structure)
    """
    if not TF_AVAILABLE:
        raise ImportError("TensorFlow is required for training.")

    base = MobileNetV2(weights='imagenet', include_top=False,
                       input_shape=(*IMG_SIZE, 3), pooling='avg')
    # Freeze base layers
    for layer in base.layers[:-30]:
        layer.trainable = False

    x   = tf.keras.layers.Dense(256, activation='relu')(base.output)
    x   = tf.keras.layers.BatchNormalization()(x)
    x   = tf.keras.layers.Dropout(0.4)(x)
    x   = tf.keras.layers.Dense(128, activation='relu')(x)
    x   = tf.keras.layers.Dropout(0.3)(x)
    out = tf.keras.layers.Dense(len(CLASSES), activation='softmax')(x)

    model = tf.keras.Model(inputs=base.input, outputs=out)
    model.compile(
        optimizer=tf.keras.optimizers.Adam(1e-4),
        loss='categorical_crossentropy',
        metrics=['accuracy'],
    )
    return model


# ── CLI ───────────────────────────────────────────────────
if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Waste Image Classifier')
    parser.add_argument('--image', type=str, help='Path to input image')
    parser.add_argument('--json',  action='store_true', help='Output as JSON')
    args = parser.parse_args()

    if not args.image:
        print("Usage: python waste_classifier.py --image path/to/image.jpg")
    else:
        result = predict(args.image)
        if args.json:
            print(json.dumps(result, indent=2))
        else:
            print(f"\n🔍 Waste Type  : {result['waste_type']}")
            print(f"📊 Confidence  : {result['confidence']*100:.1f}%")
            print(f"💡 Suggestion  : {result['tip']}")
            if result.get('demo_mode'):
                print("\n⚠️  Running in demo mode (TensorFlow not installed)")
