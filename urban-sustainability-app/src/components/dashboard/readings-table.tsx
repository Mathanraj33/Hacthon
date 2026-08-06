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
import { formatDateTime } from "@/utils/format";
import type { SensorReading } from "@/types/sustainability";
import { cn } from "@/lib/utils";

const statusStyles: Record<SensorReading["status"], string> = {
  good: "bg-success/12 text-success border-success/25",
  moderate: "bg-warning/15 text-warning-foreground border-warning/40",
  poor: "bg-destructive/10 text-destructive border-destructive/25",
};

export function ReadingsTable({ readings }: { readings: SensorReading[] }) {
  return (
    <Card className="rounded-2xl border-border bg-card shadow-[var(--shadow-soft)]">
      <CardHeader>
        <CardTitle className="text-base">Latest zone readings</CardTitle>
        <CardDescription>Live values from connected monitoring stations.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Zone</TableHead>
              <TableHead>Metric</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {readings.map((reading) => (
              <TableRow key={reading.id}>
                <TableCell className="font-medium">{reading.zone}</TableCell>
                <TableCell className="text-muted-foreground">{reading.metric}</TableCell>
                <TableCell>{reading.value}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn("rounded-full capitalize", statusStyles[reading.status])}
                  >
                    {reading.status}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap text-right text-muted-foreground">
                  {formatDateTime(reading.updatedAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}