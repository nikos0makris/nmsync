import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type WorkoutRow = {
  id: string;
  name: string;
  performed_on: string;
  created_at: string;
};

type SetRow = {
  id: string;
  reps: number;
  weight_kg: number;
  set_order: number;
  workouts: { name: string; performed_on: string; user_id: string } | null;
  exercises: { name: string } | null;
};

type MetricRow = {
  id: string;
  measured_on: string;
  body_weight_kg: number;
  body_fat_pct: number | null;
  waist_cm: number | null;
};

export default async function LogsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect("/login");
  }

  const { count: workoutsCount } = await supabase
    .from("workouts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", data.user.id);

  const { count: metricsCount } = await supabase
    .from("body_metrics")
    .select("*", { count: "exact", head: true })
    .eq("user_id", data.user.id);

  const { data: workouts } = await supabase
    .from("workouts")
    .select("id,name,performed_on,created_at")
    .eq("user_id", data.user.id)
    .order("performed_on", { ascending: false })
    .limit(10);

  const { data: sets } = await supabase
    .from("workout_sets")
    .select("id,reps,weight_kg,set_order,workouts!inner(name,performed_on,user_id),exercises(name)")
    .eq("workouts.user_id", data.user.id)
    .order("id", { ascending: false })
    .limit(15);

  const { data: metrics } = await supabase
    .from("body_metrics")
    .select("id,measured_on,body_weight_kg,body_fat_pct,waist_cm")
    .eq("user_id", data.user.id)
    .order("measured_on", { ascending: false })
    .limit(10);

  return (
    <main>
      <h1>Logs Overview</h1>
      <p>Overview of your latest training and body tracking logs.</p>
      <div className="row">
        <div className="card">
          <strong>Total workouts:</strong> {workoutsCount ?? 0}
        </div>
        <div className="card">
          <strong>Total metrics:</strong> {metricsCount ?? 0}
        </div>
      </div>

      <div className="card">
        <h2>Recent Workouts</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {(workouts as WorkoutRow[] | null)?.map((w) => (
              <tr key={w.id}>
                <td>{w.performed_on}</td>
                <td>{w.name}</td>
                <td>{new Date(w.created_at).toLocaleString()}</td>
              </tr>
            )) ?? null}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>Recent Sets</h2>
        <table>
          <thead>
            <tr>
              <th>Workout</th>
              <th>Exercise</th>
              <th>Set</th>
              <th>Reps</th>
              <th>Weight (kg)</th>
            </tr>
          </thead>
          <tbody>
            {(sets as SetRow[] | null)?.map((s) => (
              <tr key={s.id}>
                <td>{s.workouts?.name ?? "-"}</td>
                <td>{s.exercises?.name ?? "-"}</td>
                <td>{s.set_order}</td>
                <td>{s.reps}</td>
                <td>{s.weight_kg}</td>
              </tr>
            )) ?? null}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>Recent Body Metrics</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Weight (kg)</th>
              <th>Body fat %</th>
              <th>Waist (cm)</th>
            </tr>
          </thead>
          <tbody>
            {(metrics as MetricRow[] | null)?.map((m) => (
              <tr key={m.id}>
                <td>{m.measured_on}</td>
                <td>{m.body_weight_kg}</td>
                <td>{m.body_fat_pct ?? "-"}</td>
                <td>{m.waist_cm ?? "-"}</td>
              </tr>
            )) ?? null}
          </tbody>
        </table>
      </div>

      <Link href="/dashboard">Back to dashboard</Link>
    </main>
  );
}
