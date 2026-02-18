import { createContext, useState, useEffect } from "react";
import api from "../utils/axios";

export const AuthContext = createContext();

const getStoredToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

const clearStoredToken = () => {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
};

const persistToken = (token, rememberMe) => {
  if (rememberMe) {
    localStorage.setItem("token", token);
    sessionStorage.removeItem("token");
    return;
  }

  sessionStorage.setItem("token", token);
  localStorage.removeItem("token");
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkUserLoggedIn = async () => {
      try {
        const token = getStoredToken();

        if (!token) {
          return;
        }

        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        const { data } = await api.get("/auth/me", { timeout: 10000 });

        if (isMounted) {
          setUser(data);
        }
      } catch (error) {
        console.error("Session expired or invalid:", error);
        clearStoredToken();
        delete api.defaults.headers.common.Authorization;

        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkUserLoggedIn();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (userData) => {
    const { data } = await api.post("/auth/login", userData);

    if (data.requireOtp) {
      return data;
    }

    if (!data.token) {
      throw new Error("Login failed: No token received");
    }

    persistToken(data.token, userData.rememberMe);
    api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
    setUser(data.user);
    return data;
  };

  const verifyOtp = async (otpData) => {
    const { data } = await api.post("/auth/verify-otp", otpData);

    if (!data.token) {
      throw new Error("Verification failed");
    }

    persistToken(data.token, otpData.rememberMe);
    api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
    setUser(data.user);
    return data;
  };

  const logout = () => {
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3");
    audio.play().catch(() => {});
    clearStoredToken();
    delete api.defaults.headers.common.Authorization;
    setUser(null);

    setTimeout(() => {
      window.location.href = "/login";
    }, 800);
  };

  if (loading) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, verifyOtp, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
