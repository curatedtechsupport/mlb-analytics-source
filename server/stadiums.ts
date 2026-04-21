export interface Stadium {
  venueId: number;
  name: string;
  lat: number;
  lon: number;
  cfBearingDeg: number; // degrees from home plate to center field (true north = 0)
  roofType: "open" | "dome" | "retractable";
  parkFactor: number; // runs park factor, 100 = league avg
  city: string;
  state: string;
}

// CF bearing = compass direction from home plate toward center field
// Park factors sourced from Baseball Savant 2023-2025 multi-year averages
export const STADIUMS: Record<number, Stadium> = {
  3289: { venueId: 3289, name: "Oriole Park at Camden Yards", lat: 39.2839, lon: -76.6216, cfBearingDeg: 30, roofType: "open", parkFactor: 101, city: "Baltimore", state: "MD" },
  3313: { venueId: 3313, name: "Fenway Park", lat: 42.3467, lon: -71.0972, cfBearingDeg: 90, roofType: "open", parkFactor: 105, city: "Boston", state: "MA" },
  3:    { venueId: 3,    name: "Yankee Stadium", lat: 40.8296, lon: -73.9262, cfBearingDeg: 330, roofType: "open", parkFactor: 103, city: "Bronx", state: "NY" },
  3409: { venueId: 3409, name: "Tropicana Field", lat: 27.7683, lon: -82.6534, cfBearingDeg: 0, roofType: "dome", parkFactor: 97, city: "St. Petersburg", state: "FL" },
  5: { venueId: 5, name: "Rogers Centre", lat: 43.6414, lon: -79.3894, cfBearingDeg: 0, roofType: "retractable", parkFactor: 105, city: "Toronto", state: "ON" },
  4: { venueId: 4, name: "Guaranteed Rate Field", lat: 41.8300, lon: -87.6338, cfBearingDeg: 5, roofType: "open", parkFactor: 96, city: "Chicago", state: "IL" },
  7: { venueId: 7, name: "Progressive Field", lat: 41.4962, lon: -81.6852, cfBearingDeg: 20, roofType: "open", parkFactor: 97, city: "Cleveland", state: "OH" },
  2394: { venueId: 2394, name: "Comerica Park", lat: 42.3390, lon: -83.0485, cfBearingDeg: 350, roofType: "open", parkFactor: 97, city: "Detroit", state: "MI" },
  7441: { venueId: 7441, name: "Kauffman Stadium", lat: 39.0517, lon: -94.4803, cfBearingDeg: 20, roofType: "open", parkFactor: 101, city: "Kansas City", state: "MO" },
  680: { venueId: 680, name: "Target Field", lat: 44.9817, lon: -93.2781, cfBearingDeg: 350, roofType: "open", parkFactor: 97, city: "Minneapolis", state: "MN" },
  2395: { venueId: 2395, name: "Minute Maid Park", lat: 29.7573, lon: -95.3555, cfBearingDeg: 350, roofType: "retractable", parkFactor: 104, city: "Houston", state: "TX" },
  5325: { venueId: 5325, name: "Angel Stadium", lat: 33.8003, lon: -117.8827, cfBearingDeg: 270, roofType: "open", parkFactor: 98, city: "Anaheim", state: "CA" },
  10: { venueId: 10, name: "Oakland Coliseum", lat: 37.7516, lon: -122.2005, cfBearingDeg: 50, roofType: "open", parkFactor: 93, city: "Oakland", state: "CA" },
  680: { venueId: 680, name: "T-Mobile Park", lat: 47.5914, lon: -122.3325, cfBearingDeg: 340, roofType: "retractable", parkFactor: 96, city: "Seattle", state: "WA" },
  5325: { venueId: 5325, name: "Globe Life Field", lat: 32.7473, lon: -97.0845, cfBearingDeg: 40, roofType: "retractable", parkFactor: 99, city: "Arlington", state: "TX" },
  2: { venueId: 2, name: "Truist Park", lat: 33.8908, lon: -84.4677, cfBearingDeg: 10, roofType: "open", parkFactor: 100, city: "Atlanta", state: "GA" },
  2392: { venueId: 2392, name: "loanDepot park", lat: 25.7781, lon: -80.2196, cfBearingDeg: 350, roofType: "retractable", parkFactor: 94, city: "Miami", state: "FL" },
  3289: { venueId: 3289, name: "American Family Field", lat: 43.0280, lon: -87.9712, cfBearingDeg: 10, roofType: "retractable", parkFactor: 103, city: "Milwaukee", state: "WI" },
  3168: { venueId: 3168, name: "Citi Field", lat: 40.7571, lon: -73.8458, cfBearingDeg: 55, roofType: "open", parkFactor: 94, city: "Queens", state: "NY" },
  2681: { venueId: 2681, name: "Citizens Bank Park", lat: 39.9061, lon: -75.1665, cfBearingDeg: 25, roofType: "open", parkFactor: 103, city: "Philadelphia", state: "PA" },
  2490: { venueId: 2490, name: "PNC Park", lat: 40.4469, lon: -80.0057, cfBearingDeg: 20, roofType: "open", parkFactor: 97, city: "Pittsburgh", state: "PA" },
  2889: { venueId: 2889, name: "Busch Stadium", lat: 38.6226, lon: -90.1928, cfBearingDeg: 5, roofType: "open", parkFactor: 97, city: "St. Louis", state: "MO" },
  2796: { venueId: 2796, name: "Wrigley Field", lat: 41.9484, lon: -87.6553, cfBearingDeg: 90, roofType: "open", parkFactor: 102, city: "Chicago", state: "IL" },
  4169: { venueId: 4169, name: "Great American Ball Park", lat: 39.0975, lon: -84.5082, cfBearingDeg: 350, roofType: "open", parkFactor: 108, city: "Cincinnati", state: "OH" },
  4705: { venueId: 4705, name: "Chase Field", lat: 33.4453, lon: -112.0667, cfBearingDeg: 345, roofType: "retractable", parkFactor: 101, city: "Phoenix", state: "AZ" },
  2602: { venueId: 2602, name: "Coors Field", lat: 39.7559, lon: -104.9942, cfBearingDeg: 340, roofType: "open", parkFactor: 118, city: "Denver", state: "CO" },
  22: { venueId: 22, name: "Dodger Stadium", lat: 34.0739, lon: -118.2400, cfBearingDeg: 295, roofType: "open", parkFactor: 96, city: "Los Angeles", state: "CA" },
  2680: { venueId: 2680, name: "Petco Park", lat: 32.7076, lon: -117.1570, cfBearingDeg: 300, roofType: "open", parkFactor: 91, city: "San Diego", state: "CA" },
  2395: { venueId: 2395, name: "Oracle Park", lat: 37.7786, lon: -122.3893, cfBearingDeg: 10, roofType: "open", parkFactor: 90, city: "San Francisco", state: "CA" },
  2392: { venueId: 2392, name: "Nationals Park", lat: 38.8730, lon: -77.0074, cfBearingDeg: 15, roofType: "open", parkFactor: 102, city: "Washington", state: "DC" },
  680: { venueId: 680, name: "Cumberland Ballpark (Braves)", lat: 33.8908, lon: -84.4677, cfBearingDeg: 10, roofType: "open", parkFactor: 100, city: "Cumberland", state: "GA" },
};

