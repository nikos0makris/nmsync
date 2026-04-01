import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <h1>Gym Tracker</h1>
      <p>Track workouts, routines, and body metrics.</p>
      <div className="row">
        <Link href="/login">Login</Link>
        <Link href="/signup">Sign up</Link>
      </div>
    </main>
  );
}
