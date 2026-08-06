import { createServerFn } from "@tanstack/react-start";
import { fetchCpcbAirQuality } from "./cpcb.server";
import { fetchWaqiAirQuality } from "./waqi.server";
import { fetchOpenMeteoAirQuality } from "./open-meteo.server";
import type { LiveAirQualityReading } from "./types";

/**
 * This whole file only ever runs on the server (TanStack Start server
 * functions are stripped from the client bundle), so `process.env.*` here
 * — including API keys — is never sent to the browser. Do not import
 * anything from here into client-only code expecting the keys themselves;
 * always go through this function and use the returned data.
 */
export const getLiveAirQuality = createServerFn({ method: "GET" }).handler(
  async (): Promise<LiveAirQualityReading | null> => {
    const city = process.env.CITY_NAME ?? "Chennai";
    const lat = Number(process.env.CITY_LAT ?? 13.0827);
    const lon = Number(process.env.CITY_LON ?? 80.2707);

    // Preference order: CPCB (the plan's "credibility anchor" — real Indian
    // govt data) → WAQI (cross-check) → Open-Meteo (always available, no key).
    const cpcb = await fetchCpcbAirQuality(city);
    if (cpcb) return cpcb;

    const waqi = await fetchWaqiAirQuality(city);
    if (waqi) return waqi;

    return fetchOpenMeteoAirQuality(lat, lon);
  },
);
