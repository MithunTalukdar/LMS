import { useContext, useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/axios";
import LiveLink from "./LiveLink";

const desktopLinkClass = ({ isActive }) =>
  `rounded-xl border px-3 py-1.5 text-sm font-semibold transition ${
    isActive
      ? "border-sky-200 bg-sky-100/80 text-sky-900"
      : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-white/80 hover:text-slate-900"
  }`;

const mobileLinkClass = ({ isActive }) =>
  `block rounded-xl border px-3 py-2 text-sm font-semibold transition ${
    isActive
      ? "border-sky-200 bg-sky-100/80 text-sky-900"
      : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900"
  }`;

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

  useEffect(() => {
    if (user?.role === "student") {
      api
        .get("/tasks/notifications")
        .then((res) => setNotificationCount(res.data.count))
        .catch(() => setNotificationCount(0));
      return;
    }

    setNotificationCount(0);
  }, [user]);

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
        className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 backdrop-blur-xl"
        style={{
          background:
            "linear-gradient(120deg, rgba(255,255,255,0.92) 0%, rgba(240,249,255,0.9) 45%, rgba(238,242,255,0.92) 100%)",
        }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500" />
        <div className="pointer-events-none absolute -left-8 top-2 h-20 w-20 rounded-full bg-cyan-300/30 blur-2xl" />
        <div className="pointer-events-none absolute right-14 top-2 h-16 w-16 rounded-full bg-indigo-300/25 blur-2xl" />

        <nav className="mx-auto flex min-h-[76px] w-full max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <Link to="/" className="group inline-flex items-center gap-3">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 shadow-[0_14px_24px_-12px_rgba(37,99,235,0.75)]">
              <span className="absolute left-2 top-2 h-2.5 w-2.5 rounded bg-white/95" />
              <span className="absolute right-2 bottom-2 h-2.5 w-2.5 rounded bg-cyan-200/95" />
              <span className="h-4 w-4 rounded-sm border border-white/70 bg-white/20" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">LMS</span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Learn Build Grow
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            <NavLink to="/" end className={desktopLinkClass}>
              Home
            </NavLink>
            {!user && (
              <NavLink to="/courses" className={desktopLinkClass}>
                Courses
              </NavLink>
            )}

            {user ? (
              <>
                {user.role === "student" ? (
                  <>
                    <NavLink to="/dashboard/courses" className={desktopLinkClass}>
                      <span className="relative inline-flex items-center">
                        My Courses
                        {notificationCount > 0 && (
                          <span className="ml-2 inline-flex min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                            {notificationCount}
                          </span>
                        )}
                      </span>
                    </NavLink>
                    <NavLink to="/dashboard/progress" className={desktopLinkClass}>
                      Progress
                    </NavLink>
                    <NavLink to="/dashboard/certificates" className={desktopLinkClass}>
                      Certificates
                    </NavLink>
                    <NavLink to="/dashboard/profile" className={desktopLinkClass}>
                      Profile
                    </NavLink>
                  </>
                ) : (
                  <NavLink
                    to={user.role === "admin" ? "/dashboard/admin" : "/dashboard/teacher"}
                    className={desktopLinkClass}
                  >
                    Dashboard
                  </NavLink>
                )}

                <div className="ml-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 p-1.5 shadow-sm">
                  <span className="rounded-xl bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                    {user.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="rounded-xl border border-red-700 bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_20px_-12px_rgba(220,38,38,0.85)] transition hover:-translate-y-0.5 hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="ml-2 flex items-center gap-2">
                <LiveLink
                  href="/login"
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
                  message="Logging In..."
                >
                  Login
                </LiveLink>
                <LiveLink
                  href="/register"
                  className="rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_22px_-12px_rgba(37,99,235,0.85)] transition hover:-translate-y-0.5 hover:from-sky-700 hover:to-indigo-700"
                  message="Creating Account..."
                >
                  Register
                </LiveLink>
                <a
                  href={GOOGLE_AUTH_URL}
                  onClick={handleGoogleLogin}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/85 px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
                  <span>Google</span>
                </a>
              </div>
            )}
          </div>

          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-700 transition hover:bg-white md:hidden"
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
          <div className="border-t border-slate-200/80 bg-white/90 px-4 pb-4 pt-3 backdrop-blur-xl md:hidden">
            <div className="space-y-2">
              <NavLink to="/" end className={mobileLinkClass} onClick={() => setIsOpen(false)}>
                Home
              </NavLink>
              {!user && (
                <NavLink to="/courses" className={mobileLinkClass} onClick={() => setIsOpen(false)}>
                  Courses
                </NavLink>
              )}

              {user ? (
                <>
                  {user.role === "student" ? (
                    <>
                      <NavLink to="/dashboard/courses" className={mobileLinkClass} onClick={() => setIsOpen(false)}>
                        <span className="inline-flex items-center">
                          My Courses
                          {notificationCount > 0 && (
                            <span className="ml-2 inline-flex min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                              {notificationCount}
                            </span>
                          )}
                        </span>
                      </NavLink>
                      <NavLink to="/dashboard/progress" className={mobileLinkClass} onClick={() => setIsOpen(false)}>
                        Progress
                      </NavLink>
                      <NavLink
                        to="/dashboard/certificates"
                        className={mobileLinkClass}
                        onClick={() => setIsOpen(false)}
                      >
                        Certificates
                      </NavLink>
                      <NavLink to="/dashboard/profile" className={mobileLinkClass} onClick={() => setIsOpen(false)}>
                        Profile
                      </NavLink>
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

                  <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                    <p className="text-sm font-semibold text-slate-700">{user.name}</p>
                    <button
                      onClick={handleLogout}
                      className="mt-2 w-full rounded-xl border border-red-700 bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="mt-3 grid gap-2">
                  <LiveLink
                    href="/login"
                    className="block rounded-xl border border-slate-200 bg-white px-4 py-2 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    onClick={() => setIsOpen(false)}
                    message="Logging In..."
                  >
                    Login
                  </LiveLink>
                  <LiveLink
                    href="/register"
                    className="block rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white transition hover:from-sky-700 hover:to-indigo-700"
                    onClick={() => setIsOpen(false)}
                    message="Creating Account..."
                  >
                    Register
                  </LiveLink>
                  <a
                    href={GOOGLE_AUTH_URL}
                    onClick={handleGoogleLogin}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
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
