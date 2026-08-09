import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { QueryState } from "@/components/common/query-state";
import { ModuleView } from "@/components/dashboard/module-view";
import { kpiIcons } from "@/config/kpi-icons";
import { getAirQuality } from "@/services/modules-service";

const title = "Air Quality | UrbanSense Sustainability Platform";
const description = "AQI, PM2.5, PM10 and CO2 monitoring across city stations.";

export const Route = createFileRoute("/air-quality")({
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
  const query = useQuery({ queryKey: ["air-quality"], queryFn: getAirQuality });

  return (
    <DashboardLayout title="Air Quality Monitoring" subtitle="Station network · live readings">
      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        data={query.data}
        onRetry={() => query.refetch()}
        loadingLabel="Loading Air Quality data"
        isEmpty={(data) => data.kpis.length === 0}
      >
        {(data) => (
          <ModuleView
            payload={data}
            icons={kpiIcons.airQuality}
            extra={null}
          />
        )}
      </QueryState>
    </DashboardLayout>
  );
}
