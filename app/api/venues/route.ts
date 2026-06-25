import { NextResponse } from "next/server";
import { VENUES } from "@/lib/data";
import { bookedHoursByVenue, openTonight } from "@/lib/store";
import { todayISO } from "@/lib/dates";

export const dynamic = "force-dynamic";

export async function GET() {
  const today = todayISO();
  let byVenue: Record<string, Set<number>> = {};
  try {
    byVenue = await bookedHoursByVenue(today);
  } catch (err) {
    console.error("[venues] DB unavailable:", (err as Error).message);
  }
  const venues = VENUES.map((v) => ({ ...v, openTonight: openTonight(v.id, today, byVenue[v.id]) }));
  return NextResponse.json({ venues });
}
