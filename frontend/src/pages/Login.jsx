import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import LoadingOverlay from "../components/LoadingOverlay";

export default function Login() {
  const { login, verifyOtp } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1: Credentials, 2: OTP
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [devOtpHint, setDevOtpHint] = useState("");
  const [timer, setTimer] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [loadingStatus, setLoadingStatus] = useState("loading");
  const [soundUrl, setSoundUrl] = useState("");

  // Normalize API_URL to prevent double /api/api issues
  const BASE_API_URL = (
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV
      ? "http://localhost:5000/api"
      : "https://lms-mpjz.onrender.com/api")
  ).replace(/\/api\/?$/, "");
  const GOOGLE_AUTH_URL =
    import.meta.env.VITE_GOOGLE_AUTH_URL || `${BASE_API_URL}/api/auth/google`;

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleLogin = async () => {
    if (isSubmitting) return;

    const normalizedEmail = email.toLowerCase().trim();

    if (!normalizedEmail || !password) {
      setError("Email and password are required.");
      return;
    }

    setIsSubmitting(true);
    setLoadingMessage("Logging In...");
    setLoadingStatus("loading");
    setSoundUrl("");
    setError("");
    setDevOtpHint("");
    try {
      const res = await login({ email: normalizedEmail, password, rememberMe });
      if (res.requireOtp) {
        setLoadingMessage("OTP Sent to Email!");
        setLoadingStatus("success");
        setSoundUrl("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3");
        if (res.devOtp) {
          setDevOtpHint(`Development OTP: ${res.devOtp}`);
          setOtp(String(res.devOtp));
        }
        if (res.cooldownSeconds) {
          setTimer(res.cooldownSeconds);
        }
        setTimeout(() => {
          setStep(2);
          if (!res.cooldownSeconds) setTimer(60);
          setIsSubmitting(false);
        }, 1500);
      } else {
        setLoadingMessage("Login Successful!");
        setLoadingStatus("success");
        setSoundUrl("https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3");
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Invalid Credentials";
      const status = err.response?.status;
      
      // Resilient check: If backend returns 403 for unverified users, transition to OTP step
      if (status === 403 && errorMessage.toLowerCase().includes("verify")) {
        setLoadingMessage("Verification Required...");
        setLoadingStatus("success");
        setTimeout(() => {
          setStep(2);
          setTimer(60);
          setIsSubmitting(false);
        }, 1500);
        return;
      }

      if (status === 429) {
        const waitMatch = errorMessage.match(/(\d+)\s*seconds?/i);
        const waitSeconds = waitMatch ? Number(waitMatch[1]) : 60;
        setStep(2);
        setTimer(waitSeconds);
        setError(`Code already sent. Enter OTP and wait ${waitSeconds}s to resend.`);
        if (err.response?.data?.devOtp) {
          setDevOtpHint(`Development OTP: ${err.response.data.devOtp}`);
          setOtp(String(err.response.data.devOtp));
        }
      } else if (status === 403 && errorMessage.toLowerCase().includes("locked")) {
        setError(errorMessage);
      } else {
        setError(errorMessage);
      }
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
    setLoadingMessage("Verifying Code...");
    setLoadingStatus("loading");
    setSoundUrl("");
    setError("");
    try {
      await verifyOtp({ email: email.toLowerCase().trim(), otp: otp.trim(), rememberMe });
      setLoadingMessage("Verification Successful!");
      setLoadingStatus("success");
      setSoundUrl("https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Invalid or expired OTP";
      
      if (err.response?.status === 403 && errorMessage.toLowerCase().includes("locked")) {
        setError(errorMessage);
      } else {
        setError(errorMessage);
      }
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0 || isSubmitting) return;
    setIsSubmitting(true);
    setLoadingMessage("Resending OTP...");
    setLoadingStatus("loading");
    setError("");
    setDevOtpHint("");
    setSoundUrl("");
    try {
      const res = await login({ email: email.toLowerCase().trim(), password, rememberMe });
      if (res.requireOtp) {
        setLoadingMessage("OTP Resent!");
        setLoadingStatus("success");
        setSoundUrl("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3");
        if (res.devOtp) {
          setDevOtpHint(`Development OTP: ${res.devOtp}`);
          setOtp(String(res.devOtp));
        }
        setTimer(res.cooldownSeconds || 60);
        setTimeout(() => {
          setIsSubmitting(false);
        }, 1500);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to resend OTP";
      
      if (err.response?.status === 403 && errorMessage.toLowerCase().includes("locked")) {
        setError(errorMessage);
      } else {
        setError(errorMessage);
      }
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Play sound
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3");
    audio.play().catch(err => console.warn(err));

    setIsSubmitting(true);
    setLoadingMessage("Redirecting to Google...");
    setLoadingStatus("loading");

    setTimeout(() => {
      window.location.href = GOOGLE_AUTH_URL;
    }, 1000);
  };

  return (
    <div
      className="relative min-h-[calc(100vh-170px)] overflow-hidden px-4 py-10 md:py-14"
      style={{
        fontFamily: "'Sora', sans-serif",
        background:
          "radial-gradient(circle at 12% 10%, #67e8f9 0%, transparent 30%), radial-gradient(circle at 92% 12%, #93c5fd 0%, transparent 32%), linear-gradient(145deg, #f8fafc 0%, #eff6ff 50%, #ecfeff 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.42), rgba(255,255,255,0.16), rgba(255,255,255,0.42))",
        }}
      />
      <div className="pointer-events-none absolute -left-20 top-16 h-72 w-72 rounded-full bg-cyan-300/40 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -right-16 bottom-14 h-72 w-72 rounded-full bg-blue-300/40 blur-3xl animate-float-slow-delayed" />

      <div className="relative mx-auto w-full max-w-md animate-fade-up">
        <div className="rounded-3xl border border-white/80 bg-white/85 p-6 shadow-[0_26px_80px_-34px_rgba(15,23,42,0.55)] backdrop-blur-xl md:p-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-900">
            <span className="inline-block h-2 w-2 rounded-full bg-cyan-600" />
            Secure Access
          </p>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
            {step === 1 ? "Welcome Back" : "Verify Identity"}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {step === 1
              ? "Sign in to continue your learning journey."
              : "Enter the verification code we sent to your email."}
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

          {step === 1 ? (
            <>
              <div className="mt-5 space-y-4">
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white/90 px-4 py-3 text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <div className="relative">
                  <input
                    className="w-full rounded-xl border border-slate-300 bg-white/90 px-4 py-3 pr-11 text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 px-3 text-slate-500 transition hover:text-slate-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <label className="flex items-center text-sm text-slate-600">
                  <input
                    type="checkbox"
                    className="mr-2 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Remember Me
                </label>
                <Link to="/forgot-password" className="text-sm font-medium text-cyan-700 hover:text-cyan-800">
                  Forgot Password?
                </Link>
              </div>

              <button
                onClick={handleLogin}
                disabled={isSubmitting}
                className="mt-5 w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-3 font-semibold text-white shadow-[0_14px_26px_-14px_rgba(14,116,144,0.85)] transition hover:-translate-y-0.5 hover:from-cyan-700 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Login
              </button>

              <div className="my-5 flex items-center">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="mx-3 text-xs font-semibold uppercase tracking-wide text-slate-400">or continue with</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <a
                href={GOOGLE_AUTH_URL}
                onClick={handleGoogleLogin}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-3 font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
                <span>Sign in with Google</span>
              </a>

              <p className="mt-5 text-center text-sm text-slate-600">
                New user?{" "}
                <Link to="/register" className="font-semibold text-cyan-700 hover:text-cyan-800">
                  Register here
                </Link>
              </p>
            </>
          ) : (
            <>
              <div className="mt-5 rounded-xl border border-cyan-100 bg-cyan-50/70 px-4 py-3 text-center">
                <p className="text-sm text-slate-600">Verification code sent to</p>
                <p className="font-semibold text-slate-900">{email}</p>
              </div>

              <input
                className="mt-4 w-full rounded-xl border border-slate-300 bg-white/90 px-4 py-3 text-center text-lg tracking-[0.35em] text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />

              <button
                onClick={handleVerifyOtp}
                disabled={isSubmitting}
                className="mt-5 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 font-semibold text-white shadow-[0_14px_26px_-14px_rgba(5,150,105,0.85)] transition hover:-translate-y-0.5 hover:from-emerald-600 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Verify & Login
              </button>

              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setStep(1);
                    setError("");
                  }}
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
                      : "text-cyan-700 hover:text-cyan-800"
                  }`}
                >
                  {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
                </button>
              </div>
            </>
          )}
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
    </div>
  );
}
