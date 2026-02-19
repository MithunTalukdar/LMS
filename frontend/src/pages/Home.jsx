import { useContext } from "react";
import { Link, Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Home() {
  const { user } = useContext(AuthContext);

  if (user) {
    const targetPath =
      user.role === "admin"
        ? "/dashboard/admin"
        : user.role === "teacher"
          ? "/dashboard/teacher"
          : "/dashboard/courses";

    return <Navigate to={targetPath} replace />;
  }

  const features = [
    {
      title: "Discover high-impact courses",
      detail: "Find practical tracks built by teachers and industry mentors.",
    },
    {
      title: "Complete quizzes and real tasks",
      detail: "Practice with guided assignments and instant feedback loops.",
    },
    {
      title: "Track progress with clarity",
      detail: "Know exactly where you stand with visual growth indicators.",
    },
    {
      title: "Unlock share-ready certificates",
      detail: "Celebrate completion milestones with verified achievement badges.",
    },
  ];

  const stats = [
    { value: "12K+", label: "Active Learners" },
    { value: "80+", label: "Expert Courses" },
    { value: "96%", label: "Completion Success" },
  ];

  const learningTracks = [
    { name: "Frontend Mastery", progress: 84 },
    { name: "Data Foundations", progress: 68 },
    { name: "Communication Lab", progress: 91 },
  ];

  return (
    <div
      className="home-hero relative isolate min-h-[calc(100vh-160px)] overflow-hidden"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-70 bg-[linear-gradient(125deg,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0.2)_40%,rgba(248,250,255,0.58)_100%)]" />
      <div className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-cyan-300/35 blur-3xl animate-drift-large" />
      <div className="pointer-events-none absolute right-[-6rem] top-[8%] h-80 w-80 rounded-full bg-amber-200/45 blur-3xl animate-drift-medium" />
      <div className="pointer-events-none absolute -bottom-28 left-[40%] h-72 w-72 rounded-full bg-emerald-300/30 blur-3xl animate-drift-medium-delayed" />
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_2px_2px,rgba(11,31,68,0.42)_1px,transparent_0)] [background-size:26px_26px]" />
      <div className="pointer-events-none absolute right-[5%] top-[12%] hidden h-36 w-36 rounded-full border border-white/40 lg:block animate-spin-very-slow" />

      <section className="relative mx-auto w-full max-w-7xl px-5 pb-14 pt-10 md:px-8 md:pb-20 md:pt-16">
        <div className="grid items-start gap-9 xl:grid-cols-[1.05fr,0.95fr]">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-200/80 bg-white/70 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-900 backdrop-blur">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-cyan-600 animate-pulse-soft" />
              Next-Gen Learning Platform
            </p>
            <h1
              className="mt-6 text-4xl font-bold leading-[0.96] text-slate-900 sm:text-5xl lg:text-7xl"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Turn every study session into{" "}
              <span className="block bg-gradient-to-r from-cyan-700 via-sky-700 to-blue-900 bg-clip-text text-transparent">
                measurable momentum.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-700 md:text-lg">
              One creative workspace for students and educators to learn faster,
              finish stronger, and visualize real progress without the clutter.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="relative overflow-hidden rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-700 px-7 py-3 text-base font-bold text-white shadow-[0_22px_34px_-20px_rgba(14,116,144,0.85)] transition hover:-translate-y-0.5 hover:brightness-110"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="rounded-xl border border-white/75 bg-white/80 px-7 py-3 text-base font-semibold text-slate-800 shadow-[0_16px_24px_-18px_rgba(15,23,42,0.8)] backdrop-blur transition hover:bg-white"
              >
                Login
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:max-w-2xl">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="group rounded-2xl border border-white/80 bg-white/70 p-4 shadow-[0_16px_28px_-24px_rgba(15,23,42,0.95)] backdrop-blur transition hover:-translate-y-0.5"
                >
                  <p className="text-2xl font-extrabold text-slate-900">{item.value}</p>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-7 rounded-2xl border border-cyan-100 bg-white/70 p-4 shadow-[0_20px_35px_-30px_rgba(15,23,42,0.9)] backdrop-blur sm:max-w-xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-800">
                  Personalized learning streak is rising this week.
                </p>
                <p className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-cyan-700">
                  +18% engagement
                </p>
              </div>
            </div>
          </div>

          <div className="relative animate-fade-up-delayed xl:pt-4">
            <div className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-white/35 blur-2xl" />
            <div className="relative rounded-[1.9rem] border border-white/80 bg-white/75 p-5 shadow-[0_35px_60px_-38px_rgba(2,6,23,0.85)] backdrop-blur-xl md:p-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-700">
                    Learning Cockpit
                  </p>
                  <h2
                    className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    What You Can Do
                  </h2>
                </div>
                <span className="rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">
                  Live
                </span>
              </div>

              <ul className="mt-6 space-y-3">
                {features.map((feature) => (
                  <li
                    key={feature.title}
                    className="rounded-2xl border border-cyan-50 bg-white/90 p-3.5 shadow-[0_16px_24px_-24px_rgba(14,116,144,0.9)]"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 text-white">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          className="h-3.5 w-3.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </span>
                      <div>
                        <p className="text-base font-semibold text-slate-900">
                          {feature.title}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {feature.detail}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-950/[0.03] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-[0.17em] text-slate-600">
                    Weekly Track Pulse
                  </p>
                  <p className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-bold text-sky-800">
                    87% focus
                  </p>
                </div>

                <div className="mt-4 space-y-3">
                  {learningTracks.map((track) => (
                    <div key={track.name}>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <p className="font-semibold text-slate-800">{track.name}</p>
                        <p className="font-bold text-slate-600">{track.progress}%</p>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200/80">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 animate-shimmer-track"
                          style={{ width: `${track.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute -left-6 top-10 hidden rounded-2xl border border-white/80 bg-white/70 p-3 shadow-[0_25px_35px_-30px_rgba(15,23,42,0.95)] backdrop-blur sm:block animate-float-slow">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">
                Mentor note
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                "Great pace this week."
              </p>
            </div>

            <div className="pointer-events-none absolute -right-3 bottom-8 hidden rounded-2xl border border-cyan-100 bg-white/90 px-3 py-2 shadow-[0_26px_38px_-30px_rgba(14,116,144,0.95)] sm:block animate-float-slow-delayed">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-700">
                Certificate Ready
              </p>
              <p className="mt-0.5 text-sm font-semibold text-slate-900">
                UI Design Sprint
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
