import axios from 'axios';
import { useState, useEffect } from 'react';

// 1. Helper function to apply/remove token
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('userInfo');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      // Attach saved token to Axios headers immediately on refresh!
      setAuthToken(parsedUser.token);
      return parsedUser;
    }
    return null;
  });

  const login = (userData) => {
    localStorage.setItem('userInfo', JSON.stringify(userData));
    // Set token for subsequent API calls
    setAuthToken(userData.token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
