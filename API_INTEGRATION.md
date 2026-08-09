# Plugging in real API keys

The app is now wired to accept real data. Nothing is required to keep it
working as-is — but here's what changes and what to do when your leader
hands you keys.

## What's already done

- **Air quality is live-ready right now, with zero keys.** `src/providers/live-air-quality.server.ts`
  calls Open-Meteo (no auth needed) automatically. Set `CITY_LAT` / `CITY_LON`
  in `.env` to your team's locked city and the Air Quality page will show
  real numbers instead of mock ones — today.
- **CPCB and WAQI are wired and waiting.** The moment you add `CPCB_API_KEY`
  or `WAQI_API_TOKEN` to `.env`, they get tried first (CPCB > WAQI > Open-Meteo,
  matching the plan's "credibility anchor" priority) — no code changes needed.
- **Keys never reach the browser.** Everything that touches `process.env` for
  a key lives in files named `*.server.ts` — TanStack Start strips these from
  the client bundle automatically. Never move a key-reading call into a
  `.tsx` component or a plain `src/services/*.ts` function; it would ship
  the key to every visitor's browser.

## Step-by-step when your leader gives you a key

1. `cp .env.example .env` (if you haven't already — `.env` is git-ignored,
   never commit it).
2. Paste the key into the matching line, e.g.:
   ```
   CPCB_API_KEY=abc123yourrealkey
   ```
3. Restart the dev server (`Ctrl+C`, then `npm run dev` again — env vars are
   only read on startup).
4. Open the Air Quality page. If the numbers changed from the mock values,
   it worked.
5. Check the terminal running `npm run dev` for `[cpcb] ...` or `[waqi] ...`
   warning logs — if the key is wrong or the response shape is unexpected,
   it'll say so there instead of crashing the page (it silently falls back
   to mock data on any failure).

## If CPCB's response looks wrong

I built the CPCB parser from the plan's documented resource shape, but
couldn't test it live (no network in the environment I built this in).
If the numbers don't look right once you have a real key:

1. Open `src/providers/cpcb.server.ts`.
2. Temporarily add `console.log(records[0])` right after `const records = ...`.
3. Run it, check the terminal for the real field names, and adjust
   `pickPollutant()` to match.

WAQI and Open-Meteo are wired against their official, stable documented
response shapes — those two should work as-is.

## Extending this to other modules (water, waste, energy, traffic, green cover)

The plan's Overpass/Nominatim sources cover infra, green space, and mobility
— once your team decides exactly which Overpass queries to use, the pattern
is identical to what's here:

1. Add a provider file under `src/providers/`, named `*.server.ts` (copy `open-meteo.server.ts`
   as a template — same shape: fetch, parse defensively, return `null` on
   any failure, never throw).
2. Add a `createServerFn` in a `*.server.ts` file that calls it (see `live-air-quality.server.ts`).
3. In `src/services/modules-service.ts`, do the same overlay-onto-mock
   pattern used in `getAirQuality()` for the matching `get*()` function.

That keeps every module working with mock data by default and upgrading to
real data automatically the moment a source is wired — same as air quality
today.
