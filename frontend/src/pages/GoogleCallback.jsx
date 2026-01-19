import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
        // Exchange the temporary code for the actual token
        const response = await api.post("/auth/google/success", { code });
        const { token } = response.data;

        // Token is valid, store it and redirect
        localStorage.setItem("token", token);
        window.location.href = "/dashboard";
      } catch (err) {
        console.error("Login failed:", err);
        setError("Authentication failed. Redirecting...");
        setTimeout(() => navigate("/login"), 2000);
      }
    };

    exchangeCode();
  }, [location, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center max-w-sm w-full text-center border border-red-100">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4 text-2xl">
            ⚠️
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Authentication Failed</h2>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center max-w-sm w-full text-center border border-gray-100">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 text-3xl animate-pulse">
          📚
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Logging you in</h2>
        <p className="text-gray-500 text-sm mb-8">Verifying your Google credentials...</p>
        <div className="flex gap-2 justify-center">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}