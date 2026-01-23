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
    setIsSubmitting(true);
    setLoadingStatus("loading");
    try {
      await api.post("/auth/register", {
        name,
        email,
        password
      });

      setLoadingStatus("success");
      setTimeout(() => {
        setShowOtp(true);
        setTimer(60);
        setIsSubmitting(false);
      }, 1500);
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setIsSubmitting(true);
    setLoadingStatus("loading");
    try {
      await api.post("/auth/resend-registration-otp", {
        email: email.toLowerCase().trim()
      });
      setLoadingStatus("success");
      setTimer(60);
      setTimeout(() => {
        setIsSubmitting(false);
      }, 1500);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to resend OTP");
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsSubmitting(true);
    setLoadingStatus("loading");
    try {
      await api.post("/auth/verify-registration", {
        email: email.toLowerCase().trim(),
        otp
      });
      setLoadingStatus("success");
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      alert(error.response?.data?.message || "Verification failed");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {showOtp ? "Verify Your Email" : "Create Account"}
        </h2>

        {!showOtp ? (
          <>
            <input
              className="w-full border p-2 mb-4 rounded"
              placeholder="Full Name"
              onChange={e => setName(e.target.value)}
            />

            <input
              className="w-full border p-2 mb-4 rounded"
              placeholder="Email"
              onChange={e => setEmail(e.target.value)}
            />

            <input
              className="w-full border p-2 mb-4 rounded"
              type="password"
              placeholder="Password"
              onChange={e => setPassword(e.target.value)}
            />

            <button
              onClick={register}
              className="w-full bg-green-600 text-white py-2 rounded"
            >
              Sign Up
            </button>
          </>
        ) : (
          <>
            <p className="text-center text-sm text-gray-600 mb-4">
              Enter the 6-digit code sent to <strong>{email}</strong>
            </p>
            <input
              className="w-full border p-2 mb-4 rounded text-center tracking-widest text-lg"
              placeholder="000000"
              maxLength={6}
              onChange={e => setOtp(e.target.value)}
            />
            <button
              onClick={handleVerifyOtp}
              className="w-full bg-blue-600 text-white py-2 rounded"
            >
              Verify & Activate
            </button>

            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setShowOtp(false)}
                className="text-gray-500 text-sm hover:underline"
              >
                Back to Register
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

        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <Link to="/" className="text-blue-600">
            Login
          </Link>
        </p>
      </div>

      {isSubmitting && (
        <LoadingOverlay 
          message={loadingStatus === 'success' ? (showOtp ? "Verified!" : "OTP Sent!") : (showOtp ? "Verifying..." : "Creating Account...")} 
          status={loadingStatus} 
          soundUrl={loadingStatus === 'success' ? "https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3" : ""}
          onCancel={loadingStatus === 'loading' ? () => setIsSubmitting(false) : null} 
        />
      )}
    </div>
  );
}
