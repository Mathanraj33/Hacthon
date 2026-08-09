import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthLayout } from "@/layouts/auth-layout";
import { TextField } from "@/components/common/text-field";
import { Button } from "@/components/ui/button";
import { login } from "@/services/auth-service";

const title = "Sign in | UrbanSense Sustainability Platform";
const description = "Access your city sustainability dashboard and SDG 11 assessment reports.";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = "Enter a valid email address.";
    if (password.length < 8) nextErrors.password = "Password must be at least 8 characters.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    await login({ email, password });
    setLoading(false);
    navigate({ to: "/dashboard" });
  }

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to continue monitoring your city's sustainability performance."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="analyst@city.gov"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
        />
        <Button type="submit" className="h-11 w-full rounded-xl" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Demo mode: any valid email and an 8+ character password works.
        </p>
      </form>
    </AuthLayout>
  );
}