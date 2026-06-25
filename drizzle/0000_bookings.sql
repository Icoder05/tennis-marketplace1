CREATE TABLE IF NOT EXISTS "bookings" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"venue_id" text NOT NULL,
	"date" date NOT NULL,
	"hour" integer NOT NULL,
	"court" integer NOT NULL,
	"price" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "bookings_venue_slot_unique" ON "bookings" USING btree ("venue_id","date","hour");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bookings_user_idx" ON "bookings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bookings_venue_date_idx" ON "bookings" USING btree ("venue_id","date");