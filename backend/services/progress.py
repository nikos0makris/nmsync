def summarize_workout_history(rows: list[dict]) -> dict:
    total_sessions = len(rows)
    total_volume = 0.0

    for row in rows:
        reps = float(row.get("reps", 0))
        weight = float(row.get("weight_kg", 0))
        total_volume += reps * weight

    avg_volume = total_volume / total_sessions if total_sessions > 0 else 0.0

    return {
        "total_sessions": total_sessions,
        "total_volume": round(total_volume, 2),
        "average_volume": round(avg_volume, 2),
    }
