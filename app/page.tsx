import { auth } from "@/lib/auth/server";
import AppShell from "@/components/AppShell";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { data: session } = await auth.getSession();
  return (
    <AppShell
      initialAuthed={!!session?.user}
      userName={session?.user?.name ?? session?.user?.email ?? null}
    />
  );
}
