import { SearchIcon, CalendarIcon } from "./ui";

type Tab = "discover" | "bookings";

export function BottomNav({
  active,
  bookingCount,
  onNavigate,
}: {
  active: Tab;
  bookingCount: number;
  onNavigate: (tab: Tab) => void;
}) {
  return (
    <div className="nav">
      <div className="navwrap">
        <button aria-current={active === "discover"} onClick={() => onNavigate("discover")}>
          <SearchIcon />
          Discover
        </button>
        <button aria-current={active === "bookings"} onClick={() => onNavigate("bookings")} style={{ position: "relative" }}>
          {bookingCount > 0 && <span className="badge">{bookingCount}</span>}
          <CalendarIcon />
          My bookings
        </button>
      </div>
    </div>
  );
}

export function BookBar({
  visible,
  title,
  subtitle,
  onReview,
}: {
  visible: boolean;
  title: string;
  subtitle: string;
  onReview: () => void;
}) {
  if (!visible) return null;
  return (
    <div className="bookbar">
      <div className="sum">
        <div className="t1">{title}</div>
        <div className="t2">{subtitle}</div>
      </div>
      <button className="btn ball" onClick={onReview}>
        Review booking
      </button>
    </div>
  );
}
