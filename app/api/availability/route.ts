import { NextResponse } from "next/server";
import { getAvailability, getAvailabilityNoDb } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const venueId = searchParams.get("venueId");
  const date = searchParams.get("date");

  if (!venueId || !date) {
    return NextResponse.json({ error: "venueId and date are required" }, { status: 400 });
  }

  let slots;
  try {
    slots = await getAvailability(venueId, date);
  } catch (err) {
    console.error("[availability] DB unavailable:", (err as Error).message);
    slots = getAvailabilityNoDb(venueId, date);
  }

  if (!slots) {
    return NextResponse.json({ error: "Unknown venue" }, { status: 404 });
  }
  return NextResponse.json({ slots });
}
