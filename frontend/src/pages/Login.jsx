import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import LiveLink from "../components/LiveLink";
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
  const [timer, setTimer] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [loadingStatus, setLoadingStatus] = useState("loading");
  const [soundUrl, setSoundUrl] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
    setIsSubmitting(true);
    setLoadingMessage("Logging In...");
    setLoadingStatus("loading");
    setSoundUrl("");
    try {
      const res = await login({ email, password, rememberMe });
      if (res.requireOtp) {
        setLoadingMessage("OTP Sent to Email!");
        setLoadingStatus("success");
        setSoundUrl("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3");
        setTimeout(() => {
          setStep(2);
          setTimer(60);
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
    } catch (error) {
      console.error("Login failed:", error);
      alert(error.response?.data?.message || "Invalid Credentials");
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsSubmitting(true);
    setLoadingMessage("Verifying Code...");
    setLoadingStatus("loading");
    setSoundUrl("");
    try {
      await verifyOtp({ email, otp, rememberMe });
      setLoadingMessage("Verification Successful!");
      setLoadingStatus("success");
      setSoundUrl("https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch {
      alert("Invalid or expired OTP");
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setIsSubmitting(true);
    setLoadingMessage("Resending OTP...");
    setLoadingStatus("loading");
    setSoundUrl("");
    try {
      const res = await login({ email, password, rememberMe });
      if (res.requireOtp) {
        setLoadingMessage("OTP Resent!");
        setLoadingStatus("success");
        setSoundUrl("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3");
        setTimer(60);
        setTimeout(() => {
          setIsSubmitting(false);
        }, 1500);
      }
    } catch (error) {
      console.error("Resend failed:", error);
      alert("Failed to resend OTP");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login to LMS</h2>

        {step === 1 ? (
          <>
            <input
              className="w-full border p-2 mb-4 rounded"
              placeholder="Email"
              onChange={e => setEmail(e.target.value)}
            />

            <div className="relative mb-4">
              <input
                className="w-full border p-2 rounded pr-10"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember Me
              </label>
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Forgot Password?
              </Link>
            </div>

            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-2 rounded"
            >
              Login
            </button>

            <div className="my-4 flex items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-4 text-gray-500 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <a href={`${API_URL}/auth/google`} className="w-full bg-white text-gray-700 border border-gray-300 py-2 rounded flex items-center justify-center gap-2 hover:bg-gray-50 transition shadow-sm font-medium">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              <span>Sign in with Google</span>
            </a>

            <p className="text-center mt-4 text-sm">
              New user?{" "}
              <Link to="/register" className="text-blue-600">
                Register here
              </Link>
            </p>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <p className="text-gray-600">We sent a verification code to</p>
              <p className="font-medium text-gray-800">{email}</p>
            </div>
            
            <input
              className="w-full border p-2 mb-4 rounded text-center tracking-widest text-lg"
              placeholder="Enter 6-digit Code"
              maxLength={6}
              value={otp}
              onChange={e => setOtp(e.target.value)}
            />

            <button
              onClick={handleVerifyOtp}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
            >
              Verify & Login
            </button>

            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setStep(1)}
                className="text-gray-500 text-sm hover:underline"
              >
                Back to Login
              </button>
              <button
                onClick={handleResendOtp}
                disabled={timer > 0}
                className={`text-sm ${timer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:underline'}`}
              >
                {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
              </button>
            </div>
          </>
        )}
      </div>

      {isSubmitting && <LoadingOverlay message={loadingMessage} status={loadingStatus} soundUrl={soundUrl} onCancel={loadingStatus === 'loading' ? () => setIsSubmitting(false) : null} />}
    </div>
  );
}
