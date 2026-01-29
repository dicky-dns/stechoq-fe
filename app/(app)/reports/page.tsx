"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/toast-provider";
import { getUser, type AuthUser } from "@/lib/auth";

type Project = {
  id: number;
  name: string;
};

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type Issue = {
  id: number;
  title?: string | null;
  type?: string | null;
  status?: string | null;
  working_hour?: number | null;
  assignee?: { id: number; name: string; email: string; role: string } | null;
};

const TYPE_OPTIONS = ["bug", "improvement", "task"];
const STATUS_OPTIONS = ["open", "in_progress", "done"];

export default function ReportsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [engineers, setEngineers] = useState<User[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const isManager = user?.role === "manager";
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [filters, setFilters] = useState({
    assignee_id: "",
    type: "",
    status: "",
  });
  const [loading, setLoading] = useState(true);
  const { pushToast } = useToast();

  const loadMeta = async () => {
    try {
      const [projectData, engineerData] = await Promise.all([
        apiFetch<Project[]>("/projects"),
        apiFetch<User[]>("/users?role=engineer"),
      ]);
      setProjects(projectData);
      setEngineers(engineerData);
      if (projectData.length && !selectedProjectId) {
        setSelectedProjectId(String(projectData[0].id));
      }
    } catch (err) {
      pushToast(
        err instanceof Error ? err.message : "Gagal memuat data master",
        "error"
      );
    }
  };

  const loadIssues = async () => {
    if (!selectedProjectId) {
      setIssues([]);
      return;
    }
    setLoading(true);
    try {
      const query = new URLSearchParams({
        project_id: selectedProjectId,
      });
      if (filters.assignee_id) query.set("assignee_id", filters.assignee_id);
      if (filters.type) query.set("type", filters.type);
      if (filters.status) query.set("status", filters.status);

      const data = await apiFetch<Issue[]>(`/issues?${query.toString()}`);
      setIssues(data);
    } catch (err) {
      pushToast(
        err instanceof Error ? err.message : "Gagal memuat issues",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setUser(getUser());
    loadMeta();
  }, []);

  useEffect(() => {
    loadIssues();
  }, [selectedProjectId, filters.assignee_id, filters.type, filters.status]);

  const engineerOptions = useMemo(
    () => engineers.filter((user) => user.role === "engineer"),
    [engineers]
  );

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-border bg-surface p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
              Reports
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-text">
              Show all Issues for the selected project
            </h2>
          </div>
          <button
            onClick={loadIssues}
            className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-text-muted transition hover:border-primary hover:text-primary"
          >
            Refresh
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm font-semibold text-text">
            Project
            <select
              value={selectedProjectId}
              onChange={(event) => setSelectedProjectId(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-4 focus:ring-ring"
            >
              <option value="">Pilih</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>

          <label  className={`text-sm font-semibold text-text ${
              ! isManager ? "invisible" : ""
            }`}>
            Assignee
            <select
              value={filters.assignee_id}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  assignee_id: event.target.value,
                }))
              }
              className="mt-2 w-full rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-4 focus:ring-ring"
            >
              <option value="">Semua</option>
              {engineerOptions.map((engineer) => (
                <option key={engineer.id} value={engineer.id}>
                  {engineer.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-semibold text-text">
            Type
            <select
              value={filters.type}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, type: event.target.value }))
              }
              className="mt-2 w-full rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-4 focus:ring-ring"
            >
              <option value="">Semua</option>
              {TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-semibold text-text">
            Status
            <select
              value={filters.status}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, status: event.target.value }))
              }
              className="mt-2 w-full rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-4 focus:ring-ring"
            >
              <option value="">Semua</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status.replace("_", " ")}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-surface p-6 shadow-lg">
        {loading ? (
          <p className="text-sm text-text-muted">Memuat issues...</p>
        ) : issues.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-separate border-spacing-y-3 text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.2em] text-text-muted">
                <tr>
                  <th className="px-4">Issue</th>
                  <th className="px-4">Assigned Engineer</th>
                  <th className="px-4">Type</th>
                  <th className="px-4">Status</th>
                  <th className="px-4 text-right">Working Hour</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
                  <tr
                    key={issue.id}
                    className="rounded-2xl border border-border bg-surface-muted"
                  >
                    <td className="px-4 py-4">
                      <p className="mt-1 text-base font-semibold text-text">
                        {issue.title ?? "Tanpa judul"}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-text-muted">
                      {issue.assignee?.name ?? "-"}
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {issue.type ?? "-"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {issue.status?.replace("_", " ") ?? "-"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right text-text-muted">
                      {issue.working_hour ? issue.working_hour + ' Hour' : "-" }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-text-muted">
            Tidak ada issue untuk filter yang dipilih.
          </p>
        )}
      </section>
    </div>
  );
}
