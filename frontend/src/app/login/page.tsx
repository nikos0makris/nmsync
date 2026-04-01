"use client";

import { useActionState } from "react";
import { signIn } from "@/app/actions";

type AuthState = {
  error?: string;
  message?: string;
};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(signIn, {});

  return (
    <main>
      <h1>Login</h1>
      <form action={formAction} className="card">
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required />
        </div>
        <button type="submit" disabled={pending}>
          {pending ? "Signing in..." : "Sign in"}
        </button>
        {state?.error ? <p style={{ color: "#fca5a5" }}>{state.error}</p> : null}
        {state?.message ? <p>{state.message}</p> : null}
      </form>
    </main>
  );
}
