from datetime import date
from typing import Optional

from pydantic import BaseModel, Field


class WorkoutSetInput(BaseModel):
    exercise_id: str
    reps: int = Field(ge=1)
    weight_kg: float = Field(ge=0)
    rpe: Optional[float] = Field(default=None, ge=1, le=10)


class WorkoutCreateInput(BaseModel):
    name: str
    performed_on: date
    notes: Optional[str] = None
    duration_min: Optional[int] = Field(default=None, ge=1)
    sets: list[WorkoutSetInput]


class RoutineExerciseInput(BaseModel):
    day_index: int = Field(ge=1, le=7)
    exercise_id: str
    target_sets: int = Field(default=3, ge=1, le=20)
    target_rep_min: int = Field(default=8, ge=1, le=50)
    target_rep_max: int = Field(default=12, ge=1, le=50)


class RoutineCreateInput(BaseModel):
    name: str
    goal: Optional[str] = None
    days_per_week: int = Field(default=3, ge=1, le=7)
    exercises: list[RoutineExerciseInput] = []


class BodyMetricCreateInput(BaseModel):
    measured_on: date
    body_weight_kg: float = Field(ge=0)
    body_fat_pct: Optional[float] = Field(default=None, ge=0, le=100)
    waist_cm: Optional[float] = Field(default=None, ge=0)
