import api from "../utils/axios";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

const CARD_THEMES = [
  {
    border: "#22d3ee",
    bar: "linear-gradient(90deg,#06b6d4,#2563eb)",
    glow: "rgba(34,211,238,0.25)",
    badgeBg: "bg-cyan-100",
    badgeText: "text-cyan-900",
  },
  {
    border: "#a78bfa",
    bar: "linear-gradient(90deg,#6366f1,#8b5cf6)",
    glow: "rgba(167,139,250,0.25)",
    badgeBg: "bg-violet-100",
    badgeText: "text-violet-900",
  },
  {
    border: "#34d399",
    bar: "linear-gradient(90deg,#10b981,#059669)",
    glow: "rgba(52,211,153,0.25)",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-900",
  },
  {
    border: "#fb923c",
    bar: "linear-gradient(90deg,#f59e0b,#ea580c)",
    glow: "rgba(251,146,60,0.25)",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-900",
  },
];

const toPercent = (value) => {
  const parsed = Number(value || 0);
  if (!Number.isFinite(parsed)) return 0;
  if (parsed < 0) return 0;
  if (parsed > 100) return 100;
  return Math.round(parsed);
};

export default function Progress() {
  const { user } = useContext(AuthContext);
  const [progress, setProgress] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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

  const coursesCount = progress.length;
  const totalPercent = progress.reduce((sum, item) => sum + toPercent(item.percent), 0);
  const avgPercent = coursesCount ? Math.round(totalPercent / coursesCount) : 0;
  const completedCourses = progress.filter((item) => toPercent(item.percent) === 100).length;
  const totalTasks = progress.reduce((sum, item) => sum + Number(item.totalTasks || 0), 0);
  const completedTasks = progress.reduce((sum, item) => sum + Number(item.completedTasks || 0), 0);

  const momentumLabel =
    avgPercent >= 80 ? "Excellent momentum" : avgPercent >= 45 ? "Steady progress" : "Getting started";

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/70 p-5 md:p-7"
      style={{
        fontFamily: "'Sora', sans-serif",
        background:
          "radial-gradient(circle at 10% 8%, #bfdbfe 0%, transparent 28%), radial-gradient(circle at 88% 12%, #a7f3d0 0%, transparent 30%), linear-gradient(145deg,#f8fafc 0%,#eff6ff 55%,#ecfeff 100%)",
      }}
    >
      <div className="pointer-events-none absolute -left-16 top-10 h-44 w-44 rounded-full bg-cyan-300/35 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -right-12 bottom-8 h-44 w-44 rounded-full bg-indigo-300/30 blur-3xl animate-float-slow-delayed" />

      <div className="relative">
        <div className="rounded-2xl border border-white/80 bg-white/80 p-5 shadow-[0_20px_55px_-35px_rgba(15,23,42,0.55)] backdrop-blur-xl md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-900">
                <span className="inline-block h-2 w-2 rounded-full bg-sky-600" />
                Performance Board
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                My Progress
              </h2>
              <p className="mt-2 text-sm text-slate-600 md:text-base">
                Track course completion, finished tasks, and certificate readiness in one place.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">Current Momentum</p>
              <p className="mt-1 font-semibold text-slate-900">{momentumLabel}</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-cyan-200 bg-cyan-50/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-800">Overall Completion</p>
              <p className="mt-1 text-2xl font-bold text-cyan-900">{avgPercent}%</p>
            </div>

            <div className="rounded-xl border border-violet-200 bg-violet-50/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-800">Courses Tracking</p>
              <p className="mt-1 text-2xl font-bold text-violet-900">{coursesCount}</p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Tasks Completed</p>
              <p className="mt-1 text-2xl font-bold text-emerald-900">
                {completedTasks}/{totalTasks}
              </p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Certificates Ready</p>
              <p className="mt-1 text-2xl font-bold text-amber-900">{completedCourses}</p>
            </div>
          </div>
        </div>

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
                Enroll in a course and complete tasks to see your progress dashboard come alive.
              </p>
              <Link
                to="/dashboard/courses"
                className="mt-4 inline-flex rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
              >
                Explore My Courses
              </Link>
            </div>
          )}

          {!isLoading && !error && progress.length > 0 && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {progress.map((item, index) => {
                const percent = toPercent(item.percent);
                const theme = CARD_THEMES[index % CARD_THEMES.length];
                const courseTitle = item.courseId?.title || "Unknown Course";
                const courseTotalTasks = Number(item.totalTasks || 0);
                const courseCompletedTasks = Number(item.completedTasks || 0);
                const remainingTasks = Math.max(courseTotalTasks - courseCompletedTasks, 0);

                return (
                  <div
                    key={item._id}
                    className="group relative overflow-hidden rounded-2xl border p-4 shadow-[0_18px_46px_-32px_rgba(15,23,42,0.55)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_56px_-30px_rgba(37,99,235,0.45)] md:p-5"
                    style={{
                      borderColor: theme.border,
                      background:
                        "linear-gradient(160deg,rgba(255,255,255,0.95)_0%,rgba(248,250,252,0.94)_100%)",
                    }}
                  >
                    <div
                      className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl transition group-hover:scale-110"
                      style={{ background: theme.glow }}
                    />

                    <div className="relative">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-xl font-bold text-slate-900">{courseTitle}</h3>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${theme.badgeBg} ${theme.badgeText}`}
                        >
                          {percent}%
                        </span>
                      </div>

                      <div className="mt-4">
                        <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
                          <span>Completion</span>
                          <span>{courseCompletedTasks}/{courseTotalTasks} tasks</span>
                        </div>
                        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200/80">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${percent}%`, background: theme.bar }}
                          />
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700">
                          Completed: {courseCompletedTasks}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700">
                          Remaining: {remainingTasks}
                        </span>
                        {percent === 100 && (
                          <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-800">
                            Certificate Ready
                          </span>
                        )}
                      </div>

                      {percent < 100 ? (
                        <p className="mt-4 text-sm text-slate-600">
                          Keep going, you are <span className="font-semibold text-slate-900">{100 - percent}%</span> away from completion.
                        </p>
                      ) : (
                        <Link
                          to="/dashboard/certificates"
                          className="mt-4 inline-flex rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:brightness-110"
                        >
                          View Certificate
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
