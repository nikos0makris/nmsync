from services.progress import summarize_workout_history


def test_summarize_workout_history():
    rows = [
        {"reps": 10, "weight_kg": 50},
        {"reps": 8, "weight_kg": 60},
    ]
    result = summarize_workout_history(rows)

    assert result["total_sessions"] == 2
    assert result["total_volume"] == 980.0
    assert result["average_volume"] == 490.0
