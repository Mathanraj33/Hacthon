import type { LiveAirQualityReading } from "./types";

/**
 * World Air Quality Index API — token can be "demo" for initial testing,
 * or a free registered token from https://aqicn.org/data-platform/token/
 */
export async function fetchWaqiAirQuality(city: string): Promise<LiveAirQualityReading | null> {
  const token = process.env.WAQI_API_TOKEN;
  if (!token) return null;

  const url = `https://api.waqi.info/feed/${encodeURIComponent(city)}/?token=${token}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[waqi] non-OK response: ${res.status}`);
      return null;
    }

    const json = (await res.json()) as {
      status?: string;
      data?: {
        aqi?: number;
        time?: { iso?: string };
        iaqi?: Record<string, { v?: number }>;
      };
    };

    if (json.status !== "ok" || !json.data) {
      console.warn("[waqi] request not ok", json);
      return null;
    }

    return {
      source: "waqi",
      aqi: json.data.aqi,
      pm25: json.data.iaqi?.pm25?.v,
      pm10: json.data.iaqi?.pm10?.v,
      co2: json.data.iaqi?.co?.v,
      fetchedAt: json.data.time?.iso ?? new Date().toISOString(),
    };
  } catch (error) {
    console.warn("[waqi] fetch failed", error);
    return null;
  }
}
