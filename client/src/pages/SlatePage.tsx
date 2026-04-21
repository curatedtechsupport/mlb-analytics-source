import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { format, addDays, subDays } from "date-fns";
import { ChevronLeft, ChevronRight, RefreshCw, Cloud, Wind, Thermometer, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatGameTime, getStatusBadgeClass } from "@/lib/utils";
import WeatherBadges from "@/components/WeatherBadges";

interface GameData {
  gamePk: number;
  status: string;
  statusCode: string;
  gameTime: string;
  venue: string;
  venueId: number;
  stadiumMeta: any;
  homeTeam: { id: number; name: string; abbreviation: string; score: number | null };
  awayTeam: { id: number; name: string; abbreviation: string; score: number | null };
  homeProbablePitcher: { id: number; fullName: string } | null;
  awayProbablePitcher: { id: number; fullName: string } | null;
  linescore: any;
}

function GameCard({ game }: { game: GameData }) {
  const isLive = game.status?.includes("Progress") || game.statusCode === "I";
  const isFinal = game.status?.includes("Final") || game.status?.includes("Game Over");
  const venueId = game.venueId;

  const { data: weather } = useQuery<any>({
    queryKey: ["/api/weather/", venueId],
    queryFn: async () => {
      if (!venueId) return null;
      const res = await fetch(`/api/weather/${venueId}`);
      return res.json();
    },
    enabled: !!venueId,
    staleTime: 5 * 60 * 1000,
  });

  const inning = game.linescore?.currentInning;
  const inningState = game.linescore?.inningHalf;

  return (
    <Link href={`/game/${game.gamePk}`}>
      <a
        className="block bg-card border border-border rounded-xl p-4 hover-elevate cursor-pointer transition-all group"
        data-testid={`card-game-${game.gamePk}`}
      >
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground truncate max-w-[55%]">{game.venue}</span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isLive && inning && (
              <span className="text-xs font-semibold text-emerald-400 tabular">
                {inningState === "Bottom" ? "▼" : "▲"}{inning}
              </span>
            )}
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full border font-medium",
              getStatusBadgeClass(game.status)
            )}>
              {isLive ? "LIVE" : isFinal ? "Final" : formatGameTime(game.gameTime, "America/Chicago")}
            </span>
          </div>
        </div>

        {/* Teams */}
        <div className="space-y-1.5 mb-3">
          {[
            { team: game.awayTeam, pitcher: game.awayProbablePitcher, label: "Away" },
            { team: game.homeTeam, pitcher: game.homeProbablePitcher, label: "Home" },
          ].map(({ team, pitcher }) => (
            <div key={team.id} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <TeamLogo abbr={team.abbreviation} size={20} />
                <div className="min-w-0">
                  <span className="text-sm font-semibold text-foreground">{team.abbreviation}</span>
                  {pitcher && (
                    <span className="text-xs text-muted-foreground ml-2 truncate hidden sm:inline">
                      {pitcher.fullName}
                    </span>
                  )}
                </div>
              </div>
              {(isLive || isFinal) && team.score !== null && (
                <span className="text-lg font-bold tabular text-foreground ml-2">{team.score}</span>
              )}
              {!isLive && !isFinal && pitcher && (
                <span className="text-xs text-muted-foreground truncate max-w-[120px] hidden sm:block">
                  {pitcher.fullName}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Weather badges */}
        {weather && !weather.isDomeClosed && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/50">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Thermometer className="w-3 h-3" />{weather.tempF}°F
            </span>
            {weather.windMph > 2 && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Wind className="w-3 h-3" />{weather.windMph}mph {weather.windDirRelative}
              </span>
            )}
            <WeatherBadges badges={weather.badges} compact />
          </div>
        )}
        {weather?.isDomeClosed && (
          <div className="pt-2 border-t border-border/50">
            <span className="badge-dome text-xs px-1.5 py-0.5 rounded font-medium">Dome</span>
          </div>
        )}

        {/* Park factor */}
        {game.stadiumMeta?.parkFactor && game.stadiumMeta.parkFactor !== 100 && (
          <div className="mt-1.5">
            <span className={cn(
              "text-xs font-medium",
              game.stadiumMeta.parkFactor > 105 ? "text-red-400" :
              game.stadiumMeta.parkFactor > 100 ? "text-amber-400" :
              game.stadiumMeta.parkFactor < 95 ? "text-blue-400" : "text-muted-foreground"
            )}>
              Park: {game.stadiumMeta.parkFactor > 100 ? "+" : ""}{game.stadiumMeta.parkFactor - 100}
            </span>
          </div>
        )}
      </a>
    </Link>
  );
}

