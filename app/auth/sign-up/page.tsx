"use client";

import { useState, useTransition } from "react";
import { signUpWithEmail } from "./actions";
import Link from "next/link";

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await signUpWithEmail(null, formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Create account</h1>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Name
            <input name="name" type="text" required placeholder="Your name" />
          </label>
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
            {isPending ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link href="/auth/sign-in">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
