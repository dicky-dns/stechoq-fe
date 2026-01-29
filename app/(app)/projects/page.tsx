"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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

const STATUS_OPTIONS = ["not_started", "in_progress", "finished"];

export default function ProjectsPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const isManager = user?.role === "manager";
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { pushToast } = useToast();
  const didFetchRef = useRef(false);

  const [form, setForm] = useState({
    name: "",
    start_date: "",
    end_date: "",
    status: "",
  });

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Project[]>("/projects");
      setProjects(data);
    } catch (err) {
      pushToast(
        err instanceof Error ? err.message : "Gagal memuat project",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;
    setUser(getUser());
    loadProjects();
  }, []);

  const startEdit = (project: Project) => {
    setEditing(project);
    setForm({
      name: project.name ?? "",
      start_date: project.start_date ?? "",
      end_date: project.end_date ?? "",
      status: project.status ?? "",
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditing(null);
    setForm({ name: "", start_date: "", end_date: "", status: "" });
    setShowModal(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        status: form.status || null,
      };

      if (editing) {
        await apiFetch(`/projects/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/projects", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      resetForm();
      loadProjects();
    } catch (err) {
      pushToast(
        err instanceof Error ? err.message : "Gagal menyimpan project",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-border bg-surface p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
              Projects
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-text">
              Kelola project
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {isManager ? (
              <button
                onClick={() => {
                  setEditing(null);
                  setForm({
                    name: "",
                    start_date: "",
                    end_date: "",
                    status: "",
                  });
                  setShowModal(true);
                }}
                className="rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-primary/20 transition hover:bg-primary-strong"
              >
                Tambah Project
              </button>
            ) : null}
            <button
              onClick={loadProjects}
              className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-text-muted transition hover:border-primary hover:text-primary"
            >
              Refresh
            </button>
          </div>
        </div>
      </section>
      {isManager && showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-6">
          <div className="w-full max-w-2xl rounded-3xl border border-border bg-surface p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-text">
                  {editing ? "Edit Project" : "Buat Project Baru"}
                </h3>
                <p className="text-sm text-text-muted">
                  Lengkapi detail project sebelum disimpan.
                </p>
              </div>
              <button
                onClick={resetForm}
                className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-text-muted transition hover:border-primary hover:text-primary"
              >
                Tutup
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-6 grid gap-4 md:grid-cols-2"
            >
              <label className="text-sm font-semibold text-text md:col-span-2">
                Nama Project
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  className="mt-2 w-full rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-4 focus:ring-ring"
                  required
                  placeholder="Nama Project"
                />
              </label>

              <label className="text-sm font-semibold text-text">
                Start Date
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      start_date: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-4 focus:ring-ring"
                />
              </label>

              <label className="text-sm font-semibold text-text">
                End Date
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      end_date: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-4 focus:ring-ring"
                />
              </label>

              <label className="text-sm font-semibold text-text md:col-span-2">
                Status
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, status: event.target.value }))
                  }
                  className="mt-2 w-full rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-4 focus:ring-ring"
                  required
                >
                  <option value="" disabled>
                    Pilih
                  </option>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-wrap items-center gap-3 md:col-span-2 mt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full w-full bg-primary px-5 py-4 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-primary/20 transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Menyimpan..."
                    : editing
                    ? "Simpan Perubahan"
                    : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <section className="rounded-3xl border border-border bg-surface p-6 shadow-lg">
        {loading ? (
          <p className="text-sm text-text-muted">Memuat data project...</p>
        ) : projects.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-separate border-spacing-y-3 text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.2em] text-text-muted">
                <tr>
                  <th className="px-4">Project</th>
                  <th className="px-4">Status</th>
                  <th className="px-4">Manager</th>
                  <th className="px-4">Timeline</th>
                  <th className="px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project, index) => (
                  <tr
                    key={project.id}
                    className="rounded-2xl border border-border bg-surface-muted"
                  >
                    <td className="px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
                        #{index + 1}
                      </p>
                      <p className="mt-1 text-base font-semibold text-text">
                        {project.name}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {project.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-text-muted">
                      {project.manager?.name ?? "Tidak tersedia"}
                    </td>
                    <td className="px-4 py-4 text-text-muted">
                      {project.start_date ?? "-"} → {project.end_date ?? "-"}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/projects/${project.id}/issues`}
                          className="rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-primary/20 transition hover:bg-primary-strong"
                        >
                          Lihat Issues
                        </Link>
                        {isManager ? (
                          <button
                            onClick={() => startEdit(project)}
                            className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-text-muted transition hover:border-primary hover:text-primary"
                          >
                            Edit
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-text-muted">
            Belum ada project. Manager bisa menambahkan project baru.
          </p>
        )}
      </section>
    </div>
  );
}
