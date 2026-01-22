import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, signup as apiSignup, logout as apiLogout, getProfile } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check if user is authenticated by calling /app/me
      // Cookie is automatically sent with request (withCredentials: true)
      const res = await getProfile();
      setUser(res.data.user);
    } catch (err) {
      // No valid cookie or token expired
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const res = await apiLogin(credentials);
      // Cookie is automatically set by backend, no need to store token
      if (res.data?.user) {
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Login failed' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message,
      };
    }
  };

  const signup = async (userData) => {
    try {
      const res = await apiSignup(userData);
      // Cookie is automatically set by backend, no need to store token
      if (res.data?.user) {
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Signup failed' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message,
      };
    }
  };

  const logout = async () => {
    try {
      // Call backend logout to clear cookie
      await apiLogout();
    } catch (err) {
      // Even if logout fails, clear user state
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
