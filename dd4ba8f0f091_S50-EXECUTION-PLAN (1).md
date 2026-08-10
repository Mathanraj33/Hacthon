# S-50 — Intelligent Urban Sustainability Assessment System
## HackNova'26 · 16-Day Winning Execution Plan · Team of 4

> **Source of truth:** HackNova'26 Software Problem Statements, Track 5 (AI & Data-Driven Smart Cities), S-50.
> Verbatim requirement: *"Create an AI-powered platform that evaluates urban sustainability using multiple indicators such as environmental quality, infrastructure efficiency, public services, mobility, and community well-being. The system should generate sustainability scores, identify improvement opportunities, and support strategic decision-making for future-ready cities."*
> Theme: SDG 11 / Sustainable Smart Cities.

**Read this line before anything else:** the problem statement contains exactly three deliverable verbs — **generate scores**, **identify improvement opportunities**, **support strategic decision-making**. Everything in this plan exists to serve those three verbs. Any feature that does not map to one of them is a distraction, no matter how impressive it sounds.

---

# PART 0 — The Strategic Read (Why Most Teams Lose This Problem)

Before Phase 1, understand the competitive landscape you are walking into.

**What 80% of teams will build for S-50:** a dashboard with five charts, a map with coloured pins, a number labelled "Sustainability Score: 72", and a chatbot bolted onto the corner. They will demo it, the judge will ask "how did you calculate 72?", and the team will say "we averaged the indicators." That answer loses the hackathon.

**Why they lose:** S-50 is not a visualisation problem. It is a **decision-support** problem. The judge is not evaluating whether you can draw a chart. They are evaluating whether a real city commissioner could open your tool on Monday morning and make a defensible budget decision with it.

**Your three differentiators — decided now, defended for 16 days:**

| # | Differentiator | Why it wins |
|---|---|---|
| 1 | **Glass-box scoring** | Every score decomposes into weighted indicators with visible math and a per-indicator contribution breakdown. When a judge asks "why 72?", you click and show the arithmetic. No competitor will have this. |
| 2 | **Policy simulator ("what-if")** | Judge moves a slider — "add 15% green cover" — and the score, the map, and the 5-year forecast all recompute live. This converts a dashboard into a decision tool. **This is your WOW moment.** |
| 3 | **Real live civic data** | You will use the actual Government of India CPCB real-time air quality feed (3,521 live station records, verified working). Not `mock_data.json`. When you say "this is live from CPCB right now", the room changes. |

**The one-sentence pitch you will repeat all 16 days:**
> *"Cities measure sustainability once a year in a PDF nobody reads. We built a live, explainable sustainability operating system that scores every ward continuously, tells you exactly which intervention buys the most improvement per rupee, and lets you simulate the policy before you fund it."*

If a team member cannot recite that sentence on Day 3, planning has failed.

---

# PHASE 1 — Before Writing Any Code (Days 1–2)

## 1.1 What to do FIRST — in exact order

**Hour 1 — Re-read the problem statement as a team, out loud.**
Extract the five mandated indicator pillars into a shared doc. S-50 names them explicitly: *environmental quality, infrastructure efficiency, public services, mobility, community well-being*. These five are non-negotiable — they are your scoring model's top-level structure, handed to you by the organisers. Building four, or building seven, is a scoring risk.

**Hour 2 — Write the "Judge's Question List" before writing code.**
Sit as a team and write the 15 hardest questions a judge could ask. Then design the system so the answers are demonstrable, not verbal. This single exercise is worth more than two days of coding. (Full list in Phase 11 — start from ours, add your own.)

**Hour 3 — Data reconnaissance. This is the highest-risk unknown; kill it on Day 1.**
Do not design a schema before you know what data actually exists. We have already verified the following sources are live and free (tested and confirmed working):

| Source | Endpoint | Auth | Verified status | Use for |
|---|---|---|---|---|
| **Open-Meteo Air Quality** | `https://air-quality-api.open-meteo.com/v1/air-quality` | **None** | ✅ Live — returned PM2.5 18.5, PM10 32.5 μg/m³ for Chennai | Environmental pillar, any city worldwide |
| **Open-Meteo Forecast** | `https://api.open-meteo.com/v1/forecast` | **None** | ✅ Live — hourly temp/rain | Heat + climate exposure, forecasting |
| **data.gov.in CPCB AQI** | `https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69` | Free key | ✅ Live — **3,521 station records**, station-level lat/lon, per-pollutant | **Your credibility anchor — real Indian govt data** |
| **OpenStreetMap Overpass** | `https://overpass-api.de/api/interpreter` | **None** | ✅ Live | Green space, hospitals, schools, bus stops, roads → infra/services/mobility pillars |
| **Nominatim** | `https://nominatim.openstreetmap.org/search` | None (UA required) | ✅ Live | Geocoding city/ward names |
| **WAQI** | `https://api.waqi.info/feed/{city}/?token=` | Free key (`demo` works for testing) | ✅ Live | Cross-validation / fallback for AQI |
| **Census / municipal open data** | State open-data portals | Varies | Download CSV | Population, ward boundaries, well-being |

> **Critical Day-1 action:** register for the free `data.gov.in` API key and the free WAQI token immediately. Registration can take hours. Do not discover this on Day 9.
>
> **Note on OpenAQ:** `api.openaq.org/v3` now returns **HTTP 401 without an API key** — it is no longer keyless. Either register or skip it; Open-Meteo covers the same need with zero auth. This is exactly the kind of stale assumption that kills teams on Day 12.

**Hour 4 — Pick ONE city and ONE ward granularity. Write it down. Never change it.**
Recommendation: your own city, 8–12 wards/zones. Local city = you can speak about it credibly, judges likely know it, and you can source real ward boundaries. Ten wards is enough for a rich map and small enough to seed real data.

**Hour 5–6 — Draw the architecture on paper/whiteboard.** Photograph it. Then draw the five demo screens as rough boxes. If you cannot draw it, you cannot build it.

**Hour 7 — Freeze the tech stack.** (Given in Phase 5.) No stack debates after Day 1. A team that switches from Chart.js to D3 on Day 9 loses the hackathon.

**Hour 8 — Set up the repo, CI, and deploy a "Hello World" to production.**
Deploy on **Day 1**, not Day 14. A live URL on Day 1 removes the single most common cause of hackathon death: the deployment that fails at 2 AM before demo day.

## 1.2 What NOT to do — hard prohibitions

| ❌ Do NOT | Why it kills you |
|---|---|
| Start coding on Day 1 morning | You will build the wrong thing beautifully. 2 days of planning saves 6 days of rework. |
| Train a custom deep learning model | You have 16 days and CPU-only free tiers. A well-explained XGBoost/linear model beats a poorly-understood neural net in judging, every time. |
| Use microservices | 4 people, 16 days. One FastAPI monolith. Anything else is résumé-driven development. |
| Build authentication before the score engine | Auth impresses zero judges. It is Priority 3, not Priority 1. |
| Build a mobile app | Web is enough. Responsive web ≠ React Native. |
| Scrape websites for data | Fragile, slow, breaks on demo day. Use the verified APIs above. |
| Add real-time WebSockets / IoT sensors | You have no sensors. Simulated "real-time" is a lie judges detect instantly. |
| Use paid services with trial credits | Card expiry / trial end mid-hackathon = catastrophic. Free tier only. |
| Let anyone work on `main` | See Phase 9. |
| Change scope after Day 8 | See Phase 12. |
| Build a "generic platform for any city" | Vague = weak demo. One city, deeply done, is stronger. |
| Redesign the UI in the last 3 days | Polish ≠ redesign. Freeze the design on Day 10. |

## 1.3 How to brainstorm — the structured method

Unstructured brainstorming produces the loudest person's idea. Use this instead:

