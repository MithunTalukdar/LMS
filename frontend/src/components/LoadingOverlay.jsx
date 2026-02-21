import { useEffect } from "react";
import { createPortal } from "react-dom";

const LoadingOverlay = ({ message, onCancel, logo, status = "loading", soundUrl }) => {
  const isLoading = status === "loading";
  const isSuccess = status === "success";

  useEffect(() => {
    if (!isSuccess || !soundUrl) return undefined;

    const audio = new Audio(soundUrl);
    const timer = window.setTimeout(() => {
      audio.play().catch(() => {});
    }, 520);

    return () => {
      window.clearTimeout(timer);
      audio.pause();
    };
  }, [isSuccess, soundUrl]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] grid place-items-center overflow-hidden p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
      <div className="pointer-events-none absolute -left-16 top-12 h-60 w-60 rounded-full bg-cyan-400/30 blur-3xl animate-pulse-soft" />
      <div className="pointer-events-none absolute -right-12 bottom-10 h-60 w-60 rounded-full bg-indigo-400/30 blur-3xl animate-pulse-soft" />

      <div className="relative w-full max-w-md rounded-[1.75rem] border border-white/70 bg-white/92 p-6 shadow-[0_40px_100px_-40px_rgba(15,23,42,0.92)] backdrop-blur-xl sm:p-7">
        <div className="pointer-events-none absolute -top-16 left-1/2 h-36 w-36 -translate-x-1/2 rounded-full bg-cyan-300/30 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-[0_12px_22px_-14px_rgba(15,23,42,0.9)]">
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

          <div className="min-w-0">
            <p
              className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${
                isLoading
                  ? "border-cyan-200 bg-cyan-50 text-cyan-800"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800"
              }`}
            >
              {isLoading ? "Processing" : "Completed"}
            </p>
            <h3 className="mt-1 truncate text-xl font-bold tracking-tight text-slate-900">
              {message || (isLoading ? "Loading..." : "Success")}
            </h3>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 sm:p-5">
          <div className="flex items-center justify-center">
            {isLoading ? (
              <div className="relative h-16 w-16">
                <div className="absolute inset-0 rounded-full border-[3px] border-slate-200" />
                <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-cyan-600 border-r-indigo-600" />
                <div className="overlay-spin-reverse absolute inset-[8px] rounded-full border-[3px] border-transparent border-b-teal-500 border-l-sky-500" />
                <div className="absolute inset-[20px] rounded-full bg-white" />
              </div>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-300 bg-emerald-50 shadow-[0_12px_24px_-18px_rgba(16,185,129,0.9)]">
                <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-emerald-600">
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

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200/90">
            <div
              className={`h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 ${
                isLoading ? "overlay-track-sweep" : ""
              }`}
              style={{ width: isLoading ? "60%" : "100%" }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            <span>{isLoading ? "Securing" : "Complete"}</span>
            <span>{isLoading ? "Working" : "Ready"}</span>
          </div>
        </div>

        {onCancel && isLoading && (
          <div className="mt-5 flex justify-center">
            <button
              onClick={onCancel}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span>Go Back</span>
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes overlaySpinReverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes overlayTrackSweep {
          0% {
            transform: translateX(-38%);
          }
          50% {
            transform: translateX(38%);
          }
          100% {
            transform: translateX(-38%);
          }
        }

        .overlay-spin-reverse {
          animation: overlaySpinReverse 1.35s linear infinite;
        }

        .overlay-track-sweep {
          animation: overlayTrackSweep 1.75s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .overlay-spin-reverse,
          .overlay-track-sweep {
            animation: none !important;
          }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default LoadingOverlay;
