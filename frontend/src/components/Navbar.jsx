import { useContext, useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/axios";
import LiveLink from "./LiveLink";

const desktopLinkClass = ({ isActive }) =>
  `group inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-all duration-300 ${
    isActive
      ? "border-cyan-200 bg-white text-slate-900 shadow-[0_14px_28px_-20px_rgba(6,182,212,0.95)]"
      : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-white/85 hover:text-slate-900"
  }`;

const publicDesktopLinkClass = ({ isActive }) =>
  `group relative inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-300 ${
    isActive
      ? "bg-white text-slate-900 shadow-[0_14px_30px_-20px_rgba(15,23,42,0.95)]"
      : "text-slate-600 hover:bg-white/85 hover:text-slate-900"
  }`;

const studentDesktopLinkClass = ({ isActive }) =>
  `group relative inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-300 ${
    isActive
      ? "bg-white text-slate-900 shadow-[0_14px_30px_-20px_rgba(15,23,42,0.95)]"
      : "text-slate-600 hover:bg-white/85 hover:text-slate-900"
  }`;

const mobileLinkClass = ({ isActive }) =>
  `block rounded-xl border px-3 py-2 text-sm font-semibold transition ${
    isActive
      ? "border-sky-200 bg-sky-100/80 text-sky-900"
      : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900"
  }`;

const publicMobileLinkClass = ({ isActive }) =>
  `group flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all duration-300 ${
    isActive
      ? "border-cyan-200 bg-cyan-50/90 text-cyan-900"
      : "border-transparent bg-white/80 text-slate-700 hover:border-slate-200 hover:bg-white hover:text-slate-900"
  }`;

const studentMobileLinkClass = ({ isActive }) =>
  `group flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all duration-300 ${
    isActive
      ? "border-cyan-200 bg-cyan-50/90 text-cyan-900"
      : "border-transparent bg-white/80 text-slate-700 hover:border-slate-200 hover:bg-white hover:text-slate-900"
  }`;

const PUBLIC_NAV_ITEMS = [
  { id: "home", to: "/", label: "Home" },
  { id: "courses", to: "/courses", label: "Courses" },
];

const STUDENT_NAV_ITEMS = [
  { id: "courses", to: "/dashboard/courses", label: "My Courses", showNotifications: true },
  { id: "progress", to: "/dashboard/progress", label: "Progress" },
  { id: "certificates", to: "/dashboard/certificates", label: "Certificates" },
  { id: "profile", to: "/dashboard/profile", label: "Profile" },
];

function PublicNavIcon({ id, isActive }) {
  const className = `h-3.5 w-3.5 ${isActive ? "text-cyan-700" : "text-slate-500 group-hover:text-slate-700"}`;

  if (id === "courses") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M6 6v12m12-8H8m10 4H8m10 4H8" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 11.5L12 4l9 7.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 10.5V20h12v-9.5" />
    </svg>
  );
}

