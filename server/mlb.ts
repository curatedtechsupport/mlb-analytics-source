

const MLB_BASE = "https://statsapi.mlb.com/api/v1";

export async function mlbFetch(path: string) {
  const url = `${MLB_BASE}${path}`;
  const res = await fetch(url, { headers: { "Accept": "application/json" } });
  if (!res.ok) throw new Error(`MLB API error: ${res.status} ${url}`);
  return res.json();
}

export async function getSchedule(date: string) {
  // date format: YYYY-MM-DD
  return mlbFetch(
    `/schedule?sportId=1&date=${date}&hydrate=probablePitcher,linescore,team,venue,weather,game(content(summary))&language=en`
  );
}

export async function getLiveFeed(gamePk: number) {
  return mlbFetch(`/game/${gamePk}/linescore`);
}

export async function getBoxscore(gamePk: number) {
  return mlbFetch(`/game/${gamePk}/boxscore`);
}

export async function getPitcherStats(playerId: number, season?: number) {
  const yr = season ?? new Date().getFullYear();
  return mlbFetch(
    `/people/${playerId}?hydrate=stats(group=[pitching],type=[season,gameLog,vsTeam,statSplits],season=${yr},statSplits=[vLH,vRH,home,away])&season=${yr}`
  );
}

export async function getBatterStats(playerId: number, season?: number) {
  const yr = season ?? new Date().getFullYear();
  return mlbFetch(
    `/people/${playerId}?hydrate=stats(group=[hitting],type=[season,gameLog,vsTeam,statSplits],season=${yr},statSplits=[vLHP,vRHP,home,away])&season=${yr}`
  );
}

export async function getTeamRoster(teamId: number, rosterType: string = "active") {
  return mlbFetch(`/teams/${teamId}/roster/${rosterType}?hydrate=person(stats(group=[pitching],type=[season]))`);
}

export async function getTeamStats(teamId: number, season?: number) {
  const yr = season ?? new Date().getFullYear();
  return mlbFetch(
    `/teams/${teamId}/stats?stats=season&group=hitting&season=${yr}`
  );
}

export async function getBvPStats(batterId: number, pitcherId: number) {
  return mlbFetch(
    `/people/${batterId}/stats?stats=vsPlayer&opposingPlayerId=${pitcherId}&group=hitting&sportId=1`
  );
}

export async function getTeamPitchingStats(teamId: number, season?: number) {
  const yr = season ?? new Date().getFullYear();
  return mlbFetch(
    `/teams/${teamId}/stats?stats=season&group=pitching&season=${yr}`
  );
}

export async function getPlayerCurrentSeason(playerId: number) {
  const yr = new Date().getFullYear();
  return mlbFetch(
    `/people/${playerId}/stats?stats=season,gameLog&group=pitching,hitting&season=${yr}`
  );
}

export async function getInningScoreRates(teamId: number, season?: number) {
  const yr = season ?? new Date().getFullYear();
  return mlbFetch(
    `/teams/${teamId}/stats?stats=season&group=hitting&season=${yr}&sitCodes=1st,2nd,3rd`
  );
}
