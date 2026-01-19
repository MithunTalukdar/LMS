import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/axios";
import LoadingOverlay from "../components/LoadingOverlay";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [loadingStatus, setLoadingStatus] = useState("loading");
  const [soundUrl, setSoundUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    setLoadingMessage("Updating Password...");
    setLoadingStatus("loading");
    setSoundUrl("");

    try {
      const res = await api.put(`/auth/reset-password/${token}`, { password });
      setLoadingMessage("Password Updated!");
      setLoadingStatus("success");
      setSoundUrl("https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3");
      
      setTimeout(() => {
        setMessage(res.data.data);
        setIsSubmitting(false);
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>

        {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{message}</div>}
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="relative mb-4">
            <input
              className="w-full border p-2 rounded pr-10"
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              required
              onChange={(e) => setPassword(e.target.value)}
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
          <div className="relative mb-4">
            <input
              className="w-full border p-2 rounded pr-10"
              type={showPassword ? "text" : "password"}
              placeholder="Confirm New Password"
              required
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">Update Password</button>
        </form>
      </div>

      {isSubmitting && (
        <LoadingOverlay
          message={loadingMessage}
          status={loadingStatus}
          soundUrl={soundUrl}
          onCancel={loadingStatus === 'loading' ? () => setIsSubmitting(false) : null}
        />
      )}
    </div>
  );
}