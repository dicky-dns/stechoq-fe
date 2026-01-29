"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getUser, type AuthUser } from "@/lib/auth";
import { useToast } from "@/components/toast-provider";

type Issue = {
  id: number;
  project_id?: number | null;
  title?: string | null;
  description?: string | null;
  type?: string | null;
  status?: string | null;
  priority?: number | null;
  working_hour?: number | null;
  assignee_id?: number | null;
  assignee?: { id: number; name: string; email: string; role: string } | null;
};

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

const TYPE_OPTIONS = ["bug", "improvement", "task"];
const STATUS_OPTIONS = ["open", "in_progress", "done"];
const PRIORITY_OPTIONS = [1, 2, 3, 4, 5];

export default function ProjectIssuesPage() {
  const params = useParams();
  const projectId = Number(params?.id);
  const [user, setUser] = useState<AuthUser | null>(null);
  const isManager = user?.role === "manager";

  const [project, setProject] = useState<Project | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [engineers, setEngineers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Issue | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { pushToast } = useToast();

  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    type: "",
    priority: "",
    assignee_id: "",
  });

  const [updateForm, setUpdateForm] = useState({
    assignee_id: "",
    status: "",
    working_hour: "",
  });
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const assigneeOptions = useMemo(
    () => engineers.filter((userItem) => userItem.role === "engineer"),
    [engineers]
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const [issueData, projectData, engineerData] = await Promise.all([
        apiFetch<Issue[]>(`/issues?project_id=${projectId}`),
        apiFetch<Project>(`/projects/${projectId}`),
        apiFetch<User[]>("/users?role=engineer"),
      ]);
      setIssues(issueData);
      setProject(projectData);
      setEngineers(engineerData);
    } catch (err) {
      pushToast(
        err instanceof Error ? err.message : "Gagal memuat issue",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!Number.isNaN(projectId)) {
      setUser(getUser());
      loadData();
    }
  }, [projectId]);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      await apiFetch("/issues", {
        method: "POST",
        body: JSON.stringify({
          project_id: projectId,
          title: createForm.title,
          description: createForm.description || null,
          type: createForm.type,
          priority: Number(createForm.priority),
          assignee_id: createForm.assignee_id
            ? Number(createForm.assignee_id)
            : null,
        }),
      });
      setCreateForm({
        title: "",
        description: "",
        type: "",
        priority: "",
        assignee_id: "",
      });
      setShowCreateModal(false);
      loadData();
    } catch (err) {
      pushToast(
        err instanceof Error ? err.message : "Gagal membuat issue",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const normalizedWorkingHour = updateForm.working_hour.replace(",", ".");
      const payload = isManager
        ? { assignee_id: Number(updateForm.assignee_id) }
        : {
            status: updateForm.status,
            working_hour: Number(normalizedWorkingHour),
          };

      await apiFetch(`/issues/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setEditing(null);
      setUpdateForm({ assignee_id: "", status: "", working_hour: "" });
      setShowUpdateModal(false);
      loadData();
    } catch (err) {
      pushToast(
        err instanceof Error ? err.message : "Gagal update issue",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (issue: Issue) => {
    setEditing(issue);
    setUpdateForm({
      assignee_id: issue.assignee_id?.toString() ?? "",
      status: issue.status ?? "",
      working_hour: issue.working_hour?.toString() ?? "",
    });
    setShowUpdateModal(true);
  };

  const projectTitle = useMemo(() => {
    if (project?.name) return project.name;
    return Number.isNaN(projectId) ? "Project" : `Project #${projectId}`;
  }, [project, projectId]);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-border bg-surface p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
              Issues
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-text">
              {projectTitle}
            </h2>
            <p className="mt-2 text-sm text-text-muted">
              Kelola issue untuk project ini saja.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/projects"
              className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-text-muted transition hover:border-primary hover:text-primary"
            >
              Kembali ke Projects
            </Link>
            {isManager ? (
              <button
                onClick={() => setShowCreateModal(true)}
                className="rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-primary/20 transition hover:bg-primary-strong"
              >
                Tambah Issue
              </button>
            ) : null}
            <button
              onClick={loadData}
              className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-text-muted transition hover:border-primary hover:text-primary"
            >
              Refresh
            </button>
          </div>
        </div>
      </section>

      {isManager && showCreateModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-6">
          <div className="w-full max-w-2xl rounded-3xl border border-border bg-surface p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-text">
                  Buat Issue
                </h3>
                <p className="text-sm text-text-muted">
                  Issue baru akan dibuat untuk project ini.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-text-muted transition hover:border-primary hover:text-primary"
              >
                Tutup
              </button>
            </div>

            <form
              onSubmit={handleCreate}
              className="mt-6 grid gap-4 md:grid-cols-2"
            >
              <label className="text-sm font-semibold text-text md:col-span-2">
                Judul Issue
                <input
                  value={createForm.title}
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      title: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-4 focus:ring-ring"
                  placeholder="Tuliskan Judul Issue"
                  required
                />
              </label>

              <label className="text-sm font-semibold text-text md:col-span-2">
                Deskripsi
                <textarea
                  value={createForm.description}
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  className="mt-2 min-h-[120px] w-full rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-4 focus:ring-ring"
                  placeholder="Jelaskan masalah, langkah reproduksi, atau kebutuhan task."
                />
              </label>

              <label className="text-sm font-semibold text-text">
                Tipe
                <select
                  value={createForm.type}
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      type: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-4 focus:ring-ring"
                  required
                >
                  <option value="" disabled>
                    Pilih
                  </option>
                  {TYPE_OPTIONS.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-semibold text-text">
                Priority (1-5)
                <select
                  value={createForm.priority}
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      priority: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-4 focus:ring-ring"
                  required
                >
                  <option value="" disabled>
                    Pilih
                  </option>
                  {PRIORITY_OPTIONS.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-semibold text-text md:col-span-2">
                Assignee
                <select
                  value={createForm.assignee_id}
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      assignee_id: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-4 focus:ring-ring"
                >
                  <option value="" disabled>
                    Pilih
                  </option>
                  <option value="">Tanpa assignee</option>
                  {assigneeOptions.length ? (
                    assigneeOptions.map((assignee) => (
                      <option key={assignee.id} value={assignee.id}>
                        {assignee.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      Belum ada engineer
                    </option>
                  )}
                </select>
              </label>

              <div className="md:col-span-2 mt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-primary px-5 py-4 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-primary/20 w-full transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {showUpdateModal && editing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-6">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-surface p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-text">
                  {isManager ? "Update Assignee" : "Update Issue"}
                </h3>
                <p className="text-sm text-text-muted">{editing.title}</p>
              </div>
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setEditing(null);
                }}
                className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-text-muted transition hover:border-primary hover:text-primary"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleUpdate} className="mt-6 grid gap-4">
              {isManager ? (
                <label className="text-sm font-semibold text-text">
                  Assignee
                  <select
                    value={updateForm.assignee_id}
                    onChange={(event) =>
                      setUpdateForm((prev) => ({
                        ...prev,
                        assignee_id: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-4 focus:ring-ring"
                    required
                    disabled={editing.status !== "open"}
                  >
                    <option value="" disabled>
                      Pilih
                    </option>
                    {assigneeOptions.length ? (
                      assigneeOptions.map((assignee) => (
                        <option key={assignee.id} value={assignee.id}>
                          {assignee.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        Belum ada engineer
                      </option>
                    )}
                  </select>
                </label>
              ) : (
                <>
                  <label className="text-sm font-semibold text-text">
                    Status
                    <select
                      value={updateForm.status}
                      onChange={(event) =>
                        setUpdateForm((prev) => ({
                          ...prev,
                          status: event.target.value,
                        }))
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
                  <label className="text-sm font-semibold text-text">
                    Working Hour
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={updateForm.working_hour}
                      onChange={(event) => {
                        const rawValue = event.target.value;
                        if (!/^\d*(?:[.,]\d{0,2})?$/.test(rawValue)) return;
                        const normalizedValue = rawValue.replace(",", ".");
                        setUpdateForm((prev) => ({
                          ...prev,
                          working_hour: normalizedValue,
                        }));
                      }}
                      className="mt-2 w-full rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-4 focus:ring-ring"
                      placeholder="Contoh: 4.25"
                      required
                    />
                  </label>
                </>
              )}

              <button
                type="submit"
                disabled={saving || (isManager && editing.status !== "open")}
                className="rounded-full bg-primary px-5 py-4 mt-4 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-primary/20 transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      <section className="rounded-3xl border border-border bg-surface p-6 shadow-lg">
        {loading ? (
          <p className="text-sm text-text-muted">Memuat data issue...</p>
        ) : issues.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-separate border-spacing-y-3 text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.2em] text-text-muted">
                <tr>
                  <th className="px-4">Issue</th>
                  <th className="px-4">Status</th>
                  <th className="px-4">Type</th>
                  <th className="px-4">Priority</th>
                  <th className="px-4">Assignee</th>
                  <th className="px-4">Working Hour</th>
                  <th className="px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue, index) => (
                  <tr
                    key={issue.id}
                    className="rounded-2xl border border-border bg-surface-muted"
                  >
                    <td className="px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
                        #{index + 1}
                      </p>
                      <p className="mt-1 text-base font-semibold text-text">
                        {issue.title}
                      </p>
                      <p className="mt-1 text-xs text-text-muted">
                        {issue.description || "Tidak ada deskripsi."}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {issue.status?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-text-muted">{issue.type}</td>
                    <td className="px-4 py-4 text-text-muted">
                      {issue.priority ?? "-"}
                    </td>
                    <td className="px-4 py-4 text-text-muted">
                      {issue.assignee?.name ?? "-"}
                    </td>
                    <td className="px-4 py-4 text-text-muted">
                      {issue.working_hour ? issue.working_hour + ' Hour' : "-"}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => startEdit(issue)}
                        className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-text-muted transition hover:border-primary hover:text-primary"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-text-muted">
            Belum ada issue untuk project ini.
          </p>
        )}
      </section>
    </div>
  );
}
