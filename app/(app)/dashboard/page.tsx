"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { getUser, type AuthUser } from "@/lib/auth";
import { useToast } from "@/components/toast-provider";

type Project = {
  id: number;
  name: string;
  status: string;
  start_date?: string | null;
  end_date?: string | null;
  manager?: { id: number; name: string; email: string; role: string } | null;
};

type Issue = {
  id: number;
  title?: string | null;
  status?: string | null;
  type?: string | null;
  priority?: number | null;
  working_hour?: number | null;
  assignee?: { id: number; name: string; email: string; role: string } | null;
};

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const { pushToast } = useToast();

  useEffect(() => {
    setUser(getUser());
    const load = async () => {
      try {
        const [projectData, issueData] = await Promise.all([
          apiFetch<Project[]>("/projects"),
          apiFetch<Issue[]>("/issues"),
        ]);
        setProjects(projectData);
        setIssues(issueData);
      } catch (err) {
        pushToast(
          err instanceof Error ? err.message : "Gagal memuat dashboard",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openIssues = issues.filter((issue) => issue.status === "open").length;
  const inProgressIssues = issues.filter(
    (issue) => issue.status === "in_progress"
  ).length;
  const doneIssues = issues.filter((issue) => issue.status === "done").length;

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-border bg-surface p-8 shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
          Halo, {user?.name ?? "User"}
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-text">
          {loading
            ? "Menyiapkan ringkasan..."
            : "Ringkasan progres tracking hari ini"}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-text-muted">
          Lihat jumlah project aktif dan status issue terbaru dari tim. Semua
          data real-time Stechoq Tracker.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { label: "Total Projects", value: projects.length },
            { label: "Issues Open", value: openIssues },
            { label: "Issues In Progress", value: inProgressIssues },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-border bg-surface-muted p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">
                {card.label}
              </p>
              <p className="mt-2 text-3xl font-semibold text-text">
                {loading ? "…" : card.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-text">Project Terbaru</h3>
          <p className="mt-1 text-sm text-text-muted">
             Daftar 5 Project terbaru dari tim
          </p>
          <div className="mt-6 space-y-4">
            {(projects.length ? projects.slice(0, 5) : []).map((project) => (
              <div
                key={project.id}
                className="rounded-2xl border border-border bg-surface-muted p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-text">
                    {project.name}
                  </p>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {project.status.replace("_", " ")}
                  </span>
                </div>
                <p className="mt-2 text-xs text-text-muted">
                  Manager: {project.manager?.name ?? "Tidak tersedia"}
                </p>
              </div>
            ))}
            {!loading && projects.length === 0 ? (
              <p className="text-sm text-text-muted">
                Belum ada project, buat project pertama.
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-text">Status Issue</h3>
          <p className="mt-1 text-sm text-text-muted">
            Pantau penyelesaian issue tim engineering.
          </p>
          <div className="mt-6 space-y-4">
            {[
              { label: "Open", value: openIssues, tone: "bg-amber-100 text-amber-700" },
              {
                label: "In Progress",
                value: inProgressIssues,
                tone: "bg-sky-100 text-sky-700",
              },
              { label: "Done", value: doneIssues, tone: "bg-emerald-100 text-emerald-700" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-2xl border border-border bg-surface-muted px-4 py-3"
              >
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.tone}`}>
                  {item.label}
                </span>
                <span className="text-lg font-semibold text-text">
                  {loading ? "…" : item.value}
                </span>
              </div>
            ))}
          </div>

          <h3 className="text-lg font-semibold text-text pt-5">Status Project</h3>
          <p className="mt-1 text-sm text-text-muted">
            Ringkasan status project berdasarkan data terbaru.
          </p>
          <div className="mt-6 space-y-4">
                {[
            {
              label: "Not Started",
              value: projects.filter((project) => project.status === "not_started").length,
              tone: "bg-slate-100 text-slate-600",
            },
            {
              label: "In Progress",
              value: projects.filter((project) => project.status === "in_progress").length,
              tone: "bg-sky-100 text-sky-700",
            },
            {
              label: "Finished",
              value: projects.filter((project) => project.status === "finished").length,
              tone: "bg-emerald-100 text-emerald-700",
            },
          ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-2xl border border-border bg-surface-muted px-4 py-3"
              >
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.tone}`}>
                  {item.label}
                </span>
                <span className="text-lg font-semibold text-text">
                  {loading ? "…" : item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
