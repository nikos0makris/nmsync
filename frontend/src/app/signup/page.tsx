"use client";

import { useActionState } from "react";
import { signUp } from "@/app/actions";

type AuthState = {
  error?: string;
  message?: string;
};

export default function SignUpPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(signUp, {});

  return (
    <main>
      <h1>Sign up</h1>
      <form action={formAction} className="card">
        <div>
          <label htmlFor="display_name">Display name</label>
          <input id="display_name" name="display_name" required />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required />
        </div>
        <button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create account"}
        </button>
        {state?.error ? <p style={{ color: "#fca5a5" }}>{state.error}</p> : null}
        {state?.message ? <p>{state.message}</p> : null}
      </form>
    </main>
  );
}
