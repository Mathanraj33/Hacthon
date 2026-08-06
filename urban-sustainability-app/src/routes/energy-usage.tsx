import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { QueryState } from "@/components/common/query-state";
import { ModuleView } from "@/components/dashboard/module-view";
import { kpiIcons } from "@/config/kpi-icons";
import { getEnergyUsage } from "@/services/modules-service";

const title = "Energy Usage | UrbanSense Sustainability Platform";
const description = "Consumption, renewable share, monthly trend and building comparison.";

export const Route = createFileRoute("/energy-usage")({
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
  const query = useQuery({ queryKey: ["energy-usage"], queryFn: getEnergyUsage });

  return (
    <DashboardLayout title="Energy Usage" subtitle="Grid and municipal portfolio">
      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        data={query.data}
        onRetry={() => query.refetch()}
        loadingLabel="Loading Energy Usage data"
        isEmpty={(data) => data.kpis.length === 0}
      >
        {(data) => (
          <ModuleView
            payload={data}
            icons={kpiIcons.energy}
            extra={null}
          />
        )}
      </QueryState>
    </DashboardLayout>
  );
}
