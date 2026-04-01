import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", data.user.id)
    .single();

  return (
    <main>
      <h1>Dashboard</h1>
      <p>Welcome, {profile?.display_name ?? "athlete"}.</p>
      <div className="row">
        <Link href="/workouts">Workout logging</Link>
        <Link href="/routines">Routine builder</Link>
        <Link href="/metrics">Body metrics</Link>
        <Link href="/logs">Logs overview</Link>
      </div>
      <form action={signOut}>
        <button type="submit">Sign out</button>
      </form>
    </main>
  );
}
