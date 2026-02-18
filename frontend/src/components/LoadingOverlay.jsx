import { useEffect } from "react";

const LoadingOverlay = ({ message, onCancel, logo, status = "loading", soundUrl }) => {
  const isLoading = status === "loading";

  useEffect(() => {
    if (status !== "success" || !soundUrl) return undefined;

    const audio = new Audio(soundUrl);
    const timer = setTimeout(() => {
      audio.play().catch(() => {});
    }, 650);

    return () => clearTimeout(timer);
  }, [status, soundUrl]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.55)]">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
            {logo ? (
              <img src={logo} alt="Brand" className="h-8 w-8 object-contain" />
            ) : (
              <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
                <path d="M8 4h8v16H8z" className="fill-cyan-500/80 stroke-cyan-700" strokeWidth="1" />
                <path d="M4 8h8v12H4z" className="fill-indigo-500/70 stroke-indigo-700" strokeWidth="1" />
                <path d="M12 6h8v14h-8z" className="fill-emerald-500/70 stroke-emerald-700" strokeWidth="1" />
              </svg>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {isLoading ? "Processing" : "Completed"}
            </p>
            <h3 className="text-xl font-bold tracking-tight text-slate-900">
              {message || (isLoading ? "Loading..." : "Success")}
            </h3>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-center">
            {isLoading ? (
              <div className="relative">
                <div className="h-12 w-12 rounded-full border-4 border-slate-200" />
                <div className="absolute inset-0 h-12 w-12 animate-spin rounded-full border-4 border-transparent border-t-cyan-600 border-r-indigo-600" />
              </div>
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-emerald-300 bg-emerald-50">
                <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-emerald-600">
                  <path
                    d="M5 12.5l4.2 4.2L19 7.8"
                    stroke="currentColor"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </div>

          <p className="mt-3 text-center text-sm text-slate-600">
            {isLoading ? "Please wait while we prepare your next step." : "Done. Redirecting now."}
          </p>
        </div>

        {onCancel && isLoading && (
          <div className="mt-5 flex justify-end">
            <button
              onClick={onCancel}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingOverlay;
