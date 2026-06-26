"use client";

export const authClient = {
  async signOut() {
    await fetch("/api/auth/sign-out", { method: "POST" });
  },
};
