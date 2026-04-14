import requests

import time

OSRM_BASE = "http://router.project-osrm.org"
_TIMEOUT  = 10  # seconds

# Simple in-memory cache to prevent Rate Limiting (429)
_CACHE = {
    "matrix": {},
    "geometry": {}
}

def call_osrm_with_retry(url: str, max_retries: int = 3):
    """Internal helper to handle OSRM rate limits with exponential backoff."""
    for attempt in range(max_retries):
        try:
            resp = requests.get(url, timeout=_TIMEOUT)
            if resp.status_code == 429:
                print(f"⚠️ OSRM Rate Limited (429). Retrying in {attempt+2}s...")
                time.sleep(attempt + 2)
                continue
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            if attempt == max_retries - 1:
                raise e
            time.sleep(1)
    return None

def get_distance_matrix(locations: list) -> list:
    """Returns a distance matrix for VRP solver (with caching and retries)."""
    if not locations: return []
    coords = ";".join(f"{lng},{lat}" for lat, lng in locations)
    
    if coords in _CACHE["matrix"]:
        return _CACHE["matrix"][coords]

    url = f"{OSRM_BASE}/table/v1/driving/{coords}?annotations=distance"
    try:
        data = call_osrm_with_retry(url)
        matrix = data["distances"]
        _CACHE["matrix"][coords] = matrix
        return matrix
    except Exception as e:
        print(f"❌ Distance Matrix API failed: {e}")
        raise e

def generate_pseudo_road_path(p1, p2):
    """Creates an 'L-shaped' path to mimic city grid turns instead of diagonal lines."""
    # Add a mid-point that creates a 90-degree turn
    return [p1, [p1[0], p2[1]], p2]

def get_route_geometry(ordered_locations: list) -> list:
    """Returns road geometry between waypoints (with caching and L-shaped fallback)."""
    if len(ordered_locations) < 2:
        return ordered_locations

    coords = ";".join(f"{lng},{lat}" for lat, lng in ordered_locations)

    if coords in _CACHE["geometry"]:
        return _CACHE["geometry"][coords]

    url = f"{OSRM_BASE}/route/v1/driving/{coords}?overview=full&geometries=geojson"
    
    try:
        data = call_osrm_with_retry(url)
        if data and data.get("code") == "Ok":
            geojson = data["routes"][0]["geometry"]["coordinates"]
            detailed_route = [[lat, lng] for lng, lat in geojson]
            _CACHE["geometry"][coords] = detailed_route
            return detailed_route
    except Exception as e:
        print(f"⚠️ Ground geometry failed, generating City-Grid path: {e}")
    
    # Fallback to 'City Grid' (Manhattan) pathing instead of straight 'Air' lines
    grid_path = []
    for i in range(len(ordered_locations) - 1):
        segment = generate_pseudo_road_path(ordered_locations[i], ordered_locations[i+1])
        grid_path.extend(segment[:-1])
    grid_path.append(ordered_locations[-1])
    return grid_path
