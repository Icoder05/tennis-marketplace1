import { NextResponse } from "next/server";
import { BookingConflictError, cancelBooking, createBooking, listBookings } from "@/lib/store";
import { getUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  try {
    return NextResponse.json({ bookings: await listBookings(userId) });
  } catch (err) {
    console.error("[bookings] DB unavailable:", (err as Error).message);
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body.venueId !== "string" || typeof body.date !== "string" || typeof body.hour !== "number") {
    return NextResponse.json({ error: "venueId, date and hour are required" }, { status: 400 });
  }

  try {
    const booking = await createBooking(userId, body.venueId, body.date, body.hour);
    return NextResponse.json({ booking }, { status: 201 });
  } catch (err) {
    if (err instanceof BookingConflictError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    console.error("[bookings] create failed:", (err as Error).message);
    return NextResponse.json({ error: "Could not create booking" }, { status: 503 });
  }
}

export async function DELETE(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  try {
    const ok = await cancelBooking(userId, id);
    return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
  } catch (err) {
    console.error("[bookings] cancel failed:", (err as Error).message);
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
}
