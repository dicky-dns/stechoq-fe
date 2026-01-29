"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { setToken, setUser } from "@/lib/auth";
import { useToast } from "@/components/toast-provider";

type LoginResponse = {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  token: string;
};

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("manager1@example.com");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const { pushToast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const result = await apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(result.token);
      setUser(result.user);
      const next = params.get("next") ?? "/dashboard";
      router.replace(next);
    } catch (err) {
      pushToast(err instanceof Error ? err.message : "Login gagal", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background px-6 py-12">
      <div className="mx-auto flex align-middle w-full max-w-5xl flex-col gap-12 lg:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
            Stechoq Tracker
          </p>
          <h1 className="text-4xl font-semibold text-text lg:text-5xl">
            Masuk untuk mengelola proyek, issue, dan report.
          </h1>
          <p className="max-w-xl text-lg text-text-muted">
            Gunakan akun seeder dari backend: manager atau engineer. Semua data
            tersimpan di Laravel API.
          </p>
          <div className="rounded-3xl border border-border bg-surface/80 p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-text">Akun demo</h2>
            <p className="mt-2 text-sm text-text-muted">
              Manager: manager1@example.com / password
            </p>
            <p className="text-sm text-text-muted">
              Engineer: engineer1@example.com / password
            </p>
          </div>
        </div>

        <div className="flex w-full max-w-md flex-col justify-center">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-border bg-surface p-8 shadow-xl"
          >
            <h2 className="text-2xl font-semibold text-text">Login</h2>
            <p className="mt-2 text-sm text-text-muted">
              Silakan masuk untuk melanjutkan.
            </p>

            <label className="mt-6 block text-sm font-semibold text-text">
              Email
              <input
                type="email"
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm text-text shadow-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-ring"
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="mt-5 block text-sm font-semibold text-text">
              Password
              <input
                type="password"
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm text-text shadow-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-ring"
                placeholder="••••••••"
                required
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-2xl bg-primary px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-primary/20 transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