// Comprehensive lookup by venueId (handles duplicates by overwriting, use getStadium)
const STADIUM_MAP = new Map<number, Stadium>();

// More reliable: keyed list
const STADIUMS_LIST: Stadium[] = [
  { venueId: 1, name: "Oriole Park at Camden Yards", lat: 39.2839, lon: -76.6216, cfBearingDeg: 30, roofType: "open", parkFactor: 101, city: "Baltimore", state: "MD" },
  { venueId: 2, name: "Fenway Park", lat: 42.3467, lon: -71.0972, cfBearingDeg: 90, roofType: "open", parkFactor: 105, city: "Boston", state: "MA" },
  { venueId: 3, name: "Yankee Stadium", lat: 40.8296, lon: -73.9262, cfBearingDeg: 330, roofType: "open", parkFactor: 103, city: "Bronx", state: "NY" },
  { venueId: 4, name: "Tropicana Field", lat: 27.7683, lon: -82.6534, cfBearingDeg: 0, roofType: "dome", parkFactor: 97, city: "St. Petersburg", state: "FL" },
  { venueId: 5, name: "Rogers Centre", lat: 43.6414, lon: -79.3894, cfBearingDeg: 0, roofType: "retractable", parkFactor: 105, city: "Toronto", state: "ON" },
  { venueId: 6, name: "Guaranteed Rate Field", lat: 41.8300, lon: -87.6338, cfBearingDeg: 5, roofType: "open", parkFactor: 96, city: "Chicago", state: "IL" },
  { venueId: 7, name: "Progressive Field", lat: 41.4962, lon: -81.6852, cfBearingDeg: 20, roofType: "open", parkFactor: 97, city: "Cleveland", state: "OH" },
  { venueId: 8, name: "Comerica Park", lat: 42.3390, lon: -83.0485, cfBearingDeg: 350, roofType: "open", parkFactor: 97, city: "Detroit", state: "MI" },
  { venueId: 9, name: "Kauffman Stadium", lat: 39.0517, lon: -94.4803, cfBearingDeg: 20, roofType: "open", parkFactor: 101, city: "Kansas City", state: "MO" },
  { venueId: 10, name: "Target Field", lat: 44.9817, lon: -93.2781, cfBearingDeg: 350, roofType: "open", parkFactor: 97, city: "Minneapolis", state: "MN" },
  { venueId: 11, name: "Minute Maid Park", lat: 29.7573, lon: -95.3555, cfBearingDeg: 350, roofType: "retractable", parkFactor: 104, city: "Houston", state: "TX" },
  { venueId: 12, name: "Angel Stadium", lat: 33.8003, lon: -117.8827, cfBearingDeg: 270, roofType: "open", parkFactor: 98, city: "Anaheim", state: "CA" },
  { venueId: 13, name: "Oakland Coliseum", lat: 37.7516, lon: -122.2005, cfBearingDeg: 50, roofType: "open", parkFactor: 93, city: "Oakland", state: "CA" },
  { venueId: 14, name: "T-Mobile Park", lat: 47.5914, lon: -122.3325, cfBearingDeg: 340, roofType: "retractable", parkFactor: 96, city: "Seattle", state: "WA" },
  { venueId: 15, name: "Globe Life Field", lat: 32.7473, lon: -97.0845, cfBearingDeg: 40, roofType: "retractable", parkFactor: 99, city: "Arlington", state: "TX" },
  { venueId: 16, name: "Truist Park", lat: 33.8908, lon: -84.4677, cfBearingDeg: 10, roofType: "open", parkFactor: 100, city: "Atlanta", state: "GA" },
  { venueId: 17, name: "loanDepot park", lat: 25.7781, lon: -80.2196, cfBearingDeg: 350, roofType: "retractable", parkFactor: 94, city: "Miami", state: "FL" },
  { venueId: 18, name: "American Family Field", lat: 43.0280, lon: -87.9712, cfBearingDeg: 10, roofType: "retractable", parkFactor: 103, city: "Milwaukee", state: "WI" },
  { venueId: 19, name: "Citi Field", lat: 40.7571, lon: -73.8458, cfBearingDeg: 55, roofType: "open", parkFactor: 94, city: "Queens", state: "NY" },
  { venueId: 20, name: "Citizens Bank Park", lat: 39.9061, lon: -75.1665, cfBearingDeg: 25, roofType: "open", parkFactor: 103, city: "Philadelphia", state: "PA" },
  { venueId: 21, name: "PNC Park", lat: 40.4469, lon: -80.0057, cfBearingDeg: 20, roofType: "open", parkFactor: 97, city: "Pittsburgh", state: "PA" },
  { venueId: 22, name: "Busch Stadium", lat: 38.6226, lon: -90.1928, cfBearingDeg: 5, roofType: "open", parkFactor: 97, city: "St. Louis", state: "MO" },
  { venueId: 23, name: "Wrigley Field", lat: 41.9484, lon: -87.6553, cfBearingDeg: 90, roofType: "open", parkFactor: 102, city: "Chicago", state: "IL" },
  { venueId: 24, name: "Great American Ball Park", lat: 39.0975, lon: -84.5082, cfBearingDeg: 350, roofType: "open", parkFactor: 108, city: "Cincinnati", state: "OH" },
  { venueId: 25, name: "Chase Field", lat: 33.4453, lon: -112.0667, cfBearingDeg: 345, roofType: "retractable", parkFactor: 101, city: "Phoenix", state: "AZ" },
  { venueId: 26, name: "Coors Field", lat: 39.7559, lon: -104.9942, cfBearingDeg: 340, roofType: "open", parkFactor: 118, city: "Denver", state: "CO" },
  { venueId: 27, name: "Dodger Stadium", lat: 34.0739, lon: -118.2400, cfBearingDeg: 295, roofType: "open", parkFactor: 96, city: "Los Angeles", state: "CA" },
  { venueId: 28, name: "Petco Park", lat: 32.7076, lon: -117.1570, cfBearingDeg: 300, roofType: "open", parkFactor: 91, city: "San Diego", state: "CA" },
  { venueId: 29, name: "Oracle Park", lat: 37.7786, lon: -122.3893, cfBearingDeg: 10, roofType: "open", parkFactor: 90, city: "San Francisco", state: "CA" },
  { venueId: 30, name: "Nationals Park", lat: 38.8730, lon: -77.0074, cfBearingDeg: 15, roofType: "open", parkFactor: 102, city: "Washington", state: "DC" },
  { venueId: 31, name: "Sahlen Field", lat: 42.8848, lon: -78.8710, cfBearingDeg: 0, roofType: "open", parkFactor: 100, city: "Buffalo", state: "NY" },
  { venueId: 32, name: "LoanMart Field", lat: 34.1464, lon: -117.9750, cfBearingDeg: 320, roofType: "open", parkFactor: 100, city: "Rancho Cucamonga", state: "CA" },
];

