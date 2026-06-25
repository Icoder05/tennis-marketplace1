import { Slot, Venue } from "@/lib/types";
import { DayInfo, fmtDateFull } from "@/lib/dates";
import { CourtLines, Chevron, Star, surfaceMeta } from "./ui";

export default function VenueDetail({
  venue,
  days,
  selectedIso,
  slots,
  selectedHour,
  loading,
  onBack,
  onSelectDate,
  onSelectSlot,
}: {
  venue: Venue;
  days: DayInfo[];
  selectedIso: string;
  slots: Slot[];
  selectedHour: number | null;
  loading: boolean;
  onBack: () => void;
  onSelectDate: (iso: string) => void;
  onSelectSlot: (hour: number) => void;
}) {
  const sm = surfaceMeta(venue.surface);

  return (
    <section>
      <div className="hdr">
        <CourtLines />
        <button className="back" onClick={onBack}>
          <Chevron />
          Courts near you
        </button>
        <div className="d-name">{venue.name}</div>
        <div className="d-sub">
          <span className="surf-tag" style={{ background: sm.color }}>
            {sm.label}
          </span>
          <span>
            <Star /> {venue.rating.toFixed(1)}
          </span>
          <span>
            {venue.area} · {venue.dist} km · {venue.courts} courts
          </span>
        </div>
      </div>

      <div className="d-blurb">{venue.blurb}</div>

      <div className="sec-label">Pick a day</div>
      <div className="days">
        {days.map((d) => (
          <button
            key={d.iso}
            className="day"
            aria-pressed={selectedIso === d.iso}
            onClick={() => onSelectDate(d.iso)}
          >
            <div className="dow">{d.isToday ? "Today" : d.dow}</div>
            <div className="num">{d.day}</div>
          </button>
        ))}
      </div>

      <div className="sec-label">{fmtDateFull(selectedIso)} · 1-hour slots</div>
      <div className="slots">
        {loading
          ? Array.from({ length: 9 }).map((_, i) => <div key={i} className="slot" aria-hidden style={{ opacity: 0.4 }} />)
          : slots.map((s) => (
              <button
                key={s.hour}
                className="slot"
                disabled={s.booked}
                aria-pressed={selectedHour === s.hour}
                onClick={() => onSelectSlot(s.hour)}
              >
                <div className="t">{s.time}</div>
                <div className="p mono">₹{s.price}</div>
              </button>
            ))}
      </div>
    </section>
  );
}
