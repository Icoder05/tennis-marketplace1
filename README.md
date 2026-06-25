# Baseline — tennis court marketplace (Next.js + Neon + Auth.js)

Find and book tennis courts near you. Bookings are durable (Neon Postgres),
concurrency-safe (a UNIQUE constraint, not a JS check), and tied to a signed-in
user (Auth.js, with users stored in Neon).

## Quick start

```bash
npm install
cp .env.example .env.local      # then fill in the values below
```

### 1. Database (Neon)

1. Create a project at https://neon.com and copy the connection string into
   `DATABASE_URL` in `.env.local`.
2. Create the bookings table (includes the unique constraint):
   ```bash
   npm run db:migrate     # applies drizzle/0000_bookings.sql
   ```
   (or `npm run db:push` to push the schema without a migration file)
3. Create the Auth.js tables — run `lib/db/auth-schema.sql` once in the Neon SQL
   Editor (Console → SQL Editor → paste → Run).

### 2. Auth (Auth.js)

1. Generate a secret: `npx auth secret` → puts `AUTH_SECRET` in `.env.local`.
2. To sign in **locally without Google**, set both:
   ```
   AUTH_DEV_LOGIN=true
   NEXT_PUBLIC_AUTH_DEV_LOGIN=true
   ```
   This enables a password-less dev login. **Never enable it in production.**
3. For real Google sign-in, create an OAuth client at
   https://console.cloud.google.com (redirect URI
   `http://localhost:3000/api/auth/callback/google`) and set `AUTH_GOOGLE_ID` /
   `AUTH_GOOGLE_SECRET`.

### 3. Run

```bash
npm run dev      # http://localhost:3000
```

## How the pieces fit

```
lib/db/schema.ts     bookings table + UNIQUE(venue_id, date, hour)
lib/db/index.ts      lazy Neon connection (drizzle + @neondatabase/serverless)
lib/store.ts         all booking reads/writes — async, DB-backed, user-scoped
lib/auth.ts          Auth.js config: Neon adapter + Google + dev login
lib/session.ts       getUserId() — the single auth seam the rest of the app uses
app/api/...          venues / availability / bookings / auth route handlers
drizzle/             generated SQL migration
lib/db/auth-schema.sql   Auth.js user/account tables for Neon
```

## What makes it robust (and what doesn't yet)

- **No double-booking.** Two people racing for the same slot both pass the JS
  pre-check, but only one row can win the `UNIQUE (venue_id, date, hour)` index.
  The loser gets a clean `409`. The database is the guarantee.
- **Bookings belong to people.** Every write carries `user_id`; `GET`/`DELETE`
  only ever touch the signed-in user's rows.
- **Capacity is simplified.** One booking per (venue, hour), matching the UI's
  single-slot-per-hour design — even though a venue has multiple courts. To sell
  N bookings/hour, add `court` to the unique index and assign the lowest free
  court on insert. (See the comment in `lib/db/schema.ts`.)
- **Seeded demand is cosmetic.** `baseBooked()` in `lib/data.ts` marks some slots
  "taken" so the marketplace looks busy without seeding rows. Delete it when you
  want the table to be the only source of truth.

## Why Auth.js and not "Neon Auth"

Neon's branded managed auth (`@neondatabase/auth`, Better Auth) currently requires
Next.js 16 and is Beta. This project is on Next 14, so it uses **Auth.js + the
Neon adapter** instead — stable, no framework upgrade, and users still live in
your Neon database. If you want the branded Neon Auth service, you'll need to
upgrade to Next 16 first.
