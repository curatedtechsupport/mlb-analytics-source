import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, Cloud, Wind, Thermometer, Droplets, Activity, TrendingUp, TrendingDown, AlertTriangle, ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatERA, formatAvg, eraColor, whipColor, formatGameTime } from "@/lib/utils";
import WeatherBadges from "@/components/WeatherBadges";

// ── Helpers ────────────────────────────────────────────────────────────────────
function StatCell({ label, value, colorClass }: { label: string; value: string; colorClass?: string }) {
  return (
    <div className="flex flex-col items-center text-center min-w-0">
      <span className={cn("text-sm font-bold tabular", colorClass || "text-foreground")}>{value || "—"}</span>
      <span className="text-xs text-muted-foreground mt-0.5 leading-tight">{label}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
      {children}
    </h3>
  );
}

function SkeletonBlock({ h = 20 }: { h?: number }) {
  return <div className={`skeleton-shimmer rounded`} style={{ height: h }} />;
}

// ── Pitcher Card ──────────────────────────────────────────────────────────────
function PitcherCard({ pitcherId, teamName, isHome }: { pitcherId: number; teamName: string; isHome: boolean }) {
  const { data, isLoading } = useQuery<any>({
    queryKey: [`/api/pitcher/${pitcherId}`],
    staleTime: 60 * 60 * 1000,
  });

  if (isLoading) return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => <SkeletonBlock key={i} h={16} />)}
    </div>
  );
  if (!data) return <p className="text-sm text-muted-foreground">No pitcher data available.</p>;

  const s = data.seasonStats || {};
  const splits = data.splits || [];
  const vsL = splits.find((x: any) => x.split?.code === "vL")?.stat || {};
  const vsR = splits.find((x: any) => x.split?.code === "vR")?.stat || {};

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">{data.fullName || "TBD"}</h2>
          <p className="text-sm text-muted-foreground">
            {isHome ? "Home" : "Away"} · {teamName} · {data.pitchHand === "L" ? "LHP" : "RHP"}
            {data.jersey && ` · #${data.jersey}`}
          </p>
        </div>
      </div>

      {/* Season line */}
      <div>
        <SectionTitle>Season Stats</SectionTitle>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 bg-muted/40 rounded-lg p-3">
          <StatCell label="ERA" value={formatERA(s.era)} colorClass={eraColor(s.era)} />
          <StatCell label="WHIP" value={formatERA(s.whip)} colorClass={whipColor(s.whip)} />
          <StatCell label="K/9" value={formatERA(s.strikeoutsPer9Inn)} />
          <StatCell label="BB/9" value={formatERA(s.walksPer9Inn)} />
          <StatCell label="HR/9" value={formatERA(s.homeRunsPer9)} />
          <StatCell label="IP" value={s.inningsPitched || "—"} />
          <StatCell label="W-L" value={s.wins !== undefined ? `${s.wins}-${s.losses}` : "—"} />
        </div>
      </div>

      {/* Splits */}
      {(vsL.era || vsR.era) && (
        <div>
          <SectionTitle>Splits</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "vs LHB", stat: vsL },
              { label: "vs RHB", stat: vsR },
            ].map(({ label, stat }) => (
              <div key={label} className="bg-muted/40 rounded-lg p-3">
                <p className="text-xs font-semibold text-muted-foreground mb-2">{label}</p>
                <div className="grid grid-cols-3 gap-1">
                  <StatCell label="AVG" value={formatAvg(stat.avg)} colorClass={stat.avg ? (parseFloat(stat.avg) > 0.27 ? "text-red-400" : "text-emerald-400") : undefined} />
                  <StatCell label="OBP" value={formatAvg(stat.obp)} />
                  <StatCell label="SLG" value={formatAvg(stat.slg)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last 3 starts */}
      {data.recentGames?.length > 0 && (
        <div>
          <SectionTitle>Last 3 Starts</SectionTitle>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  {["Date", "Opp", "IP", "H", "ER", "BB", "K", "ERA"].map(h => (
                    <th key={h} className="text-left pb-2 pr-3 text-muted-foreground font-medium first:text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recentGames.map((g: any, i: number) => (
                  <tr key={i} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                    <td className="py-1.5 pr-3 text-muted-foreground">{g.date ? format(new Date(g.date), "MM/dd") : "—"}</td>
                    <td className="py-1.5 pr-3 font-medium">{g.opponent?.split(" ").pop() || "—"}</td>
                    <td className="py-1.5 pr-3 tabular">{g.ip || "—"}</td>
                    <td className="py-1.5 pr-3 tabular">{g.h ?? "—"}</td>
                    <td className="py-1.5 pr-3 tabular">{g.er ?? "—"}</td>
                    <td className="py-1.5 pr-3 tabular">{g.bb ?? "—"}</td>
                    <td className="py-1.5 pr-3 tabular font-medium text-primary">{g.k ?? "—"}</td>
                    <td className={cn("py-1.5 tabular font-medium", eraColor(g.era))}>{formatERA(g.era)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── BvP Panel ─────────────────────────────────────────────────────────────────
function BvPPanel({ lineup, pitcherId, pitcherName }: { lineup: any[]; pitcherId: number; pitcherName: string }) {
  return (
    <div>
      <SectionTitle>vs {pitcherName}</SectionTitle>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              {["Batter", "PA", "AB", "H", "HR", "AVG", "OBP", "SLG", "Conf"].map(h => (
                <th key={h} className="text-left pb-2 pr-3 text-muted-foreground font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lineup.map((batter: any) => (
              <BvPRow key={batter.id} batter={batter} pitcherId={pitcherId} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BvPRow({ batter, pitcherId }: { batter: any; pitcherId: number }) {
  const { data, isLoading } = useQuery<any>({
    queryKey: [`/api/bvp/${batter.id}/${pitcherId}`],
    staleTime: 60 * 60 * 1000,
  });

  const s = data?.stat || {};
  const pa = data?.plateAppearances || 0;
  const isLow = data?.isLowConfidence;

  return (
    <tr className="border-b border-border/40 hover:bg-muted/20 transition-colors">
      <td className="py-1.5 pr-3 font-medium whitespace-nowrap">
        {batter.fullName?.split(", ").reverse().join(" ") || batter.fullName}
        <span className="text-muted-foreground ml-1 text-xs">#{batter.battingOrder / 100}</span>
      </td>
      {isLoading ? (
        <td colSpan={8} className="py-1.5">
          <div className="skeleton-shimmer h-3 w-32 rounded" />
        </td>
      ) : (
        <>
          <td className="py-1.5 pr-3 tabular">{pa || 0}</td>
          <td className="py-1.5 pr-3 tabular">{s.atBats ?? 0}</td>
          <td className="py-1.5 pr-3 tabular">{s.hits ?? 0}</td>
          <td className="py-1.5 pr-3 tabular">{s.homeRuns ?? 0}</td>
          <td className={cn("py-1.5 pr-3 tabular font-medium", pa > 0 ? (parseFloat(s.avg) > 0.300 ? "text-emerald-400" : parseFloat(s.avg) < 0.200 ? "text-red-400" : "text-foreground") : "text-muted-foreground")}>
            {pa > 0 ? formatAvg(s.avg) : ".---"}
          </td>
          <td className="py-1.5 pr-3 tabular text-muted-foreground">{pa > 0 ? formatAvg(s.obp) : ".---"}</td>
          <td className="py-1.5 pr-3 tabular text-muted-foreground">{pa > 0 ? formatAvg(s.slg) : ".---"}</td>
          <td className="py-1.5">
            {isLow ? (
              <span className="badge-rain text-xs px-1.5 py-0.5 rounded font-medium">Low</span>
            ) : pa > 0 ? (
              <span className="text-emerald-500 text-xs">✓</span>
            ) : (
              <span className="text-muted-foreground text-xs">—</span>
            )}
          </td>
        </>
      )}
    </tr>
  );
}

// ── Lineup Tab ────────────────────────────────────────────────────────────────
function LineupsTab({ gamePk }: { gamePk: number }) {
  const { data: lineupData, isLoading } = useQuery<any>({
    queryKey: [`/api/game/${gamePk}/lineups`],
    staleTime: 30_000,
  });

  if (isLoading) return (
    <div className="space-y-2 py-2">
      {[...Array(8)].map((_, i) => <SkeletonBlock key={i} h={16} />)}
    </div>
  );

  if (!lineupData?.homeLineup?.length && !lineupData?.awayLineup?.length) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
          <Activity className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">Lineups not yet posted. Check back closer to first pitch.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[
        { name: lineupData.awayTeamName, lineup: lineupData.awayLineup, label: "Away" },
        { name: lineupData.homeTeamName, lineup: lineupData.homeLineup, label: "Home" },
      ].map(({ name, lineup, label }) => (
        <div key={label}>
          <SectionTitle>{label} — {name}</SectionTitle>
          <div className="space-y-1">
            {lineup?.map((batter: any, i: number) => (
              <div key={batter.id} className="flex items-center gap-3 py-1 px-2 rounded hover:bg-muted/30 transition-colors">
                <span className="text-xs font-bold text-muted-foreground w-4 text-right tabular">{i + 1}</span>
                <span className="text-sm font-medium text-foreground flex-1">
                  {batter.fullName?.split(", ").reverse().join(" ") || batter.fullName}
                </span>
                <span className="text-xs text-muted-foreground">{batter.position}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Bullpens Tab ──────────────────────────────────────────────────────────────
function BullpensTab({ homeTeamId, awayTeamId, homeTeamName, awayTeamName }: {
  homeTeamId: number; awayTeamId: number; homeTeamName: string; awayTeamName: string;
}) {
  const { data: homeData, isLoading: homeLoading } = useQuery<any>({
    queryKey: [`/api/team/${homeTeamId}/bullpen`],
    staleTime: 60 * 60 * 1000,
  });
  const { data: awayData, isLoading: awayLoading } = useQuery<any>({
    queryKey: [`/api/team/${awayTeamId}/bullpen`],
    staleTime: 60 * 60 * 1000,
  });

  function BullpenTable({ data, loading, teamName }: { data: any; loading: boolean; teamName: string }) {
    return (
      <div>
        <SectionTitle>{teamName} Bullpen</SectionTitle>
        <Link href={`/bullpen/${data?.teamId || ''}`}>
          <a className="text-xs text-primary hover:underline flex items-center gap-1 mb-3">
            Full rankings <ChevronRight className="w-3 h-3" />
          </a>
        </Link>
        {loading ? (
          <div className="space-y-2">{[...Array(6)].map((_, i) => <SkeletonBlock key={i} h={14} />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  {["Pitcher", "Role", "ERA", "WHIP", "K/9", "Avail", "Score"].map(h => (
                    <th key={h} className="text-left pb-2 pr-3 text-muted-foreground font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data?.bullpen || []).slice(0, 8).map((p: any) => (
                  <tr key={p.id} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                    <td className="py-1.5 pr-3 font-medium whitespace-nowrap">{p.fullName?.split(" ").pop()}</td>
                    <td className="py-1.5 pr-3 text-muted-foreground">{p.position}</td>
                    <td className={cn("py-1.5 pr-3 tabular font-medium", eraColor(p.seasonStats?.era))}>{formatERA(p.seasonStats?.era)}</td>
                    <td className={cn("py-1.5 pr-3 tabular", whipColor(p.seasonStats?.whip))}>{formatERA(p.seasonStats?.whip)}</td>
                    <td className="py-1.5 pr-3 tabular text-primary font-medium">{formatERA(p.seasonStats?.k9)}</td>
                    <td className="py-1.5 pr-3">
                      {p.isAvailable ? (
                        <span className="text-emerald-400 text-xs font-medium">✓ Avail</span>
                      ) : (
                        <span className="text-amber-400 text-xs">~Used</span>
                      )}
                    </td>
                    <td className="py-1.5 tabular text-muted-foreground text-xs">{p.compositeScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <BullpenTable data={awayData} loading={awayLoading} teamName={awayTeamName} />
      <BullpenTable data={homeData} loading={homeLoading} teamName={homeTeamName} />
    </div>
  );
}

// ── Weather Tab ───────────────────────────────────────────────────────────────
function WeatherTab({ venueId, stadiumMeta }: { venueId: number; stadiumMeta: any }) {
  const { data: weather, isLoading } = useQuery<any>({
    queryKey: [`/api/weather/${venueId}`],
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return (
    <div className="space-y-3 py-2">{[...Array(5)].map((_, i) => <SkeletonBlock key={i} h={18} />)}</div>
  );

  if (!weather) return <p className="text-sm text-muted-foreground">Weather data unavailable.</p>;

  return (
    <div className="space-y-5 max-w-lg">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-muted/40 rounded-lg p-3 flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <div>
            <p className="text-lg font-bold text-foreground tabular">{weather.tempF}°F</p>
            <p className="text-xs text-muted-foreground">Temperature</p>
          </div>
        </div>
        <div className="bg-muted/40 rounded-lg p-3 flex items-center gap-2">
          <Wind className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <div>
            <p className="text-lg font-bold text-foreground tabular">{weather.windMph} mph</p>
            <p className="text-xs text-muted-foreground">{weather.windDirRelative}</p>
          </div>
        </div>
        <div className="bg-muted/40 rounded-lg p-3 flex items-center gap-2">
          <Droplets className="w-4 h-4 text-sky-400 flex-shrink-0" />
          <div>
            <p className="text-lg font-bold text-foreground tabular">{weather.humidityPct}%</p>
            <p className="text-xs text-muted-foreground">Humidity</p>
          </div>
        </div>
      </div>

      {weather.precipPct > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 flex items-center gap-2">
          <Cloud className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-300">{Math.round(weather.precipPct)}% precipitation chance</p>
        </div>
      )}

      <div>
        <SectionTitle>Quick-Glance Badges</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {weather.badges?.length > 0 ? (
            <WeatherBadges badges={weather.badges} />
          ) : (
            <span className="text-sm text-muted-foreground">No notable weather conditions</span>
          )}
          {weather.isDomeClosed && <span className="badge-dome text-xs px-2 py-0.5 rounded font-medium">Dome</span>}
        </div>
      </div>

      {stadiumMeta && (
        <div>
          <SectionTitle>Stadium</SectionTitle>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted/40 rounded-lg p-3 text-center">
              <p className="text-sm font-bold text-foreground">{stadiumMeta.parkFactor}</p>
              <p className="text-xs text-muted-foreground">Park Factor</p>
            </div>
            <div className="bg-muted/40 rounded-lg p-3 text-center">
              <p className="text-sm font-bold text-foreground capitalize">{stadiumMeta.roofType}</p>
              <p className="text-xs text-muted-foreground">Roof Type</p>
            </div>
            <div className="bg-muted/40 rounded-lg p-3 text-center">
              <p className="text-sm font-bold text-foreground">{stadiumMeta.city}, {stadiumMeta.state}</p>
              <p className="text-xs text-muted-foreground">Location</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Scoring Model Tab ─────────────────────────────────────────────────────────
function ScoringModelTab({ gamePk }: { gamePk: number }) {
  const { data, isLoading } = useQuery<any>({
    queryKey: [`/api/scoring-prob/${gamePk}`],
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return (
    <div className="space-y-3">{[...Array(5)].map((_, i) => <SkeletonBlock key={i} h={18} />)}</div>
  );

  if (!data || data.error) return (
    <p className="text-sm text-muted-foreground">Scoring probability model unavailable for this game.</p>
  );

  function ProbBar({ pct, label }: { pct: number; label: string }) {
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-semibold text-foreground tabular">{pct}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700"
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <p className="text-xs text-amber-300">{data.note}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[
          { team: data.awayTeam, label: "Away" },
          { team: data.homeTeam, label: "Home" },
        ].map(({ team, label }) => (
          <div key={label}>
            <SectionTitle>{label} — P(Score in inning)</SectionTitle>
            <div className="space-y-3">
              <ProbBar pct={team?.scoring?.inning1 || 0} label="1st inning" />
              <ProbBar pct={team?.scoring?.inning2 || 0} label="2nd inning" />
              <ProbBar pct={team?.scoring?.inning3 || 0} label="3rd inning" />
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-muted-foreground space-y-1 border-t border-border pt-3">
        <p>Model: <span className="text-foreground">{data.model}</span></p>
        <p>Confidence: <span className="text-amber-400">{data.confidence}</span></p>
        <p>Park factor applied: <span className="text-foreground">{data.parkFactor}</span></p>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function GameDetailPage() {
  const { gamePk } = useParams<{ gamePk: string }>();
  const gamePkNum = parseInt(gamePk);

  const { data: scheduleData, isLoading } = useQuery<any>({
    queryKey: [`/api/schedule`, `?date=${format(new Date(), "yyyy-MM-dd")}`],
    queryFn: async () => {
      const today = format(new Date(), "yyyy-MM-dd");
      const res = await fetch(`/api/schedule?date=${today}`);
      return res.json();
    },
  });

  // Try to find game in today's schedule first
  const game = scheduleData?.games?.find((g: any) => g.gamePk === gamePkNum);

  // Fallback: fetch individual game
  const { data: gameSched } = useQuery<any>({
    queryKey: [`/api/schedule`, `?gamePks=${gamePkNum}`],
    queryFn: async () => {
      const res = await fetch(`/api/schedule?date=${format(new Date(), "yyyy-MM-dd")}`);
      return res.json();
    },
    enabled: !game && !isLoading,
  });

  const g = game || gameSched?.games?.[0];

  if (!g && isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {[...Array(6)].map((_, i) => <SkeletonBlock key={i} h={20} />)}
      </div>
    );
  }

  if (!g) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center">
        <p className="text-muted-foreground">Game not found.</p>
        <Link href="/"><a className="text-primary text-sm hover:underline mt-2 inline-block">Back to slate</a></Link>
      </div>
    );
  }

  const homeId = g.homeTeam?.id;
  const awayId = g.awayTeam?.id;
  const homePitcherId = g.homeProbablePitcher?.id;
  const awayPitcherId = g.awayProbablePitcher?.id;
  const venueId = g.venueId;

  return (
    <div className="max-w-4xl mx-auto px-4 py-5">
      {/* Back nav */}
      <Link href="/">
        <a className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-3.5 h-3.5" />
          Today's Slate
        </a>
      </Link>

      {/* Game header */}
      <div className="bg-card border border-border rounded-xl p-4 mb-5">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">{g.venue}</span>
          <span className="text-sm text-muted-foreground">{formatGameTime(g.gameTime, "America/Chicago")} CDT</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div>
              <p className="text-lg font-bold text-foreground">{g.awayTeam?.name}</p>
              <p className="text-xs text-muted-foreground">{g.awayProbablePitcher?.fullName || "TBD"}</p>
            </div>
          </div>
          <div className="text-center flex-shrink-0">
            {(g.status?.includes("Progress") || g.status?.includes("Final")) && (
              <div className="flex items-center gap-3 text-2xl font-bold tabular">
                <span>{g.awayTeam?.score ?? 0}</span>
                <span className="text-muted-foreground text-base">—</span>
                <span>{g.homeTeam?.score ?? 0}</span>
              </div>
            )}
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full border font-medium mt-1 inline-block",
              g.status?.includes("Progress") ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" :
              g.status?.includes("Final") ? "bg-slate-500/20 text-slate-300 border-slate-500/30" :
              "bg-blue-500/15 text-blue-300 border-blue-500/30"
            )}>
              {g.status || "Scheduled"}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-0 justify-end text-right">
            <div>
              <p className="text-lg font-bold text-foreground">{g.homeTeam?.name}</p>
              <p className="text-xs text-muted-foreground">{g.homeProbablePitcher?.fullName || "TBD"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="matchup">
        <TabsList className="mb-4 w-full overflow-x-auto flex">
          <TabsTrigger value="matchup" className="flex-1 min-w-max">Matchup</TabsTrigger>
          <TabsTrigger value="lineups" className="flex-1 min-w-max">Lineups</TabsTrigger>
          <TabsTrigger value="bullpens" className="flex-1 min-w-max">Bullpens</TabsTrigger>
          <TabsTrigger value="weather" className="flex-1 min-w-max">Weather</TabsTrigger>
          <TabsTrigger value="scoring" className="flex-1 min-w-max">Scoring Model</TabsTrigger>
        </TabsList>

        {/* MATCHUP TAB */}
        <TabsContent value="matchup" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Away pitcher */}
            <div className="bg-card border border-border rounded-xl p-4">
              {awayPitcherId ? (
                <PitcherCard pitcherId={awayPitcherId} teamName={g.awayTeam?.name} isHome={false} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">Probable pitcher TBD</p>
                </div>
              )}
            </div>

            {/* Home pitcher */}
            <div className="bg-card border border-border rounded-xl p-4">
              {homePitcherId ? (
                <PitcherCard pitcherId={homePitcherId} teamName={g.homeTeam?.name} isHome={true} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">Probable pitcher TBD</p>
                </div>
              )}
            </div>
          </div>

          {/* BvP Panels */}
          {(awayPitcherId || homePitcherId) && (
            <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Home lineup vs Away pitcher */}
              {awayPitcherId && (
                <HomeLinupBvPSection
                  teamId={homeId}
                  pitcherId={awayPitcherId}
                  pitcherName={g.awayProbablePitcher?.fullName || "Away SP"}
                  isHome={true}
                />
              )}
              {/* Away lineup vs Home pitcher */}
              {homePitcherId && (
                <HomeLinupBvPSection
                  teamId={awayId}
                  pitcherId={homePitcherId}
                  pitcherName={g.homeProbablePitcher?.fullName || "Home SP"}
                  isHome={false}
                />
              )}
            </div>
          )}
        </TabsContent>

        {/* LINEUPS TAB */}
        <TabsContent value="lineups" className="mt-0">
          <div className="bg-card border border-border rounded-xl p-4">
            <LineupsTab gamePk={gamePkNum} />
          </div>
        </TabsContent>

        {/* BULLPENS TAB */}
        <TabsContent value="bullpens" className="mt-0">
          <div className="bg-card border border-border rounded-xl p-4">
            <BullpensTab
              homeTeamId={homeId}
              awayTeamId={awayId}
              homeTeamName={g.homeTeam?.name}
              awayTeamName={g.awayTeam?.name}
            />
          </div>
        </TabsContent>

        {/* WEATHER TAB */}
        <TabsContent value="weather" className="mt-0">
          <div className="bg-card border border-border rounded-xl p-4">
            <WeatherTab venueId={venueId} stadiumMeta={g.stadiumMeta} />
          </div>
        </TabsContent>

        {/* SCORING MODEL TAB */}
        <TabsContent value="scoring" className="mt-0">
          <div className="bg-card border border-border rounded-xl p-4">
            <ScoringModelTab gamePk={gamePkNum} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function HomeLinupBvPSection({ teamId, pitcherId, pitcherName, isHome }: {
  teamId: number; pitcherId: number; pitcherName: string; isHome: boolean;
}) {
  const { data: lineupData, isLoading } = useQuery<any>({
    queryKey: [`/api/game/`, `${teamId}`, `/lineups`],
    queryFn: async () => {
      // Use team roster as lineup proxy when lineups aren't posted
      const res = await fetch(`/api/team/${teamId}/bullpen`);
      return res.json();
    },
    staleTime: 30_000,
  });

  // Show a collapsed panel
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {isHome ? "Home" : "Away"} Lineup vs {pitcherName.split(" ").pop()}
        </h3>
        <Button variant="ghost" size="sm" onClick={() => setExpanded(e => !e)}>
          {expanded ? "Collapse" : "Show BvP"}
        </Button>
      </div>
      {!expanded && (
        <p className="text-xs text-muted-foreground">Click "Show BvP" to load batter vs. pitcher history (requires lineup data).</p>
      )}
      {expanded && (
        <p className="text-xs text-muted-foreground py-4 text-center">
          BvP stats load when official lineups are posted (usually ~1hr before first pitch).
        </p>
      )}
    </div>
  );
}
