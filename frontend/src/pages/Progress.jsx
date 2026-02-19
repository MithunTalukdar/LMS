import api from "../utils/axios";
import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

const CARD_THEMES = [
  {
    border: "#22d3ee",
    bar: "linear-gradient(90deg,#06b6d4,#2563eb)",
    glow: "rgba(34,211,238,0.28)",
    badgeBg: "bg-cyan-100",
    badgeText: "text-cyan-900",
  },
  {
    border: "#a78bfa",
    bar: "linear-gradient(90deg,#6366f1,#8b5cf6)",
    glow: "rgba(167,139,250,0.28)",
    badgeBg: "bg-violet-100",
    badgeText: "text-violet-900",
  },
  {
    border: "#34d399",
    bar: "linear-gradient(90deg,#10b981,#059669)",
    glow: "rgba(52,211,153,0.28)",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-900",
  },
  {
    border: "#fb923c",
    bar: "linear-gradient(90deg,#f59e0b,#ea580c)",
    glow: "rgba(251,146,60,0.28)",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-900",
  },
];

const STATUS_FILTERS = [
  { key: "all", label: "All Courses" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "starting", label: "Starting" },
];

const toPercent = (value) => {
  const parsed = Number(value || 0);
  if (!Number.isFinite(parsed)) return 0;
  if (parsed < 0) return 0;
  if (parsed > 100) return 100;
  return Math.round(parsed);
};

const getProgressStatus = (percent) => {
  if (percent >= 100) {
    return {
      key: "completed",
      label: "Completed",
      className: "bg-emerald-100 text-emerald-800 border-emerald-200",
    };
  }

  if (percent === 0) {
    return {
      key: "starting",
      label: "Starting",
      className: "bg-amber-100 text-amber-800 border-amber-200",
    };
  }

  return {
    key: "in_progress",
    label: "In Progress",
    className: "bg-sky-100 text-sky-800 border-sky-200",
  };
};

const getNextMilestone = (percent) => {
  if (percent >= 100) return "All milestones complete.";
  if (percent >= 75) return "Final sprint to 100%.";
  if (percent >= 50) return "Reach the 75% mastery zone.";
  if (percent >= 25) return "Push to 50% to unlock mid-point momentum.";
  return "Cross 25% to build early momentum.";
};

