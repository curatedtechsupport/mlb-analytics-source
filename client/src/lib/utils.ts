import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatERA(val: string | number | undefined): string {
  if (!val || val === "-.--" || val === "INF") return "—";
  const n = typeof val === "string" ? parseFloat(val) : val;
  return isNaN(n) ? "—" : n.toFixed(2);
}

export function formatAvg(val: string | number | undefined): string {
  if (!val) return ".000";
  const n = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(n)) return ".000";
  return n.toFixed(3).replace("0.", ".");
}

export function formatIP(val: string | number | undefined): string {
  if (!val) return "0.0";
  return String(val);
}

export function eraColor(era: string | number | undefined): string {
  const n = typeof era === "string" ? parseFloat(era) : (era ?? 5);
  if (isNaN(n)) return "text-muted-foreground";
  if (n < 3.00) return "text-emerald-400";
  if (n < 4.00) return "text-green-400";
  if (n < 5.00) return "text-yellow-400";
  return "text-red-400";
}

export function whipColor(whip: string | number | undefined): string {
  const n = typeof whip === "string" ? parseFloat(whip) : (whip ?? 1.5);
  if (isNaN(n)) return "text-muted-foreground";
  if (n < 1.0) return "text-emerald-400";
  if (n < 1.2) return "text-green-400";
  if (n < 1.4) return "text-yellow-400";
  return "text-red-400";
}

export function avgColor(avg: string | number | undefined): string {
  const n = typeof avg === "string" ? parseFloat(avg) : (avg ?? 0.25);
  if (isNaN(n)) return "text-muted-foreground";
  if (n > 0.300) return "text-emerald-400";
  if (n > 0.270) return "text-green-400";
  if (n > 0.240) return "text-yellow-400";
  return "text-red-400";
}

export function formatGameTime(isoTime: string, timezone: string = "America/Chicago"): string {
  try {
    const d = new Date(isoTime);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: timezone, hour12: true });
  } catch {
    return "TBD";
  }
}

export function getStatusBadgeClass(status: string): string {
  if (status?.includes("Progress") || status?.includes("Live")) return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
  if (status?.includes("Final") || status?.includes("Game Over")) return "bg-slate-500/20 text-slate-300 border-slate-500/30";
  if (status?.includes("Postpone") || status?.includes("Suspend")) return "bg-amber-500/15 text-amber-300 border-amber-500/30";
  return "bg-blue-500/15 text-blue-300 border-blue-500/30";
}
