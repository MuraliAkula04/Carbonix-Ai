import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiClient from '../services/api.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const token = ApiClient.getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await ApiClient.getMe();
        if (res.success && res.data?.user) {
          setUser(res.data.user);
        } else {
          ApiClient.setToken(null);
        }
      } catch (err) {
        console.warn('Session expired or invalid token:', err.message);
        ApiClient.setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await ApiClient.login(email, password);
    if (res.success && res.data?.token) {
      ApiClient.setToken(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (name, email, password, location) => {
    const res = await ApiClient.register(name, email, password, location);
    if (res.success && res.data?.token) {
      ApiClient.setToken(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    ApiClient.setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: Boolean(user) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
