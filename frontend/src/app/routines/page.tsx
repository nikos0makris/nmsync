"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function RoutinesPage() {
  const [name, setName] = useState("Upper/Lower Split");
  const [goal, setGoal] = useState("Hypertrophy");
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [message, setMessage] = useState("");

  async function createRoutine() {
    setMessage("Saving...");
    const supabase = createClient();
    const {
      data: { session }
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setMessage("Please log in first.");
      return;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/routines`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        name,
        goal,
        days_per_week: daysPerWeek,
        exercises: []
      })
    });

    if (response.ok) {
      setMessage("Routine saved.");
    } else {
      setMessage("Routine save failed.");
    }
  }

  return (
    <main>
      <h1>Routine Builder</h1>
      <div className="card">
        <div>
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label>Goal</label>
          <input value={goal} onChange={(e) => setGoal(e.target.value)} />
        </div>
        <div>
          <label>Days per week</label>
          <input
            type="number"
            value={daysPerWeek}
            min={1}
            max={7}
            onChange={(e) => setDaysPerWeek(Number(e.target.value))}
          />
        </div>
        <button type="button" onClick={createRoutine}>
          Save routine
        </button>
        <p>{message}</p>
      </div>
    </main>
  );
}
