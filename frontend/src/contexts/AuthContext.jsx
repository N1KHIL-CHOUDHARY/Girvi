import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, signup as apiSignup, logout as apiLogout, getProfile, setStoredToken, setStoredLanguage } from '../services/api';
import i18n from 'i18next';

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
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const res = await getProfile();
      const userData = res.data.user;
      setUser(userData);
      if (userData?.language) {
        setStoredLanguage(userData.language);
        i18n.changeLanguage(userData.language);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const res = await apiLogin(credentials);
      const token = res.data?.token;
      const userData = res.data?.user;
      if (token && userData) {
        setStoredToken(token);
        setUser(userData);
        if (userData.language) {
          setStoredLanguage(userData.language);
          i18n.changeLanguage(userData.language);
        }
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
      const token = res.data?.token;
      const userFromRes = res.data?.user;
      if (token && userFromRes) {
        setStoredToken(token);
        setUser(userFromRes);
        if (userFromRes.language) {
          setStoredLanguage(userFromRes.language);
          i18n.changeLanguage(userFromRes.language);
        }
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
      await apiLogout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setStoredToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    setUser,
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
