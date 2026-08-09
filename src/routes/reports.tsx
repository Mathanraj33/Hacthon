import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { FileDown, FileSpreadsheet } from "lucide-react";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { QueryState } from "@/components/common/query-state";
import { DataTableCard } from "@/components/dashboard/data-table-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getReports } from "@/services/modules-service";
import { formatDateTime } from "@/utils/format";

const title = "Reports | UrbanSense Sustainability Platform";
const description = "Browse, filter and export sustainability assessment reports as PDF or CSV.";

export const Route = createFileRoute("/reports")({
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
  const query = useQuery({ queryKey: ["reports"], queryFn: getReports });
  const [module, setModule] = useState("all");
  const [format, setFormat] = useState("all");

  const filtered = useMemo(() => {
    const rows = query.data ?? [];
    return rows.filter(
      (r) => (module === "all" || r.module === module) && (format === "all" || r.format === format),
    );
  }, [query.data, module, format]);

  const modules = useMemo(
    () => Array.from(new Set((query.data ?? []).map((r) => r.module))),
    [query.data],
  );

  return (
    <DashboardLayout
      title="Reports"
      subtitle="Generated assessments and data exports"
      actions={
        <div className="hidden items-center gap-2 sm:flex">
          <Button
            variant="outline"
            className="h-11 rounded-xl"
            onClick={() => toast.success("PDF export queued")}
          >
            <FileDown className="mr-2 size-4" aria-hidden="true" />
            Export PDF
          </Button>
          <Button
            variant="outline"
            className="h-11 rounded-xl"
            onClick={() => toast.success("CSV export queued")}
          >
            <FileSpreadsheet className="mr-2 size-4" aria-hidden="true" />
            Export CSV
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <Card className="rounded-2xl border-border bg-card shadow-[var(--shadow-soft)]">
          <CardContent className="flex flex-wrap items-center gap-3 p-5">
            <Select value={module} onValueChange={setModule}>
              <SelectTrigger className="h-11 w-full rounded-xl sm:w-56" aria-label="Filter by module">
                <SelectValue placeholder="Module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All modules</SelectItem>
                {modules.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="h-11 w-full rounded-xl sm:w-40" aria-label="Filter by format">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All formats</SelectItem>
                <SelectItem value="PDF">PDF</SelectItem>
                <SelectItem value="CSV">CSV</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2 sm:hidden">
              <Button variant="outline" className="h-11 rounded-xl" onClick={() => toast.success("PDF export queued")}>
                <FileDown className="mr-2 size-4" aria-hidden="true" />
                PDF
              </Button>
              <Button variant="outline" className="h-11 rounded-xl" onClick={() => toast.success("CSV export queued")}>
                <FileSpreadsheet className="mr-2 size-4" aria-hidden="true" />
                CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        <QueryState
          isLoading={query.isLoading}
          isError={query.isError}
          data={filtered}
          onRetry={() => query.refetch()}
          loadingLabel="Loading reports"
        >
          {(rows) => (
            <DataTableCard
              table={{
                title: "Reports",
                description: "Assessment documents available for download.",
                columns: ["Report", "Module", "Period", "Generated", "Format", "Status"],
                rows: rows.map((r) => ({
                  id: r.id,
                  cells: [r.name, r.module, r.period, formatDateTime(r.generatedAt), r.format],
                  status:
                    r.status === "ready"
                      ? ("good" as const)
                      : r.status === "processing"
                        ? ("moderate" as const)
                        : ("poor" as const),
                  statusLabel: r.status === "ready" ? "Ready" : r.status === "processing" ? "Processing" : "Failed",
                })),
              }}
            />
          )}
        </QueryState>
      </div>
    </DashboardLayout>
  );
}
