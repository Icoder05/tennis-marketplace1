import { Venue } from "@/lib/types";
import { fmtDateFull } from "@/lib/dates";
import { BOOKING_FEE, courtNo, fmtTime, priceAt } from "@/lib/data";
import { CourtLines, Chevron, Check } from "./ui";

export default function Confirm({
  venue,
  dateIso,
  hour,
  submitting,
  onBack,
  onConfirm,
}: {
  venue: Venue;
  dateIso: string;
  hour: number;
  submitting: boolean;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const price = priceAt(venue, hour);
  const court = courtNo(venue, dateIso, hour);
  const total = price + BOOKING_FEE;

  return (
    <section>
      <div className="confirm-wrap">
        <button className="back" style={{ color: "var(--court)" }} onClick={onBack}>
          <Chevron />
          Change slot
        </button>
        <div style={{ height: 14 }} />
        <div className="receipt">
          <div className="top">
            <CourtLines />
            <h2>Confirm your court</h2>
            <div className="ven">
              {venue.name} · {venue.surface[0].toUpperCase() + venue.surface.slice(1)}
            </div>
          </div>
          <div className="rows">
            <div className="row">
              <span className="k">When</span>
              <span className="v">{fmtDateFull(dateIso)}</span>
            </div>
            <div className="row">
              <span className="k">Time</span>
              <span className="v">
                {fmtTime(hour)} – {fmtTime(hour + 1)}
              </span>
            </div>
            <div className="row">
              <span className="k">Court</span>
              <span className="v">Court {court}</span>
            </div>
            <div className="row">
              <span className="k">Where</span>
              <span className="v">
                {venue.area} · {venue.dist} km
              </span>
            </div>
            <div className="perf" />
            <div className="row">
              <span className="k">Court fee</span>
              <span className="v mono">₹{price}</span>
            </div>
            <div className="row">
              <span className="k">Booking fee</span>
              <span className="v mono">₹{BOOKING_FEE}</span>
            </div>
            <div className="row total">
              <span className="k">Total</span>
              <span className="v mono">₹{total}</span>
            </div>
          </div>
        </div>
        <div style={{ height: 16 }} />
        <button className="btn ball block" onClick={onConfirm} disabled={submitting}>
          <Check />
          {submitting ? "Booking…" : `Confirm booking · ₹${total}`}
        </button>
        <div style={{ textAlign: "center", color: "var(--muted)", fontSize: 11.5, marginTop: 12 }}>
          Demo — no payment is taken. Pay at the court.
        </div>
      </div>
    </section>
  );
}
