"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Exercise = { id: string; name: string };

export default function WorkoutsPage() {
  const [name, setName] = useState("Push Day");
  const [performedOn, setPerformedOn] = useState(new Date().toISOString().slice(0, 10));
  const [exerciseId, setExerciseId] = useState("");
  const [reps, setReps] = useState(8);
  const [weightKg, setWeightKg] = useState(40);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("exercises").select("id,name").limit(100);
      if (data) {
        setExercises(data);
        if (!exerciseId && data.length > 0) setExerciseId(data[0].id);
      }
    };
    void load();
  }, [exerciseId]);

  async function submitWorkout() {
    setMessage("Saving...");
    const supabase = createClient();
    const {
      data: { session }
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setMessage("Please log in first.");
      return;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/workouts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        name,
        performed_on: performedOn,
        sets: [{ exercise_id: exerciseId, reps, weight_kg: weightKg }]
      })
    });

    if (response.ok) {
      setMessage("Workout saved.");
    } else {
      const errorText = await response.text();
      setMessage(`Failed: ${errorText}`);
    }
  }

  return (
    <main>
      <h1>Workout Logging</h1>
      <div className="card">
        <div>
          <label>Workout name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label>Date</label>
          <input type="date" value={performedOn} onChange={(e) => setPerformedOn(e.target.value)} />
        </div>
        <div>
          <label>Exercise</label>
          <select value={exerciseId} onChange={(e) => setExerciseId(e.target.value)}>
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
        </div>
        <div className="row">
          <div>
            <label>Reps</label>
            <input
              type="number"
              value={reps}
              min={1}
              onChange={(e) => setReps(Number(e.target.value))}
            />
          </div>
          <div>
            <label>Weight (kg)</label>
            <input
              type="number"
              value={weightKg}
              min={0}
              step="0.5"
              onChange={(e) => setWeightKg(Number(e.target.value))}
            />
          </div>
        </div>
        <button type="button" onClick={submitWorkout} disabled={!exerciseId}>
          Save workout
        </button>
        <p>{message}</p>
      </div>
    </main>
  );
}
