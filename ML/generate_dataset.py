import csv
import random
import math
import os

random.seed(42)

N = 5000

# --- Country setup ---
COUNTRIES = {
    "China": 0.15, "India": 0.14, "USA": 0.10, "Germany": 0.08, "Italy": 0.06,
    "Switzerland": 0.05, "UK": 0.05, "Japan": 0.05, "South Korea": 0.04, "Brazil": 0.04,
    "Mexico": 0.03, "Netherlands": 0.03, "France": 0.03, "Ireland": 0.03, "Canada": 0.03,
    "Singapore": 0.03, "Australia": 0.02, "South Africa": 0.01, "Egypt": 0.01, "UAE": 0.01,
}

COUNTRY_RISK = {
    "China": 0.65, "India": 0.45, "USA": 0.10, "Germany": 0.12, "Italy": 0.20,
    "Switzerland": 0.08, "UK": 0.12, "Japan": 0.10, "South Korea": 0.18,
    "Brazil": 0.50, "Mexico": 0.48, "Netherlands": 0.10, "France": 0.15,
    "Ireland": 0.10, "Canada": 0.10, "Singapore": 0.12, "Australia": 0.10,
    "South Africa": 0.55, "Egypt": 0.60, "UAE": 0.35,
}

REGION_MAP = {
    "China": "Asia", "India": "Asia", "Japan": "Asia", "South Korea": "Asia", "Singapore": "Asia",
    "Germany": "Europe", "Italy": "Europe", "Switzerland": "Europe", "UK": "Europe",
    "Netherlands": "Europe", "France": "Europe", "Ireland": "Europe",
    "USA": "Americas", "Brazil": "Americas", "Mexico": "Americas", "Canada": "Americas",
    "South Africa": "Africa", "Egypt": "Africa",
    "UAE": "Middle East", "Australia": "Pacific",
}

HIGH_GMP_COUNTRIES = {"USA", "Germany", "Switzerland", "UK"}
HIGH_FDA_COUNTRIES = {"USA", "Germany", "Switzerland"}
HIGH_RISK_COUNTRIES = {"China", "India", "Brazil", "South Africa", "Egypt"}
LOW_RISK_COUNTRIES = {"USA", "Germany", "Switzerland", "UK", "Netherlands", "Canada", "Ireland", "Japan", "Australia"}

# Build country pool
country_pool = []
for c, pct in COUNTRIES.items():
    count = round(pct * N)
    country_pool.extend([c] * count)
# Adjust to exactly N
while len(country_pool) < N:
    country_pool.append(random.choice(list(COUNTRIES.keys())))
while len(country_pool) > N:
    country_pool.pop()
random.shuffle(country_pool)

# Build tier pool: 40% T1, 35% T2, 25% T3
tier_pool = [1] * 2000 + [2] * 1750 + [3] * 1250
random.shuffle(tier_pool)

# Target distribution: low=1250, moderate=1500, high=1500, critical=750
TARGET = {"low": 1250, "moderate": 1500, "high": 1500, "critical": 750}

CONTRACT_DURATIONS = [3, 6, 12, 18, 24, 36]


def clamp(val, lo, hi):
    return max(lo, min(hi, val))


