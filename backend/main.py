import os
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import Client, create_client

from schemas.models import BodyMetricCreateInput, RoutineCreateInput, WorkoutCreateInput
from services.progress import summarize_workout_history

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
CORS_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")

app = FastAPI(title="Gym Tracker API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[CORS_ORIGIN],
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def get_user_id(authorization: str | None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")

    token = authorization.replace("Bearer ", "").strip()
    try:
        auth_response = supabase.auth.get_user(token)
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid token") from exc

    user = getattr(auth_response, "user", None)
    user_id = getattr(user, "id", None)
    if not user_id:
        raise HTTPException(status_code=401, detail="Token missing user")
    return user_id


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/workouts")
def create_workout(payload: WorkoutCreateInput, authorization: str | None = Header(default=None)):
    user_id = get_user_id(authorization)

    workout_row = {
        "user_id": user_id,
        "performed_on": payload.performed_on.isoformat(),
        "name": payload.name,
        "notes": payload.notes,
        "duration_min": payload.duration_min,
    }
    workout = supabase.table("workouts").insert(workout_row).execute().data[0]

    sets = []
    for idx, workout_set in enumerate(payload.sets, start=1):
        sets.append(
            {
                "workout_id": workout["id"],
                "exercise_id": workout_set.exercise_id,
                "set_order": idx,
                "reps": workout_set.reps,
                "weight_kg": workout_set.weight_kg,
                "rpe": workout_set.rpe,
            }
        )
    if sets:
        supabase.table("workout_sets").insert(sets).execute()

    return {"id": workout["id"]}


@app.post("/routines")
def create_routine(payload: RoutineCreateInput, authorization: str | None = Header(default=None)):
    user_id = get_user_id(authorization)
    routine = (
        supabase.table("routines")
        .insert(
            {
                "user_id": user_id,
                "name": payload.name,
                "goal": payload.goal,
                "days_per_week": payload.days_per_week,
            }
        )
        .execute()
        .data[0]
    )

    routine_exercises = []
    for row in payload.exercises:
        routine_exercises.append(
            {
                "routine_id": routine["id"],
                "day_index": row.day_index,
                "exercise_id": row.exercise_id,
                "target_sets": row.target_sets,
                "target_rep_min": row.target_rep_min,
                "target_rep_max": row.target_rep_max,
            }
        )
    if routine_exercises:
        supabase.table("routine_exercises").insert(routine_exercises).execute()

    return {"id": routine["id"]}


@app.post("/body-metrics")
def create_body_metric(payload: BodyMetricCreateInput, authorization: str | None = Header(default=None)):
    user_id = get_user_id(authorization)
    row = (
        supabase.table("body_metrics")
        .insert(
            {
                "user_id": user_id,
                "measured_on": payload.measured_on.isoformat(),
                "body_weight_kg": payload.body_weight_kg,
                "body_fat_pct": payload.body_fat_pct,
                "waist_cm": payload.waist_cm,
            }
        )
        .execute()
        .data[0]
    )
    return row


@app.get("/progress/summary")
def progress_summary(authorization: str | None = Header(default=None)):
    user_id = get_user_id(authorization)
    start_date = (datetime.now(timezone.utc) - timedelta(days=30)).date().isoformat()

    rows = (
        supabase.table("workout_sets")
        .select("reps,weight_kg,workouts!inner(user_id,performed_on)")
        .eq("workouts.user_id", user_id)
        .gte("workouts.performed_on", start_date)
        .execute()
        .data
    )

    flattened = [{"reps": r["reps"], "weight_kg": r["weight_kg"]} for r in rows]
    return summarize_workout_history(flattened)
