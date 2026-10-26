// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
// Set the default base URL for all axios requests
axios.defaults.baseURL = API_BASE;

export const AuthProvider = ({ children }) => {
  const [token, setToken]     = useState(localStorage.getItem('token'));
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync token header and load user profile
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
      axios.get('/api/auth/me')
        .then(res => setUser(res.data))
        .catch(() => {
          setUser(null);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['x-auth-token'];
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  // Common handler for signin/signup
  const handleAuth = async (path, payload) => {
    const res = await axios.post(`/api/auth/${path}`, payload);
    const newToken = res.data.token;
    setToken(newToken);
    localStorage.setItem('token', newToken);
    axios.defaults.headers.common['x-auth-token'] = newToken;

    const userRes = await axios.get('/api/auth/me');
    setUser(userRes.data);
  };

  const login  = creds => handleAuth('signin', creds);
  const signup = data  => handleAuth('signup', data);
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['x-auth-token'];
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoggedIn: !!user, loading, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