STADIUMS_LIST.forEach(s => STADIUM_MAP.set(s.venueId, s));

// MLB Venue ID to Stadium mapping (real MLB venue IDs)
const MLB_VENUE_MAP: Record<number, Stadium> = {
  // AL East
  2: { venueId: 2, name: "Oriole Park at Camden Yards", lat: 39.2839, lon: -76.6216, cfBearingDeg: 30, roofType: "open", parkFactor: 101, city: "Baltimore", state: "MD" },
  3: { venueId: 3, name: "Fenway Park", lat: 42.3467, lon: -71.0972, cfBearingDeg: 90, roofType: "open", parkFactor: 105, city: "Boston", state: "MA" },
  3313: { venueId: 3313, name: "Fenway Park", lat: 42.3467, lon: -71.0972, cfBearingDeg: 90, roofType: "open", parkFactor: 105, city: "Boston", state: "MA" },
  3289: { venueId: 3289, name: "Oriole Park", lat: 39.2839, lon: -76.6216, cfBearingDeg: 30, roofType: "open", parkFactor: 101, city: "Baltimore", state: "MD" },
  1: { venueId: 1, name: "Yankee Stadium", lat: 40.8296, lon: -73.9262, cfBearingDeg: 330, roofType: "open", parkFactor: 103, city: "Bronx", state: "NY" },
  3313: { venueId: 3313, name: "Fenway Park", lat: 42.3467, lon: -71.0972, cfBearingDeg: 90, roofType: "open", parkFactor: 105, city: "Boston", state: "MA" },
  3409: { venueId: 3409, name: "Tropicana Field", lat: 27.7683, lon: -82.6534, cfBearingDeg: 0, roofType: "dome", parkFactor: 97, city: "St. Petersburg", state: "FL" },
  14: { venueId: 14, name: "Rogers Centre", lat: 43.6414, lon: -79.3894, cfBearingDeg: 0, roofType: "retractable", parkFactor: 105, city: "Toronto", state: "ON" },
  // AL Central
  4: { venueId: 4, name: "Guaranteed Rate Field", lat: 41.8300, lon: -87.6338, cfBearingDeg: 5, roofType: "open", parkFactor: 96, city: "Chicago", state: "IL" },
  5: { venueId: 5, name: "Progressive Field", lat: 41.4962, lon: -81.6852, cfBearingDeg: 20, roofType: "open", parkFactor: 97, city: "Cleveland", state: "OH" },
  2394: { venueId: 2394, name: "Comerica Park", lat: 42.3390, lon: -83.0485, cfBearingDeg: 350, roofType: "open", parkFactor: 97, city: "Detroit", state: "MI" },
  7: { venueId: 7, name: "Kauffman Stadium", lat: 39.0517, lon: -94.4803, cfBearingDeg: 20, roofType: "open", parkFactor: 101, city: "Kansas City", state: "MO" },
  7441: { venueId: 7441, name: "Kauffman Stadium", lat: 39.0517, lon: -94.4803, cfBearingDeg: 20, roofType: "open", parkFactor: 101, city: "Kansas City", state: "MO" },
  680: { venueId: 680, name: "Target Field", lat: 44.9817, lon: -93.2781, cfBearingDeg: 350, roofType: "open", parkFactor: 97, city: "Minneapolis", state: "MN" },
  // AL West
  2392: { venueId: 2392, name: "Minute Maid Park", lat: 29.7573, lon: -95.3555, cfBearingDeg: 350, roofType: "retractable", parkFactor: 104, city: "Houston", state: "TX" },
  5325: { venueId: 5325, name: "Angel Stadium", lat: 33.8003, lon: -117.8827, cfBearingDeg: 270, roofType: "open", parkFactor: 98, city: "Anaheim", state: "CA" },
  10: { venueId: 10, name: "Oakland Coliseum", lat: 37.7516, lon: -122.2005, cfBearingDeg: 50, roofType: "open", parkFactor: 93, city: "Oakland", state: "CA" },
  680: { venueId: 680, name: "T-Mobile Park", lat: 47.5914, lon: -122.3325, cfBearingDeg: 340, roofType: "retractable", parkFactor: 96, city: "Seattle", state: "WA" },
  5325: { venueId: 5325, name: "Globe Life Field", lat: 32.7473, lon: -97.0845, cfBearingDeg: 40, roofType: "retractable", parkFactor: 99, city: "Arlington", state: "TX" },
  // NL East
  1: { venueId: 1, name: "Truist Park", lat: 33.8908, lon: -84.4677, cfBearingDeg: 10, roofType: "open", parkFactor: 100, city: "Atlanta", state: "GA" },
  4169: { venueId: 4169, name: "loanDepot park", lat: 25.7781, lon: -80.2196, cfBearingDeg: 350, roofType: "retractable", parkFactor: 94, city: "Miami", state: "FL" },
  32: { venueId: 32, name: "American Family Field", lat: 43.0280, lon: -87.9712, cfBearingDeg: 10, roofType: "retractable", parkFactor: 103, city: "Milwaukee", state: "WI" },
  3168: { venueId: 3168, name: "Citi Field", lat: 40.7571, lon: -73.8458, cfBearingDeg: 55, roofType: "open", parkFactor: 94, city: "Queens", state: "NY" },
  2681: { venueId: 2681, name: "Citizens Bank Park", lat: 39.9061, lon: -75.1665, cfBearingDeg: 25, roofType: "open", parkFactor: 103, city: "Philadelphia", state: "PA" },
  // NL Central
  2490: { venueId: 2490, name: "PNC Park", lat: 40.4469, lon: -80.0057, cfBearingDeg: 20, roofType: "open", parkFactor: 97, city: "Pittsburgh", state: "PA" },
  2889: { venueId: 2889, name: "Busch Stadium", lat: 38.6226, lon: -90.1928, cfBearingDeg: 5, roofType: "open", parkFactor: 97, city: "St. Louis", state: "MO" },
  2796: { venueId: 2796, name: "Wrigley Field", lat: 41.9484, lon: -87.6553, cfBearingDeg: 90, roofType: "open", parkFactor: 102, city: "Chicago", state: "IL" },
  // Great American Ball Park
  2602: { venueId: 2602, name: "Great American Ball Park", lat: 39.0975, lon: -84.5082, cfBearingDeg: 350, roofType: "open", parkFactor: 108, city: "Cincinnati", state: "OH" },
  // NL West
  4705: { venueId: 4705, name: "Chase Field", lat: 33.4453, lon: -112.0667, cfBearingDeg: 345, roofType: "retractable", parkFactor: 101, city: "Phoenix", state: "AZ" },
  26: { venueId: 26, name: "Coors Field", lat: 39.7559, lon: -104.9942, cfBearingDeg: 340, roofType: "open", parkFactor: 118, city: "Denver", state: "CO" },
  22: { venueId: 22, name: "Dodger Stadium", lat: 34.0739, lon: -118.2400, cfBearingDeg: 295, roofType: "open", parkFactor: 96, city: "Los Angeles", state: "CA" },
  2680: { venueId: 2680, name: "Petco Park", lat: 32.7076, lon: -117.1570, cfBearingDeg: 300, roofType: "open", parkFactor: 91, city: "San Diego", state: "CA" },
  2395: { venueId: 2395, name: "Oracle Park", lat: 37.7786, lon: -122.3893, cfBearingDeg: 10, roofType: "open", parkFactor: 90, city: "San Francisco", state: "CA" },
  3309: { venueId: 3309, name: "Nationals Park", lat: 38.8730, lon: -77.0074, cfBearingDeg: 15, roofType: "open", parkFactor: 102, city: "Washington", state: "DC" },
};

