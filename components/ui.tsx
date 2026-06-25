import { SURFACES } from "@/lib/data";
import { Surface } from "@/lib/types";

export function surfaceMeta(s: Surface) {
  return SURFACES[s];
}

export function CourtLines() {
  return (
    <svg className="court-lines" viewBox="0 0 300 160" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <g fill="none" stroke="#fff" strokeWidth="1.4">
        <rect x="20" y="20" width="260" height="120" />
        <line x1="150" y1="20" x2="150" y2="140" />
        <rect x="20" y="44" width="60" height="72" />
        <rect x="220" y="44" width="60" height="72" />
        <line x1="80" y1="80" x2="220" y2="80" />
        <line x1="150" y1="44" x2="150" y2="116" strokeDasharray="3 4" />
        <line x1="20" y1="80" x2="6" y2="80" />
        <line x1="280" y1="80" x2="294" y2="80" />
      </g>
    </svg>
  );
}

export function Star({ size = 13 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="var(--ball-deep)" stroke="none" aria-hidden>
      <path d="M12 2l2.9 6.3L22 9.2l-5 4.7 1.3 6.8L12 17.5 5.7 20.7 7 13.9 2 9.2l7.1-.9z" />
    </svg>
  );
}

export function Chevron() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export function Check({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function SearchIcon({ stroke = "currentColor", size = 21 }: { stroke?: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" width={21} height={21} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8 2v4M16 2v4M3 10h18" />
      <rect x="3" y="4" width="18" height="18" rx="2" />
    </svg>
  );
}
