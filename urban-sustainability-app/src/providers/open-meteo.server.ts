import type { LiveAirQualityReading } from "./types";

/**
 * Open-Meteo Air Quality API — no auth required. This is the "fastest win"
 * source from the plan and works today with zero configuration, so it's
 * the default fallback whenever CPCB/WAQI aren't set up yet.
 *
 * Docs: https://open-meteo.com/en/docs/air-quality-api
 */
export async function fetchOpenMeteoAirQuality(lat: number, lon: number): Promise<LiveAirQualityReading | null> {
  const url = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("current", "pm10,pm2_5,carbon_monoxide,us_aqi");

  try {
    const res = await fetch(url.toString());
    if (!res.ok) {
      console.warn(`[open-meteo] non-OK response: ${res.status}`);
      return null;
    }

    const json = (await res.json()) as {
      current?: {
        time?: string;
        pm10?: number;
        pm2_5?: number;
        carbon_monoxide?: number;
        us_aqi?: number;
      };
    };

    if (!json.current) {
      console.warn("[open-meteo] unexpected response shape", json);
      return null;
    }

    return {
      source: "open-meteo",
      aqi: json.current.us_aqi,
      pm25: json.current.pm2_5,
      pm10: json.current.pm10,
      co2: json.current.carbon_monoxide,
      fetchedAt: json.current.time ?? new Date().toISOString(),
    };
  } catch (error) {
    console.warn("[open-meteo] fetch failed", error);
    return null;
  }
}
