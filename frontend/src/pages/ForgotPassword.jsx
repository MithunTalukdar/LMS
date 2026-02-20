import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/axios";
import LoadingOverlay from "../components/LoadingOverlay";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [loadingStatus, setLoadingStatus] = useState("loading");
  const [soundUrl, setSoundUrl] = useState("");
  const successTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Email address is required.");
      return;
    }

    setMessage("");
    setError("");
    setIsSubmitting(true);
    setLoadingMessage("Sending password reset link...");
    setLoadingStatus("loading");
    setSoundUrl("");

    try {
      const res = await api.post("/auth/forgot-password", { email: trimmedEmail });
      setLoadingMessage("Link Sent Successfully!");
      setLoadingStatus("success");
      setSoundUrl("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3");

      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }

      successTimerRef.current = setTimeout(() => {
        setMessage(res.data?.data || "Reset link sent. Please check your inbox.");
        setIsSubmitting(false);
        successTimerRef.current = null;
      }, 1400);
    } catch (err) {
      console.error("Forgot Password Error:", err);
      setError(err.response?.data?.message || "Something went wrong");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden px-4 py-6 md:px-8 md:py-10"
      style={{
        fontFamily: "'Sora', sans-serif",
        background:
          "radial-gradient(circle at 8% 10%, rgba(56,189,248,0.25) 0%, transparent 35%), radial-gradient(circle at 92% 10%, rgba(251,191,36,0.25) 0%, transparent 33%), linear-gradient(140deg, #f8fafc 0%, #eff6ff 50%, #ecfeff 100%)",
      }}
    >
      <div className="forgot-float-slow pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="forgot-float-fast pointer-events-none absolute -right-24 bottom-8 h-72 w-72 rounded-full bg-amber-300/30 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.2)_1px,transparent_0)] [background-size:24px_24px]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center">
        <div className="grid w-full gap-6 lg:grid-cols-[1.05fr,0.95fr]">
          <section className="forgot-rise hidden rounded-[2rem] border border-white/75 bg-white/75 p-8 shadow-[0_35px_70px_-48px_rgba(15,23,42,0.95)] backdrop-blur-xl lg:block">
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-800">
              <span className="h-2 w-2 rounded-full bg-cyan-600" />
              Account Recovery
            </p>
            <h1
              className="mt-5 text-5xl font-extrabold leading-[0.95] text-slate-900"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Secure reset,
              <span className="block bg-gradient-to-r from-cyan-700 via-sky-700 to-slate-900 bg-clip-text text-transparent">
                instant access.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-slate-600">
              We send a secure reset link to your registered email address so you can recover access without waiting.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-cyan-200 bg-cyan-50/75 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-800">Secure Delivery</p>
                <p className="mt-1 text-sm text-cyan-900">Tokenized reset URL with expiration protection.</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50/75 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Fast Recovery</p>
                <p className="mt-1 text-sm text-amber-900">Complete the reset process in under a minute.</p>
              </div>
            </div>
          </section>

          <section className="forgot-rise-delay rounded-[2rem] border border-white/80 bg-white/88 p-6 shadow-[0_35px_70px_-48px_rgba(15,23,42,0.95)] backdrop-blur-xl sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Forgot Password</p>
            <h2
              className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Reset your password
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Enter your email address and we will send a secure link to create a new password.
            </p>

            {message && (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-800">
                {message}
              </div>
            )}
            {error && (
              <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Email Address</span>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9 6 9-6M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
                    </svg>
                  </span>
                  <input
                    className="w-full rounded-xl border border-slate-300 bg-white/95 py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    placeholder="you@example.com"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setEmail(email.trim())}
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-2.5 text-sm font-semibold text-white shadow-[0_14px_26px_-16px_rgba(8,145,178,0.9)] transition hover:-translate-y-0.5 hover:from-cyan-700 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Sending Link..." : "Send Reset Link"}
              </button>
            </form>

            <div className="mt-5 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500">Remember your password?</span>
              <Link to="/login" className="text-sm font-semibold text-cyan-700 transition hover:text-cyan-800">
                Back to Login
              </Link>
            </div>
          </section>
        </div>
      </div>

      {isSubmitting && (
        <LoadingOverlay
          message={loadingMessage}
          status={loadingStatus}
          soundUrl={soundUrl}
          onCancel={loadingStatus === "loading" ? () => setIsSubmitting(false) : null}
        />
      )}

      <style>{`
        @keyframes forgotFloat {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -14px, 0);
          }
        }

        @keyframes forgotRise {
          from {
            opacity: 0;
            transform: translate3d(0, 18px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        .forgot-float-slow {
          animation: forgotFloat 12s ease-in-out infinite;
        }

        .forgot-float-fast {
          animation: forgotFloat 9s ease-in-out infinite;
          animation-delay: -2s;
        }

        .forgot-rise {
          animation: forgotRise 0.55s ease both;
        }

        .forgot-rise-delay {
          animation: forgotRise 0.55s ease both;
          animation-delay: 0.12s;
        }
      `}</style>
    </div>
  );
}
