from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.state import reload_state, get_remaining_capacity
from app.routing import select_bins
from app.osrm import get_distance_matrix
from app.solver import solve_vrp

app = FastAPI()

# allow_credentials must be False when allow_origins=["*"];
# mixing both is rejected by browsers (CORS spec violation).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/live")
def live():
    # Reload data on every request
    bins, truck = reload_state()

    # 503 errors if data is missing or totally unreadable
    if not truck or not isinstance(truck, dict):
        print(f"❌ Error: truck.json data is invalid or missing. Got: {type(truck)}")
        raise HTTPException(status_code=503, detail="truck.json could not be loaded or is invalid")
    
    if bins is None or not isinstance(bins, list):
        print(f"❌ Error: bins.json data is invalid or missing. Got: {type(bins)}")
        raise HTTPException(status_code=503, detail="bins.json could not be loaded or is invalid")

    capacity = get_remaining_capacity()
    if capacity <= 0:
        print(f"⚠️ Warning: Truck at full capacity ({truck.get('capacity_used')}/{truck.get('capacity_total')})")
        raise HTTPException(status_code=400, detail="Truck has no remaining capacity")

    # Select bins based on fill level and remaining capacity
    selected  = select_bins(bins, capacity)
    
    # If no bins need collection (>70% fill), just return current truck pos as route
    if not selected:
        return {
            "truck": truck,
            "bins":  bins,
            "route": [(truck["lat"], truck["lng"])],
            "message": "No bins currently require collection (>70% fill)."
        }

    locations = [(truck["lat"], truck["lng"])] + [(b["lat"], b["lng"]) for b in selected]
    demands   = [0] + [b["weight"] for b in selected]

    try:
        # Attempt to get real road distances from OSRM
        matrix = get_distance_matrix(locations)
    except Exception as exc:
        print(f"⚠️ OSRM Fallback: Using straight-line distances due to error: {exc}")
        # FALLBACK: Create a simple Euclidean distance matrix if OSRM fails
        import math
        matrix = []
        for i in range(len(locations)):
            row = []
            for j in range(len(locations)):
                d = math.sqrt((locations[i][0]-locations[j][0])**2 + (locations[i][1]-locations[j][1])**2)
                row.append(d * 111000) # Convert degrees to approx metres
            matrix.append(row)

    route_idx    = solve_vrp(matrix, demands, capacity)
    ordered_coords = [locations[i] for i in route_idx]

    # Ground-way optimization: Convert simple points into detailed road geometry
    from app.osrm import get_route_geometry
    detailed_route = get_route_geometry(ordered_coords)

    return {
        "truck": truck,
        "bins":  bins,
        "route": detailed_route,
        "stops": ordered_coords, # Original sequence for waypoint markers if needed
    }