1. **Silent generation (15 min).** Each member independently writes every feature they can imagine on separate sticky notes / a shared sheet. No discussion. This prevents anchoring.
2. **Cluster (10 min).** Group into the five S-50 pillars + "cross-cutting".
3. **Impact/Effort scoring (20 min).** Each member scores every feature 1–5 on *judge impact* and 1–5 on *build effort*, independently, then average. Independent scoring prevents groupthink.
4. **Plot the 2×2.** High-impact/low-effort → MVP. High-impact/high-effort → **exactly one** of these becomes your hero feature (the policy simulator). Low-impact → delete permanently, do not "keep for later".
5. **The Demo Test.** For each surviving feature ask: *"Will this appear on screen in the 5-minute demo?"* If no → it is not MVP. This is the sharpest filter you have. A feature nobody sees in the demo scores zero points.
6. **Write the demo script on Day 2** — before building. Then build only what the script needs. This inverts the normal (losing) order and is the single strongest anti-scope-creep mechanism in this document.

## 1.4 How to divide the project

Divide by **vertical capability**, not by horizontal layer. Do **not** assign "one person does all frontend, one does all backend" — that creates total blocking dependencies where the frontend dev idles for 4 days.

Correct split — each member owns a **slice that can be demoed independently**:

- Member 1 → Data + Scoring Engine (the brain)
- Member 2 → Backend API + Database + Auth + Deploy (the spine)
- Member 3 → Frontend Core: Dashboard, Map, Charts (the face)
- Member 4 → AI Features + Simulator + Reports + Pitch (the wow)

Each owns their slice end-to-end and can build against a contract (the API spec) rather than waiting for another person's code.

## 1.5 How to avoid wasting time — concrete rules

1. **The 45-Minute Rule.** Stuck for 45 minutes? Post in the team chat with what you tried. Non-negotiable. Silent struggling is the #1 hidden time sink in student teams.
2. **Timebox every task.** Every task in your tracker has an hour estimate. At 1.5× the estimate, escalate at standup. At 2×, cut the feature or find a workaround.
3. **Contract-first development.** Freeze the OpenAPI spec on Day 3. Frontend builds against mocked responses matching the contract; backend fills them in. Zero blocking.
4. **Seed data on Day 2.** A `seed.py` that populates 10 wards × 90 days of indicator data. Frontend never waits for real ingestion.
5. **Never debug alone past 30 minutes at night.** Fatigue debugging produces bugs. Sleep, pair in the morning.
6. **No premature optimisation.** 10 wards. Your query does not need an index at 500 rows. Ship it.
7. **Copy, don't invent, for boilerplate.** Auth, CORS, Docker, chart config — use documented patterns. Save creativity for the scoring engine.
8. **One person owns the demo laptop.** All final testing happens on that machine.

## 1.6 How to avoid scope creep — enforcement mechanism

Good intentions do not prevent scope creep. Mechanisms do.