def generate_row(idx, tier, country, target_class=None):
    """Generate a single row. If target_class is given, tune features to hit that risk bucket."""
    row = {}
    row["supplier_id"] = f"SUP-{idx+1:04d}"
    row["tier"] = tier
    row["country"] = country

    region = REGION_MAP[country]
    row["region"] = region

    base_risk = COUNTRY_RISK[country]
    row["country_risk_level"] = round(clamp(base_risk + random.uniform(-0.05, 0.05), 0.0, 1.0), 2)

    # Production capacity
    if tier == 1:
        row["production_capacity_units_month"] = random.randint(100000, 500000)
    elif tier == 2:
        row["production_capacity_units_month"] = random.randint(40000, 150000)
    else:
        row["production_capacity_units_month"] = random.randint(10000, 60000)

    # --- Determine target score range for tuning ---
    if target_class == "low":
        score_target = random.uniform(5, 24)
    elif target_class == "moderate":
        score_target = random.uniform(26, 49)
    elif target_class == "high":
        score_target = random.uniform(51, 74)
    elif target_class == "critical":
        score_target = random.uniform(76, 95)
    else:
        score_target = None

    # active_disruption_signal (25% True)
    row["active_disruption_signal"] = random.random() < 0.25

    # Decide penalty booleans early so we can account for them
    # cold_chain_capable
    row["cold_chain_capable"] = random.random() < 0.50

    # cold_chain_route_mismatch: True only if cold_chain_capable is False, ~15% overall
    if not row["cold_chain_capable"]:
        row["cold_chain_route_mismatch"] = random.random() < 0.30  # ~15% overall (50%*30%)
    else:
        row["cold_chain_route_mismatch"] = False

    # gmp_status
    if country in HIGH_GMP_COUNTRIES:
        row["gmp_status"] = random.random() < 0.90
    else:
        row["gmp_status"] = random.random() < 0.70

    # fda_approved: must be False if gmp_status is False
    if not row["gmp_status"]:
        row["fda_approved"] = False
    else:
        if country in HIGH_FDA_COUNTRIES:
            row["fda_approved"] = random.random() < 0.85
        else:
            row["fda_approved"] = random.random() < 0.60

    # compliance_violation_flag: True only if fda_approved is False, ~20% overall
    if not row["fda_approved"]:
        row["compliance_violation_flag"] = random.random() < 0.50  # ~20% overall
    else:
        row["compliance_violation_flag"] = False

    # upstream_dependency_known
    if tier == 3:
        row["upstream_dependency_known"] = random.random() < 0.55
    else:
        row["upstream_dependency_known"] = random.random() < 0.75

    # is_sole_source & dependency_pct
    row["dependency_pct"] = round(random.uniform(0.10, 1.00), 2)
    if row["dependency_pct"] > 0.85:
        row["is_sole_source"] = random.random() < 0.70
    else:
        row["is_sole_source"] = random.random() < 0.20

    if row["is_sole_source"]:
        row["num_approved_alternates"] = 0
    else:
        row["num_approved_alternates"] = random.randint(1, 5)

    # Calculate penalty sum
    penalty = 0
    if row["is_sole_source"]:
        penalty += 15
    if row["cold_chain_route_mismatch"]:
        penalty += 10
    if row["compliance_violation_flag"]:
        penalty += 12
    if not row["upstream_dependency_known"]:
        penalty += 8

    # Now tune continuous features to hit target score
    # base_score * 100 + penalty = composite_risk_score
    # We want composite_risk_score ≈ score_target
    # So base_score * 100 ≈ score_target - penalty
    desired_base100 = score_target - penalty if score_target is not None else None

    if desired_base100 is not None:
        desired_base100 = clamp(desired_base100, 0, 100)
        desired_base = desired_base100 / 100.0  # 0 to 1 range

        # Weighted components must sum to desired_base
        # We'll generate them proportionally
        # country_risk_level is already set, so fix the rest around it

        crl = row["country_risk_level"]
        crl_contrib = crl * 0.20
        remaining = desired_base - crl_contrib
        # remaining needs to come from the other 0.80 weight

        # We'll distribute remaining across components
        # historical_delay_frequency_pct * 0.20
        # (1 - financial_health_score) * 0.15
        # (1 - upstream_dependency_known) * 0.10  -- already set
        # (lead_time_volatility_days/20) * 0.10
        # (news_sentiment_score * -1) * 0.10
        # port_congestion_risk * 0.05
        # weather_risk_score * 0.05
        # geopolitical_tension_score * 0.05

        udp_known_val = 1 if row["upstream_dependency_known"] else 0
        udp_contrib = (1 - udp_known_val) * 0.10
        remaining -= udp_contrib

        # Remaining weight = 0.70
        # We need to distribute 'remaining' across 7 vars with different weights
        # Target each component to contribute proportionally
        remaining = clamp(remaining, 0, 0.70)
        # Fraction of their max each should contribute
        frac = remaining / 0.70 if remaining > 0 else 0
        frac = clamp(frac, 0, 1)

        # Add some randomness around frac for each component
        def rand_around(f, spread=0.15):
            return clamp(f + random.uniform(-spread, spread), 0, 1)

        hdf_frac = rand_around(frac, 0.12)
        fhs_frac = rand_around(frac, 0.12)
        ltv_frac = rand_around(frac, 0.12)
        ns_frac = rand_around(frac, 0.12)
        pcr_frac = rand_around(frac, 0.12)
        wrs_frac = rand_around(frac, 0.12)
        gts_frac = rand_around(frac, 0.12)

        # historical_delay_frequency_pct: 0.00 to 0.70
        if country in HIGH_RISK_COUNTRIES:
            hdf_base = 0.15 + hdf_frac * 0.45
        elif country in LOW_RISK_COUNTRIES:
            hdf_base = hdf_frac * 0.20
        else:
            hdf_base = hdf_frac * 0.50
        row["historical_delay_frequency_pct"] = round(clamp(hdf_base, 0.0, 0.70), 2)

        # financial_health_score: 0.20 to 1.00 (higher = healthier, lower = more risk)
        fhs_val = 1.0 - fhs_frac * 0.80  # fhs_frac=0 → 1.0, fhs_frac=1 → 0.20
        row["financial_health_score"] = round(clamp(fhs_val, 0.20, 1.00), 2)

        # lead_time_volatility_days: 0.0 to 20.0
        ltv_val = ltv_frac * 20.0
        row["lead_time_volatility_days"] = round(clamp(ltv_val, 0.0, 20.0), 1)

        # news_sentiment_score: -1.00 to 1.00 (negative news = more risk)
        # Contribution: (-news_sentiment) * 0.10
        # Higher frac → more risk → more negative sentiment
        if row["active_disruption_signal"]:
            ns_val = -0.8 + (1 - ns_frac) * 0.6  # range -0.8 to -0.2
        else:
            ns_val = 0.8 - ns_frac * 1.1  # range -0.3 to 0.8
        row["news_sentiment_score"] = round(clamp(ns_val, -1.00, 1.00), 2)

        # port_congestion_risk: 0.00 to 0.90
        if region == "Asia":
            pcr_val = 0.30 + pcr_frac * 0.50
        else:
            pcr_val = 0.05 + pcr_frac * 0.35
        row["port_congestion_risk"] = round(clamp(pcr_val, 0.00, 0.90), 2)

        # weather_risk_score: 0.00 to 0.80
        if region in ("Asia", "Africa", "Americas"):
            wrs_val = wrs_frac * 0.80 * 1.1
        else:
            wrs_val = wrs_frac * 0.60
        row["weather_risk_score"] = round(clamp(wrs_val, 0.00, 0.80), 2)

        # geopolitical_tension_score: 0.00 to 0.90
        if country == "China":
            gts_val = 0.55 + gts_frac * 0.35
        elif region == "Middle East":
            gts_val = 0.50 + gts_frac * 0.35
        elif region in ("Europe", "Americas") and country in LOW_RISK_COUNTRIES:
            gts_val = 0.05 + gts_frac * 0.20
        else:
            gts_val = 0.10 + gts_frac * 0.50
        row["geopolitical_tension_score"] = round(clamp(gts_val, 0.00, 0.90), 2)

    else:
        # Fallback: generate naturally
        _generate_features_natural(row, country, region, tier)

    # capacity_utilization_pct: high risk → 0.85-1.00
    computed_score = _compute_score(row)
    if computed_score > 60:
        row["capacity_utilization_pct"] = round(random.uniform(0.85, 1.00), 2)
    else:
        row["capacity_utilization_pct"] = round(random.uniform(0.40, 0.92), 2)

    # avg_lead_time_days
    if tier == 1:
        row["avg_lead_time_days"] = random.randint(7, 30)
    elif tier == 2:
        row["avg_lead_time_days"] = random.randint(15, 60)
    else:
        row["avg_lead_time_days"] = random.randint(30, 90)

    # batch_cycle_time_days
    row["batch_cycle_time_days"] = random.randint(3, 30)

    # batch_failure_rate_pct: correlate with historical_delay_frequency_pct
    hdf = row["historical_delay_frequency_pct"]
    bfr = hdf * random.uniform(0.2, 0.6)
    row["batch_failure_rate_pct"] = round(clamp(bfr, 0.00, 0.30), 2)

    # contract_duration_months
    row["contract_duration_months"] = random.choice(CONTRACT_DURATIONS)

    # geographic_concentration_pct
    if country in ("China", "India"):
        row["geographic_concentration_pct"] = round(random.uniform(0.50, 0.90), 2)
    else:
        row["geographic_concentration_pct"] = round(random.uniform(0.10, 1.00), 2)

    return row


