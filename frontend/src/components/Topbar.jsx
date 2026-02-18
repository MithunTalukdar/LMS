export default function Topbar({ name, logout }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-4 shadow-sm backdrop-blur-xl md:px-6"
      style={{
        fontFamily: "'Sora', sans-serif",
        background:
          "radial-gradient(circle at 10% 12%, rgba(186,230,253,0.42) 0%, transparent 34%), radial-gradient(circle at 88% 10%, rgba(167,243,208,0.36) 0%, transparent 34%), linear-gradient(145deg, rgba(255,255,255,0.92) 0%, rgba(248,250,252,0.9) 100%)",
      }}
    >
      <div className="pointer-events-none absolute -left-10 top-0 h-24 w-24 rounded-full bg-cyan-300/30 blur-2xl" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-24 w-24 rounded-full bg-indigo-300/25 blur-2xl" />

      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Dashboard Session</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
            Welcome, {name}
          </h2>
        </div>

        <button
          onClick={logout}
          className="inline-flex w-full items-center justify-center rounded-xl border border-red-700 bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_20px_-12px_rgba(220,38,38,0.85)] transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 sm:w-auto"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
