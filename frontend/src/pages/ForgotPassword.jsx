import { useState } from "react";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsSubmitting(true);
    setLoadingMessage("Sending password reset link...");
    setLoadingStatus("loading");
    setSoundUrl("");

    try {
      const res = await api.post("/auth/forgot-password", { email: email.trim() });
      setLoadingMessage("Link Sent Successfully!");
      setLoadingStatus("success");
      setSoundUrl("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3");
      setTimeout(() => {
        setMessage(res.data.data);
        setIsSubmitting(false);
      }, 1500);
    } catch (err) {
      console.error("Forgot Password Error:", err);
      setError(err.response?.data?.message || "Something went wrong");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
        <p className="text-gray-600 text-sm mb-4 text-center">Enter your email address and we'll send you a link to reset your password.</p>

        {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{message}</div>}
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            className="w-full border p-2 mb-4 rounded"
            placeholder="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setEmail(email.trim())}
          />
          <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">Send Reset Link</button>
        </form>

        <div className="mt-4 text-center">
          <Link to="/login" className="text-sm text-blue-600 hover:underline">Back to Login</Link>
        </div>
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