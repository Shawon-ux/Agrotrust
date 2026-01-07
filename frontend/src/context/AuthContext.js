// frontend/src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("agrotrust_user");
      const token = localStorage.getItem("agrotrust_token");
      if (savedUser && token) {
        const parsed = JSON.parse(savedUser);
        setUser(parsed); // 👈 SAVE FULL USER OBJECT
      }
    } catch (e) {
      console.error("Error parsing saved user:", e);
      localStorage.removeItem("agrotrust_user");
      localStorage.removeItem("agrotrust_token");
    } finally {
      setLoading(false);
    }
  }, []);

  // 👇 SAVE FULL USER DATA (INCLUDING enrolledCourses)
  const handleAuthSuccess = (data) => {
    // Keep all relevant user fields from backend
    const u = {
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
      isVerified: data.isVerified,
      enrolledCourses: data.enrolledCourses || [], // ✅ CRITICAL!
      // Add other fields you need: languagePreference, etc.
    };
    setUser(u);
    localStorage.setItem("agrotrust_user", JSON.stringify(u));
    localStorage.setItem("agrotrust_token", data.token);
  };

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      handleAuthSuccess(res.data);
      return res.data;
    } catch (err) {
      console.error("Login error (frontend):", err);
      throw err;
    }
  };

  // After enrollment, refresh user data
  const refreshUser = async () => {
    try {
      const res = await api.get("/auth/me");
      handleAuthSuccess(res.data.user); // 👈 UPDATE USER WITH FRESH DATA
    } catch (err) {
      console.error("Refresh user error:", err);
    }
  };

  const register = async (name, email, password, role, phone) => {
    try {
      const res = await api.post("/auth/register", {
        name,
        email,
        password,
        role,
        phone,
      });
      return res.data;
    } catch (err) {
      console.error("Register error (frontend):", err);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("agrotrust_user");
    localStorage.removeItem("agrotrust_token");
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        login, 
        register, 
        logout,
        refreshUser // 👈 EXPOSE THIS TO COMPONENTS
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};