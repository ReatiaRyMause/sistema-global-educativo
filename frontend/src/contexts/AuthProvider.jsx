import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { authService } from '../services/api';

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      const { token, ...userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error en el login' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.registro(userData);
      const { token, ...userInfo } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userInfo));
      setUser(userInfo);

      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error en el registro' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateProfile = async () => {
    try {
      const response = await authService.getPerfil();
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error actualizando perfil' 
      };
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;