def _generate_features_natural(row, country, region, tier):
    """Generate features without targeting a specific score."""
    if country in HIGH_RISK_COUNTRIES:
        row["historical_delay_frequency_pct"] = round(random.uniform(0.15, 0.60), 2)
    elif country in LOW_RISK_COUNTRIES:
        row["historical_delay_frequency_pct"] = round(random.uniform(0.00, 0.20), 2)
    else:
        row["historical_delay_frequency_pct"] = round(random.uniform(0.05, 0.45), 2)

    row["financial_health_score"] = round(random.uniform(0.20, 1.00), 2)

    hdf = row["historical_delay_frequency_pct"]
    row["lead_time_volatility_days"] = round(clamp(hdf * random.uniform(10, 40), 0.0, 20.0), 1)

    if row["active_disruption_signal"]:
        row["news_sentiment_score"] = round(random.uniform(-0.80, -0.20), 2)
    else:
        row["news_sentiment_score"] = round(random.uniform(-0.30, 0.80), 2)

    if region == "Asia":
        row["port_congestion_risk"] = round(random.uniform(0.30, 0.80), 2)
    else:
        row["port_congestion_risk"] = round(random.uniform(0.05, 0.40), 2)

    if region in ("Asia", "Africa", "Americas"):
        row["weather_risk_score"] = round(random.uniform(0.05, 0.80), 2)
    else:
        row["weather_risk_score"] = round(random.uniform(0.00, 0.55), 2)

    if country == "China":
        row["geopolitical_tension_score"] = round(random.uniform(0.55, 0.90), 2)
    elif region == "Middle East":
        row["geopolitical_tension_score"] = round(random.uniform(0.50, 0.85), 2)
    elif region in ("Europe", "Americas") and country in LOW_RISK_COUNTRIES:
        row["geopolitical_tension_score"] = round(random.uniform(0.05, 0.25), 2)
    else:
        row["geopolitical_tension_score"] = round(random.uniform(0.10, 0.60), 2)


