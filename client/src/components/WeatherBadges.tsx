import { cn } from "@/lib/utils";

interface WeatherBadgesProps {
  badges: string[];
  compact?: boolean;
}

function getBadgeClass(badge: string) {
  if (badge.includes("Hitter")) return "badge-hitter";
  if (badge.includes("Pitcher")) return "badge-pitcher";
  if (badge.includes("Cold")) return "badge-cold";
  if (badge.includes("Rain")) return "badge-rain";
  if (badge.includes("Dome")) return "badge-dome";
  return "bg-muted text-muted-foreground border border-border";
}

export default function WeatherBadges({ badges, compact = false }: WeatherBadgesProps) {
  if (!badges?.length) return null;
  return (
    <>
      {badges.map((b) => (
        <span
          key={b}
          className={cn(
            "rounded font-medium",
            getBadgeClass(b),
            compact ? "text-xs px-1.5 py-0.5" : "text-xs px-2 py-0.5"
          )}
        >
          {b}
        </span>
      ))}
    </>
  );
}
