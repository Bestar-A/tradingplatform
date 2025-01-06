import React, { createContext, useContext, useState, useCallback } from "react";
import { userAPI } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );
  const username = localStorage.getItem("username");
  const [error, setError] = useState(null);

  const login = useCallback(async (username, password) => {
    try {
      setError(null);
      const response = await userAPI.login({ username, password });

      if (response.ok) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("username", username);
        setIsAuthenticated(true);
        return { success: true, redirectTo: response.redirectTo };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (err) {
      setError("Login failed. Please try again.");
      return { success: false, message: "Login failed" };
    }
  }, []);

  const register = useCallback(async (username, password) => {
    try {
      setError(null);
      const response = await userAPI.register({ username, password });

      if (response.ok) {
        return { success: true, redirectTo: response.redirectTo };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (err) {
      setError("Registration failed. Please try again.");
      return { success: false, message: "Registration failed" };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setIsAuthenticated(false);
  }, []);

  const value = {
    isAuthenticated,
    error,
    login,
    register,
    logout,
    username
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