def _compute_score(row):
    udp_known_val = 1 if row["upstream_dependency_known"] else 0
    base = (
        row["country_risk_level"] * 0.20 +
        row["historical_delay_frequency_pct"] * 0.20 +
        (1 - row["financial_health_score"]) * 0.15 +
        (1 - udp_known_val) * 0.10 +
        (row["lead_time_volatility_days"] / 20) * 0.10 +
        (row["news_sentiment_score"] * -1) * 0.10 +
        row["port_congestion_risk"] * 0.05 +
        row["weather_risk_score"] * 0.05 +
        row["geopolitical_tension_score"] * 0.05
    ) * 100

    if row["is_sole_source"]:
        base += 15
    if row["cold_chain_route_mismatch"]:
        base += 10
    if row["compliance_violation_flag"]:
        base += 12
    if not row["upstream_dependency_known"]:
        base += 8

    return clamp(round(base, 2), 0, 100)


def classify(score):
    if score <= 25:
        return "low"
    elif score <= 50:
        return "moderate"
    elif score <= 75:
        return "high"
    else:
        return "critical"


def apply_noise(row):
    """Apply ±5% noise to float columns, keeping bounds."""
    float_cols_bounds = {
        "country_risk_level": (0.0, 1.0),
        "capacity_utilization_pct": (0.40, 1.00),
        "lead_time_volatility_days": (0.0, 20.0),
        "historical_delay_frequency_pct": (0.00, 0.70),
        "batch_failure_rate_pct": (0.00, 0.30),
        "financial_health_score": (0.20, 1.00),
        "dependency_pct": (0.10, 1.00),
        "geographic_concentration_pct": (0.10, 1.00),
        "news_sentiment_score": (-1.00, 1.00),
        "port_congestion_risk": (0.00, 0.90),
        "weather_risk_score": (0.00, 0.80),
        "geopolitical_tension_score": (0.00, 0.90),
    }
    for col, (lo, hi) in float_cols_bounds.items():
        val = row[col]
        noise = val * random.uniform(-0.05, 0.05)
        if col == "lead_time_volatility_days":
            row[col] = round(clamp(val + noise, lo, hi), 1)
        else:
            row[col] = round(clamp(val + noise, lo, hi), 2)


