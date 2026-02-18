import api from "../utils/axios";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import LoadingOverlay from "../components/LoadingOverlay";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState("loading");
  const [error, setError] = useState("");
  const [devOtpHint, setDevOtpHint] = useState("");

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const register = async () => {
    if (isSubmitting) return;

    const normalizedName = name.trim();
    const normalizedEmail = email.toLowerCase().trim();

    if (!normalizedName || !normalizedEmail || !password) {
      setError("All fields are required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    setLoadingStatus("loading");
    setError("");
    setDevOtpHint("");
    try {
      const { data } = await api.post("/auth/register", {
        name: normalizedName,
        email: normalizedEmail,
        password
      });
      if (data?.devOtp) {
        setDevOtpHint(`Development OTP: ${data.devOtp}`);
        setOtp(String(data.devOtp));
      }

      setLoadingStatus("success");
      setTimeout(() => {
        setShowOtp(true);
        setTimer(60);
        setIsSubmitting(false);
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0 || isSubmitting) return;
    setIsSubmitting(true);
    setLoadingStatus("loading");
    setError("");
    setDevOtpHint("");
    try {
      const { data } = await api.post("/auth/resend-registration-otp", {
        email: email.toLowerCase().trim()
      });
      if (data?.devOtp) {
        setDevOtpHint(`Development OTP: ${data.devOtp}`);
        setOtp(String(data.devOtp));
      }
      setLoadingStatus("success");
      setTimer(60);
      setTimeout(() => {
        setIsSubmitting(false);
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to resend OTP");
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (isSubmitting) return;

    if (!otp || otp.trim().length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setIsSubmitting(true);
    setLoadingStatus("loading");
    setError("");
    try {
      await api.post("/auth/verify-registration", {
        email: email.toLowerCase().trim(),
        otp: otp.trim()
      });
      setLoadingStatus("success");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || "Verification failed");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="relative min-h-[calc(100vh-170px)] overflow-hidden px-4 py-10 md:py-14"
      style={{
        fontFamily: "'Sora', sans-serif",
        background:
          "radial-gradient(circle at 10% 12%, #a7f3d0 0%, transparent 30%), radial-gradient(circle at 90% 10%, #93c5fd 0%, transparent 34%), linear-gradient(145deg, #f8fafc 0%, #ecfdf5 50%, #eff6ff 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.4), rgba(255,255,255,0.14), rgba(255,255,255,0.42))",
        }}
      />
      <div className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-emerald-300/40 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -right-16 bottom-16 h-72 w-72 rounded-full bg-blue-300/40 blur-3xl animate-float-slow-delayed" />

      <div className="relative mx-auto w-full max-w-md animate-fade-up">
        <div className="rounded-3xl border border-white/80 bg-white/85 p-6 shadow-[0_26px_80px_-34px_rgba(15,23,42,0.55)] backdrop-blur-xl md:p-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-900">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-600" />
            Join LMS
          </p>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
            {showOtp ? "Verify Account" : "Create Account"}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {showOtp
              ? "Enter the OTP to activate your account."
              : "Build your profile and start learning today."}
          </p>

          {error && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
              {error}
            </div>
          )}
          {devOtpHint && (
            <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
              {devOtpHint}
            </div>
          )}

          {!showOtp ? (
            <>
              <div className="mt-5 space-y-4">
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white/90 px-4 py-3 text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <input
                  className="w-full rounded-xl border border-slate-300 bg-white/90 px-4 py-3 text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <input
                  className="w-full rounded-xl border border-slate-300 bg-white/90 px-4 py-3 text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                onClick={register}
                disabled={isSubmitting}
                className="mt-5 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 font-semibold text-white shadow-[0_14px_26px_-14px_rgba(5,150,105,0.85)] transition hover:-translate-y-0.5 hover:from-emerald-600 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-center">
                <p className="text-sm text-slate-600">Enter the 6-digit code sent to</p>
                <p className="font-semibold text-slate-900">{email}</p>
              </div>

              <input
                className="mt-4 w-full rounded-xl border border-slate-300 bg-white/90 px-4 py-3 text-center text-lg tracking-[0.35em] text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />

              <button
                onClick={handleVerifyOtp}
                disabled={isSubmitting}
                className="mt-5 w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 py-3 font-semibold text-white shadow-[0_14px_26px_-14px_rgba(37,99,235,0.85)] transition hover:-translate-y-0.5 hover:from-blue-700 hover:to-cyan-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Verify & Activate
              </button>

              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  onClick={() => setShowOtp(false)}
                  className="rounded-lg px-2 py-1 text-sm font-medium text-slate-600 transition hover:text-slate-900"
                >
                  Back
                </button>
                <button
                  onClick={handleResendOtp}
                  disabled={timer > 0 || isSubmitting}
                  className={`rounded-lg px-2 py-1 text-sm font-medium transition ${
                    timer > 0 || isSubmitting
                      ? "cursor-not-allowed text-slate-400"
                      : "text-emerald-700 hover:text-emerald-800"
                  }`}
                >
                  {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
                </button>
              </div>
            </>
          )}

          <p className="mt-5 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">
              Login
            </Link>
          </p>
        </div>
      </div>

      {isSubmitting && (
        <LoadingOverlay
          message={
            loadingStatus === "success"
              ? showOtp
                ? "Verified!"
                : "OTP Sent!"
              : showOtp
                ? "Verifying..."
                : "Creating Account..."
          }
          status={loadingStatus}
          soundUrl={
            loadingStatus === "success"
              ? "https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3"
              : ""
          }
          onCancel={loadingStatus === "loading" ? () => setIsSubmitting(false) : null}
        />
      )}
    </div>
  );
}
