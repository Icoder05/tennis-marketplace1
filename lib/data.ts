import { Surface, Venue } from "./types";

export const SURFACES: Record<Surface, { label: string; color: string }> = {
  hard: { label: "Hard", color: "#2F7DA8" },
  clay: { label: "Clay", color: "#C75B39" },
  grass: { label: "Grass", color: "#4F9D5D" },
};

// Navi Mumbai / Mumbai venues. Replace with rows from your DB later.
export const VENUES: Venue[] = [
  { id: "cdg", name: "CIDCO Tennis Academy", area: "Belapur", dist: 2.1, surface: "hard", courts: 6, price: 600, rating: 4.7, pop: 78, x: 48, y: 34, blurb: "Floodlit hardcourts beside the CIDCO complex. Coaching most mornings, busy after 6pm." },
  { id: "krg", name: "Kharghar Sports Hub", area: "Kharghar", dist: 3.4, surface: "hard", courts: 4, price: 500, rating: 4.5, pop: 55, x: 67, y: 22, blurb: "Four resurfaced hardcourts under the hills. Easy parking, quiet on weekday afternoons." },
  { id: "nrl", name: "Nerul Gymkhana Courts", area: "Nerul", dist: 4.0, surface: "clay", courts: 3, price: 750, rating: 4.8, pop: 82, x: 38, y: 52, blurb: "The only proper red clay in the area. Members-first but opens slots to the public off-peak." },
  { id: "vsh", name: "Vashi Central Tennis", area: "Vashi", dist: 5.2, surface: "hard", courts: 5, price: 550, rating: 4.3, pop: 60, x: 30, y: 24, blurb: "Central, well-lit, walk-in friendly. Five courts so something is usually free." },
  { id: "pnv", name: "Panvel Racquet Club", area: "Panvel", dist: 1.3, surface: "hard", courts: 3, price: 450, rating: 4.4, pop: 40, x: 55, y: 70, blurb: "Your nearest club. Relaxed, affordable, a good mid-week hit without the crowds." },
  { id: "snp", name: "Sanpada Lawn Courts", area: "Sanpada", dist: 6.1, surface: "grass", courts: 2, price: 900, rating: 4.6, pop: 50, x: 24, y: 40, blurb: "Rare grass courts kept in real condition. Seasonal, books out fast on weekends." },
  { id: "apw", name: "Airoli Powerplay", area: "Airoli", dist: 8.4, surface: "hard", courts: 4, price: 520, rating: 4.2, pop: 35, x: 18, y: 14, blurb: "Newer hardcourts on the Airoli side. Wide open most evenings if you can make the drive." },
  { id: "kpr", name: "Kamothe Public Courts", area: "Kamothe", dist: 2.8, surface: "clay", courts: 2, price: 400, rating: 4.0, pop: 30, x: 62, y: 60, blurb: "No-frills municipal clay. Cheapest hit around, first-come energy." },
  { id: "sea", name: "Seawoods Tennis Centre", area: "Seawoods", dist: 5.7, surface: "hard", courts: 6, price: 650, rating: 4.7, pop: 70, x: 33, y: 62, blurb: "Six courts by the station. Serious players in the evenings, calmer by day." },
  { id: "tal", name: "Taloja Sports Park", area: "Taloja", dist: 4.6, surface: "hard", courts: 3, price: 480, rating: 4.1, pop: 25, x: 75, y: 48, blurb: "Part of the wider sports park. Usually plenty of room and clean surfaces." },
];

export const HOURS: number[] = Array.from({ length: 16 }, (_, i) => 6 + i); // 6..21

export const BOOKING_FEE = 30;

export function venueById(id: string): Venue | undefined {
  return VENUES.find((v) => v.id === id);
}

export function fmtTime(h: number): string {
  const ap = h < 12 ? "AM" : "PM";
  let hh = h % 12;
  if (hh === 0) hh = 12;
  return `${hh}:00 ${ap}`;
}

export function priceAt(v: Venue, h: number): number {
  let p = v.price;
  if (h >= 17 && h <= 20) p = Math.round((p * 1.25) / 10) * 10; // evening peak
  else if (h >= 6 && h <= 8) p = Math.round((p * 0.9) / 10) * 10; // early discount
  return p;
}

// Deterministic 32-bit hash (FNV-1a) — same input always yields the same value,
// so seeded availability and assigned court numbers are stable across requests.
export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Pre-existing demand: which slots are "already taken" before any user action.
// In a real backend these would simply be rows already in the bookings table.
export function baseBooked(v: Venue, date: string, h: number): boolean {
  let thr = v.pop;
  if (h >= 18 && h <= 20) thr += 22;
  else if (h >= 9 && h <= 11) thr += 6;
  else if (h <= 7 || h >= 21) thr -= 18;
  const r = hash(`${v.id}|${date}|${h}`) % 100;
  return r < thr;
}

export function courtNo(v: Venue, date: string, h: number): number {
  return (hash(`${v.id}|${date}|${h}`) % v.courts) + 1;
}