- **The Locked Scope Document.** After Day 2, MVP scope is written in `docs/SCOPE.md` and committed. Changing it requires a PR that **all four** members approve. Friction is the point.
- **The Parking Lot.** Every new idea goes into `docs/PARKING_LOT.md`. It is not rejected — it is *deferred*. This preserves morale (nobody's idea is "killed") while protecting the timeline. Bonus: this file becomes your "Future Roadmap" slide.
- **Feature Freeze: end of Day 11.** After Day 11, no new features. Only bug fixes, polish, and rehearsal. Write this date on the wall.
- **Code Freeze: end of Day 14.** After Day 14, only demo-blocking bug fixes. Nothing else. `main` is release-locked.
- **The Two-Question Test** for any proposed addition:
  1. Does it appear in the 5-minute demo script?
  2. Does it make a judge's "how?" question easier to answer?
  If both are "no" → Parking Lot.

## 1.7 How to decide the MVP — the definition

**MVP = the smallest system that lets a judge see a sustainability score computed from real data, understand exactly why it has that value, and change a policy input to watch it move.**

That is the whole MVP. Note what it excludes: auth, admin panels, citizen portals, chatbots, notifications, exports.

**The MoSCoW breakdown:**

### MUST HAVE (MVP — Days 1–9, ship or lose)
| # | Feature | Judge-facing justification |
|---|---|---|
| M1 | Data ingestion from ≥2 real live sources (Open-Meteo + CPCB) | Proves it is not fake |
| M2 | PostgreSQL schema with 10 wards × 5 pillars × 90 days | Proves data engineering |
| M3 | **Composite Sustainability Score (0–100)** per ward, weighted, normalised | The literal core ask of S-50 |
| M4 | **Explainability breakdown** — per-indicator contribution, positive/negative | Answers "how did you get 72?" |
| M5 | Choropleth map of wards coloured by score | Instant visual comprehension |
| M6 | Dashboard: score cards, pillar radar, 90-day trend | The main screen |
| M7 | **Improvement Opportunities** — ranked, quantified recommendations | Second explicit S-50 verb |
| M8 | REST API, documented via auto-generated OpenAPI | Proves engineering rigour |
| M9 | Deployed on a public URL with HTTPS | Proves it is real |

### SHOULD HAVE (Days 10–11 — these win, not just qualify)
| # | Feature | Why |
|---|---|---|
| S1 | **Policy Simulator** — sliders → live score recompute | **Your WOW moment.** Third S-50 verb: strategic decision-making |
| S2 | 12-month forecast per pillar (time-series) | "Future-ready cities" is in the problem text |
| S3 | PDF report generation | Judges love a takeaway artifact |
| S4 | Anomaly detection flagging abnormal readings | Data-quality credibility |
| S5 | Ward comparison view (A vs B) | Enables the decision narrative |

### COULD HAVE (Day 12+ only if everything above is green)
Auth + roles · AI chat over the data (RAG) · Citizen issue reporting · Admin panel · Dark mode · Email alerts

### WON'T HAVE (explicitly out — say this to judges as a *strength*)
Mobile app · IoT hardware · Real-time streaming · Custom-trained deep nets · Multi-city onboarding · Payment · i18n

> Telling a judge *"we deliberately descoped X to do Y properly"* signals engineering maturity. Teams that apologise for missing features look junior; teams that explain trade-offs look like founders.

## 1.8 Which features must be completed first — the strict order

1. **The scoring formula on paper** (Day 2) — before any code. If the math is wrong, everything downstream is wrong.
2. **Database schema + seed data** (Day 3) — unblocks all four members simultaneously.
3. **Score computation service** (Day 4) — the heart. Nothing matters without it.
4. **`GET /api/v1/scores` endpoint** (Day 4) — unblocks the entire frontend.
5. **Dashboard + Map** (Days 5–6) — the visual proof.
6. **Explainability** (Day 7) — the differentiator.
7. **Recommendations** (Day 8) — the second mandated verb.
8. **Simulator** (Days 9–10) — the wow.

## 1.9 Which features should be postponed — and the reasoning

| Postpone | Until | Why |
|---|---|---|
| Authentication | Day 12 (or never) | Zero judge impact. A "Login as City Official (demo)" button achieves the same demo effect in 10 minutes. |
| Admin panel | Day 13+ | Judges never ask to see CRUD screens. |
| Citizen portal | Day 13+ | A second user persona doubles UI work for marginal narrative gain. |
| AI chat | Day 13+ | Impressive but replaceable; if the LLM API fails live, it is a demo catastrophe. Requires a hard-coded fallback. |
| Email/SMS alerts | Never | Cannot be shown convincingly in 5 minutes. |
| Real-time streaming | Never | You have no live sensor. Hourly refresh is honest and sufficient. |
| Multi-city support | Never (mention as roadmap) | Architect for it, don't build it. Say: "the schema is city-agnostic; onboarding a new city is a config row." |

---

# PHASE 2 — Team Planning (4 Members)

## 2.1 Role assignments

### Member 1 — Data & Intelligence Engineer ("The Brain")
**Owns:** data ingestion, normalisation, the scoring engine, ML models, recommendation logic.

**Responsibilities**
- Build ETL connectors for Open-Meteo, CPCB (data.gov.in), and Overpass
- Design and implement indicator normalisation (min-max, directionality handling)
- Implement the weighted composite scoring algorithm + explainability decomposition
- Build forecasting, anomaly detection, and the recommendation ranking engine
- Own `seed.py` — delivered by end of Day 3 (this is a hard team dependency)
- Write `docs/METHODOLOGY.md` — the document that wins the Q&A round

**Daily rhythm:** Morning — model/algorithm work (deep focus, no meetings). Afternoon — integrate with M2's API layer. Evening — validate outputs against sanity checks; document any formula change.

**Depends on:** M2 for DB schema (Day 3 only). **Blocks:** everyone, if seed data is late — hence seed data is the #1 Day-3 priority.

**Backup:** Member 4 (shares Python/ML skills).

---

### Member 2 — Backend & Platform Engineer ("The Spine")
**Owns:** FastAPI application, PostgreSQL, API contract, auth, Docker, deployment, CI.

**Responsibilities**
- Scaffold the FastAPI monolith with clean layering (routers → services → repositories)
- Design and migrate the PostgreSQL schema (Alembic)
- **Publish and freeze the OpenAPI contract by end of Day 3** — the most important team artifact
- Implement all REST endpoints, caching, and error handling
- Own deployment (Render/Railway backend + Neon/Supabase Postgres) and GitHub Actions CI
- Own the "it works on the deployed URL" guarantee — the last word before demo

**Daily rhythm:** Morning — endpoints for that day's frontend needs. Afternoon — integration + DB work. Evening — deploy to staging, verify green, post the URL in team chat.

**Depends on:** M1 for scoring function signatures. **Blocks:** M3 and M4 if the API contract slips — so the contract ships Day 3, mocked if needed.

**Backup:** Member 1.

---

### Member 3 — Frontend Lead ("The Face")
**Owns:** React application, design system, dashboard, map, charts, responsiveness.

**Responsibilities**
- Scaffold React + Vite + Tailwind + component library; establish the design tokens
- Build the app shell, routing, and shared state (TanStack Query)
- Build Dashboard, Map (Leaflet choropleth), and all Chart.js/Recharts visualisations
- Own visual quality — this is what makes it look like a startup, not a college project
- Build against mocked API responses from Day 3 so they never block on backend

**Daily rhythm:** Morning — build the day's screen. Afternoon — wire to the real API. Evening — cross-browser + responsive check; screenshot progress to team chat.

**Depends on:** M2's API contract (not the implementation). **Blocks:** M4's simulator UI shell.

**Backup:** Member 4.

---

### Member 4 — AI Features, Product & Presentation Lead ("The Wow")
**Owns:** policy simulator, explainability UI, PDF reports, AI chat (if reached), demo, pitch deck.

**Responsibilities**
- Build the policy simulator (frontend sliders + backend what-if endpoint) with M1's engine
- Build the explainability visualisation (waterfall / contribution bars)
- Build PDF report generation
- **Own the demo script, the pitch deck, the rehearsals, and the Q&A prep** — this is a real, full-time role, not an afterthought
- Maintain `docs/SCOPE.md` and `docs/PARKING_LOT.md`; act as Scrum Master
- Run the daily standup and keep the burndown honest

**Daily rhythm:** Morning — feature build. Afternoon — product/demo work. Evening — run standup, update the board, refine the pitch.

**Depends on:** M1 (simulator math), M3 (UI shell). **Backup:** Member 3.

> **Why M4's dual role matters:** in every hackathon, the deck gets built at 3 AM the night before by an exhausted developer. That is why great projects lose to mediocre ones with great pitches. Assigning presentation ownership from Day 1 is a deliberate competitive advantage.

## 2.2 Dependency map

```
        M1 Data/Scoring ──── seed data (D3) ────► EVERYONE
              │
              ├── scoring fn ──► M2 Backend
              │                     │
              │              API contract (D3)
              │                     │
              │              ┌──────┴──────┐
              ▼              ▼             ▼
        M4 Simulator ◄── M3 Frontend    M4 Reports
              │              │
              └──── UI shell ┘
```

**The two critical-path artifacts:** (1) seed data — end of Day 3; (2) frozen API contract — end of Day 3. Everything else can slip a day. These two cannot.

## 2.3 Communication plan

| Channel | Purpose | Rule |
|---|---|---|
| **WhatsApp/Discord — `#standup`** | Daily async written standup | Post by 09:15 daily, even if you post "blocked" |
| **`#blockers`** | Urgent help | Anyone stuck >45 min posts here. Others answer within 15 min. |
| **`#demos`** | Screenshots/screen recordings of progress | Post daily — this maintains morale and catches UI drift early |
| **GitHub Issues** | All work items | If it is not an Issue, it does not exist |
| **GitHub PR reviews** | Code discussion | All technical debate happens here, not in chat |
| **Video call 21:00 (30 min)** | Daily sync + integration | Camera on. Hard 30-minute cap. |

**Async-first principle:** written standups > meetings. You have 16 days; every hour in a meeting is an hour not building. Two touchpoints per day (async morning, live evening) is correct.

**Escalation ladder:** stuck 45 min → `#blockers` → 2 hours → pair-program → 4 hours → cut the feature or find a workaround at evening sync. Never let a blocker cross into a second day silently.

## 2.4 Daily meeting structure

**Morning async standup (written, by 09:15) — 3 lines each:**
1. Done yesterday
2. Doing today (with hour estimates)
3. Blocked by

**Evening sync (21:00, 30 min, timeboxed):**
- 0–5 min: `git pull main`, everyone confirms the deployed URL is green
- 5–15 min: each member demos what they built **on the deployed staging URL** — not localhost. This forces continuous integration and catches "works on my machine" every single day
- 15–25 min: blockers + tomorrow's plan
- 25–30 min: **Demo Readiness Check** — "if the hackathon ended tomorrow, what would we show?" Answering this daily prevents the Day-15 panic

**Weekly (Day 8 + Day 12), 60 min:** scope review against the burndown; cut features if behind. Cutting on Day 8 is strategy; cutting on Day 15 is failure.

## 2.5 How to work in parallel

- **Contract-first.** Frozen OpenAPI spec on Day 3 → M3/M4 build against MSW (Mock Service Worker) mocks; M2 fills in real implementations. Nobody waits.
- **Feature-flag incomplete work.** Merge behind a flag rather than sitting on a 5-day branch. Long-lived branches are the #1 cause of merge hell.
- **Vertical slices.** Each member's daily task should be shippable independently.
- **Own your files.** The folder structure (Phase 5) is designed so members rarely touch the same file. Ownership boundaries are the real merge-conflict prevention.
- **Shared files need a lock.** `types.ts`, `schema.sql`, `package.json`, `requirements.txt` — announce in chat before editing.

## 2.6 How to avoid merge conflicts

1. **Small PRs.** < 400 lines changed. Merge daily. A 2,000-line PR after 5 days is unreviewable and unmergeable.
2. **`git pull --rebase origin main` every single morning.** Non-negotiable, first command of the day.
3. **Never commit generated files.** `.gitignore` must include `node_modules/`, `__pycache__/`, `.env`, `dist/`, `*.pyc`, `.venv/`, `venv/`, `*.db`, `.DS_Store`.
4. **One person owns `package.json` and `requirements.txt`** (M2). Others request additions in chat.
5. **Migrations are append-only.** Never edit an existing Alembic migration; always add a new one.
6. **Prettier + ESLint + Black + Ruff, enforced by CI.** Formatting wars produce phantom conflicts. Auto-format on save; configure it Day 1.
7. **If a conflict is complex, do not resolve it alone at midnight.** Pair on it. A botched merge that silently deletes someone's work has ended hackathon runs.

## 2.7 GitHub branch organisation

```
main                    ← protected. Always deployable. Demo runs from here.
└── develop             ← integration branch. All features merge here first.
    ├── feat/m1-data-ingestion
    ├── feat/m1-scoring-engine
    ├── feat/m2-api-scores
    ├── feat/m3-dashboard
    ├── feat/m4-simulator
    ├── fix/map-tooltip-overflow
    └── docs/methodology
```

**Naming:** `<type>/<member>-<short-desc>` where type ∈ `feat | fix | docs | chore | refactor`.

**Protection rules on `main` (set these on Day 1, in GitHub Settings → Branches):**
- No direct pushes
- Require 1 approving review
- Require CI to pass
- Require branch to be up to date before merge

**Tagging:** tag `v0.1-mvp` when Phase 1 MVP is green (Day 9), `v1.0-demo` at code freeze (Day 14). If anything breaks after, you can `git checkout v1.0-demo` and demo a known-good build. **This is your insurance policy.**

---

# PHASE 3 — Project Breakdown (Modules)

Priority: **P0** = MVP, demo dies without it · **P1** = wins the hackathon · **P2** = bonus
Difficulty: ⭐ trivial → ⭐⭐⭐⭐⭐ hard

### Module 1 — Data Ingestion Layer
| | |
|---|---|
| **Purpose** | Pull raw indicator data from Open-Meteo, CPCB/data.gov.in, and Overpass into a normalised staging table; run on a schedule and on demand |
| **Priority** | P0 |
| **Difficulty** | ⭐⭐⭐ |
| **Owner** | Member 1 |
| **Dependencies** | DB schema (M2, Day 3); API keys registered (Day 1) |
| **Est. Time** | 10 hours (Days 3–4) |
| **Deliverables** | `app/ingestion/` with one connector per source, a unified `RawReading` writer, retry + caching, `python -m app.ingestion.run --source all` CLI |
| **Testing** | Unit-test each parser against a saved JSON fixture (never hit live APIs in tests). Integration test: run ingestion → assert row count > 0 and no NULLs in required columns. Manual: verify a known station's PM2.5 matches the CPCB portal. |

### Module 2 — Indicator Normalisation Engine
| | |
|---|---|
| **Purpose** | Convert heterogeneous raw values (μg/m³, %, count/km², ₹) onto a common 0–100 scale with correct directionality (lower PM2.5 = better; more green cover = better) |
| **Priority** | P0 |
| **Difficulty** | ⭐⭐⭐ |
| **Owner** | Member 1 |
| **Dependencies** | Module 1 |
| **Est. Time** | 6 hours (Day 4) |
| **Deliverables** | `app/scoring/normalise.py`; a config-driven `indicators.yaml` holding min/max/target/direction per indicator, benchmarked against WHO/SDG-11 thresholds |
| **Testing** | Property tests: output always ∈ [0,100]; monotonic in the correct direction; boundary values (min→0, max→100) exact. Golden-file test on a fixed input set. |

### Module 3 — Composite Sustainability Score Engine ★ CORE
| | |
|---|---|
| **Purpose** | Compute the weighted 0–100 sustainability score per ward across the five S-50 pillars, with full per-indicator contribution decomposition |
| **Priority** | **P0 — the single most important module in the project** |
| **Difficulty** | ⭐⭐⭐⭐ |
| **Owner** | Member 1 |
| **Dependencies** | Module 2 |
| **Est. Time** | 10 hours (Days 4–5) |
| **Deliverables** | `app/scoring/engine.py` exposing `compute_score(ward_id, date, weights) -> ScoreResult` where `ScoreResult` includes `total`, `pillar_scores`, `indicator_contributions[]`, `weights_used`, `data_completeness`; plus `docs/METHODOLOGY.md` |
| **Testing** | Hand-calculate 3 wards in a spreadsheet and assert the code matches to 2 decimals — **do this, it catches real bugs**. Test: all-perfect inputs → 100; all-worst → 0. Test weight sensitivity: sum of contributions == total. Test missing-data handling. |

### Module 4 — Database & Persistence
| | |
|---|---|
| **Purpose** | PostgreSQL schema, migrations, repositories, seed data |
| **Priority** | P0 |
| **Difficulty** | ⭐⭐ |
| **Owner** | Member 2 |
| **Dependencies** | None — start Day 2 |
| **Est. Time** | 8 hours (Days 2–3) |
| **Deliverables** | Alembic migrations, SQLAlchemy models, `seed.py` producing 10 wards × 90 days × ~20 indicators |
| **Testing** | Migration up/down runs cleanly on a fresh DB. FK constraints verified. Seed produces the expected row counts. Query performance sane (<200 ms). |

### Module 5 — REST API Layer
| | |
|---|---|
| **Purpose** | Expose scores, wards, indicators, recommendations, simulation, and reports over documented HTTP |
| **Priority** | P0 |
| **Difficulty** | ⭐⭐⭐ |
| **Owner** | Member 2 |
| **Dependencies** | Modules 3, 4 |
| **Est. Time** | 12 hours (Days 4–7) |
| **Deliverables** | FastAPI routers, Pydantic schemas, auto-generated OpenAPI at `/docs`, consistent error envelope, CORS, response caching |
| **Testing** | `pytest` + `httpx` for every endpoint: 200 happy path, 404 unknown ward, 422 bad params. Contract test: response validates against the frozen OpenAPI schema. |

### Module 6 — Geospatial Map Module
| | |
|---|---|
| **Purpose** | Interactive choropleth of wards coloured by sustainability score, with hover tooltips and click-to-drill |
| **Priority** | P0 |
| **Difficulty** | ⭐⭐⭐ |
| **Owner** | Member 3 |
| **Dependencies** | Module 5; ward GeoJSON |
| **Est. Time** | 10 hours (Days 5–6) |
| **Deliverables** | `MapView.tsx` using React-Leaflet + OSM tiles, GeoJSON layer with score-driven fill, legend, layer toggle per pillar |
| **Testing** | Manual: all 10 wards render, colours match scores, tooltip data correct, no console errors. Verify at 1366×768 (typical projector resolution). Test with a ward that has NULL data. |

### Module 7 — Dashboard & Visualisation
| | |
|---|---|
| **Purpose** | Main screen: city score, pillar radar, trend lines, ward league table |
| **Priority** | P0 |
| **Difficulty** | ⭐⭐⭐ |
| **Owner** | Member 3 |
| **Dependencies** | Module 5 |
| **Est. Time** | 12 hours (Days 5–7) |
| **Deliverables** | `Dashboard.tsx`, `ScoreCard`, `PillarRadar`, `TrendChart`, `WardTable` components; loading skeletons; empty states |
| **Testing** | Manual against known seed values. Test loading, error, and empty states explicitly. Lighthouse performance > 80. |

### Module 8 — Explainability (XAI) Module ★ DIFFERENTIATOR
| | |
|---|---|
| **Purpose** | Show *why* a ward scored what it did — ranked positive/negative indicator contributions with plain-English narration |
| **Priority** | **P0 — this is what separates you from every other team** |
| **Difficulty** | ⭐⭐⭐ |
| **Owner** | Member 1 (logic) + Member 4 (UI) |
| **Dependencies** | Module 3 |
| **Est. Time** | 8 hours (Day 7) |
| **Deliverables** | `GET /api/v1/scores/{ward_id}/explain`; waterfall/contribution-bar UI; templated natural-language summary |
| **Testing** | Assert contributions sum to the total score (±0.01). Assert ranking order is correct. Verify the narrative text is grammatical across 10 wards. |

### Module 9 — Recommendation Engine
| | |
|---|---|
| **Purpose** | Rank concrete interventions by score-improvement-per-unit-effort; answer "what should the city do first?" |
| **Priority** | P0 (explicitly required by S-50: *"identify improvement opportunities"*) |
| **Difficulty** | ⭐⭐⭐⭐ |
| **Owner** | Member 1 |
| **Dependencies** | Modules 3, 8 |
| **Est. Time** | 8 hours (Day 8) |
| **Deliverables** | `app/scoring/recommend.py` + intervention catalogue (`interventions.yaml`: cost band, expected indicator delta, time-to-effect); `GET /api/v1/recommendations/{ward_id}` |
| **Testing** | Assert recommendations target the lowest-contributing indicators. Assert projected uplift is arithmetically consistent with the scoring engine. Sanity-check that suggestions are contextually sensible for each ward. |

### Module 10 — Policy Simulator ★ WOW MOMENT
| | |
|---|---|
| **Purpose** | Let a decision-maker adjust interventions via sliders and see the score, map, and forecast recompute live |
| **Priority** | **P1 — highest judge impact of any single feature** |
| **Difficulty** | ⭐⭐⭐⭐ |
| **Owner** | Member 4 (+ Member 1 for math) |
| **Dependencies** | Modules 3, 9 |
| **Est. Time** | 12 hours (Days 9–10) |
| **Deliverables** | `POST /api/v1/simulate` (stateless what-if); `Simulator.tsx` with sliders, before/after delta cards, animated score transition, "reset" and "save scenario" |
| **Testing** | Assert zero-change simulation returns the exact baseline score (critical regression test). Assert monotonicity. Assert the response is < 500 ms — laggy sliders destroy the wow. |

### Module 11 — Forecasting Module
| | |
|---|---|
| **Purpose** | Project each pillar 12 months forward with confidence bands |
| **Priority** | P1 |
| **Difficulty** | ⭐⭐⭐ |
| **Owner** | Member 1 |
| **Dependencies** | Modules 3, 4 |
| **Est. Time** | 8 hours (Day 10) |
| **Deliverables** | `app/ml/forecast.py`; `GET /api/v1/forecast/{ward_id}`; chart with prediction interval |
| **Testing** | Backtest on the last 30 days of history; report MAE/MAPE in `METHODOLOGY.md` — **having a stated accuracy number is a major Q&A advantage.** Assert forecasts stay within physically plausible bounds. |

### Module 12 — Anomaly Detection
| | |
|---|---|
| **Purpose** | Flag abnormal readings (sensor faults, pollution spikes) so scores aren't silently corrupted |
| **Priority** | P1 |
| **Difficulty** | ⭐⭐ |
| **Owner** | Member 1 |
| **Dependencies** | Module 1 |
| **Est. Time** | 5 hours (Day 10) |
| **Deliverables** | Z-score / IQR + IsolationForest detector; `is_anomaly` flag on readings; UI warning badges |
| **Testing** | Inject synthetic outliers → assert detection. Assert a low false-positive rate on clean seed data. |

### Module 13 — Report Generation
| | |
|---|---|
| **Purpose** | One-click branded PDF sustainability report per ward/city |
| **Priority** | P1 |
| **Difficulty** | ⭐⭐ |
| **Owner** | Member 4 |
| **Dependencies** | Modules 3, 8, 9 |
| **Est. Time** | 6 hours (Day 11) |
| **Deliverables** | `GET /api/v1/reports/{ward_id}.pdf` via WeasyPrint/ReportLab; cover page, score summary, charts, recommendations |
| **Testing** | Generate for all 10 wards; verify no layout overflow, no missing charts, correct numbers. Test a ward with sparse data. |

### Module 14 — Authentication & Roles
| | |
|---|---|
| **Purpose** | JWT auth with `admin` / `planner` / `citizen` roles |
| **Priority** | P2 |
| **Difficulty** | ⭐⭐ |
| **Owner** | Member 2 |
| **Dependencies** | Module 5 |
| **Est. Time** | 6 hours (Day 12, only if ahead) |
| **Deliverables** | `/auth/login`, `/auth/me`, JWT middleware, role guards, seeded demo accounts |
| **Testing** | Assert protected routes 401 without a token, 403 with the wrong role. Assert token expiry. |

### Module 15 — AI Assistant (Chat)
| | |
|---|---|
| **Purpose** | Natural-language Q&A over the city's sustainability data |
| **Priority** | P2 |
| **Difficulty** | ⭐⭐⭐⭐ |
| **Owner** | Member 4 |
| **Dependencies** | Modules 5, 8 |
| **Est. Time** | 8 hours (Day 13, only if everything else is green) |
| **Deliverables** | Chat panel; backend builds a structured context from real score data and calls a free-tier LLM API; **hard-coded fallback answers for the 5 demo questions** |
| **Testing** | Test with the API key removed → must degrade gracefully, never crash. Test the 5 scripted demo questions 10× each for consistency. |

### Module 16 — Deployment & CI/CD
| | |
|---|---|
| **Purpose** | Automated test + deploy to public HTTPS URLs |
| **Priority** | P0 |
| **Difficulty** | ⭐⭐ |
| **Owner** | Member 2 |
| **Dependencies** | None — **start Day 1** |
| **Est. Time** | 6 hours (Day 1 setup + ongoing) |
| **Deliverables** | Dockerfile, `docker-compose.yml`, GitHub Actions (lint → test → deploy), Render/Railway + Vercel + Neon setup, environment variables configured |
| **Testing** | Every push to `develop` auto-deploys to staging and stays green. Deliberately break a test once to verify CI actually blocks the merge. |

### Module priority summary

| Module | P | Diff | Owner | Days | Blocks |
|---|---|---|---|---|---|
| 4 Database | P0 | ⭐⭐ | M2 | 2–3 | Everything |
| 16 Deploy/CI | P0 | ⭐⭐ | M2 | 1 | — |
| 1 Ingestion | P0 | ⭐⭐⭐ | M1 | 3–4 | 2,3 |
| 2 Normalisation | P0 | ⭐⭐⭐ | M1 | 4 | 3 |
| 3 **Score Engine** | **P0** | ⭐⭐⭐⭐ | M1 | 4–5 | 5,8,9,10,11 |
| 5 REST API | P0 | ⭐⭐⭐ | M2 | 4–7 | 6,7,8,10 |
| 6 Map | P0 | ⭐⭐⭐ | M3 | 5–6 | — |
| 7 Dashboard | P0 | ⭐⭐⭐ | M3 | 5–7 | — |
| 8 **Explainability** | **P0** | ⭐⭐⭐ | M1+M4 | 7 | 9 |
| 9 Recommendations | P0 | ⭐⭐⭐⭐ | M1 | 8 | 10 |
| 10 **Simulator** | **P1** | ⭐⭐⭐⭐ | M4 | 9–10 | — |
| 11 Forecasting | P1 | ⭐⭐⭐ | M1 | 10 | — |
| 12 Anomaly | P1 | ⭐⭐ | M1 | 10 | — |
| 13 Reports | P1 | ⭐⭐ | M4 | 11 | — |
| 14 Auth | P2 | ⭐⭐ | M2 | 12 | — |
| 15 AI Chat | P2 | ⭐⭐⭐⭐ | M4 | 13 | — |

---

# PHASE 4 — 16-Day Development Roadmap

**Sprint structure:** Sprint 1 (D1–2 Foundation) · Sprint 2 (D3–9 MVP Build) · Sprint 3 (D10–11 Differentiators) · Sprint 4 (D12–16 Harden, Rehearse, Win)

**Assumed daily capacity:** ~8 focused hours per member (Morning ≈ 4h, Afternoon ≈ 3h, Evening ≈ 1h review). Adjust to your class schedule but keep the *sequence* intact.

---

## DAY 1 — Foundation & Kill the Unknowns

**Morning**
- All: re-read S-50 aloud; extract the five mandated pillars into `docs/SCOPE.md`
- All: write the "15 hardest judge questions" list
- M1: register for `data.gov.in` API key + WAQI token **(do this first — approval can take hours)**; smoke-test Open-Meteo and CPCB endpoints with `curl`
- M2: create GitHub org/repo, `main` + `develop`, branch protection, `.gitignore`, `README`

**Afternoon**
- All: whiteboard the architecture; photograph and commit to `docs/`
- All: decide the target city + 10 wards. **Write it down. Never revisit.**
- M2: scaffold FastAPI + React repos, Dockerfile, GitHub Actions skeleton
- M3: set up Vite + React + Tailwind; pick the colour palette and typography (design tokens)
- M4: create the GitHub Project board; convert all Phase 3 modules into Issues with owners and estimates

**Evening Review**
- Deploy "Hello World" backend to Render/Railway and frontend to Vercel. **Both must be live on public HTTPS today.**
- Confirm every member can clone, install, run, and push

**Expected Deliverables**
✅ Repo with protected branches · ✅ Both apps deployed and reachable · ✅ All API keys obtained · ✅ `docs/SCOPE.md` committed · ✅ Project board with ~40 issues · ✅ City + wards locked

**Common Mistakes**
- Starting to code features today (you will build the wrong thing)
- Deferring API-key registration ("we'll do it later" → Day 9 crisis)
- Endless stack debates — the stack is decided in Phase 5, adopt it
- Skipping deployment to "focus on building"

**Definition of Done**
> A teammate on a fresh laptop can clone the repo, run both apps locally in under 10 minutes, and open the deployed staging URL in a browser.

---

## DAY 2 — Design the Brain (Still No Feature Code)

**Morning**
- All: structured brainstorm (Phase 1.3) → impact/effort 2×2 → MVP list finalised in `docs/SCOPE.md`
- **All: write the 5-minute demo script now** (Phase 11 draft). This defines everything you build.
- M1: design the scoring formula on paper — pillars, indicators, weights, normalisation ranges

**Afternoon**
- M1: draft `indicators.yaml` — for each indicator: name, unit, source, direction, min, max, WHO/SDG benchmark, pillar, weight
- M2: design the PostgreSQL schema; write Alembic migration #1
- M3: build low-fidelity wireframes for Dashboard, Map, Simulator (Figma or paper)
- M4: draft the pitch deck skeleton (10 slides, titles only); write `docs/PARKING_LOT.md`

**Evening Review**
- Team walkthrough of the scoring formula. **Every member must be able to explain it.** If M3 cannot explain the score, the design is too complex — simplify it now.
- Approve `docs/SCOPE.md` by unanimous consent, then commit and lock it

**Expected Deliverables**
✅ Scoring formula documented with worked example · ✅ `indicators.yaml` v1 · ✅ DB schema designed · ✅ Wireframes · ✅ Demo script v1 · ✅ Scope locked

**Common Mistakes**
- Designing 40 indicators. **Use 15–20 max.** More indicators ≠ better score; they dilute your explanation and multiply data-sourcing work.
- Choosing weights arbitrarily. Justify them (equal weight, or cite an established framework). "Why these weights?" is a guaranteed judge question.
- Skipping the demo script "because it's too early" — it is exactly the right time

**Definition of Done**
> M1 can hand-calculate one ward's sustainability score on a whiteboard in under 3 minutes, and all four members agree the number is defensible.

---

## DAY 3 — Data Foundation (Critical Path Day)

**Morning**
- M2: run migrations against Neon/Supabase Postgres; SQLAlchemy models; repository layer
- M1: build the Open-Meteo connector (no auth — fastest win) and confirm rows land in the DB
- M3: build the app shell — layout, nav, routing, theme, reusable `Card`/`Button`/`Skeleton`
- M4: set up MSW mocks matching the (draft) API contract

**Afternoon**
- **M2: publish and FREEZE the OpenAPI contract.** Commit `docs/api-contract.yaml`. Announce in chat. This is today's #1 team deliverable.
- **M1: ship `seed.py`** — 10 wards × 90 days × ~20 indicators. Today's #2 deliverable.
- M1: build the CPCB (data.gov.in) connector
- M3: consume mocked endpoints; render a static dashboard skeleton

**Evening Review**
- Verify seed data is in the deployed staging DB, not just localhost
- Everyone confirms they are unblocked for Days 4–7

**Expected Deliverables**
✅ **Frozen API contract** · ✅ **Seed data in staging DB** · ✅ 2 live data connectors working · ✅ App shell deployed

**Common Mistakes**
- Slipping the contract or the seed data to Day 4 — **this single slip cascades into a 2-day project-wide delay.** Protect these two deliverables above all else today.
- Building a "perfect" ingestion pipeline. Get data in; refine later.
- Frontend waiting for real endpoints instead of using mocks

**Definition of Done**
> `SELECT COUNT(*) FROM indicator_readings;` on the **staging** database returns > 15,000 rows, and `docs/api-contract.yaml` is committed and unchangeable without team approval.

---

## DAY 4 — The Scoring Engine

**Morning**
- M1: implement `normalise.py` with directionality + property tests
- M2: implement `GET /api/v1/wards` and `GET /api/v1/indicators`
- M3: build `ScoreCard` and `WardTable` components against mocks
- M4: build the explainability UI shell (waterfall chart with mock data)

**Afternoon**
- **M1: implement `compute_score()` — the core of the entire project**
- M1: validate against a hand-built spreadsheet for 3 wards
- M2: implement `GET /api/v1/scores` and `GET /api/v1/scores/{ward_id}`
- M3: wire `ScoreCard` to the real endpoint the moment it lands

**Evening Review**
- **Demo the first real score end-to-end: DB → engine → API → browser.** This is your first true milestone.
- Compare engine output against the spreadsheet; investigate any mismatch immediately

**Expected Deliverables**
✅ Working score engine · ✅ Scores visible in the browser from real data · ✅ Score endpoints live

**Common Mistakes**
- Not hand-validating the math. A subtly wrong formula discovered on Day 13 is unrecoverable — the entire demo narrative rests on this number.
- Hard-coding weights inside functions instead of reading `indicators.yaml` (blocks the simulator later)
- Forgetting NULL/missing-data handling — real APIs return `"NA"` (the CPCB feed literally does)

**Definition of Done**
> Open the deployed staging frontend and see a real sustainability score for a real ward, computed from real ingested data — and M1 can prove the number is correct on a spreadsheet.

---

## DAY 5 — Map & Dashboard Take Shape

**Morning**
- M3: integrate React-Leaflet; load ward GeoJSON; render base map
- M1: pillar-level scoring + `pillar_scores` in the score response
- M2: `GET /api/v1/scores/history` for trend charts; add response caching
- M4: build the simulator UI shell (sliders, no logic yet)

**Afternoon**
- M3: choropleth colouring by score + legend + hover tooltip
- M3: `PillarRadar` chart wired to real data
- M1: begin the contribution-decomposition logic
- M2: error envelope, CORS, request logging

**Evening Review**
- Map demo on the deployed URL, on the actual demo laptop
- Check map rendering at 1366×768 (projector resolution) — do this now, not on Day 15

**Expected Deliverables**
✅ Interactive choropleth with real scores · ✅ Pillar radar · ✅ History endpoint

**Common Mistakes**
- Ward GeoJSON not found → **fallback: draw approximate polygons yourself in geojson.io.** Do not lose a day hunting official boundaries; approximate is fine for a demo, just say so.
- Using a paid map provider (Mapbox trial). Use free OSM tiles via Leaflet.
- Map rendering huge/blank due to missing CSS height on the container (classic Leaflet trap)

**Definition of Done**
> A judge could look at the map and immediately identify the best and worst ward without any explanation from you.

---

## DAY 6 — Dashboard Complete

**Morning**
- M3: `TrendChart` (90-day history), `WardTable` with sort/filter
- M1: complete `indicator_contributions[]` in the score response
- M2: `GET /api/v1/scores/{ward}/explain`
- M4: wire the explainability waterfall to the real endpoint

**Afternoon**
- M3: loading skeletons, error states, empty states for every component
- M3: responsive layout — must work at 1366×768 and 1920×1080
- M1: refine weights; document every decision in `METHODOLOGY.md`
- M2: performance pass — all endpoints < 500 ms

**Evening Review**
- Full dashboard walkthrough as if presenting to a judge
- **First timed run of the demo script** (expect to badly overrun — that is the point of practising this early)

**Expected Deliverables**
✅ Complete dashboard · ✅ Explainability endpoint + UI · ✅ All loading/error states handled

**Common Mistakes**
- Ignoring loading states → the demo shows a flash of blank white screens and looks broken
- Charts with no axis labels or units. Every chart must be self-explanatory.
- Leaving `console.log` everywhere — judges do open DevTools

**Definition of Done**
> Every screen has a defined appearance in loading, error, empty, and populated states. No blank flashes anywhere.

---

## DAY 7 — Explainability Polish (Your Differentiator)

**Morning**
- M1 + M4: natural-language summary generator ("Ward 7 scores 62. The largest drag is PM2.5 at −8.4 points; the strongest contributor is green cover at +6.1 points.")
- M3: ward detail page — click a ward on the map → drill-down view
- M2: pagination, filtering, sorting on list endpoints

**Afternoon**
- M4: polish the waterfall visualisation — colour-code positive/negative contributions
- M1: **assert contributions sum exactly to the total** (test this rigorously — a judge may add them up)
- M3: cross-linking between map, table, and detail view
- M2: write API tests for all endpoints built so far

**Evening Review**
- Practise answering "How did you calculate this score?" using **only the UI**, no verbal hand-waving
- If you cannot answer it purely by clicking, the explainability UI is not finished

**Expected Deliverables**
✅ Full XAI experience · ✅ Ward detail page · ✅ Natural-language summaries · ✅ API test suite

**Common Mistakes**
- Explainability that shows numbers but not *meaning*. "PM2.5: 0.34" is useless; "Air quality is costing this ward 8.4 points" is powerful.
- Contributions that do not sum to the total (rounding/normalisation bug) — this is a credibility killer if a judge notices

**Definition of Done**
> Hand your laptop to someone who has never seen the project. They can determine why a ward scored poorly in under 60 seconds, unassisted.

---

## DAY 8 — Recommendations + MID-PROJECT SCOPE REVIEW

**Morning**
- M1: build `interventions.yaml` — for each intervention: name, target indicator, expected delta, cost band, months-to-effect
- M1: recommendation ranking (improvement-per-cost, i.e. "biggest bang per rupee")
- M3: `RecommendationCard` component with impact/cost/time badges

**Afternoon**
- M2: `GET /api/v1/recommendations/{ward_id}`
- M3: recommendations panel integrated into the ward detail page
- M4: pitch deck v1 — actual slides with real screenshots

**Evening Review — MANDATORY 60-MINUTE SCOPE REVIEW**
- Burndown check: are all P0 modules on track to finish by Day 9?
- **If behind: cut P1 features NOW.** Cutting on Day 8 is strategy; cutting on Day 15 is disaster.
- Decide explicitly: are you doing Auth (M14) and AI Chat (M15)? Default answer is **no** unless every P0 is already green.

**Expected Deliverables**
✅ Recommendation engine + UI · ✅ Pitch deck v1 · ✅ Written scope decision for the second half

**Common Mistakes**
- Vague recommendations ("improve air quality"). Be specific and quantified: *"Add 2 km of tree cover along Arterial Rd → projected +3.2 points in 18 months, ₹ low-cost band."*
- Skipping the scope review because "we're nearly there" — teams are systematically overconfident at the midpoint
- Recommendations that aren't derived from the actual score gaps (judges will test this by picking your worst ward)

**Definition of Done**
> For every ward, the system produces at least 3 specific, quantified, ranked interventions traceable to that ward's actual weakest indicators.

---

## DAY 9 — MVP COMPLETE + Buffer Day

**Morning**
- All: **MVP freeze.** Complete any unfinished P0 work. This is the deadline.
- M2: full deployment verification — fresh browser, incognito, phone, different network

**Afternoon**
- All: bug bash — every member tries to break another member's feature for 90 minutes
- Log every bug as a GitHub Issue with severity (blocker / major / minor)
- Fix all blockers today

**Evening Review**
- **Tag `v0.1-mvp` in git.** You now have a demoable product with 7 days remaining. This is a strong position.
- Full demo run-through, timed
- Celebrate — genuinely. Morale on Day 9 predicts output on Day 15.

**Expected Deliverables**
✅ **All P0 modules complete and deployed** · ✅ `v0.1-mvp` tagged · ✅ Bug list triaged · ✅ Zero blocker bugs

**Common Mistakes**
- Starting the simulator before the MVP is airtight. **A polished MVP beats a broken advanced feature.** If you are behind, spend Day 9 finishing, not starting.
- Not tagging the release — you lose your rollback point

**Definition of Done**
> If the hackathon ended tomorrow morning, you could deliver a confident, complete 5-minute demo of a working product using only what exists right now.

---

## DAY 10 — The WOW Feature: Policy Simulator

**Morning**
- M4 + M1: `POST /api/v1/simulate` — accepts intervention deltas, returns the recomputed score with a full breakdown
- **Critical test: zero-change simulation must return the exact baseline score.** Write this test first.
- M3: simulator sliders wired to the endpoint

**Afternoon**
- M4: before/after comparison cards with animated number transitions
- M4: map recolours live as the simulation changes
- M1: forecasting module — 12-month projection with confidence bands
- M2: ensure simulation responses stay under 500 ms (add caching if needed)

**Evening Review**
- **Demo the simulator to someone outside the team.** Watch their reaction — if they do not visibly react, the wow moment is not landing and needs stronger visual feedback (bigger delta animation, colour shift, sound-free but obvious).

**Expected Deliverables**
✅ Working policy simulator · ✅ Forecast module · ✅ Live map recolouring on simulation

**Common Mistakes**
- Slow simulation (>1 s) makes sliders feel broken — cache aggressively, compute in-memory, avoid a DB round-trip per slider tick
- Simulation that doesn't visibly change anything on screen — the *visual* delta is the entire point
- Debouncing sliders too aggressively (feels laggy) or not at all (hammers the API). ~150 ms debounce is the sweet spot.

**Definition of Done**
> A judge moves a slider and, within half a second, sees the score number change, the delta card update, and the map recolour — with no page reload.

---

## DAY 11 — FEATURE FREEZE DAY

**Morning**
- M1: anomaly detection + UI warning badges
- M4: PDF report generation
- M3: final UI polish — spacing, typography, transitions, empty states
- M2: security pass (rate limiting, input validation, no secrets in the repo)

**Afternoon**
- **🔒 FEATURE FREEZE AT 18:00. No new features after this moment for the rest of the hackathon.**
- All: move every unfinished feature to `docs/PARKING_LOT.md` (it becomes your Roadmap slide)
- All: full regression test of everything

**Evening Review**
- Announce the freeze formally in the team chat. Everyone acknowledges in writing.
- Re-plan Days 12–16 as: harden, document, rehearse

**Expected Deliverables**
✅ Anomaly detection · ✅ PDF reports · ✅ UI polished · ✅ **Feature freeze declared** · ✅ Roadmap slide content

**Common Mistakes**
- "Just one more small feature" — this is how teams break working demos 48 hours before judging. The freeze is absolute.
- Not writing down the freeze decision — verbal agreements erode under pressure

**Definition of Done**
> The feature set is final and documented. From here, every commit either fixes a bug or improves polish. Nothing else.

---

## DAY 12 — Testing & Hardening

**Morning**
- M2: backend test coverage push — all critical paths covered
- M1: validate the scoring engine against edge cases (all-zero ward, missing data, single indicator)
- M3: cross-browser testing — Chrome, Firefox, Edge, Safari if available
- M4: accessibility pass (keyboard navigation, contrast, alt text)

**Afternoon**
- All: **structured bug bash round 2** — 2 hours, each member attacks a different member's area
- Triage: blocker → fix today · major → fix Day 13 · minor → Parking Lot
- M2: load test — 50 concurrent requests; confirm no crash

**Evening Review**
- Zero blocker bugs must remain
- Review the full bug list; decide explicitly which minor bugs you will **ship with** (this is normal and healthy)

**Expected Deliverables**
✅ Test suite green · ✅ Zero blockers · ✅ Cross-browser verified · ✅ Known-issues list documented

**Common Mistakes**
- Testing only the happy path. Judges click unexpected things — test the weird paths.
- Not testing on the actual demo laptop and the actual venue-like network
- Fixing minor cosmetic bugs while a blocker sits open

**Definition of Done**
> A stranger can use the deployed app for 10 minutes without hitting a crash, a blank screen, or an unhandled error.

---

## DAY 13 — Documentation, Story & Optional Extras

**Morning**
- M1: finalise `docs/METHODOLOGY.md` — the formula, the weight justifications, the forecast accuracy (MAE/MAPE), the limitations
- M2: `README.md` with architecture diagram, setup instructions, live URLs, tech stack
- M3: capture high-quality screenshots and a screen recording of every key flow
- M4: pitch deck v2 with real screenshots and the final narrative

**Afternoon**
- **Only if every P0/P1 is green:** M4 builds the AI chat (Module 15) with hard-coded fallbacks for the 5 demo questions
- **Only if ahead:** M2 adds simple auth with a "Login as City Official (demo)" one-click button
- Otherwise: more polish and rehearsal. **Polish beats features at this stage.**

**Evening Review**
- Full timed demo rehearsal #1, all four members speaking
- Record it on video. Watch it back together. It will be uncomfortable and extremely useful.

**Expected Deliverables**
✅ Complete documentation · ✅ Pitch deck v2 · ✅ Screenshots + backup video · ✅ Rehearsal #1 recorded

**Common Mistakes**
- Weak README. Judges often check the repo — a professional README materially changes their perception of the team.
- Adding the AI chat when the core is shaky. Chat is the highest-risk live feature (network + API + latency). If in doubt, skip it.
- Not recording a backup demo video. **Record it today.** (See Phase 12.)

**Definition of Done**
> The repo looks like a funded startup's, and you have a recorded backup video that could substitute for a live demo if the venue Wi-Fi dies.

---

## DAY 14 — CODE FREEZE + Rehearsal

**Morning**
- All: fix only the bugs identified in rehearsal #1
- M2: final deployment; verify every environment variable in production
- M3: final visual QA on the demo laptop at projector resolution

**Afternoon**
- **🔒 CODE FREEZE AT 18:00. Tag `v1.0-demo`.** After this, only demo-blocking fixes, each requiring two-member approval.
- Prepare the demo environment: browser bookmarks, tabs pre-loaded, cache warmed, notifications disabled, laptop on mains power
- Prepare the offline fallback: local build + `docker-compose up` verified working with no internet

**Evening Review**
- Timed rehearsal #2 — must land within 5:00
- Q&A drill: each member answers 5 random judge questions from the list

**Expected Deliverables**
✅ **`v1.0-demo` tagged** · ✅ Demo environment prepared · ✅ Offline fallback verified · ✅ Rehearsal #2 under time

**Common Mistakes**
- Pushing a "tiny fix" after the freeze that breaks the build at midnight. This happens to real teams every year.
- Not verifying the offline fallback actually works without internet — **physically turn off Wi-Fi and test it**
- Demoing from a browser with 40 tabs and personal bookmarks visible

**Definition of Done**
> `git checkout v1.0-demo` produces a working demo, online or offline, on the demo laptop.

---

## DAY 15 — Rehearsal Day

**Morning**
- Rehearsal #3 — full run, timed, in presentation clothes if possible
- Rehearsal #4 — **with deliberate sabotage.** A teammate unplugs the network mid-demo, or clicks a random button. Practise recovering calmly. This single exercise separates composed teams from panicking ones.

**Afternoon**
- Q&A gauntlet: an outsider (a senior, a professor, a friend) asks the 20 hardest questions
- Refine weak answers; write them into `docs/QA-PREP.md`
- Rehearsal #5 — final polish of transitions between speakers

**Evening Review**
- Confirm speaking order, timings, and who controls the laptop (**one person only** drives the screen)
- Pack: laptop, charger, HDMI + USB-C adapters, mobile hotspot, offline build on a USB stick, printed one-pager

**Expected Deliverables**
✅ 5+ rehearsals completed · ✅ Q&A prep document · ✅ Equipment packed · ✅ Roles locked

**Common Mistakes**
- Under-rehearsing. Five rehearsals is a minimum, not a stretch goal. The best-engineered project loses to a rehearsed one.
- All four members trying to drive the laptop — chaos. One driver, others speak.
- Not preparing for the demo to fail. Have the backup video queued in a tab.

**Definition of Done**
> Every member can deliver their section from memory, in time, and recover gracefully from a technical failure.

---

## DAY 16 — DEMO DAY

**Morning**
- Arrive early. Test the projector, resolution, HDMI, audio, and network **at the actual venue**.
- Load all demo tabs; warm the backend (free-tier services cold-start — **hit your API 10 minutes before demoing** or your first request will hang for 30 seconds in front of the judges)
- One final timed run-through in a quiet corner
- **No code changes. None. For any reason.**

**Afternoon — Demo**
- Execute the script (Phase 11)
- Answer questions using the prepared material
- If something breaks: stay calm, switch to the backup video, keep narrating. Composure under failure impresses judges more than a flawless run.

**Evening**
- Submit the repo, deployed URL, and deck as required
- Whatever the outcome: you shipped a real, deployed, explainable AI system in 16 days. That is a genuine achievement.

**Expected Deliverables**
✅ Demo delivered on time · ✅ Q&A handled · ✅ Submission complete

**Common Mistakes**
- Cold-start delay on free hosting — **warm the API before demoing.** This ruins more demos than any bug.
- Live-coding a fix during the demo
- Running over time — judges cut you off mid-sentence and you lose the closing line
- Apologising for missing features. Frame them as deliberate trade-offs instead.

**Definition of Done**
> The judges saw a live score, understood how it was computed, watched the simulator change it in real time, and heard a clear answer to every question they asked.

---

## Sprint burndown checkpoints

| Checkpoint | Must be true | If not true → action |
|---|---|---|
| **End Day 3** | Contract frozen + seed data in staging | Drop everything; all 4 members finish these two items |
| **End Day 5** | Real score visible in browser | Cut forecasting + anomaly detection immediately |
| **End Day 9** | All P0 complete, `v0.1-mvp` tagged | Cancel the simulator; polish the MVP instead |
| **End Day 11** | Simulator working, feature freeze declared | Freeze anyway; ship what works |
| **End Day 14** | Code frozen, `v1.0-demo` tagged, offline fallback tested | Freeze anyway; rehearsal matters more than any remaining fix |
