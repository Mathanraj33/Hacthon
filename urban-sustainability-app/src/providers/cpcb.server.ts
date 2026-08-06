import type { LiveAirQualityReading } from "./types";

const RESOURCE_ID = "3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69";

/**
 * data.gov.in CPCB real-time AQI feed. Requires CPCB_API_KEY (free,
 * register at https://data.gov.in/user/register — takes hours to approve).
 *
 * NOTE: this environment has no network access, so the exact field names
 * below (`pollutant_id`, `pollutant_avg`, etc.) are based on the resource's
 * documented shape, not a live response. The first time you run this with
 * a real key, check the browser/server console — if parsing looks off,
 * `console.log(records[0])` right after the fetch to see the real field
 * names and adjust `pickPollutant` below. This is the one part of the
 * integration worth double-checking by hand.
 */
export async function fetchCpcbAirQuality(city: string): Promise<LiveAirQualityReading | null> {
  const apiKey = process.env.CPCB_API_KEY;
  if (!apiKey) return null;

  const url = new URL(`https://api.data.gov.in/resource/${RESOURCE_ID}`);
  url.searchParams.set("api-key", apiKey);
  url.searchParams.set("format", "json");
  url.searchParams.set("filters[city]", city);
  url.searchParams.set("limit", "50");

  try {
    const res = await fetch(url.toString());
    if (!res.ok) {
      console.warn(`[cpcb] non-OK response: ${res.status}`);
      return null;
    }

    const json = (await res.json()) as {
      records?: Array<{
        pollutant_id?: string;
        pollutant_avg?: string;
        station?: string;
        city?: string;
      }>;
    };

    const records = json.records ?? [];
    if (records.length === 0) {
      console.warn(`[cpcb] no records for city "${city}"`);
      return null;
    }

    const pickPollutant = (id: string) => {
      const match = records.find((r) => r.pollutant_id?.toUpperCase() === id);
      const value = match?.pollutant_avg ? Number(match.pollutant_avg) : undefined;
      return Number.isFinite(value) ? value : undefined;
    };

    return {
      source: "cpcb",
      pm25: pickPollutant("PM2.5"),
      pm10: pickPollutant("PM10"),
      co2: pickPollutant("CO2"),
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.warn("[cpcb] fetch failed", error);
    return null;
  }
}