function StudentNavIcon({ id, isActive }) {
  const className = `h-3.5 w-3.5 ${isActive ? "text-cyan-700" : "text-slate-500 group-hover:text-slate-700"}`;

  if (id === "courses") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M7 6v12m10-8H9m8 4H9m8 4H9" />
      </svg>
    );
  }

  if (id === "progress") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 18l5-5 4 4 7-8" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 10V6h-4" />
      </svg>
    );
  }

  if (id === "certificates") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 4v6c0 4-3 7-7 8-4-1-7-4-7-8V7l7-4z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12.5l1.8 1.8 3.2-3.2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 21a8 8 0 10-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  );
}

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const BASE_API_URL = (
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV ? "http://localhost:5000/api" : "https://lms-mpjz.onrender.com/api")
  ).replace(/\/api\/?$/, "");

  const GOOGLE_AUTH_URL =
    import.meta.env.VITE_GOOGLE_AUTH_URL || `${BASE_API_URL}/api/auth/google`;

  const visibleNotificationCount = user?.role === "student" ? notificationCount : 0;
  const userInitial = (user?.name || "U").trim().charAt(0).toUpperCase();

  useEffect(() => {
    if (user?.role !== "student") return;

    let isMounted = true;

    api
      .get("/tasks/notifications")
      .then((res) => {
        if (!isMounted) return;
        setNotificationCount(res.data.count || 0);
      })
      .catch(() => {
        if (!isMounted) return;
        setNotificationCount(0);
      });

    return () => {
      isMounted = false;
    };
  }, [user?._id, user?.role]);

  const handleLogout = () => {
    if (logout) logout();
    navigate("/login");
    setIsOpen(false);
  };

  const handleGoogleLogin = (e) => {
    e.preventDefault();
    setIsOpen(false);

    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3");
    audio.play().catch(() => {});

    setTimeout(() => {
      window.location.href = GOOGLE_AUTH_URL;
    }, 1000);
  };

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 backdrop-blur-2xl"
        style={{
          fontFamily: "'Sora', sans-serif",
          background:
            "radial-gradient(circle at 10% 14%, rgba(45,212,191,0.2) 0%, transparent 36%), radial-gradient(circle at 86% 10%, rgba(59,130,246,0.2) 0%, transparent 34%), linear-gradient(122deg, rgba(255,255,255,0.92) 0%, rgba(240,249,255,0.9) 48%, rgba(238,242,255,0.95) 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[2px] animate-shimmer-track"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(14,165,233,0.85), rgba(45,212,191,0.72), rgba(99,102,241,0.78), rgba(14,165,233,0.85))",
          }}
        />
        <div className="pointer-events-none absolute -left-10 top-2 h-20 w-20 rounded-full bg-cyan-300/30 blur-2xl animate-drift-medium" />
        <div className="pointer-events-none absolute right-12 top-2 h-16 w-16 rounded-full bg-indigo-300/25 blur-2xl animate-drift-medium-delayed" />

        <nav className="mx-auto flex min-h-[76px] w-full max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <Link to="/" className="group inline-flex items-center gap-3">
            <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 shadow-[0_16px_28px_-12px_rgba(37,99,235,0.82)] transition-transform duration-300 group-hover:scale-105">
              <span className="absolute left-2 top-2 h-2.5 w-2.5 rounded bg-white/95" />
              <span className="absolute right-2 bottom-2 h-2.5 w-2.5 rounded bg-cyan-200/95" />
              <span className="h-4 w-4 rounded-sm border border-white/70 bg-white/25" />
            </span>
            <span className="flex flex-col leading-tight">
              <span
                className="text-3xl font-extrabold tracking-tight text-slate-900"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                LMS
              </span>
              <span className="hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 sm:inline">
                Learn Build Grow
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            {!user && (
              <div className="relative mr-1">
                <div className="pointer-events-none absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-cyan-300/75 via-sky-300/70 to-indigo-300/75" />
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.7)_0%,transparent_48%)]" />
                <div className="relative flex items-center gap-1 rounded-2xl border border-white/80 bg-white/78 p-1.5 shadow-[0_18px_34px_-22px_rgba(15,23,42,0.95)] backdrop-blur-xl">
                  {PUBLIC_NAV_ITEMS.map((item) => (
                    <NavLink
                      key={item.id}
                      to={item.to}
                      end={item.to === "/"}
                      className={publicDesktopLinkClass}
                    >
                      {({ isActive }) => (
                        <>
                          <span
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border transition ${
                              isActive
                                ? "border-cyan-200 bg-cyan-50 shadow-[0_10px_20px_-14px_rgba(8,145,178,0.9)]"
                                : "border-transparent bg-white/70 group-hover:border-slate-200 group-hover:bg-white"
                            }`}
                          >
                            <PublicNavIcon id={item.id} isActive={isActive} />
                          </span>
                          <span className="relative inline-flex items-center">
                            {item.label}
                            <span
                              className={`absolute -bottom-[4px] left-0 h-[2px] rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 transition-all duration-300 ${
                                isActive ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-full group-hover:opacity-90"
                              }`}
                            />
                          </span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            )}

            {user ? (
              <>
                {user.role === "student" ? (
                  <div className="relative mr-1">
                    <div className="pointer-events-none absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-cyan-300/75 via-sky-300/70 to-indigo-300/75" />
                    <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.7)_0%,transparent_48%)]" />
                    <div className="relative flex items-center gap-1 rounded-2xl border border-white/80 bg-white/78 p-1.5 shadow-[0_18px_34px_-22px_rgba(15,23,42,0.95)] backdrop-blur-xl">
                      {STUDENT_NAV_ITEMS.map((item) => (
                        <NavLink key={item.id} to={item.to} className={studentDesktopLinkClass}>
                          {({ isActive }) => (
                            <>
                              <span
                                className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border transition ${
                                  isActive
                                    ? "border-cyan-200 bg-cyan-50 shadow-[0_10px_20px_-14px_rgba(8,145,178,0.9)]"
                                    : "border-transparent bg-white/70 group-hover:border-slate-200 group-hover:bg-white"
                                }`}
                              >
                                <StudentNavIcon id={item.id} isActive={isActive} />
                              </span>
                              <span className="relative inline-flex items-center">
                                {item.label}
                                {item.showNotifications && visibleNotificationCount > 0 && (
                                  <span className="ml-2 inline-flex min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                    {visibleNotificationCount}
                                  </span>
                                )}
                                <span
                                  className={`absolute -bottom-[4px] left-0 h-[2px] rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 transition-all duration-300 ${
                                    isActive
                                      ? "w-full opacity-100"
                                      : "w-0 opacity-0 group-hover:w-full group-hover:opacity-90"
                                  }`}
                                />
                              </span>
                            </>
                          )}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                ) : (
                  <NavLink
                    to={user.role === "admin" ? "/dashboard/admin" : "/dashboard/teacher"}
                    className={desktopLinkClass}
                  >
                    Dashboard
                  </NavLink>
                )}

                <div className="ml-2 flex items-center gap-2 rounded-2xl border border-white/90 bg-white/82 p-1.5 shadow-[0_16px_34px_-24px_rgba(15,23,42,0.88)] backdrop-blur-xl">
                  <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/90 px-2.5 py-1.5">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-800 to-slate-600 text-xs font-bold text-white">
                      {userInitial}
                    </span>
                    <span className="max-w-[140px] truncate text-sm font-semibold text-slate-700">{user.name}</span>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="inline-flex shrink-0 items-center justify-center min-w-[108px] whitespace-nowrap rounded-xl border border-red-700 bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2 text-sm font-bold !text-white tracking-wide [text-shadow:0_1px_1px_rgba(0,0,0,0.35)] shadow-[0_16px_26px_-12px_rgba(220,38,38,0.92)] ring-1 ring-red-200 transition-all duration-300 hover:-translate-y-0.5 hover:from-red-700 hover:to-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="ml-2 flex items-center gap-2 rounded-2xl border border-white/90 bg-white/80 p-1.5 shadow-[0_16px_34px_-24px_rgba(15,23,42,0.88)] backdrop-blur-xl">
                <LiveLink
                  href="/login"
                  className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/88 px-3.5 py-2 text-sm font-semibold text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
                  message="Logging In..."
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-4 w-4 text-slate-500 transition group-hover:text-slate-700"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 16l4-4-4-4" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H9" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20H5V4h7" />
                  </svg>
                  <span>Login</span>
                </LiveLink>
                <LiveLink
                  href="/register"
                  className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-[0_14px_24px_-12px_rgba(37,99,235,0.85)] transition-all duration-300 hover:-translate-y-0.5 hover:from-sky-700 hover:to-indigo-700"
                  message="Creating Account..."
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                  </svg>
                  <span>Register</span>
                </LiveLink>
                <a
                  href={GOOGLE_AUTH_URL}
                  onClick={handleGoogleLogin}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/88 px-3.5 py-2 text-sm font-semibold text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-white shadow-[0_8px_16px_-12px_rgba(15,23,42,0.95)]">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-4.5 w-4.5" />
                  </span>
                  <span>Google</span>
                </a>
              </div>
            )}
          </div>

          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-700 transition-all duration-300 hover:bg-white md:hidden"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </nav>

        {isOpen && (
          <div
            className="border-t border-slate-200/80 px-4 pb-4 pt-3 backdrop-blur-xl md:hidden"
            style={{
              background:
                "radial-gradient(circle at 12% 0%, rgba(186,230,253,0.45) 0%, transparent 36%), linear-gradient(150deg, rgba(255,255,255,0.96) 0%, rgba(241,245,249,0.94) 100%)",
            }}
          >
            <div className="space-y-2">
              {!user &&
                PUBLIC_NAV_ITEMS.map((item) => (
                  <NavLink
                    key={`public-mobile-${item.id}`}
                    to={item.to}
                    end={item.to === "/"}
                    className={publicMobileLinkClass}
                    onClick={() => setIsOpen(false)}
                  >
                    {({ isActive }) => (
                      <>
                        <span className="inline-flex items-center gap-2">
                          <span
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border transition ${
                              isActive
                                ? "border-cyan-200 bg-cyan-100"
                                : "border-slate-200 bg-slate-50 group-hover:border-slate-300 group-hover:bg-white"
                            }`}
                          >
                            <PublicNavIcon id={item.id} isActive={isActive} />
                          </span>
                          <span>{item.label}</span>
                        </span>
                        <span className="text-slate-400">+</span>
                      </>
                    )}
                  </NavLink>
                ))}

              {user ? (
                <>
                  {user.role === "student" ? (
                    <>
                      {STUDENT_NAV_ITEMS.map((item) => (
                        <NavLink
                          key={`mobile-${item.id}`}
                          to={item.to}
                          className={studentMobileLinkClass}
                          onClick={() => setIsOpen(false)}
                        >
                          {({ isActive }) => (
                            <>
                              <span className="inline-flex items-center gap-2">
                                <span
                                  className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border transition ${
                                    isActive
                                      ? "border-cyan-200 bg-cyan-100"
                                      : "border-slate-200 bg-slate-50 group-hover:border-slate-300 group-hover:bg-white"
                                  }`}
                                >
                                  <StudentNavIcon id={item.id} isActive={isActive} />
                                </span>
                                <span>{item.label}</span>
                              </span>
                              {item.showNotifications && visibleNotificationCount > 0 ? (
                                <span className="inline-flex min-w-[22px] items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                  {visibleNotificationCount}
                                </span>
                              ) : (
                                <span className="text-slate-400">+</span>
                              )}
                            </>
                          )}
                        </NavLink>
                      ))}
                    </>
                  ) : (
                    <NavLink
                      to={user.role === "admin" ? "/dashboard/admin" : "/dashboard/teacher"}
                      className={mobileLinkClass}
                      onClick={() => setIsOpen(false)}
                    >
                      Dashboard
                    </NavLink>
                  )}

                  <div className="mt-3 rounded-2xl border border-slate-200 bg-white/92 p-3 shadow-[0_18px_28px_-24px_rgba(15,23,42,0.95)]">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-800 to-slate-600 text-xs font-bold text-white">
                        {userInitial}
                      </span>
                      <p className="text-sm font-semibold text-slate-700">{user.name}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="mt-2 inline-flex w-full shrink-0 items-center justify-center min-w-[108px] whitespace-nowrap rounded-xl border border-red-700 bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2 text-sm font-bold !text-white tracking-wide [text-shadow:0_1px_1px_rgba(0,0,0,0.35)] shadow-[0_16px_26px_-12px_rgba(220,38,38,0.92)] ring-1 ring-red-200 transition-all duration-300 hover:from-red-700 hover:to-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="mt-3 grid gap-2 rounded-2xl border border-slate-200 bg-white/92 p-3 shadow-[0_18px_28px_-24px_rgba(15,23,42,0.95)]">
                  <LiveLink
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-center text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-slate-300 hover:bg-slate-50"
                    onClick={() => setIsOpen(false)}
                    message="Logging In..."
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-4 w-4 text-slate-500"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 16l4-4-4-4" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H9" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20H5V4h7" />
                    </svg>
                    <span>Login</span>
                  </LiveLink>
                  <LiveLink
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white transition-all duration-300 hover:from-sky-700 hover:to-indigo-700"
                    onClick={() => setIsOpen(false)}
                    message="Creating Account..."
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                    </svg>
                    <span>Register</span>
                  </LiveLink>
                  <a
                    href={GOOGLE_AUTH_URL}
                    onClick={handleGoogleLogin}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-slate-300 hover:bg-slate-50"
                  >
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-white shadow-[0_8px_16px_-12px_rgba(15,23,42,0.95)]">
                      <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-4.5 w-4.5" />
                    </span>
                    <span>Google</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <div aria-hidden className="h-[84px] md:h-[88px]" />
    </>
  );
}
