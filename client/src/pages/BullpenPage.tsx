import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatERA, eraColor, whipColor } from "@/lib/utils";

type SortKey = "compositeScore" | "era" | "whip" | "k9" | "bb9" | "ip" | "appearances";
type SortDir = "asc" | "desc";

export default function BullpenPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const teamIdNum = parseInt(teamId);

  const [sortKey, setSortKey] = useState<SortKey>("compositeScore");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const { data, isLoading } = useQuery<any>({
    queryKey: [`/api/team/${teamIdNum}/bullpen`],
    staleTime: 60 * 60 * 1000,
  });

  const { data: teamData } = useQuery<any>({
    queryKey: ["/api/schedule"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch(`/api/schedule?date=${today}`);
      return res.json();
    },
  });

  const teamName = teamData?.games?.flatMap((g: any) => [g.homeTeam, g.awayTeam])
    .find((t: any) => t?.id === teamIdNum)?.name || `Team ${teamId}`;

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const bullpen = [...(data?.bullpen || [])].sort((a: any, b: any) => {
    const aVal = a.seasonStats?.[sortKey] ?? a[sortKey] ?? 999;
    const bVal = b.seasonStats?.[sortKey] ?? b[sortKey] ?? 999;
    const aNum = typeof aVal === "string" ? parseFloat(aVal) : aVal;
    const bNum = typeof bVal === "string" ? parseFloat(bVal) : bVal;
    return sortDir === "asc" ? aNum - bNum : bNum - aNum;
  });

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronUp className="w-3 h-3 opacity-20" />;
    return sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />;
  }

  function Th({ col, label }: { col: SortKey; label: string }) {
    return (
      <th
        className="text-left pb-3 pr-3 text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors select-none"
        onClick={() => handleSort(col)}
      >
        <span className="flex items-center gap-1">
          {label} <SortIcon col={col} />
        </span>
      </th>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-5">
      <Link href="/">
        <a className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-3.5 h-3.5" />
          Today's Slate
        </a>
      </Link>

      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
          {teamName} — Bullpen Rankings
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Composite score = weighted blend of ERA, WHIP, BB/9, and K/9 (lower = better). Click headers to sort.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton-shimmer h-8 rounded" />
            ))}
          </div>
        ) : bullpen.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No bullpen data available.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left pb-3 pr-3 text-muted-foreground font-medium">Pitcher</th>
                <th className="text-left pb-3 pr-3 text-muted-foreground font-medium">Role</th>
                <th className="text-left pb-3 pr-3 text-muted-foreground font-medium">Hand</th>
                <Th col="era" label="ERA" />
                <Th col="whip" label="WHIP" />
                <Th col="k9" label="K/9" />
                <Th col="bb9" label="BB/9" />
                <th className="text-left pb-3 pr-3 text-muted-foreground font-medium">IP</th>
                <th className="text-left pb-3 pr-3 text-muted-foreground font-medium">G</th>
                <th className="text-left pb-3 pr-3 text-muted-foreground font-medium">Avail</th>
                <Th col="compositeScore" label="Score" />
              </tr>
            </thead>
            <tbody>
              {bullpen.map((p: any, i: number) => (
                <tr
                  key={p.id}
                  className={cn(
                    "border-b border-border/40 hover:bg-muted/20 transition-colors",
                    i < 3 ? "bg-emerald-500/5" : ""
                  )}
                  data-testid={`row-pitcher-${p.id}`}
                >
                  <td className="py-2 pr-3 font-semibold text-foreground whitespace-nowrap">
                    {p.fullName}
                    {p.jersey && <span className="text-muted-foreground text-xs ml-1">#{p.jersey}</span>}
                  </td>
                  <td className="py-2 pr-3 text-muted-foreground text-xs">{p.position}</td>
                  <td className="py-2 pr-3 text-muted-foreground text-xs">{p.pitchHand}HP</td>
                  <td className={cn("py-2 pr-3 tabular font-semibold text-xs", eraColor(p.seasonStats?.era))}>
                    {formatERA(p.seasonStats?.era)}
                  </td>
                  <td className={cn("py-2 pr-3 tabular text-xs", whipColor(p.seasonStats?.whip))}>
                    {formatERA(p.seasonStats?.whip)}
                  </td>
                  <td className="py-2 pr-3 tabular text-xs text-primary font-medium">
                    {formatERA(p.seasonStats?.k9)}
                  </td>
                  <td className="py-2 pr-3 tabular text-xs text-muted-foreground">
                    {formatERA(p.seasonStats?.bb9)}
                  </td>
                  <td className="py-2 pr-3 tabular text-xs text-muted-foreground">
                    {p.seasonStats?.ip || "—"}
                  </td>
                  <td className="py-2 pr-3 tabular text-xs text-muted-foreground">
                    {p.seasonStats?.appearances || "—"}
                  </td>
                  <td className="py-2 pr-3">
                    {p.isAvailable ? (
                      <span className="text-emerald-400 text-xs font-medium">✓</span>
                    ) : (
                      <span className="badge-rain text-xs px-1.5 py-0.5 rounded font-medium">Used</span>
                    )}
                  </td>
                  <td className={cn(
                    "py-2 tabular text-xs font-semibold",
                    i < 3 ? "text-emerald-400" : i < 6 ? "text-yellow-400" : "text-muted-foreground"
                  )}>
                    {p.compositeScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-4 text-xs text-muted-foreground space-y-1">
        <p>Composite score = ERA×0.35 + WHIP×1.5 + BB/9×0.25 − K/9×0.1 (lower = better)</p>
        <p>Availability based on pitches thrown in last 3 days (≥60 pitches = flagged as used)</p>
      </div>
    </div>
  );
}
