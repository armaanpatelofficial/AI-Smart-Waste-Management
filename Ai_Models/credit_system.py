import datetime

# ==========================================
# ⚙️ CONFIG & TIERS
# ==========================================
TIERS = {
    "Gold": 500,
    "Silver": 200,
    "Bronze": 0
}

# ==========================================
# 🧠 CREDIT CALCULATION
# ==========================================

def compute_credit(composition):
    """
    Evaluates segregation purity and extracts credit score (0-100).
    Input: {"recyclable": float, "biodegradable": float, "hazardous": float}
    """
    values = list(composition.values())
    if not values:
        return 0.0

    # Step 1: Compute Purity (max of any single category)
    purity = max(values)

    # Step 2: Compute Contamination
    contamination = 100 - purity

    # Step 3: Base Credit
    # Penalty of 0.5x for any non-primary waste in the bin
    credit = purity - (0.5 * contamination)

    # Step 4: Hazard Penalty
    # Extreme penalty for dangerous mixing of hazardous waste (>20%)
    if composition.get("hazardous", 0) > 20:
        credit -= 30

    # Clamp result between 0 and 100
    return max(0.0, min(100.0, float(credit)))

# ==========================================
# ⚡ POINT SYSTEM
# ==========================================

def compute_points(final_category):
    """
    Simpler Point Rules:
    - Segregated (Bio/Rec/Haz) -> +10
    - Mixed -> -5
    """
    cat = final_category.lower()
    if cat == "mixed":
        return -5
    # Any other segregated type
    return 10

# ==========================================
# 📅 DAILY BONUS SYSTEM
# ==========================================

def calculate_daily_bonus(model_accuracy_day, points_earned):
    """
    Applies logic for daily performance.
    Only allows penalties if the model's daily accuracy is reliable (>80%).
    """
    if model_accuracy_day >= 0.80:
        # System is confident enough to reward/penalize
        return 10 if points_earned > 0 else -5
    
    # System not confident enough; neutral bonus
    return 0

# ==========================================
# 👤 USER MANAGEMENT
# ==========================================

def update_user_state(user, credit_score, points, category_name):
    """
    Updates the local user object and maintains history.
    Enforces: 10 points/day and 300 points/month limits.
    """
    now_dt = datetime.datetime.now()
    today_str = now_dt.strftime("%Y-%m-%d")
    month_str = now_dt.strftime("%Y-%m")
    
    # Initialize tracking fields if missing
    if "last_update_day" not in user: user["last_update_day"] = ""
    if "last_update_month" not in user: user["last_update_month"] = ""
    if "daily_points" not in user: user["daily_points"] = 0
    if "monthly_points" not in user: user["monthly_points"] = 0
    if "total_points" not in user: user["total_points"] = 0

    # Reset daily/monthly counters if date changed
    if user["last_update_day"] != today_str:
        user["daily_points"] = 0
        user["last_update_day"] = today_str
    
    if user["last_update_month"] != month_str:
        user["monthly_points"] = 0
        user["last_update_month"] = month_str

    # Enforce Limits
    points_to_add = points
    
    # 1. Day Limit: Max 10 per day
    if user["daily_points"] + points_to_add > 10:
        points_to_add = max(0, 10 - user["daily_points"])
        
    # 2. Month Limit: Max 300 per month
    if user["monthly_points"] + points_to_add > 300:
        points_to_add = max(0, 300 - user["monthly_points"])

    # Create event record
    event = {
        "timestamp": now_dt.isoformat(),
        "credit": credit_score,
        "points_delta": points_to_add,
        "category": category_name,
        "limit_reached": points > 0 and points_to_add == 0
    }

    # Update counters
    user["total_points"]   += points_to_add
    user["daily_points"]   += points_to_add
    user["monthly_points"] += points_to_add
    
    # Append to history
    if "history" not in user: user["history"] = []
    user["history"].append(event)
    user["history"] = user["history"][-50:]

    # Recalculate Tier
    current_tier = "Bronze"
    for tier, min_pts in sorted(TIERS.items(), key=lambda x: x[1], reverse=True):
        if user["total_points"] >= min_pts:
            current_tier = tier
            break
    
    user["tier"] = current_tier
    return user

# ==========================================
# 🧠 FEEDBACK GENERATION
# ==========================================

def get_feedback(credit_score, composition):
    """
    Generates user-friendly messages based on the classification result.
    """
    hazardous = composition.get("hazardous", 0)
    
    if hazardous > 15:
        return "⚠️ Hazardous waste detected! Please handle separately for safety."
    if credit_score >= 85:
        return "🌟 Excellent segregation! You are a Gold standard citizen."
    if credit_score >= 65:
        return "✅ Good job, but there's a slight contamination in the mix."
    if credit_score >= 40:
        return "📝 Mixed waste detected. Try to separate dry and wet items better next time."
    return "❌ Poor segregation. Please ensure hazardous and non-biodegradable items are not mixed."

# ==========================================
# ⚙️ MAIN INTEGRATION WRAPPER
# ==========================================

def process_segregation_event(ml_output, user_obj):
    """
    The main entry point for the backend systems integration.
    ml_output format: {"composition": {...}, "objects": [...]}
    """
    composition = ml_output.get("composition", {"recyclable": 0, "biodegradable": 0, "hazardous": 0})
    
    # 1. Compute scores
    credit = compute_credit(composition)
    
    # 2. Determine final winning category for display
    sorted_items = sorted(composition.items(), key=lambda x: x[1], reverse=True)
    final_category = sorted_items[0][0] if sorted_items else "unknown"
    
    # 3. Compute points based on category
    points = compute_points(final_category)
    
    # 4. Generate human feedback
    feedback = get_feedback(credit, composition)
    
    # 5. Update user profile
    updated_user = update_user_state(user_obj, credit, points, final_category)
    
    # 5. Build Standard Output
    return {
        "credit_score": round(credit, 2),
        "points": points,
        "final_category": final_category.capitalize(),
        "feedback": feedback,
        "user_total_points": updated_user["total_points"],
        "user_tier": updated_user["tier"]
    }
