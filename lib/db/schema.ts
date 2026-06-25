import { pgTable, text, integer, date, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";

/**
 * bookings — the one table that holds real, durable state.
 *
 * The UNIQUE index on (venue_id, date, hour) is the actual double-booking
 * guarantee. Two concurrent POSTs for the same slot both pass the JS pre-check,
 * but only one INSERT can win the unique index — the other throws code 23505,
 * which the store turns into a clean 409. The database, not the app, is the
 * source of truth.
 *
 * Note (capacity): this models one booking per (venue, hour), matching the
 * current UI which shows a single slot per hour. A venue with N courts should
 * really accept N bookings/hour — to do that, add `court` to the unique index
 * (venue_id, date, hour, court) and assign the lowest free court on insert.
 */
export const bookings = pgTable(
  "bookings",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    venueId: text("venue_id").notNull(),
    date: date("date").notNull(), // yyyy-mm-dd
    hour: integer("hour").notNull(), // 6..21 (start hour)
    court: integer("court").notNull(),
    price: integer("price").notNull(), // total incl. booking fee
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    venueSlotUnique: uniqueIndex("bookings_venue_slot_unique").on(t.venueId, t.date, t.hour),
    byUser: index("bookings_user_idx").on(t.userId),
    byVenueDate: index("bookings_venue_date_idx").on(t.venueId, t.date),
  }),
);

export type BookingRow = typeof bookings.$inferSelect;
export type NewBookingRow = typeof bookings.$inferInsert;