export default function Progress() {
  const { user } = useContext(AuthContext);
  const [progress, setProgress] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");

  useEffect(() => {
    let isMounted = true;

    const loadProgress = async () => {
      if (!user?._id) {
        if (isMounted) {
          setProgress([]);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const res = await api.get(`/progress/user/${user._id}`);
        if (isMounted) {
          setProgress(Array.isArray(res.data) ? res.data : []);
        }
      } catch {
        if (isMounted) {
          setError("Unable to load progress right now.");
          setProgress([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProgress();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const orderedProgress = useMemo(() => {
    return [...progress].sort((a, b) => toPercent(b.percent) - toPercent(a.percent));
  }, [progress]);

  const filteredProgress = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return orderedProgress.filter((item) => {
      const courseTitle = String(item.courseId?.title || "Unknown Course");
      const percent = toPercent(item.percent);
      const status = getProgressStatus(percent);
      const matchesSearch = query.length === 0 || courseTitle.toLowerCase().includes(query);
      const matchesStatus = activeStatus === "all" || activeStatus === status.key;

      return matchesSearch && matchesStatus;
    });
  }, [orderedProgress, searchQuery, activeStatus]);

  const analytics = useMemo(() => {
    const coursesCount = progress.length;
    const totalPercent = progress.reduce((sum, item) => sum + toPercent(item.percent), 0);
    const avgPercent = coursesCount ? Math.round(totalPercent / coursesCount) : 0;
    const completedCourses = progress.filter((item) => toPercent(item.percent) === 100).length;
    const activeCourses = progress.filter((item) => {
      const value = toPercent(item.percent);
      return value > 0 && value < 100;
    }).length;
    const startingCourses = progress.filter((item) => toPercent(item.percent) === 0).length;
    const totalTasks = progress.reduce((sum, item) => sum + Number(item.totalTasks || 0), 0);
    const completedTasks = progress.reduce((sum, item) => sum + Number(item.completedTasks || 0), 0);

    const momentumLabel =
      avgPercent >= 85
        ? "Peak performance"
        : avgPercent >= 60
          ? "Strong momentum"
          : avgPercent >= 35
            ? "Steady building"
            : "Warm-up stage";

    const topCourse = orderedProgress[0]?.courseId?.title || "No course yet";

    return {
      coursesCount,
      avgPercent,
      completedCourses,
      activeCourses,
      startingCourses,
      totalTasks,
      completedTasks,
      momentumLabel,
      topCourse,
    };
  }, [progress, orderedProgress]);

  const ringStyle = {
    background: `conic-gradient(#0ea5e9 ${analytics.avgPercent * 3.6}deg, rgba(148,163,184,0.2) 0deg)`,
  };

  return (
    <div
      className="relative isolate overflow-hidden rounded-[2rem] border border-slate-200/80 p-5 md:p-7"
      style={{
        fontFamily: "'Manrope', sans-serif",
        background:
          "radial-gradient(circle at 8% 10%, rgba(125,211,252,0.68) 0%, transparent 28%), radial-gradient(circle at 90% 14%, rgba(167,139,250,0.42) 0%, transparent 32%), radial-gradient(circle at 70% 84%, rgba(110,231,183,0.35) 0%, transparent 32%), linear-gradient(145deg,#f7fbff 0%,#eef6ff 52%,#f8fffb 100%)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.35)_1px,transparent_0)] [background-size:24px_24px]" />
      <div className="pointer-events-none absolute -left-16 top-10 h-52 w-52 rounded-full bg-cyan-300/35 blur-3xl animate-drift-large" />
      <div className="pointer-events-none absolute -right-10 top-24 h-56 w-56 rounded-full bg-indigo-300/25 blur-3xl animate-drift-medium" />

      <div className="relative">
        <section className="grid gap-5 rounded-3xl border border-white/75 bg-white/75 p-5 shadow-[0_28px_60px_-40px_rgba(15,23,42,0.9)] backdrop-blur-xl lg:grid-cols-[1.2fr,0.8fr]">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-100/90 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-900">
              <span className="inline-block h-2 w-2 rounded-full bg-sky-600 animate-pulse-soft" />
              Learning Performance Deck
            </p>

            <h2
              className="mt-4 text-4xl font-bold leading-[0.96] text-slate-900 md:text-5xl"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Progress Engine
              <span className="block bg-gradient-to-r from-cyan-700 via-sky-700 to-indigo-800 bg-clip-text text-transparent">
                built for measurable growth.
              </span>
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
              Track completion, milestones, and certification readiness with a smarter progress layout made for fast decisions.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
              <div className="rounded-xl border border-cyan-200 bg-cyan-50/80 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-800">Completion</p>
                <p className="mt-1 text-2xl font-bold text-cyan-900">{analytics.avgPercent}%</p>
              </div>
              <div className="rounded-xl border border-violet-200 bg-violet-50/80 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-violet-800">Courses</p>
                <p className="mt-1 text-2xl font-bold text-violet-900">{analytics.coursesCount}</p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-800">Active</p>
                <p className="mt-1 text-2xl font-bold text-emerald-900">{analytics.activeCourses}</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-800">Completed</p>
                <p className="mt-1 text-2xl font-bold text-amber-900">{analytics.completedCourses}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700">Tasks Done</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {analytics.completedTasks}/{analytics.totalTasks}
                </p>
              </div>
            </div>
          </div>

          <div className="animate-fade-up-delayed rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-[0_20px_40px_-32px_rgba(15,23,42,0.95)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Momentum Monitor</p>
            <div className="mt-3 flex items-center gap-4">
              <div className="relative h-24 w-24 rounded-full p-[7px]" style={ringStyle}>
                <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-center shadow-inner">
                  <div>
                    <p className="text-xl font-extrabold text-slate-900">{analytics.avgPercent}%</p>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Avg</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">{analytics.momentumLabel}</p>
                <p className="mt-1 text-xs text-slate-600">
                  Top course: <span className="font-semibold text-slate-800">{analytics.topCourse}</span>
                </p>
                <p className="mt-2 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-700 inline-block">
                  {analytics.startingCourses} starting soon
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Recommendation</p>
              <p className="mt-1 text-sm text-slate-700">
                Focus on one in-progress course this week to increase certificate readiness faster.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-white/75 bg-white/75 p-4 shadow-[0_20px_45px_-34px_rgba(15,23,42,0.95)] backdrop-blur-xl">
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
                placeholder="Search by course title..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white/90 py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
              />
            </label>

            <div className="rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm font-semibold text-slate-700">
              {filteredProgress.length} visible
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {STATUS_FILTERS.map((filter) => {
              const isActive = activeStatus === filter.key;
              return (
                <button
                  key={filter.key}
                  onClick={() => setActiveStatus(filter.key)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition ${
                    isActive
                      ? "border-cyan-500 bg-cyan-500 text-white shadow-[0_12px_24px_-18px_rgba(6,182,212,0.88)]"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}

            {(searchQuery || activeStatus !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveStatus("all");
                }}
                className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-rose-700 transition hover:bg-rose-100"
              >
                Reset
              </button>
            )}
          </div>
        </section>

        <div className="mt-6">
          {isLoading && (
            <div className="rounded-2xl border border-slate-200 bg-white/85 p-6 text-sm text-slate-600 shadow-sm">
              Loading your progress...
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
              {error}
            </div>
          )}

          {!isLoading && !error && progress.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white/85 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">No Progress Yet</h3>
              <p className="mt-2 text-sm text-slate-600">
                Enroll in a course and complete tasks to activate your advanced progress board.
              </p>
              <Link
                to="/dashboard/courses"
                className="mt-4 inline-flex rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
              >
                Explore My Courses
              </Link>
            </div>
          )}

          {!isLoading && !error && progress.length > 0 && filteredProgress.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white/85 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">No matching course</h3>
              <p className="mt-2 text-sm text-slate-600">
                Try another search or status filter.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveStatus("all");
                }}
                className="mt-4 inline-flex rounded-lg border border-cyan-500 bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600"
              >
                Reset Filters
              </button>
            </div>
          )}

          {!isLoading && !error && filteredProgress.length > 0 && (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {filteredProgress.map((item, index) => {
                const percent = toPercent(item.percent);
                const status = getProgressStatus(percent);
                const theme = CARD_THEMES[index % CARD_THEMES.length];
                const courseTitle = item.courseId?.title || "Unknown Course";
                const courseTotalTasks = Number(item.totalTasks || 0);
                const courseCompletedTasks = Number(item.completedTasks || 0);
                const remainingTasks = Math.max(courseTotalTasks - courseCompletedTasks, 0);
                const courseId = item.courseId?._id || item.courseId || "";
                const courseKey = item._id || `${courseTitle}-${index}`;

                return (
                  <div
                    key={courseKey}
                    className="group relative overflow-hidden rounded-2xl border p-4 shadow-[0_20px_48px_-34px_rgba(15,23,42,0.65)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_60px_-32px_rgba(14,116,144,0.5)] md:p-5"
                    style={{
                      borderColor: theme.border,
                      background: "linear-gradient(160deg,rgba(255,255,255,0.95)_0%,rgba(248,250,252,0.94)_100%)",
                    }}
                  >
                    <div
                      className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl transition group-hover:scale-110"
                      style={{ background: theme.glow }}
                    />

                    <div className="relative">
                      <div className="flex items-start justify-between gap-3">
                        <h3
                          className="text-xl font-bold text-slate-900"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          {courseTitle}
                        </h3>
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      <div className="mt-4">
                        <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
                          <span>Completion</span>
                          <span>{percent}%</span>
                        </div>
                        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200/80">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${percent}%`, background: theme.bar }}
                          />
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700">
                          Completed: {courseCompletedTasks}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700">
                          Remaining: {remainingTasks}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700">
                          Tasks: {courseCompletedTasks}/{courseTotalTasks}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700">
                          Next: {Math.max(100 - percent, 0)}%
                        </span>
                      </div>

                      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                          Next Milestone
                        </p>
                        <p className="mt-1 text-sm text-slate-700">{getNextMilestone(percent)}</p>
                      </div>

                      {percent === 100 ? (
                        <Link
                          to="/dashboard/certificates"
                          className="mt-4 inline-flex rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:brightness-110"
                        >
                          View Certificate
                        </Link>
                      ) : (
                        <Link
                          to={courseId ? `/dashboard/quiz/${courseId}` : "/dashboard/courses"}
                          className="mt-4 inline-flex rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:brightness-110"
                        >
                          Continue Learning
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
