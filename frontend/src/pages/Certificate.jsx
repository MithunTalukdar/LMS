import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/axios";

const CARD_THEMES = [
  {
    accent: "from-cyan-500 via-sky-500 to-blue-600",
    glow: "bg-cyan-400/30",
    badge: "border-cyan-200 bg-cyan-50 text-cyan-800",
    button: "from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700",
  },
  {
    accent: "from-amber-500 via-orange-500 to-red-500",
    glow: "bg-amber-300/35",
    badge: "border-amber-200 bg-amber-50 text-amber-800",
    button: "from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700",
  },
  {
    accent: "from-emerald-500 via-teal-500 to-cyan-600",
    glow: "bg-emerald-300/35",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
    button: "from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700",
  },
];

const DATE_FILTERS = [
  { key: "all", label: "All Time" },
  { key: "this_year", label: "This Year" },
  { key: "last_year", label: "Last Year" },
  { key: "older", label: "Older" },
];

const RADAR_RADIUS = 44;
const RADAR_CIRCUMFERENCE = 2 * Math.PI * RADAR_RADIUS;

const formatIssuedDate = (value, customOptions = {}) => {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...customOptions,
  });
};

const getSafeDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getYear = (value) => {
  const date = getSafeDate(value);
  return date ? date.getFullYear() : null;
};

const getMonthKey = (value) => {
  const date = getSafeDate(value);
  if (!date) return null;
  return `${date.getFullYear()}-${date.getMonth()}`;
};

const getBadgeYear = (value) => {
  const year = getYear(value);
  return year ? `${year}` : "Unknown Year";
};

const getCertificateId = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "N/A";
  return raw.slice(-8).toUpperCase();
};

const buildDownloadUrl = (baseUrl, certId) => {
  const safeBase = String(baseUrl || "").replace(/\/+$/, "");
  return `${safeBase}/certificates/download/${certId}`;
};

