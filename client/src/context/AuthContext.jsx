import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('projecthub_token'));
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('projecthub_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.data?.success && res.data?.user) {
            setUser(res.data.user);
          } else {
            logout();
          }
        } catch (err) {
          console.warn('[Auth] Session expired or invalid token:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authService.login({ email, password });
      if (res.data?.success) {
        const { token, user } = res.data;
        localStorage.setItem('projecthub_token', token);
        localStorage.setItem('projecthub_user', JSON.stringify(user));
        setToken(token);
        setUser(user);
        toast.success(`Welcome back, ${user.name}!`);
        return { success: true, user };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check credentials.';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const res = await authService.register(userData);
      if (res.data?.success) {
        const { token, user } = res.data;
        localStorage.setItem('projecthub_token', token);
        localStorage.setItem('projecthub_user', JSON.stringify(user));
        setToken(token);
        setUser(user);
        toast.success(`Account registered successfully! Welcome to ProjectHub.`);
        return { success: true, user };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed.';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('projecthub_token');
    localStorage.removeItem('projecthub_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('projecthub_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: Boolean(user && token),
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
