import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Smooth cross-fade between routes via the native View Transitions API.
    // Falls back to an instant swap automatically in browsers that don't
    // support it (Firefox, older Safari) — no extra work needed.
    defaultViewTransition: true,
  });

  return router;
};
