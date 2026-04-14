import json
import os

# Resolve data directory relative to this file so the server can be started
# from any working directory (e.g. `uvicorn app.main:app` from the
# `route optimization/` folder).
_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")


def load_json(path: str) -> dict | list | None:
    try:
        if not os.path.exists(path):
            print(f"❌ [state] File NOT found at: {path}")
            return None
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        print(f"❌ [state] JSON parse error in {path}: {e}")
        return None


def reload_state() -> tuple:
    """Re-read bins and truck from disk (useful for dynamic updates)."""
    b = load_json(os.path.join(_DATA_DIR, "bins.json"))
    t = load_json(os.path.join(_DATA_DIR, "truck.json"))
    return b, t


bins, truck = reload_state()


def get_remaining_capacity() -> int:
    return truck.get("capacity_total", 0) - truck.get("capacity_used", 0)
