import { Link } from "react-router-dom";

export default function Home() {
  const features = [
    "Browse available courses",
    "Take quizzes and submit tasks",
    "Track learning progress",
    "Access certificates after completion",
  ];

  const stats = [
    { value: "50+", label: "Courses" },
    { value: "24/7", label: "Access" },
    { value: "100%", label: "Progress View" },
  ];

  return (
    <div
      className="relative min-h-[calc(100vh-160px)] overflow-hidden bg-[radial-gradient(circle_at_15%_20%,#c5f7e7_0%,transparent_42%),radial-gradient(circle_at_88%_10%,#d7e8ff_0%,transparent_32%),linear-gradient(145deg,#f4fbf6_0%,#edf5ff_52%,#fff8ee_100%)]"
      style={{ fontFamily: "'Sora', sans-serif" }}
    >
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl animate-float-slow-delayed" />

      <section className="relative max-w-6xl mx-auto px-6 py-14 md:py-20">
        <div className="grid lg:grid-cols-[1.1fr,0.9fr] gap-10 items-center">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-teal-800 bg-teal-100/80 border border-teal-200 px-4 py-2 rounded-full">
              <span className="inline-block h-2 w-2 rounded-full bg-teal-600" />
              Learning Management System
            </p>
            <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight">
              A modern LMS for focused learning and measurable growth.
            </h1>
            <p className="mt-5 text-slate-700 text-base md:text-lg max-w-xl leading-relaxed">
              Manage courses, complete tasks, and monitor progress from one
              beautiful workspace built for students and educators.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-teal-700 hover:to-cyan-700 transition shadow-lg shadow-cyan-900/20"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="bg-white/80 backdrop-blur border border-white text-slate-700 px-6 py-3 rounded-xl font-semibold hover:bg-white transition shadow-md"
              >
                Login
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 max-w-md">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/70 bg-white/65 backdrop-blur p-3 text-center shadow-sm"
                >
                  <p className="text-lg font-bold text-slate-900">{item.value}</p>
                  <p className="text-xs text-slate-600">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="animate-fade-up-delayed">
            <div className="rounded-3xl border border-white/70 bg-white/65 backdrop-blur-xl p-7 md:p-8 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.35)]">
              <h2 className="text-2xl font-semibold text-slate-900">
                What you can do
              </h2>
              <ul className="mt-6 space-y-3 text-slate-700">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white/60 p-3"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-white">
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
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="hidden lg:block absolute right-12 top-10 h-24 w-24 rounded-2xl rotate-12 border border-cyan-200/70 bg-cyan-100/60 backdrop-blur-sm animate-float-slow" />
          <div className="hidden lg:block absolute left-[48%] bottom-10 h-20 w-20 rounded-full border border-emerald-200/70 bg-emerald-100/70 backdrop-blur-sm animate-float-slow-delayed" />
        </div>
      </section>
    </div>
  );
}