function TeamLogo({ abbr, size = 24 }: { abbr: string; size?: number }) {
  // Use MLB Crest CDN
  const teamIds: Record<string, number> = {
    BAL: 110, BOS: 111, NYY: 147, TB: 139, TOR: 141,
    CWS: 145, CLE: 114, DET: 116, KC: 118, MIN: 142,
    HOU: 117, LAA: 108, OAK: 133, SEA: 136, TEX: 140,
    ATL: 144, MIA: 146, NYM: 121, PHI: 143, WSH: 120,
    CHC: 112, CIN: 113, MIL: 158, PIT: 134, STL: 138,
    ARI: 109, COL: 115, LAD: 119, SD: 135, SF: 137,
  };
  const id = teamIds[abbr];
  if (!id) {
    return (
      <div
        className="flex-shrink-0 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground"
        style={{ width: size, height: size }}
      >
        {abbr?.slice(0, 2)}
      </div>
    );
  }
  return (
    <img
      src={`https://www.mlbstatic.com/team-logos/team-cap-on-light/${id}.svg`}
      width={size}
      height={size}
      alt={abbr}
      className="flex-shrink-0 object-contain"
      onError={(e) => {
        const t = e.currentTarget;
        t.style.display = "none";
      }}
    />
  );
}

function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex justify-between">
        <div className="skeleton-shimmer h-3 w-28 rounded" />
        <div className="skeleton-shimmer h-4 w-16 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="skeleton-shimmer w-5 h-5 rounded-full" />
          <div className="skeleton-shimmer h-4 w-20 rounded" />
          <div className="skeleton-shimmer h-3 w-28 rounded ml-auto" />
        </div>
        <div className="flex items-center gap-2">
          <div className="skeleton-shimmer w-5 h-5 rounded-full" />
          <div className="skeleton-shimmer h-4 w-24 rounded" />
          <div className="skeleton-shimmer h-3 w-24 rounded ml-auto" />
        </div>
      </div>
      <div className="flex gap-2 pt-2 border-t border-border/50">
        <div className="skeleton-shimmer h-3 w-14 rounded" />
        <div className="skeleton-shimmer h-3 w-16 rounded" />
      </div>
    </div>
  );
}

export default function SlatePage() {
  const [date, setDate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(false);
  const dateStr = format(date, "yyyy-MM-dd");

  const { data, isLoading, error, refetch, isFetching } = useQuery<{ games: GameData[]; date: string }>({
    queryKey: ["/api/schedule", `?date=${dateStr}`],
    queryFn: async () => {
      const res = await fetch(`/api/schedule?date=${dateStr}`);
      return res.json();
    },
    staleTime: 30_000,
    refetchInterval: autoRefresh ? 30_000 : false,
  });

  const games = data?.games || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-5">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
            Today's Slate
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {games.length > 0 ? `${games.length} games` : "Loading games..."} · {format(date, "EEEE, MMMM d, yyyy")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Date navigation */}
          <Button size="icon" variant="ghost" onClick={() => setDate(d => subDays(d, 1))} data-testid="button-prev-date">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <input
            type="date"
            value={dateStr}
            onChange={e => {
              const d = new Date(e.target.value + "T12:00:00");
              if (!isNaN(d.getTime())) setDate(d);
            }}
            className="text-sm bg-card border border-border rounded-md px-2 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            data-testid="input-date-picker"
          />
          <Button size="icon" variant="ghost" onClick={() => setDate(d => addDays(d, 1))} data-testid="button-next-date">
            <ChevronRight className="w-4 h-4" />
          </Button>

          {/* Auto-refresh toggle */}
          <Button
            variant={autoRefresh ? "default" : "ghost"}
            size="sm"
            onClick={() => setAutoRefresh(r => !r)}
            className="gap-1.5"
            data-testid="button-auto-refresh"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isFetching && "animate-spin")} />
            <span className="hidden sm:inline text-xs">{autoRefresh ? "Auto" : "Refresh"}</span>
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm">Failed to load schedule. The MLB API may be temporarily unavailable.</p>
          <Button variant="ghost" size="sm" onClick={() => refetch()} className="ml-auto">Retry</Button>
        </div>
      )}

      {/* Games grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : games.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center text-center py-20">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">No games scheduled</h3>
          <p className="text-sm text-muted-foreground max-w-xs">There are no MLB games on this date. Try another day.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {games.map((game) => (
            <GameCard key={game.gamePk} game={game} />
          ))}
        </div>
      )}

      {/* Legend */}
      {games.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-3 text-xs text-muted-foreground border-t border-border pt-4">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Live game</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> Scheduled</span>
          <span>Park factor: deviation from league avg (100)</span>
        </div>
      )}
    </div>
  );
}