# ===== MAIN GENERATION =====
print("Generating 5000 rows...", flush=True)

# Phase 1: Generate rows with target class assignments
class_counts = {"low": 1250, "moderate": 1500, "high": 1500, "critical": 750}
class_assignments = []
for cls, cnt in class_counts.items():
    class_assignments.extend([cls] * cnt)
random.shuffle(class_assignments)

rows = []
for i in range(N):
    tier = tier_pool[i]
    country = country_pool[i]
    target_cls = class_assignments[i]
    row = generate_row(i, tier, country, target_class=target_cls)
    rows.append(row)

# Phase 2: Apply noise to float columns (but NOT recompute score yet, we do that after)
for row in rows:
    apply_noise(row)

# Phase 3: Compute composite_risk_score and classify
for row in rows:
    row["composite_risk_score"] = _compute_score(row)
    row["risk_classification"] = classify(row["composite_risk_score"])

# Phase 4: Enforce exact class distribution
# Count current distribution
current_counts = {"low": 0, "moderate": 0, "high": 0, "critical": 0}
class_buckets = {"low": [], "moderate": [], "high": [], "critical": []}
for i, row in enumerate(rows):
    cls = row["risk_classification"]
    current_counts[cls] += 1
    class_buckets[cls].append(i)

print(f"Initial distribution: {current_counts}", flush=True)