export default function Certificate() {
  const { user } = useContext(AuthContext);
  const [certs, setCerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDateFilter, setActiveDateFilter] = useState("all");

  useEffect(() => {
    let isMounted = true;

    const loadCertificates = async () => {
      if (!user?._id) {
        if (isMounted) {
          setCerts([]);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const res = await api.get("/certificates");
        if (isMounted) {
          setCerts(Array.isArray(res.data) ? res.data : []);
        }
      } catch {
        if (isMounted) {
          setError("Unable to load certificates right now.");
          setCerts([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadCertificates();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const sortedCerts = useMemo(() => {
    return [...certs].sort((a, b) => {
      const dateA = getSafeDate(a.issuedAt)?.getTime() || 0;
      const dateB = getSafeDate(b.issuedAt)?.getTime() || 0;
      return dateB - dateA;
    });
  }, [certs]);

  const filteredCerts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const currentYear = new Date().getFullYear();

    return sortedCerts.filter((cert) => {
      const courseTitle = String(cert.courseId?.title || "Course Certificate");
      const certId = getCertificateId(cert._id);
      const certYear = getYear(cert.issuedAt);

      const matchesSearch =
        query.length === 0 ||
        courseTitle.toLowerCase().includes(query) ||
        certId.toLowerCase().includes(query);

      const matchesDate =
        activeDateFilter === "all" ||
        (activeDateFilter === "this_year" && certYear === currentYear) ||
        (activeDateFilter === "last_year" && certYear === currentYear - 1) ||
        (activeDateFilter === "older" && certYear !== null && certYear <= currentYear - 2);

      return matchesSearch && matchesDate;
    });
  }, [sortedCerts, searchQuery, activeDateFilter]);

  const analytics = useMemo(() => {
    const total = certs.length;
    const uniqueCourses = new Set(
      certs.map((cert) => cert.courseId?._id || cert.courseId?.title || cert._id)
    ).size;

    const currentYear = new Date().getFullYear();
    const thisYear = certs.filter((cert) => getYear(cert.issuedAt) === currentYear).length;
    const lastYear = certs.filter((cert) => getYear(cert.issuedAt) === currentYear - 1).length;
    const latestDate = sortedCerts[0]?.issuedAt || null;
    const activeMonthsThisYear = new Set(
      certs
        .filter((cert) => getYear(cert.issuedAt) === currentYear)
        .map((cert) => getMonthKey(cert.issuedAt))
        .filter(Boolean)
    ).size;
    const momentum = Math.min(100, Math.round(total * 13 + thisYear * 7));

    return {
      total,
      uniqueCourses,
      thisYear,
      lastYear,
      latestDate,
      activeMonthsThisYear,
      momentum,
    };
  }, [certs, sortedCerts]);

  const topCourses = useMemo(() => {
    const counts = new Map();

    certs.forEach((cert) => {
      const title = String(cert.courseId?.title || "Course Certificate");
      counts.set(title, (counts.get(title) || 0) + 1);
    });

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([title, count]) => ({ title, count }));
  }, [certs]);

  const recentCerts = useMemo(() => sortedCerts.slice(0, 4), [sortedCerts]);

  const ownerName = user?.name || "Student";
  const downloadBase = api.defaults.baseURL || "";
  const radarOffset = RADAR_CIRCUMFERENCE - (RADAR_CIRCUMFERENCE * analytics.momentum) / 100;

  const spotlightLabel =
    analytics.total >= 10
      ? "Mastery unlocked with consistent excellence"
      : analytics.total >= 5
        ? "Strong learning momentum is building"
        : analytics.total > 0
          ? "Great start, keep stacking achievements"
          : "Complete courses to unlock your first certificate";

  return (
    <div
      className="relative isolate overflow-hidden rounded-[2.2rem] border border-slate-200/85 p-4 md:p-7"
      style={{
        fontFamily: "'Manrope', sans-serif",
        background:
          "radial-gradient(circle at 9% 12%, rgba(45,212,191,0.42) 0%, transparent 35%), radial-gradient(circle at 92% 8%, rgba(251,191,36,0.34) 0%, transparent 32%), radial-gradient(circle at 84% 88%, rgba(56,189,248,0.24) 0%, transparent 34%), linear-gradient(145deg, #f4fffb 0%, #f3f7ff 52%, #fffaf2 100%)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.24)_1px,transparent_0)] [background-size:22px_22px]" />
      <div className="cert-float-slow pointer-events-none absolute -left-20 top-10 h-56 w-56 rounded-full bg-teal-300/30 blur-3xl" />
      <div className="cert-float-fast pointer-events-none absolute -right-16 bottom-8 h-56 w-56 rounded-full bg-amber-300/25 blur-3xl" />

      <div className="relative">
        <section className="grid gap-5 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="cert-rise rounded-3xl border border-white/85 bg-white/78 p-5 shadow-[0_30px_65px_-45px_rgba(15,23,42,0.9)] backdrop-blur-xl md:p-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-100 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-teal-900">
              <span className="h-2 w-2 rounded-full bg-teal-600 animate-pulse" />
              Certificates Command Center
            </p>

            <h2
              className="mt-4 text-4xl font-bold leading-[0.95] text-slate-900 md:text-5xl"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Showcase your
              <span className="block bg-gradient-to-r from-teal-700 via-cyan-700 to-slate-900 bg-clip-text text-transparent">
                verified achievements.
              </span>
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
              A premium certificate wall for your learning journey. Search instantly, filter by year, and download
              every credential in one place.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/dashboard/progress"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_28px_-20px_rgba(13,148,136,0.95)] transition hover:-translate-y-0.5"
              >
                Track Progress
              </Link>
              <Link
                to="/dashboard/courses"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
              >
                Explore Courses
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-teal-200 bg-teal-50/80 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-teal-800">Total</p>
                <p className="mt-1 text-2xl font-bold text-teal-900">{analytics.total}</p>
              </div>
              <div className="rounded-xl border border-cyan-200 bg-cyan-50/80 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-800">Courses</p>
                <p className="mt-1 text-2xl font-bold text-cyan-900">{analytics.uniqueCourses}</p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-800">This Year</p>
                <p className="mt-1 text-2xl font-bold text-emerald-900">{analytics.thisYear}</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50/85 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-800">Last Year</p>
                <p className="mt-1 text-2xl font-bold text-amber-900">{analytics.lastYear}</p>
              </div>
            </div>
          </div>

          <div className="cert-rise-delay rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-[0_24px_55px_-40px_rgba(15,23,42,0.95)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Achievement Radar</p>
            <h3
              className="mt-2 text-2xl font-bold text-slate-900"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {spotlightLabel}
            </h3>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="relative h-28 w-28 shrink-0">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 112 112" aria-hidden="true">
                  <circle cx="56" cy="56" r={RADAR_RADIUS} fill="none" stroke="#e2e8f0" strokeWidth="10" />
                  <circle
                    cx="56"
                    cy="56"
                    r={RADAR_RADIUS}
                    fill="none"
                    stroke="#0f766e"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={RADAR_CIRCUMFERENCE}
                    strokeDashoffset={radarOffset}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-slate-900">{analytics.momentum}%</span>
                </div>
              </div>

              <div className="space-y-2 text-sm text-slate-600">
                <p>
                  Latest certificate:{" "}
                  <span className="font-semibold text-slate-800">{formatIssuedDate(analytics.latestDate)}</span>
                </p>
                <p>
                  Active months this year:{" "}
                  <span className="font-semibold text-slate-800">{analytics.activeMonthsThisYear}</span>
                </p>
                <p>
                  Owner: <span className="font-semibold text-slate-800">{ownerName}</span>
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-700">
                Keep your top certificates in your profile portfolio.
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-700">
                Share recent credentials in interviews and LinkedIn updates.
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-5 xl:grid-cols-[1fr,320px]">
          <div className="rounded-3xl border border-white/80 bg-white/78 p-4 shadow-[0_28px_62px_-44px_rgba(15,23,42,0.95)] backdrop-blur-xl md:p-5">
            <div className="grid gap-3 lg:grid-cols-[1fr,auto]">
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
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search by course title or certificate ID..."
                  className="w-full rounded-xl border border-slate-200 bg-white/95 py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-200"
                />
              </label>

              <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-sm font-semibold text-slate-700">
                {filteredCerts.length} visible
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {DATE_FILTERS.map((filter) => {
                const isActive = activeDateFilter === filter.key;
                return (
                  <button
                    key={filter.key}
                    onClick={() => setActiveDateFilter(filter.key)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition ${
                      isActive
                        ? "border-teal-500 bg-teal-500 text-white shadow-[0_12px_24px_-18px_rgba(13,148,136,0.9)]"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}

              {(searchQuery || activeDateFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveDateFilter("all");
                  }}
                  className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-rose-700 transition hover:bg-rose-100"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="mt-5">
              {isLoading && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
                  Loading your certificates...
                </div>
              )}

              {!isLoading && error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
                  {error}
                </div>
              )}

              {!isLoading && !error && certs.length === 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900">No Certificates Yet</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Complete your course tasks and quizzes to unlock verified certificates.
                  </p>
                  <Link
                    to="/dashboard/progress"
                    className="mt-4 inline-flex rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
                  >
                    Check My Progress
                  </Link>
                </div>
              )}

              {!isLoading && !error && certs.length > 0 && filteredCerts.length === 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900">No matching certificates</h3>
                  <p className="mt-2 text-sm text-slate-600">Try a different search or date filter.</p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setActiveDateFilter("all");
                    }}
                    className="mt-4 inline-flex rounded-lg border border-teal-500 bg-teal-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-600"
                  >
                    Reset Filters
                  </button>
                </div>
              )}

              {!isLoading && !error && filteredCerts.length > 0 && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {filteredCerts.map((cert, index) => {
                    const theme = CARD_THEMES[index % CARD_THEMES.length];
                    const courseTitle = cert.courseId?.title || "Course Certificate";
                    const certId = getCertificateId(cert._id);
                    const issuedDate = formatIssuedDate(cert.issuedAt);
                    const issuedYear = getBadgeYear(cert.issuedAt);
                    const downloadUrl = buildDownloadUrl(downloadBase, cert._id);

                    return (
                      <article
                        key={cert._id}
                        className="cert-card group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.6)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_50px_-34px_rgba(15,23,42,0.55)]"
                        style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
                      >
                        <div className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${theme.accent}`} />
                        <div
                          className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl transition group-hover:scale-110 ${theme.glow}`}
                        />

                        <div className="relative">
                          <div className="flex items-start justify-between gap-3">
                            <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${theme.badge}`}>
                              Verified
                            </span>
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                              {issuedYear}
                            </span>
                          </div>

                          <h3
                            className="mt-4 text-2xl font-bold tracking-tight text-slate-900"
                            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                          >
                            {courseTitle}
                          </h3>
                          <p className="mt-2 text-sm text-slate-600">
                            Awarded to <span className="font-semibold text-slate-900">{ownerName}</span>
                          </p>

                          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                            <div className="rounded-lg border border-slate-200 bg-slate-50/90 px-2.5 py-2">
                              <p className="font-semibold uppercase tracking-wide text-slate-500">ID</p>
                              <p className="mt-1 font-semibold text-slate-800">{certId}</p>
                            </div>
                            <div className="rounded-lg border border-slate-200 bg-slate-50/90 px-2.5 py-2">
                              <p className="font-semibold uppercase tracking-wide text-slate-500">Issued</p>
                              <p className="mt-1 font-semibold text-slate-800">{issuedDate}</p>
                            </div>
                          </div>

                          <a
                            href={downloadUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 ${theme.button}`}
                          >
                            <span>Download Certificate</span>
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              className="h-4 w-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 4v10m0 0l4-4m-4 4l-4-4M5 20h14"
                              />
                            </svg>
                          </a>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white/88 p-4 shadow-[0_22px_48px_-36px_rgba(15,23,42,0.7)]">
              <h3
                className="text-xl font-bold text-slate-900"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Recent Certificates
              </h3>
              <p className="mt-1 text-sm text-slate-600">Your latest verified wins.</p>

              {recentCerts.length === 0 ? (
                <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
                  No recent certificates yet.
                </p>
              ) : (
                <ol className="mt-4 space-y-3">
                  {recentCerts.map((cert) => (
                    <li
                      key={`recent-${cert._id}`}
                      className="rounded-xl border border-slate-200 bg-slate-50/85 px-3 py-2.5"
                    >
                      <p className="text-sm font-semibold text-slate-800">
                        {cert.courseId?.title || "Course Certificate"}
                      </p>
                      <p className="mt-1 text-xs text-slate-600">{formatIssuedDate(cert.issuedAt)}</p>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/88 p-4 shadow-[0_22px_48px_-36px_rgba(15,23,42,0.7)]">
              <h3
                className="text-xl font-bold text-slate-900"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Top Learning Areas
              </h3>
              <p className="mt-1 text-sm text-slate-600">Courses where you collect the most credentials.</p>

              {topCourses.length === 0 ? (
                <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
                  Your ranking appears here after earning certificates.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {topCourses.map((course) => (
                    <div key={course.title} className="rounded-xl border border-slate-200 bg-slate-50/85 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-800">{course.title}</p>
                        <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-800">
                          {course.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </section>
      </div>

      <style>{`
        @keyframes certFloat {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -10px, 0);
          }
        }

        @keyframes certRise {
          from {
            opacity: 0;
            transform: translate3d(0, 18px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes certCardReveal {
          from {
            opacity: 0;
            transform: translate3d(0, 14px, 0) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        .cert-float-slow {
          animation: certFloat 11s ease-in-out infinite;
        }

        .cert-float-fast {
          animation: certFloat 8s ease-in-out infinite;
          animation-delay: -2s;
        }

        .cert-rise {
          animation: certRise 0.55s ease both;
        }

        .cert-rise-delay {
          animation: certRise 0.55s ease both;
          animation-delay: 0.14s;
        }

        .cert-card {
          animation: certCardReveal 0.45s ease both;
        }
      `}</style>
    </div>
  );
}
