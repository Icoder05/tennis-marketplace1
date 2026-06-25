import { and, asc, eq } from "drizzle-orm";
import { Booking, Slot } from "./types";
import { BOOKING_FEE, HOURS, baseBooked, courtNo, fmtTime, priceAt, venueById } from "./data";
import { getDb } from "./db";
import { bookings, BookingRow, NewBookingRow } from "./db/schema";

/**
 * DB-backed store (Neon Postgres via Drizzle).
 *
 * "Seeded" demand still comes from baseBooked() in data.ts so the marketplace
 * looks busy without seeding rows. Real bookings live in the `bookings` table.
 * A slot is taken if EITHER the seed marks it OR a row exists. When you want the
 * table to be the only source of truth, delete baseBooked() and the OR below.
 */

export class BookingConflictError extends Error {
  constructor(message = "That slot is no longer available") {
    super(message);
    this.name = "BookingConflictError";
  }
}

function toBooking(r: BookingRow): Booking {
  return {
    id: r.id,
    venueId: r.venueId,
    date: r.date,
    hour: r.hour,
    court: r.court,
    price: r.price,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
  };
}

export async function getAvailability(venueId: string, date: string): Promise<Slot[] | null> {
  const v = venueById(venueId);
  if (!v) return null;
  const rows = await getDb()
    .select({ hour: bookings.hour })
    .from(bookings)
    .where(and(eq(bookings.venueId, venueId), eq(bookings.date, date)));
  const taken = new Set(rows.map((r) => r.hour));
  return HOURS.map((h) => ({
    hour: h,
    time: fmtTime(h),
    price: priceAt(v, h),
    booked: baseBooked(v, date, h) || taken.has(h),
  }));
}

// Seeded-only availability — used when DB is not yet configured.
export function getAvailabilityNoDb(venueId: string, date: string): Slot[] | null {
  const v = venueById(venueId);
  if (!v) return null;
  return HOURS.map((h) => ({
    hour: h,
    time: fmtTime(h),
    price: priceAt(v, h),
    booked: baseBooked(v, date, h),
  }));
}

// One query for a whole day, grouped by venue — used to compute "open tonight"
// for every venue on the Discover screen without N round trips.
export async function bookedHoursByVenue(date: string): Promise<Record<string, Set<number>>> {
  const rows = await getDb()
    .select({ venueId: bookings.venueId, hour: bookings.hour })
    .from(bookings)
    .where(eq(bookings.date, date));
  const m: Record<string, Set<number>> = {};
  for (const r of rows) (m[r.venueId] ??= new Set()).add(r.hour);
  return m;
}

export function openTonight(venueId: string, todayIso: string, dbHours?: Set<number>): number {
  const v = venueById(venueId);
  if (!v) return 0;
  let n = 0;
  for (const h of [17, 18, 19, 20, 21]) {
    const booked = baseBooked(v, todayIso, h) || (dbHours?.has(h) ?? false);
    if (!booked) n++;
  }
  return n;
}

export async function createBooking(
  userId: string,
  venueId: string,
  date: string,
  hour: number,
): Promise<Booking> {
  const v = venueById(venueId);
  if (!v) throw new Error("Unknown venue");
  if (!HOURS.includes(hour)) throw new Error("Invalid time slot");

  // Seeded backdrop slots are not real rows but should still read as taken.
  if (baseBooked(v, date, hour)) throw new BookingConflictError();

  const row: NewBookingRow = {
    id: "b_" + Math.random().toString(36).slice(2, 10),
    userId,
    venueId,
    date,
    hour,
    court: courtNo(v, date, hour),
    price: priceAt(v, hour) + BOOKING_FEE,
  };

  try {
    const [inserted] = await getDb().insert(bookings).values(row).returning();
    return toBooking(inserted);
  } catch (err: unknown) {
    // 23505 = unique_violation. This is the real concurrency guarantee firing.
    const e = err as { code?: string; message?: string };
    if (e?.code === "23505" || /duplicate key|unique/i.test(String(e?.message))) {
      throw new BookingConflictError();
    }
    throw err;
  }
}

export async function listBookings(userId: string): Promise<Booking[]> {
  const rows = await getDb()
    .select()
    .from(bookings)
    .where(eq(bookings.userId, userId))
    .orderBy(asc(bookings.date), asc(bookings.hour));
  return rows.map(toBooking);
}

export async function cancelBooking(userId: string, id: string): Promise<boolean> {
  const deleted = await getDb()
    .delete(bookings)
    .where(and(eq(bookings.id, id), eq(bookings.userId, userId)))
    .returning({ id: bookings.id });
  return deleted.length > 0;
}
