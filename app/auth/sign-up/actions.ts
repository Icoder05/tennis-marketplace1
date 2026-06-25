"use server";

import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export async function signUpWithEmail(
  _prev: { error: string } | null,
  formData: FormData,
) {
  const { error } = await auth.signUp.email({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    name: formData.get("name") as string,
  });
  if (error) return { error: error.message || "Could not create account" };
  redirect("/");
}
