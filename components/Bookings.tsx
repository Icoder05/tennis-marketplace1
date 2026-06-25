import { Booking, Venue } from "@/lib/types";
import { fmtDateFull } from "@/lib/dates";
import { fmtTime } from "@/lib/data";
import { CourtLines, SearchIcon, surfaceMeta } from "./ui";

export default function Bookings({
  bookings,
  venuesById,
  authed,
  onCancel,
  onFind,
  onSignIn,
  onSignOut,
}: {
  bookings: Booking[];
  venuesById: Record<string, Venue>;
  authed: boolean;
  onCancel: (id: string) => void;
  onFind: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
}) {
  function Header({ title }: { title: string }) {
    return (
      <div className="hdr">
        <CourtLines />
        <div className="hdr-top">
          <div className="brand">
            <span className="dot" />
            Baseline
          </div>
          {authed ? (
            <button className="demo-pill" style={{ cursor: "pointer" }} onClick={onSignOut}>
              SIGN OUT
            </button>
          ) : (
            <span className="demo-pill">DEMO</span>
          )}
        </div>
        <div className="loc">
          <div className="eyebrow">Your courts</div>
          <h1>{title}</h1>
        </div>
      </div>
    );
  }

  if (!authed) {
    return (
      <section>
        <Header title="My bookings" />
        <div className="empty">
          <div className="ic">
            <SearchIcon stroke="var(--ball)" size={26} />
          </div>
          <h3>Sign in to book</h3>
          <p>Your bookings are tied to your account so they&apos;re here on any device.</p>
          <button className="btn ball" onClick={onSignIn}>
            Sign in
          </button>
        </div>
      </section>
    );
  }

  if (bookings.length === 0) {
    return (
      <section>
        <Header title="My bookings" />
        <div className="empty">
          <div className="ic">
            <SearchIcon stroke="var(--ball)" size={26} />
          </div>
          <h3>No courts booked yet</h3>
          <p>Find an open court near you and you&apos;ll see it here.</p>
          <button className="btn ball" onClick={onFind}>
            Find a court
          </button>
        </div>
      </section>
    );
  }

  return (
    <section>
      <Header title={`${bookings.length} booked`} />
      <div className="bk-list">
        {bookings.map((b) => {
          const v = venuesById[b.venueId];
          if (!v) return null;
          const sm = surfaceMeta(v.surface);
          return (
            <div className="bk" key={b.id}>
              <span className="edge" style={{ background: sm.color }} />
              <div className="when">
                <div className="d">{fmtDateFull(b.date).split(",")[0]}</div>
                <div className="h mono">{fmtTime(b.hour).replace(":00", "")}</div>
              </div>
              <div className="info">
                <div className="n">{v.name}</div>
                <div className="m">
                  {fmtDateFull(b.date)} · Court {b.court} · ₹{b.price}
                </div>
              </div>
              <button className="cancel" onClick={() => onCancel(b.id)}>
                Cancel
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
