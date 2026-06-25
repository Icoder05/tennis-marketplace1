import { VenueWithAvailability, Surface } from "@/lib/types";
import { CourtLines, Star, surfaceMeta } from "./ui";

type View = "list" | "map";
type SurfaceFilter = "all" | Surface;

const FILTERS: { id: SurfaceFilter; label: string; color?: string }[] = [
  { id: "all", label: "All surfaces" },
  { id: "hard", label: "Hard", color: "var(--hard)" },
  { id: "clay", label: "Clay", color: "var(--clay)" },
  { id: "grass", label: "Grass", color: "var(--grass)" },
];

export default function Discover({
  venues,
  view,
  surf,
  authed,
  userName,
  onView,
  onSurf,
  onOpenVenue,
  onSignIn,
  onSignOut,
}: {
  venues: VenueWithAvailability[];
  view: View;
  surf: SurfaceFilter;
  authed: boolean;
  userName: string | null;
  onView: (v: View) => void;
  onSurf: (s: SurfaceFilter) => void;
  onOpenVenue: (id: string) => void;
  onSignIn: () => void;
  onSignOut: () => void;
}) {
  const list = venues.filter((v) => surf === "all" || v.surface === surf);

  return (
    <section>
      <div className="hdr">
        <CourtLines />
        <div className="hdr-top">
          <div className="brand">
            <span className="dot" />
            Baseline
          </div>
          {authed ? (
            <button className="avatar-btn" onClick={onSignOut} title="Sign out">
              <span className="avatar-initial">
                {userName ? userName[0].toUpperCase() : "?"}
              </span>
              <span className="avatar-label">Sign out</span>
            </button>
          ) : (
            <button className="demo-pill" style={{ cursor: "pointer" }} onClick={onSignIn}>
              Sign in
            </button>
          )}
        </div>
        <div className="loc">
          <div className="eyebrow">Courts near Panvel</div>
          <h1>
            Find a court,
            <br />
            <b>play tonight.</b>
          </h1>
        </div>
        <div className="seg">
          <button aria-pressed={view === "list"} onClick={() => onView("list")}>
            List
          </button>
          <button aria-pressed={view === "map"} onClick={() => onView("map")}>
            Map
          </button>
        </div>
      </div>

      {view === "list" ? (
        <>
          <div className="chips">
            {FILTERS.map((f) => (
              <button key={f.id} className="chip" aria-pressed={surf === f.id} onClick={() => onSurf(f.id)}>
                {f.color && <span className="sw" style={{ background: f.color }} />}
                {f.label}
              </button>
            ))}
          </div>
          <div className="list">
            {list.length === 0 ? (
              <div className="empty">
                <p>No courts match that surface near you.</p>
              </div>
            ) : (
              list.map((v) => <VenueCard key={v.id} v={v} onOpen={onOpenVenue} />)
            )}
          </div>
        </>
      ) : (
        <MapView list={list} onOpen={onOpenVenue} />
      )}
    </section>
  );
}

function VenueCard({ v, onOpen }: { v: VenueWithAvailability; onOpen: (id: string) => void }) {
  const sm = surfaceMeta(v.surface);
  const open = v.openTonight;
  const full = open === 0;
  return (
    <button className="card" onClick={() => onOpen(v.id)}>
      <span className="surf-edge" style={{ background: sm.color }} />
      <div className="card-h">
        <div>
          <div className="v-name">{v.name}</div>
          <div className="v-meta">
            <span className="surf-tag" style={{ background: sm.color }}>
              {sm.label}
            </span>
            <span>
              {v.area} · {v.dist} km
            </span>
          </div>
        </div>
        <div className="rating">
          <Star />
          {v.rating.toFixed(1)}
        </div>
      </div>
      <div className="card-f">
        <div className="price">
          from <b>₹{v.price}</b>
          <span className="mono"> /hr</span>
        </div>
        {full ? (
          <span className="avail full">
            <span className="label">Booked out tonight</span>
          </span>
        ) : (
          <span className="avail open">
            <span className="pips">
              {[0, 1, 2, 3, 4].map((i) => (
                <span key={i} className={`pip ${i < Math.min(open, 5) ? "" : "off"}`} />
              ))}
            </span>
            <span className="n mono">{open} open</span>
          </span>
        )}
      </div>
    </button>
  );
}

function MapView({ list, onOpen }: { list: VenueWithAvailability[]; onOpen: (id: string) => void }) {
  return (
    <div className="map">
      <div className="map-grid" />
      {list.map((v) => {
        const sm = surfaceMeta(v.surface);
        const lit = v.openTonight > 0;
        return (
          <button
            key={v.id}
            className="pin"
            style={{ left: `${v.x}%`, top: `${v.y}%` }}
            onClick={() => onOpen(v.id)}
            title={v.name}
          >
            <span className="head">{v.name.split(" ")[0]}</span>
            <span className={`drop ${lit ? "lit" : ""}`} style={{ background: sm.color }} />
          </button>
        );
      })}
      <div className="map-note">{list.length} venues · pins glow when courts are open tonight</div>
    </div>
  );
}
