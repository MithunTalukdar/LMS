import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative mt-auto overflow-hidden border-t border-slate-200/70"
      style={{
        fontFamily: "'Sora', sans-serif",
        background:
          "radial-gradient(circle at 12% 20%, rgba(186,230,253,0.45) 0%, transparent 34%), radial-gradient(circle at 88% 10%, rgba(196,181,253,0.35) 0%, transparent 34%), linear-gradient(145deg,#0f172a 0%,#111827 55%,#0b1120 100%)",
      }}
    >
      <div className="pointer-events-none absolute -left-14 top-8 h-36 w-36 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-8 bottom-4 h-32 w-32 rounded-full bg-indigo-400/20 blur-3xl" />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.2fr,1fr,1fr]">
          <div className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-200/35 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
              <span className="inline-block h-2 w-2 rounded-full bg-cyan-300" />
              Learn Build Grow
            </p>
            <h3 className="mt-3 text-3xl font-extrabold tracking-tight text-white">LMS</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              A modern learning platform to track progress, complete tasks, and earn certificates with confidence.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-200">Quick Links</h4>
            <div className="mt-3 space-y-2 text-sm">
              <Link to="/" className="block text-slate-300 transition hover:text-white">
                Home
              </Link>
              <Link to="/courses" className="block text-slate-300 transition hover:text-white">
                Courses
              </Link>
              <Link to="/dashboard/progress" className="block text-slate-300 transition hover:text-white">
                Progress
              </Link>
              <Link to="/dashboard/certificates" className="block text-slate-300 transition hover:text-white">
                Certificates
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-200">Account</h4>
            <div className="mt-3 space-y-2 text-sm">
              <Link to="/login" className="block text-slate-300 transition hover:text-white">
                Login
              </Link>
              <Link to="/register" className="block text-slate-300 transition hover:text-white">
                Register
              </Link>
              <Link to="/dashboard/profile" className="block text-slate-300 transition hover:text-white">
                Profile
              </Link>
              <Link to="/forgot-password" className="block text-slate-300 transition hover:text-white">
                Reset Password
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-4 text-xs text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>All rights reserved by <span className="font-semibold text-cyan-300">@Mithun</span> {year}</p>
          <p>Crafted for focused learning and clear progress tracking.</p>
        </div>
      </div>
    </footer>
  );
}