# Iteratively adjust rows to meet target distribution
MAX_ITER = 50
for iteration in range(MAX_ITER):
    over_classes = [c for c in class_counts if current_counts[c] > class_counts[c]]
    under_classes = [c for c in class_counts if current_counts[c] < class_counts[c]]

    if not over_classes and not under_classes:
        break

    # For each over class, try to move rows to an under class
    moved = 0
    for oc in over_classes:
        excess = current_counts[oc] - class_counts[oc]
        random.shuffle(class_buckets[oc])
        candidates = class_buckets[oc][:excess]

        for idx in candidates:
            if not under_classes:
                break
            uc = random.choice(under_classes)
            row = rows[idx]

            # Decide target score for the under class
            if uc == "low":
                target_score = random.uniform(5, 24)
            elif uc == "moderate":
                target_score = random.uniform(26, 49)
            elif uc == "high":
                target_score = random.uniform(51, 74)
            else:
                target_score = random.uniform(76, 95)

            # Adjust financial_health_score and historical_delay_frequency_pct to shift score
            current_score = row["composite_risk_score"]
            diff = target_score - current_score

            # Try adjusting multiple features
            # Adjust financial_health_score (weight 0.15, inverted)
            fhs_adj = -diff / (0.15 * 100) * random.uniform(0.3, 0.5)
            new_fhs = clamp(row["financial_health_score"] + fhs_adj, 0.20, 1.00)
            row["financial_health_score"] = round(new_fhs, 2)

            # Adjust historical_delay_frequency_pct (weight 0.20)
            hdf_adj = diff / (0.20 * 100) * random.uniform(0.3, 0.5)
            new_hdf = clamp(row["historical_delay_frequency_pct"] + hdf_adj, 0.00, 0.70)
            row["historical_delay_frequency_pct"] = round(new_hdf, 2)

            # Adjust lead_time_volatility_days (weight 0.10, /20)
            ltv_adj = diff / (0.10 * 100) * 20 * random.uniform(0.1, 0.3)
            new_ltv = clamp(row["lead_time_volatility_days"] + ltv_adj, 0.0, 20.0)
            row["lead_time_volatility_days"] = round(new_ltv, 1)

            # Adjust news_sentiment_score (weight 0.10, negated)
            ns_adj = -diff / (0.10 * 100) * random.uniform(0.1, 0.3)
            new_ns = clamp(row["news_sentiment_score"] + ns_adj, -1.00, 1.00)
            row["news_sentiment_score"] = round(new_ns, 2)

            # Recompute score
            row["composite_risk_score"] = _compute_score(row)
            new_cls = classify(row["composite_risk_score"])
            old_cls = row["risk_classification"]

            if new_cls != old_cls:
                # Update buckets
                class_buckets[old_cls].remove(idx)
                current_counts[old_cls] -= 1
                row["risk_classification"] = new_cls
                class_buckets[new_cls].append(idx)
                current_counts[new_cls] += 1
                moved += 1

                # Refresh under_classes
                under_classes = [c for c in class_counts if current_counts[c] < class_counts[c]]

    print(f"  Iteration {iteration+1}: moved {moved} rows. Distribution: {current_counts}", flush=True)
    if all(current_counts[c] == class_counts[c] for c in class_counts):
        break

# Phase 5: Final hard enforcement - if still not exact, do targeted single-feature adjustments
for final_pass in range(100):
    if all(current_counts[c] == class_counts[c] for c in class_counts):
        break

    over_classes = [c for c in class_counts if current_counts[c] > class_counts[c]]
    under_classes = [c for c in class_counts if current_counts[c] < class_counts[c]]

    if not over_classes or not under_classes:
        break

    oc = over_classes[0]
    uc = under_classes[0]
    idx = class_buckets[oc][-1]
    row = rows[idx]

    if uc == "low":
        target_score = random.uniform(8, 22)
    elif uc == "moderate":
        target_score = random.uniform(28, 48)
    elif uc == "high":
        target_score = random.uniform(53, 73)
    else:
        target_score = random.uniform(78, 95)

    # Brute force: set financial_health_score and hdf to hit target
    penalty = 0
    if row["is_sole_source"]:
        penalty += 15
    if row["cold_chain_route_mismatch"]:
        penalty += 10
    if row["compliance_violation_flag"]:
        penalty += 12
    if not row["upstream_dependency_known"]:
        penalty += 8

    needed_base100 = target_score - penalty
    needed_base = needed_base100 / 100.0

    # Fix other components, solve for fhs
    udp_known_val = 1 if row["upstream_dependency_known"] else 0
    other = (
        row["country_risk_level"] * 0.20 +
        (1 - udp_known_val) * 0.10 +
        (row["lead_time_volatility_days"] / 20) * 0.10 +
        (row["news_sentiment_score"] * -1) * 0.10 +
        row["port_congestion_risk"] * 0.05 +
        row["weather_risk_score"] * 0.05 +
        row["geopolitical_tension_score"] * 0.05
    )

    # needed_base = other + hdf * 0.20 + (1 - fhs) * 0.15
    # Two unknowns - pick hdf first
    if uc in ("low", "moderate"):
        new_hdf = random.uniform(0.00, 0.25)
    elif uc == "high":
        new_hdf = random.uniform(0.20, 0.55)
    else:
        new_hdf = random.uniform(0.40, 0.70)
    new_hdf = clamp(new_hdf, 0.00, 0.70)

    remainder = needed_base - other - new_hdf * 0.20
    # remainder = (1 - fhs) * 0.15 → fhs = 1 - remainder/0.15
    if abs(0.15) > 1e-9:
        new_fhs = 1.0 - remainder / 0.15
    else:
        new_fhs = 0.60
    new_fhs = clamp(new_fhs, 0.20, 1.00)

    row["historical_delay_frequency_pct"] = round(new_hdf, 2)
    row["financial_health_score"] = round(new_fhs, 2)

    # Also adjust lead_time_volatility and news_sentiment if needed
    if uc == "low":
        row["lead_time_volatility_days"] = round(random.uniform(0.0, 5.0), 1)
        if not row["active_disruption_signal"]:
            row["news_sentiment_score"] = round(random.uniform(0.3, 0.8), 2)
    elif uc == "critical":
        row["lead_time_volatility_days"] = round(random.uniform(12.0, 20.0), 1)
        row["news_sentiment_score"] = round(random.uniform(-1.0, -0.3), 2)

    row["composite_risk_score"] = _compute_score(row)
    new_cls = classify(row["composite_risk_score"])
    old_cls = row["risk_classification"]

    if new_cls != old_cls:
        class_buckets[old_cls].remove(idx)
        current_counts[old_cls] -= 1
        row["risk_classification"] = new_cls
        class_buckets[new_cls].append(idx)
        current_counts[new_cls] += 1

