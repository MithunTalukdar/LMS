import { useEffect, useMemo, useState } from "react";
import api from "../utils/axios";

const ROLE_META = {
  admin: {
    label: "Admin",
    badgeClass: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
    pillClass: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
  },
  teacher: {
    label: "Teacher",
    badgeClass: "bg-cyan-100 text-cyan-800 border-cyan-200",
    pillClass: "border-cyan-200 bg-cyan-50 text-cyan-700",
  },
  student: {
    label: "Student",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
    pillClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  default: {
    label: "Member",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    pillClass: "border-slate-200 bg-slate-100 text-slate-700",
  },
};

const ROLE_FILTERS = ["all", "admin", "teacher", "student"];

const getRoleMeta = (role) => ROLE_META[String(role || "").toLowerCase()] || ROLE_META.default;

const formatRoleLabel = (role) => {
  const normalizedRole = String(role || "").toLowerCase();
  if (normalizedRole === "all") return "All";
  return getRoleMeta(normalizedRole).label;
};

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [activeRole, setActiveRole] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState("");

  useEffect(() => {
    let isMounted = true;

    setLoading(true);

    api
      .get("/users")
      .then((res) => {
        if (!isMounted) return;
        setUsers(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        if (!isMounted) return;
        setUsers([]);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const updateUserRole = async (id, role) => {
    setUpdatingUserId(id);

    try {
      await api.put(`/users/${id}/role`, { role });
      setUsers((prev) => prev.map((user) => (user._id === id ? { ...user, role } : user)));
    } catch {
      alert("Failed to update role");
    } finally {
      setUpdatingUserId("");
    }
  };

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const role = String(user.role || "").toLowerCase();
      const roleMatch = activeRole === "all" || role === activeRole;
      const name = String(user.name || "");
      const email = String(user.email || "");
      const textMatch =
        query.length === 0 ||
        name.toLowerCase().includes(query) ||
        email.toLowerCase().includes(query);

      return roleMatch && textMatch;
    });
  }, [users, search, activeRole]);

  const stats = useMemo(() => {
    const countByRole = {
      admin: 0,
      teacher: 0,
      student: 0,
      other: 0,
    };

    users.forEach((user) => {
      const role = String(user.role || "").toLowerCase();
      if (role === "admin") countByRole.admin += 1;
      else if (role === "teacher") countByRole.teacher += 1;
      else if (role === "student") countByRole.student += 1;
      else countByRole.other += 1;
    });

    return {
      total: users.length,
      visible: filteredUsers.length,
      ...countByRole,
    };
  }, [users, filteredUsers.length]);

  return (
    <div className="relative mx-auto w-full max-w-7xl px-2 md:px-4" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="pointer-events-none absolute -left-12 top-2 h-56 w-56 rounded-full bg-cyan-300/40 blur-3xl animate-drift-large" />
      <div className="pointer-events-none absolute -right-8 top-20 h-72 w-72 rounded-full bg-amber-200/35 blur-3xl animate-drift-medium" />

      <section className="relative isolate overflow-hidden rounded-[2rem] border border-slate-200/70 bg-[linear-gradient(145deg,#eef8ff_0%,#f7fbff_42%,#fffaf0_100%)] shadow-[0_30px_70px_-50px_rgba(15,23,42,0.9)]">
        <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:radial-gradient(circle_at_1px_1px,rgba(2,6,23,0.3)_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0.62)_0%,rgba(255,255,255,0.2)_42%,rgba(255,255,255,0.72)_100%)]" />

        <div className="relative p-4 md:p-7">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/80 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-900">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-600 animate-pulse-soft" />
              Administration Center
            </p>
            <h1
              className="mt-4 text-4xl font-bold leading-[0.95] text-slate-900 md:text-5xl"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Admin Command Dashboard
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-700 md:text-lg">
              Manage users, monitor role distribution, and update permissions from one clear and powerful control panel.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5 animate-fade-up-delayed">
            <div className="rounded-2xl border border-white/80 bg-white/75 p-3 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.95)]">
              <p className="text-2xl font-extrabold text-slate-900">{stats.total}</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">Total Users</p>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/75 p-3 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.95)]">
              <p className="text-2xl font-extrabold text-slate-900">{stats.visible}</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">Visible</p>
            </div>
            <div className="rounded-2xl border border-fuchsia-100 bg-fuchsia-50/75 p-3 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.95)]">
              <p className="text-2xl font-extrabold text-fuchsia-900">{stats.admin}</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-fuchsia-700">Admins</p>
            </div>
            <div className="rounded-2xl border border-cyan-100 bg-cyan-50/75 p-3 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.95)]">
              <p className="text-2xl font-extrabold text-cyan-900">{stats.teacher}</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-700">Teachers</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/75 p-3 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.95)]">
              <p className="text-2xl font-extrabold text-emerald-900">{stats.student}</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">Students</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/85 bg-white/75 p-4 shadow-[0_20px_40px_-34px_rgba(15,23,42,0.95)] animate-fade-up">
            <div className="grid gap-3 md:grid-cols-[1fr,auto]">
              <label className="relative block">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" className="h-4 w-4">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35m1.35-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  className="w-full rounded-xl border border-slate-200 bg-white/90 py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>

              <div className="flex items-center rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700">
                {stats.visible} result{stats.visible === 1 ? "" : "s"}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {ROLE_FILTERS.map((role) => {
                const isActive = activeRole === role;
                const roleMeta = getRoleMeta(role === "all" ? "default" : role);

                return (
                  <button
                    key={role}
                    onClick={() => setActiveRole(role)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition ${
                      isActive
                        ? "border-slate-900 bg-slate-900 text-white"
                        : roleMeta.pillClass
                    }`}
                  >
                    {formatRoleLabel(role)}
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="mt-5 grid grid-cols-1 gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-20 rounded-2xl border border-white/70 bg-white/70 animate-pulse"
                />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white/70 px-5 py-10 text-center">
              <h3 className="text-xl font-bold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                No users found
              </h3>
              <p className="mt-2 text-sm text-slate-600">Try a different search query or role filter.</p>
            </div>
          ) : (
            <>
              <div className="mt-5 hidden overflow-hidden rounded-2xl border border-white/80 bg-white/80 shadow-[0_25px_50px_-36px_rgba(2,6,23,0.9)] md:block">
                <div className="flex items-center justify-between border-b border-slate-200 bg-white/80 px-5 py-4">
                  <h3 className="text-lg font-bold text-slate-900">User Management Matrix</h3>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Role controls are live
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-slate-950/[0.03]">
                      <tr>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          User
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          Email
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          Current Role
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          Change Role
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/80">
                      {filteredUsers.map((user) => {
                        const roleMeta = getRoleMeta(user.role);
                        const initial = String(user.name || "U").trim().charAt(0).toUpperCase();

                        return (
                          <tr key={user._id} className="transition-colors hover:bg-slate-50/80">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-bold text-white">
                                  {initial || "U"}
                                </span>
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">{user.name || "Unknown User"}</p>
                                  <p className="text-xs text-slate-500">ID: {String(user._id || "").slice(-6)}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-700">{user.email || "No email"}</td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${roleMeta.badgeClass}`}>
                                {roleMeta.label}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <select
                                value={user.role}
                                onChange={(event) => updateUserRole(user._id, event.target.value)}
                                disabled={updatingUserId === user._id}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-100"
                              >
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:hidden">
                {filteredUsers.map((user) => {
                  const roleMeta = getRoleMeta(user.role);
                  const initial = String(user.name || "U").trim().charAt(0).toUpperCase();

                  return (
                    <div
                      key={user._id}
                      className="rounded-2xl border border-white/80 bg-white/85 p-4 shadow-[0_20px_35px_-28px_rgba(15,23,42,0.95)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-bold text-white">
                            {initial || "U"}
                          </span>
                          <div>
                            <p className="text-base font-semibold text-slate-900">{user.name || "Unknown User"}</p>
                            <p className="text-sm text-slate-600">{user.email || "No email"}</p>
                          </div>
                        </div>
                        <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${roleMeta.badgeClass}`}>
                          {roleMeta.label}
                        </span>
                      </div>

                      <div className="mt-3">
                        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                          Change Role
                        </label>
                        <select
                          value={user.role}
                          onChange={(event) => updateUserRole(user._id, event.target.value)}
                          disabled={updatingUserId === user._id}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-100"
                        >
                          <option value="student">Student</option>
                          <option value="teacher">Teacher</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
