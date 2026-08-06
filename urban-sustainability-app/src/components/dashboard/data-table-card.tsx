import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/common/empty-state";
import type { DataTable } from "@/types/modules";
import type { MetricStatus } from "@/types/sustainability";
import { cn } from "@/lib/utils";

const statusStyles: Record<MetricStatus, string> = {
  good: "bg-success/12 text-success border-success/25",
  moderate: "bg-warning/15 text-warning-foreground border-warning/40",
  poor: "bg-destructive/10 text-destructive border-destructive/25",
};

/** Reusable table card used by module pages for tabular mock data. */
export function DataTableCard({ table }: { table: DataTable }) {
  return (
    <Card className="rounded-2xl border-border bg-card shadow-[var(--shadow-soft)]">
      <CardHeader>
        <CardTitle className="text-base">{table.title}</CardTitle>
        <CardDescription>{table.description}</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {table.rows.length === 0 ? (
          <EmptyState title="No records" description="No rows match the current data source." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {table.columns.map((column, index) => (
                  <TableHead
                    key={column}
                    className={index === table.columns.length - 1 ? "text-right" : undefined}
                  >
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.rows.map((row) => (
                <TableRow key={row.id}>
                  {row.cells.map((cell, index) => (
                    <TableCell
                      key={`${row.id}-${index}`}
                      className={cn(index === 0 ? "font-medium" : "text-muted-foreground")}
                    >
                      {cell}
                    </TableCell>
                  ))}
                  {row.status ? (
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={cn("rounded-full capitalize", statusStyles[row.status])}
                      >
                        {row.statusLabel ?? row.status}
                      </Badge>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