print(f"Final distribution: {current_counts}", flush=True)

# Phase 6: Validate logical constraints
violations = 0
for row in rows:
    # fda_approved False → gmp_status must be False  (actually: gmp False → fda False)
    if not row["gmp_status"] and row["fda_approved"]:
        row["fda_approved"] = False
        violations += 1
    # compliance_violation_flag True → fda_approved must be False
    if row["compliance_violation_flag"] and row["fda_approved"]:
        row["compliance_violation_flag"] = False
        violations += 1
    # cold_chain_route_mismatch True → cold_chain_capable must be False
    if row["cold_chain_route_mismatch"] and row["cold_chain_capable"]:
        row["cold_chain_route_mismatch"] = False
        violations += 1
    # is_sole_source True → num_approved_alternates must be 0
    if row["is_sole_source"] and row["num_approved_alternates"] != 0:
        row["num_approved_alternates"] = 0
        violations += 1

# Recompute scores after any constraint fixes
for row in rows:
    row["composite_risk_score"] = _compute_score(row)
    row["risk_classification"] = classify(row["composite_risk_score"])

print(f"Constraint violations fixed: {violations}", flush=True)

# Recount after fixes
final_counts = {"low": 0, "moderate": 0, "high": 0, "critical": 0}
for row in rows:
    final_counts[row["risk_classification"]] += 1
print(f"Post-fix distribution: {final_counts}", flush=True)

