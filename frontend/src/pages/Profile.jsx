import api from "../utils/axios";
import { useContext, useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext";

const getInitials = (name = "") => {
  const words = String(name).trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "U";
  if (words.length === 1) return words[0].slice(0, 1).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
};

export default function Profile() {
  const { user } = useContext(AuthContext);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const initials = useMemo(() => getInitials(user?.name), [user?.name]);

  const changePassword = async () => {
    if (isSubmitting) return;

    setError("");
    setSuccess("");

    if (!oldPass || !newPass || !confirmPass) {
      setError("All password fields are required.");
      return;
    }

    if (newPass.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (newPass !== confirmPass) {
      setError("New password and confirm password do not match.");
      return;
    }

    if (oldPass === newPass) {
      setError("New password should be different from old password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data } = await api.post("/users/change-password", {
        oldPassword: oldPass,
        newPassword: newPass,
      });

      setSuccess(data?.message || "Password updated successfully.");
      setOldPass("");
      setNewPass("");
      setConfirmPass("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
        Profile not available right now.
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/70 p-5 md:p-7"
      style={{
        fontFamily: "'Sora', sans-serif",
        background:
          "radial-gradient(circle at 12% 8%, #bfdbfe 0%, transparent 30%), radial-gradient(circle at 88% 12%, #a7f3d0 0%, transparent 30%), linear-gradient(145deg,#f8fafc 0%,#eff6ff 55%,#ecfdf5 100%)",
      }}
    >
      <div className="pointer-events-none absolute -left-16 top-10 h-44 w-44 rounded-full bg-sky-300/35 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -right-12 bottom-8 h-44 w-44 rounded-full bg-emerald-300/30 blur-3xl animate-float-slow-delayed" />

      <div className="relative grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr,1.4fr]">
        <section className="rounded-2xl border border-white/80 bg-white/82 p-5 shadow-[0_20px_55px_-35px_rgba(15,23,42,0.55)] backdrop-blur-xl md:p-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-900">
            <span className="inline-block h-2 w-2 rounded-full bg-sky-600" />
            Account Center
          </p>

          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">My Profile</h2>
          <p className="mt-2 text-sm text-slate-600">Manage account details and keep your credentials secure.</p>

          <div className="mt-5 flex items-center gap-4 rounded-xl border border-slate-200 bg-white/85 p-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-xl font-bold text-white shadow-md">
              {initials}
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">{user.name}</p>
              <p className="text-sm text-slate-600">{user.email}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-violet-200 bg-violet-50/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-800">Role</p>
              <p className="mt-1 text-sm font-bold capitalize text-violet-900">{user.role}</p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Status</p>
              <p className="mt-1 text-sm font-bold text-emerald-900">Active</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/80 bg-white/82 p-5 shadow-[0_20px_55px_-35px_rgba(15,23,42,0.55)] backdrop-blur-xl md:p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xl font-bold text-slate-900">Change Password</h3>
            <span className="rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">
              Security
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-600">
            Use a strong password with letters, numbers, and symbols.
          </p>

          {error && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
              {success}
            </div>
          )}

          <div className="mt-4 space-y-3">
            <input
              className="w-full rounded-xl border border-slate-300 bg-white/90 px-4 py-3 text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              placeholder="Current Password"
              type="password"
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
            />

            <input
              className="w-full rounded-xl border border-slate-300 bg-white/90 px-4 py-3 text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              placeholder="New Password"
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
            />

            <input
              className="w-full rounded-xl border border-slate-300 bg-white/90 px-4 py-3 text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              placeholder="Confirm New Password"
              type="password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
            />
          </div>

          <button
            onClick={changePassword}
            disabled={isSubmitting}
            className="mt-5 w-full rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 py-3 font-semibold text-white shadow-[0_14px_26px_-14px_rgba(37,99,235,0.85)] transition hover:-translate-y-0.5 hover:from-sky-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Updating..." : "Update Password"}
          </button>
        </section>
      </div>
    </div>
  );
}
