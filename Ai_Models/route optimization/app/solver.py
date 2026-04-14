from ortools.constraint_solver import pywrapcp, routing_enums_pb2

def solve_vrp(distance_matrix, demands, capacity):
    manager = pywrapcp.RoutingIndexManager(len(distance_matrix), 1, 0)
    routing = pywrapcp.RoutingModel(manager)

    def dist_cb(from_i, to_i):
        return int(distance_matrix[manager.IndexToNode(from_i)][manager.IndexToNode(to_i)])

    transit = routing.RegisterTransitCallback(dist_cb)
    routing.SetArcCostEvaluatorOfAllVehicles(transit)

    def demand_cb(from_i):
        return demands[manager.IndexToNode(from_i)]

    demand = routing.RegisterUnaryTransitCallback(demand_cb)

    routing.AddDimensionWithVehicleCapacity(
        demand, 0, [capacity], True, "Capacity"
    )

    params = pywrapcp.DefaultRoutingSearchParameters()
    params.first_solution_strategy = routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC

    solution = routing.SolveWithParameters(params)

    if not solution:
        return []

    route = []
    index = routing.Start(0)

    while not routing.IsEnd(index):
        route.append(manager.IndexToNode(index))
        index = solution.Value(routing.NextVar(index))

    route.append(manager.IndexToNode(index))
    return route