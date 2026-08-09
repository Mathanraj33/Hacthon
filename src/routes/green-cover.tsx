import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Satellite } from "lucide-react";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { QueryState } from "@/components/common/query-state";
import { ModuleView } from "@/components/dashboard/module-view";
import { kpiIcons } from "@/config/kpi-icons";
import { PlaceholderPanel } from "@/components/dashboard/placeholder-panel";
import { getGreenCover } from "@/services/modules-service";

const title = "Green Cover | UrbanSense Sustainability Platform";
const description = "Green area, tree coverage, park distribution and heat island risk.";

export const Route = createFileRoute("/green-cover")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const query = useQuery({ queryKey: ["green-cover"], queryFn: getGreenCover });

  return (
    <DashboardLayout title="Green Cover" subtitle="Canopy and open space">
      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        data={query.data}
        onRetry={() => query.refetch()}
        loadingLabel="Loading Green Cover data"
        isEmpty={(data) => data.kpis.length === 0}
      >
        {(data) => (
          <ModuleView
            payload={data}
            icons={kpiIcons.greenCover}
            extra={(
          <PlaceholderPanel
            title="Satellite imagery"
            description="NDVI-derived canopy classification."
            note="Satellite image placeholder. Connect an imagery provider to render canopy classification layers."
            icon={Satellite}
          />
        )}
          />
        )}
      </QueryState>
    </DashboardLayout>
  );
}
