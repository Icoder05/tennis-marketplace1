"use client";

import { useState, useTransition } from "react";
import { signInWithEmail } from "./actions";
import Link from "next/link";

export default function SignInPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await signInWithEmail(null, formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Sign in</h1>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input name="email" type="email" required placeholder="you@example.com" />
          </label>
          <label>
            Password
            <input name="password" type="password" required placeholder="••••••••" />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={isPending} className="btn ball">
            {isPending ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="auth-footer">
          No account? <Link href="/auth/sign-up">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
