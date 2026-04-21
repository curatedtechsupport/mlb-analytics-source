import type { Express } from "express";
import type { Server } from "http";
import { getSchedule, getLiveFeed, getBoxscore, getPitcherStats, getBatterStats, getTeamRoster, getTeamStats, getBvPStats, getTeamPitchingStats, mlbFetch } from "./mlb.js";
import { getStadium } from "./stadiums.js";
import { fetchWeather } from "./weather.js";
import { format } from "date-fns";

// Simple in-memory cache
const cache = new Map<string, { data: any; ts: number }>();
function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && now - hit.ts < ttlMs) return Promise.resolve(hit.data as T);
  return fn().then((data) => {
    cache.set(key, { data, ts: now });
    return data;
  });
}

const FIVE_MIN = 5 * 60 * 1000;
const THIRTY_SEC = 30 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

export function registerRoutes(httpServer: Server, app: Express) {

  // ---------- HEALTH CHECK ----------
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", ts: Date.now() });
  });

  // ---------- SCHEDULE ----------
  app.get("/api/schedule", async (req, res) => {
    try {
      const date = (req.query.date as string) || format(new Date(), "yyyy-MM-dd");
      const raw = await cached(`schedule:${date}`, THIRTY_SEC, () => getSchedule(date));
      const dates = (raw as any).dates || [];
      const games = dates.flatMap((d: any) => d.games || []);

      const enriched = games.map((g: any) => {
        const venueId = g.venue?.id;
        const stadium = venueId ? getStadium(venueId) : undefined;
        return {
          gamePk: g.gamePk,
          status: g.status?.detailedState,
          statusCode: g.status?.statusCode,
          gameTime: g.gameDate,
          venue: g.venue?.name,
          venueId,
          stadiumMeta: stadium || null,
          homeTeam: {
            id: g.teams?.home?.team?.id,
            name: g.teams?.home?.team?.name,
            abbreviation: g.teams?.home?.team?.abbreviation,
            score: g.teams?.home?.score ?? null,
          },
          awayTeam: {
            id: g.teams?.away?.team?.id,
            name: g.teams?.away?.team?.name,
            abbreviation: g.teams?.away?.team?.abbreviation,
            score: g.teams?.away?.score ?? null,
          },
          homeProbablePitcher: g.teams?.home?.probablePitcher
            ? {
                id: g.teams.home.probablePitcher.id,
                fullName: g.teams.home.probablePitcher.fullName,
              }
            : null,
          awayProbablePitcher: g.teams?.away?.probablePitcher
            ? {
                id: g.teams.away.probablePitcher.id,
                fullName: g.teams.away.probablePitcher.fullName,
              }
            : null,
          linescore: g.linescore || null,
        };
      });

      res.json({ games: enriched, date });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ---------- WEATHER ----------
  app.get("/api/weather/:venueId", async (req, res) => {
    try {
      const venueId = parseInt(req.params.venueId);
      const stadium = getStadium(venueId);
      if (!stadium) {
        return res.json({
          tempF: 72, windMph: 5, windDirDeg: 0, windDirRelative: "N/A",
          humidityPct: 50, precipPct: 0, conditions: "Clear", isDomeClosed: false, badges: []
        });
      }
      const isDome = stadium.roofType === "dome" ||
        (stadium.roofType === "retractable" && ["Rogers Centre", "Tropicana Field", "loanDepot park"].includes(stadium.name));

      const weather = await cached(`weather:${venueId}`, FIVE_MIN, () =>
        fetchWeather(stadium.lat, stadium.lon, stadium.cfBearingDeg, isDome)
      );
      res.json(weather);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ---------- PITCHER STATS ----------
  app.get("/api/pitcher/:playerId", async (req, res) => {
    try {
      const playerId = parseInt(req.params.playerId);
      const season = req.query.season ? parseInt(req.query.season as string) : undefined;
      const yr = season ?? new Date().getFullYear();

      // Get player info + season stats
      const [playerData, gameLog, splits] = await Promise.all([
        cached(`pitcher:${playerId}:${yr}:season`, ONE_HOUR, () =>
          mlbFetch(`/people/${playerId}?hydrate=stats(group=[pitching],type=[season,statSplits],season=${yr},statSplits=[vLH,vRH,home,away])&season=${yr}`)
        ),
        cached(`pitcher:${playerId}:${yr}:log`, ONE_HOUR, () =>
          mlbFetch(`/people/${playerId}/stats?stats=gameLog&group=pitching&season=${yr}&limit=3`)
        ),
        cached(`pitcher:${playerId}:${yr}:splits`, ONE_HOUR, () =>
          mlbFetch(`/people/${playerId}/stats?stats=statSplits&group=pitching&season=${yr}&sitCodes=vL,vR,h,a`)
        ),
      ]);

      const person = (playerData as any).people?.[0];
      const seasonStats = person?.stats?.find((s: any) => s.type?.displayName === "season")?.splits?.[0]?.stat || {};
      const statSplits = person?.stats?.find((s: any) => s.type?.displayName === "statSplits")?.splits || [];
      const recentGames = ((gameLog as any).stats?.[0]?.splits || []).slice(0, 3);

      res.json({
        id: playerId,
        fullName: person?.fullName,
        pitchHand: person?.pitchHand?.code,
        jersey: person?.primaryNumber,
        currentTeam: person?.currentTeam?.name,
        seasonStats,
        splits: statSplits,
        recentGames: recentGames.map((g: any) => ({
          date: g.date,
          opponent: g.opponent?.name,
          ip: g.stat?.inningsPitched,
          h: g.stat?.hits,
          er: g.stat?.earnedRuns,
          bb: g.stat?.baseOnBalls,
          k: g.stat?.strikeOuts,
          era: g.stat?.era,
        })),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ---------- BATTER STATS ----------
  app.get("/api/batter/:playerId", async (req, res) => {
    try {
      const playerId = parseInt(req.params.playerId);
      const season = req.query.season ? parseInt(req.query.season as string) : undefined;
      const yr = season ?? new Date().getFullYear();

      const playerData = await cached(`batter:${playerId}:${yr}`, ONE_HOUR, () =>
        mlbFetch(`/people/${playerId}?hydrate=stats(group=[hitting],type=[season,statSplits],season=${yr},statSplits=[vLHP,vRHP,home,away])&season=${yr}`)
      );

      const person = (playerData as any).people?.[0];
      const seasonStats = person?.stats?.find((s: any) => s.type?.displayName === "season")?.splits?.[0]?.stat || {};
      const splits = person?.stats?.find((s: any) => s.type?.displayName === "statSplits")?.splits || [];

      res.json({
        id: playerId,
        fullName: person?.fullName,
        batSide: person?.batSide?.code,
        position: person?.primaryPosition?.abbreviation,
        jersey: person?.primaryNumber,
        seasonStats,
        splits,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ---------- BVP STATS ----------
  app.get("/api/bvp/:batterId/:pitcherId", async (req, res) => {
    try {
      const { batterId, pitcherId } = req.params;
      const data = await cached(`bvp:${batterId}:${pitcherId}`, ONE_HOUR, () =>
        mlbFetch(`/people/${batterId}/stats?stats=vsPlayer&opposingPlayerId=${pitcherId}&group=hitting&sportId=1`)
      );
      const stats = (data as any).stats?.[0]?.splits?.[0]?.stat || {};
      const pa = stats.plateAppearances || 0;
      res.json({
        batterId: parseInt(batterId),
        pitcherId: parseInt(pitcherId),
        stat: stats,
        plateAppearances: pa,
        isLowConfidence: pa < 20,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ---------- TEAM BATTING STATS ----------
  app.get("/api/team/:teamId/batting", async (req, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      const yr = new Date().getFullYear();

      const [seasonData, splitsData] = await Promise.all([
        cached(`team:${teamId}:batting:${yr}`, ONE_HOUR, () =>
          mlbFetch(`/teams/${teamId}/stats?stats=season&group=hitting&season=${yr}`)
        ),
        cached(`team:${teamId}:batting:splits:${yr}`, ONE_HOUR, () =>
          mlbFetch(`/teams/${teamId}/stats?stats=statSplits&group=hitting&season=${yr}&sitCodes=vLHP,vRHP`)
        ),
      ]);

      const seasonStats = (seasonData as any).stats?.[0]?.splits?.[0]?.stat || {};
      const splits = (splitsData as any).stats?.[0]?.splits || [];

      res.json({ teamId, seasonStats, splits });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ---------- TEAM ROSTER + BULLPEN STATS ----------
  app.get("/api/team/:teamId/bullpen", async (req, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      const yr = new Date().getFullYear();

      const rosterData = await cached(`team:${teamId}:roster:${yr}`, ONE_HOUR, () =>
        mlbFetch(`/teams/${teamId}/roster/active?hydrate=person(stats(group=[pitching],type=[season,gameLog],season=${yr}))`)
      );

      const roster = (rosterData as any).roster || [];
      const pitchers = roster.filter((p: any) =>
        ["P", "RP", "SP", "CP"].includes(p.person?.primaryPosition?.abbreviation || p.status?.code || "")
        || p.person?.primaryPosition?.type === "Pitcher"
      );

      const bullpen = pitchers
        .map((p: any) => {
          const person = p.person;
          const seasonStats = person?.stats?.find((s: any) => s.type?.displayName === "season")?.splits?.[0]?.stat || {};
          const recentGames = (person?.stats?.find((s: any) => s.type?.displayName === "gameLog")?.splits || []).slice(0, 5);
          const pitchesLast3 = recentGames.slice(0, 3).reduce((sum: number, g: any) => sum + (g.stat?.numberOfPitches || 0), 0);

          // Composite score (lower = better): z-blend of ERA/FIP proxy
          const era = parseFloat(seasonStats.era) || 4.5;
          const whip = parseFloat(seasonStats.whip) || 1.3;
          const k9 = parseFloat(seasonStats.strikeoutsPer9Inn) || 7;
          const bb9 = parseFloat(seasonStats.walksPer9Inn) || 3;
          const compositeScore = (era * 0.35) + (whip * 1.5) + (bb9 * 0.25) - (k9 * 0.1);

          return {
            id: person?.id,
            fullName: person?.fullName,
            position: p.position?.abbreviation || person?.primaryPosition?.abbreviation,
            pitchHand: person?.pitchHand?.code,
            jersey: person?.primaryNumber,
            seasonStats: {
              era: seasonStats.era,
              whip: seasonStats.whip,
              k9: seasonStats.strikeoutsPer9Inn,
              bb9: seasonStats.walksPer9Inn,
              hr9: seasonStats.homeRunsPer9,
              fip: seasonStats.fielding,
              saves: seasonStats.saves,
              holds: seasonStats.holds,
              ip: seasonStats.inningsPitched,
              appearances: seasonStats.gamesPlayed,
            },
            pitchesLast3Days: pitchesLast3,
            isAvailable: pitchesLast3 < 60,
            compositeScore: Math.round(compositeScore * 100) / 100,
          };
        })
        .filter((p: any) => p.position !== "SP" || (parseFloat(p.seasonStats?.ip) || 0) < 50);

      // Sort by composite score ascending (lower = better)
      bullpen.sort((a: any, b: any) => a.compositeScore - b.compositeScore);

      res.json({ teamId, bullpen });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ---------- GAME LINEUPS ----------
  app.get("/api/game/:gamePk/lineups", async (req, res) => {
    try {
      const gamePk = parseInt(req.params.gamePk);
      const data = await cached(`lineups:${gamePk}`, THIRTY_SEC, () =>
        mlbFetch(`/game/${gamePk}/boxscore`)
      );

      const box = data as any;
      const extractLineup = (teamBox: any) => {
        const batters = Object.values(teamBox?.players || {})
          .filter((p: any) => p.battingOrder && p.battingOrder % 100 === 0)
          .sort((a: any, b: any) => a.battingOrder - b.battingOrder)
          .map((p: any) => ({
            id: p.person?.id,
            fullName: p.person?.fullName,
            position: p.position?.abbreviation,
            battingOrder: p.battingOrder,
            stats: p.stats?.batting || {},
          }));
        return batters;
      };

      res.json({
        gamePk,
        homeLineup: extractLineup(box.teams?.home),
        awayLineup: extractLineup(box.teams?.away),
        homeTeamName: box.teams?.home?.team?.name,
        awayTeamName: box.teams?.away?.team?.name,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ---------- LINESCORE (live game state) ----------
  app.get("/api/game/:gamePk/linescore", async (req, res) => {
    try {
      const gamePk = parseInt(req.params.gamePk);
      const data = await cached(`linescore:${gamePk}`, THIRTY_SEC, () =>
        mlbFetch(`/game/${gamePk}/linescore`)
      );
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ---------- EARLY INNING SCORING PROBABILITY ----------
  app.get("/api/scoring-prob/:gamePk", async (req, res) => {
    try {
      const gamePk = parseInt(req.params.gamePk);
      const schedData = await cached(`schedgame:${gamePk}`, FIVE_MIN, () =>
        mlbFetch(`/schedule?gamePks=${gamePk}&hydrate=probablePitcher,team`)
      );

      const game = (schedData as any).dates?.[0]?.games?.[0];
      if (!game) return res.json({ error: "Game not found" });

      const homeTeamId = game.teams?.home?.team?.id;
      const awayTeamId = game.teams?.away?.team?.id;
      const homePitcherId = game.teams?.home?.probablePitcher?.id;
      const awayPitcherId = game.teams?.away?.probablePitcher?.id;
      const venueId = game.venue?.id;
      const stadium = venueId ? getStadium(venueId) : undefined;
      const parkFactor = stadium?.parkFactor ?? 100;

      // Fetch team batting and pitching season stats
      const yr = new Date().getFullYear();
      const [homeBatting, awayBatting, homeTeamPitching, awayTeamPitching] = await Promise.all([
        cached(`team:${homeTeamId}:batting:${yr}`, ONE_HOUR, () =>
          mlbFetch(`/teams/${homeTeamId}/stats?stats=season&group=hitting&season=${yr}`)
        ).catch(() => null),
        cached(`team:${awayTeamId}:batting:${yr}`, ONE_HOUR, () =>
          mlbFetch(`/teams/${awayTeamId}/stats?stats=season&group=hitting&season=${yr}`)
        ).catch(() => null),
        homePitcherId ? cached(`pitcher:${homePitcherId}:${yr}:season`, ONE_HOUR, () =>
          mlbFetch(`/people/${homePitcherId}?hydrate=stats(group=[pitching],type=[season])&season=${yr}`)
        ).catch(() => null) : Promise.resolve(null),
        awayPitcherId ? cached(`pitcher:${awayPitcherId}:${yr}:season`, ONE_HOUR, () =>
          mlbFetch(`/people/${awayPitcherId}?hydrate=stats(group=[pitching],type=[season])&season=${yr}`)
        ).catch(() => null) : Promise.resolve(null),
      ]);

      // v1 baseline model: blend team scoring rate × opponent pitcher ER rate × park factor
      function calcProb(battingData: any, pitcherData: any, isHome: boolean) {
        const battingStats = battingData?.stats?.[0]?.splits?.[0]?.stat || {};
        const runsPerGame = parseFloat(battingStats.runsBatted ?? 4.3);
        const avgRunsPerInning = runsPerGame / 9;

        const pitcherStats = pitcherData?.people?.[0]?.stats?.find((s: any) => s.type?.displayName === "season")?.splits?.[0]?.stat || {};
        const era = parseFloat(pitcherStats.era || "4.20");
        const erPerInning = era / 9;

        const blended = (avgRunsPerInning + erPerInning) / 2;
        const parkAdj = parkFactor / 100;

        // Probability at least 1 run scores in inning (Poisson)
        const lambda1 = blended * parkAdj * (isHome ? 0.97 : 1.03); // home advantage tiny
        const prob1 = 1 - Math.exp(-lambda1);
        // Early innings (1-3) starters are fresh, slightly lower scoring
        const prob1st = prob1 * 0.85;
        const prob2nd = prob1 * 0.90;
        const prob3rd = prob1 * 0.95;

        return {
          inning1: Math.round(prob1st * 100),
          inning2: Math.round(prob2nd * 100),
          inning3: Math.round(prob3rd * 100),
          lambda: Math.round(lambda1 * 100) / 100,
        };
      }

      const homeProbs = calcProb(homeBatting, awayTeamPitching, true);
      const awayProbs = calcProb(awayBatting, homeTeamPitching, false);

      res.json({
        gamePk,
        model: "v1-baseline",
        confidence: "Low-medium (season-level signal only)",
        parkFactor,
        homeTeam: { teamId: homeTeamId, scoring: homeProbs },
        awayTeam: { teamId: awayTeamId, scoring: awayProbs },
        note: "P(team scores in inning N) = blend of season run rate, opposing starter ERA, and park factor. Sample sizes may vary.",
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ---------- PLAYER SEARCH ----------
  app.get("/api/player/search", async (req, res) => {
    try {
      const q = req.query.q as string;
      if (!q || q.length < 2) return res.json({ players: [] });
      const data = await mlbFetch(`/people/search?names=${encodeURIComponent(q)}&sportId=1`);
      res.json({ players: (data as any).people || [] });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ---------- TEAM LIST ----------
  app.get("/api/teams", async (req, res) => {
    try {
      const data = await cached("teams", ONE_HOUR * 24, () =>
        mlbFetch(`/teams?sportId=1&season=${new Date().getFullYear()}`)
      );
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
}
