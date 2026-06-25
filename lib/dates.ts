const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export interface DayInfo {
  offset: number;
  iso: string;
  dow: string;
  day: number;
  full: string;
  isToday: boolean;
}

export function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function todayISO(): string {
  return toISO(new Date());
}

export function dayInfo(offset: number): DayInfo {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return {
    offset,
    iso: toISO(d),
    dow: DOW[d.getDay()],
    day: d.getDate(),
    full: `${DOW[d.getDay()]}, ${d.getDate()} ${MON[d.getMonth()]}`,
    isToday: offset === 0,
  };
}

export function nextDays(n: number): DayInfo[] {
  return Array.from({ length: n }, (_, i) => dayInfo(i));
}

export function fmtDateFull(iso: string): string {
  const [y, m, dd] = iso.split("-").map(Number);
  const d = new Date(y, m - 1, dd);
  return `${DOW[d.getDay()]}, ${d.getDate()} ${MON[d.getMonth()]}`;
}
