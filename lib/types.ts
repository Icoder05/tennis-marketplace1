export type Surface = "hard" | "clay" | "grass";

export interface Venue {
  id: string;
  name: string;
  area: string;
  dist: number;
  surface: Surface;
  courts: number;
  price: number;
  rating: number;
  pop: number; // baseline demand 0-100, drives seeded availability
  x: number; // map pin position (%)
  y: number;
  blurb: string;
}

export interface VenueWithAvailability extends Venue {
  openTonight: number;
}

export interface Slot {
  hour: number; // start hour, 6..21
  time: string; // "6:00 AM"
  price: number;
  booked: boolean;
}

export interface Booking {
  id: string;
  venueId: string;
  date: string; // ISO yyyy-mm-dd
  hour: number;
  court: number;
  price: number; // total incl. booking fee
  createdAt: string;
}
