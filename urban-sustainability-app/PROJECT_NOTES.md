# Intelligent Urban Sustainability Assessment System — Foundation

A production-ready front-end foundation for an SDG 11 urban sustainability platform: marketing landing page, auth screens, and a dashboard of sustainability widgets, built on a reusable design system with dark mode.

## Design system

Tokens defined in `src/styles.css` (Tailwind v4 `@theme inline`), all colors in oklch equivalents of the requested palette:

- Primary #2563EB, Secondary #10B981, Accent/Warning #F59E0B, Success #22C55E, Danger #EF4444
- Background #F8FAFC, Surface #FFFFFF, Text #1E293B / #64748B, plus a matched dark palette
- Radius 12px, 8px spacing scale, soft elevation shadows, smooth transitions
- Poppins for headings, Inter for body, loaded via `<link>` in the root route head

No hardcoded color classes in components — everything goes through semantic tokens so dark mode works everywhere.

## UI component library (`src/components/ui/`)

Button (variants: primary, secondary, outline, ghost, danger; sizes; loading state), Card, Badge, Input (label + error + helper text), Modal (accessible dialog with focus trap and Esc close), Table, LoadingSpinner, EmptyState, ErrorState. Navbar, Sidebar (collapsible, mobile drawer), and Footer live in `src/components/layout/`.

## Layouts

- **AuthLayout** — centered card, branded split panel on desktop
- **DashboardLayout** — sidebar + top navbar + content area, mobile-first with a drawer sidebar and a theme toggle

## Pages / routes

- `/` — Landing: hero, SDG 11 framing, feature grid, metrics strip, CTA, footer
- `/login` — email + password form (UI only, validation + loading states)
- `/register` — name, email, password, confirm (UI only)
- `/dashboard` — widget grid

Dashboard widgets (placeholder data, chart-ready): Sustainability Score (radial gauge), Air Quality, Waste Management, Water Management, Energy Usage, Traffic Analysis, Green Cover, Smart Recommendations list.

## Accessibility

Semantic landmarks, single H1 per page, labeled inputs, aria-labels on icon-only buttons, visible focus rings, 44px tap targets, `h-dvh` for full-height layouts.

## Technical notes

- This project runs on **TanStack Router** (file-based routes in `src/routes/`), which is the fixed router for this stack — it plays the same role as React Router, so route files replace a `src/pages/` folder. Supporting folders `components/`, `layouts/`, `hooks/`, `services/`, `utils/`, `context/`, `types/` are created as requested.
- Mock data lives in `src/services/` behind typed functions so real API calls can be dropped in later; widget props are typed in `src/types/`.
- Auth pages are UI-only in this phase — no backend. Wiring real accounts (Lovable Cloud) is a follow-up step.
- Theme state via a `ThemeContext` + `useTheme` hook, persisted to localStorage, read after hydration to avoid mismatch.
- Each route gets its own SEO metadata via `head()`.
