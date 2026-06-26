import { getDb } from "@/lib/db";
import { users, sessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const COOKIE = "session";
const SESSION_DAYS = 30;

async function createSession(userId: string) {
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400 * 1000);
  await getDb().insert(sessions).values({ userId, token, expiresAt });
  cookies().set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export const auth = {
  signUp: {
    async email({ email, password, name }: { email: string; password: string; name?: string }) {
      const existing = await getDb()
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);
      if (existing.length > 0) return { error: { message: "Email already in use" } };
      const hash = await bcrypt.hash(password, 12);
      const [user] = await getDb()
        .insert(users)
        .values({ email: email.toLowerCase(), name: name ?? null, passwordHash: hash })
        .returning({ id: users.id });
      await createSession(user.id);
      return { error: null };
    },
  },

  signIn: {
    async email({ email, password }: { email: string; password: string }) {
      const [user] = await getDb()
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);
      if (!user) return { error: { message: "Invalid email or password" } };
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return { error: { message: "Invalid email or password" } };
      await createSession(user.id);
      return { error: null };
    },
  },

  async getSession() {
    const token = cookies().get(COOKIE)?.value;
    if (!token) return { data: null };
    const [row] = await getDb()
      .select({ userId: sessions.userId, name: users.name, email: users.email })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(eq(sessions.token, token))
      .limit(1);
    if (!row) return { data: null };
    return { data: { user: { id: row.userId, name: row.name, email: row.email } } };
  },

  async signOut() {
    const token = cookies().get(COOKIE)?.value;
    if (token) await getDb().delete(sessions).where(eq(sessions.token, token));
    cookies().delete(COOKIE);
  },
};
