import { createContext, useState, useEffect } from "react";
import api from "../utils/axios"; // Ensure this path is correct

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ 1. Add loading state

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          // ✅ 2. Call the backend to verify token and get user data
          const { data } = await api.get("/auth/me");
          setUser(data);
        } catch (error) {
          // If token is invalid (expired, etc.), clear it
          console.error("Session expired or invalid:", error);
          localStorage.removeItem("token");
          setUser(null);
        }
      }
      
      // ✅ 3. Finished checking, turn off loading
      setLoading(false);
    };

    checkUserLoggedIn();
  }, []);

  const login = async (userData) => {
    // Adjust based on your actual login API response structure
    const { data } = await api.post("/auth/login", userData);
    if (data.token) {
        localStorage.setItem("token", data.token);
        setUser(data.user);
        return data;
    }
    // If no token, throw error to trigger catch block in Login.jsx
    throw new Error("Login failed: No token received");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login"; // Optional: Force redirect
  };

  // ✅ 4. Prevent rendering children until we know if the user is logged in
  if (loading) {
    return <div className="text-center mt-20">Loading...</div>; 
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
