// src/mocks/browser.ts
// MSW v2 — import from "msw/browser" (not "msw")
import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);

if (import.meta.env.DEV) {
  // Intercept fetches in development; bypass anything not in our handlers.
  worker.start({ onUnhandledRequest: "bypass" });
}
