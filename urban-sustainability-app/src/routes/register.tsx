import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthLayout } from "@/layouts/auth-layout";
import { TextField } from "@/components/common/text-field";
import { Button } from "@/components/ui/button";
import { register } from "@/services/auth-service";

const title = "Create account | UrbanSense Sustainability Platform";
const description = "Register to start assessing urban sustainability against SDG 11 indicators.";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: RegisterPage,
});

type Errors = Partial<Record<"name" | "organization" | "email" | "password" | "confirm", string>>;

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    organization: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const update = (key: keyof typeof form) => (event: { target: { value: string } }) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Errors = {};
    if (form.name.trim().length < 2) nextErrors.name = "Enter your full name.";
    if (form.organization.trim().length < 2) nextErrors.organization = "Enter your organization.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = "Enter a valid email address.";
    if (form.password.length < 8) nextErrors.password = "Use at least 8 characters.";
    if (form.confirm !== form.password) nextErrors.confirm = "Passwords do not match.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    await register({
      name: form.name,
      organization: form.organization,
      email: form.email,
      password: form.password,
    });
    setLoading(false);
    navigate({ to: "/dashboard" });
  }

  return (
    <AuthLayout
      title="Create your account"
      description="Set up a workspace for your city or organization."
      footer={
        <>
          Already registered?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <TextField
          label="Full name"
          autoComplete="name"
          placeholder="Amara Osei"
          value={form.name}
          onChange={update("name")}
          error={errors.name}
        />
        <TextField
          label="Organization"
          autoComplete="organization"
          placeholder="Metro District Council"
          value={form.organization}
          onChange={update("organization")}
          error={errors.organization}
        />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="analyst@city.gov"
          value={form.email}
          onChange={update("email")}
          error={errors.email}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={update("password")}
          error={errors.password}
          helperText="Minimum 8 characters."
        />
        <TextField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={form.confirm}
          onChange={update("confirm")}
          error={errors.confirm}
        />
        <Button type="submit" className="h-11 w-full rounded-xl" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthLayout>
  );
}