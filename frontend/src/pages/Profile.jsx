import { useContext, useMemo, useState } from "react";
import api from "../utils/axios";
import { AuthContext } from "../context/AuthContext";

const ROLE_META = {
  student: {
    label: "Student",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
    chip: "from-emerald-500 to-teal-500",
  },
  teacher: {
    label: "Teacher",
    tone: "border-sky-200 bg-sky-50 text-sky-800",
    chip: "from-sky-500 to-indigo-500",
  },
  admin: {
    label: "Admin",
    tone: "border-amber-200 bg-amber-50 text-amber-800",
    chip: "from-amber-500 to-orange-500",
  },
  default: {
    label: "Member",
    tone: "border-slate-200 bg-slate-50 text-slate-700",
    chip: "from-slate-500 to-slate-600",
  },
};

const getInitials = (name = "") => {
  const words = String(name).trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "U";
  if (words.length === 1) return words[0].slice(0, 1).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
};

const getRoleMeta = (role) => ROLE_META[String(role || "").toLowerCase()] || ROLE_META.default;

const formatMemberDate = (value) => {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const getAccountStatusMeta = (user) => {
  const lockUntilRaw = user?.lockUntil;
  const lockUntilDate = lockUntilRaw ? new Date(lockUntilRaw) : null;
  const lockUntilMs = lockUntilDate && !Number.isNaN(lockUntilDate.getTime()) ? lockUntilDate.getTime() : null;
  const isLocked = Boolean(lockUntilMs && lockUntilMs > Date.now());

  if (isLocked) {
    return {
      key: "unactive",
      label: "Unactive",
      hint: `Locked until ${formatDateTime(lockUntilRaw)}`,
      tone: "border-rose-200 bg-rose-50 text-rose-700",
      dot: "bg-rose-500",
      card: "border-rose-200 bg-rose-50/90",
      cardText: "text-rose-900",
    };
  }

  if (user?.isVerified === false) {
    return {
      key: "unactive",
      label: "Unactive",
      hint: "Account verification pending",
      tone: "border-amber-200 bg-amber-50 text-amber-800",
      dot: "bg-amber-500",
      card: "border-amber-200 bg-amber-50/90",
      cardText: "text-amber-900",
    };
  }

  return {
    key: "active",
    label: "Active",
    hint: "Account in good standing",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
    dot: "bg-emerald-500",
    card: "border-emerald-200 bg-emerald-50/90",
    cardText: "text-emerald-900",
  };
};

const getPasswordScore = (password, confirmPassword) => {
  if (!password) return 0;

  let score = 0;
  if (password.length >= 8) score += 25;
  if (/[A-Z]/.test(password)) score += 20;
  if (/[a-z]/.test(password)) score += 15;
  if (/\d/.test(password)) score += 20;
  if (/[^A-Za-z0-9]/.test(password)) score += 20;
  if (confirmPassword && password === confirmPassword) score += 10;

  return Math.min(100, score);
};

const getStrengthMeta = (score) => {
  if (score >= 85) {
    return {
      label: "Excellent",
      tone: "text-emerald-700",
      bar: "from-emerald-500 to-teal-500",
      ring: "border-emerald-200 bg-emerald-50",
    };
  }
  if (score >= 65) {
    return {
      label: "Strong",
      tone: "text-cyan-700",
      bar: "from-cyan-500 to-sky-500",
      ring: "border-cyan-200 bg-cyan-50",
    };
  }
  if (score >= 40) {
    return {
      label: "Moderate",
      tone: "text-amber-700",
      bar: "from-amber-500 to-orange-500",
      ring: "border-amber-200 bg-amber-50",
    };
  }
  return {
    label: "Weak",
    tone: "text-rose-700",
    bar: "from-rose-500 to-red-500",
    ring: "border-rose-200 bg-rose-50",
  };
};

export default function Profile() {
  const { user } = useContext(AuthContext);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const initials = useMemo(() => getInitials(user?.name), [user?.name]);
  const roleMeta = useMemo(() => getRoleMeta(user?.role), [user?.role]);
  const memberSince = useMemo(() => formatMemberDate(user?.createdAt), [user?.createdAt]);
  const accountId = useMemo(() => String(user?._id || "").slice(-8).toUpperCase() || "N/A", [user?._id]);
  const accountStatus = getAccountStatusMeta(user);
  const passwordScore = useMemo(() => getPasswordScore(newPass, confirmPass), [newPass, confirmPass]);
  const strengthMeta = useMemo(() => getStrengthMeta(passwordScore), [passwordScore]);

  const passwordChecks = useMemo(() => {
    return [
      { label: "At least 6 characters (required)", ok: newPass.length >= 6 },
      { label: "Includes uppercase letter", ok: /[A-Z]/.test(newPass) },
      { label: "Includes number", ok: /\d/.test(newPass) },
      { label: "Includes special character", ok: /[^A-Za-z0-9]/.test(newPass) },
      { label: "New and confirm passwords match", ok: !!confirmPass && newPass === confirmPass },
      { label: "Different from old password", ok: !!newPass && !!oldPass && oldPass !== newPass },
    ];
  }, [newPass, confirmPass, oldPass]);

  const completedChecks = passwordChecks.filter((item) => item.ok).length;
  const profileCompletion = useMemo(() => {
    let score = 40;
    if (user?.name) score += 20;
    if (user?.email) score += 20;
    if (user?.role) score += 20;
    return Math.min(100, score);
  }, [user]);

  const changePassword = async (event) => {
    event?.preventDefault();
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
      className="relative isolate overflow-hidden rounded-3xl border border-slate-200/80 p-3 sm:p-4 md:rounded-[2.2rem] md:p-7"
      style={{
        fontFamily: "'Manrope', sans-serif",
        background:
          "radial-gradient(circle at 10% 12%, rgba(56,189,248,0.32) 0%, transparent 34%), radial-gradient(circle at 88% 10%, rgba(251,191,36,0.28) 0%, transparent 32%), radial-gradient(circle at 78% 88%, rgba(45,212,191,0.28) 0%, transparent 34%), linear-gradient(145deg,#f5fbff 0%,#f4f7ff 52%,#fffaf1 100%)",
      }}
    >
      <div className="profile-orb-slow pointer-events-none absolute -left-16 top-10 h-56 w-56 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="profile-orb-fast pointer-events-none absolute -right-16 bottom-10 h-56 w-56 rounded-full bg-amber-300/25 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.26)_1px,transparent_0)] [background-size:22px_22px]" />

      <div className="relative">
        <section className="profile-rise rounded-2xl border border-white/80 bg-white/78 p-4 shadow-[0_30px_62px_-46px_rgba(15,23,42,0.92)] backdrop-blur-xl sm:rounded-3xl sm:p-5 md:p-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-900 sm:px-3.5 sm:text-[11px] sm:tracking-[0.16em]">
            <span className="h-2 w-2 rounded-full bg-cyan-600 animate-pulse-soft" />
            Profile Studio
          </p>

          <div className="mt-4 grid gap-6 lg:grid-cols-[1.15fr,0.85fr]">
            <div className="min-w-0">
              <h2
                className="text-3xl font-bold leading-[0.95] text-slate-900 sm:text-4xl md:text-5xl"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Build a secure
                <span className="block bg-gradient-to-r from-cyan-700 via-blue-700 to-slate-900 bg-clip-text text-transparent">
                  standout profile.
                </span>
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
                Manage identity details, monitor account quality, and strengthen security from one premium workspace.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-cyan-200 bg-cyan-50/85 px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-cyan-800">Role</p>
                  <p className="mt-1 text-sm font-bold text-cyan-900">{roleMeta.label}</p>
                </div>
                <div className={`rounded-xl border px-3 py-3 ${accountStatus.card}`}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-slate-600">Status</p>
                  <p className={`mt-1 flex items-center gap-1.5 text-sm font-bold ${accountStatus.cardText}`}>
                    <span className={`h-2 w-2 rounded-full ${accountStatus.dot}`} />
                    {accountStatus.label}
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/85 px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-emerald-800">
                    Completion
                  </p>
                  <p className="mt-1 text-sm font-bold text-emerald-900">{profileCompletion}%</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/85 px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-slate-600">Account ID</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{accountId}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-[0_18px_35px_-28px_rgba(15,23,42,0.85)] sm:p-5">
              <div className="flex items-start gap-3 sm:items-center sm:gap-4">
                <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${roleMeta.chip} p-[2px] shadow-md sm:h-16 sm:w-16`}>
                  <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-white text-lg font-bold text-slate-900 sm:text-xl">
                    {initials}
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-lg font-bold text-slate-900 sm:text-xl">{user.name}</p>
                  <p className="truncate text-sm text-slate-600">{user.email}</p>
                  <span className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold ${accountStatus.tone}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${accountStatus.dot}`} />
                    {accountStatus.label}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex flex-col gap-1 rounded-lg border border-slate-200 bg-slate-50/85 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-slate-600">Member since</span>
                  <span className="font-semibold text-slate-800 sm:text-right">{memberSince}</span>
                </div>
                <div className="flex flex-col gap-1 rounded-lg border border-slate-200 bg-slate-50/85 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-slate-600">Role status</span>
                  <span className={`self-start rounded-full border px-2.5 py-1 text-xs font-bold sm:self-auto ${roleMeta.tone}`}>
                    {roleMeta.label}
                  </span>
                </div>
                <div className="flex flex-col gap-1 rounded-lg border border-slate-200 bg-slate-50/85 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-slate-600">Account status</span>
                  <span className={`inline-flex self-start items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold sm:self-auto ${accountStatus.tone}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${accountStatus.dot}`} />
                    {accountStatus.label}
                  </span>
                </div>
                <div className="flex flex-col gap-1 rounded-lg border border-slate-200 bg-slate-50/85 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-slate-600">Security checks</span>
                  <span className="font-semibold text-slate-800 sm:text-right">{completedChecks}/6</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-5 sm:mt-6 xl:grid-cols-[1.06fr,1.2fr]">
          <aside className="profile-rise-delay space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white/82 p-4 shadow-[0_24px_52px_-36px_rgba(15,23,42,0.85)] sm:rounded-3xl sm:p-5">
              <h3
                className="text-xl font-bold text-slate-900 sm:text-2xl"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Identity Snapshot
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Clean profile details improve trust and make your account easier to manage.
              </p>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <span>Profile Completion</span>
                  <span>{profileCompletion}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-700"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className={`rounded-xl border px-3 py-2.5 text-sm ${accountStatus.card} ${accountStatus.cardText}`}>
                  Current account status: <span className="font-semibold">{accountStatus.label}</span>. {accountStatus.hint}
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/90 px-3 py-2.5 text-sm text-slate-700">
                  Keep your profile name aligned with your certificate name.
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/90 px-3 py-2.5 text-sm text-slate-700">
                  Use a unique password and rotate it regularly.
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/90 px-3 py-2.5 text-sm text-slate-700">
                  Review profile security before sharing your account device.
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/82 p-4 shadow-[0_24px_52px_-36px_rgba(15,23,42,0.85)] sm:rounded-3xl sm:p-5">
              <h3
                className="text-xl font-bold text-slate-900 sm:text-2xl"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Security Gauge
              </h3>
              <p className="mt-2 text-sm text-slate-600">Your new password quality in real time.</p>

              <div className={`mt-4 rounded-2xl border p-4 ${strengthMeta.ring}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">Strength</span>
                  <span className={`text-sm font-bold ${strengthMeta.tone}`}>{strengthMeta.label}</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/80">
                  <div
                    className={`h-2 rounded-full bg-gradient-to-r transition-all duration-300 ${strengthMeta.bar}`}
                    style={{ width: `${Math.max(passwordScore, 6)}%` }}
                  />
                </div>
                <p className="mt-3 text-xs font-semibold text-slate-600">{passwordScore}% confidence level</p>
              </div>
            </div>
          </aside>

          <section className="profile-rise-delay-2 rounded-2xl border border-slate-200 bg-white/84 p-4 shadow-[0_24px_52px_-36px_rgba(15,23,42,0.85)] sm:rounded-3xl sm:p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3
                  className="text-xl font-bold text-slate-900 sm:text-2xl"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Password Control Center
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Update your account password with live checks and validation.
                </p>
              </div>

              <span className="rounded-full border border-amber-200 bg-amber-100 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-amber-900">
                Security
              </span>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-700">
                {success}
              </div>
            )}

            <form onSubmit={changePassword} className="mt-4 space-y-4">
              <div>
                <label htmlFor="currentPassword" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    id="currentPassword"
                    type={showOldPass ? "text" : "password"}
                    value={oldPass}
                    onChange={(event) => setOldPass(event.target.value)}
                    placeholder="Enter current password"
                    className="w-full rounded-xl border border-slate-300 bg-white/95 px-4 py-3 pr-20 text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    {showOldPass ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showNewPass ? "text" : "password"}
                    value={newPass}
                    onChange={(event) => setNewPass(event.target.value)}
                    placeholder="Create strong password"
                    className="w-full rounded-xl border border-slate-300 bg-white/95 px-4 py-3 pr-20 text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    {showNewPass ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPass ? "text" : "password"}
                    value={confirmPass}
                    onChange={(event) => setConfirmPass(event.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full rounded-xl border border-slate-300 bg-white/95 px-4 py-3 pr-20 text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    {showConfirmPass ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-3 sm:p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Live Security Checklist</p>
                <div className="mt-3 space-y-2">
                  {passwordChecks.map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-start gap-2 rounded-lg border px-2.5 py-2 text-sm ${
                        item.ok
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      <span
                        className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          item.ok ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {item.ok ? "Y" : "N"}
                      </span>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 py-3 font-semibold text-white shadow-[0_16px_28px_-16px_rgba(37,99,235,0.86)] transition hover:-translate-y-0.5 hover:from-cyan-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Updating..." : "Update Password"}
              </button>
            </form>
          </section>
        </section>
      </div>

      <style>{`
        @keyframes profileFloat {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -11px, 0);
          }
        }

        @keyframes profileRise {
          from {
            opacity: 0;
            transform: translate3d(0, 18px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        .profile-orb-slow {
          animation: profileFloat 10s ease-in-out infinite;
        }

        .profile-orb-fast {
          animation: profileFloat 8s ease-in-out infinite;
          animation-delay: -2s;
        }

        .profile-rise {
          animation: profileRise 0.55s ease both;
        }

        .profile-rise-delay {
          animation: profileRise 0.55s ease both;
          animation-delay: 0.12s;
        }

        .profile-rise-delay-2 {
          animation: profileRise 0.55s ease both;
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
}
