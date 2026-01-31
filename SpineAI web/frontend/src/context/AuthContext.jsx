import React, { createContext, useState, useCallback, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);
export const ToastContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  }, []);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const accessToken = localStorage.getItem('accessToken');
        
        if (storedUser && accessToken) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
          // Verify token is still valid
          try {
            await authService.getCurrentUser();
          } catch (error) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login({ email, password });
      setUser(data.user);
      setIsAuthenticated(true);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.register(userData);
      setUser(data.user);
      setIsAuthenticated(true);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.updateProfile(userData);
      const updatedUser = response.user;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (err) {
      const message = err.response?.data?.message || 'Profile update failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get token dynamically to ensure it's always up-to-date
  const getToken = () => localStorage.getItem('accessToken');

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    token: getToken(),
    getToken
  };

  const toastValue = {
    showToast,
    toast
  };

  return (
    <AuthContext.Provider value={value}>
      <ToastContext.Provider value={toastValue}>
        {children}
      </ToastContext.Provider>
    </AuthContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within AuthProvider');
  }
  return context;
};