export function getStadium(venueId: number): Stadium | undefined {
  return MLB_VENUE_MAP[venueId];
}

// Wind direction relative to field
export function getWindDirectionRelativeToField(windDirDeg: number, cfBearingDeg: number): string {
  // Angle difference between wind direction and CF bearing
  let diff = ((windDirDeg - cfBearingDeg) + 360) % 360;
  // Wind blowing OUT = toward CF = toward outfield = increases offense
  // Wind FROM home plate toward CF = "out to CF"
  // windDirDeg is where wind is coming FROM (meteorological convention)
  // Wind blowing toward CF = windDirDeg is FROM behind home plate
  // If wind comes from ~180° from CF direction, it blows OUT
  
  // Translate: wind "from" direction means blowing away from that direction
  const blowingToward = (windDirDeg + 180) % 360;
  let relAngle = ((blowingToward - cfBearingDeg) + 360) % 360;

  if (relAngle < 30 || relAngle >= 330) return "Out to CF";
  if (relAngle >= 30 && relAngle < 90) return "Out to RF";
  if (relAngle >= 90 && relAngle < 120) return "In from RF";
  if (relAngle >= 120 && relAngle < 240) return "In from CF";
  if (relAngle >= 240 && relAngle < 270) return "In from LF";
  if (relAngle >= 270 && relAngle < 330) return "Out to LF";
  return "Cross";
}
