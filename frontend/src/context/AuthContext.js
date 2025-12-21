// frontend/src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { _id, name, email, role }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("agrotrust_user");
      const token = localStorage.getItem("agrotrust_token");
      if (savedUser && token) {
        const parsed = JSON.parse(savedUser);
        setUser({
          _id: parsed._id,
          name: parsed.name,
          email: parsed.email,
          role: parsed.role,
          isVerified: parsed.isVerified, // ✅ Add isVerified
        });
      }
    } catch (e) {
      console.error("Error parsing saved user:", e);
      localStorage.removeItem("agrotrust_user");
      localStorage.removeItem("agrotrust_token");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAuthSuccess = (data) => {
    const u = {
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
      isVerified: data.isVerified, // ✅ Add isVerified
    };
    setUser(u);
    localStorage.setItem("agrotrust_user", JSON.stringify(u)); // Save minimal user data + verified status
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

  // ❌ Register no longer auto-logins. It returns message & email
  const register = async (name, email, password, role, phone) => {
    try {
      const res = await api.post("/auth/register", {
        name,
        email,
        password,
        role,
        phone,
      });
      // Do NOT call handleAuthSuccess. Just return data.
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
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
