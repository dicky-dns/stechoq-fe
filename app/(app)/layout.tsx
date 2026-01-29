"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/auth-guard";
import NavLink from "@/components/nav-link";
import { clearAuth, getUser } from "@/lib/auth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const user = getUser();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUserName(user?.name ?? "");
    setUserRole(user?.role ?? "");
  }, []);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-20 border-b border-border bg-surface/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
                Stechoq
              </p>
              <h1 className="text-lg font-semibold text-text">Tracker Console</h1>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-border bg-surface px-2 py-1 shadow-sm md:flex">
              <NavLink href="/dashboard" label="Dashboard" />
              <NavLink href="/projects" label="Projects" />
              <NavLink href="/reports" label="Reports" />
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-text">
                  {userName || "User"}
                </p>
                <p className="text-xs text-text-muted capitalize">
                  {userRole || "role"}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-text-muted transition hover:border-primary hover:text-primary"
              >
                Logout
              </button>
            </div>
          </div>
          <div className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto px-6 pb-4 md:hidden">
            <NavLink href="/dashboard" label="Dashboard" />
            <NavLink href="/projects" label="Projects" />
            <NavLink href="/reports" label="Reports" />
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-6 py-10">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
