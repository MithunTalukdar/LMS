import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../utils/axios";

export default function GoogleCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const processed = useRef(false);

  useEffect(() => {
    const exchangeCode = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get("code");

      if (!code) {
        navigate("/login");
        return;
      }

      if (processed.current) return;
      processed.current = true;

      try {
        const response = await api.post("/auth/google/success", { code });
        const { token } = response.data;

        localStorage.setItem("token", token);
        window.location.href = "/dashboard";
      } catch (authError) {
        console.error("Login failed:", authError);
        setError("Authentication failed. Redirecting...");
        setTimeout(() => navigate("/login"), 2000);
      }
    };

    exchangeCode();
  }, [location, navigate]);

  if (error) {
    return (
      <div
        className="relative flex min-h-screen items-center justify-center overflow-hidden px-4"
        style={{
          fontFamily: "'Sora', sans-serif",
          background:
            "radial-gradient(circle at 10% 12%, rgba(251,113,133,0.2) 0%, transparent 34%), radial-gradient(circle at 86% 8%, rgba(56,189,248,0.18) 0%, transparent 38%), linear-gradient(145deg, #f8fafc 0%, #fdf2f8 52%, #eff6ff 100%)",
        }}
      >
        <div className="pointer-events-none absolute -left-14 top-10 h-52 w-52 rounded-full bg-rose-300/30 blur-3xl animate-float-slow" />
        <div className="pointer-events-none absolute -right-16 bottom-8 h-52 w-52 rounded-full bg-sky-300/30 blur-3xl animate-float-slow-delayed" />

        <div className="relative w-full max-w-md rounded-3xl border border-white/80 bg-white/88 p-7 text-center shadow-[0_30px_80px_-40px_rgba(15,23,42,0.8)] backdrop-blur-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-8 w-8 text-rose-600">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v5m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.73 3h16.9a2 2 0 001.73-3l-8.47-14.14a2 2 0 00-3.46 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Authentication Failed</h2>
          <p className="mt-2 text-sm text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4"
      style={{
        fontFamily: "'Sora', sans-serif",
        background:
          "radial-gradient(circle at 12% 10%, rgba(125,211,252,0.26) 0%, transparent 35%), radial-gradient(circle at 88% 10%, rgba(110,231,183,0.24) 0%, transparent 36%), linear-gradient(145deg,#f8fbff 0%,#eef7ff 52%,#f1fbf7 100%)",
      }}
    >
      <div className="pointer-events-none absolute -left-16 top-16 h-56 w-56 rounded-full bg-cyan-300/30 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -right-14 bottom-12 h-56 w-56 rounded-full bg-emerald-300/30 blur-3xl animate-float-slow-delayed" />

      <div className="relative w-full max-w-md rounded-3xl border border-white/80 bg-white/88 p-7 text-center shadow-[0_30px_80px_-40px_rgba(15,23,42,0.8)] backdrop-blur-xl">
        <p className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-sky-800">
          <span className="h-2 w-2 rounded-full bg-sky-600 animate-pulse-soft" />
          Secure Sign-In
        </p>

        <div className="mx-auto mt-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
          <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
            <path d="M8 4h8v16H8z" className="fill-cyan-500/80 stroke-cyan-700" strokeWidth="1" />
            <path d="M4 8h8v12H4z" className="fill-indigo-500/70 stroke-indigo-700" strokeWidth="1" />
            <path d="M12 6h8v14h-8z" className="fill-emerald-500/70 stroke-emerald-700" strokeWidth="1" />
          </svg>
        </div>

        <h2 className="mt-5 text-4xl font-bold tracking-tight text-slate-900">Logging you in</h2>
        <p className="mt-2 text-sm text-slate-600">Verifying your Google credentials and preparing your dashboard...</p>

        <div className="mx-auto mt-6 h-14 w-14 rounded-full border-[3px] border-slate-200 border-t-sky-500 border-r-cyan-500 animate-spin" />

        <div className="mt-6 flex items-center justify-center gap-2">
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className="h-3 w-3 rounded-full bg-sky-600 animate-bounce"
              style={{ animationDelay: `${index * 0.12}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
