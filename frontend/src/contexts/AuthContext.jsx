import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, signup as apiSignup, getProfile } from '../services/api';

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
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await getProfile();
      setUser(res.data.user);
    } catch (err) {
      // Token invalid or expired
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthResponse = (result) => {
    if (!result?.token) {
      return { success: false, message: result?.message };
    }

    localStorage.setItem('token', result.token);
    setUser(result.user);
    return { success: true };
  };

  const login = async (credentials) => {
    try {
      const res = await apiLogin(credentials);
      return handleAuthResponse(res.data);
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
      return handleAuthResponse(res.data);
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message,
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
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
