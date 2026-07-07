import { createContext, useState, useEffect } from "react";
import authService from "../services/auth.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize: verify token and load user profile if active session exists
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("cloudnest_token");
      if (token) {
        try {
          const response = await authService.getMe();
          if (response.success && response.data.user) {
            setUser(response.data.user);
          } else {
            localStorage.removeItem("cloudnest_token");
          }
        } catch {
          // Token is likely invalid or expired; Axios interceptor handles removal
          localStorage.removeItem("cloudnest_token");
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Handle user login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      if (response.success && response.data.token) {
        localStorage.setItem("cloudnest_token", response.data.token);
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, message: response.message || "Login failed" };
    } catch (error) {
      const message =
        error.response?.data?.error?.message || "Invalid credentials";
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Handle user registration
  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const response = await authService.register(name, email, password);
      if (response.success && response.data.token) {
        localStorage.setItem("cloudnest_token", response.data.token);
        setUser(response.data.user);
        return { success: true };
      }
      return {
        success: false,
        message: response.message || "Registration failed",
      };
    } catch (error) {
      const message =
        error.response?.data?.error?.message || "Registration error";
      const details = error.response?.data?.error?.details || null;
      return { success: false, message, details };
    } finally {
      setLoading(false);
    }
  };

  // Handle user logout
  const logout = () => {
    localStorage.removeItem("cloudnest_token");
    setUser(null);
    window.location.href = "/login";
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
