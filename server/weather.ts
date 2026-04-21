
import { getWindDirectionRelativeToField } from "./stadiums.js";

const OWM_KEY = process.env.OPENWEATHER_API_KEY || "";

export interface WeatherData {
  tempF: number;
  windMph: number;
  windDirDeg: number;
  windDirRelative: string;
  humidityPct: number;
  precipPct: number;
  conditions: string;
  isDomeClosed: boolean;
  badges: string[];
}

function celsiusToF(c: number) {
  return Math.round((c * 9) / 5 + 32);
}

function mpsToMph(mps: number) {
  return Math.round(mps * 2.237);
}

export async function fetchWeather(
  lat: number,
  lon: number,
  cfBearingDeg: number,
  isDome: boolean
): Promise<WeatherData> {
  if (isDome) {
    return {
      tempF: 72,
      windMph: 0,
      windDirDeg: 0,
      windDirRelative: "Dome",
      humidityPct: 50,
      precipPct: 0,
      conditions: "Dome",
      isDomeClosed: true,
      badges: ["Dome"],
    };
  }

  // Use OWM if key is provided, otherwise return mock data
  if (!OWM_KEY) {
    return mockWeather(cfBearingDeg);
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_KEY}&units=metric`;
    const res = await fetch(url);
    if (!res.ok) return mockWeather(cfBearingDeg);
    const data = (await res.json()) as any;

    const tempF = celsiusToF(data.main?.temp ?? 20);
    const windMph = mpsToMph(data.wind?.speed ?? 0);
    const windDirDeg = data.wind?.deg ?? 0;
    const humidityPct = data.main?.humidity ?? 50;
    const precipPct = data.rain ? Math.min(100, (data.rain["1h"] || 0) * 20) : 0;
    const conditions = data.weather?.[0]?.description ?? "clear";
    const windDirRelative = getWindDirectionRelativeToField(windDirDeg, cfBearingDeg);

    const badges = generateBadges({ tempF, windMph, windDirRelative, precipPct, conditions });

    return {
      tempF,
      windMph,
      windDirDeg,
      windDirRelative,
      humidityPct,
      precipPct,
      conditions,
      isDomeClosed: false,
      badges,
    };
  } catch {
    return mockWeather(cfBearingDeg);
  }
}

function mockWeather(cfBearingDeg: number): WeatherData {
  const tempF = 68;
  const windMph = 8;
  const windDirDeg = 180;
  const windDirRelative = getWindDirectionRelativeToField(windDirDeg, cfBearingDeg);
  return {
    tempF,
    windMph,
    windDirDeg,
    windDirRelative,
    humidityPct: 55,
    precipPct: 10,
    conditions: "Partly Cloudy",
    isDomeClosed: false,
    badges: generateBadges({ tempF, windMph, windDirRelative, precipPct: 10, conditions: "Partly Cloudy" }),
  };
}

function generateBadges(w: {
  tempF: number;
  windMph: number;
  windDirRelative: string;
  precipPct: number;
  conditions: string;
}) {
  const badges: string[] = [];
  if (w.tempF < 55) badges.push("Cold (<55°F)");
  if (w.precipPct > 30) badges.push("Rain risk");
  if (w.windMph >= 10 && (w.windDirRelative.includes("Out"))) badges.push("Hitter-friendly wind");
  if (w.windMph >= 10 && (w.windDirRelative.includes("In"))) badges.push("Pitcher-friendly wind");
  return badges;
}
