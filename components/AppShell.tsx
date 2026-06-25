"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { authClient } from "@/lib/auth/client";
import { Booking, Slot, Surface, Venue, VenueWithAvailability } from "@/lib/types";
import { fmtTime, priceAt } from "@/lib/data";
import { fmtDateFull, nextDays } from "@/lib/dates";
import Discover from "./Discover";
import VenueDetail from "./VenueDetail";
import Confirm from "./Confirm";
import Bookings from "./Bookings";
import { BottomNav, BookBar } from "./Nav";
import { Check } from "./ui";

type Screen = "discover" | "detail" | "confirm" | "bookings";
type View = "list" | "map";
type SurfaceFilter = "all" | Surface;

const DAYS = 7;

export default function AppShell({ initialAuthed, userName }: { initialAuthed: boolean; userName: string | null }) {
  const [authed, setAuthed] = useState(initialAuthed);
  const doSignIn = useCallback(() => { window.location.href = "/auth/sign-in"; }, []);
  const doSignOut = useCallback(async () => {
    await authClient.signOut();
    setAuthed(false);
    window.location.href = "/";
  }, []);

  const [screen, setScreen] = useState<Screen>("discover");
  const [view, setView] = useState<View>("list");
  const [surf, setSurf] = useState<SurfaceFilter>("all");

  const [venues, setVenues] = useState<VenueWithAvailability[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [venueId, setVenueId] = useState<string | null>(null);
  const days = useMemo(() => nextDays(DAYS), []);
  const [dateIso, setDateIso] = useState<string>(days[0].iso);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [hour, setHour] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [toast, setToast] = useState<string | null>(null);

  const venuesById = useMemo(() => {
    const m: Record<string, Venue> = {};
    venues.forEach((v) => (m[v.id] = v));
    return m;
  }, [venues]);
  const venue = venueId ? venuesById[venueId] : null;

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  }, []);

  const loadVenues = useCallback(async () => {
    const res = await fetch("/api/venues");
    const data = await res.json();
    setVenues(data.venues);
  }, []);

  const loadBookings = useCallback(async () => {
    const res = await fetch("/api/bookings");
    if (res.status === 401) {
      setBookings([]);
      return;
    }
    const data = await res.json();
    setBookings(data.bookings ?? []);
  }, []);

  const loadAvailability = useCallback(async (vId: string, date: string) => {
    setSlotsLoading(true);
    try {
      const res = await fetch(`/api/availability?venueId=${vId}&date=${date}`);
      const data = await res.json();
      setSlots(data.slots ?? []);
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVenues();
  }, [loadVenues]);

  useEffect(() => {
    if (authed) loadBookings();
    else setBookings([]);
  }, [authed, loadBookings]);

  useEffect(() => {
    if (venueId) loadAvailability(venueId, dateIso);
  }, [venueId, dateIso, loadAvailability]);

  // --- navigation ---
  const openVenue = (id: string) => {
    setVenueId(id);
    setDateIso(days[0].iso);
    setHour(null);
    setScreen("detail");
    scrollTop();
  };
  const goDiscover = () => {
    setHour(null);
    setScreen("discover");
    scrollTop();
  };
  const goBookings = () => {
    setHour(null);
    setScreen("bookings");
    scrollTop();
  };

  const selectDate = (iso: string) => {
    setDateIso(iso);
    setHour(null);
  };
  const selectSlot = (h: number) => setHour((cur) => (cur === h ? null : h));

  // --- actions ---
  const confirmBooking = async () => {
    if (!venueId || hour == null) return;
    if (!authed) {
      doSignIn();
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venueId, date: dateIso, hour }),
      });
      if (res.status === 201) {
        const { booking } = await res.json();
        await Promise.all([loadBookings(), loadVenues()]);
        setHour(null);
        setScreen("bookings");
        scrollTop();
        showToast(`Court ${booking.court} booked at ${venue?.name.split(" ")[0] ?? "venue"}`);
      } else if (res.status === 401) {
        doSignIn();
      } else if (res.status === 409) {
        // Someone took it first — refresh the grid so the slot shows as gone.
        await loadAvailability(venueId, dateIso);
        setHour(null);
        setScreen("detail");
        showToast("That slot was just taken — pick another");
      } else {
        showToast("Couldn't book that slot");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const cancelBooking = async (id: string) => {
    await fetch(`/api/bookings?id=${id}`, { method: "DELETE" });
    await Promise.all([loadBookings(), loadVenues()]);
    if (venueId) await loadAvailability(venueId, dateIso);
    showToast("Booking cancelled");
  };

  const navActive = screen === "bookings" ? "bookings" : "discover";
  const barVisible = screen === "detail" && hour != null;

  return (
    <div className="phone">
      <div className="scroll" id="screen">
        {screen === "discover" && (
          <Discover
            venues={venues}
            view={view}
            surf={surf}
            authed={authed}
            userName={userName}
            onView={setView}
            onSurf={setSurf}
            onOpenVenue={openVenue}
            onSignIn={doSignIn}
            onSignOut={doSignOut}
          />
        )}
        {screen === "detail" && venue && (
          <VenueDetail
            venue={venue}
            days={days}
            selectedIso={dateIso}
            slots={slots}
            selectedHour={hour}
            loading={slotsLoading}
            onBack={goDiscover}
            onSelectDate={selectDate}
            onSelectSlot={selectSlot}
          />
        )}
        {screen === "confirm" && venue && hour != null && (
          <Confirm
            venue={venue}
            dateIso={dateIso}
            hour={hour}
            submitting={submitting}
            onBack={() => setScreen("detail")}
            onConfirm={confirmBooking}
          />
        )}
        {screen === "bookings" && (
          <Bookings
            bookings={bookings}
            venuesById={venuesById}
            authed={authed}
            onCancel={cancelBooking}
            onFind={goDiscover}
            onSignIn={doSignIn}
            onSignOut={doSignOut}
          />
        )}
      </div>

      <BookBar
        visible={barVisible}
        title={hour != null ? `${fmtTime(hour)} – ${fmtTime(hour + 1)}` : ""}
        subtitle={hour != null && venue ? `${fmtDateFull(dateIso)} · ₹${priceAt(venue, hour)}` : ""}
        onReview={() => setScreen("confirm")}
      />

      <BottomNav active={navActive} bookingCount={bookings.length} onNavigate={(t) => (t === "discover" ? goDiscover() : goBookings())} />

      <div className={`toast ${toast ? "show" : ""}`}>
        <span className="ck">
          <Check size={12} />
        </span>
        <span>{toast}</span>
      </div>
    </div>
  );
}

function scrollTop() {
  const el = document.getElementById("screen");
  if (el) el.scrollTop = 0;
}
