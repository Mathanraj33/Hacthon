import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { QueryState } from "@/components/common/query-state";
import { TextField } from "@/components/common/text-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/hooks/use-theme";
import { getUserSettings } from "@/services/modules-service";

const title = "Settings | UrbanSense Sustainability Platform";
const description = "Manage your profile, theme, notifications, language and account preferences.";

export const Route = createFileRoute("/settings")({
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
  const query = useQuery({ queryKey: ["settings"], queryFn: getUserSettings });
  const { theme, setTheme } = useTheme();

  return (
    <DashboardLayout title="Settings" subtitle="Profile and platform preferences">
      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        data={query.data}
        onRetry={() => query.refetch()}
        loadingLabel="Loading settings"
      >
        {(settings) => (
          <div className="grid items-start gap-6 lg:grid-cols-2">
            <Card className="rounded-2xl border-border bg-card shadow-[var(--shadow-soft)]">
              <CardHeader>
                <CardTitle className="text-base">User profile</CardTitle>
                <CardDescription>Details shown on reports you generate.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <TextField label="Full name" defaultValue={settings.name} />
                <TextField label="Email" type="email" defaultValue={settings.email} />
                <TextField label="Organization" defaultValue={settings.organization} />
                <TextField label="Role" defaultValue={settings.role} />
                <Button
                  className="min-h-11 rounded-xl"
                  onClick={() => toast.success("Profile saved")}
                >
                  Save profile
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="rounded-2xl border-border bg-card shadow-[var(--shadow-soft)]">
                <CardHeader>
                  <CardTitle className="text-base">Theme</CardTitle>
                  <CardDescription>Switch between light and dark appearance.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-4">
                  <Label htmlFor="dark-mode">Dark mode</Label>
                  <Switch
                    id="dark-mode"
                    checked={theme === "dark"}
                    onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                  />
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border bg-card shadow-[var(--shadow-soft)]">
                <CardHeader>
                  <CardTitle className="text-base">Notifications</CardTitle>
                  <CardDescription>Choose what the platform sends you.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { id: "alerts", label: "Threshold alerts", value: settings.notifications.alerts },
                    { id: "digest", label: "Weekly digest", value: settings.notifications.weeklyDigest },
                    {
                      id: "recs",
                      label: "New AI recommendations",
                      value: settings.notifications.recommendations,
                    },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4">
                      <Label htmlFor={item.id}>{item.label}</Label>
                      <Switch
                        id={item.id}
                        defaultChecked={item.value}
                        onCheckedChange={() => toast.success("Notification preference updated")}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border bg-card shadow-[var(--shadow-soft)]">
                <CardHeader>
                  <CardTitle className="text-base">Account preferences</CardTitle>
                  <CardDescription>Language, units and timezone.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select defaultValue={settings.language}>
                      <SelectTrigger id="language" className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="sw">Kiswahili</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="units">Units</Label>
                    <Select defaultValue={settings.preferences.units}>
                      <SelectTrigger id="units" className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="metric">Metric</SelectItem>
                        <SelectItem value="imperial">Imperial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="outline"
                    className="min-h-11 rounded-xl"
                    onClick={() => toast.success("Preferences saved")}
                  >
                    Save preferences
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </QueryState>
    </DashboardLayout>
  );
}
