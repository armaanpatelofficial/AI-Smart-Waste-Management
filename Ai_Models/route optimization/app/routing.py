def select_bins(bins, capacity):
    active = [b for b in bins if b["fill"] > 70]
    active.sort(key=lambda x: x["fill"], reverse=True)

    selected = []
    total = 0

    for b in active:
        if total + b["weight"] <= capacity:
            selected.append(b)
            total += b["weight"]

    return selected