# If post-fix distribution is off, do another round of adjustments
for extra_pass in range(200):
    if all(final_counts[c] == class_counts[c] for c in class_counts):
        break

    over_classes = [c for c in class_counts if final_counts[c] > class_counts[c]]
    under_classes = [c for c in class_counts if final_counts[c] < class_counts[c]]
    if not over_classes or not under_classes:
        break

    oc = over_classes[0]
    uc = under_classes[0]

    # Find a row in the over class
    for i, row in enumerate(rows):
        if row["risk_classification"] != oc:
            continue

        if uc == "low":
            ts = random.uniform(8, 22)
        elif uc == "moderate":
            ts = random.uniform(28, 48)
        elif uc == "high":
            ts = random.uniform(53, 73)
        else:
            ts = random.uniform(78, 95)

        penalty = 0
        if row["is_sole_source"]:
            penalty += 15
        if row["cold_chain_route_mismatch"]:
            penalty += 10
        if row["compliance_violation_flag"]:
            penalty += 12
        if not row["upstream_dependency_known"]:
            penalty += 8

        needed_base100 = ts - penalty
        needed_base = needed_base100 / 100.0

        udp_known_val = 1 if row["upstream_dependency_known"] else 0
        other = (
            row["country_risk_level"] * 0.20 +
            (1 - udp_known_val) * 0.10 +
            (row["lead_time_volatility_days"] / 20) * 0.10 +
            (row["news_sentiment_score"] * -1) * 0.10 +
            row["port_congestion_risk"] * 0.05 +
            row["weather_risk_score"] * 0.05 +
            row["geopolitical_tension_score"] * 0.05
        )

        if uc in ("low", "moderate"):
            new_hdf = random.uniform(0.00, 0.20)
        elif uc == "high":
            new_hdf = random.uniform(0.20, 0.50)
        else:
            new_hdf = random.uniform(0.40, 0.70)
        new_hdf = clamp(new_hdf, 0.00, 0.70)

        remainder = needed_base - other - new_hdf * 0.20
        new_fhs = 1.0 - remainder / 0.15 if abs(0.15) > 1e-9 else 0.60
        new_fhs = clamp(new_fhs, 0.20, 1.00)

        row["historical_delay_frequency_pct"] = round(new_hdf, 2)
        row["financial_health_score"] = round(new_fhs, 2)

        if uc == "low":
            row["lead_time_volatility_days"] = round(clamp(random.uniform(0.0, 4.0), 0.0, 20.0), 1)
            if not row["active_disruption_signal"]:
                row["news_sentiment_score"] = round(random.uniform(0.3, 0.8), 2)
        elif uc == "critical":
            row["lead_time_volatility_days"] = round(clamp(random.uniform(13.0, 20.0), 0.0, 20.0), 1)
            row["news_sentiment_score"] = round(clamp(random.uniform(-1.0, -0.4), -1.0, 1.0), 2)

        row["batch_failure_rate_pct"] = round(clamp(row["historical_delay_frequency_pct"] * random.uniform(0.2, 0.6), 0.00, 0.30), 2)

        row["composite_risk_score"] = _compute_score(row)
        new_cls = classify(row["composite_risk_score"])

        if new_cls == uc:
            old_cls = row["risk_classification"]
            row["risk_classification"] = new_cls
            final_counts[old_cls] -= 1
            final_counts[new_cls] += 1
            break

print(f"Final final distribution: {final_counts}", flush=True)

# Phase 7: Shuffle rows to avoid monotonic trends
random.shuffle(rows)

# Phase 8: Reassign supplier_ids after shuffle
for i, row in enumerate(rows):
    row["supplier_id"] = f"SUP-{i+1:04d}"

# Phase 9: Check uniqueness
row_tuples = set()
for row in rows:
    t = tuple(row.values())
    row_tuples.add(t)
print(f"Unique rows: {len(row_tuples)}/{N}", flush=True)

# Phase 10: Write CSV
COLUMNS = [
    "supplier_id", "tier", "country", "country_risk_level", "region",
    "production_capacity_units_month", "capacity_utilization_pct",
    "gmp_status", "fda_approved", "cold_chain_capable", "avg_lead_time_days",
    "lead_time_volatility_days", "historical_delay_frequency_pct",
    "batch_cycle_time_days", "batch_failure_rate_pct", "financial_health_score",
    "upstream_dependency_known", "dependency_pct", "is_sole_source",
    "num_approved_alternates", "contract_duration_months",
    "geographic_concentration_pct", "news_sentiment_score",
    "port_congestion_risk", "weather_risk_score", "geopolitical_tension_score",
    "active_disruption_signal", "cold_chain_route_mismatch",
    "compliance_violation_flag", "composite_risk_score", "risk_classification",
]

output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "pharma_supply_chain_risk_data.csv")

with open(output_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(COLUMNS)
    for row in rows:
        writer.writerow([row[c] for c in COLUMNS])

print(f"CSV written to {output_path}", flush=True)

# Final validation
null_count = 0
for row in rows:
    for c in COLUMNS:
        if row[c] is None or row[c] == "":
            null_count += 1
print(f"Null values: {null_count}", flush=True)
print("Done!", flush=True)
