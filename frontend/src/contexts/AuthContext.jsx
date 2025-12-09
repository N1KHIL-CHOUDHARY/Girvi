import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, signup as apiSignup, getProfile, setAuthToken } from '../services/api'; 

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        setAuthToken(storedToken); 
        try {
          const res = await getProfile(); 
          setUser(res.data.user); 
        } catch (error) {
          console.error("Profile fetch failed:", error);
          localStorage.removeItem('token');
          setAuthToken(null);
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const handleAuthResponse = (result) => {
    if (result.token) { 
      localStorage.setItem('token', result.token);
      setAuthToken(result.token); 
      setToken(result.token);
      setUser(result.user);
      return { success: true };
    } else {
      return { success: false, message: result.message };
    }
  };

  const login = async (credentials) => {
    try {
      const result = await apiLogin(credentials);
      return handleAuthResponse(result.data);
    } catch(error){
      return { success: false, message: error.response?.data?.message || error.message };
    }
  };

  const signup = async (userData) => {
    try {
      const result = await apiSignup(userData);
      return handleAuthResponse(result.data); 
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthToken(null); 
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
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