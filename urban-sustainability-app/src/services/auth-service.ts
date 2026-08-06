import type { Credentials, RegistrationPayload } from "@/types/sustainability";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

/**
 * Placeholder auth layer. Replace these with real backend calls when a
 * backend is connected; the UI already handles loading and error states.
 */
export async function login({ email }: Credentials): Promise<AuthUser> {
  await new Promise((resolve) => setTimeout(resolve, 700));
  return { id: "demo-user", name: email.split("@")[0] ?? "Analyst", email };
}

export async function register(payload: RegistrationPayload): Promise<AuthUser> {
  await new Promise((resolve) => setTimeout(resolve, 700));
  return { id: "demo-user", name: payload.name, email: payload.email };
}