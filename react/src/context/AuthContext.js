import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in by looking for token in localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setCurrentUser({ token });
    }
    setLoading(false);
  }, []);

  // Login function to save token
  const login = (token) => {
    localStorage.setItem('token', token);
    setCurrentUser({ token });
  };

  // Logout function to remove token
  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    logout,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
