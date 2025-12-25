import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdminContext = createContext(null);

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('admin_token'));
  const [loading, setLoading] = useState(true);

  // Create axios instance with auth header
  const authAxios = useCallback(() => {
    return axios.create({
      baseURL: BACKEND_URL,
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
  }, [token]);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${BACKEND_URL}/api/admin/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdmin(response.data);
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('admin_token');
        setToken(null);
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/admin/login`, {
        email,
        password,
      });

      const { access_token, admin: adminData } = response.data;
      localStorage.setItem('admin_token', access_token);
      setToken(access_token);
      setAdmin(adminData);

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Login failed';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setAdmin(null);
  };

  const isAuthenticated = !!admin && !!token;

  return (
    <AdminContext.Provider
      value={{
        admin,
        token,
        loading,
        isAuthenticated,
        login,
        logout,
        authAxios,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
