export type LiveAirQualityReading = {
  source: "cpcb" | "waqi" | "open-meteo";
  /** Air Quality Index, scale depends on source (US AQI for open-meteo, national index for cpcb/waqi). */
  aqi: number | undefined;
  pm25: number | undefined;
  pm10: number | undefined;
  co2: number | undefined;
  fetchedAt: string;
};
