import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { QueryState } from "@/components/common/query-state";
import { ModuleView } from "@/components/dashboard/module-view";
import { kpiIcons } from "@/config/kpi-icons";
import { PlaceholderPanel } from "@/components/dashboard/placeholder-panel";
import { getWasteManagement } from "@/services/modules-service";

const title = "Waste Management | UrbanSense Sustainability Platform";
const description = "Recycling rate, collection status, generation and disposal analytics.";

export const Route = createFileRoute("/waste-management")({
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
  const query = useQuery({ queryKey: ["waste-management"], queryFn: getWasteManagement });

  return (
    <DashboardLayout title="Waste Management" subtitle="Collection routes · monthly cycle">
      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        data={query.data}
        onRetry={() => query.refetch()}
        loadingLabel="Loading Waste Management data"
        isEmpty={(data) => data.kpis.length === 0}
      >
        {(data) => (
          <ModuleView
            payload={data}
            icons={kpiIcons.waste}
            extra={(
          <PlaceholderPanel
            title="Collection map"
            description="Route coverage and bin fill levels by district."
            note="Interactive collection map placeholder. Connect a geospatial provider to render live routes and bin telemetry."
          />
        )}
          />
        )}
      </QueryState>
    </DashboardLayout>
  );
}
